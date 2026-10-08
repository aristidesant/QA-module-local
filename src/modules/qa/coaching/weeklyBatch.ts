import type {
	CoachingBatchDecision,
	CoachingBatchItem,
	CoachingBatchReason,
	CoachingBrief,
	CoachingBriefFinding,
	CoachingBriefPrevious,
	CoachingSessionRecord,
	CoachingWeeklyBatch,
	EvaluationArea,
	LmsAssignment,
	LmsContent,
} from '~/models/qa';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { agentCallsBetween } from '~/modules/qa/calls/agentMetrics';
import {
	CALL_ISSUE_ASPECTS,
	CALL_ISSUE_BY_KEY,
	callIssues,
	type CallIssueKey,
} from '~/modules/qa/calls/issues';
import type { AgentProfile, RosterAgent } from '~/modules/qa/team/types';
import { BATCH_GENERATION_HOUR } from './constants';
import { buildAiCoachingMessage } from './helpers';
import { CLEAN_WEEK_PLAYBOOK, COACHING_PLAYBOOK } from './playbook';
import { lastCompletedSession, verdictForDelta } from './postCoaching';
import {
	buildWeeklyScorecard,
	scorecardTrend,
	tierFor,
	type ScorecardDimension,
	type WeeklyScorecard,
} from './scorecard';

export const WEEKLY_RULE_ID = 'cr-000';
const MAX_FINDINGS = 2;
const MAX_EVIDENCE = 3;
const MAX_SUGGESTED = 3;

/** Monday of the week that contains `day` ('YYYY-MM-DD'). */
export const mondayOf = (day: string): string => {
	const offset = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
	return addDays(day, -offset);
};

/** Next coaching day strictly after `from`, and the generation moment the day before at 08:00. */
export const nextBatchAt = (
	coachingDay: number,
	from: string = TODAY
): { coachingDate: string; generatedAt: string } => {
	let coachingDate = addDays(from, 1);
	while (new Date(`${coachingDate}T00:00:00Z`).getUTCDay() !== coachingDay)
		coachingDate = addDays(coachingDate, 1);
	return {
		coachingDate,
		generatedAt: `${addDays(coachingDate, -1)}T${BATCH_GENERATION_HOUR}`,
	};
};

/** Tier + trend rule: Critical / Needs improvement / declining Good → 1:1, everyone else → AI message. */
export const decideBatchItem = (
	current: WeeklyScorecard | null,
	previous: WeeklyScorecard | null
): { decision: CoachingBatchDecision; reason: CoachingBatchReason } => {
	if (!current) return { decision: 'AI_MESSAGE', reason: 'STABLE' };
	const tier = tierFor(current.score);
	if (tier === 'CRITICAL')
		return { decision: 'ONE_ON_ONE', reason: 'TIER_CRITICAL' };
	if (tier === 'NEEDS_IMPROVEMENT')
		return { decision: 'ONE_ON_ONE', reason: 'TIER_NEEDS_IMPROVEMENT' };
	if (
		tier === 'GOOD' &&
		scorecardTrend(current, previous)?.verdict === 'DECLINED'
	)
		return { decision: 'ONE_ON_ONE', reason: 'GOOD_DECLINED' };
	return { decision: 'AI_MESSAGE', reason: 'STABLE' };
};

/** The two most frequent incidents of the week, with the worst calls as evidence. */
export const buildFindings = (
	calls: TeamCallMetric[]
): CoachingBriefFinding[] => {
	const byIssue = new Map<CallIssueKey, TeamCallMetric[]>();
	for (const call of calls)
		for (const key of callIssues(call))
			byIssue.set(key, [...(byIssue.get(key) ?? []), call]);
	const aspectRank = (key: CallIssueKey) =>
		CALL_ISSUE_ASPECTS.indexOf(CALL_ISSUE_BY_KEY[key].aspect);
	return [...byIssue.entries()]
		.sort(
			(a, b) => b[1].length - a[1].length || aspectRank(a[0]) - aspectRank(b[0])
		)
		.slice(0, MAX_FINDINGS)
		.map(([issue, list]) => ({
			issue,
			aspect: CALL_ISSUE_BY_KEY[issue].aspect,
			calls: list.length,
			share: Math.round((list.length / calls.length) * 100),
			evidenceCallIds: [...list]
				.sort((x, y) => x.qaScore - y.qaScore)
				.slice(0, MAX_EVIDENCE)
				.map((c) => c.id),
		}));
};

const AREA_TO_SCORECARD: Record<EvaluationArea, ScorecardDimension | null> = {
	QUALITY_ASSURANCE: 'qa',
	COMPLIANCE: 'compliance',
	BUSINESS_INSIGHTS: 'business',
	SENTIMENT_EMOTION: null,
};

const buildPrevious = (
	agentId: string,
	sessions: CoachingSessionRecord[],
	weekFrom: string,
	current: WeeklyScorecard | null
): CoachingBriefPrevious | null => {
	const prev = lastCompletedSession(
		sessions.filter((s) => s.date.slice(0, 10) < weekFrom),
		agentId
	);
	if (!prev || !current) return null;
	const monday = mondayOf(prev.date.slice(0, 10));
	const then = buildWeeklyScorecard(
		agentCallsBetween(agentId, monday, addDays(monday, 6))
	);
	if (!then) return null;
	const dimension = prev.area ? AREA_TO_SCORECARD[prev.area] : null;
	const before = dimension ? then.dimensions[dimension] : then.score;
	const after = dimension ? current.dimensions[dimension] : current.score;
	return {
		sessionId: prev.id,
		topic: prev.topic,
		date: prev.date,
		dimension,
		before,
		after,
		verdict: verdictForDelta(after - before),
	};
};

const playbookFor = (findings: CoachingBriefFinding[]) =>
	findings.length
		? COACHING_PLAYBOOK[findings[0].issue as CallIssueKey]
		: CLEAN_WEEK_PLAYBOOK;

export interface BriefInput {
	agentId: string;
	weekFrom: string;
	weekTo: string;
	sessions: CoachingSessionRecord[];
	assignments: LmsAssignment[];
}

/** The brief plus the session fields derived from it (topic, area, evidence, talking points). */
export const buildCoachingBrief = ({
	agentId,
	weekFrom,
	weekTo,
	sessions,
	assignments,
}: BriefInput): {
	brief: CoachingBrief;
	topic: string;
	area: EvaluationArea;
	evidenceCallIds: string[];
	talkingPoints: string[];
} => {
	const calls = agentCallsBetween(agentId, weekFrom, weekTo);
	const current = buildWeeklyScorecard(calls);
	const previous = buildWeeklyScorecard(
		agentCallsBetween(agentId, addDays(weekFrom, -7), addDays(weekFrom, -1))
	);
	const { reason } = decideBatchItem(current, previous);
	const findings = buildFindings(calls);
	const playbook = playbookFor(findings);
	const secondary = findings[1]
		? COACHING_PLAYBOOK[findings[1].issue as CallIssueKey]
		: null;
	const open = new Set(
		assignments
			.filter((a) => a.agentId === agentId && a.status !== 'COMPLETED')
			.map((a) => a.contentId)
	);
	const suggestedContentIds = [
		...new Set(
			findings.flatMap(
				(f) => COACHING_PLAYBOOK[f.issue as CallIssueKey].contentIds
			)
		),
	]
		.filter((id) => !open.has(id))
		.slice(0, MAX_SUGGESTED);
	const prev = buildPrevious(agentId, sessions, weekFrom, current);
	const trend = scorecardTrend(current, previous);

	const brief: CoachingBrief = {
		weekFrom,
		weekTo,
		calls: calls.length,
		score: current?.score ?? 0,
		previousScore: previous?.score ?? null,
		tier: current ? tierFor(current.score) : 'CRITICAL',
		trend: trend?.verdict ?? null,
		reason,
		findings,
		approach: secondary
			? `${playbook.approach}\n\n${secondary.approach}`
			: playbook.approach,
		solution: playbook.solution,
		example: playbook.example,
		suggestedContentIds,
		previous: prev,
	};

	const talkingPoints = [
		...findings.map(
			(f) =>
				`Listen together to ${f.evidenceCallIds.length} calls with ${COACHING_PLAYBOOK[f.issue as CallIssueKey].topic.toLowerCase()} (${f.calls} of ${calls.length} calls last week)`
		),
		...(prev
			? [
					`Check in on "${prev.topic}": ${prev.before} → ${prev.after} since that session`,
				]
			: []),
		'Agree one behaviour to practise before next week',
	];

	return {
		brief,
		topic: playbook.topic,
		area: playbook.area,
		evidenceCallIds: [...new Set(findings.flatMap((f) => f.evidenceCallIds))],
		talkingPoints,
	};
};

export interface WeeklyBatchInput {
	id: string;
	supervisorId: string;
	supervisorName: string;
	generatedAt: string;
	coachingDate: string;
	agents: RosterAgent[];
	sessions: CoachingSessionRecord[];
	assignments: LmsAssignment[];
	profiles: Record<string, AgentProfile>;
	contentById: Record<string, LmsContent>;
}

export interface WeeklyBatchResult {
	batch: CoachingWeeklyBatch;
	/** New PROPOSED 1:1s and new AI messages. */
	created: CoachingSessionRecord[];
	/** AI messages that already existed for this run, now carrying the brief and batch id. */
	patched: CoachingSessionRecord[];
}

const blankCommitment = () => ({
	acknowledged: false,
	acknowledgedAt: null,
	comment: null,
});

/**
 * One weekly run for a supervisor: analyses the week before `generatedAt`,
 * decides 1:1 vs AI message per agent and pre-loads each session.
 */
export const buildWeeklyBatch = (
	input: WeeklyBatchInput
): WeeklyBatchResult => {
	const weekTo = addDays(input.generatedAt.slice(0, 10), -1);
	const weekFrom = addDays(weekTo, -6);

	const prepared = input.agents.map((agent) => {
		const calls = agentCallsBetween(agent.id, weekFrom, weekTo);
		const current = buildWeeklyScorecard(calls);
		const previous = buildWeeklyScorecard(
			agentCallsBetween(agent.id, addDays(weekFrom, -7), addDays(weekFrom, -1))
		);
		return { agent, current, ...decideBatchItem(current, previous) };
	});
	// The supervisor always gets at least one prepared 1:1: the weakest agent of the week.
	if (!prepared.some((p) => p.decision === 'ONE_ON_ONE')) {
		const weakest = [...prepared]
			.filter((p) => p.current)
			.sort((a, b) => a.current!.score - b.current!.score)[0];
		if (weakest) {
			weakest.decision = 'ONE_ON_ONE';
			weakest.reason = 'WEAKEST_OF_WEEK';
		}
	}

	const created: CoachingSessionRecord[] = [];
	const patched: CoachingSessionRecord[] = [];
	const items: CoachingBatchItem[] = prepared.map(
		({ agent, decision, reason }) => {
			const built = buildCoachingBrief({
				agentId: agent.id,
				weekFrom,
				weekTo,
				sessions: input.sessions,
				assignments: input.assignments,
			});
			const brief: CoachingBrief = { ...built.brief, reason };
			const item = (sessionId: string): CoachingBatchItem => ({
				agentId: agent.id,
				agentName: agent.name,
				decision,
				reason,
				sessionId,
			});

			if (decision === 'ONE_ON_ONE') {
				const session: CoachingSessionRecord = {
					id: `${input.id}-${agent.id}`,
					agentId: agent.id,
					agentName: agent.name,
					coachId: input.supervisorId,
					coachName: input.supervisorName,
					coachRole: 'SUPERVISOR',
					type: 'ONE_ON_ONE',
					modality: 'IN_PERSON',
					date: `${input.coachingDate}T10:00:00Z`,
					durationMin: 30,
					topic: built.topic,
					area: built.area,
					subItem: null,
					evidenceCallIds: built.evidenceCallIds,
					talkingPoints: built.talkingPoints,
					notes: '',
					aiMessage: null,
					actionItems: [],
					agentCommitment: blankCommitment(),
					status: 'PROPOSED',
					outcome: null,
					followUpDate: null,
					linkedAssignmentIds: [],
					ruleId: WEEKLY_RULE_ID,
					cohortId: null,
					brief,
					batchId: input.id,
				};
				created.push(session);
				return item(session.id);
			}

			const existing = input.sessions.find(
				(s) =>
					s.type === 'AI_MESSAGE' &&
					s.agentId === agent.id &&
					s.date === input.generatedAt
			);
			if (existing) {
				patched.push({ ...existing, brief, batchId: input.id });
				return item(existing.id);
			}

			const profile = input.profiles[agent.id];
			const titles = brief.suggestedContentIds
				.map((id) => input.contentById[id]?.title)
				.filter((x): x is string => Boolean(x));
			const session: CoachingSessionRecord = {
				id: `${input.id}-${agent.id}`,
				agentId: agent.id,
				agentName: agent.name,
				coachId: 'QAM-001',
				coachName: 'Elena Ruiz',
				coachRole: 'QA_MANAGER',
				type: 'AI_MESSAGE',
				modality: null,
				date: input.generatedAt,
				durationMin: 0,
				topic: 'Weekly QA review',
				area: built.area,
				subItem: null,
				evidenceCallIds: built.evidenceCallIds,
				talkingPoints: [],
				notes: '',
				aiMessage: profile
					? buildAiCoachingMessage(profile, 'Weekly QA review', titles)
					: brief.approach,
				actionItems: [],
				agentCommitment: blankCommitment(),
				status: 'COMPLETED',
				outcome: null,
				followUpDate: null,
				linkedAssignmentIds: [],
				ruleId: WEEKLY_RULE_ID,
				cohortId: null,
				brief,
				batchId: input.id,
			};
			created.push(session);
			return item(session.id);
		}
	);

	return {
		batch: {
			id: input.id,
			supervisorId: input.supervisorId,
			generatedAt: input.generatedAt,
			coachingDate: input.coachingDate,
			weekFrom,
			weekTo,
			items,
		},
		created,
		patched,
	};
};

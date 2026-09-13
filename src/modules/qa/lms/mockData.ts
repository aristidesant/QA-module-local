/**
 * Seeded LMS state: assignments and path enrollments for the whole roster.
 *
 * Derived from `TEAM_PROFILES` so the Agent Profile and the LMS agree at startup.
 * Deterministic: every random value comes from the `seeded` LCG.
 */
import type {
	LmsAcceptance,
	LmsAssignment,
	LmsAssignmentStatus,
	LmsContent,
	LmsImpact,
	LmsImpactPoint,
	LmsImpactVerdict,
	LmsPathEnrollment,
	TriggerMetricId,
} from '~/models/qa';
import { PERSONAS, TEAM_PROFILES } from '~/modules/qa/team/mockData';
import { NOW_ISO } from '~/modules/qa/team/constants';
import type { DimensionKey } from '~/modules/qa/team/types';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import { LMS_CONTENT, LMS_PATHS } from './catalog';

export { LMS_CONTENT, LMS_PATHS } from './catalog';

/** Deterministic pseudo-random in [0,1) so the mock is stable between reloads. */
export function seeded(seed: number) {
	let s = seed;
	return () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};
}

/** YYYY-MM-DD shifted by `delta` days. Used by the LMS and Coaching stores. */
export const day = (iso: string, delta: number) => {
	const d = new Date(iso);
	d.setUTCDate(d.getUTCDate() + delta);
	return d.toISOString().slice(0, 10);
};

const TODAY = NOW_ISO.slice(0, 10);

const CONTENT_BY_ID: Record<string, LmsContent> = Object.fromEntries(
	LMS_CONTENT.map((c) => [c.id, c])
);

/**
 * Weekly impact series: 4 points before completion, the completion week, 4 after.
 * `verdict` decides the slope of the "after" half.
 */
export function buildImpact(
	metricId: TriggerMetricId,
	completedAt: string,
	rand: () => number,
	verdict: LmsImpactVerdict
): LmsImpact {
	const def = METRIC_BY_ID[metricId];
	const base =
		def.unit === 'SCORE_5'
			? 3.2 + rand() * 0.6
			: def.unit === 'COUNT'
				? 2 + Math.round(rand() * 3)
				: 68 + Math.round(rand() * 12);
	const step = def.unit === 'SCORE_5' ? 0.15 : def.unit === 'COUNT' ? 0.6 : 2.2;
	const dir =
		verdict === 'IMPROVED'
			? def.higherIsBetter
				? 1
				: -1
			: verdict === 'DECLINED'
				? def.higherIsBetter
					? -1
					: 1
				: 0;
	const round = (v: number) => (def.unit === 'SCORE_5' ? Math.round(v * 10) / 10 : Math.round(v));

	const series: LmsImpactPoint[] = [];
	for (let i = -4; i <= 4; i++) {
		const noise = (rand() - 0.5) * step * 0.6;
		const value = round(
			Math.max(def.min, Math.min(def.max, base + (i > 0 ? dir * step * i : 0) + noise))
		);
		series.push({
			label: `W${i < 0 ? i : i === 0 ? '0' : `+${i}`}`,
			value,
			phase: i < 0 ? 'BEFORE' : i === 0 ? 'COMPLETION' : 'AFTER',
		});
	}

	const before = series.filter((p) => p.phase === 'BEFORE');
	const after = series.filter((p) => p.phase === 'AFTER');
	const avg = (arr: LmsImpactPoint[]) => round(arr.reduce((s, p) => s + p.value, 0) / arr.length);
	const pending = day(completedAt, 15) > TODAY;

	return {
		metricId,
		baseline: avg(before),
		checkpoint15: pending ? null : avg(after.slice(0, 2)),
		checkpoint30: day(completedAt, 30) > TODAY ? null : avg(after),
		verdict: pending ? 'PENDING' : verdict,
		series,
	};
}

const impactFor = (
	contentId: string,
	completedAt: string | null | undefined,
	rand: () => number,
	verdict: LmsImpactVerdict
): LmsImpact | null => {
	const metricId = CONTENT_BY_ID[contentId]?.impactMetricId;
	return metricId && completedAt ? buildImpact(metricId, completedAt, rand, verdict) : null;
};

const acceptance = (partial: Partial<LmsAcceptance> = {}): LmsAcceptance => ({
	status: 'NOT_REQUIRED',
	respondedAt: null,
	proposedDueDate: null,
	reason: null,
	decision: null,
	decidedBy: null,
	decidedAt: null,
	...partial,
});

// ── Curated assignments for the agent persona (AGT-004 John Smith) ────────────

const agentRand = seeded(4441);

const AGENT_ASSIGNMENTS: LmsAssignment[] = [
	{
		id: 'lms-a04-01',
		agentId: 'AGT-004',
		contentId: 'lms-c15',
		pathId: null,
		source: 'COACHING_RULE',
		ruleId: 'cr-002',
		reason:
			'Negative emotion share 34% > 30% in the last 14 days (rule: Negative emotion share above 30% → De-escalation)',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-09-11',
		dueDate: '2026-09-26',
		mandatory: true,
		acceptance: acceptance({ status: 'PENDING' }),
		status: 'NOT_STARTED',
		progress: 0,
		startedAt: null,
		completedAt: null,
		score: null,
		attempts: 0,
		impact: null,
	},
	{
		id: 'lms-a04-02',
		agentId: 'AGT-004',
		contentId: 'lms-c11',
		pathId: null,
		source: 'COACHING_RULE',
		ruleId: 'cr-001',
		reason: 'Compliance score 79% < 85% in the last 14 days',
		assignedBy: 'Elena Ruiz',
		assignedByRole: 'QA_MANAGER',
		assignedAt: '2026-09-10',
		dueDate: '2026-09-30',
		mandatory: true,
		acceptance: acceptance({ status: 'PENDING' }),
		status: 'NOT_STARTED',
		progress: 0,
		startedAt: null,
		completedAt: null,
		score: null,
		attempts: 0,
		impact: null,
	},
	{
		id: 'lms-a04-03',
		agentId: 'AGT-004',
		contentId: 'lms-c03',
		pathId: null,
		source: 'MANUAL',
		ruleId: null,
		reason: 'Assigned by Maria García after the 1:1 on objection handling',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-08-28',
		dueDate: '2026-09-20',
		mandatory: true,
		acceptance: acceptance({ status: 'ACCEPTED', respondedAt: '2026-08-28T09:40:00Z' }),
		status: 'IN_PROGRESS',
		progress: 45,
		startedAt: '2026-09-01',
		completedAt: null,
		score: null,
		attempts: 0,
		impact: null,
	},
	{
		id: 'lms-a04-04',
		agentId: 'AGT-004',
		contentId: 'lms-c08',
		pathId: null,
		source: 'MANUAL',
		ruleId: null,
		reason: 'Annual disclosure refresher for everyone on Q3 Customer Service',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-08-15',
		dueDate: '2026-09-05',
		mandatory: true,
		acceptance: acceptance({ status: 'ACCEPTED', respondedAt: '2026-08-16T08:10:00Z' }),
		status: 'OVERDUE',
		progress: 20,
		startedAt: '2026-08-20',
		completedAt: null,
		score: null,
		attempts: 0,
		impact: null,
	},
	{
		id: 'lms-a04-05',
		agentId: 'AGT-004',
		contentId: 'lms-c21',
		pathId: null,
		source: 'MANUAL',
		ruleId: null,
		reason: 'Recommended: price objections on 3 of your last 10 calls',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-09-02',
		dueDate: '2026-10-02',
		mandatory: false,
		acceptance: acceptance(),
		status: 'NOT_STARTED',
		progress: 0,
		startedAt: null,
		completedAt: null,
		score: null,
		attempts: 0,
		impact: null,
	},
	{
		id: 'lms-a04-06',
		agentId: 'AGT-004',
		contentId: 'lms-c02',
		pathId: null,
		source: 'COACHING_RULE',
		ruleId: 'cr-003',
		reason: '3 consecutive calls with a non-critical error on needs assessment',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-07-20',
		dueDate: '2026-08-03',
		mandatory: true,
		acceptance: acceptance({ status: 'ACCEPTED', respondedAt: '2026-07-20T16:05:00Z' }),
		status: 'COMPLETED',
		progress: 100,
		startedAt: '2026-07-22',
		completedAt: '2026-07-29',
		score: null,
		attempts: 0,
		impact: buildImpact('QA_OVERALL_SCORE', '2026-07-29', agentRand, 'IMPROVED'),
	},
	{
		id: 'lms-a04-07',
		agentId: 'AGT-004',
		contentId: 'lms-c16',
		pathId: null,
		source: 'MANUAL',
		ruleId: null,
		reason: 'Optional follow-up after the empathy coaching session',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-07-01',
		dueDate: '2026-07-15',
		mandatory: false,
		acceptance: acceptance(),
		status: 'COMPLETED',
		progress: 100,
		startedAt: '2026-07-08',
		completedAt: '2026-07-10',
		score: null,
		attempts: 0,
		impact: buildImpact('CUSTOMER_SENTIMENT_SCORE', '2026-07-10', agentRand, 'SAME'),
	},
	{
		id: 'lms-a04-08',
		agentId: 'AGT-004',
		contentId: 'lms-c05',
		pathId: 'path-qa',
		source: 'LEARNING_PATH',
		ruleId: null,
		reason: 'Module of the QA Essentials learning path',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-06-10',
		dueDate: '2026-07-10',
		mandatory: true,
		acceptance: acceptance(),
		status: 'COMPLETED',
		progress: 100,
		startedAt: '2026-06-28',
		completedAt: '2026-06-30',
		score: 85,
		attempts: 1,
		impact: buildImpact('QA_OVERALL_SCORE', '2026-06-30', agentRand, 'IMPROVED'),
	},
	{
		id: 'lms-a04-09',
		agentId: 'AGT-004',
		contentId: 'lms-c24',
		pathId: 'path-onboarding',
		source: 'LEARNING_PATH',
		ruleId: null,
		reason: 'Module of the New Agent Onboarding learning path',
		assignedBy: 'Elena Ruiz',
		assignedByRole: 'QA_MANAGER',
		assignedAt: '2025-03-03',
		dueDate: '2025-03-17',
		mandatory: true,
		acceptance: acceptance(),
		status: 'COMPLETED',
		progress: 100,
		startedAt: '2025-03-05',
		completedAt: '2025-03-05',
		score: null,
		attempts: 0,
		impact: null,
	},
	{
		id: 'lms-a04-10',
		agentId: 'AGT-004',
		contentId: 'lms-c01',
		pathId: 'path-qa',
		source: 'LEARNING_PATH',
		ruleId: null,
		reason: 'Module of the QA Essentials learning path',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-06-10',
		dueDate: '2026-07-10',
		mandatory: true,
		acceptance: acceptance(),
		status: 'COMPLETED',
		progress: 100,
		startedAt: '2026-06-12',
		completedAt: '2026-06-14',
		score: null,
		attempts: 0,
		impact: buildImpact('QA_OVERALL_SCORE', '2026-06-14', agentRand, 'IMPROVED'),
	},
	{
		id: 'lms-a04-11',
		agentId: 'AGT-004',
		contentId: 'lms-c04',
		pathId: 'path-qa',
		source: 'LEARNING_PATH',
		ruleId: null,
		reason: 'Module of the QA Essentials learning path',
		assignedBy: 'Maria García',
		assignedByRole: 'SUPERVISOR',
		assignedAt: '2026-06-10',
		dueDate: '2026-07-10',
		mandatory: true,
		acceptance: acceptance(),
		status: 'NOT_STARTED',
		progress: 0,
		startedAt: null,
		completedAt: null,
		score: null,
		attempts: 0,
		impact: null,
	},
];

// ── Derived assignments for the rest of the roster ────────────────────────────

const LEGACY_STATUS: Record<string, LmsAssignmentStatus> = {
	'not-started': 'NOT_STARTED',
	'in-progress': 'IN_PROGRESS',
	completed: 'COMPLETED',
	overdue: 'OVERDUE',
};

const AREA_LABEL: Record<string, string> = {
	QUALITY_ASSURANCE: 'QA',
	COMPLIANCE: 'Compliance',
	SENTIMENT_EMOTION: 'Sentiment',
	BUSINESS_INSIGHTS: 'Conversion',
	GENERAL: 'General',
};

/** Agents whose overdue row is seeded as "assigned but never answered". */
const NO_RESPONSE_AGENTS = ['AGT-006', 'AGT-017'];
/** Agents who asked their supervisor for a later deadline. */
const RESCHEDULE_AGENTS = ['AGT-010', 'AGT-012'];

const pctOf = (key: DimensionKey, value: number) =>
	key === 'sentiment' ? Math.round(((value - 1) / 4) * 100) : value;

const weakestDimension = (dimensions: { key: DimensionKey; score: number }[]): DimensionKey =>
	[...dimensions].sort((a, b) => pctOf(a.key, a.score) - pctOf(b.key, b.score))[0].key;

function buildRosterAssignments(): LmsAssignment[] {
	const out: LmsAssignment[] = [];

	for (const profile of Object.values(TEAM_PROFILES)) {
		const agentId = profile.agent.id;
		if (agentId === 'AGT-004') continue;

		const persona = PERSONAS.find((p) => p.id === agentId);
		const slope = persona?.slope ?? 0;
		const verdict: LmsImpactVerdict = slope > 0.05 ? 'IMPROVED' : slope < -0.15 ? 'DECLINED' : 'SAME';
		const rand = seeded(Number(agentId.replace(/\D/g, '')) * 4441);

		profile.lms.forEach((legacy, i) => {
			const status = LEGACY_STATUS[legacy.status] ?? 'NOT_STARTED';
			const content = CONTENT_BY_ID[legacy.materialId];
			const area = content?.area ?? 'GENERAL';
			const fromRule = i === 0;

			let mandatory = legacy.mandatory;
			let acc: LmsAcceptance;
			if (status === 'OVERDUE' && NO_RESPONSE_AGENTS.includes(agentId)) {
				mandatory = true;
				acc = acceptance({ status: 'NO_RESPONSE' });
			} else if (status === 'IN_PROGRESS' && RESCHEDULE_AGENTS.includes(agentId)) {
				mandatory = true;
				acc = acceptance({
					status: 'RESCHEDULE_REQUESTED',
					respondedAt: `${day(legacy.assignedAt, 1)}T09:15:00Z`,
					proposedDueDate: day(legacy.dueDate, 10),
					reason: 'Covering two shifts this week, need 10 more days',
				});
			} else if (mandatory) {
				acc = acceptance({ status: 'ACCEPTED', respondedAt: `${day(legacy.assignedAt, 1)}T09:00:00Z` });
			} else {
				acc = acceptance();
			}

			const isScored = content?.format === 'QUIZ' || content?.format === 'SCENARIO';

			out.push({
				id: legacy.id,
				agentId,
				contentId: legacy.materialId,
				pathId: null,
				source: fromRule ? 'COACHING_RULE' : 'MANUAL',
				ruleId: fromRule ? 'cr-001' : null,
				reason: fromRule
					? `${AREA_LABEL[area]} score below target in the last 14 days`
					: `Assigned by ${legacy.assignedBy} from the agent profile`,
				assignedBy: legacy.assignedBy,
				assignedByRole: 'SUPERVISOR',
				assignedAt: legacy.assignedAt,
				dueDate: legacy.dueDate,
				mandatory,
				acceptance: acc,
				status,
				progress: legacy.progress,
				startedAt: status === 'NOT_STARTED' ? null : legacy.assignedAt,
				completedAt: legacy.completedAt ?? null,
				score: status === 'COMPLETED' && isScored ? 82 + Math.round(rand() * 14) : null,
				attempts: status === 'COMPLETED' && content?.format === 'QUIZ' ? 1 : 0,
				impact: status === 'COMPLETED' ? impactFor(legacy.materialId, legacy.completedAt, rand, verdict) : null,
			});
		});
	}

	return out;
}

export const LMS_ASSIGNMENT_SEEDS: LmsAssignment[] = [...AGENT_ASSIGNMENTS, ...buildRosterAssignments()];

// ── Path enrollments ──────────────────────────────────────────────────────────

const ONBOARDING_IDS = LMS_PATHS.find((p) => p.id === 'path-onboarding')!.modules.map((m) => m.contentId);

function buildEnrollments(): LmsPathEnrollment[] {
	const out: LmsPathEnrollment[] = [
		{
			id: 'enr-a04-01',
			agentId: 'AGT-004',
			pathId: 'path-qa',
			source: 'MANUAL',
			enrolledBy: 'Maria García',
			enrolledAt: '2026-06-10',
			dueDate: '2026-10-10',
			completedContentIds: ['lms-c01', 'lms-c02', 'lms-c05'],
			completedAt: null,
		},
		{
			id: 'enr-a04-02',
			agentId: 'AGT-004',
			pathId: 'path-onboarding',
			source: 'MANUAL',
			enrolledBy: 'Elena Ruiz',
			enrolledAt: '2025-03-03',
			dueDate: null,
			completedContentIds: [...ONBOARDING_IDS],
			completedAt: '2025-03-20',
		},
	];

	for (const profile of Object.values(TEAM_PROFILES)) {
		const agentId = profile.agent.id;
		if (agentId === 'AGT-004') continue;

		out.push({
			id: `enr-${agentId}-onb`,
			agentId,
			pathId: 'path-onboarding',
			source: 'MANUAL',
			enrolledBy: 'Elena Ruiz',
			enrolledAt: profile.agent.trackedSince,
			dueDate: null,
			completedContentIds: [...ONBOARDING_IDS],
			completedAt: day(profile.agent.trackedSince, 17),
		});

		if (weakestDimension(profile.dimensions) === 'compliance') {
			out.push({
				id: `enr-${agentId}-cmp`,
				agentId,
				pathId: 'path-compliance',
				source: 'COACHING_RULE',
				enrolledBy: 'Elena Ruiz',
				enrolledAt: '2026-08-04',
				dueDate: '2026-10-04',
				completedContentIds: ['lms-c09', 'lms-c08'],
				completedAt: null,
			});
		}
	}

	return out;
}

export const LMS_ENROLLMENT_SEEDS: LmsPathEnrollment[] = buildEnrollments();

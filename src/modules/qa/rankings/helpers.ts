import dayjs from 'dayjs';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { aggregateMetric } from '~/modules/qa/analytics/helpers';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import { formatMetricValue } from '~/modules/qa/triggers/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { PREVIOUS_RANK_DAYS } from './constants';

const dayOf = (iso: string) => iso.slice(0, 10);

/** Draft and cancelled programs never occupy a team's slot. */
export const isProgramLive = (program: RankingProgram): boolean =>
	program.status === 'active' || program.status === 'scheduled';

/**
 * Only one live ranking per team at a time: returns the program that would
 * overlap the given teams and dates, if any.
 */
export function conflictingProgram(
	programs: RankingProgram[],
	teams: string[],
	start: string,
	end: string,
	excludeId?: string
): RankingProgram | null {
	return (
		programs.find(
			(program) =>
				program.id !== excludeId &&
				isProgramLive(program) &&
				program.teams.some((team) => teams.includes(team)) &&
				program.startDate <= end &&
				program.endDate >= start
		) ?? null
	);
}

/** Supervisors own Team 1; the QA Manager sees every program. */
export const programsForRole = (
	programs: RankingProgram[],
	role: TeamRole
): RankingProgram[] =>
	role === 'qa-manager'
		? programs
		: programs.filter((program) => program.teams.includes('Team 1'));

/** Whether a score meets the threshold, respecting the metric's direction. */
const reached = (
	score: number | null,
	threshold: number,
	higherIsBetter: boolean
): boolean =>
	score !== null && (higherIsBetter ? score >= threshold : score <= threshold);

/**
 * Ranks the agents of a program's teams on its metric over its period.
 * Agents below `minCalls` stay listed but unranked so they can see what they
 * need to qualify.
 */
export function computeStandings(
	program: RankingProgram,
	calls: TeamCallMetric[],
	asOf: string = TODAY
): RankingStanding[] {
	const higherIsBetter = METRIC_BY_ID[program.metricId]?.higherIsBetter ?? true;
	const to = asOf < program.endDate ? asOf : program.endDate;

	const scoreOf = (agentId: string, until: string) => {
		const agentCalls = calls.filter(
			(call) =>
				call.agentId === agentId &&
				dayOf(call.date) >= program.startDate &&
				dayOf(call.date) <= until
		);
		return {
			calls: agentCalls.length,
			score:
				agentCalls.length >= program.minCalls
					? aggregateMetric(agentCalls, program.metricId)
					: null,
		};
	};

	const rankList = (entries: { agentId: string; score: number | null }[]) => {
		const scored = entries
			.filter((e) => e.score !== null)
			.sort((a, b) =>
				higherIsBetter
					? (b.score as number) - (a.score as number)
					: (a.score as number) - (b.score as number)
			);
		return new Map(scored.map((e, index) => [e.agentId, index + 1]));
	};

	const agents = TEAM_AGENTS.filter((agent) =>
		program.teams.includes(agent.team)
	);
	const current = agents.map((agent) => ({
		agent,
		...scoreOf(agent.id, to),
	}));
	const ranks = rankList(
		current.map(({ agent, score }) => ({ agentId: agent.id, score }))
	);

	// Movement is only meaningful once the period has run for a week.
	const previousDay = addDays(to, -PREVIOUS_RANK_DAYS);
	const previousRanks =
		previousDay >= program.startDate
			? rankList(
					agents.map((agent) => ({
						agentId: agent.id,
						score: scoreOf(agent.id, previousDay).score,
					}))
				)
			: new Map<string, number>();

	return current
		.map(({ agent, score, calls: callCount }) => {
			const rank = ranks.get(agent.id) ?? null;
			const previousRank = previousRanks.get(agent.id) ?? null;
			return {
				rank,
				agentId: agent.id,
				agentName: agent.name,
				team: agent.team,
				score,
				calls: callCount,
				previousRank,
				delta:
					rank !== null && previousRank !== null ? previousRank - rank : null,
				milestoneIds: program.milestones
					.filter((milestone) =>
						reached(score, milestone.threshold, higherIsBetter)
					)
					.map((milestone) => milestone.id),
				reachedTarget: reached(score, program.targetScore, higherIsBetter),
			};
		})
		.sort((a, b) => {
			if (a.rank === null && b.rank === null) return b.calls - a.calls;
			if (a.rank === null) return 1;
			if (b.rank === null) return -1;
			return a.rank - b.rank;
		});
}

export const leader = (standings: RankingStanding[]): RankingStanding | null =>
	standings.find((standing) => standing.rank === 1) ?? null;

/** Adapts a standing to the shape the existing leaderboard table renders. */
/**
 * Adapts a standing to the leaderboard row shape the agent table and drawer
 * already render. `achievements` carries the *badge* ids of the milestones the
 * agent reached, so the drawer can resolve them against the Triggers badges.
 */
export const toRankingEntry = (
	standing: RankingStanding,
	program: RankingProgram
): AgentRankingEntry => {
	const badgeIds = standing.milestoneIds
		.map(
			(milestoneId) =>
				program.milestones.find((milestone) => milestone.id === milestoneId)
					?.badgeId
		)
		.filter((badgeId): badgeId is string => Boolean(badgeId));

	return {
		rank: standing.rank ?? 0,
		agentId: standing.agentId,
		agentName: standing.agentName,
		score: standing.score ?? 0,
		rankTrend: standing.delta ?? 0,
		achievements: badgeIds.length > 0 ? badgeIds : undefined,
	};
};

export const elapsedPct = (program: RankingProgram): number => {
	const total =
		dayjs(program.endDate).diff(dayjs(program.startDate), 'day') + 1;
	const done = dayjs(TODAY).diff(dayjs(program.startDate), 'day') + 1;
	return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
};

export const daysLeft = (program: RankingProgram): number =>
	Math.max(0, dayjs(program.endDate).diff(dayjs(TODAY), 'day'));

export const formatTarget = (program: RankingProgram): string =>
	formatMetricValue(program.metricId, program.targetScore);

export const formatScore = (
	program: RankingProgram,
	score: number | null
): string =>
	score === null ? '—' : formatMetricValue(program.metricId, score);

/** Distinct agents taking part in the given programs. */
export const participantCount = (programs: RankingProgram[]): number => {
	const teams = new Set(programs.flatMap((program) => program.teams));
	return TEAM_AGENTS.filter((agent) => teams.has(agent.team)).length;
};

import dayjs from 'dayjs';
import type {
	MetricBreakdown,
	RankingMetricId,
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { PREVIOUS_RANK_DAYS } from './constants';
import {
	RANKING_METRIC_BY_ID,
	aggregateRankingMetric,
	formatRankingValue,
	normalizeMetric,
} from './metrics';

const dayOf = (iso: string) => iso.slice(0, 10);
const round1 = (n: number) => Math.round(n * 10) / 10;

/** A permanent ranking has no end date. */
export const isPermanent = (program: RankingProgram): boolean =>
	program.endDate === null;

/** Several metrics are combined into a 0-100 score; one metric ranks on its own value. */
export const isComposite = (program: RankingProgram): boolean =>
	program.metrics.length > 1;

/** Combined scores always reward more points; a single metric follows its own direction. */
export const higherIsBetterOf = (program: RankingProgram): boolean =>
	isComposite(program)
		? true
		: (RANKING_METRIC_BY_ID[program.metrics[0]?.metricId]?.higherIsBetter ??
			true);

/** The metric that weighs the most, for places that need to name one. */
export const primaryMetricId = (program: RankingProgram): RankingMetricId =>
	[...program.metrics].sort((a, b) => b.weight - a.weight)[0].metricId;

const sharesTeam = (a: RankingProgram, teams: string[]) =>
	a.teams.some((team) => teams.includes(team));

/** The other programs that run for at least one of the same teams. */
export const programsSharingTeams = (
	programs: RankingProgram[],
	teams: string[],
	excludeId?: string
): RankingProgram[] =>
	programs.filter(
		(program) => program.id !== excludeId && sharesTeam(program, teams)
	);

/** The ranking currently live for a team; there is never more than one. */
export const activeProgramFor = (
	programs: RankingProgram[],
	team: string
): RankingProgram | null =>
	programs.find(
		(program) => program.status === 'active' && program.teams.includes(team)
	) ?? null;

/** The permanent ranking a team falls back to when a dated one ends. */
export const defaultProgramFor = (
	programs: RankingProgram[],
	team: string
): RankingProgram | null =>
	programs.find(
		(program) =>
			program.isDefault &&
			isPermanent(program) &&
			program.status !== 'completed' &&
			program.status !== 'draft' &&
			program.teams.includes(team)
	) ?? null;

/** Supervisors own Team 1; the QA Manager sees every program. */
export const programsForRole = (
	programs: RankingProgram[],
	role: TeamRole
): RankingProgram[] =>
	role === 'qa-manager'
		? programs
		: programs.filter((program) => program.teams.includes('Team 1'));

/** Whether a score meets the threshold, respecting the ranking's direction. */
const reached = (
	score: number | null,
	threshold: number,
	higherIsBetter: boolean
): boolean =>
	score !== null && (higherIsBetter ? score >= threshold : score <= threshold);

interface AgentScore {
	calls: number;
	score: number | null;
	breakdown: MetricBreakdown[];
}

/**
 * Ranks the agents of a program's teams over its period. A single-metric
 * ranking scores each agent on that metric; a combined one normalises every
 * metric to 0-100 against the qualified agents and adds them up by weight.
 * Agents below `minCalls` stay listed but unranked so they can see what they
 * need to qualify.
 *
 * `windowDays`, when given, ranks agents over the trailing `windowDays`-day
 * window ending at `asOf` instead of the program's own range — this is what
 * backs a period control placed on top of the leaderboard. Movement is then
 * measured against the equal-length window right before it; without
 * `windowDays`, movement is vs. `PREVIOUS_RANK_DAYS` ago, cumulative from the
 * program's start.
 */
export function computeStandings(
	program: RankingProgram,
	calls: TeamCallMetric[],
	asOf: string = TODAY,
	windowDays?: number
): RankingStanding[] {
	const higherIsBetter = higherIsBetterOf(program);
	const composite = isComposite(program);
	const to = program.endDate && asOf > program.endDate ? program.endDate : asOf;
	const from = windowDays ? addDays(to, -(windowDays - 1)) : program.startDate;

	const agents = TEAM_AGENTS.filter((agent) =>
		program.teams.includes(agent.team)
	);

	/** Scores the whole cohort at once: normalising needs every qualified agent's value. */
	const scoreCohort = (start: string, until: string) => {
		const perAgent = agents.map((agent) => {
			const agentCalls = calls.filter(
				(call) =>
					call.agentId === agent.id &&
					dayOf(call.date) >= start &&
					dayOf(call.date) <= until
			);
			const qualified = agentCalls.length >= program.minCalls;
			return {
				agentId: agent.id,
				calls: agentCalls.length,
				qualified,
				values: program.metrics.map((metric) =>
					qualified ? aggregateRankingMetric(agentCalls, metric.metricId) : null
				),
			};
		});

		const cohortOf = (index: number) =>
			perAgent
				.map((entry) => entry.values[index])
				.filter((v): v is number => v !== null);

		const scores = new Map<string, AgentScore>();
		perAgent.forEach((entry) => {
			const breakdown: MetricBreakdown[] = program.metrics.map(
				(metric, index) => {
					const value = entry.values[index];
					if (value === null) {
						return {
							metricId: metric.metricId,
							value,
							normalized: null,
							weighted: null,
						};
					}
					const normalized = normalizeMetric(
						value,
						RANKING_METRIC_BY_ID[metric.metricId],
						cohortOf(index)
					);
					return {
						metricId: metric.metricId,
						value,
						normalized: round1(normalized),
						weighted: round1((normalized * metric.weight) / 100),
					};
				}
			);

			let score: number | null = null;
			if (entry.qualified) {
				if (composite) {
					score = breakdown.every((b) => b.weighted !== null)
						? round1(breakdown.reduce((sum, b) => sum + (b.weighted ?? 0), 0))
						: null;
				} else {
					score = breakdown[0].value;
				}
			}
			scores.set(entry.agentId, { calls: entry.calls, score, breakdown });
		});
		return scores;
	};

	const rankList = (scores: Map<string, AgentScore>) => {
		const scored = [...scores.entries()]
			.filter(([, s]) => s.score !== null)
			.sort(([, a], [, b]) =>
				higherIsBetter
					? (b.score as number) - (a.score as number)
					: (a.score as number) - (b.score as number)
			);
		return new Map(scored.map(([agentId], index) => [agentId, index + 1]));
	};

	const current = scoreCohort(from, to);
	const ranks = rankList(current);

	let previousRanks: Map<string, number>;
	if (windowDays) {
		const prevTo = addDays(from, -1);
		const prevFrom = addDays(prevTo, -(windowDays - 1));
		previousRanks = rankList(scoreCohort(prevFrom, prevTo));
	} else {
		// Movement is only meaningful once the period has run for a week.
		const previousDay = addDays(to, -PREVIOUS_RANK_DAYS);
		previousRanks =
			previousDay >= program.startDate
				? rankList(scoreCohort(program.startDate, previousDay))
				: new Map<string, number>();
	}

	return agents
		.map((agent) => {
			const { calls: callCount, score, breakdown } = current.get(agent.id)!;
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
				breakdown,
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

/** Share of a dated ranking's period that has gone by; null for a permanent one. */
export const elapsedPct = (program: RankingProgram): number | null => {
	if (!program.endDate) return null;
	const total =
		dayjs(program.endDate).diff(dayjs(program.startDate), 'day') + 1;
	const done = dayjs(TODAY).diff(dayjs(program.startDate), 'day') + 1;
	return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
};

/** Days until a dated ranking ends; null for a permanent one. */
export const daysLeft = (program: RankingProgram): number | null =>
	program.endDate
		? Math.max(0, dayjs(program.endDate).diff(dayjs(TODAY), 'day'))
		: null;

const formatValue = (program: RankingProgram, value: number): string =>
	isComposite(program)
		? `${Math.round(value)} pts`
		: formatRankingValue(program.metrics[0].metricId, value);

export const formatTarget = (program: RankingProgram): string =>
	formatValue(program, program.targetScore);

export const formatScore = (
	program: RankingProgram,
	score: number | null
): string => (score === null ? '—' : formatValue(program, score));

/** Distinct agents taking part in the given programs. */
export const participantCount = (programs: RankingProgram[]): number => {
	const teams = new Set(programs.flatMap((program) => program.teams));
	return TEAM_AGENTS.filter((agent) => teams.has(agent.team)).length;
};

/**
 * Gamification helpers shared by the Team Rankings table and detail drawer:
 * rank movement (velocity vs. the previous period) and point lead (score gap
 * to the agent one position below). Reaction totals live in the real
 * `rankingsStore` instead — see `useUserReaction` and `reactionMeta.ts`.
 */

import { type AgentRankingEntry } from '~/modules/qa/dashboard/mockData';

/** Above this gap the lead is considered comfortable and is highlighted green. */
export const HEALTHY_LEAD_THRESHOLD = 5;

export interface PointLead {
	/** Points ahead of the next position. `null` when the agent is last. */
	points: number | null;
	/** Name of the agent one position below. `null` when the agent is last. */
	nextAgentName: string | null;
}

const EMPTY_LEAD: PointLead = { points: null, nextAgentName: null };

/** Index a leaderboard by rank so lookups of the next position are O(1). */
export const buildRankIndex = (
	data: AgentRankingEntry[]
): Map<number, AgentRankingEntry> =>
	new Map(data.map((entry) => [entry.rank, entry]));

/**
 * Score gap between an agent and the one immediately below them.
 * Returns an empty lead for the last position (nobody to compare against).
 */
export const getPointLead = (
	entry: AgentRankingEntry,
	rankIndex: Map<number, AgentRankingEntry>
): PointLead => {
	const next = rankIndex.get(entry.rank + 1);
	if (!next) return EMPTY_LEAD;

	return {
		points: Math.round(Math.max(0, entry.score - next.score) * 10) / 10,
		nextAgentName: next.agentName,
	};
};

/** Point lead resolved against a leaderboard (drawer convenience). */
export const getPointLeadFromRoster = (
	entry: AgentRankingEntry,
	data: AgentRankingEntry[]
): PointLead => getPointLead(entry, buildRankIndex(data));

/** Green for a comfortable lead, gray for a tight one. */
export const getPointLeadColor = (points: number | null): 'green' | 'gray' =>
	points !== null && points > HEALTHY_LEAD_THRESHOLD ? 'green' : 'gray';

/** Tooltip copy for the point lead indicator. */
export const getPointLeadTooltip = (lead: PointLead): string => {
	if (lead.points === null || !lead.nextAgentName) {
		return 'Last position — no one below to compare against';
	}
	if (lead.points === 0) {
		return `Tied with ${lead.nextAgentName}`;
	}
	return `${lead.points} point${lead.points === 1 ? '' : 's'} ahead of ${lead.nextAgentName}`;
};

/** Rank held in the previous period, derived from the current rank and trend. */
export const getPreviousRank = (entry: AgentRankingEntry): number =>
	entry.rank + (entry.rankTrend ?? 0);

/** Tooltip copy for the rank movement (velocity) indicator. */
export const getRankMovementTooltip = (entry: AgentRankingEntry): string => {
	const trend = entry.rankTrend ?? 0;
	if (trend === 0) return `No change — held #${entry.rank} since last week`;

	return `Moved ${trend > 0 ? 'up' : 'down'} from #${getPreviousRank(entry)} to #${entry.rank} since last week`;
};

/** Green when climbing, red when dropping, gray when flat. */
export const getRankMovementColor = (
	trend: number
): 'green' | 'red' | 'gray' =>
	trend > 0 ? 'green' : trend < 0 ? 'red' : 'gray';

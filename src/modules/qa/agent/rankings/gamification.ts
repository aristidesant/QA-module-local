/**
 * Gamification helpers shared by the Team Rankings table and detail drawer.
 *
 * Phase 1 indicators:
 * - 📊 Rank movement (velocity vs. the previous period)
 * - 🔥 Streak (consecutive weeks in the top of the ranking)
 * - 💪 Point lead (score gap to the agent one position below)
 * - 🤝 Social proof (total peer reactions received)
 */

import {
	REACTION_TYPES,
	type PeerRecognitionType,
} from '~/models/qa/reactions';
import {
	AGENT_RANKINGS,
	type AgentRankingEntry,
} from '~/modules/qa/dashboard/mockData';

export const REACTION_ORDER = Object.keys(
	REACTION_TYPES
) as PeerRecognitionType[];

/** Above this gap the lead is considered comfortable and is highlighted green. */
export const HEALTHY_LEAD_THRESHOLD = 5;

/** Sum of every reaction type, used for the reactions column and social proof. */
export const getReactionsTotal = (entry: AgentRankingEntry): number =>
	REACTION_ORDER.reduce(
		(total, type) => total + (entry.reactionsTotals?.[type] ?? 0),
		0
	);

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
		points: Math.max(0, entry.score - next.score),
		nextAgentName: next.agentName,
	};
};

/** Point lead resolved against the full mock roster (drawer convenience). */
export const getPointLeadFromRoster = (entry: AgentRankingEntry): PointLead =>
	getPointLead(entry, buildRankIndex(AGENT_RANKINGS));

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
export const getRankMovementColor = (trend: number): 'green' | 'red' | 'gray' =>
	trend > 0 ? 'green' : trend < 0 ? 'red' : 'gray';

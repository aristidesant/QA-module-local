import type { TriggerMetricId } from './triggerRules';

/** Operational data a ranking can use besides the four evaluation aspects. */
export type OperationalMetricId =
	| 'OPS_AHT_SECONDS'
	| 'OPS_CALLS_HANDLED'
	| 'OPS_CALLS_INBOUND'
	| 'OPS_CALLS_OUTBOUND'
	| 'OPS_POSITIVE_OUTCOME_COUNT'
	| 'OPS_POSITIVE_OUTCOME_RATE';

/** Everything a ranking can be scored on: the evaluation metrics plus operational data. */
export type RankingMetricId = TriggerMetricId | OperationalMetricId;

/** One metric of a ranking and how much of the final score it carries (weights add up to 100). */
export interface RankingMetricWeight {
	metricId: RankingMetricId;
	weight: number;
}

/**
 * Only one ranking per team is `active` at a time; `inactive` ones are kept
 * configured so the supervisor can switch back to them.
 */
export type RankingStatus = 'draft' | 'active' | 'inactive' | 'completed';

export type PrizeKind =
	| 'BONUS'
	| 'TIME_OFF'
	| 'GIFT_CARD'
	| 'RECOGNITION'
	| 'OTHER';

export interface RankingPrize {
	kind: PrizeKind;
	title: string;
	description: string;
	/** Emoji shown on the card and in the agent header. */
	icon: string;
}

/** Reaching `threshold` on the ranking score awards `badgeId`. */
export interface RankingMilestone {
	id: string;
	label: string;
	threshold: number;
	badgeId: string;
}

export interface RankingProgram {
	id: string;
	name: string;
	description: string;
	teams: string[];
	/**
	 * What is measured. One entry ranks on that metric alone; several entries
	 * are combined into a 0-100 score using the weights.
	 */
	metrics: RankingMetricWeight[];
	/** In the metric's own unit for a single metric, in points (0-100) for a combined ranking. */
	targetScore: number;
	/** Agents below this many calls are listed but unranked. */
	minCalls: number;
	startDate: string;
	/** null = permanent ranking with no expiry. */
	endDate: string | null;
	/** The permanent ranking a team falls back to when a dated one ends. */
	isDefault: boolean;
	prize: RankingPrize;
	milestones: RankingMilestone[];
	winnerBadgeId: string | null;
	/** Whether agents can give each other peer reactions on this ranking's leaderboard. */
	allowReactions: boolean;
	status: RankingStatus;
	winnerId: string | null;
	winnerName: string | null;
	createdBy: string;
	createdByRole: 'SUPERVISOR' | 'QA_MANAGER';
	createdAt: string;
	updatedAt: string;
}

/** How one metric contributed to an agent's ranking score. */
export interface MetricBreakdown {
	metricId: RankingMetricId;
	/** The agent's value in the metric's own unit. */
	value: number | null;
	/** The value on a 0-100 scale where higher is always better. */
	normalized: number | null;
	/** Points this metric adds to the final score. */
	weighted: number | null;
}

export interface RankingStanding {
	/** null when the agent has not met `minCalls`. */
	rank: number | null;
	agentId: string;
	agentName: string;
	team: string;
	score: number | null;
	calls: number;
	previousRank: number | null;
	/** previousRank − rank: positive means the agent climbed. */
	delta: number | null;
	milestoneIds: string[];
	reachedTarget: boolean;
	breakdown: MetricBreakdown[];
}

export type ProgramDraft = Omit<
	RankingProgram,
	'id' | 'winnerId' | 'winnerName' | 'createdAt' | 'updatedAt'
>;

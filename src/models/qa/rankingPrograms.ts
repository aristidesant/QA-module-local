import type { CallEvaluationTab } from '~/views/Campaigns/types';
import type { TriggerMetricId } from './triggerRules';

/** A ranking is built on one of the four evaluation aspects. */
export type RankingEvaluationType = CallEvaluationTab;

export type RankingStatus =
	| 'draft'
	| 'scheduled'
	| 'active'
	| 'completed'
	| 'cancelled';

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

/** Reaching `threshold` on the ranking metric awards `badgeId`. */
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
	evaluationType: RankingEvaluationType;
	metricId: TriggerMetricId;
	targetScore: number;
	/** Agents below this many calls are listed but unranked. */
	minCalls: number;
	startDate: string;
	endDate: string;
	prize: RankingPrize;
	milestones: RankingMilestone[];
	winnerBadgeId: string | null;
	status: RankingStatus;
	winnerId: string | null;
	winnerName: string | null;
	createdBy: string;
	createdByRole: 'SUPERVISOR' | 'QA_MANAGER';
	createdAt: string;
	updatedAt: string;
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
}

export type ProgramDraft = Omit<
	RankingProgram,
	'id' | 'winnerId' | 'winnerName' | 'createdAt' | 'updatedAt'
>;

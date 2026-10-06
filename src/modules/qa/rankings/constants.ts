import type { TablerIcon } from '@tabler/icons-react';
import {
	IconAward,
	IconBeach,
	IconCoin,
	IconGift,
	IconStar,
} from '@tabler/icons-react';
import type {
	PrizeKind,
	RankingMetricId,
	RankingStatus,
} from '~/models/qa/rankingPrograms';

/** What a brand-new ranking measures until the manager changes it. */
export const DEFAULT_METRIC: RankingMetricId = 'QA_OVERALL_SCORE';

export const PRIZE_KINDS: PrizeKind[] = [
	'BONUS',
	'TIME_OFF',
	'GIFT_CARD',
	'RECOGNITION',
	'OTHER',
];

export const PRIZE_ICON: Record<PrizeKind, TablerIcon> = {
	BONUS: IconCoin,
	TIME_OFF: IconBeach,
	GIFT_CARD: IconGift,
	RECOGNITION: IconAward,
	OTHER: IconStar,
};

export const PRIZE_EMOJI = ['🏆', '🎁', '💰', '🌴', '⭐', '🥇', '🎉', '🚀'];

export const STATUS_COLOR: Record<RankingStatus, string> = {
	draft: 'gray',
	inactive: 'gray',
	active: 'green',
	completed: 'grape',
};

export const TEAMS = ['Team 1', 'Team 2', 'Team 3'];

/** Standings are compared against this many days ago to show movement. */
export const PREVIOUS_RANK_DAYS = 7;

export const RANKING_TABS = [
	'active',
	'inactive',
	'completed',
	'drafts',
] as const;
export type RankingTab = (typeof RANKING_TABS)[number];

export const PODIUM_COLORS = ['yellow', 'gray', 'orange'];

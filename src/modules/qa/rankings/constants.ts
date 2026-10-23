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
import type { TeamRole } from '~/modules/qa/team/types';

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
	scheduled: 'gray',
	inactive: 'gray',
	active: 'green',
	completed: 'gray',
};

export const TEAMS = ['Team 1', 'Team 2', 'Team 3'];

/** Standings are compared against this many days ago to show movement. */
export const PREVIOUS_RANK_DAYS = 7;

/** Order of the cards inside a tab: what is running first, what is over last. */
export const RANKING_STATUS_ORDER: RankingStatus[] = [
	'active',
	'scheduled',
	'draft',
	'inactive',
	'completed',
];

/** Where a ranking is shown on the supervisor page. */
export type RankingTab = 'current' | 'upcoming' | 'past';
export const RANKING_TABS: RankingTab[] = ['current', 'upcoming', 'past'];

export const rankingsBasePath = (role: TeamRole) =>
	role === 'qa-manager' ? '/qa/qa-manager/rankings' : '/qa/supervisor/rankings';

/** The isolated page of one ranking (route `rankings/:programId`). */
export const rankingPath = (role: TeamRole, programId: string) =>
	`${rankingsBasePath(role)}/${programId}`;

export const rankingNewPath = (role: TeamRole) =>
	`${rankingsBasePath(role)}/new`;

export const rankingEditPath = (role: TeamRole, programId: string) =>
	`${rankingsBasePath(role)}/${programId}/edit`;

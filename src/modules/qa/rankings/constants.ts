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
	inactive: 'gray',
	active: 'green',
	completed: 'grape',
};

export const TEAMS = ['Team 1', 'Team 2', 'Team 3'];

/** Standings are compared against this many days ago to show movement. */
export const PREVIOUS_RANK_DAYS = 7;

/** Where a ranking sits in time, independent of its status. */
export type RankingPeriod = 'live' | 'upcoming' | 'ended';
export const RANKING_PERIODS: RankingPeriod[] = ['live', 'upcoming', 'ended'];

/** Order of the status filter chips and of the cards: what can change first, what is over last. */
export const RANKING_STATUS_ORDER: RankingStatus[] = [
	'active',
	'draft',
	'inactive',
	'completed',
];
/** What the list shows before any filter is touched: everything that can still change. */
export const DEFAULT_RANKING_STATUSES: RankingStatus[] = [
	'active',
	'inactive',
	'draft',
];

export const PODIUM_COLORS = ['yellow', 'gray', 'orange'];

export const rankingsBasePath = (role: TeamRole) =>
	role === 'qa-manager' ? '/qa/qa-manager/rankings' : '/qa/supervisor/rankings';

/** The isolated page of one ranking (route `rankings/:programId`). */
export const rankingPath = (role: TeamRole, programId: string) =>
	`${rankingsBasePath(role)}/${programId}`;

export const rankingNewPath = (role: TeamRole) =>
	`${rankingsBasePath(role)}/new`;

export const rankingEditPath = (role: TeamRole, programId: string) =>
	`${rankingsBasePath(role)}/${programId}/edit`;

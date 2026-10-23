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
	RankingMessages,
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

/** Trailing windows the standings can be re-ranked over; `all` is the ranking's own period. */
export type StandingsPeriod = '7' | '30' | 'all';
export const STANDINGS_PERIODS: StandingsPeriod[] = ['7', '30', 'all'];

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

/** The texts a new ranking starts with for the top 3. */
export const DEFAULT_TOP3_MESSAGES: RankingMessages = {
	joinedTop3:
		'Congratulations, {name}! You are in the top 3 of {ranking}. Keep it up.',
	leftTop3:
		'You have left the top 3 of {ranking}, but there is still time to climb back. Keep going, {name}.',
};

export const TOP3_MESSAGE_MAX = 160;

/** Fills `{name}` and `{ranking}` in one of the top 3 messages. */
export const fillTop3Message = (
	text: string,
	values: { name: string; ranking: string }
): string =>
	text
		.split('{name}')
		.join(values.name)
		.split('{ranking}')
		.join(values.ranking);

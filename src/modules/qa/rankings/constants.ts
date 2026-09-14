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
	RankingEvaluationType,
	RankingStatus,
} from '~/models/qa/rankingPrograms';
import type { TriggerMetricId } from '~/models/qa/triggerRules';
import { VIEW_METRICS, PRIMARY_METRIC } from '~/modules/qa/analytics/constants';

/** Each ranking type offers the metrics of its analytics view. */
export const RANKING_METRICS: Record<RankingEvaluationType, TriggerMetricId[]> =
	{
		qa: VIEW_METRICS.qa,
		'sentiment-emotion': VIEW_METRICS.sentiment,
		compliance: VIEW_METRICS.compliance,
		'business-insights': VIEW_METRICS.business,
	};

export const DEFAULT_METRIC: Record<RankingEvaluationType, TriggerMetricId> = {
	qa: PRIMARY_METRIC.qa,
	'sentiment-emotion': PRIMARY_METRIC.sentiment,
	compliance: PRIMARY_METRIC.compliance,
	'business-insights': PRIMARY_METRIC.business,
};

/** The evaluation area whose badges a ranking of this type can award. */
export const AREA_OF_TYPE: Record<RankingEvaluationType, string> = {
	qa: 'QUALITY_ASSURANCE',
	'sentiment-emotion': 'SENTIMENT_EMOTION',
	compliance: 'COMPLIANCE',
	'business-insights': 'BUSINESS_INSIGHTS',
};

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
	scheduled: 'blue',
	active: 'green',
	completed: 'grape',
	cancelled: 'red',
};

export const TEAMS = ['Team 1', 'Team 2', 'Team 3'];

/** Standings are compared against this many days ago to show movement. */
export const PREVIOUS_RANK_DAYS = 7;

export const RANKING_TABS = [
	'active',
	'scheduled',
	'completed',
	'drafts',
] as const;
export type RankingTab = (typeof RANKING_TABS)[number];

export const PODIUM_COLORS = ['yellow', 'gray', 'orange'];

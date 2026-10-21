import type { PerformanceScorePeriod } from '../constants';

export type TrendPeriod = '1w' | '2w' | '1m' | '3m' | '6m';
export type TrendMetricKey =
	| 'operational'
	| 'qa'
	| 'compliance'
	| 'agentSentiment'
	| 'customerSentiment';
export type TrendUnit = 'percent' | 'score5';

/** Windows the trend modal offers; labels resolve in qa.dashboard `metricTrend.period.*`. */
export const TREND_PERIODS: { value: TrendPeriod; days: number }[] = [
	{ value: '1w', days: 7 },
	{ value: '2w', days: 14 },
	{ value: '1m', days: 30 },
	{ value: '3m', days: 90 },
	{ value: '6m', days: 180 },
];

export const trendPeriodDays = (period: TrendPeriod): number =>
	TREND_PERIODS.find((p) => p.value === period)?.days ?? 7;

/** Daily points up to a month; weekly blocks beyond, so 3 and 6 months stay readable. */
export const trendBucketDays = (period: TrendPeriod): number =>
	trendPeriodDays(period) <= 31 ? 1 : 7;

/** The modal opens on the window closest to the Performance Score period in use. */
export const TREND_PERIOD_FOR_SCORE_PERIOD: Record<
	PerformanceScorePeriod,
	TrendPeriod
> = {
	today: '1w',
	week: '1w',
	month: '1m',
	quarter: '3m',
	sixMonths: '6m',
};

/** Unit of each card's headline metric: percentages share a 0-100 axis, sentiment a 1-5 one. */
export const TREND_METRIC_UNIT: Record<TrendMetricKey, TrendUnit> = {
	operational: 'percent',
	qa: 'percent',
	compliance: 'percent',
	agentSentiment: 'score5',
	customerSentiment: 'score5',
};

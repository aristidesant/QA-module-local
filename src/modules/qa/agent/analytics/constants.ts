export type AnalyticsPeriod = '1w' | '1m' | '3m' | '6m';

/** The only windows the agent can look at; day buckets up to a month, week buckets beyond. Labels: period.<value>. */
export const ANALYTICS_PERIODS: {
	value: AnalyticsPeriod;
	labelKey: string;
	days: number;
	bucket: 'day' | 'week';
}[] = [
	{ value: '1w', labelKey: 'period.1w', days: 7, bucket: 'day' },
	{ value: '1m', labelKey: 'period.1m', days: 30, bucket: 'day' },
	{ value: '3m', labelKey: 'period.3m', days: 90, bucket: 'week' },
	{ value: '6m', labelKey: 'period.6m', days: 180, bucket: 'week' },
];
export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = '1m';

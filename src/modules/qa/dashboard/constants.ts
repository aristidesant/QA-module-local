export type PerformanceScorePeriod = 'today' | 'week' | 'month' | 'quarter';

/** Period control in the Performance Score widget header (Agent, Supervisor, QA Manager — not Operation Manager). */
export const PERFORMANCE_SCORE_PERIODS: {
	value: PerformanceScorePeriod;
	labelKey: string;
	days: number;
}[] = [
	{ value: 'today', labelKey: 'performanceScore.period.today', days: 1 },
	{ value: 'week', labelKey: 'performanceScore.period.week', days: 7 },
	{ value: 'month', labelKey: 'performanceScore.period.month', days: 30 },
	{ value: 'quarter', labelKey: 'performanceScore.period.quarter', days: 90 },
];

/** Matches today's hardcoded 7-day default on all 3 dashboards. */
export const DEFAULT_PERFORMANCE_SCORE_PERIOD: PerformanceScorePeriod = 'week';

export const performanceScoreDays = (period: PerformanceScorePeriod): number =>
	PERFORMANCE_SCORE_PERIODS.find((p) => p.value === period)?.days ?? 7;

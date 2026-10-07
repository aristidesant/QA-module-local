import dayjs from 'dayjs';
import { NOW_ISO } from '~/modules/qa/team/constants';

export type OverviewPeriod = 'day' | 'week' | 'month' | 'quarter' | 'sixMonths';

export const OVERVIEW_PERIODS: { value: OverviewPeriod; label: string }[] = [
	{ value: 'day', label: '1 day' },
	{ value: 'week', label: 'Last week' },
	{ value: 'month', label: 'Monthly' },
	{ value: 'quarter', label: '3 months' },
	{ value: 'sixMonths', label: '6 months' },
];

export const OVERVIEW_EVALUATION_TYPES = [
	{ name: 'QA', base: 87 },
	{ name: 'Sentiment', base: 68 },
	{ name: 'Compliance', base: 82 },
] as const;

export type OverviewTrendPoint = { label: string } & Record<
	string,
	number | string
>;

/** One point per step: hourly for a day, daily up to a month, weekly for 3 months, monthly for 6. */
const SHAPE: Record<
	OverviewPeriod,
	{ points: number; unit: 'hour' | 'day' | 'week' | 'month'; format: string }
> = {
	day: { points: 8, unit: 'hour', format: 'HH:mm' },
	week: { points: 7, unit: 'day', format: 'ddd D' },
	month: { points: 30, unit: 'day', format: 'MMM D' },
	quarter: { points: 13, unit: 'week', format: 'MMM D' },
	sixMonths: { points: 6, unit: 'month', format: 'MMM' },
};

/** Deterministic wobble around each type's base score, so the mock chart is stable between renders. */
const wobble = (index: number, series: number) =>
	Math.sin(index * 1.7 + series * 2.3) * 3 +
	Math.cos(index * 0.9 + series) * 1.5;

export const buildOverviewTrend = (
	period: OverviewPeriod
): OverviewTrendPoint[] => {
	const { points, unit, format } = SHAPE[period];
	const end = dayjs(NOW_ISO).hour(16).minute(0);
	return Array.from({ length: points }, (_, i) => {
		const stepsBack = points - 1 - i;
		const label = end.subtract(stepsBack, unit).format(format);
		const row: OverviewTrendPoint = { label };
		OVERVIEW_EVALUATION_TYPES.forEach((type, k) => {
			row[type.name] = Math.round(
				Math.min(100, Math.max(0, type.base + wobble(i, k)))
			);
		});
		return row;
	});
};

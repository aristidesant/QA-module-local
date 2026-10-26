import type {
	AnalyticsMetricId,
	HeatmapData,
	TeamCallMetric,
} from '~/modules/qa/analytics/types';
import { periodKeyOf } from '~/modules/qa/analytics/helpers';
import { aggregateDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import type { ThresholdSettings } from '~/modules/qa/settings/types';
import { chartGranularity } from '../operationManagerMetrics';

export type KpiKey =
	| 'calls'
	| 'effective'
	| 'qa'
	| 'compliance'
	| 'sentiment'
	| 'conversion';

export const KPI_KEYS: KpiKey[] = [
	'calls',
	'effective',
	'qa',
	'compliance',
	'sentiment',
	'conversion',
];

/** The analytics metric each headline number is, so MetricTile formats and judges it. */
export const KPI_METRIC: Record<KpiKey, AnalyticsMetricId> = {
	calls: 'OPS_CALLS_HANDLED',
	effective: 'OPS_EFFECTIVE_CONTACT_RATE',
	qa: 'QA_OVERALL_SCORE',
	compliance: 'COMPLIANCE_OVERALL_SCORE',
	sentiment: 'CUSTOMER_SENTIMENT_SCORE',
	conversion: 'BI_CONVERSION_RATE',
};

export interface HeadlineKpi {
	key: KpiKey;
	metricId: AnalyticsMetricId;
	current: number;
	/** null when the previous window had no calls. */
	previous: number | null;
	/** One value per day (short windows) or per ISO week. */
	sparkline: number[];
}

type Snapshot = Record<KpiKey, number>;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** The six headline numbers of a set of calls, from the same aggregator the classic cards use. */
const snapshotOf = (
	calls: TeamCallMetric[],
	thresholds: ThresholdSettings
): Snapshot => {
	const metrics = aggregateDashboardMetrics(calls, thresholds);
	const categories = metrics.complianceCategories;
	return {
		calls: metrics.calls,
		effective: metrics.calls
			? Math.round((100 * metrics.effectiveContacts) / metrics.calls)
			: 0,
		qa: metrics.qa.total,
		compliance: categories.length
			? Math.round(
					categories.reduce((sum, category) => sum + category.score, 0) /
						categories.length
				)
			: 0,
		sentiment: round1(metrics.sentiment.customerAvg),
		conversion: metrics.sales.offered
			? Math.round((100 * metrics.sales.sold) / metrics.sales.offered)
			: 0,
	};
};

/** Headline numbers with the previous window and a sparkline each. */
export const buildHeadlineKpis = (
	current: TeamCallMetric[],
	previous: TeamCallMetric[],
	days: number,
	thresholds: ThresholdSettings
): HeadlineKpi[] => {
	const now = snapshotOf(current, thresholds);
	const before = previous.length > 0 ? snapshotOf(previous, thresholds) : null;
	const granularity = chartGranularity(days);
	const buckets = new Map<string, TeamCallMetric[]>();
	for (const call of current) {
		const key = periodKeyOf(call.date, granularity);
		buckets.set(key, [...(buckets.get(key) ?? []), call]);
	}
	const periods = [...buckets.keys()].sort();
	const snapshots = periods.map((period) =>
		snapshotOf(buckets.get(period) ?? [], thresholds)
	);
	return KPI_KEYS.map((key) => ({
		key,
		metricId: KPI_METRIC[key],
		current: now[key],
		previous: before ? before[key] : null,
		sparkline: snapshots.map((snapshot) => snapshot[key]),
	}));
};

export type OutcomeKey = 'EFFECTIVE' | 'NOT_EFFECTIVE';
export type OfferKey = 'SALE' | 'NO_SALE' | 'NO_OFFER';

export interface TeamOutcomes {
	team: string;
	calls: number;
	reached: Record<OutcomeKey, number>;
	/** Of the reached calls only. */
	offer: Record<OfferKey, number>;
}

/** Per team: reached or not, and what happened with the offer on the reached calls. */
export const teamOutcomes = (
	calls: TeamCallMetric[],
	teams: string[]
): TeamOutcomes[] =>
	teams
		.map((team) => {
			const own = calls.filter((call) => call.team === team);
			const reached = own.filter((call) => call.contactOutcome === 'EFFECTIVE');
			const sale = reached.filter(
				(call) => call.offeredProduct !== null && call.converted
			).length;
			const noSale = reached.filter(
				(call) => call.offeredProduct !== null && !call.converted
			).length;
			return {
				team,
				calls: own.length,
				reached: {
					EFFECTIVE: reached.length,
					NOT_EFFECTIVE: own.length - reached.length,
				},
				offer: {
					SALE: sale,
					NO_SALE: noSale,
					NO_OFFER: reached.length - sale - noSale,
				},
			};
		})
		.filter((row) => row.calls > 0);

export type ActivityMode = 'volume' | 'qa';

/**
 * Weekday (Monday first) by hour, as the analytics Heatmap wants it: a value per
 * cell (calls, or mean QA; null without calls) and the call count behind each cell.
 * Hours run from the first to the last hour that has calls.
 */
export const activityHeatmap = (
	calls: TeamCallMetric[],
	mode: ActivityMode,
	weekdayLabels: string[]
): HeatmapData => {
	if (calls.length === 0) return { rows: [], cols: [], cells: [], counts: [] };
	const first = Math.min(...calls.map((call) => call.hour));
	const last = Math.max(...calls.map((call) => call.hour));
	const hours = Array.from({ length: last - first + 1 }, (_, i) => first + i);
	const groups = new Map<string, TeamCallMetric[]>();
	for (const call of calls) {
		const weekday = (call.weekday + 6) % 7;
		const key = `${weekday}:${call.hour}`;
		groups.set(key, [...(groups.get(key) ?? []), call]);
	}
	const rows = weekdayLabels.map((label, i) => ({ key: String(i), label }));
	const cells = rows.map((_, weekday) =>
		hours.map((hour) => {
			const group = groups.get(`${weekday}:${hour}`);
			if (!group) return null;
			return mode === 'volume'
				? group.length
				: round1(
						group.reduce((sum, call) => sum + call.qaScore, 0) / group.length
					);
		})
	);
	const counts = rows.map((_, weekday) =>
		hours.map((hour) => groups.get(`${weekday}:${hour}`)?.length ?? 0)
	);
	return {
		rows,
		cols: hours.map((hour) => `${String(hour).padStart(2, '0')}:00`),
		cells,
		counts,
	};
};

import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import {
	agentCallsBetween,
	metricTrend,
	type DashboardMetricTrend,
} from '~/modules/qa/calls/agentMetrics';
import type { ThresholdSettings } from '~/modules/qa/settings/types';
import {
	TREND_METRIC_UNIT,
	trendBucketDays,
	trendPeriodDays,
	type TrendMetricKey,
	type TrendPeriod,
	type TrendUnit,
} from './constants';

export interface TrendPoint {
	/** First day of the bucket, 'YYYY-MM-DD' — formatted on the axis by formatPeriod. */
	period: string;
	current: number | null;
	previous: number | null;
}

export interface MetricTrendResult {
	unit: TrendUnit;
	points: TrendPoint[];
	/** Headline value over the whole selected window, null when it has no calls. */
	current: number | null;
	/** Same for the equal-length window before it. */
	previous: number | null;
	/** Signed delta on the shared 0-100 scale, as the cards express it; null without both windows. */
	delta: DashboardMetricTrend | null;
}

const COMPLIANCE_AREAS = ['security', 'regulatory', 'legal'] as const;

const round1 = (v: number) => Math.round(v * 10) / 10;
const mean = (values: number[]) =>
	values.reduce((s, v) => s + v, 0) / values.length;

/** The card's headline number for one set of calls; null when there are none. */
export const metricValue = (
	metric: TrendMetricKey,
	calls: TeamCallMetric[],
	thresholds: ThresholdSettings
): number | null => {
	if (calls.length === 0) return null;
	switch (metric) {
		case 'operational':
			return Math.round(
				(calls.filter((c) => c.contactOutcome === 'EFFECTIVE').length /
					calls.length) *
					100
			);
		case 'qa':
			return Math.round(mean(calls.map((c) => c.qaScore)));
		case 'compliance':
			return Math.round(
				mean(
					COMPLIANCE_AREAS.map(
						(area) =>
							(calls.filter(
								(c) =>
									c.complianceByArea[area].score >=
									thresholds.compliance.areaTargetPerCall
							).length /
								calls.length) *
							100
					)
				)
			);
		case 'agentSentiment':
			return round1(mean(calls.map((c) => c.agentSentiment)));
		case 'customerSentiment':
			return round1(mean(calls.map((c) => c.customerSentiment)));
	}
};

/** Sentiment expressed on its 0-100 equivalent so every delta shares one percentage scale (as agentMetrics does). */
const toPct = (unit: TrendUnit, v: number) =>
	unit === 'score5' ? Math.round(((v - 1) / 4) * 100) : v;

/** Splits a window of `days` days ending `to` into consecutive `bucketDays`-long blocks, oldest first. */
const buckets = (to: string, days: number, bucketDays: number) => {
	const from = addDays(to, -(days - 1));
	const out: { from: string; to: string }[] = [];
	for (let start = 0; start < days; start += bucketDays) {
		out.push({
			from: addDays(from, start),
			to: addDays(from, Math.min(start + bucketDays, days) - 1),
		});
	}
	return out;
};

/**
 * One card's metric over the selected window and the equal-length window
 * before it, bucketed so both series align index by index.
 */
export const buildAgentMetricTrend = (
	agentId: string,
	metric: TrendMetricKey,
	period: TrendPeriod,
	thresholds: ThresholdSettings
): MetricTrendResult => {
	const unit = TREND_METRIC_UNIT[metric];
	const days = trendPeriodDays(period);
	const bucketDays = trendBucketDays(period);
	const currentBuckets = buckets(TODAY, days, bucketDays);
	const previousBuckets = buckets(addDays(TODAY, -days), days, bucketDays);

	const valueIn = (b: { from: string; to: string }) =>
		metricValue(metric, agentCallsBetween(agentId, b.from, b.to), thresholds);

	const points: TrendPoint[] = currentBuckets.map((b, i) => ({
		period: b.from,
		current: valueIn(b),
		previous: valueIn(previousBuckets[i]),
	}));

	const current = metricValue(
		metric,
		agentCallsBetween(agentId, currentBuckets[0].from, TODAY),
		thresholds
	);
	const previous = metricValue(
		metric,
		agentCallsBetween(
			agentId,
			previousBuckets[0].from,
			previousBuckets[previousBuckets.length - 1].to
		),
		thresholds
	);
	const delta =
		current !== null && previous !== null
			? metricTrend(toPct(unit, current), toPct(unit, previous), 1)
			: null;

	return { unit, points, current, previous, delta };
};

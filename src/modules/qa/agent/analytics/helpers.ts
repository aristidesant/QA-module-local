import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import type { CallEmotion, TeamCallMetric } from '~/modules/qa/analytics/types';
import { predominantEmotion } from '~/modules/qa/calls/agentMetrics';
import { ANALYTICS_PERIODS, type AnalyticsPeriod } from './constants';

interface Bucket {
	key: string;
	label: string;
	calls: TeamCallMetric[];
}

const avg1 = (values: number[]): number | null =>
	values.length === 0
		? null
		: Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
const avg0 = (values: number[]): number | null =>
	values.length === 0
		? null
		: Math.round(values.reduce((s, v) => s + v, 0) / values.length);

/** Monday of the week containing isoDay (UTC arithmetic — no dayjs timezone surprises). */
const weekStart = (isoDay: string) => {
	const dow = (new Date(`${isoDay}T00:00:00Z`).getUTCDay() + 6) % 7;
	return addDays(isoDay, -dow);
};
const formatDay = (isoDay: string) =>
	new Date(`${isoDay}T00:00:00Z`).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	});

export const periodMeta = (period: AnalyticsPeriod) =>
	ANALYTICS_PERIODS.find((p) => p.value === period) ?? ANALYTICS_PERIODS[1];

/** Calls of the window ending on TODAY. */
export const callsInPeriod = (
	calls: TeamCallMetric[],
	period: AnalyticsPeriod
): TeamCallMetric[] => {
	const from = addDays(TODAY, -(periodMeta(period).days - 1));
	return calls.filter(
		(c) => c.date.slice(0, 10) >= from && c.date.slice(0, 10) <= TODAY
	);
};

/** Day or week buckets covering the whole window (empty buckets included so the x-axis is continuous). */
export const bucketsFor = (
	calls: TeamCallMetric[],
	period: AnalyticsPeriod
): Bucket[] => {
	const meta = periodMeta(period);
	const from = addDays(TODAY, -(meta.days - 1));
	const inRange = callsInPeriod(calls, period);
	const keyOf = (c: TeamCallMetric) =>
		meta.bucket === 'day'
			? c.date.slice(0, 10)
			: weekStart(c.date.slice(0, 10));
	const keys: string[] = [];
	if (meta.bucket === 'day') {
		for (let i = 0; i < meta.days; i++) keys.push(addDays(from, i));
	} else {
		for (let k = weekStart(from); k <= TODAY; k = addDays(k, 7)) keys.push(k);
	}
	return keys.map((key) => ({
		key,
		label: formatDay(key),
		calls: inRange.filter((c) => keyOf(c) === key),
	}));
};

export interface OperationalPoint {
	label: string;
	calls: number;
	effective: number;
	nonEffective: number;
}
export const buildOperationalSeries = (
	calls: TeamCallMetric[],
	period: AnalyticsPeriod
): OperationalPoint[] =>
	bucketsFor(calls, period).map((b) => ({
		label: b.label,
		calls: b.calls.length,
		effective: b.calls.filter((c) => c.contactOutcome === 'EFFECTIVE').length,
		nonEffective: b.calls.filter((c) => c.contactOutcome === 'NON_EFFECTIVE')
			.length,
	}));

export interface SentimentPoint {
	label: string;
	agent: number | null;
	customer: number | null;
}
export const buildSentimentSeries = (
	calls: TeamCallMetric[],
	period: AnalyticsPeriod
): SentimentPoint[] =>
	bucketsFor(calls, period).map((b) => ({
		label: b.label,
		agent: avg1(b.calls.map((c) => c.agentSentiment)),
		customer: avg1(b.calls.map((c) => c.customerSentiment)),
	}));

export interface CompliancePoint {
	label: string;
	security: number | null;
	regulatory: number | null;
	legal: number | null;
}
export const buildComplianceSeries = (
	calls: TeamCallMetric[],
	period: AnalyticsPeriod
): CompliancePoint[] =>
	bucketsFor(calls, period).map((b) => ({
		label: b.label,
		security: avg0(b.calls.map((c) => c.complianceByArea.security.score)),
		regulatory: avg0(b.calls.map((c) => c.complianceByArea.regulatory.score)),
		legal: avg0(b.calls.map((c) => c.complianceByArea.legal.score)),
	}));

export const predominantEmotions = (
	calls: TeamCallMetric[],
	period: AnalyticsPeriod
): { agent: CallEmotion | null; customer: CallEmotion | null } => {
	const inRange = callsInPeriod(calls, period);
	return {
		agent: predominantEmotion(inRange.map((c) => c.agentEmotion)),
		customer: predominantEmotion(inRange.map((c) => c.predominantEmotion)),
	};
};

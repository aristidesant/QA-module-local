import type {
	OperationalMetricId,
	RankingMetricId,
} from '~/models/qa/rankingPrograms';
import type { EvaluationArea } from '~/models/qa/triggerRules';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { aggregateMetric, metricOf } from '~/modules/qa/analytics/helpers';
import { TRIGGER_METRIC_CATALOG } from '~/modules/qa/triggers/constants';
import { formatSeconds } from '~/modules/qa/team/helpers';

export type RankingMetricArea = EvaluationArea | 'OPERATIONAL';
export type RankingMetricUnit = 'PERCENT' | 'SCORE_5' | 'COUNT' | 'SECONDS';

export interface RankingMetricDefinition {
	id: RankingMetricId;
	area: RankingMetricArea;
	unit: RankingMetricUnit;
	higherIsBetter: boolean;
}

const OPERATIONAL_METRICS: RankingMetricDefinition[] = [
	{
		id: 'OPS_AHT_SECONDS',
		area: 'OPERATIONAL',
		unit: 'SECONDS',
		higherIsBetter: false,
	},
	{
		id: 'OPS_CALLS_HANDLED',
		area: 'OPERATIONAL',
		unit: 'COUNT',
		higherIsBetter: true,
	},
	{
		id: 'OPS_CALLS_INBOUND',
		area: 'OPERATIONAL',
		unit: 'COUNT',
		higherIsBetter: true,
	},
	{
		id: 'OPS_CALLS_OUTBOUND',
		area: 'OPERATIONAL',
		unit: 'COUNT',
		higherIsBetter: true,
	},
	{
		id: 'OPS_POSITIVE_OUTCOME_COUNT',
		area: 'OPERATIONAL',
		unit: 'COUNT',
		higherIsBetter: true,
	},
	{
		id: 'OPS_POSITIVE_OUTCOME_RATE',
		area: 'OPERATIONAL',
		unit: 'PERCENT',
		higherIsBetter: true,
	},
];

/** Every evaluation metric of the Triggers catalogue, plus the operational ones. */
export const RANKING_METRIC_CATALOG: RankingMetricDefinition[] = [
	...TRIGGER_METRIC_CATALOG.map((metric) => ({
		id: metric.id,
		area: metric.area,
		unit: metric.unit,
		higherIsBetter: metric.higherIsBetter,
	})),
	...OPERATIONAL_METRICS,
];

export const RANKING_METRIC_BY_ID = Object.fromEntries(
	RANKING_METRIC_CATALOG.map((metric) => [metric.id, metric])
) as Record<RankingMetricId, RankingMetricDefinition>;

export const RANKING_METRIC_AREAS: RankingMetricArea[] = [
	'QUALITY_ASSURANCE',
	'COMPLIANCE',
	'SENTIMENT_EMOTION',
	'BUSINESS_INSIGHTS',
	'OPERATIONAL',
];

/** Metrics grouped by area, for a grouped picker. */
export const RANKING_METRIC_GROUPS = RANKING_METRIC_AREAS.map((area) => ({
	area,
	ids: RANKING_METRIC_CATALOG.filter((m) => m.area === area).map((m) => m.id),
}));

export const isOperationalMetric = (
	id: RankingMetricId
): id is OperationalMetricId => id.startsWith('OPS_');

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number) => Math.min(100, Math.max(0, n));

/** Value of one call for a ranking metric. */
export function rankingMetricOf(
	call: TeamCallMetric,
	id: RankingMetricId
): number | null {
	switch (id) {
		case 'OPS_AHT_SECONDS':
			return call.handleTimeSeconds;
		case 'OPS_CALLS_HANDLED':
			return 1;
		case 'OPS_CALLS_INBOUND':
			return call.direction === 'INBOUND' ? 1 : 0;
		case 'OPS_CALLS_OUTBOUND':
			return call.direction === 'OUTBOUND' ? 1 : 0;
		case 'OPS_POSITIVE_OUTCOME_COUNT':
		case 'OPS_POSITIVE_OUTCOME_RATE':
			return call.contactOutcome === 'EFFECTIVE' ? 1 : 0;
		default:
			return metricOf(call, id);
	}
}

/** Counts add up, rates are a percentage of calls, AHT and scores are averages. */
export function aggregateRankingMetric(
	calls: TeamCallMetric[],
	id: RankingMetricId
): number | null {
	if (!isOperationalMetric(id)) return aggregateMetric(calls, id);
	const unit = RANKING_METRIC_BY_ID[id].unit;
	const values = calls
		.map((call) => rankingMetricOf(call, id))
		.filter((v): v is number => v !== null);
	if (unit === 'COUNT') return values.reduce((sum, v) => sum + v, 0);
	if (values.length === 0) return null;
	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	return unit === 'PERCENT' ? round1(mean * 100) : Math.round(mean);
}

/**
 * Puts a value on a 0-100 scale where higher is always better, so metrics of
 * different units can be added. Percentages and 1-5 scores have a fixed scale;
 * counts and seconds are compared against the rest of the ranked agents.
 */
export function normalizeMetric(
	value: number,
	definition: RankingMetricDefinition,
	cohort: number[]
): number {
	const { unit, higherIsBetter } = definition;
	if (unit === 'PERCENT' || unit === 'SCORE_5') {
		const scaled = unit === 'PERCENT' ? value : ((value - 1) / 4) * 100;
		return clamp(higherIsBetter ? scaled : 100 - scaled);
	}
	const min = Math.min(...cohort);
	const max = Math.max(...cohort);
	if (max === min) return 100;
	return clamp(
		higherIsBetter
			? ((value - min) / (max - min)) * 100
			: ((max - value) / (max - min)) * 100
	);
}

export function formatRankingValue(id: RankingMetricId, value: number): string {
	switch (RANKING_METRIC_BY_ID[id].unit) {
		case 'PERCENT':
			return `${Math.round(value)}%`;
		case 'SCORE_5':
			return value.toFixed(1);
		case 'SECONDS':
			return formatSeconds(value);
		default:
			return String(Math.round(value));
	}
}

import type {
	BurnoutDriverMetricId,
	BurnoutPatternMode,
} from '~/modules/qa/analytics/types';
import type { EvaluationArea } from '~/models/qa';
import {
	TRIGGER_METRIC_CATALOG,
	METRIC_BY_ID,
} from '~/modules/qa/triggers/constants';
import type { BurnoutPattern } from './types';

export type PatternMetricUnit = 'PERCENT' | 'SCORE_5' | 'COUNT';

export interface PatternMetricInfo {
	id: BurnoutDriverMetricId;
	/** Group in the metric picker: an evaluation area, or the burnout-only signals. */
	area: EvaluationArea | 'OTHER';
	unit: PatternMetricUnit;
	min: number;
	max: number;
	step: number;
	/** Value a VALUE pattern starts with. */
	defaultThreshold: number;
	/** true → low values are the bad side (scores). */
	higherIsBetter: boolean;
}

/** Signals only burnout patterns use: they are computed from the agent's own calls, not from the trigger catalogue. */
const EXTRA_METRICS: PatternMetricInfo[] = [
	{
		id: 'AHT_VS_TEAM',
		area: 'OTHER',
		unit: 'PERCENT',
		min: -100,
		max: 300,
		step: 1,
		defaultThreshold: 15,
		higherIsBetter: false,
	},
	{
		id: 'AGENT_NEGATIVE_EMOTION_SHARE',
		area: 'OTHER',
		unit: 'PERCENT',
		min: 0,
		max: 100,
		step: 1,
		defaultThreshold: 30,
		higherIsBetter: false,
	},
];

/** Every metric a pattern can read: the whole catalogue plus the burnout-only signals. */
export const PATTERN_METRICS: PatternMetricInfo[] = [
	...TRIGGER_METRIC_CATALOG.map((m) => ({
		id: m.id,
		area: m.area,
		unit: m.unit,
		min: m.min,
		max: m.max,
		step: m.step,
		defaultThreshold: m.defaultThreshold,
		higherIsBetter: m.higherIsBetter,
	})),
	...EXTRA_METRICS,
];

const METRIC_INFO = Object.fromEntries(
	PATTERN_METRICS.map((m) => [m.id, m])
) as Record<BurnoutDriverMetricId, PatternMetricInfo>;

export const patternMetricInfo = (id: BurnoutDriverMetricId) => METRIC_INFO[id];

/** Picker order: the four evaluation areas, then the burnout-only signals. */
export const PATTERN_METRIC_AREAS: PatternMetricInfo['area'][] = [
	'QUALITY_ASSURANCE',
	'COMPLIANCE',
	'SENTIMENT_EMOTION',
	'BUSINESS_INSIGHTS',
	'OTHER',
];

export const PATTERN_WINDOWS = [7, 14, 30];

export const unitSuffix = (unit: PatternMetricUnit) =>
	unit === 'PERCENT' ? '%' : unit === 'SCORE_5' ? ' pts' : '';

/** How far a DELTA pattern can move: the metric's whole range. */
export const deltaRange = (info: PatternMetricInfo) => info.max - info.min;

/** The bad side of a metric: scores break going down, error counts and shares going up. */
export const defaultDirection = (info: PatternMetricInfo) =>
	info.higherIsBetter ? 'BELOW' : 'ABOVE';

const DEFAULT_CHANGE: Record<PatternMetricUnit, number> = {
	PERCENT: 5,
	SCORE_5: 0.3,
	COUNT: 1,
};

/** Threshold shown in the table and drawer: a drop is edited as the size of the drop. */
export const displayThreshold = (pattern: BurnoutPattern) =>
	pattern.mode === 'DELTA' ? Math.abs(pattern.threshold) : pattern.threshold;

/** Inverse of `displayThreshold`: a DELTA pattern stores its sign in the direction. */
export const storedThreshold = (
	mode: BurnoutPatternMode,
	direction: BurnoutPattern['direction'],
	shown: number
) =>
	mode === 'DELTA'
		? direction === 'BELOW'
			? -Math.abs(shown)
			: Math.abs(shown)
		: shown;

/** Near band suggested for a threshold: a quarter of it, never below one step. */
export const suggestNearBand = (
	threshold: number,
	info: PatternMetricInfo,
	mode: BurnoutPatternMode
) => {
	if (mode === 'STREAK') return 1;
	const step = info.unit === 'SCORE_5' ? 0.05 : 1;
	const quarter = Math.abs(threshold) * 0.25;
	return Math.max(step, Math.round(quarter / step) * step);
};

/** A blank pattern for the drawer: the metric's bad side, its default level and a suggested near band. */
export const newPattern = (
	metricId: BurnoutDriverMetricId = 'QA_OVERALL_SCORE'
): BurnoutPattern => {
	const info = patternMetricInfo(metricId);
	const direction = defaultDirection(info);
	return {
		id: `custom-${Date.now().toString(36)}`,
		name: '',
		builtIn: false,
		enabled: true,
		metricId,
		mode: 'VALUE',
		windowDays: 14,
		direction,
		threshold: info.defaultThreshold,
		nearBand: suggestNearBand(info.defaultThreshold, info, 'VALUE'),
	};
};

/** What a pattern's threshold starts at when its metric or condition type changes. */
export const defaultThresholdFor = (
	info: PatternMetricInfo,
	mode: BurnoutPatternMode,
	direction: BurnoutPattern['direction']
) =>
	mode === 'VALUE'
		? info.defaultThreshold
		: mode === 'DELTA'
			? storedThreshold(
					mode,
					direction,
					info.id === 'AHT_VS_TEAM' ? 10 : DEFAULT_CHANGE[info.unit]
				)
			: 3;

/** A streak's daily level is a percentage; scores on the 1-5 scale use their share of that scale. */
export const toDayPercent = (info: PatternMetricInfo, value: number) =>
	info.unit === 'SCORE_5' ? ((value - 1) / 4) * 100 : value;

/** Daily level a new streak starts at, as a percentage. */
export const defaultDayLevel = (info: PatternMetricInfo) =>
	Math.round(toDayPercent(info, info.defaultThreshold));

/** Streaks need a percentage, so count metrics (no natural percentage) are left out. */
export const supportsStreak = (info: PatternMetricInfo) =>
	info.unit !== 'COUNT';

/** Metric keys of the catalogue, to tell catalogue metrics from burnout-only ones. */
export const isCatalogueMetric = (id: BurnoutDriverMetricId) =>
	id in METRIC_BY_ID;

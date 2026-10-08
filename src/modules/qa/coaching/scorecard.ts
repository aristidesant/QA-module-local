import type { LmsImpactVerdict } from '~/models/qa';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import {
	agentCallsInWindow,
	aggregateDashboardMetrics,
} from '~/modules/qa/calls/agentMetrics';
import { IMPACT_THRESHOLD } from '~/modules/qa/lms/constants';
import { OPERATIONAL_META } from '~/modules/qa/team/constants';

/** The four aspects that make up the weekly coaching scorecard. */
export type ScorecardDimension =
	| 'qa'
	| 'compliance'
	| 'operational'
	| 'business';

export const SCORECARD_DIMENSION_ORDER: ScorecardDimension[] = [
	'qa',
	'compliance',
	'operational',
	'business',
];

/** Weights sum to 100. */
export const SCORECARD_WEIGHTS: Record<ScorecardDimension, number> = {
	qa: 35,
	compliance: 30,
	operational: 20,
	business: 15,
};

/**
 * i18n keys live in the qa.coaching namespace. Colors for qa / compliance / business
 * mirror LMS_AREA_META so the aspect badges keep the colors users already know.
 */
export const SCORECARD_DIMENSION_META: Record<
	ScorecardDimension,
	{ labelKey: string; shortLabelKey: string; color: string }
> = {
	qa: {
		labelKey: 'agents.scorecard.dimensions.qa',
		shortLabelKey: 'agents.scorecard.short.qa',
		color: 'gray',
	},
	compliance: {
		labelKey: 'agents.scorecard.dimensions.compliance',
		shortLabelKey: 'agents.scorecard.short.compliance',
		color: 'red',
	},
	operational: {
		labelKey: 'agents.scorecard.dimensions.operational',
		shortLabelKey: 'agents.scorecard.short.operational',
		color: 'indigo',
	},
	business: {
		labelKey: 'agents.scorecard.dimensions.business',
		shortLabelKey: 'agents.scorecard.short.business',
		color: 'blue',
	},
};

/** Window the scorecard summarises; the previous week is the same window shifted back. */
export const SCORECARD_WINDOW_DAYS = 7;
/** Conversion rate (%) that scores 100 on Business Insights; mock calibration. */
export const SCORECARD_BUSINESS_TARGET_RATE = 40;
export const SCORECARD_AHT_BASELINE_SECONDS = OPERATIONAL_META.aht.baseline;

export type PerformanceTier =
	| 'EXCELLENT'
	| 'GOOD'
	| 'NEEDS_IMPROVEMENT'
	| 'CRITICAL';

export const TIER_ORDER: PerformanceTier[] = [
	'EXCELLENT',
	'GOOD',
	'NEEDS_IMPROVEMENT',
	'CRITICAL',
];

/** Lower bound (inclusive) of each tier on the 0-100 scorecard. CRITICAL is everything below NEEDS_IMPROVEMENT. */
export const TIER_MIN_SCORE: Record<
	Exclude<PerformanceTier, 'CRITICAL'>,
	number
> = {
	EXCELLENT: 90,
	GOOD: 80,
	NEEDS_IMPROVEMENT: 70,
};

/** `color` doubles as SectionCard.headerAccent (same four literals). */
export const TIER_META: Record<
	PerformanceTier,
	{
		labelKey: string;
		rangeKey: string;
		color: 'green' | 'blue' | 'yellow' | 'red';
	}
> = {
	EXCELLENT: {
		labelKey: 'agents.tiers.EXCELLENT.label',
		rangeKey: 'agents.tiers.EXCELLENT.range',
		color: 'green',
	},
	GOOD: {
		labelKey: 'agents.tiers.GOOD.label',
		rangeKey: 'agents.tiers.GOOD.range',
		color: 'blue',
	},
	NEEDS_IMPROVEMENT: {
		labelKey: 'agents.tiers.NEEDS_IMPROVEMENT.label',
		rangeKey: 'agents.tiers.NEEDS_IMPROVEMENT.range',
		color: 'yellow',
	},
	CRITICAL: {
		labelKey: 'agents.tiers.CRITICAL.label',
		rangeKey: 'agents.tiers.CRITICAL.range',
		color: 'red',
	},
};

export const tierFor = (score: number): PerformanceTier =>
	score >= TIER_MIN_SCORE.EXCELLENT
		? 'EXCELLENT'
		: score >= TIER_MIN_SCORE.GOOD
			? 'GOOD'
			: score >= TIER_MIN_SCORE.NEEDS_IMPROVEMENT
				? 'NEEDS_IMPROVEMENT'
				: 'CRITICAL';

export interface WeeklyScorecard {
	/** Each aspect on a 0-100 scale. */
	dimensions: Record<ScorecardDimension, number>;
	/** Weighted composite, 0-100, rounded. */
	score: number;
	calls: number;
}

const clamp100 = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

/** null when the window has no calls: the agent then has no scorecard for that week. */
export const buildWeeklyScorecard = (
	calls: TeamCallMetric[]
): WeeklyScorecard | null => {
	if (calls.length === 0) return null;
	const m = aggregateDashboardMetrics(calls);
	const qa = clamp100(m.qa.total);
	const compliance = clamp100(
		m.complianceCategories.reduce((s, c) => s + c.score, 0) /
			m.complianceCategories.length
	);
	const effectivePct = (m.effectiveContacts / m.calls) * 100;
	const aht = calls.reduce((s, c) => s + c.handleTimeSeconds, 0) / calls.length;
	// 100 when at or under the baseline, losing one point per % over it.
	const ahtScore = clamp100(
		100 -
			Math.max(
				0,
				((aht - SCORECARD_AHT_BASELINE_SECONDS) /
					SCORECARD_AHT_BASELINE_SECONDS) *
					100
			)
	);
	const operational = clamp100(effectivePct * 0.5 + ahtScore * 0.5);
	const conversionPct =
		m.sales.offered === 0 ? 0 : (m.sales.sold / m.sales.offered) * 100;
	const business = clamp100(
		(conversionPct / SCORECARD_BUSINESS_TARGET_RATE) * 100
	);
	const dimensions: Record<ScorecardDimension, number> = {
		qa,
		compliance,
		operational,
		business,
	};
	const score = clamp100(
		SCORECARD_DIMENSION_ORDER.reduce(
			(s, k) => s + dimensions[k] * SCORECARD_WEIGHTS[k],
			0
		) / 100
	);
	return { dimensions, score, calls: calls.length };
};

export type ScorecardTrendVerdict = Exclude<LmsImpactVerdict, 'PENDING'>;

export interface ScorecardTrend {
	verdict: ScorecardTrendVerdict;
	current: number;
	previous: number;
	/** current minus previous, signed. */
	delta: number;
}

/** Same ±IMPACT_THRESHOLD band the LMS impact uses. null when either week has no scorecard. */
export const scorecardTrend = (
	current: WeeklyScorecard | null,
	previous: WeeklyScorecard | null
): ScorecardTrend | null => {
	if (!current || !previous) return null;
	const delta = current.score - previous.score;
	const verdict: ScorecardTrendVerdict =
		delta >= IMPACT_THRESHOLD
			? 'IMPROVED'
			: delta <= -IMPACT_THRESHOLD
				? 'DECLINED'
				: 'SAME';
	return { verdict, current: current.score, previous: previous.score, delta };
};

export interface AgentScorecard {
	current: WeeklyScorecard | null;
	previous: WeeklyScorecard | null;
	trend: ScorecardTrend | null;
	/** null when there is no current scorecard. */
	tier: PerformanceTier | null;
	/** Lowest of the four aspects this week; null without a scorecard. */
	weakest: { dimension: ScorecardDimension; value: number } | null;
}

export const buildAgentScorecard = (agentId: string): AgentScorecard => {
	const current = buildWeeklyScorecard(
		agentCallsInWindow(agentId, SCORECARD_WINDOW_DAYS)
	);
	const previous = buildWeeklyScorecard(
		agentCallsInWindow(agentId, SCORECARD_WINDOW_DAYS, SCORECARD_WINDOW_DAYS)
	);
	const weakest = current
		? SCORECARD_DIMENSION_ORDER.map((dimension) => ({
				dimension,
				value: current.dimensions[dimension],
			})).sort((a, b) => a.value - b.value)[0]
		: null;
	return {
		current,
		previous,
		trend: scorecardTrend(current, previous),
		tier: current ? tierFor(current.score) : null,
		weakest,
	};
};

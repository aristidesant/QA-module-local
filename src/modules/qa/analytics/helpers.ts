import type {
	MetricComparison,
	MetricTrend,
} from '~/models/AnalyticsDashboard';
import type {
	CoachingSessionRecord,
	LmsAssignment,
	TriggerMetricId,
} from '~/models/qa';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import { formatMetricValue } from '~/modules/qa/triggers/helpers';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import type {
	NonConversionReasonKey,
	RosterAgent,
	Shift,
	TeamRole,
} from '~/modules/qa/team/types';
import {
	TEAM_AGENTS,
	TEAM_PROFILES,
	TEAM_SUPERVISORS,
} from '~/modules/qa/team/mockData';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import { useSettingsStore } from '~/stores/qa/settingsStore';
import {
	burnoutLevelFor,
	isNegativeEmotionIn,
} from '~/modules/qa/settings/helpers';
import type {
	BurnoutPattern,
	BurnoutSettings,
} from '~/modules/qa/settings/types';
import { TEAM_CALLS } from './mockData';
import {
	DEFAULT_FILTERS,
	MAX_SEGMENT_SERIES,
	OTHER_SEGMENT_KEY,
	TIME_SLOTS,
	TODAY,
	WEEKDAY_SHORT,
	addDays,
} from './constants';
import type {
	BurnoutAction,
	BurnoutDriver,
	BurnoutDriverRule,
	BurnoutDriverStatus,
	BurnoutWorkload,
	BusinessSignalKind,
	BusinessSummary,
	CallDirection,
	CallEmotion,
	CampaignType,
	ComparisonSeriesPoint,
	FilterChip,
	FinderQuery,
	FinderResultRow,
	Granularity,
	GroupByDimension,
	HistoryEntry,
	SegmentMetricId,
	SegmentRow,
	SegmentSeriesPoint,
	TeamAnalyticsFilters,
	TeamCallMetric,
	TeamCallSignals,
	TeamKpis,
	TenureBand,
	TimeSlot,
} from './types';

// ---------- small utils ----------
const round1 = (v: number) => Math.round(v * 10) / 10;
const dayOf = (iso: string) => iso.slice(0, 10);
const inRange = (call: TeamCallMetric, from: string, to: string) => {
	const d = dayOf(call.date);
	return d >= from && d <= to;
};
const daysBetween = (from: string, to: string) =>
	Math.round(
		(Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
			86_400_000
	);
const mean = (values: number[]) =>
	values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;
const pct = (part: number, total: number) =>
	total ? round1((part / total) * 100) : 0;
const toBool = (v: boolean) => (v ? 1 : 0);

const POSITIVE_EMOTIONS: ReadonlySet<string> = new Set([
	'Joy',
	'Trust',
	'Anticipation',
]);
/** Emotions counted as negative are configured in Settings. */
const isNegativeCallEmotion = (emotion: CallEmotion) =>
	isNegativeEmotionIn(
		emotion,
		useSettingsStore.getState().thresholds.sentiment.negativeEmotions
	);
/** PERCENT metrics whose per-call value is 1/0 → aggregated as 100 × mean. */
export const SHARE_METRIC_IDS: ReadonlySet<TriggerMetricId> =
	new Set<TriggerMetricId>([
		'POSITIVE_EMOTION_CALL_SHARE',
		'NEGATIVE_EMOTION_CALL_SHARE',
		'BI_EARLY_OBJECTION_RATE',
		'BI_UNHANDLED_OBJECTION_RATE',
		'BI_COMPETITOR_PLUS_COST_RATE',
		'BI_MISTARGETED_OFFER_RATE',
		'BI_NON_CONVERSION_RATE',
	]);
const SIGNAL_FIELD: Record<BusinessSignalKind, keyof TeamCallSignals> = {
	EARLY_OBJECTION: 'earlyObjection',
	UNHANDLED_OBJECTION: 'unhandledObjection',
	COMPETITOR_PLUS_COST: 'competitorPlusCost',
	MISTARGETED_OFFER: 'mistargetedOffer',
};
const SIGNAL_KINDS: BusinessSignalKind[] = [
	'EARLY_OBJECTION',
	'UNHANDLED_OBJECTION',
	'COMPETITOR_PLUS_COST',
	'MISTARGETED_OFFER',
];

// ---------- scope & filters ----------
/** Same rule as managerScopeAgents in lms/helpers: supervisor sees SUP-001 only. */
export const scopeAgents = (role: TeamRole): RosterAgent[] =>
	TEAM_AGENTS.filter(
		(a) => role === 'qa-manager' || a.supervisorId === SUPERVISOR_PERSONA.id
	);

/** ISO bounds for aggregateMetricsByDateRange (inclusive day range). */
export const toRangeISO = (f: Pick<TeamAnalyticsFilters, 'from' | 'to'>) => ({
	start: `${f.from}T00:00:00Z`,
	end: `${f.to}T23:59:59Z`,
});

export function filterCalls(
	calls: TeamCallMetric[],
	f: TeamAnalyticsFilters,
	role: TeamRole
): TeamCallMetric[] {
	const has = <T>(arr: T[], v: T) => arr.length === 0 || arr.includes(v);
	return calls.filter((c) => {
		if (role === 'supervisor' && c.supervisorId !== SUPERVISOR_PERSONA.id)
			return false;
		if (!inRange(c, f.from, f.to)) return false;
		if (
			!has(f.supervisorIds, c.supervisorId) ||
			!has(f.agentIds, c.agentId) ||
			!has(f.campaignIds, c.campaignId)
		)
			return false;
		if (
			!has(f.linesOfBusiness, c.lineOfBusiness) ||
			!has(f.campaignTypes, c.campaignType) ||
			!has(f.directions, c.direction)
		)
			return false;
		if (
			!has(f.shifts, c.shift) ||
			!has(f.statuses, c.agentStatus) ||
			!has(f.tenureBands, c.tenureBand)
		)
			return false;
		if (
			!has(f.timeSlots, c.timeSlot) ||
			!has(f.weekdays, c.weekday) ||
			!has(f.emotions, c.predominantEmotion)
		)
			return false;
		if (f.autoFailOnly && !c.autoFail) return false;
		if (f.recoveredOnly && !c.sentimentRecovered) return false;
		if (f.offeredOnly && c.offeredProduct === null) return false;
		if (f.convertedOnly && !c.converted) return false;
		if (f.scoreRange.metricId) {
			const v = metricOf(c, f.scoreRange.metricId);
			if (v === null) return false;
			if (f.scoreRange.min !== null && v < f.scoreRange.min) return false;
			if (f.scoreRange.max !== null && v > f.scoreRange.max) return false;
		}
		return true;
	});
}

export function previousPeriod(f: Pick<TeamAnalyticsFilters, 'from' | 'to'>): {
	from: string;
	to: string;
} {
	const len = daysBetween(f.from, f.to) + 1;
	const to = addDays(f.from, -1);
	return { from: addDays(to, -(len - 1)), to };
}
export const shiftFilters = (
	f: TeamAnalyticsFilters,
	prev: { from: string; to: string }
): TeamAnalyticsFilters => ({
	...f,
	from: prev.from,
	to: prev.to,
	quickRange: 'custom',
});

// ---------- UI helpers (filter bar, chips, drill-down) ----------
const ARRAY_KEYS = [
	'supervisorIds',
	'agentIds',
	'campaignIds',
	'linesOfBusiness',
	'campaignTypes',
	'directions',
	'shifts',
	'statuses',
	'tenureBands',
	'timeSlots',
	'weekdays',
	'emotions',
] as const;
const FLAG_KEYS = [
	'autoFailOnly',
	'recoveredOnly',
	'offeredOnly',
	'convertedOnly',
] as const;
const sameSet = (a: readonly unknown[], b: readonly unknown[]) =>
	a.length === b.length && a.every((v) => b.includes(v));

export function isEqualFilters(
	a: TeamAnalyticsFilters,
	b: TeamAnalyticsFilters
): boolean {
	return (
		a.from === b.from &&
		a.to === b.to &&
		a.quickRange === b.quickRange &&
		a.granularity === b.granularity &&
		a.compareWithPrevious === b.compareWithPrevious &&
		a.minCalls === b.minCalls &&
		ARRAY_KEYS.every((k) => sameSet(a[k], b[k])) &&
		FLAG_KEYS.every((k) => a[k] === b[k]) &&
		a.scoreRange.metricId === b.scoreRange.metricId &&
		a.scoreRange.min === b.scoreRange.min &&
		a.scoreRange.max === b.scoreRange.max
	);
}

/** One chip per non-default field; values are raw ids (labels resolved by the component). */
export function filterChips(f: TeamAnalyticsFilters): FilterChip[] {
	const chips: FilterChip[] = [];
	if (f.quickRange === 'custom')
		chips.push({
			key: 'period',
			values: [`${f.from} → ${f.to}`],
			remove: (x) => ({
				...x,
				from: DEFAULT_FILTERS.from,
				to: DEFAULT_FILTERS.to,
				quickRange: DEFAULT_FILTERS.quickRange,
			}),
		});
	if (f.granularity !== DEFAULT_FILTERS.granularity)
		chips.push({
			key: 'granularity',
			values: [f.granularity],
			remove: (x) => ({ ...x, granularity: DEFAULT_FILTERS.granularity }),
		});
	for (const k of ARRAY_KEYS)
		if (f[k].length > 0)
			chips.push({
				key: k,
				values: f[k].map(String),
				remove: (x) => ({ ...x, [k]: [] }),
			});
	for (const k of FLAG_KEYS)
		if (f[k])
			chips.push({ key: k, values: [], remove: (x) => ({ ...x, [k]: false }) });
	if (f.scoreRange.metricId)
		chips.push({
			key: 'scoreRange',
			values: [
				f.scoreRange.metricId,
				String(f.scoreRange.min ?? ''),
				String(f.scoreRange.max ?? ''),
			],
			remove: (x) => ({ ...x, scoreRange: DEFAULT_FILTERS.scoreRange }),
		});
	if (f.minCalls !== DEFAULT_FILTERS.minCalls)
		chips.push({
			key: 'minCalls',
			values: [String(f.minCalls)],
			remove: (x) => ({ ...x, minCalls: DEFAULT_FILTERS.minCalls }),
		});
	return chips;
}
export const activeFilterCount = (f: TeamAnalyticsFilters): number =>
	filterChips(f).length;

/** Narrows the filters to one segment of `dimension` (used by drill-down). */
export function narrowFilters(
	f: TeamAnalyticsFilters,
	dimension: GroupByDimension,
	key: string
): TeamAnalyticsFilters {
	switch (dimension) {
		case 'team': {
			const sup = TEAM_SUPERVISORS.find((s) => s.team === key);
			return sup ? { ...f, supervisorIds: [sup.id] } : f;
		}
		case 'supervisor':
			return { ...f, supervisorIds: [key] };
		case 'agent':
			return { ...f, agentIds: [key] };
		case 'campaign':
			return { ...f, campaignIds: [key] };
		case 'lineOfBusiness':
			return { ...f, linesOfBusiness: [key] };
		case 'campaignType':
			return { ...f, campaignTypes: [key as CampaignType] };
		case 'callDirection':
			return { ...f, directions: [key as CallDirection] };
		case 'shift':
			return { ...f, shifts: [key as Shift] };
		case 'tenure':
			return { ...f, tenureBands: [key as TenureBand] };
		case 'timeOfDay':
			return { ...f, timeSlots: [key as TimeSlot] };
		case 'weekday':
			return { ...f, weekdays: [Number(key)] };
		default:
			return f;
	}
}

// ---------- per-call metric & aggregation ----------
export function metricOf(
	call: TeamCallMetric,
	id: TriggerMetricId
): number | null {
	switch (id) {
		case 'QA_OVERALL_SCORE':
			return call.qaScore;
		case 'QA_ECN_COUNT':
			return call.qaScores.ecn;
		case 'QA_ENC_COUNT':
			return call.qaScores.enc;
		case 'QA_ECC_COUNT':
			return call.qaScores.ecc;
		case 'QA_ECUF_COUNT':
			return call.qaScores.ecuf;
		case 'QA_AUTO_FAIL_COUNT':
			return toBool(call.autoFail);
		case 'COMPLIANCE_OVERALL_SCORE': {
			const { security, regulatory, legal } = call.complianceByArea;
			return round1((security.score + regulatory.score + legal.score) / 3);
		}
		case 'COMPLIANCE_SECURITY_SCORE':
			return call.complianceByArea.security.score;
		case 'COMPLIANCE_REGULATORY_SCORE':
			return call.complianceByArea.regulatory.score;
		case 'COMPLIANCE_LEGAL_SCORE':
			return call.complianceByArea.legal.score;
		case 'COMPLIANCE_VIOLATION_COUNT': {
			const { security, regulatory, legal } = call.complianceByArea;
			return [security, regulatory, legal]
				.flatMap((a) => Object.values(a.items))
				.filter((v) => v < 70).length;
		}
		case 'CUSTOMER_SENTIMENT_SCORE':
			return call.customerSentiment;
		case 'AGENT_SENTIMENT_SCORE':
			return call.agentSentiment;
		case 'POSITIVE_EMOTION_CALL_SHARE':
			return toBool(POSITIVE_EMOTIONS.has(call.predominantEmotion));
		case 'NEGATIVE_EMOTION_CALL_SHARE':
			return toBool(isNegativeCallEmotion(call.predominantEmotion));
		case 'SENTIMENT_RECOVERY_COUNT':
			return toBool(call.sentimentRecovered);
		case 'BI_EARLY_OBJECTION_RATE':
			return toBool(call.signals.earlyObjection);
		case 'BI_UNHANDLED_OBJECTION_RATE':
			return toBool(call.signals.unhandledObjection);
		case 'BI_COMPETITOR_PLUS_COST_RATE':
			return toBool(call.signals.competitorPlusCost);
		case 'BI_MISTARGETED_OFFER_RATE':
			return toBool(call.signals.mistargetedOffer);
		case 'BI_NON_CONVERSION_RATE':
			return call.offeredProduct === null ? null : toBool(!call.converted);
		default:
			return null;
	}
}

/** COUNT → sum; share ids → 100 × mean of 1/0; scores → mean. 1 decimal. null when no data. */
export function aggregateMetric(
	calls: TeamCallMetric[],
	id: TriggerMetricId
): number | null {
	const values: number[] = [];
	for (const c of calls) {
		const v = metricOf(c, id);
		if (v !== null) values.push(v);
	}
	if (values.length === 0) return null;
	const sum = values.reduce((s, v) => s + v, 0);
	if (METRIC_BY_ID[id].unit === 'COUNT') return sum;
	const avg = sum / values.length;
	return round1(SHARE_METRIC_IDS.has(id) ? avg * 100 : avg);
}

/** trend = direction of the value change (matches KpiCard's arrow + signed %). Use isImprovement for colour. */
export function comparison(
	current: number | null,
	previous: number | null
): MetricComparison {
	if (current === null || previous === null)
		return {
			absoluteChange: null,
			percentageChange: null,
			trend: 'UNAVAILABLE',
		};
	const absoluteChange = round1(current - previous);
	const percentageChange =
		previous === 0
			? null
			: round1(((current - previous) / Math.abs(previous)) * 100);
	const trend: MetricTrend =
		Math.abs(absoluteChange) < 0.05
			? 'FLAT'
			: absoluteChange > 0
				? 'UP'
				: 'DOWN';
	return { absoluteChange, percentageChange, trend };
}
export const isImprovement = (
	cmp: MetricComparison,
	higherIsBetter: boolean
): boolean | null =>
	cmp.trend === 'UNAVAILABLE' || cmp.trend === 'FLAT'
		? null
		: (cmp.trend === 'UP') === higherIsBetter;

export const formatMetric = (
	id: TriggerMetricId,
	value: number | null
): string => (value === null ? '—' : formatMetricValue(id, value));

// ---------- periods & segments ----------
/** Mirrors the bucketing of aggregateMetricsByDateRange (dashboard/mockData.ts:2631-2645). */
export function periodKeyOf(iso: string, granularity: Granularity): string {
	const d = new Date(iso);
	if (granularity === 'weekly') {
		const startOfYear = new Date(d.getFullYear(), 0, 1);
		const week = Math.floor(
			(d.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
		);
		return `${d.getFullYear()}-W${String(week + 1).padStart(2, '0')}`;
	}
	if (granularity === 'monthly') return d.toISOString().substring(0, 7);
	return d.toISOString().split('T')[0];
}

export function segmentKeyOf(
	call: TeamCallMetric,
	dim: GroupByDimension
): { key: string; label: string } {
	switch (dim) {
		case 'team':
			return { key: call.team, label: call.team };
		case 'supervisor':
			return { key: call.supervisorId, label: call.supervisorName };
		case 'agent':
			return { key: call.agentId, label: call.agentName };
		case 'campaign':
			return { key: call.campaignId, label: call.campaignName };
		case 'lineOfBusiness':
			return { key: call.lineOfBusiness, label: call.lineOfBusiness };
		case 'campaignType':
			return { key: call.campaignType, label: call.campaignType };
		case 'callDirection':
			return { key: call.direction, label: call.direction };
		case 'shift':
			return { key: call.shift, label: call.shift };
		case 'tenure':
			return { key: call.tenureBand, label: call.tenureBand };
		case 'timeOfDay':
			return { key: call.timeSlot, label: call.timeSlot };
		case 'weekday':
			return { key: String(call.weekday), label: WEEKDAY_SHORT[call.weekday] };
		default:
			return { key: 'all', label: 'All' };
	}
}

function groupByDim(
	calls: TeamCallMetric[],
	dim: GroupByDimension
): Map<string, { label: string; calls: TeamCallMetric[] }> {
	const map = new Map<string, { label: string; calls: TeamCallMetric[] }>();
	for (const c of calls) {
		const { key, label } = segmentKeyOf(c, dim);
		const g = map.get(key);
		if (g) g.calls.push(c);
		else map.set(key, { label, calls: [c] });
	}
	return map;
}
const metricsOf = (
	calls: TeamCallMetric[],
	ids: SegmentMetricId[]
): Partial<Record<SegmentMetricId, number | null>> =>
	Object.fromEntries(
		ids.map((id) => [id, aggregateMetric(calls, id)])
	) as Partial<Record<SegmentMetricId, number | null>>;

/** `points` equal day-buckets across [from,to]; empty buckets repeat the last known value. */
export function sparklineFor(
	calls: TeamCallMetric[],
	metricId: TriggerMetricId,
	from: string,
	to: string,
	points = 7
): number[] {
	const totalDays = daysBetween(from, to) + 1;
	const size = Math.max(1, Math.ceil(totalDays / points));
	const out: number[] = [];
	let last = 0;
	for (let i = 0; i < points; i++) {
		const bFrom = addDays(from, i * size);
		const bTo = addDays(from, Math.min(totalDays - 1, (i + 1) * size - 1));
		if (bFrom <= to) {
			const v = aggregateMetric(
				calls.filter((c) => inRange(c, bFrom, bTo)),
				metricId
			);
			if (v !== null) last = v;
		}
		out.push(last);
	}
	return out;
}

/** Rows sorted by calls desc; agent rows below `minCalls` dropped; beyond MAX_SEGMENT_SERIES the tail collapses into OTHER_SEGMENT_KEY. */
export function buildSegments(
	calls: TeamCallMetric[],
	previousCalls: TeamCallMetric[],
	dim: GroupByDimension,
	metricIds: SegmentMetricId[],
	from: string,
	to: string,
	minCalls: number
): SegmentRow[] {
	const primary: TriggerMetricId = metricIds[0] ?? 'QA_OVERALL_SCORE';
	const groups = groupByDim(calls, dim);
	const prevGroups = groupByDim(previousCalls, dim);
	let rows: SegmentRow[] = [...groups.entries()].map(([key, g]) => ({
		key,
		label: g.label,
		calls: g.calls.length,
		metrics: metricsOf(g.calls, metricIds),
		previous: metricsOf(prevGroups.get(key)?.calls ?? [], metricIds),
		sparkline: sparklineFor(g.calls, primary, from, to),
	}));
	if (dim === 'agent') rows = rows.filter((r) => r.calls >= minCalls);
	rows.sort((a, b) => b.calls - a.calls);
	if (rows.length <= MAX_SEGMENT_SERIES) return rows;

	const head = rows.slice(0, MAX_SEGMENT_SERIES - 1);
	const tailKeys = new Set(
		rows.slice(MAX_SEGMENT_SERIES - 1).map((r) => r.key)
	);
	const otherCalls = calls.filter((c) =>
		tailKeys.has(segmentKeyOf(c, dim).key)
	);
	const otherPrev = previousCalls.filter((c) =>
		tailKeys.has(segmentKeyOf(c, dim).key)
	);
	head.push({
		key: OTHER_SEGMENT_KEY,
		label: `Other (${tailKeys.size})`,
		calls: otherCalls.length,
		metrics: metricsOf(otherCalls, metricIds),
		previous: metricsOf(otherPrev, metricIds),
		sparkline: sparklineFor(otherCalls, primary, from, to),
	});
	return head;
}

/** One point per period, one column per segment key (null when the segment has no calls in that period). */
export function buildSegmentSeries(
	calls: TeamCallMetric[],
	dim: GroupByDimension,
	metricId: TriggerMetricId,
	from: string,
	to: string,
	granularity: Granularity,
	segmentKeys: string[]
): SegmentSeriesPoint[] {
	const g = granularity === 'per-call' ? 'daily' : granularity;
	const keySet = new Set(segmentKeys);
	const buckets = new Map<string, Map<string, TeamCallMetric[]>>();
	for (const c of calls) {
		if (!inRange(c, from, to)) continue;
		const seg = segmentKeyOf(c, dim).key;
		const segKey = keySet.has(seg)
			? seg
			: keySet.has(OTHER_SEGMENT_KEY)
				? OTHER_SEGMENT_KEY
				: null;
		if (!segKey) continue;
		const period = periodKeyOf(c.date, g);
		const bySeg = buckets.get(period) ?? new Map<string, TeamCallMetric[]>();
		bySeg.set(segKey, [...(bySeg.get(segKey) ?? []), c]);
		buckets.set(period, bySeg);
	}
	return [...buckets.keys()].sort().map((period) => {
		const point: SegmentSeriesPoint = { period };
		const bySeg = buckets.get(period)!;
		for (const k of segmentKeys)
			point[k] = aggregateMetric(bySeg.get(k) ?? [], metricId);
		return point;
	});
}

/** Current vs previous period aligned by bucket index (labels come from the current period). */
export function alignedComparisonSeries(
	current: TeamCallMetric[],
	previous: TeamCallMetric[],
	metricId: TriggerMetricId,
	f: TeamAnalyticsFilters
): ComparisonSeriesPoint[] {
	const g = f.granularity === 'per-call' ? 'daily' : f.granularity;
	const bucket = (calls: TeamCallMetric[]) => {
		const m = new Map<string, TeamCallMetric[]>();
		for (const c of calls) {
			const k = periodKeyOf(c.date, g);
			m.set(k, [...(m.get(k) ?? []), c]);
		}
		return [...m.keys()]
			.sort()
			.map((k) => ({ period: k, value: aggregateMetric(m.get(k)!, metricId) }));
	};
	const cur = bucket(current);
	const prev = bucket(previous);
	return cur.map((p, i) => ({
		period: p.period,
		current: p.value,
		previous: prev[i]?.value ?? null,
	}));
}

export function computeKpis(calls: TeamCallMetric[]): TeamKpis {
	const offered = calls.filter((c) => c.offeredProduct !== null);
	return {
		qaScore: aggregateMetric(calls, 'QA_OVERALL_SCORE'),
		compliance: aggregateMetric(calls, 'COMPLIANCE_OVERALL_SCORE'),
		customerSentiment: aggregateMetric(calls, 'CUSTOMER_SENTIMENT_SCORE'),
		conversionRate: offered.length
			? pct(offered.filter((c) => c.converted).length, offered.length)
			: null,
		calls: calls.length,
	};
}

// ---------- Finder ----------
export const burnoutLevelsByAgent = (): Record<string, BurnoutRiskLevel> =>
	Object.fromEntries(
		Object.values(TEAM_PROFILES).map((p) => [
			p.agent.id,
			assessBurnout(p.agent.id).level,
		])
	);

function dateBounds(calls: TeamCallMetric[]): { from: string; to: string } {
	if (calls.length === 0) return { from: TODAY, to: TODAY };
	let from = dayOf(calls[0].date),
		to = from;
	for (const c of calls) {
		const d = dayOf(c.date);
		if (d < from) from = d;
		if (d > to) to = d;
	}
	return { from, to };
}

/** Worst-first: ascending value for BELOW/BETWEEN, descending for ABOVE. */
export function runFinderQuery(
	calls: TeamCallMetric[],
	previousCalls: TeamCallMetric[],
	agents: RosterAgent[],
	query: FinderQuery,
	burnoutByAgent: Record<string, BurnoutRiskLevel>
): FinderResultRow[] {
	const { from, to } = dateBounds(calls);
	const matches = (v: number) =>
		query.operator === 'BELOW'
			? v < query.value
			: query.operator === 'ABOVE'
				? v > query.value
				: v >= query.value && v <= (query.value2 ?? query.value);
	const rows: FinderResultRow[] = [];
	for (const agent of agents) {
		const agentCalls = calls.filter((c) => c.agentId === agent.id);
		if (agentCalls.length < query.minCalls) continue;
		const value = aggregateMetric(agentCalls, query.metricId);
		if (value === null || !matches(value)) continue;
		rows.push({
			agentId: agent.id,
			agentName: agent.name,
			team: agent.team,
			supervisorName: agent.supervisorName,
			value,
			previousValue: aggregateMetric(
				previousCalls.filter((c) => c.agentId === agent.id),
				query.metricId
			),
			callsEvaluated: agentCalls.length,
			sparkline: sparklineFor(agentCalls, query.metricId, from, to),
			burnoutLevel: burnoutByAgent[agent.id] ?? BurnoutRiskLevel.LOW,
		});
	}
	return rows.sort((a, b) =>
		query.operator === 'ABOVE' ? b.value - a.value : a.value - b.value
	);
}

/** Human summary of a query for toasts, presets and cohort names — e.g. "QA score below 75%". Metric label passed in (i18n). */
export const describeFinderQuery = (
	query: FinderQuery,
	metricLabel: string,
	operatorLabel: string
): string =>
	query.operator === 'BETWEEN'
		? `${metricLabel} ${operatorLabel} ${formatMetricValue(query.metricId, query.value)} – ${formatMetricValue(query.metricId, query.value2 ?? query.value)}`
		: `${metricLabel} ${operatorLabel} ${formatMetricValue(query.metricId, query.value)}`;

// ---------- Business ----------
export function aggregateBusiness(
	calls: TeamCallMetric[],
	previousCalls: TeamCallMetric[],
	granularity: Granularity
): BusinessSummary {
	const g = granularity === 'per-call' ? 'daily' : granularity;
	const offered = calls.filter((c) => c.offeredProduct !== null);
	const lost = offered.filter((c) => !c.converted);
	const rateOf = (list: TeamCallMetric[]) =>
		pct(list.filter((c) => c.converted).length, list.length);

	const signals = SIGNAL_KINDS.map((kind) => {
		const field = SIGNAL_FIELD[kind];
		const count = calls.filter((c) => c.signals[field]).length;
		const prevCount = previousCalls.filter((c) => c.signals[field]).length;
		return {
			kind,
			count,
			share: pct(count, calls.length),
			previousShare: previousCalls.length
				? pct(prevCount, previousCalls.length)
				: null,
		};
	});

	const byPeriod = new Map<string, TeamCallMetric[]>();
	for (const c of offered) {
		const k = periodKeyOf(c.date, g);
		byPeriod.set(k, [...(byPeriod.get(k) ?? []), c]);
	}
	const conversionTrend = [...byPeriod.keys()].sort().map((period) => {
		const list = byPeriod.get(period)!;
		const converted = list.filter((c) => c.converted).length;
		return {
			period,
			converted,
			offered: list.length,
			rate: pct(converted, list.length),
		};
	});

	const reasonCounts = new Map<NonConversionReasonKey, number>();
	for (const c of lost)
		if (c.nonConversionReason)
			reasonCounts.set(
				c.nonConversionReason,
				(reasonCounts.get(c.nonConversionReason) ?? 0) + 1
			);
	const reasons = [...reasonCounts.entries()]
		.map(([key, count]) => ({ key, count, share: pct(count, lost.length) }))
		.sort((a, b) => b.count - a.count);

	const productMap = new Map<string, TeamCallMetric[]>();
	for (const c of offered)
		productMap.set(c.offeredProduct!, [
			...(productMap.get(c.offeredProduct!) ?? []),
			c,
		]);
	const products = [...productMap.entries()]
		.map(([product, list]) => ({
			product,
			offered: list.length,
			converted: list.filter((c) => c.converted).length,
			rate: rateOf(list),
		}))
		.sort((a, b) => b.offered - a.offered);

	const compMap = new Map<string, number>();
	for (const c of calls)
		if (c.competitorMentioned)
			compMap.set(
				c.competitorMentioned,
				(compMap.get(c.competitorMentioned) ?? 0) + 1
			);
	const competitors = [...compMap.entries()]
		.map(([name, count]) => ({ name, count, share: pct(count, calls.length) }))
		.sort((a, b) => b.count - a.count);

	let bestTimeSlot: { slot: TimeSlot; rate: number } | null = null;
	for (const slot of TIME_SLOTS) {
		const list = offered.filter((c) => c.timeSlot === slot);
		if (list.length < 5) continue;
		const rate = rateOf(list);
		if (!bestTimeSlot || rate > bestTimeSlot.rate)
			bestTimeSlot = { slot, rate };
	}

	const byAgent = [...groupByDim(calls, 'agent').entries()]
		.map(([agentId, grp]) => {
			const list = grp.calls;
			const agentOffered = list.filter((c) => c.offeredProduct !== null);
			return {
				agentId,
				agentName: grp.label,
				team: list[0].team,
				calls: list.length,
				early: pct(
					list.filter((c) => c.signals.earlyObjection).length,
					list.length
				),
				unhandled: pct(
					list.filter((c) => c.signals.unhandledObjection).length,
					list.length
				),
				competitor: pct(
					list.filter((c) => c.signals.competitorPlusCost).length,
					list.length
				),
				mistargeted: pct(
					list.filter((c) => c.signals.mistargetedOffer).length,
					list.length
				),
				conversion: agentOffered.length ? rateOf(agentOffered) : null,
			};
		})
		.sort((a, b) => b.calls - a.calls);

	return {
		signals,
		conversionTrend,
		overallRate: offered.length ? rateOf(offered) : null,
		reasons,
		products,
		competitors,
		bestTimeSlot,
		byAgent,
	};
}

// ---------- Burnout ----------
const LEVEL_ORDER: Record<BurnoutRiskLevel, number> = {
	[BurnoutRiskLevel.HIGH]: 0,
	[BurnoutRiskLevel.MEDIUM]: 1,
	[BurnoutRiskLevel.LOW]: 2,
};

/** Scoped agents whose computed burnout level is not LOW; HIGH first, then by percentage. */
export function burnoutCandidates(role: TeamRole): RosterAgent[] {
	return scopeAgents(role)
		.map((agent) => ({ agent, assessment: assessBurnout(agent.id) }))
		.filter(({ assessment }) => assessment.level !== BurnoutRiskLevel.LOW)
		.sort(
			(a, b) =>
				LEVEL_ORDER[a.assessment.level] - LEVEL_ORDER[b.assessment.level] ||
				b.assessment.percentage - a.assessment.percentage
		)
		.map(({ agent }) => agent);
}

export interface TeamBurnoutRiskEntry {
	agentId: string;
	agentName: string;
	/** MEDIUM | HIGH only — burnoutCandidates already excludes LOW. */
	level: BurnoutRiskLevel;
	percentage: number;
	trend: 'improving' | 'stable' | 'declining';
}

/** Dashboard-facing summary of burnoutCandidates: name + risk data per at-risk team member. */
export const teamBurnoutRisk = (role: TeamRole): TeamBurnoutRiskEntry[] =>
	burnoutCandidates(role).map((agent) => {
		const assessment = assessBurnout(agent.id);
		return {
			agentId: agent.id,
			agentName: agent.name,
			level: assessment.level,
			percentage: assessment.percentage,
			trend: TEAM_PROFILES[agent.id].risk.burnout.trend,
		};
	});

const daysWindow = (daysBack: number, len: number) => ({
	from: addDays(TODAY, -(daysBack + len - 1)),
	to: addDays(TODAY, -daysBack),
});
const within = (calls: TeamCallMetric[], w: { from: string; to: string }) =>
	calls.filter((c) => inRange(c, w.from, w.to));
const afterHoursShare = (calls: TeamCallMetric[]) =>
	calls.length
		? pct(calls.filter((c) => c.afterHours).length, calls.length)
		: null;
const ahtVsTeam = (
	agentCalls: TeamCallMetric[],
	teamCalls: TeamCallMetric[]
): number | null => {
	const a = mean(agentCalls.map((c) => c.handleTimeSeconds)),
		t = mean(teamCalls.map((c) => c.handleTimeSeconds));
	return a === null || t === null || t === 0
		? null
		: round1((a / t) * 100 - 100);
};
const diff = (a: number | null, b: number | null) =>
	a === null || b === null ? null : round1(a - b);
const statusOf = (
	rule: BurnoutDriverRule,
	v: number | null
): BurnoutDriverStatus => {
	if (v === null) return 'OK';
	const breached =
		rule.direction === 'ABOVE' ? v >= rule.threshold : v <= rule.threshold;
	if (breached) return 'BREACHED';
	const near =
		rule.direction === 'ABOVE'
			? v >= rule.threshold - rule.nearBand
			: v <= rule.threshold + rule.nearBand;
	return near ? 'NEAR' : 'OK';
};

/** Per call-day (oldest first): was the agent's predominant emotion that day a negative one? */
const negativeDayFlags = (calls: TeamCallMetric[]): boolean[] => {
	const byDay = new Map<string, Map<CallEmotion, number>>();
	for (const call of calls) {
		const day = dayOf(call.date);
		const counts = byDay.get(day) ?? new Map<CallEmotion, number>();
		counts.set(call.agentEmotion, (counts.get(call.agentEmotion) ?? 0) + 1);
		byDay.set(day, counts);
	}
	return [...byDay.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, counts]) => {
			const [predominant] = [...counts.entries()].sort(
				(a, b) => b[1] - a[1]
			)[0];
			return isNegativeCallEmotion(predominant);
		});
};

/** Length of the run of `true` at the end of the list. */
const trailingStreak = (flags: boolean[]): number => {
	let streak = 0;
	for (let i = flags.length - 1; i >= 0 && flags[i]; i--) streak++;
	return streak;
};

/** `calls` = all 90-day scoped calls (unfiltered); `teamCalls` = the agent's team calls (same 90 days). */
export function computeBurnoutDrivers(
	agentId: string,
	calls: TeamCallMetric[],
	teamCalls: TeamCallMetric[],
	patterns: BurnoutPattern[] = useSettingsStore.getState().burnout.patterns
): BurnoutDriver[] {
	const agentCalls = calls.filter((c) => c.agentId === agentId);
	const last7 = daysWindow(0, 7),
		prior7 = daysWindow(7, 7),
		last14 = daysWindow(0, 14),
		prior14 = daysWindow(14, 14),
		last30 = daysWindow(0, 30),
		prior30 = daysWindow(30, 30);
	const tenDaySeries = (
		w: { from: string; to: string },
		f: (sub: { from: string; to: string }) => number | null
	) =>
		[0, 1, 2].map(
			(i) =>
				f({ from: addDays(w.from, i * 10), to: addDays(w.from, i * 10 + 9) }) ??
				0
		);
	return patterns
		.filter((pattern) => pattern.enabled)
		.map((rule) => {
			let currentValue: number | null = null,
				delta: number | null = null,
				series: number[] = [];
			switch (rule.id) {
				case 'AGENT_SENTIMENT_TREND': {
					currentValue = aggregateMetric(
						within(agentCalls, last14),
						'AGENT_SENTIMENT_SCORE'
					);
					delta = diff(
						currentValue,
						aggregateMetric(
							within(agentCalls, prior14),
							'AGENT_SENTIMENT_SCORE'
						)
					);
					series = sparklineFor(
						agentCalls,
						'AGENT_SENTIMENT_SCORE',
						prior14.from,
						last14.to,
						8
					);
					break;
				}
				case 'NEGATIVE_EMOTION_7D': {
					currentValue = aggregateMetric(
						within(agentCalls, last7),
						'NEGATIVE_EMOTION_CALL_SHARE'
					);
					delta = diff(
						currentValue,
						aggregateMetric(
							within(agentCalls, prior7),
							'NEGATIVE_EMOTION_CALL_SHARE'
						)
					);
					series = sparklineFor(
						agentCalls,
						'NEGATIVE_EMOTION_CALL_SHARE',
						prior14.from,
						last14.to,
						8
					);
					break;
				}
				case 'QA_TREND_14D': {
					currentValue = aggregateMetric(
						within(agentCalls, last14),
						'QA_OVERALL_SCORE'
					);
					delta = diff(
						currentValue,
						aggregateMetric(within(agentCalls, prior14), 'QA_OVERALL_SCORE')
					);
					series = sparklineFor(
						agentCalls,
						'QA_OVERALL_SCORE',
						prior14.from,
						last14.to,
						8
					);
					break;
				}
				case 'AFTER_HOURS_30D': {
					currentValue = afterHoursShare(within(agentCalls, last30));
					delta = diff(
						currentValue,
						afterHoursShare(within(agentCalls, prior30))
					);
					series = [prior30, last30].flatMap((w) =>
						tenDaySeries(w, (sub) => afterHoursShare(within(agentCalls, sub)))
					);
					break;
				}
				case 'NEGATIVE_EMOTION_STREAK': {
					const flags = negativeDayFlags(within(agentCalls, last30));
					currentValue = flags.length ? trailingStreak(flags) : null;
					series = flags.slice(-10).map(toBool);
					break;
				}
				case 'AHT_VS_TEAM_30D': {
					currentValue = ahtVsTeam(
						within(agentCalls, last30),
						within(teamCalls, last30)
					);
					delta = diff(
						currentValue,
						ahtVsTeam(within(agentCalls, prior30), within(teamCalls, prior30))
					);
					series = [prior30, last30].flatMap((w) =>
						tenDaySeries(w, (sub) =>
							ahtVsTeam(within(agentCalls, sub), within(teamCalls, sub))
						)
					);
					break;
				}
			}
			const compared = rule.evaluate === 'DELTA' ? delta : currentValue;
			return {
				id: rule.id,
				metricId: rule.metricId,
				currentValue,
				conditionLabelKey: rule.conditionLabelKey,
				threshold: rule.threshold,
				status: statusOf(rule, compared),
				delta,
				series,
			};
		});
}

export const formatDriverValue = (
	d: Pick<BurnoutDriver, 'metricId'>,
	value: number | null
): string =>
	value === null
		? '—'
		: d.metricId === 'AFTER_HOURS_SHARE'
			? `${Math.round(value)}%`
			: d.metricId === 'AHT_VS_TEAM'
				? `${value > 0 ? '+' : ''}${Math.round(value)}%`
				: formatMetricValue(d.metricId, value);

export interface BurnoutAssessment {
	level: BurnoutRiskLevel;
	/** 5-95; breached patterns count fully, near ones half. */
	percentage: number;
	breached: number;
	near: number;
	enabledCount: number;
	drivers: BurnoutDriver[];
}

/** Per settings object; entries also remember the negative-emotion list they were computed with. */
const assessmentCache = new WeakMap<
	BurnoutSettings,
	Map<string, { emotions: CallEmotion[]; assessment: BurnoutAssessment }>
>();

/**
 * Burnout level of one agent under the QA Manager's Settings: how many of the enabled
 * patterns are breached over the agent's trailing windows, mapped to Low/Medium/High.
 */
export function assessBurnout(
	agentId: string,
	settings: BurnoutSettings = useSettingsStore.getState().burnout
): BurnoutAssessment {
	let cache = assessmentCache.get(settings);
	if (!cache) {
		cache = new Map();
		assessmentCache.set(settings, cache);
	}
	const emotions =
		useSettingsStore.getState().thresholds.sentiment.negativeEmotions;
	const cached = cache.get(agentId);
	if (cached && cached.emotions === emotions) return cached.assessment;

	const team = TEAM_AGENTS.find((a) => a.id === agentId)?.team;
	const teamCalls = TEAM_CALLS.filter((c) => c.team === team);
	const drivers = computeBurnoutDrivers(
		agentId,
		TEAM_CALLS,
		teamCalls,
		settings.patterns
	);
	const breached = drivers.filter((d) => d.status === 'BREACHED').length;
	const near = drivers.filter((d) => d.status === 'NEAR').length;
	const enabledCount = drivers.length;
	const assessment: BurnoutAssessment = {
		level: burnoutLevelFor(breached, settings.level),
		percentage: enabledCount
			? Math.min(
					95,
					Math.max(
						5,
						Math.round((100 * (breached + 0.5 * near)) / enabledCount)
					)
				)
			: 5,
		breached,
		near,
		enabledCount,
		drivers,
	};
	cache.set(agentId, { emotions, assessment });
	return assessment;
}

export function computeWorkload(
	agentId: string,
	calls: TeamCallMetric[],
	teamCalls: TeamCallMetric[]
): BurnoutWorkload {
	const last30 = daysWindow(0, 30);
	const agentCalls = within(
		calls.filter((c) => c.agentId === agentId),
		last30
	);
	const team30 = within(teamCalls, last30);
	const agentDays = new Set(agentCalls.map((c) => dayOf(c.date)));
	const teamAgentDays = new Set(
		team30.map((c) => `${c.agentId}|${dayOf(c.date)}`)
	);
	let consecutiveDays = 0;
	for (let d = TODAY; d >= last30.from; d = addDays(d, -1)) {
		if (new Date(`${d}T00:00:00Z`).getUTCDay() === 0) continue;
		if (!agentDays.has(d)) break;
		consecutiveDays += 1;
	}
	return {
		callsPerDay: agentDays.size
			? round1(agentCalls.length / agentDays.size)
			: 0,
		teamCallsPerDay: teamAgentDays.size
			? round1(team30.length / teamAgentDays.size)
			: 0,
		avgHandleTimeSeconds: Math.round(
			mean(agentCalls.map((c) => c.handleTimeSeconds)) ?? 0
		),
		teamAvgHandleTimeSeconds: Math.round(
			mean(team30.map((c) => c.handleTimeSeconds)) ?? 0
		),
		afterHoursShare: afterHoursShare(agentCalls) ?? 0,
		consecutiveDays,
		negativeEmotionShare:
			aggregateMetric(agentCalls, 'NEGATIVE_EMOTION_CALL_SHARE') ?? 0,
		recoveryRate: pct(
			agentCalls.filter((c) => c.sentimentRecovered).length,
			agentCalls.length
		),
	};
}

export function buildActionHistory(
	actions: BurnoutAction[],
	sessions: CoachingSessionRecord[],
	assignments: LmsAssignment[],
	since: string,
	labels: {
		coaching: string;
		lms: string;
		contentTitle: (contentId: string) => string;
	}
): HistoryEntry[] {
	const own: HistoryEntry[] = actions.map((a) => ({
		id: a.id,
		kind: a.kind,
		title: a.title,
		detail: a.detail,
		by: a.createdBy,
		at: a.createdAt,
		dueAt: a.dueAt,
		status: a.status,
		source: 'analytics',
	}));
	const coaching: HistoryEntry[] = sessions
		.filter((s) => s.date >= since)
		.map((s) => ({
			id: s.id,
			kind: 'SCHEDULE_COACHING',
			title: labels.coaching,
			detail: s.topic,
			by: s.coachName,
			at: s.date,
			dueAt: null,
			status: s.status === 'COMPLETED' ? 'DONE' : 'PLANNED',
			source: 'coaching',
		}));
	const lms: HistoryEntry[] = assignments
		.filter((a) => a.assignedAt >= since)
		.map((a) => ({
			id: a.id,
			kind: 'ASSIGN_LMS',
			title: labels.lms,
			detail: labels.contentTitle(a.contentId),
			by: a.assignedBy,
			at: a.assignedAt,
			dueAt: a.dueDate,
			status: a.status === 'COMPLETED' ? 'DONE' : 'IN_PROGRESS',
			source: 'lms',
		}));
	return [...own, ...coaching, ...lms].sort((a, b) => b.at.localeCompare(a.at));
}

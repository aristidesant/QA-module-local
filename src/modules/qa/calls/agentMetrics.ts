import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import type {
	CallEmotion,
	TeamCallMetric,
	TeamCallSignals,
} from '~/modules/qa/analytics/types';
import { scopeAgents } from '~/modules/qa/analytics/helpers';
import type {
	BusinessInsight,
	ComplianceCategory,
	WeeklyMetrics,
} from '~/modules/qa/dashboard/mockData';
import {
	dashboardLineOfBusinessFor,
	type DashboardLineOfBusiness,
} from '~/modules/qa/dashboard/lineOfBusiness';
import type { TeamRole } from '~/modules/qa/team/types';
import { isNegativeEmotion } from './issues';
import { useSettingsStore } from '~/stores/qa/settingsStore';
import { bandsFor, complianceStatusFor } from '~/modules/qa/settings/helpers';
import type { ThresholdSettings } from '~/modules/qa/settings/types';

/** Window the agent dashboard cards summarise — agents see weekly data. My Calls' `7d` period matches it. */
export const AGENT_DASHBOARD_DAYS = 7;

export type QaCategoryKey = 'ecn' | 'enc' | 'ecc' | 'ecuf';
export type ComplianceAreaName = ComplianceCategory['name'];

export type MetricTrend = 'up' | 'down' | 'stable';

export interface DashboardMetricTrend {
	direction: MetricTrend;
	/** Percentage-point change vs. the prior period, rounded, signed. Sentiment is expressed on its 0-100 equivalent (score-1)/4*100, so every metric here shares one percentage scale. */
	deltaPct: number;
}

export interface DashboardMetricTrends {
	effectiveContacts: DashboardMetricTrend;
	qa: DashboardMetricTrend;
	compliance: DashboardMetricTrend;
	agentSentiment: DashboardMetricTrend;
	customerSentiment: DashboardMetricTrend;
}

export interface AgentDashboardMetrics {
	calls: number;
	/** Calls where the intended contact was actually reached and engaged. */
	effectiveContacts: number;
	/** Calls that didn't connect with the intended contact (no answer, voicemail, wrong number…). */
	nonEffectiveContacts: number;
	/** `total` = average qaScore; each category = % of calls WITHOUT that error type. */
	qa: { total: number; ecn: number; enc: number; ecc: number; ecuf: number };
	autoFails: number;
	/** Calls with ≥ 1 error of the type → what the drill-down lists. */
	qaIssueCounts: Record<QaCategoryKey, number>;
	/** `score` = % of calls whose area score ≥ COMPLIANCE_TARGET. */
	complianceCategories: ComplianceCategory[];
	complianceIssueCounts: Record<ComplianceAreaName, number>;
	sentiment: {
		agentAvg: number;
		customerAvg: number;
		agentEmotion: CallEmotion | null;
		customerEmotion: CallEmotion | null;
		agentNegativeCount: number;
		customerNegativeCount: number;
	};
	/** Calls where a product was offered, and how many of those ended in a sale. */
	sales: { offered: number; sold: number };
	/**
	 * This period's trend vs. the immediately-preceding period of equal length.
	 * Only set by `buildAgentDashboardMetrics`/`buildTeamDashboardMetrics`
	 * (which have both windows) — `aggregateDashboardMetrics` alone, given a
	 * single window, cannot compute it.
	 */
	trends?: DashboardMetricTrends;
}

const COMPLIANCE_AREAS: {
	name: ComplianceAreaName;
	key: keyof TeamCallMetric['complianceByArea'];
	items: string[];
}[] = [
	{
		name: 'Security',
		key: 'security',
		items: ['Protocol adherence', 'Data protection'],
	},
	{
		name: 'Regulatory',
		key: 'regulatory',
		items: ['Disclosure compliance', 'Record-keeping'],
	},
	{
		name: 'Legal',
		key: 'legal',
		items: ['Consent verification', 'Terms acknowledgment'],
	},
];

const pct = (part: number, total: number) =>
	total === 0 ? 100 : Math.round((part / total) * 100);
const avg1 = (values: number[]) =>
	values.length === 0
		? 0
		: Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;

/** Most frequent value; null when there are no calls. */
export const predominantEmotion = (
	emotions: CallEmotion[]
): CallEmotion | null => {
	if (emotions.length === 0) return null;
	const counts = new Map<CallEmotion, number>();
	for (const e of emotions) counts.set(e, (counts.get(e) ?? 0) + 1);
	return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
};

/**
 * The agent's calls inside the `days`-day window ending `endOffsetDays` days
 * before TODAY (inclusive). `endOffsetDays = 0` (default) is the current
 * window; pass `days` as `endOffsetDays` to get the equal-length window that
 * immediately precedes it (used for period-over-period trend comparisons).
 */
export const agentCallsInWindow = (
	agentId: string,
	days: number,
	endOffsetDays = 0
): TeamCallMetric[] => {
	const to = addDays(TODAY, -endOffsetDays);
	const from = addDays(to, -(days - 1));
	return TEAM_CALLS.filter(
		(c) =>
			c.agentId === agentId &&
			c.date.slice(0, 10) >= from &&
			c.date.slice(0, 10) <= to
	);
};

/**
 * Every call of the scoped role's roster inside the `days`-day window ending
 * `endOffsetDays` days before TODAY (inclusive), optionally narrowed to one
 * dashboard Line of Business. See `agentCallsInWindow` for `endOffsetDays`.
 */
export const teamCallsInWindow = (
	role: TeamRole,
	days: number,
	lineOfBusiness?: DashboardLineOfBusiness | null,
	endOffsetDays = 0
): TeamCallMetric[] => {
	const agentIds = new Set(scopeAgents(role).map((a) => a.id));
	const to = addDays(TODAY, -endOffsetDays);
	const from = addDays(to, -(days - 1));
	return TEAM_CALLS.filter(
		(c) =>
			agentIds.has(c.agentId) &&
			c.date.slice(0, 10) >= from &&
			c.date.slice(0, 10) <= to &&
			(!lineOfBusiness ||
				dashboardLineOfBusinessFor(c.campaignId) === lineOfBusiness)
	);
};

/**
 * QA / Compliance / Sentiment / Operational breakdown for any set of calls —
 * shared by the agent's own dashboard and the team-scoped supervisor/QA
 * manager dashboards, so both read the same category thresholds.
 */
export const aggregateDashboardMetrics = (
	calls: TeamCallMetric[],
	thresholds: ThresholdSettings = useSettingsStore.getState().thresholds
): AgentDashboardMetrics => {
	const n = calls.length;
	const qaKeys: QaCategoryKey[] = ['ecn', 'enc', 'ecc', 'ecuf'];
	const qaIssueCounts = Object.fromEntries(
		qaKeys.map((k) => [k, calls.filter((c) => c.qaScores[k] > 0).length])
	) as Record<QaCategoryKey, number>;

	const complianceIssueCounts = Object.fromEntries(
		COMPLIANCE_AREAS.map((a) => [
			a.name,
			calls.filter(
				(c) =>
					c.complianceByArea[a.key].score <
					thresholds.compliance.areaTargetPerCall
			).length,
		])
	) as Record<ComplianceAreaName, number>;

	const offered = calls.filter((c) => c.offeredProduct !== null);

	return {
		calls: n,
		effectiveContacts: calls.filter((c) => c.contactOutcome === 'EFFECTIVE')
			.length,
		nonEffectiveContacts: calls.filter(
			(c) => c.contactOutcome === 'NON_EFFECTIVE'
		).length,
		qa: {
			total: Math.round(avg1(calls.map((c) => c.qaScore))),
			ecn: pct(n - qaIssueCounts.ecn, n),
			enc: pct(n - qaIssueCounts.enc, n),
			ecc: pct(n - qaIssueCounts.ecc, n),
			ecuf: pct(n - qaIssueCounts.ecuf, n),
		},
		autoFails: calls.filter((c) => c.autoFail).length,
		qaIssueCounts,
		complianceCategories: COMPLIANCE_AREAS.map((a) => {
			const score = pct(n - complianceIssueCounts[a.name], n);
			return {
				name: a.name,
				items: a.items,
				status: complianceStatusFor(
					score,
					bandsFor(thresholds, 'compliance', a.name)
				),
				score,
			};
		}),
		complianceIssueCounts,
		sentiment: {
			agentAvg: avg1(calls.map((c) => c.agentSentiment)),
			customerAvg: avg1(calls.map((c) => c.customerSentiment)),
			agentEmotion: predominantEmotion(calls.map((c) => c.agentEmotion)),
			customerEmotion: predominantEmotion(
				calls.map((c) => c.predominantEmotion)
			),
			agentNegativeCount: calls.filter((c) =>
				isNegativeEmotion(c.agentEmotion, thresholds.sentiment.negativeEmotions)
			).length,
			customerNegativeCount: calls.filter((c) =>
				isNegativeEmotion(
					c.predominantEmotion,
					thresholds.sentiment.negativeEmotions
				)
			).length,
		},
		sales: {
			offered: offered.length,
			sold: offered.filter((c) => c.converted).length,
		},
	};
};

/** `current`/`previous` differ by less than `epsilon` → 'stable'; otherwise the sign of the (rounded) delta. */
const metricTrend = (
	current: number,
	previous: number,
	epsilon: number
): DashboardMetricTrend => {
	const delta = current - previous;
	const direction: MetricTrend =
		Math.abs(delta) < epsilon ? 'stable' : delta > 0 ? 'up' : 'down';
	return { direction, deltaPct: Math.round(delta) };
};

const effectivePct = (m: AgentDashboardMetrics) =>
	m.calls === 0 ? 0 : Math.round((m.effectiveContacts / m.calls) * 100);

const complianceAverage = (categories: ComplianceCategory[]) =>
	categories.length
		? Math.round(
				categories.reduce((sum, c) => sum + c.score, 0) / categories.length
			)
		: 0;

/** The 1-5 sentiment scale expressed as its 0-100 equivalent, so its trend shares the same percentage-point scale as every other card. */
const sentimentPct = (score: number) => Math.round(((score - 1) / 4) * 100);

const ALL_STABLE: DashboardMetricTrends = {
	effectiveContacts: { direction: 'stable', deltaPct: 0 },
	qa: { direction: 'stable', deltaPct: 0 },
	compliance: { direction: 'stable', deltaPct: 0 },
	agentSentiment: { direction: 'stable', deltaPct: 0 },
	customerSentiment: { direction: 'stable', deltaPct: 0 },
};

/**
 * Compares two windows' worth of already-aggregated metrics into the per-card
 * trend each Performance Score card shows. An empty `previous` window (e.g.
 * the 6-months period, whose prior window falls outside TEAM_CALLS' 180-day
 * generated range) has no real baseline — reads as 'stable'/0%, not a false
 * 'up' against a zeroed comparison.
 */
const buildTrends = (
	current: AgentDashboardMetrics,
	previous: AgentDashboardMetrics
): DashboardMetricTrends => {
	if (previous.calls === 0) return ALL_STABLE;
	return {
		effectiveContacts: metricTrend(
			effectivePct(current),
			effectivePct(previous),
			1
		),
		qa: metricTrend(current.qa.total, previous.qa.total, 1),
		compliance: metricTrend(
			complianceAverage(current.complianceCategories),
			complianceAverage(previous.complianceCategories),
			1
		),
		agentSentiment: metricTrend(
			sentimentPct(current.sentiment.agentAvg),
			sentimentPct(previous.sentiment.agentAvg),
			1
		),
		customerSentiment: metricTrend(
			sentimentPct(current.sentiment.customerAvg),
			sentimentPct(previous.sentiment.customerAvg),
			1
		),
	};
};

export const buildAgentDashboardMetrics = (
	agentId: string,
	days = AGENT_DASHBOARD_DAYS,
	thresholds?: ThresholdSettings
): AgentDashboardMetrics => {
	const current = aggregateDashboardMetrics(
		agentCallsInWindow(agentId, days),
		thresholds
	);
	const previous = aggregateDashboardMetrics(
		agentCallsInWindow(agentId, days, days),
		thresholds
	);
	return { ...current, trends: buildTrends(current, previous) };
};

/** Team-scoped version of `buildAgentDashboardMetrics`: Team 1 for a supervisor, every team for QA Manager. */
export const buildTeamDashboardMetrics = (
	role: TeamRole,
	days: number,
	lineOfBusiness?: DashboardLineOfBusiness | null,
	thresholds?: ThresholdSettings
): AgentDashboardMetrics => {
	const current = aggregateDashboardMetrics(
		teamCallsInWindow(role, days, lineOfBusiness),
		thresholds
	);
	const previous = aggregateDashboardMetrics(
		teamCallsInWindow(role, days, lineOfBusiness, days),
		thresholds
	);
	return { ...current, trends: buildTrends(current, previous) };
};

export interface BusinessInsightsMetrics {
	insights: BusinessInsight[];
	outcome: WeeklyMetrics['businessOutcome'];
	/** `outcome.conversionRate`'s trend vs. the immediately-preceding period of equal length. */
	conversionTrend: DashboardMetricTrend;
}

const BUSINESS_SIGNAL_TYPES: {
	field: keyof TeamCallSignals;
	type: BusinessInsight['type'];
}[] = [
	{ field: 'earlyObjection', type: 'Early Objection' },
	{ field: 'unhandledObjection', type: 'Unhandled objection' },
	{ field: 'competitorPlusCost', type: 'Competitor plus cost' },
	{ field: 'mistargetedOffer', type: 'Mis-targeted offer' },
];

/** Tooltip copy per signal, split by scope so Supervisor ("team") and QA Manager ("platform") keep their distinct voice. */
const BUSINESS_SIGNAL_DESCRIPTION: Record<
	BusinessInsight['type'],
	Record<'team' | 'platform', string>
> = {
	'Early Objection': {
		team: 'Team is proactively addressing objections',
		platform: 'Platform-wide early objection handling',
	},
	'Unhandled objection': {
		team: 'Some customer concerns requiring escalation',
		platform: 'Increasing unhandled objections across teams',
	},
	'Competitor plus cost': {
		team: 'Competitive pressure affecting the team',
		platform: 'Competitive pressure impacting multiple teams',
	},
	'Mis-targeted offer': {
		team: 'Offer targeting accuracy for the team',
		platform: 'Offer targeting accuracy across the platform',
	},
};

/** Share of `calls` (0-100); 0 on an empty window (a signal "rate" reading 100% on 0 calls would be misleading). */
const share = (part: number, total: number) =>
	total === 0 ? 0 : Math.round((part / total) * 100);

/** < 1pt of share change reads as noise, not a trend. */
const trendOf = (
	currentShare: number,
	previousShare: number | null
): BusinessInsight['trend'] => {
	if (previousShare === null) return 'stable';
	const delta = currentShare - previousShare;
	return Math.abs(delta) < 1 ? 'stable' : delta > 0 ? 'up' : 'down';
};

/**
 * Business Insights card data for any set of calls: the 4 signal shares (with
 * trend vs. `previousCalls`, an equal-length prior window) plus the
 * conversion outcome. `scope` only selects tooltip wording.
 */
export const aggregateBusinessInsights = (
	calls: TeamCallMetric[],
	previousCalls: TeamCallMetric[],
	scope: 'team' | 'platform'
): BusinessInsightsMetrics => {
	const insights: BusinessInsight[] = BUSINESS_SIGNAL_TYPES.map(
		({ field, type }) => {
			const count = calls.filter((c) => c.signals[field]).length;
			const prevCount = previousCalls.filter((c) => c.signals[field]).length;
			const percentage = share(count, calls.length);
			return {
				type,
				count,
				percentage,
				trend: trendOf(
					percentage,
					previousCalls.length ? share(prevCount, previousCalls.length) : null
				),
				description: BUSINESS_SIGNAL_DESCRIPTION[type][scope],
			};
		}
	);

	const offered = calls.filter((c) => c.offeredProduct !== null);
	const converted = offered.filter((c) => c.converted);
	const conversionRate = share(converted.length, offered.length);

	const prevOffered = previousCalls.filter((c) => c.offeredProduct !== null);
	const prevConverted = prevOffered.filter((c) => c.converted);
	// No previous offers → compare the rate against itself (delta 0, 'stable'), never a false reading off a zeroed baseline.
	const previousConversionRate = prevOffered.length
		? share(prevConverted.length, prevOffered.length)
		: conversionRate;

	return {
		insights,
		outcome: {
			offersPresented: offered.length,
			converted: converted.length,
			conversionRate,
		},
		conversionTrend: metricTrend(conversionRate, previousConversionRate, 1),
	};
};

/** Team-scoped Business Insights: mirrors buildTeamDashboardMetrics's signature exactly. */
export const buildTeamBusinessInsights = (
	role: TeamRole,
	days: number,
	lineOfBusiness?: DashboardLineOfBusiness | null
): BusinessInsightsMetrics =>
	aggregateBusinessInsights(
		teamCallsInWindow(role, days, lineOfBusiness),
		teamCallsInWindow(role, days, lineOfBusiness, days),
		role === 'supervisor' ? 'team' : 'platform'
	);

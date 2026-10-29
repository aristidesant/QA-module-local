import type { SurveyThemeKey, SurveyTheme } from '~/modules/qa/surveys/types';
import type { CallVoiceSignals } from '~/modules/qa/burnout/types';
import type {
	CallSentimentCause,
	SentimentCauseSegmentKey,
} from '~/modules/qa/sentimentCauses/types';
import type { CallMetric } from '~/modules/qa/dashboard/mockData';
import type { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import type {
	EvaluationArea,
	MetricUnit,
	RuleCondition,
	TriggerMetricId,
} from '~/models/qa';
import type { AgentType } from '~/models/qa/agents';
import type {
	DisputeEvaluationType,
	DisputeStatus,
} from '~/models/qa/disputeCases';
import type {
	AgentStatus,
	BusinessSignalType,
	NonConversionReasonKey,
	Shift,
} from '~/modules/qa/team/types';

export type TeamAnalyticsView =
	| 'overview'
	| 'operational'
	| 'qa'
	| 'compliance'
	| 'business'
	| 'sentiment'
	| 'surveys'
	| 'humanVsAi'
	| 'burnout'
	| 'disputes'
	| 'finder';
/** Views whose segmentation table runs on VIEW_METRICS (the rest have their own data flows). */
export type MetricView = Exclude<
	TeamAnalyticsView,
	'overview' | 'finder' | 'burnout' | 'humanVsAi'
>;

export type GroupByDimension =
	| 'none'
	| 'team'
	| 'supervisor'
	| 'agent'
	| 'agentType'
	| 'campaign'
	| 'lineOfBusiness'
	| 'campaignType'
	| 'callDirection'
	| 'shift'
	| 'tenure'
	| 'timeOfDay'
	| 'weekday'
	| 'sentimentCause';

export type CallDirection = 'INBOUND' | 'OUTBOUND';
export type CampaignType = 'INBOUND' | 'OUTBOUND' | 'BLENDED';
export type TenureBand = 'lt6m' | '6to12m' | '1to2y' | 'gt2y';
export type TimeSlot = '08-10' | '10-12' | '12-14' | '14-16' | '16-18';
export type QuickRange = '7d' | '30d' | '90d' | '12m' | 'custom';
export type Granularity = 'per-call' | 'daily' | 'weekly' | 'monthly';
/** The 8 emotions of CallMetric (NOT the 13-value Emotion type of emotion-sentiment). */
export type CallEmotion = CallMetric['predominantEmotion'];
/** Whether the customer was actually reached and the conversation completed. */
export type ContactOutcome = 'EFFECTIVE' | 'NON_EFFECTIVE';
export type BusinessSignalKind = Exclude<BusinessSignalType, 'BEST_TIME_FRAME'>;

export interface TeamCallSignals {
	earlyObjection: boolean;
	unhandledObjection: boolean;
	competitorPlusCost: boolean;
	mistargetedOffer: boolean;
}

/** The customer's answer to the post-call survey, when they gave one. `score` is 0-10 for NPS and 1-5 for CSAT. */
export interface CallSurvey {
	type: 'NPS' | 'CSAT';
	score: number;
	verbatim: string | null;
	/** What the comment is about; null when there is no comment. */
	theme: SurveyTheme | null;
}

/**
 * One evaluated call with roster context. `qaScores` are ERROR COUNTS (as in AGENT_CALL_METRICS,
 * summed by aggregateMetricsByDateRange); `qaScore` is the 0-100 QA score of the call.
 */
export interface TeamCallMetric extends CallMetric {
	agentId: string;
	agentName: string;
	agentStatus: AgentStatus;
	supervisorId: string;
	supervisorName: string;
	team: string;
	lineOfBusiness: string;
	campaignType: CampaignType;
	direction: CallDirection;
	shift: Shift;
	tenureBand: TenureBand;
	hour: number; // 0-23 UTC
	weekday: number; // 0 = Sunday … 6 = Saturday
	timeSlot: TimeSlot;
	handleTimeSeconds: number;
	afterHours: boolean; // hour >= 18
	qaScore: number; // 0-100
	autoFail: boolean;
	signals: TeamCallSignals;
	offeredProduct: string | null;
	converted: boolean;
	nonConversionReason: NonConversionReasonKey | null;
	competitorMentioned: string | null;
	sentimentRecovered: boolean;
	/** Predominant emotion of the AGENT on the call (`predominantEmotion` is the customer's). */
	agentEmotion: CallEmotion;
	contactOutcome: ContactOutcome;
	agentType: AgentType;
	holdTimeSeconds: number;
	wrapUpSeconds: number;
	transferred: boolean;
	/** Only meaningful when contactOutcome === 'EFFECTIVE'. */
	firstContactResolved: boolean;
	/** What the voice analysis reads from the agent's side of the call. */
	voice: CallVoiceSignals;
	/** Root cause of the customer's sentiment drop; null when sentiment never dropped. Evidence is null here (no transcript). */
	sentimentCause: CallSentimentCause | null;
	/** Survey response of the customer; null when none was given. Only effective contacts can answer. */
	survey: CallSurvey | null;
}

export interface ScoreRangeFilter {
	metricId: AnalyticsMetricId | null;
	min: number | null;
	max: number | null;
}

export interface TeamAnalyticsFilters {
	from: string; // 'YYYY-MM-DD' inclusive
	to: string; // 'YYYY-MM-DD' inclusive
	quickRange: QuickRange;
	granularity: Granularity;
	compareWithPrevious: boolean;
	supervisorIds: string[];
	agentIds: string[];
	campaignIds: string[];
	linesOfBusiness: string[];
	campaignTypes: CampaignType[];
	directions: CallDirection[];
	shifts: Shift[];
	statuses: AgentStatus[];
	tenureBands: TenureBand[];
	timeSlots: TimeSlot[];
	weekdays: number[];
	emotions: CallEmotion[];
	/** Primary cause keys, or 'none' for calls without a drop. */
	sentimentCauses: SentimentCauseSegmentKey[];
	/** Survey comment themes (a root cause or a strength); calls whose comment has another theme, or none, are left out. */
	surveyThemes: SurveyThemeKey[];
	agentTypes: AgentType[];
	autoFailOnly: boolean;
	recoveredOnly: boolean;
	offeredOnly: boolean;
	convertedOnly: boolean;
	scoreRange: ScoreRangeFilter;
	/** Minimum calls for an agent row to appear in per-agent tables. */
	minCalls: number;
}

export type FilterChipKey =
	| 'period'
	| 'granularity'
	| 'scoreRange'
	| 'minCalls'
	| 'supervisorIds'
	| 'agentIds'
	| 'campaignIds'
	| 'linesOfBusiness'
	| 'campaignTypes'
	| 'directions'
	| 'shifts'
	| 'statuses'
	| 'tenureBands'
	| 'timeSlots'
	| 'weekdays'
	| 'emotions'
	| 'sentimentCauses'
	| 'surveyThemes'
	| 'agentTypes'
	| 'autoFailOnly'
	| 'recoveredOnly'
	| 'offeredOnly'
	| 'convertedOnly';

export interface FilterChip {
	key: FilterChipKey;
	/** raw ids/values; the component resolves labels */
	values: string[];
	remove: (filters: TeamAnalyticsFilters) => TeamAnalyticsFilters;
}

export interface AnalyticsPreset {
	id: string;
	name: string;
	builtIn: boolean;
	view: TeamAnalyticsView;
	groupBy: GroupByDimension;
	filters: TeamAnalyticsFilters;
}

export interface DrillCrumb {
	dimension: GroupByDimension;
	key: string;
	label: string;
}
export interface DrillState {
	baseFilters: TeamAnalyticsFilters;
	baseGroupBy: GroupByDimension;
	path: DrillCrumb[];
}

// ---------- Finder ----------
export type FinderOperator = 'BELOW' | 'ABOVE' | 'BETWEEN';

export interface FinderQuery {
	metricId: AnalyticsMetricId;
	operator: FinderOperator;
	value: number;
	value2: number | null; // BETWEEN upper bound
	minCalls: number;
}

export interface FinderPreset {
	id: string;
	name: string;
	builtIn: boolean;
	query: FinderQuery;
}

export interface FinderResultRow {
	agentId: string;
	agentName: string;
	team: string;
	supervisorName: string;
	value: number;
	previousValue: number | null;
	callsEvaluated: number;
	sparkline: number[];
	burnoutLevel: BurnoutRiskLevel;
}

// ---------- Segments ----------
export type SegmentMetricId =
	| AnalyticsOnlyMetricId
	| Extract<
			TriggerMetricId,
			| 'QA_OVERALL_SCORE'
			| 'QA_ECN_COUNT'
			| 'QA_ENC_COUNT'
			| 'QA_ECC_COUNT'
			| 'QA_ECUF_COUNT'
			| 'QA_AUTO_FAIL_COUNT'
			| 'CUSTOMER_SENTIMENT_SCORE'
			| 'AGENT_SENTIMENT_SCORE'
			| 'POSITIVE_EMOTION_CALL_SHARE'
			| 'NEGATIVE_EMOTION_CALL_SHARE'
			| 'SENTIMENT_RECOVERY_COUNT'
			| 'COMPLIANCE_OVERALL_SCORE'
			| 'COMPLIANCE_SECURITY_SCORE'
			| 'COMPLIANCE_REGULATORY_SCORE'
			| 'COMPLIANCE_LEGAL_SCORE'
			| 'COMPLIANCE_VIOLATION_COUNT'
			| 'BI_NON_CONVERSION_RATE'
			| 'BI_EARLY_OBJECTION_RATE'
			| 'BI_UNHANDLED_OBJECTION_RATE'
			| 'BI_COMPETITOR_PLUS_COST_RATE'
			| 'BI_MISTARGETED_OFFER_RATE'
	  >;

export interface SegmentRow {
	key: string;
	label: string;
	calls: number;
	metrics: Partial<Record<SegmentMetricId, number | null>>;
	previous: Partial<Record<SegmentMetricId, number | null>>;
	sparkline: number[];
}

export interface SegmentSeriesPoint {
	period: string;
	[segmentKey: string]: number | string | null;
}

export interface ComparisonSeriesPoint {
	period: string;
	current: number | null;
	previous: number | null;
}

export interface TeamKpis {
	qaScore: number | null;
	compliance: number | null;
	customerSentiment: number | null;
	conversionRate: number | null;
	calls: number;
}

// ---------- Business view ----------
export interface BusinessSummary {
	signals: {
		kind: BusinessSignalKind;
		count: number;
		share: number;
		previousShare: number | null;
	}[];
	conversionTrend: {
		period: string;
		converted: number;
		offered: number;
		rate: number;
	}[];
	overallRate: number | null;
	reasons: { key: NonConversionReasonKey; count: number; share: number }[];
	products: {
		product: string;
		offered: number;
		converted: number;
		rate: number;
	}[];
	competitors: { name: string; count: number; share: number }[];
	bestTimeSlot: { slot: TimeSlot; rate: number } | null;
	byAgent: SignalsByAgentRow[];
}
export interface SignalsByAgentRow {
	agentId: string;
	agentName: string;
	team: string;
	calls: number;
	early: number;
	unhandled: number;
	competitor: number;
	mistargeted: number;
	conversion: number | null;
}

// ---------- Burnout ----------
export type BurnoutDriverStatus = 'BREACHED' | 'NEAR' | 'OK';

/** One condition of an active BURNOUT_RISK rule (Triggers & Recognition), evaluated for one agent. */
export interface BurnoutDriver {
	/** `${ruleId}:${condition.id}` */
	id: string;
	ruleId: string;
	ruleName: string;
	/** The condition as configured in the rule; label it with `describeCondition`. */
	condition: RuleCondition;
	/** THRESHOLD: metric over the window. PERCENT_CHANGE: % change vs the previous window. CONSECUTIVE: current run of calls. */
	currentValue: number | null;
	status: BurnoutDriverStatus;
}

export interface BurnoutWorkload {
	callsPerDay: number;
	teamCallsPerDay: number;
	avgHandleTimeSeconds: number;
	teamAvgHandleTimeSeconds: number;
	afterHoursShare: number;
	consecutiveDays: number;
	negativeEmotionShare: number;
	recoveryRate: number;
}

export type BurnoutActionKind =
	| 'ASSIGN_LMS'
	| 'SCHEDULE_COACHING'
	| 'SEND_CHECK_IN'
	| 'ADJUST_WORKLOAD'
	| 'ASSIGN_MENTOR';
export type BurnoutActionStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE';

export interface BurnoutAction {
	id: string;
	agentId: string;
	kind: BurnoutActionKind;
	title: string;
	detail: string;
	createdBy: string;
	createdAt: string;
	dueAt: string | null;
	status: BurnoutActionStatus;
	refId?: string;
}

export interface HistoryEntry {
	id: string;
	kind: BurnoutActionKind;
	title: string;
	detail: string;
	by: string;
	at: string;
	dueAt: string | null;
	status: BurnoutActionStatus;
	source: 'analytics' | 'coaching' | 'lms';
}

// ---------- Analytics-only metrics (not in the triggers catalog) ----------
export type AnalyticsOnlyMetricId =
	| 'OPS_CALLS_HANDLED'
	| 'OPS_EFFECTIVE_CONTACT_RATE'
	| 'OPS_AHT_SECONDS'
	| 'OPS_HOLD_SECONDS'
	| 'OPS_WRAP_UP_SECONDS'
	| 'OPS_TRANSFER_RATE'
	| 'OPS_FCR_RATE'
	| 'OPS_AFTER_HOURS_SHARE'
	| 'AGENT_NEGATIVE_EMOTION_CALL_SHARE'
	| 'AGENT_POSITIVE_EMOTION_CALL_SHARE'
	| 'SENTIMENT_RECOVERY_RATE'
	| 'SENTIMENT_DROP_CALL_COUNT'
	| 'SENTIMENT_DROP_CALL_SHARE'
	| 'BI_CONVERSION_RATE'
	| 'DISPUTE_COUNT'
	| 'DISPUTE_RATE'
	| 'SURVEY_RESPONSE_RATE'
	| 'SURVEY_RESPONSE_COUNT'
	| 'SURVEY_NPS'
	| 'SURVEY_CSAT_AVG'
	| 'SURVEY_DETRACTOR_SHARE';
export type AnalyticsMetricId = TriggerMetricId | AnalyticsOnlyMetricId;
/** NPS runs from -100 to 100 and reads as a signed integer. */
export type AnalyticsMetricUnit = MetricUnit | 'SECONDS' | 'NPS';
export type AnalyticsMetricArea =
	| EvaluationArea
	| 'OPERATIONAL'
	| 'DISPUTES'
	| 'SURVEYS';
export interface AnalyticsMetricMeta {
	unit: AnalyticsMetricUnit;
	higherIsBetter: boolean;
	area: AnalyticsMetricArea;
}

// ---------- Disputes ----------
/** A dispute derived from an analytics call (the seeded disputesStore cases never match analytics call ids). */
export interface TeamDispute {
	id: string;
	callId: string;
	agentId: string;
	agentName: string;
	supervisorId: string;
	team: string;
	campaignId: string;
	evaluationType: DisputeEvaluationType;
	status: DisputeStatus;
	createdAt: string;
	resolvedAt: string | null;
	scoreDelta: number;
}
export interface DisputeSummary {
	total: number;
	open: number;
	accepted: number;
	partiallyAccepted: number;
	rejected: number;
	acceptanceRate: number | null;
	avgResolutionDays: number | null;
	ratePer100Calls: number | null;
	byType: { type: DisputeEvaluationType; count: number; share: number }[];
}
export interface DisputeSeriesPoint {
	period: string;
	filed: number;
	resolved: number;
}
export interface DisputesByAgentRow {
	agentId: string;
	agentName: string;
	team: string;
	calls: number;
	filed: number;
	open: number;
	accepted: number;
	rejected: number;
	acceptanceRate: number | null;
}

// ---------- Chart data ----------
export type SentimentBand =
	| 'very-negative'
	| 'negative'
	| 'neutral'
	| 'positive'
	| 'very-positive';
export interface DistributionRow {
	key: string;
	count: number;
	share: number;
}
export interface HeatmapData {
	rows: { key: string; label: string }[];
	cols: string[];
	cells: (number | null)[][];
	/** Calls behind each cell, same shape as `cells`. */
	counts: number[][];
}
export interface ErrorMixPoint {
	period: string;
	ecn: number;
	enc: number;
	ecc: number;
	ecuf: number;
}
export interface ComplianceItemShare {
	area: 'security' | 'regulatory' | 'legal';
	item: string;
	share: number;
}
export interface BurnoutSummary {
	high: number;
	medium: number;
	low: number;
	byTeam: { team: string; atRisk: number }[];
}
export interface HumanVsAiMetricRow {
	id: AnalyticsMetricId;
	human: number | null;
	ai: number | null;
	index: { human: number; ai: number };
}
export interface HumanVsAiAgentRow {
	agentId: string;
	agentName: string;
	team: string;
	calls: number;
	qa: number | null;
	compliance: number | null;
	sentiment: number | null;
	effective: number | null;
}
export interface HumanVsAiSummary {
	humanCalls: number;
	aiCalls: number;
	aiShare: number | null;
	aiAgents: number;
	metrics: HumanVsAiMetricRow[];
	byAgent: HumanVsAiAgentRow[];
}
export interface OverviewException {
	area: AnalyticsMetricArea;
	view: TeamAnalyticsView;
	metricId: AnalyticsMetricId;
	segmentKey: string;
	segmentLabel: string;
	dimension: GroupByDimension;
	value: number;
	previous: number | null;
	target: number | null;
	reason: 'BELOW_TARGET' | 'WORSENED';
}

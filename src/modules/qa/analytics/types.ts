import type { CallMetric } from '~/modules/qa/dashboard/mockData';
import type { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import type { TriggerMetricId } from '~/models/qa';
import type {
	AgentStatus,
	BusinessSignalType,
	NonConversionReasonKey,
	Shift,
} from '~/modules/qa/team/types';

export type TeamAnalyticsView =
	| 'qa'
	| 'sentiment'
	| 'compliance'
	| 'business'
	| 'finder'
	| 'burnout';
/** Views that render metric segments/charts (finder & burnout have their own data flows). */
export type MetricView = Exclude<TeamAnalyticsView, 'finder' | 'burnout'>;

export type GroupByDimension =
	| 'none'
	| 'team'
	| 'supervisor'
	| 'agent'
	| 'campaign'
	| 'lineOfBusiness'
	| 'campaignType'
	| 'callDirection'
	| 'shift'
	| 'tenure'
	| 'timeOfDay'
	| 'weekday';

export type CallDirection = 'INBOUND' | 'OUTBOUND';
export type CampaignType = 'INBOUND' | 'OUTBOUND' | 'BLENDED';
export type TenureBand = 'lt6m' | '6to12m' | '1to2y' | 'gt2y';
export type TimeSlot = '08-10' | '10-12' | '12-14' | '14-16' | '16-18';
export type QuickRange = '7d' | '30d' | '90d' | 'custom';
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
}

export interface ScoreRangeFilter {
	metricId: TriggerMetricId | null;
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
	metricId: TriggerMetricId;
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
export type SegmentMetricId = Extract<
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
export type BurnoutDriverId =
	| 'AGENT_SENTIMENT_TREND'
	| 'NEGATIVE_EMOTION_7D'
	| 'QA_TREND_14D'
	| 'AFTER_HOURS_30D'
	| 'AHT_VS_TEAM_30D'
	| 'NEGATIVE_EMOTION_STREAK';
export type BurnoutDriverMetricId =
	| TriggerMetricId
	| 'AFTER_HOURS_SHARE'
	| 'AHT_VS_TEAM';
export type BurnoutDriverStatus = 'BREACHED' | 'NEAR' | 'OK';

export interface BurnoutDriverRule {
	id: BurnoutDriverId;
	metricId: BurnoutDriverMetricId;
	conditionLabelKey: string;
	threshold: number;
	/** distance from threshold that counts as NEAR */
	nearBand: number;
	direction: 'ABOVE' | 'BELOW';
	/** which number is compared with the threshold */
	evaluate: 'VALUE' | 'DELTA';
}

export interface BurnoutDriver {
	id: BurnoutDriverId;
	metricId: BurnoutDriverMetricId;
	currentValue: number | null;
	conditionLabelKey: string;
	threshold: number;
	status: BurnoutDriverStatus;
	delta: number | null;
	series: number[];
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

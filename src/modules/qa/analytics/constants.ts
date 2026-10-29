import type { Shift } from '~/modules/qa/team/types';
import { NOW_ISO } from '~/modules/qa/team/constants';
import type {
	DisputeEvaluationType,
	DisputeStatus,
} from '~/models/qa/disputeCases';
import type {
	AnalyticsPreset,
	BurnoutActionKind,
	CallDirection,
	CallEmotion,
	FinderPreset,
	FinderQuery,
	GroupByDimension,
	MetricView,
	QuickRange,
	SegmentMetricId,
	SentimentBand,
	TeamAnalyticsFilters,
	TeamAnalyticsView,
	TenureBand,
	TimeSlot,
} from './types';

export const VIEW_PARAM = 'view';
export const AGENT_PARAM = 'agentId';
export const DEFAULT_VIEW: TeamAnalyticsView = 'overview';

/** 'YYYY-MM-DD' of NOW_ISO — the last day with data. */
export const TODAY = NOW_ISO.slice(0, 10);
export const addDays = (isoDay: string, delta: number): string => {
	const d = new Date(`${isoDay}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + delta);
	return d.toISOString().slice(0, 10);
};

export const TEAM_ANALYTICS_VIEWS: TeamAnalyticsView[] = [
	'overview',
	'operational',
	'qa',
	'compliance',
	'business',
	'sentiment',
	'surveys',
	'humanVsAi',
	'burnout',
	'disputes',
	'finder',
];

/** Days of call history the mock generator produces (ends on TODAY). */
export const HISTORY_DAYS = 365;
export const QUICK_RANGES: Exclude<QuickRange, 'custom'>[] = [
	'7d',
	'30d',
	'90d',
	'12m',
];
export const QUICK_RANGE_DAYS: Record<Exclude<QuickRange, 'custom'>, number> = {
	'7d': 7,
	'30d': 30,
	'90d': 90,
	'12m': 365,
};
/** The previous period must fit inside the history, so comparison is off beyond this many days. */
export const MAX_COMPARE_DAYS = Math.floor(HISTORY_DAYS / 2);

/** `managerOnly` dimensions are hidden for the supervisor (single team / single supervisor). Labels: filters.groupByOptions.<value>. */
export const GROUP_BY_OPTIONS: {
	value: GroupByDimension;
	managerOnly: boolean;
}[] = [
	{ value: 'none', managerOnly: false },
	{ value: 'team', managerOnly: true },
	{ value: 'supervisor', managerOnly: true },
	{ value: 'agent', managerOnly: false },
	{ value: 'agentType', managerOnly: false },
	{ value: 'campaign', managerOnly: false },
	{ value: 'lineOfBusiness', managerOnly: false },
	{ value: 'campaignType', managerOnly: false },
	{ value: 'callDirection', managerOnly: false },
	{ value: 'shift', managerOnly: false },
	{ value: 'tenure', managerOnly: false },
	{ value: 'timeOfDay', managerOnly: false },
	{ value: 'weekday', managerOnly: false },
	{ value: 'sentimentCause', managerOnly: false },
];

export const DRILL_NEXT: Partial<Record<GroupByDimension, GroupByDimension>> = {
	team: 'supervisor',
	supervisor: 'agent',
	agentType: 'agent',
	campaign: 'agent',
	lineOfBusiness: 'campaign',
	campaignType: 'campaign',
	shift: 'agent',
	tenure: 'agent',
	timeOfDay: 'agent',
	weekday: 'agent',
	sentimentCause: 'agent',
};

export const VIEW_METRICS: Record<MetricView, SegmentMetricId[]> = {
	operational: [
		'OPS_CALLS_HANDLED',
		'OPS_EFFECTIVE_CONTACT_RATE',
		'OPS_AHT_SECONDS',
		'OPS_FCR_RATE',
		'OPS_TRANSFER_RATE',
		'OPS_HOLD_SECONDS',
		'OPS_WRAP_UP_SECONDS',
		'OPS_AFTER_HOURS_SHARE',
	],
	disputes: ['DISPUTE_RATE', 'DISPUTE_COUNT'],
	qa: [
		'QA_OVERALL_SCORE',
		'QA_ECN_COUNT',
		'QA_ENC_COUNT',
		'QA_ECC_COUNT',
		'QA_ECUF_COUNT',
		'QA_AUTO_FAIL_COUNT',
	],
	sentiment: [
		'CUSTOMER_SENTIMENT_SCORE',
		'AGENT_SENTIMENT_SCORE',
		'POSITIVE_EMOTION_CALL_SHARE',
		'NEGATIVE_EMOTION_CALL_SHARE',
		'AGENT_NEGATIVE_EMOTION_CALL_SHARE',
		'SENTIMENT_RECOVERY_RATE',
		'SENTIMENT_RECOVERY_COUNT',
		'SENTIMENT_DROP_CALL_SHARE',
		'SENTIMENT_DROP_CALL_COUNT',
	],
	compliance: [
		'COMPLIANCE_OVERALL_SCORE',
		'COMPLIANCE_SECURITY_SCORE',
		'COMPLIANCE_REGULATORY_SCORE',
		'COMPLIANCE_LEGAL_SCORE',
		'COMPLIANCE_VIOLATION_COUNT',
	],
	surveys: [
		'SURVEY_NPS',
		'SURVEY_CSAT_AVG',
		'SURVEY_RESPONSE_RATE',
		'SURVEY_DETRACTOR_SHARE',
		'SURVEY_RESPONSE_COUNT',
	],
	business: [
		'BI_CONVERSION_RATE',
		'BI_NON_CONVERSION_RATE',
		'BI_EARLY_OBJECTION_RATE',
		'BI_UNHANDLED_OBJECTION_RATE',
		'BI_COMPETITOR_PLUS_COST_RATE',
		'BI_MISTARGETED_OFFER_RATE',
	],
};

export const PRIMARY_METRIC: Record<MetricView, SegmentMetricId> = {
	operational: 'OPS_CALLS_HANDLED',
	disputes: 'DISPUTE_RATE',
	qa: 'QA_OVERALL_SCORE',
	sentiment: 'CUSTOMER_SENTIMENT_SCORE',
	compliance: 'COMPLIANCE_OVERALL_SCORE',
	business: 'BI_CONVERSION_RATE',
	surveys: 'SURVEY_NPS',
};

export const TIME_SLOTS: TimeSlot[] = [
	'08-10',
	'10-12',
	'12-14',
	'14-16',
	'16-18',
];
export const TENURE_BANDS: TenureBand[] = ['lt6m', '6to12m', '1to2y', 'gt2y'];
export const DIRECTIONS: CallDirection[] = ['INBOUND', 'OUTBOUND'];
export const SHIFTS: Shift[] = ['morning', 'afternoon', 'night'];
export const EMOTIONS: CallEmotion[] = [
	'Joy',
	'Trust',
	'Anticipation',
	'Surprise',
	'Anger',
	'Fear',
	'Sadness',
	'Disgust',
];
/** Monday-first, JS getUTCDay() values. Labels: filters.weekdayLabels.<value>. */
export const WEEKDAYS: { value: number }[] = [
	{ value: 1 },
	{ value: 2 },
	{ value: 3 },
	{ value: 4 },
	{ value: 5 },
	{ value: 6 },
	{ value: 0 },
];
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MAX_SEGMENT_SERIES = 8;
/** Beyond this many segments a trend switches from one multi-line chart to small multiples. */
export const MAX_LINE_SERIES = 4;
export const OTHER_SEGMENT_KEY = '__other';
/** Mantine color keys (legacy consumers: the dashboard burnout and team trend cards). */
export const SEGMENT_COLORS = [
	'blue.6',
	'teal.6',
	'grape.6',
	'orange.6',
	'indigo.6',
	'pink.6',
	'gray.5',
];

export const DEFAULT_FILTERS: TeamAnalyticsFilters = {
	from: addDays(TODAY, -29),
	to: TODAY,
	quickRange: '30d',
	granularity: 'daily',
	compareWithPrevious: true,
	supervisorIds: [],
	agentIds: [],
	campaignIds: [],
	linesOfBusiness: [],
	campaignTypes: [],
	directions: [],
	shifts: [],
	statuses: [],
	tenureBands: [],
	timeSlots: [],
	weekdays: [],
	emotions: [],
	sentimentCauses: [],
	surveyThemes: [],
	agentTypes: [],
	autoFailOnly: false,
	recoveredOnly: false,
	offeredOnly: false,
	convertedOnly: false,
	scoreRange: { metricId: null, min: null, max: null },
	minCalls: 5,
};

/** Built-in ids double as i18n keys: presets.builtInNames.<id>. */
export const BUILT_IN_PRESETS: AnalyticsPreset[] = [
	{
		id: 'collections-compliance',
		name: 'Collections compliance watch',
		builtIn: true,
		view: 'compliance',
		groupBy: 'agent',
		filters: { ...DEFAULT_FILTERS, linesOfBusiness: ['Collections'] },
	},
	{
		id: 'outbound-conversion',
		name: 'Outbound sales conversion',
		builtIn: true,
		view: 'business',
		groupBy: 'campaign',
		filters: { ...DEFAULT_FILTERS, campaignTypes: ['OUTBOUND'] },
	},
	{
		id: 'night-sentiment',
		name: 'Night shift sentiment',
		builtIn: true,
		view: 'sentiment',
		groupBy: 'team',
		filters: { ...DEFAULT_FILTERS, shifts: ['night'] },
	},
	{
		id: 'new-hires-qa',
		name: 'New hires QA (< 6 months)',
		builtIn: true,
		view: 'qa',
		groupBy: 'agent',
		filters: { ...DEFAULT_FILTERS, tenureBands: ['lt6m'] },
	},
];

export const DEFAULT_FINDER_QUERY: FinderQuery = {
	metricId: 'QA_OVERALL_SCORE',
	operator: 'BELOW',
	value: 75,
	value2: null,
	minCalls: 5,
};

export const DEFAULT_FINDER_PRESETS: FinderPreset[] = [
	{
		id: 'finder-qa-below-75',
		name: 'QA score below 75%',
		builtIn: true,
		query: {
			metricId: 'QA_OVERALL_SCORE',
			operator: 'BELOW',
			value: 75,
			value2: null,
			minCalls: 5,
		},
	},
	{
		id: 'finder-sentiment-below-3-5',
		name: 'Customer sentiment below 3.5',
		builtIn: true,
		query: {
			metricId: 'CUSTOMER_SENTIMENT_SCORE',
			operator: 'BELOW',
			value: 3.5,
			value2: null,
			minCalls: 5,
		},
	},
	{
		id: 'finder-negative-emotion',
		name: 'Negative emotion share above 30%',
		builtIn: true,
		query: {
			metricId: 'NEGATIVE_EMOTION_CALL_SHARE',
			operator: 'ABOVE',
			value: 30,
			value2: null,
			minCalls: 5,
		},
	},
	{
		id: 'finder-compliance-band',
		name: 'Compliance between 70% and 85%',
		builtIn: true,
		query: {
			metricId: 'COMPLIANCE_OVERALL_SCORE',
			operator: 'BETWEEN',
			value: 70,
			value2: 85,
			minCalls: 5,
		},
	},
];

export const WORKLOAD_ACTIONS = [
	'PAUSE_CAMPAIGN',
	'REDUCE_DAILY_CAP',
	'INBOUND_ONLY',
] as const;
export type WorkloadAction = (typeof WORKLOAD_ACTIONS)[number];
export const CHECK_IN_TEMPLATES = [
	'QUICK_CHECK_IN',
	'OFFER_SUPPORT',
	'RECOGNIZE_EFFORT',
] as const;
export type CheckInTemplate = (typeof CHECK_IN_TEMPLATES)[number];
export const MENTOR_WEEKS = [2, 4, 8];

export const BURNOUT_ACTION_KINDS: BurnoutActionKind[] = [
	'ASSIGN_LMS',
	'SCHEDULE_COACHING',
	'SEND_CHECK_IN',
	'ADJUST_WORKLOAD',
	'ASSIGN_MENTOR',
];

/** Upper bound (exclusive) of each customer/agent sentiment band on the 1-5 scale. */
export const SENTIMENT_BANDS: { key: SentimentBand; max: number }[] = [
	{ key: 'very-negative', max: 1.8 },
	{ key: 'negative', max: 2.6 },
	{ key: 'neutral', max: 3.4 },
	{ key: 'positive', max: 4.2 },
	{ key: 'very-positive', max: 5.01 },
];
export const QA_SCORE_BANDS: { key: string; min: number; max: number }[] = [
	{ key: 'lt60', min: 0, max: 59.99 },
	{ key: '60to69', min: 60, max: 69.99 },
	{ key: '70to79', min: 70, max: 79.99 },
	{ key: '80to89', min: 80, max: 89.99 },
	{ key: '90plus', min: 90, max: 100 },
];
export const COMPLIANCE_ITEMS: {
	area: 'security' | 'regulatory' | 'legal';
	item: string;
}[] = [
	{ area: 'security', item: 'dataProtection' },
	{ area: 'security', item: 'disclosureCompliance' },
	{ area: 'regulatory', item: 'cobranzaRegulada' },
	{ area: 'regulatory', item: 'transparenciaConsentimiento' },
	{ area: 'legal', item: 'amenazasTradicionales' },
	{ area: 'legal', item: 'rrss' },
	{ area: 'legal', item: 'superintendenciaBancos' },
	{ area: 'legal', item: 'noLlamarList' },
];
export const DISPUTE_TYPES: DisputeEvaluationType[] = [
	'qa',
	'compliance',
	'sentiment-emotion',
	'business-insights',
];
export const DISPUTE_STATUSES: DisputeStatus[] = [
	'accepted',
	'partially-accepted',
	'rejected',
	'open',
];
export const HUMAN_VS_AI_METRICS: SegmentMetricId[] = [
	'QA_OVERALL_SCORE',
	'COMPLIANCE_OVERALL_SCORE',
	'CUSTOMER_SENTIMENT_SCORE',
	'OPS_EFFECTIVE_CONTACT_RATE',
	'OPS_FCR_RATE',
	'BI_CONVERSION_RATE',
	'OPS_AHT_SECONDS',
];

/** Heatmap cells built from fewer calls than this are faded: too few to read a pattern. */
export const HEATMAP_MIN_CALLS = 5;

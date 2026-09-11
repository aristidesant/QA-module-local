import {
	IconAlertTriangle,
	IconAward,
	IconBolt,
	IconCalendarStats,
	IconFlame,
	IconTargetArrow,
	IconTrendingDown,
	IconTrendingUp,
	type TablerIcon,
} from '@tabler/icons-react';
import type {
	BadgeTier,
	CampaignType,
	ComparisonOperator,
	ConditionMode,
	DayOfWeek,
	EvaluationArea,
	EvaluationWindow,
	RuleChannel,
	RuleKind,
	RuleRecipient,
	RuleSeverity,
	RuleStatus,
	RuleType,
	TemplateCategory,
	TriggerMetricDefinition,
	TriggerMetricId,
	ActivityStatus,
} from '~/models/qa';

export const EVALUATION_AREAS: EvaluationArea[] = [
	'QUALITY_ASSURANCE',
	'COMPLIANCE',
	'SENTIMENT_EMOTION',
	'BUSINESS_INSIGHTS',
];

/** Mantine color per area — aligned with QualityAssuranceCard / analytics tabs. */
export const AREA_COLORS: Record<EvaluationArea | 'GENERAL', string> = {
	QUALITY_ASSURANCE: 'cyan',
	COMPLIANCE: 'grape',
	SENTIMENT_EMOTION: 'teal',
	BUSINESS_INSIGHTS: 'indigo',
	GENERAL: 'gray',
};

export const TRIGGER_METRIC_CATALOG: TriggerMetricDefinition[] = [
	{ id: 'QA_OVERALL_SCORE', area: 'QUALITY_ASSURANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 80, higherIsBetter: true },
	{ id: 'QA_ECN_COUNT', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, defaultThreshold: 1, higherIsBetter: false },
	{ id: 'QA_ENC_COUNT', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, defaultThreshold: 3, higherIsBetter: false },
	{ id: 'QA_ECC_COUNT', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, defaultThreshold: 1, higherIsBetter: false },
	{ id: 'QA_ECUF_COUNT', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, defaultThreshold: 1, higherIsBetter: false },
	{ id: 'QA_AUTO_FAIL_COUNT', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, defaultThreshold: 1, higherIsBetter: false },
	{ id: 'COMPLIANCE_OVERALL_SCORE', area: 'COMPLIANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 85, higherIsBetter: true },
	{ id: 'COMPLIANCE_SECURITY_SCORE', area: 'COMPLIANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 90, higherIsBetter: true, subItemGroup: 'COMPLIANCE_ITEMS' },
	{ id: 'COMPLIANCE_REGULATORY_SCORE', area: 'COMPLIANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 90, higherIsBetter: true, subItemGroup: 'COMPLIANCE_ITEMS' },
	{ id: 'COMPLIANCE_LEGAL_SCORE', area: 'COMPLIANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 90, higherIsBetter: true, subItemGroup: 'COMPLIANCE_ITEMS' },
	{ id: 'COMPLIANCE_VIOLATION_COUNT', area: 'COMPLIANCE', unit: 'COUNT', min: 0, max: 50, step: 1, defaultThreshold: 1, higherIsBetter: false, subItemGroup: 'COMPLIANCE_ITEMS' },
	{ id: 'CUSTOMER_SENTIMENT_SCORE', area: 'SENTIMENT_EMOTION', unit: 'SCORE_5', min: 1, max: 5, step: 0.1, defaultThreshold: 3.5, higherIsBetter: true },
	{ id: 'AGENT_SENTIMENT_SCORE', area: 'SENTIMENT_EMOTION', unit: 'SCORE_5', min: 1, max: 5, step: 0.1, defaultThreshold: 3.5, higherIsBetter: true },
	{ id: 'POSITIVE_EMOTION_CALL_SHARE', area: 'SENTIMENT_EMOTION', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 60, higherIsBetter: true, subItemGroup: 'EMOTIONS' },
	{ id: 'NEGATIVE_EMOTION_CALL_SHARE', area: 'SENTIMENT_EMOTION', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 30, higherIsBetter: false, subItemGroup: 'EMOTIONS' },
	{ id: 'SENTIMENT_RECOVERY_COUNT', area: 'SENTIMENT_EMOTION', unit: 'COUNT', min: 0, max: 100, step: 1, defaultThreshold: 5, higherIsBetter: true },
	{ id: 'BI_EARLY_OBJECTION_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 25, higherIsBetter: false },
	{ id: 'BI_UNHANDLED_OBJECTION_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 20, higherIsBetter: false },
	{ id: 'BI_COMPETITOR_PLUS_COST_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 20, higherIsBetter: false },
	{ id: 'BI_MISTARGETED_OFFER_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 15, higherIsBetter: false },
	{ id: 'BI_NON_CONVERSION_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, defaultThreshold: 60, higherIsBetter: false },
];

export const METRIC_BY_ID: Record<TriggerMetricId, TriggerMetricDefinition> =
	Object.fromEntries(TRIGGER_METRIC_CATALOG.map((m) => [m.id, m])) as Record<
		TriggerMetricId,
		TriggerMetricDefinition
	>;

/** Keys match ComplianceAnalyticsTab COMPLIANCE_AREA_CONFIG so labels can be shared later. */
export const COMPLIANCE_SUB_ITEMS: string[] = [
	'dataProtection',
	'disclosureCompliance',
	'cobranzaRegulada',
	'transparenciaConsentimiento',
	'amenazasTradicionales',
	'rrss',
	'superintendenciaBancos',
	'noLlamarList',
];

/** Same 13 values as src/modules/qa/emotion-sentiment/types.ts `Emotion`. */
export const EMOTION_SUB_ITEMS: string[] = [
	'ELATION', 'GRATITUDE', 'JOY', 'RELIEF', 'SATISFACTION', 'NEUTRAL', 'SURPRISE',
	'FRUSTRATION', 'SADNESS', 'FEAR', 'DISAPPOINTMENT', 'ANGER', 'RAGE',
];

export interface RuleTypeMeta {
	kind: RuleKind;
	icon: TablerIcon;
	color: string;
	/** which condition modes make sense for this type (first = default) */
	allowedModes: ConditionMode[];
	hasConditions: boolean;
}

export const RULE_TYPE_META: Record<RuleType, RuleTypeMeta> = {
	METRIC_ALERT: { kind: 'ALERT', icon: IconAlertTriangle, color: 'orange', allowedModes: ['THRESHOLD', 'RANGE', 'CONSECUTIVE'], hasConditions: true },
	TREND_WARNING: { kind: 'ALERT', icon: IconTrendingDown, color: 'yellow', allowedModes: ['PERCENT_CHANGE', 'CONSECUTIVE'], hasConditions: true },
	WEEKLY_SUMMARY: { kind: 'ALERT', icon: IconCalendarStats, color: 'blue', allowedModes: [], hasConditions: false },
	BURNOUT_RISK: { kind: 'ALERT', icon: IconFlame, color: 'red', allowedModes: ['THRESHOLD', 'PERCENT_CHANGE', 'CONSECUTIVE'], hasConditions: true },
	MILESTONE: { kind: 'RECOGNITION', icon: IconTargetArrow, color: 'green', allowedModes: ['THRESHOLD', 'RANGE'], hasConditions: true },
	STREAK: { kind: 'RECOGNITION', icon: IconBolt, color: 'teal', allowedModes: ['CONSECUTIVE'], hasConditions: true },
	IMPROVEMENT: { kind: 'RECOGNITION', icon: IconTrendingUp, color: 'lime', allowedModes: ['PERCENT_CHANGE'], hasConditions: true },
	BADGE_AWARD: { kind: 'RECOGNITION', icon: IconAward, color: 'grape', allowedModes: ['THRESHOLD', 'CONSECUTIVE', 'PERCENT_CHANGE'], hasConditions: true },
};

export const ALERT_RULE_TYPES: RuleType[] = ['METRIC_ALERT', 'TREND_WARNING', 'WEEKLY_SUMMARY', 'BURNOUT_RISK'];
export const RECOGNITION_RULE_TYPES: RuleType[] = ['MILESTONE', 'STREAK', 'IMPROVEMENT', 'BADGE_AWARD'];

export const SEVERITY_COLORS: Record<RuleSeverity, string> = { INFO: 'blue', WARNING: 'yellow', CRITICAL: 'red' };
export const STATUS_COLORS: Record<RuleStatus, string> = { ACTIVE: 'green', PAUSED: 'gray', DRAFT: 'yellow' };
export const ACTIVITY_STATUS_COLORS: Record<ActivityStatus, string> = { SENT: 'blue', ACKNOWLEDGED: 'green', ESCALATED: 'red', SUPPRESSED: 'gray' };
export const TIER_COLORS: Record<BadgeTier, string> = { BRONZE: 'orange', SILVER: 'gray', GOLD: 'yellow' };
export const TEMPLATE_CATEGORY_COLORS: Record<TemplateCategory, string> = { ALERT: 'orange', RECOGNITION: 'green', SUMMARY: 'blue' };

export const RECIPIENTS: RuleRecipient[] = ['AGENT', 'SUPERVISOR', 'QA_MANAGER'];
export const CHANNELS: RuleChannel[] = ['INBOX', 'EMAIL', 'DASHBOARD'];
export const OPERATORS: ComparisonOperator[] = ['LT', 'LTE', 'GT', 'GTE'];
export const OPERATOR_SYMBOLS: Record<ComparisonOperator, string> = { LT: '<', LTE: '≤', GT: '>', GTE: '≥' };
export const WINDOWS: EvaluationWindow[] = ['PER_CALL', 'LAST_N_CALLS', 'LAST_7_DAYS', 'LAST_14_DAYS', 'LAST_30_DAYS'];
export const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
export const TIMEZONES = ['America/Santo_Domingo', 'America/New_York', 'America/Bogota', 'Europe/Madrid'];
export const LINES_OF_BUSINESS = ['Customer Service', 'Sales', 'Collections', 'Tech Support'];
export const CAMPAIGN_TYPES: CampaignType[] = ['INBOUND', 'OUTBOUND', 'BLENDED'];
export const CELEBRATION_EMOJIS = ['🎉', '🏆', '⭐', '🙌', '🔥', '💪'];
export const BADGE_ICON_OPTIONS = ['⭐', '🏆', '🛡️', '😊', '🌤️', '🎯', '✅', '🔥', '🚀', '🔐', '💎', '🥇', '🧠', '🤝', '💬', '📈', '🎧', '🦸', '🌟', '👑', '🎖️', '💡', '🧩', '🏅'];
export const BADGE_COLOR_OPTIONS = ['yellow', 'orange', 'red', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'pink'];
export const MAX_CONDITIONS = 5;

/** Variables available in message templates ({{name}}). */
export const TEMPLATE_VARIABLES = [
	'agent_name', 'supervisor_name', 'metric_name', 'metric_value', 'threshold',
	'period', 'campaign_name', 'badge_name', 'streak_count',
] as const;
export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number];

/** Sample values used by every message preview. */
export const SAMPLE_TEMPLATE_VALUES: Record<TemplateVariable, string> = {
	agent_name: 'Sarah Johnson',
	supervisor_name: 'Maria García',
	metric_name: 'Compliance score',
	metric_value: '78%',
	threshold: '80%',
	period: 'last 7 days',
	campaign_name: 'Q3 Customer Service',
	badge_name: 'Compliance Master',
	streak_count: '3',
};

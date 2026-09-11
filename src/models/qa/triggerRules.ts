/**
 * Triggers & Auto-driven Recognition domain model (Supervisor / QA Manager).
 * Mock-only for the stakeholder demo; shaped so it can be backed by an API later.
 */

export type EvaluationArea =
	| 'QUALITY_ASSURANCE'
	| 'COMPLIANCE'
	| 'SENTIMENT_EMOTION'
	| 'BUSINESS_INSIGHTS';

export type TriggerMetricId =
	// Quality Assurance (COPC error types + overall + auto-fails)
	| 'QA_OVERALL_SCORE'
	| 'QA_ECN_COUNT' // critical business error
	| 'QA_ENC_COUNT' // non-critical error
	| 'QA_ECC_COUNT' // critical compliance error
	| 'QA_ECUF_COUNT' // critical end-user error
	| 'QA_AUTO_FAIL_COUNT'
	// Compliance
	| 'COMPLIANCE_OVERALL_SCORE'
	| 'COMPLIANCE_SECURITY_SCORE'
	| 'COMPLIANCE_REGULATORY_SCORE'
	| 'COMPLIANCE_LEGAL_SCORE'
	| 'COMPLIANCE_VIOLATION_COUNT'
	// Sentiment & Emotion (1-5 scale, shares in %)
	| 'CUSTOMER_SENTIMENT_SCORE'
	| 'AGENT_SENTIMENT_SCORE'
	| 'POSITIVE_EMOTION_CALL_SHARE'
	| 'NEGATIVE_EMOTION_CALL_SHARE'
	| 'SENTIMENT_RECOVERY_COUNT' // calls that started negative and ended positive
	// Business Insights (rates in %)
	| 'BI_EARLY_OBJECTION_RATE'
	| 'BI_UNHANDLED_OBJECTION_RATE'
	| 'BI_COMPETITOR_PLUS_COST_RATE'
	| 'BI_MISTARGETED_OFFER_RATE'
	| 'BI_NON_CONVERSION_RATE';

export type MetricUnit = 'PERCENT' | 'SCORE_5' | 'COUNT';
export type MetricSubItemGroup = 'COMPLIANCE_ITEMS' | 'EMOTIONS';

export interface TriggerMetricDefinition {
	id: TriggerMetricId;
	area: EvaluationArea;
	unit: MetricUnit;
	min: number;
	max: number;
	step: number;
	defaultThreshold: number;
	/** true → low values are bad (scores); false → high values are bad (error counts, negative shares) */
	higherIsBetter: boolean;
	/** When set, the condition can be narrowed to one sub-item (compliance item or emotion). */
	subItemGroup?: MetricSubItemGroup;
}

export type RuleKind = 'ALERT' | 'RECOGNITION';
export type AlertRuleType =
	| 'METRIC_ALERT'
	| 'TREND_WARNING'
	| 'WEEKLY_SUMMARY'
	| 'BURNOUT_RISK';
export type RecognitionRuleType =
	| 'MILESTONE'
	| 'STREAK'
	| 'IMPROVEMENT'
	| 'BADGE_AWARD';
export type RuleType = AlertRuleType | RecognitionRuleType;

export type RuleSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type RuleStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT';

export type ConditionMode = 'THRESHOLD' | 'RANGE' | 'PERCENT_CHANGE' | 'CONSECUTIVE';
export type ComparisonOperator = 'LT' | 'LTE' | 'GT' | 'GTE';
export type ChangeDirection = 'INCREASE' | 'DECREASE';
export type EvaluationWindow =
	| 'PER_CALL'
	| 'LAST_N_CALLS'
	| 'LAST_7_DAYS'
	| 'LAST_14_DAYS'
	| 'LAST_30_DAYS';
export type ConditionLogic = 'ALL' | 'ANY';

export interface RuleCondition {
	id: string;
	metricId: TriggerMetricId;
	/** compliance sub-item key or emotion key, only for metrics with subItemGroup */
	subItem: string | null;
	mode: ConditionMode;
	/** THRESHOLD and CONSECUTIVE */
	operator: ComparisonOperator;
	/** THRESHOLD / CONSECUTIVE value; RANGE lower bound */
	value: number;
	/** RANGE upper bound */
	value2: number | null;
	/** PERCENT_CHANGE */
	changeDirection: ChangeDirection;
	changePercent: number;
	/** CONSECUTIVE: number of consecutive calls that must satisfy operator/value */
	consecutiveCount: number;
	window: EvaluationWindow;
	/** LAST_N_CALLS */
	windowSize: number;
}

export type RuleRecipient = 'AGENT' | 'SUPERVISOR' | 'QA_MANAGER';
export type RuleChannel = 'INBOX' | 'EMAIL' | 'DASHBOARD';
export type CampaignType = 'INBOUND' | 'OUTBOUND' | 'BLENDED';

export interface RuleScope {
	/** empty array = everyone in the role's scope */
	agentIds: string[];
	supervisorIds: string[];
	campaignIds: string[];
	linesOfBusiness: string[];
	campaignTypes: CampaignType[];
}

export interface RuleDelivery {
	recipients: RuleRecipient[];
	channels: RuleChannel[];
	escalationEnabled: boolean;
	escalationAfterHours: number;
}

export interface RuleMessage {
	templateId: string | null;
	subject: string;
	body: string;
}

export interface RuleFrequencyGuard {
	/** 0 = no cooldown */
	cooldownDays: number;
	/** null = unlimited */
	maxPerWeek: number | null;
	quietHoursEnabled: boolean;
	quietHoursFrom: string; // 'HH:mm'
	quietHoursTo: string; // 'HH:mm'
}

export type DayOfWeek =
	| 'MONDAY'
	| 'TUESDAY'
	| 'WEDNESDAY'
	| 'THURSDAY'
	| 'FRIDAY'
	| 'SATURDAY'
	| 'SUNDAY';

export interface RuleSchedule {
	dayOfWeek: DayOfWeek;
	time: string; // 'HH:mm'
	timezone: string;
	includedAreas: EvaluationArea[];
	includeTeamComparison: boolean;
}

export type BurnoutRiskLevelValue = 'LOW' | 'MEDIUM' | 'HIGH';
export type RecognitionVisibility = 'PRIVATE' | 'TEAM_FEED';

export interface RuleRecognition {
	badgeId: string | null;
	visibility: RecognitionVisibility;
	celebrationEmoji: string;
}

export interface RuleStats {
	firedLast7Days: number;
	firedLast30Days: number;
	lastFiredAt: string | null;
}

export type RuleAuthorRole = 'SUPERVISOR' | 'QA_MANAGER';

export interface TriggerRule {
	id: string;
	kind: RuleKind;
	type: RuleType;
	name: string;
	description: string;
	severity: RuleSeverity;
	status: RuleStatus;
	conditions: RuleCondition[];
	conditionLogic: ConditionLogic;
	scope: RuleScope;
	delivery: RuleDelivery;
	message: RuleMessage;
	frequency: RuleFrequencyGuard;
	/** WEEKLY_SUMMARY only */
	schedule: RuleSchedule | null;
	/** BURNOUT_RISK only: level assigned to matching agents */
	burnoutLevel: BurnoutRiskLevelValue | null;
	/** RECOGNITION kind only */
	recognition: RuleRecognition | null;
	stats: RuleStats;
	createdBy: string;
	createdByRole: RuleAuthorRole;
	createdAt: string;
	updatedAt: string;
}

export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD';
export type BadgeStatus = 'ACTIVE' | 'ARCHIVED';
export type BadgeArea = EvaluationArea | 'GENERAL';

export interface BadgeHolder {
	agentId: string;
	agentName: string;
	team: string;
	earnedAt: string;
}

export interface BadgeDefinition {
	id: string;
	name: string;
	description: string;
	/** emoji */
	icon: string;
	/** Mantine color name, e.g. 'teal' */
	color: string;
	area: BadgeArea;
	tier: BadgeTier;
	conditions: RuleCondition[];
	conditionLogic: ConditionLogic;
	autoAward: boolean;
	linkedRuleId: string | null;
	status: BadgeStatus;
	holders: BadgeHolder[];
	createdAt: string;
	updatedAt: string;
}

export type TemplateCategory = 'ALERT' | 'RECOGNITION' | 'SUMMARY';

export interface MessageTemplate {
	id: string;
	name: string;
	category: TemplateCategory;
	subject: string;
	body: string;
	isDefault: boolean;
	/** number of rules referencing this template */
	usageCount: number;
	updatedAt: string;
}

export type ActivityStatus = 'SENT' | 'ACKNOWLEDGED' | 'ESCALATED' | 'SUPPRESSED';

export interface TriggerActivityEntry {
	id: string;
	ruleId: string;
	ruleName: string;
	kind: RuleKind;
	ruleType: RuleType;
	agentId: string;
	agentName: string;
	supervisorName: string;
	campaignName: string;
	metricId: TriggerMetricId | null;
	observedValue: number | null;
	conditionSummary: string;
	recipients: RuleRecipient[];
	channels: RuleChannel[];
	status: ActivityStatus;
	firedAt: string;
	acknowledgedAt: string | null;
	renderedMessage: string;
	badgeId: string | null;
}

/** Current-period snapshot of one agent, used by the live rule preview. */
export interface TriggerAgentSnapshot {
	agentId: string;
	agentName: string;
	supervisorId: string;
	supervisorName: string;
	team: string;
	campaignIds: string[];
	lineOfBusiness: string;
	campaignType: CampaignType;
	/** aggregate for the current period */
	metrics: Record<TriggerMetricId, number>;
	/** % change vs previous period (negative = decline) */
	changes: Record<TriggerMetricId, number>;
	/** last 10 calls, newest first — per-call metric values */
	recentCalls: Array<Record<TriggerMetricId, number>>;
}

export interface TriggerScopeOption {
	value: string;
	label: string;
}

export interface TriggerCampaignOption extends TriggerScopeOption {
	lineOfBusiness: string;
	campaignType: CampaignType;
}

import type {
	BadgeDefinition, MessageTemplate, RuleCondition, TriggerActivityEntry,
	TriggerAgentSnapshot, TriggerCampaignOption, TriggerMetricId, TriggerRule,
	TriggerScopeOption,
} from '~/models/qa';
import { TRIGGER_METRIC_CATALOG } from './constants';

export const NOW_ISO = '2026-09-10T15:00:00Z';

export const TRIGGER_SUPERVISORS: TriggerScopeOption[] = [
	{ value: 'SUP-001', label: 'Maria García' },
	{ value: 'SUP-002', label: 'Juan Pérez' },
	{ value: 'SUP-003', label: 'Laura Gómez' },
];

export const TRIGGER_CAMPAIGNS: TriggerCampaignOption[] = [
	{ value: 'camp-001', label: 'Q3 Customer Service', lineOfBusiness: 'Customer Service', campaignType: 'INBOUND' },
	{ value: 'camp-002', label: 'Sales Training', lineOfBusiness: 'Sales', campaignType: 'OUTBOUND' },
	{ value: 'camp-003', label: 'Q4 Compliance', lineOfBusiness: 'Collections', campaignType: 'BLENDED' },
	{ value: 'camp-004', label: 'Tech Support', lineOfBusiness: 'Tech Support', campaignType: 'INBOUND' },
];

/** Deterministic pseudo-random in [0,1) so previews are stable between reloads. */
function seeded(seed: number) {
	let s = seed;
	return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

/** Default healthy baseline profile for all agents. */
const HEALTHY_DEFAULTS: Record<TriggerMetricId, number> = {
	QA_OVERALL_SCORE: 88,
	QA_ECN_COUNT: 0,
	QA_ENC_COUNT: 2,
	QA_ECC_COUNT: 0,
	QA_ECUF_COUNT: 0,
	QA_AUTO_FAIL_COUNT: 0,
	COMPLIANCE_OVERALL_SCORE: 91,
	COMPLIANCE_SECURITY_SCORE: 93,
	COMPLIANCE_REGULATORY_SCORE: 90,
	COMPLIANCE_LEGAL_SCORE: 92,
	COMPLIANCE_VIOLATION_COUNT: 0,
	CUSTOMER_SENTIMENT_SCORE: 4.1,
	AGENT_SENTIMENT_SCORE: 4.0,
	POSITIVE_EMOTION_CALL_SHARE: 62,
	NEGATIVE_EMOTION_CALL_SHARE: 18,
	SENTIMENT_RECOVERY_COUNT: 3,
	BI_EARLY_OBJECTION_RATE: 18,
	BI_UNHANDLED_OBJECTION_RATE: 12,
	BI_COMPETITOR_PLUS_COST_RATE: 10,
	BI_MISTARGETED_OFFER_RATE: 8,
	BI_NON_CONVERSION_RATE: 48,
};

function buildAgent(
	id: string,
	name: string,
	supervisorId: string,
	team: string,
	campaignIds: string[],
	overrides: Partial<Record<TriggerMetricId, number>> = {},
	changes: Partial<Record<TriggerMetricId, number>> = {},
	seed: number,
): TriggerAgentSnapshot {
	const rand = seeded(seed);
	const metrics: Record<TriggerMetricId, number> = { ...HEALTHY_DEFAULTS, ...overrides };

	// Clamp to catalog limits
	for (const def of TRIGGER_METRIC_CATALOG) {
		metrics[def.id] = Math.max(def.min, Math.min(def.max, metrics[def.id]));
	}

	// Build changes (default 0)
	const allChanges: Record<TriggerMetricId, number> = {} as Record<TriggerMetricId, number>;
	for (const def of TRIGGER_METRIC_CATALOG) {
		allChanges[def.id] = changes[def.id] ?? 0;
	}

	// Recent calls: 10 entries with jittered metrics
	const recentCalls: Array<Record<TriggerMetricId, number>> = [];
	for (let i = 0; i < 10; i++) {
		const call: Record<TriggerMetricId, number> = {} as Record<TriggerMetricId, number>;
		for (const def of TRIGGER_METRIC_CATALOG) {
			let jitter = 8; // default for PERCENT
			if (def.unit === 'SCORE_5') jitter = 0.6;
			else if (def.unit === 'COUNT') jitter = 1;

			const delta = (rand() - 0.5) * 2 * jitter;
			let value = metrics[def.id] + delta;
			value = Math.max(def.min, Math.min(def.max, value));
			if (def.unit === 'COUNT') value = Math.round(value);
			call[def.id] = value;
		}
		recentCalls.push(call);
	}

	return {
		agentId: id,
		agentName: name,
		supervisorId,
		supervisorName: TRIGGER_SUPERVISORS.find(s => s.value === supervisorId)?.label || supervisorId,
		team,
		campaignIds,
		lineOfBusiness: TRIGGER_CAMPAIGNS.find(c => c.value === campaignIds[0])?.lineOfBusiness || 'Customer Service',
		campaignType: TRIGGER_CAMPAIGNS.find(c => c.value === campaignIds[0])?.campaignType || 'INBOUND',
		metrics,
		changes: allChanges,
		recentCalls,
	};
}

export const TRIGGER_AGENTS: TriggerAgentSnapshot[] = [
	buildAgent('AGT-001', 'Sarah Johnson', 'SUP-001', 'Team 1', ['camp-001'], { CUSTOMER_SENTIMENT_SCORE: 4.6 }, {}, 1001),
	buildAgent('AGT-002', 'Mike Chen', 'SUP-001', 'Team 1', ['camp-001', 'camp-003'], { COMPLIANCE_OVERALL_SCORE: 100, COMPLIANCE_SECURITY_SCORE: 99 }, {}, 1002),
	buildAgent('AGT-004', 'John Smith', 'SUP-001', 'Team 1', ['camp-001'], { QA_OVERALL_SCORE: 90 }, { QA_OVERALL_SCORE: 11 }, 1004),
	buildAgent('AGT-005', 'Emma Davis', 'SUP-001', 'Team 1', ['camp-001'], { AGENT_SENTIMENT_SCORE: 2.9, NEGATIVE_EMOTION_CALL_SHARE: 33 }, {}, 1005),
	buildAgent('AGT-006', 'David Brown', 'SUP-001', 'Team 1', ['camp-001', 'camp-003'], { QA_OVERALL_SCORE: 62, QA_ECC_COUNT: 1, AGENT_SENTIMENT_SCORE: 2.4, NEGATIVE_EMOTION_CALL_SHARE: 44 }, { QA_OVERALL_SCORE: -12, AGENT_SENTIMENT_SCORE: -14 }, 1006),
	buildAgent('AGT-007', 'Lisa Wong', 'SUP-001', 'Team 1', ['camp-003'], { COMPLIANCE_OVERALL_SCORE: 78 }, { COMPLIANCE_OVERALL_SCORE: -9 }, 1007),
	buildAgent('AGT-008', 'Sofia Rodríguez', 'SUP-002', 'Team 2', ['camp-002'], { BI_UNHANDLED_OBJECTION_RATE: 34 }, {}, 1008),
	buildAgent('AGT-010', 'Carlos Vega', 'SUP-002', 'Team 2', ['camp-002', 'camp-004'], { COMPLIANCE_VIOLATION_COUNT: 2 }, { COMPLIANCE_OVERALL_SCORE: -11 }, 1010),
	buildAgent('AGT-011', 'Lucía Torres', 'SUP-002', 'Team 2', ['camp-004'], { SENTIMENT_RECOVERY_COUNT: 7 }, {}, 1011),
	buildAgent('AGT-012', 'Diego Ramírez', 'SUP-002', 'Team 2', ['camp-002'], { CUSTOMER_SENTIMENT_SCORE: 3.1 }, { CUSTOMER_SENTIMENT_SCORE: -17 }, 1012),
	buildAgent('AGT-015', 'Camila Herrera', 'SUP-003', 'Team 3', ['camp-003', 'camp-001'], { QA_OVERALL_SCORE: 96 }, {}, 1015),
	buildAgent('AGT-017', 'Nina Patel', 'SUP-003', 'Team 3', ['camp-003'], { QA_AUTO_FAIL_COUNT: 3, QA_ENC_COUNT: 6 }, {}, 1017),
];

export const TRIGGER_AGENT_OPTIONS: TriggerScopeOption[] = TRIGGER_AGENTS.map((agent) => ({
	value: agent.agentId,
	label: agent.agentName,
}));

let conditionCounter = 0;
export function condition(partial: Partial<RuleCondition> = {}): RuleCondition {
	return {
		id: `cond-${++conditionCounter}`,
		metricId: 'QA_OVERALL_SCORE',
		subItem: null,
		mode: 'THRESHOLD',
		operator: 'LT',
		value: 0,
		value2: null,
		changeDirection: 'DECREASE',
		changePercent: 10,
		consecutiveCount: 3,
		window: 'LAST_7_DAYS',
		windowSize: 10,
		...partial,
	};
}

export function rule(partial: Partial<TriggerRule> = {}): TriggerRule {
	return {
		id: '',
		kind: 'ALERT',
		type: 'METRIC_ALERT',
		name: '',
		severity: 'WARNING',
		status: 'ACTIVE',
		conditions: [],
		conditionLogic: 'ALL',
		scope: {
			agentIds: [],
			supervisorIds: [],
			campaignIds: [],
			linesOfBusiness: [],
			campaignTypes: [],
		},
		delivery: {
			recipients: ['AGENT', 'SUPERVISOR'],
			channels: ['INBOX'],
			escalationEnabled: false,
			escalationAfterHours: 24,
		},
		message: { templateId: null, subject: '', body: '' },
		frequency: {
			cooldownDays: 3,
			maxPerWeek: null,
			quietHoursEnabled: false,
			quietHoursFrom: '20:00',
			quietHoursTo: '08:00',
		},
		schedule: null,
		burnoutLevel: null,
		recognition: null,
		stats: { firedLast7Days: 0, firedLast30Days: 0, lastFiredAt: null },
		createdBy: 'Maria García',
		createdByRole: 'SUPERVISOR',
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
		description: '',
		...partial,
	};
}

export const MOCK_RULES: TriggerRule[] = [
	rule({
		id: 'ALR-001',
		kind: 'ALERT',
		type: 'METRIC_ALERT',
		name: 'Compliance score below 80%',
		severity: 'CRITICAL',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'COMPLIANCE_OVERALL_SCORE', operator: 'LT', value: 80, window: 'LAST_7_DAYS' })],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX', 'EMAIL'], escalationEnabled: true, escalationAfterHours: 24 },
		message: { templateId: 'TPL-001', subject: 'Compliance score needs attention', body: 'Hi {{agent_name}}, your Compliance score is {{metric_value}} over the {{period}}, below the {{threshold}} target. Let\'s review a couple of calls together this week.' },
		stats: { firedLast7Days: 4, firedLast30Days: 13, lastFiredAt: '2026-09-09T10:12:00Z' },
	}),
	rule({
		id: 'ALR-002',
		kind: 'ALERT',
		type: 'METRIC_ALERT',
		name: 'Critical compliance error (ECC) on any call',
		severity: 'CRITICAL',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'QA_ECC_COUNT', operator: 'GTE', value: 1, window: 'PER_CALL' })],
		delivery: { recipients: ['SUPERVISOR', 'QA_MANAGER'], channels: ['INBOX', 'DASHBOARD'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-002', subject: '[Alert] {{agent_name}} · Critical error {{metric_value}}', body: '{{agent_name}} ({{campaign_name}}) reached {{metric_value}} on Critical compliance error ({{period}}). Threshold: {{threshold}}. Open Analytics to review the calls behind this alert.' },
		frequency: { cooldownDays: 0, maxPerWeek: null, quietHoursEnabled: false, quietHoursFrom: '20:00', quietHoursTo: '08:00' },
		stats: { firedLast7Days: 2, firedLast30Days: 6, lastFiredAt: null },
	}),
	rule({
		id: 'ALR-003',
		kind: 'ALERT',
		type: 'TREND_WARNING',
		name: 'Customer sentiment drops 15%',
		severity: 'WARNING',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'CUSTOMER_SENTIMENT_SCORE', mode: 'PERCENT_CHANGE', changeDirection: 'DECREASE', changePercent: 15, window: 'LAST_14_DAYS' })],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-003', subject: 'Downward trend on Customer sentiment', body: 'Heads up {{agent_name}}: Customer sentiment moved from its previous level to {{metric_value}} over the {{period}}. A quick check-in with {{supervisor_name}} can help turn this around.' },
		stats: { firedLast7Days: 1, firedLast30Days: 4, lastFiredAt: null },
	}),
	rule({
		id: 'ALR-004',
		kind: 'ALERT',
		type: 'TREND_WARNING',
		name: 'Three consecutive very negative calls',
		severity: 'WARNING',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'CUSTOMER_SENTIMENT_SCORE', mode: 'CONSECUTIVE', operator: 'LT', value: 2, consecutiveCount: 3, windowSize: 10, window: 'LAST_N_CALLS' })],
		delivery: { recipients: ['SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-003', subject: 'Downward trend on Customer sentiment', body: 'Heads up {{agent_name}}: Customer sentiment moved from its previous level to {{metric_value}} over the {{period}}. A quick check-in with {{supervisor_name}} can help turn this around.' },
		stats: { firedLast7Days: 0, firedLast30Days: 2, lastFiredAt: null },
	}),
	rule({
		id: 'ALR-005',
		kind: 'ALERT',
		type: 'WEEKLY_SUMMARY',
		name: 'Weekly team summary',
		severity: 'INFO',
		status: 'ACTIVE',
		conditions: [],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX', 'EMAIL'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-004', subject: 'Your weekly performance summary', body: 'Hi {{agent_name}}, here is your summary for the {{period}}: QA, Compliance, Sentiment & Emotion and Business Insights. Compare yourself with the team average and see your next badge in Rankings.' },
		schedule: { dayOfWeek: 'FRIDAY', time: '17:00', timezone: 'America/Santo_Domingo', includedAreas: ['QUALITY_ASSURANCE', 'COMPLIANCE', 'SENTIMENT_EMOTION', 'BUSINESS_INSIGHTS'], includeTeamComparison: true },
		stats: { firedLast7Days: 1, firedLast30Days: 4, lastFiredAt: null },
	}),
	rule({
		id: 'ALR-006',
		kind: 'ALERT',
		type: 'METRIC_ALERT',
		name: 'QA score below 75%',
		severity: 'CRITICAL',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'QA_OVERALL_SCORE', operator: 'LT', value: 75, window: 'LAST_7_DAYS' })],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX', 'EMAIL'], escalationEnabled: true, escalationAfterHours: 48 },
		message: { templateId: 'TPL-001', subject: 'QA score needs attention', body: 'Hi {{agent_name}}, your QA score is {{metric_value}} over the {{period}}, below the {{threshold}} target. Let\'s review a couple of calls together this week.' },
		frequency: { cooldownDays: 3, maxPerWeek: 2, quietHoursEnabled: false, quietHoursFrom: '20:00', quietHoursTo: '08:00' },
		stats: { firedLast7Days: 3, firedLast30Days: 9, lastFiredAt: null },
	}),
	rule({
		id: 'ALR-007',
		kind: 'ALERT',
		type: 'METRIC_ALERT',
		name: 'Unhandled objection rate above 30%',
		severity: 'WARNING',
		status: 'PAUSED',
		conditions: [condition({ metricId: 'BI_UNHANDLED_OBJECTION_RATE', operator: 'GT', value: 30, window: 'LAST_30_DAYS' })],
		scope: { agentIds: [], supervisorIds: [], campaignIds: ['camp-002'], linesOfBusiness: [], campaignTypes: [] },
		delivery: { recipients: ['SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-002', subject: '[Alert] {{agent_name}} · Unhandled objection {{metric_value}}', body: '{{agent_name}} ({{campaign_name}}) reached {{metric_value}} on Unhandled objections ({{period}}). Threshold: {{threshold}}. Open Analytics to review the calls behind this alert.' },
		stats: { firedLast7Days: 0, firedLast30Days: 3, lastFiredAt: null },
	}),
	rule({
		id: 'ALR-008',
		kind: 'ALERT',
		type: 'BURNOUT_RISK',
		name: 'Burnout risk — high',
		severity: 'CRITICAL',
		status: 'ACTIVE',
		conditions: [
			condition({ metricId: 'AGENT_SENTIMENT_SCORE', mode: 'PERCENT_CHANGE', changeDirection: 'DECREASE', changePercent: 10, window: 'LAST_14_DAYS' }),
			condition({ metricId: 'NEGATIVE_EMOTION_CALL_SHARE', operator: 'GT', value: 40, window: 'LAST_7_DAYS' }),
			condition({ metricId: 'QA_OVERALL_SCORE', mode: 'PERCENT_CHANGE', changeDirection: 'DECREASE', changePercent: 5, window: 'LAST_14_DAYS' }),
		],
		conditionLogic: 'ALL',
		delivery: { recipients: ['SUPERVISOR', 'QA_MANAGER'], channels: ['INBOX', 'DASHBOARD'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-008', subject: 'Check-in suggested: {{agent_name}}', body: '{{agent_name}} shows signs of burnout risk ({{metric_name}} {{metric_value}}, {{period}}). Consider scheduling a 1:1, reviewing workload, or assigning LMS material from Analytics › Burnout Risk.' },
		frequency: { cooldownDays: 3, maxPerWeek: null, quietHoursEnabled: true, quietHoursFrom: '20:00', quietHoursTo: '08:00' },
		burnoutLevel: 'HIGH',
		stats: { firedLast7Days: 1, firedLast30Days: 2, lastFiredAt: null },
	}),
	rule({
		id: 'ALR-009',
		kind: 'ALERT',
		type: 'BURNOUT_RISK',
		name: 'Burnout risk — medium',
		severity: 'WARNING',
		status: 'ACTIVE',
		conditions: [
			condition({ metricId: 'AGENT_SENTIMENT_SCORE', operator: 'LT', value: 3, window: 'LAST_7_DAYS' }),
			condition({ metricId: 'NEGATIVE_EMOTION_CALL_SHARE', operator: 'GT', value: 30, window: 'LAST_7_DAYS' }),
		],
		conditionLogic: 'ANY',
		delivery: { recipients: ['SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-008', subject: 'Check-in suggested: {{agent_name}}', body: '{{agent_name}} shows signs of burnout risk ({{metric_name}} {{metric_value}}, {{period}}). Consider scheduling a 1:1, reviewing workload, or assigning LMS material from Analytics › Burnout Risk.' },
		burnoutLevel: 'MEDIUM',
		stats: { firedLast7Days: 2, firedLast30Days: 5, lastFiredAt: null },
	}),
	rule({
		id: 'ALR-010',
		kind: 'ALERT',
		type: 'METRIC_ALERT',
		name: 'Data-protection violation',
		severity: 'CRITICAL',
		status: 'DRAFT',
		conditions: [condition({ metricId: 'COMPLIANCE_VIOLATION_COUNT', operator: 'GTE', value: 1, window: 'PER_CALL', subItem: 'dataProtection' })],
		delivery: { recipients: ['QA_MANAGER'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-002', subject: '[Alert] {{agent_name}} · Data-protection violation', body: '{{agent_name}} ({{campaign_name}}) reached {{metric_value}} on Data-protection violation ({{period}}). Threshold: {{threshold}}. Open Analytics to review the calls behind this alert.' },
		createdBy: 'Laura Gómez',
		createdByRole: 'QA_MANAGER',
		stats: { firedLast7Days: 0, firedLast30Days: 0, lastFiredAt: null },
	}),
	// Recognition rules
	rule({
		id: 'REC-001',
		kind: 'RECOGNITION',
		type: 'STREAK',
		name: 'Sentiment & Emotion Master',
		severity: 'INFO',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'CUSTOMER_SENTIMENT_SCORE', mode: 'CONSECUTIVE', operator: 'GTE', value: 4.5, consecutiveCount: 3, windowSize: 10, window: 'LAST_N_CALLS' })],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-005', subject: '🎉 {{streak_count}} in a row, {{agent_name}}!', body: 'Congratulations {{agent_name}}! {{streak_count}} consecutive calls with outstanding {{metric_name}}. You just earned the {{badge_name}} badge. Keep it up!' },
		recognition: { badgeId: 'BDG-003', visibility: 'TEAM_FEED', celebrationEmoji: '🎉' },
		stats: { firedLast7Days: 3, firedLast30Days: 11, lastFiredAt: null },
	}),
	rule({
		id: 'REC-002',
		kind: 'RECOGNITION',
		type: 'MILESTONE',
		name: 'Compliance Master',
		severity: 'INFO',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'COMPLIANCE_OVERALL_SCORE', mode: 'CONSECUTIVE', operator: 'GTE', value: 100, consecutiveCount: 10, windowSize: 10, window: 'LAST_N_CALLS' })],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX', 'EMAIL'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-006', subject: 'New milestone: {{badge_name}}', body: '{{agent_name}}, you reached {{metric_value}} on {{metric_name}} over the {{period}}. That\'s the {{badge_name}} milestone — well done, the whole team noticed.' },
		recognition: { badgeId: 'BDG-002', visibility: 'TEAM_FEED', celebrationEmoji: '🏆' },
		stats: { firedLast7Days: 1, firedLast30Days: 3, lastFiredAt: null },
	}),
	rule({
		id: 'REC-003',
		kind: 'RECOGNITION',
		type: 'IMPROVEMENT',
		name: 'QA improvement +10%',
		severity: 'INFO',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'QA_OVERALL_SCORE', mode: 'PERCENT_CHANGE', changeDirection: 'INCREASE', changePercent: 10, window: 'LAST_30_DAYS' })],
		delivery: { recipients: ['AGENT'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-006', subject: 'New milestone: {{badge_name}}', body: '{{agent_name}}, you reached {{metric_value}} on {{metric_name}} over the {{period}}. That\'s the {{badge_name}} milestone — well done, the whole team noticed.' },
		recognition: { badgeId: 'BDG-008', visibility: 'PRIVATE', celebrationEmoji: '🚀' },
		stats: { firedLast7Days: 2, firedLast30Days: 5, lastFiredAt: null },
	}),
	rule({
		id: 'REC-004',
		kind: 'RECOGNITION',
		type: 'BADGE_AWARD',
		name: 'Mood Booster',
		severity: 'INFO',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'SENTIMENT_RECOVERY_COUNT', operator: 'GTE', value: 5, window: 'LAST_30_DAYS' })],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-007', subject: 'You earned {{badge_name}}', body: 'Great work {{agent_name}}! The {{badge_name}} badge is now on your profile. Thanks for the consistency on {{campaign_name}}.' },
		recognition: { badgeId: 'BDG-004', visibility: 'TEAM_FEED', celebrationEmoji: '🌤️' },
		stats: { firedLast7Days: 1, firedLast30Days: 2, lastFiredAt: null },
	}),
	rule({
		id: 'REC-005',
		kind: 'RECOGNITION',
		type: 'MILESTONE',
		name: 'Perfect QA week',
		severity: 'INFO',
		status: 'ACTIVE',
		conditions: [condition({ metricId: 'QA_OVERALL_SCORE', operator: 'GTE', value: 95, window: 'LAST_7_DAYS' })],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-006', subject: 'New milestone: {{badge_name}}', body: '{{agent_name}}, you reached {{metric_value}} on {{metric_name}} over the {{period}}. That\'s the {{badge_name}} milestone — well done, the whole team noticed.' },
		recognition: { badgeId: 'BDG-009', visibility: 'TEAM_FEED', celebrationEmoji: '⭐' },
		stats: { firedLast7Days: 2, firedLast30Days: 6, lastFiredAt: null },
	}),
	rule({
		id: 'REC-006',
		kind: 'RECOGNITION',
		type: 'BADGE_AWARD',
		name: 'Zero critical errors (30 days)',
		severity: 'INFO',
		status: 'PAUSED',
		conditions: [
			condition({ metricId: 'QA_ECN_COUNT', operator: 'LTE', value: 0, window: 'LAST_30_DAYS' }),
			condition({ metricId: 'QA_ECC_COUNT', operator: 'LTE', value: 0, window: 'LAST_30_DAYS' }),
			condition({ metricId: 'QA_ECUF_COUNT', operator: 'LTE', value: 0, window: 'LAST_30_DAYS' }),
		],
		conditionLogic: 'ALL',
		delivery: { recipients: ['AGENT'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-007', subject: 'You earned {{badge_name}}', body: 'Great work {{agent_name}}! The {{badge_name}} badge is now on your profile. Thanks for the consistency on {{campaign_name}}.' },
		recognition: { badgeId: 'BDG-006', visibility: 'PRIVATE', celebrationEmoji: '✅' },
		stats: { firedLast7Days: 0, firedLast30Days: 4, lastFiredAt: null },
	}),
	rule({
		id: 'REC-007',
		kind: 'RECOGNITION',
		type: 'MILESTONE',
		name: 'Objection handler',
		severity: 'INFO',
		status: 'DRAFT',
		conditions: [condition({ metricId: 'BI_UNHANDLED_OBJECTION_RATE', operator: 'LT', value: 10, window: 'LAST_30_DAYS' })],
		delivery: { recipients: ['AGENT', 'SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 },
		message: { templateId: 'TPL-006', subject: 'New milestone: {{badge_name}}', body: '{{agent_name}}, you reached {{metric_value}} on {{metric_name}} over the {{period}}. That\'s the {{badge_name}} milestone — well done, the whole team noticed.' },
		recognition: { badgeId: 'BDG-005', visibility: 'TEAM_FEED', celebrationEmoji: '🎯' },
		stats: { firedLast7Days: 0, firedLast30Days: 0, lastFiredAt: null },
	}),
];

export const MOCK_BADGES: BadgeDefinition[] = [
	{
		id: 'BDG-001',
		name: 'QA Master',
		description: 'Achieve consistently high QA scores.',
		icon: '⭐',
		color: 'yellow',
		area: 'QUALITY_ASSURANCE',
		tier: 'GOLD',
		conditions: [condition({ metricId: 'QA_OVERALL_SCORE', mode: 'CONSECUTIVE', operator: 'GTE', value: 95, consecutiveCount: 5, windowSize: 10, window: 'LAST_N_CALLS' })],
		conditionLogic: 'ALL',
		autoAward: false,
		linkedRuleId: null,
		status: 'ACTIVE',
		holders: [{ agentId: 'AGT-015', agentName: 'Camila Herrera', team: 'Team 3', earnedAt: '2026-08-15T10:00:00Z' }],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-002',
		name: 'Compliance Master',
		description: 'Perfect compliance record.',
		icon: '🛡️',
		color: 'grape',
		area: 'COMPLIANCE',
		tier: 'GOLD',
		conditions: [condition({ metricId: 'COMPLIANCE_OVERALL_SCORE', mode: 'CONSECUTIVE', operator: 'GTE', value: 100, consecutiveCount: 10, windowSize: 10, window: 'LAST_N_CALLS' })],
		conditionLogic: 'ALL',
		autoAward: true,
		linkedRuleId: 'REC-002',
		status: 'ACTIVE',
		holders: [{ agentId: 'AGT-002', agentName: 'Mike Chen', team: 'Team 1', earnedAt: '2026-08-20T10:00:00Z' }],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-003',
		name: 'Sentiment & Emotion Master',
		description: 'Exceptional customer sentiment scores.',
		icon: '😊',
		color: 'teal',
		area: 'SENTIMENT_EMOTION',
		tier: 'GOLD',
		conditions: [condition({ metricId: 'CUSTOMER_SENTIMENT_SCORE', mode: 'CONSECUTIVE', operator: 'GTE', value: 4.5, consecutiveCount: 3, windowSize: 10, window: 'LAST_N_CALLS' })],
		conditionLogic: 'ALL',
		autoAward: true,
		linkedRuleId: 'REC-001',
		status: 'ACTIVE',
		holders: [
			{ agentId: 'AGT-001', agentName: 'Sarah Johnson', team: 'Team 1', earnedAt: '2026-08-10T10:00:00Z' },
			{ agentId: 'AGT-011', agentName: 'Lucía Torres', team: 'Team 2', earnedAt: '2026-08-22T10:00:00Z' },
			{ agentId: 'AGT-004', agentName: 'John Smith', team: 'Team 1', earnedAt: '2026-09-01T10:00:00Z' },
		],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-004',
		name: 'Mood Booster',
		description: 'Help customers recover from negative sentiment.',
		icon: '🌤️',
		color: 'orange',
		area: 'SENTIMENT_EMOTION',
		tier: 'SILVER',
		conditions: [condition({ metricId: 'SENTIMENT_RECOVERY_COUNT', operator: 'GTE', value: 5, window: 'LAST_30_DAYS' })],
		conditionLogic: 'ALL',
		autoAward: true,
		linkedRuleId: 'REC-004',
		status: 'ACTIVE',
		holders: [{ agentId: 'AGT-011', agentName: 'Lucía Torres', team: 'Team 2', earnedAt: '2026-08-25T10:00:00Z' }],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-005',
		name: 'Objection Handler',
		description: 'Excellent objection handling.',
		icon: '🎯',
		color: 'indigo',
		area: 'BUSINESS_INSIGHTS',
		tier: 'SILVER',
		conditions: [condition({ metricId: 'BI_UNHANDLED_OBJECTION_RATE', operator: 'LT', value: 10, window: 'LAST_30_DAYS' })],
		conditionLogic: 'ALL',
		autoAward: true,
		linkedRuleId: 'REC-007',
		status: 'ACTIVE',
		holders: [],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-006',
		name: 'Zero Critical Errors',
		description: 'No critical errors in the last 30 days.',
		icon: '✅',
		color: 'green',
		area: 'QUALITY_ASSURANCE',
		tier: 'SILVER',
		conditions: [
			condition({ metricId: 'QA_ECN_COUNT', operator: 'LTE', value: 0, window: 'LAST_30_DAYS' }),
			condition({ metricId: 'QA_ECC_COUNT', operator: 'LTE', value: 0, window: 'LAST_30_DAYS' }),
			condition({ metricId: 'QA_ECUF_COUNT', operator: 'LTE', value: 0, window: 'LAST_30_DAYS' }),
		],
		conditionLogic: 'ALL',
		autoAward: true,
		linkedRuleId: 'REC-006',
		status: 'ACTIVE',
		holders: [
			{ agentId: 'AGT-001', agentName: 'Sarah Johnson', team: 'Team 1', earnedAt: '2026-08-12T10:00:00Z' },
			{ agentId: 'AGT-015', agentName: 'Camila Herrera', team: 'Team 3', earnedAt: '2026-08-18T10:00:00Z' },
			{ agentId: 'AGT-002', agentName: 'Mike Chen', team: 'Team 1', earnedAt: '2026-08-28T10:00:00Z' },
		],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-007',
		name: 'Consistency Streak',
		description: 'Maintain high QA scores consistently.',
		icon: '🔥',
		color: 'red',
		area: 'GENERAL',
		tier: 'BRONZE',
		conditions: [condition({ metricId: 'QA_OVERALL_SCORE', mode: 'CONSECUTIVE', operator: 'GTE', value: 85, consecutiveCount: 5, windowSize: 10, window: 'LAST_N_CALLS' })],
		conditionLogic: 'ALL',
		autoAward: false,
		linkedRuleId: null,
		status: 'ACTIVE',
		holders: [
			{ agentId: 'AGT-001', agentName: 'Sarah Johnson', team: 'Team 1', earnedAt: '2026-08-16T10:00:00Z' },
			{ agentId: 'AGT-004', agentName: 'John Smith', team: 'Team 1', earnedAt: '2026-08-30T10:00:00Z' },
		],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-008',
		name: 'Rising Star',
		description: 'Show significant improvement in QA scores.',
		icon: '🚀',
		color: 'cyan',
		area: 'GENERAL',
		tier: 'BRONZE',
		conditions: [condition({ metricId: 'QA_OVERALL_SCORE', mode: 'PERCENT_CHANGE', changeDirection: 'INCREASE', changePercent: 10, window: 'LAST_30_DAYS' })],
		conditionLogic: 'ALL',
		autoAward: true,
		linkedRuleId: 'REC-003',
		status: 'ACTIVE',
		holders: [{ agentId: 'AGT-004', agentName: 'John Smith', team: 'Team 1', earnedAt: '2026-09-02T10:00:00Z' }],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-009',
		name: 'Perfect Week',
		description: 'Achieve 95%+ QA score in one week.',
		icon: '🏆',
		color: 'yellow',
		area: 'QUALITY_ASSURANCE',
		tier: 'SILVER',
		conditions: [condition({ metricId: 'QA_OVERALL_SCORE', operator: 'GTE', value: 95, window: 'LAST_7_DAYS' })],
		conditionLogic: 'ALL',
		autoAward: true,
		linkedRuleId: 'REC-005',
		status: 'ACTIVE',
		holders: [{ agentId: 'AGT-015', agentName: 'Camila Herrera', team: 'Team 3', earnedAt: '2026-09-05T10:00:00Z' }],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
	{
		id: 'BDG-010',
		name: 'Security Sentinel',
		description: 'Maintain excellent security compliance.',
		icon: '🔐',
		color: 'grape',
		area: 'COMPLIANCE',
		tier: 'BRONZE',
		conditions: [condition({ metricId: 'COMPLIANCE_SECURITY_SCORE', operator: 'GTE', value: 98, window: 'LAST_30_DAYS' })],
		conditionLogic: 'ALL',
		autoAward: false,
		linkedRuleId: null,
		status: 'ACTIVE',
		holders: [
			{ agentId: 'AGT-002', agentName: 'Mike Chen', team: 'Team 1', earnedAt: '2026-08-14T10:00:00Z' },
			{ agentId: 'AGT-001', agentName: 'Sarah Johnson', team: 'Team 1', earnedAt: '2026-08-24T10:00:00Z' },
		],
		createdAt: '2026-08-01T09:00:00Z',
		updatedAt: '2026-09-01T09:00:00Z',
	},
];

export const MOCK_TEMPLATES: MessageTemplate[] = [
	{ id: 'TPL-001', name: 'Metric alert — agent', category: 'ALERT', isDefault: true, subject: '{{metric_name}} needs attention', body: 'Hi {{agent_name}}, your {{metric_name}} is {{metric_value}} over the {{period}}, below the {{threshold}} target. Let\'s review a couple of calls together this week.', usageCount: 2, updatedAt: '2026-09-01T09:00:00Z' },
	{ id: 'TPL-002', name: 'Metric alert — supervisor', category: 'ALERT', isDefault: false, subject: '[Alert] {{agent_name}} · {{metric_name}} {{metric_value}}', body: '{{agent_name}} ({{campaign_name}}) reached {{metric_value}} on {{metric_name}} ({{period}}). Threshold: {{threshold}}. Open Analytics to review the calls behind this alert.', usageCount: 3, updatedAt: '2026-09-01T09:00:00Z' },
	{ id: 'TPL-003', name: 'Trend warning', category: 'ALERT', isDefault: false, subject: 'Downward trend on {{metric_name}}', body: 'Heads up {{agent_name}}: {{metric_name}} moved from its previous level to {{metric_value}} over the {{period}}. A quick check-in with {{supervisor_name}} can help turn this around.', usageCount: 2, updatedAt: '2026-09-01T09:00:00Z' },
	{ id: 'TPL-004', name: 'Weekly summary', category: 'SUMMARY', isDefault: true, subject: 'Your weekly performance summary', body: 'Hi {{agent_name}}, here is your summary for the {{period}}: QA, Compliance, Sentiment & Emotion and Business Insights. Compare yourself with the team average and see your next badge in Rankings.', usageCount: 1, updatedAt: '2026-09-01T09:00:00Z' },
	{ id: 'TPL-005', name: 'Congratulations — streak', category: 'RECOGNITION', isDefault: true, subject: '🎉 {{streak_count}} in a row, {{agent_name}}!', body: 'Congratulations {{agent_name}}! {{streak_count}} consecutive calls with outstanding {{metric_name}}. You just earned the {{badge_name}} badge. Keep it up!', usageCount: 1, updatedAt: '2026-09-01T09:00:00Z' },
	{ id: 'TPL-006', name: 'Milestone reached', category: 'RECOGNITION', isDefault: false, subject: 'New milestone: {{badge_name}}', body: '{{agent_name}}, you reached {{metric_value}} on {{metric_name}} over the {{period}}. That\'s the {{badge_name}} milestone — well done, the whole team noticed.', usageCount: 4, updatedAt: '2026-09-01T09:00:00Z' },
	{ id: 'TPL-007', name: 'Badge earned', category: 'RECOGNITION', isDefault: false, subject: 'You earned {{badge_name}}', body: 'Great work {{agent_name}}! The {{badge_name}} badge is now on your profile. Thanks for the consistency on {{campaign_name}}.', usageCount: 2, updatedAt: '2026-09-01T09:00:00Z' },
	{ id: 'TPL-008', name: 'Burnout check-in (supervisor)', category: 'ALERT', isDefault: false, subject: 'Check-in suggested: {{agent_name}}', body: '{{agent_name}} shows signs of burnout risk ({{metric_name}} {{metric_value}}, {{period}}). Consider scheduling a 1:1, reviewing workload, or assigning LMS material from Analytics › Burnout Risk.', usageCount: 2, updatedAt: '2026-09-01T09:00:00Z' },
];

function buildActivityLog(): TriggerActivityEntry[] {
	const entries: TriggerActivityEntry[] = [];
	const rand = seeded(7);
	const agentMap = Object.fromEntries(TRIGGER_AGENTS.map(a => [a.agentId, a]));
	const ruleMap = Object.fromEntries(MOCK_RULES.filter(r => r.status === 'ACTIVE').map(r => [r.id, r]));

	// Rule → agent mappings for plausible matching
	const ruleAgentMap: Record<string, string> = {
		'ALR-001': 'AGT-007', 'ALR-002': 'AGT-006', 'ALR-003': 'AGT-012', 'ALR-006': 'AGT-006',
		'ALR-008': 'AGT-006', 'ALR-009': 'AGT-005', 'REC-001': 'AGT-001', 'REC-002': 'AGT-002',
		'REC-003': 'AGT-004', 'REC-004': 'AGT-011', 'REC-005': 'AGT-015',
	};
	const alr005Agents = ['AGT-001', 'AGT-004', 'AGT-011', 'AGT-015', 'AGT-002', 'AGT-007', 'AGT-010', 'AGT-012'];

	const activeRules = Object.values(ruleMap);
	let alr005Index = 0;

	for (let i = 0; i < 40; i++) {
		const rule = activeRules[i % activeRules.length];
		let agentId = rule.id === 'ALR-005'
			? alr005Agents[alr005Index++ % alr005Agents.length]
			: (ruleAgentMap[rule.id] || TRIGGER_AGENTS[i % TRIGGER_AGENTS.length].agentId);

		const agent = agentMap[agentId];
		if (!agent) continue;

		const firedAtDate = new Date('2026-09-10T15:00:00Z');
		firedAtDate.setHours(firedAtDate.getHours() - i * 11);
		const firedAt = firedAtDate.toISOString();

		let status: TriggerActivityEntry['status'] = 'SENT';
		if (i % 4 === 0) status = 'SENT';
		else if (i % 4 === 1) status = 'ACKNOWLEDGED';
		else if (i % 9 === 2) status = 'ESCALATED';
		else if (i % 7 === 3) status = 'SUPPRESSED';

		const acknowledgedAt = status === 'ACKNOWLEDGED'
			? new Date(new Date(firedAt).getTime() + 3 * 60 * 60 * 1000).toISOString()
			: null;

		const firstCondition = rule.conditions[0];
		const observedValue = firstCondition
			? agent.metrics[firstCondition.metricId]
			: rand() * 100;

		const conditionSummary = firstCondition
			? `${firstCondition.metricId.toLowerCase()} condition · ${firstCondition.window}`
			: 'rule condition';

		const renderedMessage = rule.message.body
			.replace('{{agent_name}}', agent.agentName)
			.replace('{{supervisor_name}}', agent.supervisorName)
			.replace('{{campaign_name}}', TRIGGER_CAMPAIGNS.find(c => c.value === agent.campaignIds[0])?.label || 'Campaign')
			.replace('{{metric_name}}', firstCondition ? firstCondition.metricId : 'Metric')
			.replace('{{metric_value}}', observedValue.toFixed(1))
			.replace('{{threshold}}', '80')
			.replace('{{period}}', 'last 7 days')
			.replace('{{badge_name}}', 'Achievement')
			.replace('{{streak_count}}', '3');

		entries.push({
			id: `ACT-${String(i + 1).padStart(3, '0')}`,
			ruleId: rule.id,
			ruleName: rule.name,
			kind: rule.kind,
			ruleType: rule.type,
			agentId: agent.agentId,
			agentName: agent.agentName,
			supervisorName: agent.supervisorName,
			campaignName: TRIGGER_CAMPAIGNS.find(c => c.value === agent.campaignIds[0])?.label || 'Campaign',
			metricId: firstCondition?.metricId || null,
			observedValue,
			conditionSummary,
			recipients: rule.delivery.recipients,
			channels: rule.delivery.channels,
			status,
			firedAt,
			acknowledgedAt,
			renderedMessage,
			badgeId: rule.recognition?.badgeId || null,
		});
	}

	return entries;
}

export const MOCK_ACTIVITY = buildActivityLog();

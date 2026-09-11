import type { TFunction } from 'i18next';
import type {
	BadgeDefinition, MessageTemplate, RuleCondition, RuleKind, RuleType, TriggerAgentSnapshot,
	TriggerMetricId, TriggerRule, EvaluationArea, ComparisonOperator, RuleStatus, RuleSeverity,
} from '~/models/qa';
import {
	METRIC_BY_ID, OPERATOR_SYMBOLS, RULE_TYPE_META, SAMPLE_TEMPLATE_VALUES, TEMPLATE_VARIABLES,
} from './constants';

export function formatMetricValue(metricId: TriggerMetricId, value: number): string {
	const unit = METRIC_BY_ID[metricId].unit;
	if (unit === 'PERCENT') return `${Math.round(value)}%`;
	if (unit === 'SCORE_5') return value.toFixed(1);
	return String(Math.round(value));
}

function metricLabel(t: TFunction, metricId: TriggerMetricId) {
	return t(`metrics.${metricId}`);
}

function windowLabel(t: TFunction, c: RuleCondition) {
	return c.window === 'LAST_N_CALLS'
		? t('windows.LAST_N_CALLS_n', { count: c.windowSize })
		: t(`windows.${c.window}`);
}

/** Human sentence for one condition, e.g. "Compliance score < 80% · last 7 days". */
export function describeCondition(t: TFunction, c: RuleCondition): string {
	const metric = metricLabel(t, c.metricId);
	const sub = c.subItem ? ` (${t(`subItems.${c.subItem}`)})` : '';
	const w = windowLabel(t, c);
	switch (c.mode) {
		case 'THRESHOLD':
			return `${metric}${sub} ${OPERATOR_SYMBOLS[c.operator]} ${formatMetricValue(c.metricId, c.value)} · ${w}`;
		case 'RANGE':
			return `${metric}${sub} ${t('conditions.between', { from: formatMetricValue(c.metricId, c.value), to: formatMetricValue(c.metricId, c.value2 ?? c.value) })} · ${w}`;
		case 'PERCENT_CHANGE':
			return `${metric}${sub} ${t(`conditions.change.${c.changeDirection}`, { percent: c.changePercent })} · ${w}`;
		case 'CONSECUTIVE':
			return t('conditions.consecutive', { count: c.consecutiveCount, metric: `${metric}${sub}`, operator: OPERATOR_SYMBOLS[c.operator], value: formatMetricValue(c.metricId, c.value) });
	}
}

export function describeRule(t: TFunction, rule: TriggerRule): string {
	if (rule.type === 'WEEKLY_SUMMARY' && rule.schedule) {
		return t('conditions.scheduled', { day: t(`days.${rule.schedule.dayOfWeek}`), time: rule.schedule.time });
	}
	if (rule.conditions.length === 0) return t('conditions.none');
	const first = describeCondition(t, rule.conditions[0]);
	return rule.conditions.length > 1
		? `${first} ${t('conditions.more', { count: rule.conditions.length - 1, logic: t(`logic.${rule.conditionLogic}`) })}`
		: first;
}

export function getRuleArea(rule: Pick<TriggerRule, 'conditions' | 'type'>): EvaluationArea | 'ALL' {
	if (rule.type === 'WEEKLY_SUMMARY' || rule.conditions.length === 0) return 'ALL';
	return METRIC_BY_ID[rule.conditions[0].metricId].area;
}

function compare(value: number, op: ComparisonOperator, target: number): boolean {
	switch (op) {
		case 'LT': return value < target;
		case 'LTE': return value <= target;
		case 'GT': return value > target;
		case 'GTE': return value >= target;
		default: return false;
	}
}

export function conditionMatches(c: RuleCondition, s: TriggerAgentSnapshot): boolean {
	const value = s.metrics[c.metricId];
	switch (c.mode) {
		case 'THRESHOLD': return compare(value, c.operator, c.value);
		case 'RANGE': return value >= c.value && value <= (c.value2 ?? c.value);
		case 'PERCENT_CHANGE': {
			const change = s.changes[c.metricId] ?? 0;
			return c.changeDirection === 'DECREASE' ? change <= -c.changePercent : change >= c.changePercent;
		}
		case 'CONSECUTIVE': {
			let streak = 0;
			for (const call of s.recentCalls) {
				if (compare(call[c.metricId], c.operator, c.value)) streak += 1; else break;
			}
			return streak >= c.consecutiveCount;
		}
		default: return false;
	}
}

export function agentInScope(rule: Pick<TriggerRule, 'scope'>, s: TriggerAgentSnapshot): boolean {
	const { agentIds, supervisorIds, campaignIds, linesOfBusiness, campaignTypes } = rule.scope;
	if (agentIds.length && !agentIds.includes(s.agentId)) return false;
	if (supervisorIds.length && !supervisorIds.includes(s.supervisorId)) return false;
	if (campaignIds.length && !s.campaignIds.some((id) => campaignIds.includes(id))) return false;
	if (linesOfBusiness.length && !linesOfBusiness.includes(s.lineOfBusiness)) return false;
	if (campaignTypes.length && !campaignTypes.includes(s.campaignType)) return false;
	return true;
}

export interface RulePreview { inScope: TriggerAgentSnapshot[]; matching: TriggerAgentSnapshot[] }

export function evaluateRulePreview(
	rule: Pick<TriggerRule, 'scope' | 'conditions' | 'conditionLogic' | 'type'>,
	agents: TriggerAgentSnapshot[]
): RulePreview {
	const inScope = agents.filter((a) => agentInScope(rule, a));
	if (rule.type === 'WEEKLY_SUMMARY' || rule.conditions.length === 0) return { inScope, matching: inScope };
	const matching = inScope.filter((a) =>
		rule.conditionLogic === 'ALL'
			? rule.conditions.every((c) => conditionMatches(c, a))
			: rule.conditions.some((c) => conditionMatches(c, a))
	);
	return { inScope, matching };
}

export function interpolateTemplate(text: string, values: Partial<Record<string, string>> = SAMPLE_TEMPLATE_VALUES): string {
	return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}

export function extractVariables(text: string): string[] {
	const found = new Set<string>();
	for (const m of text.matchAll(/\{\{(\w+)\}\}/g)) if ((TEMPLATE_VARIABLES as readonly string[]).includes(m[1])) found.add(m[1]);
	return [...found];
}

export function ruleTypesForKind(kind: RuleKind): RuleType[] {
	return (Object.keys(RULE_TYPE_META) as RuleType[]).filter((type) => RULE_TYPE_META[type].kind === kind);
}

export function defaultTemplateFor(templates: MessageTemplate[], type: RuleType): MessageTemplate | undefined {
	const category = type === 'WEEKLY_SUMMARY' ? 'SUMMARY' : RULE_TYPE_META[type].kind === 'ALERT' ? 'ALERT' : 'RECOGNITION';
	return templates.find((tpl) => tpl.category === category && tpl.isDefault) ?? templates.find((tpl) => tpl.category === category);
}

export function badgeById(badges: BadgeDefinition[], id: string | null) {
	return id ? badges.find((b) => b.id === id) ?? null : null;
}

export const STATUS_ORDER: Record<RuleStatus, number> = { ACTIVE: 0, DRAFT: 1, PAUSED: 2 };
export const SEVERITY_ORDER: Record<RuleSeverity, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };

// ============ Form helpers ============

export interface RuleFormValues {
	name: string;
	description: string;
	type: RuleType;
	severity: RuleSeverity;
	burnoutLevel: 'LOW' | 'MEDIUM' | 'HIGH';
	conditions: RuleCondition[];
	conditionLogic: 'ALL' | 'ANY';
	scope: {
		agentIds: string[];
		supervisorIds: string[];
		campaignIds: string[];
		linesOfBusiness: string[];
		campaignTypes: ('INBOUND' | 'OUTBOUND' | 'BLENDED')[];
	};
	recipients: ('AGENT' | 'SUPERVISOR' | 'QA_MANAGER')[];
	channels: ('INBOX' | 'EMAIL' | 'DASHBOARD')[];
	escalationEnabled: boolean;
	escalationAfterHours: number;
	templateId: string | null;
	subject: string;
	body: string;
	cooldownDays: number;
	maxPerWeekEnabled: boolean;
	maxPerWeek: number;
	quietHoursEnabled: boolean;
	quietHoursFrom: string;
	quietHoursTo: string;
	schedule: {
		dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
		time: string;
		timezone: string;
		includedAreas: EvaluationArea[];
		includeTeamComparison: boolean;
	};
	badgeId: string | null;
	visibility: 'PRIVATE' | 'TEAM_FEED';
	celebrationEmoji: string;
}

const nextConditionId = (() => { let c = 1000; return () => `cond-${++c}`; })();

function buildDefaultCondition(mode: 'THRESHOLD' | 'RANGE' | 'PERCENT_CHANGE' | 'CONSECUTIVE'): RuleCondition {
	return {
		id: nextConditionId(),
		metricId: 'QA_OVERALL_SCORE',
		subItem: null,
		mode,
		operator: 'LT',
		value: 0,
		value2: null,
		changeDirection: 'DECREASE',
		changePercent: 10,
		consecutiveCount: 3,
		window: 'LAST_7_DAYS',
		windowSize: 10,
	};
}

export function buildRuleFormValues(
	type: RuleType,
	existing: TriggerRule | null,
	templates: MessageTemplate[],
	defaultSupervisorIds: string[],
	preset?: Partial<RuleFormValues>
): RuleFormValues {
	if (existing) {
		return {
			name: existing.name,
			description: existing.description,
			type: existing.type,
			severity: existing.severity,
			burnoutLevel: existing.burnoutLevel ?? 'LOW',
			conditions: existing.conditions,
			conditionLogic: existing.conditionLogic,
			scope: existing.scope,
			recipients: existing.delivery.recipients,
			channels: existing.delivery.channels,
			escalationEnabled: existing.delivery.escalationEnabled,
			escalationAfterHours: existing.delivery.escalationAfterHours,
			templateId: existing.message.templateId,
			subject: existing.message.subject,
			body: existing.message.body,
			cooldownDays: existing.frequency.cooldownDays,
			maxPerWeekEnabled: existing.frequency.maxPerWeek !== null,
			maxPerWeek: existing.frequency.maxPerWeek ?? 2,
			quietHoursEnabled: existing.frequency.quietHoursEnabled,
			quietHoursFrom: existing.frequency.quietHoursFrom,
			quietHoursTo: existing.frequency.quietHoursTo,
			schedule: existing.schedule ?? {
				dayOfWeek: 'FRIDAY',
				time: '17:00',
				timezone: 'America/Santo_Domingo',
				includedAreas: ['QUALITY_ASSURANCE', 'COMPLIANCE', 'SENTIMENT_EMOTION', 'BUSINESS_INSIGHTS'],
				includeTeamComparison: true,
			},
			badgeId: existing.recognition?.badgeId ?? null,
			visibility: existing.recognition?.visibility ?? 'TEAM_FEED',
			celebrationEmoji: existing.recognition?.celebrationEmoji ?? '🎉',
		};
	}

	const meta = RULE_TYPE_META[type];
	const severity = type === 'BURNOUT_RISK' ? 'CRITICAL' as const
		: type === 'METRIC_ALERT' ? 'WARNING' as const
			: type === 'TREND_WARNING' ? 'WARNING' as const
				: 'INFO' as const;

	const defaultTemplate = defaultTemplateFor(templates, type);
	const conditions = meta.hasConditions
		? [buildDefaultCondition(meta.allowedModes[0])]
		: [];

	return {
		name: '',
		description: '',
		type,
		severity,
		burnoutLevel: 'LOW',
		conditions,
		conditionLogic: 'ALL',
		scope: {
			agentIds: [],
			supervisorIds: defaultSupervisorIds,
			campaignIds: [],
			linesOfBusiness: [],
			campaignTypes: [],
		},
		recipients: type === 'BURNOUT_RISK' ? ['SUPERVISOR', 'QA_MANAGER'] : ['AGENT', 'SUPERVISOR'],
		channels: ['INBOX'],
		escalationEnabled: false,
		escalationAfterHours: 24,
		templateId: defaultTemplate?.id ?? null,
		subject: defaultTemplate?.subject ?? '',
		body: defaultTemplate?.body ?? '',
		cooldownDays: 3,
		maxPerWeekEnabled: false,
		maxPerWeek: 2,
		quietHoursEnabled: false,
		quietHoursFrom: '20:00',
		quietHoursTo: '08:00',
		schedule: {
			dayOfWeek: 'FRIDAY',
			time: '17:00',
			timezone: 'America/Santo_Domingo',
			includedAreas: ['QUALITY_ASSURANCE', 'COMPLIANCE', 'SENTIMENT_EMOTION', 'BUSINESS_INSIGHTS'],
			includeTeamComparison: true,
		},
		badgeId: null,
		visibility: 'TEAM_FEED',
		celebrationEmoji: '🎉',
		...preset,
	};
}

export function formValuesToRule(
	values: RuleFormValues,
	existing: TriggerRule | null,
	meta: { id: string; createdBy: string; createdByRole: 'SUPERVISOR' | 'QA_MANAGER'; status: RuleStatus }
): TriggerRule {
	const now = new Date().toISOString();
	return {
		id: meta.id,
		kind: RULE_TYPE_META[values.type].kind,
		type: values.type,
		name: values.name,
		description: values.description,
		severity: values.severity,
		status: meta.status,
		conditions: values.conditions,
		conditionLogic: values.conditionLogic,
		scope: values.scope,
		delivery: {
			recipients: values.recipients,
			channels: values.channels,
			escalationEnabled: values.escalationEnabled,
			escalationAfterHours: values.escalationAfterHours,
		},
		message: {
			templateId: values.templateId,
			subject: values.subject,
			body: values.body,
		},
		frequency: {
			cooldownDays: values.cooldownDays,
			maxPerWeek: values.maxPerWeekEnabled ? values.maxPerWeek : null,
			quietHoursEnabled: values.quietHoursEnabled,
			quietHoursFrom: values.quietHoursFrom,
			quietHoursTo: values.quietHoursTo,
		},
		schedule: values.type === 'WEEKLY_SUMMARY' ? values.schedule : null,
		burnoutLevel: values.type === 'BURNOUT_RISK' ? values.burnoutLevel : null,
		recognition: RULE_TYPE_META[values.type].kind === 'RECOGNITION'
			? {
				badgeId: values.badgeId,
				visibility: values.visibility,
				celebrationEmoji: values.celebrationEmoji,
			}
			: null,
		stats: existing?.stats ?? { firedLast7Days: 0, firedLast30Days: 0, lastFiredAt: null },
		createdBy: meta.createdBy,
		createdByRole: meta.createdByRole,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
	};
}

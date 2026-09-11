import { create } from 'zustand';
import type {
	BadgeDefinition, MessageTemplate, TriggerActivityEntry, TriggerRule, RuleStatus,
} from '~/models/qa';
import type { AgentNotification } from '~/models/qa/notifications';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import {
	MOCK_ACTIVITY, MOCK_BADGES, MOCK_RULES, MOCK_TEMPLATES, NOW_ISO,
} from '~/modules/qa/triggers/mockData';

let idCounter = 100;
export const nextId = (prefix: string) => `${prefix}-${String(++idCounter).padStart(3, '0')}`;

interface TriggerRulesState {
	rules: TriggerRule[];
	badges: BadgeDefinition[];
	templates: MessageTemplate[];
	activity: TriggerActivityEntry[];

	addRule: (rule: TriggerRule) => void;
	updateRule: (rule: TriggerRule) => void;
	deleteRule: (ruleId: string) => void;
	duplicateRule: (ruleId: string) => TriggerRule | null;
	setRuleStatus: (ruleId: string, status: RuleStatus) => void;

	addBadge: (badge: BadgeDefinition) => void;
	updateBadge: (badge: BadgeDefinition) => void;
	setBadgeStatus: (badgeId: string, status: BadgeDefinition['status']) => void;

	addTemplate: (template: MessageTemplate) => void;
	updateTemplate: (template: MessageTemplate) => void;
	deleteTemplate: (templateId: string) => void;
	setDefaultTemplate: (templateId: string) => void;

	acknowledgeActivity: (activityId: string) => void;
	/** Appends an activity entry and pushes an inbox notification (demo of the end-to-end flow). */
	sendTest: (entry: TriggerActivityEntry, notification: AgentNotification) => void;
}

export const useTriggerRulesStore = create<TriggerRulesState>((set, get) => ({
	rules: MOCK_RULES,
	badges: MOCK_BADGES,
	templates: MOCK_TEMPLATES,
	activity: MOCK_ACTIVITY,

	addRule: (rule) => set((s) => ({ rules: [rule, ...s.rules] })),
	updateRule: (rule) => set((s) => ({ rules: s.rules.map((r) => (r.id === rule.id ? { ...rule, updatedAt: NOW_ISO } : r)) })),
	deleteRule: (ruleId) => set((s) => ({ rules: s.rules.filter((r) => r.id !== ruleId) })),
	duplicateRule: (ruleId) => {
		const source = get().rules.find((r) => r.id === ruleId);
		if (!source) return null;
		const copy: TriggerRule = {
			...source,
			id: nextId(source.kind === 'ALERT' ? 'ALR' : 'REC'),
			name: `${source.name} (copy)`,
			status: 'DRAFT',
			stats: { firedLast7Days: 0, firedLast30Days: 0, lastFiredAt: null },
			createdAt: NOW_ISO,
			updatedAt: NOW_ISO,
		};
		set((s) => ({ rules: [copy, ...s.rules] }));
		return copy;
	},
	setRuleStatus: (ruleId, status) => set((s) => ({ rules: s.rules.map((r) => (r.id === ruleId ? { ...r, status, updatedAt: NOW_ISO } : r)) })),

	addBadge: (badge) => set((s) => ({ badges: [badge, ...s.badges] })),
	updateBadge: (badge) => set((s) => ({ badges: s.badges.map((b) => (b.id === badge.id ? { ...badge, updatedAt: NOW_ISO } : b)) })),
	setBadgeStatus: (badgeId, status) => set((s) => ({ badges: s.badges.map((b) => (b.id === badgeId ? { ...b, status } : b)) })),

	addTemplate: (template) => set((s) => ({ templates: [template, ...s.templates] })),
	updateTemplate: (template) => set((s) => ({ templates: s.templates.map((t) => (t.id === template.id ? { ...template, updatedAt: NOW_ISO } : t)) })),
	deleteTemplate: (templateId) => set((s) => ({ templates: s.templates.filter((t) => t.id !== templateId) })),
	setDefaultTemplate: (templateId) => set((s) => {
		const target = s.templates.find((t) => t.id === templateId);
		if (!target) return {};
		return { templates: s.templates.map((t) => (t.category === target.category ? { ...t, isDefault: t.id === templateId } : t)) };
	}),

	acknowledgeActivity: (activityId) => set((s) => ({
		activity: s.activity.map((a) => (a.id === activityId ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: NOW_ISO } : a)),
	})),
	sendTest: (entry, notification) => {
		const notificationStore = useNotificationStore.getState();
		notificationStore.setNotifications([notification, ...notificationStore.notifications]);
		set((s) => ({
			activity: [entry, ...s.activity],
			rules: s.rules.map((r) => (r.id === entry.ruleId
				? { ...r, stats: { ...r.stats, firedLast7Days: r.stats.firedLast7Days + 1, firedLast30Days: r.stats.firedLast30Days + 1, lastFiredAt: entry.firedAt } }
				: r)),
		}));
	},
}));

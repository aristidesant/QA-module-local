# Triggers & Auto-driven Recognition (Supervisor / QA Manager) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute tasks **in order**; every task compiles on its own.

**Goal:** Build the complete, navigable **Triggers** section for the Supervisor and QA Manager role previews: automatic alert rules, auto-driven recognition rules, a configurable badge catalog, a reusable message-template library, and an activity log of everything that fired — all mock-driven, fully interactive (create / edit / duplicate / pause / delete / send test), in dark & light mode, i18n-ready.

**Architecture:** One new QA module `src/modules/qa/triggers/` mounted at `/qa/supervisor/triggers` and `/qa/qa-manager/triggers` (same page component, role read from the URL). A single new domain model file (`src/models/qa/triggerRules.ts`), one Zustand store seeded from module-local mock data (`src/stores/qa/triggerRulesStore.ts`), and one i18n namespace (`qa.triggers`). Two legacy routes (`/qa/auto-triggers`, `/qa/qamanager/admin/triggers`) become redirects to the new page; legacy files are left untouched. "Send test" writes into the existing Inbox store so the flow is demonstrable end-to-end.

**Tech Stack:** React 19, React Router v7, Mantine v9.2 (`core`, `form`, `dates`, `modals`, `notifications`), TanStack Table v8 via `BaseTable`, Zustand v5, `@tabler/icons-react`, react-i18next.

**Spec (user, condensed):** Triggers section for Supervisor + QA Manager (same privileges for now). Rules based on nominal values, trends, percentage decline/increase, on any evaluated aspect (QA: critical business / non-critical / critical compliance / critical end-user errors; Compliance: Security / Regulatory / Legal + sub-items; Sentiment & Emotion; Business Insights). Rule types: weekly summary, metric alert, trend warning (+ burnout risk, approved). Positive triggers: auto-driven recognition with predefined messages (by the QA Manager), badges configurable for consistent behaviour. Recipients configurable: agent, supervisor, or both. Research other platforms and adopt what fits. **No loose ends**: every table opens a detail, every element has its interactions, filters, tabs.

**User decisions (2026-09-10):** new section + redirect legacy · 5 tabs (Alerts · Recognition · Badges · Templates · Activity) · editor = `AppDrawer` xl with sectioned form + live preview · Burnout Risk included as an alert rule type.

---

## Global Constraints

- **Design-session rules (DESIGN_ROLE.md):** mock data only, no API calls, no backend work. Do **not** run `npm run dev`, tests, or `git commit` unless the user explicitly asks in the execution session. `npm run typecheck` is allowed and required after every task.
- Mantine v9 only; **CSS Modules** for styles, no inline `style=` (except with an `// inline-style-allow:` comment). Colors only through `var(--mantine-color-*)` / `light-dark()` / Mantine color names. Must look right in **dark and light** mode.
- Mandatory primitives: `SectionCard` (`~/components/SectionCard`), `AppDrawer` (`~/components/AppDrawer`, never Mantine `Drawer`), `BaseTable` (`~/components/BaseTable`). Also reuse `EmptyState`, `FilterContainer`, `StatCard`, `InlineNotice`, `PaginationControls`, `ContentContainer`.
- Forms: `@mantine/form` `useForm` + `form.getInputProps`. Confirmations: `modals.openConfirmModal` from `@mantine/modals`. Toasts: `notifySuccess` / `notifyWarning` from `~/modules/qa/utils/notifications`.
- Every user-facing string goes through `useTranslation('qa.triggers')` — **add both** `src/locales/en/qa.triggers.json` and `src/locales/es/qa.triggers.json` (namespaces auto-register via `import.meta.glob`). Mock content (rule names, template bodies, agent names) stays English like the rest of the repo mocks.
- TypeScript strict, no `any`. Code and comments in English. Component folders: `Name/Name.tsx` + `Name.module.css` (only if styles needed) + `index.ts` (`export { default } from './Name';`).
- Do **not** edit `src/modules/qa/dashboard/mockData.ts` (3.2k lines) or any legacy trigger file (`AutoTriggersPage`, `AutoTriggersManager`, `GlobalTriggersConfigPanel`, `models/qa/triggers.ts`, `alertConfiguration.ts`). The only touched pre-existing files are listed under *Modified Files*.
- A pre-existing repo-wide TS error may exist (see `TASK-3-COMPLETION.md`). "Typecheck passes" means **no errors in files created/modified by this plan**.

---

## Research → what we adopt (for the plan reader)

| Platform pattern | Adopted here |
|---|---|
| Datadog monitors: threshold + evaluation window, warning/critical levels, recovery, renotify intervals to avoid alert fatigue ([1](https://www.datadoghq.com/blog/best-practices-to-prevent-alert-fatigue/), [2](https://webeyez.com/insights/guides/datadog-monitor-conditions-guide)) | `severity` INFO/WARNING/CRITICAL, `window` (per call / last N calls / 7-14-30 days), **Frequency guard** (cooldown days, max per week, quiet hours), live "N of M agents match today" preview |
| Zendesk triggers: "meet ALL / ANY of the conditions", ordered actions, usage stats per trigger | `conditionLogic` ALL/ANY with multiple conditions, per-rule `stats` (fired 7d/30d, last fired) shown in the table |
| Zendesk QA: workspace score threshold colors red/green ([3](https://support.zendesk.com/hc/en-us/articles/7043700991514-Setting-a-performance-reporting-threshold-in-Zendesk-QA)) | Metric catalog carries `higherIsBetter` + unit so thresholds render with the right suffix and color |
| Playvox Motivation: badges awarded automatically by triggers or manually, levels, custom level-up message ([4](https://help.playvox.com/en/articles/6104118-karma-points-and-recognition-badges)) | Badge catalog with tiers (Bronze/Silver/Gold), `autoAward` badge ⇄ linked recognition rule, holders list |
| Bonusly / Assembly: automated milestone recognition, templated celebratory messages ([5](https://bonusly.com/product/celebrations), [6](https://joinassembly.com/blog/best-practices-for-celebrating-milestones-and-anniversaries)) | Recognition rule types Milestone / Streak / Improvement / Badge award, message templates with variables, visibility private vs team feed |
| CallMiner Coach / Observe.AI: alerts feed coaching actions ([7](https://callminer.com/products/coach)) | Activity entries link to Agent Analytics and Inbox; escalation to QA Manager when not acknowledged |

---

## File Structure

### New files

```
src/models/qa/triggerRules.ts                              — domain types (rules, badges, templates, activity, agent snapshot)
src/stores/qa/triggerRulesStore.ts                         — Zustand store: CRUD for rules/badges/templates, activity, test send
src/locales/en/qa.triggers.json                            — namespace (full content in Task 3)
src/locales/es/qa.triggers.json                            — Spanish mirror
src/modules/qa/triggers/
  constants.ts                                             — metric catalog, type metadata, colors, option lists, template variables
  mockData.ts                                              — agents snapshot, rules, badges, templates, activity builder
  helpers.ts                                               — describeCondition, evaluateRulePreview, interpolateTemplate, form<->rule mappers
  TriggersPage/TriggersPage.tsx (+ .module.css, index.ts)  — page shell: header, KPI strip, tabs (URL ?tab=)
  components/
    TriggersKpiStrip/TriggersKpiStrip.tsx (+ index)
    RuleTypePickerModal/RuleTypePickerModal.tsx (+ .module.css, index)
    RulesTab/RulesTab.tsx (+ index)                        — used twice: kind='ALERT' and kind='RECOGNITION'
    RulesFilters/RulesFilters.tsx (+ index)
    RulesTable/RulesTable.tsx (+ .module.css, index)
    RuleDetailDrawer/RuleDetailDrawer.tsx (+ .module.css, index)
    RuleEditorDrawer/RuleEditorDrawer.tsx (+ .module.css, index)
    RuleEditorDrawer/sections/BasicsSection.tsx
    RuleEditorDrawer/sections/ConditionSection.tsx
    RuleEditorDrawer/sections/ScopeSection.tsx
    RuleEditorDrawer/sections/DeliverySection.tsx
    RuleEditorDrawer/sections/MessageSection.tsx
    RuleEditorDrawer/sections/FrequencySection.tsx
    RuleEditorDrawer/sections/ScheduleSection.tsx
    RuleEditorDrawer/sections/RecognitionSection.tsx
    ConditionRow/ConditionRow.tsx (+ .module.css, index)   — shared by rule editor and badge editor
    PreviewPanel/PreviewPanel.tsx (+ .module.css, index)
    ConditionSummaryList/ConditionSummaryList.tsx (+ index) — read-only condition cards (detail drawers, badge cards)
    BadgesTab/BadgesTab.tsx (+ index)
    BadgeCard/BadgeCard.tsx (+ .module.css, index)
    BadgeDetailDrawer/BadgeDetailDrawer.tsx (+ index)
    BadgeEditorDrawer/BadgeEditorDrawer.tsx (+ .module.css, index)
    TemplatesTab/TemplatesTab.tsx (+ index)
    TemplateEditorDrawer/TemplateEditorDrawer.tsx (+ index)
    ActivityTab/ActivityTab.tsx (+ index)
    ActivityFilters/ActivityFilters.tsx (+ index)
    ActivityTable/ActivityTable.tsx (+ index)
    ActivityDetailDrawer/ActivityDetailDrawer.tsx (+ index)
```

### Modified files

- `src/models/qa/index.ts` — add `export * from './triggerRules';`
- `src/stores/qa/notificationStore.ts` — add `addNotification(notification)` action (used by "Send test")
- `src/modules/qa/qaNamespaces.ts` — map the two new route ids to `qa.triggers`
- `src/routes.tsx` — lazy import `TriggersPage`, add 2 routes, turn 2 legacy routes into `<Navigate>` redirects, remove 2 now-unused lazy consts
- `src/components/Sidebar/Sidebar.tsx` — fix 3 nav entries (`role-preview-team-triggers`, `role-preview-admin-triggers`, `qa-auto-triggers`)
- `src/locales/en/common.json`, `src/locales/es/common.json` — add `sidebar.rolePreview.items.triggers`

### Reference files (read-only, mirror their patterns)

- `src/modules/qa/forms/ErrorTypesPage/ErrorTypesPage.tsx` — CRUD page with `useForm`, `modals.openConfirmModal`, `BaseTable`, `EmptyState`
- `src/modules/qa/evaluations/DisputeDrawer/DisputeDrawer.tsx` + `.module.css` — `AppDrawer size='xl'` with `classNames={{ body }}` and footer-as-last-child
- `src/modules/qa/agent/rankings/components/RankingDetailDrawer.tsx` — drawer with Mantine `Tabs`
- `src/modules/qa/dashboard/pages/InboxPage.tsx`, `src/modules/qa/agent/inbox/InboxFilters.tsx` — filter bar + client-side filtering
- `src/modules/qa/agent/analytics/tabs/ComplianceAnalyticsTab.tsx:103-134` — the 8 compliance sub-items (keys reused verbatim)
- `src/modules/qa/emotion-sentiment/types.ts` — `Emotion` (13 values) + `EMOTION_SENTIMENT_MAP`
- `src/models/qa/notifications.ts` — `AgentNotification` (shape pushed to the Inbox on "Send test")
- `src/components/Sidebar/Sidebar.tsx:563-735` — role preview nav arrays
- `src/modules/configurations/ConfigurationsPage/ConfigurationsPage.tsx` — `Tabs` with `leftSection` icons

---

## Task 1: Domain model + constants

**Files:**
- Create: `src/models/qa/triggerRules.ts`
- Modify: `src/models/qa/index.ts`
- Create: `src/modules/qa/triggers/constants.ts`

- [ ] **Step 1: Create `src/models/qa/triggerRules.ts`** (paste as-is)

```typescript
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
```

- [ ] **Step 2: Export from the models barrel** — add `export * from './triggerRules';` as the last line of `src/models/qa/index.ts`.

- [ ] **Step 3: Create `src/modules/qa/triggers/constants.ts`** (paste as-is; icons are imported as components, labels are i18n keys resolved by consumers)

```typescript
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
```

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```
Expected: no errors in `triggerRules.ts`, `index.ts`, `constants.ts`.

- [ ] **Step 5: Commit** *(only if the user authorized commits in this session)* — `feat(qa-triggers): add trigger rules domain model and constants`

---

## Task 2: Mock data + Zustand store

**Files:**
- Create: `src/modules/qa/triggers/mockData.ts`
- Create: `src/stores/qa/triggerRulesStore.ts`
- Modify: `src/stores/qa/notificationStore.ts`

**Interfaces — Produces:** `TRIGGER_AGENTS`, `TRIGGER_SUPERVISORS`, `TRIGGER_CAMPAIGNS`, `MOCK_RULES`, `MOCK_BADGES`, `MOCK_TEMPLATES`, `MOCK_ACTIVITY`, and `useTriggerRulesStore`.

- [ ] **Step 1: Create `mockData.ts`** — build it with small factory helpers so the file stays ~450 lines. Requirements (implement exactly):

```typescript
// src/modules/qa/triggers/mockData.ts
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

// Helper that builds one agent snapshot: base metrics + % changes + 10 jittered recent calls.
// Signature: buildAgent(id, name, supervisorIndex, team, campaignIds, overrides: Partial<Record<TriggerMetricId, number>>, changes: Partial<Record<TriggerMetricId, number>>, seed)
// Defaults for every metric come from a "healthy" profile:
//   QA_OVERALL_SCORE 88, QA_ECN_COUNT 0, QA_ENC_COUNT 2, QA_ECC_COUNT 0, QA_ECUF_COUNT 0, QA_AUTO_FAIL_COUNT 0,
//   COMPLIANCE_OVERALL_SCORE 91, *_SECURITY 93, *_REGULATORY 90, *_LEGAL 92, COMPLIANCE_VIOLATION_COUNT 0,
//   CUSTOMER_SENTIMENT_SCORE 4.1, AGENT_SENTIMENT_SCORE 4.0, POSITIVE_EMOTION_CALL_SHARE 62, NEGATIVE_EMOTION_CALL_SHARE 18,
//   SENTIMENT_RECOVERY_COUNT 3, BI_EARLY_OBJECTION_RATE 18, BI_UNHANDLED_OBJECTION_RATE 12, BI_COMPETITOR_PLUS_COST_RATE 10,
//   BI_MISTARGETED_OFFER_RATE 8, BI_NON_CONVERSION_RATE 48.
// `changes` default 0 for every metric. recentCalls: 10 entries, each metric = base ± (rand-0.5)*2*jitter, clamped to catalog min/max,
// jitter = 8 for PERCENT, 0.6 for SCORE_5, 1 for COUNT (rounded for COUNT).
```

Create **12 agents** with these deliberate profiles so demo rules match a few agents each. Ids and names are the **shared roster** used by the Dashboards and Team Analytics plans (Team 1 = supervisor Maria García `SUP-001`, Team 2 = Juan Pérez `SUP-002`, Team 3 = Laura Gómez `SUP-003`), so deep links resolve across sections:

| id | name | supervisor | team | campaigns | notable overrides |
|---|---|---|---|---|---|
| AGT-001 | Sarah Johnson | SUP-001 | Team 1 | camp-001 | healthy; CUSTOMER_SENTIMENT 4.6, recent calls all ≥ 4.5 (streak) |
| AGT-002 | Mike Chen | SUP-001 | Team 1 | camp-001, camp-003 | COMPLIANCE_OVERALL 100 with recent calls all 100 (streak 10); COMPLIANCE_SECURITY 99 |
| AGT-004 | John Smith | SUP-001 | Team 1 | camp-001 | changes QA +11 (improvement); QA_OVERALL 90 |
| AGT-005 | Emma Davis | SUP-001 | Team 1 | camp-001 | AGENT_SENTIMENT 2.9, NEGATIVE_SHARE 33 (burnout MEDIUM) |
| AGT-006 | David Brown | SUP-001 | Team 1 | camp-001, camp-003 | QA_OVERALL 62, QA_ECC_COUNT 1, changes QA −12; AGENT_SENTIMENT 2.4, NEGATIVE_SHARE 44, changes AGENT_SENTIMENT −14 (burnout HIGH) |
| AGT-007 | Lisa Wong | SUP-001 | Team 1 | camp-003 | COMPLIANCE_OVERALL 78, changes COMPLIANCE −9; recent calls: 3 most recent CUSTOMER_SENTIMENT < 2 |
| AGT-008 | Sofia Rodríguez | SUP-002 | Team 2 | camp-002 | BI_UNHANDLED_OBJECTION 34 |
| AGT-010 | Carlos Vega | SUP-002 | Team 2 | camp-002, camp-004 | COMPLIANCE_VIOLATION_COUNT 2, changes COMPLIANCE −11 |
| AGT-011 | Lucía Torres | SUP-002 | Team 2 | camp-004 | healthy; SENTIMENT_RECOVERY_COUNT 7 |
| AGT-012 | Diego Ramírez | SUP-002 | Team 2 | camp-002 | CUSTOMER_SENTIMENT 3.1, changes CUSTOMER_SENTIMENT −17 |
| AGT-015 | Camila Herrera | SUP-003 | Team 3 | camp-003, camp-001 | QA_OVERALL 96 (perfect week) |
| AGT-017 | Nina Patel | SUP-003 | Team 3 | camp-003 | QA_AUTO_FAIL_COUNT 3, QA_ENC_COUNT 6 |

Export `TRIGGER_AGENTS: TriggerAgentSnapshot[]` and `TRIGGER_AGENT_OPTIONS: TriggerScopeOption[]` (value=id, label=name).

Add a `condition(partial)` factory returning a full `RuleCondition` with defaults `{ id: 'cond-' + counter, subItem: null, mode: 'THRESHOLD', operator: 'LT', value: 0, value2: null, changeDirection: 'DECREASE', changePercent: 10, consecutiveCount: 3, window: 'LAST_7_DAYS', windowSize: 10 }`, and a `rule(partial)` factory with defaults `{ severity: 'WARNING', status: 'ACTIVE', conditions: [], conditionLogic: 'ALL', scope: { agentIds: [], supervisorIds: [], campaignIds: [], linesOfBusiness: [], campaignTypes: [] }, delivery: { recipients: ['AGENT','SUPERVISOR'], channels: ['INBOX'], escalationEnabled: false, escalationAfterHours: 24 }, frequency: { cooldownDays: 3, maxPerWeek: null, quietHoursEnabled: false, quietHoursFrom: '20:00', quietHoursTo: '08:00' }, schedule: null, burnoutLevel: null, recognition: null, stats: { firedLast7Days: 0, firedLast30Days: 0, lastFiredAt: null }, createdBy: 'Maria García', createdByRole: 'SUPERVISOR', createdAt: '2026-08-01T09:00:00Z', updatedAt: '2026-09-01T09:00:00Z', description: '' }`.

**`MOCK_RULES`** (10 alerts + 7 recognitions):

| id | kind/type | name | severity/status | conditions (logic) | delivery | message (templateId) | extra | stats 7d/30d |
|---|---|---|---|---|---|---|---|---|
| ALR-001 | ALERT/METRIC_ALERT | Compliance score below 80% | CRITICAL/ACTIVE | COMPLIANCE_OVERALL_SCORE LT 80, LAST_7_DAYS | AGENT+SUPERVISOR, INBOX+EMAIL, escalation 24h | TPL-001 | — | 4/13, last 2026-09-09T10:12Z |
| ALR-002 | ALERT/METRIC_ALERT | Critical compliance error (ECC) on any call | CRITICAL/ACTIVE | QA_ECC_COUNT GTE 1, PER_CALL | SUPERVISOR+QA_MANAGER, INBOX+DASHBOARD | TPL-002 | cooldown 0 | 2/6 |
| ALR-003 | ALERT/TREND_WARNING | Customer sentiment drops 15% | WARNING/ACTIVE | CUSTOMER_SENTIMENT_SCORE PERCENT_CHANGE DECREASE 15, LAST_14_DAYS | AGENT+SUPERVISOR, INBOX | TPL-003 | — | 1/4 |
| ALR-004 | ALERT/TREND_WARNING | Three consecutive very negative calls | WARNING/ACTIVE | CUSTOMER_SENTIMENT_SCORE CONSECUTIVE LT 2 ×3, LAST_N_CALLS 10 | SUPERVISOR, INBOX | TPL-003 | — | 0/2 |
| ALR-005 | ALERT/WEEKLY_SUMMARY | Weekly team summary | INFO/ACTIVE | none | AGENT+SUPERVISOR, INBOX+EMAIL | TPL-004 | schedule FRIDAY 17:00 America/Santo_Domingo, all areas, comparison on | 1/4 |
| ALR-006 | ALERT/METRIC_ALERT | QA score below 75% | CRITICAL/ACTIVE | QA_OVERALL_SCORE LT 75, LAST_7_DAYS | AGENT+SUPERVISOR, INBOX+EMAIL, escalation 48h | TPL-001 | maxPerWeek 2 | 3/9 |
| ALR-007 | ALERT/METRIC_ALERT | Unhandled objection rate above 30% | WARNING/PAUSED | BI_UNHANDLED_OBJECTION_RATE GT 30, LAST_30_DAYS; scope campaign camp-002 | SUPERVISOR, INBOX | TPL-002 | — | 0/3 |
| ALR-008 | ALERT/BURNOUT_RISK | Burnout risk — high | CRITICAL/ACTIVE | ALL: AGENT_SENTIMENT_SCORE PERCENT_CHANGE DECREASE 10 LAST_14_DAYS; NEGATIVE_EMOTION_CALL_SHARE GT 40 LAST_7_DAYS; QA_OVERALL_SCORE PERCENT_CHANGE DECREASE 5 LAST_14_DAYS | SUPERVISOR+QA_MANAGER, INBOX+DASHBOARD | TPL-008 | burnoutLevel HIGH, quiet hours on | 1/2 |
| ALR-009 | ALERT/BURNOUT_RISK | Burnout risk — medium | WARNING/ACTIVE | ANY: AGENT_SENTIMENT_SCORE LT 3 LAST_7_DAYS; NEGATIVE_EMOTION_CALL_SHARE GT 30 LAST_7_DAYS | SUPERVISOR, INBOX | TPL-008 | burnoutLevel MEDIUM | 2/5 |
| ALR-010 | ALERT/METRIC_ALERT | Data-protection violation | CRITICAL/DRAFT | COMPLIANCE_VIOLATION_COUNT subItem dataProtection GTE 1, PER_CALL | QA_MANAGER, INBOX | TPL-002 | createdByRole QA_MANAGER, createdBy 'Laura Gómez' | 0/0 |
| REC-001 | RECOGNITION/STREAK | Sentiment & Emotion Master | INFO/ACTIVE | CUSTOMER_SENTIMENT_SCORE CONSECUTIVE GTE 4.5 ×3, LAST_N_CALLS 10 | AGENT+SUPERVISOR, INBOX | TPL-005 | recognition badge BDG-003, TEAM_FEED, 🎉 | 3/11 |
| REC-002 | RECOGNITION/MILESTONE | Compliance Master | INFO/ACTIVE | COMPLIANCE_OVERALL_SCORE CONSECUTIVE GTE 100 ×10, LAST_N_CALLS 10 | AGENT+SUPERVISOR, INBOX+EMAIL | TPL-006 | badge BDG-002, TEAM_FEED, 🏆 | 1/3 |
| REC-003 | RECOGNITION/IMPROVEMENT | QA improvement +10% | INFO/ACTIVE | QA_OVERALL_SCORE PERCENT_CHANGE INCREASE 10, LAST_30_DAYS | AGENT, INBOX | TPL-006 | badge BDG-008, PRIVATE, 🚀 | 2/5 |
| REC-004 | RECOGNITION/BADGE_AWARD | Mood Booster | INFO/ACTIVE | SENTIMENT_RECOVERY_COUNT GTE 5, LAST_30_DAYS | AGENT+SUPERVISOR, INBOX | TPL-007 | badge BDG-004, TEAM_FEED, 🌤️ | 1/2 |
| REC-005 | RECOGNITION/MILESTONE | Perfect QA week | INFO/ACTIVE | QA_OVERALL_SCORE GTE 95, LAST_7_DAYS | AGENT+SUPERVISOR, INBOX | TPL-006 | badge BDG-009, TEAM_FEED, ⭐ | 2/6 |
| REC-006 | RECOGNITION/BADGE_AWARD | Zero critical errors (30 days) | INFO/PAUSED | ALL: QA_ECN_COUNT LTE 0; QA_ECC_COUNT LTE 0; QA_ECUF_COUNT LTE 0 — all LAST_30_DAYS | AGENT, INBOX | TPL-007 | badge BDG-006, PRIVATE, ✅ | 0/4 |
| REC-007 | RECOGNITION/MILESTONE | Objection handler | INFO/DRAFT | BI_UNHANDLED_OBJECTION_RATE LT 10, LAST_30_DAYS | AGENT+SUPERVISOR, INBOX | TPL-006 | badge BDG-005, TEAM_FEED, 🎯 | 0/0 |

Rules' `message.subject/body` = copy of the referenced template's subject/body at creation (templates are starting points, rules own their text).

**`MOCK_BADGES`** (10):

| id | name | icon | color | area | tier | criteria (conditions) | autoAward / linkedRuleId | holders |
|---|---|---|---|---|---|---|---|---|
| BDG-001 | QA Master | ⭐ | yellow | QUALITY_ASSURANCE | GOLD | QA_OVERALL_SCORE CONSECUTIVE GTE 95 ×5 | false / null | AGT-015 |
| BDG-002 | Compliance Master | 🛡️ | grape | COMPLIANCE | GOLD | COMPLIANCE_OVERALL_SCORE CONSECUTIVE GTE 100 ×10 | true / REC-002 | AGT-002 |
| BDG-003 | Sentiment & Emotion Master | 😊 | teal | SENTIMENT_EMOTION | GOLD | CUSTOMER_SENTIMENT_SCORE CONSECUTIVE GTE 4.5 ×3 | true / REC-001 | AGT-001, AGT-011, AGT-004 |
| BDG-004 | Mood Booster | 🌤️ | orange | SENTIMENT_EMOTION | SILVER | SENTIMENT_RECOVERY_COUNT GTE 5 LAST_30_DAYS | true / REC-004 | AGT-011 |
| BDG-005 | Objection Handler | 🎯 | indigo | BUSINESS_INSIGHTS | SILVER | BI_UNHANDLED_OBJECTION_RATE LT 10 LAST_30_DAYS | true / REC-007 | — |
| BDG-006 | Zero Critical Errors | ✅ | green | QUALITY_ASSURANCE | SILVER | ECN/ECC/ECUF LTE 0 LAST_30_DAYS (ALL) | true / REC-006 | AGT-001, AGT-015, AGT-002 |
| BDG-007 | Consistency Streak | 🔥 | red | GENERAL | BRONZE | QA_OVERALL_SCORE CONSECUTIVE GTE 85 ×5 | false / null | AGT-001, AGT-004 |
| BDG-008 | Rising Star | 🚀 | cyan | GENERAL | BRONZE | QA_OVERALL_SCORE PERCENT_CHANGE INCREASE 10 LAST_30_DAYS | true / REC-003 | AGT-004 |
| BDG-009 | Perfect Week | 🏆 | yellow | QUALITY_ASSURANCE | SILVER | QA_OVERALL_SCORE GTE 95 LAST_7_DAYS | true / REC-005 | AGT-015 |
| BDG-010 | Security Sentinel | 🔐 | grape | COMPLIANCE | BRONZE | COMPLIANCE_SECURITY_SCORE GTE 98 LAST_30_DAYS | false / null | AGT-002, AGT-001 |

Holders `earnedAt` spread across Aug–Sep 2026; `team` from agent.

**`MOCK_TEMPLATES`** (8) — `usageCount` = number of rules above referencing it:

| id | name | category | isDefault | subject | body |
|---|---|---|---|---|---|
| TPL-001 | Metric alert — agent | ALERT | true | `{{metric_name}} needs attention` | `Hi {{agent_name}}, your {{metric_name}} is {{metric_value}} over the {{period}}, below the {{threshold}} target. Let's review a couple of calls together this week.` |
| TPL-002 | Metric alert — supervisor | ALERT | false | `[Alert] {{agent_name}} · {{metric_name}} {{metric_value}}` | `{{agent_name}} ({{campaign_name}}) reached {{metric_value}} on {{metric_name}} ({{period}}). Threshold: {{threshold}}. Open Analytics to review the calls behind this alert.` |
| TPL-003 | Trend warning | ALERT | false | `Downward trend on {{metric_name}}` | `Heads up {{agent_name}}: {{metric_name}} moved from its previous level to {{metric_value}} over the {{period}}. A quick check-in with {{supervisor_name}} can help turn this around.` |
| TPL-004 | Weekly summary | SUMMARY | true | `Your weekly performance summary` | `Hi {{agent_name}}, here is your summary for the {{period}}: QA, Compliance, Sentiment & Emotion and Business Insights. Compare yourself with the team average and see your next badge in Rankings.` |
| TPL-005 | Congratulations — streak | RECOGNITION | true | `🎉 {{streak_count}} in a row, {{agent_name}}!` | `Congratulations {{agent_name}}! {{streak_count}} consecutive calls with outstanding {{metric_name}}. You just earned the {{badge_name}} badge. Keep it up!` |
| TPL-006 | Milestone reached | RECOGNITION | false | `New milestone: {{badge_name}}` | `{{agent_name}}, you reached {{metric_value}} on {{metric_name}} over the {{period}}. That's the {{badge_name}} milestone — well done, the whole team noticed.` |
| TPL-007 | Badge earned | RECOGNITION | false | `You earned {{badge_name}}` | `Great work {{agent_name}}! The {{badge_name}} badge is now on your profile. Thanks for the consistency on {{campaign_name}}.` |
| TPL-008 | Burnout check-in (supervisor) | ALERT | false | `Check-in suggested: {{agent_name}}` | `{{agent_name}} shows signs of burnout risk ({{metric_name}} {{metric_value}}, {{period}}). Consider scheduling a 1:1, reviewing workload, or assigning LMS material from Analytics › Burnout Risk.` |

**`MOCK_ACTIVITY`**: implement `buildActivityLog(): TriggerActivityEntry[]` producing **40 entries** deterministically (use `seeded(7)`): cycle through the ACTIVE rules, pick an agent that plausibly matches (ALR-001→AGT-007, ALR-002→AGT-006, ALR-003→AGT-012, ALR-006→AGT-006, ALR-008→AGT-006, ALR-009→AGT-005, REC-001→AGT-001, REC-002→AGT-002, REC-003→AGT-004, REC-004→AGT-011, REC-005→AGT-015, ALR-005→ rotate agents), `firedAt` = NOW minus `i * 11` hours, `status` = SENT for i%4===0, ACKNOWLEDGED for i%4===1 (acknowledgedAt = firedAt + 3h), ESCALATED for i%9===2, SUPPRESSED for i%7===3, else SENT; `observedValue` = agent snapshot metric of the first condition; `conditionSummary` = plain string (e.g. `Compliance score < 80% · last 7 days`); `renderedMessage` = rule body with `{{agent_name}}` etc. replaced by simple values; `badgeId` from recognition. Export `MOCK_ACTIVITY = buildActivityLog()`.

- [ ] **Step 2: Add `addNotification` to `src/stores/qa/notificationStore.ts`** — in the interface add `addNotification: (notification: AgentNotification) => void;` and in the store `addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),`. Nothing else changes.

- [ ] **Step 3: Create `src/stores/qa/triggerRulesStore.ts`**

```typescript
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
		useNotificationStore.getState().addNotification(notification);
		set((s) => ({
			activity: [entry, ...s.activity],
			rules: s.rules.map((r) => (r.id === entry.ruleId
				? { ...r, stats: { ...r.stats, firedLast7Days: r.stats.firedLast7Days + 1, firedLast30Days: r.stats.firedLast30Days + 1, lastFiredAt: entry.firedAt } }
				: r)),
		}));
	},
}));
```

- [ ] **Step 4: Typecheck** → no errors in the three files.
- [ ] **Step 5: Commit** *(if authorized)* — `feat(qa-triggers): add mock data and trigger rules store`

---

## Task 3: Helpers, i18n, routes, sidebar

**Files:**
- Create: `src/modules/qa/triggers/helpers.ts`
- Create: `src/locales/en/qa.triggers.json`, `src/locales/es/qa.triggers.json`
- Modify: `src/modules/qa/qaNamespaces.ts`, `src/routes.tsx`, `src/components/Sidebar/Sidebar.tsx`, `src/locales/en/common.json`, `src/locales/es/common.json`
- Create (temporary placeholder, replaced in Task 4): `src/modules/qa/triggers/TriggersPage/TriggersPage.tsx` + `index.ts`

- [ ] **Step 1: Create `helpers.ts`** (paste; `t` is the `qa.triggers` translator)

```typescript
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

function compare(value: number, op: ComparisonOperator, target: number) {
	switch (op) {
		case 'LT': return value < target;
		case 'LTE': return value <= target;
		case 'GT': return value > target;
		case 'GTE': return value >= target;
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
```

- [ ] **Step 2: Create `src/locales/en/qa.triggers.json`** (paste in full; this defines every key used by later tasks)

```json
{
	"page": {
		"title": "Triggers & Recognition",
		"description": "Automatic alerts, auto-driven recognition and badges for your teams.",
		"eyebrow": {
			"supervisor": "Supervisor · Team 1 · Maria García",
			"qaManager": "QA Manager · All teams"
		},
		"newRule": "New rule",
		"tabs": {
			"alerts": "Alerts",
			"recognition": "Recognition",
			"badges": "Badges",
			"templates": "Templates",
			"activity": "Activity"
		}
	},
	"kpis": {
		"activeRules": "Active rules",
		"activeRulesSubtitle": "{{paused}} paused · {{drafts}} drafts",
		"alertsFired": "Alerts fired · 7 days",
		"recognitionsSent": "Recognitions sent · 7 days",
		"badgesAwarded": "Badges awarded · 30 days"
	},
	"kinds": { "ALERT": "Alert", "RECOGNITION": "Recognition" },
	"types": {
		"METRIC_ALERT": { "label": "Metric alert", "description": "Notify when a metric crosses a value or range you define.", "example": "Compliance score < 80% over the last 7 days" },
		"TREND_WARNING": { "label": "Trend warning", "description": "Notify on a percentage decline or a run of bad calls.", "example": "Customer sentiment drops 15% vs. the previous 14 days" },
		"WEEKLY_SUMMARY": { "label": "Weekly summary", "description": "Send each agent a digest of their metrics on a fixed day and time.", "example": "Every Friday at 17:00" },
		"BURNOUT_RISK": { "label": "Burnout risk", "description": "Combine sentiment, emotion and performance signals to flag agents at risk.", "example": "Agent sentiment ↓10% and negative emotions > 40%" },
		"MILESTONE": { "label": "Milestone", "description": "Celebrate when an agent reaches a goal.", "example": "QA score ≥ 95% this week" },
		"STREAK": { "label": "Streak", "description": "Celebrate consecutive calls that meet a standard.", "example": "3 consecutive calls with sentiment ≥ 4.5" },
		"IMPROVEMENT": { "label": "Improvement", "description": "Celebrate a percentage increase vs. the previous period.", "example": "QA score +10% in 30 days" },
		"BADGE_AWARD": { "label": "Badge award", "description": "Award a badge automatically when its criteria are met.", "example": "5 sentiment recoveries in 30 days → Mood Booster" }
	},
	"areas": {
		"QUALITY_ASSURANCE": "Quality Assurance",
		"COMPLIANCE": "Compliance",
		"SENTIMENT_EMOTION": "Sentiment & Emotion",
		"BUSINESS_INSIGHTS": "Business Insights",
		"GENERAL": "General",
		"ALL": "All areas"
	},
	"metrics": {
		"QA_OVERALL_SCORE": "QA score",
		"QA_ECN_COUNT": "Critical business errors",
		"QA_ENC_COUNT": "Non-critical errors",
		"QA_ECC_COUNT": "Critical compliance errors",
		"QA_ECUF_COUNT": "Critical end-user errors",
		"QA_AUTO_FAIL_COUNT": "Auto-fails",
		"COMPLIANCE_OVERALL_SCORE": "Compliance score",
		"COMPLIANCE_SECURITY_SCORE": "Security score",
		"COMPLIANCE_REGULATORY_SCORE": "Regulatory score",
		"COMPLIANCE_LEGAL_SCORE": "Legal score",
		"COMPLIANCE_VIOLATION_COUNT": "Compliance violations",
		"CUSTOMER_SENTIMENT_SCORE": "Customer sentiment",
		"AGENT_SENTIMENT_SCORE": "Agent sentiment",
		"POSITIVE_EMOTION_CALL_SHARE": "Calls with positive emotion",
		"NEGATIVE_EMOTION_CALL_SHARE": "Calls with negative emotion",
		"SENTIMENT_RECOVERY_COUNT": "Sentiment recoveries (negative → positive)",
		"BI_EARLY_OBJECTION_RATE": "Early objection rate",
		"BI_UNHANDLED_OBJECTION_RATE": "Unhandled objection rate",
		"BI_COMPETITOR_PLUS_COST_RATE": "Competitor + cost mentions",
		"BI_MISTARGETED_OFFER_RATE": "Mis-targeted offer rate",
		"BI_NON_CONVERSION_RATE": "Non-conversion rate"
	},
	"subItems": {
		"any": "Any sub-item",
		"dataProtection": "Data Protection",
		"disclosureCompliance": "Disclosure Compliance",
		"cobranzaRegulada": "Billing Process",
		"transparenciaConsentimiento": "Transparency",
		"amenazasTradicionales": "Threats",
		"rrss": "Social Media",
		"superintendenciaBancos": "Banking Superintendence",
		"noLlamarList": "Do-Not-Call",
		"ELATION": "Elation", "GRATITUDE": "Gratitude", "JOY": "Joy", "RELIEF": "Relief", "SATISFACTION": "Satisfaction",
		"NEUTRAL": "Neutral", "SURPRISE": "Surprise", "FRUSTRATION": "Frustration", "SADNESS": "Sadness",
		"FEAR": "Fear", "DISAPPOINTMENT": "Disappointment", "ANGER": "Anger", "RAGE": "Rage"
	},
	"modes": {
		"THRESHOLD": "Nominal value",
		"RANGE": "Within a range",
		"PERCENT_CHANGE": "Percentage change",
		"CONSECUTIVE": "Consecutive calls"
	},
	"operators": { "LT": "Less than", "LTE": "Less or equal", "GT": "Greater than", "GTE": "Greater or equal" },
	"directions": { "DECREASE": "Decline of at least", "INCREASE": "Increase of at least" },
	"windows": {
		"PER_CALL": "Per call",
		"LAST_N_CALLS": "Last N calls",
		"LAST_N_CALLS_n": "last {{count}} calls",
		"LAST_7_DAYS": "Last 7 days",
		"LAST_14_DAYS": "Last 14 days",
		"LAST_30_DAYS": "Last 30 days"
	},
	"logic": { "ALL": "Match ALL conditions", "ANY": "Match ANY condition" },
	"conditions": {
		"between": "between {{from}} and {{to}}",
		"change": { "DECREASE": "declines ≥ {{percent}}%", "INCREASE": "increases ≥ {{percent}}%" },
		"consecutive": "{{count}} consecutive calls with {{metric}} {{operator}} {{value}}",
		"scheduled": "Every {{day}} at {{time}}",
		"none": "No conditions",
		"more": "+{{count}} more ({{logic}})"
	},
	"days": { "MONDAY": "Monday", "TUESDAY": "Tuesday", "WEDNESDAY": "Wednesday", "THURSDAY": "Thursday", "FRIDAY": "Friday", "SATURDAY": "Saturday", "SUNDAY": "Sunday" },
	"severity": { "INFO": "Info", "WARNING": "Warning", "CRITICAL": "Critical" },
	"status": { "ACTIVE": "Active", "PAUSED": "Paused", "DRAFT": "Draft" },
	"recipients": { "AGENT": "Agent", "SUPERVISOR": "Supervisor", "QA_MANAGER": "QA Manager" },
	"channels": { "INBOX": "Inbox", "EMAIL": "Email", "DASHBOARD": "Dashboard" },
	"tiers": { "BRONZE": "Bronze", "SILVER": "Silver", "GOLD": "Gold" },
	"visibility": { "PRIVATE": "Private to the agent", "TEAM_FEED": "Team feed" },
	"burnoutLevels": { "LOW": "Low", "MEDIUM": "Medium", "HIGH": "High" },
	"templateCategories": { "ALERT": "Alert", "RECOGNITION": "Recognition", "SUMMARY": "Summary" },
	"activityStatus": { "SENT": "Sent", "ACKNOWLEDGED": "Acknowledged", "ESCALATED": "Escalated", "SUPPRESSED": "Suppressed" },
	"campaignTypes": { "INBOUND": "Inbound", "OUTBOUND": "Outbound", "BLENDED": "Blended" },
	"picker": {
		"title": "What do you want to create?",
		"alerts": "Alerts",
		"recognition": "Recognition",
		"example": "e.g. {{example}}"
	},
	"rules": {
		"alertsTitle": "Alert rules",
		"alertsDescription": "Rules that notify agents, supervisors or QA managers when something needs attention.",
		"recognitionTitle": "Recognition rules",
		"recognitionDescription": "Auto-driven recognition sent when agents reach goals, streaks or improvements.",
		"newAlert": "New alert",
		"newRecognition": "New recognition",
		"columns": {
			"name": "Rule",
			"type": "Type",
			"area": "Area",
			"severity": "Severity",
			"badge": "Badge",
			"recipients": "Recipients",
			"fired7d": "Fired · 7d",
			"lastFired": "Last fired",
			"status": "Status"
		},
		"never": "Never",
		"noBadge": "No badge",
		"filters": {
			"search": "Search rules...",
			"type": "Type",
			"area": "Area",
			"status": "Status",
			"recipient": "Recipient",
			"all": "All",
			"clear": "Clear filters"
		},
		"actions": {
			"edit": "Edit",
			"duplicate": "Duplicate",
			"sendTest": "Send test",
			"pause": "Pause",
			"activate": "Activate",
			"delete": "Delete"
		},
		"empty": {
			"alertsTitle": "No alert rules yet",
			"alertsDescription": "Create a rule to get notified when a metric crosses a threshold or trends down.",
			"recognitionTitle": "No recognition rules yet",
			"recognitionDescription": "Create a rule to congratulate agents automatically when they hit a goal.",
			"noMatches": "No rules match the current filters"
		},
		"confirmDelete": {
			"title": "Delete rule",
			"message": "\"{{name}}\" will stop firing immediately. This cannot be undone.",
			"confirm": "Delete",
			"cancel": "Cancel"
		},
		"notifications": {
			"created": "Rule created",
			"updated": "Rule updated",
			"deleted": "Rule deleted",
			"duplicated": "Rule duplicated as draft",
			"paused": "Rule paused",
			"activated": "Rule activated",
			"testSent": "Test notification sent to {{agent}} — check the Inbox"
		}
	},
	"detail": {
		"tabs": { "overview": "Overview", "activity": "Activity" },
		"condition": "Condition",
		"scope": "Scope",
		"delivery": "Delivery",
		"message": "Message",
		"frequency": "Frequency guard",
		"schedule": "Schedule",
		"recognition": "Recognition",
		"everyone": "All agents in scope",
		"agents": "Agents",
		"supervisors": "Supervisors",
		"campaigns": "Campaigns",
		"linesOfBusiness": "Lines of business",
		"campaignTypes": "Campaign types",
		"escalation": "Escalate to QA Manager if not acknowledged within {{hours}}h",
		"noEscalation": "No escalation",
		"cooldown": "Once per agent every {{days}} days",
		"noCooldown": "No cooldown",
		"maxPerWeek": "Max {{count}} per week",
		"unlimited": "No weekly limit",
		"quietHours": "Quiet hours {{from}}–{{to}}",
		"noQuietHours": "No quiet hours",
		"includedAreas": "Included areas",
		"teamComparison": "Includes team comparison",
		"stats": { "fired7d": "Fired · 7d", "fired30d": "Fired · 30d", "lastFired": "Last fired", "createdBy": "Created by" },
		"previewSample": "Preview with sample data",
		"noActivity": "This rule has not fired yet"
	},
	"editor": {
		"createTitle": "New {{type}}",
		"editTitle": "Edit rule",
		"sections": {
			"basics": "Basics",
			"condition": "Condition",
			"conditionDescription": "When should this rule fire?",
			"scope": "Scope",
			"scopeDescription": "Leave a field empty to include everyone.",
			"delivery": "Recipients & channels",
			"message": "Message",
			"frequency": "Frequency guard",
			"frequencyDescription": "Avoid alert fatigue.",
			"schedule": "Schedule",
			"recognition": "Recognition"
		},
		"fields": {
			"name": "Name",
			"namePlaceholder": "e.g. Compliance score below 80%",
			"description": "Description",
			"type": "Type",
			"severity": "Severity",
			"burnoutLevel": "Risk level assigned",
			"area": "Area",
			"metric": "Metric",
			"subItem": "Sub-item",
			"mode": "Condition",
			"operator": "Operator",
			"value": "Value",
			"from": "From",
			"to": "To",
			"direction": "Direction",
			"percent": "Percent",
			"consecutiveCount": "Consecutive calls",
			"window": "Evaluation window",
			"windowSize": "N",
			"addCondition": "Add condition",
			"removeCondition": "Remove condition",
			"agents": "Agents",
			"agentsPlaceholder": "All agents",
			"supervisors": "Supervisors",
			"supervisorsPlaceholder": "All supervisors",
			"campaigns": "Campaigns",
			"campaignsPlaceholder": "All campaigns",
			"linesOfBusiness": "Lines of business",
			"linesOfBusinessPlaceholder": "All lines of business",
			"campaignTypes": "Campaign types",
			"campaignTypesPlaceholder": "All types",
			"recipients": "Send to",
			"channels": "Channels",
			"escalation": "Escalate to QA Manager if not acknowledged",
			"escalationHours": "After (hours)",
			"template": "Start from template",
			"templatePlaceholder": "Choose a template...",
			"subject": "Subject",
			"body": "Message",
			"variables": "Insert variable",
			"cooldown": "Cooldown (days per agent)",
			"maxPerWeek": "Max per week",
			"noLimit": "No limit",
			"quietHours": "Quiet hours",
			"quietFrom": "From",
			"quietTo": "To",
			"dayOfWeek": "Day",
			"time": "Time",
			"timezone": "Timezone",
			"includedAreas": "Included areas",
			"teamComparison": "Include team comparison",
			"badge": "Award badge",
			"badgePlaceholder": "No badge",
			"visibility": "Visibility",
			"celebrationEmoji": "Celebration"
		},
		"burnoutNotice": {
			"title": "Feeds the dashboard",
			"description": "Agents matching this rule appear in the Burnout Risk widget with the level selected above."
		},
		"validation": {
			"nameRequired": "Name is required",
			"nameMax": "Max {{count}} characters",
			"conditionRequired": "Add at least one condition",
			"rangeInvalid": "\"To\" must be greater than \"From\"",
			"recipientsRequired": "Choose at least one recipient",
			"channelsRequired": "Choose at least one channel",
			"subjectRequired": "Subject is required",
			"bodyRequired": "Message is required",
			"timeRequired": "Time is required"
		},
		"preview": {
			"title": "Live preview",
			"matching": "{{matching}} of {{total}} agents match today",
			"matchingWeekly": "{{total}} agents will receive this summary",
			"viewAgents": "View agents",
			"hideAgents": "Hide agents",
			"noMatches": "No agent matches right now — the rule will fire when one does.",
			"messagePreview": "Message preview"
		},
		"footer": {
			"cancel": "Cancel",
			"saveDraft": "Save as draft",
			"saveActivate": "Save & activate",
			"save": "Save changes"
		}
	},
	"badges": {
		"title": "Badge catalog",
		"description": "Badges agents can earn automatically through recognition rules or be awarded manually.",
		"new": "New badge",
		"filters": { "search": "Search badges...", "area": "Area", "tier": "Tier", "status": "Status", "all": "All", "active": "Active", "archived": "Archived" },
		"card": { "holders_one": "{{count}} agent", "holders_other": "{{count}} agents", "noHolders": "Not earned yet", "autoAward": "Auto-award", "manual": "Manual", "linkedRule": "Linked rule" },
		"actions": { "edit": "Edit", "archive": "Archive", "restore": "Restore", "createRule": "Create recognition rule" },
		"detail": {
			"criteria": "Criteria",
			"linkedRule": "Linked recognition rule",
			"noLinkedRule": "No rule awards this badge automatically",
			"holders": "Holders",
			"columns": { "agent": "Agent", "team": "Team", "earnedAt": "Earned" },
			"stats": { "holders": "Total holders", "lastAwarded": "Last awarded", "tier": "Tier" }
		},
		"editor": {
			"createTitle": "New badge",
			"editTitle": "Edit badge",
			"sections": { "identity": "Identity", "criteria": "Criteria", "criteriaDescription": "What consistent behaviour earns this badge?", "settings": "Settings" },
			"fields": { "name": "Name", "description": "Description", "icon": "Icon", "color": "Color", "area": "Area", "tier": "Tier", "autoAward": "Award automatically when criteria are met", "autoAwardHint": "Saving creates a linked recognition rule you can fine-tune in the Recognition tab.", "status": "Active" },
			"validation": { "nameRequired": "Name is required", "iconRequired": "Pick an icon" }
		},
		"empty": { "title": "No badges yet", "description": "Create a badge to reward consistent behaviour.", "noMatches": "No badges match the current filters" },
		"notifications": { "created": "Badge created", "updated": "Badge updated", "archived": "Badge archived", "restored": "Badge restored", "ruleCreated": "Recognition rule created for {{badge}}" }
	},
	"templates": {
		"title": "Message templates",
		"description": "Reusable messages for alerts, recognitions and summaries. Rules copy a template when created.",
		"new": "New template",
		"filters": { "search": "Search templates...", "category": "Category", "all": "All" },
		"columns": { "name": "Template", "category": "Category", "subject": "Subject", "variables": "Variables", "usedBy": "Used by", "updated": "Updated" },
		"default": "Default",
		"usedBy_one": "{{count}} rule",
		"usedBy_other": "{{count}} rules",
		"actions": { "edit": "Edit", "duplicate": "Duplicate", "setDefault": "Set as default", "delete": "Delete", "deleteDisabled": "In use by rules — cannot delete" },
		"editor": {
			"createTitle": "New template",
			"editTitle": "Edit template",
			"fields": { "name": "Name", "category": "Category", "subject": "Subject", "body": "Message", "variables": "Insert variable" },
			"preview": "Preview with sample data",
			"validation": { "nameRequired": "Name is required", "subjectRequired": "Subject is required", "bodyRequired": "Message is required" }
		},
		"confirmDelete": { "title": "Delete template", "message": "\"{{name}}\" will be removed. Rules keep their own copy of the text.", "confirm": "Delete", "cancel": "Cancel" },
		"empty": { "title": "No templates yet", "description": "Create a template to reuse messages across rules.", "noMatches": "No templates match the current filters" },
		"notifications": { "created": "Template created", "updated": "Template updated", "deleted": "Template deleted", "duplicated": "Template duplicated", "defaultSet": "Default template updated" }
	},
	"activity": {
		"title": "Activity log",
		"description": "Every alert and recognition that fired, who received it and what happened next.",
		"export": "Export CSV",
		"exportStarted": "Export started — you'll get the file in your Inbox",
		"filters": { "search": "Search by agent or rule...", "kind": "Kind", "rule": "Rule", "agent": "Agent", "status": "Status", "from": "From", "to": "To", "all": "All", "clear": "Clear filters" },
		"columns": { "firedAt": "Fired", "rule": "Rule", "agent": "Agent", "observed": "Observed", "recipients": "Recipients", "status": "Status" },
		"suppressedHint": "Suppressed by cooldown or quiet hours",
		"actions": { "acknowledge": "Acknowledge", "view": "View" },
		"detail": {
			"title": "Activity detail",
			"message": "Message sent",
			"metric": "Observed vs. condition",
			"observed": "Observed",
			"condition": "Condition",
			"rule": "Rule",
			"openRule": "Open rule",
			"agent": "Agent",
			"openAnalytics": "Open agent analytics",
			"openInbox": "Open in Inbox",
			"acknowledge": "Acknowledge",
			"acknowledgedAt": "Acknowledged {{date}}",
			"recipients": "Recipients",
			"channels": "Channels",
			"badge": "Badge awarded"
		},
		"empty": { "title": "Nothing has fired yet", "description": "Activity appears here as soon as an active rule matches an agent.", "noMatches": "No activity matches the current filters" },
		"notifications": { "acknowledged": "Marked as acknowledged" }
	},
	"common": {
		"na": "—",
		"yes": "Yes",
		"no": "No",
		"close": "Close",
		"cancel": "Cancel",
		"save": "Save",
		"back": "Back"
	}
}
```

- [ ] **Step 3: Create `src/locales/es/qa.triggers.json`** — identical key structure, Spanish values (e.g. `"title": "Triggers y reconocimientos"`, `"alerts": "Alertas"`, `"recognition": "Reconocimientos"`, `"badges": "Insignias"`, `"templates": "Plantillas"`, `"activity": "Actividad"`, metrics `"QA_ECN_COUNT": "Errores críticos de negocio"`, `"QA_ENC_COUNT": "Errores no críticos"`, `"QA_ECC_COUNT": "Errores críticos de cumplimiento"`, `"QA_ECUF_COUNT": "Errores críticos de usuario final"`, etc.). Keep `_one/_other` plural keys.

- [ ] **Step 4: `src/modules/qa/qaNamespaces.ts`** — add:

```typescript
	'qa.supervisor.triggers': 'qa.triggers',
	'qa.qa-manager.triggers': 'qa.triggers',
```

- [ ] **Step 5: `src/locales/en/common.json` + `es`** — inside `sidebar.rolePreview.items` add `"triggers": "Triggers"` (es: `"Triggers"`).

- [ ] **Step 6: Placeholder page** so routes compile — create `src/modules/qa/triggers/TriggersPage/TriggersPage.tsx` exporting a default component rendering `<ContentContainer contentWidth='full'><Title order={1}>{t('page.title')}</Title></ContentContainer>` with `useTranslation('qa.triggers')`, plus `index.ts` (`export { default } from './TriggersPage';`). Task 4 replaces it.

- [ ] **Step 7: `src/routes.tsx`**
  1. Replace the lazy consts at lines ~167-169 (`AutoTriggersPage`) and ~185-187 (`GlobalTriggersConfigPanel`) with a single new one:
     ```tsx
     const QaTriggersPage = React.lazy(() => import('./modules/qa/triggers/TriggersPage'));
     ```
  2. Right after the `qa-manager/inbox` route (line ~953) add two routes with the standard triple wrap (`I18nNamespaceLoader` → `Suspense` → component):
     - `{ path: 'supervisor/triggers', id: 'qa.supervisor.triggers', element: … <QaTriggersPage /> … }`
     - `{ path: 'qa-manager/triggers', id: 'qa.qa-manager.triggers', element: … <QaTriggersPage /> … }`
  3. Legacy route `auto-triggers` (id `qa.auto-triggers`, ~line 999): replace `element` with `<Navigate to='/qa/qa-manager/triggers' replace />` (keep `path` and `id`; `Navigate` is already imported).
  4. Legacy route `qamanager/admin/triggers` (id `qa.qamanager.admin.triggers`, ~line 1176): same replacement.

- [ ] **Step 8: `src/components/Sidebar/Sidebar.tsx`**
  - `role-preview-team-triggers` (supervisor, ~line 578): `label: 'sidebar.rolePreview.items.triggers'`, `to: '/qa/supervisor/triggers'`, add `i18nNamespace: 'qa.triggers'`.
  - `role-preview-admin-triggers` (qaManager, ~line 712): `label: 'sidebar.rolePreview.items.triggers'`, `to: '/qa/qa-manager/triggers'`, add `i18nNamespace: 'qa.triggers'`.
  - `qa-auto-triggers` (~line 423): `to: '/qa/qa-manager/triggers'`, `i18nNamespace: 'qa.triggers'`.

- [ ] **Step 9: Typecheck** → no errors in touched files.
- [ ] **Step 10: Commit** *(if authorized)* — `feat(qa-triggers): add helpers, i18n namespace, routes and sidebar links`

---

## Task 4: Page shell — header, KPI strip, tabs, type picker

**Files:**
- Replace: `src/modules/qa/triggers/TriggersPage/TriggersPage.tsx` (+ `TriggersPage.module.css`)
- Create: `components/TriggersKpiStrip/`, `components/RuleTypePickerModal/`

**Behaviour spec**

| Element | Behaviour |
|---|---|
| Role | `const role = useLocation().pathname.includes('/qa/supervisor/') ? 'supervisor' : 'qaManager'`; eyebrow `t('page.eyebrow.<role>')`; `inboxPath = role === 'supervisor' ? '/qa/supervisor/inbox' : '/qa/qa-manager/inbox'`. Passed down via a small `TriggersPageContext` (`createContext`) exposing `{ role, inboxPath, defaultSupervisorIds }` where `defaultSupervisorIds = role === 'supervisor' ? ['SUP-001'] : []`. |
| Header | `ContentContainer contentWidth='full'` → `Stack gap='lg'` → `Group justify='space-between' align='flex-start'`: left = eyebrow `Text size='xs' c='dimmed' tt='uppercase' fw={600}` + `Title order={1}` + `Text c='dimmed'`; right = `Button leftSection={<IconPlus size={16}/>}` "New rule" → opens `RuleTypePickerModal` (all 8 types). |
| KPI strip | `TriggersKpiStrip` — `SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}` of `StatCard` (`~/components/StatCard`): Active rules (value = rules with status ACTIVE; subtitle `kpis.activeRulesSubtitle` with paused/drafts counts; icon `IconBell`), Alerts fired 7d (sum `stats.firedLast7Days` of ALERT rules; `IconAlertTriangle`), Recognitions sent 7d (same for RECOGNITION; `IconSparkles`), Badges awarded 30d (count of `badge.holders` whose `earnedAt` ≥ NOW−30d; `IconAward`). Icons wrapped in `ThemeIcon variant='light' size='lg'` with colors blue / orange / green / grape. Values recomputed with `useMemo` from the store so they move when the user acts. |
| Tabs | Mantine `Tabs value={tab} onChange={setTab}` where `tab` comes from `useSearchParams` (`?tab=alerts|recognition|badges|templates|activity`, default `alerts`; invalid → `alerts`). `Tabs.Tab` each with `leftSection` icon (`IconAlertTriangle`, `IconSparkles`, `IconAward`, `IconTemplate`, `IconHistory`) and `rightSection={<Badge size='xs' variant='light'>{count}</Badge>}` (alert rules / recognition rules / active badges / templates / activity SENT count). `Tabs.Panel pt='md'` each renders its tab component (Tasks 5–9). Until those tasks land, render `<EmptyState message={t('page.tabs.<x>')} />` placeholders. |
| Type picker | `RuleTypePickerModal` props `{ opened, onClose, kinds: RuleKind[] /* which groups to show */, onSelect(type: RuleType) }`. Mantine `Modal size='xl' title={t('picker.title')}`. For each kind in `kinds`: `Text fw={600}` group title (`picker.alerts` / `picker.recognition`) + `SimpleGrid cols={{ base: 1, sm: 2 }}` of clickable `Paper withBorder p='md' radius='md'` cards (class `.card` with hover border `light-dark(var(--mantine-color-blue-4), var(--mantine-color-blue-6))`, cursor pointer, `role='button'`, `tabIndex 0`, Enter/Space triggers): `ThemeIcon variant='light' color={meta.color}` + icon, `Text fw={600}` type label, `Text size='sm' c='dimmed'` description, `Text size='xs' c='dimmed' fs='italic'` `t('picker.example', { example })`. Click → `onSelect(type)` then `onClose()`. |
| After select | Page stores `editorState: { opened: true; mode: 'create'; type }` and (Task 6) opens `RuleEditorDrawer`; also switches the tab to the matching kind. |

- [ ] **Step 1: Write `TriggersKpiStrip`** (props: none — reads `useTriggerRulesStore`).
- [ ] **Step 2: Write `RuleTypePickerModal`** + `.module.css`.
- [ ] **Step 3: Write `TriggersPage`** with context, header, KPI strip, tabs and placeholder panels; export `useTriggersPageContext()` from `TriggersPage.tsx` (named export) for children.
- [ ] **Step 4: Typecheck**; **Step 5: Commit** *(if authorized)* — `feat(qa-triggers): page shell with KPI strip, tabs and rule type picker`

---

## Task 5: Alerts & Recognition tabs — filters, table, detail drawer

**Files:** `components/RulesTab/`, `components/RulesFilters/`, `components/RulesTable/`, `components/ConditionSummaryList/`, `components/RuleDetailDrawer/`

**`RulesTab` props:** `{ kind: RuleKind; onCreate(type?: RuleType): void; onEdit(rule: TriggerRule): void }`. Reads store; owns filter state, the selected rule for the detail drawer, and all row actions.

**`RulesFilters`** (inside `FilterContainer`): props `{ kind, values: RulesFilterValues, onChange(values), onClear() }` where `RulesFilterValues = { search: string; type: RuleType | null; area: EvaluationArea | null; status: RuleStatus | 'ALL'; recipient: RuleRecipient | null }`.
Layout: `Group grow align='flex-end'`: `TextInput` search (`IconSearch` left, clear `ActionIcon` right) · `Select` type (options = `ruleTypesForKind(kind)`, clearable) · `Select` area (4 areas, clearable) · `Select` recipient (3, clearable) · `SegmentedControl` status (`All / Active / Paused / Draft`). Below: `Button variant='light' leftSection={<IconX/>}` "Clear filters" visible only when any filter differs from defaults. All `size='sm'`.

Filtering (`useMemo`): search matches `name` or `description` (case-insensitive); type equality; area via `getRuleArea(rule) === area`; status equality unless 'ALL'; recipient ∈ `delivery.recipients`. Sort: `STATUS_ORDER` then `SEVERITY_ORDER` then name.

**`RulesTable`** — `BaseTable<TriggerRule>` with `getRowId={(r) => r.id}`, `onRowClick={onOpen}`, `density='compact'`, `emptyMessage` unused (tab renders `EmptyState` itself). Columns:

| id | header | cell |
|---|---|---|
| name | rules.columns.name | `Group gap='sm' wrap='nowrap'`: `ThemeIcon variant='light' color={meta.color} size='md' radius='md'` + `<meta.icon size={16}/>`; `Stack gap={0}`: `Text size='sm' fw={600}` name, `Text size='xs' c='dimmed' lineClamp={1}` `describeRule(t, rule)` |
| type | rules.columns.type | `Badge variant='light' color={meta.color}` `t('types.<type>.label')` |
| area | rules.columns.area | `Badge variant='outline' color={AREA_COLORS[area] ?? 'gray'}` (`ALL` → gray, label `areas.ALL`) |
| severity (ALERT only) | rules.columns.severity | `Badge variant='filled' color={SEVERITY_COLORS[...]}` |
| badge (RECOGNITION only) | rules.columns.badge | badge emoji + name (`badgeById`) or dimmed `rules.noBadge` |
| recipients | rules.columns.recipients | `Group gap={4}`: one `Badge size='xs' variant='default'` per recipient; then channel icons `IconInbox` / `IconMail` / `IconLayoutDashboard` (size 14, `c='dimmed'`) each in a `Tooltip` |
| fired7d | rules.columns.fired7d | `Text size='sm' ta='right'` stats.firedLast7Days |
| lastFired | rules.columns.lastFired | `useDateFormatter('dateTime').format(new Date(...))` or `rules.never` |
| status | rules.columns.status | if DRAFT → `Badge color='yellow' variant='light'`; else `Switch size='sm' checked={status==='ACTIVE'}` `onClick={(e) => e.stopPropagation()}` `onChange → onToggle(rule)` |
| actions | '' | `Menu withinPortal position='bottom-end'`; target `ActionIcon variant='subtle'` `IconDotsVertical` with `onClick stopPropagation`; items: Edit (`IconEdit`), Duplicate (`IconCopy`), Send test (`IconSend`), Pause/Activate (`IconPlayerPause`/`IconPlayerPlay`, hidden for DRAFT → shows Activate), divider, Delete (`IconTrash`, `color='red'`) |

Row actions in `RulesTab`:
- toggle → `setRuleStatus(id, ACTIVE|PAUSED)` + `notifySuccess(t('rules.notifications.paused|activated'))`.
- duplicate → `duplicateRule(id)` → notify `duplicated` → open editor on the copy (`onEdit(copy)`).
- delete → `modals.openConfirmModal({ title, children: <Text size='sm'>{message}</Text>, labels: { confirm, cancel }, confirmProps: { color: 'red' }, onConfirm: () => { deleteRule(id); notifySuccess(...) } })`.
- send test → build `TriggerActivityEntry` (`id: nextId('ACT')`, agent = first `evaluateRulePreview(rule, TRIGGER_AGENTS).matching[0] ?? inScope[0] ?? TRIGGER_AGENTS[0]`, `observedValue` = agent metric of first condition, `conditionSummary = describeRule(t, rule)`, status `SENT`, `firedAt: new Date().toISOString()`, `renderedMessage = interpolateTemplate(rule.message.body, { agent_name: agent.agentName, supervisor_name: agent.supervisorName, metric_name, metric_value: formatMetricValue(...), threshold, period, campaign_name, badge_name, streak_count })`) and an `AgentNotification` (`id: nextId('NTF')`, `agentId: agent.agentId`, `category`: METRIC_ALERT→'METRIC_ALERT', TREND_WARNING/BURNOUT_RISK→'TREND_WARNING', WEEKLY_SUMMARY→'WEEKLY_SUMMARY', recognition→'POSITIVE_RECOGNITION'; `priority`: CRITICAL→'CRITICAL', WARNING→'HIGH', INFO→'NORMAL'; `title` = interpolated subject, `message` = renderedMessage, `icon: 'IconBell'`, `sourceRole: role === 'supervisor' ? 'SUPERVISOR' : 'QA_MANAGER'`, `metric`: area→ QUALITY_ASSURANCE→'QUALITY_ASSURANCE', SENTIMENT_EMOTION→'SENTIMENT_EMOTION', COMPLIANCE→'COMPLIANCE', else undefined, `read: false, archived: false, actioned: false, createdAt`); call `sendTest(entry, notification)`; `notifySuccess(t('rules.notifications.testSent', { agent }))`.
- empty state: if store has no rules of this kind → `EmptyState icon={<IconBell size={40}/>} message={emptyTitle} description={emptyDescription} action={<Button onClick={() => onCreate()}>{newAlert|newRecognition}</Button>}`; if filters hide all → `EmptyState message={rules.empty.noMatches}` + clear button.
- `SectionCard title={alertsTitle|recognitionTitle} description={...} headerActions={<Button size='sm' leftSection={<IconPlus size={16}/>} onClick={() => onCreate()}>{newAlert|newRecognition}</Button>}` wraps filters + table.

**`ConditionSummaryList`** props `{ conditions: RuleCondition[]; logic: ConditionLogic }` → `Stack gap='xs'`: when >1, `Badge variant='light'` `t('logic.<logic>')`; each condition as `Paper withBorder p='sm' radius='md'`: `Group`: `Badge variant='outline' color={AREA_COLORS[area]}` area · `Text size='sm'` `describeCondition`. Reused by RuleDetailDrawer, BadgeCard (compact), BadgeDetailDrawer, ActivityDetailDrawer.

**`RuleDetailDrawer`** props `{ rule: TriggerRule | null; opened; onClose; onEdit(rule); onDuplicate(rule); onToggle(rule); onDelete(rule); onSendTest(rule) }`. `AppDrawer size='lg' icon={<meta.icon size={18}/>} iconColor={meta.color} title={rule.name} description={rule.description || undefined} headerActions={<Group gap='xs'><Button size='xs' leftSection={<IconEdit size={14}/>} onClick={() => onEdit(rule)}>edit</Button><Menu …same items as table…/></Group>}`. Body:
1. `Group gap='xs'`: type Badge, severity Badge (ALERT) / badge chip (RECOGNITION), status Badge (`STATUS_COLORS`), area Badge.
2. `Tabs defaultValue='overview'`: **Overview** → `Stack gap='md'` of `SectionCard padding='md'`: Condition (`ConditionSummaryList`; for WEEKLY_SUMMARY show schedule sentence instead), Scope (chips per non-empty scope list with label prefix; all empty → `detail.everyone`), Delivery (recipient Badges, channel icons+labels, escalation sentence), Message (`Text fw={600}` interpolated subject; `Paper withBorder p='sm'` interpolated body; caption `detail.previewSample`), Frequency guard (three lines cooldown / maxPerWeek / quietHours), Schedule (WEEKLY_SUMMARY only: day, time, timezone, included areas Badges, comparison yes/no), Recognition (RECOGNITION only: badge emoji+name+tier, visibility, celebration emoji), Burnout (BURNOUT_RISK: `InlineNotice color='red' icon={<IconFlame/>}` with level). **Activity** → `ActivityTable` (Task 9) filtered `activity.filter(a => a.ruleId === rule.id)` in compact mode, or `EmptyState` `detail.noActivity`. Until Task 9 exists render the EmptyState.
3. Footer stats: `SimpleGrid cols={4}` of `Stack gap={0}` (`Text size='xs' c='dimmed' tt='uppercase'` label + `Text fw={600}` value) for fired7d / fired30d / lastFired / createdBy (`createdBy · t('recipients.<role>')`).

- [ ] **Step 1:** `ConditionSummaryList` · **Step 2:** `RulesFilters` · **Step 3:** `RulesTable` (+ `.module.css` for `.nameCell { min-width: 260px }`) · **Step 4:** `RuleDetailDrawer` · **Step 5:** `RulesTab` wiring everything, and mount `<RulesTab kind='ALERT' …/>` / `<RulesTab kind='RECOGNITION' …/>` in `TriggersPage` panels (`onCreate` → picker with `kinds=[kind]` or direct type; `onEdit` → editor state, wired in Task 6 — for now store the rule in page state).
- [ ] **Step 6: Typecheck**; **Step 7: Commit** *(if authorized)* — `feat(qa-triggers): alert and recognition rule tables with detail drawer`

---

## Task 6: Rule editor drawer (create / edit / duplicate)

**Files:** `components/ConditionRow/`, `components/PreviewPanel/`, `components/RuleEditorDrawer/RuleEditorDrawer.tsx` (+ `.module.css`, `index.ts`), `components/RuleEditorDrawer/sections/*.tsx`; modify `TriggersPage.tsx` to mount it.

**Form values** (`RuleEditorDrawer.types.ts` inside the folder):

```typescript
export interface RuleFormValues {
	name: string; description: string; type: RuleType; severity: RuleSeverity;
	burnoutLevel: BurnoutRiskLevelValue;
	conditions: RuleCondition[]; conditionLogic: ConditionLogic;
	scope: RuleScope;
	recipients: RuleRecipient[]; channels: RuleChannel[]; escalationEnabled: boolean; escalationAfterHours: number;
	templateId: string | null; subject: string; body: string;
	cooldownDays: number; maxPerWeekEnabled: boolean; maxPerWeek: number;
	quietHoursEnabled: boolean; quietHoursFrom: string; quietHoursTo: string;
	schedule: RuleSchedule;
	badgeId: string | null; visibility: RecognitionVisibility; celebrationEmoji: string;
}
```
Add to `helpers.ts`: `buildRuleFormValues(type, existing: TriggerRule | null, templates, defaultSupervisorIds): RuleFormValues` (existing → copy; new → defaults: severity by type (BURNOUT_RISK→CRITICAL, METRIC_ALERT→WARNING, TREND_WARNING→WARNING, WEEKLY_SUMMARY→INFO, recognitions→INFO), one default condition for types with `hasConditions` (`metricId` first of catalog for the kind: alerts → `COMPLIANCE_OVERALL_SCORE`, recognitions → `QA_OVERALL_SCORE`; mode = `allowedModes[0]`; operator = `higherIsBetter ? 'LT' : 'GTE'` for alerts, `'GTE'` for recognitions; value = `defaultThreshold`; window `LAST_7_DAYS`), BURNOUT_RISK → recipients `['SUPERVISOR','QA_MANAGER']`, WEEKLY_SUMMARY → schedule `{ FRIDAY, '17:00', TIMEZONES[0], all areas, true }`, message from `defaultTemplateFor(templates, type)`, scope `supervisorIds = defaultSupervisorIds`, celebrationEmoji `'🎉'`, visibility `'TEAM_FEED'`) and `formValuesToRule(values, existing, meta: { id, createdBy, createdByRole }): TriggerRule` (status decided by caller).

**`RuleEditorDrawer`** props `{ opened; mode: 'create' | 'edit'; type: RuleType; rule: TriggerRule | null; onClose; onSaved(rule: TriggerRule) }`.
- `AppDrawer size='xl' position='right' classNames={{ body: classes.body }} title={mode==='create' ? t('editor.createTitle', { type: t('types.<type>.label') }) : t('editor.editTitle')} icon iconColor`.
- `useForm<RuleFormValues>({ initialValues, validate })` re-initialised with `form.setValues(build…)` + `form.resetDirty()` in a `useEffect` on `[opened, rule?.id, type]`.
- Validation: name required / ≤ 80; `conditions` non-empty when `RULE_TYPE_META[type].hasConditions`; each RANGE condition `value2 > value` (`editor.validation.rangeInvalid`, set via `form.setFieldError('conditions.<i>.value2', …)` in a manual check on submit); recipients ≥1; channels ≥1; subject & body required; WEEKLY_SUMMARY `schedule.time` required.
- Layout (`Stack gap='md'` in body): `PreviewPanel` sticky top (`.preview { position: sticky; top: 0; z-index: 2; background: light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8)); padding-bottom: var(--mantine-spacing-xs) }`), then sections in order **Basics → Condition | Schedule → Scope → Delivery → Message → Frequency → Recognition**, then sticky footer `.footer { position: sticky; bottom: 0; padding-top: var(--mantine-spacing-sm); background: same as body; border-top: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4)) }` with `Group justify='flex-end'`: Cancel (`variant='subtle'`), create mode → `Save as draft` (`variant='light'`) + `Save & activate` (primary); edit mode → `Save changes` (primary). Cancel with dirty form → `modals.openConfirmModal` "discard?" using `common.cancel` / `editor.footer.cancel` labels (reuse `rules.confirmDelete.cancel` for the dismiss label).
- Save: run `form.validate()`; if ok → `formValuesToRule` with status (`DRAFT` / `ACTIVE` / existing status), `mode==='create' ? addRule : updateRule`, `notifySuccess(created|updated)`, `onSaved(rule)`, close.

**Sections (each a small component receiving `form: UseFormReturnType<RuleFormValues>` and `type`)** — every section is a `SectionCard padding='md' title description?`:

1. **BasicsSection** — `TextInput` name (required), `Textarea` description (autosize minRows 2), `Select` type (options = `ruleTypesForKind(kind)`, rendering type label; on change: `form.setFieldValue('type', v)` and reset conditions to the new type's defaults via `buildRuleFormValues(v, null, …).conditions` and `severity` default), `SegmentedControl` severity (ALERT only, 3 values, colored via `data` labels only), `Select` burnoutLevel (BURNOUT_RISK only) followed by `InlineNotice color='red' icon={<IconFlame size={16}/>}` `editor.burnoutNotice`. Use `Grid` (`Grid.Col span={{ base: 12, md: 6 }}`) for type/severity side by side.
2. **ConditionSection** (hidden when `!hasConditions`) — when `conditions.length > 1` show `SegmentedControl` logic (`ALL`/`ANY`) top-right in `headerActions`; list of `ConditionRow`; `Button variant='light' size='xs' leftSection={<IconPlus/>}` add (disabled at `MAX_CONDITIONS`) → `form.insertListItem('conditions', newCondition)`; error text from `form.errors.conditions`.
3. **ScheduleSection** (WEEKLY_SUMMARY only, replaces Condition) — `Grid`: `Select` dayOfWeek, `TimeInput` (from `@mantine/dates`) time, `Select` timezone; `Checkbox.Group` includedAreas (4 `Checkbox` in `Group`), `Switch` includeTeamComparison.
4. **ScopeSection** — `Grid` 2 cols of `MultiSelect searchable clearable` : agents (`TRIGGER_AGENT_OPTIONS`), supervisors (`TRIGGER_SUPERVISORS`; **hidden when `role === 'supervisor'`**), campaigns (`TRIGGER_CAMPAIGNS`), linesOfBusiness (`LINES_OF_BUSINESS`), campaignTypes (`CAMPAIGN_TYPES` labelled via `campaignTypes.*`). Placeholders "All …".
5. **DeliverySection** — `Checkbox.Group` recipients (3) and channels (3) in two columns, each `Checkbox` with icon in label; ALERT only: `Switch` escalationEnabled + `NumberInput` escalationAfterHours (min 1, max 168, `disabled={!escalationEnabled}`).
6. **MessageSection** — `Select` template (options = templates filtered by category for the type, `clearable`; on change copy `subject`/`body` from template and set `templateId`), `TextInput` subject, `Textarea` body (autosize minRows 4), variable chips: `Group gap={4}` of `Badge variant='outline' component='button' type='button'` per `TEMPLATE_VARIABLES` → appends `` {{var}} `` to body (`form.setFieldValue('body', body + (body.endsWith(' ') || !body ? '' : ' ') + '{{var}}')`), preview `Paper withBorder p='sm'`: `Text size='sm' fw={600}` interpolated subject, `Text size='sm'` interpolated body (`interpolateTemplate`).
7. **FrequencySection** — `Grid`: `NumberInput` cooldownDays (0–30), `Switch` "No limit" bound to `!maxPerWeekEnabled` + `NumberInput` maxPerWeek (1–20, disabled when no limit); `Switch` quietHoursEnabled + two `TimeInput` from/to (disabled when off).
8. **RecognitionSection** (RECOGNITION only) — `Select` badge (active badges; `renderOption` shows emoji + name; clearable → `badgePlaceholder`), `SegmentedControl` visibility, `Select` celebrationEmoji (`CELEBRATION_EMOJIS`).

**`ConditionRow`** props `{ index; condition: RuleCondition; allowedModes: ConditionMode[]; onChange(next: RuleCondition); onRemove(); canRemove: boolean; error?: string }` — `Paper withBorder p='sm' radius='md'` (`.row` with subtle background `light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))`). `Grid gutter='xs'`:
- `Select` area (`EVALUATION_AREAS`) → on change set `metricId` to first catalog metric of that area, reset `subItem`.
- `Select` metric (catalog filtered by area, label `metrics.<id>`); on change reset `subItem`, clamp `value` to `defaultThreshold`.
- `Select` subItem (only when `METRIC_BY_ID[metricId].subItemGroup`; options `subItems.any` (value `''` → null) + `COMPLIANCE_SUB_ITEMS` or `EMOTION_SUB_ITEMS`).
- `Select` mode (`allowedModes`, labels `modes.*`).
- Mode-specific: THRESHOLD → `Select` operator + `NumberInput` value (min/max/step from catalog, `suffix` '%' for PERCENT, `decimalScale={1}` for SCORE_5); RANGE → two `NumberInput` from/to; PERCENT_CHANGE → `Select` direction + `NumberInput` changePercent (1–100, suffix '%'); CONSECUTIVE → `NumberInput` consecutiveCount (2–20) + `Select` operator + `NumberInput` value.
- `Select` window (`WINDOWS`; for `CONSECUTIVE` force `LAST_N_CALLS` and hide) + `NumberInput` windowSize (5–50) when `LAST_N_CALLS`.
- Right: `ActionIcon color='red' variant='subtle'` `IconTrash` (`disabled={!canRemove}`, tooltip `removeCondition`).
- Bottom: `Text size='xs' c='dimmed'` `describeCondition(t, condition)` live; `Text size='xs' c='red'` error.
All `size='xs'`.

**`PreviewPanel`** props `{ values: Pick<RuleFormValues, 'type'|'conditions'|'conditionLogic'|'scope'|'subject'|'body'> }` → `evaluateRulePreview` over `TRIGGER_AGENTS` (useMemo). `Paper withBorder p='sm' radius='md'`: `Group justify='space-between'`: left `Group gap='xs'`: `ThemeIcon variant='light' color={matching ? 'blue' : 'gray'}` `IconUsers` + `Text size='sm' fw={600}` `preview.matching` (or `matchingWeekly`); right `Button variant='subtle' size='xs'` view/hide agents toggling a `Collapse` with `Group gap={4}` of `Badge variant='light'` per matching agent (`agentName · team`) or `Text size='xs' c='dimmed'` `preview.noMatches`.

- [ ] **Step 1:** `ConditionRow` · **Step 2:** `PreviewPanel` · **Step 3:** sections · **Step 4:** `RuleEditorDrawer` + types + helpers additions · **Step 5:** mount in `TriggersPage`: page state `editor: { opened: boolean; mode; type; rule }`; picker `onSelect(type)` → open create; `RulesTab.onEdit(rule)` → open edit (`type = rule.type`); `RuleDetailDrawer.onEdit` closes detail then opens editor; `onSaved` → if create, switch tab to the rule kind.
- [ ] **Step 6: Typecheck**; **Step 7: Commit** *(if authorized)* — `feat(qa-triggers): rule editor drawer with condition builder and live preview`

---

## Task 7: Badges tab — catalog grid, detail, editor

**Files:** `components/BadgesTab/`, `components/BadgeCard/`, `components/BadgeDetailDrawer/`, `components/BadgeEditorDrawer/`; mount in `TriggersPage`.

**`BadgesTab`** props `{ onOpenRule(ruleId: string): void; onCreateRuleForBadge(badge: BadgeDefinition): void }`. `SectionCard title description headerActions={New badge button}`. Filters in `FilterContainer`: search, `Select` area (4 + GENERAL), `Select` tier, `SegmentedControl` status (All / Active / Archived; default Active). Grid `SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}` of `BadgeCard`. Empty states as in rules.

**`BadgeCard`** props `{ badge; onOpen(badge); onEdit(badge); onToggleStatus(badge); onCreateRule(badge) }` — `Paper withBorder p='md' radius='md'` (`.card` hover elevation + `cursor: pointer`, `data-archived` lowers opacity to .6), click → `onOpen`. Content: `Group justify='space-between' align='flex-start'`: left `Group gap='sm'`: `ThemeIcon size={48} radius='xl' variant='light' color={badge.color}` with emoji (`Text fz={24}`), `Stack gap={2}`: `Text fw={600}` name, `Group gap={4}`: `Badge size='xs' color={TIER_COLORS[tier]} variant='filled'` tier, `Badge size='xs' variant='outline' color={AREA_COLORS[area]}` area; right: `Menu` (stopPropagation) Edit / Archive|Restore / Create recognition rule (hidden when `linkedRuleId`). Then `Text size='sm' c='dimmed' lineClamp={2}` description; `Text size='xs'` first criterion `describeCondition` (+ "+n more"); footer `Group justify='space-between'`: `Avatar.Group` (up to 3 `Avatar size='sm' radius='xl'` with initials + `+N`) and `Text size='xs' c='dimmed'` holders count (plural key) or `noHolders`; `Badge size='xs' variant='dot' color={autoAward ? 'green' : 'gray'}` autoAward/manual.

**`BadgeDetailDrawer`** props `{ badge | null; opened; onClose; onEdit; onOpenRule(ruleId) }` — `AppDrawer size='lg' title={<Group gap='sm'><span>{icon}</span>{name}</Group>} description={description} headerActions={Edit button}`. Body `Stack gap='md'`: stats `SimpleGrid cols={3}` (holders count, last awarded date, tier badge); `SectionCard` Criteria → `ConditionSummaryList`; `SectionCard` Linked rule → rule name row with `Button variant='light' size='xs'` open (`onOpenRule`) or dimmed `noLinkedRule`; `SectionCard` Holders → `BaseTable<BadgeHolder>` columns agent (Avatar initials + name), team, earnedAt (date) or `EmptyState`.

**`BadgeEditorDrawer`** props `{ opened; badge | null; onClose; onSaved(badge, createdRule?: TriggerRule) }` — `AppDrawer size='xl'`. `useForm<BadgeFormValues>` (`name, description, icon, color, area, tier, conditions, conditionLogic, autoAward, status`). Sections: **Identity** (`TextInput` name, `Textarea` description, Icon picker = `SimpleGrid cols={8}` of `UnstyledButton` cells (`.iconCell` 40×40, border, selected → `border-color: var(--mantine-color-blue-5)` + light bg) showing each `BADGE_ICON_OPTIONS` emoji; Color picker = `Group gap='xs'` of `ColorSwatch component='button' color={`var(--mantine-color-${c}-6)`} ` with check icon when selected; live preview `ThemeIcon size={56} color={color}` on the right), **Criteria** (`ConditionRow` list with `allowedModes=['THRESHOLD','CONSECUTIVE','PERCENT_CHANGE']`, logic control, add button), **Settings** (`Select` area incl. GENERAL, `SegmentedControl` tier, `Switch` autoAward with `description={autoAwardHint}`, `Switch` status active). Validation: name, icon. Footer Cancel / Save. On save: `addBadge`/`updateBadge`; if `autoAward && !linkedRuleId` → also create a `TriggerRule` (`kind RECOGNITION`, `type BADGE_AWARD`, name = badge name, conditions copied, delivery AGENT+SUPERVISOR/INBOX, message from default RECOGNITION template with `{{badge_name}}`, `recognition { badgeId, TEAM_FEED, '🏆' }`, status ACTIVE) via `addRule`, set `linkedRuleId`, `notifySuccess(badges.notifications.ruleCreated)`.

`BadgesTab` actions: archive/restore → `setBadgeStatus` + notify; "Create recognition rule" → `onCreateRuleForBadge(badge)` → page opens `RuleEditorDrawer` create with `type='BADGE_AWARD'` and pre-filled `badgeId` + conditions (extend `buildRuleFormValues` with an optional `preset: Partial<RuleFormValues>` param merged last). `onOpenRule(ruleId)` → page switches to `recognition` tab and opens `RuleDetailDrawer` for that rule (page keeps `detailRuleId` state; `RulesTab` accepts optional `openRuleId` + `onOpenRuleHandled` props).

- [ ] **Step 1:** `BadgeCard` · **Step 2:** `BadgeDetailDrawer` · **Step 3:** `BadgeEditorDrawer` (+ `.module.css`) · **Step 4:** `BadgesTab` + page wiring.
- [ ] **Step 5: Typecheck**; **Step 6: Commit** *(if authorized)* — `feat(qa-triggers): badge catalog with detail and editor drawers`

---

## Task 8: Templates tab

**Files:** `components/TemplatesTab/`, `components/TemplateEditorDrawer/`; mount in `TriggersPage`.

**`TemplatesTab`** — `SectionCard title description headerActions={New template}`; `FilterContainer`: search (name/subject), `SegmentedControl` category (All / Alert / Recognition / Summary). `BaseTable<MessageTemplate>` `onRowClick → open editor` columns: name (`Text fw={600}` + `Badge size='xs' variant='light' color='blue'` `templates.default` when `isDefault`), category (`Badge variant='light' color={TEMPLATE_CATEGORY_COLORS}`), subject (`lineClamp 1`), variables (`Group gap={4}` of `Badge size='xs' variant='outline'` per `extractVariables(body + subject)`), usedBy (plural key), updated (date), actions `Menu`: Edit, Duplicate, Set as default (hidden when already default), Delete (`disabled={usageCount > 0}` wrapped in `Tooltip label={deleteDisabled}`).
Actions: duplicate → `addTemplate({ ...tpl, id: nextId('TPL'), name: name + ' (copy)', isDefault: false, usageCount: 0, updatedAt: now })`; set default → `setDefaultTemplate`; delete → confirm modal → `deleteTemplate`. Sort: category, then default first, then name.

**`TemplateEditorDrawer`** props `{ opened; template | null; onClose; onSaved }` — `AppDrawer size='lg'`; `useForm` (`name, category, subject, body`); fields: `TextInput` name, `Select` category, `TextInput` subject, `Textarea` body (autosize minRows 6), variable chips (same behaviour as MessageSection — extract that chip row into a tiny `VariableChips` component inside `MessageSection` folder and reuse), `Switch` `templates.editor.preview` toggling a `Paper` with interpolated subject/body. Footer Cancel / Save → `addTemplate` (`usageCount 0`, `isDefault false`) / `updateTemplate` + notify.

- [ ] **Step 1:** `VariableChips` extraction (if not done) · **Step 2:** `TemplateEditorDrawer` · **Step 3:** `TemplatesTab` + page wiring.
- [ ] **Step 4: Typecheck**; **Step 5: Commit** *(if authorized)* — `feat(qa-triggers): message template library`

---

## Task 9: Activity tab + activity detail + rule detail activity

**Files:** `components/ActivityTab/`, `components/ActivityFilters/`, `components/ActivityTable/`, `components/ActivityDetailDrawer/`; mount in `TriggersPage`; plug `ActivityTable` into `RuleDetailDrawer` Activity tab.

**`ActivityFilters`** values `{ search; kind: RuleKind | 'ALL'; ruleId: string | null; agentId: string | null; status: ActivityStatus | null; from: Date | null; to: Date | null }` — `Group grow`: search, `SegmentedControl` kind (All / Alerts / Recognition), `Select` rule (store rules), `Select` agent (`TRIGGER_AGENT_OPTIONS`), `Select` status; second row: two `DateInput` (`@mantine/dates`, `valueFormat='DD MMM YYYY'`, `clearable`) + Clear button. Same `onChange`-string pattern as `InboxFilters.tsx` (DateInput `onChange` gives `string | null` → `new Date(value)`).

**`ActivityTable`** props `{ entries: TriggerActivityEntry[]; compact?: boolean; onOpen(entry); onAcknowledge(entry) }` — `BaseTable` columns: firedAt (`dateTime`), rule (`ThemeIcon` type icon + name; hidden when `compact`), agent (`Stack gap={0}`: name, `Text size='xs' c='dimmed'` supervisor · campaign), observed (`Text fw={600}` `formatMetricValue(metricId, observedValue)` or `—`, `Text size='xs' c='dimmed'` conditionSummary), recipients (Badges + channel icons), status (`Badge variant='light' color={ACTIVITY_STATUS_COLORS}`; SUPPRESSED wrapped in `Tooltip` `suppressedHint`), actions (`Button size='xs' variant='light'` Acknowledge when `status==='SENT' || 'ESCALATED'`, stopPropagation; `ActionIcon` `IconEye` View). Client pagination in `ActivityTab` with `PaginationControls` (`useListPageState({ initialPageSize: '10' })`; slice entries), hidden in compact mode (compact shows max 10, newest first).

**`ActivityTab`** — `SectionCard title description headerActions={<Button variant='light' size='sm' leftSection={<IconDownload size={16}/>} onClick={() => notifySuccess(t('activity.exportStarted'))}>export</Button>}`; filters → filtered+sorted (newest first) → table → pagination; empty states.

**`ActivityDetailDrawer`** props `{ entry | null; opened; onClose; onAcknowledge(entry); onOpenRule(ruleId) }` — `AppDrawer size='lg' icon={type icon} iconColor title={entry.ruleName} description={dateTime firedAt}`. Body: status `Badge` + `acknowledgedAt` text; `SectionCard` Message sent → `Paper withBorder p='sm'` `renderedMessage`; `SectionCard` Observed vs. condition → `SimpleGrid cols={2}`: observed value (big `Text fz='xl' fw={700}` colored red/green using `higherIsBetter` vs first condition value — green when the observed value is on the "good" side, red otherwise; recognition always green) and condition summary; `SectionCard` Rule → name + `Button variant='light' size='xs'` `openRule`; `SectionCard` Agent → name, supervisor, campaign, `Group`: `Button size='xs' leftSection={<IconChartLine/>}` `openAnalytics` → `navigate('/qa/agent/analytics')`, `Button size='xs' variant='light' leftSection={<IconInbox/>}` `openInbox` → `navigate(inboxPath)`; recipients/channels chips; badge awarded (emoji + name) when `badgeId`. Footer: `Button` Acknowledge (primary, hidden when already ACKNOWLEDGED/SUPPRESSED) → `acknowledgeActivity` + notify + close.

Page wiring: `onOpenRule(ruleId)` from the activity drawer → close it, switch to the rule's kind tab, open `RuleDetailDrawer` (reuse the `openRuleId` mechanism from Task 7). Replace the placeholder in `RuleDetailDrawer` Activity tab with `<ActivityTable compact entries={…} onOpen={…} onAcknowledge={…} />` — opening an entry from there opens `ActivityDetailDrawer` on top (page-level state; drawers stack fine).

- [ ] **Step 1:** `ActivityFilters` · **Step 2:** `ActivityTable` · **Step 3:** `ActivityDetailDrawer` · **Step 4:** `ActivityTab` + page wiring + `RuleDetailDrawer` activity tab.
- [ ] **Step 5: Typecheck**; **Step 6: Commit** *(if authorized)* — `feat(qa-triggers): activity log with detail drawer and cross-links`

---

## Task 10: Final pass — dark/light audit, i18n audit, spec coverage

- [ ] **Step 1: Grep audit** — in `src/modules/qa/triggers/` there must be **no** literal user-facing strings in JSX (search for `>[A-Z][a-z]+ ` patterns and `label='`), no `style={{`, no hex colors in `.module.css` (only `var(--mantine-*)` / `light-dark()`), no `any`.
- [ ] **Step 2: Key audit** — every `t('…')` key used exists in `en/qa.triggers.json` and `es/qa.triggers.json` (run a quick script or manual grep of `t('` → compare). Fix missing keys in both files.
- [ ] **Step 3:** `npm run typecheck` clean for all plan files.
- [ ] **Step 4 (only if the user asks to run the app):** Manual checklist — Preview as *Supervisor* → sidebar "Triggers" → `/qa/supervisor/triggers`; KPIs show 12 active rules; Alerts tab lists 10, Recognition 7; open a rule → detail; Edit → editor with preview "N of 12 agents match today" (ALR-001 should show Lisa Wong; ALR-008 David Brown; REC-001 Sarah Johnson); create Metric alert from picker → save & activate → appears at top, KPI increments; toggle switch pauses; Duplicate creates draft; Send test → toast, Activity gets a SENT row, Inbox (`/qa/supervisor/inbox`) shows the new notification; Badges: 10 cards, open holders, edit icon/color, archive/restore, create badge with auto-award → linked recognition rule appears; Templates: set default, duplicate, delete disabled when used; Activity: filters, acknowledge, detail → Open rule / Open analytics / Open in Inbox; legacy `/qa/auto-triggers` redirects; `?tab=badges` deep link works; toggle dark mode — all cards/drawers/tables keep contrast; switch language to ES — no missing keys.

---

## Spec Coverage Check

- ✅ Section for Supervisor and QA Manager with identical privileges — Task 3 (two routes, one page, role only changes eyebrow/default scope/inbox path)
- ✅ Triggers on nominal values, ranges, percentage decline/increase, trends, consecutive calls — Task 1 (`ConditionMode`), Task 6 (`ConditionRow`)
- ✅ Every evaluated aspect and sub-item: QA four error types + auto-fails, Compliance Security/Regulatory/Legal + 8 sub-items, Sentiment & Emotion (13 emotions, 1–5 scores, shares, recoveries), Business Insights (5 rates) — Task 1 catalog, Task 3 labels
- ✅ Trigger types: Weekly summary (day/time/timezone/areas), Metric alert, Trend warning, Burnout risk (feeds dashboard widget) — Tasks 1, 4, 6
- ✅ Recipients agent / supervisor / both (+ QA Manager), channels, escalation — `RuleDelivery`, DeliverySection
- ✅ Positive triggers / auto-driven recognition with predefined messages by the QA Manager — Recognition rules (Task 5/6) + Templates tab (Task 8) + variables
- ✅ Badges configurable for behaviours/metrics/consistency, 10 seeded incl. Compliance Master, Sentiment & Emotion Master, Mood Booster — Task 7
- ✅ Research-driven features: severity, evaluation windows, frequency guard (cooldown / weekly cap / quiet hours), ALL/ANY logic, live preview, activity log, acknowledge/escalate — Tasks 1, 6, 9
- ✅ "No loose ends": every table row opens a detail drawer, every entity has create/edit/duplicate/pause/archive/delete, filters on every tab, deep-linkable tabs, cross-links to Inbox and Analytics, test send visible in Inbox — Tasks 4–9
- ✅ Dark/light, i18n en+es, shared primitives — every task

## Execution Choice

1. **Subagent-Driven (recommended for Haiku):** one subagent per task in order 1→10; each receives this file plus the *Reference files* list; review typecheck output between tasks.
2. **Inline execution:** run tasks sequentially in one session.

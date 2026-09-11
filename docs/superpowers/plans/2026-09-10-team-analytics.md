# Team Analytics (Supervisor / QA Manager) + Agent Finder + Burnout Risk — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute tasks **in order**; every task compiles on its own.

**Goal:** Give Supervisors and QA Managers an Analytics section with the same structure as the Agent one, but measuring a whole team (Supervisor) or all teams (QA Manager): the three existing evaluation tabs fed with team data, a Business Insights tab, an **Agent Finder** that lists agents above/below/between a score range on any evaluated metric, and a **Burnout Risk** section that explains why an agent was flagged and lets the manager act (LMS material, coaching, check-in message, workload adjustment, mentor).

**Architecture:** New module `src/modules/qa/analytics/` with `TeamAnalyticsPage` mounted at `/qa/supervisor/analytics` and `/qa/qa-manager/analytics` (role from the URL). It **reuses** `QAAnalyticsTab`, `SentimentAnalyticsTab` and `ComplianceAnalyticsTab` from `src/modules/qa/agent/analytics/tabs` unchanged, feeding them team-scoped `TeamCallMetric[]` (a superset of `CallMetric`) through the existing `aggregateMetricsByDateRange`. Filters live in a new Zustand store; the active tab and the selected burnout agent live in the URL (`?view=burnout&agentId=AGT-006`, the contract the dashboards already navigate to). Business Insights widgets come from the Dashboard Evaluation Views plan. All new code uses the `qa.teamAnalytics` namespace.

**Tech Stack:** React 19, React Router v7, Mantine v9.2 (`core`, `dates`, `form`, `modals`, `notifications`), recharts, Zustand v5, react-i18next.

**Spec (user):** Same components/structure as the agent Analytics, measuring the team (supervisor) or supervisors + their teams (QA manager). Filters: campaign, line of business, campaign type, date range, agent, supervisor. A section to list agents below/above/between a range for a given evaluation type (e.g. all agents with sentiment < 4.0 in a period, compliance between 85% and 90%), optionally per campaign. Best UX/UI/IA practices; agent section as layout reference. Burnout Risk section in Analytics: clicking a burnout agent shows the parameters/behaviour that classified them and offers options to get out of risk: assign LMS material, schedule coaching with supervisor or QA manager, plus other options.

**User decisions (2026-09-10):** new `TeamAnalyticsPage` reusing the agent tabs · burnout actions = Assign LMS, Schedule coaching, Send check-in message, Adjust workload, Assign mentor.

**Dependencies (execute first):** *Dashboard Evaluation Views* plan (`BurnoutRiskTable`, `BusinessSignalsCards`, `ConversionTrendChart`, `NonConversionReasonsCard`, `RejectedProductsTable`, `CompetitorMentionsCard`, `viewMockData.ts` burnout rows, `types/dashboardViews.ts`). Optional: *Triggers* plan (links to `/qa/<role>/triggers` and `notificationStore.addNotification`; Task 7 adds `addNotification` itself if it is missing).

---

## Global Constraints

- **Design-session rules (DESIGN_ROLE.md):** mock only; no `npm run dev`, tests or `git commit` unless the user explicitly asks in the execution session. `npm run typecheck` after each task.
- Mantine v9, CSS Modules, no inline styles (recharts axis font exception with `inline-style-allow` comment). Chart colors via CSS variables. Dark & light mode.
- Reuse primitives: `SectionCard`, `AppDrawer`, `BaseTable`, `EmptyState`, `FilterContainer`, `StatCard`, `KpiCard` (`~/components/KpiCard`, supports `comparison: MetricComparison`), `PaginationControls`, `InlineNotice`, `ContentContainer`, `AppSegmentedControl`.
- Do **not** modify `src/modules/qa/agent/analytics/**`, `src/stores/qa/agentAnalyticsStore.ts`, or `src/modules/qa/dashboard/mockData.ts`.
- All new strings via `useTranslation('qa.teamAnalytics')`; add `src/locales/en/qa.teamAnalytics.json` and `src/locales/es/qa.teamAnalytics.json`. The reused agent tabs keep their `qa.agent.analytics` namespace (loaded through the route mapping).
- TypeScript strict, no `any`, tabs, `~/` imports, folder-per-component with `index.ts` for anything with its own CSS module; flat files are fine for small pure components.

---

## Roster & identity (shared with Dashboards and Triggers plans)

| Supervisor | id | Team | Agents (id · name) |
|---|---|---|---|
| Maria García | SUP-001 | Team 1 | AGT-001 Sarah Johnson · AGT-002 Mike Chen · AGT-003 Jessica Martinez · AGT-004 John Smith · AGT-005 Emma Davis · AGT-006 David Brown · AGT-007 Lisa Wong |
| Juan Pérez | SUP-002 | Team 2 | AGT-008 Sofia Rodríguez · AGT-009 Miguel Fernández · AGT-010 Carlos Vega · AGT-011 Lucía Torres · AGT-012 Diego Ramírez · AGT-013 Valentina Cruz · AGT-014 Andrés Mora |
| Laura Gómez | SUP-003 | Team 3 | AGT-015 Camila Herrera · AGT-016 Javier Ortiz · AGT-017 Nina Patel · AGT-018 Paula Castillo · AGT-019 Tomás Ríos · AGT-020 Isabel Navarro · AGT-021 Bruno Salas |

Supervisor role = Maria García (sees Team 1 only; supervisor filter hidden). QA Manager sees all three teams. Campaigns = `ANALYTICS_CAMPAIGNS` ids: `camp-001` Q3 Customer Service (Customer Service · INBOUND), `camp-002` Sales Training (Sales · OUTBOUND), `camp-003` Q4 Compliance (Collections · BLENDED), `camp-004` Tech Support (Tech Support · INBOUND).

---

## File Structure

### New files

```
src/modules/qa/analytics/
  types.ts                                   — TeamCallMetric, roster types, filters, finder, burnout, actions
  constants.ts                               — finder metric catalog, LOB/type lists, LMS materials, presets, colors
  mockData.ts                                — roster, deterministic call builder, burnout details, action history seed
  helpers.ts                                 — filterCalls, previousPeriod, computeTeamKpis, runFinderQuery, aggregateBusiness, burnout helpers
  TeamAnalyticsPage/TeamAnalyticsPage.tsx (+ .module.css, index.ts)
  components/
    TeamAnalyticsFilters/TeamAnalyticsFilters.tsx (+ .module.css, index.ts)
    TeamKpiStrip.tsx
    BusinessInsightsTab/BusinessInsightsTab.tsx (+ index.ts)
    BusinessInsightsTab/SignalsByAgentTable.tsx
    AgentFinderTab/AgentFinderTab.tsx (+ .module.css, index.ts)
    AgentFinderTab/FinderQueryBuilder.tsx
    AgentFinderTab/FinderResultsTable.tsx
    AgentFinderTab/SavePresetModal.tsx
    BurnoutTab/BurnoutTab.tsx (+ .module.css, index.ts)
    BurnoutTab/BurnoutAgentDetail.tsx
    BurnoutTab/BurnoutDriverCard.tsx
    BurnoutTab/BurnoutTimelineChart.tsx (+ .module.css)
    BurnoutTab/BurnoutWorkloadStats.tsx
    BurnoutTab/BurnoutActionsPanel.tsx
    BurnoutTab/BurnoutActionHistory.tsx
    BurnoutTab/modals/AssignLmsModal.tsx
    BurnoutTab/modals/ScheduleCoachingModal.tsx
    BurnoutTab/modals/SendCheckInModal.tsx
    BurnoutTab/modals/AdjustWorkloadModal.tsx
    BurnoutTab/modals/AssignMentorModal.tsx
src/stores/qa/teamAnalyticsStore.ts
src/locales/en/qa.teamAnalytics.json
src/locales/es/qa.teamAnalytics.json
```

### Modified files

- `src/routes.tsx` — lazy import + 2 routes
- `src/modules/qa/qaNamespaces.ts` — 2 route ids → `['qa.teamAnalytics', 'qa.agent.analytics', 'qa.dashboard']`
- `src/components/Sidebar/Sidebar.tsx` — `role-preview-analytics` entries for `supervisor` (~line 608) and `qaManager` (~line 723): `to` → the new paths, add `i18nNamespace: 'qa.teamAnalytics'`
- `src/stores/qa/notificationStore.ts` — `addNotification` (only if the Triggers plan has not added it)

### Reference files (read-only)

- `src/modules/qa/agent/analytics/AgentAnalyticsPage.tsx` — layout reference; `tabs/QAAnalyticsTab.tsx` (`{ aggregated }`), `SentimentAnalyticsTab.tsx` and `ComplianceAnalyticsTab.tsx` (`{ calls, aggregated }`)
- `src/modules/qa/agent/analytics/components/DateRangeAndGranularityControl.tsx` — form pattern to extend (do not modify)
- `src/modules/qa/dashboard/mockData.ts` — `CallMetric`, `AggregatedMetrics`, `aggregateMetricsByDateRange(calls, fromISO, toISO, granularity)`, `ANALYTICS_CAMPAIGNS`
- `src/modules/qa/dashboard/types/dashboardViews.ts`, `viewMockData.ts`, `components/BurnoutRiskTable.tsx` and BI widgets — from the Dashboards plan
- `src/components/KpiCard/KpiCard.tsx` + `src/models/AnalyticsDashboard.ts:324` (`MetricComparison { absoluteChange, percentageChange, trend: 'UP'|'DOWN'|'FLAT'|'UNAVAILABLE' }`)
- `src/modules/qa/evaluations-demo/SupervisorAnalytics/pages/SupervisorAnalyticsPage/components/ScoreRangeFilter.tsx`, `AgentFilter.tsx` — prior art for finder inputs (pattern only)
- `src/modules/qa/hooks/useListPageState.ts`, `useFormatters.ts`

---

## Task 1: Types, constants, mock roster + call builder, store

**Files:** `types.ts`, `constants.ts`, `mockData.ts`, `src/stores/qa/teamAnalyticsStore.ts`

- [ ] **Step 1: `types.ts`** (paste)

```typescript
import type { CallMetric } from '~/modules/qa/dashboard/mockData';
import type { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';

export type TeamRole = 'supervisor' | 'qaManager';
export type CampaignType = 'INBOUND' | 'OUTBOUND' | 'BLENDED';
export type TeamAnalyticsView = 'qa' | 'sentiment' | 'compliance' | 'business' | 'finder' | 'burnout';
export const TEAM_ANALYTICS_VIEWS: TeamAnalyticsView[] = ['qa', 'sentiment', 'compliance', 'business', 'finder', 'burnout'];

export interface TeamSupervisor { id: string; name: string; team: string }
export interface TeamAgent {
	id: string;
	name: string;
	supervisorId: string;
	team: string;
	campaignIds: string[];
	/** base profile the call builder jitters around */
	profile: AgentProfile;
}
export interface AgentProfile {
	qaScore: number;              // 0-100
	errorsPerCall: number;        // avg total errors
	security: number; regulatory: number; legal: number;   // 0-100
	customerSentiment: number;    // 1-5
	agentSentiment: number;       // 1-5
	conversionRate: number;       // 0-100 (% of offers converted)
	earlyObjection: number; unhandledObjection: number; competitorPlusCost: number; mistargetedOffer: number; // 0-100 % of calls
	/** drift applied linearly over the 30-day window (negative = getting worse), in the metric's own unit */
	drift: Partial<Record<'qaScore' | 'customerSentiment' | 'agentSentiment' | 'security' | 'regulatory' | 'legal' | 'conversionRate', number>>;
}

export interface BusinessSignals {
	earlyObjection: boolean;
	unhandledObjection: boolean;
	competitorPlusCost: boolean;
	mistargetedOffer: boolean;
}

/** Superset of the agent CallMetric so the existing analytics tabs accept it unchanged. */
export interface TeamCallMetric extends CallMetric {
	agentId: string;
	agentName: string;
	supervisorId: string;
	supervisorName: string;
	team: string;
	lineOfBusiness: string;
	campaignType: CampaignType;
	handleTimeSeconds: number;
	afterHours: boolean;
	signals: BusinessSignals;
	offeredProduct: string | null;
	converted: boolean;
	nonConversionReason: string | null;  // key from businessView.reasons.*
	competitorMentioned: string | null;
	sentimentRecovered: boolean;
}

export interface TeamAnalyticsFilters {
	from: string;                 // 'YYYY-MM-DD'
	to: string;
	granularity: 'per-call' | 'daily' | 'weekly' | 'monthly';
	compareWithPrevious: boolean;
	campaignIds: string[];
	linesOfBusiness: string[];
	campaignTypes: CampaignType[];
	supervisorIds: string[];
	agentIds: string[];
}

export type FinderMetricId =
	| 'QA_SCORE' | 'QA_ECN' | 'QA_ENC' | 'QA_ECC' | 'QA_ECUF'
	| 'COMPLIANCE_OVERALL' | 'COMPLIANCE_SECURITY' | 'COMPLIANCE_REGULATORY' | 'COMPLIANCE_LEGAL'
	| 'CUSTOMER_SENTIMENT' | 'AGENT_SENTIMENT' | 'SENTIMENT_RECOVERY_RATE'
	| 'CONVERSION_RATE' | 'EARLY_OBJECTION_RATE' | 'UNHANDLED_OBJECTION_RATE' | 'COMPETITOR_PLUS_COST_RATE' | 'MISTARGETED_OFFER_RATE';
export type FinderArea = 'QUALITY_ASSURANCE' | 'COMPLIANCE' | 'SENTIMENT_EMOTION' | 'BUSINESS_INSIGHTS';
export type FinderUnit = 'PERCENT' | 'SCORE_5' | 'COUNT';
export interface FinderMetricDefinition { id: FinderMetricId; area: FinderArea; unit: FinderUnit; min: number; max: number; step: number; higherIsBetter: boolean }
export type FinderOperator = 'BELOW' | 'ABOVE' | 'BETWEEN';
export interface FinderQuery {
	metricId: FinderMetricId;
	operator: FinderOperator;
	value: number;
	value2: number | null;
	/** ignore agents with fewer evaluated calls in range */
	minCalls: number;
}
export interface FinderPreset { id: string; name: string; query: FinderQuery }
export interface FinderResultRow {
	agentId: string; agentName: string; team: string; supervisorName: string;
	value: number; callsEvaluated: number;
	/** value in the previous period of equal length (null when no calls) */
	previousValue: number | null;
	sparkline: number[];       // 7 points, oldest first
	burnoutLevel: BurnoutRiskLevel | null;
}

export type BurnoutDriverStatus = 'BREACHED' | 'NEAR' | 'OK';
export interface BurnoutDriver {
	id: string;
	metricLabelKey: string;      // qa.teamAnalytics burnout.drivers.*
	currentValue: string;        // formatted
	conditionLabel: string;      // e.g. "declines ≥ 10% · last 14 days"
	status: BurnoutDriverStatus;
	deltaLabel: string;          // e.g. "↓ 14%"
	series: number[];            // 14 points
}
export interface BurnoutTimelinePoint { date: string; risk: number; actionId: string | null }
export interface BurnoutWorkload {
	callsPerDay: number; teamCallsPerDay: number;
	avgHandleTimeSeconds: number; teamAvgHandleTimeSeconds: number;
	afterHoursCalls: number; consecutiveDays: number;
	negativeEmotionShare: number; recoveryRate: number;
}
export interface BurnoutAgentDetailData {
	agentId: string;
	flaggedSince: string;
	matchedRules: { id: string; name: string; level: BurnoutRiskLevel }[];
	drivers: BurnoutDriver[];
	timeline: BurnoutTimelinePoint[];
	workload: BurnoutWorkload;
}

export type BurnoutActionKind = 'ASSIGN_LMS' | 'SCHEDULE_COACHING' | 'SEND_CHECK_IN' | 'ADJUST_WORKLOAD' | 'ASSIGN_MENTOR';
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
}

export interface LmsMaterial { id: string; title: string; type: 'VIDEO' | 'COURSE' | 'ARTICLE' | 'PDF'; durationMin: number; area: FinderArea | 'WELLBEING' }
```

- [ ] **Step 2: `constants.ts`**

```typescript
import type { CampaignType, FinderMetricDefinition, FinderMetricId, FinderPreset, LmsMaterial, TeamAnalyticsView } from './types';

export const LINES_OF_BUSINESS = ['Customer Service', 'Sales', 'Collections', 'Tech Support'];
export const CAMPAIGN_TYPES: CampaignType[] = ['INBOUND', 'OUTBOUND', 'BLENDED'];
export const CAMPAIGN_META: Record<string, { lineOfBusiness: string; campaignType: CampaignType }> = {
	'camp-001': { lineOfBusiness: 'Customer Service', campaignType: 'INBOUND' },
	'camp-002': { lineOfBusiness: 'Sales', campaignType: 'OUTBOUND' },
	'camp-003': { lineOfBusiness: 'Collections', campaignType: 'BLENDED' },
	'camp-004': { lineOfBusiness: 'Tech Support', campaignType: 'INBOUND' },
};
export const VIEW_PARAM = 'view';
export const AGENT_PARAM = 'agentId';
export const DEFAULT_VIEW: TeamAnalyticsView = 'qa';

export const FINDER_METRICS: FinderMetricDefinition[] = [
	{ id: 'QA_SCORE', area: 'QUALITY_ASSURANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: true },
	{ id: 'QA_ECN', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, higherIsBetter: false },
	{ id: 'QA_ENC', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, higherIsBetter: false },
	{ id: 'QA_ECC', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, higherIsBetter: false },
	{ id: 'QA_ECUF', area: 'QUALITY_ASSURANCE', unit: 'COUNT', min: 0, max: 50, step: 1, higherIsBetter: false },
	{ id: 'COMPLIANCE_OVERALL', area: 'COMPLIANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: true },
	{ id: 'COMPLIANCE_SECURITY', area: 'COMPLIANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: true },
	{ id: 'COMPLIANCE_REGULATORY', area: 'COMPLIANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: true },
	{ id: 'COMPLIANCE_LEGAL', area: 'COMPLIANCE', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: true },
	{ id: 'CUSTOMER_SENTIMENT', area: 'SENTIMENT_EMOTION', unit: 'SCORE_5', min: 1, max: 5, step: 0.1, higherIsBetter: true },
	{ id: 'AGENT_SENTIMENT', area: 'SENTIMENT_EMOTION', unit: 'SCORE_5', min: 1, max: 5, step: 0.1, higherIsBetter: true },
	{ id: 'SENTIMENT_RECOVERY_RATE', area: 'SENTIMENT_EMOTION', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: true },
	{ id: 'CONVERSION_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: true },
	{ id: 'EARLY_OBJECTION_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: false },
	{ id: 'UNHANDLED_OBJECTION_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: false },
	{ id: 'COMPETITOR_PLUS_COST_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: false },
	{ id: 'MISTARGETED_OFFER_RATE', area: 'BUSINESS_INSIGHTS', unit: 'PERCENT', min: 0, max: 100, step: 1, higherIsBetter: false },
];
export const FINDER_METRIC_BY_ID = Object.fromEntries(FINDER_METRICS.map((m) => [m.id, m])) as Record<FinderMetricId, FinderMetricDefinition>;
export const AREA_COLORS: Record<FinderMetricDefinition['area'], string> = {
	QUALITY_ASSURANCE: 'cyan', COMPLIANCE: 'grape', SENTIMENT_EMOTION: 'teal', BUSINESS_INSIGHTS: 'indigo',
};

export const DEFAULT_PRESETS: FinderPreset[] = [
	{ id: 'preset-1', name: 'Sentiment below 4.0', query: { metricId: 'CUSTOMER_SENTIMENT', operator: 'BELOW', value: 4, value2: null, minCalls: 5 } },
	{ id: 'preset-2', name: 'Compliance 85–90%', query: { metricId: 'COMPLIANCE_OVERALL', operator: 'BETWEEN', value: 85, value2: 90, minCalls: 5 } },
	{ id: 'preset-3', name: 'Unhandled objections above 20%', query: { metricId: 'UNHANDLED_OBJECTION_RATE', operator: 'ABOVE', value: 20, value2: null, minCalls: 5 } },
];

export const LMS_MATERIALS: LmsMaterial[] = [
	{ id: 'lms-01', title: 'Managing stress on high-volume days', type: 'VIDEO', durationMin: 12, area: 'WELLBEING' },
	{ id: 'lms-02', title: 'De-escalation techniques for angry customers', type: 'COURSE', durationMin: 45, area: 'SENTIMENT_EMOTION' },
	{ id: 'lms-03', title: 'Turning a negative call around', type: 'VIDEO', durationMin: 9, area: 'SENTIMENT_EMOTION' },
	{ id: 'lms-04', title: 'Compliance refresher: disclosures & consent', type: 'COURSE', durationMin: 30, area: 'COMPLIANCE' },
	{ id: 'lms-05', title: 'Objection handling playbook', type: 'PDF', durationMin: 15, area: 'BUSINESS_INSIGHTS' },
	{ id: 'lms-06', title: 'Micro-breaks and recovery between calls', type: 'ARTICLE', durationMin: 6, area: 'WELLBEING' },
	{ id: 'lms-07', title: 'Critical error prevention checklist', type: 'PDF', durationMin: 10, area: 'QUALITY_ASSURANCE' },
	{ id: 'lms-08', title: 'Empathy statements that work', type: 'VIDEO', durationMin: 8, area: 'SENTIMENT_EMOTION' },
];
export const COACHING_TOPICS = ['SENTIMENT_EMOTION', 'STRESS_MANAGEMENT', 'OBJECTION_HANDLING', 'COMPLIANCE_REFRESHER', 'QA_ERRORS'] as const;
export const COACHING_DURATIONS = [30, 45, 60];
export const MENTOR_WEEKS = [2, 4, 8];
export const WORKLOAD_ACTIONS = ['PAUSE_CAMPAIGN', 'REDUCE_DAILY_CAP', 'INBOUND_ONLY'] as const;
export const CHECK_IN_TEMPLATES = ['QUICK_CHECK_IN', 'OFFER_SUPPORT', 'RECOGNIZE_EFFORT'] as const;
```

- [ ] **Step 3: `mockData.ts`** — exports:
  - `TEAM_SUPERVISORS: TeamSupervisor[]` (3, per roster table).
  - `TEAM_AGENTS: TeamAgent[]` (21). Profiles: healthy default `{ qaScore 88, errorsPerCall 1.2, security 93, regulatory 90, legal 92, customerSentiment 4.1, agentSentiment 4.0, conversionRate 28, earlyObjection 18, unhandledObjection 12, competitorPlusCost 10, mistargetedOffer 8, drift {} }` with these overrides:
    - AGT-001 Sarah Johnson: qa 95, sentiment 4.6/4.5, conversion 36
    - AGT-002 Mike Chen: qa 97, compliance 98/96/97, sentiment 4.7/4.6
    - AGT-004 John Smith: qa 90, drift `{ customerSentiment: +0.3 }`
    - AGT-005 Emma Davis: qa 88, agentSentiment 3.4, drift `{ agentSentiment: -0.2 }`
    - AGT-006 David Brown: qa 62, errors 3.1, compliance 74/70/72, sentiment 2.1/2.4, conversion 12, unhandled 34, drift `{ agentSentiment: -0.6, qaScore: -6 }`
    - AGT-007 Lisa Wong: qa 58, errors 3.4, compliance 70/66/69, sentiment 2.3/2.6, unhandled 29, drift `{ qaScore: -5, customerSentiment: -0.4 }`
    - AGT-010 Carlos Vega: compliance 82/78/80, agentSentiment 2.7, drift `{ regulatory: -9, security: -6 }`
    - AGT-012 Diego Ramírez: customerSentiment 3.1, drift `{ customerSentiment: -0.5 }`
    - AGT-013 Valentina Cruz: compliance 100/100/100 (streak)
    - AGT-017 Nina Patel: errorsPerCall 2.4, agentSentiment 3.0
    - AGT-019 Tomás Ríos: conversion 41, earlyObjection 9
    - AGT-020 Isabel Navarro: competitorPlusCost 27, mistargetedOffer 19
    Campaign assignment: Team 1 → `camp-001` (+ `camp-003` for AGT-002, AGT-006, AGT-007), Team 2 → `camp-002` (+ `camp-004` for AGT-009, AGT-011), Team 3 → `camp-003`, `camp-001` (+ `camp-002` for AGT-019, AGT-020).
  - `buildTeamCalls(): TeamCallMetric[]` — deterministic (`seeded(11)` LCG as in the Triggers plan). For each agent, for each of the last **60 days** (so "previous period" comparisons have data; today = `2026-09-10`), 1–3 calls. Per call: `dayIndex` 0..59 (0 = oldest); drift factor `f = max(0, dayIndex - 30) / 30` applied to profile drift (so the drift happens in the last 30 days); each metric = base + drift·f + jitter (PERCENT ±6, SCORE_5 ±0.5, counts Poisson-ish from `errorsPerCall` split ecn/enc/ecc/ecuf ≈ 10/55/15/20%); `qaScores` per error type = `100 - count*8` clamped; `complianceByArea` items = area score ± 5 using the 8 sub-item keys (`dataProtection`, `disclosureCompliance` | `cobranzaRegulada`, `transparenciaConsentimiento` | `amenazasTradicionales`, `rrss`, `superintendenciaBancos`, `noLlamarList`); `predominantEmotion` from the 8-value set weighted by customerSentiment (≥4.3 Joy/Trust, 3.5–4.3 Trust/Anticipation, 2.8–3.5 Surprise/Sadness, <2.8 Anger/Fear/Disgust); `campaignId` picked from the agent's campaigns, `campaignName` from `ANALYTICS_CAMPAIGNS`, LOB/type from `CAMPAIGN_META`; `handleTimeSeconds` 240–720 (David Brown/Lisa Wong +180); `afterHours` 8% (David Brown 20%); `signals` booleans by profile rates; `offeredProduct` from `['Premium Plan','Fiber 300 Mbps','TV Bundle','Mobile Add-on','Device Protection']` on 55% of calls; `converted` by `conversionRate`; `nonConversionReason` when offered & not converted from `['priceTooHigh','noNeed','distrustQuality','thirdPartyDecision','installationRequirements','other']` weighted 35/20/15/13/10/7; `competitorMentioned` on 14% from `['Claro','Altice','Viva','Wind']`; `sentimentRecovered` = 40% of calls whose first-half sentiment was < 2.5 (approximate: `customerSentiment >= 3.5 && rand < 0.18`).
  - `TEAM_CALLS = buildTeamCalls()`.
  - `BURNOUT_DETAILS: Record<string, BurnoutAgentDetailData>` for `AGT-006`, `AGT-007`, `AGT-005`, `AGT-004`, `AGT-010`, `AGT-017`. Example AGT-006: `flaggedSince '2026-09-03'`, `matchedRules [{ 'ALR-008', 'Burnout risk — high', HIGH }]`, drivers: agentSentiment (`2.4`, `declines ≥ 10% · last 14 days`, BREACHED, `↓ 14%`, 14-point series 3.1→2.4), negativeEmotionShare (`44%`, `> 40% · last 7 days`, BREACHED, `↑ 9 pts`), qaScore (`62%`, `declines ≥ 5% · last 14 days`, BREACHED, `↓ 6%`), afterHours (`20%`, informational, NEAR); timeline 30 points rising 35→82 with `actionId` on 2026-09-04 (`act-001`) and 2026-09-08 (`act-002`); workload `{ callsPerDay 31, teamCallsPerDay 24, avgHandleTimeSeconds 612, teamAvgHandleTimeSeconds 430, afterHoursCalls 9, consecutiveDays 11, negativeEmotionShare 44, recoveryRate 21 }`. Others scaled to their level.
  - `BURNOUT_ACTIONS_SEED: BurnoutAction[]` (3): `act-001` AGT-006 SEND_CHECK_IN "Check-in message sent" DONE 2026-09-04 by Maria García; `act-002` AGT-006 ASSIGN_LMS "2 LMS items assigned" IN_PROGRESS due 2026-09-15; `act-003` AGT-007 SCHEDULE_COACHING "Coaching session · Sentiment & Emotion" PLANNED due 2026-09-12.

- [ ] **Step 4: `src/stores/qa/teamAnalyticsStore.ts`**

```typescript
import { create } from 'zustand';
import type { BurnoutAction, FinderPreset, FinderQuery, TeamAnalyticsFilters } from '~/modules/qa/analytics/types';
import { DEFAULT_PRESETS } from '~/modules/qa/analytics/constants';
import { BURNOUT_ACTIONS_SEED } from '~/modules/qa/analytics/mockData';

const TODAY = '2026-09-10';
const daysAgo = (n: number) => { const d = new Date(`${TODAY}T00:00:00Z`); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };

export const DEFAULT_FILTERS: TeamAnalyticsFilters = {
	from: daysAgo(30), to: TODAY, granularity: 'daily', compareWithPrevious: false,
	campaignIds: [], linesOfBusiness: [], campaignTypes: [], supervisorIds: [], agentIds: [],
};
export const DEFAULT_FINDER_QUERY: FinderQuery = { metricId: 'CUSTOMER_SENTIMENT', operator: 'BELOW', value: 4, value2: null, minCalls: 5 };

interface TeamAnalyticsState {
	filters: TeamAnalyticsFilters;
	setFilters: (filters: TeamAnalyticsFilters) => void;
	resetFilters: () => void;
	finderQuery: FinderQuery;
	setFinderQuery: (query: FinderQuery) => void;
	presets: FinderPreset[];
	savePreset: (name: string, query: FinderQuery) => void;
	deletePreset: (id: string) => void;
	burnoutActions: BurnoutAction[];
	addBurnoutAction: (action: BurnoutAction) => void;
	setBurnoutActionStatus: (id: string, status: BurnoutAction['status']) => void;
}

let counter = 10;
export const nextActionId = () => `act-${String(++counter).padStart(3, '0')}`;

export const useTeamAnalyticsStore = create<TeamAnalyticsState>((set) => ({
	filters: DEFAULT_FILTERS,
	setFilters: (filters) => set({ filters }),
	resetFilters: () => set({ filters: DEFAULT_FILTERS }),
	finderQuery: DEFAULT_FINDER_QUERY,
	setFinderQuery: (finderQuery) => set({ finderQuery }),
	presets: DEFAULT_PRESETS,
	savePreset: (name, query) => set((s) => ({ presets: [...s.presets, { id: `preset-${Date.now()}`, name, query }] })),
	deletePreset: (id) => set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),
	burnoutActions: BURNOUT_ACTIONS_SEED,
	addBurnoutAction: (action) => set((s) => ({ burnoutActions: [action, ...s.burnoutActions] })),
	setBurnoutActionStatus: (id, status) => set((s) => ({ burnoutActions: s.burnoutActions.map((a) => (a.id === id ? { ...a, status } : a)) })),
}));
```

- [ ] **Step 5: Typecheck**; **Step 6: Commit** *(if authorized)* — `feat(qa-team-analytics): types, mock roster/call builder and store`

---

## Task 2: Helpers, i18n, routes, sidebar, placeholder page

**Files:** `helpers.ts`, `src/locales/{en,es}/qa.teamAnalytics.json`, `qaNamespaces.ts`, `routes.tsx`, `Sidebar.tsx`, placeholder `TeamAnalyticsPage`

- [ ] **Step 1: `helpers.ts`** — implement with these signatures (pure, unit-free):

```typescript
export function filterCalls(calls: TeamCallMetric[], f: TeamAnalyticsFilters, role: TeamRole): TeamCallMetric[]
// role 'supervisor' → force supervisorId 'SUP-001'; date inclusive on 'YYYY-MM-DD'; empty arrays = no filter.
export function previousPeriod(f: TeamAnalyticsFilters): { from: string; to: string }   // same length immediately before `from`
export function avg(values: number[]): number   // 0 when empty, 1 decimal
export function metricOf(call: TeamCallMetric, id: FinderMetricId): number | null
// QA_SCORE = avg of the four qaScores; QA_E* = count for that type (100 - score) / 8 rounded; COMPLIANCE_* = area score / overall avg;
// sentiments direct; SENTIMENT_RECOVERY_RATE → 1/0 per call (rate computed by caller); CONVERSION_RATE → null when no offer, else 1/0;
// *_OBJECTION_RATE etc. → 1/0 from signals.
export function agentMetric(calls: TeamCallMetric[], id: FinderMetricId): number | null
// COUNT metrics: sum; rate metrics: 100 * mean of 1/0 over non-null; else mean. 1 decimal.
export function comparison(current: number, previous: number | null, higherIsBetter: boolean): MetricComparison
// trend UP/DOWN/FLAT by sign of (current - previous) with |Δ| < 0.05 → FLAT; UNAVAILABLE when previous null.
export interface TeamKpis { qaScore: number; compliance: number; customerSentiment: number; conversionRate: number; calls: number }
export function computeTeamKpis(calls: TeamCallMetric[]): TeamKpis
export function runFinderQuery(calls: TeamCallMetric[], previousCalls: TeamCallMetric[], agents: TeamAgent[], supervisors: TeamSupervisor[], query: FinderQuery, burnoutLevels: Record<string, BurnoutRiskLevel>): FinderResultRow[]
// group by agentId; skip agents with callsEvaluated < minCalls; value = agentMetric; keep when BELOW: value < q.value; ABOVE: value > q.value; BETWEEN: q.value <= value <= (q.value2 ?? q.value);
// sparkline = agentMetric over 7 equal date buckets of the current range; sort worst-first (by higherIsBetter).
export function formatFinderValue(id: FinderMetricId, value: number | null): string   // '—' | '78%' | '3.8' | '12'
export interface BusinessAggregate { signals: BusinessSignal[]; bestTimeSlot: BestTimeSlot; conversionTrend: ConversionTrendPoint[]; reasons: NonConversionReason[]; rejectedProducts: RejectedProductRow[]; competitors: CompetitorMention[]; byAgent: SignalsByAgentRow[] }
export interface SignalsByAgentRow { agentId; agentName; team; calls; earlyObjection; unhandledObjection; competitorPlusCost; mistargetedOffer; conversionRate }   // rates 0-100
export function aggregateBusiness(calls: TeamCallMetric[], previousCalls: TeamCallMetric[], granularity: TeamAnalyticsFilters['granularity']): BusinessAggregate
// signals: count + % of calls + trend vs previous (down/up/stable, trendValue in pts); bestTimeSlot: bucket call hours (from `date`) into 08-10/10-12/12-14/14-16/16-18, pick max conversion; conversionTrend grouped like aggregateMetricsByDateRange periods (week label 'W36' or day 'Sep 03'); reasons/rejectedProducts/competitors counted from the fields.
export function driverStatusColor(status: BurnoutDriverStatus): string   // BREACHED red · NEAR yellow · OK green
```
Types for `BusinessSignal`, `BestTimeSlot`, `ConversionTrendPoint`, `NonConversionReason`, `RejectedProductRow`, `CompetitorMention` are imported from `~/modules/qa/dashboard/types/dashboardViews`.

- [ ] **Step 2: `src/locales/en/qa.teamAnalytics.json`** (paste; es = same keys in Spanish)

```json
{
	"page": {
		"title": "Team Analytics",
		"subtitle": { "supervisor": "Team 1 · Maria García — performance across QA, Compliance, Sentiment and Business Insights", "qaManager": "All teams — performance across QA, Compliance, Sentiment and Business Insights" },
		"views": { "qa": "QA", "sentiment": "Sentiment & Emotion", "compliance": "Compliance", "business": "Business Insights", "finder": "Agent Finder", "burnout": "Burnout Risk" }
	},
	"filters": {
		"title": "Filters",
		"from": "From", "to": "To", "granularity": "Granularity",
		"granularityOptions": { "perCall": "Per call", "daily": "Daily", "weekly": "Weekly", "monthly": "Monthly" },
		"compare": "Compare to previous period",
		"campaigns": "Campaigns", "allCampaigns": "All campaigns",
		"linesOfBusiness": "Line of business", "allLines": "All lines",
		"campaignTypes": "Campaign type", "allTypes": "All types",
		"supervisors": "Supervisors", "allSupervisors": "All supervisors",
		"agents": "Agents", "allAgents": "All agents",
		"apply": "Apply", "reset": "Reset",
		"activeCount_one": "{{count}} filter active", "activeCount_other": "{{count}} filters active",
		"campaignTypeLabels": { "INBOUND": "Inbound", "OUTBOUND": "Outbound", "BLENDED": "Blended" }
	},
	"kpis": {
		"qaScore": "Team QA score", "compliance": "Compliance", "customerSentiment": "Customer sentiment", "conversionRate": "Conversion rate",
		"callsEvaluated_one": "{{count}} call evaluated", "callsEvaluated_other": "{{count}} calls evaluated",
		"vsPrevious": "vs previous period"
	},
	"areas": { "QUALITY_ASSURANCE": "Quality Assurance", "COMPLIANCE": "Compliance", "SENTIMENT_EMOTION": "Sentiment & Emotion", "BUSINESS_INSIGHTS": "Business Insights", "WELLBEING": "Wellbeing" },
	"metrics": {
		"QA_SCORE": "QA score", "QA_ECN": "Critical business errors", "QA_ENC": "Non-critical errors", "QA_ECC": "Critical compliance errors", "QA_ECUF": "Critical end-user errors",
		"COMPLIANCE_OVERALL": "Compliance score", "COMPLIANCE_SECURITY": "Security score", "COMPLIANCE_REGULATORY": "Regulatory score", "COMPLIANCE_LEGAL": "Legal score",
		"CUSTOMER_SENTIMENT": "Customer sentiment", "AGENT_SENTIMENT": "Agent sentiment", "SENTIMENT_RECOVERY_RATE": "Sentiment recovery rate",
		"CONVERSION_RATE": "Conversion rate", "EARLY_OBJECTION_RATE": "Early objection rate", "UNHANDLED_OBJECTION_RATE": "Unhandled objection rate",
		"COMPETITOR_PLUS_COST_RATE": "Competitor + price rate", "MISTARGETED_OFFER_RATE": "Mis-targeted offer rate"
	},
	"business": {
		"byAgentTitle": "Signals by agent",
		"byAgentDescription": "Objection and conversion signals per agent in the selected range",
		"columns": { "agent": "Agent", "calls": "Calls", "early": "Early obj.", "unhandled": "Unhandled obj.", "competitor": "Competitor + price", "mistargeted": "Mis-targeted", "conversion": "Conversion" },
		"empty": "No calls match the current filters"
	},
	"finder": {
		"title": "Agent Finder",
		"description": "List agents whose result on a metric is below, above or between the values you set, within the current filters and date range.",
		"presets": "Presets",
		"savePreset": "Save preset",
		"deletePreset": "Delete preset",
		"presetName": "Preset name",
		"presetSaved": "Preset saved",
		"fields": { "area": "Evaluation type", "metric": "Metric", "operator": "Condition", "value": "Value", "from": "From", "to": "To", "minCalls": "Min. calls evaluated" },
		"operators": { "BELOW": "Below", "ABOVE": "Above", "BETWEEN": "Between" },
		"run": "Find agents",
		"summary_one": "{{count}} agent matches", "summary_other": "{{count}} agents match",
		"summaryDetail": "{{metric}} {{condition}} · {{from}} → {{to}}",
		"columns": { "agent": "Agent", "team": "Team", "supervisor": "Supervisor", "value": "Value", "previous": "Previous", "calls": "Calls", "trend": "Trend", "burnout": "Burnout" },
		"actions": { "viewProfile": "View profile", "createTrigger": "Create trigger from this query", "export": "Export CSV" },
		"exportStarted": "Export started — you'll get the file in your Inbox",
		"empty": "No agents match this query", "emptyDescription": "Widen the range, lower the minimum calls, or change the metric.",
		"validation": { "rangeInvalid": "\"To\" must be greater than \"From\"" }
	},
	"burnout": {
		"title": "Burnout Risk",
		"listDescription": { "supervisor": "Agents on your team flagged by burnout rules", "qaManager": "Agents flagged by burnout rules across all teams" },
		"selectAgent": "Select an agent to see why they were flagged",
		"selectAgentDescription": "The detail shows the rules that matched, the driving metrics, the 30-day risk timeline and the actions you can take.",
		"back": "All flagged agents",
		"flaggedSince": "Flagged since {{date}}",
		"matchedRules": "Matched rules",
		"openRule": "Open in Triggers",
		"risk": "Risk",
		"level": "Level",
		"driversTitle": "Why this agent was flagged",
		"driversDescription": "Each driver compares the agent's recent behaviour with the rule condition",
		"driverStatus": { "BREACHED": "Condition met", "NEAR": "Close to threshold", "OK": "Within range" },
		"drivers": { "agentSentiment": "Agent sentiment", "customerSentiment": "Customer sentiment", "negativeEmotionShare": "Calls with negative emotion", "qaScore": "QA score", "compliance": "Compliance score", "afterHours": "After-hours calls", "autoFails": "Auto-fails", "consecutiveNegative": "Consecutive very negative calls" },
		"timelineTitle": "Risk timeline",
		"timelineDescription": "Burnout risk score over the last 30 days · markers show actions taken",
		"timelineSeries": "Risk %",
		"workloadTitle": "Workload & signals",
		"workload": { "callsPerDay": "Calls per day", "teamAvg": "team avg {{value}}", "handleTime": "Avg handle time", "afterHours": "After-hours calls", "consecutiveDays": "Consecutive days worked", "negativeShare": "Negative-emotion calls", "recoveryRate": "Sentiment recovery rate" },
		"actionsTitle": "Help this agent",
		"actionsDescription": "Every action is logged in the history below",
		"actions": {
			"ASSIGN_LMS": { "label": "Assign LMS material", "hint": "Videos, courses and articles from the LMS" },
			"SCHEDULE_COACHING": { "label": "Schedule coaching", "hint": "1:1 with you or the QA Manager" },
			"SEND_CHECK_IN": { "label": "Send check-in message", "hint": "Lands in the agent's Inbox" },
			"ADJUST_WORKLOAD": { "label": "Adjust workload", "hint": "Pause a campaign or cap daily calls" },
			"ASSIGN_MENTOR": { "label": "Assign mentor", "hint": "Pair with a high performer from the team" }
		},
		"historyTitle": "Action history",
		"historyEmpty": "No actions yet",
		"status": { "PLANNED": "Planned", "IN_PROGRESS": "In progress", "DONE": "Done" },
		"markDone": "Mark as done",
		"by": "by {{name}}",
		"due": "due {{date}}",
		"notifications": { "lmsAssigned": "{{count}} LMS items assigned to {{agent}}", "coachingScheduled": "Coaching session scheduled with {{agent}}", "checkInSent": "Check-in sent to {{agent}} — visible in their Inbox", "workloadAdjusted": "Workload adjusted for {{agent}}", "mentorAssigned": "{{mentor}} assigned as mentor to {{agent}}", "actionDone": "Action marked as done" },
		"modals": {
			"lms": { "title": "Assign LMS material", "materials": "Materials", "dueDate": "Due date", "note": "Note for the agent", "submit_one": "Assign {{count}} item", "submit_other": "Assign {{count}} items", "types": { "VIDEO": "Video", "COURSE": "Course", "ARTICLE": "Article", "PDF": "PDF" }, "minutes": "{{count}} min", "validation": "Pick at least one material" },
			"coaching": { "title": "Schedule coaching session", "coach": "Coach", "coachOptions": { "ME": "Me", "QA_MANAGER": "QA Manager" }, "date": "Date", "time": "Time", "duration": "Duration", "minutes": "{{count}} min", "topic": "Topic", "topics": { "SENTIMENT_EMOTION": "Sentiment & Emotion", "STRESS_MANAGEMENT": "Stress management", "OBJECTION_HANDLING": "Objection handling", "COMPLIANCE_REFRESHER": "Compliance refresher", "QA_ERRORS": "QA errors" }, "notes": "Notes", "submit": "Schedule", "validation": "Date and time are required" },
			"checkIn": { "title": "Send check-in message", "template": "Template", "templates": { "QUICK_CHECK_IN": "Quick check-in", "OFFER_SUPPORT": "Offer support", "RECOGNIZE_EFFORT": "Recognize effort" }, "message": "Message", "notifySupervisor": "Also notify the supervisor", "submit": "Send", "validation": "Message is required",
				"bodies": { "QUICK_CHECK_IN": "Hi {{agent}}, I noticed the last few days have been intense. How are you doing? Let me know if you want to talk — no agenda.", "OFFER_SUPPORT": "Hi {{agent}}, I'd like to help lighten the load this week. Would a shorter queue or a coaching session help? Tell me what works for you.", "RECOGNIZE_EFFORT": "{{agent}}, thank you for pushing through a tough stretch. I see the effort. Let's find a way to make the next weeks easier." } },
			"workload": { "title": "Adjust workload", "action": "Action", "actions": { "PAUSE_CAMPAIGN": "Pause campaign assignment", "REDUCE_DAILY_CAP": "Reduce daily call cap", "INBOUND_ONLY": "Move to inbound only" }, "campaign": "Campaign", "cap": "Daily call cap", "days": "For (days)", "note": "Note", "submit": "Apply", "validation": "Choose a campaign" },
			"mentor": { "title": "Assign mentor", "mentor": "Mentor", "mentorHint": "Top performers on the same team", "weeks": "Duration", "weeksLabel": "{{count}} weeks", "focus": "Focus areas", "submit": "Assign", "validation": "Choose a mentor" }
		}
	},
	"common": { "cancel": "Cancel", "close": "Close", "na": "—" }
}
```

- [ ] **Step 3: `qaNamespaces.ts`** — add `'qa.supervisor.analytics': ['qa.teamAnalytics', 'qa.agent.analytics', 'qa.dashboard'], 'qa.qa-manager.analytics': ['qa.teamAnalytics', 'qa.agent.analytics', 'qa.dashboard'],`.
- [ ] **Step 4: placeholder page** `TeamAnalyticsPage/TeamAnalyticsPage.tsx` (+ `index.ts`) rendering `ContentContainer` + `Title` from `t('page.title')`.
- [ ] **Step 5: `routes.tsx`** — `const QaTeamAnalyticsPage = React.lazy(() => import('./modules/qa/analytics/TeamAnalyticsPage'));` and two routes (standard triple wrap) after the `qa-manager/inbox` route: `supervisor/analytics` (`qa.supervisor.analytics`) and `qa-manager/analytics` (`qa.qa-manager.analytics`).
- [ ] **Step 6: `Sidebar.tsx`** — supervisor `role-preview-analytics` → `to: '/qa/supervisor/analytics'`, `i18nNamespace: 'qa.teamAnalytics'`; qaManager `role-preview-analytics` → `to: '/qa/qa-manager/analytics'`, same namespace.
- [ ] **Step 7: Typecheck**; **Step 8: Commit** *(if authorized)* — `feat(qa-team-analytics): helpers, i18n, routes and navigation`

---

## Task 3: Page shell — filters, KPI strip, tabs reusing the agent tabs

**Files:** `TeamAnalyticsPage.tsx` (+ `.module.css`), `components/TeamAnalyticsFilters/`, `components/TeamKpiStrip.tsx`

**Page behaviour**
| Element | Behaviour |
|---|---|
| Role | `role: TeamRole = pathname.includes('/qa/supervisor/') ? 'supervisor' : 'qaManager'`; `triggersPath`, `inboxPath` derived (`/qa/supervisor/…` vs `/qa/qa-manager/…`). Exposed via `TeamAnalyticsContext` (`{ role, agents, supervisors, filteredCalls, previousCalls, filters }`). |
| Data | `filteredCalls = useMemo(filterCalls(TEAM_CALLS, filters, role))`; `previousCalls = filterCalls(TEAM_CALLS, { ...filters, ...previousPeriod(filters) }, role)`; `aggregated = aggregateMetricsByDateRange(filteredCalls, fromISO, toISO, granularity)`. |
| Header | `ContentContainer contentWidth='full' title={t('page.title')} description={t('page.subtitle.<role>')}`. |
| Filters | `TeamAnalyticsFilters` inside a `SectionCard title={t('filters.title')} padding='md'` with `headerActions` = `Badge variant='light'` active-filter count. Collapsible on small screens (`Collapse` + toggle button). |
| KPI strip | `TeamKpiStrip` always visible under filters. |
| Tabs | `AppSegmentedControl` (same primitive as the dashboards) bound to `?view=` (`useSearchParams`; default `qa`); values from `TEAM_ANALYTICS_VIEWS`, labels `page.views.*` with icons (`IconClipboardCheck`, `IconMoodSmile`, `IconShieldCheck`, `IconBriefcase`, `IconSearch`, `IconFlame`). Changing view clears `agentId` unless view is `burnout`. |
| Panels | `qa` → `<QAAnalyticsTab aggregated={aggregated} />`; `sentiment` → `<SentimentAnalyticsTab calls={filteredCalls} aggregated={aggregated} />`; `compliance` → `<ComplianceAnalyticsTab calls={filteredCalls} aggregated={aggregated} />` (imported from `~/modules/qa/agent/analytics/tabs`); `business` / `finder` / `burnout` → Tasks 4–7 (render `EmptyState` placeholders until then). |

**`TeamAnalyticsFilters`** props `{ role }`. Local draft state initialised from the store (`useTeamAnalyticsStore.filters`), committed on **Apply** (pattern of `DateRangeAndGranularityControl`). Layout (`Stack gap='sm'`): row 1 `Group grow align='flex-end'`: `DateInput` from, `DateInput` to (`@mantine/dates`, `valueFormat='DD MMM YYYY'`, `maxDate` today), `Select` granularity; row 2 `Group grow`: `MultiSelect` campaigns (`ANALYTICS_CAMPAIGNS`), `MultiSelect` linesOfBusiness, `MultiSelect` campaignTypes (labels `filters.campaignTypeLabels.*`); row 3 `Group grow`: `MultiSelect` supervisors (**hidden for supervisor role**), `MultiSelect` agents (options limited to selected supervisors' teams when any supervisor is chosen; for supervisor role = Team 1 only), `Checkbox` compare; row 4 `Group justify='flex-end'`: `Button variant='subtle'` reset (calls `resetFilters` and resets the draft) + `Button` apply (validates `from <= to`, else `notifyWarning`). All `size='sm'`, placeholders "All …".

**`TeamKpiStrip`** props `{ current: TeamKpis; previous: TeamKpis | null; compare: boolean }` — `SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}` of `KpiCard` (`~/components/KpiCard`): QA score (`value` `${qaScore}%`, `accentColor='cyan'`), Compliance (`grape`), Customer sentiment (`toFixed(1)`, `teal`), Conversion rate (`indigo`); `subtitle` = calls evaluated (plural key); when `compare && previous` pass `comparison={comparison(cur, prev, true)}` and `variant='comparison-compact'`, else `variant='default'`.

- [ ] **Step 1:** `TeamAnalyticsFilters` · **Step 2:** `TeamKpiStrip` · **Step 3:** page with context, view switcher and the three reused tabs · **Step 4: Typecheck** · **Step 5: Commit** *(if authorized)* `feat(qa-team-analytics): page shell with team filters, KPI strip and reused evaluation tabs`

---

## Task 4: Business Insights tab

**Files:** `components/BusinessInsightsTab/BusinessInsightsTab.tsx`, `SignalsByAgentTable.tsx`

- `const data = useMemo(() => aggregateBusiness(filteredCalls, previousCalls, filters.granularity))`.
- Layout (`Stack gap='lg'`): `BusinessSignalsCards signals={data.signals} bestTimeSlot={data.bestTimeSlot}` → `SimpleGrid md:2` [`SectionCard` conversion trend (`ConversionTrendChart data={data.conversionTrend}`) | `SectionCard` reasons (`NonConversionReasonsCard`)] → `SimpleGrid md:2` [`SectionCard` rejected products (`RejectedProductsTable`) | `SectionCard` competitors (`CompetitorMentionsCard`)] → `SectionCard title={t('business.byAgentTitle')}` `SignalsByAgentTable rows={data.byAgent} onRowClick={(r) => navigate(`/qa/profiles/agent/${r.agentId}`)}`. Titles for the four dashboard-widget SectionCards reuse the `qa.dashboard` keys (`businessView.*Title`) via a second `useTranslation('qa.dashboard')`.
- `SignalsByAgentTable` — `BaseTable<SignalsByAgentRow>` `density='compact'` `initialSort` unhandledObjection desc; columns agent (name + team), calls, four rate columns (`Text fw={600} c={rate > 25 ? 'red' : rate > 15 ? 'yellow' : undefined}` `{rate}%`), conversion (`Badge variant='light' color={rate >= 30 ? 'green' : rate >= 20 ? 'yellow' : 'red'}`). Empty → `EmptyState` `business.empty`.

- [ ] Steps: create → mount in page → typecheck → commit *(if authorized)* `feat(qa-team-analytics): business insights tab`

---

## Task 5: Agent Finder tab

**Files:** `components/AgentFinderTab/AgentFinderTab.tsx` (+ `.module.css`), `FinderQueryBuilder.tsx`, `FinderResultsTable.tsx`, `SavePresetModal.tsx`

**`AgentFinderTab`** — `SectionCard title={t('finder.title')} description={t('finder.description')}`:
1. **Presets row**: `Group gap='xs'`: `Text size='sm' c='dimmed'` presets label + one `Chip`-like `Badge component='button' variant={isActive ? 'filled' : 'light'} size='lg'` per preset (click → `setFinderQuery(preset.query)` and auto-run); custom presets get an `ActionIcon` `IconX` (delete, confirm modal). `Button variant='subtle' size='xs' leftSection={<IconDeviceFloppy/>}` save preset → `SavePresetModal` (`TextInput` name, Save).
2. **`FinderQueryBuilder`** props `{ value: FinderQuery; onChange; onRun }` — `Grid`: `Select` area (4) → `Select` metric (filtered by area; changing area sets the first metric) → `Select` operator (`BELOW`/`ABOVE`/`BETWEEN`) → `NumberInput` value (+ `NumberInput` value2 when BETWEEN; min/max/step/suffix from `FINDER_METRIC_BY_ID`) → `NumberInput` minCalls (1–50) → `Button leftSection={<IconSearch/>}` run. Inline validation `finder.validation.rangeInvalid`. A `Text size='xs' c='dimmed'` sentence under the builder describes the query in words (`finder.summaryDetail` with the current filter dates).
3. **Results**: `Group justify='space-between'`: `Text fw={600}` `finder.summary` (plural) + `Group`: `Button variant='light' size='xs' leftSection={<IconBolt/>}` create trigger → `navigate(`${triggersPath}?tab=alerts`)`, `Button variant='light' size='xs' leftSection={<IconDownload/>}` export → `notifySuccess(t('finder.exportStarted'))`. Then `FinderResultsTable`.
   - `FinderResultsTable` props `{ rows: FinderResultRow[]; metricId; onOpenAgent(row) }` — `BaseTable` columns: agent (Avatar initials + name), team, supervisor, value (`Text fw={700} c={colorFor(value)}` using `higherIsBetter` and thresholds relative to the query: matching rows on the "bad" side red, otherwise teal), previous (`formatFinderValue` + delta arrow), calls, trend (inline SVG sparkline 80×24 from `sparkline` — a tiny `Sparkline` component in the same folder using a `<polyline>` with `stroke='var(--mantine-color-blue-6)'`), burnout (`Badge` level or `—`), actions `Button size='compact-xs' variant='subtle'` view profile → `navigate(`/qa/profiles/agent/${agentId}`)`. Client pagination with `useListPageState({ initialPageSize: '10' })` + `PaginationControls`.
   - Empty → `EmptyState icon={<IconUserSearch size={36}/>} message description`.
4. Results recompute on run **and** whenever global filters change (`useEffect` on `filteredCalls`), so the finder respects campaign / LOB / type / supervisor / agent / date filters as the spec asks. `burnoutLevels` map built from `SUPERVISOR_BURNOUT_RISK`/`QA_MANAGER_BURNOUT_RISK` (`viewMockData`).

- [ ] Steps: `Sparkline` + `FinderResultsTable` → `FinderQueryBuilder` → `SavePresetModal` → `AgentFinderTab` → mount → typecheck → commit *(if authorized)* `feat(qa-team-analytics): agent finder with presets and range queries`

---

## Task 6: Burnout Risk tab — list + agent detail

**Files:** `components/BurnoutTab/BurnoutTab.tsx` (+ `.module.css`), `BurnoutAgentDetail.tsx`, `BurnoutDriverCard.tsx`, `BurnoutTimelineChart.tsx` (+ `.module.css`), `BurnoutWorkloadStats.tsx`

**`BurnoutTab`** — reads `agentId` from `useSearchParams`; rows = role === 'supervisor' ? `SUPERVISOR_BURNOUT_RISK` : `QA_MANAGER_BURNOUT_RISK` (from `~/modules/qa/dashboard/viewMockData`).
- No `agentId` → `SectionCard title={t('burnout.title')} description={t('burnout.listDescription.<role>')} headerAccent='red'` with `BurnoutRiskTable rows showSupervisor={role==='qaManager'} onAgentClick={(r) => setParams(view=burnout, agentId=r.agentId)}` and, under it, an `InlineNotice color='blue' icon={<IconInfoCircle/>}` `burnout.selectAgent` / `selectAgentDescription`.
- With `agentId` → `Button variant='subtle' leftSection={<IconArrowLeft/>}` `burnout.back` (clears `agentId`) + `BurnoutAgentDetail agentId`. Unknown id → `EmptyState`.

**`BurnoutAgentDetail`** props `{ agentId }` — pulls `row` (from the burnout rows), `detail = BURNOUT_DETAILS[agentId]`, `agent = TEAM_AGENTS`, actions from the store. Layout `Stack gap='lg'`:
1. **Header card** (`Paper withBorder p='md' radius='md'`): `Group justify='space-between'`: left `Group gap='md'`: `Avatar size='lg' radius='xl'` initials, `Stack gap={2}`: `Title order={3}` name, `Text size='sm' c='dimmed'` `team · supervisor`, `Text size='xs' c='dimmed'` `burnout.flaggedSince`; right `Group gap='lg'`: `RingProgress size={90} thickness={9} sections={[{ value: percentage, color: levelColor }]} label={<Text ta='center' fw={700}>{percentage}%</Text>}` + `Stack gap={4}`: `Badge variant='filled' color={levelColor}` level (`qa.dashboard` `burnout.level.*`), trend icon + label. Below: `Group gap='xs'`: `Text size='sm' fw={600}` `burnout.matchedRules` + one `Badge variant='light' color='red' rightSection={<IconExternalLink size={12}/>}` per matched rule (click → `navigate(`${triggersPath}?tab=alerts`)`).
2. **Drivers** `SectionCard title={t('burnout.driversTitle')} description headerAccent='red'` → `SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}` of `BurnoutDriverCard`.
   - `BurnoutDriverCard` props `{ driver: BurnoutDriver }` — `Paper withBorder p='sm' radius='md'` with `data-status` attr (`.card[data-status='BREACHED'] { border-color: light-dark(var(--mantine-color-red-4), var(--mantine-color-red-7)) }` etc.): `Group justify='space-between'`: `Text size='sm' fw={600}` metric label (`burnout.drivers.<key>`) + `Badge size='xs' variant='light' color={driverStatusColor}` status; `Text fz='xl' fw={700}` currentValue + `Text size='xs' c={status==='BREACHED' ? 'red' : 'dimmed'}` deltaLabel; `Text size='xs' c='dimmed'` conditionLabel; mini recharts `LineChart` (`ResponsiveContainer height={48}`, no axes, `Line dataKey='v' stroke='var(--mantine-color-red-6)' dot={false} strokeWidth={2}`) over `series`.
3. **Timeline + workload** `SimpleGrid md:2`: `SectionCard title={t('burnout.timelineTitle')} description` → `BurnoutTimelineChart points={detail.timeline} actions={agentActions}` (recharts `AreaChart` height 240, `Area dataKey='risk' stroke='var(--mantine-color-red-6)' fill='var(--mantine-color-red-2)'` — in dark mode use `fillOpacity={0.25}`; `ReferenceLine y={70}` dashed red (HIGH) and `y={40}` yellow (MEDIUM); `ReferenceDot` for each point with `actionId`, tooltip showing the action title; axes styled like `SentimentTrendChart`) | `SectionCard title={t('burnout.workloadTitle')}` → `BurnoutWorkloadStats workload` = `SimpleGrid cols={2}` of `StatCard variant='compact'` (calls/day with subtitle `workload.teamAvg`, handle time `mm:ss` vs team, after-hours count, consecutive days, negative-emotion share %, recovery rate %); color red when worse than team by >20%.
4. **Actions** (Task 7) and **History** (Task 7).

- [ ] Steps: `BurnoutDriverCard` → `BurnoutTimelineChart` → `BurnoutWorkloadStats` → `BurnoutAgentDetail` (with placeholders for actions/history) → `BurnoutTab` → mount (view `burnout`) → typecheck → commit *(if authorized)* `feat(qa-team-analytics): burnout risk list and agent detail`

---

## Task 7: Burnout actions — panel, five modals, history, Inbox integration

**Files:** `components/BurnoutTab/BurnoutActionsPanel.tsx`, `BurnoutActionHistory.tsx`, `modals/AssignLmsModal.tsx`, `ScheduleCoachingModal.tsx`, `SendCheckInModal.tsx`, `AdjustWorkloadModal.tsx`, `AssignMentorModal.tsx`; modify `src/stores/qa/notificationStore.ts` (only if `addNotification` is missing).

**`BurnoutActionsPanel`** props `{ agent: TeamAgent; onAction(kind: BurnoutActionKind) }` — `SectionCard title={t('burnout.actionsTitle')} description={t('burnout.actionsDescription')}` → `SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }}` of clickable `Paper withBorder p='md' radius='md'` cards (`role='button'`, hover border blue, keyboard Enter/Space): `ThemeIcon variant='light' size='lg'` (ASSIGN_LMS `IconBook` blue · SCHEDULE_COACHING `IconCalendarEvent` violet · SEND_CHECK_IN `IconMessageHeart` teal · ADJUST_WORKLOAD `IconAdjustmentsHorizontal` orange · ASSIGN_MENTOR `IconUsersGroup` green), `Text fw={600} size='sm'` label, `Text size='xs' c='dimmed'` hint.

**Modals** — all Mantine `Modal size='lg'` with `useForm`, footer `Group justify='flex-end'` Cancel / submit; on submit build a `BurnoutAction` (`nextActionId()`, `createdBy` = role === 'supervisor' ? 'Maria García' : 'QA Manager', `createdAt` now ISO, `status` PLANNED except SEND_CHECK_IN = DONE), call `addBurnoutAction`, `notifySuccess(...)`, close.
- **AssignLmsModal** props `{ opened; onClose; agent }` — `Checkbox.Group` over `LMS_MATERIALS` rendered as cards (`Paper withBorder p='sm'`: `Checkbox` + title, `Badge size='xs'` type, `Text size='xs' c='dimmed'` `{{count}} min · area`), `DateInput` due date (default +7d), `Textarea` note. Validation ≥1 material. Action title `t('burnout.notifications.lmsAssigned')`-style: `title = '{n} LMS items assigned'`, `detail = titles joined ' · '`, `dueAt`.
- **ScheduleCoachingModal** — `Select` coach (`ME` / `QA_MANAGER`; for QA manager role only `ME`), `DateInput` date, `TimeInput` time, `Select` duration (30/45/60), `Select` topic (`COACHING_TOPICS`), `Textarea` notes. Validation date+time. `title = 'Coaching session · <topic>'`, `detail = '<date> <time> · <duration> min · coach <name>'`, `dueAt` = date.
- **SendCheckInModal** — `Select` template (`CHECK_IN_TEMPLATES`; on change fills `Textarea` message with `burnout.modals.checkIn.bodies.<key>` interpolated with `{{agent}}` first name), `Switch` notify supervisor (QA manager only). On submit also push an `AgentNotification` to `useNotificationStore.getState().addNotification({ id: `NTF-${Date.now()}`, agentId, category: 'DIRECT_MESSAGE', priority: 'NORMAL', title: t('burnout.modals.checkIn.title'), message, icon: 'IconMessageHeart', sourceRole: role === 'supervisor' ? 'SUPERVISOR' : 'QA_MANAGER', read: false, archived: false, actioned: false, createdAt })`. If `addNotification` does not exist in `notificationStore.ts` yet, add it (interface line + `addNotification: (notification) => set((s) => ({ notifications: [notification, ...s.notifications] })),`). Action `status: 'DONE'`, `title = 'Check-in message sent'`, `detail = first 80 chars of message`.
- **AdjustWorkloadModal** — `Radio.Group` action (`WORKLOAD_ACTIONS`), `Select` campaign (agent's `campaignIds` → names from `ANALYTICS_CAMPAIGNS`; required for PAUSE_CAMPAIGN), `NumberInput` cap (visible for REDUCE_DAILY_CAP, default 20, 5–40), `NumberInput` days (1–14, default 7), `Textarea` note. `title = 'Workload adjusted · <action label>'`, `detail` = campaign / cap + `for N days`, `dueAt` = today + days.
- **AssignMentorModal** — `Select` mentor: top 3 agents of the same team by `profile.qaScore` excluding the agent (render `name · QA {{score}}%`), `SegmentedControl` weeks (2/4/8), `MultiSelect` focus (`COACHING_TOPICS` labels). `title = '<mentor> assigned as mentor'`, `detail = '<weeks> weeks · <focus list>'`, `dueAt` = today + weeks·7.

**`BurnoutActionHistory`** props `{ actions: BurnoutAction[]; onMarkDone(id) }` — `SectionCard title={t('burnout.historyTitle')}` → Mantine `Timeline bulletSize={24} lineWidth={2}` (active = count of DONE), one `Timeline.Item` per action sorted newest first: bullet = kind icon (same map as panel), title `Group gap='xs'`: `Text fw={600} size='sm'` title + `Badge size='xs' variant='light' color={PLANNED gray · IN_PROGRESS blue · DONE green}` status; body `Text size='sm'` detail; `Text size='xs' c='dimmed'` `burnout.by` · date (`useDateFormatter('dateTime')`) · `burnout.due` when `dueAt`; `Button size='compact-xs' variant='subtle'` `burnout.markDone` when status ≠ DONE → `setBurnoutActionStatus(id, 'DONE')` + toast. Empty → `Text c='dimmed' size='sm'` `burnout.historyEmpty`.

Wire in `BurnoutAgentDetail`: `activeModal: BurnoutActionKind | null` state; panel `onAction` opens the matching modal; history reads `burnoutActions.filter(a => a.agentId === agentId)`; the timeline chart receives the same list so new actions appear as markers (map action `createdAt` day → nearest timeline point).

- [ ] Steps: panel → five modals → history → wiring → `addNotification` guard → typecheck → commit *(if authorized)* `feat(qa-team-analytics): burnout actions with LMS, coaching, check-in, workload and mentor flows`

---

## Task 8: Final audit

- [ ] Every `t('…')` key used in `src/modules/qa/analytics/**` exists in en **and** es `qa.teamAnalytics.json`; the `qa.dashboard` keys reused (`burnout.level.*`, `businessView.*Title`) exist.
- [ ] No hex colors, no inline styles (except recharts axis exception), no `any`.
- [ ] `npm run typecheck` clean for touched files.
- [ ] *(Only if the user asks to run the app)* Manual checklist: Supervisor → sidebar Analytics → `/qa/supervisor/analytics`; supervisor filter hidden; KPI strip changes with campaign filter; compare checkbox shows deltas; QA/Sentiment/Compliance tabs render team data; Business tab widgets + by-agent table; Finder preset "Sentiment below 4.0" returns David Brown, Lisa Wong, (Diego Ramírez for QA manager); BETWEEN validation; save/delete preset; dashboard burnout row → `/qa/supervisor/analytics?view=burnout&agentId=AGT-006` opens David Brown's detail with 3 breached drivers; each of the 5 actions adds a history item and toast; check-in appears in `/qa/supervisor/inbox`; dark mode on all charts/cards; ES locale without missing keys.

---

## Spec Coverage Check

- ✅ Same components/structure as agent Analytics, measuring the team / all teams — Task 3 (reused tabs, role scoping)
- ✅ Filters: campaign, line of business, campaign type, date range, agent, supervisor — Task 3 (`TeamAnalyticsFilters`, applied to every tab)
- ✅ Agent lists below/above/between a value on any evaluation type, per campaign or not, custom date and value ranges (e.g. sentiment < 4.0; compliance 85–90%) — Task 5 (Agent Finder + presets)
- ✅ UX/IA improvements over the agent layout: KPI strip with period comparison (finally using `compareWithPrevious`), URL-addressable views, collapsible filters — Task 3
- ✅ Business Insights (objections, best time slot, rejected products, non-conversion reasons, competitors) at team level with per-agent breakdown — Task 4
- ✅ Analytics › Burnout Risk: list, click → parameters/behaviour that classified the agent (matched rules, drivers vs thresholds, timeline, workload) — Task 6
- ✅ Options to get out of risk: assign LMS material, schedule coaching with supervisor or QA manager, send check-in (to Inbox), adjust workload, assign mentor; action history — Task 7
- ✅ Dashboard Burnout widget deep link contract (`?view=burnout&agentId=`) honoured — Task 6
- ✅ Dark/light, i18n en+es, shared primitives — all tasks

## Execution Choice

1. **Subagent-Driven (recommended for Haiku):** one subagent per task in order 1→8, after the Dashboard Evaluation Views plan.
2. **Inline execution:** sequential in one session.

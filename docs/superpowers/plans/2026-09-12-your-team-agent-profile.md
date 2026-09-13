# Agent Profile — Your Team (Supervisor / QA Manager)

> Companion doc: [2026-09-12-customers-customer-profile.md](2026-09-12-customers-customer-profile.md) (Plan B, depends on this one).

# Agent Profiles & Customer Profiles (Supervisor / QA Manager) — Two Implementation Plans

> **For agentic workers:** This file holds **two independent plans**. First step of execution: split it into two repo docs — everything under "PLAN A" → `docs/superpowers/plans/2026-09-12-your-team-agent-profile.md`, everything under "PLAN B" → `docs/superpowers/plans/2026-09-12-customers-customer-profile.md` (copy the shared "Context" and "Global Constraints" sections into both). Execute **Plan A first, then Plan B**, task by task, in order; every task compiles on its own (`npm run typecheck` after each — pre-existing errors outside the touched folders are out of scope). Steps use checkbox (`- [ ]`) syntax.

## Context

Supervisors and QA Managers have no way to look at **one agent** or **one customer** across time. Today the platform evaluates calls one by one (QA · Sentiment & Emotion · Compliance · Business Insights) and the new call-detail panels show a single call. The user (product designer, stakeholder mockups) wants two historical profiles:

- **Agent Profile** — "since the agent was first tracked until today": behaviour per evaluation dimension, operational data (AHT etc.), an overall score combining all evaluation types, coaching sessions and LMS material assigned vs completed, badges/milestones, and performance over time (growing / declining / flat). Lives in the Supervisor **"Your Team"** section (sidebar entry already exists, route missing) — a table of the team's agents that opens each profile — and in a new QA Manager **"Agents"** entry (all teams).
- **Customer Profile** — for the people we call: emotions when contacted, receptive vs. rejecting, best/worst hours, average sentiment over time and whether it improved, plus offers, competitors, surveys and a full interaction timeline. Lives in a new **"Customers"** entry for both roles, and is reachable from the customer name in the call detail.

Benchmark (NICE CXone, Genesys, Calabrio/Playvox, Verint, Observe.AI, Level AI, MaestroQA, Zendesk QA, Salesforce/HubSpot, Medallia) was presented; the user chose the blocks listed under "User decisions". Everything is mock-only (DESIGN_ROLE.md); no API, deterministic mock data so the mockup is stable between reloads.

**User decisions (2026-09-12):**
- Two plans: **A = Your Team + Agent Profile**, **B = Customers + Customer Profile**; A first.
- Profiles are **full pages with tabs** (not drawers).
- Navigation: Supervisor → `Your Team` (own team) + new `Customers` in the same sidebar group after `Calls`; QA Manager → new `Agents` in the *Organization* group (all agents, supervisor/team filter) + `Customers` in *Operations* after `Calls`. Routes `/qa/supervisor/your-team[/:agentId]`, `/qa/supervisor/customers[/:customerId]`, `/qa/qa-manager/agents[/:agentId]`, `/qa/qa-manager/customers[/:customerId]`. Legacy `/qa/profiles/customer/:customerId` redirects to the new customer route.
- Agent profile extras (all four accepted): extended operational KPIs · strengths/weaknesses + peer comparison · risk history (auto-fails, critical errors, trigger alerts, disputes, burnout) · activity timeline + supervisor notes + evaluation history linking to the call detail.
- Customer profile extras: receptiveness score + preferences · offers & competitors · NPS/CSAT surveys + interaction timeline. The day×hour **heatmap was declined**; best/worst contact windows are shown as ranked tiles instead (the user explicitly asked for "the hours in which he accepts / rejects most").
- Existing hardcoded `src/modules/qa/dashboard/pages/AgentProfilePage.tsx` (orphan) and `CustomerProfilePage.tsx` (routed) are **deleted and replaced**; the old route redirects.

**Tech stack:** React 19, React Router v7, Mantine v9.2 (`@mantine/core`, `@mantine/charts`), `@tabler/icons-react`, Zustand v5, react-i18next, TypeScript strict. Repo modules use **tabs for indentation**, `~/` imports, CSS Modules; the shared primitives are `SectionCard`, `AppDrawer`, `BaseTable`, `ContentContainer`, `StatCard`, `EmptyState`.

**Repo facts the plans rely on (verified 2026-09-12):**
- The 2026-09-10 roadmap plans (Triggers, Dashboards, Team Analytics, Inbox, Disputes, Rankings) are **not executed yet** — `src/modules/qa/analytics/` does not exist, namespaces `qa.teamAnalytics/qa.inbox/qa.supervisor/qa.qamanager` do not exist. These plans are therefore **self-contained** and must not import from those planned modules.
- Sidebar: `src/components/Sidebar/roleNavigation.tsx` — `getSupervisorNavigation()` (:121-185, `supervisor-team` at :129-135 → `/qa/supervisor/your-team`), `getSupervisorNavigationGrouped()` (:188-225, index-based slices), `getQAManagerNavigation()` (:228-299), `getQAManagerNavigationGrouped()` (:302-347). Labels live in `src/locales/{en,es}/common.json` under `sidebar.supervisor.*` (en :156-169, es :154-166) and `sidebar.qamanager.*` (en :180-195, es :178-193).
- Routes: `src/routes.tsx`, QA children under `path: 'qa'` (guard at :816-823); lazy imports at the top (`React.lazy(() => import(...))`, e.g. `CustomerProfilePage` :145-146, `QAManagerAgentsPage` :175). Each route = `{ path, id, element: <I18nNamespaceLoader><Suspense fallback={<SuspenseFallback />}><Page /></Suspense></I18nNamespaceLoader> }`. `qa-manager/agents` is registered **twice** (:970-979 without id → `SupervisorSettingsPage`, :1057-1067 id `qa.qa-manager.agents` → `QAManagerAgentsPage`). `profiles/customer/:customerId` at :1134-1144. Call detail route: `campaigns/:campaignId/calls/:callId` (:1272) → `/qa/campaigns/1/calls/call-001` renders `src/views/Campaigns/pages/ConversationEvaluations.tsx` with `mockCallEvaluationDetail` (customer "Mr. Doe").
- Namespace map: `src/modules/qa/qaNamespaces.ts` (`qaRouteNamespaces: Record<string, string | readonly string[]>`); JSON bundles auto-discovered from `src/locales/{en,es}/*.json` (`src/locales/i18n.ts` glob) — no registration needed.
- Roster canon: `src/modules/qa/triggers/mockData.ts` (`TRIGGER_SUPERVISORS` :10, `TRIGGER_CAMPAIGNS` :16, `seeded()` :24, `TRIGGER_AGENTS` :111). The roadmap roster (21 agents / 3 teams) is reproduced below; do not reintroduce legacy names (Carlos López, Agent Smith, Emily Watson).
- Reusable as-is: `SectionCard` (`~/components/SectionCard`, props `icon: TablerIcon, title, description, headerActions, footer, contentSpacing, padding, headerAccent`), `ContentContainer` (`~/components/ContentContainer`, props `title, description, titleRight, titleBottom, showBackButton, contentWidth: 'centered'|'full'`), `StatCard` (`~/components/StatCard`, `{ title, value, subtitle?, icon?, badge?, color?, variant?: 'default'|'compact' }`), `EmptyState` (`~/components/EmptyState`, `{ icon?, message, description?, action? }`), `BaseTable` (`~/components/BaseTable/BaseTable`, `{ data, columns: BaseTableColumnDef<T>[], onRowClick?, initialSort?, enablePagination?, pageSize?, density?, emptyMessage?, getRowId? }`), `BurnoutRiskWidget` (`~/modules/qa/dashboard/components`, `{ data: BurnoutRiskData }`, needs `qa.dashboard` namespace) + `BurnoutRiskData`/`BurnoutRiskLevel` (`~/modules/qa/dashboard/types/burnoutRisk`), `PREDEFINED_BADGE_CATALOGS` (`~/models/qa/badges`, keys `QA_EXCELLENCE, SENTIMENT_CHAMPION, COMPLIANCE_GUARDIAN, STREAKER, IMPROVEMENT_CHAMPION, BUSINESS_DRIVER`, each `{type,name,description,icon,criteria}`), `PREDEFINED_BUSINESS_INSIGHTS` (`~/models/qa/businessInsightTypes`), `Emotion`/`SentimentCategory`/`EMOTION_SENTIMENT_MAP` (`~/modules/qa/emotion-sentiment/types`), `useNotificationStore().addNotification(n: AgentNotification)` (`~/stores/qa/notificationStore`; `AgentNotification` in `~/models/qa/notifications` — fields `id, agentId, category: 'DIRECT_MESSAGE'|'METRIC_ALERT'|'TREND_WARNING'|'POSITIVE_RECOGNITION'|'WEEKLY_SUMMARY', priority: 'CRITICAL'|'HIGH'|'NORMAL'|'LOW', title, message, icon, sourceRole: 'SUPERVISOR'|'QA_MANAGER'|'SYSTEM', sourceId?, read, archived, actioned, createdAt, actions?: {label,url,icon}[]`).
- Chart precedent: `src/modules/evaluations-demo/AgentDashboard/pages/AgentDashboardPage/components/AgentPerformanceTrendChart.tsx` (`@mantine/charts` `LineChart` with `series`, `curveType='monotone'`, `withLegend`, `yAxisProps={{ domain: [0, 100] }}`). Use `@mantine/charts` (`LineChart`, `BarChart`, `DonutChart`, `AreaChart`) for every chart in these plans.
- Prior art to mirror (read-only): `PeerComparisonSection` (`src/modules/role-preview/AgentDetailPage/components/PeerComparisonSection.tsx`, props `{ metrics: {label, agentValue, teamAverage, unit?}[], agentName?, percentileRank? }`) — import and reuse it directly; `CoachingDevelopmentSection` (same folder) — pattern only, do not import (its types are module-private and too narrow).

---

## Global Constraints (both plans)

- **DESIGN_ROLE.md session rules:** mock only, no backend, no tests. `npm run typecheck` after each task. Git commits only at the end of each plan if the execution session allows them (one commit per plan on branch `feature/your-team-agent-profile` / `feature/customers-customer-profile`).
- **Dark/light mode is mandatory (CLAUDE.md):** Mantine color props (`c`, `bg`, `color`) and theme-aware variables only — `var(--mantine-color-gray-light)`, `var(--mantine-color-<color>-light)`, `var(--mantine-color-default-border)`, `var(--mantine-color-dimmed)`. Never `-gray-0/-gray-1/-blue-0` alone. Chart colors are Mantine color names (`'blue.6'`, `'teal.6'`).
- Reuse the shared primitives above. Mantine `Card withBorder` / `Paper withBorder` only for small tiles inside grids. Mantine `Modal` for the three action modals (drawers are for browsing, modals for short forms — matches `src/modules/qa/triggers`).
- One Zustand store and one i18n namespace per section: Plan A `src/stores/qa/teamStore.ts` + `qa.team`; Plan B `src/stores/qa/customersStore.ts` + `qa.customers`. All visible strings via `useTranslation('<ns>')`. **The plan lists the English JSON; create the Spanish file with the same keys and Spanish values** (keep product terms: QA, Compliance, Business Insights, LMS, NPS, CSAT, AHT).
- Deterministic mock data: use a `seeded(seed)` LCG exactly like `src/modules/qa/triggers/mockData.ts:24-27`; no `Math.random()`, no `Date.now()` — `NOW_ISO = '2026-09-12T15:00:00Z'` is "today".
- TypeScript strict, no `any`; tabs; `~/` imports; folder-per-component with `index.ts` when the component has its own CSS module; flat files otherwise. Do not modify anything under `src/modules/qa/agent/**`, `src/modules/qa/triggers/**`, `src/modules/qa/dashboard/mockData.ts`, `src/models/**`.
- Role comes from the URL: `useLocation().pathname.startsWith('/qa/qa-manager')` → `'qa-manager'`, else `'supervisor'`. Supervisor persona = **Maria García (SUP-001)**, sees Team 1 only. QA Manager persona = **Elena Ruiz (QAM-001)**, sees all teams.

## Shared roster (Plan A `mockData.ts` is the single source; Plan B imports it)

| Supervisor | id | Team | Agents (id · name) |
|---|---|---|---|
| Maria García | SUP-001 | Team 1 | AGT-001 Sarah Johnson · AGT-002 Mike Chen · AGT-003 Jessica Martinez · AGT-004 John Smith · AGT-005 Emma Davis · AGT-006 David Brown · AGT-007 Lisa Wong |
| Juan Pérez | SUP-002 | Team 2 | AGT-008 Sofia Rodríguez · AGT-009 Miguel Fernández · AGT-010 Carlos Vega · AGT-011 Lucía Torres · AGT-012 Diego Ramírez · AGT-013 Valentina Cruz · AGT-014 Andrés Mora |
| Laura Gómez | SUP-003 | Team 3 | AGT-015 Camila Herrera · AGT-016 Javier Ortiz · AGT-017 Nina Patel · AGT-018 Paula Castillo · AGT-019 Tomás Ríos · AGT-020 Isabel Navarro · AGT-021 Bruno Salas |

Campaigns: `camp-001` Q3 Customer Service (Customer Service · INBOUND) · `camp-002` Sales Training (Sales · OUTBOUND) · `camp-003` Q4 Compliance (Collections · BLENDED) · `camp-004` Tech Support (Tech Support · INBOUND).

---
---

# PLAN A — Your Team + Agent Profile

**Goal:** A `Your Team` page (Supervisor) / `Agents` page (QA Manager) listing agents with their headline scores, opening a full **Agent Profile** page with nine tabs that show the agent's complete history since first tracked: overall score and rank, the four evaluation dimensions, operational KPIs, risk history, coaching & LMS, achievements, and an activity timeline with supervisor notes. Three actions (schedule coaching, assign LMS material, send message) write to the section store and push an inbox notification.

**Architecture:** New module `src/modules/qa/team/` with types, constants, deterministic mock builder, helpers, two pages and a `components/` folder. Store `src/stores/qa/teamStore.ts` holds the mutable parts (notes, coaching sessions, LMS assignments, activity) keyed by agent id, seeded from the mock. Namespace `qa.team`. Routes for both roles point at the same two pages; the role is derived from the URL.

## File Structure (Plan A)

### New files
```
src/modules/qa/team/
  types.ts
  constants.ts
  mockData.ts                       — roster (21 agents), campaigns, buildAgentProfile(), TEAM_PROFILES, LMS catalog
  helpers.ts                        — role from path, period filtering, formatters, score color, team KPIs
  YourTeamPage/YourTeamPage.tsx (+ YourTeamPage.module.css, index.ts)
  YourTeamPage/TeamKpiStrip.tsx
  YourTeamPage/TeamFilters.tsx
  YourTeamPage/useTeamColumns.tsx
  AgentProfilePage/AgentProfilePage.tsx (+ AgentProfilePage.module.css, index.ts)
  AgentProfilePage/ProfileHeader.tsx
  AgentProfilePage/tabs/OverviewTab.tsx
  AgentProfilePage/tabs/QATab.tsx
  AgentProfilePage/tabs/SentimentTab.tsx
  AgentProfilePage/tabs/ComplianceTab.tsx
  AgentProfilePage/tabs/BusinessTab.tsx
  AgentProfilePage/tabs/OperationsTab.tsx
  AgentProfilePage/tabs/CoachingLmsTab.tsx
  AgentProfilePage/tabs/AchievementsTab.tsx
  AgentProfilePage/tabs/ActivityTab.tsx
  components/ScoreRing.tsx          — RingProgress + label (shared by header and dimension cards)
  components/DimensionScoreCard.tsx
  components/TrendDelta.tsx         — "+3.2 vs previous period" with icon/color
  components/PerformanceTrendChart.tsx
  components/OperationalMetricCard.tsx
  components/EvaluationHistoryTable.tsx
  components/BadgeGrid.tsx
  components/ActivityTimeline.tsx
  components/NotesPanel.tsx
  components/modals/ScheduleCoachingModal.tsx
  components/modals/AssignLmsModal.tsx
  components/modals/SendMessageModal.tsx
src/stores/qa/teamStore.ts
src/locales/en/qa.team.json
src/locales/es/qa.team.json
```

### Modified files
- `src/routes.tsx` — replace the `YourTeamPage`-less situation: add lazy imports for `YourTeamPage` and `AgentProfilePage` from `./modules/qa/team/...`; add 4 routes; remove the duplicate `qa-manager/agents` block at :970-979; point `qa-manager/agents` (:1057) at the new `YourTeamPage`.
- `src/modules/qa/qaNamespaces.ts` — 4 ids → `['qa.team', 'qa.dashboard']`.
- `src/components/Sidebar/roleNavigation.tsx` — QA Manager: new `qamanager-agents` item + regrouped indices.
- `src/locales/en/common.json`, `src/locales/es/common.json` — `sidebar.qamanager.agents`.

### Deleted files
- `src/modules/qa/dashboard/pages/AgentProfilePage.tsx` (orphan; not exported from `pages/index.ts`, not routed).
- `src/modules/qa/supervisor/pages/YourTeamPage.tsx` and `src/modules/qa/qamanager/pages/AgentsPage.tsx` (placeholders; after Task 8 nothing imports them — verify with grep before deleting).

---

## A · Task 1 — `src/modules/qa/team/types.ts`

- [x] Create the file with exactly this content:

```typescript
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type { BurnoutRiskData } from '~/modules/qa/dashboard/types/burnoutRisk';

export type TeamRole = 'supervisor' | 'qa-manager';
export type ProfilePeriod = '30d' | '90d' | '12m' | 'all';
export type Trend = 'up' | 'down' | 'flat';
export type DimensionKey = 'qa' | 'sentiment' | 'compliance' | 'business';
export type AgentStatus = 'active' | 'on-leave' | 'training';
export type Shift = 'morning' | 'afternoon' | 'night';

export interface RosterSupervisor { id: string; name: string; team: string }
export interface RosterCampaign { id: string; name: string; lineOfBusiness: string; campaignType: 'INBOUND' | 'OUTBOUND' | 'BLENDED' }

export interface RosterAgent {
	id: string;
	name: string;
	email: string;
	supervisorId: string;
	supervisorName: string;
	team: string;
	campaignIds: string[];
	status: AgentStatus;
	shift: Shift;
	hireDate: string; // ISO date
	trackedSince: string; // ISO date — first evaluation on the platform
	skills: string[];
	avatarColor: string; // Mantine color name
}

export interface DimensionScore {
	key: DimensionKey;
	score: number; // qa/compliance 0-100, sentiment 1-5, business = conversion rate 0-100
	delta: number; // vs previous period, same unit
	trend: Trend;
	evaluations: number;
}

export interface OverallScore {
	score: number; // 0-100 weighted composite
	delta: number;
	trend: Trend;
	rankInTeam: number;
	teamSize: number;
	percentile: number; // 0-100
	weights: Record<DimensionKey, number>; // sums to 100
}

export interface PerformancePoint {
	date: string; // ISO first day of month
	label: string; // 'Jan 26'
	overall: number;
	qa: number;
	sentiment: number; // 0-100 (score/5*100) so all series share one axis
	compliance: number;
	business: number; // conversion rate
	callsEvaluated: number;
}

export type OperationalMetricKey =
	| 'callsHandled' | 'callsPerDay' | 'aht' | 'talkTime' | 'holdTime' | 'wrapUpTime'
	| 'fcr' | 'transferRate' | 'adherence' | 'occupancy';

export interface OperationalMetric {
	key: OperationalMetricKey;
	value: number;
	teamAverage: number;
	delta: number; // vs previous period
	unit: 'seconds' | 'percent' | 'count';
	betterWhen: 'higher' | 'lower';
}

export interface OperationalPoint { label: string; aht: number; talk: number; hold: number; wrapUp: number; calls: number }

export type QAErrorTypeCode = 'ECN' | 'ENC' | 'ECC' | 'ECUF';

export interface QAHistory {
	averageScore: number;
	passRate: number; // 0-100
	evaluations: number;
	autoFails: number;
	errorTypes: { code: QAErrorTypeCode; count: number; ratePerCall: number; delta: number }[];
	errorTrend: { label: string; ECN: number; ENC: number; ECC: number; ECUF: number }[];
	topFailedItems: { item: string; aspect: string; errorType: QAErrorTypeCode; count: number }[];
}

export interface SentimentHistory {
	agentAverage: number; // 1-5
	customerAverage: number;
	agentCategories: Record<SentimentCategory, number>; // % share, sum 100
	customerCategories: Record<SentimentCategory, number>;
	agentEmotions: { emotion: Emotion; share: number }[]; // top 5 desc
	customerEmotions: { emotion: Emotion; share: number }[];
	recoveryRate: number; // % of negative-start calls recovered
	empathyPhrasesPerCall: number;
	trend: { label: string; agent: number; customer: number }[];
}

export type ComplianceAreaKey = 'security' | 'regulatory' | 'legal';

export interface ComplianceHistory {
	overall: number;
	areas: { key: ComplianceAreaKey; score: number; violations: number; warnings: number; delta: number }[];
	timeline: { label: string; violations: number; warnings: number }[];
	flaggedItems: { item: string; area: ComplianceAreaKey; count: number; lastSeen: string }[];
}

export type BusinessSignalType =
	| 'EARLY_OBJECTION' | 'UNHANDLED_OBJECTION' | 'COMPETITOR_PLUS_COST' | 'MISTARGETED_OFFER' | 'BEST_TIME_FRAME';
export type NonConversionReasonKey =
	| 'priceTooHigh' | 'noNeed' | 'distrustQuality' | 'thirdPartyDecision' | 'installationRequirements' | 'other';

export interface BusinessHistory {
	conversionRate: number;
	offersPresented: number;
	converted: number;
	followUpsScheduled: number;
	signals: { type: BusinessSignalType; count: number; ratePerCall: number; delta: number }[];
	nonConversionReasons: { key: NonConversionReasonKey; count: number }[];
	competitorMentions: { name: string; count: number }[];
	conversionTrend: { label: string; conversionRate: number; offers: number }[];
}

export interface TriggerAlert {
	id: string;
	ruleName: string;
	metric: string;
	severity: 'info' | 'warning' | 'critical';
	firedAt: string;
	acknowledged: boolean;
}

export interface DisputeSummary {
	id: string;
	callId: string;
	item: string;
	status: 'open' | 'won' | 'lost' | 'withdrawn';
	filedAt: string;
	resolvedAt?: string;
}

export interface RiskHistory {
	criticalErrorsTrend: { label: string; autoFails: number; criticalErrors: number }[];
	alerts: TriggerAlert[];
	disputes: DisputeSummary[];
	burnout: BurnoutRiskData;
	burnoutTrend: { label: string; percentage: number }[];
}

export interface CoachingSession {
	id: string;
	date: string; // ISO
	topic: string;
	coachName: string;
	coachRole: 'SUPERVISOR' | 'QA_MANAGER';
	status: 'scheduled' | 'completed' | 'missed';
	linkedDimension?: DimensionKey;
	outcome?: string;
	followUpDate?: string;
}

export type LmsMaterialType = 'Course' | 'Video' | 'PDF' | 'Article';
export type LmsStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';

export interface LmsMaterial { id: string; title: string; type: LmsMaterialType; durationMin: number; dimension: DimensionKey }

export interface LmsAssignment {
	id: string;
	materialId: string;
	title: string;
	type: LmsMaterialType;
	mandatory: boolean;
	assignedAt: string;
	assignedBy: string;
	dueDate: string;
	progress: number; // 0-100
	status: LmsStatus;
	completedAt?: string;
}

export interface EarnedBadge {
	id: string;
	type: string; // key of PREDEFINED_BADGE_CATALOGS
	name: string;
	icon: string;
	earnedAt: string;
	reason: string;
}

export interface MilestoneProgress { id: string; name: string; description: string; progress: number; achievedAt?: string }

export interface RankingPoint { label: string; position: number; teamSize: number; score: number }

export type ActivityType = 'evaluation' | 'badge' | 'milestone' | 'coaching' | 'lms' | 'alert' | 'dispute' | 'note' | 'rank';

export interface ActivityEvent {
	id: string;
	type: ActivityType;
	date: string; // ISO
	title: string;
	description: string;
	link?: string;
}

export interface SupervisorNote {
	id: string;
	agentId: string;
	authorName: string;
	authorRole: 'SUPERVISOR' | 'QA_MANAGER';
	createdAt: string;
	text: string;
	pinned: boolean;
}

export interface EvaluationHistoryRow {
	id: string;
	callId: string;
	campaignId: string;
	campaignName: string;
	date: string;
	durationSeconds: number;
	qaScore: number;
	customerSentiment: number;
	complianceScore: number;
	converted: boolean;
	autoFail: boolean;
	evaluatedBy: 'AI' | 'Manual';
}

export interface StrengthOrWeakness { label: string; evidence: string; suggestedAction?: string }

export interface AgentProfile {
	agent: RosterAgent;
	overall: OverallScore;
	dimensions: DimensionScore[];
	performance: PerformancePoint[]; // one per month from trackedSince to NOW
	operational: OperationalMetric[];
	operationalTrend: OperationalPoint[];
	qa: QAHistory;
	sentiment: SentimentHistory;
	compliance: ComplianceHistory;
	business: BusinessHistory;
	risk: RiskHistory;
	coaching: CoachingSession[];
	lms: LmsAssignment[];
	badges: EarnedBadge[];
	milestones: MilestoneProgress[];
	rankingHistory: RankingPoint[];
	activity: ActivityEvent[];
	notes: SupervisorNote[];
	evaluations: EvaluationHistoryRow[];
	peerComparison: { label: string; agentValue: number; teamAverage: number; unit?: string }[];
	strengths: StrengthOrWeakness[];
	weaknesses: StrengthOrWeakness[];
}

export interface TeamTableRow {
	id: string;
	name: string;
	team: string;
	supervisorName: string;
	status: AgentStatus;
	overall: number;
	overallTrend: Trend;
	qa: number;
	sentiment: number;
	compliance: number;
	conversionRate: number;
	ahtSeconds: number;
	burnoutLevel: BurnoutRiskData['level'];
	badges: number;
	openCoaching: number;
	overdueLms: number;
	lastEvaluationAt: string;
}

export interface TeamFilters {
	search: string;
	status: AgentStatus | 'all';
	campaignId: string | 'all';
	supervisorId: string | 'all'; // QA Manager only
	riskOnly: boolean;
}
```

- [x] `npm run typecheck` (no consumers yet; must be clean for this file).

---

## A · Task 2 — `src/modules/qa/team/constants.ts`

- [x] Paste:

```typescript
import type { TablerIcon } from '@tabler/icons-react';
import {
	IconAward, IconBriefcase, IconClipboardList, IconHeadset, IconHistory, IconMoodSmile,
	IconSchool, IconShieldCheck, IconTrendingUp,
} from '@tabler/icons-react';
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type {
	ActivityType, BusinessSignalType, ComplianceAreaKey, DimensionKey, LmsMaterial,
	NonConversionReasonKey, OperationalMetricKey, ProfilePeriod, QAErrorTypeCode,
} from './types';

export const NOW_ISO = '2026-09-12T15:00:00Z';
export const SUPERVISOR_PERSONA = { id: 'SUP-001', name: 'Maria García' };
export const QA_MANAGER_PERSONA = { id: 'QAM-001', name: 'Elena Ruiz' };

export const PROFILE_PERIODS: { value: ProfilePeriod; labelKey: string; months: number | null }[] = [
	{ value: '30d', labelKey: 'period.30d', months: 1 },
	{ value: '90d', labelKey: 'period.90d', months: 3 },
	{ value: '12m', labelKey: 'period.12m', months: 12 },
	{ value: 'all', labelKey: 'period.all', months: null },
];

export type ProfileTab = 'overview' | 'qa' | 'sentiment' | 'compliance' | 'business' | 'operations' | 'coaching' | 'achievements' | 'activity';
export const PROFILE_TABS: { value: ProfileTab; labelKey: string; icon: TablerIcon }[] = [
	{ value: 'overview', labelKey: 'tabs.overview', icon: IconTrendingUp },
	{ value: 'qa', labelKey: 'tabs.qa', icon: IconClipboardList },
	{ value: 'sentiment', labelKey: 'tabs.sentiment', icon: IconMoodSmile },
	{ value: 'compliance', labelKey: 'tabs.compliance', icon: IconShieldCheck },
	{ value: 'business', labelKey: 'tabs.business', icon: IconBriefcase },
	{ value: 'operations', labelKey: 'tabs.operations', icon: IconHeadset },
	{ value: 'coaching', labelKey: 'tabs.coaching', icon: IconSchool },
	{ value: 'achievements', labelKey: 'tabs.achievements', icon: IconAward },
	{ value: 'activity', labelKey: 'tabs.activity', icon: IconHistory },
];

export const DIMENSION_META: Record<DimensionKey, { labelKey: string; color: string; icon: TablerIcon; max: number; unit: '%' | '/5' }> = {
	qa: { labelKey: 'dimension.qa', color: 'orange', icon: IconClipboardList, max: 100, unit: '%' },
	sentiment: { labelKey: 'dimension.sentiment', color: 'violet', icon: IconMoodSmile, max: 5, unit: '/5' },
	compliance: { labelKey: 'dimension.compliance', color: 'green', icon: IconShieldCheck, max: 100, unit: '%' },
	business: { labelKey: 'dimension.business', color: 'blue', icon: IconBriefcase, max: 100, unit: '%' },
};
export const DIMENSION_ORDER: DimensionKey[] = ['qa', 'sentiment', 'compliance', 'business'];
export const OVERALL_WEIGHTS: Record<DimensionKey, number> = { qa: 40, sentiment: 20, compliance: 25, business: 15 };

export const QA_ERROR_TYPE_META: Record<QAErrorTypeCode, { label: string; shortLabel: string; color: string }> = {
	ECN: { label: 'Critical Business Error', shortLabel: 'Business Critical', color: 'red' },
	ENC: { label: 'Non-Critical Error', shortLabel: 'Non-Critical', color: 'orange' },
	ECC: { label: 'Critical Compliance Error', shortLabel: 'Compliance', color: 'grape' },
	ECUF: { label: 'Critical End-User Error', shortLabel: 'End-User', color: 'yellow' },
};
export const QA_ERROR_TYPE_ORDER: QAErrorTypeCode[] = ['ECN', 'ENC', 'ECC', 'ECUF'];

export const SENTIMENT_CATEGORY_ORDER: SentimentCategory[] = ['very-negative', 'negative', 'neutral', 'positive', 'very-positive'];
export const SENTIMENT_CATEGORY_META: Record<SentimentCategory, { label: string; color: string }> = {
	'very-negative': { label: 'Very Negative', color: 'red' },
	'negative': { label: 'Negative', color: 'orange' },
	'neutral': { label: 'Neutral', color: 'gray' },
	'positive': { label: 'Positive', color: 'teal' },
	'very-positive': { label: 'Very Positive', color: 'green' },
};
export const EMOTION_META: Record<Emotion, { label: string; color: string }> = {
	RAGE: { label: 'Rage', color: 'red' }, ANGER: { label: 'Anger', color: 'red' },
	FRUSTRATION: { label: 'Frustration', color: 'orange' }, DISAPPOINTMENT: { label: 'Disappointment', color: 'orange' },
	SADNESS: { label: 'Sadness', color: 'orange' }, FEAR: { label: 'Fear', color: 'yellow' },
	NEUTRAL: { label: 'Neutral', color: 'gray' }, SURPRISE: { label: 'Surprise', color: 'blue' },
	RELIEF: { label: 'Relief', color: 'teal' }, SATISFACTION: { label: 'Satisfaction', color: 'teal' },
	GRATITUDE: { label: 'Gratitude', color: 'teal' }, JOY: { label: 'Joy', color: 'green' }, ELATION: { label: 'Elation', color: 'green' },
};

export const COMPLIANCE_AREA_META: Record<ComplianceAreaKey, { label: string; color: string; items: string[] }> = {
	security: { label: 'Security', color: 'blue', items: ['Data Protection', 'Disclosure Compliance'] },
	regulatory: { label: 'Regulatory', color: 'orange', items: ['Billing Process', 'Transparency'] },
	legal: { label: 'Legal', color: 'red', items: ['Threats', 'Social Media', 'Banking Superintendence', 'Do-Not-Call'] },
};
export const COMPLIANCE_AREA_ORDER: ComplianceAreaKey[] = ['security', 'regulatory', 'legal'];

export const BUSINESS_SIGNAL_META: Record<BusinessSignalType, { label: string; tone: 'risk' | 'opportunity' }> = {
	EARLY_OBJECTION: { label: 'Early Objection', tone: 'risk' },
	UNHANDLED_OBJECTION: { label: 'Unhandled Objection', tone: 'risk' },
	COMPETITOR_PLUS_COST: { label: 'Competitor Plus Cost', tone: 'risk' },
	MISTARGETED_OFFER: { label: 'Mis-targeted Offer', tone: 'risk' },
	BEST_TIME_FRAME: { label: 'Best Time Frame', tone: 'opportunity' },
};
export const BUSINESS_SIGNAL_ORDER: BusinessSignalType[] = ['EARLY_OBJECTION', 'UNHANDLED_OBJECTION', 'COMPETITOR_PLUS_COST', 'MISTARGETED_OFFER', 'BEST_TIME_FRAME'];
export const NON_CONVERSION_REASON_LABELS: Record<NonConversionReasonKey, string> = {
	priceTooHigh: 'Price too high', noNeed: 'No need for the product', distrustQuality: 'Distrust in quality / service',
	thirdPartyDecision: 'Decision depends on a third party', installationRequirements: 'Installation requirements', other: 'Other',
};

export const OPERATIONAL_META: Record<OperationalMetricKey, { labelKey: string; unit: 'seconds' | 'percent' | 'count'; betterWhen: 'higher' | 'lower'; baseline: number }> = {
	callsHandled: { labelKey: 'ops.callsHandled', unit: 'count', betterWhen: 'higher', baseline: 540 },
	callsPerDay: { labelKey: 'ops.callsPerDay', unit: 'count', betterWhen: 'higher', baseline: 27 },
	aht: { labelKey: 'ops.aht', unit: 'seconds', betterWhen: 'lower', baseline: 372 },
	talkTime: { labelKey: 'ops.talkTime', unit: 'seconds', betterWhen: 'lower', baseline: 268 },
	holdTime: { labelKey: 'ops.holdTime', unit: 'seconds', betterWhen: 'lower', baseline: 41 },
	wrapUpTime: { labelKey: 'ops.wrapUpTime', unit: 'seconds', betterWhen: 'lower', baseline: 63 },
	fcr: { labelKey: 'ops.fcr', unit: 'percent', betterWhen: 'higher', baseline: 78 },
	transferRate: { labelKey: 'ops.transferRate', unit: 'percent', betterWhen: 'lower', baseline: 9 },
	adherence: { labelKey: 'ops.adherence', unit: 'percent', betterWhen: 'higher', baseline: 93 },
	occupancy: { labelKey: 'ops.occupancy', unit: 'percent', betterWhen: 'higher', baseline: 81 },
};
export const OPERATIONAL_ORDER: OperationalMetricKey[] = ['callsHandled', 'callsPerDay', 'aht', 'talkTime', 'holdTime', 'wrapUpTime', 'fcr', 'transferRate', 'adherence', 'occupancy'];

export const ACTIVITY_META: Record<ActivityType, { color: string; labelKey: string }> = {
	evaluation: { color: 'gray', labelKey: 'activity.types.evaluation' },
	badge: { color: 'yellow', labelKey: 'activity.types.badge' },
	milestone: { color: 'grape', labelKey: 'activity.types.milestone' },
	coaching: { color: 'blue', labelKey: 'activity.types.coaching' },
	lms: { color: 'teal', labelKey: 'activity.types.lms' },
	alert: { color: 'red', labelKey: 'activity.types.alert' },
	dispute: { color: 'orange', labelKey: 'activity.types.dispute' },
	note: { color: 'indigo', labelKey: 'activity.types.note' },
	rank: { color: 'green', labelKey: 'activity.types.rank' },
};

export const LMS_CATALOG: LmsMaterial[] = [
	{ id: 'lms-001', title: 'Objection Handling Fundamentals', type: 'Course', durationMin: 45, dimension: 'business' },
	{ id: 'lms-002', title: 'Active Listening & Empathy', type: 'Video', durationMin: 20, dimension: 'sentiment' },
	{ id: 'lms-003', title: 'Regulatory Disclosures 2026', type: 'PDF', durationMin: 15, dimension: 'compliance' },
	{ id: 'lms-004', title: 'Closing the Call: Recap & Next Steps', type: 'Article', durationMin: 10, dimension: 'qa' },
	{ id: 'lms-005', title: 'Handling Competitor Comparisons', type: 'Course', durationMin: 35, dimension: 'business' },
	{ id: 'lms-006', title: 'De-escalation Techniques', type: 'Video', durationMin: 25, dimension: 'sentiment' },
	{ id: 'lms-007', title: 'Data Protection on Calls', type: 'Course', durationMin: 30, dimension: 'compliance' },
	{ id: 'lms-008', title: 'Needs Assessment Questions', type: 'Article', durationMin: 12, dimension: 'qa' },
];

export const COACHING_TOPICS = [
	'Objection handling', 'Empathy & tone', 'Mandatory disclosures', 'Call closing', 'Needs assessment',
	'Competitor positioning', 'Handling frustrated customers', 'Auto-fail prevention',
];

export const SCORE_COLOR_STEPS: [number, string][] = [[90, 'green'], [80, 'lime'], [70, 'yellow'], [60, 'orange'], [0, 'red']];
```

- [x] `npm run typecheck`.

---

## A · Task 3 — `src/modules/qa/team/mockData.ts` (roster + deterministic profile builder)

The builder makes every agent's profile from a small persona table; numbers are stable across reloads. Keep it in one file (~350 lines).

- [x] **Step 1: roster + campaigns** (paste)

```typescript
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import { PREDEFINED_BADGE_CATALOGS } from '~/models/qa/badges';
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type {
	ActivityEvent, AgentProfile, CoachingSession, DimensionKey, DimensionScore, EarnedBadge, EvaluationHistoryRow,
	LmsAssignment, OperationalMetric, PerformancePoint, RosterAgent, RosterCampaign, RosterSupervisor, Trend,
} from './types';
import {
	BUSINESS_SIGNAL_ORDER, COMPLIANCE_AREA_ORDER, LMS_CATALOG, NOW_ISO, OPERATIONAL_META, OPERATIONAL_ORDER,
	OVERALL_WEIGHTS, QA_ERROR_TYPE_ORDER, SENTIMENT_CATEGORY_ORDER,
} from './constants';

export const TEAM_SUPERVISORS: RosterSupervisor[] = [
	{ id: 'SUP-001', name: 'Maria García', team: 'Team 1' },
	{ id: 'SUP-002', name: 'Juan Pérez', team: 'Team 2' },
	{ id: 'SUP-003', name: 'Laura Gómez', team: 'Team 3' },
];

export const TEAM_CAMPAIGNS: RosterCampaign[] = [
	{ id: 'camp-001', name: 'Q3 Customer Service', lineOfBusiness: 'Customer Service', campaignType: 'INBOUND' },
	{ id: 'camp-002', name: 'Sales Training', lineOfBusiness: 'Sales', campaignType: 'OUTBOUND' },
	{ id: 'camp-003', name: 'Q4 Compliance', lineOfBusiness: 'Collections', campaignType: 'BLENDED' },
	{ id: 'camp-004', name: 'Tech Support', lineOfBusiness: 'Tech Support', campaignType: 'INBOUND' },
];

/** Persona knobs: base level per dimension (0-1 = weak..strong) and a monthly slope (-1..1). */
interface Persona {
	id: string; name: string; supervisorId: string; campaignIds: string[]; status?: RosterAgent['status']; shift?: RosterAgent['shift'];
	hireDate: string; trackedSince: string; base: Record<DimensionKey, number>; slope: number; burnout: BurnoutRiskLevel; skills: string[];
}

const AVATAR_COLORS = ['blue', 'teal', 'grape', 'orange', 'cyan', 'indigo', 'pink', 'lime', 'violet', 'green'];

export const PERSONAS: Persona[] = [
	{ id: 'AGT-001', name: 'Sarah Johnson', supervisorId: 'SUP-001', campaignIds: ['camp-001'], hireDate: '2023-03-06', trackedSince: '2025-01-13', base: { qa: 0.92, sentiment: 0.9, compliance: 0.95, business: 0.8 }, slope: 0.1, burnout: BurnoutRiskLevel.LOW, skills: ['Retention', 'Upsell', 'Bilingual'] },
	{ id: 'AGT-002', name: 'Mike Chen', supervisorId: 'SUP-001', campaignIds: ['camp-001', 'camp-003'], hireDate: '2022-11-14', trackedSince: '2025-01-13', base: { qa: 0.85, sentiment: 0.78, compliance: 0.98, business: 0.7 }, slope: 0.05, burnout: BurnoutRiskLevel.LOW, skills: ['Collections', 'Compliance'] },
	{ id: 'AGT-003', name: 'Jessica Martinez', supervisorId: 'SUP-001', campaignIds: ['camp-001'], hireDate: '2024-05-20', trackedSince: '2025-02-03', base: { qa: 0.8, sentiment: 0.82, compliance: 0.86, business: 0.66 }, slope: 0.15, burnout: BurnoutRiskLevel.LOW, skills: ['Customer Service'] },
	{ id: 'AGT-004', name: 'John Smith', supervisorId: 'SUP-001', campaignIds: ['camp-001'], hireDate: '2024-09-02', trackedSince: '2025-03-03', base: { qa: 0.72, sentiment: 0.74, compliance: 0.84, business: 0.6 }, slope: 0.35, burnout: BurnoutRiskLevel.LOW, skills: ['Customer Service', 'Tech Support'] },
	{ id: 'AGT-005', name: 'Emma Davis', supervisorId: 'SUP-001', campaignIds: ['camp-001'], hireDate: '2023-08-21', trackedSince: '2025-01-13', base: { qa: 0.78, sentiment: 0.52, compliance: 0.88, business: 0.62 }, slope: -0.1, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Customer Service'] },
	{ id: 'AGT-006', name: 'David Brown', supervisorId: 'SUP-001', campaignIds: ['camp-001', 'camp-003'], hireDate: '2022-02-07', trackedSince: '2025-01-13', base: { qa: 0.58, sentiment: 0.45, compliance: 0.7, business: 0.5 }, slope: -0.35, burnout: BurnoutRiskLevel.HIGH, skills: ['Collections'] },
	{ id: 'AGT-007', name: 'Lisa Wong', supervisorId: 'SUP-001', campaignIds: ['camp-003'], hireDate: '2023-01-16', trackedSince: '2025-01-13', base: { qa: 0.84, sentiment: 0.8, compliance: 0.68, business: 0.72 }, slope: -0.05, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Collections', 'Retention'] },
	{ id: 'AGT-008', name: 'Sofia Rodríguez', supervisorId: 'SUP-002', campaignIds: ['camp-002'], hireDate: '2023-06-12', trackedSince: '2025-01-20', base: { qa: 0.82, sentiment: 0.8, compliance: 0.9, business: 0.55 }, slope: 0.05, burnout: BurnoutRiskLevel.LOW, skills: ['Sales', 'Bilingual'] },
	{ id: 'AGT-009', name: 'Miguel Fernández', supervisorId: 'SUP-002', campaignIds: ['camp-002'], hireDate: '2024-01-08', trackedSince: '2025-01-20', base: { qa: 0.76, sentiment: 0.7, compliance: 0.85, business: 0.74 }, slope: 0.2, burnout: BurnoutRiskLevel.LOW, skills: ['Sales'] },
	{ id: 'AGT-010', name: 'Carlos Vega', supervisorId: 'SUP-002', campaignIds: ['camp-002', 'camp-004'], hireDate: '2022-07-25', trackedSince: '2025-01-20', base: { qa: 0.7, sentiment: 0.68, compliance: 0.62, business: 0.7 }, slope: -0.2, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Sales', 'Tech Support'] },
	{ id: 'AGT-011', name: 'Lucía Torres', supervisorId: 'SUP-002', campaignIds: ['camp-004'], hireDate: '2023-10-02', trackedSince: '2025-01-20', base: { qa: 0.88, sentiment: 0.93, compliance: 0.9, business: 0.65 }, slope: 0.08, burnout: BurnoutRiskLevel.LOW, skills: ['Tech Support', 'De-escalation'] },
	{ id: 'AGT-012', name: 'Diego Ramírez', supervisorId: 'SUP-002', campaignIds: ['camp-002'], hireDate: '2024-03-18', trackedSince: '2025-04-07', base: { qa: 0.74, sentiment: 0.6, compliance: 0.86, business: 0.58 }, slope: -0.15, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Sales'] },
	{ id: 'AGT-013', name: 'Valentina Cruz', supervisorId: 'SUP-002', campaignIds: ['camp-002'], hireDate: '2024-08-05', trackedSince: '2025-04-07', base: { qa: 0.79, sentiment: 0.84, compliance: 0.88, business: 0.68 }, slope: 0.12, burnout: BurnoutRiskLevel.LOW, skills: ['Sales', 'Bilingual'] },
	{ id: 'AGT-014', name: 'Andrés Mora', supervisorId: 'SUP-002', campaignIds: ['camp-004'], hireDate: '2023-04-10', trackedSince: '2025-01-20', status: 'on-leave', base: { qa: 0.81, sentiment: 0.76, compliance: 0.9, business: 0.6 }, slope: 0, burnout: BurnoutRiskLevel.LOW, skills: ['Tech Support'] },
	{ id: 'AGT-015', name: 'Camila Herrera', supervisorId: 'SUP-003', campaignIds: ['camp-003', 'camp-001'], hireDate: '2022-05-09', trackedSince: '2025-02-10', base: { qa: 0.96, sentiment: 0.88, compliance: 0.97, business: 0.78 }, slope: 0.03, burnout: BurnoutRiskLevel.LOW, skills: ['Collections', 'Mentor'] },
	{ id: 'AGT-016', name: 'Javier Ortiz', supervisorId: 'SUP-003', campaignIds: ['camp-003'], hireDate: '2024-02-19', trackedSince: '2025-02-10', base: { qa: 0.77, sentiment: 0.72, compliance: 0.83, business: 0.64 }, slope: 0.1, burnout: BurnoutRiskLevel.LOW, skills: ['Collections'] },
	{ id: 'AGT-017', name: 'Nina Patel', supervisorId: 'SUP-003', campaignIds: ['camp-003'], hireDate: '2023-09-11', trackedSince: '2025-02-10', base: { qa: 0.62, sentiment: 0.7, compliance: 0.75, business: 0.6 }, slope: -0.25, burnout: BurnoutRiskLevel.HIGH, skills: ['Collections'] },
	{ id: 'AGT-018', name: 'Paula Castillo', supervisorId: 'SUP-003', campaignIds: ['camp-001'], hireDate: '2025-01-06', trackedSince: '2025-05-05', status: 'training', base: { qa: 0.7, sentiment: 0.78, compliance: 0.82, business: 0.55 }, slope: 0.3, burnout: BurnoutRiskLevel.LOW, skills: ['Customer Service'] },
	{ id: 'AGT-019', name: 'Tomás Ríos', supervisorId: 'SUP-003', campaignIds: ['camp-003'], hireDate: '2023-11-27', trackedSince: '2025-02-10', base: { qa: 0.83, sentiment: 0.79, compliance: 0.91, business: 0.7 }, slope: 0.02, burnout: BurnoutRiskLevel.LOW, skills: ['Collections', 'Retention'] },
	{ id: 'AGT-020', name: 'Isabel Navarro', supervisorId: 'SUP-003', campaignIds: ['camp-001'], hireDate: '2022-09-19', trackedSince: '2025-02-10', base: { qa: 0.87, sentiment: 0.86, compliance: 0.93, business: 0.75 }, slope: 0.04, burnout: BurnoutRiskLevel.LOW, skills: ['Customer Service', 'Mentor'] },
	{ id: 'AGT-021', name: 'Bruno Salas', supervisorId: 'SUP-003', campaignIds: ['camp-003', 'camp-001'], hireDate: '2024-06-03', trackedSince: '2025-05-05', base: { qa: 0.75, sentiment: 0.66, compliance: 0.8, business: 0.62 }, slope: -0.08, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Collections'] },
];

export const TEAM_AGENTS: RosterAgent[] = PERSONAS.map((p, i) => {
	const sup = TEAM_SUPERVISORS.find((s) => s.id === p.supervisorId)!;
	return {
		id: p.id, name: p.name, email: `${p.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(' ', '.')}@newtech.com`,
		supervisorId: sup.id, supervisorName: sup.name, team: sup.team, campaignIds: p.campaignIds,
		status: p.status ?? 'active', shift: p.shift ?? (i % 3 === 0 ? 'morning' : i % 3 === 1 ? 'afternoon' : 'night'),
		hireDate: p.hireDate, trackedSince: p.trackedSince, skills: p.skills, avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
	};
});
```

- [x] **Step 2: helpers inside mockData.ts** (paste below Step 1)

```typescript
function seeded(seed: number) {
	let s = seed;
	return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = (d: Date) => `${MONTH_LABELS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const trendOf = (delta: number, flatBand: number): Trend => (delta > flatBand ? 'up' : delta < -flatBand ? 'down' : 'flat');

/** Months from trackedSince (first day) to NOW (first day), inclusive. */
function monthsSince(trackedSince: string): Date[] {
	const start = new Date(trackedSince); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
	const end = new Date(NOW_ISO); end.setUTCDate(1); end.setUTCHours(0, 0, 0, 0);
	const out: Date[] = [];
	for (let d = new Date(start); d <= end; d.setUTCMonth(d.getUTCMonth() + 1)) out.push(new Date(d));
	return out;
}

/** Dimension value at month index i of n: base ± slope drift + noise. qa/compliance/business → 0-100, sentiment → 1-5. */
function dimensionAt(key: DimensionKey, base: number, slope: number, i: number, n: number, rand: () => number): number {
	const progress = n <= 1 ? 1 : i / (n - 1);
	const drift = slope * 0.18 * (progress - 0.5) * 2; // ±18% of range across the whole history
	const noise = (rand() - 0.5) * 0.08;
	const v = clamp(base + drift + noise, 0.05, 1);
	return key === 'sentiment' ? round1(1 + v * 4) : Math.round(v * 100);
}

const toPct = (key: DimensionKey, v: number) => (key === 'sentiment' ? Math.round(((v - 1) / 4) * 100) : v);
```

- [x] **Step 3: `buildAgentProfile(persona, rankCtx)`** (paste). It must produce every `AgentProfile` field; rules per block:

```typescript
interface RankContext { rankInTeam: number; teamSize: number; percentile: number }

export function buildAgentProfile(p: Persona, rank: RankContext): AgentProfile {
	const agent = TEAM_AGENTS.find((a) => a.id === p.id)!;
	const rand = seeded(Number(p.id.replace(/\D/g, '')) * 7919);
	const months = monthsSince(p.trackedSince);
	const n = months.length;

	// --- performance series (one point per month) ---
	const performance: PerformancePoint[] = months.map((d, i) => {
		const qa = dimensionAt('qa', p.base.qa, p.slope, i, n, rand);
		const sentiment = dimensionAt('sentiment', p.base.sentiment, p.slope, i, n, rand);
		const compliance = dimensionAt('compliance', p.base.compliance, p.slope * 0.6, i, n, rand);
		const business = dimensionAt('business', p.base.business, p.slope, i, n, rand);
		const overall = Math.round((qa * OVERALL_WEIGHTS.qa + toPct('sentiment', sentiment) * OVERALL_WEIGHTS.sentiment + compliance * OVERALL_WEIGHTS.compliance + business * OVERALL_WEIGHTS.business) / 100);
		return { date: isoDay(d), label: monthLabel(d), overall, qa, sentiment: toPct('sentiment', sentiment), compliance, business, callsEvaluated: 18 + Math.round(rand() * 14) };
	});
	const last = performance[n - 1];
	const prev = performance[Math.max(0, n - 2)];
	const lastSentiment5 = round1(1 + (last.sentiment / 100) * 4);
	const prevSentiment5 = round1(1 + (prev.sentiment / 100) * 4);

	const dimensions: DimensionScore[] = [
		{ key: 'qa', score: last.qa, delta: last.qa - prev.qa, trend: trendOf(last.qa - prev.qa, 1.5), evaluations: last.callsEvaluated },
		{ key: 'sentiment', score: lastSentiment5, delta: round1(lastSentiment5 - prevSentiment5), trend: trendOf(lastSentiment5 - prevSentiment5, 0.1), evaluations: last.callsEvaluated },
		{ key: 'compliance', score: last.compliance, delta: last.compliance - prev.compliance, trend: trendOf(last.compliance - prev.compliance, 1.5), evaluations: last.callsEvaluated },
		{ key: 'business', score: last.business, delta: last.business - prev.business, trend: trendOf(last.business - prev.business, 1.5), evaluations: Math.round(last.callsEvaluated * 0.6) },
	];
	const overall = { score: last.overall, delta: last.overall - prev.overall, trend: trendOf(last.overall - prev.overall, 1.5), ...rank, weights: OVERALL_WEIGHTS };

	// --- operational: value = baseline scaled by persona quality (worse agents slower / more transfers) ---
	const quality = (p.base.qa + p.base.sentiment) / 2; // 0-1
	const operational: OperationalMetric[] = OPERATIONAL_ORDER.map((key) => {
		const meta = OPERATIONAL_META[key];
		const factor = meta.betterWhen === 'lower' ? 1 + (0.75 - quality) * 0.5 : 1 + (quality - 0.75) * 0.3;
		const value = meta.unit === 'percent' ? clamp(Math.round(meta.baseline * factor), 0, 100) : Math.round(meta.baseline * factor);
		const teamAverage = meta.baseline;
		const delta = Math.round((rand() - 0.5) * (meta.unit === 'seconds' ? 30 : meta.unit === 'count' ? 20 : 6));
		return { key, value, teamAverage, delta, unit: meta.unit, betterWhen: meta.betterWhen };
	});
	const ahtNow = operational.find((m) => m.key === 'aht')!.value;
	const operationalTrend = performance.slice(-12).map((pt) => {
		const aht = Math.round(ahtNow * (0.92 + rand() * 0.16));
		const talk = Math.round(aht * 0.72), hold = Math.round(aht * 0.11), wrapUp = aht - talk - hold;
		return { label: pt.label, aht, talk, hold, wrapUp, calls: 420 + Math.round(rand() * 200) };
	});

	// --- QA history ---
	const totalEvals = performance.reduce((s, pt) => s + pt.callsEvaluated, 0);
	const errorRates: Record<string, number> = { ECN: 0.12, ENC: 0.35, ECC: 0.05, ECUF: 0.04 };
	const qaWeak = 1.4 - p.base.qa; // 0.44 (strong) .. 0.82 (weak)
	const qa = {
		averageScore: Math.round(performance.reduce((s, pt) => s + pt.qa, 0) / n),
		passRate: clamp(Math.round(60 + p.base.qa * 40), 0, 100),
		evaluations: totalEvals,
		autoFails: Math.round(totalEvals * 0.02 * qaWeak),
		errorTypes: QA_ERROR_TYPE_ORDER.map((code) => {
			const count = Math.round(totalEvals * errorRates[code] * qaWeak);
			return { code, count, ratePerCall: round1((count / totalEvals) * 100), delta: Math.round((rand() - 0.5) * 4) };
		}),
		errorTrend: performance.slice(-12).map((pt) => ({
			label: pt.label,
			ECN: Math.round(pt.callsEvaluated * errorRates.ECN * qaWeak * (0.7 + rand() * 0.6)),
			ENC: Math.round(pt.callsEvaluated * errorRates.ENC * qaWeak * (0.7 + rand() * 0.6)),
			ECC: Math.round(pt.callsEvaluated * errorRates.ECC * qaWeak * (0.7 + rand() * 0.6)),
			ECUF: Math.round(pt.callsEvaluated * errorRates.ECUF * qaWeak * (0.7 + rand() * 0.6)),
		})),
		topFailedItems: [
			{ item: 'Asked discovery questions before presenting the offer', aspect: 'Needs Assessment', errorType: 'ENC' as const, count: Math.round(totalEvals * 0.14 * qaWeak) },
			{ item: 'Resolved the main objection (price / competitor)', aspect: 'Objection Handling', errorType: 'ECN' as const, count: Math.round(totalEvals * 0.09 * qaWeak) },
			{ item: 'Recapped the offer and next steps', aspect: 'Closing', errorType: 'ENC' as const, count: Math.round(totalEvals * 0.11 * qaWeak) },
			{ item: 'Contract and cancellation terms disclosed', aspect: 'Mandatory Disclosures', errorType: 'ECUF' as const, count: Math.round(totalEvals * 0.03 * qaWeak) },
			{ item: 'Verified customer identity before discussing the account', aspect: 'Opening & Identification', errorType: 'ECC' as const, count: Math.round(totalEvals * 0.03 * qaWeak) },
		].sort((a, b) => b.count - a.count),
	};

	// --- Sentiment history --- (category shares derive from the 1-5 average: higher avg → more positive share)
	const share = (avg: number): Record<SentimentCategory, number> => {
		const pos = clamp((avg - 1) / 4, 0, 1);
		const raw = [Math.round((1 - pos) * 12), Math.round((1 - pos) * 38), Math.round(30 + (0.5 - Math.abs(pos - 0.5)) * 20), Math.round(pos * 32), Math.round(pos * 12)];
		const total = raw.reduce((a, b) => a + b, 0);
		const pct = raw.map((v) => Math.round((v / total) * 100));
		pct[2] += 100 - pct.reduce((a, b) => a + b, 0); // make it sum 100
		return Object.fromEntries(SENTIMENT_CATEGORY_ORDER.map((k, i) => [k, pct[i]])) as Record<SentimentCategory, number>;
	};
	const emotionsFor = (avg: number): { emotion: Emotion; share: number }[] => (
		avg >= 3.5
			? [{ emotion: 'NEUTRAL', share: 34 }, { emotion: 'SATISFACTION', share: 26 }, { emotion: 'GRATITUDE', share: 16 }, { emotion: 'RELIEF', share: 14 }, { emotion: 'FRUSTRATION', share: 10 }]
			: [{ emotion: 'FRUSTRATION', share: 31 }, { emotion: 'NEUTRAL', share: 28 }, { emotion: 'DISAPPOINTMENT', share: 17 }, { emotion: 'ANGER', share: 12 }, { emotion: 'RELIEF', share: 12 }]
	);
	const agentAvg = lastSentiment5;
	const customerAvg = round1(clamp(agentAvg - 0.6 + rand() * 0.4, 1, 5));
	const sentiment = {
		agentAverage: agentAvg, customerAverage: customerAvg,
		agentCategories: share(agentAvg), customerCategories: share(customerAvg),
		agentEmotions: emotionsFor(agentAvg), customerEmotions: emotionsFor(customerAvg),
		recoveryRate: clamp(Math.round(30 + p.base.sentiment * 55), 0, 100),
		empathyPhrasesPerCall: round1(1 + p.base.sentiment * 2.5),
		trend: performance.slice(-12).map((pt) => ({ label: pt.label, agent: round1(1 + (pt.sentiment / 100) * 4), customer: round1(clamp(1 + (pt.sentiment / 100) * 4 - 0.6 + rand() * 0.4, 1, 5)) })),
	};

	// --- Compliance history ---
	const compWeak = 1.3 - p.base.compliance;
	const compliance = {
		overall: last.compliance,
		areas: COMPLIANCE_AREA_ORDER.map((key, i) => ({
			key, score: clamp(last.compliance + [4, -6, 2][i] + Math.round((rand() - 0.5) * 6), 0, 100),
			violations: Math.round(totalEvals * [0.005, 0.02, 0.004][i] * compWeak), warnings: Math.round(totalEvals * [0.02, 0.06, 0.015][i] * compWeak),
			delta: Math.round((rand() - 0.5) * 6),
		})),
		timeline: performance.slice(-12).map((pt) => ({ label: pt.label, violations: Math.round(pt.callsEvaluated * 0.03 * compWeak * rand()), warnings: Math.round(pt.callsEvaluated * 0.1 * compWeak * rand()) })),
		flaggedItems: [
			{ item: 'Transparency', area: 'regulatory' as const, count: Math.round(totalEvals * 0.05 * compWeak), lastSeen: '2026-09-08' },
			{ item: 'Disclosure Compliance', area: 'security' as const, count: Math.round(totalEvals * 0.02 * compWeak), lastSeen: '2026-08-27' },
			{ item: 'Do-Not-Call', area: 'legal' as const, count: Math.round(totalEvals * 0.008 * compWeak), lastSeen: '2026-07-15' },
		].filter((f) => f.count > 0),
	};

	// --- Business history ---
	const offers = Math.round(totalEvals * 0.6);
	const converted = Math.round(offers * (last.business / 100));
	const bizWeak = 1.3 - p.base.business;
	const signalRates: Record<string, number> = { EARLY_OBJECTION: 0.22, UNHANDLED_OBJECTION: 0.14, COMPETITOR_PLUS_COST: 0.12, MISTARGETED_OFFER: 0.08, BEST_TIME_FRAME: 0.18 };
	const business = {
		conversionRate: last.business, offersPresented: offers, converted, followUpsScheduled: Math.round(offers * 0.25),
		signals: BUSINESS_SIGNAL_ORDER.map((type) => {
			const weight = type === 'BEST_TIME_FRAME' ? 2 - bizWeak : bizWeak;
			const count = Math.round(offers * signalRates[type] * weight);
			return { type, count, ratePerCall: round1((count / offers) * 100), delta: Math.round((rand() - 0.5) * 5) };
		}),
		nonConversionReasons: [
			{ key: 'priceTooHigh' as const, count: Math.round((offers - converted) * 0.38) }, { key: 'noNeed' as const, count: Math.round((offers - converted) * 0.22) },
			{ key: 'thirdPartyDecision' as const, count: Math.round((offers - converted) * 0.16) }, { key: 'distrustQuality' as const, count: Math.round((offers - converted) * 0.1) },
			{ key: 'installationRequirements' as const, count: Math.round((offers - converted) * 0.08) }, { key: 'other' as const, count: Math.round((offers - converted) * 0.06) },
		],
		competitorMentions: [{ name: 'Claro', count: Math.round(offers * 0.09 * bizWeak) }, { name: 'Tigo', count: Math.round(offers * 0.05 * bizWeak) }, { name: 'Altice', count: Math.round(offers * 0.03 * bizWeak) }],
		conversionTrend: performance.slice(-12).map((pt) => ({ label: pt.label, conversionRate: pt.business, offers: Math.round(pt.callsEvaluated * 0.6) })),
	};

	// --- Risk history ---
	const burnoutPct = p.burnout === BurnoutRiskLevel.HIGH ? 78 : p.burnout === BurnoutRiskLevel.MEDIUM ? 55 : 22;
	const risk = {
		criticalErrorsTrend: qa.errorTrend.map((e) => ({ label: e.label, autoFails: Math.round((e.ECN + e.ECC) * 0.3), criticalErrors: e.ECN + e.ECC + e.ECUF })),
		alerts: p.base.qa < 0.8 || p.base.compliance < 0.8 || p.base.sentiment < 0.6 ? [
			{ id: `alr-${p.id}-1`, ruleName: 'QA score below 75%', metric: 'QA_OVERALL_SCORE', severity: 'warning' as const, firedAt: '2026-09-04T09:10:00Z', acknowledged: true },
			{ id: `alr-${p.id}-2`, ruleName: 'Negative emotion share above 30%', metric: 'NEGATIVE_EMOTION_CALL_SHARE', severity: 'critical' as const, firedAt: '2026-09-09T14:30:00Z', acknowledged: false },
		] : [],
		disputes: p.base.qa < 0.85 ? [
			{ id: `dsp-${p.id}-1`, callId: 'call-001', item: 'Resolved the main objection (price / competitor)', status: 'won' as const, filedAt: '2026-07-22', resolvedAt: '2026-07-29' },
			{ id: `dsp-${p.id}-2`, callId: 'call-002', item: 'Recapped the offer and next steps', status: 'open' as const, filedAt: '2026-09-06' },
		] : [],
		burnout: { agentId: p.id, level: p.burnout, percentage: burnoutPct, trend: p.slope < -0.1 ? 'declining' as const : p.slope > 0.1 ? 'improving' as const : 'stable' as const, lastUpdated: NOW_ISO },
		burnoutTrend: performance.slice(-6).map((pt, i, arr) => ({ label: pt.label, percentage: clamp(Math.round(burnoutPct - (arr.length - 1 - i) * (p.slope < 0 ? -4 : 3)), 5, 95) })),
	};

	// --- Coaching & LMS (seed; the store appends new ones) ---
	const weakest = [...dimensions].sort((a, b) => toPct(a.key, a.score) - toPct(b.key, b.score))[0].key;
	const coaching: CoachingSession[] = [
		{ id: `coa-${p.id}-1`, date: '2026-06-18T10:00:00Z', topic: 'Needs assessment', coachName: agent.supervisorName, coachRole: 'SUPERVISOR', status: 'completed', linkedDimension: 'qa', outcome: 'Agreed to open with 2 discovery questions', followUpDate: '2026-07-02' },
		{ id: `coa-${p.id}-2`, date: '2026-08-07T15:00:00Z', topic: weakest === 'sentiment' ? 'Handling frustrated customers' : weakest === 'compliance' ? 'Mandatory disclosures' : 'Objection handling', coachName: agent.supervisorName, coachRole: 'SUPERVISOR', status: p.base.qa < 0.7 ? 'missed' : 'completed', linkedDimension: weakest, outcome: p.base.qa < 0.7 ? undefined : 'Practised 3 role-plays; follow-up in two weeks' },
		{ id: `coa-${p.id}-3`, date: '2026-09-18T11:00:00Z', topic: 'Call closing', coachName: 'Elena Ruiz', coachRole: 'QA_MANAGER', status: 'scheduled', linkedDimension: 'qa' },
	];
	const lmsPick = LMS_CATALOG.filter((m) => m.dimension === weakest).concat(LMS_CATALOG.filter((m) => m.dimension !== weakest)).slice(0, 4);
	const lms: LmsAssignment[] = lmsPick.map((m, i) => {
		const status = i === 0 ? 'completed' : i === 1 ? 'in-progress' : i === 2 ? (p.base.qa < 0.75 ? 'overdue' : 'not-started') : 'completed';
		return { id: `lms-${p.id}-${i}`, materialId: m.id, title: m.title, type: m.type, mandatory: i < 2, assignedAt: ['2026-05-12', '2026-07-01', '2026-08-15', '2026-03-03'][i], assignedBy: agent.supervisorName, dueDate: ['2026-06-12', '2026-09-30', '2026-09-05', '2026-04-03'][i], progress: status === 'completed' ? 100 : status === 'in-progress' ? 45 + Math.round(rand() * 40) : status === 'overdue' ? 20 : 0, status, completedAt: status === 'completed' ? ['2026-06-02', '', '', '2026-03-28'][i] || undefined : undefined };
	});

	// --- Achievements ---
	const cat = PREDEFINED_BADGE_CATALOGS;
	const badges: EarnedBadge[] = [
		p.base.qa >= 0.85 ? { id: `bdg-${p.id}-1`, type: cat.QA_EXCELLENCE.type, name: cat.QA_EXCELLENCE.name, icon: cat.QA_EXCELLENCE.icon, earnedAt: '2026-08-29', reason: '5 consecutive evaluations above 95%' } : null,
		p.base.sentiment >= 0.85 ? { id: `bdg-${p.id}-2`, type: cat.SENTIMENT_CHAMPION.type, name: cat.SENTIMENT_CHAMPION.name, icon: cat.SENTIMENT_CHAMPION.icon, earnedAt: '2026-07-14', reason: 'Customer sentiment above 4.5 for 3 calls' } : null,
		p.base.compliance >= 0.9 ? { id: `bdg-${p.id}-3`, type: cat.COMPLIANCE_GUARDIAN.type, name: cat.COMPLIANCE_GUARDIAN.name, icon: cat.COMPLIANCE_GUARDIAN.icon, earnedAt: '2026-06-03', reason: '0 violations in 10 calls' } : null,
		p.slope >= 0.2 ? { id: `bdg-${p.id}-4`, type: cat.IMPROVEMENT_CHAMPION.type, name: cat.IMPROVEMENT_CHAMPION.name, icon: cat.IMPROVEMENT_CHAMPION.icon, earnedAt: '2026-08-01', reason: '+10% QA score in one month' } : null,
		p.base.business >= 0.7 ? { id: `bdg-${p.id}-5`, type: cat.BUSINESS_DRIVER.type, name: cat.BUSINESS_DRIVER.name, icon: cat.BUSINESS_DRIVER.icon, earnedAt: '2026-05-20', reason: '5+ business insights in a month' } : null,
		p.base.qa >= 0.8 && p.base.sentiment >= 0.75 ? { id: `bdg-${p.id}-6`, type: cat.STREAKER.type, name: cat.STREAKER.name, icon: cat.STREAKER.icon, earnedAt: '2026-04-11', reason: '5 high-performing evaluations in a row' } : null,
	].filter((b): b is EarnedBadge => b !== null);
	const milestones = [
		{ id: `mil-${p.id}-1`, name: '100 evaluated calls', description: 'Reach 100 evaluated calls', progress: clamp(Math.round((totalEvals / 100) * 100), 0, 100), achievedAt: totalEvals >= 100 ? '2026-04-20' : undefined },
		{ id: `mil-${p.id}-2`, name: 'QA 90+ for a full month', description: 'Monthly QA average of 90 or more', progress: clamp(Math.round((last.qa / 90) * 100), 0, 100), achievedAt: last.qa >= 90 ? last.date : undefined },
		{ id: `mil-${p.id}-3`, name: 'Zero auto-fails quarter', description: 'No auto-fails in 3 consecutive months', progress: qa.autoFails === 0 ? 100 : 40, achievedAt: qa.autoFails === 0 ? '2026-06-30' : undefined },
		{ id: `mil-${p.id}-4`, name: 'Conversion 35%+', description: 'Monthly conversion rate of 35% or more', progress: clamp(Math.round((last.business / 35) * 100), 0, 100), achievedAt: last.business >= 35 ? last.date : undefined },
	];
	const rankingHistory = performance.slice(-12).map((pt) => ({ label: pt.label, position: clamp(Math.round(rank.rankInTeam + (rand() - 0.5) * 2), 1, rank.teamSize), score: pt.overall, teamSize: rank.teamSize }));
	rankingHistory[rankingHistory.length - 1].position = rank.rankInTeam;

	// --- Evaluations table (last 12) — call-001 always exists so the link works ---
	const evaluations: EvaluationHistoryRow[] = Array.from({ length: 12 }, (_, i) => {
		const d = new Date(NOW_ISO); d.setUTCDate(d.getUTCDate() - i * 4 - Math.round(rand() * 2));
		const camp = TEAM_CAMPAIGNS.find((c) => c.id === p.campaignIds[i % p.campaignIds.length])!;
		const qaScore = clamp(Math.round(last.qa + (rand() - 0.5) * 20), 40, 100);
		return { id: `ev-${p.id}-${i}`, callId: i === 0 ? 'call-001' : `call-${String(100 + i)}`, campaignId: camp.id, campaignName: camp.name, date: d.toISOString(), durationSeconds: 120 + Math.round(rand() * 400), qaScore, customerSentiment: round1(clamp(customerAvg + (rand() - 0.5), 1, 5)), complianceScore: clamp(Math.round(last.compliance + (rand() - 0.5) * 14), 50, 100), converted: rand() < last.business / 100, autoFail: qaScore < 55, evaluatedBy: i % 5 === 3 ? 'Manual' : 'AI' };
	});

	// --- Activity feed: derived from the blocks above, newest first ---
	const activity: ActivityEvent[] = [
		...badges.map((b) => ({ id: `act-${b.id}`, type: 'badge' as const, date: `${b.earnedAt}T12:00:00Z`, title: `Earned ${b.name}`, description: b.reason })),
		...milestones.filter((m) => m.achievedAt).map((m) => ({ id: `act-${m.id}`, type: 'milestone' as const, date: `${m.achievedAt}T12:00:00Z`, title: m.name, description: m.description })),
		...coaching.map((c) => ({ id: `act-${c.id}`, type: 'coaching' as const, date: c.date, title: `Coaching ${c.status}: ${c.topic}`, description: `${c.coachName} · ${c.outcome ?? 'No outcome recorded yet'}` })),
		...lms.map((l) => ({ id: `act-${l.id}`, type: 'lms' as const, date: `${l.completedAt ?? l.assignedAt}T09:00:00Z`, title: `${l.status === 'completed' ? 'Completed' : 'Assigned'}: ${l.title}`, description: `${l.type} · due ${l.dueDate}` })),
		...risk.alerts.map((a) => ({ id: `act-${a.id}`, type: 'alert' as const, date: a.firedAt, title: `Trigger fired: ${a.ruleName}`, description: a.acknowledged ? 'Acknowledged' : 'Pending acknowledgement' })),
		...risk.disputes.map((d) => ({ id: `act-${d.id}`, type: 'dispute' as const, date: `${d.filedAt}T10:00:00Z`, title: `Dispute ${d.status}: ${d.item}`, description: `Call ${d.callId}`, link: `/qa/campaigns/1/calls/${d.callId}` })),
		...evaluations.slice(0, 4).map((e) => ({ id: `act-${e.id}`, type: 'evaluation' as const, date: e.date, title: `Call evaluated · QA ${e.qaScore}%`, description: `${e.campaignName} · sentiment ${e.customerSentiment}/5 · compliance ${e.complianceScore}%`, link: `/qa/campaigns/1/calls/${e.callId}` })),
		{ id: `act-rank-${p.id}`, type: 'rank' as const, date: last.date + 'T00:00:00Z', title: `Ranked #${rank.rankInTeam} of ${rank.teamSize} in ${agent.team}`, description: `Overall score ${last.overall}` },
	].sort((a, b) => b.date.localeCompare(a.date));

	const notes = [
		{ id: `note-${p.id}-1`, agentId: p.id, authorName: agent.supervisorName, authorRole: 'SUPERVISOR' as const, createdAt: '2026-08-08T16:20:00Z', text: `Followed up after coaching on ${coaching[1].topic.toLowerCase()}. Committed to practise on live calls this week.`, pinned: true },
		{ id: `note-${p.id}-2`, agentId: p.id, authorName: 'Elena Ruiz', authorRole: 'QA_MANAGER' as const, createdAt: '2026-06-20T09:05:00Z', text: 'Calibration check: AI and manual scores within 3 points on the last 5 calls.', pinned: false },
	];

	const peerComparison = [
		{ label: 'QA score', agentValue: last.qa, teamAverage: 82, unit: '%' },
		{ label: 'Customer sentiment', agentValue: Math.round(customerAvg * 20), teamAverage: 72, unit: '%' },
		{ label: 'Compliance', agentValue: last.compliance, teamAverage: 88, unit: '%' },
		{ label: 'Conversion rate', agentValue: last.business, teamAverage: 31, unit: '%' },
		{ label: 'AHT (s)', agentValue: ahtNow, teamAverage: OPERATIONAL_META.aht.baseline, unit: 's' },
	];
	const strengths = dimensions.filter((d) => toPct(d.key, d.score) >= 85).map((d) => ({ label: `${d.key === 'qa' ? 'QA' : d.key === 'sentiment' ? 'Sentiment' : d.key === 'compliance' ? 'Compliance' : 'Conversion'} ${d.score}${d.key === 'sentiment' ? '/5' : '%'}`, evidence: `Top quartile of ${agent.team} over the last period` }));
	const weaknesses = dimensions.filter((d) => toPct(d.key, d.score) < 75).map((d) => ({ label: `${d.key === 'qa' ? 'QA' : d.key === 'sentiment' ? 'Sentiment' : d.key === 'compliance' ? 'Compliance' : 'Conversion'} ${d.score}${d.key === 'sentiment' ? '/5' : '%'}`, evidence: `Below team average for ${Math.min(n, 3)} months`, suggestedAction: d.key === 'sentiment' ? 'Assign "De-escalation Techniques" and schedule empathy coaching' : d.key === 'compliance' ? 'Assign "Regulatory Disclosures 2026"' : d.key === 'business' ? 'Assign "Objection Handling Fundamentals"' : 'Schedule coaching on needs assessment and closing' }));

	return { agent, overall, dimensions, performance, operational, operationalTrend, qa, sentiment, compliance, business, risk, coaching, lms, badges, milestones, rankingHistory, activity, notes, evaluations, peerComparison, strengths, weaknesses };
}
```

- [x] **Step 4: build all profiles with team ranks** (paste at the end)

```typescript
/** Rank each agent inside its team by the latest overall score, then build the profiles. */
function buildAll(): Record<string, AgentProfile> {
	// First pass: latest overall per persona (cheap re-run of the series with a throwaway rank).
	const provisional = PERSONAS.map((p) => ({ p, overall: buildAgentProfile(p, { rankInTeam: 1, teamSize: 1, percentile: 50 }).overall.score }));
	const out: Record<string, AgentProfile> = {};
	for (const sup of TEAM_SUPERVISORS) {
		const team = provisional.filter((x) => x.p.supervisorId === sup.id).sort((a, b) => b.overall - a.overall);
		team.forEach((x, i) => {
			const rankInTeam = i + 1;
			const percentile = Math.round(((team.length - rankInTeam) / Math.max(1, team.length - 1)) * 100);
			out[x.p.id] = buildAgentProfile(x.p, { rankInTeam, teamSize: team.length, percentile });
		});
	}
	return out;
}

export const TEAM_PROFILES: Record<string, AgentProfile> = buildAll();
```

- [x] `npm run typecheck`. Sanity (mentally or with a quick `node`-free check in the page later): Sarah Johnson ≈ overall 90+, rank #1 of 7; David Brown ≈ 55-62, rank #7, burnout HIGH, 2 alerts, 2 disputes; John Smith trend `up`.

---

## A · Task 4 — `helpers.ts` + `src/stores/qa/teamStore.ts`

- [x] **`src/modules/qa/team/helpers.ts`** (paste)

```typescript
import type { AgentProfile, PerformancePoint, ProfilePeriod, TeamFilters, TeamRole, TeamTableRow, Trend } from './types';
import { NOW_ISO, PROFILE_PERIODS, SCORE_COLOR_STEPS } from './constants';

export const roleFromPath = (pathname: string): TeamRole => (pathname.startsWith('/qa/qa-manager') ? 'qa-manager' : 'supervisor');
export const teamBasePath = (role: TeamRole) => (role === 'qa-manager' ? '/qa/qa-manager/agents' : '/qa/supervisor/your-team');
export const customersBasePath = (role: TeamRole) => (role === 'qa-manager' ? '/qa/qa-manager/customers' : '/qa/supervisor/customers');

export const getScoreColor = (score: number): string => SCORE_COLOR_STEPS.find(([min]) => score >= min)?.[1] ?? 'red';
export const sentimentColor = (score: number) => getScoreColor(Math.round(((score - 1) / 4) * 100));

export const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
export const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export const monthsBetween = (fromIso: string, toIso = NOW_ISO) => {
	const a = new Date(fromIso), b = new Date(toIso);
	return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
};
export const formatTenure = (fromIso: string) => {
	const m = monthsBetween(fromIso);
	return m < 12 ? `${m} mo` : `${Math.floor(m / 12)} yr ${m % 12} mo`;
};

export const trendDelta = (delta: number, unit: '%' | '/5' | 's' | '') => `${delta > 0 ? '+' : ''}${unit === '/5' ? delta.toFixed(1) : Math.round(delta)}${unit === '/5' ? '' : unit}`;
export const trendColor = (trend: Trend, betterWhen: 'higher' | 'lower' = 'higher') =>
	trend === 'flat' ? 'gray' : (trend === 'up') === (betterWhen === 'higher') ? 'teal' : 'red';

/** Slice of the monthly series covered by the selected period. */
export const filterByPeriod = (points: PerformancePoint[], period: ProfilePeriod): PerformancePoint[] => {
	const months = PROFILE_PERIODS.find((p) => p.value === period)?.months ?? null;
	return months === null ? points : points.slice(-Math.max(2, months));
};

/** Direction over the period: compares the average of the first and last third of the slice. */
export const periodDirection = (points: PerformancePoint[], key: keyof Pick<PerformancePoint, 'overall' | 'qa' | 'sentiment' | 'compliance' | 'business'>): { trend: Trend; delta: number } => {
	if (points.length < 2) return { trend: 'flat', delta: 0 };
	const third = Math.max(1, Math.floor(points.length / 3));
	const avg = (arr: PerformancePoint[]) => arr.reduce((s, p) => s + p[key], 0) / arr.length;
	const delta = Math.round(avg(points.slice(-third)) - avg(points.slice(0, third)));
	return { trend: delta > 2 ? 'up' : delta < -2 ? 'down' : 'flat', delta };
};

export const toTableRow = (p: AgentProfile): TeamTableRow => ({
	id: p.agent.id, name: p.agent.name, team: p.agent.team, supervisorName: p.agent.supervisorName, status: p.agent.status,
	overall: p.overall.score, overallTrend: p.overall.trend,
	qa: p.dimensions.find((d) => d.key === 'qa')!.score,
	sentiment: p.dimensions.find((d) => d.key === 'sentiment')!.score,
	compliance: p.dimensions.find((d) => d.key === 'compliance')!.score,
	conversionRate: p.dimensions.find((d) => d.key === 'business')!.score,
	ahtSeconds: p.operational.find((m) => m.key === 'aht')!.value,
	burnoutLevel: p.risk.burnout.level,
	badges: p.badges.length,
	openCoaching: p.coaching.filter((c) => c.status === 'scheduled').length,
	overdueLms: p.lms.filter((l) => l.status === 'overdue').length,
	lastEvaluationAt: p.evaluations[0]?.date ?? NOW_ISO,
});

export const isAtRisk = (row: TeamTableRow) => row.burnoutLevel === 'high' || row.overall < 70 || row.overdueLms > 0;

export const applyTeamFilters = (rows: TeamTableRow[], profiles: Record<string, AgentProfile>, f: TeamFilters): TeamTableRow[] =>
	rows.filter((r) => {
		const agent = profiles[r.id].agent;
		if (f.search && !r.name.toLowerCase().includes(f.search.toLowerCase()) && !r.id.toLowerCase().includes(f.search.toLowerCase())) return false;
		if (f.status !== 'all' && r.status !== f.status) return false;
		if (f.campaignId !== 'all' && !agent.campaignIds.includes(f.campaignId)) return false;
		if (f.supervisorId !== 'all' && agent.supervisorId !== f.supervisorId) return false;
		if (f.riskOnly && !isAtRisk(r)) return false;
		return true;
	});

export const teamKpis = (rows: TeamTableRow[]) => ({
	averageOverall: rows.length ? Math.round(rows.reduce((s, r) => s + r.overall, 0) / rows.length) : 0,
	atRisk: rows.filter(isAtRisk).length,
	overdueLms: rows.reduce((s, r) => s + r.overdueLms, 0),
	openCoaching: rows.reduce((s, r) => s + r.openCoaching, 0),
	improving: rows.filter((r) => r.overallTrend === 'up').length,
	declining: rows.filter((r) => r.overallTrend === 'down').length,
});
```

- [x] **`src/stores/qa/teamStore.ts`** (paste). Mutations also push an inbox notification (cross-section convention).

```typescript
import { create } from 'zustand';
import type { AgentNotification } from '~/models/qa/notifications';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import type { ActivityEvent, AgentProfile, CoachingSession, LmsAssignment, SupervisorNote, TeamRole } from '~/modules/qa/team/types';
import { TEAM_PROFILES } from '~/modules/qa/team/mockData';
import { NOW_ISO, QA_MANAGER_PERSONA, SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';

let counter = 500;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

export interface ScheduleCoachingInput { agentId: string; date: string; topic: string; linkedDimension?: CoachingSession['linkedDimension']; notes?: string }
export interface AssignLmsInput { agentId: string; materialId: string; title: string; type: LmsAssignment['type']; dueDate: string; mandatory: boolean }
export interface SendMessageInput { agentId: string; title: string; message: string; priority: AgentNotification['priority'] }

interface TeamState {
	profiles: Record<string, AgentProfile>;
	scheduleCoaching: (input: ScheduleCoachingInput, role: TeamRole) => CoachingSession;
	assignLms: (input: AssignLmsInput, role: TeamRole) => LmsAssignment;
	sendMessage: (input: SendMessageInput, role: TeamRole) => void;
	addNote: (agentId: string, text: string, role: TeamRole) => SupervisorNote;
	togglePinNote: (agentId: string, noteId: string) => void;
	acknowledgeAlert: (agentId: string, alertId: string) => void;
}

const author = (role: TeamRole) => (role === 'qa-manager' ? { ...QA_MANAGER_PERSONA, sourceRole: 'QA_MANAGER' as const } : { ...SUPERVISOR_PERSONA, sourceRole: 'SUPERVISOR' as const });

const notify = (role: TeamRole, agentId: string, partial: Pick<AgentNotification, 'category' | 'priority' | 'title' | 'message' | 'icon' | 'actions'>) => {
	const a = author(role);
	useNotificationStore.getState().addNotification({
		id: nextId('ntf'), agentId, sourceRole: a.sourceRole, sourceId: a.id, read: false, archived: false, actioned: false, createdAt: NOW_ISO, ...partial,
	});
};

const prepend = (profile: AgentProfile, event: ActivityEvent): AgentProfile => ({ ...profile, activity: [event, ...profile.activity] });

export const useTeamStore = create<TeamState>((set) => ({
	profiles: TEAM_PROFILES,

	scheduleCoaching: (input, role) => {
		const a = author(role);
		const session: CoachingSession = { id: nextId('coa'), date: input.date, topic: input.topic, coachName: a.name, coachRole: a.sourceRole, status: 'scheduled', linkedDimension: input.linkedDimension, outcome: input.notes };
		set((s) => {
			const p = s.profiles[input.agentId];
			const updated = prepend({ ...p, coaching: [session, ...p.coaching] }, { id: nextId('act'), type: 'coaching', date: NOW_ISO, title: `Coaching scheduled: ${session.topic}`, description: `${a.name} · ${new Date(input.date).toLocaleDateString()}` });
			return { profiles: { ...s.profiles, [input.agentId]: updated } };
		});
		notify(role, input.agentId, { category: 'DIRECT_MESSAGE', priority: 'NORMAL', title: `Coaching session scheduled: ${input.topic}`, message: `${a.name} scheduled a coaching session for ${new Date(input.date).toLocaleString()}.`, icon: 'school', actions: [{ label: 'View coaching', url: '/qa/agent/coaching', icon: 'school' }] });
		return session;
	},

	assignLms: (input, role) => {
		const a = author(role);
		const assignment: LmsAssignment = { id: nextId('lms'), materialId: input.materialId, title: input.title, type: input.type, mandatory: input.mandatory, assignedAt: NOW_ISO.slice(0, 10), assignedBy: a.name, dueDate: input.dueDate, progress: 0, status: 'not-started' };
		set((s) => {
			const p = s.profiles[input.agentId];
			const updated = prepend({ ...p, lms: [assignment, ...p.lms] }, { id: nextId('act'), type: 'lms', date: NOW_ISO, title: `Assigned: ${assignment.title}`, description: `${assignment.type} · due ${assignment.dueDate}${assignment.mandatory ? ' · mandatory' : ''}` });
			return { profiles: { ...s.profiles, [input.agentId]: updated } };
		});
		notify(role, input.agentId, { category: 'DIRECT_MESSAGE', priority: input.mandatory ? 'HIGH' : 'NORMAL', title: `New training assigned: ${input.title}`, message: `${a.name} assigned "${input.title}" (${input.type}). Due ${input.dueDate}.`, icon: 'book', actions: [{ label: 'Open LMS', url: '/qa/agent/lms', icon: 'book' }] });
		return assignment;
	},

	sendMessage: (input, role) => {
		const a = author(role);
		set((s) => {
			const p = s.profiles[input.agentId];
			return { profiles: { ...s.profiles, [input.agentId]: prepend(p, { id: nextId('act'), type: 'note', date: NOW_ISO, title: `Message sent: ${input.title}`, description: `${a.name} · ${input.priority}` }) } };
		});
		notify(role, input.agentId, { category: 'DIRECT_MESSAGE', priority: input.priority, title: input.title, message: input.message, icon: 'message' });
	},

	addNote: (agentId, text, role) => {
		const a = author(role);
		const note: SupervisorNote = { id: nextId('note'), agentId, authorName: a.name, authorRole: a.sourceRole, createdAt: NOW_ISO, text, pinned: false };
		set((s) => ({ profiles: { ...s.profiles, [agentId]: { ...s.profiles[agentId], notes: [note, ...s.profiles[agentId].notes] } } }));
		return note;
	},

	togglePinNote: (agentId, noteId) => set((s) => ({ profiles: { ...s.profiles, [agentId]: { ...s.profiles[agentId], notes: s.profiles[agentId].notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n)) } } })),

	acknowledgeAlert: (agentId, alertId) => set((s) => {
		const p = s.profiles[agentId];
		return { profiles: { ...s.profiles, [agentId]: { ...p, risk: { ...p.risk, alerts: p.risk.alerts.map((al) => (al.id === alertId ? { ...al, acknowledged: true } : al)) } } } };
	}),
}));

export const selectProfile = (agentId: string | undefined) => (s: TeamState) => (agentId ? s.profiles[agentId] : undefined);
export const selectVisibleProfiles = (role: TeamRole) => (s: TeamState) =>
	Object.values(s.profiles).filter((p) => role === 'qa-manager' || p.agent.supervisorId === SUPERVISOR_PERSONA.id);
```

- [x] `npm run typecheck`.

---

## A · Task 5 — i18n `src/locales/en/qa.team.json` (+ `es/qa.team.json` with Spanish values)

- [x] Paste the English file (flat sections; add keys if a component needs one more, never hardcode strings in TSX):

```json
{
	"team": {
		"title": "Your Team",
		"titleQaManager": "Agents",
		"description": "Every agent you supervise, with their overall score, evaluation dimensions and open follow-ups.",
		"descriptionQaManager": "All agents across supervisors and teams.",
		"kpi": { "averageOverall": "Team overall score", "atRisk": "Agents at risk", "atRiskHint": "Burnout high, overall below 70 or overdue training", "overdueLms": "Overdue LMS items", "openCoaching": "Scheduled coaching", "improving": "improving", "declining": "declining" },
		"filters": { "search": "Search agent or ID", "status": "Status", "campaign": "Campaign", "supervisor": "Supervisor", "riskOnly": "At risk only", "all": "All", "clear": "Clear filters" },
		"columns": { "agent": "Agent", "team": "Team", "supervisor": "Supervisor", "status": "Status", "overall": "Overall", "qa": "QA", "sentiment": "Sentiment", "compliance": "Compliance", "conversion": "Conversion", "aht": "AHT", "burnout": "Burnout", "badges": "Badges", "followUps": "Follow-ups", "lastEvaluation": "Last evaluation" },
		"followUpsCell": "{{coaching}} coaching · {{lms}} overdue",
		"empty": "No agents match the current filters.",
		"rowsCount": "{{count}} agents"
	},
	"status": { "active": "Active", "on-leave": "On leave", "training": "Training" },
	"burnout": { "low": "Low", "medium": "Medium", "high": "High" },
	"period": { "30d": "30 days", "90d": "90 days", "12m": "12 months", "all": "All time" },
	"tabs": { "overview": "Overview", "qa": "QA", "sentiment": "Sentiment & Emotion", "compliance": "Compliance", "business": "Business Insights", "operations": "Operations", "coaching": "Coaching & LMS", "achievements": "Achievements", "activity": "Activity" },
	"dimension": { "qa": "QA score", "sentiment": "Sentiment", "compliance": "Compliance", "business": "Conversion rate" },
	"header": {
		"back": "Back to team",
		"trackedSince": "Tracked since {{date}}",
		"tenure": "Tenure {{tenure}}",
		"evaluations": "{{count}} evaluations",
		"overall": "Overall score",
		"rank": "#{{rank}} of {{size}}",
		"percentile": "P{{value}}",
		"weights": "Weights: QA {{qa}}% · Sentiment {{sentiment}}% · Compliance {{compliance}}% · Business {{business}}%",
		"vsPrevious": "vs previous period",
		"actions": { "scheduleCoaching": "Schedule coaching", "assignLms": "Assign material", "sendMessage": "Send message" },
		"shift": { "morning": "Morning shift", "afternoon": "Afternoon shift", "night": "Night shift" }
	},
	"overview": {
		"performance": "Performance over time",
		"performanceDescription": "Monthly average of the overall score and each evaluation dimension",
		"direction": { "up": "Improving", "down": "Declining", "flat": "Stable" },
		"directionHint": "{{delta}} points between the start and the end of the period",
		"series": { "overall": "Overall", "qa": "QA", "sentiment": "Sentiment", "compliance": "Compliance", "business": "Conversion" },
		"strengths": "Strengths",
		"weaknesses": "Areas to improve",
		"noWeaknesses": "No dimension below 75 in this period.",
		"noStrengths": "No dimension above 85 yet.",
		"suggestedAction": "Suggested action",
		"peer": "Comparison with team",
		"peerDescription": "Agent value vs {{team}} average",
		"burnout": "Burnout risk",
		"risk": "Risk summary",
		"riskTiles": { "autoFails": "Auto-fails", "criticalErrors": "Critical errors", "openAlerts": "Open alerts", "openDisputes": "Open disputes" },
		"alerts": "Trigger alerts",
		"alertsDescription": "Rules that fired for this agent",
		"acknowledge": "Acknowledge",
		"acknowledged": "Acknowledged",
		"disputes": "Disputes",
		"disputeStatus": { "open": "Open", "won": "Won", "lost": "Lost", "withdrawn": "Withdrawn" },
		"noAlerts": "No trigger alerts in this period.",
		"noDisputes": "No disputes filed."
	},
	"qa": {
		"kpi": { "average": "Average QA score", "passRate": "Pass rate", "evaluations": "Evaluations", "autoFails": "Auto-fails" },
		"errorTypes": "Error types (COPC)",
		"errorTypesDescription": "Occurrences per error type across all evaluated calls",
		"perCall": "{{value}}% of calls",
		"errorTrend": "Errors per month",
		"topFailed": "Most failed items",
		"columns": { "item": "Item", "aspect": "Aspect", "errorType": "Type", "count": "Times failed" },
		"history": "Evaluation history",
		"historyDescription": "Latest evaluated calls; open a call to see the full evaluation",
		"historyColumns": { "date": "Date", "campaign": "Campaign", "duration": "Duration", "qa": "QA", "sentiment": "Cust. sentiment", "compliance": "Compliance", "converted": "Converted", "evaluatedBy": "Evaluated by", "open": "Open call" },
		"autoFail": "Auto-fail"
	},
	"sentiment": {
		"agent": "Agent", "customer": "Customer",
		"average": "Average score", "categories": "Sentiment categories", "emotions": "Top emotions",
		"trend": "Sentiment over time", "trendDescription": "Monthly average, agent vs customer (1–5)",
		"recoveryRate": "Recovery rate", "recoveryHint": "Calls that started negative and ended neutral or better",
		"empathy": "Empathy phrases per call"
	},
	"compliance": {
		"overall": "Compliance score", "areas": "Areas", "violations": "violations", "warnings": "warnings",
		"timeline": "Violations and warnings per month", "flagged": "Flagged items", "columns": { "item": "Item", "area": "Area", "count": "Occurrences", "lastSeen": "Last seen" },
		"noFlagged": "No flagged compliance items."
	},
	"business": {
		"kpi": { "conversion": "Conversion rate", "offers": "Offers presented", "converted": "Converted", "followUps": "Follow-ups scheduled" },
		"signals": "Business signals", "signalsDescription": "How often each predefined signal appears in this agent's calls",
		"tone": { "risk": "Risk", "opportunity": "Opportunity" },
		"conversionTrend": "Conversion over time", "reasons": "Non-conversion reasons", "competitors": "Competitors mentioned", "mentions": "{{count}} mentions"
	},
	"ops": {
		"title": "Operational KPIs", "description": "Agent value vs team average for the selected period",
		"callsHandled": "Calls handled", "callsPerDay": "Calls per day", "aht": "Average handling time", "talkTime": "Talk time", "holdTime": "Hold time", "wrapUpTime": "Wrap-up time",
		"fcr": "First-call resolution", "transferRate": "Transfer rate", "adherence": "Schedule adherence", "occupancy": "Occupancy",
		"teamAverage": "Team avg {{value}}", "ahtTrend": "AHT over time", "breakdown": "Handling time breakdown", "breakdownSeries": { "talk": "Talk", "hold": "Hold", "wrapUp": "Wrap-up" }
	},
	"coaching": {
		"summary": { "attendance": "Coaching attendance", "lmsCompletion": "LMS completion", "overdue": "Overdue items", "mandatoryPending": "Mandatory pending" },
		"sessions": "Coaching sessions", "sessionsDescription": "Scheduled, completed and missed sessions",
		"columns": { "date": "Date", "topic": "Topic", "coach": "Coach", "dimension": "Dimension", "status": "Status", "outcome": "Outcome / follow-up" },
		"status": { "scheduled": "Scheduled", "completed": "Completed", "missed": "Missed" },
		"lms": "LMS material", "lmsDescription": "Assigned courses, videos and documents",
		"lmsColumns": { "title": "Material", "type": "Type", "assigned": "Assigned", "due": "Due", "progress": "Progress", "status": "Status" },
		"lmsStatus": { "not-started": "Not started", "in-progress": "In progress", "completed": "Completed", "overdue": "Overdue" },
		"mandatory": "Mandatory", "noSessions": "No coaching sessions yet.", "noLms": "No material assigned."
	},
	"achievements": {
		"badges": "Badges earned", "badgesDescription": "{{count}} badges", "noBadges": "No badges earned yet.",
		"milestones": "Milestones", "achievedOn": "Achieved {{date}}", "inProgress": "{{progress}}% complete",
		"ranking": "Ranking history", "rankingDescription": "Position in {{team}} by month (1 = best)", "bestRank": "Best rank", "currentRank": "Current rank"
	},
	"activity": {
		"title": "Activity timeline", "filterAll": "All",
		"types": { "evaluation": "Evaluation", "badge": "Badge", "milestone": "Milestone", "coaching": "Coaching", "lms": "LMS", "alert": "Alert", "dispute": "Dispute", "note": "Note", "rank": "Ranking" },
		"open": "Open", "empty": "No activity of this type.",
		"notes": "Supervisor notes", "notesDescription": "Private to supervisors and QA managers",
		"addNote": "Add note", "notePlaceholder": "Write a note about this agent…", "save": "Save note", "pin": "Pin", "unpin": "Unpin", "pinned": "Pinned"
	},
	"modals": {
		"coaching": { "title": "Schedule coaching", "date": "Date and time", "topic": "Topic", "dimension": "Related dimension", "notes": "Notes for the agent", "submit": "Schedule", "success": "Coaching session scheduled and agent notified." },
		"lms": { "title": "Assign LMS material", "material": "Material", "due": "Due date", "mandatory": "Mandatory", "submit": "Assign", "success": "Material assigned and agent notified." },
		"message": { "title": "Send message", "subject": "Subject", "body": "Message", "priority": "Priority", "submit": "Send", "success": "Message sent to the agent's inbox." },
		"cancel": "Cancel"
	},
	"common": { "vsPrevious": "vs previous", "notFound": "Agent not found", "notFoundDescription": "The agent {{id}} is not part of your team." }
}
```

- [x] Create `src/locales/es/qa.team.json` with identical keys and Spanish values (e.g. `"title": "Tu equipo"`, `"atRisk": "Agentes en riesgo"`, `"tabs.overview": "Resumen"`, `"tabs.sentiment": "Sentimiento y emoción"`, `"tabs.coaching": "Coaching y LMS"`, `"tabs.achievements": "Logros"`, `"tabs.activity": "Actividad"`). Keep interpolation names identical.
- [x] `npm run typecheck` (JSON is not type-checked; just confirm both files are valid JSON).

---

## A · Task 6 — `YourTeamPage` (table of agents)

Files: `YourTeamPage/YourTeamPage.tsx`, `YourTeamPage.module.css`, `index.ts`, `TeamKpiStrip.tsx`, `TeamFilters.tsx`, `useTeamColumns.tsx`. All use `useTranslation('qa.team')`.

- [x] **`YourTeamPage.tsx`** — default export, no props.
  - `const role = roleFromPath(useLocation().pathname)`; `const profiles = useTeamStore(selectVisibleProfiles(role))`; `const [filters, setFilters] = useState<TeamFilters>({ search: '', status: 'all', campaignId: 'all', supervisorId: 'all', riskOnly: false })`; `rows = useMemo(() => applyTeamFilters(profiles.map(toTableRow), profilesById, filters))`.
  - Layout: `ContentContainer contentWidth='full' title={t(role === 'qa-manager' ? 'team.titleQaManager' : 'team.title')} description={t(role === 'qa-manager' ? 'team.descriptionQaManager' : 'team.description')}` → `Stack gap='lg'`: `<TeamKpiStrip kpis={teamKpis(rows)} />`, `<TeamFilters role={role} value={filters} onChange={setFilters} />`, `SectionCard` (no title) `headerActions={<Text size='sm' c='dimmed'>{t('team.rowsCount', { count: rows.length })}</Text>}` containing `BaseTable<TeamTableRow> data={rows} columns={columns} getRowId={(r) => r.id} initialSort={[{ id: 'overall', desc: true }]} enablePagination pageSize={10} density='compact' emptyMessage={t('team.empty')} onRowClick={(r) => navigate(`${teamBasePath(role)}/${r.id}`)}`.
- [x] **`TeamKpiStrip.tsx`** — `{ kpis: ReturnType<typeof teamKpis> }` → `SimpleGrid cols={{ base: 2, md: 4 }}` of `StatCard`: `team.kpi.averageOverall` value `{averageOverall}` with `badge` = `Badge color='teal'` `↑{improving}` + `Badge color='red'` `↓{declining}` (`t('team.kpi.improving')`/`declining` in a `Tooltip`), `color={getScoreColor(averageOverall)}`; `atRisk` (`color='red'` when >0, subtitle `t('team.kpi.atRiskHint')`); `overdueLms` (`orange` when >0); `openCoaching` (`blue`). Icons: `IconChartBar, IconAlertTriangle, IconSchool, IconCalendarEvent`.
- [x] **`TeamFilters.tsx`** — `{ role, value: TeamFilters, onChange }` → `Group gap='sm' wrap='wrap'`: `TextInput leftSection={<IconSearch size={16}/>} placeholder={t('team.filters.search')}` (w 260); `Select` status (`all` + 3 statuses from `status.*`); `Select` campaign (`all` + `TEAM_CAMPAIGNS` names); **QA Manager only**: `Select` supervisor (`all` + `TEAM_SUPERVISORS` `name — team`); `Switch label={t('team.filters.riskOnly')}`; `Button variant='subtle' size='xs'` clear (visible when any filter differs from default).
- [x] **`useTeamColumns.tsx`** — returns `BaseTableColumnDef<TeamTableRow>[]` (use `createColumnHelper<TeamTableRow>()` from `@tanstack/react-table`):

| id | header key | cell |
|---|---|---|
| `name` | `team.columns.agent` | `Group gap='sm'`: `Avatar name={row.name} color={profile.agent.avatarColor} radius='xl' size='sm'`, `Stack gap={0}`: `Text size='sm' fw={600}` name, `Text size='xs' c='dimmed'` id |
| `team` (QA Manager only) | `team.columns.team` | `Text size='sm'` `{team}` + `Text size='xs' c='dimmed'` `{supervisorName}` |
| `status` | `team.columns.status` | `Badge variant='light' color={active: 'green', 'on-leave': 'gray', training: 'blue'}` `t('status.<status>')` |
| `overall` | `team.columns.overall` | `Group gap={6}`: `Badge size='lg' variant='filled' color={getScoreColor(overall)}` `{overall}`; trend icon `IconTrendingUp/Down/Minus size={14}` colored `trendColor(overallTrend)` |
| `qa` | `team.columns.qa` | `Text size='sm' c={getScoreColor(qa)} fw={600}` `{qa}%` |
| `sentiment` | `team.columns.sentiment` | `{sentiment.toFixed(1)}/5` colored `sentimentColor` |
| `compliance` | `team.columns.compliance` | `{compliance}%` colored |
| `conversionRate` | `team.columns.conversion` | `{conversionRate}%` |
| `ahtSeconds` | `team.columns.aht` | `formatSeconds(ahtSeconds)` |
| `burnoutLevel` | `team.columns.burnout` | `Badge variant='dot' color={low: 'green', medium: 'yellow', high: 'red'}` `t('burnout.<level>')` |
| `badges` | `team.columns.badges` | `Group gap={4}`: `IconAward size={14}` + count |
| `followUps` | `team.columns.followUps` | `Text size='xs'` `t('team.followUpsCell', { coaching: openCoaching, lms: overdueLms })`; `c='orange'` when `overdueLms > 0` |
| `lastEvaluationAt` | `team.columns.lastEvaluation` | `formatDate` |

  Row click navigates (handled by the page). `getRowClassName={(r) => isAtRisk(r) ? styles.riskRow : ''}` with `.riskRow { box-shadow: inset 3px 0 0 var(--mantine-color-red-6); }` in the module CSS.
- [x] `npm run typecheck` (the page is not routed yet; fine).

---

## A · Task 7 — `AgentProfilePage` (header, shared components, nine tabs, three modals)

All components take data props (no store access) except the page and the modals. Namespace `qa.team`. Charts use `@mantine/charts`.

- [x] **Shared components (`src/modules/qa/team/components/`)**

| Component | Props | Renders |
|---|---|---|
| `ScoreRing.tsx` | `{ value: number; max?: number (100); size?: number (120); thickness?: number (12); label?: ReactNode; color?: string }` | `RingProgress roundCaps sections=[{ value: value/max*100, color: color ?? getScoreColor(value/max*100) }]` with centered `Text fw={700} size='xl'` = `label ?? value` |
| `TrendDelta.tsx` | `{ delta: number; trend: Trend; unit: '%' \| '/5' \| 's' \| ''; betterWhen?: 'higher' \| 'lower'; suffix?: string }` | `Group gap={4}`: icon `IconTrendingUp/Down/Minus size={14}` + `Text size='xs' c={trendColor(trend, betterWhen)}` `{trendDelta(delta, unit)} {suffix}` |
| `DimensionScoreCard.tsx` | `{ dimension: DimensionScore }` | `Paper withBorder p='md' radius='md'`: `Group justify='space-between'`: `ThemeIcon variant='light' color={meta.color}` icon + `Text size='sm' c='dimmed'` `t(meta.labelKey)`; `Text fw={700} size='xl'` `{score}{unit}`; `Progress value={toPct} color={meta.color} size='sm'`; `TrendDelta` with `suffix={t('common.vsPrevious')}`; `Text size='xs' c='dimmed'` `{evaluations} evaluations` |
| `PerformanceTrendChart.tsx` | `{ points: PerformancePoint[]; visible: Record<'overall'\|'qa'\|'sentiment'\|'compliance'\|'business', boolean>; onToggle(key) }` | `Group gap='xs'` of `Chip` toggles (labels `overview.series.*`, colors overall `dark`, qa `orange`, sentiment `violet`, compliance `green`, business `blue`) + `LineChart h={320} data={points} dataKey='label' series={visible ones} curveType='monotone' withLegend withDots yAxisProps={{ domain: [0, 100] }} strokeWidth={2}`; overall series `strokeWidth 3`. Below, `Text size='xs' c='dimmed'`: sentiment is plotted on a 0–100 scale (`score/5`). |
| `OperationalMetricCard.tsx` | `{ metric: OperationalMetric }` | `Paper withBorder p='sm' radius='md'`: label `t(meta.labelKey)`; value formatted by unit (`formatSeconds` / `{v}%` / `{v}`); `Text size='xs' c='dimmed'` `t('ops.teamAverage', { value })`; `TrendDelta betterWhen={metric.betterWhen}`; thin `Progress` comparing value vs team average (`value/teamAverage*50` clamped 0-100, color teal when better, red when worse by >5%) |
| `EvaluationHistoryTable.tsx` | `{ rows: EvaluationHistoryRow[] }` | `BaseTable` columns: date (`formatDateTime`), campaign, duration (`formatSeconds`), qa (`Badge color={getScoreColor}`; extra `Badge color='red' variant='filled'` `t('qa.autoFail')` when `autoFail`), sentiment (`x.x/5`), compliance, converted (`IconCheck` green / `IconX` gray), evaluatedBy (`Badge variant='outline'`), open (`ActionIcon variant='subtle'` `IconExternalLink` → `navigate(`/qa/campaigns/1/calls/${row.callId}`)`). `enablePagination pageSize={6} density='compact'` |
| `BadgeGrid.tsx` | `{ badges: EarnedBadge[] }` | `SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}`; each `Paper withBorder p='md' radius='md' ta='center'`: `ThemeIcon size={48} radius='xl' variant='light' color='yellow'` with `<span style={{ fontSize: 24 }}>{icon}</span>` (inline-style-allow: emoji size), `Text fw={600} size='sm'` name, `Text size='xs' c='dimmed'` `formatDate(earnedAt)`, `Tooltip label={reason}`. Empty → `EmptyState message={t('achievements.noBadges')}` |
| `ActivityTimeline.tsx` | `{ events: ActivityEvent[]; filter: ActivityType \| 'all'; onFilterChange }` | `Chip.Group` (all + each `ACTIVITY_META` type) then Mantine `Timeline bulletSize={24} lineWidth={2}`; each `Timeline.Item bullet={<ThemeIcon size={24} radius='xl' color={meta.color} variant='light'>{icon by type: evaluation IconClipboardCheck, badge IconAward, milestone IconFlag, coaching IconSchool, lms IconBook, alert IconBell, dispute IconGavel, note IconNote, rank IconTrophy}</ThemeIcon>} title={<Group gap='xs'><Text fw={600} size='sm'>{title}</Text><Badge size='xs' variant='light' color={meta.color}>{t(meta.labelKey)}</Badge></Group>}`: `Text size='sm'` description, `Text size='xs' c='dimmed'` `formatDateTime(date)`, optional `Anchor size='xs'` `t('activity.open')` → `navigate(link)`. Show 20, `Button variant='subtle'` "Show more" adds 20. |
| `NotesPanel.tsx` | `{ notes: SupervisorNote[]; onAdd(text); onTogglePin(id) }` | `SectionCard title={t('activity.notes')} description={t('activity.notesDescription')} icon={IconNote}`: `Textarea autosize minRows={2} placeholder` + `Button size='xs' leftSection={<IconPlus/>}` `t('activity.save')` (disabled when empty; clears after add); list sorted pinned-first then newest: `Paper withBorder p='sm' bg={pinned ? 'var(--mantine-color-yellow-light)' : undefined}`: `Group justify='space-between'`: `Text size='xs' fw={600}` `{authorName}` + `Badge size='xs' variant='outline'` role + `Text size='xs' c='dimmed'` date; `ActionIcon variant='subtle'` `IconPin/IconPinnedOff`; `Text size='sm'` text |

- [x] **`AgentProfilePage/ProfileHeader.tsx`** — `{ profile: AgentProfile; role: TeamRole; period: ProfilePeriod; onPeriodChange; onScheduleCoaching; onAssignLms; onSendMessage }`. `SectionCard padding='lg'`:
  - `Group justify='space-between' align='flex-start' wrap='wrap'`. **Left** `Group gap='md'`: `Avatar size={72} radius='md' color={avatarColor} name={name}`; `Stack gap={4}`: `Group gap='xs'`: `Title order={2}` name, `Badge variant='light' color={status color}` `t('status.<status>')`, `Badge variant='dot' color={burnout color}` `t('burnout.<level>')`; `Text size='sm' c='dimmed'` `{id} · {team} · {supervisorName} · t('header.shift.<shift>')`; `Group gap={6}` campaign `Badge variant='outline' size='xs'` per `campaignIds` (name from `TEAM_CAMPAIGNS`) + skills `Badge variant='light' color='gray' size='xs'`; `Text size='xs' c='dimmed'` `t('header.trackedSince', { date: formatDate(trackedSince) }) · t('header.tenure', { tenure: formatTenure(hireDate) }) · t('header.evaluations', { count: qa.evaluations })`.
  - **Right** `Group gap='xl' align='center'`: `ScoreRing value={overall.score} size={112}` with `Stack gap={2}` beside it: `Text size='xs' c='dimmed' tt='uppercase'` `t('header.overall')`; `Group gap='xs'`: `Badge size='lg' variant='filled' color={getScoreColor(overall.score)}` `t('header.rank', { rank, size })`, `Badge variant='light'` `t('header.percentile', { value })`; `TrendDelta delta={overall.delta} trend={overall.trend} unit='' suffix={t('header.vsPrevious')}`; `Tooltip label={t('header.weights', weights)}` on an `IconInfoCircle size={14}`.
  - **Bottom row** `Group justify='space-between' mt='md'`: `SegmentedControl data={PROFILE_PERIODS.map(p => ({ value: p.value, label: t(p.labelKey) }))} value={period} onChange`; `Group gap='xs'`: `Button variant='light' leftSection={<IconCalendarEvent size={16}/>}` `t('header.actions.scheduleCoaching')`, `Button variant='light' leftSection={<IconBook size={16}/>}` `assignLms`, `Button variant='default' leftSection={<IconSend size={16}/>}` `sendMessage`.
- [x] **`AgentProfilePage.tsx`** — default export. `const { agentId } = useParams(); const role = roleFromPath(...); const profile = useTeamStore(selectProfile(agentId))`; if `!profile` or (supervisor role and `profile.agent.supervisorId !== SUPERVISOR_PERSONA.id`) → `ContentContainer` with `EmptyState message={t('common.notFound')} description={t('common.notFoundDescription', { id })} action={<Button onClick={() => navigate(teamBasePath(role))}>{t('header.back')}</Button>}`.
  - State: `period` (`useState<ProfilePeriod>('12m')`), `tab` from `useSearchParams` `?tab=` (default `overview`; `setSearchParams` on change, `replace: true`), three modal `opened` booleans.
  - `const points = useMemo(() => filterByPeriod(profile.performance, period))`.
  - Layout: `ContentContainer contentWidth='full' showBackButton title={undefined}` → `Stack gap='lg'`: `Breadcrumbs`: `Anchor onClick → navigate(teamBasePath(role))` `t(role === 'qa-manager' ? 'team.titleQaManager' : 'team.title')` / `Text c='dimmed'` name; `<ProfileHeader …/>`; `Tabs value={tab} onChange keepMounted={false}` with `Tabs.List` from `PROFILE_TABS` (`leftSection={<Icon size={16}/>}`) and one `Tabs.Panel pt='md'` per tab rendering the tab component with `{ profile, points, period, role }` (+ store callbacks where noted).
  - Modals rendered at the end, receive `agentId`, `role`, `opened`, `onClose`.
- [x] **Tabs (`AgentProfilePage/tabs/*.tsx`)** — each `{ profile: AgentProfile; points: PerformancePoint[]; period: ProfilePeriod; role: TeamRole }`, returns `Stack gap='md'`:

| Tab | Blocks (top → bottom) |
|---|---|
| `OverviewTab` | ① `SimpleGrid cols={{ base: 2, md: 4 }}` of `DimensionScoreCard` (order `DIMENSION_ORDER`). ② `SectionCard title={t('overview.performance')} description={t('overview.performanceDescription')} icon={IconChartLine} headerActions={<Badge color={dir.trend==='up'?'teal':dir.trend==='down'?'red':'gray'} variant='light' leftSection={icon}>{t(`overview.direction.${dir.trend}`)}</Badge>}` where `dir = periodDirection(points, 'overall')`; inside `PerformanceTrendChart` (local `visible` state, all true) + `Text size='xs' c='dimmed'` `t('overview.directionHint', { delta })`. ③ `SimpleGrid cols={{ base: 1, md: 2 }}`: `SectionCard title={t('overview.strengths')} icon={IconThumbUp} headerAccent='green'` list of `Paper withBorder p='sm'` (`Text fw={600} size='sm'` label, `Text size='xs' c='dimmed'` evidence) or `Text c='dimmed' size='sm'` `noStrengths`; `SectionCard title={t('overview.weaknesses')} icon={IconAlertTriangle} headerAccent='yellow'` same plus `Text size='xs'` `t('overview.suggestedAction')`: `{suggestedAction}`. ④ `SimpleGrid cols={{ base: 1, md: 2 }}`: `SectionCard title={t('overview.peer')} description={t('overview.peerDescription', { team })} icon={IconUsers}` → `<PeerComparisonSection metrics={profile.peerComparison} agentName={name} percentileRank={`P${overall.percentile}`} />`; `SectionCard title={t('overview.burnout')} icon={IconFlame}` → `<BurnoutRiskWidget data={profile.risk.burnout} />` + `AreaChart h={120} data={risk.burnoutTrend} dataKey='label' series={[{ name: 'percentage', color: 'red.6' }]} withXAxis={false} withYAxis={false} withTooltip curveType='monotone'`. ⑤ `SectionCard title={t('overview.risk')} icon={IconShieldExclamation}`: `SimpleGrid cols={{ base: 2, md: 4 }}` tiles (`StatCard variant='compact'`): autoFails `qa.autoFails`, criticalErrors = sum `risk.criticalErrorsTrend[].criticalErrors`, openAlerts = unacknowledged count (`color='red'` if >0), openDisputes (`color='orange'` if >0); then `SimpleGrid cols={{ base: 1, md: 2 }}`: alerts list (`Paper withBorder p='sm'` each: `Badge color={severity: info gray / warning yellow / critical red}`, `Text fw={600} size='sm'` ruleName, `Text size='xs' c='dimmed'` `{metric} · {formatDateTime(firedAt)}`, right: acknowledged ? `Badge variant='light' color='green'` : `Button size='xs' variant='light'` → `useTeamStore.getState().acknowledgeAlert(agentId, id)`) or `EmptyState`; disputes list (`Badge color={open orange / won green / lost red / withdrawn gray}`, item, `Text size='xs' c='dimmed'` `Call {callId} · filed {filedAt}`, `Anchor size='xs'` → call detail) or `EmptyState`. |
| `QATab` | ① `SimpleGrid cols={{ base: 2, md: 4 }}` `StatCard`: average (`color=getScoreColor`), passRate, evaluations, autoFails (`red` if >0). ② `SectionCard title={t('qa.errorTypes')} description icon={IconClipboardList}` → `SimpleGrid cols={{ base: 2, md: 4 }}`, per `QA_ERROR_TYPE_ORDER`: `Paper withBorder p='md'`: `Badge color={meta.color} variant='filled'` code + `Text size='xs' c='dimmed'` shortLabel; `Text fw={700} size='xl'` count; `Text size='xs' c='dimmed'` `t('qa.perCall', { value: ratePerCall })`; `TrendDelta delta unit='' betterWhen='lower'`. ③ `SectionCard title={t('qa.errorTrend')}` → `BarChart h={260} data={qa.errorTrend} dataKey='label' type='stacked' series={[{name:'ECN',color:'red.6'},{name:'ENC',color:'orange.6'},{name:'ECC',color:'grape.6'},{name:'ECUF',color:'yellow.6'}]} withLegend`. ④ `SectionCard title={t('qa.topFailed')}` → Mantine `Table striped highlightOnHover` (item · aspect · `Badge` errorType · count). ⑤ `SectionCard title={t('qa.history')} description={t('qa.historyDescription')}` → `EvaluationHistoryTable rows={profile.evaluations}`. |
| `SentimentTab` | ① `SimpleGrid cols={{ base: 1, md: 2 }}` — one `SectionCard` per speaker (`title={t('sentiment.agent')} icon={IconHeadset}` / `customer` `IconUser`): `Group`: `ScoreRing value={avg} max={5} size={96} label={avg.toFixed(1)} color={sentimentColor(avg)}` + `Stack`: `Text size='xs' c='dimmed' tt='uppercase'` `t('sentiment.categories')`, `Progress.Root size='lg'` with one `Progress.Section` per `SENTIMENT_CATEGORY_ORDER` (skip 0, `Tooltip` `{label} {pct}%`) + legend `Group` of `ColorSwatch size={10}` + `Text size='xs'`; then `Text size='xs' c='dimmed' tt='uppercase'` `t('sentiment.emotions')` and per emotion `Group justify='space-between'`: `Badge variant='light' color={EMOTION_META.color}` label + `Text size='xs'` `{share}%` + `Progress size='xs'`. ② `SectionCard title={t('sentiment.trend')} description icon={IconChartLine}` → `LineChart h={280} data={sentiment.trend} dataKey='label' series={[{name:'agent',label:t('sentiment.agent'),color:'blue.6'},{name:'customer',label:t('sentiment.customer'),color:'orange.6'}]} yAxisProps={{ domain: [1, 5] }} curveType='monotone' withLegend withDots`. ③ `SimpleGrid cols={{ base: 2 }}` `StatCard`: recoveryRate `{v}%` subtitle `t('sentiment.recoveryHint')` icon `IconHeartHandshake`; empathy `{v}` per call icon `IconMessageHeart`. |
| `ComplianceTab` | ① `SectionCard padding='lg'`: `Group gap='xl'`: `ScoreRing value={compliance.overall}` + `Stack`: `Text fw={600}` `t('compliance.overall')`, `Group gap='xs'` badges: total violations (`red` if >0) `{n} {t('compliance.violations')}`, total warnings (`yellow`) . ② `SimpleGrid cols={{ base: 1, md: 3 }}`: per `COMPLIANCE_AREA_ORDER` `SectionCard title={meta.label} icon={IconShieldCheck} headerActions={<Badge color={getScoreColor(score)} variant='light' size='lg'>{score}%</Badge>}`: `Progress value color={meta.color}`; `Group gap='xs'`: `Badge variant='light' color='red'` `{violations} violations`, `Badge variant='light' color='yellow'` `{warnings} warnings`; `TrendDelta`; `Text size='xs' c='dimmed'` items joined ` · `. ③ `SectionCard title={t('compliance.timeline')}` → `BarChart h={240} data={compliance.timeline} dataKey='label' type='stacked' series={[{name:'violations',color:'red.6'},{name:'warnings',color:'yellow.6'}]} withLegend`. ④ `SectionCard title={t('compliance.flagged')}` → `Table` (item · `Badge color={area color}` area · count · lastSeen) or `EmptyState noFlagged`. |
| `BusinessTab` | ① `SimpleGrid cols={{ base: 2, md: 4 }}` `StatCard`: conversion (`color=getScoreColor(v*2.5 clamped)`), offers, converted, followUps. ② `SectionCard title={t('business.signals')} description icon={IconSparkles}` → `Stack gap='xs'`, per `BUSINESS_SIGNAL_ORDER`: `Paper withBorder p='sm'`: `Group justify='space-between'`: `Group gap='xs'`: `ThemeIcon size='sm' radius='xl' variant='light' color={tone risk orange / opportunity teal}` (`IconAlertCircle`/`IconBulb`), `Text fw={600} size='sm'` label, `Badge size='xs' variant='outline'` tone; right `Group gap='sm'`: `Text size='sm' fw={600}` `{count}`, `Text size='xs' c='dimmed'` `t('qa.perCall', { value: ratePerCall })`, `TrendDelta betterWhen={tone==='risk'?'lower':'higher'}`; below `Progress value={ratePerCall} color`. ③ `SimpleGrid cols={{ base: 1, md: 2 }}`: `SectionCard title={t('business.conversionTrend')}` → `LineChart h={240} data={business.conversionTrend} dataKey='label' series={[{name:'conversionRate',color:'blue.6'}]} yAxisProps={{ domain: [0, 100] }} withDots`; `SectionCard title={t('business.reasons')}` → `DonutChart size={160} thickness={22} withLabelsLine withLabels data={nonConversionReasons.map(r => ({ name: NON_CONVERSION_REASON_LABELS[r.key], value: r.count, color }))}` (colors `red.6, orange.6, yellow.6, grape.6, blue.6, gray.6`) + legend list. ④ `SectionCard title={t('business.competitors')}`: `Group` of `Badge size='lg' variant='light' color='orange' leftSection={<IconBuildingStore size={14}/>}` `{name} · t('business.mentions', { count })`. |
| `OperationsTab` | ① `SectionCard title={t('ops.title')} description icon={IconHeadset}` → `SimpleGrid cols={{ base: 2, md: 5 }}` of `OperationalMetricCard` (order `OPERATIONAL_ORDER`). ② `SimpleGrid cols={{ base: 1, md: 2 }}`: `SectionCard title={t('ops.ahtTrend')}` → `LineChart h={240} data={operationalTrend} dataKey='label' series={[{name:'aht',color:'blue.6'}]} withDots valueFormatter={formatSeconds}`; `SectionCard title={t('ops.breakdown')}` → `BarChart h={240} data={operationalTrend} dataKey='label' type='stacked' series={[{name:'talk',label:t('ops.breakdownSeries.talk'),color:'blue.6'},{name:'hold',label:…,color:'orange.6'},{name:'wrapUp',label:…,color:'gray.6'}]} withLegend valueFormatter={formatSeconds}`. |
| `CoachingLmsTab` | ① `SimpleGrid cols={{ base: 2, md: 4 }}` `StatCard`: attendance = completed/(completed+missed) %, lmsCompletion = completed/total %, overdue count (`red` if >0), mandatoryPending = mandatory & !completed (`orange` if >0). ② `SectionCard title={t('coaching.sessions')} description icon={IconSchool} headerActions={<Button size='xs' variant='light' leftSection={<IconPlus size={14}/>} onClick={onScheduleCoaching}>{t('header.actions.scheduleCoaching')}</Button>}` → `BaseTable` (date `formatDateTime` · topic · coach + `Badge size='xs' variant='outline'` role · dimension `Badge color={DIMENSION_META.color}` · status `Badge color={scheduled blue / completed green / missed red}` · outcome + `followUpDate`), `initialSort` date desc, `density='compact'`, `emptyMessage noSessions`. ③ `SectionCard title={t('coaching.lms')} … headerActions={assign button}` → `BaseTable` (title + `Badge size='xs' color='red' variant='light'` `t('coaching.mandatory')` when mandatory · type `Badge variant='outline'` · assigned · due (`c='red'` when overdue) · progress `Progress value size='sm' w={120}` + `{progress}%` · status `Badge color={not-started gray / in-progress blue / completed green / overdue red}`), `emptyMessage noLms`. The tab receives `onScheduleCoaching` and `onAssignLms` from the page. |
| `AchievementsTab` | ① `SectionCard title={t('achievements.badges')} description={t('achievements.badgesDescription', { count })} icon={IconAward}` → `BadgeGrid`. ② `SectionCard title={t('achievements.milestones')} icon={IconFlag}` → `Stack gap='sm'`, per milestone `Paper withBorder p='sm'`: `Group justify='space-between'`: `Stack gap={2}`: `Text fw={600} size='sm'` name, `Text size='xs' c='dimmed'` description; right `achievedAt ? Badge color='green' leftSection={<IconCheck size={12}/>} t('achievements.achievedOn', { date: formatDate }) : Text size='xs' c='dimmed' t('achievements.inProgress', { progress })`; `Progress value={progress} color={achievedAt ? 'green' : 'blue'} size='sm' mt='xs'`. ③ `SectionCard title={t('achievements.ranking')} description={t('achievements.rankingDescription', { team })} icon={IconTrophy}` → `Group` two `StatCard variant='compact'`: bestRank `#{min position}`, currentRank `#{last position} of {teamSize}`; `LineChart h={220} data={rankingHistory} dataKey='label' series={[{name:'position',color:'grape.6'}]} yAxisProps={{ domain: [1, teamSize], reversed: true, allowDecimals: false }} withDots`. |
| `ActivityTab` | `Grid`: `Grid.Col span={{ base: 12, md: 7 }}` → `SectionCard title={t('activity.title')} icon={IconHistory}` → `ActivityTimeline events={profile.activity} filter onFilterChange` (local state); `Grid.Col span={{ base: 12, md: 5 }}` → `NotesPanel notes={profile.notes} onAdd={(text) => addNote(agentId, text, role)} onTogglePin={(id) => togglePinNote(agentId, id)}`. |

- [x] **Modals (`components/modals/*.tsx`)** — Mantine `Modal centered`, `useForm` from `@mantine/form`, all `{ agentId: string; role: TeamRole; opened: boolean; onClose: () => void }`:
  - `ScheduleCoachingModal`: `DateTimePicker` (`@mantine/dates`, `minDate` today, default tomorrow 10:00) `t('modals.coaching.date')`; `Select` topic from `COACHING_TOPICS` (searchable, `allowDeselect={false}`); `Select` dimension (`DIMENSION_ORDER`, optional); `Textarea` notes. Submit → `useTeamStore.getState().scheduleCoaching({ agentId, date: iso, topic, linkedDimension, notes }, role)`, `notifications.show({ color: 'teal', message: t('modals.coaching.success') })` (`@mantine/notifications`), close + reset.
  - `AssignLmsModal`: `Select` material from `LMS_CATALOG` (label `{title} · {type} · {durationMin} min`, group by dimension); `DatePickerInput` due (default +14 days); `Switch` mandatory. Submit → `assignLms({ agentId, materialId, title, type, dueDate: 'YYYY-MM-DD', mandatory }, role)` + success notification.
  - `SendMessageModal`: `TextInput` subject (required), `Textarea` body (required, `minRows={4}`), `SegmentedControl` priority (`LOW | NORMAL | HIGH`, default `NORMAL`). Submit → `sendMessage(...)` + success notification.
  - Footer `Group justify='flex-end'`: `Button variant='default'` `t('modals.cancel')` + primary submit.
- [x] `npm run typecheck`.

---

## A · Task 8 — Routes, namespaces, sidebar, labels, deletions

- [x] **`src/routes.tsx`**
  - Replace the lazy import of `QAManagerAgentsPage` (:175-177, `./modules/qa/qamanager/pages/AgentsPage`) with:
    ```tsx
    const YourTeamPage = React.lazy(() => import('./modules/qa/team/YourTeamPage'));
    const AgentProfilePage = React.lazy(() => import('./modules/qa/team/AgentProfilePage'));
    ```
    (`index.ts` files export default.)
  - Delete the unlabelled duplicate block `{ path: 'qa-manager/agents', element: <SupervisorSettingsPage/> }` (:970-979).
  - Change the `qa-manager/agents` route (:1057-1067) element to `<YourTeamPage />` (keep id `qa.qa-manager.agents`).
  - Add, right after it, three routes with the same wrapper pattern:
    - `path: 'qa-manager/agents/:agentId'`, `id: 'qa.qa-manager.agents.profile'` → `<AgentProfilePage />`
    - `path: 'supervisor/your-team'`, `id: 'qa.supervisor.your-team'` → `<YourTeamPage />`
    - `path: 'supervisor/your-team/:agentId'`, `id: 'qa.supervisor.your-team.profile'` → `<AgentProfilePage />`
- [x] **`src/modules/qa/qaNamespaces.ts`** — add:
  ```ts
  'qa.supervisor.your-team': ['qa.team', 'qa.dashboard'],
  'qa.supervisor.your-team.profile': ['qa.team', 'qa.dashboard'],
  'qa.qa-manager.agents': ['qa.team', 'qa.dashboard'],
  'qa.qa-manager.agents.profile': ['qa.team', 'qa.dashboard'],
  ```
- [x] **`src/components/Sidebar/roleNavigation.tsx`**
  - `getSupervisorNavigation()`: change `supervisor-team` `i18nNamespace` to `'qa.team'` (label key stays `sidebar.supervisor.team`).
  - `getQAManagerNavigation()`: insert after `qamanager-teams` (index 2):
    ```tsx
    {
    	key: 'qamanager-agents',
    	label: 'sidebar.qamanager.agents',
    	icon: <IconUserSquareRounded size={20} className={styles.menuIcon} />,
    	to: '/qa/qa-manager/agents',
    	i18nNamespace: 'qa.team',
    },
    ```
    (add `IconUserSquareRounded` to the tabler import). The flat array is now: 0 dashboard, 1 supervisors, 2 teams, **3 agents**, 4 calls, 5 disputes, 6 triggers, 7 rankings, 8 campaigns, 9 analytics, 10 reports.
  - `getQAManagerNavigationGrouped()`: Organization → `items.slice(1, 4)` (Supervisors, Teams, Agents); Operations → `[items[4], items[5], items[8]]`; Configuration → `[items[6], items[7]]`; Insights → `[items[9], items[10]]`. Update the trailing comments.
- [x] **`src/locales/en/common.json`** — in `sidebar.qamanager` add `"agents": "Agents"` (after `"teams"`); **`src/locales/es/common.json`** — `"agents": "Agentes"`.
- [x] **Deletions** — `grep -rn "AgentProfilePage\|qamanager/pages/AgentsPage\|supervisor/pages/YourTeamPage" src/` must show only the new module + routes; then delete `src/modules/qa/dashboard/pages/AgentProfilePage.tsx`, `src/modules/qa/qamanager/pages/AgentsPage.tsx`, `src/modules/qa/supervisor/pages/YourTeamPage.tsx`.
- [x] `npm run typecheck` → 0 errors in `src/modules/qa/team/**`, `src/stores/qa/teamStore.ts`, `src/routes.tsx`, `src/components/Sidebar/**`.

---

## A · Task 9 — Verification & commit

Preview server config `dev` (`.claude/launch.json`) serves `http://localhost:8082`. Use the role preview switcher to view as Supervisor and QA Manager if the sidebar is role-gated.

- [x] `/qa/supervisor/your-team`: 4 KPI cards; table with 7 Team 1 agents sorted by overall desc (Sarah Johnson first, David Brown last with red risk stripe); filters work (search "lisa" → 1 row; "At risk only" → David Brown, Emma Davis, Lisa Wong and anyone with overdue LMS); row click → `/qa/supervisor/your-team/AGT-006`.
- [x] `/qa/qa-manager/agents`: 21 rows, Team/Supervisor column and supervisor filter visible; sidebar shows **Agents** under Organization.
- [x] Profile `AGT-006` (David Brown): header shows burnout **High**, rank #7 of 7, trend down; Overview → performance chart declining with "Declining" badge, 1–2 weaknesses with suggested actions, burnout widget, 2 alerts (one with Acknowledge button that flips to Acknowledged), 2 disputes; QA tab → 4 error tiles, stacked bar, most-failed table, evaluation history whose first row opens `/qa/campaigns/1/calls/call-001`; Sentiment → two rings, stacked category bars, trend chart; Compliance → 3 area cards, timeline, flagged items; Business → 5 signals, donut, competitors; Operations → 10 KPI cards + 2 charts; Coaching & LMS → tables incl. one **Overdue** item; Achievements → badges (possibly empty state), milestones, ranking chart; Activity → timeline with type chips + notes panel (add a note → appears pinned-first after pinning).
- [x] Profile `AGT-001` (Sarah Johnson): rank #1, ≥4 badges, no alerts/disputes empty states, "Improving"/"Stable".
- [x] Actions: Schedule coaching → new row in Coaching table + activity event + `notifications.show`; Assign material → new LMS row; Send message → activity event. Check `/qa/agent/inbox` (or the agent Inbox page) shows the new notification at the top.
- [x] Period control changes the chart window (30d shows 2 points, All shows every month since trackedSince).
- [x] `?tab=compliance` deep link opens that tab; unknown `agentId` shows the not-found state.
- [x] Dark mode (`resize_window colorScheme: dark`): no light boxes, charts readable; back to light. Tablet width: grids collapse, header wraps.
- [x] `read_console_messages onlyErrors` → none.
- [x] Commit (if allowed): branch `feature/your-team-agent-profile`, message `feat(team): add Your Team roster and Agent Profile for supervisor and QA manager` + the Co-Authored-By trailer given in the execution session.

---

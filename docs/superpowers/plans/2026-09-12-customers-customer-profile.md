# Customers — Customer Profile (Supervisor / QA Manager)

> Companion doc: [2026-09-12-your-team-agent-profile.md](2026-09-12-your-team-agent-profile.md) (Plan A — **execute first**, this plan imports its roster/helpers).

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

# PLAN B — Customers + Customer Profile

**Goal:** A `Customers` page for Supervisor (customers contacted by their team) and QA Manager (all customers) that opens a full **Customer Profile**: who the customer is and their preferences, how receptive they are, how their sentiment and emotions evolved across contacts, which offers were presented/accepted/rejected and why, competitors mentioned, survey answers (NPS/CSAT), best/worst contact windows, and a complete interaction timeline linking to the call detail. Actions: schedule follow-up, add note, toggle Do-Not-Call.

**Architecture:** New module `src/modules/qa/customers/` mirroring Plan A (types, constants, deterministic mock builder, helpers, two pages, components). Store `src/stores/qa/customersStore.ts`; namespace `qa.customers`. Reuses Plan A's roster (`TEAM_AGENTS`, `TEAM_CAMPAIGNS`, `TEAM_SUPERVISORS` from `~/modules/qa/team/mockData`) and helpers (`roleFromPath`, `customersBasePath`, `getScoreColor`, `sentimentColor`, `formatDate`, `formatDateTime`, `formatSeconds` from `~/modules/qa/team/helpers`) and shared components `ScoreRing`, `TrendDelta` from `~/modules/qa/team/components`. **Depends on Plan A being executed.**

## File Structure (Plan B)

### New files
```
src/modules/qa/customers/
  types.ts
  constants.ts
  mockData.ts                        — 24 customers, buildCustomerProfile(), CUSTOMER_PROFILES
  helpers.ts
  CustomersPage/CustomersPage.tsx (+ CustomersPage.module.css, index.ts)
  CustomersPage/CustomerKpiStrip.tsx
  CustomersPage/CustomerFilters.tsx
  CustomersPage/useCustomerColumns.tsx
  CustomerProfilePage/CustomerProfilePage.tsx (+ CustomerProfilePage.module.css, index.ts)
  CustomerProfilePage/CustomerHeader.tsx
  CustomerProfilePage/tabs/OverviewTab.tsx
  CustomerProfilePage/tabs/ContactsTab.tsx
  CustomerProfilePage/tabs/SentimentTab.tsx
  CustomerProfilePage/tabs/OffersTab.tsx
  CustomerProfilePage/tabs/SurveysTab.tsx
  CustomerProfilePage/tabs/TimelineTab.tsx
  components/ReceptivenessGauge.tsx
  components/ContactWindowTiles.tsx
  components/ContactsTable.tsx
  components/OfferRow.tsx
  components/SurveyCard.tsx
  components/CustomerTimeline.tsx
  components/CustomerNotesPanel.tsx
  components/modals/ScheduleFollowUpModal.tsx
  components/LegacyCustomerRedirect.tsx  — reads :customerId and <Navigate/> to the new route
src/stores/qa/customersStore.ts
src/locales/en/qa.customers.json
src/locales/es/qa.customers.json
```

### Modified files
- `src/routes.tsx` — lazy imports; 4 routes; replace the `profiles/customer/:customerId` element with `<LegacyCustomerRedirect />`; remove the `CustomerProfilePage` lazy import (:145-147).
- `src/modules/qa/qaNamespaces.ts` — 4 ids → `['qa.customers', 'qa.team']`.
- `src/components/Sidebar/roleNavigation.tsx` — `supervisor-customers` + `qamanager-customers` items and regrouped indices.
- `src/locales/{en,es}/common.json` — `sidebar.supervisor.customers`, `sidebar.qamanager.customers`.
- `src/views/Campaigns/types.ts` + `constants.ts` + `pages/ConversationEvaluations.tsx` — add `customerId: 'CUST-001'` to `CallEvaluationDetail` / mock and make the customer name a link to the profile.
- `src/modules/qa/dashboard/pages/index.ts` — remove the `CustomerProfilePage` export.

### Deleted files
- `src/modules/qa/dashboard/pages/CustomerProfilePage.tsx`.

---

## B · Task 1 — `src/modules/qa/customers/types.ts`

- [ ] Paste:

```typescript
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type { BusinessSignalType, NonConversionReasonKey, Trend } from '~/modules/qa/team/types';

export type CustomerSegment = 'residential' | 'business' | 'premium';
export type CustomerStatus = 'active' | 'prospect' | 'churned';
export type ContactChannel = 'phone' | 'whatsapp' | 'email' | 'sms';
export type DayPart = 'morning' | 'afternoon' | 'evening';
export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
export type ChurnRisk = 'low' | 'medium' | 'high';
export type ReceptivenessBand = 'receptive' | 'neutral' | 'resistant';
export type ContactOutcome = 'answered' | 'no-answer' | 'voicemail' | 'busy' | 'callback';
export type OfferResult = 'accepted' | 'rejected' | 'deferred';

export interface CustomerRecord {
	id: string; // CUST-001
	name: string;
	phone: string;
	email: string;
	city: string;
	segment: CustomerSegment;
	status: CustomerStatus;
	language: 'es' | 'en';
	preferredChannel: ContactChannel;
	currentPlan: string;
	monthlyValue: number; // USD
	customerSince: string; // ISO date
	trackedSince: string; // ISO date — first contact through the platform
	consent: { recording: boolean; marketing: boolean };
	doNotCall: boolean;
	tags: string[];
	avatarColor: string;
}

export interface OfferRecord {
	id: string;
	contactId: string;
	date: string;
	offer: string;
	monthlyPrice: number;
	result: OfferResult;
	nonConversionReason?: NonConversionReasonKey;
	competitorMentioned?: string;
	agentName: string;
	note?: string;
}

export interface ContactRecord {
	id: string;
	callId: string; // links to /qa/campaigns/1/calls/:callId — first contact uses 'call-001'
	date: string; // ISO datetime
	weekday: Weekday;
	dayPart: DayPart;
	channel: ContactChannel;
	direction: 'inbound' | 'outbound';
	campaignId: string;
	campaignName: string;
	agentId: string;
	agentName: string;
	outcome: ContactOutcome;
	durationSeconds: number; // 0 when not answered
	customerSentiment?: number; // 1-5 when answered
	customerCategory?: SentimentCategory;
	dominantEmotion?: Emotion;
	agentSentiment?: number;
	signals: BusinessSignalType[];
	offerId?: string;
	summary: string;
}

export interface SurveyResponse {
	id: string;
	contactId: string;
	date: string;
	type: 'NPS' | 'CSAT';
	score: number; // NPS 0-10, CSAT 1-5
	verbatim?: string;
	agentName: string;
}

export interface ContactWindowStat {
	weekday: Weekday;
	dayPart: DayPart;
	contacts: number;
	answered: number;
	accepted: number;
	rejected: number;
	avgSentiment: number; // 1-5 over answered
}

export interface CustomerKpis {
	totalContacts: number;
	answered: number;
	answerRate: number; // %
	inbound: number;
	outbound: number;
	avgDurationSeconds: number;
	firstContactAt: string;
	lastContactAt: string;
	agentsInvolved: number;
	receptivenessScore: number; // 0-100
	receptivenessBand: ReceptivenessBand;
	churnRisk: ChurnRisk;
	offersPresented: number;
	offersAccepted: number;
	offersRejected: number;
	acceptanceRate: number; // %
	avgCustomerSentiment: number; // 1-5
	sentimentTrend: Trend;
	sentimentDelta: number;
	npsLatest?: number;
	csatAverage?: number;
	surveysAnswered: number;
}

export interface SentimentPoint { label: string; date: string; customer: number; agent: number; category: SentimentCategory }

export type CustomerEventType = 'contact' | 'offer' | 'survey' | 'note' | 'followUp' | 'flag';
export interface CustomerEvent { id: string; type: CustomerEventType; date: string; title: string; description: string; link?: string }

export interface CustomerNote { id: string; authorName: string; authorRole: 'SUPERVISOR' | 'QA_MANAGER'; createdAt: string; text: string }
export interface FollowUp { id: string; date: string; reason: string; assignedAgentName: string; status: 'scheduled' | 'done' }

export interface CustomerProfile {
	customer: CustomerRecord;
	kpis: CustomerKpis;
	contacts: ContactRecord[]; // newest first
	offers: OfferRecord[];
	surveys: SurveyResponse[];
	sentimentSeries: SentimentPoint[]; // one per answered contact, oldest first
	categoryShare: Record<SentimentCategory, number>;
	topEmotions: { emotion: Emotion; share: number }[];
	sentimentByAgent: { agentName: string; contacts: number; avgSentiment: number }[];
	windows: ContactWindowStat[];
	bestWindows: ContactWindowStat[]; // top 3 by acceptance then answer rate
	worstWindows: ContactWindowStat[]; // top 3 by rejections
	signalCounts: { type: BusinessSignalType; count: number }[];
	nonConversionReasons: { key: NonConversionReasonKey; count: number }[];
	competitors: { name: string; count: number }[];
	objections: { text: string; count: number }[];
	timeline: CustomerEvent[];
	notes: CustomerNote[];
	followUps: FollowUp[];
	nextBestAction: string;
}

export interface CustomerTableRow {
	id: string;
	name: string;
	segment: CustomerSegment;
	status: CustomerStatus;
	doNotCall: boolean;
	contacts: number;
	lastContactAt: string;
	receptivenessScore: number;
	receptivenessBand: ReceptivenessBand;
	churnRisk: ChurnRisk;
	avgSentiment: number;
	sentimentTrend: Trend;
	acceptanceRate: number;
	npsLatest?: number;
	lastAgentName: string;
	bestWindow: string; // 'Tue afternoon'
	teamIds: string[]; // supervisor ids of agents who contacted them (visibility filter)
}

export interface CustomerFilters {
	search: string;
	segment: CustomerSegment | 'all';
	status: CustomerStatus | 'all';
	receptiveness: ReceptivenessBand | 'all';
	churnRisk: ChurnRisk | 'all';
	agentId: string | 'all';
	dncOnly: boolean;
}
```

- [ ] `npm run typecheck`.

---

## B · Task 2 — `constants.ts` + `mockData.ts` (24 customers, deterministic contact history)

- [ ] **`src/modules/qa/customers/constants.ts`** (paste)

```typescript
import type { TablerIcon } from '@tabler/icons-react';
import { IconAddressBook, IconClipboardText, IconHistory, IconMoodSmile, IconPhone, IconTag } from '@tabler/icons-react';
import type { ChurnRisk, ContactChannel, ContactOutcome, CustomerEventType, CustomerSegment, CustomerStatus, DayPart, OfferResult, ReceptivenessBand, Weekday } from './types';

export const NOW_ISO = '2026-09-12T15:00:00Z';

export type CustomerTab = 'overview' | 'contacts' | 'sentiment' | 'offers' | 'surveys' | 'timeline';
export const CUSTOMER_TABS: { value: CustomerTab; labelKey: string; icon: TablerIcon }[] = [
	{ value: 'overview', labelKey: 'tabs.overview', icon: IconAddressBook },
	{ value: 'contacts', labelKey: 'tabs.contacts', icon: IconPhone },
	{ value: 'sentiment', labelKey: 'tabs.sentiment', icon: IconMoodSmile },
	{ value: 'offers', labelKey: 'tabs.offers', icon: IconTag },
	{ value: 'surveys', labelKey: 'tabs.surveys', icon: IconClipboardText },
	{ value: 'timeline', labelKey: 'tabs.timeline', icon: IconHistory },
];

export const SEGMENT_META: Record<CustomerSegment, { labelKey: string; color: string }> = {
	residential: { labelKey: 'segment.residential', color: 'blue' },
	business: { labelKey: 'segment.business', color: 'grape' },
	premium: { labelKey: 'segment.premium', color: 'yellow' },
};
export const STATUS_META: Record<CustomerStatus, { labelKey: string; color: string }> = {
	active: { labelKey: 'status.active', color: 'green' }, prospect: { labelKey: 'status.prospect', color: 'blue' }, churned: { labelKey: 'status.churned', color: 'gray' },
};
export const CHANNEL_META: Record<ContactChannel, { labelKey: string }> = {
	phone: { labelKey: 'channel.phone' }, whatsapp: { labelKey: 'channel.whatsapp' }, email: { labelKey: 'channel.email' }, sms: { labelKey: 'channel.sms' },
};
export const OUTCOME_META: Record<ContactOutcome, { labelKey: string; color: string }> = {
	answered: { labelKey: 'outcome.answered', color: 'green' }, 'no-answer': { labelKey: 'outcome.noAnswer', color: 'gray' },
	voicemail: { labelKey: 'outcome.voicemail', color: 'gray' }, busy: { labelKey: 'outcome.busy', color: 'orange' }, callback: { labelKey: 'outcome.callback', color: 'blue' },
};
export const OFFER_RESULT_META: Record<OfferResult, { labelKey: string; color: string }> = {
	accepted: { labelKey: 'offerResult.accepted', color: 'green' }, rejected: { labelKey: 'offerResult.rejected', color: 'red' }, deferred: { labelKey: 'offerResult.deferred', color: 'yellow' },
};
export const RECEPTIVENESS_META: Record<ReceptivenessBand, { labelKey: string; color: string; min: number }> = {
	receptive: { labelKey: 'receptiveness.receptive', color: 'green', min: 60 },
	neutral: { labelKey: 'receptiveness.neutral', color: 'yellow', min: 35 },
	resistant: { labelKey: 'receptiveness.resistant', color: 'red', min: 0 },
};
export const CHURN_META: Record<ChurnRisk, { labelKey: string; color: string }> = {
	low: { labelKey: 'churn.low', color: 'green' }, medium: { labelKey: 'churn.medium', color: 'yellow' }, high: { labelKey: 'churn.high', color: 'red' },
};
export const EVENT_META: Record<CustomerEventType, { labelKey: string; color: string }> = {
	contact: { labelKey: 'timeline.types.contact', color: 'blue' }, offer: { labelKey: 'timeline.types.offer', color: 'grape' },
	survey: { labelKey: 'timeline.types.survey', color: 'teal' }, note: { labelKey: 'timeline.types.note', color: 'indigo' },
	followUp: { labelKey: 'timeline.types.followUp', color: 'orange' }, flag: { labelKey: 'timeline.types.flag', color: 'red' },
};

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_PARTS: DayPart[] = ['morning', 'afternoon', 'evening'];
export const DAY_PART_HOURS: Record<DayPart, string> = { morning: '08:00–12:00', afternoon: '12:00–17:00', evening: '17:00–21:00' };

export const OFFER_CATALOG = [
	{ name: 'Premium Fiber 500 Mbps + TV bundle', price: 49.99 },
	{ name: 'Fiber 300 Mbps', price: 34.99 },
	{ name: 'Mobile + Home bundle', price: 59.99 },
	{ name: 'Streaming add-on', price: 9.99 },
	{ name: 'Loyalty discount 12 months', price: 29.99 },
];
export const COMPETITORS = ['Claro', 'Tigo', 'Altice'];
export const OBJECTION_PHRASES = [
	'Not looking to spend more right now', 'Need to check with my partner', 'Competitor offers the same for less',
	'Unsure what it costs after the promo', 'Happy with the current plan', 'Installation would take too long',
];
export const FOLLOW_UP_REASONS = ['Contract renewal', 'Promo follow-up', 'Complaint check-in', 'Survey callback', 'Upgrade proposal'];
```

- [ ] **`src/modules/qa/customers/mockData.ts`** (paste). One persona row per customer drives receptiveness, sentiment slope and volume.

```typescript
import { TEAM_AGENTS, TEAM_CAMPAIGNS } from '~/modules/qa/team/mockData';
import { EMOTION_SENTIMENT_MAP } from '~/modules/qa/emotion-sentiment/types';
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type { BusinessSignalType, NonConversionReasonKey } from '~/modules/qa/team/types';
import type {
	ContactRecord, ContactWindowStat, CustomerEvent, CustomerProfile, CustomerRecord, DayPart, OfferRecord, SentimentPoint, SurveyResponse, Weekday,
} from './types';
import { COMPETITORS, DAY_PARTS, NOW_ISO, OBJECTION_PHRASES, OFFER_CATALOG, WEEKDAYS } from './constants';

function seeded(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const pick = <T,>(arr: T[], r: number) => arr[Math.floor(r * arr.length) % arr.length];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
const categoryOf = (score: number): SentimentCategory => (score < 1.8 ? 'very-negative' : score < 2.6 ? 'negative' : score < 3.4 ? 'neutral' : score < 4.2 ? 'positive' : 'very-positive');
const EMOTIONS_BY_CATEGORY: Record<SentimentCategory, Emotion[]> = {
	'very-negative': ['RAGE', 'ANGER'], negative: ['FRUSTRATION', 'DISAPPOINTMENT', 'SADNESS', 'FEAR'], neutral: ['NEUTRAL', 'SURPRISE'],
	positive: ['RELIEF', 'SATISFACTION', 'GRATITUDE'], 'very-positive': ['JOY', 'ELATION'],
};

interface CustomerPersona {
	id: string; name: string; city: string; segment: CustomerRecord['segment']; status: CustomerRecord['status']; language: 'es' | 'en';
	channel: CustomerRecord['preferredChannel']; plan: string; value: number; since: string; tracked: string;
	receptive: number; // 0-1 probability of accepting an offer
	baseSentiment: number; // 1-5 at first contact
	slope: number; // sentiment change across history (-1..1)
	contacts: number; // number of contacts in history
	bestPart: DayPart; bestDay: Weekday; dnc?: boolean; marketing?: boolean; agentIds: string[];
}

export const CUSTOMER_PERSONAS: CustomerPersona[] = [
	{ id: 'CUST-001', name: 'Mr. Doe', city: 'Santo Domingo', segment: 'residential', status: 'active', language: 'en', channel: 'phone', plan: 'Fiber 200 Mbps', value: 29.99, since: '2024-07-15', tracked: '2025-02-03', receptive: 0.35, baseSentiment: 2.4, slope: 0.6, contacts: 9, bestPart: 'afternoon', bestDay: 'Tue', agentIds: ['AGT-001', 'AGT-004'] },
	{ id: 'CUST-002', name: 'Ana Belén Castro', city: 'Santiago', segment: 'premium', status: 'active', language: 'es', channel: 'whatsapp', plan: 'Premium Fiber 500 + TV', value: 49.99, since: '2022-03-10', tracked: '2025-01-20', receptive: 0.8, baseSentiment: 4.1, slope: 0.1, contacts: 12, bestPart: 'morning', bestDay: 'Wed', agentIds: ['AGT-001', 'AGT-002', 'AGT-015'] },
	{ id: 'CUST-003', name: 'Roberto Peña', city: 'La Romana', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 100 Mbps', value: 19.99, since: '2023-11-02', tracked: '2025-03-10', receptive: 0.15, baseSentiment: 2.9, slope: -0.7, contacts: 8, bestPart: 'evening', bestDay: 'Thu', agentIds: ['AGT-006', 'AGT-005'] },
	{ id: 'CUST-004', name: 'Comercial Nova SRL', city: 'Santo Domingo', segment: 'business', status: 'active', language: 'es', channel: 'email', plan: 'Business Fiber 1 Gbps', value: 149.0, since: '2021-06-01', tracked: '2025-01-27', receptive: 0.6, baseSentiment: 3.6, slope: 0.2, contacts: 14, bestPart: 'morning', bestDay: 'Mon', agentIds: ['AGT-002', 'AGT-008', 'AGT-020'] },
	{ id: 'CUST-005', name: 'Karla Jiménez', city: 'Puerto Plata', segment: 'residential', status: 'prospect', language: 'es', channel: 'phone', plan: '—', value: 0, since: '2026-05-04', tracked: '2026-05-04', receptive: 0.45, baseSentiment: 3.2, slope: 0.3, contacts: 4, bestPart: 'evening', bestDay: 'Sat', agentIds: ['AGT-004'] },
	{ id: 'CUST-006', name: 'Luis Alberto Mena', city: 'San Pedro', segment: 'residential', status: 'churned', language: 'es', channel: 'phone', plan: '—', value: 0, since: '2020-09-14', tracked: '2025-02-17', receptive: 0.1, baseSentiment: 2.2, slope: -0.4, contacts: 7, bestPart: 'afternoon', bestDay: 'Fri', dnc: true, agentIds: ['AGT-006', 'AGT-007'] },
	{ id: 'CUST-007', name: 'Patricia Vargas', city: 'Santo Domingo', segment: 'premium', status: 'active', language: 'en', channel: 'email', plan: 'Premium Fiber 500 + TV', value: 49.99, since: '2023-01-23', tracked: '2025-01-20', receptive: 0.7, baseSentiment: 3.9, slope: 0.4, contacts: 10, bestPart: 'afternoon', bestDay: 'Wed', agentIds: ['AGT-001', 'AGT-003'] },
	{ id: 'CUST-008', name: 'Grupo Delta', city: 'Santiago', segment: 'business', status: 'active', language: 'es', channel: 'phone', plan: 'Business Fiber 500', value: 99.0, since: '2022-10-05', tracked: '2025-02-10', receptive: 0.5, baseSentiment: 3.3, slope: -0.2, contacts: 11, bestPart: 'morning', bestDay: 'Tue', agentIds: ['AGT-010', 'AGT-011', 'AGT-002'] },
	{ id: 'CUST-009', name: 'Esteban Rojas', city: 'Higüey', segment: 'residential', status: 'active', language: 'es', channel: 'sms', plan: 'Fiber 300 Mbps', value: 34.99, since: '2024-02-19', tracked: '2025-04-07', receptive: 0.55, baseSentiment: 3.5, slope: 0.0, contacts: 6, bestPart: 'evening', bestDay: 'Mon', agentIds: ['AGT-005', 'AGT-013'] },
	{ id: 'CUST-010', name: 'Marisol Reyes', city: 'Santo Domingo', segment: 'residential', status: 'active', language: 'es', channel: 'whatsapp', plan: 'Mobile + Home bundle', value: 59.99, since: '2023-07-31', tracked: '2025-01-13', receptive: 0.85, baseSentiment: 4.3, slope: 0.1, contacts: 13, bestPart: 'afternoon', bestDay: 'Thu', agentIds: ['AGT-001', 'AGT-007', 'AGT-019'] },
	{ id: 'CUST-011', name: 'Héctor Sánchez', city: 'Moca', segment: 'residential', status: 'prospect', language: 'es', channel: 'phone', plan: '—', value: 0, since: '2026-06-22', tracked: '2026-06-22', receptive: 0.25, baseSentiment: 2.8, slope: -0.1, contacts: 3, bestPart: 'morning', bestDay: 'Fri', agentIds: ['AGT-009'] },
	{ id: 'CUST-012', name: 'Clínica San Rafael', city: 'Santo Domingo', segment: 'business', status: 'active', language: 'es', channel: 'email', plan: 'Business Fiber 1 Gbps', value: 149.0, since: '2019-04-08', tracked: '2025-01-27', receptive: 0.65, baseSentiment: 3.8, slope: 0.3, contacts: 9, bestPart: 'morning', bestDay: 'Wed', agentIds: ['AGT-002', 'AGT-016'] },
	{ id: 'CUST-013', name: 'Yolanda Peralta', city: 'Barahona', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 100 Mbps', value: 19.99, since: '2022-12-12', tracked: '2025-03-03', receptive: 0.3, baseSentiment: 2.6, slope: 0.5, contacts: 8, bestPart: 'evening', bestDay: 'Tue', agentIds: ['AGT-004', 'AGT-006'] },
	{ id: 'CUST-014', name: 'Daniel Ureña', city: 'Santiago', segment: 'residential', status: 'active', language: 'en', channel: 'phone', plan: 'Fiber 300 Mbps', value: 34.99, since: '2024-10-01', tracked: '2025-05-05', receptive: 0.4, baseSentiment: 3.0, slope: 0.2, contacts: 5, bestPart: 'afternoon', bestDay: 'Sat', agentIds: ['AGT-012', 'AGT-018'] },
	{ id: 'CUST-015', name: 'Ferretería El Sol', city: 'San Cristóbal', segment: 'business', status: 'churned', language: 'es', channel: 'phone', plan: '—', value: 0, since: '2021-02-15', tracked: '2025-02-10', receptive: 0.2, baseSentiment: 2.5, slope: -0.6, contacts: 8, bestPart: 'morning', bestDay: 'Mon', agentIds: ['AGT-010', 'AGT-017'] },
	{ id: 'CUST-016', name: 'Sofía Almonte', city: 'Santo Domingo', segment: 'premium', status: 'active', language: 'es', channel: 'whatsapp', plan: 'Premium Fiber 500 + TV', value: 49.99, since: '2023-05-29', tracked: '2025-01-13', receptive: 0.75, baseSentiment: 4.0, slope: 0.0, contacts: 11, bestPart: 'evening', bestDay: 'Wed', agentIds: ['AGT-003', 'AGT-001'] },
	{ id: 'CUST-017', name: 'Ramón Guzmán', city: 'La Vega', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 200 Mbps', value: 29.99, since: '2022-08-08', tracked: '2025-02-17', receptive: 0.2, baseSentiment: 2.3, slope: 0.1, contacts: 10, bestPart: 'afternoon', bestDay: 'Mon', agentIds: ['AGT-007', 'AGT-006', 'AGT-021'] },
	{ id: 'CUST-018', name: 'Beatriz Lora', city: 'Punta Cana', segment: 'residential', status: 'prospect', language: 'en', channel: 'email', plan: '—', value: 0, since: '2026-07-14', tracked: '2026-07-14', receptive: 0.5, baseSentiment: 3.4, slope: 0.4, contacts: 3, bestPart: 'morning', bestDay: 'Thu', agentIds: ['AGT-013'] },
	{ id: 'CUST-019', name: 'Transportes Caribe', city: 'Santo Domingo', segment: 'business', status: 'active', language: 'es', channel: 'phone', plan: 'Business Fiber 500', value: 99.0, since: '2020-11-30', tracked: '2025-01-27', receptive: 0.45, baseSentiment: 3.1, slope: -0.3, contacts: 12, bestPart: 'afternoon', bestDay: 'Tue', agentIds: ['AGT-008', 'AGT-002', 'AGT-015'] },
	{ id: 'CUST-020', name: 'Carmen Díaz', city: 'Santiago', segment: 'residential', status: 'active', language: 'es', channel: 'sms', plan: 'Fiber 100 Mbps', value: 19.99, since: '2023-09-18', tracked: '2025-03-10', receptive: 0.6, baseSentiment: 3.7, slope: 0.2, contacts: 7, bestPart: 'evening', bestDay: 'Fri', agentIds: ['AGT-005', 'AGT-011'] },
	{ id: 'CUST-021', name: 'Iván Cabrera', city: 'Bonao', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 300 Mbps', value: 34.99, since: '2024-04-22', tracked: '2025-04-07', receptive: 0.3, baseSentiment: 2.7, slope: -0.2, contacts: 6, bestPart: 'morning', bestDay: 'Sat', dnc: true, agentIds: ['AGT-006'] },
	{ id: 'CUST-022', name: 'Hotel Costa Azul', city: 'Puerto Plata', segment: 'business', status: 'active', language: 'en', channel: 'email', plan: 'Business Fiber 1 Gbps', value: 149.0, since: '2018-12-03', tracked: '2025-02-10', receptive: 0.7, baseSentiment: 3.9, slope: 0.1, contacts: 10, bestPart: 'afternoon', bestDay: 'Wed', agentIds: ['AGT-015', 'AGT-020', 'AGT-002'] },
	{ id: 'CUST-023', name: 'Gabriela Santos', city: 'Santo Domingo', segment: 'residential', status: 'active', language: 'es', channel: 'whatsapp', plan: 'Mobile + Home bundle', value: 59.99, since: '2024-01-15', tracked: '2025-01-20', receptive: 0.65, baseSentiment: 3.6, slope: 0.5, contacts: 9, bestPart: 'evening', bestDay: 'Thu', agentIds: ['AGT-003', 'AGT-004'] },
	{ id: 'CUST-024', name: 'Nicolás Brito', city: 'Santiago', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 200 Mbps', value: 29.99, since: '2021-05-17', tracked: '2025-02-03', receptive: 0.15, baseSentiment: 2.1, slope: 0.0, contacts: 9, bestPart: 'morning', bestDay: 'Tue', agentIds: ['AGT-005', 'AGT-007'] },
];

const AVATAR = ['blue', 'teal', 'grape', 'orange', 'cyan', 'indigo', 'pink', 'lime', 'violet', 'green'];

export const CUSTOMERS: CustomerRecord[] = CUSTOMER_PERSONAS.map((p, i) => ({
	id: p.id, name: p.name, phone: `+1 809 ${String(200 + i).padStart(3, '0')} ${String(1000 + i * 37).slice(-4)}`,
	email: `${p.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z ]/g, '').trim().replace(/ +/g, '.')}@example.com`,
	city: p.city, segment: p.segment, status: p.status, language: p.language, preferredChannel: p.channel, currentPlan: p.plan, monthlyValue: p.value,
	customerSince: p.since, trackedSince: p.tracked, consent: { recording: true, marketing: p.marketing ?? !p.dnc }, doNotCall: p.dnc ?? false,
	tags: [p.segment === 'business' ? 'B2B' : 'B2C', p.receptive >= 0.6 ? 'Upsell candidate' : p.receptive <= 0.25 ? 'Price sensitive' : 'Needs nurturing'].concat(p.status === 'churned' ? ['Win-back'] : []),
	avatarColor: AVATAR[i % AVATAR.length],
}));

export function buildCustomerProfile(p: CustomerPersona): CustomerProfile {
	const customer = CUSTOMERS.find((c) => c.id === p.id)!;
	const rand = seeded(Number(p.id.replace(/\D/g, '')) * 6007);
	const start = new Date(p.tracked).getTime();
	const end = new Date(NOW_ISO).getTime() - 3 * 86400000;
	const contacts: ContactRecord[] = [];
	const offers: OfferRecord[] = [];
	const surveys: SurveyResponse[] = [];

	for (let i = 0; i < p.contacts; i++) {
		const t = start + ((end - start) * (i + rand() * 0.6)) / p.contacts;
		const d = new Date(t);
		const preferred = rand() < 0.55; // most contacts hit the customer's good window
		const weekday = preferred ? p.bestDay : pick(WEEKDAYS, rand());
		const dayPart = preferred ? p.bestPart : pick(DAY_PARTS, rand());
		const agentId = pick(p.agentIds, rand());
		const agent = TEAM_AGENTS.find((a) => a.id === agentId)!;
		const campaign = TEAM_CAMPAIGNS.find((c) => c.id === agent.campaignIds[0])!;
		const answered = preferred ? rand() < 0.85 : rand() < 0.55;
		const outcome: ContactRecord['outcome'] = answered ? 'answered' : pick(['no-answer', 'voicemail', 'busy', 'callback'] as const, rand());
		const progress = p.contacts <= 1 ? 1 : i / (p.contacts - 1);
		const custSent = answered ? round1(clamp(p.baseSentiment + p.slope * 1.6 * progress + (rand() - 0.5) * 0.8 + (preferred ? 0.2 : -0.2), 1, 5)) : undefined;
		const category = custSent !== undefined ? categoryOf(custSent) : undefined;
		const emotion = category ? pick(EMOTIONS_BY_CATEGORY[category], rand()) : undefined;
		const id = `ct-${p.id}-${i}`;
		const signals: BusinessSignalType[] = [];
		let offerId: string | undefined;
		if (answered && rand() < 0.7) {
			const off = pick(OFFER_CATALOG, rand());
			const accepted = rand() < p.receptive * (preferred ? 1.25 : 0.8);
			const deferred = !accepted && rand() < 0.2;
			const result: OfferRecord['result'] = accepted ? 'accepted' : deferred ? 'deferred' : 'rejected';
			const reason = result === 'rejected' ? pick(['priceTooHigh', 'priceTooHigh', 'noNeed', 'thirdPartyDecision', 'distrustQuality', 'installationRequirements', 'other'] as NonConversionReasonKey[], rand()) : undefined;
			const competitor = result !== 'accepted' && rand() < 0.35 ? pick(COMPETITORS, rand()) : undefined;
			offerId = `of-${p.id}-${i}`;
			offers.push({ id: offerId, contactId: id, date: d.toISOString(), offer: off.name, monthlyPrice: off.price, result, nonConversionReason: reason, competitorMentioned: competitor, agentName: agent.name, note: result === 'deferred' ? 'Asked to be called back after the 15th' : undefined });
			if (result !== 'accepted') { signals.push(rand() < 0.5 ? 'EARLY_OBJECTION' : 'UNHANDLED_OBJECTION'); if (competitor) signals.push('COMPETITOR_PLUS_COST'); if (rand() < 0.2) signals.push('MISTARGETED_OFFER'); }
			if (result === 'deferred' || rand() < 0.25) signals.push('BEST_TIME_FRAME');
		}
		if (answered && rand() < 0.4) {
			const nps = custSent !== undefined ? clamp(Math.round((custSent - 1) * 2.5 + (rand() - 0.5) * 2), 0, 10) : 5;
			const isNps = rand() < 0.5;
			surveys.push({ id: `sv-${p.id}-${i}`, contactId: id, date: new Date(t + 3600000).toISOString(), type: isNps ? 'NPS' : 'CSAT', score: isNps ? nps : clamp(Math.round(nps / 2), 1, 5), verbatim: nps >= 8 ? 'Quick and clear, the agent understood what I needed.' : nps >= 5 ? 'Fine, but I still do not know the price after the promo.' : 'Felt pushed to buy; I asked not to be called again this month.', agentName: agent.name });
		}
		contacts.push({
			id, callId: i === 0 && p.id === 'CUST-001' ? 'call-001' : `call-${p.id.slice(-3)}${i}`, date: d.toISOString(), weekday, dayPart, channel: rand() < 0.8 ? 'phone' : p.channel,
			direction: rand() < 0.8 ? 'outbound' : 'inbound', campaignId: campaign.id, campaignName: campaign.name, agentId, agentName: agent.name, outcome,
			durationSeconds: answered ? 90 + Math.round(rand() * 420) : 0, customerSentiment: custSent, customerCategory: category, dominantEmotion: emotion,
			agentSentiment: answered ? round1(clamp(3.6 + (rand() - 0.5) * 1.2, 1, 5)) : undefined, signals, offerId,
			summary: !answered ? 'No contact made.' : offerId ? `Presented ${offers[offers.length - 1].offer}; ${offers[offers.length - 1].result}.` : pick(['Billing question resolved.', 'Service check-in, no issues.', 'Technical issue escalated.', 'Plan details explained.'], rand()),
		});
	}
	contacts.sort((a, b) => b.date.localeCompare(a.date));
	const answered = contacts.filter((c) => c.outcome === 'answered');
	const sentimentSeries: SentimentPoint[] = [...answered].reverse().map((c) => ({ label: shortDate(new Date(c.date)), date: c.date, customer: c.customerSentiment!, agent: c.agentSentiment!, category: c.customerCategory! }));
	const avgSent = answered.length ? round1(answered.reduce((s, c) => s + c.customerSentiment!, 0) / answered.length) : 3;
	const third = Math.max(1, Math.floor(sentimentSeries.length / 3));
	const sentimentDelta = sentimentSeries.length >= 2 ? round1(sentimentSeries.slice(-third).reduce((s, x) => s + x.customer, 0) / third - sentimentSeries.slice(0, third).reduce((s, x) => s + x.customer, 0) / third) : 0;
	const accepted = offers.filter((o) => o.result === 'accepted').length;
	const rejected = offers.filter((o) => o.result === 'rejected').length;
	const acceptanceRate = offers.length ? Math.round((accepted / offers.length) * 100) : 0;
	const answerRate = contacts.length ? Math.round((answered.length / contacts.length) * 100) : 0;
	const receptivenessScore = clamp(Math.round(acceptanceRate * 0.5 + answerRate * 0.25 + ((avgSent - 1) / 4) * 100 * 0.25), 0, 100);
	const receptivenessBand = receptivenessScore >= 60 ? 'receptive' : receptivenessScore >= 35 ? 'neutral' : 'resistant';
	const churnRisk = p.status === 'churned' ? 'high' : avgSent < 2.6 || sentimentDelta < -0.5 ? 'high' : avgSent < 3.4 ? 'medium' : 'low';
	const npsList = surveys.filter((s) => s.type === 'NPS');
	const csatList = surveys.filter((s) => s.type === 'CSAT');

	const windows: ContactWindowStat[] = [];
	for (const weekday of WEEKDAYS) for (const dayPart of DAY_PARTS) {
		const cs = contacts.filter((c) => c.weekday === weekday && c.dayPart === dayPart);
		if (!cs.length) continue;
		const ans = cs.filter((c) => c.outcome === 'answered');
		const ofs = cs.map((c) => offers.find((o) => o.id === c.offerId)).filter(Boolean) as OfferRecord[];
		windows.push({ weekday, dayPart, contacts: cs.length, answered: ans.length, accepted: ofs.filter((o) => o.result === 'accepted').length, rejected: ofs.filter((o) => o.result === 'rejected').length, avgSentiment: ans.length ? round1(ans.reduce((s, c) => s + c.customerSentiment!, 0) / ans.length) : 0 });
	}
	const bestWindows = [...windows].sort((a, b) => b.accepted - a.accepted || b.answered / b.contacts - a.answered / a.contacts || b.avgSentiment - a.avgSentiment).slice(0, 3);
	const worstWindows = [...windows].sort((a, b) => b.rejected - a.rejected || (a.answered / a.contacts) - (b.answered / b.contacts)).filter((w) => w.rejected > 0 || w.answered < w.contacts).slice(0, 3);

	const share: Record<SentimentCategory, number> = { 'very-negative': 0, negative: 0, neutral: 0, positive: 0, 'very-positive': 0 };
	answered.forEach((c) => { share[c.customerCategory!] += 1; });
	(Object.keys(share) as SentimentCategory[]).forEach((k) => { share[k] = answered.length ? Math.round((share[k] / answered.length) * 100) : 0; });
	const emotionCounts = new Map<Emotion, number>();
	answered.forEach((c) => emotionCounts.set(c.dominantEmotion!, (emotionCounts.get(c.dominantEmotion!) ?? 0) + 1));
	const topEmotions = [...emotionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([emotion, n]) => ({ emotion, share: Math.round((n / answered.length) * 100) }));
	void EMOTION_SENTIMENT_MAP;
	const byAgent = new Map<string, { n: number; sum: number }>();
	answered.forEach((c) => { const e = byAgent.get(c.agentName) ?? { n: 0, sum: 0 }; byAgent.set(c.agentName, { n: e.n + 1, sum: e.sum + c.customerSentiment! }); });
	const sentimentByAgent = [...byAgent.entries()].map(([agentName, v]) => ({ agentName, contacts: v.n, avgSentiment: round1(v.sum / v.n) })).sort((a, b) => b.contacts - a.contacts);

	const signalCounts = (['EARLY_OBJECTION', 'UNHANDLED_OBJECTION', 'COMPETITOR_PLUS_COST', 'MISTARGETED_OFFER', 'BEST_TIME_FRAME'] as BusinessSignalType[]).map((type) => ({ type, count: contacts.filter((c) => c.signals.includes(type)).length }));
	const reasonCounts = new Map<NonConversionReasonKey, number>();
	offers.forEach((o) => { if (o.nonConversionReason) reasonCounts.set(o.nonConversionReason, (reasonCounts.get(o.nonConversionReason) ?? 0) + 1); });
	const compCounts = new Map<string, number>();
	offers.forEach((o) => { if (o.competitorMentioned) compCounts.set(o.competitorMentioned, (compCounts.get(o.competitorMentioned) ?? 0) + 1); });
	const objections = OBJECTION_PHRASES.map((text, i) => ({ text, count: Math.round(rejected * [0.35, 0.2, 0.2, 0.15, 0.06, 0.04][i]) })).filter((o) => o.count > 0);

	const followUps = offers.filter((o) => o.result === 'deferred').slice(0, 1).map((o, i) => ({ id: `fu-${p.id}-${i}`, date: '2026-09-16T10:00:00Z', reason: 'Promo follow-up', assignedAgentName: o.agentName, status: 'scheduled' as const }));
	const notes = [{ id: `cn-${p.id}-1`, authorName: 'Maria García', authorRole: 'SUPERVISOR' as const, createdAt: '2026-08-20T11:30:00Z', text: p.receptive >= 0.6 ? 'Good candidate for the streaming add-on; prefers being contacted on ' + p.bestDay + ' ' + p.bestPart + '.' : 'Price sensitive — lead with the loyalty discount, avoid ' + (p.bestPart === 'morning' ? 'evenings' : 'mornings') + '.' }];

	const timeline: CustomerEvent[] = [
		...contacts.map((c) => ({ id: `ev-${c.id}`, type: 'contact' as const, date: c.date, title: `${c.direction === 'inbound' ? 'Inbound' : 'Outbound'} ${c.channel} · ${c.outcome}`, description: `${c.agentName} · ${c.campaignName} · ${c.summary}`, link: c.outcome === 'answered' ? `/qa/campaigns/1/calls/${c.callId}` : undefined })),
		...offers.map((o) => ({ id: `ev-${o.id}`, type: 'offer' as const, date: o.date, title: `Offer ${o.result}: ${o.offer}`, description: `$${o.monthlyPrice}/mo · ${o.agentName}${o.nonConversionReason ? ' · ' + o.nonConversionReason : ''}${o.competitorMentioned ? ' · vs ' + o.competitorMentioned : ''}` })),
		...surveys.map((s) => ({ id: `ev-${s.id}`, type: 'survey' as const, date: s.date, title: `${s.type} ${s.score}${s.type === 'NPS' ? '/10' : '/5'}`, description: s.verbatim ?? '' })),
		...notes.map((n) => ({ id: `ev-${n.id}`, type: 'note' as const, date: n.createdAt, title: `Note by ${n.authorName}`, description: n.text })),
		...followUps.map((f) => ({ id: `ev-${f.id}`, type: 'followUp' as const, date: f.date, title: `Follow-up scheduled: ${f.reason}`, description: `${f.assignedAgentName}` })),
		...(customer.doNotCall ? [{ id: `ev-dnc-${p.id}`, type: 'flag' as const, date: '2026-07-02T09:00:00Z', title: 'Flagged Do-Not-Call', description: 'Customer asked not to be contacted for offers.' }] : []),
	].sort((a, b) => b.date.localeCompare(a.date));

	const nextBestAction = customer.doNotCall ? 'Do not contact for offers; service calls only.'
		: churnRisk === 'high' ? 'Retention call by a senior agent; lead with the loyalty discount.'
		: receptivenessBand === 'receptive' ? `Upsell ${p.segment === 'business' ? 'Business Fiber 1 Gbps' : 'Premium Fiber 500 + TV'} on ${bestWindows[0]?.weekday ?? p.bestDay} ${bestWindows[0]?.dayPart ?? p.bestPart}.`
		: `Nurture: answer the price-after-promo question first; contact on ${bestWindows[0]?.weekday ?? p.bestDay} ${bestWindows[0]?.dayPart ?? p.bestPart}.`;

	return {
		customer, contacts, offers, surveys, sentimentSeries, categoryShare: share, topEmotions, sentimentByAgent, windows, bestWindows, worstWindows, signalCounts,
		nonConversionReasons: [...reasonCounts.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count),
		competitors: [...compCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
		objections, timeline, notes, followUps, nextBestAction,
		kpis: {
			totalContacts: contacts.length, answered: answered.length, answerRate, inbound: contacts.filter((c) => c.direction === 'inbound').length, outbound: contacts.filter((c) => c.direction === 'outbound').length,
			avgDurationSeconds: answered.length ? Math.round(answered.reduce((s, c) => s + c.durationSeconds, 0) / answered.length) : 0,
			firstContactAt: contacts[contacts.length - 1]?.date ?? p.tracked, lastContactAt: contacts[0]?.date ?? p.tracked, agentsInvolved: new Set(contacts.map((c) => c.agentId)).size,
			receptivenessScore, receptivenessBand, churnRisk, offersPresented: offers.length, offersAccepted: accepted, offersRejected: rejected, acceptanceRate,
			avgCustomerSentiment: avgSent, sentimentTrend: sentimentDelta > 0.3 ? 'up' : sentimentDelta < -0.3 ? 'down' : 'flat', sentimentDelta,
			npsLatest: npsList[0]?.score, csatAverage: csatList.length ? round1(csatList.reduce((s, x) => s + x.score, 0) / csatList.length) : undefined, surveysAnswered: surveys.length,
		},
	};
}

export const CUSTOMER_PROFILES: Record<string, CustomerProfile> = Object.fromEntries(CUSTOMER_PERSONAS.map((p) => [p.id, buildCustomerProfile(p)]));
```

- [ ] `npm run typecheck`. Sanity: CUST-001 (Mr. Doe) → sentiment trend `up` (2.4 → ~3.6), receptiveness `neutral`/`resistant`, first contact `call-001`; CUST-003 → trend `down`, churn `high`; CUST-010 → `receptive`, churn `low`; CUST-006 and CUST-021 → `doNotCall`.

---

## B · Task 3 — `helpers.ts` + `src/stores/qa/customersStore.ts`

- [ ] **`src/modules/qa/customers/helpers.ts`** (paste)

```typescript
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import type { ContactWindowStat, CustomerFilters, CustomerProfile, CustomerTableRow } from './types';
import { DAY_PART_HOURS } from './constants';

export const windowLabel = (w: Pick<ContactWindowStat, 'weekday' | 'dayPart'>, t: (k: string) => string) => `${t(`weekday.${w.weekday}`)} ${t(`dayPart.${w.dayPart}`)}`;
export const windowHours = (w: Pick<ContactWindowStat, 'dayPart'>) => DAY_PART_HOURS[w.dayPart];

export const toCustomerRow = (p: CustomerProfile): CustomerTableRow => ({
	id: p.customer.id, name: p.customer.name, segment: p.customer.segment, status: p.customer.status, doNotCall: p.customer.doNotCall,
	contacts: p.kpis.totalContacts, lastContactAt: p.kpis.lastContactAt, receptivenessScore: p.kpis.receptivenessScore, receptivenessBand: p.kpis.receptivenessBand,
	churnRisk: p.kpis.churnRisk, avgSentiment: p.kpis.avgCustomerSentiment, sentimentTrend: p.kpis.sentimentTrend, acceptanceRate: p.kpis.acceptanceRate,
	npsLatest: p.kpis.npsLatest, lastAgentName: p.contacts[0]?.agentName ?? '—',
	bestWindow: p.bestWindows[0] ? `${p.bestWindows[0].weekday} ${p.bestWindows[0].dayPart}` : '—',
	teamIds: [...new Set(p.contacts.map((c) => TEAM_AGENTS.find((a) => a.id === c.agentId)?.supervisorId ?? ''))],
});

/** Supervisor sees customers contacted by at least one agent of Team 1; QA Manager sees all. */
export const visibleForRole = (rows: CustomerTableRow[], role: TeamRole) => (role === 'qa-manager' ? rows : rows.filter((r) => r.teamIds.includes(SUPERVISOR_PERSONA.id)));

export const applyCustomerFilters = (rows: CustomerTableRow[], profiles: Record<string, CustomerProfile>, f: CustomerFilters) =>
	rows.filter((r) => {
		const q = f.search.toLowerCase();
		if (q && !r.name.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q) && !profiles[r.id].customer.phone.includes(q)) return false;
		if (f.segment !== 'all' && r.segment !== f.segment) return false;
		if (f.status !== 'all' && r.status !== f.status) return false;
		if (f.receptiveness !== 'all' && r.receptivenessBand !== f.receptiveness) return false;
		if (f.churnRisk !== 'all' && r.churnRisk !== f.churnRisk) return false;
		if (f.agentId !== 'all' && !profiles[r.id].contacts.some((c) => c.agentId === f.agentId)) return false;
		if (f.dncOnly && !r.doNotCall) return false;
		return true;
	});

export const customerKpis = (rows: CustomerTableRow[]) => ({
	total: rows.length,
	receptive: rows.filter((r) => r.receptivenessBand === 'receptive').length,
	churnHigh: rows.filter((r) => r.churnRisk === 'high').length,
	doNotCall: rows.filter((r) => r.doNotCall).length,
	improving: rows.filter((r) => r.sentimentTrend === 'up').length,
	declining: rows.filter((r) => r.sentimentTrend === 'down').length,
	avgAcceptance: rows.length ? Math.round(rows.reduce((s, r) => s + r.acceptanceRate, 0) / rows.length) : 0,
});

export const npsBand = (score: number): { label: 'promoter' | 'passive' | 'detractor'; color: string } =>
	score >= 9 ? { label: 'promoter', color: 'green' } : score >= 7 ? { label: 'passive', color: 'yellow' } : { label: 'detractor', color: 'red' };
```

- [ ] **`src/stores/qa/customersStore.ts`** (paste)

```typescript
import { create } from 'zustand';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import { QA_MANAGER_PERSONA, SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import type { CustomerEvent, CustomerNote, CustomerProfile, FollowUp } from '~/modules/qa/customers/types';
import { CUSTOMER_PROFILES } from '~/modules/qa/customers/mockData';
import { NOW_ISO } from '~/modules/qa/customers/constants';

let counter = 900;
const nextId = (prefix: string) => `${prefix}-${++counter}`;
const author = (role: TeamRole) => (role === 'qa-manager' ? { ...QA_MANAGER_PERSONA, sourceRole: 'QA_MANAGER' as const } : { ...SUPERVISOR_PERSONA, sourceRole: 'SUPERVISOR' as const });
const prepend = (p: CustomerProfile, e: CustomerEvent): CustomerProfile => ({ ...p, timeline: [e, ...p.timeline] });

export interface ScheduleFollowUpInput { customerId: string; date: string; reason: string; agentId: string; agentName: string; note?: string }

interface CustomersState {
	profiles: Record<string, CustomerProfile>;
	scheduleFollowUp: (input: ScheduleFollowUpInput, role: TeamRole) => FollowUp;
	completeFollowUp: (customerId: string, followUpId: string) => void;
	addNote: (customerId: string, text: string, role: TeamRole) => CustomerNote;
	setDoNotCall: (customerId: string, value: boolean, role: TeamRole) => void;
}

export const useCustomersStore = create<CustomersState>((set) => ({
	profiles: CUSTOMER_PROFILES,

	scheduleFollowUp: (input, role) => {
		const a = author(role);
		const fu: FollowUp = { id: nextId('fu'), date: input.date, reason: input.reason, assignedAgentName: input.agentName, status: 'scheduled' };
		set((s) => {
			const p = s.profiles[input.customerId];
			return { profiles: { ...s.profiles, [input.customerId]: prepend({ ...p, followUps: [fu, ...p.followUps] }, { id: nextId('ev'), type: 'followUp', date: NOW_ISO, title: `Follow-up scheduled: ${fu.reason}`, description: `${fu.assignedAgentName} · ${new Date(fu.date).toLocaleString()}${input.note ? ' · ' + input.note : ''}` }) } };
		});
		useNotificationStore.getState().addNotification({
			id: nextId('ntf'), agentId: input.agentId, category: 'DIRECT_MESSAGE', priority: 'NORMAL', title: `Follow-up assigned: ${input.reason}`,
			message: `${a.name} scheduled a follow-up with customer ${input.customerId} for ${new Date(input.date).toLocaleString()}.${input.note ? ' ' + input.note : ''}`,
			icon: 'phone-call', sourceRole: a.sourceRole, sourceId: a.id, read: false, archived: false, actioned: false, createdAt: NOW_ISO,
		});
		return fu;
	},

	completeFollowUp: (customerId, followUpId) => set((s) => ({ profiles: { ...s.profiles, [customerId]: { ...s.profiles[customerId], followUps: s.profiles[customerId].followUps.map((f) => (f.id === followUpId ? { ...f, status: 'done' } : f)) } } })),

	addNote: (customerId, text, role) => {
		const a = author(role);
		const note: CustomerNote = { id: nextId('cn'), authorName: a.name, authorRole: a.sourceRole, createdAt: NOW_ISO, text };
		set((s) => {
			const p = s.profiles[customerId];
			return { profiles: { ...s.profiles, [customerId]: prepend({ ...p, notes: [note, ...p.notes] }, { id: nextId('ev'), type: 'note', date: NOW_ISO, title: `Note by ${a.name}`, description: text }) } };
		});
		return note;
	},

	setDoNotCall: (customerId, value, role) => set((s) => {
		const a = author(role);
		const p = s.profiles[customerId];
		const updated = prepend({ ...p, customer: { ...p.customer, doNotCall: value, consent: { ...p.customer.consent, marketing: !value } } }, { id: nextId('ev'), type: 'flag', date: NOW_ISO, title: value ? 'Flagged Do-Not-Call' : 'Do-Not-Call flag removed', description: `By ${a.name}` });
		return { profiles: { ...s.profiles, [customerId]: updated } };
	}),
}));

export const selectCustomer = (id: string | undefined) => (s: CustomersState) => (id ? s.profiles[id] : undefined);
```

- [ ] `npm run typecheck`.

---

## B · Task 4 — i18n `src/locales/en/qa.customers.json` (+ `es/qa.customers.json`)

- [ ] Paste the English file:

```json
{
	"list": {
		"title": "Customers",
		"description": "People and businesses contacted by your team, with how receptive they are and how their sentiment is evolving.",
		"descriptionQaManager": "All customers contacted through the platform.",
		"kpi": { "total": "Customers", "receptive": "Receptive", "churnHigh": "High churn risk", "doNotCall": "Do-Not-Call", "avgAcceptance": "Avg. offer acceptance", "improving": "improving", "declining": "declining" },
		"filters": { "search": "Search name, ID or phone", "segment": "Segment", "status": "Status", "receptiveness": "Receptiveness", "churn": "Churn risk", "agent": "Contacted by", "dncOnly": "Do-Not-Call only", "all": "All", "clear": "Clear filters" },
		"columns": { "customer": "Customer", "segment": "Segment", "status": "Status", "contacts": "Contacts", "lastContact": "Last contact", "receptiveness": "Receptiveness", "churn": "Churn risk", "sentiment": "Avg. sentiment", "acceptance": "Offer acceptance", "nps": "Latest NPS", "lastAgent": "Last agent", "bestWindow": "Best window" },
		"empty": "No customers match the current filters.",
		"rowsCount": "{{count}} customers"
	},
	"segment": { "residential": "Residential", "business": "Business", "premium": "Premium" },
	"status": { "active": "Active", "prospect": "Prospect", "churned": "Churned" },
	"channel": { "phone": "Phone", "whatsapp": "WhatsApp", "email": "Email", "sms": "SMS" },
	"outcome": { "answered": "Answered", "noAnswer": "No answer", "voicemail": "Voicemail", "busy": "Busy", "callback": "Callback requested" },
	"offerResult": { "accepted": "Accepted", "rejected": "Rejected", "deferred": "Deferred" },
	"receptiveness": { "receptive": "Receptive", "neutral": "Neutral", "resistant": "Resistant", "hint": "50% offer acceptance · 25% answer rate · 25% average sentiment" },
	"churn": { "low": "Low", "medium": "Medium", "high": "High" },
	"weekday": { "Mon": "Mon", "Tue": "Tue", "Wed": "Wed", "Thu": "Thu", "Fri": "Fri", "Sat": "Sat" },
	"dayPart": { "morning": "morning", "afternoon": "afternoon", "evening": "evening" },
	"tabs": { "overview": "Overview", "contacts": "Contacts", "sentiment": "Sentiment & Emotion", "offers": "Offers & Signals", "surveys": "Surveys", "timeline": "Timeline" },
	"header": {
		"back": "Back to customers", "customerSince": "Customer since {{date}}", "trackedSince": "Tracked since {{date}}", "plan": "Plan", "value": "{{value}}/mo",
		"dnc": "Do-Not-Call", "consentRecording": "Recording consent", "consentMarketing": "Marketing consent", "language": { "es": "Spanish", "en": "English" },
		"prefers": "Prefers {{channel}}", "receptiveness": "Receptiveness", "churn": "Churn risk", "bestWindow": "Best window", "nextBestAction": "Next best action",
		"actions": { "followUp": "Schedule follow-up", "addNote": "Add note", "flagDnc": "Flag Do-Not-Call", "unflagDnc": "Remove Do-Not-Call" }
	},
	"overview": {
		"kpi": { "contacts": "Contacts", "answerRate": "Answer rate", "avgDuration": "Avg. duration", "agents": "Agents involved", "offers": "Offers presented", "acceptance": "Acceptance rate", "sentiment": "Avg. sentiment", "nps": "Latest NPS" },
		"sentimentTrend": "Customer sentiment over time", "sentimentTrendDescription": "One point per answered contact (1–5)",
		"direction": { "up": "Improving", "down": "Declining", "flat": "No change" }, "directionHint": "{{delta}} points between first and last contacts",
		"windows": "Contact windows", "windowsDescription": "When this customer answers and accepts offers, and when they reject",
		"best": "Best windows", "worst": "Worst windows", "windowStats": "{{answered}}/{{contacts}} answered · {{accepted}} accepted · {{rejected}} rejected", "noWindows": "Not enough contacts yet.",
		"signals": "Business signals", "followUps": "Follow-ups", "noFollowUps": "No follow-ups scheduled.", "markDone": "Mark done", "done": "Done",
		"preferences": "Preferences & consent", "tags": "Tags"
	},
	"contacts": {
		"title": "Contact history", "description": "Every contact attempt through the platform",
		"columns": { "date": "Date", "direction": "Direction", "channel": "Channel", "agent": "Agent", "campaign": "Campaign", "outcome": "Outcome", "duration": "Duration", "sentiment": "Sentiment", "emotion": "Emotion", "offer": "Offer", "open": "Open call" },
		"inbound": "Inbound", "outbound": "Outbound", "summary": "Summary", "byAgent": "Sentiment by agent", "byAgentDescription": "How the customer reacts to each agent", "contactsCount": "{{count}} contacts"
	},
	"sentiment": {
		"average": "Average customer sentiment", "categories": "Sentiment categories", "emotions": "Dominant emotions", "trend": "Sentiment over time", "trendDescription": "Customer vs agent per answered contact",
		"customer": "Customer", "agent": "Agent", "first": "First contact", "latest": "Latest contact", "peak": "Best", "low": "Worst"
	},
	"offers": {
		"kpi": { "presented": "Presented", "accepted": "Accepted", "rejected": "Rejected", "deferred": "Deferred" },
		"history": "Offer history", "reasons": "Non-conversion reasons", "competitors": "Competitors mentioned", "mentions": "{{count}} mentions", "objections": "Common objections", "times": "{{count}} times",
		"signals": "Business signals detected", "signalsDescription": "Across all contacts with this customer", "noOffers": "No offers presented yet.", "price": "{{price}}/mo"
	},
	"surveys": {
		"kpi": { "answered": "Surveys answered", "npsLatest": "Latest NPS", "csatAvg": "Average CSAT", "responseRate": "Response rate" },
		"band": { "promoter": "Promoter", "passive": "Passive", "detractor": "Detractor" },
		"history": "Survey responses", "verbatim": "Verbatim", "noSurveys": "No survey responses yet.", "npsTrend": "NPS over time"
	},
	"timeline": {
		"title": "Interaction timeline", "filterAll": "All",
		"types": { "contact": "Contact", "offer": "Offer", "survey": "Survey", "note": "Note", "followUp": "Follow-up", "flag": "Flag" },
		"open": "Open call", "empty": "No events of this type.",
		"notes": "Notes", "notesDescription": "Visible to supervisors and QA managers", "notePlaceholder": "Write a note about this customer…", "save": "Save note"
	},
	"modals": {
		"followUp": { "title": "Schedule follow-up", "date": "Date and time", "reason": "Reason", "agent": "Assign to agent", "note": "Note for the agent", "submit": "Schedule", "success": "Follow-up scheduled and agent notified." },
		"dnc": { "title": "Flag Do-Not-Call", "body": "The customer will be excluded from offer campaigns. Service calls remain allowed.", "confirm": "Flag", "removeTitle": "Remove Do-Not-Call", "removeBody": "The customer can be contacted for offers again.", "removeConfirm": "Remove", "success": "Do-Not-Call flag updated." },
		"cancel": "Cancel"
	},
	"common": { "vsFirst": "vs first contacts", "notFound": "Customer not found", "notFoundDescription": "The customer {{id}} was not contacted by your team." }
}
```

- [ ] Create `src/locales/es/qa.customers.json` with the same keys in Spanish (`"title": "Clientes"`, `"receptive": "Receptivo"`, `"resistant": "Reacio"`, `"churn.high": "Alto"`, `"tabs.offers": "Ofertas y señales"`, `"tabs.surveys": "Encuestas"`, `"dayPart.morning": "mañana"`, `"dayPart.afternoon": "tarde"`, `"dayPart.evening": "noche"`, weekdays `Lun/Mar/Mié/Jue/Vie/Sáb`).

---

## B · Task 5 — `CustomersPage` (table)

Files: `CustomersPage/CustomersPage.tsx` (+ `.module.css`, `index.ts`), `CustomerKpiStrip.tsx`, `CustomerFilters.tsx`, `useCustomerColumns.tsx`. Namespace `qa.customers`. Same skeleton as Plan A Task 6.

- [ ] **`CustomersPage.tsx`** — `role = roleFromPath(...)`; `profiles = useCustomersStore((s) => s.profiles)`; `rows = useMemo(() => applyCustomerFilters(visibleForRole(Object.values(profiles).map(toCustomerRow), role), profiles, filters))`; default filters `{ search: '', segment: 'all', status: 'all', receptiveness: 'all', churnRisk: 'all', agentId: 'all', dncOnly: false }`. `ContentContainer contentWidth='full' title={t('list.title')} description={t(role === 'qa-manager' ? 'list.descriptionQaManager' : 'list.description')}` → `CustomerKpiStrip`, `CustomerFilters`, `SectionCard` with `BaseTable<CustomerTableRow>` (`initialSort` `lastContactAt` desc, `pageSize={10}`, `density='compact'`, `onRowClick → navigate(`${customersBasePath(role)}/${row.id}`)`, `getRowClassName` → `styles.dncRow` (`box-shadow: inset 3px 0 0 var(--mantine-color-red-6)`) when `doNotCall`).
- [ ] **`CustomerKpiStrip.tsx`** — `SimpleGrid cols={{ base: 2, md: 5 }}` `StatCard`: total (badge `↑{improving}` teal / `↓{declining}` red with tooltips), receptive (`green`), churnHigh (`red` if >0), doNotCall (`gray`), avgAcceptance `{v}%`.
- [ ] **`CustomerFilters.tsx`** — `TextInput` search (w 280); `Select` segment / status / receptiveness / churn; `Select` "Contacted by" (`all` + visible agents: Supervisor → `TEAM_AGENTS` of `SUPERVISOR_PERSONA.id`, QA Manager → all, label `name · team`); `Switch` DNC only; clear button.
- [ ] **`useCustomerColumns.tsx`** columns:

| id | header | cell |
|---|---|---|
| `name` | `list.columns.customer` | `Avatar` + name (+ `Badge size='xs' color='red' variant='filled'` `t('header.dnc')` when `doNotCall`) + `Text size='xs' c='dimmed'` id |
| `segment` | segment | `Badge variant='light' color={SEGMENT_META.color}` |
| `status` | status | `Badge variant='dot' color={STATUS_META.color}` |
| `contacts` | contacts | number |
| `lastContactAt` | lastContact | `formatDate` + `Text size='xs' c='dimmed'` `lastAgentName` |
| `receptivenessScore` | receptiveness | `Group gap={6}`: `Badge size='lg' variant='filled' color={RECEPTIVENESS_META[band].color}` `{score}` + `Text size='xs'` `t(band labelKey)` |
| `churnRisk` | churn | `Badge variant='light' color={CHURN_META.color}` |
| `avgSentiment` | sentiment | `{v.toFixed(1)}/5` colored `sentimentColor` + trend icon (`trendColor`) |
| `acceptanceRate` | acceptance | `{v}%` |
| `npsLatest` | nps | `Badge variant='outline' color={npsBand(v).color}` `{v}` or `—` |
| `bestWindow` | bestWindow | `Text size='xs'` (`windowLabel` when profile has a best window) |

- [ ] `npm run typecheck`.

---

## B · Task 6 — `CustomerProfilePage` (header, components, six tabs, modals)

- [ ] **Shared components (`src/modules/qa/customers/components/`)**

| Component | Props | Renders |
|---|---|---|
| `ReceptivenessGauge.tsx` | `{ score: number; band: ReceptivenessBand; size?: number }` | `ScoreRing value={score} size={size ?? 112} color={RECEPTIVENESS_META[band].color} label={score}` + below `Badge variant='light' color` `t(band labelKey)`; `Tooltip label={t('receptiveness.hint')}` on an info icon |
| `ContactWindowTiles.tsx` | `{ best: ContactWindowStat[]; worst: ContactWindowStat[] }` | `SimpleGrid cols={{ base: 1, md: 2 }}`: **Best** column (`Text size='xs' fw={600} tt='uppercase' c='teal'` `t('overview.best')`) with up to 3 `Paper withBorder p='sm' radius='md' bg='var(--mantine-color-teal-light)'`: `Group justify='space-between'`: `Text fw={600}` `windowLabel(w)` + `Text size='xs' c='dimmed'` `windowHours(w)`; `Badge color='teal' variant='filled'` `{accepted} ✓`; `Text size='xs' c='dimmed'` `t('overview.windowStats', w)`; `Progress value={answered/contacts*100} color='teal' size='xs'`. **Worst** column same with `red` (`bg='var(--mantine-color-red-light)'`, badge `{rejected} ✕`). Empty → `Text c='dimmed'` `noWindows` |
| `ContactsTable.tsx` | `{ contacts: ContactRecord[]; offers: OfferRecord[]; compact?: boolean }` | `BaseTable` columns: date `formatDateTime`; direction `Badge variant='outline'` (`IconPhoneIncoming`/`IconPhoneOutgoing`); channel `t(CHANNEL_META)`; agent; campaign; outcome `Badge color={OUTCOME_META.color}`; duration `formatSeconds` or `—`; sentiment `{v.toFixed(1)}` colored `sentimentColor` + `Badge size='xs' variant='light' color={SENTIMENT_CATEGORY_META.color}` category (import `SENTIMENT_CATEGORY_META`, `EMOTION_META` from `~/modules/qa/team/constants`); emotion `Badge size='xs' variant='light' color={EMOTION_META.color}`; offer (`OFFER_RESULT_META` badge + offer name, or `—`); open `ActionIcon` `IconExternalLink` → `/qa/campaigns/1/calls/${callId}` (only when answered). `enableExpanding renderExpandedRow={(row) => <Text size='sm' p='sm'>{row.summary}</Text>}`; `pageSize={compact ? 5 : 10}` |
| `OfferRow.tsx` | `{ offer: OfferRecord }` | `Paper withBorder p='sm' radius='md'`: `Group justify='space-between' wrap='nowrap'`: `Stack gap={2}`: `Group gap='xs'`: `Badge color={OFFER_RESULT_META.color} variant='filled'` result, `Text fw={600} size='sm'` offer; `Text size='xs' c='dimmed'` `t('offers.price', { price: `$${monthlyPrice}` }) · {agentName} · {formatDate(date)}`; if reason `Text size='xs'` `NON_CONVERSION_REASON_LABELS[reason]` (from `~/modules/qa/team/constants`); if competitor `Badge size='xs' variant='outline' color='orange' leftSection={<IconBuildingStore size={12}/>}` name; if note `Text size='xs' fs='italic'` |
| `SurveyCard.tsx` | `{ survey: SurveyResponse }` | `Paper withBorder p='sm' radius='md'`: `Group justify='space-between'`: `Group gap='xs'`: `Badge variant='filled' color={type === 'NPS' ? npsBand(score).color : score >= 4 ? 'green' : score >= 3 ? 'yellow' : 'red'}` `{type} {score}{type==='NPS' ? '/10' : '/5'}`, NPS → `Text size='xs'` `t(`surveys.band.${npsBand(score).label}`)`; `Text size='xs' c='dimmed'` `{agentName} · {formatDate(date)}`; verbatim `Text size='sm' fs='italic' mt='xs'` `“{verbatim}”` |
| `CustomerTimeline.tsx` | `{ events: CustomerEvent[]; filter; onFilterChange }` | Same as Plan A `ActivityTimeline` with `EVENT_META` and icons: contact `IconPhone`, offer `IconTag`, survey `IconClipboardText`, note `IconNote`, followUp `IconCalendarEvent`, flag `IconBan` |
| `CustomerNotesPanel.tsx` | `{ notes: CustomerNote[]; onAdd(text) }` | Plan A `NotesPanel` without pin |
| `modals/ScheduleFollowUpModal.tsx` | `{ customerId; role; opened; onClose }` | `DateTimePicker` (default next best window: tomorrow 10:00), `Select` reason (`FOLLOW_UP_REASONS`), `Select` agent (visible agents by role, default = last agent who contacted the customer), `Textarea` note → `scheduleFollowUp(...)` + `notifications.show` success |
| `LegacyCustomerRedirect.tsx` | — | `const { customerId } = useParams(); return <Navigate to={`/qa/supervisor/customers/${customerId ?? ''}`} replace />` |

- [ ] **`CustomerProfilePage/CustomerHeader.tsx`** — `{ profile; role; onFollowUp; onAddNote; onToggleDnc }`. `SectionCard padding='lg'`:
  - **Left** `Group gap='md'`: `Avatar size={72} radius='md' color name`; `Stack gap={4}`: `Group gap='xs'`: `Title order={2}` name, `Badge variant='light' color={SEGMENT_META.color}` segment, `Badge variant='dot' color={STATUS_META.color}` status, `doNotCall && <Badge color='red' variant='filled' leftSection={<IconBan size={12}/>}>{t('header.dnc')}</Badge>`; `Text size='sm' c='dimmed'` `{id} · {phone} · {email} · {city}`; `Group gap={6}`: `Badge variant='outline' size='xs'` `t('header.plan')}: {currentPlan}`, `monthlyValue > 0 && Badge` `t('header.value', { value: `$${monthlyValue}` })`, `Badge variant='light' color='gray' size='xs'` `t('header.prefers', { channel: t(CHANNEL_META) })`, `Badge size='xs'` language, tags as `Badge size='xs' variant='light' color='indigo'`; `Text size='xs' c='dimmed'` `t('header.customerSince', { date }) · t('header.trackedSince', { date }) · {kpis.totalContacts} contacts`.
  - **Right** `Group gap='xl' align='center'`: `ReceptivenessGauge`; `Stack gap={6}`: `Group gap='xs'`: `Text size='xs' c='dimmed' tt='uppercase'` `t('header.churn')` + `Badge color={CHURN_META.color} variant='filled'` level; `Group gap='xs'`: `Text size='xs' c='dimmed' tt='uppercase'` `t('header.bestWindow')` + `Badge color='teal' variant='light' leftSection={<IconClock size={12}/>}` `windowLabel(bestWindows[0])` (or `—`); `TrendDelta delta={sentimentDelta} trend={sentimentTrend} unit='/5' suffix={t('common.vsFirst')}`.
  - **Bottom** `Alert variant='light' color='blue' icon={<IconBulb/>} title={t('header.nextBestAction')} mt='md'` `{nextBestAction}`; `Group justify='flex-end' mt='sm'`: `Button variant='light' leftSection={<IconCalendarEvent/>}` followUp (disabled when `doNotCall`, tooltip explains), `Button variant='default' leftSection={<IconNote/>}` addNote (focuses the notes textarea on the Timeline tab: navigate to `?tab=timeline` and call `onAddNote`), `Button variant={doNotCall ? 'default' : 'outline'} color='red' leftSection={<IconBan/>}` flag/unflag → opens a confirm `Modal` (`modals.dnc.*`) → `setDoNotCall`.
- [ ] **`CustomerProfilePage.tsx`** — `useParams().customerId`, `role`, `profile = useCustomersStore(selectCustomer(id))`; not found or (supervisor and `!toCustomerRow(profile).teamIds.includes(SUPERVISOR_PERSONA.id)`) → `EmptyState` with back button. Tab from `?tab=` (default `overview`). `Breadcrumbs` (Customers → name), `CustomerHeader`, `Tabs` from `CUSTOMER_TABS`, `ScheduleFollowUpModal`, DNC confirm modal.
- [ ] **Tabs** — each `{ profile: CustomerProfile; role: TeamRole }`:

| Tab | Blocks |
|---|---|
| `OverviewTab` | ① `SimpleGrid cols={{ base: 2, md: 4 }}` `StatCard`: contacts (`{total}` subtitle `{answerRate}% answered`), avgDuration (`formatSeconds`), agents, offers (`{presented}` subtitle `{acceptance}% accepted`), sentiment (`{avg}/5` colored, badge trend), nps (`npsLatest ?? '—'`, colored by `npsBand`), plus receptiveness & churn already in header (skip). ② `SectionCard title={t('overview.sentimentTrend')} description icon={IconChartLine} headerActions={direction Badge}` → `LineChart h={260} data={sentimentSeries} dataKey='label' series={[{name:'customer',label:t('sentiment.customer'),color:'orange.6'}]} yAxisProps={{ domain: [1, 5] }} withDots curveType='monotone'` + `Text size='xs' c='dimmed'` `t('overview.directionHint', { delta })`. ③ `SectionCard title={t('overview.windows')} description icon={IconClock}` → `ContactWindowTiles`. ④ `SimpleGrid cols={{ base: 1, md: 2 }}`: `SectionCard title={t('overview.signals')} icon={IconSparkles}` → per `signalCounts` row: `Group justify='space-between'`: `Badge variant='light' color={tone risk orange/opportunity teal}` `BUSINESS_SIGNAL_META.label` + `Text fw={600}` count, `Progress value={count/total*100}`; `SectionCard title={t('overview.followUps')} icon={IconCalendarEvent}` → list `Paper withBorder p='sm'`: reason, `Text size='xs' c='dimmed'` `{assignedAgentName} · {formatDateTime(date)}`, `status === 'scheduled' ? Button size='xs' variant='light' t('overview.markDone') → completeFollowUp : Badge color='green' t('overview.done')`; empty `noFollowUps`. ⑤ `SectionCard title={t('overview.preferences')} icon={IconSettings}`: `SimpleGrid cols={{ base: 2, md: 4 }}` tiles (`Text size='xs' c='dimmed'` label + `Text fw={600} size='sm'`): preferred channel, language, recording consent (`IconCheck`/`IconX`), marketing consent; then `Group` tags. |
| `ContactsTab` | ① `SectionCard title={t('contacts.title')} description headerActions={<Badge variant='light'>{t('contacts.contactsCount', { count })}</Badge>}` → `ContactsTable contacts offers`. ② `SectionCard title={t('contacts.byAgent')} description={t('contacts.byAgentDescription')} icon={IconHeadset}` → `BarChart h={200} data={sentimentByAgent} dataKey='agentName' series={[{name:'avgSentiment',color:'orange.6'}]} yAxisProps={{ domain: [1, 5] }}` + small `Table` (agent · contacts · avg). |
| `SentimentTab` | ① `SimpleGrid cols={{ base: 1, md: 2 }}`: `SectionCard title={t('sentiment.average')}`: `Group`: `ScoreRing value={avg} max={5} label={avg.toFixed(1)} color={sentimentColor(avg)}` + `Stack`: 4 mini tiles first / latest / best / worst (`sentimentSeries` first, last, max, min → `{score} · {label}`); `SectionCard title={t('sentiment.categories')}`: `Progress.Root size='lg'` stacked by `SENTIMENT_CATEGORY_ORDER` + legend; then `Text tt='uppercase'` `emotions` + rows `Badge color={EMOTION_META.color}` + `%` + `Progress size='xs'`. ② `SectionCard title={t('sentiment.trend')} description` → `LineChart h={280} data={sentimentSeries} series={[{name:'customer',color:'orange.6'},{name:'agent',color:'blue.6'}]} yAxisProps={{ domain: [1, 5] }} withLegend withDots`; under it `Group gap='xs'` chips of category per point? — no; instead `Text size='xs' c='dimmed'` listing dominant emotion at first vs latest contact. |
| `OffersTab` | ① `SimpleGrid cols={{ base: 2, md: 4 }}` `StatCard` presented / accepted (`green`) / rejected (`red`) / deferred (`yellow`). ② `SimpleGrid cols={{ base: 1, md: 2 }}`: `SectionCard title={t('offers.history')} icon={IconTag}` → `Stack gap='xs'` of `OfferRow` (newest first) or `EmptyState noOffers`; right column `Stack`: `SectionCard title={t('offers.reasons')}` → `DonutChart size={150} thickness={20} withLabels data={nonConversionReasons → {name: label, value, color}}` + legend; `SectionCard title={t('offers.competitors')}` → `Badge size='lg' variant='light' color='orange'` `{name} · t('offers.mentions', { count })`; `SectionCard title={t('offers.objections')}` → rows `Text size='sm'` `“{text}”` + `Badge variant='outline'` `t('offers.times', { count })`. ③ `SectionCard title={t('offers.signals')} description icon={IconSparkles}` → same signal rows as Overview but with `ratePerCall` = `count/answered*100` and `Text size='xs' c='dimmed'` description from `BUSINESS_SIGNAL_META`. |
| `SurveysTab` | ① `SimpleGrid cols={{ base: 2, md: 4 }}` `StatCard`: answered, npsLatest (badge `npsBand` label), csatAvg (`x.x/5`), responseRate = `surveys/answered contacts %`. ② `SimpleGrid cols={{ base: 1, md: 2 }}`: `SectionCard title={t('surveys.npsTrend')}` → `LineChart h={220} data={NPS surveys oldest→newest mapped {label: shortDate, score}} dataKey='label' series={[{name:'score',color:'teal.6'}]} yAxisProps={{ domain: [0, 10] }} withDots` (or `EmptyState`); `SectionCard title={t('surveys.history')}` → `Stack gap='xs'` of `SurveyCard` newest first or `EmptyState noSurveys`. |
| `TimelineTab` | `Grid`: col 7 → `SectionCard title={t('timeline.title')} icon={IconHistory}` → `CustomerTimeline`; col 5 → `CustomerNotesPanel notes onAdd={(text) => addNote(id, text, role)}` (textarea gets `autoFocus` when `?focus=note` is present — set by the header's Add note action). |

- [ ] `npm run typecheck`.

---

## B · Task 7 — Routes, namespaces, sidebar, call-detail link, deletions

- [ ] **`src/routes.tsx`**
  - Remove the `CustomerProfilePage` lazy import (:145-147). Add:
    ```tsx
    const CustomersPage = React.lazy(() => import('./modules/qa/customers/CustomersPage'));
    const CustomerProfilePage = React.lazy(() => import('./modules/qa/customers/CustomerProfilePage'));
    const LegacyCustomerRedirect = React.lazy(() => import('./modules/qa/customers/components/LegacyCustomerRedirect'));
    ```
  - Add four routes next to the Plan A ones: `supervisor/customers` (`qa.supervisor.customers`) → `<CustomersPage/>`; `supervisor/customers/:customerId` (`qa.supervisor.customers.profile`) → `<CustomerProfilePage/>`; `qa-manager/customers` (`qa.qa-manager.customers`); `qa-manager/customers/:customerId` (`qa.qa-manager.customers.profile`).
  - `profiles/customer/:customerId` (:1134-1144): element → `<Suspense fallback={<SuspenseFallback />}><LegacyCustomerRedirect /></Suspense>` (no namespace loader needed).
- [ ] **`src/modules/qa/qaNamespaces.ts`** — the 4 new ids → `['qa.customers', 'qa.team', 'qa.dashboard']`.
- [ ] **`roleNavigation.tsx`**
  - Supervisor flat: insert after `supervisor-calls` (index 2): `{ key: 'supervisor-customers', label: 'sidebar.supervisor.customers', icon: <IconAddressBook size={20} className={styles.menuIcon} />, to: '/qa/supervisor/customers', i18nNamespace: 'qa.customers' }`. New indices: 0 dashboard, 1 team, 2 calls, **3 customers**, 4 campaigns, 5 disputes, 6 analytics, 7 reports, 8 triggers, 9 rankings. Grouped: Team → `items.slice(1, 5)`; Operations → `[items[5], items[8]]`; Insights → `[items[6], items[7], items[9]]`.
  - QA Manager flat (after Plan A): insert after `qamanager-calls` (index 4): `qamanager-customers` → `/qa/qa-manager/customers`, label `sidebar.qamanager.customers`, namespace `qa.customers`. New indices: 0 dashboard, 1 supervisors, 2 teams, 3 agents, 4 calls, **5 customers**, 6 disputes, 7 triggers, 8 rankings, 9 campaigns, 10 analytics, 11 reports. Grouped: Organization `slice(1, 4)`; Operations `[items[4], items[5], items[6], items[9]]`; Configuration `[items[7], items[8]]`; Insights `[items[10], items[11]]`.
- [ ] **`common.json`** en: `sidebar.supervisor.customers: "Customers"`, `sidebar.qamanager.customers: "Customers"`; es: `"Clientes"` ×2.
- [ ] **Call detail link** — `src/views/Campaigns/types.ts` `CallEvaluationDetail`: add `customerId: string;` after `customerName`. `constants.ts` `mockCallEvaluationDetail`: add `customerId: 'CUST-001',`. `pages/ConversationEvaluations.tsx` subtitle: render `call.customerName` as `<Anchor size='sm' onClick={() => navigate(`/qa/supervisor/customers/${call.customerId}`)}>{call.customerName}</Anchor>` inside the existing metadata line (`{call.fileName} · {call.agentName} · <customer link> · {call.date} …`).
- [ ] **Deletions** — remove `export { default as CustomerProfilePage } from './CustomerProfilePage';` from `src/modules/qa/dashboard/pages/index.ts`; `grep -rn "dashboard/pages/CustomerProfilePage\|CustomerProfilePage" src/` → only the new module + routes; delete `src/modules/qa/dashboard/pages/CustomerProfilePage.tsx`.
- [ ] `npm run typecheck` → 0 errors in `src/modules/qa/customers/**`, `src/stores/qa/customersStore.ts`, `src/routes.tsx`, `src/components/Sidebar/**`, `src/views/Campaigns/**`.

---

## B · Task 8 — Verification & commit

- [ ] Sidebar: Supervisor shows **Customers** under "Your Team" after Calls; QA Manager shows it under Operations after Calls.
- [ ] `/qa/supervisor/customers`: only customers contacted by Team 1 agents (≈18 rows; CUST-008, 011, 012, 014, 015, 019 etc. contacted solely by Team 2/3 are hidden); `/qa/qa-manager/customers`: 24 rows. KPI strip counts match; filters work (receptiveness `resistant` → CUST-003, 006, 015, 017, 024…; DNC only → CUST-006, CUST-021); row click → profile.
- [ ] `/qa/supervisor/customers/CUST-001` (Mr. Doe): header receptiveness gauge, churn badge, best window `Tue afternoon`, next-best-action alert; Overview trend **Improving**; contact windows tiles (best has ✓ counts, worst has ✕ counts); Contacts tab first answered row opens `/qa/campaigns/1/calls/call-001` and the row expands with the summary; Offers tab shows a mix of accepted/rejected with reasons and at least one competitor badge; Surveys tab shows NPS/CSAT cards; Timeline shows contacts/offers/surveys/notes with type chips.
- [ ] `/qa/qa-manager/customers/CUST-003` (Roberto Peña): churn **High**, trend **Declining**, resistant.
- [ ] Actions: Schedule follow-up → appears in Overview follow-ups + timeline + agent inbox notification; Mark done flips the badge; Add note (header button jumps to Timeline tab with the textarea focused) → note listed + timeline event; Flag Do-Not-Call → confirm modal → red DNC badge in header and row stripe in the table, follow-up button disabled; unflag restores.
- [ ] Legacy `/qa/profiles/customer/CUST-002` redirects to `/qa/supervisor/customers/CUST-002`.
- [ ] Call detail `/qa/campaigns/1/calls/call-001`: "Mr. Doe" is a link to `/qa/supervisor/customers/CUST-001`.
- [ ] Dark mode + tablet width checks as in Plan A; `read_console_messages onlyErrors` → none.
- [ ] Commit (if allowed): branch `feature/customers-customer-profile`, message `feat(customers): add Customers list and Customer Profile for supervisor and QA manager` + Co-Authored-By trailer.

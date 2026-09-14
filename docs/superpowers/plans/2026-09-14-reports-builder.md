# Plan 5 — Reports: builder, preview, export and schedules

> Split from the five-plan master (2026-09-14). Execute after Plans 1-4.

---

## Context

The QA platform evaluates every call on four aspects — **Quality Assurance, Compliance, Sentiment & Emotion, Business
Insights** — and already ships (verified 2026-09-14 against `git log` and the tree): role dashboards
(`New*Dashboard.tsx`), Triggers (rules, badges, templates), Your Team + Agent Profile, Customers, LMS, Coaching, Team
Analytics (`/qa/<role>/analytics`, wired to `TEAM_CALLS`), an Agent Inbox table, the Team Rankings agent page, and a
call-detail page with the four evaluation panels. The user (Product Designer, stakeholder mockups — see `DESIGN_ROLE.md`)
asked for five things:

1. **Dashboards** — add a Business Insights widget to all four role dashboards and fix grid alignment / whitespace.
2. **Inbox** — clicking a notification must open a detail that fits its type; sidebar unread counters for Agent,
   Supervisor and QA Manager (like the Disputes counter).
3. **Disputes** — agent opens a dispute from a call (evaluation type + comment); dispute page mirrors the call detail
   (player, transcript, evaluation panels) plus the agent's statement; QA Manager accepts (marks the wrong sub-items,
   score recalculates) or rejects; statuses **open / accepted / rejected**; supervisor read-only.
4. **Team Rankings** — supervisors / QA managers configure a ranking (name, period, evaluation type, target score,
   prize, milestone badges); the agent leaderboard follows that configuration end to end.
5. **Reports** — supervisors / QA managers build reports for **internal** staff or for a **client**, preview on screen,
   export PDF / CSV / XLSX (mock) and schedule recurring delivery.

### What already exists (verified 2026-09-14) — reuse, do not duplicate

| Area            | Thing                                                                                                                                                                 | Where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | State                                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dashboards      | Routed pages                                                                                                                                                          | `src/modules/qa/dashboard/pages/New{Agent,Supervisor,QAManager,OperationManager}Dashboard.tsx`                                                                                                                                                                                                                                                                                                                                                                                        | `Stack` + `SimpleGrid`; wrapper `<div style={{opacity}}>` around every card; bare `<Tabs>` in the right column of Supervisor/QA Manager/OM; `<div>` around `AutoFailsCard`; OM has no evaluation filter                  |
| Dashboards      | Evaluation cards                                                                                                                                                      | `components/{QualityAssuranceCard,ComplianceCard,SentimentEmotionCard,AutoFailsCard}.tsx`                                                                                                                                                                                                                                                                                                                                                                                             | all `Card h='100%'` except non-compact AutoFails                                                                                                                                                                         |
| Dashboards      | BI data                                                                                                                                                               | `mockData.ts:27-56` `WeeklyMetrics.businessInsights: BusinessInsight[]` (4 signals) present for all four roles                                                                                                                                                                                                                                                                                                                                                                        | **never rendered**                                                                                                                                                                                                       |
| Dashboards      | Segmented filter                                                                                                                                                      | `AppSegmentedControl` values `all\|qa\|sentiment\|compliance\|business`                                                                                                                                                                                                                                                                                                                                                                                                               | `'business'` dims everything                                                                                                                                                                                             |
| Dashboards      | `SectionCard`                                                                                                                                                         | `src/components/SectionCard/SectionCard.tsx` + `.module.css`                                                                                                                                                                                                                                                                                                                                                                                                                          | root is `display:flex; flex-direction:column` but has **no height:100% / flex:1** → cards in a 2-col grid never match heights                                                                                            |
| Inbox           | One page for 4 roles                                                                                                                                                  | `src/modules/qa/dashboard/pages/InboxPage.tsx` (routes `agent/inbox` :909, `supervisor/inbox` :980, `qa-manager/inbox` :991, `operation-manager/inbox` :1256)                                                                                                                                                                                                                                                                                                                         | hard-coded English; row click only marks read (`// TODO` at :108)                                                                                                                                                        |
| Inbox           | Model / store                                                                                                                                                         | `src/models/qa/notifications.ts` `AgentNotification`; `src/stores/qa/notificationStore.ts`                                                                                                                                                                                                                                                                                                                                                                                            | 5 categories; no payload; no recipient role; no `addReply`                                                                                                                                                               |
| Inbox           | Table + filters                                                                                                                                                       | `src/modules/qa/agent/inbox/{AgentInboxTable,InboxFilters}.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                       | hard-coded English                                                                                                                                                                                                       |
| Inbox           | Writers                                                                                                                                                               | `coachingStore.ts:87`, `lmsStore.ts:77`, `customersStore.ts:34`, `teamStore.ts:30-35` (`notify` helper)                                                                                                                                                                                                                                                                                                                                                                               | all emit `DIRECT_MESSAGE`                                                                                                                                                                                                |
| Sidebar         | Counter pattern                                                                                                                                                       | `src/components/Sidebar/Sidebar.tsx:92-93` `badge?: 'disputes'`; `:1069-1075` `useDisputesQuery({limit:1})`; `:1138-1142` `<Badge>`                                                                                                                                                                                                                                                                                                                                                   | badge flag is set on **no** `roleNavigation.tsx` item → unreachable; counts all statuses                                                                                                                                 |
| Disputes        | Role routes                                                                                                                                                           | `agent/disputes` :958, `supervisor/disputes` :1466, `qamanager/disputes` :1477 → `<DisputesManagement />` with no props                                                                                                                                                                                                                                                                                                                                                               | **empty shell**; sidebar QA-manager link is `/qa/qa-manager/disputes` (no route)                                                                                                                                         |
| Disputes        | Legacy pages                                                                                                                                                          | `/qa/disputes`, `/qa/disputes/:disputeId` → `DisputesListPage` / `DisputeDetailPage` (TanStack, `EvaluationDisputeSummary`, 10 mock rows)                                                                                                                                                                                                                                                                                                                                             | keep untouched (super-admin flow)                                                                                                                                                                                        |
| Disputes        | Creation today                                                                                                                                                        | only `ManualEvaluationPage` → `DisputeDrawer` (per-question edits)                                                                                                                                                                                                                                                                                                                                                                                                                    | not the campaigns call detail                                                                                                                                                                                            |
| Call detail     | Page + panels                                                                                                                                                         | `src/views/Campaigns/pages/ConversationEvaluations.tsx`; panels `src/views/Campaigns/components/call-evaluation/{QAEvaluationPanel,SentimentEmotionPanel,CompliancePanel,BusinessInsightsPanel}.tsx` (props `{qa}`, `{sentiment}`, `{compliance}`, `{business}`); `mockCallEvaluationDetail`, `CALL_EVALUATION_TABS`, `QA_ERROR_TYPES`, `SENTIMENT_CATEGORIES`, `COMPLIANCE_AREAS`, `BUSINESS_SIGNALS` in `src/views/Campaigns/constants.ts`; types in `src/views/Campaigns/types.ts` | player + transcript are inline JSX in the page (not extracted)                                                                                                                                                           |
| Demo primitives | `MockAudioPlayerBar { durationSeconds }`, `DemoTranscript { turns: DemoTranscriptTurn[] }` (`role`, not `speaker`), `FinalScoreHero { score, pass, evaluationType? }` | `src/modules/evaluations-demo/components/*`                                                                                                                                                                                                                                                                                                                                                                                                                                           | reusable                                                                                                                                                                                                                 |
| Rankings        | Agent page                                                                                                                                                            | `src/modules/qa/agent/rankings/TeamRankingsPage.tsx` + `components/{LeaderboardHeader,ExpandedRankingsTable,RankingCardGrid,RankingDetailDrawer,WinnerBadge,ReactionButtons}` + `hooks/{useLeaderboardMetadata,useUserReaction}`                                                                                                                                                                                                                                                      | reads `currentLeaderboard`, `AGENT_RANKINGS` (120 fake `agent-NNN` rows), `userReactions` from `dashboard/mockData.ts:154-172, 2907-2927`; `ExpandedRankingsTable`/`RankingCardGrid` accept `data?: AgentRankingEntry[]` |
| Rankings        | Manager side                                                                                                                                                          | none routed; `supervisor/configuration/RankingsConfigPanel.tsx` orphaned; sidebar `supervisor-rankings` / `qamanager-rankings` → `/qa/agent/rankings`; dashboards link to non-existent `/qa/supervisor/rankings`, `/qa/qamanager/rankings`                                                                                                                                                                                                                                            | build new                                                                                                                                                                                                                |
| Badges          | Triggers badges                                                                                                                                                       | `src/models/qa/triggerRules.ts:202-231` `BadgeDefinition { id,name,description,icon,color,area,tier,…,holders: BadgeHolder[] }`; store `src/stores/qa/triggerRulesStore.ts` (`addBadge/updateBadge/setBadgeStatus`, **no `awardBadge`**); UI `triggers/components/{BadgesTab,BadgeCard,BadgeDetailDrawer,BadgeEditorDrawer}`                                                                                                                                                          | holders never grow                                                                                                                                                                                                       |
| Badges          | Static catalog                                                                                                                                                        | `src/models/qa/badges.ts` `PREDEFINED_BADGE_CATALOGS` (6) — used by `AgentRankingEntry.achievements` + `AchievementsTab`                                                                                                                                                                                                                                                                                                                                                              | superseded by Triggers badges in Plan 4                                                                                                                                                                                  |
| Reports         | Role pages                                                                                                                                                            | `/qa/supervisor/reports` (:1047) and `/qa/qa-manager/reports` (:1245) → `src/modules/qa/{supervisor,qamanager}/pages/ReportsPage.tsx`                                                                                                                                                                                                                                                                                                                                                 | placeholders                                                                                                                                                                                                             |
| Reports         | Legacy                                                                                                                                                                | `/qa/reporting` → `dashboard/pages/ReportingPage.tsx` + `components/ReportBuilder.tsx` (`alert()`, hard-coded)                                                                                                                                                                                                                                                                                                                                                                        | delete / redirect                                                                                                                                                                                                        |
| Reports         | Export helper                                                                                                                                                         | `src/utils/fileUtils.ts` `downloadBlob(blob, filename)`; **no** xlsx/jspdf packages                                                                                                                                                                                                                                                                                                                                                                                                   | CSV is real, PDF = print view                                                                                                                                                                                            |
| Analytics       | Reusable maths                                                                                                                                                        | `src/modules/qa/analytics/helpers.ts`: `filterCalls`, `previousPeriod`, `shiftFilters`, `computeKpis`, `buildSegments`, `aggregateMetric`, `aggregateBusiness`, `comparison`, `isImprovement`, `formatMetric`, `scopeAgents`, `burnoutCandidates`; `constants.ts`: `VIEW_METRICS`, `PRIMARY_METRIC`, `DEFAULT_FILTERS`; `mockData.ts`: `TEAM_CALLS`                                                                                                                                   | reuse for rankings + reports                                                                                                                                                                                             |
| Metrics         | Catalogue                                                                                                                                                             | `src/modules/qa/triggers/constants.ts` `TRIGGER_METRIC_CATALOG`, `METRIC_BY_ID` (`unit`, `higherIsBetter`); `triggers/helpers.ts` `formatMetricValue`                                                                                                                                                                                                                                                                                                                                 | vocabulary for every metric select                                                                                                                                                                                       |
| Roster          | `TEAM_AGENTS`, `TEAM_SUPERVISORS`, `TEAM_CAMPAIGNS`, `TEAM_PROFILES`, `SUPERVISOR_PERSONA`, `QA_MANAGER_PERSONA`, `NOW_ISO`                                           | `src/modules/qa/team/{mockData,constants}.ts`; `roleFromPath` in `team/helpers.ts`                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                          |
| Preview role    | `useRoleMockStore().previewRole: 'agent'\|'supervisor'\|'qaManager'\|'operationManager'\|'superAdmin'\|null`                                                          | `src/stores/roleMockStore.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                         | use to show agent-only controls on shared pages                                                                                                                                                                          |

### Decisions taken with the user (2026-09-14)

1. **Dashboards**: Business Insights **replaces Auto-Fails as the 4th Performance Score card**; Auto-fails becomes a
   row inside the QA card. The four cards = the four evaluation aspects, matching call detail tabs, Analytics views and
   Triggers areas. Same for all four dashboards (Operation Manager gets the evaluation filter too).
2. **Rankings**: **only one active (or scheduled-overlapping) ranking per team**. Creating another forces ending the
   current one. Scores come from the real roster + `TEAM_CALLS` (no more 120 fake agents).
3. **Disputes — accept**: the QA Manager **marks the erroneous sub-items** of the disputed evaluation; the score
   **recalculates automatically** (rules per aspect in Plan 3). Reject requires a comment.
4. **Disputes — supervisor**: **read-only** view of their team's disputes (no approve / reject).
5. **Reports**: on-screen preview + PDF (print view) + CSV (real download) + XLSX (mock record) + scheduled recurring
   delivery (mock). Audience toggle **internal / client** built in.
6. Not asked, decided here (redirectable): inbox detail is an **`AppDrawer`**, not a page; counters count **unread**
   (inbox) and **open** (disputes) for the role's own scope; badges for rankings come from the **Triggers badge
   store** (managers already author them there), and Plan 4 adds the missing `awardBadge`; reports live at the
   existing `/qa/<role>/reports` routes and `/qa/reporting` redirects.

### Execution order and why

1 Dashboards (independent; adds `SectionCard fullHeight/dimmed` everyone uses) → 2 Inbox (defines notification
`payload` kinds + counters that 3 and 4 emit) → 3 Disputes (emits `DISPUTE_UPDATE`) → 4 Rankings (emits
`RANKING_UPDATE`, `BADGE_EARNED`; re-points the dashboard rankings widgets rewritten in 1) → 5 Reports (reads calls,
coaching, LMS, disputes, rankings stores).

---

## Shared conventions (apply to all five plans)

- **Roster & personas** (`src/modules/qa/team/mockData.ts` + `constants.ts`): Supervisor **Maria García** `SUP-001`
  (Team 1: AGT-001 Sarah Johnson, AGT-002 Mike Chen, AGT-003 Jessica Martinez, **AGT-004 John Smith** = agent persona,
  AGT-005 Emma Davis, AGT-006 David Brown (burnout HIGH), AGT-007 Lisa Wong); Juan Pérez `SUP-002` (Team 2,
  AGT-008…014); Laura Gómez `SUP-003` (Team 3, AGT-015…021); QA Manager **Elena Ruiz** `QAM-001`. Campaigns `camp-001`
  Q3 Customer Service · `camp-002` Sales Training · `camp-003` Q4 Compliance · `camp-004` Tech Support. Clock:
  `NOW_ISO = '2026-09-12T15:00:00Z'` and `TODAY` from `~/modules/qa/team/constants` / `~/modules/qa/analytics/constants`.
- **Role from path**: `roleFromPath(pathname)` (`~/modules/qa/team/helpers`) → `'supervisor' | 'qa-manager'`.
  Supervisor scope = `scopeAgents('supervisor')` (Team 1); QA Manager = everyone. Agent persona id `AGENT_PERSONA_ID =
'AGT-004'` — add this constant to `src/modules/qa/team/constants.ts` in Plan 2 Task 1 and import it everywhere.
- **Page shell**: `ContentContainer contentWidth='full'` → `Stack gap='lg'` → header (`eyebrow` Text uppercase dimmed
  · `Title order={1}` · description) → KPI strip `SimpleGrid cols={{ base: 2, md: 4 }}` of `StatCard`
  (`~/components/StatCard`, props `title, value, subtitle?, color?, icon?, badge?, variant?`) → Mantine `Tabs` with
  `Badge` counters, `keepMounted={false}`, tab persisted in `?tab=` (copy `AgentProfilePage.tsx:37-45`).
- **Primitives**: `SectionCard` (`~/components/SectionCard`; `title, description, icon, headerActions, footer,
padding, headerAccent`, + `fullHeight`, `dimmed` after Plan 1), `AppDrawer` (`~/components/AppDrawer`; `opened,
onClose, title, description, icon, iconColor, size, headerActions`) — never Mantine `Drawer`; `BaseTable` (default
  export `~/components/BaseTable/BaseTable`, `BaseTableColumnDef<T>`; `data, columns, getRowId, initialSort,
onRowClick, density='compact', emptyMessage, enablePagination, pageSize, getRowClassName`); `EmptyState`
  (`~/components/EmptyState`, `icon?, message, description?, action?`); toasts `notifySuccess/notifyWarning` from
  `~/modules/qa/utils/notifications`. Columns via `createColumnHelper<T>()` cast `as BaseTableColumnDef<T>`.
- **Charts**: `@mantine/charts` (`Sparkline`, `BarChart`, `AreaChart`, `DonutChart`). Dates: `dayjs`.
- **Stores**: plain `create()` Zustand stores in `src/stores/qa/`, seeded from a mock module, id counters
  `let counter = N; const nextId = (p: string) => \`${p}-${++counter}\``. **Never build a new array inside a selector**
— select the slice, derive with `useMemo`. Cross-store writes use `useX.getState()`.
- **Notifications**: push with `useNotificationStore.getState().addNotification({...})` using the full
  `AgentNotification` shape (copy `notify()` from `teamStore.ts:30-35`) and, from Plan 2 on, a typed `payload` and
  `recipientRole`.
- **i18n**: one namespace per section, `src/locales/{en,es}/<ns>.json` (auto-discovered), route ids registered in
  `src/modules/qa/qaNamespaces.ts`, sidebar labels in `src/locales/{en,es}/common.json` under `sidebar.<role>.*`
  (the Sidebar translates with the **common** namespace). Never hard-code UI strings in new code. **The plan gives the
  English JSON; write the Spanish file with identical keys and translated values.** After each plan run
  `node -e "..."` key-parity check (see Verification).
- **Styling**: Mantine tokens only, `light-dark()` for manual colours, CSS Modules; **no inline `style={{}}`** (the
  pre-commit hook rejects them; if unavoidable add `// inline-style-allow: <reason>` on the line above). Surfaces use
  `var(--mantine-color-body)` and `var(--mantine-color-default-border)` so light and dark both work. Every new
  component must be checked in both themes.
- **Mantine gotchas**: `Grid` uses `gutter`, but prefer `SimpleGrid`; `Badge` uppercases (use `tt='none'` for
  sentence-case labels) and ellipsises when squeezed (give badge columns a fixed width class); `Menu.Item` renders a
  `<button>` — pass `component='div'` if it contains a button; `Progress` has no `label` prop.
- **Pre-existing typecheck errors**: none expected (`npx tsc --noEmit -p .` was clean on 2026-09-14). Keep it clean.

## Global constraints

- Mock only: no API calls, no persistence, no backend; state lives in Zustand for the session.
- Do only what each task says; no extra polish, no refactors of untouched pages.
- Keep roster names, routes and namespaces; do not reintroduce old demo names (Carlos López, `agent-001`, etc.).
- Legacy super-admin flows (`/qa/disputes*`, `/qa/evaluations*`, `/qa/reporting` redirect target) must keep compiling.

---

---

# PLAN 5 — Reports: builder, on-screen preview, export (PDF / CSV / XLSX) and schedules

Depends on Plans 1–4 (reads `TEAM_CALLS` via the analytics helpers, plus coaching, LMS, disputes and rankings stores).

## Goal

A `ReportsPage` at `/qa/supervisor/reports` (Team 1) and `/qa/qa-manager/reports` (all teams) where a manager composes
a report — **audience** (internal staff or a client), period + comparison, scope, group-by, ordered **sections**,
metrics — sees it rendered as a document on screen, generates it (CSV = real download via `downloadBlob`; PDF = print
view of the preview; XLSX = mock record), saves it as a reusable definition, and schedules recurring delivery to
recipients (mock). Client reports hide internal-only sections and anonymise agents.

## Architecture

```
src/models/qa/reportBuilder.ts                    ← NEW (legacy reportTemplates.ts untouched)
src/stores/qa/reportsStore.ts                     ← NEW
src/modules/qa/reports/
  constants.ts   helpers.ts   mockData.ts   buildReportData.ts   exportCsv.ts
  ReportsPage/ReportsPage.tsx  index.ts  ReportsKpiStrip.tsx  ReportsPage.module.css  print.module.css
  tabs/BuilderTab.tsx  SavedTab.tsx  GeneratedTab.tsx  SchedulesTab.tsx
  components/
    composer/ReportComposer.tsx  AudienceStep.tsx  PeriodScopeStep.tsx  SectionsStep.tsx  OutputStep.tsx
    preview/ReportPreview.tsx  ReportCover.tsx  ReportSection.tsx  KpiTiles.tsx  SectionTable.tsx  SectionChart.tsx
    GenerateMenu.tsx  SaveDefinitionModal.tsx  ScheduleEditor.tsx
src/routes.tsx                                    ← role routes → ReportsPage; /qa/reporting → redirect
src/modules/qa/{supervisor,qamanager}/pages/ReportsPage.tsx ← DELETE (placeholders)
src/modules/qa/dashboard/pages/ReportingPage.tsx + components/ReportBuilder.tsx ← DELETE
src/locales/{en,es}/qa.reports.json               ← NEW namespace
src/modules/qa/qaNamespaces.ts                    ← qa.supervisor.reports, qa.qa-manager.reports → ['qa.reports','qa.teamAnalytics','qa.team','qa.coaching','qa.lms','qa.disputes','qa.rankings']
```

## Spec

### 1. Model (`src/models/qa/reportBuilder.ts`)

```ts
import type { TriggerMetricId } from './triggerRules';
import type {
	GroupByDimension,
	QuickRange,
} from '~/modules/qa/analytics/types';

export type ReportAudience = 'internal' | 'client';
export type ReportSectionKey =
	| 'overview'
	| 'qa'
	| 'compliance'
	| 'sentiment'
	| 'business'
	| 'campaigns'
	| 'agents'
	| 'coaching'
	| 'disputes'
	| 'burnout'
	| 'rankings';
export type ReportFormat = 'PDF' | 'CSV' | 'XLSX';
export type ReportFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type ReportGroupBy = Extract<
	GroupByDimension,
	'none' | 'team' | 'supervisor' | 'agent' | 'campaign' | 'lineOfBusiness'
>;

export interface ReportSchedule {
	enabled: boolean;
	frequency: ReportFrequency;
	dayOfWeek: number;
	time: string;
	recipients: string[];
	nextRunAt: string;
}

export interface ReportDefinition {
	id: string; // RPT-001
	name: string;
	description: string;
	audience: ReportAudience;
	clientName: string | null; // client audience
	showAgentNames: boolean; // client audience: false → "Agent 01…"
	period: {
		preset: QuickRange;
		from: string;
		to: string;
		compareWithPrevious: boolean;
	};
	scope: {
		teams: string[];
		supervisorIds: string[];
		agentIds: string[];
		campaignIds: string[];
		linesOfBusiness: string[];
	};
	groupBy: ReportGroupBy;
	sections: ReportSectionKey[]; // ordered
	metrics: TriggerMetricId[]; // columns of the section tables (empty = section defaults)
	formats: ReportFormat[];
	schedule: ReportSchedule | null;
	builtIn: boolean;
	createdBy: string;
	createdByRole: 'SUPERVISOR' | 'QA_MANAGER';
	createdAt: string;
	updatedAt: string;
	lastGeneratedAt: string | null;
}

export interface GeneratedReportRecord {
	id: string; // GEN-001
	definitionId: string;
	definitionName: string;
	audience: ReportAudience;
	format: ReportFormat;
	generatedAt: string;
	trigger: 'MANUAL' | 'SCHEDULED';
	sizeKb: number;
	status: 'READY' | 'SENT';
	recipients: string[];
	/** CSV text kept in memory so the row can be re-downloaded (CSV only). */
	csv?: string;
}
```

### 2. Constants (`reports/constants.ts`)

```ts
export const SECTION_ORDER: ReportSectionKey[] = ['overview','qa','compliance','sentiment','business','campaigns','agents','coaching','disputes','burnout','rankings'];
/** Client reports may only include these. */
export const CLIENT_SECTIONS: ReportSectionKey[] = ['overview','qa','compliance','sentiment','business','campaigns'];
export const SECTION_METRICS: Record<ReportSectionKey, TriggerMetricId[]> = {
	overview: ['QA_OVERALL_SCORE','COMPLIANCE_OVERALL_SCORE','CUSTOMER_SENTIMENT_SCORE','CONVERSION_RATE'],
	qa: VIEW_METRICS.qa, compliance: VIEW_METRICS.compliance, sentiment: VIEW_METRICS.sentiment, business: ['CONVERSION_RATE', ...VIEW_METRICS.business],
	campaigns: ['QA_OVERALL_SCORE','COMPLIANCE_OVERALL_SCORE','CUSTOMER_SENTIMENT_SCORE','CONVERSION_RATE'],
	agents: ['QA_OVERALL_SCORE','COMPLIANCE_OVERALL_SCORE','CUSTOMER_SENTIMENT_SCORE','CONVERSION_RATE'],
	coaching: [], disputes: [], burnout: [], rankings: [],
};
export const SECTION_ICON: Record<ReportSectionKey, TablerIcon> = { overview: IconLayoutDashboard, qa: IconClipboardList, compliance: IconShieldCheck, sentiment: IconMoodSmile, business: IconTrendingUp, campaigns: IconSpeakerphone, agents: IconUsers, coaching: IconTargetArrow, disputes: IconFolders, burnout: IconFlame, rankings: IconTrophy };
export const FORMATS: ReportFormat[] = ['PDF', 'CSV', 'XLSX'];
export const FREQUENCIES: ReportFrequency[] = ['WEEKLY', 'BIWEEKLY', 'MONTHLY'];
export const REPORT_TABS = ['builder', 'saved', 'generated', 'schedules'] as const;
export const DEFAULT_DEFINITION = (role): Omit<ReportDefinition, 'id'|'createdAt'|'updatedAt'|'lastGeneratedAt'> => ({
	name: '', description: '', audience: 'internal', clientName: null, showAgentNames: true,
	period: { preset: '30d', from: addDays(TODAY, -29), to: TODAY, compareWithPrevious: true },
	scope: { teams: role === 'supervisor' ? ['Team 1'] : [], supervisorIds: [], agentIds: [], campaignIds: [], linesOfBusiness: [] },
	groupBy: 'agent', sections: ['overview','qa','compliance','sentiment','business'], metrics: [], formats: ['PDF'],
	schedule: null, builtIn: false, createdBy: …, createdByRole: …,
});
```

### 3. Data (`reports/buildReportData.ts`)

```ts
export interface ReportData {
	definition: ReportDefinition;
	role: TeamRole;
	generatedAt: string;
	kpis: { current: TeamKpis; previous: TeamKpis };
	sections: ReportSectionData[];
}
export type ReportSectionData =
	| {
			key: 'overview';
			kpis: TeamKpis;
			previous: TeamKpis;
			trend: ComparisonSeriesPoint[];
	  }
	| {
			key: 'qa' | 'compliance' | 'sentiment' | 'business';
			metricIds: TriggerMetricId[];
			rows: SegmentRow[];
			primary: TriggerMetricId;
			series: ComparisonSeriesPoint[];
	  }
	| {
			key: 'campaigns' | 'agents';
			metricIds: TriggerMetricId[];
			rows: SegmentRow[];
	  }
	| {
			key: 'coaching';
			sessions: number;
			completed: number;
			overdue: number;
			byAgent: {
				agentName: string;
				sessions: number;
				assignments: number;
				completed: number;
			}[];
	  }
	| {
			key: 'disputes';
			open: number;
			accepted: number;
			rejected: number;
			acceptanceRate: number | null;
			rows: DisputeCase[];
	  }
	| {
			key: 'burnout';
			candidates: {
				agentName: string;
				level: string;
				percentage: number;
				breached: number;
			}[];
	  }
	| {
			key: 'rankings';
			programs: {
				name: string;
				status: string;
				leader: string | null;
				winner: string | null;
				period: string;
			}[];
	  };

export function toAnalyticsFilters(def: ReportDefinition): TeamAnalyticsFilters;
// { ...DEFAULT_FILTERS, from, to, quickRange: preset, compareWithPrevious, supervisorIds, agentIds, campaignIds, linesOfBusiness }
// teams → supervisorIds via TEAM_SUPERVISORS (team → id) when supervisorIds is empty
export function buildReportData(
	def: ReportDefinition,
	role: TeamRole,
	stores: {
		cases: DisputeCase[];
		programs: RankingProgram[];
		sessions: CoachingSessionRecord[];
		assignments: LmsAssignment[];
	}
): ReportData;
// filters = toAnalyticsFilters(def); calls = filterCalls(TEAM_CALLS, filters, role); previousCalls = filterCalls(TEAM_CALLS, shiftFilters(filters, previousPeriod(filters)), role)
// overview: computeKpis ×2 + alignedComparisonSeries(calls, previousCalls, 'QA_OVERALL_SCORE', filters)
// qa/compliance/sentiment/business: metricIds = def.metrics.filter(in SECTION_METRICS[key]) || SECTION_METRICS[key]; rows = buildSegments(calls, previousCalls, def.groupBy, metricIds, from, to, DEFAULT_FILTERS.minCalls); primary = metricIds[0]; series = alignedComparisonSeries(..., primary, filters)
// campaigns: buildSegments(..., 'campaign', ...); agents: buildSegments(..., 'agent', ...)
// coaching: sessions in period from coachingStore (date ∈ [from,to]) + lms assignments (assignedAt ∈ period) grouped by agent
// disputes: casesForRole(cases, role) with createdAt ∈ period
// burnout: burnoutCandidates(role) + computeBurnoutDrivers(agentId, scopedCalls, teamCalls) → breached count (both from analytics/helpers.ts; scopedCalls = TEAM_CALLS of the role's agents, as in TeamAnalyticsContext)
// rankings: programsForRole(programs, role) with period overlap; leader via computeStandings
// audience 'client': drop sections ∉ CLIENT_SECTIONS; when !showAgentNames replace agent labels with `Agent ${String(i+1).padStart(2,'0')}` (stable by sorted agentId)
```

### 4. Export (`reports/exportCsv.ts`)

`toCsv(data: ReportData): string` — one block per section: a `# <section title>` line, a header row, data rows;
metrics formatted with `formatMetric`; `\r\n` line endings; quote cells containing `,`/`"`/newlines. Download with
`downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), \`${slug(name)}-${from}-${to}.csv\`)`from`~/utils/fileUtils`. **PDF** = `window.print()`with`print.module.css` (`@media print`: hide everything but
`#report-preview`, white background, page margins, `break-inside: avoid`on sections). **XLSX** = record only (toast`generated.mockXlsx`).

### 5. Store (`src/stores/qa/reportsStore.ts`)

```ts
interface ReportsState {
	definitions: ReportDefinition[];
	generated: GeneratedReportRecord[];
	saveDefinition: (
		draft: Omit<
			ReportDefinition,
			'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedAt' | 'builtIn'
		>,
		id?: string
	) => ReportDefinition;
	deleteDefinition: (id: string) => void; // built-ins cannot be deleted
	duplicateDefinition: (id: string) => ReportDefinition;
	recordGeneration: (
		rec: Omit<GeneratedReportRecord, 'id' | 'generatedAt'>
	) => GeneratedReportRecord; // also sets lastGeneratedAt
	setSchedule: (id: string, schedule: ReportSchedule | null) => void;
	toggleSchedule: (id: string) => void;
	runScheduleNow: (id: string) => void; // records a SCHEDULED generation, advances nextRunAt
}
export const selectDefinitions = (s) => s.definitions;
export const selectGenerated = (s) => s.generated;
```

`nextRunAt` = next occurrence of `dayOfWeek`/`time` after `NOW_ISO` (weekly), +14 d (biweekly), same day next
month (monthly). Generation of a scheduled report also pushes a `DIRECT_MESSAGE` to the creator's inbox
(`icon 'file-text'`, title `Report sent · <name>`).

### 6. Seed (`reports/mockData.ts`)

Definitions (all `builtIn: true`):

| id      | name                                | audience                                                    | sections                                                                  | groupBy        | schedule                                             | createdBy                   |
| ------- | ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- | -------------- | ---------------------------------------------------- | --------------------------- |
| RPT-001 | Weekly Quality Report — Acme Retail | client (`clientName 'Acme Retail'`, `showAgentNames false`) | overview, qa, compliance, sentiment, business                             | campaign       | WEEKLY Mon 08:00 → `['ops@acmeretail.com']`          | Elena Ruiz                  |
| RPT-002 | Monthly Team Performance            | internal                                                    | overview, qa, compliance, sentiment, business, agents, coaching, rankings | agent          | MONTHLY day 1 09:00 → `['maria.garcia@company.com']` | Maria García (scope Team 1) |
| RPT-003 | Compliance Audit Pack               | client (`'Northwind Bank'`, names hidden)                   | overview, compliance, campaigns                                           | lineOfBusiness | null                                                 | Elena Ruiz                  |
| RPT-004 | Coaching & Wellbeing Review         | internal                                                    | overview, coaching, burnout, disputes                                     | supervisor     | BIWEEKLY Fri 16:00 → `['elena.ruiz@company.com']`    | Elena Ruiz                  |

Generated: 6 records over the last 30 days mixing MANUAL/SCHEDULED, formats, `sizeKb` 120–980, status READY/SENT.

### 7. `ReportsPage`

`role = roleFromPath`. Header (eyebrow role · title · description · `Button` `page.new` resets the builder). KPI
strip: saved definitions (role-scoped: supervisor sees own + Team-1-scoped built-ins) · generated this month ·
active schedules · last generated (relative). `Tabs` `?tab=` builder | saved | generated | schedules (counts).

**BuilderTab** — `SimpleGrid cols={{ base: 1, xl: 5 }}` where the composer spans 2 and the preview 3 (use
`Grid` with `span={{ base: 12, xl: 5 }}` / `{ base: 12, xl: 7 }` — `Grid` prop is `gutter`), both `SectionCard fullHeight`.

- `ReportComposer` — `Accordion multiple` default all open, four steps:
  1. `AudienceStep`: `SegmentedControl` internal/client (`audience.*`); when client: `TextInput` clientName (required),
     `Switch` showAgentNames (default off) with hint; `TextInput` name, `Textarea` description.
  2. `PeriodScopeStep`: preset `Chip.Group` 7d/30d/90d/custom (+ two `DateInput`s when custom), `Switch` compare;
     scope: teams `MultiSelect` (supervisor locked to Team 1), campaigns `MultiSelect` (`TEAM_CAMPAIGNS`), LOB
     `MultiSelect` (distinct `TEAM_CALLS.lineOfBusiness`), agents `MultiSelect` (scoped roster); `Select` groupBy.
  3. `SectionsStep`: list of `SECTION_ORDER` rows: `Checkbox` + icon + label + description; up/down `ActionIcon`s
     reorder the selected ones; rows ∉ `CLIENT_SECTIONS` are disabled with tooltip `sections.internalOnly` when
     audience = client (and removed from `sections`). `MultiSelect` metrics (labels from `qa.teamAnalytics`
     `metrics.*`, grouped by area) with hint `sections.metricsHint`.
  4. `OutputStep`: formats `Checkbox.Group` (PDF/CSV/XLSX), `ScheduleEditor` (`Switch` enabled → frequency
     `Select`, dayOfWeek `Select`, time `TimeInput` or `TextInput type='time'`, recipients `TagsInput` of emails).
     Footer `Group`: `Button variant='light'` `builder.save` (opens `SaveDefinitionModal` name confirm) · `GenerateMenu`
     (`Menu` with one item per selected format → `generateWith(format)`).
- `ReportPreview` (`id='report-preview'`, `Paper` white with `className={styles.paper}` — fixed A4-ish width
  `max-width: 880px`, `light-dark(white, var(--mantine-color-dark-6))` on screen, white in print):
  `ReportCover` (client logo placeholder circle with initials / company name for internal; report name; audience
  chip; period "from → to" + "vs previous" when compared; scope summary line; generated date; confidentiality
  footer `preview.confidential.<audience>`), then one `ReportSection` per `sections[]`:
  - overview → `KpiTiles` (4 tiles: value, delta arrow via `comparison`/`isImprovement`) + `SectionChart`
    (`AreaChart` current vs previous of QA).
  - qa/compliance/sentiment/business → `SectionChart` (`BarChart` of `rows` × `primary`, top 8) + `SectionTable`
    (`BaseTable`, columns: segment label · calls · one column per `metricIds` with `formatMetric` · change of
    `primary`).
  - campaigns/agents → `SectionTable` only.
  - coaching → 3 tiles + table by agent; disputes → 4 tiles + table (id, agent, type, status, before → after);
    burnout → table (agent, level badge, %, breached); rankings → table.
  - Empty section → `preview.noData`.
    Data via `useMemo(() => buildReportData(def, role, { cases, programs, sessions, assignments }), [def, …])`,
    debounced 300 ms (`useDebouncedValue` from `@mantine/hooks`).
- `generateWith(format)`: build `ReportData`; CSV → `toCsv` + `downloadBlob` + `recordGeneration({ …, csv })`;
  PDF → `recordGeneration` then `window.print()`; XLSX → `recordGeneration` + `notifySuccess(generated.mockXlsx)`.
  If the definition is unsaved, `recordGeneration` uses `definitionId: 'unsaved'` and the draft name.

**SavedTab** — `BaseTable`: name · audience badge · sections count · groupBy · schedule chip (frequency or "—") ·
last generated · actions (`Menu`: Load into builder (switches to builder tab with the definition), Duplicate,
Delete (disabled for built-ins)). Empty state.

**GeneratedTab** — `BaseTable` sorted by `generatedAt` desc: report · audience · format badge · generated · trigger
badge · size · status · action `ActionIcon` download (CSV → `downloadBlob(rec.csv)`; PDF → load definition into
builder + `window.print()`; XLSX → toast mock).

**SchedulesTab** — `BaseTable` of definitions with `schedule !== null`: name · audience · frequency · next run ·
recipients (`Badge` per email, +N) · `Switch` enabled (`toggleSchedule`) · `Button size='xs'` `schedules.runNow`
(`runScheduleNow` → Generated tab gets a SCHEDULED row, inbox gets "Report sent"). Empty state.

### 8. Routes & cleanup

- `routes.tsx`: `supervisor/reports` (:1047) and `qa-manager/reports` (:1245) → `<ReportsPage />` (lazy); replace
  the `/qa/reporting` element (:1281) with `<Navigate to='/qa/qa-manager/reports' replace />`.
- Delete `src/modules/qa/supervisor/pages/ReportsPage.tsx`, `src/modules/qa/qamanager/pages/ReportsPage.tsx`,
  `src/modules/qa/dashboard/pages/ReportingPage.tsx`, `src/modules/qa/dashboard/components/ReportBuilder.tsx`
  (+ its export in `components/index.ts`) after grepping that nothing else imports them. Remove the legacy
  `qa-reporting` sidebar item if it is in a role nav (it is in the flat `navItems` of `Sidebar.tsx` — point its
  `to` at `/qa/qa-manager/reports` and `i18nNamespace: 'qa.reports'`).
- `roleNavigation.tsx`: `supervisor-reports` / `qamanager-reports` `i18nNamespace: 'qa.reports'`.

### 9. i18n — `src/locales/en/qa.reports.json`

```json
{
	"page": {
		"eyebrow": {
			"supervisor": "Supervisor · Team 1",
			"qa-manager": "QA Manager · All teams"
		},
		"title": "Reports",
		"description": "Build reports for your team or for a client, preview them, export and schedule delivery",
		"new": "New report"
	},
	"kpis": {
		"saved": "Saved reports",
		"generatedMonth": "Generated this month",
		"schedules": "Active schedules",
		"lastGenerated": "Last generated",
		"never": "Never"
	},
	"tabs": {
		"builder": "Builder",
		"saved": "Saved reports",
		"generated": "Generated",
		"schedules": "Schedules"
	},
	"audience": {
		"label": "Audience",
		"internal": "Internal",
		"client": "Client",
		"clientName": "Client name",
		"showAgentNames": "Show agent names",
		"showAgentNamesHint": "Off: agents appear as Agent 01, Agent 02…",
		"name": "Report name",
		"description": "Description"
	},
	"steps": {
		"audience": "Audience & basics",
		"period": "Period & scope",
		"sections": "Sections & metrics",
		"output": "Output & delivery"
	},
	"period": {
		"label": "Period",
		"presets": {
			"7d": "7 days",
			"30d": "30 days",
			"90d": "90 days",
			"custom": "Custom"
		},
		"from": "From",
		"to": "To",
		"compare": "Compare with previous period"
	},
	"scope": {
		"teams": "Teams",
		"teamsLocked": "Supervisors report on their own team",
		"campaigns": "Campaigns",
		"linesOfBusiness": "Lines of business",
		"agents": "Agents",
		"groupBy": "Group rows by",
		"groupByOptions": {
			"none": "No grouping",
			"team": "Team",
			"supervisor": "Supervisor",
			"agent": "Agent",
			"campaign": "Campaign",
			"lineOfBusiness": "Line of business"
		}
	},
	"sections": {
		"label": "Sections",
		"metrics": "Metrics",
		"metricsHint": "Leave empty to use each section's defaults",
		"internalOnly": "Internal only — not available in client reports",
		"moveUp": "Move up",
		"moveDown": "Move down",
		"items": {
			"overview": {
				"label": "Executive overview",
				"description": "Four headline KPIs with period comparison and trend"
			},
			"qa": {
				"label": "Quality Assurance",
				"description": "QA score and COPC error types"
			},
			"compliance": {
				"label": "Compliance",
				"description": "Security, regulatory and legal scores"
			},
			"sentiment": {
				"label": "Sentiment & Emotion",
				"description": "Customer and agent sentiment, emotions, recoveries"
			},
			"business": {
				"label": "Business Insights",
				"description": "Conversion, objections, competitor mentions"
			},
			"campaigns": {
				"label": "By campaign",
				"description": "Headline metrics per campaign"
			},
			"agents": {
				"label": "By agent",
				"description": "Headline metrics per agent"
			},
			"coaching": {
				"label": "Coaching & learning",
				"description": "Sessions, assignments and completion"
			},
			"disputes": {
				"label": "Disputes",
				"description": "Opened, accepted, rejected and score corrections"
			},
			"burnout": {
				"label": "Burnout risk",
				"description": "Flagged agents and drivers"
			},
			"rankings": {
				"label": "Team rankings",
				"description": "Programs, leaders and winners"
			}
		}
	},
	"output": {
		"formats": "Formats",
		"schedule": "Schedule delivery",
		"enabled": "Send this report automatically",
		"frequency": "Frequency",
		"frequencies": {
			"WEEKLY": "Weekly",
			"BIWEEKLY": "Every two weeks",
			"MONTHLY": "Monthly"
		},
		"dayOfWeek": "Day",
		"time": "Time",
		"recipients": "Recipients",
		"recipientsPlaceholder": "Add an email and press Enter"
	},
	"builder": {
		"save": "Save report",
		"saveTitle": "Save report",
		"saveName": "Name",
		"saved": "Report saved",
		"generate": "Generate",
		"generateAs": "Generate as {{format}}",
		"validation": {
			"name": "Name is required",
			"client": "Client name is required",
			"sections": "Pick at least one section",
			"formats": "Pick at least one format"
		}
	},
	"preview": {
		"title": "Preview",
		"description": "This is what the recipient will receive",
		"generatedAt": "Generated {{date}}",
		"period": "{{from}} → {{to}}",
		"vsPrevious": "vs previous period",
		"scope": "Scope: {{scope}}",
		"allTeams": "All teams",
		"confidential": {
			"internal": "Internal — do not distribute outside the company",
			"client": "Prepared for {{client}} — confidential"
		},
		"noData": "No data for this section in the selected period",
		"columns": {
			"segment": "Segment",
			"calls": "Calls",
			"change": "Change",
			"agent": "Agent",
			"sessions": "Sessions",
			"assignments": "Assignments",
			"completed": "Completed",
			"id": "ID",
			"type": "Type",
			"status": "Status",
			"score": "Score",
			"level": "Level",
			"risk": "Risk",
			"breached": "Conditions met",
			"program": "Ranking",
			"leader": "Leader",
			"winner": "Winner",
			"periodCol": "Period"
		},
		"tiles": {
			"sessions": "Sessions",
			"completed": "Completed",
			"overdue": "Overdue",
			"open": "Open",
			"accepted": "Accepted",
			"rejected": "Rejected",
			"acceptanceRate": "Acceptance rate"
		}
	},
	"saved": {
		"columns": {
			"name": "Report",
			"audience": "Audience",
			"sections": "Sections",
			"groupBy": "Grouped by",
			"schedule": "Schedule",
			"lastGenerated": "Last generated"
		},
		"load": "Load into builder",
		"duplicate": "Duplicate",
		"delete": "Delete",
		"builtIn": "Built-in reports cannot be deleted",
		"empty": "No saved reports yet"
	},
	"generated": {
		"columns": {
			"report": "Report",
			"audience": "Audience",
			"format": "Format",
			"generatedAt": "Generated",
			"trigger": "Trigger",
			"size": "Size",
			"status": "Status"
		},
		"triggers": { "MANUAL": "Manual", "SCHEDULED": "Scheduled" },
		"statuses": { "READY": "Ready", "SENT": "Sent" },
		"download": "Download",
		"print": "Open print view",
		"mockXlsx": "XLSX generated (mock) — see the Generated tab",
		"csvReady": "CSV downloaded",
		"pdfReady": "Print dialog opened — save as PDF",
		"empty": "Nothing generated yet"
	},
	"schedules": {
		"columns": {
			"report": "Report",
			"audience": "Audience",
			"frequency": "Frequency",
			"nextRun": "Next run",
			"recipients": "Recipients",
			"enabled": "Enabled"
		},
		"runNow": "Run now",
		"ran": "Report generated and sent (mock)",
		"empty": "No scheduled reports"
	},
	"inbox": {
		"sent": "Report sent · {{name}}",
		"sentBody": "{{name}} was generated and sent to {{count}} recipient(s)."
	}
}
```

## Tasks

1. **Model + constants + helpers + data builder + CSV + store + seed** — §1–§6. Typecheck.
2. **Routes / namespace / i18n / cleanup** — §8, §9 (en + es), `qaNamespaces`. Typecheck.
3. **Page shell + Saved / Generated / Schedules tabs** — §7 (page, KPI strip, three tables, schedule editor).
   Typecheck.
4. **Builder tab** — composer (four steps) + preview (cover, sections, tiles, tables, charts) + generate menu + save
   modal + print CSS. Typecheck. Commit `feat(qa-reports): report builder with preview, export and schedules`.

## Verification

- `/qa/qa-manager/reports`: KPI strip 4 / n / 3 / relative; Saved lists RPT-001…004; loading RPT-001 shows a
  client cover "Prepared for Acme Retail", agents anonymised in tables, coaching/disputes/burnout/rankings rows
  disabled in Sections.
- Builder: switch to internal, add Coaching + Disputes + Rankings, group by supervisor → preview updates; Generate →
  CSV downloads a file whose first line is `# Executive overview`; Generate → PDF opens the print dialog with only
  the preview; XLSX adds a Generated row.
- `/qa/supervisor/reports`: Teams locked to Team 1; agents `MultiSelect` only lists Team 1; preview KPIs equal the
  supervisor Analytics KPIs for the same 30-day period (299 calls, QA 85 %).
- Schedules → "Run now" on RPT-002 → Generated gets a SCHEDULED row and `/qa/supervisor/inbox` gets "Report sent".
- Typecheck clean; `git grep -n "ReportBuilder\|ReportingPage"` returns nothing.

---

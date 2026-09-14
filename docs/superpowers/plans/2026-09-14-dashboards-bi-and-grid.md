# Plan 1 of 5 — Dashboards: Business Insights widget + grid alignment

> Part of the five chained plans approved 2026-09-14. Execute Plans 1 → 5 in order.

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

# PLAN 1 — Dashboards: Business Insights widget + grid alignment

## Goal

All four role dashboards render the same **Performance Score** row (QA · Compliance · Sentiment & Emotion · **Business
Insights**), share one grid contract (every row is a `SimpleGrid` whose children are `SectionCard fullHeight` — no
wrapper `<div>`s, no bare `Tabs`, no fixed-height card beside a content-height card without `fullHeight`), and the
evaluation-type filter dims cards through a prop instead of inline styles. Operation Manager gains the filter.

## Architecture

```
src/components/SectionCard/SectionCard.tsx            ← + fullHeight, dimmed props
src/components/SectionCard/SectionCard.module.css     ← .fullHeight, .dimmed
src/modules/qa/dashboard/
  mockData.ts                                         ← WeeklyMetrics.businessOutcome (+ seeds ×4)
  components/BusinessInsightsCard.tsx                 ← NEW (replaces AutoFailsCard in the row)
  components/QualityAssuranceCard.tsx                 ← + autoFails prop (extra breakdown row)
  components/index.ts                                 ← export BusinessInsightsCard
  components/DashboardEvaluationFilter.tsx            ← NEW shared segmented filter (i18n)
  pages/NewAgentDashboard.tsx                         ← rewritten layout
  pages/NewSupervisorDashboard.tsx                    ← rewritten layout
  pages/NewQAManagerDashboard.tsx                     ← rewritten layout
  pages/NewOperationManagerDashboard.tsx              ← rewritten layout + filter
src/locales/{en,es}/qa.dashboard.json                 ← + businessInsights.*, evaluationFilter.*, sections.*
```

## Spec

### 1. `SectionCard` props

```ts
/** Fills the grid cell so sibling cards in a SimpleGrid end at the same baseline. */
fullHeight?: boolean;
/** Filter-dimmed state (replaces the page-level opacity wrappers). */
dimmed?: boolean;
```

`cardClassName` adds `styles.fullHeight` / `styles.dimmed`. CSS (append to `SectionCard.module.css`):

```css
.fullHeight {
	height: 100%;
}
.fullHeight .sectionShell,
.fullHeight .sectionBody {
	flex: 1;
	min-height: 0;
}
.fullHeight .content {
	flex: 1;
	min-height: 0;
}
.dimmed {
	opacity: 0.5;
	transition: opacity 160ms ease;
}
```

### 2. Mock data

Append to `WeeklyMetrics` (`mockData.ts:39-56`):

```ts
businessOutcome: {
	conversionRate: number;
	offersPresented: number;
	converted: number;
}
```

Seeds (add the property to each existing constant):

| Constant                           | conversionRate | offersPresented | converted |
| ---------------------------------- | -------------- | --------------- | --------- |
| `AGENT_WEEKLY_METRICS`             | 24             | 38              | 9         |
| `SUPERVISOR_WEEKLY_METRICS`        | 26             | 158             | 41        |
| `QA_MANAGER_WEEKLY_METRICS`        | 25             | 446             | 112       |
| `OPERATION_MANAGER_WEEKLY_METRICS` | 23             | 1210            | 278       |

### 3. `BusinessInsightsCard`

```ts
interface BusinessInsightsCardProps {
	insights: BusinessInsight[]; // WeeklyMetrics.businessInsights
	outcome: WeeklyMetrics['businessOutcome'];
	subtitle?: string;
}
```

Layout mirrors `QualityAssuranceCard` (`Card h='100%' withBorder radius='md' p='lg'` + `Stack h='100%'`):
header row `Group justify='space-between'` → title `t('businessInsights.title')` with `IconTrendingUp` (blue) and a
`Badge variant='light' color='blue'` `t('businessInsights.period')`; big value `outcome.conversionRate%` with label
`t('businessInsights.conversionRate')` and sub-line `t('businessInsights.offers', { converted, offers })`; divider; 4
rows (one per `insights[]` entry, order as in data): `Text size='sm'` label = `t(\`businessInsights.signals.${key}\`)`where`key`maps`'Early Objection'→EARLY_OBJECTION`, `'Unhandled objection'→UNHANDLED_OBJECTION`,
`'Competitor plus cost'→COMPETITOR_PLUS_COST`, `'Mis-targeted offer'→MISTARGETED_OFFER`; right side `Group gap={6}`:
`Text fw={600}` `{percentage}%`+`ThemeIcon size='xs' variant='light'`with`IconTrendingUp`red when`trend==='up'`,
`IconTrendingDown`green when`'down'`, `IconMinus`gray when`'stable'`(all four signals are *bad*, so up = red).
Tooltip on the row with`insight.description`.

### 4. `QualityAssuranceCard.autoFails?: number`

Add an optional prop; when defined render one more breakdown row after ECUF using the **same row markup** the card
already uses for ECN/ENC/ECC/ECUF: label `t('businessInsights.autoFails')` (key lives in `qa.dashboard.json`), value =
count, badge color `red` when `> 0`, `gray` when 0. Pages pass `autoFails={autoFailsCount}`.

### 5. `DashboardEvaluationFilter`

```ts
export type DashboardEvaluationType =
	| 'all'
	| 'qa'
	| 'sentiment'
	| 'compliance'
	| 'business';
interface Props {
	value: DashboardEvaluationType;
	onChange: (v: DashboardEvaluationType) => void;
}
```

Renders `Text size='sm' fw={500}` `t('evaluationFilter.label')` + `AppSegmentedControl` with data from
`t('evaluationFilter.options.<key>')`. Export a helper
`export const isCardVisible = (filter, cardTypes: DashboardEvaluationType | DashboardEvaluationType[]) => boolean`
(same logic as today's `shouldShowCard`). Replace the local copies in the three pages; add to OM.

### 6. Grid contract (apply to all four pages)

```
ContentContainer contentWidth='full'
└ Stack gap='lg'
  ├ header (Title + Text)                                    ← unchanged copy
  ├ SectionCard 'Performance Score'
  │ └ SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'
  │   ├ QualityAssuranceCard autoFails=…    (dimmed unless filter ∈ {all, qa})
  │   ├ ComplianceCard                      (all, compliance)
  │   ├ SentimentEmotionCard                (all, sentiment)
  │   └ BusinessInsightsCard                (all, business)      ← NO wrapper <div>
  ├ DashboardEvaluationFilter
  └ rows: SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg' | full-width SectionCard
        every child = <SectionCard fullHeight dimmed={!isCardVisible(...)}>
```

Card dimming for the four evaluation cards: they are `Card`s, not `SectionCard`s — wrap **only these four** in
`<Box className={isCardVisible(...) ? undefined : styles.dimmedCard} h='100%'>` where `Dashboard.module.css` gets
`.dimmedCard { opacity: .5; transition: opacity 160ms ease; height: 100%; }` (the `Box` is the grid item and keeps
`h='100%'`, so the inner `Card h='100%'` stretches).

Per-page rows (keep existing data constants and widgets; only the wrappers change):

| Page       | Row | Left                                                                                                                                   | Right                                                                                                                                                                                                                                                                                                                 |
| ---------- | --- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent      | 3   | `InboxSummary` (already a `SectionCard` — pass `fullHeight` through: add `fullHeight?: boolean` prop to `InboxSummary` and forward it) | `SectionCard 'Burnout Assessment' fullHeight` → `BurnoutRiskWidget`                                                                                                                                                                                                                                                   |
| Agent      | 4   | full-width `SectionCard 'Team Rankings'` → `RankingsTable maxDisplay={5}`                                                              | —                                                                                                                                                                                                                                                                                                                     |
| Agent      | 5   | `SectionCard 'Sentiment Trend' fullHeight` → `SentimentTrendChart` (drop the inner `Card` wrapper)                                     | `SectionCard 'Quick Insights' fullHeight`                                                                                                                                                                                                                                                                             |
| Agent      | 6   | full-width `SectionCard 'Best & Worst Calls'`                                                                                          | —                                                                                                                                                                                                                                                                                                                     |
| Supervisor | 3   | full-width `InboxSummary`                                                                                                              | —                                                                                                                                                                                                                                                                                                                     |
| Supervisor | 4   | Sentiment Trend `fullHeight`                                                                                                           | `SectionCard 'Open Disputes' fullHeight` (BaseTable; `emptyMessage` when 0)                                                                                                                                                                                                                                           |
| Supervisor | 5   | Best & Worst `fullHeight`                                                                                                              | **`SectionCard fullHeight title='Team'`** wrapping the existing `Tabs` (Rankings / Team Members / Quick Insights); `RankingsTable maxDisplay={5}`                                                                                                                                                                     |
| QA Manager | 3–5 | same as Supervisor; right tabs Rankings / Supervisors / Disputes / Campaigns inside `SectionCard fullHeight title='Organisation'`      |                                                                                                                                                                                                                                                                                                                       |
| OM         | 2.5 | add `DashboardEvaluationFilter`                                                                                                        |                                                                                                                                                                                                                                                                                                                       |
| OM         | 3   | full-width `SectionCard 'Critical Issues'`                                                                                             | —                                                                                                                                                                                                                                                                                                                     |
| OM         | 4   | Sentiment Trend `fullHeight`                                                                                                           | Quick Insights `fullHeight`                                                                                                                                                                                                                                                                                           |
| OM         | 5   | Best & Worst `fullHeight`                                                                                                              | `SectionCard fullHeight title='Operations'` wrapping Tabs (Rankings / Team Health / Clients / Critical Alerts). **Clients panel**: replace the 2-col card grid over 7 `CLIENTS_PORTFOLIO` items with a `BaseTable` (columns Client · Calls · QA · Compliance · Sentiment · Status) so odd counts leave no empty cell. |

Delete all `style={{ opacity … }}` wrappers and the `<div>` around `AutoFailsCard`. Section titles/descriptions that
you _introduce_ (`'Team'`, `'Organisation'`, `'Operations'`) come from `t('sections.*')`; existing hard-coded titles
stay as they are (out of scope).

### 7. i18n — `src/locales/en/qa.dashboard.json` (merge into the existing object)

```json
{
	"businessInsights": {
		"title": "Business Insights",
		"period": "This week",
		"conversionRate": "Conversion rate",
		"offers": "{{converted}} of {{offers}} offers converted",
		"autoFails": "Auto-fails",
		"signals": {
			"EARLY_OBJECTION": "Early objections",
			"UNHANDLED_OBJECTION": "Unhandled objections",
			"COMPETITOR_PLUS_COST": "Competitor + price",
			"MISTARGETED_OFFER": "Mis-targeted offers"
		}
	},
	"evaluationFilter": {
		"label": "Filter by evaluation type",
		"options": {
			"all": "All",
			"qa": "QA",
			"sentiment": "Sentiment & Emotion",
			"compliance": "Compliance",
			"business": "Business Insights"
		}
	},
	"sections": {
		"team": "Team",
		"organisation": "Organisation",
		"operations": "Operations",
		"clients": "Clients"
	}
}
```

`qa.dashboard` is already the namespace for route ids `qa.dashboards.*`? Check `qaNamespaces.ts`; if the dashboard
route ids are not mapped, add `'qa.dashboards.agent'|'supervisor'|'qa-manager'|'operation-manager': 'qa.dashboard'`
(use the exact ids from `routes.tsx:854-893`).

## Tasks

1. **SectionCard props + CSS** — implement §1; also add `fullHeight` passthrough to `InboxSummary`. Typecheck.
2. **BI data + cards** — §2, §3, §4, §5, §7 (en + es). Export from `components/index.ts`. Typecheck.
3. **Agent dashboard** — rewrite `NewAgentDashboard.tsx` to §6 (keep `AGENT_TEAM_RANKINGS`, insights, goal constants).
4. **Supervisor dashboard** — §6.
5. **QA Manager dashboard** — §6.
6. **Operation Manager dashboard** — §6 incl. filter + Clients table.
7. **Cleanup** — grep `AutoFailsCard`; if only the four dashboards used it, delete `components/AutoFailsCard.tsx` and
   its export. Remove unused `.metricsGrid` / `.dashboardLayout` from `Dashboard.module.css`. Typecheck.

## Verification

- Typecheck clean. Open each dashboard at 1024 / 1280 / 1440 px, light and dark: the Performance Score row shows four
  cards of equal height; every 2-col row has two cards ending on the same baseline; no card sits outside a surface;
  selecting each filter option dims the right cards (Business → only the BI card stays full opacity in row 2; Quick
  Insights stays visible for sentiment/compliance/business).
- OM Clients tab shows a 7-row table, no empty cell.
- `git grep -n "style={{ opacity"` inside `src/modules/qa/dashboard/pages` returns nothing.

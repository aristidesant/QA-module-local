# Plan 3 of 5 — Disputes: open from the call, agent list/detail, QA Manager review

> Part of the five chained plans approved 2026-09-14. Depends on Plans 1 and 2.

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

# PLAN 3 — Disputes: open from the call, agent list/detail, QA Manager review with item-level correction

Depends on Plan 1 (`SectionCard fullHeight`) and Plan 2 (`DISPUTE_UPDATE` payload, `buildNotification`, `INBOX_IDENTITY`).

## Goal

An agent opens a dispute from the campaigns call detail (evaluation type + comment, optionally flagging the items they
disagree with). The dispute page reproduces the call detail (player, transcript, the disputed evaluation panel) plus the
agent's statement. The QA Manager reviews it: ticks the sub-items that were scored wrongly, sees the recalculated
score live, and **accepts** (corrections applied, score before → after) or **rejects** (comment required). Statuses:
**open · accepted · rejected**. Supervisor sees their team's disputes read-only. Every transition lands in the right
inbox. Sidebar shows the open count per role.

## Architecture

```
src/models/qa/disputeCases.ts                     ← NEW model (legacy disputes.ts untouched)
src/stores/qa/disputesStore.ts                    ← NEW store
src/modules/qa/disputes/cases/                    ← NEW module (siblings DisputesListPage/DisputeDetailPage stay)
  constants.ts   helpers.ts   recalc.ts   mockData.ts
  DisputeCasesPage/DisputeCasesPage.tsx  index.ts  useDisputeColumns.tsx
  DisputeCaseDetailPage/DisputeCaseDetailPage.tsx  index.ts  DisputeCaseDetailPage.module.css
    components/DisputeSummaryStrip.tsx  CallContextPanel.tsx  AgentStatementCard.tsx
               EvaluationCard.tsx  ResolutionCard.tsx  ReviewPanel.tsx
  components/OpenDisputeDrawer.tsx                ← used by the call detail
src/views/Campaigns/pages/ConversationEvaluations.tsx ← "Dispute this evaluation" button + drawer
src/modules/qa/disputes/DisputesManagement.tsx + index.ts ← DELETE (after routes are re-pointed)
src/routes.tsx                                    ← re-point agent/supervisor/qa-manager disputes + detail routes
src/components/Sidebar/{Sidebar,roleNavigation}.tsx ← disputes counter from the store
src/locales/{en,es}/qa.disputes.json              ← + cases.* (existing list.* / detail.* untouched)
src/modules/qa/qaNamespaces.ts                    ← 6 route ids → ['qa.disputes','qa.team','qa.teamAnalytics','qa.inbox']
```

## Spec

### 1. Model (`src/models/qa/disputeCases.ts`)

```ts
import type { CallEvaluationTab } from '~/views/Campaigns/types';

export type DisputeStatus = 'open' | 'accepted' | 'rejected';
export type DisputeEvaluationType = CallEvaluationTab;

/** One disputable sub-item of an evaluation, as shown to the agent (flag) and the manager (correct). */
export interface DisputeItemRef {
	id: string;
	label: string;
	/** Aspect name / compliance area / "Signals" / "Outcome" / "Sentiment" */
	group: string;
	/** Human value as originally scored, e.g. "No · 0/10", "Violation", "Detected", "Negative" */
	original: string;
}

export interface DisputeCase {
	id: string; // DSP-1001
	callId: string;
	campaignId: string;
	campaignName: string;
	agentId: string;
	agentName: string;
	supervisorId: string;
	supervisorName: string;
	team: string;
	evaluationType: DisputeEvaluationType;
	/** Headline score of the disputed aspect when opened (QA / compliance %, sentiment 0-5, BI = null). */
	scoreBefore: number | null;
	/** Filled on accept. */
	scoreAfter: number | null;
	agentComment: string;
	/** Items the agent flagged when opening (optional, pre-ticks the review). */
	flaggedItemIds: string[];
	status: DisputeStatus;
	createdAt: string;
	resolvedAt: string | null;
	resolvedBy: string | null; // 'Elena Ruiz'
	managerComment: string | null;
	/** Items the manager marked as wrongly scored (accepted only). */
	correctedItemIds: string[];
}

export interface OpenDisputeInput {
	callId: string;
	campaignId: string;
	campaignName: string;
	agentId: string;
	evaluationType: DisputeEvaluationType;
	agentComment: string;
	flaggedItemIds: string[];
}
```

### 2. Call resolution (`cases/helpers.ts`)

```ts
import { mockCallEvaluationDetail } from '~/views/Campaigns/constants';
/** Every dispute renders the single mock call, personalised. */
export const getDisputeCall = (d: DisputeCase): CallEvaluationDetail => ({
	...mockCallEvaluationDetail,
	callId: d.callId,
	agentName: d.agentName,
	date: d.createdAt.slice(0, 10),
});
export const toDemoTurns = (turns: TranscriptTurn[]): DemoTranscriptTurn[] =>
	turns.map((t) => ({
		id: t.id,
		role: t.speaker,
		timestamp: t.timestamp,
		text: t.text,
	}));
export const hasOpenDispute = (
	cases: DisputeCase[],
	callId: string,
	type: DisputeEvaluationType
) =>
	cases.some(
		(c) =>
			c.callId === callId && c.evaluationType === type && c.status === 'open'
	);
export const casesForRole = (cases: DisputeCase[], role: InboxRole) =>
	role === 'agent'
		? cases.filter((c) => c.agentId === AGENT_PERSONA_ID)
		: role === 'supervisor'
			? cases.filter((c) => c.supervisorId === SUPERVISOR_PERSONA.id)
			: cases;
export const daysOpen = (c: DisputeCase) =>
	dayjs(c.resolvedAt ?? NOW_ISO).diff(dayjs(c.createdAt), 'day');
```

### 3. Recalculation rules (`cases/recalc.ts`) — pure, deterministic

```ts
export function listDisputableItems(
	call: CallEvaluationDetail,
	type: DisputeEvaluationType
): DisputeItemRef[];
export function applyCorrections(
	call: CallEvaluationDetail,
	type: DisputeEvaluationType,
	itemIds: string[]
): CallEvaluationDetail;
export function headlineScore(
	call: CallEvaluationDetail,
	type: DisputeEvaluationType
): number | null;
```

| type                | disputable items (`id` · label · group · original)                                                                                                                                                        | `applyCorrections` for a ticked item                                                                                                                                                                                                                                                                                        | recompute                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qa`                | every `QAItemResult` with `answer === 'no'` → `item.id` · `item.name` · `aspect.name` · `No · 0/${valuation}`                                                                                             | `answer: 'yes'`, `awarded = valuation`                                                                                                                                                                                                                                                                                      | `aspect.score = Σ awarded`; `overallScore = round(Σ awarded / Σ valuation × 100)` over all aspects; per `errorTypes[]`: `errorsFound` = count of `'no'` items of that code, `score = round(100 × (1 − errorsFound / itemsEvaluated))`, `status` good ≥ 90 · warning ≥ 70 · critical; `autoFailCount` = `'no'` items with code `ECC` or `ECUF`; `passed = overallScore ≥ passThreshold` |
| `compliance`        | every `ComplianceItemResult` with `status !== 'compliant'` → `item.key` · `item.label` · `COMPLIANCE_AREAS[area.key].label` · status label                                                                | `status: 'compliant'`, `score: 100`, `note: undefined`                                                                                                                                                                                                                                                                      | `area.score = round(mean(items.score))`; `overallScore = round(mean(areas.score))`; `violationCount` / `warningCount` recounted; `status` = violation if any, else warning if any, else compliant                                                                                                                                                                                      |
| `sentiment-emotion` | three fixed items: `customer-category` (`customer.overallCategory`), `agent-category` (`agent.overallCategory`), `recovery` (`recovered ? 'Recovered' : 'Not recovered'`)                                 | category items: move one step toward `very-positive` in `SENTIMENT_CATEGORY_ORDER` (bounded) and set `overallScore` to the band midpoint `{ 'very-negative': 0.5, negative: 1.5, neutral: 2.5, positive: 3.5, 'very-positive': 4.5 }`; `recovery`: `recovered: true`, `endCategory = 'positive'`, `endScore = 3.5` if lower | headline = `customer.overallScore`                                                                                                                                                                                                                                                                                                                                                     |
| `business-insights` | every `signals[]` with `detected` → `signal.type` · `BUSINESS_SIGNALS[type].label` · "Signals" · Detected; plus `outcome-converted` · "Converted" · "Outcome" · "Not converted" when `!outcome.converted` | signal → `detected: false`, `evidence: undefined`; `outcome-converted` → `converted: true`, `nonConversionReason: undefined`                                                                                                                                                                                                | headline = `null` (table shows "—"; strip shows detected-signal count before → after instead)                                                                                                                                                                                                                                                                                          |

Always return new objects (spread), never mutate the mock.

### 4. Store (`src/stores/qa/disputesStore.ts`)

```ts
interface DisputesState {
	cases: DisputeCase[];
	openDispute: (input: OpenDisputeInput) => DisputeCase;
	acceptDispute: (
		id: string,
		correctedItemIds: string[],
		managerComment: string
	) => void;
	rejectDispute: (id: string, managerComment: string) => void;
}
export const selectCases = (s: DisputesState) => s.cases;
```

- `openDispute`: agent from `TEAM_AGENTS` (`supervisorId`, `supervisorName`, `team`, `name`); `scoreBefore =
headlineScore(getDisputeCall(draft), type)`; id `DSP-${++counter}` (counter starts 1014); prepend; notify **QA
  Manager** (`recipientRole 'QA_MANAGER'`, `recipientId QAM-001`, `category 'DIRECT_MESSAGE'`
  with `priority 'HIGH'`, `sourceRole 'AGENT'`, `sourceId agentId`, `icon 'flag'`, payload
  `{ kind: 'DISPUTE_UPDATE', status: 'open', … }`, title `Dispute opened · ${agentName}`) and the agent's **supervisor**
  (`priority 'NORMAL'`, same payload).
- `acceptDispute`: `scoreAfter = headlineScore(applyCorrections(call, type, ids), type)`; `status 'accepted'`,
  `resolvedAt NOW_ISO`, `resolvedBy QA_MANAGER_PERSONA.name`, `managerComment`, `correctedItemIds`; notify **agent**
  (`recipientRole 'AGENT'`, `sourceRole 'QA_MANAGER'`, `category 'POSITIVE_RECOGNITION'`, payload status accepted with
  both scores) and **supervisor** (`'DIRECT_MESSAGE'`).
- `rejectDispute`: `status 'rejected'`, `resolvedAt`, `resolvedBy`, `managerComment`; notify agent (`'DIRECT_MESSAGE'`,
  `priority 'NORMAL'`) and supervisor.
  Guard in both: no-op if the case is not `open`.

### 5. Seed (`cases/mockData.ts`) — `DISPUTE_CASES_SEED: DisputeCase[]`, ids DSP-1001…DSP-1014

| id   | agent                           | type              | status   | scoreBefore | scoreAfter | createdAt                         | flagged / corrected                                            |
| ---- | ------------------------------- | ----------------- | -------- | ----------- | ---------- | --------------------------------- | -------------------------------------------------------------- |
| 1001 | AGT-004 John Smith              | qa                | open     | 71          | null       | 2026-09-11T09:20                  | 2 QA item ids from `mockCallEvaluationDetail` with answer 'no' |
| 1002 | AGT-006 David Brown             | compliance        | open     | 78          | null       | 2026-09-10T16:05                  | 1 non-compliant item key                                       |
| 1003 | AGT-004 John Smith              | qa                | accepted | 71          | 82         | 2026-09-03T11:00 · resolved 09-05 | corrected = same 2 ids                                         |
| 1004 | AGT-002 Mike Chen               | sentiment-emotion | rejected | 2.5         | null       | 2026-09-02 · resolved 09-04       | —                                                              |
| 1005 | AGT-001 Sarah Johnson           | business-insights | open     | null        | null       | 2026-09-09                        | `['UNHANDLED_OBJECTION']`                                      |
| 1006 | AGT-011 Lucía Torres (Team 2)   | compliance        | accepted | 78          | 91         | 2026-08-28 · 08-30                | 2 keys                                                         |
| 1007 | AGT-015 Camila Herrera (Team 3) | qa                | open     | 71          | null       | 2026-09-08                        | []                                                             |
| 1008 | AGT-005 Emma Davis              | sentiment-emotion | accepted | 2.5         | 3.5        | 2026-08-25 · 08-27                | `['customer-category']`                                        |
| 1009 | AGT-009 (Team 2)                | qa                | rejected | 71          | null       | 2026-08-22 · 08-24                | —                                                              |
| 1010 | AGT-017 Nina Patel (Team 3)     | business-insights | accepted | null        | null       | 2026-08-20 · 08-21                | `['COMPETITOR_PLUS_COST']`                                     |
| 1011 | AGT-003 Jessica Martinez        | compliance        | open     | 78          | null       | 2026-09-12T08:10                  | []                                                             |
| 1012 | AGT-007 Lisa Wong               | qa                | rejected | 71          | null       | 2026-08-18 · 08-19                | —                                                              |
| 1013 | AGT-013 (Team 2)                | sentiment-emotion | open     | 2.5         | null       | 2026-09-06                        | `['recovery']`                                                 |
| 1014 | AGT-020 (Team 3)                | qa                | accepted | 71          | 88         | 2026-08-15 · 08-16                | 3 ids                                                          |

Take agent names / supervisor / team from `TEAM_AGENTS`; `campaignId` cycles camp-001…004 with the matching name;
`callId` = `CALL-20${31 + n}`; `agentComment` 1–2 sentences each; accepted/rejected rows have a `managerComment`.
`scoreBefore` values are whatever `headlineScore(mockCallEvaluationDetail, type)` returns — compute them with the helper
instead of hard-coding if they differ from the table.

### 6. Routes (`src/routes.tsx`)

Replace the three `<DisputesManagement />` routes and add details (copy the `I18nNamespaceLoader` wrapper pattern of
the neighbours; lazy imports at the top):

```
agent/disputes                 id qa.agent.disputes              → <DisputeCasesPage />
agent/disputes/:disputeId      id qa.agent.disputes.detail       → <DisputeCaseDetailPage />
supervisor/disputes            id qa.supervisor.disputes         → <DisputeCasesPage />
supervisor/disputes/:disputeId id qa.supervisor.disputes.detail  → <DisputeCaseDetailPage />
qa-manager/disputes            id qa.qa-manager.disputes         → <DisputeCasesPage />
qa-manager/disputes/:disputeId id qa.qa-manager.disputes.detail  → <DisputeCaseDetailPage />
qamanager/disputes             → <Navigate to='/qa/qa-manager/disputes' replace />   (keep the old id)
```

Register the six ids in `qaNamespaces.ts` → `['qa.disputes', 'qa.team', 'qa.teamAnalytics', 'qa.inbox']`.

### 7. `DisputeCasesPage` (role-aware)

`const role = inboxRoleFromPath(pathname)` (Plan 2). `cases = useMemo(() => casesForRole(all, role))`.

| Block                     | Agent                                                                                                                                                                                                                                                                      | Supervisor                                                              | QA Manager                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| Eyebrow / description     | `cases.page.eyebrow.agent` / `description.agent`                                                                                                                                                                                                                           | `.supervisor`                                                           | `.qa-manager`                                   |
| KPI strip (`StatCard` ×4) | Open · Accepted · Rejected · Acceptance rate `accepted/(accepted+rejected)` %                                                                                                                                                                                              | same, team scope                                                        | same, all teams                                 |
| Filters (`Group`)         | status `SegmentedControl` (All/Open/Accepted/Rejected, counts in labels) · type `Select`                                                                                                                                                                                   | + team `Select` (locked to Team 1, disabled) · agent search `TextInput` | + team `Select` (All / Team 1-3) · agent search |
| Table columns             | ID · Call (callId, campaign sub-line) · Type `Badge` (label `cases.types.*`, color `CALL_EVALUATION_TABS` meta) · Score (`before → after`, or before only, or "—") · Status `Badge` (open blue / accepted green / rejected red) · Opened (relative) · Resolved (date or —) | + Agent · Team                                                          | + Agent · Team · Supervisor                     |
| Row click                 | `/qa/agent/disputes/:id`                                                                                                                                                                                                                                                   | `/qa/supervisor/disputes/:id`                                           | `/qa/qa-manager/disputes/:id`                   |
| Empty                     | `cases.table.empty`                                                                                                                                                                                                                                                        |                                                                         |                                                 |

Status badge column and Type badge column use `styles.levelColumn`-style fixed widths (see Plan 1 gotchas).

### 8. `DisputeCaseDetailPage`

Reads `:disputeId`; 404 → `EmptyState` + back. `viewer = inboxRoleFromPath`. `call = getDisputeCall(d)`;
`corrected = useMemo(() => applyCorrections(call, d.evaluationType, d.correctedItemIds))`; `items = listDisputableItems(call, type)`.

```
Stack gap='lg'
├ Anchor ← back to list · eyebrow `#${id}` · Title `cases.detail.title` ({{type}} · {{agent}}) · badges status/type
│ · Text `cases.detail.openedBy` (agent, relative) · when resolved `cases.detail.resolvedBy` (resolvedBy, date)
├ DisputeSummaryStrip  SimpleGrid cols={{ base: 2, md: 4 }} StatCard: before · after (or `summary.pending`) · change
│                      (delta, color green/red; BI: detected count before → after) · daysOpen
└ SimpleGrid cols={{ base: 1, lg: 2 }} spacing='lg'
  ├ Stack (left, CallContextPanel)
  │   SectionCard fullHeight `cases.detail.recording`  → MockAudioPlayerBar durationSeconds={call.durationSeconds}
  │   SectionCard `cases.detail.transcript` headerActions=Badge turns → ScrollArea h={420} DemoTranscript turns={toDemoTurns(call.transcript)}
  └ Stack (right)
      AgentStatementCard  SectionCard `cases.detail.statement` (icon IconMessageReport) → Blockquote agentComment ·
                          `cases.detail.flaggedItems` chips (label from items) or `noFlaggedItems`
      EvaluationCard      SectionCard title = type label; headerActions = SegmentedControl Original|Corrected only when
                          status==='accepted' (default Corrected) → renders `<QAEvaluationPanel qa=…/>` /
                          `<SentimentEmotionPanel sentiment=…/>` / `<CompliancePanel compliance=…/>` /
                          `<BusinessInsightsPanel business=…/>` from `call` or `corrected`
      ResolutionCard      when status !== 'open': SectionCard headerAccent green|red `cases.detail.resolution.title` →
                          manager comment · corrections list (Table: item · before → after) or `resolution.none`
      ReviewPanel         when status === 'open' && viewer === 'qa-manager' (see §9)
      Alert               when status === 'open' && viewer !== 'qa-manager': `cases.detail.waiting` (blue, IconClock)
```

### 9. `ReviewPanel` (QA Manager only)

`SectionCard headerAccent='blue' title=cases.review.title description=cases.review.description`:

- `Checkbox.Group value={ticked}` initial `flaggedItemIds ∩ items`; items grouped by `group` (`Text fw={600} size='xs' tt='uppercase' c='dimmed'` group header); each `Checkbox label={item.label} description={item.original}`.
- Live preview `Paper withBorder p='sm'`: `cases.review.preview` → `before → after` where `after =
headlineScore(applyCorrections(call, type, ticked), type)` (BI: detected count).
- `Textarea` `cases.review.comment` (placeholder), min 10 chars for reject.
- `Group justify='flex-end'`: `Button variant='light' color='red'` reject (disabled if comment < 10) → confirm `Modal`
  (`confirmReject.*`) → `rejectDispute`; `Button color='green'` accept (disabled if `ticked.length === 0`) →
  `acceptDispute` → `notifySuccess(cases.review.acceptedToast)`. Tooltips `needItems` / `needComment` on disabled.

### 10. `OpenDisputeDrawer` + call detail hook-up

In `ConversationEvaluations.tsx` tab card: wrap the tab `Group` and a right-aligned `Button variant='light'
leftSection={<IconFlag size={16}/>}` `t('cases.open.button', { ns: 'qa.disputes' })` in `Group justify='space-between'`.
Show the button only when `useRoleMockStore((s) => s.previewRole) === 'agent'`. Disabled with `Tooltip`
`cases.open.alreadyOpen` when `hasOpenDispute(cases, call.callId, selectedTab)`. Add `useTranslation('qa.disputes')`
to the page (it currently has none; hard-coded copy elsewhere on the page stays).

`OpenDisputeDrawer` props `{ opened; onClose; call: CallEvaluationDetail; campaignId: string; campaignName: string; initialType: DisputeEvaluationType }`.
`AppDrawer title=cases.open.title description=cases.open.description icon=IconFlag`: `Select` type (options from
`CALL_EVALUATION_TABS`, label `cases.types.*`), read-only `cases.open.score` line (`headlineScore`), `Checkbox.Group`
of `listDisputableItems` with hint `cases.open.itemsHint`, `Textarea` comment (min 20 chars, counter), footer `Button`
submit → `openDispute({...})` → `notifySuccess(cases.open.toast)` → `navigate('/qa/agent/disputes/' + id)`.

### 11. Sidebar counter

`roleNavigation.tsx`: `badge: 'disputes'` on `agent-disputes`, `supervisor-disputes`, `qamanager-disputes`
(`i18nNamespace: 'qa.disputes'`). `Sidebar.tsx`: remove `useDisputesQuery` (import at :75 and usage :1069-1075);
`const cases = useDisputesStore(selectCases); const openDisputesCount = useMemo(() => item.badge === 'disputes' ?
casesForRole(cases, inboxRoleFromPath(item.to)).filter((c) => c.status === 'open').length : 0, …)`. Legacy
`Sidebar.tsx` items `qa-disputes` / `qa-disputes-list` that carry `badge: 'disputes'` keep working (all-teams count).

### 12. i18n — merge into `src/locales/en/qa.disputes.json` under a new top-level `"cases"` key

```json
"cases": {
	"page": {
		"eyebrow": { "agent": "Agent · John Smith", "supervisor": "Supervisor · Team 1", "qa-manager": "QA Manager · All teams" },
		"title": "Disputes",
		"description": { "agent": "Evaluations you disagreed with and what the QA Manager decided", "supervisor": "Disputes opened by your team — read-only, the QA Manager resolves them", "qa-manager": "Review each dispute, correct the items scored wrongly or reject it" }
	},
	"kpis": { "open": "Open", "accepted": "Accepted", "rejected": "Rejected", "acceptanceRate": "Acceptance rate" },
	"filters": { "status": { "all": "All", "open": "Open", "accepted": "Accepted", "rejected": "Rejected" }, "type": "Evaluation type", "allTypes": "All types", "team": "Team", "allTeams": "All teams", "agentSearch": "Search agent" },
	"table": { "columns": { "id": "ID", "call": "Call", "agent": "Agent", "team": "Team", "supervisor": "Supervisor", "type": "Type", "score": "Score", "status": "Status", "opened": "Opened", "resolved": "Resolved" }, "empty": "No disputes match the current filters" },
	"status": { "open": "Open", "accepted": "Accepted", "rejected": "Rejected" },
	"types": { "qa": "QA", "sentiment-emotion": "Sentiment & Emotion", "compliance": "Compliance", "business-insights": "Business Insights" },
	"groups": { "signals": "Signals", "outcome": "Outcome", "sentiment": "Sentiment" },
	"items": { "customer-category": "Customer sentiment category", "agent-category": "Agent sentiment category", "recovery": "Sentiment recovery", "outcome-converted": "Converted" },
	"original": { "detected": "Detected", "notConverted": "Not converted", "recovered": "Recovered", "notRecovered": "Not recovered", "no": "No · 0/{{max}}" },
	"detail": {
		"back": "All disputes", "title": "{{type}} dispute · {{agent}}",
		"openedBy": "Opened by {{agent}} {{when}}", "resolvedBy": "{{status}} by {{name}} on {{date}}",
		"summary": { "before": "Score before", "after": "Score after", "pending": "Pending review", "change": "Change", "daysOpen": "Days open", "signalsBefore": "Signals before", "signalsAfter": "Signals after" },
		"recording": "Call recording", "transcript": "Transcript", "turns_one": "{{count}} turn", "turns_other": "{{count}} turns",
		"statement": "Agent statement", "flaggedItems": "Items the agent flagged", "noFlaggedItems": "No specific items flagged",
		"evaluation": "Evaluation", "view": { "original": "Original", "corrected": "Corrected" },
		"resolution": { "title": "Resolution", "corrections": "Corrected items", "before": "Before", "after": "After", "managerComment": "QA Manager comment", "none": "No items were corrected" },
		"waiting": "Waiting for the QA Manager to review this dispute."
	},
	"review": {
		"title": "Review", "description": "Tick the items that were scored wrongly. The score recalculates as you go.",
		"items": "Disputed items", "preview": "Recalculated score", "comment": "Comment", "commentPlaceholder": "Explain the decision to the agent…",
		"accept": "Accept & correct", "reject": "Reject",
		"confirmReject": { "title": "Reject this dispute?", "body": "The agent will be notified with your comment. This cannot be undone.", "confirm": "Reject dispute" },
		"acceptedToast": "Dispute accepted — the corrected score is now on the call", "rejectedToast": "Dispute rejected",
		"needItems": "Tick at least one item to accept", "needComment": "Write a comment to reject"
	},
	"open": {
		"button": "Dispute this evaluation", "alreadyOpen": "A dispute for this evaluation is already open",
		"title": "Open a dispute", "description": "Tell the QA Manager what you disagree with. You can flag specific items.",
		"type": "Evaluation type", "score": "Current score", "items": "Items you disagree with (optional)", "itemsHint": "Only items scored against you are listed",
		"comment": "Why do you disagree?", "commentPlaceholder": "Be specific: what happened on the call and why the score is wrong…", "minLength": "At least {{count}} characters",
		"submit": "Open dispute", "toast": "Dispute opened — the QA Manager has been notified"
	}
}
```

## Tasks

1. **Model + recalc + helpers + seed + store** — §1–§5. Unit-check `applyCorrections` by hand in a scratch `node -e`
   or by rendering (no test files). Typecheck.
2. **Routes + namespace + delete `DisputesManagement`** — §6; delete `src/modules/qa/disputes/DisputesManagement.tsx`
   and the `index.ts` re-export (grep `DisputesManagement` first — the only consumers are the three routes). Typecheck.
3. **List page** — §7 + `useDisputeColumns.tsx`. Typecheck.
4. **Detail page** — §8 + §9 (six components). Typecheck.
5. **Open from the call** — §10. Typecheck.
6. **Sidebar counter + i18n es** — §11, §12 (en + es), parity check. Typecheck. Commit
   `feat(qa-disputes): agent dispute lifecycle with QA Manager item-level review`.

## Verification

- Agent preview → `/qa/campaigns/camp-001/calls/CALL-2031` (or any call) → "Dispute this evaluation" → QA → tick two
  items → comment → submit → lands on `/qa/agent/disputes/DSP-1015`; sidebar Disputes badge for agent = 4 (3 seed
  open + 1); `/qa/qa-manager/inbox` gets a HIGH "Dispute opened" row whose detail CTA opens the dispute.
- QA Manager preview → `/qa/qa-manager/disputes` → DSP-1015 → ReviewPanel pre-ticks the two items, preview shows
  71 → N; Accept → status accepted, strip shows before/after, EvaluationCard toggle Original/Corrected changes the QA
  panel numbers; agent inbox gets an accepted DISPUTE_UPDATE.
- Reject flow on DSP-1002 requires a comment and confirmation; supervisor sees DSP-1002 with the Alert and no panel.
- Supervisor list shows only Team 1 rows; manager list shows all 14 (+ new).

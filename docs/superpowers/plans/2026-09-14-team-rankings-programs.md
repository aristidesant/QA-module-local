# Plan 4 of 5 — Team Rankings: manager-configured programs, real standings, badges

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

# PLAN 4 — Team Rankings: manager-configured programs, real standings, badges, agent leaderboard

Depends on Plan 1 (`fullHeight`, dashboards rewritten) and Plan 2 (`RANKING_UPDATE` / `BADGE_EARNED` payloads).

## Goal

Supervisors (own team) and QA Managers (any teams) create **ranking programs**: name, period, evaluation type →
metric, target score, minimum calls, prize, milestone badges, winner badge. **One active/scheduled program per team at
a time** (overlaps are blocked; the editor offers "End it now"). Standings are computed from the real roster and
`TEAM_CALLS` with the analytics helpers, milestones award Triggers badges (new `awardBadge`), ending a program picks
the winner and notifies everyone. The agent page shows the active program of their team: header with prize and target,
**My position** card, podium, full leaderboard (own row highlighted), reactions, badges, and past rankings. The
dashboard rankings widgets read the same store.

## Architecture

```
src/models/qa/rankingPrograms.ts                  ← NEW
src/stores/qa/rankingsStore.ts                    ← NEW (programs, reactions)
src/stores/qa/triggerRulesStore.ts                ← + awardBadge
src/modules/qa/rankings/                          ← NEW manager module
  constants.ts   helpers.ts   mockData.ts
  ManagerRankingsPage/ManagerRankingsPage.tsx  index.ts  RankingsKpiStrip.tsx
  components/RankingProgramCard.tsx  ProgramDetailDrawer.tsx  RankingEditorDrawer.tsx  ConflictBanner.tsx
             StandingsTable.tsx  MilestonesEditor.tsx  PrizeEditor.tsx
  hooks/useActiveRanking.ts  useStandings.ts
src/modules/qa/agent/rankings/
  TeamRankingsPage.tsx                             ← rebuilt on the store
  components/LeaderboardHeader.tsx                 ← + prize, target
  components/MyPositionCard.tsx  PodiumStrip.tsx  PastRankingsCard.tsx   ← NEW
  components/{ExpandedRankingsTable,RankingCardGrid}.tsx ← data required, + currentAgentId highlight, i18n headers
  components/RankingDetailDrawer/**                ← AchievementsTab resolves Triggers badges
  hooks/useUserReaction.ts                         ← reads/writes rankingsStore.reactions
  hooks/useLeaderboardMetadata.ts + gamification.ts AGENT_RANKINGS usage ← delete / re-point
src/modules/qa/dashboard/pages/{NewAgent,NewSupervisor,NewQAManager}Dashboard.tsx ← RankingsTable from store
src/routes.tsx · roleNavigation.tsx · qaNamespaces.ts · locales/{en,es}/qa.rankings.json (NEW)
```

## Spec

### 1. Model (`src/models/qa/rankingPrograms.ts`)

```ts
import type { CallEvaluationTab } from '~/views/Campaigns/types';
import type { TriggerMetricId } from './triggerRules';

export type RankingEvaluationType = CallEvaluationTab;
export type RankingStatus =
	| 'draft'
	| 'scheduled'
	| 'active'
	| 'completed'
	| 'cancelled';
export type PrizeKind =
	| 'BONUS'
	| 'TIME_OFF'
	| 'GIFT_CARD'
	| 'RECOGNITION'
	| 'OTHER';

export interface RankingPrize {
	kind: PrizeKind;
	title: string;
	description: string;
	icon: string; /* emoji */
}
export interface RankingMilestone {
	id: string;
	label: string;
	threshold: number;
	badgeId: string; /* BadgeDefinition.id */
}

export interface RankingProgram {
	id: string; // RP-001
	name: string;
	description: string;
	teams: string[]; // 'Team 1' | 'Team 2' | 'Team 3'
	evaluationType: RankingEvaluationType;
	metricId: TriggerMetricId;
	targetScore: number;
	minCalls: number;
	startDate: string; // YYYY-MM-DD (inclusive)
	endDate: string; // YYYY-MM-DD (inclusive)
	prize: RankingPrize;
	milestones: RankingMilestone[];
	winnerBadgeId: string | null;
	status: RankingStatus;
	winnerId: string | null;
	winnerName: string | null;
	createdBy: string; // persona name
	createdByRole: 'SUPERVISOR' | 'QA_MANAGER';
	createdAt: string;
	updatedAt: string;
}

export interface RankingStanding {
	rank: number | null; // null = below minCalls (unranked)
	agentId: string;
	agentName: string;
	team: string;
	score: number | null;
	calls: number;
	previousRank: number | null;
	delta: number | null; // previousRank − rank (+ = climbed)
	milestoneIds: string[];
	reachedTarget: boolean;
}

export type ProgramDraft = Omit<
	RankingProgram,
	'id' | 'winnerId' | 'winnerName' | 'createdAt' | 'updatedAt'
>;
```

### 2. Constants (`rankings/constants.ts`)

```ts
export const RANKING_METRICS: Record<RankingEvaluationType, TriggerMetricId[]> =
	{
		qa: VIEW_METRICS.qa,
		'sentiment-emotion': VIEW_METRICS.sentiment,
		compliance: VIEW_METRICS.compliance,
		'business-insights': ['CONVERSION_RATE', ...VIEW_METRICS.business],
	};
export const DEFAULT_METRIC: Record<RankingEvaluationType, TriggerMetricId> = {
	qa: 'QA_OVERALL_SCORE',
	'sentiment-emotion': 'CUSTOMER_SENTIMENT_SCORE',
	compliance: 'COMPLIANCE_OVERALL_SCORE',
	'business-insights': 'CONVERSION_RATE',
};
export const PRIZE_KINDS: PrizeKind[] = [
	'BONUS',
	'TIME_OFF',
	'GIFT_CARD',
	'RECOGNITION',
	'OTHER',
];
export const PRIZE_ICONS = ['🏆', '🎁', '💰', '🌴', '⭐', '🥇', '🎉', '🚀'];
export const TEAMS = ['Team 1', 'Team 2', 'Team 3'];
export const PREVIOUS_RANK_DAYS = 7;
export const RANKING_TABS = [
	'active',
	'scheduled',
	'completed',
	'drafts',
] as const;
```

Verify `metricOf` in `analytics/helpers.ts` handles `'CONVERSION_RATE'`; if it does not, add
`case 'CONVERSION_RATE': return c.offeredProduct === null ? null : c.converted ? 100 : 0;` and add it to
`SHARE_METRIC_IDS` so `aggregateMetric` returns a percentage.

### 3. Helpers (`rankings/helpers.ts`)

```ts
export const isProgramLive = (p, day = TODAY) => (p.status === 'active' || p.status === 'scheduled');
export function conflictingProgram(programs, teams: string[], start: string, end: string, excludeId?: string): RankingProgram | null
	// live program sharing ≥1 team whose [start,end] overlaps → return it
export function programsForRole(programs, role: 'supervisor' | 'qa-manager')
	// supervisor → p.teams.includes('Team 1')
export function computeStandings(program: RankingProgram, calls: TeamCallMetric[], asOf = TODAY): RankingStanding[]
	// 1. window = calls with teams.includes(c.team) && day(c.date) ∈ [startDate, min(endDate, asOf)]
	// 2. agents = TEAM_AGENTS.filter(a => teams.includes(a.team))
	// 3. per agent: agentCalls; score = agentCalls.length >= minCalls ? aggregateMetric(agentCalls, metricId) : null
	// 4. sort scored by METRIC_BY_ID[metricId].higherIsBetter ? desc : asc, then calls desc; rank 1..n; unscored appended rank null
	// 5. previous = same with asOf − PREVIOUS_RANK_DAYS (only if that day ≥ startDate) → previousRank, delta
	// 6. milestoneIds = milestones.filter(m => reached(score, m.threshold)); reachedTarget = reached(score, targetScore)
	//    reached = higherIsBetter ? score >= t : score <= t
export const leader = (standings) => standings.find((s) => s.rank === 1) ?? null;
export function toRankingEntry(s: RankingStanding, reactions: AgentRankingReactionTotals | undefined): AgentRankingEntry
	// { rank: s.rank ?? 0, agentId, agentName, score: s.score ?? 0, rankTrend: s.delta ?? 0, achievements: s.milestoneIds, reactionsTotals: reactions }
export const elapsedPct = (p) => clamp(round((days(TODAY − start) / days(end − start)) × 100), 0, 100);
export const daysLeft = (p) => max(0, days(end − TODAY));
export const formatTarget = (p) => formatMetricValue(p.metricId, p.targetScore);
```

`AgentRankingEntry.achievements` now holds **milestone ids**; the drawer resolves them (see §9).

### 4. Store (`src/stores/qa/rankingsStore.ts`)

```ts
interface RankingsState {
	programs: RankingProgram[];
	/** programId → agentId → reaction (replaces the mutated `userReactions` mock) */
	reactions: Record<string, Record<string, UserReactionType | null>>;
	createProgram: (
		draft: ProgramDraft
	) =>
		| { ok: true; program: RankingProgram }
		| { ok: false; conflict: RankingProgram };
	updateProgram: (
		id: string,
		patch: Partial<ProgramDraft>
	) => { ok: true } | { ok: false; conflict: RankingProgram };
	endProgram: (id: string) => void;
	cancelProgram: (id: string) => void;
	duplicateProgram: (id: string) => RankingProgram; // status 'draft', name + ' (copy)'
	syncMilestones: (id: string) => void; // awards reached milestone badges once
	setReaction: (
		programId: string,
		agentId: string,
		reaction: UserReactionType | null
	) => void;
}
export const selectPrograms = (s) => s.programs;
export const selectReactions = (s) => s.reactions;
```

- `createProgram`/`updateProgram`: if `draft.status !== 'draft'` and `conflictingProgram(...)` → `{ ok: false, conflict }`.
  Status normalisation: `status === 'active' && startDate > TODAY` → `'scheduled'`. On active/scheduled creation →
  `RANKING_UPDATE` `STARTED` to every agent of `teams` (`recipientRole 'AGENT'`, `agentId`, `sourceRole` = creator's
  role, `category 'POSITIVE_RECOGNITION'`, `priority 'NORMAL'`, `icon 'trophy'`, `prizeTitle`).
- `endProgram`: `standings = computeStandings(p, TEAM_CALLS)`; winner = `leader(standings)`; `status 'completed'`,
  `winnerId/Name`; `awardBadge(winnerBadgeId, holder)` if set; notify winner `WON` (`priority 'HIGH'`) and every other
  participant `ENDED`; notify the creator's inbox (SUPERVISOR/QA_MANAGER recipient) `ENDED` with `winnerName` in the message.
- `syncMilestones(id)`: for each standing × reached milestone, if the badge's `holders` lacks `agentId` →
  `useTriggerRulesStore.getState().awardBadge(badgeId, { agentId, agentName, team, earnedAt: NOW_ISO })` + agent
  notification `BADGE_EARNED` (payload from the `BadgeDefinition`) + `RANKING_UPDATE` `MILESTONE`. Called by the
  agent page and the manager drawer on mount (`useEffect`) — idempotent.
- `triggerRulesStore.awardBadge(badgeId, holder)`: push to `holders` unless `agentId` already present; `updatedAt`.

### 5. Seed (`rankings/mockData.ts`) — `RANKING_PROGRAMS_SEED`

Pick badge ids from `src/modules/qa/triggers/mockData.ts` (`badges` array): `QA_BRONZE`, `QA_GOLD`, `COMPLIANCE_*`,
`SENTIMENT_*` — read the file and use real ids of `status: 'ACTIVE'` badges in the matching `area`.

| id     | name                    | teams                  | type / metric                                | target · minCalls | period                  | status                                                                                           | prize                                                 | milestones                                  | winnerBadge     | createdBy               |
| ------ | ----------------------- | ---------------------- | -------------------------------------------- | ----------------- | ----------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------- | --------------- | ----------------------- |
| RP-001 | September QA Sprint     | Team 1                 | qa / QA_OVERALL_SCORE                        | 90 · 10           | 2026-09-01 → 2026-09-30 | active                                                                                           | GIFT_CARD 🎁 "$100 gift card"                         | 85 → QA bronze badge · 90 → QA silver badge | QA gold badge   | Maria García SUPERVISOR |
| RP-002 | Compliance Champions Q3 | Team 2, Team 3         | compliance / COMPLIANCE_OVERALL_SCORE        | 95 · 15           | 2026-07-01 → 2026-09-30 | active                                                                                           | RECOGNITION 🏆 "Wall of fame + lunch with leadership" | 92 → compliance badge                       | compliance gold | Elena Ruiz QA_MANAGER   |
| RP-003 | August Sentiment Cup    | Team 1                 | sentiment-emotion / CUSTOMER_SENTIMENT_SCORE | 4.2 · 10          | 2026-08-01 → 2026-08-31 | completed (winnerId/Name = leader of `computeStandings` as of 2026-08-31 — compute at seed time) | TIME_OFF 🌴 "One extra day off"                       | 4.0 → sentiment badge                       | sentiment gold  | Maria García            |
| RP-004 | October Sales Push      | Team 1                 | business-insights / CONVERSION_RATE          | 30 · 10           | 2026-10-01 → 2026-10-31 | scheduled                                                                                        | BONUS 💰 "$250 bonus"                                 | 25 → business badge                         | business gold   | Maria García            |
| RP-005 | Q4 Compliance Marathon  | Team 1, Team 2, Team 3 | compliance / COMPLIANCE_OVERALL_SCORE        | 95 · 20           | 2026-10-01 → 2026-12-31 | draft                                                                                            | GIFT_CARD 🎁 "Team dinner"                            | —                                           | null            | Elena Ruiz              |

Reactions seed: `{ 'RP-001': { 'AGT-002': THUMBS_UP, 'AGT-001': FIRE, 'AGT-003': CLAPPING_HANDS } }`.
Note RP-001 and RP-004 both target Team 1 without conflict because their periods do not overlap — the rule is
**overlap-based**, which the editor's conflict banner explains.

### 6. Routes, sidebar, namespace

- `routes.tsx`: add `supervisor/rankings` (id `qa.supervisor.rankings`) and `qa-manager/rankings`
  (id `qa.qa-manager.rankings`) → `<ManagerRankingsPage />` (lazy). Keep `agent/rankings`.
- `roleNavigation.tsx`: `supervisor-rankings.to = '/qa/supervisor/rankings'`, `qamanager-rankings.to =
'/qa/qa-manager/rankings'`, all three rankings items `i18nNamespace: 'qa.rankings'`.
- Fix dead links: `NewSupervisorDashboard.tsx:362` → `/qa/supervisor/rankings`, `NewQAManagerDashboard.tsx:405` →
  `/qa/qa-manager/rankings`.
- `qaNamespaces.ts`: `qa.agent.rankings`, `qa.supervisor.rankings`, `qa.qa-manager.rankings` →
  `['qa.rankings', 'qa.teamAnalytics', 'qa.triggers', 'qa.team']`.

### 7. `ManagerRankingsPage` (`/qa/supervisor/rankings`, `/qa/qa-manager/rankings`)

- `role = roleFromPath`; `programs = useMemo(() => programsForRole(all, role))`.
- Header: eyebrow role · `Title` `page.title` · description · `Button leftSection={<IconPlus/>}` `page.new` (opens editor).
- `RankingsKpiStrip` (`StatCard` ×4): active · scheduled · completed · `agentsParticipating` (distinct agents in
  active programs' teams).
- `Tabs` (`?tab=`) active · scheduled · completed · drafts (counts). Content `SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}
spacing='lg'` of `RankingProgramCard`; `EmptyState` per tab (`empty.<tab>` with `page.new` action on active/drafts).
- `RankingProgramCard` (`SectionCard fullHeight`, `headerAccent` by type color): name (title), status `Badge`,
  type `Badge`, teams `Badge variant='outline'` list, `Text` metric · target (`formatTarget`), period line + `Progress`
  `elapsedPct` + `daysLeft` (`card.daysLeft`), prize row (`icon` + `title`), leader row (`card.leader` name + score) for
  active/completed, footer `Group`: `Button variant='light'` `card.view` · `Menu` (Edit / Duplicate / End now
  (active) / Cancel (scheduled) / Delete (draft — store `cancelProgram` sets `cancelled`; drafts are removed)).
- `ProgramDetailDrawer` (`AppDrawer size='xl'`): summary strip (`StatCard`: participants · qualified (score ≠ null) ·
  reached target · leader), `StandingsTable` (`BaseTable`: rank · agent (+ team when >1 team) · score vs target
  `Progress` inline + value · calls · delta arrow · milestones (emoji badges with tooltip)), Milestones + prize
  `SectionCard`s, winner block (`WinnerBadge` + name + prize) when completed. `useEffect(() => syncMilestones(id))`.
- `RankingEditorDrawer` (`AppDrawer size='xl'`, create or edit): `SectionCard`s **Basics** (name, description),
  **Scope** (`MultiSelect` teams — supervisor: value `['Team 1']`, disabled), **Evaluation** (`SegmentedControl`
  type with labels `types.*` → `Select` metric from `RANKING_METRICS[type]` labelled `metrics.<id>` from
  `qa.teamAnalytics` → `NumberInput` target (suffix `%` or `/5` from `METRIC_BY_ID[metricId].unit`) → `NumberInput`
  minCalls), **Period** (`DateInput` ×2 from `@mantine/dates` — check `package.json`; if absent use `TextInput
type='date'`; preset `Chip`s This month / Next month / This quarter), **Prize** (`PrizeEditor`: kind `Select`,
  title, description, icon `Select` of `PRIZE_ICONS`), **Milestones** (`MilestonesEditor`: rows label · threshold ·
  badge `Select` of active badges of the matching `area` from `useTriggerRulesStore().badges`, add/remove; winner
  badge `Select`), **Preview** (`ConflictBanner` when `conflictingProgram(...)` → `Alert color='red'` with the
  conflicting name/period and `Button` `editor.endConflict` → `endProgram(conflict.id)`; else top-5 standings as of
  today via `computeStandings`). Footer: `Button variant='light'` `editor.saveDraft` · `Button` `editor.launch`
  (label `editor.schedule` when start > today) disabled when invalid (name, ≥1 team, end > start, target > 0) or
  conflict. Errors via `notifyWarning`.

### 8. Agent page (`TeamRankingsPage`) — rebuilt

- `useActiveRanking()`: `team = TEAM_AGENTS.find((a) => a.id === AGENT_PERSONA_ID)!.team`; returns the program with
  `status === 'active' && teams.includes(team)` (or null) plus `pastPrograms` (completed for that team, newest first).
- `useStandings(program)`: `useMemo(() => computeStandings(program, TEAM_CALLS))`; `useEffect(() => syncMilestones(program.id))`.
- Layout `Stack gap='lg'`:
  1. `LeaderboardHeader` — keep; extend props `{ metadata, daysRemaining, prize?: RankingPrize, target?: string,
typeColor?: string }` and render a prize chip (`Badge size='lg' variant='light'` icon + title) and
     `header.target` line. Build `metadata` from the program (`scoreType` = `types.<type>` label, `createdBy` name).
  2. `SimpleGrid cols={{ base: 1, md: 2 }}`: `MyPositionCard fullHeight` (rank `#n` or `mine.unranked`
     `{{count}}` calls to qualify · score vs target `Progress` with `formatMetricValue` · delta arrow vs 7 days ·
     earned milestone emojis · `mine.nextMilestone` hint) | `PodiumStrip fullHeight` (top 3: `Avatar` initials with
     rank colours gold/silver/bronze via `light-dark()`, name, score; `WinnerBadge` on #1 when completed).
  3. `SectionCard 'Leaderboard'` → `ExpandedRankingsTable data={entries} currentAgentId={AGENT_PERSONA_ID}` /
     `RankingCardGrid` (compact) — add `currentAgentId` prop to both and a `.currentRow` highlight class; make `data`
     required (remove the `AGENT_RANKINGS` default). Row click → existing `RankingDetailDrawer` (reactions via the store).
  4. `PastRankingsCard` — `BaseTable` of `pastPrograms`: name · period · type · winner · prize.
  5. No active program → `EmptyState` (`empty.noActive`) + `PastRankingsCard` if any.
- `useUserReaction(agentId)` → `rankingsStore.reactions[programId]?.[agentId]` + `setReaction`. Delete the
  `userReactions` mutation. `gamification.ts`: replace the `AGENT_RANKINGS` import with a `data` parameter.
- Delete `hooks/useLeaderboardMetadata.ts`; delete `currentLeaderboard`, `userReactions`, `AGENT_RANKINGS`,
  `selectWinnerIfPeriodEnded` from `dashboard/mockData.ts` once nothing imports them (keep `buildAgentRankings` only
  if the drawer's deterministic derivations still import it; otherwise delete).
- **Strings**: convert `TeamRankingsPage`, `LeaderboardHeader`, table/card-grid headers and drawer tab labels to
  `qa.rankings` keys (`agent.*`, `table.*`, `drawer.*`). Other drawer internals stay.

### 9. Badges in the drawer

`RankingDetailDrawer/AchievementsTab` resolves each `entry.achievements` id first against
`useTriggerRulesStore((s) => s.badges)` (render `icon` in a circle of `color`, `name`, `tier`), falling back to
`PREDEFINED_BADGE_CATALOGS[id]` for legacy keys. Add a fourth drawer tab? No — keep three tabs.

### 10. Dashboard widgets

`NewAgentDashboard`, `NewSupervisorDashboard`, `NewQAManagerDashboard`: replace the hard-coded `RankingEntry[]`
arrays and `RankingGoal` with `useActiveRanking`-style data: the active program of Team 1 (agent/supervisor) or the
first active program (manager); `entries = standings.slice(0, 5).map(s => ({ position: s.rank ?? 0, name:
s.agentName, score: s.score ?? 0, reactions: {LIKE:0,…}, trend: delta>0?'up':delta<0?'down':'stable', trendValue:
|delta| }))`; `goal = { metric: types label, criteria: metric label, target: formatTarget, startDate, dueDate:
endDate, setBy: \`${createdBy} · ${role}\` }`; `onViewAll` → navigate to the role's rankings route. Keep the widget
API unchanged.

### 11. i18n — `src/locales/en/qa.rankings.json`

```json
{
	"page": {
		"eyebrow": {
			"supervisor": "Supervisor · Team 1",
			"qa-manager": "QA Manager · All teams"
		},
		"title": "Team Rankings",
		"description": "Run rankings on any evaluation aspect with a period, a target, a prize and milestone badges",
		"new": "New ranking"
	},
	"kpis": {
		"active": "Active",
		"scheduled": "Scheduled",
		"completed": "Completed",
		"agents": "Agents participating"
	},
	"tabs": {
		"active": "Active",
		"scheduled": "Scheduled",
		"completed": "Completed",
		"drafts": "Drafts"
	},
	"empty": {
		"active": "No active ranking — launch one to motivate the team",
		"scheduled": "Nothing scheduled",
		"completed": "No completed rankings yet",
		"drafts": "No drafts"
	},
	"status": {
		"draft": "Draft",
		"scheduled": "Scheduled",
		"active": "Active",
		"completed": "Completed",
		"cancelled": "Cancelled"
	},
	"types": {
		"qa": "QA",
		"sentiment-emotion": "Sentiment & Emotion",
		"compliance": "Compliance",
		"business-insights": "Business Insights"
	},
	"prizeKinds": {
		"BONUS": "Bonus",
		"TIME_OFF": "Time off",
		"GIFT_CARD": "Gift card",
		"RECOGNITION": "Recognition",
		"OTHER": "Other"
	},
	"card": {
		"target": "Target {{value}} · min. {{calls}} calls",
		"period": "{{from}} → {{to}}",
		"daysLeft_one": "{{count}} day left",
		"daysLeft_other": "{{count}} days left",
		"ended": "Ended",
		"leader": "Leader",
		"winner": "Winner",
		"prize": "Prize",
		"view": "View standings",
		"edit": "Edit",
		"duplicate": "Duplicate",
		"end": "End now",
		"cancel": "Cancel",
		"delete": "Delete draft"
	},
	"drawer": {
		"participants": "Participants",
		"qualified": "Qualified",
		"reachedTarget": "Reached target",
		"leader": "Leader",
		"standings": "Standings",
		"milestones": "Milestones",
		"prize": "Prize",
		"winner": "Winner",
		"columns": {
			"rank": "#",
			"agent": "Agent",
			"team": "Team",
			"score": "Score",
			"calls": "Calls",
			"delta": "7-day",
			"milestones": "Badges"
		},
		"unranked": "Below minimum calls"
	},
	"editor": {
		"titleNew": "New ranking",
		"titleEdit": "Edit ranking",
		"basics": "Basics",
		"name": "Name",
		"description": "Description",
		"scope": "Scope",
		"teams": "Teams",
		"teamsLocked": "Supervisors rank their own team",
		"evaluation": "What is ranked",
		"type": "Evaluation type",
		"metric": "Metric",
		"target": "Target score",
		"minCalls": "Minimum calls to qualify",
		"period": "Period",
		"start": "Start",
		"end": "End",
		"presets": {
			"thisMonth": "This month",
			"nextMonth": "Next month",
			"quarter": "This quarter"
		},
		"prize": "Prize",
		"prizeKind": "Type",
		"prizeTitle": "Title",
		"prizeDescription": "Description",
		"prizeIcon": "Icon",
		"milestones": "Milestone badges",
		"milestoneLabel": "Label",
		"milestoneThreshold": "At score",
		"milestoneBadge": "Badge",
		"addMilestone": "Add milestone",
		"winnerBadge": "Winner badge",
		"noBadge": "No badge",
		"preview": "Preview",
		"previewHint": "Standings as of today with the current settings",
		"conflict": "{{name}} is already running for {{teams}} ({{from}} → {{to}}). Only one ranking per team at a time.",
		"endConflict": "End it now",
		"saveDraft": "Save draft",
		"launch": "Start ranking",
		"schedule": "Schedule",
		"validation": {
			"name": "Name is required",
			"teams": "Pick at least one team",
			"dates": "End must be after start",
			"target": "Target must be greater than 0"
		},
		"saved": "Ranking saved",
		"launched": "Ranking started — agents have been notified",
		"scheduled": "Ranking scheduled",
		"ended": "Ranking ended — {{winner}} wins",
		"cancelled": "Ranking cancelled"
	},
	"agent": {
		"leaderboard": "Leaderboard",
		"leaderboardDescription": "Everyone on the team ranked by score — select a row for details",
		"header": {
			"target": "Target {{value}}",
			"prize": "Prize",
			"daysLeft_one": "{{count}} day left",
			"daysLeft_other": "{{count}} days left",
			"completed": "Completed",
			"setBy": "Set by {{name}}"
		},
		"mine": {
			"title": "My position",
			"rank": "#{{rank}} of {{total}}",
			"unranked": "{{count}} more calls to qualify",
			"score": "Score",
			"target": "Target",
			"delta": "vs 7 days ago",
			"milestones": "Milestones earned",
			"nextMilestone": "Next: {{label}} at {{value}}",
			"reachedTarget": "Target reached"
		},
		"podium": {
			"title": "Podium",
			"first": "1st",
			"second": "2nd",
			"third": "3rd"
		},
		"past": {
			"title": "Past rankings",
			"columns": {
				"name": "Ranking",
				"period": "Period",
				"type": "Type",
				"winner": "Winner",
				"prize": "Prize"
			},
			"empty": "No past rankings yet"
		},
		"empty": { "noActive": "No active ranking for your team right now" }
	},
	"table": {
		"rank": "Rank",
		"name": "Name",
		"score": "Score",
		"achievements": "Badges",
		"reactions": "Reactions"
	},
	"drawerTabs": {
		"achievements": "Badges",
		"reactions": "Reactions",
		"metrics": "Metrics"
	}
}
```

## Tasks

1. **Model + constants + helpers + seed + stores** — §1–§5, `awardBadge`. Typecheck.
2. **Routes / sidebar / namespace / i18n** — §6, §11 (en + es), `qaNamespaces`. Typecheck.
3. **Manager page** — §7 (page, KPI strip, card, detail drawer, standings table, editor + milestones/prize editors,
   conflict banner). Typecheck.
4. **Agent page** — §8, §9 (rebuild, new cards, reactions on the store, deletions). Typecheck.
5. **Dashboard widgets** — §10. Typecheck. Commit `feat(qa-rankings): manager ranking programs and store-backed agent leaderboard`.

## Verification

- `/qa/supervisor/rankings`: Active shows RP-001 (Team 1) and not RP-002; "New ranking" → Scope locked to Team 1 →
  period Sept 2026 → Preview shows the conflict banner naming RP-001; "End it now" → RP-001 completed with a winner,
  agent inbox shows WON/ENDED rows; the new ranking can now launch and agents receive STARTED.
- `/qa/qa-manager/rankings`: all five programs across tabs; drawer standings for RP-002 span Team 2 + 3 with
  ≥ 14 rows; qualified count < participants because of `minCalls`.
- `/qa/agent/rankings`: header shows prize 🎁 and target 90 %; My position card shows John Smith's rank computed
  from `TEAM_CALLS`; own row highlighted; reactions persist across drawer open/close; Past rankings lists RP-003
  with its winner; Triggers → Badges shows the winner/milestone holders growing.
- Dashboards' Team Rankings widget shows the same top 5 as the agent page.

# Plan 2 of 5 — Inbox: typed notification detail, threads, role inboxes and sidebar counters

> Part of the five chained plans approved 2026-09-14. Depends on Plan 1.

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

# PLAN 2 — Inbox: typed notification detail, threads, role inboxes and sidebar counters

Depends on Plan 1 (`SectionCard fullHeight`).

## Goal

Every notification carries a typed `payload`; clicking a row opens `NotificationDetailDrawer`, which renders a
kind-specific detail (metric alert with sparkline, trend warning, burnout risk, recognition, badge, weekly summary,
coaching session, LMS assignment, customer follow-up, dispute update, ranking update, plain message) plus actions and a
reply thread. The one `InboxPage` becomes role-aware (agent AGT-004, supervisor SUP-001, QA manager QAM-001 each see
only what is addressed to them), gets i18n, "mark all as read", and the sidebar shows an unread counter for the three
roles using the existing disputes-badge slot.

## Architecture

```
src/models/qa/notifications.ts                    ← + NotificationRecipientRole, NotificationPayload, 3 optional fields
src/stores/qa/notificationStore.ts                ← seed from INBOX_SEED; + addReply, markAllAsRead, selectors
src/modules/qa/team/constants.ts                  ← + AGENT_PERSONA_ID = 'AGT-004'
src/modules/qa/inbox/
  constants.ts        ← INBOX_IDENTITY, inboxIdentityFromPath, disputesBasePath, rankingsBasePath, CATEGORY_META
  helpers.ts          ← inboxFor, unreadCountFor, buildNotification (typed factory used by other stores)
  mockData.ts         ← INBOX_SEED (agent + supervisor + QA manager)
  components/
    NotificationDetailDrawer.tsx  NotificationMeta.tsx  MessageThread.tsx  ActionButtons.tsx
    details/MetricAlertDetail.tsx  TrendWarningDetail.tsx  BurnoutRiskDetail.tsx  RecognitionDetail.tsx
            BadgeEarnedDetail.tsx  WeeklySummaryDetail.tsx  CoachingSessionDetail.tsx  LmsAssignmentDetail.tsx
            FollowUpDetail.tsx  DisputeUpdateDetail.tsx  RankingUpdateDetail.tsx
    details/index.tsx             ← PayloadDetail switch
src/modules/qa/dashboard/pages/InboxPage.tsx      ← role identity, drawer, mark-all, i18n
src/modules/qa/agent/inbox/{AgentInboxTable,InboxFilters}.tsx ← i18n, optional "About" column
src/components/Sidebar/Sidebar.tsx                ← badge 'inbox'
src/components/Sidebar/roleNavigation.tsx         ← agent badge, + supervisor-inbox, + qamanager-inbox
src/locales/{en,es}/qa.inbox.json                 ← NEW namespace
src/locales/{en,es}/common.json                   ← sidebar.supervisor.inbox, sidebar.qamanager.inbox
src/modules/qa/qaNamespaces.ts                    ← 4 inbox route ids → ['qa.inbox','qa.teamAnalytics','qa.team']
```

## Spec

### 1. Model (`src/models/qa/notifications.ts`) — add, keep everything else

```ts
import type {
	BadgeTier,
	EvaluationArea,
	TriggerMetricId,
} from './triggerRules';
import type { CallEvaluationTab } from '~/views/Campaigns/types';

export type NotificationRecipientRole = 'AGENT' | 'SUPERVISOR' | 'QA_MANAGER';

export type NotificationPayload =
	| { kind: 'MESSAGE' }
	| {
			kind: 'METRIC_ALERT';
			area: EvaluationArea;
			metricId: TriggerMetricId;
			value: number;
			threshold: number;
			direction: 'BELOW' | 'ABOVE';
			windowLabel: string;
			sparkline: number[];
			ruleName?: string;
	  }
	| {
			kind: 'TREND_WARNING';
			area: EvaluationArea;
			metricId: TriggerMetricId;
			from: number;
			to: number;
			deltaPct: number;
			periodLabel: string;
			sparkline: number[];
			ruleName?: string;
	  }
	| {
			kind: 'BURNOUT_RISK';
			level: 'medium' | 'high';
			percentage: number;
			drivers: string[];
	  }
	| {
			kind: 'RECOGNITION';
			type: 'MILESTONE' | 'STREAK' | 'IMPROVEMENT';
			area?: EvaluationArea;
			metricId?: TriggerMetricId;
			value?: number;
			streakWeeks?: number;
			deltaPct?: number;
	  }
	| {
			kind: 'BADGE_EARNED';
			badgeId: string;
			badgeName: string;
			badgeIcon: string;
			badgeColor: string;
			tier: BadgeTier;
			reason: string;
	  }
	| {
			kind: 'WEEKLY_SUMMARY';
			weekLabel: string;
			kpis: { label: string; value: string; delta: number | null }[];
			highlights: string[];
	  }
	| {
			kind: 'COACHING_SESSION';
			sessionId: string;
			date: string;
			coachName: string;
			topic: string;
	  }
	| {
			kind: 'LMS_ASSIGNMENT';
			assignmentId: string;
			contentTitle: string;
			dueDate: string;
			mandatory: boolean;
	  }
	| {
			kind: 'FOLLOW_UP';
			customerId: string;
			customerName: string;
			dueDate: string;
	  }
	| {
			kind: 'DISPUTE_UPDATE';
			disputeId: string;
			status: 'open' | 'accepted' | 'rejected';
			evaluationType: CallEvaluationTab;
			callId: string;
			agentName: string;
			scoreBefore: number | null;
			scoreAfter: number | null;
	  }
	| {
			kind: 'RANKING_UPDATE';
			rankingId: string;
			rankingName: string;
			event: 'STARTED' | 'POSITION_CHANGED' | 'MILESTONE' | 'ENDED' | 'WON';
			rank?: number;
			previousRank?: number;
			prizeTitle?: string;
			badgeName?: string;
	  };
```

In `AgentNotification` add (all optional so existing seeds/writers keep compiling):

```ts
	/** Who this lands with. Undefined = AGENT (legacy). `agentId` is the agent the notification is ABOUT. */
	recipientRole?: NotificationRecipientRole;
	/** SUP-001 / QAM-001 for manager inboxes. Undefined = agentId. */
	recipientId?: string;
	payload?: NotificationPayload;
```

### 2. Constants + helpers (`src/modules/qa/inbox/`)

```ts
// constants.ts
export type InboxRole = 'agent' | 'supervisor' | 'qa-manager';
export const INBOX_IDENTITY: Record<
	InboxRole,
	{ role: NotificationRecipientRole; id: string; name: string }
> = {
	agent: { role: 'AGENT', id: AGENT_PERSONA_ID, name: 'John Smith' },
	supervisor: {
		role: 'SUPERVISOR',
		id: SUPERVISOR_PERSONA.id,
		name: SUPERVISOR_PERSONA.name,
	},
	'qa-manager': {
		role: 'QA_MANAGER',
		id: QA_MANAGER_PERSONA.id,
		name: QA_MANAGER_PERSONA.name,
	},
};
export const inboxRoleFromPath = (pathname: string): InboxRole =>
	pathname.startsWith('/qa/supervisor')
		? 'supervisor'
		: pathname.startsWith('/qa/qa-manager') ||
			  pathname.startsWith('/qa/operation-manager')
			? 'qa-manager'
			: 'agent';
export const disputesBasePath = (r: InboxRole) => `/qa/${r}/disputes`;
export const rankingsBasePath = (r: InboxRole) => `/qa/${r}/rankings`;
export const analyticsPath = (r: InboxRole) =>
	r === 'agent' ? '/qa/agent/analytics' : `/qa/${r}/analytics`;
export const CATEGORY_META: Record<
	AgentNotification['category'],
	{ color: string; icon: TablerIcon }
> = {
	DIRECT_MESSAGE: { color: 'blue', icon: IconMessage },
	METRIC_ALERT: { color: 'red', icon: IconAlertTriangle },
	TREND_WARNING: { color: 'orange', icon: IconTrendingDown },
	POSITIVE_RECOGNITION: { color: 'green', icon: IconTrophy },
	WEEKLY_SUMMARY: { color: 'grape', icon: IconCalendarStats },
};
export const PRIORITY_COLOR: Record<AgentNotification['priority'], string> = {
	CRITICAL: 'red',
	HIGH: 'orange',
	NORMAL: 'blue',
	LOW: 'gray',
};
```

(Verify `SUPERVISOR_PERSONA` / `QA_MANAGER_PERSONA` export names and shape in `team/constants.ts` — `teamStore.ts:28`
uses them with `.id`.)

```ts
// helpers.ts
export const isForInbox = (
	n: AgentNotification,
	role: NotificationRecipientRole,
	id: string
) =>
	!n.archived &&
	(n.recipientRole ?? 'AGENT') === role &&
	(n.recipientId ?? n.agentId) === id;
export const inboxFor = (all: AgentNotification[], role, id) =>
	all.filter((n) => isForInbox(n, role, id));
export const unreadCountFor = (all, role, id) =>
	all.filter((n) => isForInbox(n, role, id) && !n.read).length;

let counter = 5000;
export const nextNotificationId = () => `ntf-${++counter}`;
/** Typed factory every store uses from now on. */
export function buildNotification(input: {
	agentId: string;
	recipientRole?: NotificationRecipientRole;
	recipientId?: string;
	category: AgentNotification['category'];
	priority?: AgentNotification['priority'];
	title: string;
	message: string;
	icon: string;
	sourceRole: AgentNotification['sourceRole'];
	sourceId?: string;
	metric?: AgentNotification['metric'];
	payload?: NotificationPayload;
	actions?: AgentNotification['actions'];
	threadId?: string;
	createdAt?: string;
}): AgentNotification {
	return {
		id: nextNotificationId(),
		read: false,
		archived: false,
		actioned: false,
		priority: 'NORMAL',
		createdAt: NOW_ISO,
		...input,
	};
}
```

Re-point `teamStore.notify`, `coachingStore.notifyAgent`, `lmsStore.notifyAgent`, `customersStore.scheduleFollowUp`
to `buildNotification` and give them payloads: coaching → `{ kind: 'COACHING_SESSION', … }`, LMS →
`{ kind: 'LMS_ASSIGNMENT', … }`, customers → `{ kind: 'FOLLOW_UP', … }`, team `sendMessage` → `{ kind: 'MESSAGE' }`.

### 3. Store (`notificationStore.ts`)

- `notifications: INBOX_SEED` (from `~/modules/qa/inbox/mockData`); keep `SUPERVISOR_TRIGGERS`/`QA_MANAGER_TRIGGERS`.
- `addReply(notificationId: string, reply: { fromRole: 'AGENT'|'SUPERVISOR'|'QA_MANAGER'; fromId: string; message: string }): void`
  → append `{ id: nextNotificationId(), createdAt: NOW_ISO, ...reply }` to `replies`, set `actioned: true`.
- `markAllAsRead(role: NotificationRecipientRole, id: string): void` → every `isForInbox && !read` → `read: true, readAt`.
- `export const selectNotifications = (s) => s.notifications;` — components derive with `useMemo`.
- Keep the existing getters for compatibility.

### 4. Seed (`src/modules/qa/inbox/mockData.ts`) — `INBOX_SEED: AgentNotification[]`

Use `buildNotification` with explicit `id`s (override) and `createdAt` spread over the last 14 days. Agent inbox
(AGT-004) — 13 entries, one per kind: METRIC_ALERT (QA_OVERALL_SCORE 71 < 75, sparkline `[82,80,78,76,74,72,71]`,
CRITICAL, SYSTEM, ruleName 'QA score drop'), TREND_WARNING (CUSTOMER_SENTIMENT_SCORE 4.1→3.6, −12 %, 'Last 14 days',
HIGH), BURNOUT_RISK (medium 55 %, drivers `['negativeEmotionShare','qaScoreTrend']`, HIGH, SYSTEM), RECOGNITION
(STREAK 3 weeks in top 3, POSITIVE_RECOGNITION, LOW), BADGE_EARNED (use a real `BadgeDefinition` from
`src/modules/qa/triggers/mockData.ts` where AGT-004 is a holder — copy id/name/icon/color/tier), WEEKLY_SUMMARY
(week 'Sep 1–7', kpis QA 84 % (+2), Compliance 92 % (0), Sentiment 3.9 (−0.2), Calls 61 (+4), 2 highlights),
COACHING_SESSION (2026-09-15T14:00, Maria García, 'Objection handling'), LMS_ASSIGNMENT ('Compliance refresher',
due 2026-09-20, mandatory), DISPUTE_UPDATE (DSP-1003 accepted, qa, call CALL-2031, 71→82), RANKING_UPDATE
(POSITION_CHANGED rank 4→3 in 'September QA Sprint'), 2× DIRECT_MESSAGE from SUPERVISOR (one with two replies),
1× DIRECT_MESSAGE from QA_MANAGER. Mix `read` true/false so unread = 6.

Supervisor inbox (recipient SUP-001) — 7: DISPUTE_UPDATE open (David Brown, compliance), RANKING_UPDATE ENDED,
BURNOUT_RISK high (David Brown 78 %, about agentId AGT-006), METRIC_ALERT team compliance 88 < 90, DIRECT_MESSAGE
reply from AGT-004 (threadId = the agent's message id), WEEKLY_SUMMARY team, FOLLOW_UP (customer overdue). Unread 4.

QA Manager inbox (recipient QAM-001) — 6: 2× DISPUTE_UPDATE open (Team 1 qa, Team 3 sentiment), TREND_WARNING
org compliance, RANKING_UPDATE STARTED (Team 2), BADGE_EARNED about AGT-011, DIRECT_MESSAGE from a supervisor. Unread 3.

### 5. `NotificationDetailDrawer`

Props `{ notification: AgentNotification | null; opened: boolean; onClose(): void; viewer: InboxRole }`.
`AppDrawer size='lg'`, `title={notification.title}`, `description={t('drawer.from', { name, role })} · <relative date>`,
`icon={CATEGORY_META[category].icon}`, `iconColor`. Body `Stack gap='lg'`:

| Block                                  | Content                                                                                                                                                                                                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NotificationMeta`                     | `Group gap='xs'`: category `Badge` (color from `CATEGORY_META`), priority `Badge variant='outline'` (`PRIORITY_COLOR`), metric area badge when `metric`, `Text size='xs' c='dimmed'` absolute date (`dayjs(createdAt).format('DD MMM YYYY · HH:mm')`)                                                 |
| Message                                | `Text` with `style`-free pre-wrap via class `.message { white-space: pre-wrap }`                                                                                                                                                                                                                      |
| `PayloadDetail`                        | switch on `payload?.kind ?? 'MESSAGE'` → component below; wrapped in `Paper withBorder p='md' radius='md'`                                                                                                                                                                                            |
| `ActionButtons`                        | `notification.actions` → `Button variant='light' size='sm'` each (navigate to `url`); plus the kind CTA                                                                                                                                                                                               |
| `MessageThread`                        | `Text fw={600}` `t('drawer.thread')`; replies as `Paper` bubbles: `fromRole === INBOX_IDENTITY[viewer].role` → aligned right, `bg='var(--mantine-color-blue-light)'`; else left default; name + time; `Textarea` + `Button` `t('drawer.send')`. Hidden when `sourceRole === 'SYSTEM'` and no replies. |
| Footer (`headerActions` of the drawer) | `ActionIcon` mark unread (`IconMailOpened`) · archive (`IconArchive`)                                                                                                                                                                                                                                 |

Kind detail contents (each a small component; all labels from `qa.inbox` `details.*`; metric labels from
`useTranslation('qa.teamAnalytics')` `metrics.<id>`; values via `formatMetricValue` from `~/modules/qa/triggers/helpers`):

| kind             | Shows                                                                                                                                                                                 | CTA                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| METRIC_ALERT     | `SimpleGrid cols={3}`: current value (red), threshold, window; `Sparkline h={48} color='red'`; `ruleName` chip                                                                        | `t('details.metricAlert.cta')` → `analyticsPath(viewer)`                                                               |
| TREND_WARNING    | from → to with `deltaPct` (`IconArrowDownRight` orange), `periodLabel`, sparkline orange                                                                                              | analytics                                                                                                              |
| BURNOUT_RISK     | level `Badge` (medium orange / high red), `Progress value=percentage`, drivers as `Badge variant='outline' tt='none'` using `t(\`burnout.drivers.${d}\`, { ns: 'qa.teamAnalytics' })` | `t('details.burnout.cta')` → focuses the reply textarea (agent) / opens `/qa/<role>/analytics?view=burnout` (managers) |
| RECOGNITION      | `ThemeIcon size='xl' color='green' variant='light'` `IconTrophy`; type label; value / streakWeeks / deltaPct line                                                                     | —                                                                                                                      |
| BADGE_EARNED     | 56 px circle in `badgeColor` with the emoji, `badgeName`, tier `Badge`, `reason`                                                                                                      | `t('details.badge.cta')` → `rankingsBasePath('agent')`                                                                 |
| WEEKLY_SUMMARY   | `weekLabel`; `SimpleGrid cols={{ base: 2, sm: 4 }}` of tiles (label, value, delta arrow green/red/gray); highlights `List`                                                            | analytics                                                                                                              |
| COACHING_SESSION | date (`dayjs` `ddd DD MMM · HH:mm`), coach, topic                                                                                                                                     | `/qa/agent/lms?tab=coaching` (agent) / `/qa/<role>/coaching` (managers)                                                |
| LMS_ASSIGNMENT   | title, due (red + `t('details.lms.overdue')` when `< TODAY`), mandatory badge                                                                                                         | `/qa/agent/lms`                                                                                                        |
| FOLLOW_UP        | customer, due                                                                                                                                                                         | `customersBasePath(role)`/`:customerId` (managers) — agent: no CTA                                                     |
| DISPUTE_UPDATE   | status `Badge` (open blue / accepted green / rejected red), evaluation type `Badge` (color from `CALL_EVALUATION_TABS`), call id, `scoreBefore → scoreAfter` when both non-null       | `${disputesBasePath(viewer)}/${disputeId}`                                                                             |
| RANKING_UPDATE   | event label; rank block `#rank` with arrow vs `previousRank`; `prizeTitle` / `badgeName` when present                                                                                 | `rankingsBasePath(viewer)`                                                                                             |
| MESSAGE          | nothing                                                                                                                                                                               | —                                                                                                                      |

Sending a reply: `addReply(id, { fromRole, fromId, message })` then `addNotification(buildNotification({...}))` to the
other party: agent viewer → recipient = `sourceRole` / `sourceId` of the original (`SUPERVISOR` → SUP-001,
`QA_MANAGER` → QAM-001), `agentId: AGENT_PERSONA_ID`, `sourceRole: 'SYSTEM'`? No — replies are from the agent, and
`sourceRole` has no `AGENT` value; extend `sourceRole` union with `'AGENT'` (add to the model; `CATEGORY_META` unaffected).
Manager viewer → recipient AGENT `notification.agentId`, `sourceRole` = viewer's role. `threadId` = original id,
`category: 'DIRECT_MESSAGE'`, `payload: { kind: 'MESSAGE' }`, `title: t('reply.title', { name })`.

### 6. `InboxPage`

- `const role = inboxRoleFromPath(location.pathname); const me = INBOX_IDENTITY[role];`
- `const all = useNotificationStore(selectNotifications); const mine = useMemo(() => inboxFor(all, me.role, me.id), …)`
  then the existing filter pipeline over `mine`.
- Header: eyebrow `t(\`page.eyebrow.${role}\`)`, `t('page.title')`, `t('page.description')`, unread `Badge`
`t('page.unread', { count })`, `Button variant='light'` `t('page.markAllRead')`→`markAllAsRead(me.role, me.id)`
  (disabled when 0). Drop the "Back" button.
- Row click → `setSelected(n)`; `markAsRead` if unread; render `NotificationDetailDrawer`.
- `AgentInboxTable` new prop `showAbout?: boolean` (true for managers) → column `t('table.columns.about')` showing
  the roster agent name for `n.agentId` (`TEAM_AGENTS.find`).
- All strings in `InboxPage`, `AgentInboxTable`, `InboxFilters` → `qa.inbox` keys.

### 7. Sidebar

- `Sidebar.tsx:93` → `badge?: 'disputes' | 'inbox';`
- In `SidebarLinkItem`: keep the disputes query; add
  ```ts
  const notifications = useNotificationStore(selectNotifications);
  const inboxUnread = useMemo(() => {
  	if (item.badge !== 'inbox') return 0;
  	const me = INBOX_IDENTITY[inboxRoleFromPath(item.to)];
  	return unreadCountFor(notifications, me.role, me.id);
  }, [item.badge, item.to, notifications]);
  const badgeCount =
  	item.badge === 'inbox'
  		? inboxUnread
  		: item.badge === 'disputes'
  			? openDisputesCount
  			: 0;
  ```
  and render `{badgeCount > 0 && <Badge size='sm' variant='filled'>{badgeCount}</Badge>}`.
- `roleNavigation.tsx`: `agent-inbox` → add `badge: 'inbox', i18nNamespace: 'qa.inbox'`; add
  `{ key: 'supervisor-inbox', label: 'sidebar.supervisor.inbox', icon: <IconInbox size={20} className={styles.menuIcon} />, to: '/qa/supervisor/inbox', i18nNamespace: 'qa.inbox', badge: 'inbox' }`
  after `supervisor-dashboard` and include it in the `supervisor-primary` group (`items: [items[0], byKey['supervisor-inbox']]`);
  same for `qamanager-inbox` (`/qa/qa-manager/inbox`, group `qamanager-primary`). `common.json` en: `sidebar.supervisor.inbox: "Inbox"`, `sidebar.qamanager.inbox: "Inbox"`; es: `"Bandeja de entrada"`.

### 8. i18n — `src/locales/en/qa.inbox.json`

```json
{
	"page": {
		"eyebrow": {
			"agent": "Agent · John Smith",
			"supervisor": "Supervisor · Team 1",
			"qa-manager": "QA Manager · All teams"
		},
		"title": "Inbox",
		"description": "Alerts, recognitions, messages and updates routed to you",
		"unread_one": "{{count}} unread",
		"unread_other": "{{count}} unread",
		"markAllRead": "Mark all as read",
		"sectionTitle": "Notifications",
		"sectionDescription": "Everything routed to you this period"
	},
	"table": {
		"columns": {
			"type": "Type",
			"title": "Title",
			"priority": "Priority",
			"source": "From",
			"about": "Agent",
			"date": "Date"
		},
		"actions": {
			"view": "View details",
			"markRead": "Mark as read",
			"markUnread": "Mark as unread",
			"archive": "Archive"
		},
		"empty": "No notifications match the current filters"
	},
	"categories": {
		"DIRECT_MESSAGE": "Message",
		"METRIC_ALERT": "Metric alert",
		"TREND_WARNING": "Trend warning",
		"POSITIVE_RECOGNITION": "Recognition",
		"WEEKLY_SUMMARY": "Weekly summary"
	},
	"priorities": {
		"CRITICAL": "Critical",
		"HIGH": "High",
		"NORMAL": "Normal",
		"LOW": "Low"
	},
	"sources": {
		"SUPERVISOR": "Supervisor",
		"QA_MANAGER": "QA Manager",
		"SYSTEM": "System",
		"AGENT": "Agent"
	},
	"filters": {
		"status": { "all": "All", "read": "Read", "unread": "Unread" },
		"types": "Types",
		"dateFrom": "From",
		"dateTo": "To",
		"search": "Search title or message",
		"clear": "Clear filters"
	},
	"drawer": {
		"from": "From {{name}} · {{role}}",
		"thread": "Conversation",
		"noReplies": "No replies yet",
		"replyPlaceholder": "Write a reply…",
		"send": "Send",
		"markUnread": "Mark as unread",
		"archive": "Archive",
		"actions": "Actions"
	},
	"reply": { "title": "Reply from {{name}}" },
	"details": {
		"metricAlert": {
			"current": "Current",
			"threshold": "Threshold",
			"window": "Window",
			"direction": { "BELOW": "below", "ABOVE": "above" },
			"rule": "Rule: {{name}}",
			"cta": "Open analytics"
		},
		"trendWarning": {
			"from": "Was",
			"to": "Now",
			"change": "Change",
			"period": "Period",
			"cta": "Open analytics"
		},
		"burnout": {
			"level": "Risk level",
			"levels": { "medium": "Medium", "high": "High" },
			"drivers": "Drivers",
			"cta": "Reply to your supervisor",
			"ctaManager": "Open burnout analytics"
		},
		"recognition": {
			"MILESTONE": "Milestone reached",
			"STREAK": "{{count}}-week streak",
			"IMPROVEMENT": "Improved {{delta}}%",
			"value": "Value"
		},
		"badge": {
			"earned": "Badge earned",
			"tier": { "BRONZE": "Bronze", "SILVER": "Silver", "GOLD": "Gold" },
			"cta": "View my badges"
		},
		"weekly": {
			"week": "Week {{label}}",
			"highlights": "Highlights",
			"cta": "Open analytics"
		},
		"coaching": {
			"when": "When",
			"coach": "Coach",
			"topic": "Topic",
			"cta": "Open coaching"
		},
		"lms": {
			"content": "Content",
			"due": "Due",
			"overdue": "Overdue",
			"mandatory": "Mandatory",
			"cta": "Open assignment"
		},
		"followUp": {
			"customer": "Customer",
			"due": "Due",
			"cta": "Open customer"
		},
		"dispute": {
			"status": {
				"open": "Open",
				"accepted": "Accepted",
				"rejected": "Rejected"
			},
			"call": "Call",
			"score": "Score",
			"cta": "Open dispute"
		},
		"ranking": {
			"events": {
				"STARTED": "Ranking started",
				"POSITION_CHANGED": "Position changed",
				"MILESTONE": "Milestone reached",
				"ENDED": "Ranking ended",
				"WON": "You won!"
			},
			"rank": "Rank",
			"previous": "was #{{rank}}",
			"prize": "Prize",
			"cta": "Open ranking"
		}
	}
}
```

## Tasks

1. **Model + constants + helpers + seed** — §1, §2, §4; `AGENT_PERSONA_ID`; re-point the four existing writers to
   `buildNotification` with payloads; store §3. Typecheck.
2. **Namespace + i18n conversion + sidebar** — §7, §8 (en + es), `qaNamespaces.ts` (`qa.agent.inbox`,
   `qa.supervisor.inbox`, `qa.qa-manager.inbox`, `qa.operation-manager.inbox` → `['qa.inbox','qa.teamAnalytics','qa.team']`),
   convert `InboxPage`/`AgentInboxTable`/`InboxFilters` strings. Typecheck.
3. **Drawer + details + thread** — §5 (13 files). Typecheck.
4. **Wire `InboxPage`** — §6. Typecheck. Commit `feat(qa-inbox): typed notification detail, role inboxes and sidebar counters`.

## Verification

- `/qa/agent/inbox`: 13 rows, sidebar badge **6**; open each kind → the right detail; reply on the supervisor message
  → thread shows it and `/qa/supervisor/inbox` gains an unread row (badge +1); "Mark all as read" zeroes the badge.
- `/qa/supervisor/inbox`: 7 rows, "Agent" column present, badge 4. `/qa/qa-manager/inbox`: 6 rows, badge 3.
- Coaching → schedule a session for AGT-004 → agent inbox shows a COACHING_SESSION row whose detail has the CTA.
- Key parity: `node -e "const f=require('fs');const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?flat(v,p+k+'.'):[p+k]);const a=flat(require('./src/locales/en/qa.inbox.json')),b=new Set(flat(require('./src/locales/es/qa.inbox.json')));console.log(a.filter(k=>!b.has(k)))"` → `[]`.

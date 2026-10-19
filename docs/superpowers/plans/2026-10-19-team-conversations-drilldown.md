# Conversations: team-wide calls list for Supervisor and QA Manager, drill-down target of the Performance Score cards

## Context

The Supervisor and QA Manager dashboards show five Performance Score cards (Operational, Quality Assurance, Compliance, Sentiment & Emotion, Business Insights). Their rows already carry a calls count ("12 calls") and are clickable, but every click opens Team Analytics with no filter (`NewSupervisorDashboard.tsx:50-51`, `NewQAManagerDashboard.tsx:231`, both with the comment "no team calls list exists yet"). The Agent role already has the intended behaviour: its dashboard rows open My Calls pre-filtered with `?issue=<key>&period=…`.

This plan adds a **Conversations** section for both roles: a cross-campaign list of the team's calls, with filters, that the cards drill into. Clicking the QA card's ECN row shows the ECN calls of the whole team, whatever campaign they belong to, and the row count matches the card.

Decisions made with the user (2026-10-19):

- **Name:** "Conversations" / "Conversaciones" in the sidebar and page title.
- **Scope:** the list shows **all** scoped calls (supervisor: own team, agents with `supervisorId === 'SUP-001'`; QA manager: everyone). Arriving from a card preselects the issue filter, which the user can remove. Cards without an incidence (the Operational "N calls" total) have a destination too.
- **Period:** the list opens with the dashboard's **currently selected** Performance Score period (`today`/`week`/`month`/`quarter`/`sixMonths`, default `week`) and line of business, so the count equals the card's figure. The user can change it afterwards.

Mode: mockup on the existing `TEAM_CALLS` mock data; no backend. Mantine v9, CSS modules, Mantine variables and `light-dark()`, no inline styles, every string in `en` and `es`. Shared primitives `SectionCard`, `BaseTable`, `ContentContainer`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-19-team-conversations-drilldown.md`.

---

## Verified facts (do not re-explore)

- **Dashboards.** `src/modules/qa/dashboard/pages/NewSupervisorDashboard.tsx`: `ANALYTICS_PATH` L50-51, `openAnalytics` L84, cards L108-167, state `period: PerformanceScorePeriod` (L58) and `lineOfBusiness: DashboardLineOfBusiness | null` (L62). `NewQAManagerDashboard.tsx`: `ANALYTICS_PATH` L231, `openAnalytics` L310, cards L334-393, same state. Card click props: `OperationalCard.onNonEffectiveClick`, `QualityAssuranceCard.onCategoryClick(key: 'ecn'|'enc'|'ecc'|'ecuf'|'autoFails')` (fires only when `issueCounts[key] > 0`), `ComplianceCard.onCategoryClick(name: 'Security'|'Regulatory'|'Legal')`, `SentimentEmotionSplitCard.onReviewClick('agent'|'customer')`. `OperationalCard.tsx` L81-86 is the total-calls block (not clickable); L89-109 the Effective row (static `DrillRow`); L111-134 the Non-effective row (`DrillRow onClick` + `IconChevronRight` when `clickable`).
- **Card data = `teamCallsInWindow`.** `src/modules/qa/calls/agentMetrics.ts:156` `teamCallsInWindow(role: TeamRole, days, lineOfBusiness?, endOffsetDays = 0)` returns the scoped calls (`scopeAgents(role)`, `src/modules/qa/analytics/helpers.ts:130`) whose date falls in the `days`-day window ending `TODAY` (string comparison on `YYYY-MM-DD`). `aggregateDashboardMetrics` (L180) counts `qaIssueCounts[k] = qaScores[k] > 0`, compliance issues `< thresholds.compliance.areaTargetPerCall`, negative emotions via `isNegativeEmotion` — the same predicates as `CALL_ISSUES` in `src/modules/qa/calls/issues.ts`. Using `teamCallsInWindow` in the list guarantees the count matches the card.
- **Periods.** `src/modules/qa/dashboard/constants.ts`: `PerformanceScorePeriod`, `PERFORMANCE_SCORE_PERIODS` (`{ value, labelKey: 'performanceScore.period.<value>', days }`: today 1, week 7, month 30, quarter 90, sixMonths 180), `DEFAULT_PERFORMANCE_SCORE_PERIOD = 'week'`, `performanceScoreDays(period)`. Labels exist in `qa.dashboard.json` under `performanceScore.period.*`; `roleDashboard.filters.allLines` = "All lines of business"; `drill.hint` and `drill.calls_one/other` exist.
- **Line of business.** `src/modules/qa/dashboard/lineOfBusiness.ts`: `DashboardLineOfBusiness` ('Collections' | 'Accounts Receivable' | 'Services' | 'Location'), `DASHBOARD_LINES_OF_BUSINESS`, `dashboardLineOfBusinessFor(campaignId)`.
- **Agent drill-down to copy.** `NewAgentDashboard.tsx` L46-65: `QA_ISSUE`, `COMPLIANCE_ISSUE`, `MY_CALLS_PATH`; L129-130 `navigate(`${MY_CALLS_PATH}?tab=calls&issue=${issue}&period=7d`)`. Receiving page `src/modules/qa/agent/calls/MyCallsPage.tsx` (474 lines): URL seeding L97-111, filters L282-439, issue-badge cell L218-249 (`MAX_ISSUE_BADGES = 3`, `styles.issueCell`), table L448-463. `MyCallsPage.module.css` has `.filters` and `.issueCell`.
- **Calls module.** `src/modules/qa/calls/types.ts` `AgentCallRow` (L13-28); `helpers.ts` `buildAgentCalls` (L35-53, inline mapper), `ROSTER_TO_MOCK_CAMPAIGN` in `constants.ts`; `issues.ts` `CALL_ISSUES`, `CALL_ISSUE_ASPECTS`, `CALL_ISSUE_BY_KEY`, `parseIssueParam`, `CallIssueKey`, `CallIssueAspect`. `TeamCallMetric` fields used: `id, date, campaignId, campaignName, agentId, agentName, team, supervisorName, handleTimeSeconds, qaScore, qaScores, autoFail, complianceByArea, customerSentiment, predominantEmotion, agentEmotion`.
- **Formatters and role.** `src/modules/qa/team/helpers.ts`: `formatDateTime`, `formatSeconds`, `roleFromPath(pathname): TeamRole` (L19; `'qa-manager'` when the path starts with `/qa/qa-manager`, else `'supervisor'`). Pattern: `CustomersPage.tsx` L37-38 (`useLocation()` + `roleFromPath`). `TEAM_CAMPAIGNS` (id `camp-00N`, name) and `TEAM_AGENTS` in `src/modules/qa/team/mockData.ts`. `TeamRole` type in `src/modules/qa/team/types.ts`. Thresholds: `useSettingsStore(selectThresholds)` from `~/stores/qa/settingsStore`.
- **Routes.** `src/routes.tsx` L1209-1230: `supervisor/analytics` (`qa.supervisor.analytics`) and `qa-manager/analytics` (`qa.qa-manager.analytics`), each `<I18nNamespaceLoader><Suspense fallback={<SuspenseFallback />}>…`. Namespaces per route id in `src/modules/qa/qaNamespaces.ts` (e.g. `'qa.agent.calls': ['qa.calls','qa.team','qa.disputes','qa.teamAnalytics','qa.inbox']`).
- **Sidebar.** `src/components/Sidebar/roleNavigation.tsx`: supervisor flat `getSupervisorNavigation` (L89-176; item keys `supervisor-<name>`, labels `sidebar.supervisor.<key>`, `i18nNamespace`), grouped `getSupervisorNavigationGrouped` L181-220 (`pick('supervisor-dashboard','supervisor-inbox','supervisor-team','supervisor-customers','supervisor-campaigns','supervisor-coaching','supervisor-lms')`); QA manager flat `getQAManagerNavigation` L223-324, grouped L330-380 (`pick('qamanager-dashboard','qamanager-inbox','qamanager-teams','qamanager-forms','qamanager-coaching','qamanager-lms')`). Labels in `src/locales/{en,es}/common.json` under `sidebar.supervisor` (en L156) and `sidebar.qamanager` (en L184); only those two blocks feed `roleNavigation`.
- **Locale namespace `qa.calls`** (`src/locales/{en,es}/qa.calls.json`): top-level `myCalls`, `period`, `evaluationType`, `roster`, `conversations` (`agentFilter`, `allAgents`), `issues` (`aspect.*` + 14 keys). `myCalls.autoFailCount_one/other` and `myCalls.moreIssues` exist.

---

## Direction

```
Sidebar (both roles)         Conversations  → /qa/<role>/conversations
Dashboard card row click     → /qa/<role>/conversations?issue=<CallIssueKey>&period=<PerformanceScorePeriod>&lob=<DashboardLineOfBusiness>
                               (issue omitted for the Operational "N calls" total; lob omitted when none)

ConversationsPage (ContentContainer full · title "Conversations" · role-specific description)
├─ SectionCard  filters:  [Today | Last week | Monthly | 3 months | 6 months]  Date from  Date to
│                         Agent ▾   Campaign ▾   Line of business ▾   Aspect ▾   Issues ▾(multi)   [Clear]
└─ SectionCard  "N calls" ──────────────────────────────────────────────────────────────────────
     BaseTable: Date (+campaign) · Agent (+team) · Duration · QA score · Issues (badges)   → row click opens the call
     paginated 10/page, sorted by date desc, empty state
```

Rows come from `teamCallsInWindow(role, days, lineOfBusiness)`, the same function the cards use, so with only the drill-down filters active the table count equals the card's number.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-19-team-conversations-drilldown.md`.

### Task 1 — Calls module: row type, builders, shared maps, path helper

**1a. `src/modules/qa/calls/types.ts`** — add after `AgentCallRow` (import `DashboardLineOfBusiness` as a type from `~/modules/qa/dashboard/lineOfBusiness`):

```ts
/** One scoped team call (Conversations page): the agent row plus who took it and where. */
export interface TeamCallRow extends AgentCallRow {
	agentId: string;
	agentName: string;
	team: string;
	supervisorName: string;
	/** 'camp-00N' — the id TEAM_CAMPAIGNS and the line-of-business lookup use. */
	rosterCampaignId: string;
	lineOfBusiness: DashboardLineOfBusiness | null;
}
```

**1b. `src/modules/qa/calls/helpers.ts`** — extract the inline mapper of `buildAgentCalls` (L37-52) into a named function and add the team builder:

```ts
import {
	dashboardLineOfBusinessFor,
	type DashboardLineOfBusiness,
} from '~/modules/qa/dashboard/lineOfBusiness';
import type { TeamRole } from '~/modules/qa/team/types';
import { teamCallsInWindow } from './agentMetrics';
import type {
	AgentCallRow,
	CampaignCallRow,
	CampaignRosterRow,
	TeamCallRow,
} from './types';

const toAgentCallRow = (c: TeamCallMetric): AgentCallRow => ({
	id: c.id,
	callId: c.id,
	mockCampaignId: ROSTER_TO_MOCK_CAMPAIGN[c.campaignId] ?? '1',
	campaignName: c.campaignName,
	date: c.date,
	durationSeconds: c.handleTimeSeconds,
	autoFail: c.autoFail,
	autoFailCount: c.autoFail ? criticalErrors(c) : 0,
	qaScore: c.qaScore,
	sentimentScore: c.customerSentiment,
	complianceScore: complianceScoreFor(c),
	customerEmotion: c.predominantEmotion,
	agentEmotion: c.agentEmotion,
	issues: callIssues(c),
});

/** The agent's own calls, newest first. */
export const buildAgentCalls = (agentId: string): AgentCallRow[] =>
	TEAM_CALLS.filter((c) => c.agentId === agentId)
		.map(toAgentCallRow)
		.sort((a, b) => b.date.localeCompare(a.date));

export const toTeamCallRow = (c: TeamCallMetric): TeamCallRow => ({
	...toAgentCallRow(c),
	agentId: c.agentId,
	agentName: c.agentName,
	team: c.team,
	supervisorName: c.supervisorName,
	rosterCampaignId: c.campaignId,
	lineOfBusiness: dashboardLineOfBusinessFor(c.campaignId),
});

/**
 * Scoped team calls in the same window the dashboard cards count, newest
 * first — built on `teamCallsInWindow` so a drill-down shows exactly the
 * calls behind the card's number.
 */
export const buildTeamCalls = (
	role: TeamRole,
	days: number,
	lineOfBusiness?: DashboardLineOfBusiness | null
): TeamCallRow[] =>
	teamCallsInWindow(role, days, lineOfBusiness)
		.map(toTeamCallRow)
		.sort((a, b) => b.date.localeCompare(a.date));
```

Check `agentMetrics.ts` does not import from `./helpers` (it imports from `~/modules/qa/analytics/*`, `./issues`, settings) so there is no cycle; if it does, move `teamCallsInWindow`'s import to a type-only one or inline the window filter in `buildTeamCalls`.

**1c. `src/modules/qa/calls/constants.ts`** — append (type-only imports: `CallIssueKey` from `./issues`, `TeamRole` from `~/modules/qa/team/types`, `PerformanceScorePeriod` from `~/modules/qa/dashboard/constants`, `DashboardLineOfBusiness` from `~/modules/qa/dashboard/lineOfBusiness`):

```ts
/** Card rows → the issue they open, shared by the agent, supervisor and QA manager dashboards. */
export const QA_ISSUE: Record<
	'ecn' | 'enc' | 'ecc' | 'ecuf' | 'autoFails',
	CallIssueKey
> = {
	ecn: 'qa-ecn',
	enc: 'qa-enc',
	ecc: 'qa-ecc',
	ecuf: 'qa-ecuf',
	autoFails: 'auto-fail',
};
export const COMPLIANCE_ISSUE: Record<
	'Security' | 'Regulatory' | 'Legal',
	CallIssueKey
> = {
	Security: 'compliance-security',
	Regulatory: 'compliance-regulatory',
	Legal: 'compliance-legal',
};

export interface TeamConversationsParams {
	issue?: CallIssueKey;
	period: PerformanceScorePeriod;
	lineOfBusiness: DashboardLineOfBusiness | null;
}

/** Drill-down target of the team dashboards: the role's Conversations list, pre-filtered. */
export const teamConversationsPath = (
	role: TeamRole,
	{ issue, period, lineOfBusiness }: TeamConversationsParams
): string => {
	const params = new URLSearchParams({ period });
	if (issue) params.set('issue', issue);
	if (lineOfBusiness) params.set('lob', lineOfBusiness);
	return `/qa/${role}/conversations?${params.toString()}`;
};
```

`URLSearchParams` is required because `'Accounts Receivable'` contains a space.

**1d. `NewAgentDashboard.tsx`** — delete the local `QA_ISSUE` and `COMPLIANCE_ISSUE` (L46-64) and import them from `~/modules/qa/calls/constants`. Keep `MY_CALLS_PATH` and `openIssue` as they are.

`npm run typecheck`.

### Task 2 — Shared issue badges

**2a. `src/modules/qa/calls/components/IssueBadges/IssueBadges.tsx`** (+ `IssueBadges.module.css` with the `.issueCell` rule moved from `MyCallsPage.module.css`, + `index.ts`):

```tsx
import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CALL_ISSUE_BY_KEY, type CallIssueKey } from '../../issues';
import classes from './IssueBadges.module.css';

export interface IssueBadgesProps {
	issues: CallIssueKey[];
	/** Critical errors behind an auto-fail; shown on the auto-fail badge. */
	autoFailCount: number;
	/** Badges shown before collapsing the rest into "+N". */
	max?: number;
}

/** The incidents of a call as badges; auto-fail is filled and carries its count. Labels: qa.calls. */
export default function IssueBadges({
	issues,
	autoFailCount,
	max = 3,
}: IssueBadgesProps) {
	const { t } = useTranslation('qa.calls');
	const shown = issues.slice(0, max);
	return (
		<div className={classes.issueCell}>
			{shown.map((key) => (
				<Badge
					color={CALL_ISSUE_BY_KEY[key].color}
					key={key}
					size='sm'
					variant={key === 'auto-fail' ? 'filled' : 'light'}
				>
					{key === 'auto-fail'
						? t('myCalls.autoFailCount', { count: autoFailCount })
						: t(`issues.${key}`)}
				</Badge>
			))}
			{issues.length > max ? (
				<Badge color='gray' size='sm' variant='outline'>
					{t('myCalls.moreIssues', { count: issues.length - max })}
				</Badge>
			) : null}
		</div>
	);
}
```

**2b. `MyCallsPage.tsx`** — replace the `issues` column cell body (L221-248) with `<IssueBadges issues={info.getValue()} autoFailCount={info.row.original.autoFailCount} />`; drop `MAX_ISSUE_BADGES` (L51) and the `.issueCell` rule from `MyCallsPage.module.css`; remove the now-unused `Badge` import only if nothing else in the file uses it (the disputes tab badge at L267 still does — keep it).

`npm run typecheck`.

### Task 3 — Locale keys

**3a. `src/locales/{en,es}/qa.calls.json`** — add a top-level group `teamConversations` (keep every existing key; validate with `node -e "JSON.parse(...)"` on both files):

| key                         | en                                                                                                                                    | es                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                     | Conversations                                                                                                                         | Conversaciones                                                                                                                                          |
| `description`               | Every call your team handled, across campaigns. Filter by period, agent, campaign or issue, and open a call to review its evaluation. | Todas las llamadas de tu equipo, en todas las campañas. Filtra por periodo, agente, campaña o incidencia y abre una llamada para revisar su evaluación. |
| `descriptionQaManager`      | Every call handled on the platform, across teams and campaigns.                                                                       | Todas las llamadas gestionadas en la plataforma, en todos los equipos y campañas.                                                                       |
| `filters.dateFrom`          | Date from                                                                                                                             | Fecha desde                                                                                                                                             |
| `filters.dateTo`            | Date to                                                                                                                               | Fecha hasta                                                                                                                                             |
| `filters.campaign`          | Campaign                                                                                                                              | Campaña                                                                                                                                                 |
| `filters.allCampaigns`      | All campaigns                                                                                                                         | Todas las campañas                                                                                                                                      |
| `filters.lineOfBusiness`    | Line of business                                                                                                                      | Línea de negocio                                                                                                                                        |
| `filters.aspect`            | Aspect                                                                                                                                | Aspecto                                                                                                                                                 |
| `filters.issues`            | Issue type                                                                                                                            | Tipo de incidencia                                                                                                                                      |
| `filters.issuesPlaceholder` | Any issue                                                                                                                             | Cualquier incidencia                                                                                                                                    |
| `filters.clear`             | Clear                                                                                                                                 | Limpiar                                                                                                                                                 |
| `filters.drilldown`         | Showing the calls behind the dashboard card. Change or clear the filters to see more.                                                 | Mostrando las llamadas detrás de la tarjeta del dashboard. Cambia o limpia los filtros para ver más.                                                    |
| `columns.date`              | Date                                                                                                                                  | Fecha                                                                                                                                                   |
| `columns.agent`             | Agent                                                                                                                                 | Agente                                                                                                                                                  |
| `columns.duration`          | Duration                                                                                                                              | Duración                                                                                                                                                |
| `columns.qaScore`           | QA score                                                                                                                              | Puntuación QA                                                                                                                                           |
| `columns.issues`            | Issues                                                                                                                                | Incidencias                                                                                                                                             |
| `rowsCount_one`             | {{count}} call                                                                                                                        | {{count}} llamada                                                                                                                                       |
| `rowsCount_other`           | {{count}} calls                                                                                                                       | {{count}} llamadas                                                                                                                                      |
| `empty`                     | No calls match these filters.                                                                                                         | Ninguna llamada coincide con estos filtros.                                                                                                             |

Agent filter reuses the existing `conversations.agentFilter` / `conversations.allAgents`. Period labels and "All lines of business" reuse `qa.dashboard` keys (`performanceScore.period.*`, `roleDashboard.filters.allLines`).

**3b. `src/locales/{en,es}/common.json`** — add `"conversations": "Conversations"` / `"Conversaciones"` inside `sidebar.supervisor` and inside `sidebar.qamanager` (both files, four additions). Validate JSON.

### Task 4 — Conversations page

**`src/modules/qa/conversations/ConversationsPage/ConversationsPage.tsx`** (+ `ConversationsPage.module.css` with the `.filters` rule copied from `MyCallsPage.module.css`, + `index.ts` `export { default } from './ConversationsPage';`).

Imports: Mantine `Button, DateInput (@mantine/dates), Group, MultiSelect, SegmentedControl, Select, Stack, Text`; `IconX`; `createColumnHelper`; `useLocation, useNavigate, useSearchParams`; `ContentContainer`, `SectionCard`, `BaseTable` + `BaseTableColumnDef`; `IssueBadges`; `buildTeamCalls`; `PERFORMANCE_SCORE_PERIODS, DEFAULT_PERFORMANCE_SCORE_PERIOD, performanceScoreDays, type PerformanceScorePeriod`; `DASHBOARD_LINES_OF_BUSINESS, type DashboardLineOfBusiness`; `CALL_ISSUES, CALL_ISSUE_ASPECTS, CALL_ISSUE_BY_KEY, parseIssueParam, type CallIssueAspect, type CallIssueKey`; `scopeAgents` (`~/modules/qa/analytics/helpers`); `TEAM_CAMPAIGNS`; `formatDateTime, formatSeconds, roleFromPath`; `useSettingsStore, selectThresholds`; `type TeamCallRow`.

State and derivations:

```ts
interface FiltersState {
	period: PerformanceScorePeriod;
	from: Date | null;
	to: Date | null;
	agentId: string; // 'all' | agent id
	campaignId: string; // 'all' | 'camp-00N'
	lineOfBusiness: DashboardLineOfBusiness | null;
	aspect: CallIssueAspect | 'all';
	issues: CallIssueKey[];
}
const DEFAULT_FILTERS: FiltersState = {
	period: DEFAULT_PERFORMANCE_SCORE_PERIOD,
	from: null,
	to: null,
	agentId: 'all',
	campaignId: 'all',
	lineOfBusiness: null,
	aspect: 'all',
	issues: [],
};
const isPerformancePeriod = (v: string | null): v is PerformanceScorePeriod =>
	PERFORMANCE_SCORE_PERIODS.some((p) => p.value === v);
const isLineOfBusiness = (v: string | null): v is DashboardLineOfBusiness =>
	DASHBOARD_LINES_OF_BUSINESS.includes(v as DashboardLineOfBusiness);
/** TEAM_CALLS spans 180 days; a custom range is cut from that base. */
const FULL_HISTORY_DAYS = 180;
```

- `const role = roleFromPath(useLocation().pathname)`; `const { t } = useTranslation('qa.calls')`; `const { t: tDashboard } = useTranslation('qa.dashboard')`; `thresholds = useSettingsStore(selectThresholds)`.
- **URL seeding** (one-shot, like My Calls L97-111): read `issue`, `period`, `lob`; `useEffect` on those three: if none is present, return; otherwise `setFilters((f) => ({ ...f, issues: parseIssueParam(issueParam), aspect: 'all', period: isPerformancePeriod(periodParam) ? periodParam : f.period, lineOfBusiness: isLineOfBusiness(lobParam) ? lobParam : null, from: null, to: null }))`. Keep `const fromDashboard = Boolean(issueParam || periodParam || lobParam)` to show the `filters.drilldown` hint once (a `Text size='xs' c='dimmed'` under the filter bar) — it disappears when the user clicks Clear (`setFilters(DEFAULT_FILTERS)` and `setSearchParams({}, { replace: true })`).
- **Rows:** `const customRange = Boolean(filters.from || filters.to)`; `const baseRows = useMemo(() => buildTeamCalls(role, customRange ? FULL_HISTORY_DAYS : performanceScoreDays(filters.period), filters.lineOfBusiness), [role, customRange, filters.period, filters.lineOfBusiness])`.
- **Client filters** in a `useMemo` over `baseRows`: custom `from`/`to` by comparing `r.date.slice(0, 10)` with `date.toISOString().slice(0, 10)` (same as My Calls L134-149); `agentId !== 'all'` → `r.agentId === agentId`; `campaignId !== 'all'` → `r.rosterCampaignId === campaignId`; `aspect !== 'all'` → `r.issues.some((k) => CALL_ISSUE_BY_KEY[k].aspect === aspect)`; `issues.length > 0` → `filters.issues.some((k) => r.issues.includes(k))`.
- `issueOptions` grouped by aspect: copy My Calls L183-194.

Filter bar (`SectionCard` → `Group align='flex-end' gap='md' wrap='wrap' className={styles.filters}`), controls in order:

| Control                   | Props                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SegmentedControl` period | `data={PERFORMANCE_SCORE_PERIODS.map((p) => ({ value: p.value, label: tDashboard(p.labelKey) }))}`, `value={filters.period}`, `disabled={customRange}`, `onChange` sets `period` and clears `from`/`to`                                                                                                                         |
| `DateInput` from / to     | `label={t('teamConversations.filters.dateFrom')}` / `dateTo`, `clearable size='sm'`, `onChange={(value: string \| null) => setFilters((f) => ({ ...f, from: value ? new Date(value) : null }))}` (same for `to`)                                                                                                                |
| `Select` agent            | `label={t('conversations.agentFilter')}`, `data=[{ value: 'all', label: t('conversations.allAgents') }, ...scopeAgents(role).map((a) => ({ value: a.id, label: a.name }))]`, `searchable allowDeselect={false} size='sm' w={220}`                                                                                               |
| `Select` campaign         | `label={t('teamConversations.filters.campaign')}`, `data=[{ value: 'all', label: t('teamConversations.filters.allCampaigns') }, ...TEAM_CAMPAIGNS.map((c) => ({ value: c.id, label: c.name }))]`, `allowDeselect={false} size='sm' w={220}`                                                                                     |
| `Select` line of business | `label={t('teamConversations.filters.lineOfBusiness')}`, `placeholder={tDashboard('roleDashboard.filters.allLines')}`, `data={DASHBOARD_LINES_OF_BUSINESS}`, `clearable size='sm' w={200}`, `value={filters.lineOfBusiness}`, `onChange={(v) => setFilters((f) => ({ ...f, lineOfBusiness: isLineOfBusiness(v) ? v : null }))}` |
| `Select` aspect           | copy My Calls L326-353 with labels `teamConversations.filters.aspect` and `issues.aspect.*`                                                                                                                                                                                                                                     |
| `MultiSelect` issues      | copy My Calls L354-373 with labels `teamConversations.filters.issues` / `issuesPlaceholder`                                                                                                                                                                                                                                     |
| `Button` clear            | `variant='subtle' leftSection={<IconX size={14} />}` → `setFilters(DEFAULT_FILTERS)` + `setSearchParams({}, { replace: true })`                                                                                                                                                                                                 |

Table (`SectionCard headerActions={<Text size='sm' c='dimmed'>{t('teamConversations.rowsCount', { count: filteredRows.length })}</Text>}`), `const helper = createColumnHelper<TeamCallRow>()`:

| id                | header             | cell                                                                                                                |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `date`            | `columns.date`     | `Stack gap={0}`: `Text size='sm' fw={600}` `formatDateTime(value)` + `Text size='xs' c='dimmed'` `row.campaignName` |
| `agentName`       | `columns.agent`    | `Stack gap={0}`: `Text size='sm' fw={600}` name + `Text size='xs' c='dimmed'` `row.team`                            |
| `durationSeconds` | `columns.duration` | `Text size='sm'` `formatSeconds(value)`, `size: 110`                                                                |
| `qaScore`         | `columns.qaScore`  | `Text size='sm' fw={600} c={value < thresholds.qa.lowScoreIncident ? 'red' : undefined}` `{value}`, `size: 100`     |
| `issues`          | `columns.issues`   | `enableSorting: false`, `<IssueBadges issues={value} autoFailCount={row.autoFailCount} />`                          |

`BaseTable<TeamCallRow> data={filteredRows} columns={columns} getRowId={(r) => r.id} initialSort={[{ id: 'date', desc: true }]} enablePagination showPaginationControls pageSize={10} density='compact' emptyMessage={t('teamConversations.empty')} onRowClick={(r) => navigate(`/qa/campaigns/${r.mockCampaignId}/calls/${r.callId}`)}`.

Page shell: `ContentContainer contentWidth='full' title={t('teamConversations.title')} description={t(role === 'qa-manager' ? 'teamConversations.descriptionQaManager' : 'teamConversations.description')}` → `Stack gap='lg'` with the two cards.

`npm run typecheck`.

### Task 5 — Routes, namespaces, sidebar

**5a. `src/routes.tsx`** — lazy import near the other QA pages: `const QaConversationsPage = React.lazy(() => import('./modules/qa/conversations/ConversationsPage'));`. After the `qa-manager/analytics` route object (L1220-1230) insert:

```tsx
{
	path: 'supervisor/conversations',
	id: 'qa.supervisor.conversations',
	element: (
		<I18nNamespaceLoader>
			<Suspense fallback={<SuspenseFallback />}>
				<QaConversationsPage />
			</Suspense>
		</I18nNamespaceLoader>
	),
},
{
	path: 'qa-manager/conversations',
	id: 'qa.qa-manager.conversations',
	element: (
		<I18nNamespaceLoader>
			<Suspense fallback={<SuspenseFallback />}>
				<QaConversationsPage />
			</Suspense>
		</I18nNamespaceLoader>
	),
},
```

**5b. `src/modules/qa/qaNamespaces.ts`** — add `'qa.supervisor.conversations': ['qa.calls', 'qa.dashboard', 'qa.team'],` and `'qa.qa-manager.conversations': ['qa.calls', 'qa.dashboard', 'qa.team'],`.

**5c. `src/components/Sidebar/roleNavigation.tsx`** — import `IconMessages` from `@tabler/icons-react`. Supervisor flat list: insert after the `supervisor-team` item
`{ key: 'supervisor-conversations', label: 'sidebar.supervisor.conversations', icon: <IconMessages size={20} className={styles.menuIcon} />, to: '/qa/supervisor/conversations', i18nNamespace: 'qa.calls' }`; grouped: add `'supervisor-conversations'` to the first `pick(...)` right after `'supervisor-team'`. QA manager flat: insert after `qamanager-teams` the twin with key `qamanager-conversations`, label `sidebar.qamanager.conversations`, `to: '/qa/qa-manager/conversations'`; grouped: add `'qamanager-conversations'` after `'qamanager-teams'` in the first `pick(...)`.

`npm run typecheck`.

### Task 6 — Dashboard wiring

**6a. `src/modules/qa/dashboard/components/OperationalCard.tsx`** — add prop `onCallsClick?: () => void` (doc: "Opens every call in the window."). Replace the total block (L81-86) with:

```tsx
<DrillRow
	onClick={onCallsClick && calls > 0 ? onCallsClick : undefined}
	hint={t('drill.hint')}
>
	<Group gap='xs' align='baseline' justify='space-between' wrap='nowrap'>
		<Group gap='xs' align='baseline'>
			<Text className={styles.scoreValue}>{calls}</Text>
			<Text size='sm' c='dimmed'>
				calls taken or made
			</Text>
		</Group>
		{onCallsClick && calls > 0 ? <IconChevronRight size={14} /> : null}
	</Group>
</DrillRow>
```

(`DrillRow` and `IconChevronRight` are already imported in that file.) The agent dashboard does not pass `onCallsClick`, so it is unchanged.

**6b. `NewSupervisorDashboard.tsx`** — delete `ANALYTICS_PATH` (L50-51) and `openAnalytics` (L84); import `QA_ISSUE, COMPLIANCE_ISSUE, teamConversationsPath` from `~/modules/qa/calls/constants` and `type CallIssueKey` from `~/modules/qa/calls/issues`; add

```ts
/** Card rows open the team's Conversations list, pre-filtered to the row's issue and this widget's period. */
const openConversations = (issue?: CallIssueKey) =>
	navigate(
		teamConversationsPath('supervisor', { issue, period, lineOfBusiness })
	);
```

and wire the cards: `OperationalCard onCallsClick={() => openConversations()} onNonEffectiveClick={() => openConversations('non-effective-contact')}`; `QualityAssuranceCard onCategoryClick={(key) => openConversations(QA_ISSUE[key])}`; `ComplianceCard onCategoryClick={(name) => openConversations(COMPLIANCE_ISSUE[name])}`; `SentimentEmotionSplitCard onReviewClick={(side) => openConversations(side === 'agent' ? 'negative-agent-emotion' : 'negative-customer-emotion')}`. Remove the `useNavigate` import only if nothing else uses `navigate` (the ranking/coaching links on the page do — keep it).

**6c. `NewQAManagerDashboard.tsx`** — same edit with `'qa-manager'` (`ANALYTICS_PATH` L231, `openAnalytics` L310, cards L334-393).

`npm run typecheck`.

### Task 7 — Checks

- `grep -rn "ANALYTICS_PATH\|openAnalytics" src/modules/qa/dashboard` → nothing.
- `grep -rn "QA_ISSUE\|COMPLIANCE_ISSUE" src` → only `calls/constants.ts` and the three dashboards.
- Key check: every `t('…')` in `ConversationsPage.tsx` and `IssueBadges.tsx` resolves in `en` and `es` `qa.calls.json` (reuse the scratchpad key-check script pattern; template keys: `issues.aspect.${aspect}`, `issues.${issue.key}`, `issues.${key}`), and `tDashboard(p.labelKey)` keys exist in `qa.dashboard.json`.
- Both `common.json` and both `qa.calls.json` parse.
- `npx prettier --write` on the new and edited files only.
- `npm run typecheck` clean.

---

## Behaviour summary (demo script)

| Where                                         | Action                            | Result                                                                                                    |
| --------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Sidebar (supervisor / QA manager)             | Conversations                     | `/qa/<role>/conversations`, last week, all calls of the scope, "N calls" header                           |
| Supervisor dashboard, period Monthly          | QA card → ECN row "12 calls"      | Conversations with Issues = ECN, period Monthly, 12 rows, every row shows an ECN badge; campaigns mixed   |
| Same page                                     | Clear                             | All monthly calls of the team, hint gone                                                                  |
| Dashboard with Line of business = Collections | Compliance → Legal row            | Conversations with Issues = Compliance · Legal, period kept, Line of business = Collections, count = card |
| Dashboard                                     | Operational "N calls" total       | Conversations with no issue filter; count = N                                                             |
| Dashboard                                     | Sentiment → negative customer row | Issues = Negative customer emotion                                                                        |
| Conversations                                 | Pick Date from / to               | Period control greys out; rows cut to the range from the 180-day history                                  |
| Conversations                                 | Agent / Campaign selects          | Rows narrowed; count updates                                                                              |
| Conversations                                 | Row click                         | `/qa/campaigns/:mockCampaignId/calls/:callId`                                                             |
| Agent dashboard                               | QA → ENC row                      | Unchanged: My Calls with `?issue=qa-enc` (shared maps)                                                    |

## Verification

No dev server and no tests in this session. Verify with `npm run typecheck` after each task, the JSON parse of the four locale files, the key check and the greps in Task 7. Visual check is done by the user in their own dev server following the demo script, in light and dark mode. The decisive check: on the supervisor dashboard with period Monthly, the QA card's ECN row count and the Conversations row count after the click must be the same number.

## Out of scope

- Writing filter changes back to the URL (one-shot entry contract, like My Calls).
- Score-range filters, a Disputes tab, or extracting a shared filter bar from My Calls (only the issue badges are shared).
- The Business Insights card and the Operational "Effective contacts" row stay non-clickable.
- Team Analytics page is untouched.

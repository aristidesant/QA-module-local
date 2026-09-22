# Campaigns by role, My Calls for agents, no Calls menu, no dashboard evaluation filter

> Approved in plan mode on 2026-09-14. Executor: copy this file to
> `docs/superpowers/plans/2026-09-14-campaigns-role-views.md`, then run the tasks in order on the new branch.
> Stakeholder mockup work (see `DESIGN_ROLE.md`): mock data only, no backend, no tests. Commits allowed.

## Context

The QA tool's Campaigns section (`/qa/campaigns`, `/qa/campaigns/:id`, `/qa/campaigns/:campaignId/calls/:callId`,
all in `src/views/Campaigns/pages/`) is identical for every role: a campaigns table, a detail with **Overview** and
**Conversations** tabs, and the call detail. The sidebar sends Agent, Supervisor and QA Manager to the same
`/qa/campaigns`. The user (Product Designer) asked for four changes:

1. **Agent** must not see the campaigns table. The agent's menu entry becomes **My Calls** (`/qa/agent/calls`): a
   date-ordered list of _their own_ calls with only **date, duration and auto-fails** — **no score**. A row opens the
   existing call detail (player, transcript, evaluation panels, "Open dispute").
2. **Supervisor / QA Manager** keep the campaigns section as it is, plus: the Conversations tab's **Agent filter uses
   the real roster** (today it lists Marcus Lee, Diana Torres… who do not exist in the roster), and a new third tab
   **Roster** lists every agent participating in the campaign (performance columns, click → Agent Profile).
   Supervisor sees only their team (Team 1 / `SUP-001`); QA Manager sees everyone.
3. **Remove the "Calls" entry** from the Supervisor and QA Manager sidebars (both point to placeholder pages).
4. **Remove the "Filter by evaluation type"** segmented control from all four role dashboards.

Decisions taken with the user (2026-09-14): sidebar label **My Calls** at `/qa/agent/calls` (key
`sidebar.agent.myCalls` already exists in `common.json`); row click opens the call detail; the agent filter change is
**only** in the Conversations tab (campaign list untouched); Roster tab = performance columns + navigation to the
agent profile.

### Verified repo facts (2026-09-14) — reuse, do not duplicate

| Thing                                | Where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Notes                                                                                                                                                                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign list / detail / call detail | `src/views/Campaigns/pages/{CampaignsList,CampaignDetail,ConversationEvaluations}.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | raw Mantine `Table`, hard-coded English, local `useState`; `CampaignDetail.tsx:57-228` has a module-local `Call` interface + 12-row `mockCalls` with fake agents; Conversations filters at `:600-800`, filtering IIFE at `:802-988`; Overview "Auto Fails"/"Disputes" cards count `mockCalls` at `:567`, `:585-589` |
| Mock campaigns                       | `src/views/Campaigns/constants.ts` `mockCampaigns` ids `'1'..'5'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `'1'` Q2 Sales Performance, `'2'` Customer Support Quality, `'3'` New Hire Training - June, `'4'` Compliance Audit Wave 2, `'5'` Agent Coaching Program                                                                                                                                                             |
| Roster                               | `src/modules/qa/team/mockData.ts` `TEAM_AGENTS: RosterAgent[]` (21 agents, `campaignIds` use `camp-001..004`), `TEAM_CAMPAIGNS`, `TEAM_SUPERVISORS`; `src/modules/qa/team/constants.ts` `AGENT_PERSONA_ID = 'AGT-004'`, `SUPERVISOR_PERSONA = { id: 'SUP-001', … }`, `NOW_ISO`                                                                                                                                                                                                                                                                                                                       | roster campaign ids ≠ mock campaign ids → mapping constant in Task 1                                                                                                                                                                                                                                                |
| Per-call dataset                     | `src/modules/qa/analytics/mockData.ts` `TEAM_CALLS: TeamCallMetric[]` (`src/modules/qa/analytics/types.ts:35-60`): `id`, `date` (ISO), `agentId`, `agentName`, `campaignId` (`camp-*`), `campaignName`, `handleTimeSeconds`, `qaScore`, `autoFail`, `qaScores: { ecn, enc, ecc, ecuf }`, sorted ascending by date                                                                                                                                                                                                                                                                                    | single source for My Calls, Conversations rows and Roster metrics                                                                                                                                                                                                                                                   |
| Role in shared pages                 | `useRoleMockStore((s) => s.previewRole)` from `~/stores/roleMockStore` → `'agent' \| 'supervisor' \| 'qaManager' \| 'operationManager' \| 'superAdmin' \| null`; already used in `ConversationEvaluations.tsx:54,190`                                                                                                                                                                                                                                                                                                                                                                                | `/qa/campaigns/*` paths carry no role, so `roleFromPath` does not apply here                                                                                                                                                                                                                                        |
| Agent-profile paths                  | `teamBasePath(role)` in `src/modules/qa/team/helpers.ts:5` → `/qa/qa-manager/agents` or `/qa/supervisor/your-team`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `role: 'supervisor' \| 'qa-manager'`                                                                                                                                                                                                                                                                                |
| Helpers                              | `formatSeconds`, `formatDateTime`, `formatDate`, `getScoreColor` in `src/modules/qa/team/helpers.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                                                                                                                                                                                                                                                     |
| Table pattern                        | `src/modules/qa/team/components/EvaluationHistoryTable.tsx` and `YourTeamPage/useTeamColumns.tsx` (`createColumnHelper` + `as BaseTableColumnDef<T>`, `Avatar name color radius='xl' size='sm'`)                                                                                                                                                                                                                                                                                                                                                                                                     | `BaseTable` default export `~/components/BaseTable/BaseTable`; props `data, columns, getRowId, initialSort, onRowClick, density='compact', emptyMessage, enablePagination, pageSize`                                                                                                                                |
| Page shell                           | `YourTeamPage.tsx:36-40` `ContentContainer contentWidth='full' title description` → `Stack gap='lg'` → `SectionCard`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                                                                                                                                                                                                                                                     |
| Date inputs                          | `DateInput` from `@mantine/dates` as in `src/modules/qa/agent/inbox/InboxFilters.tsx:119-137` (`onChange={(value: string \| null) => …}`)                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                                                                                                                                                                                                                                                                                                                     |
| Sidebar                              | `src/components/Sidebar/roleNavigation.tsx` — agent items `:39-91` (`agent-campaigns` at `:47-53`), grouped `:94-123` (`items[1]` = Campaigns in `agent-mywork`); `supervisor-calls` `:150-155` + `pick(… 'supervisor-calls' …)` `:243`; `qamanager-calls` `:320-325` + pick `:432`; `IconPhone` imported `:3`                                                                                                                                                                                                                                                                                       | labels translate from `common.json` `sidebar.<role>.*`                                                                                                                                                                                                                                                              |
| Calls placeholders                   | `src/modules/qa/{supervisor,qamanager}/pages/CallsPage.tsx`; `routes.tsx` lazy imports `:172-174`, `:194-196`; routes `supervisor/calls` `:1067-1077`, `qa-manager/calls` `:1298-1308`                                                                                                                                                                                                                                                                                                                                                                                                               | nothing else links to them                                                                                                                                                                                                                                                                                          |
| Dashboards filter                    | `src/modules/qa/dashboard/components/DashboardEvaluationFilter.tsx` (+ barrel `components/index.ts:22-26`); used by `dashboard/pages/New{Agent,Supervisor,QAManager,OperationManager}Dashboard.tsx` (`useState<DashboardEvaluationType>('all')`, `cardClass()` helper, `<DashboardEvaluationFilter …/>`, `dimmed={!isCardVisible(…)}` props); CSS `Dashboard.module.css:47-59`; `dimmed` prop on `SectionCard` (`SectionCard.tsx:29-30,63,90`, `.dimmed` in `SectionCard.module.css:274-277`) and on `InboxSummary.tsx:33,42,99`; i18n `qa.dashboard.json` `evaluationFilter` block (en/es `:51-60`) | the filter never filters data — it only dims cards                                                                                                                                                                                                                                                                  |
| i18n                                 | namespaces auto-discovered from `src/locales/{en,es}/<ns>.json`; route id → namespaces in `src/modules/qa/qaNamespaces.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |                                                                                                                                                                                                                                                                                                                     |
| Known pre-existing typecheck errors  | `src/views/Campaigns/pages/CampaignCreate.tsx`, `CampaignDetail.tsx`, `ConversationAspects.tsx` (memory)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | record the baseline error count before Task 1 and make sure no **new** errors appear                                                                                                                                                                                                                                |

## Global constraints

- Branch: **`feature/campaigns-role-views`** off `main` (Task 0). One commit per task.
- Mantine tokens only, `light-dark()` for manual colours, CSS Modules, no new inline `style={{}}` (pre-commit hook;
  the legacy Campaigns pages already have them — do not add more).
- Every new UI string goes through i18n (`qa.calls` namespace for the new code; existing Campaigns pages stay
  hard-coded English as they are — only the strings you add there go to `qa.calls`). Write `es` with identical keys.
- Never build a new array inside a Zustand selector; derive with `useMemo`. No new stores are needed here.
- Dark/light: every new component must look right in both themes (Mantine colour names in `Badge`/`Avatar`,
  `c='dimmed'`, `var(--mantine-color-*)`).
- Do not touch `src/modules/qa/campaigns/*` (unrouted backend pages) nor `src/modules/campaigns/*` (voice builder).

## File structure

```
src/modules/qa/calls/                       NEW shared call helpers (no UI)
  types.ts                                  AgentCallRow, CampaignCallRow, CampaignRosterRow
  constants.ts                              CAMPAIGN_ROSTER_MAP, MY_CALLS_PERIODS
  helpers.ts                                rosterCampaignIdFor, buildAgentCalls, buildCampaignCalls, campaignRosterAgents, buildCampaignRoster, agentProfilePathFor
src/modules/qa/agent/calls/                 NEW agent page
  MyCallsPage.tsx
  MyCallsPage.module.css
src/views/Campaigns/components/
  CampaignRosterTab.tsx                     NEW Roster tab (BaseTable)
src/locales/{en,es}/qa.calls.json           NEW namespace
src/modules/qa/qaNamespaces.ts              + 'qa.agent.calls'
src/routes.tsx                              + agent/calls route; − supervisor/calls, qa-manager/calls
src/components/Sidebar/roleNavigation.tsx   agent: Campaigns → My Calls; − supervisor-calls, − qamanager-calls
src/views/Campaigns/pages/CampaignsList.tsx agent redirect
src/views/Campaigns/pages/CampaignDetail.tsx roster-backed Conversations + Roster tab
src/views/Campaigns/pages/ConversationEvaluations.tsx agent breadcrumb → My Calls
src/modules/qa/{supervisor,qamanager}/pages/CallsPage.tsx   DELETE
src/modules/qa/dashboard/components/DashboardEvaluationFilter.tsx DELETE (+ barrel, 4 pages, CSS, SectionCard/InboxSummary `dimmed`, i18n)
src/locales/{en,es}/common.json             − sidebar.supervisor.calls, sidebar.qamanager.calls, sidebar.rolePreview.items.calls
src/locales/{en,es}/qa.dashboard.json       − evaluationFilter
```

---

## Task 0 — Branch and baseline

```bash
git checkout -b feature/campaigns-role-views
npx tsc --noEmit -p . 2>&1 | Select-String -Pattern "error TS" | Measure-Object
```

Write the error count down (expected: a handful, all in `CampaignCreate.tsx` / `CampaignDetail.tsx` /
`ConversationAspects.tsx`). Every later task must end with the **same or lower** count (run the foreground command
above; do not trust a backgrounded log).

---

## Task 1 — Shared call helpers `src/modules/qa/calls/`

### `types.ts`

```ts
import type { RosterAgent } from '~/modules/qa/team/types';

/** One of the agent's own calls (My Calls page). Deliberately carries no score. */
export interface AgentCallRow {
	id: string; // TeamCallMetric.id
	callId: string; // id used in /qa/campaigns/:campaignId/calls/:callId
	mockCampaignId: string; // '1'..'5' — the id the Campaigns routes expect
	campaignName: string;
	date: string; // ISO
	durationSeconds: number;
	autoFail: boolean;
	autoFailCount: number; // critical errors behind the auto-fail (0 when !autoFail)
}

/** Row of the campaign Conversations table — same shape CampaignDetail already filters on. */
export interface CampaignCallRow {
	id: string;
	filename: string;
	agentId: string;
	agentName: string;
	date: string; // 'YYYY-MM-DD'
	score: number;
	status: 'completed' | 'pending';
	isAutoFailed: boolean;
	isDisputed: boolean;
	qaForm: string;
	qaFormPassed: boolean;
	disputeRequested: boolean;
}

export interface CampaignRosterRow {
	agent: RosterAgent;
	calls: number;
	averageQa: number; // 0-100, 0 when no calls
	autoFails: number;
	lastCallAt: string | null; // ISO
}
```

### `constants.ts`

```ts
/** Campaigns routes use mockCampaigns ids ('1'..'5'); the roster/TEAM_CALLS use camp-00N. */
export const CAMPAIGN_ROSTER_MAP: Record<string, string> = {
	'1': 'camp-002', // Q2 Sales Performance → Sales Training
	'2': 'camp-001', // Customer Support Quality → Q3 Customer Service
	'3': 'camp-004', // New Hire Training - June → Tech Support
	'4': 'camp-003', // Compliance Audit Wave 2 → Q4 Compliance
	'5': 'camp-001', // Agent Coaching Program → Q3 Customer Service
};

/** Reverse lookup used to deep-link an agent call to a mock campaign id. First match wins. */
export const ROSTER_TO_MOCK_CAMPAIGN: Record<string, string> = {
	'camp-001': '2',
	'camp-002': '1',
	'camp-003': '4',
	'camp-004': '3',
};

export type MyCallsPeriod = '7d' | '30d' | '90d' | 'all';
export const MY_CALLS_PERIODS: {
	value: MyCallsPeriod;
	labelKey: string;
	days: number | null;
}[] = [
	{ value: '7d', labelKey: 'period.7d', days: 7 },
	{ value: '30d', labelKey: 'period.30d', days: 30 },
	{ value: '90d', labelKey: 'period.90d', days: 90 },
	{ value: 'all', labelKey: 'period.all', days: null },
];

export const QA_FORM_BY_CAMPAIGN_TYPE = {
	INBOUND: 'Customer Service Excellence',
	OUTBOUND: 'Sales Call Quality Standards',
	BLENDED: 'Compliance Check',
} as const;
```

### `helpers.ts`

```ts
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { TEAM_AGENTS, TEAM_CAMPAIGNS } from '~/modules/qa/team/mockData';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import { teamBasePath } from '~/modules/qa/team/helpers';
import type { RosterAgent } from '~/modules/qa/team/types';
import type { PreviewRole } from '~/constants/previewRole';
import {
	CAMPAIGN_ROSTER_MAP,
	QA_FORM_BY_CAMPAIGN_TYPE,
	ROSTER_TO_MOCK_CAMPAIGN,
} from './constants';
import type { AgentCallRow, CampaignCallRow, CampaignRosterRow } from './types';

export const rosterCampaignIdFor = (
	mockCampaignId: string | undefined
): string => CAMPAIGN_ROSTER_MAP[mockCampaignId ?? ''] ?? 'camp-001';

/** The call-detail page always renders mockCallEvaluationDetail, so any callId works; keep the TEAM_CALLS id. */
const criticalErrors = (c: TeamCallMetric) =>
	c.qaScores.ecn + c.qaScores.ecc + c.qaScores.ecuf;

/** The agent's own calls, newest first. */
export const buildAgentCalls = (agentId: string): AgentCallRow[] =>
	TEAM_CALLS.filter((c) => c.agentId === agentId)
		.map((c) => ({
			id: c.id,
			callId: c.id,
			mockCampaignId: ROSTER_TO_MOCK_CAMPAIGN[c.campaignId] ?? '1',
			campaignName: c.campaignName,
			date: c.date,
			durationSeconds: c.handleTimeSeconds,
			autoFail: c.autoFail,
			autoFailCount: c.autoFail ? criticalErrors(c) : 0,
		}))
		.sort((a, b) => b.date.localeCompare(a.date));

/** Agents participating in a roster campaign, scoped by preview role (supervisor → own team only). */
export const campaignRosterAgents = (
	rosterCampaignId: string,
	previewRole: PreviewRole | null
): RosterAgent[] =>
	TEAM_AGENTS.filter(
		(a) =>
			a.campaignIds.includes(rosterCampaignId) &&
			(previewRole !== 'supervisor' || a.supervisorId === SUPERVISOR_PERSONA.id)
	);

/** Conversations rows for a campaign (all agents of the campaign, newest first). Dispute flags are deterministic mock. */
export const buildCampaignCalls = (
	mockCampaignId: string | undefined
): CampaignCallRow[] => {
	const rosterId = rosterCampaignIdFor(mockCampaignId);
	const campaign = TEAM_CAMPAIGNS.find((c) => c.id === rosterId);
	const qaForm = campaign
		? QA_FORM_BY_CAMPAIGN_TYPE[campaign.campaignType]
		: QA_FORM_BY_CAMPAIGN_TYPE.INBOUND;
	return TEAM_CALLS.filter((c) => c.campaignId === rosterId)
		.map((c, i) => ({
			id: c.id,
			filename: `${c.id.toLowerCase()}_${c.date.slice(0, 10)}.mp3`,
			agentId: c.agentId,
			agentName: c.agentName,
			date: c.date.slice(0, 10),
			score: c.qaScore,
			status: i % 9 === 8 ? 'pending' : 'completed',
			isAutoFailed: c.autoFail,
			isDisputed: c.qaScore < 60 && i % 4 === 0,
			qaForm,
			qaFormPassed: c.qaScore >= 70,
			disputeRequested: c.qaScore < 65 && i % 3 === 0,
		}))
		.sort((a, b) => b.date.localeCompare(a.date));
};

export const buildCampaignRoster = (
	mockCampaignId: string | undefined,
	previewRole: PreviewRole | null
): CampaignRosterRow[] => {
	const rosterId = rosterCampaignIdFor(mockCampaignId);
	return campaignRosterAgents(rosterId, previewRole).map((agent) => {
		const calls = TEAM_CALLS.filter(
			(c) => c.campaignId === rosterId && c.agentId === agent.id
		);
		const averageQa = calls.length
			? Math.round(calls.reduce((s, c) => s + c.qaScore, 0) / calls.length)
			: 0;
		const lastCallAt = calls.length ? calls[calls.length - 1].date : null; // TEAM_CALLS is ascending by date
		return {
			agent,
			calls: calls.length,
			averageQa,
			autoFails: calls.filter((c) => c.autoFail).length,
			lastCallAt,
		};
	});
};

/** Where a roster row navigates: the role's own agent-profile route. */
export const agentProfilePathFor = (
	previewRole: PreviewRole | null,
	agentId: string
) =>
	`${teamBasePath(previewRole === 'supervisor' ? 'supervisor' : 'qa-manager')}/${agentId}`;
```

Check `PreviewRole` really lives at `src/constants/previewRole.ts` (the explore report says so); otherwise import the
type from `~/stores/roleMockStore`.

**Typecheck**, then commit `feat(qa-calls): shared call, conversation and roster helpers over TEAM_CALLS`.

---

## Task 2 — Agent **My Calls** page, route, sidebar, redirects

### `src/locales/en/qa.calls.json`

```json
{
	"myCalls": {
		"title": "My Calls",
		"description": "Every call you handled, newest first. Open a call to review its evaluation or raise a dispute.",
		"filters": {
			"period": "Period",
			"dateFrom": "Date from",
			"dateTo": "Date to",
			"autoFailOnly": "Auto-fails only",
			"clear": "Clear"
		},
		"columns": {
			"date": "Date",
			"duration": "Duration",
			"autoFails": "Auto-fails"
		},
		"autoFailNone": "None",
		"autoFailCount": "{{count}} auto-fail",
		"autoFailCount_other": "{{count}} auto-fails",
		"rowsCount": "{{count}} calls",
		"empty": "No calls in this period.",
		"breadcrumb": "My Calls"
	},
	"period": {
		"7d": "Last 7 days",
		"30d": "Last 30 days",
		"90d": "Last 90 days",
		"all": "All time"
	},
	"roster": {
		"tab": "Roster",
		"description": "Agents participating in this campaign",
		"descriptionSupervisor": "Agents from your team participating in this campaign",
		"columns": {
			"agent": "Agent",
			"team": "Team",
			"supervisor": "Supervisor",
			"status": "Status",
			"calls": "Calls",
			"averageQa": "Avg. QA",
			"autoFails": "Auto-fails",
			"lastCall": "Last call"
		},
		"rowsCount": "{{count}} agents",
		"empty": "No agents from your team participate in this campaign.",
		"emptyAll": "No agents participate in this campaign yet."
	},
	"conversations": { "agentFilter": "Agent", "allAgents": "All agents" }
}
```

`src/locales/es/qa.calls.json` — same keys, Spanish values (e.g. "Mis llamadas", "Todas tus llamadas, de la más
reciente a la más antigua…", "Últimos 7 días", "Auto-fails" stays, "Sin auto-fails" → `autoFailNone: "Ninguno"`,
`rowsCount: "{{count}} llamadas"`, `roster.tab: "Roster"`, `columns.averageQa: "QA medio"`, `lastCall: "Última
llamada"`, `empty: "Ningún agente de tu equipo participa en esta campaña."`).

### `src/modules/qa/qaNamespaces.ts`

Add `'qa.agent.calls': ['qa.calls', 'qa.team'],` and change
`'qa.campaigns.detail': ['qa.campaigns', 'qa.calls', 'qa.team'],` (the detail now renders the Roster tab).
Add `'qa.campaigns.conversation': ['qa.disputes', 'qa.calls'],`.

### `src/modules/qa/agent/calls/MyCallsPage.tsx`

Behaviour:

| Element                  | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell                    | `ContentContainer contentWidth='full' title={t('myCalls.title')} description={t('myCalls.description')}` → `Stack gap='lg'`                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Data                     | `const rows = useMemo(() => buildAgentCalls(AGENT_PERSONA_ID), [])`                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Filters row              | `SectionCard` (no title) with `Group align='flex-end' gap='md' wrap='wrap'`: `SegmentedControl` of `MY_CALLS_PERIODS` (labels `t(p.labelKey)`, default `'30d'`); two `DateInput` (`dateFrom`, `dateTo`, `clearable`, `size='sm'`, pattern from `InboxFilters.tsx:119-137`); `Switch label={t('myCalls.filters.autoFailOnly')}`; `Button variant='subtle' leftSection={<IconX size={14}/>}` → resets to `{ period:'30d', from:null, to:null, autoFailOnly:false }`. Selecting a period clears from/to; typing a date sets period to `'all'`. |
| Filtering                | `useMemo`: period → `since = new Date(NOW_ISO) - days` (`NOW_ISO` from `~/modules/qa/team/constants`, not `Date.now()`), keep `row.date >= since`; `from`/`to` compare on `row.date.slice(0,10)`; `autoFailOnly` → `row.autoFail`                                                                                                                                                                                                                                                                                                           |
| Table                    | `SectionCard headerActions={<Text size='sm' c='dimmed'>{t('myCalls.rowsCount', { count })}</Text>}` → `BaseTable<AgentCallRow>` `data columns getRowId={(r)=>r.id} initialSort={[{ id:'date', desc:true }]} enablePagination pageSize={15} density='compact' emptyMessage={t('myCalls.empty')} onRowClick={(r)=>navigate(\`/qa/campaigns/${r.mockCampaignId}/calls/${r.callId}\`)}`                                                                                                                                                         |
| Column `date`            | header `t('myCalls.columns.date')`; cell `Stack gap={0}`: `Text size='sm' fw={600}` `formatDateTime(date)` + `Text size='xs' c='dimmed'` `campaignName` (campaign is context, not a column — keeps the 3-column brief while telling the agent which campaign the call belongs to)                                                                                                                                                                                                                                                           |
| Column `durationSeconds` | header `t('myCalls.columns.duration')`; `Text size='sm'` `formatSeconds(v)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Column `autoFailCount`   | header `t('myCalls.columns.autoFails')`; `autoFail ? <Badge color='red' variant='filled'>{t('myCalls.autoFailCount', { count })}</Badge> : <Text size='sm' c='dimmed'>{t('myCalls.autoFailNone')}</Text>`                                                                                                                                                                                                                                                                                                                                   |
| **No score anywhere**    | do not render `qaScore`, sentiment, compliance, status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

`MyCallsPage.module.css`: only if a class is needed for the filters row wrap (`.filters { display:flex; gap:
var(--mantine-spacing-md); flex-wrap: wrap; align-items: flex-end; }`); otherwise skip the file.

### `src/routes.tsx`

- Lazy import next to the other agent pages: `const MyCallsPage = React.lazy(() => import('./modules/qa/agent/calls/MyCallsPage'));`
- New child of the `qa` route right after `agent/evaluations` (`:927-937`):

```tsx
{
	path: 'agent/calls',
	id: 'qa.agent.calls',
	element: (
		<I18nNamespaceLoader>
			<Suspense fallback={<SuspenseFallback />}>
				<MyCallsPage />
			</Suspense>
		</I18nNamespaceLoader>
	),
},
```

### `src/components/Sidebar/roleNavigation.tsx`

Replace the `agent-campaigns` item (`:47-53`) with:

```tsx
{
	key: 'agent-calls',
	label: 'sidebar.agent.myCalls',
	icon: <IconPhone size={20} className={styles.menuIcon} />,
	to: '/qa/agent/calls',
	i18nNamespace: 'qa.calls',
},
```

`getAgentNavigationGrouped` keeps `items[1]` in `agent-mywork` — update the comment to `// My Calls, Inbox, My Learning`.
Also drop `sidebar.agent.campaigns` from `en/es common.json` (now orphaned) — keep `sidebar.agent.myCalls`.

### Agent redirects

- `src/views/Campaigns/pages/CampaignsList.tsx`: at the top of the component
  `const previewRole = useRoleMockStore((s) => s.previewRole); if (previewRole === 'agent') return <Navigate to='/qa/agent/calls' replace />;`
  (imports: `Navigate` from `react-router`, `useRoleMockStore` from `~/stores/roleMockStore`). Hooks are all called
  before the early return only if you place the return **after** every `useState`/`useMemo` — put it right before the
  `return (` of the JSX.
- `src/views/Campaigns/pages/ConversationEvaluations.tsx:101-110`: first breadcrumb becomes
  `previewRole === 'agent' ? { label: t('myCalls.breadcrumb', { ns: 'qa.calls' }), to: '/qa/agent/calls' } : { label: 'Campaigns', to: '/qa/campaigns' }`;
  for the agent, hide the second (campaign-name) crumb. `previewRole` is already read at `:54`.

**Typecheck**, commit `feat(qa-calls): agent My Calls page replaces campaigns for the agent role`.

---

## Task 3 — Supervisor / QA Manager: roster-backed Conversations + Roster tab

### `src/views/Campaigns/components/CampaignRosterTab.tsx`

```tsx
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Badge, Group, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { SectionCard } from '~/components/SectionCard';
import { useRoleMockStore } from '~/stores/roleMockStore';
import { formatDateTime, getScoreColor } from '~/modules/qa/team/helpers';
import {
	agentProfilePathFor,
	buildCampaignRoster,
} from '~/modules/qa/calls/helpers';
import type { CampaignRosterRow } from '~/modules/qa/calls/types';

const STATUS_COLOR = {
	active: 'green',
	'on-leave': 'gray',
	training: 'blue',
} as const;
const helper = createColumnHelper<CampaignRosterRow>();

export function CampaignRosterTab({
	campaignId,
}: {
	campaignId: string | undefined;
}) {
	const { t } = useTranslation('qa.calls');
	const { t: tTeam } = useTranslation('qa.team');
	const navigate = useNavigate();
	const previewRole = useRoleMockStore((s) => s.previewRole);
	const rows = useMemo(
		() => buildCampaignRoster(campaignId, previewRole),
		[campaignId, previewRole]
	);
	const isSupervisor = previewRole === 'supervisor';

	const columns: BaseTableColumnDef<CampaignRosterRow>[] = [
		helper.accessor((r) => r.agent.name, {
			id: 'agent',
			header: t('roster.columns.agent'),
			cell: (info) => {
				const a = info.row.original.agent;
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar name={a.name} color={a.avatarColor} radius='xl' size='sm' />
						<Stack gap={0}>
							<Text size='sm' fw={600}>
								{a.name}
							</Text>
							<Text size='xs' c='dimmed'>
								{a.id}
							</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor((r) => r.agent.team, {
			id: 'team',
			header: t('roster.columns.team'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor((r) => r.agent.supervisorName, {
			id: 'supervisor',
			header: t('roster.columns.supervisor'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor((r) => r.agent.status, {
			id: 'status',
			header: t('roster.columns.status'),
			cell: (info) => (
				<Badge variant='light' color={STATUS_COLOR[info.getValue()]}>
					{tTeam(`status.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor('calls', {
			header: t('roster.columns.calls'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor('averageQa', {
			header: t('roster.columns.averageQa'),
			cell: (info) =>
				info.row.original.calls ? (
					<Badge variant='light' color={getScoreColor(info.getValue())}>
						{info.getValue()}%
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor('autoFails', {
			header: t('roster.columns.autoFails'),
			cell: (info) =>
				info.getValue() ? (
					<Badge color='red' variant='filled'>
						{info.getValue()}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						0
					</Text>
				),
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor('lastCallAt', {
			header: t('roster.columns.lastCall'),
			cell: (info) => (
				<Text size='sm'>
					{info.getValue() ? formatDateTime(info.getValue()!) : '—'}
				</Text>
			),
		}) as BaseTableColumnDef<CampaignRosterRow>,
	];

	return (
		<SectionCard
			description={t(
				isSupervisor ? 'roster.descriptionSupervisor' : 'roster.description'
			)}
			headerActions={
				<Text size='sm' c='dimmed'>
					{t('roster.rowsCount', { count: rows.length })}
				</Text>
			}
		>
			<BaseTable<CampaignRosterRow>
				data={rows}
				columns={columns}
				getRowId={(r) => r.agent.id}
				initialSort={[{ id: 'averageQa', desc: true }]}
				enablePagination
				pageSize={10}
				density='compact'
				emptyMessage={t(isSupervisor ? 'roster.empty' : 'roster.emptyAll')}
				onRowClick={(r) =>
					navigate(agentProfilePathFor(previewRole, r.agent.id))
				}
			/>
		</SectionCard>
	);
}
```

When the supervisor opens campaign `'1'` or `'3'` (Team 2 campaigns) the table is legitimately empty and shows
`roster.empty` — expected.

### `src/views/Campaigns/pages/CampaignDetail.tsx`

1. Delete the module-local `mockAgents` (`:44-50`), the `Call` interface (`:57-69`) and `mockCalls` (`:71-228`).
   Keep `mockQAForms`.
2. Imports: `import { useMemo } from 'react'` (merge with the existing `useState` import), `useTranslation` from
   `react-i18next`, `useRoleMockStore` from `~/stores/roleMockStore`, `buildCampaignCalls, campaignRosterAgents,
rosterCampaignIdFor` from `~/modules/qa/calls/helpers`, `type { CampaignCallRow }` from
   `~/modules/qa/calls/types`, `CampaignRosterTab` from `../components/CampaignRosterTab`.
3. Inside the component, after `const { id } = useParams();`:

```tsx
const { t } = useTranslation('qa.calls');
const previewRole = useRoleMockStore((s) => s.previewRole);
const campaignCalls = useMemo<CampaignCallRow[]>(
	() => buildCampaignCalls(id),
	[id]
);
const agentOptions = useMemo(
	() =>
		campaignRosterAgents(rosterCampaignIdFor(id), previewRole).map((a) => ({
			value: a.id,
			label: a.name,
		})),
	[id, previewRole]
);
```

4. Replace every `mockCalls` reference with `campaignCalls` (Overview cards `:567`, `:585-589`; filtering IIFE
   `:803`). The IIFE's `let filteredCalls = mockCalls;` → `let filteredCalls = campaignCalls;` and the agent filter
   line (`:805-809`) compares **`c.agentId === callsTableAgentFilter`** (the select now holds agent ids).
   For a supervisor, additionally pre-scope the rows to their team: after the `let filteredCalls` line add
   `if (previewRole === 'supervisor') { const ids = new Set(agentOptions.map((o) => o.value)); filteredCalls = filteredCalls.filter((c) => ids.has(c.agentId)); }`.
5. Agent `Select` (`:610-622`): `label={t('conversations.agentFilter')}`, `placeholder={t('conversations.allAgents')}`,
   `data={agentOptions}`; keep `clearable searchable size='sm'`; add `onChange={(v) => { setCallsTableAgentFilter(v); setCallsTableCurrentPage(1); }}`.
6. Tabs (`:492-496`): add `<Tabs.Tab value='roster'>{t('roster.tab')}</Tabs.Tab>` after Conversations and, after the
   conversations panel (`:992`), `<Tabs.Panel value='roster' pt='md'><CampaignRosterTab campaignId={id} /></Tabs.Panel>`.
   Keep `defaultValue='overview'`; add `keepMounted={false}`.
7. Do not touch the other filters, the table columns (Score stays for managers), modals or the header.

**Typecheck** (count must not exceed the baseline; the file's pre-existing errors remain), commit
`feat(qa-campaigns): roster-backed conversations filter and Roster tab for managers`.

---

## Task 4 — Remove "Calls" from Supervisor and QA Manager

1. `src/components/Sidebar/roleNavigation.tsx`: delete the `supervisor-calls` item (`:150-155`) and remove
   `'supervisor-calls'` from the `pick(...)` at `:243`; delete `qamanager-calls` (`:320-325`) and remove
   `'qamanager-calls'` from the pick at `:432`. `IconPhone` stays imported (used by the agent My Calls item from Task 2).
2. `src/routes.tsx`: delete the lazy imports `SupervisorCallsPage` (`:172-174`) and `QAManagerCallsPage`
   (`:194-196`) and the route objects `supervisor/calls` (`:1067-1077`) and `qa-manager/calls` (`:1298-1308`).
3. Delete `src/modules/qa/supervisor/pages/CallsPage.tsx` and `src/modules/qa/qamanager/pages/CallsPage.tsx`.
4. `src/locales/{en,es}/common.json`: delete `sidebar.supervisor.calls`, `sidebar.qamanager.calls`,
   `sidebar.rolePreview.items.calls` (and the already-orphaned `sidebar.rolePreview.items.myCalls`). Keep
   `rolePreview.placeholder.description` (other placeholders use it).
5. `grep -r "supervisor/calls\|qa-manager/calls\|CallsPage\|items.calls" src` must return nothing.

**Typecheck**, commit `chore(qa-sidebar): drop the Calls entry for Supervisor and QA Manager`.

---

## Task 5 — Remove the dashboards' evaluation-type filter

1. Delete `src/modules/qa/dashboard/components/DashboardEvaluationFilter.tsx`; remove the two export lines from
   `components/index.ts:22-26`.
2. In each of `New{Agent,Supervisor,QAManager,OperationManager}Dashboard.tsx`:
   - remove the `DashboardEvaluationFilter, isCardVisible` and `DashboardEvaluationType` imports (and `useState` from
     the React import if nothing else uses it);
   - remove `const [evaluationType, setEvaluationType] = useState<DashboardEvaluationType>('all');`;
   - remove the `cardClass` helper and replace every `className={cardClass(...)}` with `className={styles.gridCard}`;
   - remove the `<DashboardEvaluationFilter value={evaluationType} onChange={setEvaluationType} />` block;
   - remove every `dimmed={…}` prop (grep `dimmed=` in the four files — Agent has 6, Supervisor 4, QA Manager 4,
     Operation Manager 4).
3. `Dashboard.module.css:47-59`: delete `.dimmedCard` and the comment; keep `.gridCard { height: 100% }` (rewrite the
   comment to "Grid item wrapper so the four evaluation cards stretch to equal height").
4. `src/components/SectionCard/SectionCard.tsx`: remove the `dimmed?: boolean` prop (`:29-30`), its destructuring
   (`:63`) and the class toggle (`:90`); delete `.dimmed` from `SectionCard.module.css:274-277`.
   `src/modules/qa/dashboard/components/InboxSummary.tsx`: remove the `dimmed` prop (`:33,42,99`).
   `grep -rn "dimmed" src --include=*.tsx | grep -v "c='dimmed'" | grep -v 'c="dimmed"'` must show no prop usage.
5. `src/locales/{en,es}/qa.dashboard.json`: delete the `evaluationFilter` block.

**Typecheck**, commit `chore(qa-dashboards): remove the evaluation-type filter`.

---

## Verification (after Task 5)

1. `npx tsc --noEmit -p .` (foreground) — error count ≤ baseline from Task 0, none in new/edited files other than the
   pre-existing Campaigns ones.
2. i18n parity: `node -e "const a=require('./src/locales/en/qa.calls.json'),b=require('./src/locales/es/qa.calls.json');const k=o=>Object.keys(o).flatMap(x=>typeof o[x]==='object'?Object.keys(o[x]).map(y=>x+'.'+y):[x]);console.log(k(a).filter(x=>!k(b).includes(x)),k(b).filter(x=>!k(a).includes(x)))"`
   → `[] []`. Repeat for `common.json` and `qa.dashboard.json`.
3. Manual walkthrough (only if the user asks to run the dev server — `DESIGN_ROLE.md`), per preview role:
   - **Agent**: sidebar shows _My Calls_ (no _Campaigns_); `/qa/agent/calls` lists John Smith's calls newest first
     with date+campaign, duration, auto-fails badge/None — no score column; period/date/auto-fail filters narrow the
     list; row click opens `/qa/campaigns/:id/calls/:callId` with the _Open dispute_ button and a _My Calls_
     breadcrumb; visiting `/qa/campaigns` redirects to `/qa/agent/calls`.
   - **Supervisor**: sidebar has no _Calls_; `/qa/campaigns` unchanged; campaign `'2'` → Conversations agent select
     lists Team 1 agents only (Sarah Johnson … Lisa Wong), rows filter by agent; Roster tab shows Team 1 agents with
     calls / avg QA / auto-fails / last call, click → `/qa/supervisor/your-team/AGT-00N`; campaign `'1'` Roster shows
     the "no agents from your team" empty state.
   - **QA Manager**: same, all agents; Roster click → `/qa/qa-manager/agents/AGT-0NN`.
   - **All four dashboards**: no "Filter by evaluation type" control; the four Performance Score cards stay equal
     height; nothing dimmed.
   - Toggle dark mode on My Calls and the Roster tab.

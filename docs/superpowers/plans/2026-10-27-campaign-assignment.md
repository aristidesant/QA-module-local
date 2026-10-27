# Operation Manager: Team configuration → Campaign Assignment

Target path for execution: `docs/superpowers/plans/2026-10-27-campaign-assignment.md`

## Context

The Operation Manager's "Team configuration" page (`/qa/operation-manager/team-config`) lets the OM create, rename and dissolve teams, move agents between them and change statuses. That no longer matches the product: supervisors will be created by the super admin, and agents enter the system as calls are ingested per campaign (Campaigns section). What the OM actually decides is **which campaigns each supervisor can see**.

The section becomes **Campaign Assignment**: a list of supervisors, and a detail per supervisor with the campaigns assigned to them and, under each campaign, the agents working on it (derived from the campaign, not from the team).

Decisions taken with the user (2026-10-27):

- **A campaign can be assigned to several supervisors** (shared access). The same agents then appear under each supervisor that has the campaign, and the UI says so ("Also assigned to …").
- **List page + detail page**, not a rail. Rows open `/campaign-assignment/:supervisorId`.
- **Agents are read-only** here: name, team, status, calls, last call, link to the profile. Creating, renaming, dissolving teams, moving agents and changing statuses leave this page.

Data facts the design relies on (verified in code):

- `teamStore.teamCampaignIds[supervisorId]` is already the supervisor → campaigns assignment, edited by `setTeamCampaigns`. The QA Manager's Team detail page keeps using it; both screens edit the same data.
- `RosterAgent.campaignIds` is the agent → campaigns link (the "ingestion" source in the mock). Agents on a campaign = agents whose `campaignIds` include it. The store holds 68 agents; the static `TEAM_AGENTS` only 21, so the page must read the **store** profiles.
- Calls per agent and campaign come from `TEAM_CALLS` (`src/modules/qa/analytics/mockData.ts`), the way `buildCampaignRoster` does in `src/modules/qa/calls/helpers.ts:138-159`. Only the 21 base agents have calls; the other 47 show "—".
- Campaign catalogue = `TEAM_CAMPAIGNS` (`src/modules/qa/team/mockData.ts:57-82`): 4 campaigns with `name`, `lineOfBusiness`, `campaignType`. Same ids the store uses.
- Seed: SUP-001 camp-001+003, SUP-002 camp-002+004, SUP-003 camp-003+001, SUP-004 camp-004, SUP-005 camp-001+003, SUP-006 camp-003+002. Three Unassigned agents work on camp-001 and will show under its supervisors with team "Unassigned".

Constraints from `DESIGN_ROLE.md`: mockup quality, no dev server, no tests, no git write operations unless asked. Both themes. `tsconfig` has `noUnusedLocals`. Same visual language as the recent My Learning and Coaching work: hairlines over nested cards, sentence case, no `A · B` joined strings, no uppercase labels.

## Information architecture

```
Sidebar (Operation Manager, cluster Organization)
  Campaign Assignment  →  /qa/operation-manager/campaign-assignment

List page
  Title: Campaign Assignment
  Description: Which campaigns each supervisor can see. Agents join a campaign as its calls are ingested.
  (one line, dimmed) Supervisors are created by the super admin.
  [hint, only when > 0] 1 campaign has no supervisor yet: Sales Training.
  Table: Supervisor (avatar, name, email) | Team | Status | Campaigns | Agents
         row click → detail

Detail page  /qa/operation-manager/campaign-assignment/:supervisorId
  Breadcrumbs: Campaign Assignment › Maria García      [back button]
  Header card: avatar · name · team, email · status        [Assign campaigns]
  Line: 2 campaigns, 9 agents working on them
  One section per campaign:
    Q3 Customer Service            Also assigned to Laura Gómez, Daniel Ortega   [Remove]
    Customer Service, inbound
    Agent | Team | Status | Calls | Last call      (row click → agent profile)
  Empty (no campaigns): "No campaigns assigned" + Assign campaigns button

Assign campaigns drawer
  One row per campaign in TEAM_CAMPAIGNS: checkbox · name · line of business, type
    · "19 agents working on it" · "Also assigned to Juan Pérez" or "No supervisor yet"
  Cancel / Save
```

What disappears: KPI tiles, teams rail, New team, Edit team, Dissolve team, Add agents, Move to…, Unassign, status menus, Change supervisor. The store actions stay (the QA Manager page still uses some) but nothing on the OM page calls them.

## File structure

New folder `src/modules/qa/team/CampaignAssignmentPage/`:

- `index.ts` — `export { default } from './CampaignAssignmentPage';`
- `CampaignAssignmentPage.tsx` — the list
- `CampaignAssignmentDetailPage.tsx` — the detail (default export; imported directly by `routes.tsx`)
- `CampaignPickerDrawer.tsx` — the assign drawer
- `CampaignAgentsTable.tsx` — the per-campaign agents table
- `helpers.ts` — pure derivations (below)
- `CampaignAssignmentPage.module.css` — small

Modified: `src/routes.tsx`, `src/modules/qa/qaNamespaces.ts`, `src/components/Sidebar/roleNavigation.tsx`, `src/modules/qa/team/helpers.ts` (path helpers), `src/modules/qa/team/AgentProfilePage/AgentProfilePage.tsx`, `src/locales/{en,es}/qa.team.json`, `src/locales/{en,es}/common.json`, `docs/product/role-access-matrix.md`.

Deleted: the whole `src/modules/qa/team/TeamConfigPage/` folder (page, CSS, `components/*`). Before deleting, `rg "TeamConfigPage|teamConfig\." src` must only hit `routes.tsx`, `AgentProfilePage.tsx` and the locale files, which this plan rewrites. `src/modules/qa/team/teamConfigSeed.ts` stays (it seeds the store).

## Task 1 — Path helpers and derivations

`src/modules/qa/team/helpers.ts`, next to `teamBasePath` (line ~26):

```ts
/** The Operation Manager's Campaign Assignment list and one supervisor's detail. */
export const campaignAssignmentPath =
	'/qa/operation-manager/campaign-assignment';
export const campaignAssignmentDetailPath = (supervisorId: string) =>
	`${campaignAssignmentPath}/${supervisorId}`;
```

`src/modules/qa/team/CampaignAssignmentPage/helpers.ts`:

```ts
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TEAM_CAMPAIGNS } from '../mockData';
import { UNASSIGNED_SUPERVISOR_ID } from '../constants';
import type {
	AgentProfile,
	RosterAgent,
	RosterCampaign,
	RosterSupervisor,
} from '../types';

export interface SupervisorAssignmentRow {
	id: string;
	supervisor: RosterSupervisor;
	campaigns: RosterCampaign[];
	/** Distinct agents across the supervisor's campaigns. */
	agentCount: number;
}

export interface CampaignAgentRow {
	agent: RosterAgent;
	calls: number;
	lastCallAt: string | null;
}

export const campaignById = (id: string) =>
	TEAM_CAMPAIGNS.find((c) => c.id === id);

/** Agents whose ingested calls put them on this campaign, from the live store, by name. */
export const agentsOnCampaign = (
	profiles: Record<string, AgentProfile>,
	campaignId: string
): RosterAgent[] =>
	Object.values(profiles)
		.map((p) => p.agent)
		.filter((a) => a.campaignIds.includes(campaignId))
		.sort((a, b) => a.name.localeCompare(b.name));

/** Distinct agents across several campaigns. */
export const agentsOnCampaigns = (
	profiles: Record<string, AgentProfile>,
	campaignIds: string[]
): RosterAgent[] => {
	const seen = new Map<string, RosterAgent>();
	for (const id of campaignIds)
		for (const a of agentsOnCampaign(profiles, id)) seen.set(a.id, a);
	return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
};

/** One table row per agent with the calls TEAM_CALLS holds for them on this campaign. */
export const campaignAgentRows = (
	agents: RosterAgent[],
	campaignId: string
): CampaignAgentRow[] =>
	agents.map((agent) => {
		const calls = TEAM_CALLS.filter(
			(c) => c.campaignId === campaignId && c.agentId === agent.id
		);
		return {
			agent,
			calls: calls.length,
			lastCallAt: calls.length ? calls[calls.length - 1].date : null,
		};
	});

/** Supervisors (other than `exceptId`) that also have this campaign, by name. */
export const otherSupervisorsWithCampaign = (
	teamCampaignIds: Record<string, string[]>,
	supervisors: Record<string, RosterSupervisor>,
	campaignId: string,
	exceptId?: string
): RosterSupervisor[] =>
	Object.entries(teamCampaignIds)
		.filter(
			([supId, ids]) =>
				supId !== exceptId &&
				supId !== UNASSIGNED_SUPERVISOR_ID &&
				ids.includes(campaignId)
		)
		.map(([supId]) => supervisors[supId])
		.filter((s): s is RosterSupervisor => Boolean(s))
		.sort((a, b) => a.name.localeCompare(b.name));

/** Campaigns no supervisor has. */
export const unassignedCampaigns = (
	teamCampaignIds: Record<string, string[]>
): RosterCampaign[] => {
	const assigned = new Set(Object.values(teamCampaignIds).flat());
	return TEAM_CAMPAIGNS.filter((c) => !assigned.has(c.id));
};

export const supervisorAssignmentRows = (
	supervisors: Record<string, RosterSupervisor>,
	teamCampaignIds: Record<string, string[]>,
	profiles: Record<string, AgentProfile>
): SupervisorAssignmentRow[] =>
	Object.values(supervisors)
		.filter((s) => s.id !== UNASSIGNED_SUPERVISOR_ID)
		.map((supervisor) => {
			const ids = teamCampaignIds[supervisor.id] ?? [];
			return {
				id: supervisor.id,
				supervisor,
				campaigns: ids
					.map(campaignById)
					.filter((c): c is RosterCampaign => Boolean(c)),
				agentCount: agentsOnCampaigns(profiles, ids).length,
			};
		})
		.sort((a, b) => a.supervisor.name.localeCompare(b.supervisor.name));
```

`TEAM_CALLS` is sorted ascending by date (see the comment at `calls/helpers.ts:150`), so the last element is the last call. Typecheck.

## Task 2 — Locale keys (`qa.team`, en + es) and sidebar labels

In `src/locales/en/qa.team.json`, **replace the whole `teamConfig` block** (lines 545-653) with:

```json
"campaignAssignment": {
	"title": "Campaign Assignment",
	"description": "Which campaigns each supervisor can see. Agents join a campaign as its calls are ingested.",
	"managedElsewhere": "Supervisors are created by the super admin.",
	"list": {
		"columns": { "supervisor": "Supervisor", "team": "Team", "status": "Status", "campaigns": "Campaigns", "agents": "Agents" },
		"noCampaigns": "No campaigns yet",
		"more": "+{{count}}",
		"rowsCount_one": "{{count}} supervisor",
		"rowsCount_other": "{{count}} supervisors",
		"empty": "No supervisors yet. They are created by the super admin.",
		"unassigned_one": "{{count}} campaign has no supervisor yet: {{names}}",
		"unassigned_other": "{{count}} campaigns have no supervisor yet: {{names}}"
	},
	"detail": {
		"assign": "Assign campaigns",
		"summary": "{{campaigns}} and {{agents}} working on them",
		"campaigns_one": "{{count}} campaign",
		"campaigns_other": "{{count}} campaigns",
		"agents_one": "{{count}} agent",
		"agents_other": "{{count}} agents",
		"campaignMeta": "{{lineOfBusiness}}, {{type}}",
		"sharedWith": "Also assigned to {{names}}",
		"onlyHere": "Only this supervisor",
		"remove": "Remove campaign",
		"removeTitle": "Remove {{campaign}}?",
		"removeBody": "{{name}} will stop seeing this campaign. Its agents and calls are not affected.",
		"removeConfirm": "Remove",
		"removed": "{{campaign}} removed from {{name}}",
		"emptyTitle": "No campaigns assigned",
		"emptyDescription": "Assign the campaigns {{name}} should see. The agents working on them appear here.",
		"noAgents": "No agents yet. They appear once calls for this campaign are ingested.",
		"columns": { "agent": "Agent", "team": "Team", "status": "Status", "calls": "Calls", "lastCall": "Last call" },
		"notFound": "Supervisor not found.",
		"back": "Back to Campaign Assignment"
	},
	"picker": {
		"title": "Assign campaigns",
		"description": "{{name}} will see every campaign ticked here.",
		"agents_one": "{{count}} agent working on it",
		"agents_other": "{{count}} agents working on it",
		"sharedWith": "Also assigned to {{names}}",
		"unassigned": "No supervisor yet",
		"save": "Save",
		"saved": "Campaigns updated for {{name}}"
	},
	"campaignType": { "INBOUND": "inbound", "OUTBOUND": "outbound", "BLENDED": "blended" }
}
```

`src/locales/es/qa.team.json`, same structure (replace its `teamConfig` block):

```json
"campaignAssignment": {
	"title": "Asignación de campañas",
	"description": "Qué campañas puede ver cada supervisor. Los agentes entran en una campaña a medida que se ingestan sus llamadas.",
	"managedElsewhere": "Los supervisores los crea el superadministrador.",
	"list": {
		"columns": { "supervisor": "Supervisor", "team": "Equipo", "status": "Estado", "campaigns": "Campañas", "agents": "Agentes" },
		"noCampaigns": "Sin campañas todavía",
		"more": "+{{count}}",
		"rowsCount_one": "{{count}} supervisor",
		"rowsCount_other": "{{count}} supervisores",
		"empty": "Todavía no hay supervisores. Los crea el superadministrador.",
		"unassigned_one": "{{count}} campaña no tiene supervisor: {{names}}",
		"unassigned_other": "{{count}} campañas no tienen supervisor: {{names}}"
	},
	"detail": {
		"assign": "Asignar campañas",
		"summary": "{{campaigns}} y {{agents}} trabajando en ellas",
		"campaigns_one": "{{count}} campaña",
		"campaigns_other": "{{count}} campañas",
		"agents_one": "{{count}} agente",
		"agents_other": "{{count}} agentes",
		"campaignMeta": "{{lineOfBusiness}}, {{type}}",
		"sharedWith": "También asignada a {{names}}",
		"onlyHere": "Solo este supervisor",
		"remove": "Quitar campaña",
		"removeTitle": "¿Quitar {{campaign}}?",
		"removeBody": "{{name}} dejará de ver esta campaña. Sus agentes y llamadas no cambian.",
		"removeConfirm": "Quitar",
		"removed": "{{campaign}} quitada de {{name}}",
		"emptyTitle": "Sin campañas asignadas",
		"emptyDescription": "Asigna las campañas que {{name}} debe ver. Los agentes que trabajan en ellas aparecerán aquí.",
		"noAgents": "Todavía no hay agentes. Aparecen cuando se ingestan llamadas de esta campaña.",
		"columns": { "agent": "Agente", "team": "Equipo", "status": "Estado", "calls": "Llamadas", "lastCall": "Última llamada" },
		"notFound": "Supervisor no encontrado.",
		"back": "Volver a Asignación de campañas"
	},
	"picker": {
		"title": "Asignar campañas",
		"description": "{{name}} verá todas las campañas marcadas.",
		"agents_one": "{{count}} agente trabajando en ella",
		"agents_other": "{{count}} agentes trabajando en ella",
		"sharedWith": "También asignada a {{names}}",
		"unassigned": "Sin supervisor todavía",
		"save": "Guardar",
		"saved": "Campañas actualizadas para {{name}}"
	},
	"campaignType": { "INBOUND": "entrante", "OUTBOUND": "saliente", "BLENDED": "mixta" }
}
```

Keep `status.active` / `status.inactive` and `modals.cancel` (already in the namespace, reused).

`src/locales/en/common.json` line 226: replace `"teamConfig": "Team configuration"` with `"campaignAssignment": "Campaign Assignment"`. `es/common.json` line 224: `"campaignAssignment": "Asignación de campañas"`. Then `rg "operationmanager.teamConfig" src` → 0 after Task 5.

## Task 3 — List page

`CampaignAssignmentPage.module.css`:

```css
/* The campaign names in the list read as text, not chips; the overflow count stays dimmed. */
.supervisorRow {
	cursor: pointer;
}

/* A campaign block on the detail page: title row, then its agents, split by a hairline. */
.campaignHeader {
	padding-bottom: var(--mantine-spacing-sm);
	border-bottom: 1px solid var(--surface-border);
}
```

`CampaignAssignmentPage.tsx`:

- `useTranslation('qa.team')`, `useNavigate`.
- Store: `supervisors = useTeamStore(selectSupervisors)`, `teamCampaignIds = useTeamStore((s) => s.teamCampaignIds)`, `profiles = useTeamStore(selectProfiles)`.
- `rows = useMemo(() => supervisorAssignmentRows(supervisors, teamCampaignIds, profiles), …)`; `orphans = useMemo(() => unassignedCampaigns(teamCampaignIds), …)`.
- Shell: `ContentContainer contentWidth='full' title={t('campaignAssignment.title')} description={t('campaignAssignment.description')}`.
- Inside `Stack gap='lg'`:
  1. `<Text size='sm' c='dimmed'>{t('campaignAssignment.managedElsewhere')}</Text>`
  2. When `orphans.length > 0`: `<Alert variant='light' color='gray' icon={<IconSpeakerphone size={16} />}>{t('campaignAssignment.list.unassigned', { count: orphans.length, names: orphans.map((c) => c.name).join(', ') })}</Alert>`
  3. `SectionCard` with `headerActions` = dimmed `rowsCount` text, body `BaseTable<SupervisorAssignmentRow>` `data={rows} columns getRowId={(r) => r.id} initialSort={[{ id: 'supervisor', desc: false }]} density='compact' emptyMessage={t('campaignAssignment.list.empty')} onRowClick={(r) => navigate(campaignAssignmentDetailPath(r.id))}`.
- Columns (`createColumnHelper<SupervisorAssignmentRow>`, each `as BaseTableColumnDef<…>`), copying the cell style of `TeamsListPage/useTeamsColumns.tsx`:
  - `supervisor` (accessor `r.supervisor.name`): `Avatar name color='gray' radius='xl' size='sm'` + name `sm/600` + email `xs` dimmed.
  - `team` (accessor `r.supervisor.team`): `Text size='sm'`.
  - `status` (accessor `r.supervisor.status ?? 'active'`): `Badge variant='light' color={status === 'active' ? 'green' : 'gray'}` with `t(\`status.${status}\`)`.
  - `campaigns` (accessor `r.campaigns.map((c) => c.name)`, `enableSorting: false`): empty → dimmed `t('campaignAssignment.list.noCampaigns')`; else the first two names joined with `', '` and, when more, a dimmed `t('campaignAssignment.list.more', { count })` after a space.
  - `agents` (accessor `r.agentCount`): `Text size='sm'`.

Typecheck after Task 5 (routes), since the page is not imported before.

## Task 4 — Detail page, agents table, picker drawer

`CampaignAgentsTable.tsx` — props `{ rows: CampaignAgentRow[]; onOpenAgent: (agent: RosterAgent) => void }`. `BaseTable<CampaignAgentRow>` `getRowId={(r) => r.agent.id} initialSort={[{ id: 'calls', desc: true }]} enablePagination showPaginationControls pageSize={10} density='compact' emptyMessage={t('campaignAssignment.detail.noAgents')} onRowClick={(r) => onOpenAgent(r.agent)}`. Columns, in the style of `views/Campaigns/components/CampaignRosterTab.tsx`:

- `agent`: `Avatar name={a.name} color={a.avatarColor} radius='xl' size='sm'` + name `sm/600` + id `xs` dimmed.
- `team` (accessor `r.agent.team`): `Text size='sm'`, dimmed when `r.agent.supervisorId === UNASSIGNED_SUPERVISOR_ID`.
- `status`: the green/gray badge as in Task 3.
- `calls`: number, or dimmed `—` when 0.
- `lastCall`: `formatDateTime(r.lastCallAt)` (from `~/modules/qa/team/helpers`) or dimmed `—`.

`CampaignPickerDrawer.tsx` — props `{ opened; onClose; supervisor: RosterSupervisor; currentCampaignIds: string[] }`.

- Store: `setTeamCampaigns`, `teamCampaignIds`, `supervisors`, `profiles`.
- `selected` state, re-synced on open like `TeamDetailPage/AssignCampaignsDrawer.tsx:28-30`.
- `AppDrawer size='md' title={t('campaignAssignment.picker.title')} description={t('campaignAssignment.picker.description', { name: supervisor.name })} icon={<IconSpeakerphone size={18} />}`.
- Body: `Stack gap={0}` with one row per `TEAM_CAMPAIGNS` entry, rows separated by a hairline (`style` is not allowed: add `.pickerRow { padding: var(--mantine-spacing-sm) 0; } .pickerRow + .pickerRow { border-top: 1px solid var(--surface-border); }` to the CSS module). Row = `Checkbox` whose `label` is the campaign name and `description` is a small `Stack gap={2}` of: `t('campaignAssignment.detail.campaignMeta', { lineOfBusiness, type: t(\`campaignAssignment.campaignType.${c.campaignType}\`) })`, `t('campaignAssignment.picker.agents', { count: agentsOnCampaign(profiles, c.id).length })`, and either `t('campaignAssignment.picker.sharedWith', { names })`from`otherSupervisorsWithCampaign(teamCampaignIds, supervisors, c.id, supervisor.id)`or`t('campaignAssignment.picker.unassigned')` when nobody else has it and it is not selected.
- Footer `Group justify='flex-end'`: `Button variant='default'` `modals.cancel`, `Button` `picker.save` → `setTeamCampaigns(supervisor.id, selected)`, `notifySuccess(t('campaignAssignment.picker.saved', { name }))`, `onClose()`.

`CampaignAssignmentDetailPage.tsx`:

- `useParams<{ supervisorId }>()`, `supervisor = useTeamStore(selectSupervisor(id))`, `campaignIds = useTeamStore(selectTeamCampaignIds(id))`, `profiles`, `supervisors`, `teamCampaignIds`, `setTeamCampaigns`.
- Not found (or `id === UNASSIGNED_SUPERVISOR_ID`): `EmptyState message={t('campaignAssignment.detail.notFound')} action={<Button onClick={() => navigate(campaignAssignmentPath)}>{t('campaignAssignment.detail.back')}</Button>}`.
- Shell: `ContentContainer contentWidth='full' showBackButton onBackClick={() => navigate(campaignAssignmentPath)}`; `Breadcrumbs`: `Anchor` title → list, `Text c='dimmed'` supervisor name.
- Header `SectionCard padding='lg'`: `Group justify='space-between'`: left `Avatar size={56} radius='md' name` + `Title order={3}` name + `Text size='sm' c='dimmed'` `${team}, ${email}` + status badge; right `Button leftSection={<IconPlus size={16} />}` `detail.assign` opening the drawer.
- Summary `Text size='sm'`: `t('campaignAssignment.detail.summary', { campaigns: t('campaignAssignment.detail.campaigns', { count: campaigns.length }), agents: t('campaignAssignment.detail.agents', { count: agentsOnCampaigns(profiles, campaignIds).length }) })`. Hidden when there are no campaigns.
- No campaigns: `EmptyState icon={<IconSpeakerphone size={28} />} message={detail.emptyTitle} description={t('…emptyDescription', { name })} action={assign button}`.
- Otherwise one `SectionCard` per campaign (`key={campaign.id}`), `title={campaign.name}`, `description={campaignMeta}`, `headerActions={<Group gap='sm'><Text size='xs' c='dimmed'>{shared ? t('detail.sharedWith', { names }) : t('detail.onlyHere')}</Text><ActionIcon variant='subtle' color='gray' aria-label={t('detail.remove')} onClick={() => confirmRemove(campaign)}><IconX size={16} /></ActionIcon></Group>}`, body `<CampaignAgentsTable rows={campaignAgentRows(agentsOnCampaign(profiles, campaign.id), campaign.id)} onOpenAgent={(a) => navigate(agentProfilePath('qa-manager', a), { state: { from: 'campaign-assignment' } })} />`.
- `confirmRemove`: `modals.openConfirmModal({ title: t('detail.removeTitle', { campaign }), children: <Text size='sm'>{t('detail.removeBody', { name })}</Text>, labels: { confirm: t('detail.removeConfirm'), cancel: t('modals.cancel') }, confirmProps: { color: 'red' }, onConfirm: () => { setTeamCampaigns(id, campaignIds.filter((c) => c !== campaign.id)); notifySuccess(t('detail.removed', { campaign: campaign.name, name })); } })`.
- `<CampaignPickerDrawer … />` at the bottom.

Imports to copy from `TeamDetailPage.tsx`: `ContentContainer` (named), `EmptyState` (default), `SectionCard`, `modals`, `notifySuccess`, `agentProfilePath`, `UNASSIGNED_SUPERVISOR_ID`.

## Task 5 — Routes, namespaces, sidebar, profile back link, deletion

`src/routes.tsx`:

- Replace the lazy import at lines 211-213 with
  `const CampaignAssignmentPage = React.lazy(() => import('./modules/qa/team/CampaignAssignmentPage'));`
  `const CampaignAssignmentDetailPage = React.lazy(() => import('./modules/qa/team/CampaignAssignmentPage/CampaignAssignmentDetailPage'));`
- Replace the route at lines 1787-1796 with two routes using the same `I18nNamespaceLoader` + `Suspense` wrapper: `path: 'operation-manager/campaign-assignment'`, `id: 'qa.operation-manager.campaign-assignment'`, element `<CampaignAssignmentPage />`; and `path: 'operation-manager/campaign-assignment/:supervisorId'`, `id: 'qa.operation-manager.campaign-assignment.detail'`, element `<CampaignAssignmentDetailPage />`.
- Add a redirect so old links keep working: `{ path: 'operation-manager/team-config', element: <Navigate to='/qa/operation-manager/campaign-assignment' replace /> }` (copy the shape of the existing `auto-triggers` redirect around line 1760).

`src/modules/qa/qaNamespaces.ts` line 80: replace with `'qa.operation-manager.campaign-assignment': ['qa.team'],` and `'qa.operation-manager.campaign-assignment.detail': ['qa.team'],`.

`src/components/Sidebar/roleNavigation.tsx` lines 422-428: key `operationmanager-campaign-assignment`, label `sidebar.operationmanager.campaignAssignment`, icon `IconSpeakerphone` (already imported at line 15), `to: '/qa/operation-manager/campaign-assignment'`, `i18nNamespace: 'qa.team'`. Update the `byKey(...)` call at line 479. Drop `IconUsersGroup` from the import if nothing else uses it (`rg IconUsersGroup src/components/Sidebar/roleNavigation.tsx`).

`src/modules/qa/team/AgentProfilePage/AgentProfilePage.tsx` lines 64-69: `from === 'campaign-assignment'`, `backPath = fromCampaignAssignment ? campaignAssignmentPath : teamBasePath(role)` (import `campaignAssignmentPath` from `../helpers`; rename the local to `fromCampaignAssignment` and update line 211 to `t('campaignAssignment.title')`).

Delete `src/modules/qa/team/TeamConfigPage/` (folder). Then:

- `rg "TeamConfigPage|teamConfig\.|team-config|operationmanager\.teamConfig" src` → 0 hits (`teamConfigSeed` does not match these patterns).
- `npm run typecheck` → no errors in the touched files.

## Task 6 — Docs and sweep

- `docs/product/role-access-matrix.md`: in the sidebar table replace "Team configuration" with "Campaign Assignment" (row 3 of the Operation Manager column); in the "Equipos" row, the Operation Manager cell becomes "Menú (Campaign Assignment) · E. Decide qué campañas ve cada supervisor; ve los agentes que trabajan en ellas. Team Health abre la página del QA Manager con sus acciones de edición"; drop "Crea, renombra y disuelve equipos, mueve agentes, cambia estados y supervisor".
- `rg "tt='uppercase'|style={{" src/modules/qa/team/CampaignAssignmentPage` → 0.
- Translation-key check: every `t('campaignAssignment.…')` literal in the new folder plus `AgentProfilePage.tsx` resolves in both `qa.team.json` files (plural keys resolve through `_one`/`_other`).
- No hex colours in the new CSS module.

## Verification (manual, no dev server per DESIGN_ROLE.md)

- Operation Manager sidebar shows "Campaign Assignment" in the Organization cluster; `/qa/operation-manager/team-config` redirects to it.
- List: 6 supervisors sorted by name; Maria García shows "Q3 Customer Service, Q4 Compliance" and 9 agents; Juan Pérez shows 2 campaigns and 32 agents. No hint strip (every campaign has a supervisor in the seed).
- Detail of Maria García: two campaign sections; Q3 Customer Service says "Also assigned to Daniel Ortega, Laura Gómez" and lists 9 agents including the 3 with team "Unassigned" (dimmed); Q4 Compliance lists 3. Clicking an agent opens the profile and its back button returns to Campaign Assignment.
- Remove Q4 Compliance → confirm → section disappears, summary updates, list shows "+0"/one name. Assign campaigns → tick Sales Training → Save → new section with 27 agents, picker said "Also assigned to Juan Pérez, Valeria Soto".
- Untick every campaign → empty state with the Assign button.
- QA Manager → Teams → a team detail still shows the same campaigns (shared store).
- Light and dark: hairlines use `--surface-border`; badges are Mantine light variants.

## Out of scope

- Super admin screen to create supervisors (does not exist; `useCreateSupervisorMutation` exists in `src/queries/qa/supervisorsQueries.ts` with no UI).
- Removing the now-unused store actions `createTeam`, `updateTeam`, `dissolveTeam`, `setAgentStatus`, `setSupervisorStatus` and the `teamConfig.*` plans under `docs/superpowers/plans/2026-10-19-*` and `2026-10-20-team-config-*` (leave; note as follow-up).
- Aligning `TEAM_CAMPAIGNS` (4 roster campaigns) with the Campaigns section's `mockCampaigns` ('1'..'5'); the page uses the roster ids the store already holds.
- Committing (user asks explicitly).

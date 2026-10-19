# Operation Manager: Team configuration (supervisors, teams and agent assignment)

## Context

The Operation Manager has no place to shape the organisation: the sidebar's "Supervisors" entry points at `/workspace/qa/operationmanager/supervisors`, a route that does not exist, and nobody in the app can create a supervisor or a team today. The QA Manager can move agents between existing teams from a team's detail page, but cannot add or dissolve teams.

In this codebase a team **is** its supervisor: `RosterSupervisor { id, name, team, email }` carries the team label, every `RosterAgent` points at one `supervisorId`, and agents removed from a team sit under the `UNASSIGNED` pseudo-supervisor. The new section keeps that model and gives the Operation Manager one screen to create teams (with their supervisor), rename or dissolve them, edit the supervisor, and drag agents between teams and the Unassigned pool.

Decisions made with the user (2026-10-19):

- **Layout:** a drag-and-drop board, one column per team with the supervisor on top and agent cards inside, plus an Unassigned column. Same library the form builder uses (`@hello-pangea/dnd`).
- **New team:** one form asking for the team name, the supervisor's name and email, and optionally the first members.
- **Sidebar:** the dead "Supervisors" link in the Organization group becomes "Team configuration" at `/qa/operation-manager/team-config`.
- **Agents:** only existing roster agents are assigned; no "new agent" form.

Mode: mockup. Mantine v9, CSS modules, no inline styles, strings in `en` and `es`, `@mantine/form` for forms (repo convention). No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-19-operation-manager-team-config.md`.

---

## Verified facts (do not re-explore)

**Model** (`src/modules/qa/team/types.ts`, CRLF): `RosterSupervisor { id; name; team; email }`, `RosterAgent { id; name; email; supervisorId; supervisorName; team; campaignIds; status: 'active'|'on-leave'|'training'; shift: 'morning'|'afternoon'|'night'; hireDate; trackedSince; skills; avatarColor }`, `AgentProfile.agent: RosterAgent`. `src/modules/qa/team/constants.ts`: `UNASSIGNED_SUPERVISOR_ID = 'UNASSIGNED'`, `UNASSIGNED_SUPERVISOR = { id, name: 'Unassigned', team: 'Unassigned', email: '' }`, `OPERATION_MANAGER_PERSONA`. Seed: three supervisors SUP-001/002/003 ("Team 1/2/3"), 21 agents (7 each), none unassigned.

**Store** (`src/stores/qa/teamStore.ts`, CRLF): state `profiles: Record<agentId, AgentProfile>`, `supervisors: Record<supervisorId, RosterSupervisor>`, `teamCampaignIds: Record<supervisorId, string[]>`; `nextId(prefix)` counter (`${prefix}-${++counter}`, starts at 501); actions `updateSupervisor(id, { name?, email? })` (rewrites members' `supervisorName`), `setTeamCampaigns`, `removeMember(agentId)` (sets the agent's `supervisorId/supervisorName/team` to the Unassigned values), `addMembers(agentIds, supervisorId)` (reads `s.supervisors[supervisorId] ?? UNASSIGNED_SUPERVISOR` and writes `supervisorId/supervisorName/team` on each agent; this is the move). Selectors `selectSupervisors`, `selectSupervisor(id)`, `selectProfile(id)`, `selectTeamCampaignIds(id)`. No persistence. Missing: create / rename / dissolve team.

**Existing UI to reuse:** `src/modules/qa/team/TeamDetailPage/EditSupervisorModal.tsx` (`{ opened, onClose, supervisor }`, Mantine `Modal`, calls `updateSupervisor`, toasts `teams.editSupervisor.success`). `TeamsListPage` reads supervisors and profiles live from the store and shows an Unassigned card when any agent is unassigned. Status labels `t('status.active|on-leave|training')` in `qa.team`. Avatar row pattern: `<Avatar name={name} color='gray' radius='xl' size='sm' />` + name (`useTeamColumns.tsx`).

**Drag and drop:** `@hello-pangea/dnd` 18 (no dnd-kit). Reference: `src/modules/qa/forms/FormBuilderPage/components/BuilderOutline/BuilderOutline.tsx` (`DragDropContext onDragEnd`, `Droppable droppableId type`, `Draggable draggableId index`, prefixed ids, `snapshot.isDragging` / `isDraggingOver` classes) and its CSS (`.grip { cursor: grab }`, `.dragging { box-shadow: var(--mantine-shadow-md); background: light-dark(white, dark-6) }`, `.dropActive { background: light-dark(var(--mantine-primary-color-0), var(--mantine-color-dark-5)) }`, lists keep `min-height` so empty ones stay droppable).

**Routes and nav:** QA routes sit under the `qa` parent (`<ModuleGuard qaAdminOnly>`), lazy + `I18nNamespaceLoader` + `Suspense`; namespaces per route id in `src/modules/qa/qaNamespaces.ts` (e.g. `'qa.operation-manager.inbox': ['qa.inbox', 'qa.teamAnalytics', 'qa.team']`). OM routes today: `dashboards/operation-manager`, `operation-manager/inbox`, `operation-manager/inbox/:notificationId` (around `routes.tsx` L1701-1722). `src/components/Sidebar/roleNavigation.tsx` (LF): `getOperationManagerNavigation()` item `{ key: 'operationmanager-supervisors', label: 'sidebar.operationmanager.supervisors', icon: <IconUsers …/>, to: '/workspace/qa/operationmanager/supervisors', i18nNamespace: 'qa.operationmanager' }` and `getOperationManagerNavigationGrouped()` picks `byKey('operationmanager-supervisors')` into the Organization group. `common.json` `sidebar.operationmanager.*` has `supervisors` but no `teamConfig`.

**Page patterns:** `ContentContainer contentWidth='full' title description titleRight={<Button size='sm' leftSection={<IconPlus/>}>}` (Forms list); KPI strip = `SimpleGrid` of `StatCard` (`src/components/StatCard`: `title, value, subtitle?, icon?, color?, variant?: 'default'|'compact'`); `AppDrawer` (`~/components/AppDrawer`, props `title, description, icon, iconColor, headerActions` + Mantine `DrawerProps`); `useForm` from `@mantine/form` with `initialValues` + `validate` map, `form.onSubmit`, `form.getInputProps`, `form.isDirty()`; confirm with `modals.openConfirmModal({ title, children, labels, confirmProps: { color: 'red' }, onConfirm })` from `@mantine/modals`; toasts `notifySuccess` / `notifyWarning` (`~/modules/qa/utils/notifications`); `EmptyState` (`icon, message, description?, action?`).

**Out of the store's reach (static mocks):** analytics `scopeAgents`, `TEAM_CALLS`, disputes scoping, coaching/LMS supervisor selects, rankings team matching, `OPERATION_MANAGER_TEAMS` on the OM dashboard all read `TEAM_SUPERVISORS` / `TEAM_AGENTS`. A new team shows up on this board and on the QA Manager's Teams pages only. That is acceptable for the mockup and is stated in the plan's out-of-scope list.

---

## Direction

```
Team configuration                                         [+ New team]
Create teams, assign a supervisor to each one and move agents between them.

┌ 4 teams ┐ ┌ 21 agents ┐ ┌ 2 unassigned ┐ ┌ 5.3 avg team size ┐      [Search agents…]

┌ Unassigned ─────┐ ┌ Team 1 ──────────────── ⋮ ┐ ┌ Team 2 ──────────────── ⋮ ┐ ┌ Collections B ─────── ⋮ ┐
│ 2 agents        │ │ (MG) Maria García         │ │ (JP) Juan Pérez           │ │ (RL) Rosa Lima          │
│ ┆ (AM) Andrés M.│ │ maria.garcia@…   7 agents │ │ juan.perez@…     6 agents │ │ rosa.lima@…    0 agents │
│ ┆ (PC) Paula C. │ │ ┆ (SJ) Sarah Johnson   ⇄ │ │ ┆ (MC) Mike Chen        ⇄ │ │                         │
│   Drop here to  │ │ ┆ (JS) John Smith      ⇄ │ │ ┆ …                       │ │   Drop agents here      │
│   unassign      │ │ ┆ …                      │ │                           │ │                         │
└─────────────────┘ └───────────────────────────┘ └───────────────────────────┘ └─────────────────────────┘
   ⋮ menu: Edit supervisor · Rename team · Dissolve team        ⇄ on a card: "Move to…" menu (keyboard/touch path)
```

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. CRLF files (`teamStore.ts`, `types.ts`) are edited with an EOL-aware script; the rest are LF. New files follow the `ComponentName/ComponentName.tsx` + `.module.css` + `index.ts` convention.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-19-operation-manager-team-config.md`.

### Task 1 — Store actions (`src/stores/qa/teamStore.ts`, CRLF)

Add to `TeamState` and implement (same `set` style as `addMembers`; no notifications):

```ts
export interface CreateTeamInput { teamName: string; supervisorName: string; supervisorEmail: string; memberIds?: string[] }

/** Creates a supervisor with their team and, optionally, moves the first members in. Returns the new supervisor. */
createTeam: (input: CreateTeamInput) => RosterSupervisor;
// id = nextId('SUP') → 'SUP-501'; supervisors[id] = { id, name, team: teamName, email }; teamCampaignIds[id] = [];
// then the addMembers logic for memberIds (supervisorId/supervisorName/team on each agent).

/** Renames the team and relabels every member. */
renameTeam: (supervisorId: string, teamName: string) => void;
// supervisors[id].team = teamName; profiles whose agent.supervisorId === id get agent.team = teamName.

/** Removes the team: members go to Unassigned, the supervisor and their campaign list go away. */
dissolveTeam: (supervisorId: string) => void;
// members → the removeMember values (UNASSIGNED_SUPERVISOR id/name/team); delete supervisors[id] and teamCampaignIds[id].
```

Also export a selector `selectProfiles = (s) => s.profiles` next to the existing ones (the board reads profiles once and derives columns with `useMemo`).

### Task 2 — Page and components (`src/modules/qa/team/TeamConfigPage/`)

Files: `TeamConfigPage.tsx`, `TeamConfigPage.module.css`, `index.ts`, `components/TeamColumn.tsx`, `components/AgentCard.tsx`, `components/NewTeamDrawer.tsx`, `components/RenameTeamModal.tsx`. Namespace `qa.team` (new `teamConfig.*` block, Task 5).

**`TeamConfigPage.tsx`**

- Reads `supervisors` (`selectSupervisors`) and `profiles` (`selectProfiles`); `agents = useMemo(() => Object.values(profiles).map((p) => p.agent).sort(byName))`; `[search, setSearch]`; `byTeam: Record<supervisorId | 'UNASSIGNED', RosterAgent[]>` with the search applied (name or id, case-insensitive).
- Header: `ContentContainer contentWidth='full' title={t('teamConfig.title')} description={t('teamConfig.description')} titleRight={<Button size='sm' leftSection={<IconPlus size={16} />} onClick={openNewTeam}>{t('teamConfig.newTeam')}</Button>}`.
- KPI strip `SimpleGrid cols={{ base: 2, md: 4 }}` of `StatCard variant='compact'`: teams (`IconUsersGroup`), assigned agents (`IconUsers`), unassigned (`IconUserOff`, `color='amber'` when > 0), average team size (`IconChartBar`, one decimal). Under it a right-aligned `TextInput size='sm' w={260}` search with `IconSearch` and a clear button (`aria-label`).
- Board: `<DragDropContext onDragEnd={handleDragEnd}>` → `<div className={styles.board}>` (flex, `gap: var(--mantine-spacing-md)`, `overflow-x: auto`, `align-items: flex-start`, `padding-bottom` for the scrollbar). First the Unassigned `TeamColumn` (`variant='unassigned'`), then one `TeamColumn` per supervisor in creation order (`Object.values(supervisors)`). When there are no supervisors at all: `EmptyState icon={<IconUsersGroup size={40} />} message={t('teamConfig.empty.title')} description={…} action={<Button onClick={openNewTeam}>…}` instead of the board (the Unassigned column still shows when agents exist).
- `handleDragEnd({ draggableId, source, destination })`: ignore when `!destination` or `destination.droppableId === source.droppableId`; `agentId = draggableId.replace('agent:', '')`; `target = destination.droppableId.replace('team:', '')`; `target === UNASSIGNED_SUPERVISOR_ID ? removeMember(agentId) : addMembers([agentId], target)`; `notifySuccess(t('teamConfig.toast.moved', { name, team }))` where `team` is the supervisor's `team` or `t('teamConfig.board.unassigned')`.
- Same `moveAgent(agentId, target)` function backs the "Move to…" menu on each card (Task 2 `AgentCard`).
- Dialog state: `newTeamOpened`; `editing: RosterSupervisor | null` (→ existing `EditSupervisorModal`); `renaming: RosterSupervisor | null` (→ `RenameTeamModal`); dissolve → `modals.openConfirmModal({ title: t('teamConfig.dissolve.title', { team }), children: <Text size='sm'>{t('teamConfig.dissolve.body', { count })}</Text>, labels: { confirm: t('teamConfig.dissolve.confirm'), cancel: t('common.cancel') }, confirmProps: { color: 'red' }, onConfirm: () => { dissolveTeam(id); notifySuccess(t('teamConfig.toast.dissolved', { team })) } })`. (`common.cancel` exists in `qa.team` under `common`; verify with a grep, else use the `common` namespace key.)

**`components/TeamColumn.tsx`** — props `{ supervisor: RosterSupervisor; agents: RosterAgent[]; variant?: 'team' | 'unassigned'; targets: { id: string; label: string }[]; onMove(agentId, targetId); onEditSupervisor?(); onRename?(); onDissolve?() }`.

- `Paper withBorder radius='md' className={cx(styles.column, variant === 'unassigned' && styles.columnUnassigned)}` (width 280px, `flex: none`; unassigned has a dashed border via `border-style: dashed`).
- Header `Stack gap={6} className={styles.columnHeader}`: `Group justify='space-between' wrap='nowrap'`: `Title order={4} lineClamp={1}` team name + (team variant) `Menu` on an `ActionIcon variant='subtle' color='gray' aria-label={t('teamConfig.column.menu.label')}` (`IconDotsVertical`) with items Edit supervisor (`IconEdit`), Rename team (`IconPencil`), Dissolve team (`IconTrash`, `color='red'`). Below (team variant): `Group gap='sm' wrap='nowrap'`: `Avatar name={supervisor.name} color='gray' radius='xl' size='md'`, `div`: `Text size='sm' fw={600}` name, `Text size='xs' c='dimmed' lineClamp={1}` email. Unassigned variant: `Text size='xs' c='dimmed'` `t('teamConfig.board.unassignedHint')`. Then `Badge variant='light' color={variant === 'unassigned' && agents.length > 0 ? 'amber' : 'gray'} size='sm'` `t('teamConfig.column.members', { count })`.
- Body: `<Droppable droppableId={`team:${supervisor.id}`} type='AGENT'>{(drop, snap) => <div ref={drop.innerRef} {...drop.droppableProps} className={cx(styles.list, snap.isDraggingOver && styles.dropActive)}>…{drop.placeholder}</div>}` with `.list { min-height: 72px; display: flex; flex-direction: column; gap: var(--mantine-spacing-xs); padding: var(--mantine-spacing-xs); }`; when `agents.length === 0 && !snap.isDraggingOver` a centred dimmed `Text size='xs'` `t('teamConfig.board.dropHint')`.
- Each agent → `<Draggable draggableId={`agent:${agent.id}`} index={i} key={agent.id}>{(drag, snap) => <AgentCard … dragRef={drag.innerRef} draggableProps={drag.draggableProps} dragHandleProps={drag.dragHandleProps} isDragging={snap.isDragging} />}`.

**`components/AgentCard.tsx`** — props `{ agent: RosterAgent; targets; currentTargetId: string; onMove(agentId, targetId); dragRef; draggableProps; dragHandleProps; isDragging }`.

- `<div ref={dragRef} {...draggableProps} className={cx(styles.card, isDragging && styles.dragging)}>`: `span className={styles.grip} {...dragHandleProps} aria-label={t('teamConfig.card.dragHandle')}` (`IconGripVertical size={16}`), `Avatar name color='gray' radius='xl' size='sm'`, `div className={styles.cardBody}`: `Text size='sm' fw={500} lineClamp={1}` name, `Text size='xs' c='dimmed'` `${agent.id} · ${t('shift.' + agent.shift, { defaultValue: agent.shift })}` (if `qa.team` has no `shift.*` keys, add them in Task 5: morning/afternoon/night), `agent.status !== 'active' && <Badge size='xs' variant='light' color='gray'>{t('status.' + agent.status)}</Badge>`.
- Right: `Menu` on `ActionIcon variant='subtle' color='gray' size='sm' aria-label={t('teamConfig.card.moveTo')}` (`IconArrowsExchange size={14}`); items = `targets.filter((x) => x.id !== currentTargetId)` → `onMove(agent.id, target.id)`. This is the keyboard and touch path for moving.
- CSS: `.card { display: flex; align-items: center; gap: var(--mantine-spacing-xs); padding: 6px var(--mantine-spacing-xs); border-radius: var(--mantine-radius-md); border: 1px solid var(--surface-border); background: var(--surface-card); }`, `.card:hover` tint `light-dark(gray-0, dark-6)`, `.grip` and `.dragging` copied from `BuilderOutline.module.css`, `.cardBody { flex: 1; min-width: 0; }`.

**`components/NewTeamDrawer.tsx`** — props `{ opened; onClose }`. `AppDrawer size='md' title={t('teamConfig.drawer.title')} description={t('teamConfig.drawer.description')} icon={IconUsersGroup}`. `useForm<CreateTeamInput>({ initialValues: { teamName: '', supervisorName: '', supervisorEmail: '', memberIds: [] }, validate: { teamName: (v) => !v.trim() ? t('…validation.teamName') : taken(v) ? t('…validation.teamNameTaken') : null, supervisorName: required, supervisorEmail: (v) => /^\S+@\S+\.\S+$/.test(v) ? null : t('…validation.email') } })` where `taken` checks `Object.values(supervisors).some((s) => s.team.toLowerCase() === v.trim().toLowerCase())`. Fields in one `Stack gap='md'` inside two `SectionCard padding='md'`: "Team" (`TextInput` team name) and "Supervisor" (`TextInput` name, `TextInput type='email'` email); then `MultiSelect searchable clearable` of all agents labelled `${name} · ${team}` (`teamConfig.drawer.members`, hint `membersHint`). Footer `Group justify='flex-end'`: Cancel (`variant='default'`), Create (`type='submit'`). On submit: `createTeam(values)` → `notifySuccess(t('teamConfig.toast.created', { team }))` → `form.reset()` → `onClose()`. Reset the form when `opened` turns true (`useEffect`). Dirty close: `form.isDirty()` → `openConfirmModal` discard pattern as `NewCampaignPage`.

**`components/RenameTeamModal.tsx`** — props `{ supervisor: RosterSupervisor | null; onClose }`; Mantine `Modal centered size='sm' opened={supervisor !== null}` with `useForm({ initialValues: { teamName } })`, same uniqueness validation (ignoring the team itself); submit → `renameTeam(id, teamName.trim())` → `notifySuccess(t('teamConfig.toast.renamed', { team }))`.

### Task 3 — Route and namespace

- `src/routes.tsx` (LF): lazy `const OperationManagerTeamConfigPage = React.lazy(() => import('./modules/qa/team/TeamConfigPage'));` next to the other team pages; route after `operation-manager/inbox/:notificationId`:
  ```tsx
  { path: 'operation-manager/team-config', id: 'qa.operation-manager.team-config', element: (<I18nNamespaceLoader><Suspense fallback={<SuspenseFallback />}><OperationManagerTeamConfigPage /></Suspense></I18nNamespaceLoader>) },
  ```
- `src/modules/qa/qaNamespaces.ts`: `'qa.operation-manager.team-config': ['qa.team'],`.
- `src/modules/qa/team/TeamConfigPage/index.ts`: `export { default } from './TeamConfigPage';`.

### Task 4 — Sidebar (`src/components/Sidebar/roleNavigation.tsx`, LF)

Replace the `operationmanager-supervisors` item with `{ key: 'operationmanager-team-config', label: 'sidebar.operationmanager.teamConfig', icon: <IconUsersGroup size={20} className={styles.menuIcon} />, to: '/qa/operation-manager/team-config', i18nNamespace: 'qa.team' }` (import `IconUsersGroup` if missing) and update `getOperationManagerNavigationGrouped()`'s Organization group to `byKey('operationmanager-team-config')` in its place. Grep that `operationmanager-supervisors` and `sidebar.operationmanager.supervisors` are no longer referenced in `src/` (the locale key may stay).

### Task 5 — Copy

`src/locales/{en,es}/qa.team.json` (deep-merge, additions only): a `teamConfig` block and, if absent, `shift`:

| key                                                                                                                                                                                 | en                                                                                                                                                                                                                                               | es                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `teamConfig.title`                                                                                                                                                                  | Team configuration                                                                                                                                                                                                                               | Configuración de equipos                                                                                                                                                                                                                                                                     |
| `teamConfig.description`                                                                                                                                                            | Create teams, assign a supervisor to each one and move agents between them.                                                                                                                                                                      | Crea equipos, asigna un supervisor a cada uno y mueve agentes entre ellos.                                                                                                                                                                                                                   |
| `teamConfig.newTeam`                                                                                                                                                                | New team                                                                                                                                                                                                                                         | Nuevo equipo                                                                                                                                                                                                                                                                                 |
| `teamConfig.kpis.teams` / `.agents` / `.unassigned` / `.avgSize`                                                                                                                    | Teams / Assigned agents / Unassigned / Avg. team size                                                                                                                                                                                            | Equipos / Agentes asignados / Sin asignar / Tamaño medio                                                                                                                                                                                                                                     |
| `teamConfig.search` / `.clearSearch`                                                                                                                                                | Search agents… / Clear search                                                                                                                                                                                                                    | Buscar agentes… / Borrar búsqueda                                                                                                                                                                                                                                                            |
| `teamConfig.board.unassigned` / `.unassignedHint` / `.dropHint`                                                                                                                     | Unassigned / Agents without a team. Drop one here to unassign it. / Drop agents here                                                                                                                                                             | Sin asignar / Agentes sin equipo. Suelta uno aquí para desasignarlo. / Suelta agentes aquí                                                                                                                                                                                                   |
| `teamConfig.empty.title` / `.description`                                                                                                                                           | No teams yet / Create the first team and its supervisor, then drag agents in.                                                                                                                                                                    | Aún no hay equipos / Crea el primer equipo y su supervisor, y luego arrastra agentes.                                                                                                                                                                                                        |
| `teamConfig.column.members_one` / `_other`                                                                                                                                          | {{count}} agent / {{count}} agents                                                                                                                                                                                                               | {{count}} agente / {{count}} agentes                                                                                                                                                                                                                                                         |
| `teamConfig.column.menu.label` / `.editSupervisor` / `.renameTeam` / `.dissolveTeam`                                                                                                | Team actions / Edit supervisor / Rename team / Dissolve team                                                                                                                                                                                     | Acciones del equipo / Editar supervisor / Renombrar equipo / Disolver equipo                                                                                                                                                                                                                 |
| `teamConfig.card.dragHandle` / `.moveTo`                                                                                                                                            | Drag to move / Move to…                                                                                                                                                                                                                          | Arrastra para mover / Mover a…                                                                                                                                                                                                                                                               |
| `teamConfig.drawer.title` / `.description` / `.teamSection` / `.supervisorSection` / `.teamName` / `.supervisorName` / `.supervisorEmail` / `.members` / `.membersHint` / `.create` | New team / A team is led by one supervisor. You can add members now or drag them in later. / Team / Supervisor / Team name / Supervisor name / Supervisor email / First members / Agents picked here move from their current team. / Create team | Nuevo equipo / Cada equipo lo dirige un supervisor. Puedes añadir miembros ahora o arrastrarlos después. / Equipo / Supervisor / Nombre del equipo / Nombre del supervisor / Correo del supervisor / Primeros miembros / Los agentes elegidos aquí salen de su equipo actual. / Crear equipo |
| `teamConfig.drawer.validation.teamName` / `.teamNameTaken` / `.supervisorName` / `.email`                                                                                           | Give the team a name / A team with this name already exists / Give the supervisor a name / Enter a valid email                                                                                                                                   | Ponle un nombre al equipo / Ya existe un equipo con ese nombre / Ponle un nombre al supervisor / Introduce un correo válido                                                                                                                                                                  |
| `teamConfig.rename.title` / `.label` / `.save`                                                                                                                                      | Rename team / Team name / Save                                                                                                                                                                                                                   | Renombrar equipo / Nombre del equipo / Guardar                                                                                                                                                                                                                                               |
| `teamConfig.dissolve.title` / `.body_one` / `.body_other` / `.confirm`                                                                                                              | Dissolve {{team}}? / Its {{count}} agent moves to Unassigned. The supervisor is removed. / Its {{count}} agents move to Unassigned. The supervisor is removed. / Dissolve                                                                        | ¿Disolver {{team}}? / Su {{count}} agente pasa a Sin asignar. El supervisor se elimina. / Sus {{count}} agentes pasan a Sin asignar. El supervisor se elimina. / Disolver                                                                                                                    |
| `teamConfig.toast.moved` / `.created` / `.renamed` / `.dissolved`                                                                                                                   | {{name}} moved to {{team}} / Team {{team}} created / Team renamed to {{team}} / Team {{team}} dissolved                                                                                                                                          | {{name}} movido a {{team}} / Equipo {{team}} creado / Equipo renombrado a {{team}} / Equipo {{team}} disuelto                                                                                                                                                                                |
| `shift.morning` / `.afternoon` / `.night` (only if absent)                                                                                                                          | Morning / Afternoon / Night                                                                                                                                                                                                                      | Mañana / Tarde / Noche                                                                                                                                                                                                                                                                       |
| `teamConfig.discard.title` / `.body` / `.confirm`                                                                                                                                   | Discard this team? / The details you typed will be lost. / Discard                                                                                                                                                                               | ¿Descartar este equipo? / Se perderá lo que escribiste. / Descartar                                                                                                                                                                                                                          |

`src/locales/{en,es}/common.json` `sidebar.operationmanager.teamConfig`: Team configuration / Configuración de equipos. If `qa.team` has no generic cancel key, use `t('cancel', { ns: 'common' })` after checking `common.json` has it (grep `"cancel"`).

### Task 6 — Checks

- `npm run typecheck` clean.
- Key script: every `t('teamConfig.…')`, `t('status.…')`, `t('shift.…')` key used by the page and its components exists in en and es (plurals via `_one/_other`).
- Greps: `style=` in `TeamConfigPage/**` → none; `operationmanager-supervisors` → none; `/workspace/qa/operationmanager/supervisors` → none; `qa.operation-manager.team-config` present in both `routes.tsx` and `qaNamespaces.ts`.
- Store sanity (node script against the TS source is not practical): rely on the typecheck plus a manual read of the three new actions.
- `git ls-files --eol`: `teamStore.ts` still CRLF; `npx prettier --write` on touched files only; `git status --short` lists only intended files.

---

## Behaviour summary (demo script)

| Where              | Action                                                                          | Result                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| OM sidebar         | Organization → Team configuration                                               | The board: Unassigned (empty, dashed) + Team 1/2/3 with their supervisors and 7 agents each; KPIs 3 · 21 · 0 · 7.0 |
| Board              | Drag Sarah Johnson from Team 1 to Team 2                                        | Card moves; toast "Sarah Johnson moved to Team 2"; counts 6 / 8; the QA Manager's Teams pages show the same        |
| Board              | Drag an agent onto Unassigned                                                   | Card lands in the dashed column; Unassigned KPI turns amber "1"                                                    |
| Card               | ⇄ → Move to… → Team 3                                                           | Same as dragging, without the mouse                                                                                |
| Header             | New team → "Collections B", Rosa Lima, rosa.lima@newtech.com, members: 2 agents | Drawer validates, creates SUP-501, a fourth column appears with 2 agents; toast                                    |
| Column menu        | Rename team → "Collections North"                                               | Column title and every member's team label change                                                                  |
| Column menu        | Edit supervisor                                                                 | The existing modal; name change shows on the column header                                                         |
| Column menu        | Dissolve team                                                                   | Red confirm; members go to Unassigned; column disappears; KPIs update                                              |
| Search             | "mora"                                                                          | Only Andrés Mora's card stays visible; columns keep their headers and counts                                       |
| QA Manager → Teams | Open                                                                            | New team card listed; the OM dashboard's team chart still shows the three seeded teams (static data, out of scope) |

## Verification

No dev server and no tests: typecheck, key script and greps from Task 6. Visual check by the user at `/qa/operation-manager/team-config` in light and dark mode, dragging with the mouse and moving with the card menu, then the New team drawer and the dissolve confirm; narrow width scrolls the board horizontally.

## Out of scope

- Making analytics, calls, disputes, coaching, LMS, rankings and the OM dashboard read teams from the store (they use the static roster).
- Creating agents, deleting agents, or editing an agent's shift and status here.
- Persisting the store across reloads.
- Campaign assignment per team (the QA Manager's team detail already does it).
- The other dead Operation Manager links (Team Health, Clients, Analytics, Reports, Dashboard path).

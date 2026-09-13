# LMS + Coaching — three chained plans (Supervisor / QA Manager / Agent)

> **Executor instructions (Haiku):** this file holds THREE plans. Before starting, split it into
> `docs/superpowers/plans/2026-09-13-lms-foundation-agent-lms.md` (Plan 1),
> `docs/superpowers/plans/2026-09-13-lms-manager.md` (Plan 2) and
> `docs/superpowers/plans/2026-09-13-coaching.md` (Plan 3), each with the **Context**, **Shared conventions** and
> **Global constraints** sections copied at the top. Execute in order 1 → 2 → 3. Run a **foreground**
> `npx tsc --noEmit -p .` after every task (background typecheck + log grep has returned false "0 errors" before).
> Do not run the dev server, tests or commits unless the user asks.

---

## Context

The QA platform (Supervisor `/qa/supervisor/*`, QA Manager `/qa/qa-manager/*`, Agent `/qa/agent/*`) already evaluates
every call on four aspects — **Quality Assurance, Compliance, Sentiment & Emotion, Business Insights** — and already has
Triggers (alert/recognition rules), Your Team + Agent Profile, Customers, and an Agent Inbox. What it lacks is the
**closing of the loop**: when an agent scores low on an aspect, nothing turns that into learning, and nothing measures
whether learning changed the score.

The user (Product Designer, stakeholder mockups, see `DESIGN_ROLE.md`) asked for two strongly linked sections:

- **LMS** (Learning Management System): a catalogue of videos, documents, quizzes and practice scenarios, tagged by the
  same four aspects; learning paths; and an agent view with pending assignments, mandatory material with deadlines, quizzes
  with deadlines, and available material.
- **Coaching** (Supervisor / QA Manager): a configurator that tracks performance and behaviour per agent and per aspect,
  lets managers add **rules** ("if compliance < 80 over 14 days → assign the Compliance certification, due in 14 days"),
  assigns material manually or in bulk, requires the **agent to accept the deadline** (or propose another), tracks
  completion, and shows whether performance **improved / stayed / declined** after the material was consumed.

Industry patterns we deliberately copy (research done 2026-09-13): EvaluAgent *Smart Triggers* (auto-enrol on repeated
line-item failures / compliance breaches), Observe.AI (evidence-linked sessions, documented commitments, follow-up
reminders, coaching→KPI reports), Centrical (prioritised "who needs attention today" queue, KPI-triggered microlearning,
measure whether learning moved the KPI), Zendesk QA (sessions with pinned calls, action items, upcoming/completed/overdue,
"impact on quality score" panel), Cresta/SQM (explicit agent commitment, checkpoints at 15/30 days, before/after by cycle).

### What already exists (verified 2026-09-13) — reuse, do not duplicate

| Thing | Where | State |
|---|---|---|
| Routes `/qa/qa-manager/coaching`, `/qa/qa-manager/lms` | `src/routes.tsx:1141-1162` | registered, render 24-line stubs, **not in sidebar** |
| Route `/qa/agent/lms` | `src/routes.tsx:909-919` | registered, page is hard-coded English mock (`src/modules/qa/agent/lms/AgentLMSPage.tsx`) |
| Stubs to delete | `src/modules/qa/qamanager/pages/{CoachingPage,LmsPage}.tsx`, `src/modules/qa/supervisor/pages/{CoachingPage,LmsPage}.tsx` | identical placeholders |
| Agent nav LMS entry | `src/components/Sidebar/roleNavigation.tsx:67-73` | uses `IconLock` (wrong icon) |
| Agent Profile tab "Coaching & LMS" | `src/modules/qa/team/AgentProfilePage/tabs/CoachingLmsTab.tsx` | reads `profile.coaching` / `profile.lms` |
| Modals | `src/modules/qa/team/components/modals/{AssignLmsModal,ScheduleCoachingModal}.tsx` | write to `teamStore`, push inbox notification |
| `teamStore.assignLms` / `scheduleCoaching` | `src/stores/qa/teamStore.ts:39-61` | coaching notification links to `/qa/agent/coaching` — **route does not exist** |
| Legacy catalogue `LMS_CATALOG` (8 items, `dimension: DimensionKey`) | `src/modules/qa/team/constants.ts:116-125` | consumed by `team/mockData.ts:259` and `AssignLmsModal` |
| Triggers condition engine | `src/models/qa/triggerRules.ts`, `src/modules/qa/triggers/{constants,helpers}.ts`, `components/ConditionRow`, `components/PreviewPanel` | 21 metrics × 4 areas, sub-items, 4 condition modes — **reuse for coaching rules** |
| App chooser cards "Coaching" / "LMS" → `/coaching`, `/lms` | `src/utils/computeAccessibleApps.ts:42,59-62`, `src/hooks/useCurrentApp.ts` | no routes behind them |
| Sidebar label keys | `src/locales/{en,es}/common.json` → `sidebar.agent.*`, `sidebar.supervisor.*`, `sidebar.qamanager.*` (`Sidebar.tsx` translates `item.label` with the **common** namespace; `item.i18nNamespace` is only prefetched) | add new keys here, never in `qa.agent.json` |

### Decisions taken with the user (2026-09-13)

1. **Three chained plans**: (1) LMS foundation + Agent LMS, (2) LMS Manager, (3) Coaching.
2. LMS and Coaching are **QA sub-sections** (`/qa/<role>/lms|coaching`); `/lms` and `/coaching` redirect.
3. Coaching owns its **own rules** (new model) but **reuses the Triggers condition builder** (`ConditionRow`, `PreviewPanel`, metric catalogue). Triggers stays alerts/recognition only.
4. **QA Manager owns content** (publish/archive, global rules, all teams). **Supervisor** browses, assigns to their team, creates team-scoped rules, runs 1:1s.
5. Agent response to an assignment: **Accept** or **Propose new date (with reason)** → supervisor approves/rejects in Coaching/LMS. No response in 48 h → `NO_RESPONSE`, surfaces in the coaching queue.
6. Impact measurement: **30 days before vs 30 days after completion**, checkpoints at 15 and 30 days, verdict Improved (≥ +3) / Same (±3) / Declined (≤ −3) on the content's linked metric; sparkline with a completion marker.
7. People grouping in Coaching: **teams + custom cohorts**.
8. LMS authoring: **library + assignment only** (seeded catalogue; no create-content forms).
9. Agent sees coaching sessions/commitments in a **"Coaching" tab inside My Learning**; `/qa/agent/coaching` redirects to `/qa/agent/lms?tab=coaching`.
10. Content formats: **Video, Document, Quiz, Practice scenario (role-play)**. Learning paths are ordered sets of those.
11. Coaching tabs: **Queue, Agents, Cohorts, Rules, Sessions, Impact**. LMS Manager tabs: **Library, Learning paths, Assignments, Reports**.

---

## Shared conventions (apply to all three plans)

- **Roster & personas** (from `src/modules/qa/team/mockData.ts` + `constants.ts`): Supervisor **Maria García** `SUP-001` (Team 1: AGT-001 Sarah Johnson, AGT-002 Mike Chen, AGT-003 Jessica Martinez, **AGT-004 John Smith** = agent persona, AGT-005 Emma Davis, AGT-006 David Brown (burnout HIGH), AGT-007 Lisa Wong); Juan Pérez `SUP-002` (Team 2, AGT-008…014); Laura Gómez `SUP-003` (Team 3, AGT-015…021, AGT-017 Nina Patel burnout HIGH, AGT-015/AGT-020 have skill `Mentor`); QA Manager **Elena Ruiz** `QAM-001`. Campaigns `camp-001` Q3 Customer Service · `camp-002` Sales Training · `camp-003` Q4 Compliance · `camp-004` Tech Support. Clock: `NOW_ISO = '2026-09-12T15:00:00Z'` from `~/modules/qa/team/constants`.
- **Role from path**: reuse `roleFromPath` (`~/modules/qa/team/helpers`, returns `'supervisor' | 'qa-manager'`). Supervisor scope = agents whose `supervisorId === 'SUP-001'`; QA Manager = everyone.
- **Page shell**: `ContentContainer contentWidth='full'` → `Stack gap='lg'` → eyebrow/title/description `Group` (copy `src/modules/qa/triggers/TriggersPage/TriggersPage.tsx:112-128`) → KPI strip (`SimpleGrid cols={{ base: 2, md: 4 }}` of `StatCard` from `~/components/StatCard`, props `title, value, subtitle?, color?, icon?, badge?, variant?`) → Mantine `Tabs` with `Badge` counters in `rightSection`, `keepMounted={false}`, tab persisted in `?tab=` via `useSearchParams` (copy `AgentProfilePage.tsx:37-45`). Drawers/modals rendered outside the `Stack`.
- **Primitives**: `SectionCard` (`~/components/SectionCard`, named + default; `title, description, icon, headerActions, footer, padding`), `AppDrawer` (`~/components/AppDrawer`, `opened, onClose, title, description, icon, iconColor, size, headerActions, position`) — never Mantine `Drawer`; `BaseTable` (**default export** from `~/components/BaseTable/BaseTable`, type `BaseTableColumnDef`; props `data, columns, getRowId, initialSort, onRowClick, density='compact', emptyMessage, enablePagination, pageSize, getRowClassName`); `EmptyState` (default export, `icon?, message, description?, action?`); toasts via `notifySuccess/notifyWarning` from `~/modules/qa/utils/notifications`.
- **Columns**: `createColumnHelper<T>()` and cast each column `as BaseTableColumnDef<T>` (pattern in `CoachingLmsTab.tsx`).
- **Charts**: `@mantine/charts` 9.2 (`AreaChart`, `BarChart`, `Sparkline`, `DonutChart`). Dates: `dayjs`. Markdown: `@uiw/react-markdown-preview` (already installed) for document bodies. No video library — mock the player.
- **Stores**: plain `create()` Zustand stores under `src/stores/qa/`, seeded from a mock module, id counters `let counter = N; const nextId = (p) => \`${p}-${++counter}\``. **Never build a new array inside a selector** (`useStore((s) => s.items.filter(...))` loops forever) — select the stable slice and `useMemo` in the component.
- **i18n**: one namespace per section (`qa.lms`, `qa.coaching`), files `src/locales/{en,es}/<ns>.json` (auto-discovered by `src/locales/i18n.ts` glob). Register route ids in `src/modules/qa/qaNamespaces.ts`. Never hard-code UI strings. Both languages always.
- **Styling**: Mantine tokens only, `light-dark()` for manual colours, CSS Modules; no inline styles (except `// inline-style-allow:` with a Mantine var). Every component must look right in light and dark.
- **Mantine gotchas**: `Grid` prop is `gap` not `gutter` (prefer `SimpleGrid`); `Progress`, `RingProgress`, `Timeline`, `Stepper`, `SegmentedControl`, `MultiSelect`, `Chip.Group` are all available.
- **Cross-section notifications**: push into `useNotificationStore.getState().addNotification({...})` with the full `AgentNotification` shape (copy the `notify()` helper from `teamStore.ts:27-32`).
- **Pre-existing typecheck errors** in `src/views/Campaigns/pages/CampaignCreate.tsx`, `CampaignDetail.tsx`, `ConversationAspects.tsx` are unrelated — ignore them, everything else must be clean.

## Global constraints

- Mock only: no API calls, no persistence, no backend. State lives in Zustand for the session.
- Do only what each task says; no extra polish.
- Keep the existing `TEAM_PROFILES`, roster names and routes; do not reintroduce the old demo names (Carlos López, etc.).
- Preserve the Agent Profile behaviour (nine tabs, three header actions) while re-pointing it at the new stores.

---

# PLAN 2 — LMS Manager (Supervisor & QA Manager)

Depends on Plan 1 (model, store, components, `qa.lms` namespace).

## Goal

One role-aware page `LmsManagerPage` at `/qa/qa-manager/lms` (all teams, can publish/archive) and `/qa/supervisor/lms`
(Team 1 only, assign-only) with four tabs — **Library, Learning paths, Assignments, Reports** — plus the shared
`AssignContentDrawer` that replaces the old `AssignLmsModal` in the Agent Profile. Adds the **Development** sidebar
group (Coaching + Learning) for both roles (Coaching entry points to the Plan 3 route; until Plan 3 lands it renders the
existing stub — fine for one session).

## Architecture

```
src/modules/qa/lms/
  LmsManagerPage/
    LmsManagerPage.tsx  index.ts  LmsManagerPage.module.css
    LmsKpiStrip.tsx
    tabs/LibraryTab.tsx  tabs/PathsTab.tsx  tabs/AssignmentsTab.tsx  tabs/ReportsTab.tsx
  components/
    AssignContentDrawer.tsx     ← shared: profile header action, library, paths, coaching queue (Plan 3)
    ContentDetailDrawer.tsx
    PathDetailDrawer.tsx
    AssignmentDetailDrawer.tsx
    LibraryFilters.tsx
    AssignmentFilters.tsx
    useLibraryColumns.tsx  useAssignmentColumns.tsx
  helpers.ts                    ← add manager selectors (scopeAgents, assignmentRows, reportAggregates)
```

Scope rule (`helpers.ts`, imports: `import type { RosterAgent, TeamRole } from '~/modules/qa/team/types'; import { TEAM_AGENTS } from '~/modules/qa/team/mockData'; import { QA_MANAGER_PERSONA, SUPERVISOR_PERSONA } from '~/modules/qa/team/constants'; import { day } from './mockData';`):

```ts
export const managerScopeAgents = (role: TeamRole): RosterAgent[] => TEAM_AGENTS.filter((a) => role === 'qa-manager' || a.supervisorId === SUPERVISOR_PERSONA.id);
export interface ManagerPersona { id: string; name: string; role: 'SUPERVISOR' | 'QA_MANAGER' }
export const managerPersona = (role: TeamRole): ManagerPersona =>
	role === 'qa-manager' ? { ...QA_MANAGER_PERSONA, role: 'QA_MANAGER' } : { ...SUPERVISOR_PERSONA, role: 'SUPERVISOR' };
```
(The explicit return type keeps `role` narrow so it is assignable to `LmsAssignerRole` / `CoachRole`.)

## Task 1 — i18n additions (`manager` block, en + es)

Append to `src/locales/en/qa.lms.json` (and translate into `es`):

```json
"manager": {
	"eyebrow": { "supervisor": "Supervisor · Team 1", "qa-manager": "QA Manager · All teams" },
	"title": "Learning",
	"description": "Browse the catalogue, assign material or paths, and follow completion and acceptance.",
	"assignButton": "Assign material",
	"kpi": { "published": "Published items", "activeAssignments": "Active assignments", "pendingAcceptance": "Awaiting response", "rescheduleRequests": "Date change requests", "overdue": "Overdue", "completionRate": "Completion rate (30d)" },
	"tabs": { "library": "Library", "paths": "Learning paths", "assignments": "Assignments", "reports": "Reports" },
	"library": {
		"title": "Content library", "description": "Videos, documents, quizzes and practice scenarios tagged by aspect.",
		"filters": { "search": "Search title or tag", "format": "Format", "area": "Aspect", "status": "Status", "level": "Level", "all": "All", "clear": "Clear" },
		"columns": { "title": "Material", "format": "Format", "area": "Aspect", "duration": "Duration", "level": "Level", "assigned": "Assigned", "completed": "Completed", "avgScore": "Avg. score", "rating": "Rating", "status": "Status", "updated": "Updated" },
		"contentStatus": { "PUBLISHED": "Published", "DRAFT": "Draft", "ARCHIVED": "Archived" },
		"actions": { "assign": "Assign", "publish": "Publish", "archive": "Archive", "restore": "Restore", "preview": "Preview as agent" },
		"empty": "No material matches these filters.",
		"count": "{{count}} items"
	},
	"contentDetail": {
		"usedInRules": "Used in coaching rules", "noRules": "Not referenced by any rule yet.",
		"inPaths": "In learning paths", "noPaths": "Not part of a learning path.",
		"stats": "Usage", "assigned": "Assigned", "completed": "Completed", "completionRate": "Completion", "avgScore": "Average score", "rating": "Rating",
		"impact": "Measured impact", "impactHint": "Agents who improved on {{metric}} 30 days after completing this", "improved": "improved", "same": "no change", "declined": "declined",
		"recentAgents": "Recent assignees", "preview": "Preview", "questions": "Questions", "chapters": "Chapters"
	},
	"paths": {
		"title": "Learning paths", "description": "Ordered sets of modules that earn a badge. Assign a path to enrol several agents at once.",
		"modules": "{{count}} modules", "enrolled": "{{count}} enrolled", "completion": "{{value}}% completion", "assignPath": "Assign path", "viewPath": "View path",
		"detail": { "modules": "Modules", "enrolledAgents": "Enrolled agents", "progress": "Progress", "columns": { "agent": "Agent", "team": "Team", "modules": "Modules", "enrolledAt": "Enrolled", "due": "Due", "status": "Status" }, "status": { "inProgress": "In progress", "completed": "Completed", "notStarted": "Not started" } }
	},
	"assignments": {
		"title": "Assignments", "description": "Every assignment in your scope with its acceptance and completion state.",
		"filters": { "search": "Search agent or material", "status": "Status", "acceptance": "Acceptance", "area": "Aspect", "source": "Source", "team": "Team", "mandatoryOnly": "Mandatory only", "all": "All", "clear": "Clear" },
		"columns": { "agent": "Agent", "material": "Material", "area": "Aspect", "assigned": "Assigned", "due": "Due", "mandatory": "Mandatory", "acceptance": "Acceptance", "progress": "Progress", "status": "Status", "impact": "Impact", "source": "Source" },
		"sourceShort": { "MANUAL": "Manual", "COACHING_RULE": "Rule", "LEARNING_PATH": "Path", "SELF": "Self" },
		"rescheduleBanner": "{{count}} agents asked for a new deadline",
		"reviewRequests": "Review requests",
		"detail": { "reason": "Why it was assigned", "timeline": "Timeline", "assignedOn": "Assigned by {{name}} on {{date}}", "acceptedOn": "Accepted on {{date}}", "rescheduleAsk": "Asked to move the deadline to {{date}}", "rescheduleReason": "Reason", "approve": "Approve new date", "reject": "Keep original date", "approved": "Approved by {{name}} on {{date}}", "rejected": "Rejected by {{name}} on {{date}}", "started": "Started on {{date}}", "completed": "Completed on {{date}}", "noResponse": "No response after 48 h", "remind": "Send reminder", "reminded": "Reminder sent to {{name}}", "openProfile": "Open agent profile", "impact": "Impact" },
		"empty": "No assignments match these filters.",
		"count": "{{count}} assignments"
	},
	"reports": {
		"title": "Reports", "description": "Completion and acceptance across teams, aspects and content.",
		"byTeam": "Completion by team", "byArea": "Completion by aspect", "byContent": "Most assigned content", "acceptance": "Acceptance funnel",
		"columns": { "team": "Team", "assigned": "Assigned", "completed": "Completed", "overdue": "Overdue", "rate": "Rate", "material": "Material", "improved": "Improved" },
		"funnel": { "assigned": "Assigned", "accepted": "Accepted", "started": "Started", "completed": "Completed", "improved": "Improved" },
		"period": "Last 30 days"
	},
	"assignDrawer": {
		"title": "Assign material",
		"titleWithAgent": "Assign material to {{name}}",
		"what": "What", "who": "Who", "when": "When",
		"mode": { "content": "Material", "path": "Learning path" },
		"material": "Material", "materialPlaceholder": "Pick one or more items", "path": "Learning path",
		"targetMode": { "agents": "Agents", "team": "Whole team", "cohort": "Cohort" },
		"agents": "Agents", "agentsPlaceholder": "Search agents", "team": "Team", "cohort": "Cohort",
		"dueDate": "Deadline", "dueQuick": { "7": "In 7 days", "14": "In 14 days", "30": "In 30 days" },
		"mandatory": "Mandatory", "mandatoryHint": "Counts as overdue after the deadline and feeds the at-risk flag",
		"requireAcceptance": "Ask the agent to accept the deadline", "requireAcceptanceHint": "The agent can accept or propose another date; you decide in Assignments",
		"reason": "Why are you assigning this?", "reasonPlaceholder": "The agent sees this text. Example: Compliance score 79% in the last two weeks.",
		"summary": "{{items}} items · {{agents}} agents · due {{date}}",
		"submit": "Assign", "cancel": "Cancel",
		"success": "{{count}} assignments created", "successPath": "{{count}} agents enrolled in {{path}}",
		"validation": { "material": "Pick at least one item", "agents": "Pick at least one agent", "reason": "Write a short reason (min 10 characters)", "due": "Pick a deadline" }
	}
}
```

Add to `common.json` (en/es) under `sidebar.supervisor`: `"coaching": "Coaching"`, `"lms": "Learning"`, `"groupDevelopment": "Development"`; under `sidebar.qamanager` the same three (es: "Coaching", "Aprendizaje", "Desarrollo").

## Task 2 — Manager helpers (`src/modules/qa/lms/helpers.ts`, append)

```ts
import type { LmsArea, LmsFormat, LmsImpactVerdict } from '~/models/qa'; // add to the existing type import line

export interface AssignmentRow extends LmsAssignment { agentName: string; team: string; supervisorId: string; contentTitle: string; format: LmsFormat; area: LmsArea }
export const toAssignmentRows = (assignments: LmsAssignment[], contentById: Record<string, LmsContent>, agents: RosterAgent[]): AssignmentRow[] => {
	const agentById = Object.fromEntries(agents.map((a) => [a.id, a]));
	return assignments.flatMap((a) => {
		const ag = agentById[a.agentId]; const c = contentById[a.contentId];
		return ag && c ? [{ ...a, agentName: ag.name, team: ag.team, supervisorId: ag.supervisorId, contentTitle: c.title, format: c.format, area: c.area }] : [];
	});
};
export const managerKpis = (rows: AssignmentRow[], content: LmsContent[]) => {
	const open = rows.filter((r) => r.status !== 'COMPLETED');
	const last30 = rows.filter((r) => r.assignedAt >= day(today(), -30));
	return {
		published: content.filter((c) => c.status === 'PUBLISHED').length,
		activeAssignments: open.length,
		pendingAcceptance: rows.filter((r) => r.acceptance.status === 'PENDING' || r.acceptance.status === 'NO_RESPONSE').length,
		rescheduleRequests: rows.filter((r) => r.acceptance.status === 'RESCHEDULE_REQUESTED').length,
		overdue: open.filter(isOverdue).length,
		completionRate: last30.length ? Math.round((last30.filter((r) => r.status === 'COMPLETED').length / last30.length) * 100) : 0,
	};
};
export const contentImpactSummary = (rows: AssignmentRow[], contentId: string) => {
	const done = rows.filter((r) => r.contentId === contentId && r.impact && r.impact.verdict !== 'PENDING');
	const count = (v: LmsImpactVerdict) => done.filter((r) => r.impact?.verdict === v).length;
	return { measured: done.length, improved: count('IMPROVED'), same: count('SAME'), declined: count('DECLINED') };
};
```
(`day` comes from `./mockData`, `today`/`isOverdue` are already in this file.)

## Task 3 — `LmsManagerPage` shell + KPI strip

- `role = roleFromPath(location.pathname)`; `persona = managerPersona(role)`; `scopeAgents = useMemo(() => managerScopeAgents(role), [role])`.
- Store slices → `rows = useMemo(() => toAssignmentRows(assignments, contentById, scopeAgents), [...])`.
- Header (Triggers pattern): eyebrow `t('manager.eyebrow.'+role)`, title, description, primary button `Assign material` → opens `AssignContentDrawer` with no preset.
- `LmsKpiStrip`: `SimpleGrid cols={{ base: 2, md: 6 }}` of `StatCard` from `managerKpis` (pendingAcceptance yellow when > 0, rescheduleRequests orange, overdue red).
- Tabs (`?tab=`, default `library`) with counters: library = published count; paths = paths count; assignments = open count (badge red if overdue > 0); reports no counter.
- Drawers at page level: `AssignContentDrawer`, `ContentDetailDrawer`, `PathDetailDrawer`, `AssignmentDetailDrawer`; state `selectedContentId`, `selectedPathId`, `selectedAssignmentId`, `assignPreset`.
- Deep links: `?contentId=` opens the content drawer, `?assignmentId=` opens the assignment drawer (read once on mount).

## Task 4 — `LibraryTab` + `ContentDetailDrawer` + `AssignContentDrawer`

**LibraryTab**: `SectionCard` (title/description/`headerActions` = count text) → `LibraryFilters` (search `TextInput`, `Select` format, `Select` area, `Select` status — QA Manager only; supervisors see only `PUBLISHED`, `Select` level, Clear) → `BaseTable<LmsContent>` via `useLibraryColumns(role, rows, t)`: Material (title `fw={500}` + tags as `Badge size='xs' variant='dot'`) · Format · Aspect (`AreaBadge` with subItem) · Duration · Level · Assigned · Completed (`x / y` + mini `Progress`) · Avg. score (`—` when null) · Rating (`Rating readOnly size='xs'`) · Status (QA Manager only) · Updated · row actions (`Menu` with `IconDots`: Assign, Preview as agent → `navigate(agentContentPath(id))`, Publish/Archive/Restore — QA Manager only, via `setContentStatus`). Row click → `ContentDetailDrawer`. Declare the Assigned column with `id: 'assigned'` (accessor `(c) => c.stats.assigned`) so `initialSort={[{ id: 'assigned', desc: true }]}` works; `enablePagination pageSize={10}`.

**ContentDetailDrawer** (`AppDrawer size='lg'`, icon = format icon, iconColor = format colour, `headerActions` = `Assign` button + status menu for QA Manager): sections in a `Stack`: summary + `AreaBadge`/`FormatBadge`/level/duration/author chips; **Usage** (`SimpleGrid cols={4}` `StatCard`s: assigned, completed, completion %, avg score/rating); **Measured impact** (`contentImpactSummary` → three `Badge`s improved/same/declined + `Progress.Root` stacked bar green/gray/red; hint text with metric label); **In learning paths** (list of `paths` containing the id, clickable → `PathDetailDrawer`); **Used in coaching rules** (Plan 3 fills it from `coachingStore`; Plan 2 renders `noRules`); **Recent assignees** (`BaseTable` of the last 8 rows for this content: agent, team, status, acceptance, due); **Preview**: chapters list / questions list / markdown excerpt (first 300 chars) / scenario situation.

**AssignContentDrawer** (`src/modules/qa/lms/components/AssignContentDrawer.tsx`), props:
```ts
interface AssignContentDrawerProps {
	opened: boolean; onClose: () => void; role: TeamRole;
	preset?: { agentIds?: string[]; contentIds?: string[]; pathId?: string; cohortId?: string; reason?: string; ruleId?: string };
	/** Plan 3 passes `CoachingCohort[]` (structurally compatible); when undefined/empty the Cohort target option is hidden. */
	cohorts?: { id: string; name: string; agentIds: string[] }[];
}
```
`useForm` values `{ mode: 'content' | 'path'; contentIds: string[]; pathId: string | null; targetMode: 'agents' | 'team' | 'cohort'; agentIds: string[]; teamId: string | null; cohortId: string | null; dueDate: string | null; mandatory: boolean; requireAcceptance: boolean; reason: string }`, initial: mode by preset, `dueDate = day(today(), 14)`, `mandatory: true`, `requireAcceptance: true`, `agentIds = preset.agentIds ?? []`.
Layout: three `SectionCard`s **What** (`SegmentedControl` mode; `MultiSelect` of published content grouped by area — use `data` groups `{ group: t('areas.X'), items: [...] }` with label `title · format · min`; or `Select` of paths), **Who** (`SegmentedControl` targetMode — the `cohort` option renders only when `cohorts?.length`; cohort `Select` data = `cohorts.map((c) => ({ value: c.id, label: c.name }))`; Plan 2 passes no `cohorts`); `MultiSelect` agents from `managerScopeAgents(role)` with `Avatar` colour; `Select` team = supervisors in scope; resolved agent count text), **When** (`DatePickerInput` + three quick `Chip`s 7/14/30, `Switch` mandatory (+hint), `Switch` requireAcceptance (+hint), `Textarea` reason, live summary line `t('manager.assignDrawer.summary')`). Footer: Cancel / Assign. Validation per i18n keys. Submit: resolve `agentIds` (team → all agents with that supervisorId; cohort → cohort.agentIds), then `assign({...})` or `enroll(...)` + `assign` for each required module of the path (`source: 'LEARNING_PATH'`, `pathId`), toast, `onClose`.

## Task 5 — `PathsTab` + `PathDetailDrawer`

- `PathsTab`: `SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}` of `Paper` cards: `AreaBadge`, title, description `lineClamp={2}`, level, `t('manager.paths.modules')`, enrolled count, `Progress` completionRate, buttons `View path` / `Assign path` (drawer preset `{ pathId }`).
- `PathDetailDrawer` (`AppDrawer size='lg'`): **Modules** as `PathStepper` (read-only, no enrollment → all steps neutral; clicking a module opens `ContentDetailDrawer`); **Enrolled agents** `BaseTable` from `enrollments` in scope: agent · team · modules `done/total` + `Progress` · enrolledAt · due · status; header action `Assign path`.

## Task 6 — `AssignmentsTab` + `AssignmentDetailDrawer`

- Orange `Alert` banner on top when `rescheduleRequests > 0`: `t('manager.assignments.rescheduleBanner')` + button `Review requests` (sets the acceptance filter to `RESCHEDULE_REQUESTED`).
- `AssignmentFilters`: search, status `Select`, acceptance `Select`, area, source, team (QA Manager only), `Switch` mandatoryOnly, Clear. Default sort: acceptance `RESCHEDULE_REQUESTED` → `NO_RESPONSE` → `PENDING` first, then overdue, then due asc.
- `BaseTable<AssignmentRow>` via `useAssignmentColumns`: Agent (`Avatar` initials colour + name + team dimmed) · Material (title + `FormatBadge`) · Aspect · Assigned · Due (`dueLabel`, red when overdue) · Mandatory (`IconCheck` or `—`) · Acceptance (`AcceptanceBadge`) · Progress (`Progress w={100}`) · Status · Impact (`ImpactBadge`) · Source (`Badge variant='outline'` short label). `getRowClassName={(row) => ['RESCHEDULE_REQUESTED', 'NO_RESPONSE'].includes(row.original.acceptance.status) ? styles.rowAttention : undefined}` (it receives a TanStack `Row<T>`, not the data) with `.rowAttention { background: light-dark(var(--mantine-color-orange-0), rgba(255, 146, 43, 0.08)); }`. `enablePagination pageSize={12}`.
- `AssignmentDetailDrawer` (`AppDrawer size='md'`, title = material, description = agent · team): `Timeline` (assigned → accepted/asked/no response → started → completed, using i18n `detail.*`); **Reason** quote; if `RESCHEDULE_REQUESTED`: card with proposed date + reason and two buttons `Approve new date` / `Keep original date` → `decideReschedule(id, 'APPROVED'|'REJECTED', persona.name)` + notification to the agent (`notifyAgent` exported from store; title `Your new deadline was approved/rejected`, action → `/qa/agent/lms?tab=assignments`) + toast; if `NO_RESPONSE`: `Send reminder` → pushes a `HIGH` notification (`title: 'Reminder: please respond to your training assignment'`) + toast; **Impact** section with `ImpactSparkline` + checkpoints when completed; footer `Open agent profile` → `navigate(`${teamBasePath(role)}/${agentId}?tab=coaching`)`.

## Task 7 — `ReportsTab`

`SimpleGrid cols={{ base: 1, md: 2 }}` of four `SectionCard`s over rows assigned in the last 30 days (hint text `t('manager.reports.period')`):
1. **Completion by team**: `BarChart` (`@mantine/charts`, `dataKey='team'`, series `completed`, `overdue`, `open`, stacked) + a `BaseTable` beneath (team · assigned · completed · overdue · rate).
2. **Completion by aspect**: `DonutChart` per area (completed share) with legend using `LMS_AREA_META` colours.
3. **Most assigned content**: `BaseTable` top 8 by assigned count: material · assigned · completed · improved (`contentImpactSummary.improved`).
4. **Acceptance funnel**: five horizontal `Progress` bars assigned → accepted → started → completed → improved with counts (accepted = `ACCEPTED` or `NOT_REQUIRED`).
Supervisor sees Team 1 only (the team chart then has one bar — acceptable).

## Task 8 — Wire the Agent Profile to the new drawer

- `AgentProfilePage.tsx`: replace `AssignLmsModal` with `<AssignContentDrawer opened={lmsOpen} onClose={...} role={role} preset={{ agentIds: [profile.agent.id], reason: '' }} />`. Delete `src/modules/qa/team/components/modals/AssignLmsModal.tsx` and the now-unused `modals.lms.*` keys can stay.
- `ProfileHeader` and `CoachingLmsTab` keep calling `onAssignLms`.
- `teamStore.assignLms` stays (used by nothing now except possibly the demo) — remove it and `AssignLmsInput` if `tsc` shows no other consumer.

## Task 9 — Routes, navigation, cleanup

1. `src/routes.tsx`: `const LmsManagerPage = React.lazy(() => import('./modules/qa/lms/LmsManagerPage'));` remove `QAManagerLmsPage`; route `qa-manager/lms` renders `<LmsManagerPage />`; add `{ path: 'supervisor/lms', id: 'qa.supervisor.lms', element: … <LmsManagerPage /> … }` right after `supervisor/customers/:customerId`.
2. Delete `src/modules/qa/qamanager/pages/LmsPage.tsx` and `src/modules/qa/supervisor/pages/LmsPage.tsx`.
3. `qaNamespaces.ts`: `'qa.supervisor.lms': ['qa.lms', 'qa.team', 'qa.triggers']`, `'qa.qa-manager.lms': ['qa.lms', 'qa.team', 'qa.triggers']`.
4. `roleNavigation.tsx` — Supervisor: add two items to `getSupervisorNavigation()` (after `supervisor-campaigns`; position is irrelevant because the grouped function below picks by key — nothing else in the repo reads index positions):
   ```tsx
   { key: 'supervisor-coaching', label: 'sidebar.supervisor.coaching', icon: <IconTargetArrow size={20} className={styles.menuIcon} />, to: '/qa/supervisor/coaching', i18nNamespace: 'qa.coaching' },
   { key: 'supervisor-lms', label: 'sidebar.supervisor.lms', icon: <IconSchool size={20} className={styles.menuIcon} />, to: '/qa/supervisor/lms', i18nNamespace: 'qa.lms' },
   ```
   and rewrite `getSupervisorNavigationGrouped` with explicit keys instead of index slicing:
   ```tsx
   const byKey = Object.fromEntries(items.map((i) => [i.key, i]));
   const pick = (...keys: string[]) => keys.map((k) => byKey[k]);
   return [
   	{ key: 'supervisor-primary', label: items[0].label, items: [items[0]], collapsible: false, defaultExpanded: true },
   	{ key: 'supervisor-team', label: 'sidebar.supervisor.groupTeam', items: pick('supervisor-team', 'supervisor-calls', 'supervisor-customers', 'supervisor-campaigns'), collapsible: false, defaultExpanded: true },
   	{ key: 'supervisor-development', label: 'sidebar.supervisor.groupDevelopment', items: pick('supervisor-coaching', 'supervisor-lms'), collapsible: false, defaultExpanded: true },
   	{ key: 'supervisor-operations', label: 'sidebar.supervisor.groupOperations', items: pick('supervisor-disputes', 'supervisor-triggers'), collapsible: true, defaultExpanded: false },
   	{ key: 'supervisor-insights', label: 'sidebar.supervisor.groupInsights', items: pick('supervisor-analytics', 'supervisor-reports', 'supervisor-rankings'), collapsible: true, defaultExpanded: false },
   ];
   ```
   QA Manager: append `qamanager-coaching` (`/qa/qa-manager/coaching`, `IconTargetArrow`, ns `qa.coaching`) and `qamanager-lms` (`/qa/qa-manager/lms`, `IconSchool`, ns `qa.lms`); grouped: primary · organization (`supervisors, teams, agents`) · **development** (`coaching, lms`, non-collapsible) · operations (`calls, customers, disputes, campaigns`) · configuration (`triggers, rankings`) · insights (`analytics, reports`), same `pick` helper. Import `IconTargetArrow`, `IconSchool`.
5. Foreground typecheck.

## Verification (Plan 2)

- `/qa/qa-manager/lms`: KPI strip shows 24 published (26 items minus 1 draft lms-c19 and 1 archived lms-c26), reschedule requests = 2 (AGT-010, AGT-012), overdue > 0; Library lists 26 items incl. Draft and Archived with status column and Publish/Archive actions; row click opens the detail drawer with usage + impact bar.
- `/qa/supervisor/lms`: only Team 1 rows, no status column/actions, Assign works for Team 1 agents only.
- Assign material → drawer → pick De-escalation Techniques + Empathy statements, Whole team, 14 days, mandatory + acceptance, reason → toast "N assignments created"; Assignments tab shows them as PENDING; `/qa/agent/lms` shows the new acceptance cards for John Smith.
- Assignments → banner "2 agents asked for a new deadline" → Review requests → drawer → Approve → due date changes, badge becomes Accepted.
- Reports render both charts in light and dark.
- Sidebar shows the Development group (Coaching, Learning) for both roles.

---


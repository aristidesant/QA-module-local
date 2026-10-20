# Operation Manager: Team configuration as master-detail (teams rail + members table)

## Context

The Team configuration screen (`/qa/operation-manager/team-config`) is a drag-and-drop kanban: one 280px column per team, one card per agent, Unassigned column first. It reads well at the demo size (3 teams × 7 agents) and breaks as soon as a team is large or the org has many teams:

- Columns have no height limit. An agent card is ~50px + 8px gap, so a 20-agent team is ~1,160px tall and a 40-agent team ~2,300px. The page scrolls vertically while the board scrolls horizontally, with no sticky headers.
- Drop targets leave the screen. Moving an agent from the bottom of Team 2 to Team 5 needs auto-scroll in two axes; the Unassigned pool scrolls away first.
- A 30-person column has no internal structure beyond alphabetical order, no filters, no bulk move.
- Nothing says a team is over or under size, which is why an Operation Manager rebalances in the first place.
- Agent names truncate ("Andrés…", "Paula…") as soon as a status badge appears in the 280px card.
- The seed (21 agents, 0 unassigned) hides all of this from stakeholders.

Decisions made with the user (2026-10-20, design critique session):

- **Replace the board with a master-detail layout:** a teams rail on the left (Unassigned + one row per team, with capacity bar) and, on the right, the selected team's header plus its members in a paginated, filterable `BaseTable`.
- **No drag-and-drop.** Agents move via the row's "Move to…" menu, a bulk selection bar ("N selected · Move to… · Unassign") and the existing Add members drawer. `@hello-pangea/dnd` leaves this page (it stays in the repo for BaseTable and the form builder).
- **No sub-grouping** inside a team: flat list, sorted by name, with Shift and Status filters and search.
- **Capacity indicator per team:** every team has a target size; rail and header show `count / target` with a thin progress bar, amber when over target. Target is set in the New team drawer and in an Edit team modal (the Rename modal grows into it). Seeded teams get a target of 12, except Team 2 which gets 20 so its 32 agents read as "12 over target".
- **Toolbar with search + Shift/Status filters** above the members table.
- **Row affordances on hover + no name truncation:** the row's move action appears on hover/focus; status is a dot badge in its own column.
- **Mock data stressed:** 6 teams, Team 2 grown to 32 agents, 3 agents Unassigned, 68 agents in all. The extra agents live in a separate seed merged only into the Zustand team store, so the static mocks (analytics calls, coaching, LMS, customers, OM dashboard chart) keep their 21-agent roster and startup cost. Store-driven screens (this page, QA Manager Teams list/detail, QA Manager Your Team) show the full roster.

Mode: mockup. Mantine v9, CSS modules, no inline styles, strings in `en` and `es`, `@mantine/form` for forms. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-20-team-config-master-detail.md`.

---

## Verified facts (do not re-explore)

**Current page** (`src/modules/qa/team/TeamConfigPage/`, all LF): `TeamConfigPage.tsx` (KPI `SimpleGrid` of 4 `StatCard variant='compact'`, right-aligned search `TextInput`, `DragDropContext` board, `moveAgent(agentId, targetId)` → `removeMember` / `addMembers` + `notifySuccess(t('teamConfig.toast.moved', { name, team }))`, `confirmDissolve` via `modals.openConfirmModal`), `TeamConfigPage.module.css`, `index.ts` (`export { default } from './TeamConfigPage'`), `components/TeamColumn.tsx`, `components/AgentCard.tsx` (exports `MoveTarget { id; label }`), `components/NewTeamDrawer.tsx` (`AppDrawer size='md'`, `useForm<NewTeamValues>` with `teamName/supervisorName/supervisorEmail/memberIds`, two `SectionCard padding='md'`, `MultiSelect` of all agents, dirty-close confirm, `createTeam(...)` → toast `teamConfig.toast.created`), `components/RenameTeamModal.tsx` (`Modal centered size='sm'`, `useForm({ teamName })`, uniqueness validation ignoring itself, `renameTeam` → toast `teamConfig.toast.renamed`). It reuses `../TeamDetailPage/EditSupervisorModal` (`{ opened, onClose, supervisor }`).

**Model** (`src/modules/qa/team/types.ts`, worktree CRLF / index LF): `RosterSupervisor { id; name; team; email }`, `RosterAgent { id; name; email; supervisorId; supervisorName; team; campaignIds: string[]; status: 'active'|'on-leave'|'training'; shift: 'morning'|'afternoon'|'night'; hireDate; trackedSince; skills: string[]; avatarColor }`, `AgentProfile.agent: RosterAgent`. `src/modules/qa/team/constants.ts` (LF): `NOW_ISO = '2026-09-12T15:00:00Z'`, `SUPERVISOR_PERSONA = { id: 'SUP-001', … }`, `UNASSIGNED_SUPERVISOR_ID = 'UNASSIGNED'`, `UNASSIGNED_SUPERVISOR = { id, name: 'Unassigned', team: 'Unassigned', email: '' }`.

**Seed** (`src/modules/qa/team/mockData.ts`, worktree CRLF / index LF, 1330 lines): `TEAM_SUPERVISORS` (L36, SUP-001 Maria García "Team 1", SUP-002 Juan Pérez "Team 2", SUP-003 Laura Gómez "Team 3"), `TEAM_CAMPAIGNS` (camp-001..004), **non-exported** `interface Persona { id; name; supervisorId; campaignIds; status?; shift?; hireDate; trackedSince; base: Record<DimensionKey, number>; slope: number; burnout: BurnoutRiskLevel; skills: string[] }` (L85), non-exported `AVATAR_COLORS` (L100, 10 Mantine color names), `PERSONAS` (L113, 21 agents AGT-001..021, 7 per team; AGT-014 `on-leave`, AGT-018 `training`), `TEAM_AGENTS` (L370, maps personas; email = `name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(' ', '.') + '@newtech.com'`; shift fallback by index `i % 3`; `avatarColor = AVATAR_COLORS[i % 10]`), `export function buildAgentProfile(p: Persona, rank: RankContext): AgentProfile` (L467; **first line is `const agent = TEAM_AGENTS.find((a) => a.id === p.id)!`**, so a persona outside `TEAM_AGENTS` crashes), non-exported `interface RankContext { rankInTeam; teamSize; percentile }` (L461), `buildAll()` (L1287: provisional pass with `{ rankInTeam: 1, teamSize: 1, percentile: 50 }` to get `overall.score`, then per `TEAM_SUPERVISORS` team sort desc and build with `rankInTeam = i + 1`, `teamSize`, `percentile = round((teamSize - rank) / max(1, teamSize - 1) * 100)`), `TEAM_PROFILES = buildAll()`, `initialTeamCampaignIds()` (union of campaign ids per supervisor in `TEAM_SUPERVISORS`). `BurnoutRiskLevel` comes from `~/modules/qa/dashboard/types/burnoutRisk` (`LOW | MEDIUM | HIGH`).

**Store** (`src/stores/qa/teamStore.ts`, LF): `profiles: TEAM_PROFILES`, `supervisors: Object.fromEntries(TEAM_SUPERVISORS.map(...))`, `teamCampaignIds: initialTeamCampaignIds()`; `nextId(prefix)`; actions `updateSupervisor(id, { name?, email? })`, `removeMember(agentId)`, `addMembers(agentIds, supervisorId)`, `createTeam(input: CreateTeamInput { teamName; supervisorName; supervisorEmail; memberIds? })` → `RosterSupervisor` (also seeds `teamCampaignIds[id] = []`), `renameTeam(supervisorId, teamName)` (relabels members' `agent.team`), `dissolveTeam(supervisorId)`; selectors `selectProfiles`, `selectSupervisors`, `selectSupervisor(id)`. `renameTeam` is referenced only by `TeamConfigPage.tsx`, `RenameTeamModal.tsx` and the store.

**Shared pieces:** `BaseTable` (`~/components/BaseTable/BaseTable`, default export; props used here: `data, columns: BaseTableColumnDef<T>[], getRowId, initialSort, enableRowSelection, selectedRowIds, onSelectedRowIdsChange(rowIds: string[]), enablePagination, showPaginationControls, pageSize, density='compact', emptyMessage, getRowClassName(row: Row<T>)`; selection column is 44px with a header checkbox for the current page; hover background `var(--surface-sunken)`; no grouping, no virtualization). `SectionCard` (`~/components/SectionCard`, default + named export; `title, description, headerActions, padding, fullHeight`). `AppDrawer`. `StatCard` (`title, value, icon, color, variant`). `EmptyState` (`icon, message, description, action`). `AddMembersDrawer` (`src/modules/qa/team/TeamDetailPage/AddMembersDrawer.tsx`, `{ opened, onClose, supervisorId, teamName }`, `MultiSelect` of agents not already in the team, `addMembers`, toasts `teams.addMembers.success`). `notifySuccess` from `~/modules/qa/utils/notifications`. Column pattern: `createColumnHelper<T>()` + `as BaseTableColumnDef<T>` casts (`TeamDetailPage/useTeamDetailColumns.tsx`), avatar cell `Avatar name color={agent.avatarColor} radius='xl' size='sm'` + name `fw={600}` + id `xs dimmed`; `STATUS_COLOR = { active: 'green', 'on-leave': 'gray', training: 'blue' }`. Filter row pattern: `YourTeamPage/TeamFilters.tsx` (`Group gap='sm' wrap='wrap'`, `TextInput w={260}`, `Select allowDeselect={false} w={220}`, subtle `size='xs'` Clear button when non-default).

**Theme:** `amber` and `danger` are registered Mantine colors (`src/theme.ts:149`); CSS vars `--surface-card`, `--surface-border`, `--surface-sunken`, `--brand-soft` exist in `src/styles/global.css`; `light-dark()` is the convention for manual overrides. `Progress` is used in the QA module (`size='sm' radius='xl'`).

**i18n:** namespace `qa.team` (`src/locales/{en,es}/qa.team.json`, LF). Existing shared keys: `status.active|on-leave|training`, `shift.morning|afternoon|night` (top level, L495), `modals.cancel`, `teams.addMembers.*`. The `teamConfig` block starts at L500 in both files and is the last key of the file. Route id `qa.operation-manager.team-config` maps to `['qa.team']` in `src/modules/qa/qaNamespaces.ts`; nothing else changes in routes or sidebar.

---

## Direction

```
Team configuration                                                              [+ New team]
Create teams, assign a supervisor to each one and move agents between them.

┌ 6 teams ┐ ┌ 65 assigned agents ┐ ┌ 3 unassigned (amber) ┐ ┌ 10.8 avg. team size ┐

┌ Teams ─────────────────── 300px ┐  ┌ (JP) Team 2                                           ⋮ ┐
│ [🔍 Search teams…]              │  │      Juan Pérez · juan.perez@newtech.com                 │
│ ⊘ Unassigned                  3 │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 32 agents · target 20   [12 over target] │
│ ─────────────────────────────── │  └──────────────────────────────────────────────────────────┘
│ Team 1                   7 / 12 │  ┌ Members ──────────────────────────────── [+ Add agents] ┐
│ Maria García  ▓▓▓▓▓▓░░░░░       │  │ [🔍 Search by name, ID or email…] [Shift ▾] [Status ▾]   │
│▌Team 2                  32 / 20 │  │                                        32 agents         │
│ Juan Pérez    ▓▓▓▓▓▓▓▓▓▓ amber  │  │ ┌ 3 selected   [Move to… ▾]  [Unassign]   [Clear] ┐     │
│ Team 3                   7 / 12 │  │ ☐ AGENT                  SHIFT      STATUS         (⇄)   │
│ Laura Gómez   ▓▓▓▓▓▓░░░░░       │  │ ☑ (AM) Alejandro Peña    Morning    ● Active       ⇄     │
│ Team 4                   8 / 12 │  │    AGT-022                                               │
│ Team 5                   6 / 12 │  │ ☐ (AM) Andrés Mora       Afternoon  ● On leave           │
│ Team 6                   5 / 10 │  │ …  25 per page  ‹ 1 2 ›                                  │
└─────────────────────────────────┘  └──────────────────────────────────────────────────────────┘
   ▌ = selected row (primary accent)        ⇄ appears on row hover/focus; "Move to…" menu lists every other team + Unassigned
   ⋮ menu: Edit supervisor · Edit team (name, target size) · Dissolve team
```

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. `mockData.ts` and `types.ts` are CRLF in the worktree but LF in the index: edit them normally, run prettier, and confirm with `git diff --stat` that only the intended hunks changed (git normalises the EOL). New files follow the existing `components/Name.tsx` convention inside `TeamConfigPage/`.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-20-team-config-master-detail.md`.

### Task 1 — Model and constants

**`src/modules/qa/team/types.ts`** — add one optional field to `RosterSupervisor`:

```ts
export interface RosterSupervisor {
	id: string;
	name: string;
	team: string;
	email: string;
	/** How many agents the team should have; drives the capacity indicator on Team configuration. */
	targetSize?: number;
}
```

**`src/modules/qa/team/constants.ts`** — after `UNASSIGNED_SUPERVISOR`:

```ts
/** Target size a team gets when none is given (New team drawer default, seed fallback). */
export const DEFAULT_TEAM_TARGET_SIZE = 12;
```

**`src/modules/qa/team/mockData.ts`** — three small edits:

1. `export interface Persona { … }` (L85) and `export const AVATAR_COLORS` (L100): add the `export` keyword, nothing else.
2. `TEAM_SUPERVISORS`: add `targetSize: 12` to SUP-001 and SUP-003, `targetSize: 20` to SUP-002.
3. `buildAgentProfile` gets an optional third parameter so a persona outside `TEAM_AGENTS` can be built:
   ```ts
   export function buildAgentProfile(
   	p: Persona,
   	rank: RankContext,
   	agentOverride?: RosterAgent
   ): AgentProfile {
   	const agent = agentOverride ?? TEAM_AGENTS.find((a) => a.id === p.id)!;
   ```
   Also `export interface RankContext` (L461) so the seed file can type its calls.

### Task 2 — Extra seed for the stressed demo (`src/modules/qa/team/teamConfigSeed.ts`, new, LF)

Paste-ready. It depends on `mockData.ts` only (no cycle: the store imports both).

```ts
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import type { AgentProfile, RosterAgent, RosterSupervisor } from './types';
import {
	AVATAR_COLORS,
	buildAgentProfile,
	TEAM_SUPERVISORS,
	type Persona,
} from './mockData';
import { UNASSIGNED_SUPERVISOR, UNASSIGNED_SUPERVISOR_ID } from './constants';

/**
 * Extra teams and agents for the Operation Manager's Team configuration demo:
 * Team 2 grows to 32 agents, three more teams appear and three agents sit Unassigned.
 * Merged into the team store only, so the static mocks (analytics, coaching, LMS, customers)
 * keep the original 21-agent roster.
 */
export const TEAM_CONFIG_EXTRA_SUPERVISORS: RosterSupervisor[] = [
	{
		id: 'SUP-004',
		name: 'Rosa Lima',
		team: 'Team 4',
		email: 'rosa.lima@newtech.com',
		targetSize: 12,
	},
	{
		id: 'SUP-005',
		name: 'Daniel Ortega',
		team: 'Team 5',
		email: 'daniel.ortega@newtech.com',
		targetSize: 12,
	},
	{
		id: 'SUP-006',
		name: 'Valeria Soto',
		team: 'Team 6',
		email: 'valeria.soto@newtech.com',
		targetSize: 10,
	},
];

type Seed = [
	id: string,
	name: string,
	supervisorId: string,
	status?: RosterAgent['status'],
];

/** [id, name, supervisorId, status?]. Shift rotates by index; everything else is derived deterministically. */
const SEEDS: Seed[] = [
	// Team 2 grows from 7 to 32
	['AGT-022', 'Alejandro Peña', 'SUP-002'],
	['AGT-023', 'Beatriz Campos', 'SUP-002'],
	['AGT-024', 'Cristian Molina', 'SUP-002'],
	['AGT-025', 'Daniela Rojas', 'SUP-002', 'on-leave'],
	['AGT-026', 'Esteban Vargas', 'SUP-002'],
	['AGT-027', 'Fernanda Luna', 'SUP-002'],
	['AGT-028', 'Gabriel Soto', 'SUP-002'],
	['AGT-029', 'Helena Marín', 'SUP-002'],
	['AGT-030', 'Ignacio Reyes', 'SUP-002'],
	['AGT-031', 'Julieta Ponce', 'SUP-002'],
	['AGT-032', 'Kevin Duarte', 'SUP-002'],
	['AGT-033', 'Lorena Vidal', 'SUP-002', 'training'],
	['AGT-034', 'Martín Aguilar', 'SUP-002'],
	['AGT-035', 'Natalia Cordero', 'SUP-002'],
	['AGT-036', 'Óscar Benítez', 'SUP-002'],
	['AGT-037', 'Patricia Méndez', 'SUP-002'],
	['AGT-038', 'Ramiro Castro', 'SUP-002'],
	['AGT-039', 'Silvia Paredes', 'SUP-002'],
	['AGT-040', 'Teo Salazar', 'SUP-002'],
	['AGT-041', 'Úrsula Blanco', 'SUP-002', 'training'],
	['AGT-042', 'Víctor Lara', 'SUP-002'],
	['AGT-043', 'Ximena Prado', 'SUP-002'],
	['AGT-044', 'Yolanda Ferrer', 'SUP-002'],
	['AGT-045', 'Zoe Medina', 'SUP-002'],
	['AGT-046', 'Adrián Quiroga', 'SUP-002'],
	// Team 4
	['AGT-047', 'Brenda Ocampo', 'SUP-004'],
	['AGT-048', 'César Montes', 'SUP-004'],
	['AGT-049', 'Dalia Fuentes', 'SUP-004', 'on-leave'],
	['AGT-050', 'Emilio Cano', 'SUP-004'],
	['AGT-051', 'Florencia Ibáñez', 'SUP-004'],
	['AGT-052', 'Gonzalo Peralta', 'SUP-004'],
	['AGT-053', 'Irene Robles', 'SUP-004'],
	['AGT-054', 'Joaquín Serrano', 'SUP-004'],
	// Team 5
	['AGT-055', 'Karla Espinoza', 'SUP-005'],
	['AGT-056', 'Leandro Núñez', 'SUP-005'],
	['AGT-057', 'Marcela Gil', 'SUP-005'],
	['AGT-058', 'Nicolás Bravo', 'SUP-005', 'training'],
	['AGT-059', 'Olivia Carrasco', 'SUP-005'],
	['AGT-060', 'Pablo Ledesma', 'SUP-005'],
	// Team 6
	['AGT-061', 'Renata Villalba', 'SUP-006'],
	['AGT-062', 'Santiago Ochoa', 'SUP-006'],
	['AGT-063', 'Tamara Godoy', 'SUP-006'],
	['AGT-064', 'Ulises Farías', 'SUP-006'],
	['AGT-065', 'Vanessa Roldán', 'SUP-006'],
	// Unassigned
	['AGT-066', 'Walter Escobar', UNASSIGNED_SUPERVISOR_ID],
	['AGT-067', 'Yamila Toledo', UNASSIGNED_SUPERVISOR_ID],
	['AGT-068', 'Zacarías Bustos', UNASSIGNED_SUPERVISOR_ID],
];

const CAMPAIGNS_BY_TEAM: Record<string, string[][]> = {
	'SUP-002': [['camp-002'], ['camp-002', 'camp-004'], ['camp-004']],
	'SUP-004': [['camp-004'], ['camp-004', 'camp-001']],
	'SUP-005': [['camp-001'], ['camp-001', 'camp-003']],
	'SUP-006': [['camp-003'], ['camp-003', 'camp-002']],
	[UNASSIGNED_SUPERVISOR_ID]: [['camp-001']],
};
const SKILLS_BY_TEAM: Record<string, string[][]> = {
	'SUP-002': [
		['Sales'],
		['Sales', 'Bilingual'],
		['Tech Support'],
		['Sales', 'Retention'],
	],
	'SUP-004': [['Tech Support'], ['Tech Support', 'De-escalation']],
	'SUP-005': [['Customer Service'], ['Customer Service', 'Upsell']],
	'SUP-006': [['Collections'], ['Collections', 'Compliance']],
	[UNASSIGNED_SUPERVISOR_ID]: [['Customer Service'], ['Sales']],
};
const SHIFTS: RosterAgent['shift'][] = ['morning', 'afternoon', 'night'];
const TRACKED_SINCE = ['2025-01-13', '2025-02-10', '2025-03-03', '2025-05-05'];

/** Deterministic 0..1 from the seed index and a salt (no Math.random so the demo is stable). */
const unit = (i: number, salt: number) =>
	((i * 9301 + salt * 49297 + 233) % 233280) / 233280;

const toPersona = (
	[id, name, supervisorId, status]: Seed,
	i: number
): Persona => {
	const pick = <T>(pool: T[], salt: number) =>
		pool[Math.floor(unit(i, salt) * pool.length)];
	return {
		id,
		name,
		supervisorId,
		campaignIds: pick(CAMPAIGNS_BY_TEAM[supervisorId], 1),
		status,
		shift: SHIFTS[i % 3],
		hireDate: `${2022 + (i % 4)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 27)).padStart(2, '0')}`,
		trackedSince: pick(TRACKED_SINCE, 2),
		base: {
			qa: 0.6 + unit(i, 3) * 0.35,
			sentiment: 0.55 + unit(i, 4) * 0.4,
			compliance: 0.65 + unit(i, 5) * 0.33,
			business: 0.5 + unit(i, 6) * 0.35,
		},
		slope: unit(i, 7) * 0.6 - 0.3,
		burnout:
			i % 13 === 5
				? BurnoutRiskLevel.HIGH
				: i % 7 === 3
					? BurnoutRiskLevel.MEDIUM
					: BurnoutRiskLevel.LOW,
		skills: pick(SKILLS_BY_TEAM[supervisorId], 8),
	};
};

const EXTRA_PERSONAS: Persona[] = SEEDS.map(toPersona);

const supervisorFor = (id: string): RosterSupervisor =>
	[...TEAM_SUPERVISORS, ...TEAM_CONFIG_EXTRA_SUPERVISORS].find(
		(s) => s.id === id
	) ?? UNASSIGNED_SUPERVISOR;

export const TEAM_CONFIG_EXTRA_AGENTS: RosterAgent[] = EXTRA_PERSONAS.map(
	(p, i) => {
		const sup = supervisorFor(p.supervisorId);
		return {
			id: p.id,
			name: p.name,
			email: `${p.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(' ', '.')}@newtech.com`,
			supervisorId: sup.id,
			supervisorName: sup.name,
			team: sup.team,
			campaignIds: p.campaignIds,
			status: p.status ?? 'active',
			shift: p.shift ?? SHIFTS[i % 3],
			hireDate: p.hireDate,
			trackedSince: p.trackedSince,
			skills: p.skills,
			avatarColor: AVATAR_COLORS[(i + 3) % AVATAR_COLORS.length],
		};
	}
);

/** Same two-pass ranking as mockData's buildAll, grouped by supervisor (Unassigned included). */
function buildExtraProfiles(): Record<string, AgentProfile> {
	const agentsById = Object.fromEntries(
		TEAM_CONFIG_EXTRA_AGENTS.map((a) => [a.id, a])
	);
	const provisional = EXTRA_PERSONAS.map((p) => ({
		p,
		overall: buildAgentProfile(
			p,
			{ rankInTeam: 1, teamSize: 1, percentile: 50 },
			agentsById[p.id]
		).overall.score,
	}));
	const groups = new Set(EXTRA_PERSONAS.map((p) => p.supervisorId));
	const out: Record<string, AgentProfile> = {};
	for (const supervisorId of groups) {
		const team = provisional
			.filter((x) => x.p.supervisorId === supervisorId)
			.sort((a, b) => b.overall - a.overall);
		team.forEach((x, i) => {
			const rankInTeam = i + 1;
			const percentile = Math.round(
				((team.length - rankInTeam) / Math.max(1, team.length - 1)) * 100
			);
			out[x.p.id] = buildAgentProfile(
				x.p,
				{ rankInTeam, teamSize: team.length, percentile },
				agentsById[x.p.id]
			);
		});
	}
	return out;
}

export const TEAM_CONFIG_EXTRA_PROFILES: Record<string, AgentProfile> =
	buildExtraProfiles();

/** Campaign unions for the extra teams (SUP-002 already has an entry from the base seed). */
export const TEAM_CONFIG_EXTRA_CAMPAIGN_IDS: Record<string, string[]> =
	Object.fromEntries(
		TEAM_CONFIG_EXTRA_SUPERVISORS.map((sup) => [
			sup.id,
			[
				...new Set(
					TEAM_CONFIG_EXTRA_AGENTS.filter(
						(a) => a.supervisorId === sup.id
					).flatMap((a) => a.campaignIds)
				),
			],
		])
	);
```

Note for the Team 2 ranking: extra Team 2 agents are ranked among themselves only (their `overall.rankInTeam/teamSize` ignore the 7 base agents). That is invisible on this screen and acceptable for the mockup.

### Task 3 — Store (`src/stores/qa/teamStore.ts`)

1. Imports: add `DEFAULT_TEAM_TARGET_SIZE` to the `./constants` import; add
   ```ts
   import {
   	TEAM_CONFIG_EXTRA_CAMPAIGN_IDS,
   	TEAM_CONFIG_EXTRA_PROFILES,
   	TEAM_CONFIG_EXTRA_SUPERVISORS,
   } from '~/modules/qa/team/teamConfigSeed';
   ```
2. `CreateTeamInput`: add `targetSize?: number;`.
3. Replace `renameTeam` in `TeamState` with:
   ```ts
   /** Renames the team (relabelling every member) and/or changes its target size. */
   updateTeam: (
   	supervisorId: string,
   	patch: Partial<Pick<RosterSupervisor, 'team' | 'targetSize'>>
   ) => void;
   ```
4. Initial state:
   ```ts
   profiles: { ...TEAM_PROFILES, ...TEAM_CONFIG_EXTRA_PROFILES },
   supervisors: Object.fromEntries(
   	[...TEAM_SUPERVISORS, ...TEAM_CONFIG_EXTRA_SUPERVISORS].map((s) => [s.id, s])
   ),
   teamCampaignIds: { ...initialTeamCampaignIds(), ...TEAM_CONFIG_EXTRA_CAMPAIGN_IDS },
   ```
5. `createTeam`: the supervisor object gets `targetSize: input.targetSize ?? DEFAULT_TEAM_TARGET_SIZE`.
6. Replace the `renameTeam` implementation with:
   ```ts
   updateTeam: (supervisorId, patch) =>
   	set((s) => {
   		const supervisor = s.supervisors[supervisorId];
   		if (!supervisor) return {};
   		const next = { ...supervisor, ...patch };
   		const supervisors = { ...s.supervisors, [supervisorId]: next };
   		if (patch.team === undefined || patch.team === supervisor.team) return { supervisors };
   		const profiles = { ...s.profiles };
   		for (const [agentId, p] of Object.entries(profiles)) {
   			if (p.agent.supervisorId === supervisorId) {
   				profiles[agentId] = { ...p, agent: { ...p.agent, team: next.team } };
   			}
   		}
   		return { supervisors, profiles };
   	}),
   ```
   Grep `renameTeam` afterwards: only the files rewritten in Task 4 may still mention it, and they will not after Task 4.

### Task 4 — Page and components (`src/modules/qa/team/TeamConfigPage/`)

Delete `components/TeamColumn.tsx`, `components/AgentCard.tsx`, `components/RenameTeamModal.tsx`. Rewrite `TeamConfigPage.tsx` and `TeamConfigPage.module.css`. Create `capacity.ts`, `components/TeamRail.tsx`, `components/TeamRailItem.tsx`, `components/TeamHeader.tsx`, `components/MembersToolbar.tsx`, `components/useMemberColumns.tsx`, `components/SelectionBar.tsx`, `components/MoveToMenu.tsx`, `components/EditTeamModal.tsx`. Edit `components/NewTeamDrawer.tsx`. `index.ts` stays.

Nothing on this page imports `@hello-pangea/dnd` any more.

**`capacity.ts`**

```ts
import { DEFAULT_TEAM_TARGET_SIZE } from '../constants';

export type CapacityState = 'under' | 'at' | 'over';

export interface Capacity {
	count: number;
	target: number;
	/** 0..100, capped so the bar never overflows. */
	percent: number;
	state: CapacityState;
	/** Agents over the target (state 'over') or open seats (state 'under'); 0 when at target. */
	diff: number;
	/** Mantine color for the bar and the count. */
	color: string;
}

export function teamCapacity(count: number, targetSize?: number): Capacity {
	const target = targetSize ?? DEFAULT_TEAM_TARGET_SIZE;
	const state: CapacityState =
		count > target ? 'over' : count === target ? 'at' : 'under';
	return {
		count,
		target,
		percent: Math.min(100, Math.round((count / Math.max(1, target)) * 100)),
		state,
		diff: Math.abs(count - target),
		color: state === 'over' ? 'amber' : state === 'at' ? 'green' : 'blue',
	};
}
```

**`components/MoveToMenu.tsx`** — one menu used by the row action and the selection bar.

```ts
export interface MoveTarget {
	id: string;
	label: string;
}
interface MoveToMenuProps {
	targets: MoveTarget[];
	/** Left out of the list. */
	currentTargetId: string;
	onSelect: (targetId: string) => void;
	/** The trigger (ActionIcon or Button). */
	children: React.ReactNode;
	/** Forwarded to Menu so a row's menu can open inside the table's scroll container. */
	position?: MenuProps['position'];
}
```

Renders `Menu position={position ?? 'bottom-end'} withinPortal shadow='md'` → `Menu.Target{children}` → `Menu.Dropdown`: `Menu.Label t('teamConfig.row.moveTo')`, then one `Menu.Item` per `targets.filter((x) => x.id !== currentTargetId)` calling `onSelect(target.id)`; the Unassigned target gets `leftSection={<IconUserOff size={14} />}`, teams get `<IconUsersGroup size={14} />`. Targets are built on the page: `[{ id: UNASSIGNED_SUPERVISOR_ID, label: t('teamConfig.rail.unassigned') }, ...supervisorList.map((s) => ({ id: s.id, label: s.team }))]` (same as today).

**`components/TeamRailItem.tsx`** — props `{ supervisor: RosterSupervisor; count: number; selected: boolean; variant?: 'team' | 'unassigned'; matchCount?: number; onSelect: () => void }`.

- `UnstyledButton` with `className={clsx(styles.railItem, selected && styles.railItemSelected, variant === 'unassigned' && styles.railItemUnassigned)}`, `aria-pressed={selected}`, `onClick={onSelect}`, full width.
- Team variant: top row `Group justify='space-between' wrap='nowrap' gap='xs'`: `Text size='sm' fw={600} lineClamp={1}` team name; right `Text size='xs' fw={600} c={cap.state === 'over' ? 'amber.8' : 'dimmed'}` `t('teamConfig.rail.capacity', { count, target })` ("32 / 20"). Second row `Text size='xs' c='dimmed' lineClamp={1}` supervisor name. Third row `Progress size='xs' radius='xl' value={cap.percent} color={cap.color} mt={6}` where `cap = teamCapacity(count, supervisor.targetSize)`.
- Unassigned variant: `Group justify='space-between' wrap='nowrap'`: left `Group gap={6}`: `IconUserOff size={16}` (dimmed) + `Text size='sm' fw={600}` `t('teamConfig.rail.unassigned')`; right `Badge size='sm' variant='light' color={count > 0 ? 'amber' : 'gray'}` `{count}`. No progress bar. Under it `Text size='xs' c='dimmed'` `t('teamConfig.rail.unassignedHint')`.
- When `matchCount !== undefined` (rail search active) add a last line `Text size='xs' c='blue'` `t('teamConfig.rail.matches', { count: matchCount })`.
- Dark/light: `.railItem` border-left 3px transparent, padding `var(--mantine-spacing-sm)`, radius md, `:hover` background `light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))`; `.railItemSelected` background `light-dark(var(--mantine-primary-color-0), var(--mantine-color-dark-5))` and `border-left-color: var(--mantine-primary-color-filled)`; `.railItemUnassigned` gets `border-bottom: 1px dashed var(--mantine-color-default-border)` and `margin-bottom: var(--mantine-spacing-xs)`.

**`components/TeamRail.tsx`** — props `{ supervisors: RosterSupervisor[]; totals: Record<string, number>; agents: RosterAgent[]; selectedId: string; onSelect: (id: string) => void }`.

- `SectionCard padding='sm' fullHeight className={styles.rail}` with `title={t('teamConfig.rail.title')}` and `headerActions={<Badge variant='light' color='gray'>{supervisors.length}</Badge>}`.
- `TextInput size='sm' placeholder={t('teamConfig.rail.search')} leftSection={<IconSearch size={14} />}` with the same clear-button pattern as today's search (`aria-label={t('teamConfig.clearSearch')}`); local `useState('')`.
- Filtering (`useMemo`): `q = search.trim().toLowerCase()`; a team is shown when `!q`, or its `team`/`name` contains `q`, or at least one agent with that `supervisorId` matches `q` on `name`/`id`/`email`; in that last case the item gets `matchCount` = number of matching agents. The Unassigned item follows the same rule (agents with `supervisorId === UNASSIGNED_SUPERVISOR_ID`). When nothing matches render `Text size='xs' c='dimmed' ta='center' py='md'` `t('teamConfig.rail.empty')`.
- List: `ScrollArea.Autosize mah='calc(100vh - 320px)' type='auto' offsetScrollbars` → `Stack gap={2}`: first `TeamRailItem variant='unassigned'` (`supervisor={UNASSIGNED_SUPERVISOR}`, `count={totals[UNASSIGNED_SUPERVISOR_ID] ?? 0}`), then one `TeamRailItem` per supervisor in store order with `count={totals[s.id] ?? 0}`.
- `.rail { position: sticky; top: var(--mantine-spacing-md); }` (only applies at desktop widths; see layout CSS).

**`components/TeamHeader.tsx`** — props `{ supervisor: RosterSupervisor; count: number; variant: 'team' | 'unassigned'; onEditSupervisor: () => void; onEditTeam: () => void; onDissolve: () => void }`.

- `SectionCard padding='md'`. Row 1 `Group justify='space-between' align='flex-start' wrap='nowrap'`:
  - Left `Group gap='sm' wrap='nowrap'`: team variant `Avatar name={supervisor.name} color='gray' radius='xl' size='md'`; unassigned variant `ThemeIcon variant='light' color='gray' size='lg' radius='xl'` with `IconUserOff size={18}`. Then `div`: `Title order={4}` (`supervisor.team` or `t('teamConfig.rail.unassigned')`) and `Text size='sm' c='dimmed'` (team: `${supervisor.name} · ${supervisor.email}`; unassigned: `t('teamConfig.header.unassignedHint')`).
  - Right (team variant only): `Menu position='bottom-end' withinPortal` on `ActionIcon variant='subtle' color='gray' aria-label={t('teamConfig.header.menu.label')}` (`IconDotsVertical size={16}`) → items Edit supervisor (`IconEdit`), Edit team (`IconPencil`), divider, Dissolve team (`IconTrash`, `color='red'`). Same keys as today except `renameTeam` → `editTeam`.
- Row 2 (team variant only), `Group gap='sm' wrap='wrap' mt='sm'`: `Progress size='sm' radius='xl' w={180} value={cap.percent} color={cap.color}`; `Text size='sm'` `t('teamConfig.header.agents', { count })` + `·` + `t('teamConfig.header.target', { target: cap.target })`; then one of `Badge variant='light' color='amber'` `t('teamConfig.header.overBy', { count: cap.diff })`, `Badge variant='light' color='green'` `t('teamConfig.header.atTarget')`, `Text size='sm' c='dimmed'` `t('teamConfig.header.openSeats', { count: cap.diff })`.
- Row 2 (unassigned): `Text size='sm' mt='sm'` `t('teamConfig.header.agents', { count })`.

**`components/MembersToolbar.tsx`** — props `{ value: MemberFilters; onChange: (v: MemberFilters) => void; shown: number; total: number }` where

```ts
export interface MemberFilters {
	search: string;
	shift: Shift | 'all';
	status: AgentStatus | 'all';
}
export const DEFAULT_MEMBER_FILTERS: MemberFilters = {
	search: '',
	shift: 'all',
	status: 'all',
};
```

`Group justify='space-between' align='center' wrap='wrap' gap='sm'`: left `Group gap='sm' wrap='wrap'`: `TextInput size='sm' w={280} placeholder={t('teamConfig.members.search')} aria-label` + `IconSearch` + clear button; `Select size='sm' w={150} allowDeselect={false} placeholder/aria-label={t('teamConfig.members.shift')} data=[{all, t('teamConfig.members.all')}, morning/afternoon/night via t('shift.*')]`; `Select size='sm' w={150}` status (`t('status.*')`); `Button variant='subtle' size='xs'` `t('teamConfig.members.clear')` when not default. Right: `Text size='sm' c='dimmed'`: `shown === total ? t('teamConfig.members.count', { count: total }) : t('teamConfig.members.filteredCount', { count: shown, total })`.

**`components/useMemberColumns.tsx`** — `useMemberColumns(t, targets, currentTargetId, onMove): BaseTableColumnDef<RosterAgent>[]` with `createColumnHelper<RosterAgent>()`:

1. `name` — header `t('teamConfig.columns.agent')`; cell `Group gap='sm' wrap='nowrap'`: `Avatar name color={agent.avatarColor} radius='xl' size='sm'`, `Stack gap={0}`: `Text size='sm' fw={600}` name (no `lineClamp`, the column is fluid), `Text size='xs' c='dimmed'` `{agent.id} · {agent.email}`.
2. `shift` — header `t('teamConfig.columns.shift')`; cell `Text size='sm'` `t(\`shift.${v}\`)`.
3. `status` — header `t('teamConfig.columns.status')`; cell `Badge variant='dot' color={STATUS_COLOR[v]}` `t(\`status.${v}\`)`with`STATUS_COLOR = { active: 'green', 'on-leave': 'gray', training: 'blue' }`.
4. `display({ id: 'actions', header: '' })` — cell `Group justify='flex-end' className={styles.rowActions} onClick={(e) => e.stopPropagation()}`: `MoveToMenu targets currentTargetId onSelect={(id) => onMove(agent.id, id)}` wrapping `Tooltip label={t('teamConfig.row.moveTo')}` → `ActionIcon variant='subtle' color='gray' size='md' aria-label={t('teamConfig.row.moveTo')}` (`IconArrowsExchange size={16}`). `size='md'` is 28px, above the 24px pointer-target minimum.

`meta.cellClassName` is not needed; width comes from content.

**`components/SelectionBar.tsx`** — props `{ count: number; targets: MoveTarget[]; currentTargetId: string; onMove: (targetId: string) => void; onClear: () => void }`. Renders nothing when `count === 0`. Otherwise `Paper radius='md' p='xs' className={styles.selectionBar}` → `Group justify='space-between' wrap='wrap' gap='sm'`: `Text size='sm' fw={600}` `t('teamConfig.selection.count', { count })`; right `Group gap='xs'`: `MoveToMenu targets currentTargetId onSelect={onMove} position='bottom-start'` wrapping `Button size='xs' variant='filled' rightSection={<IconChevronDown size={14} />}` `t('teamConfig.selection.moveTo')`; when `currentTargetId !== UNASSIGNED_SUPERVISOR_ID` a `Button size='xs' variant='light' color='gray' leftSection={<IconUserOff size={14} />} onClick={() => onMove(UNASSIGNED_SUPERVISOR_ID)}` `t('teamConfig.selection.unassign')`; `Button size='xs' variant='subtle' color='gray' onClick={onClear}` `t('teamConfig.selection.clear')`.

**`components/EditTeamModal.tsx`** (replaces `RenameTeamModal.tsx`) — props `{ supervisor: RosterSupervisor | null; onClose: () => void }`. Same skeleton as the old modal: `Modal centered size='sm' opened={supervisor !== null} title={t('teamConfig.editTeam.title')}`; `useForm<{ teamName: string; targetSize: number }>` seeded from the supervisor in the `useEffect` on `supervisor?.id` (`targetSize: supervisor.targetSize ?? DEFAULT_TEAM_TARGET_SIZE`); validation: `teamName` as before, `targetSize: (v) => (Number.isInteger(v) && v >= 1 ? null : t('teamConfig.drawer.validation.targetSize'))`. Fields: `TextInput label={t('teamConfig.editTeam.name')} data-autofocus`, `NumberInput label={t('teamConfig.editTeam.targetSize')} description={t('teamConfig.drawer.targetSizeHint')} min={1} max={200} allowDecimal={false}`. Submit → `updateTeam(supervisor.id, { team: teamName.trim(), targetSize })` → `notifySuccess(t('teamConfig.toast.updated', { team: teamName.trim() }))` → `onClose()`. Footer Cancel (`modals.cancel`) / Save (`teamConfig.editTeam.save`).

**`components/NewTeamDrawer.tsx`** — edits only:

- `NewTeamValues` and `EMPTY` gain `targetSize: number` (`EMPTY.targetSize = DEFAULT_TEAM_TARGET_SIZE`).
- Validation adds `targetSize` as in the modal.
- In the "Team" `SectionCard`, under the name: `NumberInput label={t('teamConfig.drawer.targetSize')} description={t('teamConfig.drawer.targetSizeHint')} min={1} max={200} allowDecimal={false} {...form.getInputProps('targetSize')}` inside a `Stack gap='sm'` with the name.
- New prop `onCreated?: (supervisor: RosterSupervisor) => void`; `handleSubmit` passes `targetSize` to `createTeam` and calls `onCreated?.(supervisor)` before `onClose()`.

**`TeamConfigPage.tsx`** — rewrite.

State and derived data:

```ts
const supervisors = useTeamStore(selectSupervisors);
const profiles = useTeamStore(selectProfiles);
const addMembers = useTeamStore((s) => s.addMembers);
const removeMember = useTeamStore((s) => s.removeMember);
const dissolveTeam = useTeamStore((s) => s.dissolveTeam);

const supervisorList = useMemo(() => Object.values(supervisors), [supervisors]);
const agents = useMemo(() => Object.values(profiles).map((p) => p.agent).sort(byName), [profiles]);
const totals = useMemo(() => count agents per supervisorId (Record<string, number>), [agents]);

const [selectedTeamId, setSelectedTeamId] = useState<string>(supervisorList[0]?.id ?? UNASSIGNED_SUPERVISOR_ID);
const [filters, setFilters] = useState<MemberFilters>(DEFAULT_MEMBER_FILTERS);
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [newTeamOpened, setNewTeamOpened] = useState(false);
const [addAgentsOpened, setAddAgentsOpened] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);   // EditSupervisorModal
const [editingTeamId, setEditingTeamId] = useState<string | null>(null); // EditTeamModal
```

- `selectedTeam = selectedTeamId === UNASSIGNED_SUPERVISOR_ID ? UNASSIGNED_SUPERVISOR : supervisors[selectedTeamId]`. A `useEffect` on `[supervisors, selectedTeamId]`: if `selectedTeamId !== UNASSIGNED_SUPERVISOR_ID && !supervisors[selectedTeamId]`, select `UNASSIGNED_SUPERVISOR_ID` (a dissolved team's agents land there).
- `selectTeam(id)`: sets `selectedTeamId`, resets `selectedIds` to `[]` and `filters` to the defaults.
- `members = agents.filter((a) => a.supervisorId === selectedTeamId)`; `visibleMembers` applies `filters` (search on `name`/`id`/`email`, case-insensitive; `shift`; `status`).
- `targets` as today (Unassigned first, then teams in store order).
- `moveAgents(agentIds: string[], targetId: string)`: `targetId === UNASSIGNED_SUPERVISOR_ID ? agentIds.forEach(removeMember) : addMembers(agentIds, targetId)`; toast: one agent → `teamConfig.toast.moved { name, team }`, several → `teamConfig.toast.movedMany { count, team }` (`team` = target label); then `setSelectedIds([])`.
- `confirmDissolve(id)` unchanged from today (it already reads `totals[id]`).
- KPIs unchanged (`teamCount`, `assignedCount`, `unassignedCount`, average with one decimal).

Render:

```tsx
<ContentContainer contentWidth='full' title description titleRight={<Button size='sm' leftSection={<IconPlus size={16} />} onClick={() => setNewTeamOpened(true)}>{t('teamConfig.newTeam')}</Button>}>
	<Stack gap='md'>
		<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>{the four StatCards exactly as today}</SimpleGrid>

		{teamCount === 0 && unassignedCount === 0 ? (
			<EmptyState … as today />
		) : (
			<div className={styles.layout}>
				<TeamRail supervisors={supervisorList} totals={totals} agents={agents} selectedId={selectedTeamId} onSelect={selectTeam} />
				<Stack gap='md' className={styles.detail}>
					<TeamHeader
						supervisor={selectedTeam}
						count={totals[selectedTeamId] ?? 0}
						variant={selectedTeamId === UNASSIGNED_SUPERVISOR_ID ? 'unassigned' : 'team'}
						onEditSupervisor={() => setEditingId(selectedTeamId)}
						onEditTeam={() => setEditingTeamId(selectedTeamId)}
						onDissolve={() => confirmDissolve(selectedTeamId)}
					/>
					<SectionCard
						title={t('teamConfig.members.title')}
						headerActions={selectedTeamId !== UNASSIGNED_SUPERVISOR_ID && (
							<Button size='xs' variant='light' leftSection={<IconPlus size={14} />} onClick={() => setAddAgentsOpened(true)}>
								{t('teamConfig.members.addAgents')}
							</Button>
						)}
					>
						<Stack gap='sm'>
							<MembersToolbar value={filters} onChange={setFilters} shown={visibleMembers.length} total={members.length} />
							<SelectionBar count={selectedIds.length} targets={targets} currentTargetId={selectedTeamId} onMove={(id) => moveAgents(selectedIds, id)} onClear={() => setSelectedIds([])} />
							<BaseTable<RosterAgent>
								data={visibleMembers}
								columns={columns}
								getRowId={(a) => a.id}
								initialSort={[{ id: 'name', desc: false }]}
								enableRowSelection
								selectedRowIds={selectedIds}
								onSelectedRowIdsChange={setSelectedIds}
								enablePagination
								showPaginationControls
								pageSize={25}
								density='compact'
								emptyMessage={emptyMessage}
								getRowClassName={() => styles.memberRow}
							/>
						</Stack>
					</SectionCard>
				</Stack>
			</div>
		)}
	</Stack>

	<NewTeamDrawer opened={newTeamOpened} onClose={() => setNewTeamOpened(false)} onCreated={(s) => selectTeam(s.id)} />
	{selectedTeamId !== UNASSIGNED_SUPERVISOR_ID && selectedTeam && (
		<AddMembersDrawer opened={addAgentsOpened} onClose={() => setAddAgentsOpened(false)} supervisorId={selectedTeamId} teamName={selectedTeam.team} />
	)}
	{editing && <EditSupervisorModal opened onClose={() => setEditingId(null)} supervisor={editing} />}
	<EditTeamModal supervisor={editingTeam} onClose={() => setEditingTeamId(null)} />
</ContentContainer>
```

`emptyMessage`: members empty and team is Unassigned → `t('teamConfig.members.emptyUnassigned')`; members empty → `t('teamConfig.members.empty')`; filtered to nothing → `t('teamConfig.members.emptyFiltered')`. `AddMembersDrawer` is imported from `'../TeamDetailPage/AddMembersDrawer'`. `columns = useMemberColumns(t, targets, selectedTeamId, (agentId, targetId) => moveAgents([agentId], targetId))`.

**`TeamConfigPage.module.css`** — full replacement:

```css
/* Master-detail: teams rail on the left, the selected team on the right. */
.layout {
	display: grid;
	grid-template-columns: 300px minmax(0, 1fr);
	gap: var(--mantine-spacing-md);
	align-items: start;
}

@media (max-width: 62em) {
	.layout {
		grid-template-columns: 1fr;
	}
	.rail {
		position: static;
	}
}

.rail {
	position: sticky;
	top: var(--mantine-spacing-md);
}

.detail {
	min-width: 0;
}

.railItem {
	display: block;
	width: 100%;
	padding: var(--mantine-spacing-sm);
	border-radius: var(--mantine-radius-md);
	border-left: 3px solid transparent;
	transition: background-color 120ms ease;
}

.railItem:hover {
	background: light-dark(
		var(--mantine-color-gray-0),
		var(--mantine-color-dark-6)
	);
}

.railItem:focus-visible {
	outline: 2px solid var(--mantine-primary-color-filled);
	outline-offset: -2px;
}

.railItemSelected,
.railItemSelected:hover {
	background: light-dark(
		var(--mantine-primary-color-0),
		var(--mantine-color-dark-5)
	);
	border-left-color: var(--mantine-primary-color-filled);
}

/* The pool of agents without a team reads as a holding area, not a team. */
.railItemUnassigned {
	margin-bottom: var(--mantine-spacing-xs);
	border-bottom: 1px dashed var(--mantine-color-default-border);
	border-radius: var(--mantine-radius-md) var(--mantine-radius-md) 0 0;
}

.selectionBar {
	background: light-dark(
		var(--mantine-primary-color-0),
		var(--mantine-color-dark-5)
	);
	border: 1px solid
		light-dark(var(--mantine-primary-color-2), var(--mantine-color-dark-4));
}

/* Row actions stay in the DOM for keyboard users and show on hover, focus or while the menu is open. */
.rowActions {
	opacity: 0;
	transition: opacity 120ms ease;
}

.memberRow:hover .rowActions,
.memberRow:focus-within .rowActions,
.memberRow:has([aria-expanded='true']) .rowActions {
	opacity: 1;
}
```

### Task 5 — Copy (`src/locales/{en,es}/qa.team.json`)

Replace the whole `teamConfig` block (L500 to the end of the object) with the one below; keep every other key. Both files end with `}` closing the root object.

**en**

```json
"teamConfig": {
	"title": "Team configuration",
	"description": "Create teams, assign a supervisor to each one and move agents between them.",
	"newTeam": "New team",
	"clearSearch": "Clear search",
	"kpis": {
		"teams": "Teams",
		"agents": "Assigned agents",
		"unassigned": "Unassigned",
		"avgSize": "Avg. team size"
	},
	"rail": {
		"title": "Teams",
		"search": "Search teams or agents…",
		"unassigned": "Unassigned",
		"unassignedHint": "Agents without a team",
		"capacity": "{{count}} / {{target}}",
		"matches_one": "{{count}} agent matches",
		"matches_other": "{{count}} agents match",
		"empty": "No teams or agents match"
	},
	"header": {
		"agents_one": "{{count}} agent",
		"agents_other": "{{count}} agents",
		"target": "target {{target}}",
		"overBy_one": "{{count}} over target",
		"overBy_other": "{{count}} over target",
		"atTarget": "At target",
		"openSeats_one": "{{count}} open seat",
		"openSeats_other": "{{count}} open seats",
		"unassignedHint": "Agents without a team. Move them into a team from the list below.",
		"menu": {
			"label": "Team actions",
			"editSupervisor": "Edit supervisor",
			"editTeam": "Edit team",
			"dissolveTeam": "Dissolve team"
		}
	},
	"members": {
		"title": "Members",
		"addAgents": "Add agents",
		"search": "Search by name, ID or email…",
		"shift": "Shift",
		"status": "Status",
		"all": "All",
		"clear": "Clear filters",
		"count_one": "{{count}} agent",
		"count_other": "{{count}} agents",
		"filteredCount": "{{count}} of {{total}} agents",
		"empty": "No agents in this team yet. Add agents or move them here from another team.",
		"emptyFiltered": "No agents match these filters.",
		"emptyUnassigned": "Everyone has a team."
	},
	"columns": {
		"agent": "Agent",
		"shift": "Shift",
		"status": "Status"
	},
	"row": {
		"moveTo": "Move to…"
	},
	"selection": {
		"count_one": "{{count}} selected",
		"count_other": "{{count}} selected",
		"moveTo": "Move to…",
		"unassign": "Unassign",
		"clear": "Clear"
	},
	"empty": {
		"title": "No teams yet",
		"description": "Create the first team and its supervisor, then add agents to it."
	},
	"drawer": {
		"title": "New team",
		"description": "A team is led by one supervisor. You can add members now or later from the team's page.",
		"teamSection": "Team",
		"supervisorSection": "Supervisor",
		"teamName": "Team name",
		"targetSize": "Target size",
		"targetSizeHint": "How many agents this team should have. Drives the capacity indicator.",
		"supervisorName": "Supervisor name",
		"supervisorEmail": "Supervisor email",
		"members": "First members",
		"membersHint": "Agents picked here move from their current team.",
		"create": "Create team",
		"validation": {
			"teamName": "Give the team a name",
			"teamNameTaken": "A team with this name already exists",
			"targetSize": "Enter a target of at least 1",
			"supervisorName": "Give the supervisor a name",
			"email": "Enter a valid email"
		}
	},
	"editTeam": {
		"title": "Edit team",
		"name": "Team name",
		"targetSize": "Target size",
		"save": "Save"
	},
	"dissolve": {
		"title": "Dissolve {{team}}?",
		"body_one": "Its {{count}} agent moves to Unassigned. The supervisor is removed.",
		"body_other": "Its {{count}} agents move to Unassigned. The supervisor is removed.",
		"confirm": "Dissolve"
	},
	"discard": {
		"title": "Discard this team?",
		"body": "The details you typed will be lost.",
		"confirm": "Discard"
	},
	"toast": {
		"moved": "{{name}} moved to {{team}}",
		"movedMany": "{{count}} agents moved to {{team}}",
		"created": "Team {{team}} created",
		"updated": "Team {{team}} updated",
		"dissolved": "Team {{team}} dissolved"
	}
}
```

**es**

```json
"teamConfig": {
	"title": "Configuración de equipos",
	"description": "Crea equipos, asigna un supervisor a cada uno y mueve agentes entre ellos.",
	"newTeam": "Nuevo equipo",
	"clearSearch": "Borrar búsqueda",
	"kpis": {
		"teams": "Equipos",
		"agents": "Agentes asignados",
		"unassigned": "Sin asignar",
		"avgSize": "Tamaño medio"
	},
	"rail": {
		"title": "Equipos",
		"search": "Buscar equipos o agentes…",
		"unassigned": "Sin asignar",
		"unassignedHint": "Agentes sin equipo",
		"capacity": "{{count}} / {{target}}",
		"matches_one": "{{count}} agente coincide",
		"matches_other": "{{count}} agentes coinciden",
		"empty": "Ningún equipo ni agente coincide"
	},
	"header": {
		"agents_one": "{{count}} agente",
		"agents_other": "{{count}} agentes",
		"target": "objetivo {{target}}",
		"overBy_one": "{{count}} por encima del objetivo",
		"overBy_other": "{{count}} por encima del objetivo",
		"atTarget": "En el objetivo",
		"openSeats_one": "{{count}} plaza libre",
		"openSeats_other": "{{count}} plazas libres",
		"unassignedHint": "Agentes sin equipo. Muévelos a un equipo desde la lista de abajo.",
		"menu": {
			"label": "Acciones del equipo",
			"editSupervisor": "Editar supervisor",
			"editTeam": "Editar equipo",
			"dissolveTeam": "Disolver equipo"
		}
	},
	"members": {
		"title": "Miembros",
		"addAgents": "Añadir agentes",
		"search": "Buscar por nombre, ID o correo…",
		"shift": "Turno",
		"status": "Estado",
		"all": "Todos",
		"clear": "Limpiar filtros",
		"count_one": "{{count}} agente",
		"count_other": "{{count}} agentes",
		"filteredCount": "{{count}} de {{total}} agentes",
		"empty": "Este equipo aún no tiene agentes. Añádelos o muévelos aquí desde otro equipo.",
		"emptyFiltered": "Ningún agente coincide con estos filtros.",
		"emptyUnassigned": "Todos tienen equipo."
	},
	"columns": {
		"agent": "Agente",
		"shift": "Turno",
		"status": "Estado"
	},
	"row": {
		"moveTo": "Mover a…"
	},
	"selection": {
		"count_one": "{{count}} seleccionado",
		"count_other": "{{count}} seleccionados",
		"moveTo": "Mover a…",
		"unassign": "Desasignar",
		"clear": "Limpiar"
	},
	"empty": {
		"title": "Aún no hay equipos",
		"description": "Crea el primer equipo y su supervisor, y luego añádele agentes."
	},
	"drawer": {
		"title": "Nuevo equipo",
		"description": "Cada equipo lo dirige un supervisor. Puedes añadir miembros ahora o después desde la página del equipo.",
		"teamSection": "Equipo",
		"supervisorSection": "Supervisor",
		"teamName": "Nombre del equipo",
		"targetSize": "Tamaño objetivo",
		"targetSizeHint": "Cuántos agentes debería tener este equipo. Alimenta el indicador de capacidad.",
		"supervisorName": "Nombre del supervisor",
		"supervisorEmail": "Correo del supervisor",
		"members": "Primeros miembros",
		"membersHint": "Los agentes elegidos aquí salen de su equipo actual.",
		"create": "Crear equipo",
		"validation": {
			"teamName": "Ponle un nombre al equipo",
			"teamNameTaken": "Ya existe un equipo con ese nombre",
			"targetSize": "Introduce un objetivo de al menos 1",
			"supervisorName": "Ponle un nombre al supervisor",
			"email": "Introduce un correo válido"
		}
	},
	"editTeam": {
		"title": "Editar equipo",
		"name": "Nombre del equipo",
		"targetSize": "Tamaño objetivo",
		"save": "Guardar"
	},
	"dissolve": {
		"title": "¿Disolver {{team}}?",
		"body_one": "Su {{count}} agente pasa a Sin asignar. El supervisor se elimina.",
		"body_other": "Sus {{count}} agentes pasan a Sin asignar. El supervisor se elimina.",
		"confirm": "Disolver"
	},
	"discard": {
		"title": "¿Descartar este equipo?",
		"body": "Se perderá lo que escribiste.",
		"confirm": "Descartar"
	},
	"toast": {
		"moved": "{{name}} movido a {{team}}",
		"movedMany": "{{count}} agentes movidos a {{team}}",
		"created": "Equipo {{team}} creado",
		"updated": "Equipo {{team}} actualizado",
		"dissolved": "Equipo {{team}} disuelto"
	}
}
```

Removed keys (`teamConfig.search`, `board.*`, `column.*`, `card.*`, `rename.*`, `toast.renamed`) must have no remaining `t('…')` callers after Task 4 — grep `teamConfig.board`, `teamConfig.column`, `teamConfig.card`, `teamConfig.rename`, `toast.renamed` in `src/` → none.

### Task 6 — Checks

- `npm run typecheck` clean.
- Key script: every `t('teamConfig.…')`, `t('status.…')`, `t('shift.…')`, `t('modals.cancel')`, `t('teams.addMembers.…')` used under `TeamConfigPage/**` exists in en and es (plurals via `_one/_other`).
- Greps: `style=` in `TeamConfigPage/**` → none; `@hello-pangea/dnd` in `TeamConfigPage/**` → none; `renameTeam` in `src/` → none; `RenameTeamModal|TeamColumn|AgentCard` in `src/` → none; `teamConfigSeed` imported only by `teamStore.ts`.
- Seed sanity: `node -e` is impractical against TS; instead confirm by reading that `SEEDS` has 47 rows, ids AGT-022..068 with no duplicates, 25 rows for SUP-002, 8/6/5 for SUP-004/005/006 and 3 Unassigned.
- `npx prettier --write` on touched files only; `git status --short` lists only intended files; `git diff --stat src/modules/qa/team/mockData.ts src/modules/qa/team/types.ts` shows a handful of lines, not whole-file EOL churn.

---

## Behaviour summary (demo script)

| Where        | Action                                                       | Result                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OM sidebar   | Organization → Team configuration                            | KPIs 6 · 65 · 3 (amber) · 10.8. Rail: Unassigned 3, Team 1 7/12, Team 2 32/20 (amber bar), Team 3 7/12, Team 4 8/12, Team 5 6/12, Team 6 5/10. Team 1 selected; its header shows "7 agents · target 12 · 5 open seats" and 7 rows. |
| Rail         | Click Team 2                                                 | Header "32 agents · target 20 · 12 over target" (amber badge); table shows 25 rows, pagination "1 2"; names never truncate; status is a dot badge.                                                                                 |
| Toolbar      | Shift = Night, Status = Training                             | Table narrows; count reads "n of 32 agents"; Clear filters appears.                                                                                                                                                                |
| Row          | Hover Andrés Mora → ⇄ → Move to… → Team 5                    | Toast "Andrés Mora moved to Team 5"; row disappears; rail Team 2 31/20, Team 5 7/12.                                                                                                                                               |
| Table        | Tick 5 rows → selection bar "5 selected" → Move to… → Team 6 | Toast "5 agents moved to Team 6"; selection clears; Team 6 10/10 shows a green "At target" badge.                                                                                                                                  |
| Table        | Tick 2 rows → Unassign                                       | Rows go to Unassigned; rail Unassigned badge turns 5 (amber); Unassigned KPI 5.                                                                                                                                                    |
| Rail         | Click Unassigned                                             | Header without menu, hint text; no "Add agents" button; selection bar offers Move to… only (no Unassign).                                                                                                                          |
| Rail search  | "mora"                                                       | Only the team containing Andrés Mora stays, with "1 agent matches".                                                                                                                                                                |
| Header       | Add agents → pick 2 → submit                                 | Existing drawer; rows appear; rail count updates.                                                                                                                                                                                  |
| Header ⋮     | Edit team → target 30                                        | Team 2 becomes 31/30, "1 over target".                                                                                                                                                                                             |
| Header ⋮     | Dissolve team                                                | Red confirm; members go to Unassigned; rail selects Unassigned; KPIs update.                                                                                                                                                       |
| Header       | New team → "Collections B", Rosa Lima, target 8, 2 members   | Drawer validates; the new team appears in the rail and is selected; header "2 agents · target 8 · 6 open seats".                                                                                                                   |
| Width < 62em | Resize                                                       | Rail stacks above the detail; nothing scrolls sideways.                                                                                                                                                                            |
| Dark mode    | Toggle                                                       | Rail selection, selection bar, hover rows and badges keep contrast (all via `light-dark()` / Mantine vars).                                                                                                                        |

## Verification

No dev server and no tests: typecheck, key script and greps from Task 6. Visual check by the user at `/qa/operation-manager/team-config` in light and dark mode, following the demo script above, then the QA Manager's Teams list (now 6 team cards + Unassigned) and a team detail page to confirm the shared store.

## Out of scope

- Drag-and-drop between the table and the rail (would require a custom row list or changes to `BaseTable`).
- Sub-grouping members by shift or status inside a team.
- Making analytics, calls, disputes, coaching, LMS, rankings, the OM dashboard chart and the QA Manager "Your Team" supervisor filter read the extra teams (they use the static 21-agent roster; the filter lists 3 supervisors while the table shows 68 agents).
- Creating or deleting agents, editing an agent's shift or status.
- Persisting the store across reloads.
- Deep-linking the selected team in the URL.

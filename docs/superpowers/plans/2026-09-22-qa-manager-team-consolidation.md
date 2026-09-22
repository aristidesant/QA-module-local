# QA Manager Team Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project override on testing:** per `CLAUDE.md` ("Do not create tests unless explicitly requested") and
> `DESIGN_ROLE.md` (stakeholder-mockup session, no automated testing), **no test-writing steps are included**. Each
> task's verification step is `npx tsc --noEmit -p .` (must stay clean) plus, where noted, a quick manual read of the
> new code. This mirrors how `docs/superpowers/plans/2026-09-21-agent-profile-refresh.md` was executed in this repo.

**Goal:** Replace the QA Manager sidebar's three separate "Supervisors" / "Teams" / "Agents" entries with a single
**Teams** section: a card grid of supervisors, each opening a Team detail page that lists the team's agents and
assigned campaigns, where the QA Manager can assign/remove campaigns, add/remove members, and edit the supervisor.

**Architecture:** New pages live in the existing `src/modules/qa/team/` module (they read/write the same
`TEAM_SUPERVISORS` / `TEAM_AGENTS` / `TEAM_CAMPAIGNS` mock data and the same `useTeamStore` that `YourTeamPage` and
`AgentProfilePage` already use). `useTeamStore` gains `supervisors` (editable copy of `TEAM_SUPERVISORS`) and
`teamCampaignIds` (team → campaign id list) state plus four actions. Agent-profile URLs for the QA Manager become
nested under the team (`/qa/qa-manager/teams/:supervisorId/agents/:agentId`), so every call site that builds that URL
switches from the old `teamBasePath(role) + '/' + agentId` string-concat to a new `agentProfilePath(role, agent)`
helper that needs the agent's `supervisorId`.

**Tech Stack:** React Router v7, Mantine v9 (`MultiSelect`, `Modal`, `modals.openConfirmModal`), Zustand v5,
react-i18next, TanStack Table v8 via `BaseTable`.

**Spec:** This document. Decisions were confirmed with the user in this session (2026-09-22): the QA Manager's
"Agents" cross-team roster page is **removed entirely** (not kept as a tab); the QA Manager can **remove and
add/transfer** team members (removing sends an agent to an "Unassigned" pool, shown as its own card); the agent
profile URL is **nested under the team**; the Teams list is a **cards grid**.

## Global Constraints

- Branch off the current branch tip (`feature/qa-manager-campaign-performance`, which is `main` + the Campaign
  Performance commit) — do **not** branch off `main` directly, so the newest QA Manager dashboard work isn't lost.
  One commit per task.
- Mantine CSS variables / `light-dark()` only for colors — no hardcoded hex, every new component must look correct
  in both dark and light mode (project rule, `CLAUDE.md`).
- No new inline `style={{}}` (pre-commit hook blocks it) — use CSS Modules for anything static (e.g. `cursor:
pointer` on a clickable card).
- Every new UI string goes through i18n, `qa.team` namespace (reuse — do not create a new namespace). Write the same
  keys in both `src/locales/en/qa.team.json` and `src/locales/es/qa.team.json` — never English-only.
- Reuse `SectionCard`, `AppDrawer`, `BaseTable` — do not use Mantine `Drawer` directly, do not invent a new card
  primitive when `Card` (used already, e.g. inside `SectionCard`) does the job.
- `npx tsc --noEmit -p .` must be clean (0 new errors) after every task's edits — the pre-commit hook runs it over
  the **whole project**, so finish all of a task's file edits before staging/committing; never interleave two tasks'
  edits in the working tree at once (this bit a prior session — see `docs/superpowers/plans/2026-09-21-agent-profile-refresh.md`).
- Never build a new array/object inside a Zustand selector body that isn't wrapped — selectors that `.map()`/`.filter()`
  must be written as plain functions (not hooks) passed to `useTeamStore(selector)`, matching the existing
  `selectProfile` / `selectVisibleProfiles` pattern in `src/stores/qa/teamStore.ts`.

---

## File Structure

**New files:**

- `src/modules/qa/team/TeamsListPage/TeamsListPage.tsx` — card grid of supervisors + "Unassigned" card
- `src/modules/qa/team/TeamsListPage/TeamCard.tsx` — one clickable summary card
- `src/modules/qa/team/TeamsListPage/TeamsListPage.module.css` — `.clickableCard` cursor style
- `src/modules/qa/team/TeamsListPage/index.ts` — barrel
- `src/modules/qa/team/TeamDetailPage/TeamDetailPage.tsx` — header, KPI strip, members table, campaigns card
- `src/modules/qa/team/TeamDetailPage/useTeamDetailColumns.tsx` — members table columns (visual columns + Remove action)
- `src/modules/qa/team/TeamDetailPage/AssignCampaignsDrawer.tsx` — `MultiSelect` over `TEAM_CAMPAIGNS`
- `src/modules/qa/team/TeamDetailPage/AddMembersDrawer.tsx` — `MultiSelect` over agents not already in this team
- `src/modules/qa/team/TeamDetailPage/EditSupervisorModal.tsx` — name/email form
- `src/modules/qa/team/TeamDetailPage/TeamDetailPage.module.css` — campaign-chip layout
- `src/modules/qa/team/TeamDetailPage/index.ts` — barrel

**Modified files:**

- `src/modules/qa/team/types.ts` — `RosterSupervisor.email`
- `src/modules/qa/team/mockData.ts` — supervisor emails, `initialTeamCampaignIds()`
- `src/modules/qa/team/constants.ts` — `UNASSIGNED_SUPERVISOR_ID`, `UNASSIGNED_SUPERVISOR`
- `src/modules/qa/team/helpers.ts` — `agentProfilePath`, `teamBasePath` (qa-manager target changes), `teamCardStats`
- `src/stores/qa/teamStore.ts` — `supervisors`, `teamCampaignIds` state + `updateSupervisor`, `setTeamCampaigns`,
  `removeMember`, `addMembers` actions + selectors
- `src/modules/qa/calls/helpers.ts` — `agentProfilePathFor` now takes the agent object, not a bare id
- `src/views/Campaigns/components/CampaignRosterTab.tsx` — pass `r.agent` instead of `r.agent.id`
- `src/modules/qa/triggers/components/ActivityDetailDrawer/ActivityDetailDrawer.tsx` — resolve `supervisorId` before navigating
- `src/modules/qa/lms/LmsManagerPage/LmsManagerPage.tsx` — same
- `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx` — same
- `src/modules/qa/team/AgentProfilePage/AgentProfilePage.tsx` — 3-level breadcrumb for `qa-manager`
- `src/components/Sidebar/roleNavigation.tsx` — remove `qamanager-supervisors`/`qamanager-agents`, repoint `qamanager-teams`
- `src/routes.tsx` — new/removed routes + redirects + lazy imports
- `src/modules/qa/qaNamespaces.ts` — namespace map updates
- `src/locales/en/qa.team.json`, `src/locales/es/qa.team.json` — new `teams` block

**Deleted files:**

- `src/modules/qa/qamanager/pages/SupervisorsPage.tsx`
- `src/modules/qa/qamanager/pages/TeamsPage.tsx`

---

### Task 0: Branch setup

**Files:** none (git only)

- [ ] **Step 1: Create the branch off the current tip**

```bash
git checkout -b feature/qa-manager-team-consolidation
```

(Run this from `feature/qa-manager-campaign-performance` — confirm with `git log --oneline -1` that HEAD is
`19a28a28 feat(qa-dashboard): swap QA Manager's Burnout Risk widget for Campaign Performance` before branching.)

---

### Task 1: Data layer — types, mock data, constants

**Files:**

- Modify: `src/modules/qa/team/types.ts`
- Modify: `src/modules/qa/team/mockData.ts`
- Modify: `src/modules/qa/team/constants.ts`

**Interfaces:**

- Produces: `RosterSupervisor.email: string` (used by `EditSupervisorModal`, `TeamDetailPage` header); `initialTeamCampaignIds(): Record<string, string[]>` (consumed by Task 2's `teamStore`); `UNASSIGNED_SUPERVISOR_ID: string`, `UNASSIGNED_SUPERVISOR: RosterSupervisor` (consumed by Task 2's store and Task 3/4 pages).

- [ ] **Step 1: Add `email` to `RosterSupervisor`**

In `src/modules/qa/team/types.ts`, change:

```ts
export interface RosterSupervisor {
	id: string;
	name: string;
	team: string;
}
```

to:

```ts
export interface RosterSupervisor {
	id: string;
	name: string;
	team: string;
	email: string;
}
```

- [ ] **Step 2: Add emails to `TEAM_SUPERVISORS` and a team-campaigns derivation helper**

In `src/modules/qa/team/mockData.ts`, change:

```ts
export const TEAM_SUPERVISORS: RosterSupervisor[] = [
	{ id: 'SUP-001', name: 'Maria García', team: 'Team 1' },
	{ id: 'SUP-002', name: 'Juan Pérez', team: 'Team 2' },
	{ id: 'SUP-003', name: 'Laura Gómez', team: 'Team 3' },
];
```

to:

```ts
export const TEAM_SUPERVISORS: RosterSupervisor[] = [
	{
		id: 'SUP-001',
		name: 'Maria García',
		team: 'Team 1',
		email: 'maria.garcia@newtech.com',
	},
	{
		id: 'SUP-002',
		name: 'Juan Pérez',
		team: 'Team 2',
		email: 'juan.perez@newtech.com',
	},
	{
		id: 'SUP-003',
		name: 'Laura Gómez',
		team: 'Team 3',
		email: 'laura.gomez@newtech.com',
	},
];
```

Then, at the very end of the file (after `export const TEAM_PROFILES = buildAll();`), add:

```ts
/** Union of campaign ids across a team's current agents — the seed for the editable `teamCampaignIds` store state. */
export const initialTeamCampaignIds = (): Record<string, string[]> => {
	const map: Record<string, string[]> = {};
	for (const sup of TEAM_SUPERVISORS) {
		const ids = new Set<string>();
		TEAM_AGENTS.filter((a) => a.supervisorId === sup.id).forEach((a) =>
			a.campaignIds.forEach((id) => ids.add(id))
		);
		map[sup.id] = [...ids];
	}
	return map;
};
```

- [ ] **Step 3: Add the "Unassigned" pseudo-supervisor constant**

In `src/modules/qa/team/constants.ts`, add near `SUPERVISOR_PERSONA`/`QA_MANAGER_PERSONA` (after line 35):

```ts
/** Pseudo-team for agents removed from a real team; not part of TEAM_SUPERVISORS. */
export const UNASSIGNED_SUPERVISOR_ID = 'UNASSIGNED';
export const UNASSIGNED_SUPERVISOR: RosterSupervisor = {
	id: UNASSIGNED_SUPERVISOR_ID,
	name: 'Unassigned',
	team: 'Unassigned',
	email: '',
};
```

This needs `RosterSupervisor` imported — add it to the existing type-only import block at the top of the file (it
currently imports `Emotion, SentimentCategory` from `emotion-sentiment/types` and other types from `./types`; add
`RosterSupervisor` to the `./types` import list — check the existing `import type { ... } from './types';` block and
append `RosterSupervisor` to it).

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit -p .
```

Expected: clean (0 errors). `RosterSupervisor` now requires `email` everywhere it's constructed — the only
construction sites are `TEAM_SUPERVISORS` (fixed in Step 2) and `UNASSIGNED_SUPERVISOR` (fixed in Step 3), so no
other file should break.

- [ ] **Step 5: Commit**

```bash
git add src/modules/qa/team/types.ts src/modules/qa/team/mockData.ts src/modules/qa/team/constants.ts
git commit -m "feat(qa-team): add supervisor email, unassigned pseudo-team, team-campaigns seed"
```

---

### Task 2: `teamStore` — team management state and actions

**Files:**

- Modify: `src/stores/qa/teamStore.ts`

**Interfaces:**

- Consumes: `RosterSupervisor` (Task 1), `initialTeamCampaignIds` (Task 1), `UNASSIGNED_SUPERVISOR_ID`,
  `UNASSIGNED_SUPERVISOR` (Task 1), `TEAM_SUPERVISORS` (existing).
- Produces: `useTeamStore` state fields `supervisors: Record<string, RosterSupervisor>`,
  `teamCampaignIds: Record<string, string[]>`; actions `updateSupervisor(id, patch)`, `setTeamCampaigns(supervisorId,
campaignIds)`, `removeMember(agentId)`, `addMembers(agentIds, supervisorId)`; selectors `selectSupervisors`,
  `selectSupervisor(id)`, `selectTeamCampaignIds(supervisorId)`, `selectTeamAgents(supervisorId)`,
  `selectUnassignedAgents`. These are consumed by Tasks 3, 4, 5, 6, 7 and by `AgentProfilePage` (Task 9).

- [ ] **Step 1: Import the new Task 1 exports**

In `src/stores/qa/teamStore.ts`, extend the existing imports:

```ts
import { TEAM_PROFILES } from '~/modules/qa/team/mockData';
import {
	NOW_ISO,
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
```

to:

```ts
import {
	TEAM_PROFILES,
	TEAM_SUPERVISORS,
	initialTeamCampaignIds,
} from '~/modules/qa/team/mockData';
import {
	NOW_ISO,
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
	UNASSIGNED_SUPERVISOR,
	UNASSIGNED_SUPERVISOR_ID,
} from '~/modules/qa/team/constants';
import type { RosterSupervisor } from '~/modules/qa/team/types';
```

- [ ] **Step 2: Extend `TeamState`**

Change:

```ts
interface TeamState {
	profiles: Record<string, AgentProfile>;
	scheduleCoaching: (
		input: ScheduleCoachingInput,
		role: TeamRole
	) => CoachingSession;
	assignLms: (input: AssignLmsInput, role: TeamRole) => LmsAssignment;
	sendMessage: (input: SendMessageInput, role: TeamRole) => void;
	addNote: (agentId: string, text: string, role: TeamRole) => SupervisorNote;
	togglePinNote: (agentId: string, noteId: string) => void;
	acknowledgeAlert: (agentId: string, alertId: string) => void;
}
```

to:

```ts
interface TeamState {
	profiles: Record<string, AgentProfile>;
	supervisors: Record<string, RosterSupervisor>;
	teamCampaignIds: Record<string, string[]>;
	scheduleCoaching: (
		input: ScheduleCoachingInput,
		role: TeamRole
	) => CoachingSession;
	assignLms: (input: AssignLmsInput, role: TeamRole) => LmsAssignment;
	sendMessage: (input: SendMessageInput, role: TeamRole) => void;
	addNote: (agentId: string, text: string, role: TeamRole) => SupervisorNote;
	togglePinNote: (agentId: string, noteId: string) => void;
	acknowledgeAlert: (agentId: string, alertId: string) => void;
	updateSupervisor: (
		id: string,
		patch: Partial<Pick<RosterSupervisor, 'name' | 'email'>>
	) => void;
	setTeamCampaigns: (supervisorId: string, campaignIds: string[]) => void;
	removeMember: (agentId: string) => void;
	addMembers: (agentIds: string[], supervisorId: string) => void;
}
```

- [ ] **Step 3: Seed the new state**

Change:

```ts
export const useTeamStore = create<TeamState>((set, get) => ({
	profiles: TEAM_PROFILES,
```

to:

```ts
export const useTeamStore = create<TeamState>((set, get) => ({
	profiles: TEAM_PROFILES,
	supervisors: Object.fromEntries(TEAM_SUPERVISORS.map((s) => [s.id, s])),
	teamCampaignIds: initialTeamCampaignIds(),
```

- [ ] **Step 4: Add the four actions**

Add these after `acknowledgeAlert` (i.e. right before the closing `}));` of the `create<TeamState>(...)` call):

```ts

	updateSupervisor: (id, patch) =>
		set((s) => ({
			supervisors: {
				...s.supervisors,
				[id]: { ...s.supervisors[id], ...patch },
			},
		})),

	setTeamCampaigns: (supervisorId, campaignIds) =>
		set((s) => ({
			teamCampaignIds: { ...s.teamCampaignIds, [supervisorId]: campaignIds },
		})),

	/** Moves the agent to the Unassigned pool; keeps their profile and history intact. */
	removeMember: (agentId) =>
		set((s) => {
			const p = s.profiles[agentId];
			return {
				profiles: {
					...s.profiles,
					[agentId]: {
						...p,
						agent: {
							...p.agent,
							supervisorId: UNASSIGNED_SUPERVISOR_ID,
							supervisorName: UNASSIGNED_SUPERVISOR.name,
							team: UNASSIGNED_SUPERVISOR.team,
						},
					},
				},
			};
		}),

	/** Adds (or transfers) agents into a team; reads the supervisor's current name/team from `supervisors` so edits stay in sync. */
	addMembers: (agentIds, supervisorId) =>
		set((s) => {
			const sup = s.supervisors[supervisorId] ?? UNASSIGNED_SUPERVISOR;
			const profiles = { ...s.profiles };
			for (const agentId of agentIds) {
				const p = profiles[agentId];
				profiles[agentId] = {
					...p,
					agent: {
						...p.agent,
						supervisorId: sup.id,
						supervisorName: sup.name,
						team: sup.team,
					},
				};
			}
			return { profiles };
		}),
```

- [ ] **Step 5: Add selectors**

At the bottom of the file, after the existing `selectProfile`/`selectVisibleProfiles` exports, add:

```ts
export const selectSupervisors = (s: TeamState) => s.supervisors;
export const selectSupervisor = (id: string) => (s: TeamState) =>
	s.supervisors[id];
export const selectTeamCampaignIds = (supervisorId: string) => (s: TeamState) =>
	s.teamCampaignIds[supervisorId] ?? [];
export const selectTeamAgents = (supervisorId: string) => (s: TeamState) =>
	Object.values(s.profiles)
		.map((p) => p.agent)
		.filter((a) => a.supervisorId === supervisorId);
export const selectUnassignedAgents = (s: TeamState) =>
	Object.values(s.profiles)
		.map((p) => p.agent)
		.filter((a) => a.supervisorId === UNASSIGNED_SUPERVISOR_ID);
```

- [ ] **Step 6: Typecheck**

```bash
npx tsc --noEmit -p .
```

Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/stores/qa/teamStore.ts
git commit -m "feat(qa-team): add team management state (supervisors, campaigns, members) to teamStore"
```

---

### Task 3: `agentProfilePath` helper + `teamBasePath` repoint + `teamCardStats`

**Files:**

- Modify: `src/modules/qa/team/helpers.ts`

**Interfaces:**

- Consumes: `TeamTableRow`, `toTableRow`, `teamKpis`, `isAtRisk` (existing, same file), `AgentProfile`,
  `RosterAgent` (Task 1's `types.ts`, unchanged shape aside from `RosterSupervisor`).
- Produces: `agentProfilePath(role, agent)`, updated `teamBasePath(role)`, `teamCardStats(supervisorId, profiles)`.
  Consumed by Task 4 (`TeamsListPage`), Task 5 (`TeamDetailPage`), Task 9 (`AgentProfilePage` and the four other
  call-site fixes), and `src/modules/qa/calls/helpers.ts`.

- [ ] **Step 1: Repoint `teamBasePath` for `qa-manager` and add `agentProfilePath`**

Change:

```ts
export const roleFromPath = (pathname: string): TeamRole =>
	pathname.startsWith('/qa/qa-manager') ? 'qa-manager' : 'supervisor';
export const teamBasePath = (role: TeamRole) =>
	role === 'qa-manager' ? '/qa/qa-manager/agents' : '/qa/supervisor/your-team';
```

to:

```ts
export const roleFromPath = (pathname: string): TeamRole =>
	pathname.startsWith('/qa/qa-manager') ? 'qa-manager' : 'supervisor';
/** Where "back" goes: the Teams list for QA Manager (agents no longer have a standalone list), Your Team for Supervisor. */
export const teamBasePath = (role: TeamRole) =>
	role === 'qa-manager' ? '/qa/qa-manager/teams' : '/qa/supervisor/your-team';
/** The agent-profile URL for a given role. QA Manager profiles are nested under their team. */
export const agentProfilePath = (
	role: TeamRole,
	agent: Pick<RosterAgent, 'id' | 'supervisorId'>
) =>
	role === 'qa-manager'
		? `/qa/qa-manager/teams/${agent.supervisorId}/agents/${agent.id}`
		: `/qa/supervisor/your-team/${agent.id}`;
```

This needs `RosterAgent` in the top `import type { ... } from './types';` block — add it there.

- [ ] **Step 2: Add `teamCardStats`**

Add at the end of the file:

```ts
/** Summary numbers for one Teams-list card: member count, average overall score, at-risk count. */
export const teamCardStats = (
	supervisorId: string,
	profiles: Record<string, AgentProfile>
) => {
	const rows = Object.values(profiles)
		.filter((p) => p.agent.supervisorId === supervisorId)
		.map(toTableRow);
	return {
		memberCount: rows.length,
		averageOverall: rows.length
			? Math.round(rows.reduce((s, r) => s + r.overall, 0) / rows.length)
			: 0,
		atRisk: rows.filter(isAtRisk).length,
	};
};
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit -p .
```

Expected: **errors** at every call site that used the old `teamBasePath(role) + '/' + agentId` concatenation pattern
and at `src/modules/qa/calls/helpers.ts`'s `agentProfilePathFor` (its return type is now wrong relative to
`agentProfilePath`, though it won't error yet since it doesn't call the new helper — that's Task 9). This step is
just to confirm `agentProfilePath`/`teamCardStats`/`teamBasePath` themselves compile; the call-site fixes are Task 9.
Confirm no errors are reported _inside `helpers.ts` itself_; pre-existing/expected errors elsewhere from the
`teamBasePath` signature-compatible-but-semantically-changed usage are fine to leave for Task 9 (the string
concatenation still compiles — TypeScript doesn't know the route no longer matches — so in practice this step should
still show 0 _new_ type errors; only Task 9 fixes the routes actually working correctly at runtime).

- [ ] **Step 4: Commit**

```bash
git add src/modules/qa/team/helpers.ts
git commit -m "feat(qa-team): add agentProfilePath and teamCardStats helpers, repoint teamBasePath for qa-manager"
```

---

### Task 4: `TeamsListPage` — card grid

**Files:**

- Create: `src/modules/qa/team/TeamsListPage/TeamsListPage.tsx`
- Create: `src/modules/qa/team/TeamsListPage/TeamCard.tsx`
- Create: `src/modules/qa/team/TeamsListPage/TeamsListPage.module.css`
- Create: `src/modules/qa/team/TeamsListPage/index.ts`
- Modify: `src/locales/en/qa.team.json`, `src/locales/es/qa.team.json`

**Interfaces:**

- Consumes: `useTeamStore` + `selectSupervisors`, `selectUnassignedAgents` (Task 2); `teamCardStats` (Task 3);
  `TEAM_CAMPAIGNS` (existing `mockData.ts`); `teamCampaignIds` state (Task 2).
- Produces: default export `TeamsListPage`, routed at `qa.qa-manager.teams` in Task 9.

- [ ] **Step 1: `TeamsListPage.module.css`**

```css
.clickableCard {
	cursor: pointer;
}
.clickableCard:hover {
	border-color: var(--mantine-color-blue-5);
}
```

- [ ] **Step 2: `TeamCard.tsx`**

```tsx
import { Avatar, Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RosterSupervisor } from '../types';
import { getScoreColor } from '../helpers';
import styles from './TeamsListPage.module.css';

interface TeamCardProps {
	supervisor: RosterSupervisor;
	memberCount: number;
	averageOverall: number;
	atRisk: number;
	campaignNames: string[];
	onClick: () => void;
}

export function TeamCard({
	supervisor,
	memberCount,
	averageOverall,
	atRisk,
	campaignNames,
	onClick,
}: TeamCardProps) {
	const { t } = useTranslation('qa.team');

	return (
		<Card
			withBorder
			padding='lg'
			radius='md'
			className={styles.clickableCard}
			onClick={onClick}
		>
			<Group justify='space-between' align='flex-start' wrap='nowrap'>
				<Group gap='sm' wrap='nowrap'>
					<Avatar name={supervisor.name} radius='xl' size='md' />
					<Stack gap={0}>
						<Title order={5}>{supervisor.team}</Title>
						<Text size='sm' c='dimmed'>
							{supervisor.name}
						</Text>
					</Stack>
				</Group>
				{memberCount > 0 && (
					<Badge
						size='lg'
						variant='filled'
						color={getScoreColor(averageOverall)}
					>
						{averageOverall}
					</Badge>
				)}
			</Group>
			<Group gap='xs' mt='md'>
				<Badge variant='light'>
					{t('teams.list.membersCount', { count: memberCount })}
				</Badge>
				{atRisk > 0 && (
					<Badge variant='light' color='red'>
						{t('teams.list.atRisk', { count: atRisk })}
					</Badge>
				)}
			</Group>
			{campaignNames.length > 0 && (
				<Group gap={6} mt='sm'>
					{campaignNames.map((name) => (
						<Badge key={name} variant='outline' size='xs'>
							{name}
						</Badge>
					))}
				</Group>
			)}
		</Card>
	);
}
```

- [ ] **Step 3: `TeamsListPage.tsx`**

```tsx
import { SimpleGrid } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import {
	useTeamStore,
	selectSupervisors,
	selectUnassignedAgents,
} from '~/stores/qa/teamStore';
import { TEAM_CAMPAIGNS } from '../mockData';
import { UNASSIGNED_SUPERVISOR } from '../constants';
import { teamCardStats } from '../helpers';
import { TeamCard } from './TeamCard';

export default function TeamsListPage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const supervisors = useTeamStore(selectSupervisors);
	const teamCampaignIds = useTeamStore((s) => s.teamCampaignIds);
	const profiles = useTeamStore((s) => s.profiles);
	const unassignedAgents = useTeamStore(selectUnassignedAgents);

	const campaignNamesFor = (supervisorId: string) =>
		(teamCampaignIds[supervisorId] ?? [])
			.map((id) => TEAM_CAMPAIGNS.find((c) => c.id === id)?.name)
			.filter((n): n is string => Boolean(n));

	return (
		<ContentContainer
			contentWidth='full'
			title={t('teams.list.title')}
			description={t('teams.list.description')}
		>
			<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='md'>
				{Object.values(supervisors).map((supervisor) => {
					const stats = teamCardStats(supervisor.id, profiles);
					return (
						<TeamCard
							key={supervisor.id}
							supervisor={supervisor}
							memberCount={stats.memberCount}
							averageOverall={stats.averageOverall}
							atRisk={stats.atRisk}
							campaignNames={campaignNamesFor(supervisor.id)}
							onClick={() => navigate(`/qa/qa-manager/teams/${supervisor.id}`)}
						/>
					);
				})}
				{unassignedAgents.length > 0 && (
					<TeamCard
						supervisor={UNASSIGNED_SUPERVISOR}
						memberCount={unassignedAgents.length}
						averageOverall={0}
						atRisk={0}
						campaignNames={[]}
						onClick={() =>
							navigate(`/qa/qa-manager/teams/${UNASSIGNED_SUPERVISOR.id}`)
						}
					/>
				)}
			</SimpleGrid>
		</ContentContainer>
	);
}
```

- [ ] **Step 4: `index.ts`**

```ts
export { default } from './TeamsListPage';
```

- [ ] **Step 5: i18n — add the `teams` block**

In `src/locales/en/qa.team.json`, add a new top-level `"teams"` key (after the closing brace of `"team"` at line 13,
i.e. right before `"status": { ... }`):

```json
	"teams": {
		"list": {
			"title": "Teams",
			"description": "Supervisors, their agents and the campaigns each team runs.",
			"membersCount": "{{count}} members",
			"atRisk": "{{count}} at risk"
		},
		"detail": {
			"back": "Back to teams",
			"membersTitle": "Members",
			"membersDescription": "Agents assigned to this team",
			"addMembers": "Add members",
			"removeMember": "Remove from team",
			"removeMemberConfirmTitle": "Remove from team",
			"removeMemberConfirmBody": "{{name}} will be moved to Unassigned. You can add them to a team again at any time.",
			"editSupervisor": "Edit supervisor",
			"campaignsTitle": "Campaigns",
			"campaignsDescription": "Campaigns this team is running",
			"assignCampaigns": "Assign campaigns",
			"removeCampaign": "Remove",
			"emptyCampaigns": "No campaigns assigned to this team yet.",
			"emptyMembers": "No agents in this team yet."
		},
		"addMembers": {
			"title": "Add members",
			"source": "Agents",
			"sourceHint": "Unassigned agents and agents from other teams",
			"submit": "Add",
			"success": "{{count}} member(s) added to {{team}}.",
			"validationEmpty": "Select at least one agent."
		},
		"assignCampaigns": {
			"title": "Assign campaigns",
			"campaigns": "Campaigns",
			"submit": "Assign",
			"success": "Campaigns updated for {{team}}."
		},
		"editSupervisor": {
			"title": "Edit supervisor",
			"name": "Name",
			"email": "Email",
			"submit": "Save",
			"success": "Supervisor updated.",
			"validationName": "Name is required."
		}
	},
```

In `src/locales/es/qa.team.json`, add the identical structure with translated values, in the same position (right
before `"status": { ... }`):

```json
	"teams": {
		"list": {
			"title": "Equipos",
			"description": "Supervisores, sus agentes y las campañas que ejecuta cada equipo.",
			"membersCount": "{{count}} miembros",
			"atRisk": "{{count}} en riesgo"
		},
		"detail": {
			"back": "Volver a equipos",
			"membersTitle": "Miembros",
			"membersDescription": "Agentes asignados a este equipo",
			"addMembers": "Añadir miembros",
			"removeMember": "Quitar del equipo",
			"removeMemberConfirmTitle": "Quitar del equipo",
			"removeMemberConfirmBody": "{{name}} pasará a Sin asignar. Puedes volver a añadirlo a un equipo en cualquier momento.",
			"editSupervisor": "Editar supervisor",
			"campaignsTitle": "Campañas",
			"campaignsDescription": "Campañas que ejecuta este equipo",
			"assignCampaigns": "Asignar campañas",
			"removeCampaign": "Quitar",
			"emptyCampaigns": "Este equipo todavía no tiene campañas asignadas.",
			"emptyMembers": "Este equipo todavía no tiene agentes."
		},
		"addMembers": {
			"title": "Añadir miembros",
			"source": "Agentes",
			"sourceHint": "Agentes sin asignar y agentes de otros equipos",
			"submit": "Añadir",
			"success": "{{count}} miembro(s) añadidos a {{team}}.",
			"validationEmpty": "Selecciona al menos un agente."
		},
		"assignCampaigns": {
			"title": "Asignar campañas",
			"campaigns": "Campañas",
			"submit": "Asignar",
			"success": "Campañas actualizadas para {{team}}."
		},
		"editSupervisor": {
			"title": "Editar supervisor",
			"name": "Nombre",
			"email": "Correo",
			"submit": "Guardar",
			"success": "Supervisor actualizado.",
			"validationName": "El nombre es obligatorio."
		}
	},
```

- [ ] **Step 6: Typecheck**

```bash
npx tsc --noEmit -p .
```

Expected: clean (this page isn't routed yet, but it must still compile standalone).

- [ ] **Step 7: Commit**

```bash
git add src/modules/qa/team/TeamsListPage src/locales/en/qa.team.json src/locales/es/qa.team.json
git commit -m "feat(qa-team): add TeamsListPage card grid"
```

---

### Task 5: `TeamDetailPage` shell — header, KPIs, members table, campaigns card

**Files:**

- Create: `src/modules/qa/team/TeamDetailPage/TeamDetailPage.tsx`
- Create: `src/modules/qa/team/TeamDetailPage/useTeamDetailColumns.tsx`
- Create: `src/modules/qa/team/TeamDetailPage/TeamDetailPage.module.css`
- Create: `src/modules/qa/team/TeamDetailPage/index.ts`

**Interfaces:**

- Consumes: `useTeamStore` + `selectSupervisor`, `selectTeamAgents`, `selectTeamCampaignIds` (Task 2);
  `agentProfilePath`, `teamBasePath`, `toTableRow`, `teamKpis` (Task 3 / existing `helpers.ts`); `TeamKpiStrip`
  (existing, `../YourTeamPage/TeamKpiStrip`); `TEAM_CAMPAIGNS` (existing `mockData.ts`); `AssignCampaignsDrawer`,
  `AddMembersDrawer`, `EditSupervisorModal` (Tasks 6/7/8, imported here but this task can render the page with those
  three components' opened state wired to `false` placeholders first — see Step 6 note).
- Produces: default export `TeamDetailPage`, routed at `qa.qa-manager.teams.detail` in Task 9. Renders three drawers/
  modal built in Tasks 6-8 by import path, so this task's typecheck will only go green once Tasks 6-8 exist — build
  Tasks 5-8 back-to-back before typechecking/committing Task 5 (or stub the three components first — see Step 6).

- [ ] **Step 1: `TeamDetailPage.module.css`**

```css
.campaignChip {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
```

- [ ] **Step 2: `useTeamDetailColumns.tsx`**

Members table columns: same visual columns as `YourTeamPage`'s roster (name, status, overall, qa, sentiment,
compliance, burnout) minus the `team`/`supervisor` column (redundant on a single-team page) plus a trailing "Remove"
action column.

```tsx
import { createColumnHelper } from '@tanstack/react-table';
import {
	ActionIcon,
	Avatar,
	Badge,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconTrash,
	IconTrendingDown,
	IconTrendingUp,
	IconMinus,
} from '@tabler/icons-react';
import type { TFunction } from 'i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { AgentProfile, TeamTableRow } from '../types';
import {
	formatSeconds,
	getScoreColor,
	sentimentColor,
	trendColor,
} from '../helpers';

const STATUS_COLOR: Record<TeamTableRow['status'], string> = {
	active: 'green',
	'on-leave': 'gray',
	training: 'blue',
};
const BURNOUT_COLOR: Record<TeamTableRow['burnoutLevel'], string> = {
	low: 'green',
	medium: 'yellow',
	high: 'red',
};

const helper = createColumnHelper<TeamTableRow>();

export function useTeamDetailColumns(
	profiles: Record<string, AgentProfile>,
	t: TFunction<'qa.team'>,
	onRemove: (agentId: string) => void
): BaseTableColumnDef<TeamTableRow>[] {
	return [
		helper.accessor('name', {
			header: t('team.columns.agent'),
			cell: (info) => {
				const row = info.row.original;
				const profile = profiles[row.id];
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar
							name={row.name}
							color={profile?.agent.avatarColor}
							radius='xl'
							size='sm'
						/>
						<Stack gap={0}>
							<Text size='sm' fw={600}>
								{row.name}
							</Text>
							<Text size='xs' c='dimmed'>
								{row.id}
							</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('status', {
			header: t('team.columns.status'),
			cell: (info) => (
				<Badge variant='light' color={STATUS_COLOR[info.getValue()]}>
					{t(`status.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('overall', {
			header: t('team.columns.overall'),
			cell: (info) => {
				const row = info.row.original;
				const Icon =
					row.overallTrend === 'up'
						? IconTrendingUp
						: row.overallTrend === 'down'
							? IconTrendingDown
							: IconMinus;
				return (
					<Group gap={6} wrap='nowrap'>
						<Badge
							size='lg'
							variant='filled'
							color={getScoreColor(info.getValue())}
						>
							{info.getValue()}
						</Badge>
						<Icon
							size={14}
							color={`var(--mantine-color-${trendColor(row.overallTrend)}-6)`}
						/>
					</Group>
				);
			},
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('qa', {
			header: t('team.columns.qa'),
			cell: (info) => (
				<Text size='sm' c={getScoreColor(info.getValue())} fw={600}>
					{info.getValue()}%
				</Text>
			),
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('sentiment', {
			header: t('team.columns.sentiment'),
			cell: (info) => (
				<Text size='sm' c={sentimentColor(info.getValue())} fw={600}>
					{info.getValue().toFixed(1)}/5
				</Text>
			),
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('compliance', {
			header: t('team.columns.compliance'),
			cell: (info) => (
				<Text size='sm' c={getScoreColor(info.getValue())} fw={600}>
					{info.getValue()}%
				</Text>
			),
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('ahtSeconds', {
			header: t('team.columns.aht'),
			cell: (info) => <Text size='sm'>{formatSeconds(info.getValue())}</Text>,
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('burnoutLevel', {
			header: t('team.columns.burnout'),
			cell: (info) => (
				<Badge variant='dot' color={BURNOUT_COLOR[info.getValue()]}>
					{t(`burnout.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.display({
			id: 'actions',
			header: '',
			cell: (info) => (
				<Group gap={4} justify='flex-end' onClick={(e) => e.stopPropagation()}>
					<Tooltip label={t('teams.detail.removeMember')}>
						<ActionIcon
							variant='subtle'
							color='red'
							onClick={() => onRemove(info.row.original.id)}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			),
		}) as BaseTableColumnDef<TeamTableRow>,
	];
}
```

- [ ] **Step 3: `TeamDetailPage.tsx`**

```tsx
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { modals } from '@mantine/modals';
import {
	ActionIcon,
	Anchor,
	Avatar,
	Badge,
	Breadcrumbs,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconEdit, IconPlus, IconX } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import BaseTable from '~/components/BaseTable/BaseTable';
import {
	useTeamStore,
	selectSupervisor,
	selectTeamAgents,
	selectTeamCampaignIds,
} from '~/stores/qa/teamStore';
import { TEAM_CAMPAIGNS } from '../mockData';
import type { TeamTableRow } from '../types';
import {
	agentProfilePath,
	teamBasePath,
	toTableRow,
	teamKpis,
} from '../helpers';
import { TeamKpiStrip } from '../YourTeamPage/TeamKpiStrip';
import { useTeamDetailColumns } from './useTeamDetailColumns';
import { AssignCampaignsDrawer } from './AssignCampaignsDrawer';
import { AddMembersDrawer } from './AddMembersDrawer';
import { EditSupervisorModal } from './EditSupervisorModal';
import styles from './TeamDetailPage.module.css';

export default function TeamDetailPage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const { supervisorId } = useParams<{ supervisorId: string }>();
	const supervisor = useTeamStore(selectSupervisor(supervisorId ?? ''));
	const agents = useTeamStore(selectTeamAgents(supervisorId ?? ''));
	const campaignIds = useTeamStore(selectTeamCampaignIds(supervisorId ?? ''));
	const profiles = useTeamStore((s) => s.profiles);
	const removeMemberAction = useTeamStore((s) => s.removeMember);
	const setTeamCampaigns = useTeamStore((s) => s.setTeamCampaigns);

	const [assignCampaignsOpen, setAssignCampaignsOpen] = useState(false);
	const [addMembersOpen, setAddMembersOpen] = useState(false);
	const [editSupervisorOpen, setEditSupervisorOpen] = useState(false);

	const rows = useMemo(
		() =>
			agents
				.map((a) => toTableRow(profiles[a.id]))
				.filter((r): r is TeamTableRow => Boolean(r)),
		[agents, profiles]
	);
	const kpis = teamKpis(rows);

	const handleRemove = (agentId: string) => {
		const agent = profiles[agentId]?.agent;
		if (!agent) return;
		modals.openConfirmModal({
			title: t('teams.detail.removeMemberConfirmTitle'),
			children: (
				<Text size='sm'>
					{t('teams.detail.removeMemberConfirmBody', { name: agent.name })}
				</Text>
			),
			labels: {
				confirm: t('teams.detail.removeMember'),
				cancel: t('modals.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => removeMemberAction(agentId),
		});
	};

	const columns = useTeamDetailColumns(profiles, t, handleRemove);

	if (!supervisor) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('common.notFound')}
					description={t('common.notFoundDescription', { id: supervisorId })}
					action={
						<Button onClick={() => navigate(teamBasePath('qa-manager'))}>
							{t('teams.detail.back')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(teamBasePath('qa-manager'))}
		>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor onClick={() => navigate(teamBasePath('qa-manager'))}>
						{t('teams.list.title')}
					</Anchor>
					<Text c='dimmed'>{supervisor.team}</Text>
				</Breadcrumbs>

				<SectionCard padding='lg'>
					<Group justify='space-between' align='flex-start' wrap='wrap'>
						<Group gap='md'>
							<Avatar size={56} radius='md' name={supervisor.name} />
							<Stack gap={0}>
								<Title order={3}>{supervisor.team}</Title>
								<Text size='sm' c='dimmed'>
									{supervisor.name} · {supervisor.email}
								</Text>
							</Stack>
						</Group>
						<Button
							variant='light'
							leftSection={<IconEdit size={16} />}
							onClick={() => setEditSupervisorOpen(true)}
						>
							{t('teams.detail.editSupervisor')}
						</Button>
					</Group>
				</SectionCard>

				<TeamKpiStrip kpis={kpis} />

				<SectionCard
					title={t('teams.detail.membersTitle')}
					description={t('teams.detail.membersDescription')}
					headerActions={
						<Button
							size='xs'
							variant='light'
							leftSection={<IconPlus size={14} />}
							onClick={() => setAddMembersOpen(true)}
						>
							{t('teams.detail.addMembers')}
						</Button>
					}
				>
					<BaseTable<TeamTableRow>
						data={rows}
						columns={columns}
						getRowId={(r) => r.id}
						initialSort={[{ id: 'overall', desc: true }]}
						density='compact'
						emptyMessage={t('teams.detail.emptyMembers')}
						onRowClick={(r) =>
							navigate(
								agentProfilePath('qa-manager', {
									id: r.id,
									supervisorId: supervisor.id,
								})
							)
						}
					/>
				</SectionCard>

				<SectionCard
					title={t('teams.detail.campaignsTitle')}
					description={t('teams.detail.campaignsDescription')}
					headerActions={
						<Button
							size='xs'
							variant='light'
							leftSection={<IconPlus size={14} />}
							onClick={() => setAssignCampaignsOpen(true)}
						>
							{t('teams.detail.assignCampaigns')}
						</Button>
					}
				>
					{campaignIds.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('teams.detail.emptyCampaigns')}
						</Text>
					) : (
						<Group gap='xs'>
							{campaignIds.map((id) => {
								const campaign = TEAM_CAMPAIGNS.find((c) => c.id === id);
								if (!campaign) return null;
								return (
									<Badge
										key={id}
										variant='light'
										size='lg'
										className={styles.campaignChip}
									>
										{campaign.name}
										<ActionIcon
											size='xs'
											variant='transparent'
											color='gray'
											aria-label={t('teams.detail.removeCampaign')}
											onClick={() =>
												setTeamCampaigns(
													supervisor.id,
													campaignIds.filter((c) => c !== id)
												)
											}
										>
											<IconX size={12} />
										</ActionIcon>
									</Badge>
								);
							})}
						</Group>
					)}
				</SectionCard>
			</Stack>

			<AssignCampaignsDrawer
				opened={assignCampaignsOpen}
				onClose={() => setAssignCampaignsOpen(false)}
				supervisorId={supervisor.id}
				teamName={supervisor.team}
				currentCampaignIds={campaignIds}
			/>
			<AddMembersDrawer
				opened={addMembersOpen}
				onClose={() => setAddMembersOpen(false)}
				supervisorId={supervisor.id}
				teamName={supervisor.team}
			/>
			<EditSupervisorModal
				opened={editSupervisorOpen}
				onClose={() => setEditSupervisorOpen(false)}
				supervisor={supervisor}
			/>
		</ContentContainer>
	);
}
```

- [ ] **Step 4: `index.ts`**

```ts
export { default } from './TeamDetailPage';
```

- [ ] **Step 5: Typecheck**

Will only be clean once Tasks 6, 7, 8 exist (this file imports `AssignCampaignsDrawer`, `AddMembersDrawer`,
`EditSupervisorModal`). Do Tasks 5–8 in the same working-tree pass, then run:

```bash
npx tsc --noEmit -p .
```

before committing any of them — Task 8's step lists the combined commit.

---

### Task 6: `AssignCampaignsDrawer`

**Files:**

- Create: `src/modules/qa/team/TeamDetailPage/AssignCampaignsDrawer.tsx`

**Interfaces:**

- Consumes: `useTeamStore` (`setTeamCampaigns` action, Task 2), `TEAM_CAMPAIGNS` (existing), `notifySuccess`
  (existing `~/modules/qa/utils/notifications`).
- Produces: `AssignCampaignsDrawer` component, imported by Task 5's `TeamDetailPage.tsx`.

- [ ] **Step 1: Write the component**

```tsx
import { useEffect, useState } from 'react';
import { Button, Group, MultiSelect, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { TEAM_CAMPAIGNS } from '../mockData';

interface AssignCampaignsDrawerProps {
	opened: boolean;
	onClose: () => void;
	supervisorId: string;
	teamName: string;
	currentCampaignIds: string[];
}

export function AssignCampaignsDrawer({
	opened,
	onClose,
	supervisorId,
	teamName,
	currentCampaignIds,
}: AssignCampaignsDrawerProps) {
	const { t } = useTranslation('qa.team');
	const setTeamCampaigns = useTeamStore((s) => s.setTeamCampaigns);
	const [selected, setSelected] = useState<string[]>(currentCampaignIds);

	useEffect(() => {
		if (opened) setSelected(currentCampaignIds);
	}, [opened, currentCampaignIds]);

	const handleSubmit = () => {
		setTeamCampaigns(supervisorId, selected);
		notifySuccess(t('teams.assignCampaigns.success', { team: teamName }));
		onClose();
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			title={t('teams.assignCampaigns.title')}
			size='md'
		>
			<Stack gap='md'>
				<MultiSelect
					label={t('teams.assignCampaigns.campaigns')}
					data={TEAM_CAMPAIGNS.map((c) => ({
						value: c.id,
						label: `${c.name} (${c.campaignType})`,
					}))}
					value={selected}
					onChange={setSelected}
					searchable
					clearable
				/>
				<Group justify='flex-end'>
					<Button variant='default' onClick={onClose}>
						{t('modals.cancel')}
					</Button>
					<Button onClick={handleSubmit}>
						{t('teams.assignCampaigns.submit')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
}
```

- [ ] **Step 2: Continue to Task 7 before typechecking** (this file alone compiles fine, but hold the commit — see
      Task 8's Step 3).

---

### Task 7: `AddMembersDrawer`

**Files:**

- Create: `src/modules/qa/team/TeamDetailPage/AddMembersDrawer.tsx`

**Interfaces:**

- Consumes: `useTeamStore` (`profiles`, `addMembers` action, Task 2), `notifySuccess`/`notifyWarning` (existing).
- Produces: `AddMembersDrawer` component, imported by Task 5's `TeamDetailPage.tsx`.

- [ ] **Step 1: Write the component**

Source list = every agent **not already** in this team (unassigned agents + agents from other teams — the "transfer"
half of the "Remove + add/transfer" decision), label shows their current team so a transfer is visible before you
commit to it.

```tsx
import { useState } from 'react';
import { Button, Group, MultiSelect, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';

interface AddMembersDrawerProps {
	opened: boolean;
	onClose: () => void;
	supervisorId: string;
	teamName: string;
}

export function AddMembersDrawer({
	opened,
	onClose,
	supervisorId,
	teamName,
}: AddMembersDrawerProps) {
	const { t } = useTranslation('qa.team');
	const profiles = useTeamStore((s) => s.profiles);
	const addMembers = useTeamStore((s) => s.addMembers);
	const [selected, setSelected] = useState<string[]>([]);

	const options = Object.values(profiles)
		.map((p) => p.agent)
		.filter((a) => a.supervisorId !== supervisorId)
		.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` }));

	const handleSubmit = () => {
		if (selected.length === 0) {
			notifyWarning(t('teams.addMembers.validationEmpty'));
			return;
		}
		addMembers(selected, supervisorId);
		notifySuccess(
			t('teams.addMembers.success', { count: selected.length, team: teamName })
		);
		setSelected([]);
		onClose();
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			title={t('teams.addMembers.title')}
			size='md'
		>
			<Stack gap='md'>
				<MultiSelect
					label={t('teams.addMembers.source')}
					description={t('teams.addMembers.sourceHint')}
					data={options}
					value={selected}
					onChange={setSelected}
					searchable
					clearable
				/>
				<Group justify='flex-end'>
					<Button variant='default' onClick={onClose}>
						{t('modals.cancel')}
					</Button>
					<Button onClick={handleSubmit}>{t('teams.addMembers.submit')}</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
}
```

---

### Task 8: `EditSupervisorModal` + typecheck/commit Tasks 5-8 together

**Files:**

- Create: `src/modules/qa/team/TeamDetailPage/EditSupervisorModal.tsx`

**Interfaces:**

- Consumes: `useTeamStore` (`updateSupervisor` action, Task 2), `RosterSupervisor` (Task 1), `notifySuccess`/
  `notifyWarning` (existing).
- Produces: `EditSupervisorModal` component, imported by Task 5's `TeamDetailPage.tsx`. This is the last of the four
  components `TeamDetailPage.tsx` imports, so this task's typecheck step closes out Tasks 5-8.

- [ ] **Step 1: Write the component**

```tsx
import { useEffect, useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import type { RosterSupervisor } from '../types';

interface EditSupervisorModalProps {
	opened: boolean;
	onClose: () => void;
	supervisor: RosterSupervisor;
}

export function EditSupervisorModal({
	opened,
	onClose,
	supervisor,
}: EditSupervisorModalProps) {
	const { t } = useTranslation('qa.team');
	const updateSupervisor = useTeamStore((s) => s.updateSupervisor);
	const [name, setName] = useState(supervisor.name);
	const [email, setEmail] = useState(supervisor.email);

	useEffect(() => {
		if (opened) {
			setName(supervisor.name);
			setEmail(supervisor.email);
		}
	}, [opened, supervisor]);

	const handleSubmit = () => {
		if (!name.trim()) {
			notifyWarning(t('teams.editSupervisor.validationName'));
			return;
		}
		updateSupervisor(supervisor.id, { name: name.trim(), email: email.trim() });
		notifySuccess(t('teams.editSupervisor.success'));
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('teams.editSupervisor.title')}
			centered
		>
			<Stack gap='sm'>
				<TextInput
					label={t('teams.editSupervisor.name')}
					value={name}
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				<TextInput
					label={t('teams.editSupervisor.email')}
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
				/>
				<Group justify='flex-end' mt='sm'>
					<Button variant='default' onClick={onClose}>
						{t('modals.cancel')}
					</Button>
					<Button onClick={handleSubmit}>
						{t('teams.editSupervisor.submit')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit -p .
```

Expected: clean. `TeamDetailPage.tsx` (Task 5), its three drawer/modal dependents (Tasks 6-8), and `useTeamDetailColumns`
should all now resolve. This page isn't routed yet, so nothing is reachable at runtime — that's fine, verified next in Task 9.

- [ ] **Step 3: Commit Tasks 5-8 together**

```bash
git add src/modules/qa/team/TeamDetailPage
git commit -m "feat(qa-team): add TeamDetailPage (members table, campaigns, add/remove/edit actions)"
```

---

### Task 9: Wire it all up — routes, sidebar, namespaces, and every `agentProfilePath` call site

**Files:**

- Modify: `src/routes.tsx`
- Modify: `src/components/Sidebar/roleNavigation.tsx`
- Modify: `src/modules/qa/qaNamespaces.ts`
- Modify: `src/modules/qa/team/AgentProfilePage/AgentProfilePage.tsx`
- Modify: `src/modules/qa/calls/helpers.ts`
- Modify: `src/views/Campaigns/components/CampaignRosterTab.tsx`
- Modify: `src/modules/qa/triggers/components/ActivityDetailDrawer/ActivityDetailDrawer.tsx`
- Modify: `src/modules/qa/lms/LmsManagerPage/LmsManagerPage.tsx`
- Modify: `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx`
- Delete: `src/modules/qa/qamanager/pages/SupervisorsPage.tsx`
- Delete: `src/modules/qa/qamanager/pages/TeamsPage.tsx`

**Interfaces:**

- Consumes: `TeamsListPage` (Task 4), `TeamDetailPage` (Task 5), `agentProfilePath` (Task 3).
- Produces: working navigation end-to-end — QA Manager's "Teams" sidebar entry → cards → team detail → agent profile,
  with old bookmarked URLs redirecting instead of 404ing.

- [ ] **Step 1: `roleNavigation.tsx` — remove two entries, repoint the third**

Remove the `qamanager-supervisors` block (lines 239-245) and the `qamanager-agents` block (lines 253-259) entirely.
Change the remaining `qamanager-teams` entry (lines 246-252) from:

```tsx
	{
		key: 'qamanager-teams',
		label: 'sidebar.qamanager.teams',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/teams',
		i18nNamespace: 'qa.qamanager',
	},
```

to:

```tsx
	{
		key: 'qamanager-teams',
		label: 'sidebar.qamanager.teams',
		icon: <IconUsers size={20} className={styles.menuIcon} />,
		to: '/qa/qa-manager/teams',
		i18nNamespace: 'qa.team',
	},
```

(the `to` path and the `sidebar.qamanager.teams` label key are unchanged — only the i18n namespace hint changes,
since the page now actually lives on `qa.team`; `IconUserSquareRounded` and `IconAddressBook` may now be unused
imports at the top of the file if nothing else in it uses them — check with a text search for each icon name in the
file before removing its import; `IconUsers` stays, it's still used here).

In `getQAManagerNavigationGrouped()`, change:

```tsx
		...pick(
			'qamanager-dashboard',
			'qamanager-inbox',
			'qamanager-supervisors',
			'qamanager-teams',
			'qamanager-agents',
			'qamanager-forms',
			'qamanager-coaching',
			'qamanager-lms'
		),
```

to:

```tsx
		...pick(
			'qamanager-dashboard',
			'qamanager-inbox',
			'qamanager-teams',
			'qamanager-forms',
			'qamanager-coaching',
			'qamanager-lms'
		),
```

- [ ] **Step 2: `routes.tsx` — lazy imports**

Change:

```tsx
const QAManagerSupervisorsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/SupervisorsPage')
);
const QAManagerTeamsPage = React.lazy(
	() => import('./modules/qa/qamanager/pages/TeamsPage')
);
```

to:

```tsx
const QAManagerTeamsListPage = React.lazy(
	() => import('./modules/qa/team/TeamsListPage')
);
const QAManagerTeamDetailPage = React.lazy(
	() => import('./modules/qa/team/TeamDetailPage')
);
```

Leave `YourTeamPage` and `AgentProfilePage` lazy imports as they are (still used by the Supervisor routes and now
also by the new QA Manager team-detail agent-profile route).

- [ ] **Step 3: `routes.tsx` — replace the route entries**

Change the `qa-manager/supervisors` route (was `id: 'qa.qa-manager.supervisors'`, `element: <QAManagerSupervisorsPage
/>`):

```tsx
								{
									path: 'qa-manager/supervisors',
									id: 'qa.qa-manager.supervisors',
									element: (
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<QAManagerSupervisorsPage />
											</Suspense>
										</I18nNamespaceLoader>
									),
								},
```

to a redirect:

```tsx
								{
									path: 'qa-manager/supervisors',
									id: 'qa.qa-manager.supervisors',
									element: <Navigate to='/qa/qa-manager/teams' replace />,
								},
```

Change the `qa-manager/teams` route (was `element: <QAManagerTeamsPage />`) to point at the new list page:

```tsx
								{
									path: 'qa-manager/teams',
									id: 'qa.qa-manager.teams',
									element: (
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<QAManagerTeamsListPage />
											</Suspense>
										</I18nNamespaceLoader>
									),
								},
```

Immediately after it, add the new detail route:

```tsx
								{
									path: 'qa-manager/teams/:supervisorId',
									id: 'qa.qa-manager.teams.detail',
									element: (
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<QAManagerTeamDetailPage />
											</Suspense>
										</I18nNamespaceLoader>
									),
								},
								{
									path: 'qa-manager/teams/:supervisorId/agents/:agentId',
									id: 'qa.qa-manager.teams.agents.profile',
									element: (
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<AgentProfilePage />
											</Suspense>
										</I18nNamespaceLoader>
									),
								},
```

Change the `qa-manager/agents` route (was `element: <YourTeamPage />`):

```tsx
								{
									path: 'qa-manager/agents',
									id: 'qa.qa-manager.agents',
									element: (
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<YourTeamPage />
											</Suspense>
										</I18nNamespaceLoader>
									),
								},
```

to a redirect:

```tsx
								{
									path: 'qa-manager/agents',
									id: 'qa.qa-manager.agents',
									element: <Navigate to='/qa/qa-manager/teams' replace />,
								},
```

Change the `qa-manager/agents/:agentId` route (was `element: <AgentProfilePage />`):

```tsx
								{
									path: 'qa-manager/agents/:agentId',
									id: 'qa.qa-manager.agents.profile',
									element: (
										<I18nNamespaceLoader>
											<Suspense fallback={<SuspenseFallback />}>
												<AgentProfilePage />
											</Suspense>
										</I18nNamespaceLoader>
									),
								},
```

to a redirect (bookmarked deep links to a specific agent lose the deep link and land on the Teams list — acceptable
for a stakeholder mockup; there is no supervisor lookup available at this route to redirect deeper):

```tsx
								{
									path: 'qa-manager/agents/:agentId',
									id: 'qa.qa-manager.agents.profile',
									element: <Navigate to='/qa/qa-manager/teams' replace />,
								},
```

Leave the `supervisor/your-team` and `supervisor/your-team/:agentId` routes untouched — the Supervisor role is
unaffected by this plan.

- [ ] **Step 4: `qaNamespaces.ts`**

Change:

```ts
	'qa.supervisor.your-team': ['qa.team', 'qa.dashboard'],
	'qa.supervisor.your-team.profile': ['qa.team', 'qa.dashboard'],
	'qa.qa-manager.agents': ['qa.team', 'qa.dashboard'],
	'qa.qa-manager.agents.profile': ['qa.team', 'qa.dashboard'],
```

to:

```ts
	'qa.supervisor.your-team': ['qa.team', 'qa.dashboard'],
	'qa.supervisor.your-team.profile': ['qa.team', 'qa.dashboard'],
	'qa.qa-manager.teams': ['qa.team', 'qa.dashboard'],
	'qa.qa-manager.teams.detail': ['qa.team', 'qa.dashboard', 'qa.campaigns'],
	'qa.qa-manager.teams.agents.profile': ['qa.team', 'qa.dashboard'],
```

(`qa.qa-manager.agents` / `qa.qa-manager.agents.profile` are removed since those route ids now just redirect and
render nothing that needs a namespace; leaving the old `qa.qa-manager.supervisors` entry absent is fine too — it was
never in this map even before this plan.)

- [ ] **Step 5: `AgentProfilePage.tsx` — 3-level breadcrumb for `qa-manager`**

Change:

```tsx
<Breadcrumbs>
	<Anchor onClick={() => navigate(teamBasePath(role))}>
		{t(role === 'qa-manager' ? 'team.titleQaManager' : 'team.title')}
	</Anchor>
	<Text c='dimmed'>{profile.agent.name}</Text>
</Breadcrumbs>
```

to:

```tsx
<Breadcrumbs>
	<Anchor onClick={() => navigate(teamBasePath(role))}>
		{t(role === 'qa-manager' ? 'teams.list.title' : 'team.title')}
	</Anchor>
	{role === 'qa-manager' && (
		<Anchor
			onClick={() =>
				navigate(`/qa/qa-manager/teams/${profile.agent.supervisorId}`)
			}
		>
			{profile.agent.team}
		</Anchor>
	)}
	<Text c='dimmed'>{profile.agent.name}</Text>
</Breadcrumbs>
```

- [ ] **Step 6: `calls/helpers.ts` — `agentProfilePathFor` takes the agent, not a bare id**

Change:

```ts
/** Where a roster row navigates: the role's own agent-profile route. */
export const agentProfilePathFor = (
	previewRole: PreviewRole | null,
	agentId: string
) =>
	`${teamBasePath(previewRole === 'supervisor' ? 'supervisor' : 'qa-manager')}/${agentId}`;
```

to:

```ts
/** Where a roster row navigates: the role's own agent-profile route. */
export const agentProfilePathFor = (
	previewRole: PreviewRole | null,
	agent: Pick<RosterAgent, 'id' | 'supervisorId'>
) =>
	agentProfilePath(
		previewRole === 'supervisor' ? 'supervisor' : 'qa-manager',
		agent
	);
```

This needs `agentProfilePath` and `RosterAgent` imported — change the existing:

```ts
import { teamBasePath } from '~/modules/qa/team/helpers';
import type { RosterAgent } from '~/modules/qa/team/types';
```

to:

```ts
import { agentProfilePath, teamBasePath } from '~/modules/qa/team/helpers';
import type { RosterAgent } from '~/modules/qa/team/types';
```

(check whether `teamBasePath` is still used elsewhere in this file before deciding whether to keep or drop it from
the import — `rosterCampaignIdFor` and the rest of the file don't call it directly aside from inside
`agentProfilePathFor`'s old body, so once the change above is made, `teamBasePath` becomes unused in this file and
its import should be dropped; keep only `agentProfilePath`).

- [ ] **Step 7: `CampaignRosterTab.tsx` — pass the agent object**

Change:

```tsx
				onRowClick={(r) =>
					navigate(agentProfilePathFor(previewRole, r.agent.id))
				}
```

to:

```tsx
				onRowClick={(r) =>
					navigate(agentProfilePathFor(previewRole, r.agent))
				}
```

- [ ] **Step 8: `ActivityDetailDrawer.tsx` — resolve `supervisorId` before navigating**

Change:

```tsx
import { teamBasePath } from '~/modules/qa/team/helpers';
```

to:

```tsx
import { agentProfilePath } from '~/modules/qa/team/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
```

Change:

```tsx
const handleOpenAnalytics = () => {
	const teamRole = role === 'supervisor' ? 'supervisor' : 'qa-manager';
	navigate(`${teamBasePath(teamRole)}/${entry.agentId}`);
};
```

to:

```tsx
const handleOpenAnalytics = () => {
	const teamRole = role === 'supervisor' ? 'supervisor' : 'qa-manager';
	const agent = TEAM_AGENTS.find((a) => a.id === entry.agentId);
	if (!agent) return;
	navigate(agentProfilePath(teamRole, agent));
};
```

- [ ] **Step 9: `LmsManagerPage.tsx` — resolve `supervisorId` before navigating**

Change:

```tsx
import { roleFromPath, teamBasePath } from '~/modules/qa/team/helpers';
```

to:

```tsx
import { agentProfilePath, roleFromPath } from '~/modules/qa/team/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
```

Change:

```tsx
				onOpenProfile={(agentId) => navigate(`${teamBasePath(role)}/${agentId}?tab=coaching`)}
```

to:

```tsx
				onOpenProfile={(agentId) => {
					const agent = TEAM_AGENTS.find((a) => a.id === agentId);
					if (agent) navigate(`${agentProfilePath(role, agent)}?tab=coaching`);
				}}
```

(check whether `teamBasePath` is used elsewhere in this file before removing it from the import — grep the file for
other `teamBasePath(` call sites; if none remain, drop it as shown above, otherwise keep both names imported.)

- [ ] **Step 10: `CoachingPage.tsx` — resolve `supervisorId` before navigating**

Change:

```tsx
import { roleFromPath, teamBasePath } from '~/modules/qa/team/helpers';
```

to:

```tsx
import { agentProfilePath, roleFromPath } from '~/modules/qa/team/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
```

Change:

```tsx
				onProfile={() =>
					agentDrawerId &&
					navigate(`${teamBasePath(role)}/${agentDrawerId}?tab=coaching`)
				}
```

to:

```tsx
				onProfile={() => {
					const agent = agentDrawerId ? TEAM_AGENTS.find((a) => a.id === agentDrawerId) : undefined;
					if (agent) navigate(`${agentProfilePath(role, agent)}?tab=coaching`);
				}}
```

(same check as Step 9: only drop `teamBasePath` from this file's import if nothing else in the file still calls it.)

- [ ] **Step 11: Delete the old placeholder pages**

```bash
git rm src/modules/qa/qamanager/pages/SupervisorsPage.tsx
git rm src/modules/qa/qamanager/pages/TeamsPage.tsx
```

- [ ] **Step 12: Typecheck**

```bash
npx tsc --noEmit -p .
```

Expected: clean. This is the step that should finally resolve every `agentProfilePath`/`teamBasePath` signature
mismatch introduced by Task 3.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat(qa-team): wire Teams pages into routing/sidebar, fix every agent-profile navigation call site"
```

---

## Verification

1. `npx tsc --noEmit -p .` clean after every task (already required per-task above) — this is the only automated
   check this plan uses, per `CLAUDE.md`'s "no tests unless requested" rule.
2. If asked to preview: `preview_start`, log in as QA Manager, open `/qa/qa-manager/teams`. Confirm:
   - The sidebar shows a single "Teams" entry (no "Supervisors"/"Agents" entries).
   - Three team cards render (Team 1/2/3) with correct member counts and average scores; an "Unassigned" card only
     appears after a member has been removed from a team.
   - Clicking a card opens `/qa/qa-manager/teams/:supervisorId` with the right members table and campaign chips.
   - "Assign campaigns" adds/removes campaigns and the chips update; the "x" on a chip also removes it.
   - "Add members" lists agents from other teams and Unassigned, and moving one updates both team pages'
     member counts.
   - Removing a member asks for confirmation, then moves them to Unassigned (which now appears on the Teams list).
   - "Edit supervisor" updates the header's name/email and the Teams list card's name.
   - Clicking an agent row opens `/qa/qa-manager/teams/:supervisorId/agents/:agentId` with a 3-level breadcrumb
     (Teams › Team N › Agent name) that navigates correctly at each level.
   - Old bookmarks `/qa/qa-manager/supervisors`, `/qa/qa-manager/agents`, `/qa/qa-manager/agents/:agentId` all
     redirect to `/qa/qa-manager/teams` instead of 404ing.
   - The QA Manager's Campaigns → Roster tab, the Trigger activity drawer's "Open analytics", the LMS assignment
     drawer's "Open profile", and the Coaching page's agent-drawer "Open profile" all still navigate to the correct
     nested agent-profile URL for a QA Manager viewer.
   - Supervisor role is completely unaffected: "Your Team" still works exactly as before, at the same URLs.
   - Check both light and dark mode on every new screen (cards, drawers, modal, confirm dialog).
     Per `DESIGN_ROLE.md`, only do this if the user asks to see it running — otherwise verification stays at
     typecheck.

# Rankings: time-based tabs, compact cards, and an agent view built around "you"

> On execution: copy this file to `docs/superpowers/plans/2026-10-23-rankings-tabs-and-agent-view.md` and follow the tasks in order. `npm run typecheck` after every task. No dev server, no tests, no commit unless asked. Code and comments in English; UI strings in `qa.rankings` en + es. Prettier on touched files only. "Today" in the mocks is 2026-09-12 (`TODAY`, `src/modules/qa/analytics/constants.ts`).

## Context

The supervisor Rankings page (`src/modules/qa/rankings/ManagerRankingsPage/ManagerRankingsPage.tsx`) is a filter-driven list (search, four status chips with counts, metric area, period, team) over six mock rankings, and each card shows nine facts. Status is **stored by hand** (`draft | active | inactive | completed`) while "period" (live / upcoming / ended) is derived from dates, so the two can contradict. The default ranking (RP-006, permanent) is seeded `inactive` and `withSingleActive` (`src/stores/qa/rankingsStore.ts:65`) switches it off whenever a dated ranking goes live, which is the opposite of what a default is for. Completed rankings are hidden by default and have no place of their own.

The agent page (`src/modules/qa/agent/rankings/TeamRankingsPage.tsx`) reuses the manager's `RankingView`: no page title, four team-level stat tiles, a yellow/gray/orange podium, emoji prizes and milestone badges, a yellow prize badge. Nothing on it is about the agent. It also only ever shows the first `active` program of the team (`useActiveRanking.ts:22`).

Decisions made with the user (2026-10-23):

- **Supervisor tabs by time**: **Current** (the default ranking + the live dated ranking) · **Upcoming & drafts** · **Past**. The filter bar goes.
- **Default is always active** unless disabled; a dated ranking runs **beside** it, never replaces it. Dated rankings have a start and an end date and derive their status from them.
- **Card = five facts**: name, status, metric, time left, leader (winner on past ones).
- **Agent page rebuilt around "you"**: title, a strip with the agent's rank, score vs target, movement and gap to the next place, then standings with prize and milestones as a quiet aside. Podium card, team stat tiles, emoji and the yellow accent go.
- **Two live rankings on the agent side** (default + dated): a segmented control, the dated one first.

Decided by me, redirectable: `scheduled` becomes a real status; the store reconciles dated statuses from dates on every change; the editor's "Save & activate" becomes "Publish"; the supervisor dashboard widget shows the dated ranking when there is one, else the default; prize emoji is replaced by the kind icon (`PRIZE_ICON`, already in `constants.ts`) on every page; the manager detail page keeps `RankingView` but loses the raw colours.

---

## Critique summary

| Finding                                                                                                | Severity | Evidence                                                                                    |
| ------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------- |
| Stored status vs derived period; default seeded inactive and switched off by any live ranking          | 🔴       | `rankingsStore.ts:65-80`, `mockData.ts` RP-006 `status: 'inactive'`, `helpers.ts:102`       |
| Five filter controls for six rankings; the live ranking looks like a draft                             | 🔴       | `RankingFilters.tsx`, `ManagerRankingsPage.tsx:161-174`                                     |
| Card shows description, metrics, teams, target + min calls, period, days left, progress, prize, leader | 🟡       | `RankingProgramCard.tsx:150-230`                                                            |
| Agent page: no title; stats, podium, prize badge are team facts and decoration                         | 🔴       | `TeamRankingsPage.tsx:60`, `RankingStats.tsx`, `PodiumStrip.tsx`, `RankingHeader.tsx:86-94` |
| Only one ranking visible to the agent                                                                  | 🟡       | `useActiveRanking.ts:22`                                                                    |
| Raw CSS `green` in a StatCard; `c='yellow'` podium labels; emoji next to Tabler icons                  | 🟢       | `RankingStats.tsx:31`, `PodiumStrip.tsx:60`, `RankingView.tsx:66,100`                       |

Keep: `computeStandings`, `MetricChips`, `RankingStandings` / `StandingsTable` / `StandingsCardGrid`, `RankingDetailDrawer`, `PastRankingsCard` (restyled), the editor `RankingForm` (status buttons only), the store's notifications and milestone logic.

---

## Status model

```
draft      not published                          (dated or default, before publishing)
scheduled  published, startDate > today           (dated only)
active     live: dated within its dates, or the default when enabled
inactive   the default, disabled by the supervisor (dated rankings never use it)
completed  dated, endDate < today or ended early
```

`reconcile(programs)` in the store derives `scheduled | active | completed` for every published dated program from its dates, and leaves `draft`, the default's `active | inactive`, and an already `completed` program alone. It runs on store init and inside every `set`, so every existing `status === 'active'` check keeps working.

Rules:

- One **default** per team (`withSingleDefault`, unchanged). Enabling / disabling it never touches other programs.
- One **live or scheduled dated** ranking per team: publishing a dated ranking that overlaps another published dated one for the same team asks to replace it (existing confirm modal, defaults excluded).
- Ending a dated ranking no longer activates anything: the default is already on.

---

## Files

New:

- `src/modules/qa/rankings/components/RankingTabs.tsx` (supervisor tab bar + per-tab lists)
- `src/modules/qa/rankings/components/PastRankingsTable.tsx` (supervisor past tab, `BaseTable`)
- `src/modules/qa/agent/rankings/components/YourStandingStrip.tsx`
- `src/modules/qa/agent/rankings/components/AgentRankingView.tsx`
- `src/modules/qa/agent/rankings/components/RankingAside.tsx` (prize + milestones, icon based)
- `src/modules/qa/agent/rankings/components/AgentRanking.module.css`

Modified:

- `src/models/qa/rankingPrograms.ts`, `src/stores/qa/rankingsStore.ts`, `src/modules/qa/rankings/{constants,helpers,mockData}.ts`, `hooks/useActiveRanking.ts`
- `src/modules/qa/rankings/ManagerRankingsPage/ManagerRankingsPage.tsx`, `RankingEditorPage/RankingEditorPage.tsx`, `components/{RankingProgramCard,RankingForm,RankingView,RankingHeader,RankingStats,PodiumStrip,PastRankingsCard}.tsx`, `Rankings.module.css`
- `src/modules/qa/agent/rankings/TeamRankingsPage.tsx`
- `src/modules/qa/dashboard/pages/NewSupervisorDashboard.tsx` (hook result shape)
- `src/locales/{en,es}/qa.rankings.json`

Deleted: `components/RankingFilters.tsx`, `hooks/useRankingFilters.ts`.

---

## Task 1 · Status model, helpers, store, mocks

### `src/models/qa/rankingPrograms.ts`

```ts
/**
 * Dated rankings derive `scheduled | active | completed` from their dates once
 * published. The default ranking is `active` unless the supervisor disables it
 * (`inactive`). `draft` is anything not published yet.
 */
export type RankingStatus =
	| 'draft'
	| 'scheduled'
	| 'active'
	| 'inactive'
	| 'completed';
```

### `src/modules/qa/rankings/constants.ts`

- Delete `RankingPeriod`, `RANKING_PERIODS`, `DEFAULT_RANKING_STATUSES`, `PODIUM_COLORS`.
- `RANKING_STATUS_ORDER = ['active', 'scheduled', 'draft', 'inactive', 'completed']`.
- `STATUS_COLOR`: every status `'gray'` except `active: 'green'`.
- Add:

```ts
/** Where a ranking is shown on the supervisor page. */
export type RankingTab = 'current' | 'upcoming' | 'past';
export const RANKING_TABS: RankingTab[] = ['current', 'upcoming', 'past'];
```

### `src/modules/qa/rankings/helpers.ts`

- Delete `RankingFilters`, `periodOf`, `programAreas`, `matchesRankingFacets`, `applyRankingFilters`.
- Replace `activeProgramFor` with:

```ts
/** The dated ranking running for a team right now, beside the default. */
export const liveDatedFor = (programs: RankingProgram[], team: string) =>
	programs.find(
		(p) => p.status === 'active' && !p.isDefault && p.teams.includes(team)
	) ?? null;

/** The status a published dated ranking has on `today`; other programs keep theirs. */
export const statusOn = (
	program: RankingProgram,
	today = TODAY
): RankingStatus => {
	if (program.status === 'draft' || program.status === 'completed')
		return program.status;
	if (isPermanent(program))
		return program.status === 'inactive' ? 'inactive' : 'active';
	if (program.endDate !== null && program.endDate < today) return 'completed';
	if (program.startDate > today) return 'scheduled';
	return 'active';
};

export const tabOf = (program: RankingProgram): RankingTab =>
	program.status === 'completed'
		? 'past'
		: program.status === 'scheduled' || program.status === 'draft'
			? 'upcoming'
			: 'current';

/** Default first, then live dated, then the rest by status order and newest start. */
export const sortPrograms = (programs: RankingProgram[]) =>
	[...programs].sort(
		(a, b) =>
			Number(b.isDefault) - Number(a.isDefault) ||
			RANKING_STATUS_ORDER.indexOf(a.status) -
				RANKING_STATUS_ORDER.indexOf(b.status) ||
			b.startDate.localeCompare(a.startDate)
	);

/** Two dated rankings for the same team cannot run at once; this finds the one a draft would collide with. */
export const overlappingDated = (
	programs: RankingProgram[],
	candidate: Pick<RankingProgram, 'id' | 'teams' | 'startDate' | 'endDate'>
) =>
	programsSharingTeams(programs, candidate.teams, candidate.id).find(
		(p) =>
			!p.isDefault &&
			(p.status === 'active' || p.status === 'scheduled') &&
			p.endDate !== null &&
			candidate.endDate !== null &&
			p.startDate <= candidate.endDate &&
			candidate.startDate <= p.endDate
	) ?? null;
```

- Add, for the agent strip:

```ts
export interface OwnStanding {
	standing: RankingStanding | null;
	rankedCount: number;
	/** Calls still needed to qualify; 0 once ranked. */
	callsToQualify: number;
	/** Points between the agent and the place above (null for the leader or unranked). */
	gapToNext: number | null;
	/** Points between the agent and the place below (null when last or unranked). */
	leadOverNext: number | null;
}

export const ownStanding = (
	program: RankingProgram,
	standings: RankingStanding[],
	agentId: string
): OwnStanding => {
	const ranked = standings.filter((s) => s.rank !== null);
	const mine = standings.find((s) => s.agentId === agentId) ?? null;
	const above = mine?.rank
		? ranked.find((s) => s.rank === mine.rank! - 1)
		: undefined;
	const below = mine?.rank
		? ranked.find((s) => s.rank === mine.rank! + 1)
		: undefined;
	const diff = (a?: RankingStanding, b?: RankingStanding | null) =>
		a?.score != null && b?.score != null ? Math.abs(a.score - b.score) : null;
	return {
		standing: mine,
		rankedCount: ranked.length,
		callsToQualify: mine
			? Math.max(0, program.minCalls - mine.calls)
			: program.minCalls,
		gapToNext: diff(above, mine),
		leadOverNext: diff(below, mine),
	};
};
```

### `src/modules/qa/rankings/mockData.ts`

- RP-004 `status: 'scheduled'`. RP-006 `status: 'active'`. Everything else unchanged (RP-001 active dated for Team 1, so Team 1 has both).

### `src/stores/qa/rankingsStore.ts`

- Import `liveDatedFor`, `overlappingDated`, `statusOn` instead of `defaultProgramFor` (keep `defaultProgramFor` if still used elsewhere; it is only used by `endProgram`, which drops the fallback).
- `const reconcile = (programs: RankingProgram[]) => programs.map((p) => { const status = statusOn(p); return status === p.status ? p : { ...p, status }; });`
- Replace `withSingleActive` with `withSingleLiveDated(programs, id)`: ends (`status: 'completed'`, `endDate: TODAY` when later) the `overlappingDated` program of the one being published. Never touches `isDefault` programs.
- Initial state: `programs: reconcile(resolveSeedWinners(RANKING_PROGRAMS_SEED))`.
- Wrap every `set` that changes `programs` so the result goes through `reconcile`. Simplest: a local `const setPrograms = (fn: (programs: RankingProgram[]) => RankingProgram[]) => set((s) => ({ programs: reconcile(fn(s.programs)) }));` and use it everywhere.
- Interface changes:
  - `activateProgram` → rename to **`publishProgram(id)`**: draft → `scheduled | active` by dates (through reconcile); if dated, apply `withSingleLiveDated`; notifications as today (only when the result is `active`). For the default (permanent + isDefault) it just sets `active`.
  - `deactivateProgram` → **`disableDefault(id)`**: only when `isDefault`; sets `inactive`.
  - `endProgram`: unchanged except delete the "fallbacks" block at the end.
  - `createProgram`: `status: draft.status === 'active' ? 'draft' : draft.status` then `if (draft.status === 'active') get().publishProgram(id)` (same shape as today, new name).
  - `updateProgram`: same renames; `wantsActive` → `wantsPublish = patch.status === 'active' && current.status === 'draft'`.
- `syncMilestones`, `duplicateProgram` (`status: 'draft'`), `deleteProgram`, reactions: unchanged.

### `src/modules/qa/rankings/hooks/useActiveRanking.ts`

```ts
interface UseActiveRankingResult {
	team: string;
	/** The dated ranking running now, if any. */
	dated: RankingProgram | null;
	/** The team's default ranking, if enabled. */
	defaultProgram: RankingProgram | null;
	/** What the agent can look at, dated first. */
	current: RankingProgram[];
	/** Backwards-compatible: the dated ranking, else the default. */
	program: RankingProgram | null;
	standings: RankingStanding[];
	pastPrograms: RankingProgram[];
	standingsOf: (program: RankingProgram) => RankingStanding[];
}
```

`buildResult`: `dated = liveDatedFor(forTeam, team)`, `defaultProgram = forTeam.find((p) => p.isDefault && p.status === 'active') ?? null`, `current = [dated, defaultProgram].filter(Boolean)`, `program = dated ?? defaultProgram`, `standingsOf` memoised in a `Map`. `pastPrograms` unchanged.

`NewSupervisorDashboard.tsx:70` keeps reading `{ program, standings }`; nothing to change there.

**Typecheck.** Expect errors in `ManagerRankingsPage`, `RankingProgramCard`, `RankingForm`, `RankingEditorPage` (next tasks).

---

## Task 2 · Supervisor page: tabs, compact card, past table

### `components/RankingTabs.tsx` (new)

Props: `role`, `tab: RankingTab`, `onTabChange`, `counts: Record<RankingTab, number>`, `team: string | null`, `onTeamChange` (QA manager only). Mantine `Tabs.List` with icons: `IconTrophy` current, `IconCalendarClock` upcoming, `IconHistory` past; a `Badge size='xs' variant='light' color='gray'` count on each. For `role === 'qa-manager'`, a `Select` (w 160, clearable, `TEAMS`) at the right of the tab list (`Group justify='space-between'`). Tab and team live in the URL: `?tab=` and `?team=`.

### `ManagerRankingsPage.tsx`

- Delete filters, counts by status, `liveAgents`, summary text, `showStatus`.
- `const [params, setParams] = useSearchParams()`; `tab = params.get('tab') as RankingTab ?? 'current'`; `team = params.get('team')`.
- `programs = programsForRole(allPrograms, role)` then `.filter(p => !team || p.teams.includes(team))`.
- `byTab = { current: sortPrograms(programs.filter(p => tabOf(p) === 'current')), upcoming: …, past: … }`.
- Render: header (unchanged) → `RankingTabs` → `tab === 'past' ? <PastRankingsTable programs={byTab.past} role={role} onView onReuse /> : <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>cards</SimpleGrid>`.
- Empty states: `empty.current` ("No ranking is running. Enable the default or publish one."), `empty.upcoming`, `empty.past`.
- Card actions wired to the store: `onPublish` (draft or scheduled→ no-op) with the overlap confirm (`overlappingDated` → existing `card.activateConfirm` modal, copy updated: "Publishing X will end Y for Team 1"), `onToggleDefault` (`publishProgram` / `disableDefault`), `onEnd`, `onDuplicate` (then `setParams tab=upcoming`), `onDelete`, `onEdit`, `onView`.

### `components/RankingProgramCard.tsx` (rewrite body)

Props: `program`, `standings`, `onView`, `onEdit`, `onDuplicate`, `onPublish`, `onToggleDefault`, `onEnd`, `onDelete`.

| Slot                | Content                                                                                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title               | `program.name`                                                                                                                                                                                                                                                                    |
| description         | none (dropped)                                                                                                                                                                                                                                                                    |
| headerActions       | one status pill: `Badge variant='light' color={STATUS_COLOR[status]}` with `t(`status.${status}`)`; for the default add `leftSection={<IconStar size={12} />}` and text `t('card.defaultStatus.on' / '.off')` ("Default · On" / "Default · Off")                                  |
| body row 1          | `<MetricChips program size='xs' />`                                                                                                                                                                                                                                               |
| body row 2 (time)   | `Text size='sm' c='dimmed'` with `IconClock size={14}`: default → `card.alwaysOn` ("Always on"); scheduled → `card.startsOn {{date}}`; active dated → `card.daysLeft {{count}} · ends {{date}}`; completed → `card.endedOn {{date}}`; draft → `card.draftDates {{from}} → {{to}}` |
| body row 3 (people) | `Text size='sm'`: live/default → `card.leader`: **name** · score; completed → `card.winner`: name; scheduled/draft → `card.participants {{count}}` (`participantCount([program])`)                                                                                                |
| footer              | `Button size='xs' variant='default'` View; `Menu` with `ActionIcon variant='subtle' size='md'` (36px target): Edit · Duplicate · Publish (draft) · Enable/Disable (default) · End now (active dated) · Delete draft                                                               |

No `Switch`, no `Progress`, no teams, no target, no prize.

### `components/PastRankingsTable.tsx` (new)

`BaseTable<RankingProgram>` (`density='compact'`, `getRowId`, `emptyMessage`), columns via `createColumnHelper`: Ranking (name + `MetricChips size='xs'` below), Period (`DD MMM → DD MMM YYYY`), Teams (QA manager only), Winner (`winnerName ?? '—'`), Participants, actions (`Button size='xs' variant='subtle'` "Reuse" → `onReuse(program)` = duplicate + go to Upcoming; "View" → detail page). Row click → `onView`.

### `components/RankingForm.tsx`

- `alreadyOn` → `isPublished = program !== null && program.status !== 'draft'`.
- `replaced` → `overlappingDated(programs, { id: program?.id ?? '', teams: draft.teams, startDate: draft.startDate, endDate: draft.endDate })` (only when `!permanent`).
- Action bar: Cancel · `Save draft` (drafts and new) / `Save` (published) · `Publish` (`editor.publish`, drafts and new only) → `handleSave('active')` as today (the store turns it into scheduled/active).
- The notice `card.replaces` copy → "Publishing will end {{name}} for {{teams}}."

### `RankingEditorPage.tsx`

`backToRankings(status)` → navigate to `${rankingsBasePath(role)}?tab=${status === 'completed' ? 'past' : status === 'draft' || status === 'scheduled' ? 'upcoming' : 'current'}`; compute the tab from the saved program's reconciled status (`programs.find` after save) or simply from `status === 'draft' ? 'upcoming' : 'current'`.

### Locale (`qa.rankings.json`, en; es equivalents)

- Delete `filters.*`, `empty.noMatch`, `empty.none`, `card.target`, `card.period`, `card.since`, `card.noEndDate`, `card.notStarted`, `card.ended`, `card.activate`, `card.deactivate`, `card.setDefault`, `card.prize`.
- Add `tabs: { current: "Current", upcoming: "Upcoming & drafts", past: "Past" }`, `status.scheduled: "Scheduled"`, `card.defaultStatus: { on: "Default · On", off: "Default · Off" }`, `card.alwaysOn`, `card.startsOn: "Starts {{date}}"`, `card.endsOn: "ends {{date}}"`, `card.endedOn: "Ended {{date}}"`, `card.draftDates: "{{from}} → {{to}}"`, `card.participants_one/_other: "{{count}} agent(s)"`, `card.publish: "Publish"`, `card.enable: "Enable default"`, `card.disable: "Disable default"`, `card.reuse: "Reuse"`, `card.activateConfirm.body: "Publishing {{name}} will end {{replaced}} for {{teams}}. Agents will see the new ranking right away."`, `empty: { current: "No ranking is running. Enable the default or publish one.", upcoming: "Nothing scheduled and no drafts.", past: "No finished rankings yet." }`, `past.columns: { name, period, teams, winner, participants, actions }`, `editor.publish: "Publish"`.
- `page.description` → "The default ranking is always on; run a dated ranking beside it when you want to push one thing."

**Typecheck**, then delete `RankingFilters.tsx` and `useRankingFilters.ts`.

---

## Task 3 · Agent page around "you"

### `agent/rankings/components/YourStandingStrip.tsx` (new)

Props: `program`, `standings`, `agentId`. Uses `ownStanding`. `SectionCard` with `SimpleGrid cols={{ base: 2, md: 4 }}`; each cell a `Stack gap={2}`: label `Text size='xs' c='dimmed' tt='uppercase' fw={600}`, value `Text size='xl' fw={700}`, hint `Text size='xs' c='dimmed'`.

| Cell            | Ranked                                                                                                                                        | Unranked                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Your place      | `#3` · hint `of 12 ranked`                                                                                                                    | `—` · hint `agent.you.callsToQualify {{count}}` |
| Score           | `91.2` · thin `Progress size='xs' color='gray'` to target, hint `agent.you.target {{value}}` or `agent.you.targetReached` (fw 600, not green) | `—` · hint `agent.you.noScore`                  |
| Since last week | `↑ 2` with `ThemeIcon size='sm' variant='light'` green up / red down / gray held, hint `agent.you.held` / `up` / `down`                       | `—`                                             |
| Next place      | leader: `agent.you.leading {{points}}` ("Leading by 0.8"); else `agent.you.behind {{points}}` ("1.4 behind #2")                               | `—`                                             |

Own row colour: the strip has no colour; the only accent on the page is the agent's row in the standings (`.currentRow`).

### `agent/rankings/components/RankingAside.tsx` (new)

Two `SectionCard`s. **Prize**: `ThemeIcon size='lg' variant='light' color='gray'` with `PRIZE_ICON[program.prize.kind]`, title fw 600, description dimmed, `Badge size='xs' variant='outline' color='gray'` kind. **Milestones**: one row per milestone: `ThemeIcon size='sm' variant='light' color='gray'` `IconAward`; label; `Badge size='xs' variant='outline' color='gray'` threshold; when the agent's `milestoneIds` includes it, `IconCheck size={14}` + text `agent.milestones.reached`. Empty: `editor.noBadge`.

### `agent/rankings/components/AgentRankingView.tsx` (new)

Props: `program`, `standings`, `agentId`, `onRowClick`.

```
Stack gap='lg'
├─ header: Title order={3} name · Text dimmed description · Text xs dimmed "Set by X · Target 85 · 18 days left · ends 30 Sep" (or "Always on") · <MetricChips size='sm' />
├─ <YourStandingStrip />
└─ Grid 8/4: <RankingStandings title={t('agent.standingsTitle')} reactions={program.allowReactions ? 'interactive' : 'off'} currentAgentId onRowClick /> · <RankingAside />
```

No status badge, no prize badge, no progress bar, no podium, no stat tiles.

### `agent/rankings/TeamRankingsPage.tsx`

- `ContentContainer title={t('agent.title')} description={t('agent.description')}`.
- `const { current, pastPrograms, standingsOf } = useActiveRanking();`
- Selected ranking in `?ranking=<id>`; default = `current[0]?.id`. When `current.length > 1`, an `AppSegmentedControl` above the view with `data = current.map(p => ({ value: p.id, label: p.isDefault ? t('agent.switch.default') : p.name }))` (labels: dated ranking name, "Team index" for the default). Hidden when one.
- Tabs Current / Past stay (`?tab=`). Current → `AgentRankingView`; empty → `EmptyState` `agent.empty.noActive` ("Your team has no ranking on right now").
- Drawer wiring unchanged (`toRankingEntry` on the selected program's standings).

### Restyle shared pieces (manager pages keep them)

- `RankingView.tsx`: prize card uses `PRIZE_ICON` in a gray `ThemeIcon` instead of `program.prize.icon`; milestone rows use `IconAward` instead of `badge?.icon`.
- `RankingHeader.tsx`: prize badge → `variant='outline' color='gray'` with the kind icon as `leftSection`.
- `RankingStats.tsx`: drop `color='green'`.
- `PodiumStrip.tsx`: avatars `color='gray'`, place labels `c='dimmed'`; first place keeps the larger size and the ring (`Rankings.module.css` ring → `var(--mantine-color-default-border)` 2px).
- `PastRankingsCard.tsx` (agent Past tab): winner cell `fw={700}` with `IconTrophy size={14}` instead of `c='yellow.8'`.
- `Rankings.module.css`: `.currentRow td` background → `var(--mantine-primary-color-light)`.

### Locale additions

`agent.title: "Team ranking"`, `agent.description: "Where you stand in the rankings your supervisor runs, and what it takes to move up."`, `agent.switch.default: "Team index"`, `agent.standingsTitle: "Team standings"`, `agent.you: { place: "Your place", ofRanked: "of {{count}} ranked", callsToQualify_one/_other: "{{count}} more call(s) to qualify", score: "Score", target: "Target {{value}}", targetReached: "Target reached", noScore: "No score yet", sinceWeek: "Since last week", held: "Held position", up_one/_other: "Up {{count}} place(s)", down_one/_other: "Down {{count}} place(s)", next: "Next place", leading: "Leading by {{points}}", behind: "{{points}} behind #{{rank}}" }`, `agent.milestones.reached: "Reached"`, `agent.meta: "Set by {{name}} · Target {{target}}"`, `agent.empty.noActive` (new copy above). Remove `agent.podium.*` only if `PodiumStrip` no longer reads them (it still does: keep).

**Typecheck**, locale parity.

---

## Verification

1. `npm run typecheck` clean; `grep -rn "RankingFilters\|useRankingFilters\|periodOf\|activeProgramFor\|activateProgram\|deactivateProgram\|PODIUM_COLORS" src` empty.
2. Locale parity en/es for `qa.rankings` (flatten-keys node script used in this session).
3. Vite SSR script (`scratchpad/rankings_check.mjs`, same pattern as `anchor_check.mjs`):
   - Load the store: statuses after reconcile → RP-001 active, RP-002 active, RP-003 completed, RP-004 scheduled, RP-005 draft, RP-006 active.
   - `tabOf` buckets: current = [RP-006, RP-001, RP-002], upcoming = [RP-004, RP-005], past = [RP-003].
   - `useActiveRanking` `buildResult` for Team 1 → `current = [RP-001, RP-006]`, `program = RP-001`.
   - `publishProgram('RP-005')` (Oct–Dec, all teams) → RP-004 (Oct, Team 1) ends up `completed`? No: RP-004 is scheduled and overlaps → it is replaced (ended). RP-006 stays `active`. Then `disableDefault('RP-006')` → `inactive`; `publishProgram('RP-006')` → `active`.
   - `endProgram('RP-001')` → completed, RP-006 still active (no fallback call).
   - `ownStanding(RP-001, standings, 'AGT-004')` returns a rank, a gap and a lead that are consistent with the standings array.
4. Manual code review: no raw CSS colours, no emoji on the agent page, every new colour is a Mantine variable; `AgentRankingView` is used only by the agent page; the supervisor dashboard still renders.

## Story notes (later)

- Default is the team's permanent index; dated rankings are pushes with a prize. Only one dated ranking per team at a time.
- The agent sees the same numbers as the supervisor, framed around their own place.
- Open: should a disabled default hide the agent's Rankings section entirely, or show "no ranking on"?

# Rankings: one view for every role (agent, supervisor, QA manager, operation manager)

## Context

What a supervisor or QA manager configures under Rankings is what the agent competes in under Team Ranking, but today the two sides are built from different components, different numbers and different words. The manager's ranking page (`src/modules/qa/rankings/RankingDetailPage/`) shows a `StandingsTable` (rank, agent, team, scorecard bar vs target with breakdown, calls, 7-day movement, badges) over the full ranking period. The agent's page (`src/modules/qa/agent/rankings/TeamRankingsPage.tsx`) shows an `ExpandedRankingsTable` (rank, name, plain score, badges, reactions) **recomputed over a 7-day or 30-day window**, so an agent can see a different rank than their supervisor. Headers, stat tiles, podium, drawer wording and sidebar labels all differ, and the operation manager's dashboard widget uses fake data with a second reaction model.

Decisions made with the user (2026-10-12): **one shared ranking view** (header, stat tiles, podium, standings, prize + milestones aside) used by the manager page and the agent's Current tab, with the mobile card grid kept for all roles; **full ranking period everywhere** (the 7d/30d toggle goes); **everyone sees reactions when the ranking allows them, only agents react**; **operation manager / super admin included** (dashboard widget fed by the store, dead route and old panels and the second reaction model deleted, sidebar made consistent).

Mode: refinement. Mockup-level, same store (`rankingsStore`) and mock data. Light and dark mode via Mantine variables and `var(--surface-*)`; CSS modules; no inline styles beyond the existing documented exceptions. No tests. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-12-rankings-one-view-all-roles.md`.

---

## Critique summary

|            | Manager page                                                                              | Agent page                                                                                                 | Supervisor dashboard                              | Operation manager                                                                         |
| ---------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Standings  | `StandingsTable`: # · Agent · Team · Scorecard (bar + breakdown) · Calls · 7-day · Badges | `ExpandedRankingsTable`: Rank · Name · Scorecard (plain) · Badges · Reactions; sortable; card grid ≤1024px | agent table, reactions and badges hidden          | `RankingsTable`: static entries, 5-emoji model, English only                              |
| Period     | full ranking period                                                                       | **7d/30d window** (`TeamRankingsPage.tsx:50-57`)                                                           | week window (`NewSupervisorDashboard.tsx:76,101`) | fake                                                                                      |
| Header     | title, status, default, chips, 4 stat tiles                                               | `LeaderboardHeader`: set by, prize, chips, dates, target, progress; podium; no tiles                       | —                                                 | goal banner                                                                               |
| Row detail | none                                                                                      | drawer with hardcoded English, "Streak" always 0 (`RankingDetailDrawer.tsx:109,145`)                       | —                                                 | —                                                                                         |
| Words      | "#", "Agent", "Milestones", "Below minimum calls"                                         | "Rank", "Name", "Badges" / "Achievements", "Unranked", "leaderboards"                                      |                                                   | "Team Rankings"                                                                           |
| Sidebar    | "Rankings Config" / "Rankings"                                                            | "Team Ranking"                                                                                             |                                                   | "Supervisor Rankings" → the agent page; `operationmanager/rankings` is a dead empty panel |
| Reactions  | none                                                                                      | `LeaderboardReactions` bound to the agent persona's own active program (`useUserReaction.ts:33-41`)        | hidden                                            | separate `models/qa/reactions.ts`                                                         |

Keep: `computeStandings`, `MetricChips`, `PodiumStrip`, `PastRankingsCard`, `ScoreBreakdown`, `WinnerBadge`, the agent drawer's Badges/Reactions tabs, the store's reaction map, `useActiveRanking`.

---

## Direction

```
RankingView (shared, src/modules/qa/rankings/components/)
├─ RankingHeader      name · description · set by · status · default · prize · metric chips · start/end/target/days left · progress · [actions slot]
├─ RankingStats       Participants · Qualified · Reached target · Leader/Winner
├─ PodiumStrip        (existing)
└─ Grid
   ├─ RankingStandings (md=8)  "Standings" card: StandingsTable ≥1024px / StandingsCardGrid below; columns Rank · Agent · Team? · Scorecard · Calls · 7-day · Badges · Reactions?
   └─ aside (md=4)              Prize card · Milestone badges card
```

Manager page: `RankingView` + Edit action, reactions read-only. Agent Current tab: `RankingView` + reactions interactive + row click → drawer. Supervisor dashboard and operation-manager dashboard: `RankingStandings` alone, fed by the store, full period. One vocabulary in `qa.rankings.json`.

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-12-rankings-one-view-all-roles.md`.

### Phase 1 — Vocabulary, sidebar, dead routes

**1a. `src/locales/{en,es}/qa.rankings.json`** (both LF). Changes under existing groups:

- `drawer.columns.rank`: "#" → **"Rank"** / "Posición". Add `drawer.columns.reactions`: "Reactions" / "Reacciones".
- `drawer.milestones`: "Milestones" → **"Milestone badges"** / "Insignias por hitos" (matches the editor's section name and the Badges column).
- Add under `drawer`:
  ```json
  "winnerHint": "Winner of this ranking",
  "viewDetails": "View details",
  "detailDescription": "Standing in the current ranking",
  "stats": { "rank": "Rank" },
  "signals": {
    "held": "Held position since last week",
    "up_one": "Up {{count}} position since last week",
    "up_other": "Up {{count}} positions since last week",
    "down_one": "Down {{count}} position since last week",
    "down_other": "Down {{count}} positions since last week",
    "tied": "Tied with next position",
    "lead_one": "{{count}} point ahead of next",
    "lead_other": "{{count}} points ahead of next",
    "reactions_one": "{{count}} reaction received",
    "reactions_other": "{{count}} reactions received",
    "badges_one": "{{count}} badge earned",
    "badges_other": "{{count}} badges earned"
  }
  ```
  es: "Ganador de este ranking", "Ver detalle", "Posición en el ranking actual", `stats.rank` "Posición", signals: "Mantiene la posición desde la semana pasada", "Sube {{count}} posición desde la semana pasada" / "Sube {{count}} posiciones…", "Baja {{count}} posición…" / "Baja {{count}} posiciones…", "Empatado con la siguiente posición", "{{count}} punto por delante del siguiente" / "{{count}} puntos…", "{{count}} reacción recibida" / "{{count}} reacciones recibidas", "{{count}} insignia conseguida" / "{{count}} insignias conseguidas".
- `agent.tabs.current`: "Current leaderboard" → **"Current ranking"**; `agent.tabs.past`: "Past leaderboards" → **"Past rankings"** (es already correct).
- Delete `agent.leaderboard`, `agent.leaderboardDescription`, `agent.past.unranked` (use `drawer.unranked`), and the whole `table` group (its five keys move to `drawer.columns`).
- Validate both files with `node -e "JSON.parse(...)"`.

**1b. Sidebar — `src/locales/{en,es}/common.json`** (LF): `sidebar.supervisor.rankingsConfig` → "Rankings" / "Rankings"; `sidebar.operationmanager.supervisorRankings` → "Rankings" / "Rankings"; leave `sidebar.agent.rankings` "Team Ranking" / "Ranking del equipo" and `sidebar.qamanager.rankings`. The same labels appear twice in each file (the per-role group at en L166/212, es L164/210 — the one `roleNavigation.tsx` reads — and a flat group at en ~L245/251, es ~L243/249); change both occurrences so the two groups stay in step.
`src/components/Sidebar/roleNavigation.tsx` (LF): operation manager item (L413-417) and super admin item (L478-482) → `to: '/qa/qa-manager/rankings'`, `i18nNamespace: 'qa.rankings'` (both scopes see every team there).

**1c. Dead route and panels.** `src/routes.tsx` (LF): delete the `operationmanager/rankings` route object (L1879-1890 incl. the "Phase 4" comment) and the `SupervisorRankingsConfigPanel` lazy import (L220-224). Delete `src/modules/qa/operationmanager/configuration/SupervisorRankingsConfigPanel.tsx` and remove its line from `src/modules/qa/operationmanager/configuration/index.ts` (delete the index if it becomes empty); delete `src/modules/qa/supervisor/configuration/RankingsConfigPanel.tsx` and its barrel line if any (`grep -rn RankingsConfigPanel src` must return nothing). Delete `src/modules/qa/dashboard/components/LeaderboardTable.tsx` and its export line in `dashboard/components/index.ts`.

`npm run typecheck`.

### Phase 2 — Reactions for every role

**2a. `src/modules/qa/agent/rankings/hooks/useUserReaction.ts`:** take the program explicitly instead of deriving it from the persona's team:

```ts
export const useUserReaction = (programId: string, agentId: string): UseUserReactionResult => {
	const reactions = useRankingsStore(selectReactions);
	const persist = useRankingsStore((state) => state.setReaction);
	const given = reactions[programId]?.[agentId] ?? {};
	…totals as today…
	const setReaction = useCallback(
		(reaction: UserReactionType | null) => persist(programId, agentId, AGENT_PERSONA_ID, reaction),
		[programId, agentId, persist]
	);
	return { currentReaction: given[AGENT_PERSONA_ID] ?? null, totals, disabled: agentId === AGENT_PERSONA_ID, setReaction };
};
```

Drop the `programs`/`TEAM_AGENTS` lookup and imports.

**2b. `src/modules/qa/agent/rankings/components/LeaderboardReactions.tsx`:** props become `{ programId: string; agentId: string; agentName: string; size?: 'sm' | 'md'; readOnly?: boolean }`. Call `useUserReaction(programId, agentId)`. When `readOnly`: render only the emojis that have a count, as `Text size='xs'` chips (`{icon} {count}`), or `—` when none; no buttons, no "Your standing" text. Keep the interactive branch as today.

**2c. Update the two remaining callers** (`RankingDetailDrawer.tsx:220`, `ReactionsTab.tsx` if it calls the hook — it reads the store directly per the exploration, so only the drawer): pass `programId={program.id}`.

`npm run typecheck` (fails in the table/card until Phase 4 deletes them; expected).

### Phase 3 — Shared ranking view (`src/modules/qa/rankings/components/`)

**3a. `RankingHeader.tsx`** — from the agent's `LeaderboardHeader` plus the manager's badges and an actions slot:

```tsx
import type { ReactNode } from 'react';
import { Badge, Group, Progress, Stack, Text, Title } from '@mantine/core';
import {
	IconCalendar,
	IconClock,
	IconStar,
	IconTarget,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { STATUS_COLOR } from '../constants';
import { daysLeft, elapsedPct, formatTarget, isPermanent } from '../helpers';
import MetricChips from './MetricChips';
import styles from '../Rankings.module.css';

interface RankingHeaderProps {
	program: RankingProgram;
	/** Page-level actions (e.g. Edit) shown at the right of the title. */
	actions?: ReactNode;
}

function Fact({
	label,
	icon,
	children,
}: {
	label: string;
	icon?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div>
			<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
				{label}
			</Text>
			<Group gap={4} mt={4} wrap='nowrap'>
				{icon}
				<Text size='sm' fw={500}>
					{children}
				</Text>
			</Group>
		</div>
	);
}

/** Name, status, prize, metrics and period of a ranking: the same header for whoever is looking. */
export function RankingHeader({ program, actions }: RankingHeaderProps) {
	const { t } = useTranslation('qa.rankings');
	const remaining = daysLeft(program);
	const elapsed = elapsedPct(program);
	const permanent = isPermanent(program);
	const completed = program.status === 'completed';
	return (
		<Stack gap='md'>
			<Group justify='space-between' align='flex-start' wrap='wrap'>
				<Stack gap={6}>
					<Title order={1}>{program.name}</Title>
					{program.description && (
						<Text size='sm' c='dimmed'>
							{program.description}
						</Text>
					)}
					<Text size='xs' c='dimmed'>
						{t('agent.header.setBy', { name: program.createdBy })}
					</Text>
					<Group gap='xs' mt={4}>
						<Badge variant='light' color={STATUS_COLOR[program.status]}>
							{t(`status.${program.status}`)}
						</Badge>
						{program.isDefault && (
							<Badge
								variant='outline'
								color='gray'
								leftSection={<IconStar size={12} />}
							>
								{t('card.default')}
							</Badge>
						)}
						<Badge
							size='lg'
							variant='light'
							color='yellow'
							className={styles.prizeChip}
							leftSection={program.prize.icon}
						>
							{program.prize.title}
						</Badge>
					</Group>
				</Stack>
				{actions}
			</Group>
			<MetricChips program={program} size='md' />
			<Group gap='xl' wrap='wrap'>
				<Fact label={t('editor.start')} icon={<IconCalendar size={16} />}>
					{dayjs(program.startDate).format('DD MMM YYYY')}
				</Fact>
				<Fact label={t('editor.end')} icon={<IconClock size={16} />}>
					{program.endDate
						? dayjs(program.endDate).format('DD MMM YYYY')
						: t('agent.header.noEndDate')}
				</Fact>
				<Fact label={t('editor.target')} icon={<IconTarget size={16} />}>
					{formatTarget(program)}
				</Fact>
				<Fact
					label={
						completed
							? t('agent.header.completed')
							: permanent
								? t('agent.header.ongoing')
								: t('agent.header.daysLeft', { count: remaining ?? 0 })
					}
				>
					{''}
				</Fact>
			</Group>
			{elapsed !== null && (
				<Progress
					value={elapsed}
					radius='md'
					size='sm'
					color={completed ? 'gray' : 'blue'}
				/>
			)}
		</Stack>
	);
}
export default RankingHeader;
```

(For the last fact keep the agent header's behaviour: the label alone carries the days-left text; render it as `<Text size='xs' c='dimmed' tt='uppercase' fw={600}>` without a value row rather than an empty `Fact`.)

**3b. `RankingStats.tsx`** — the four `StatCard`s now inline in `RankingDetailPage.tsx:118-131`, as `RankingStats({ program, standings })` (`SimpleGrid cols={{ base: 2, md: 4 }}`; `drawer.participants`, `drawer.qualified`, `drawer.reachedTarget` (green), leader/winner).

**3c. `StandingsTable.tsx`** (existing) — extend, keep the file:

- Props: add `onRowClick?: (standing: RankingStanding) => void`, `reactions?: 'off' | 'readonly' | 'interactive'` (default `'off'`).
- Rank cell: when `program.status === 'completed' && standing.rank === 1` render `<WinnerBadge isWinner />` beside the number (move `WinnerBadge.tsx` from `agent/rankings/components/` to `rankings/components/` and translate: tooltip `drawer.winnerHint`, label `drawer.winner`).
- Reactions column (last) when `reactions !== 'off'`: header `drawer.columns.reactions`, cell `<LeaderboardReactions programId={program.id} agentId={standing.agentId} agentName={standing.agentName} readOnly={reactions === 'readonly'} />` (import from `~/modules/qa/agent/rankings/components/LeaderboardReactions`).
- Row: `data-clickable` + `onClick` when `onRowClick`; add `.clickableRow { cursor: pointer; }` to `Rankings.module.css`; keep `.currentRow`.
- Everything else (bar vs target, breakdown tooltip, calls, 7-day, badges) unchanged. Header "Rank" now comes from the renamed key.

**3d. `StandingCard.tsx` + `StandingsCardGrid.tsx`** — the narrow layout for every role, typed to `RankingStanding` (replaces `agent/rankings/components/RankingCard*`). Card content, in order: rank badge (`#n` or `drawer.unranked` badge) + `WinnerBadge`; name; `formatScore(program, score)` as `Text size='xl' fw={700}` with a small `Progress` vs target under it; one line `t('drawer.columns.calls')`: calls · `drawer.columns.delta`: ±delta; milestone badge icons (first 2, "+N"), empty → `achievements.empty`; reactions row via `LeaderboardReactions` when `reactions !== 'off'`; "View details" footer (`drawer.viewDetails`) when clickable. Move `RankingCard.module.css` to `rankings/components/StandingCard.module.css` (it already uses Mantine variables; check `.card[data-current]` uses `light-dark()` or `var(--mantine-color-blue-light)`). Props of the grid: `{ program, standings, currentAgentId?, onRowClick?, reactions? }`; `SimpleGrid cols={{ base: 1, md: 2 }}`.

**3e. `RankingStandings.tsx`** — the card both dashboards and the view use:

```tsx
interface RankingStandingsProps {
	program: RankingProgram;
	standings: RankingStanding[];
	currentAgentId?: string;
	onRowClick?: (standing: RankingStanding) => void;
	reactions?: 'off' | 'readonly' | 'interactive';
	headerActions?: ReactNode;
}
/** The standings card: table on wide screens, cards below 1024px, same columns for every role. */
export function RankingStandings({
	program,
	standings,
	currentAgentId,
	onRowClick,
	reactions = 'off',
	headerActions,
}: RankingStandingsProps) {
	const { t } = useTranslation('qa.rankings');
	const isCompact = useMediaQuery('(max-width: 1024px)');
	const qualified = standings.filter((s) => s.rank !== null);
	return (
		<SectionCard
			title={t('drawer.standings')}
			description={`${t('editor.target')}: ${formatTarget(program)}`}
			headerActions={
				<Group gap='sm' wrap='nowrap'>
					{headerActions}
					<Badge variant='light' size='sm'>
						{standings.length}
					</Badge>
				</Group>
			}
		>
			{qualified.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('drawer.pending')}
				</Text>
			) : isCompact ? (
				<StandingsCardGrid
					program={program}
					standings={standings}
					currentAgentId={currentAgentId}
					onRowClick={onRowClick}
					reactions={reactions}
				/>
			) : (
				<StandingsTable
					program={program}
					standings={standings}
					currentAgentId={currentAgentId}
					onRowClick={onRowClick}
					reactions={reactions}
					showTeam={program.teams.length > 1}
				/>
			)}
		</SectionCard>
	);
}
```

**3f. `RankingView.tsx`** — the composition:

```tsx
interface RankingViewProps {
	program: RankingProgram;
	standings: RankingStanding[];
	/** Who is looking: their own row is highlighted and, if they are an agent, they can react. */
	viewer: { currentAgentId?: string; canReact: boolean };
	actions?: ReactNode;
	onRowClick?: (standing: RankingStanding) => void;
}
export function RankingView({
	program,
	standings,
	viewer,
	actions,
	onRowClick,
}: RankingViewProps) {
	const { t } = useTranslation('qa.rankings');
	const badges = useTriggerRulesStore((s) => s.badges);
	const reactions = !program.allowReactions
		? 'off'
		: viewer.canReact
			? 'interactive'
			: 'readonly';
	return (
		<Stack gap='lg'>
			<RankingHeader program={program} actions={actions} />
			<RankingStats program={program} standings={standings} />
			<PodiumStrip program={program} standings={standings} />
			<Grid gap='md'>
				<Grid.Col span={{ base: 12, md: 8 }}>
					<RankingStandings
						program={program}
						standings={standings}
						currentAgentId={viewer.currentAgentId}
						onRowClick={onRowClick}
						reactions={reactions}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Stack gap='md'>
						{/* Prize card and Milestone badges card: the JSX now in RankingDetailPage.tsx:187-242, unchanged */}
					</Stack>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}
```

Move the prize and milestones cards' JSX out of `RankingDetailPage.tsx` into here verbatim (titles `drawer.prize`, `drawer.milestones`).

`npm run typecheck`.

### Phase 4 — Pages and dashboards

**4a. `src/modules/qa/rankings/RankingDetailPage/RankingDetailPage.tsx`:** keep role/lookup/`syncMilestones`/standings/back/edit logic; the body becomes breadcrumbs + `<RankingView program={program} standings={standings} viewer={{ canReact: false }} actions={<Button variant='default' leftSection={<IconEdit size={16} />} onClick={editRanking}>{t('card.edit')}</Button>} />`. Remove the now-unused imports (`Badge`, `Grid`, `SimpleGrid`, `StatCard`, `MetricChips`, `StandingsTable`, `STATUS_COLOR`, `formatScore`, `formatTarget`, `isPermanent`, `leader`, `useTriggerRulesStore`, `IconStar`, `dayjs`).

**4b. `src/modules/qa/agent/rankings/TeamRankingsPage.tsx`** (CRLF):

- Use `const { program, standings, pastPrograms } = useActiveRanking();` — the hook's full-period standings. Delete the `period`/`days`/`computeStandings` recomputation, the `SegmentedControl`, `useMediaQuery`, `PERFORMANCE_SCORE_PERIODS`/`performanceScoreDays`/`DEFAULT_PERFORMANCE_SCORE_PERIOD`/`TODAY`/`TEAM_CALLS`/`tDashboard` imports.
- Keep `entries = standings.map((s) => toRankingEntry(s, program))` only for the drawer.
- `selectedEntry` state stays; `onRowClick={(standing) => setSelectedEntry(entries.find((e) => e.agentId === standing.agentId) ?? null)}`.
- Current tab: `!program ? <EmptyState …agent.empty.noActive /> : <RankingView program={program} standings={standings} viewer={{ currentAgentId: AGENT_PERSONA_ID, canReact: true }} onRowClick={…} />`. Past tab unchanged. Drawer unchanged apart from Phase 2c and 4c.

**4c. `src/modules/qa/agent/rankings/components/RankingDetailDrawer.tsx`:** translate and trim: description `t('drawer.detailDescription')`; QuickStats → `t('drawer.stats.rank')` and `t('drawer.columns.score')`; **delete the Streak stat** (and `streak`); signal labels → `t('drawer.signals.held')`, `t('drawer.signals.up', { count })` / `down`, `tied`, `lead`, `reactions`, `badges` (i18next picks `_one`/`_other`); tab labels → `t('drawer.columns.milestones')` and `t('drawer.columns.reactions')`; the "See the Achievements tab for detail" tooltip → `t('drawer.columns.milestones')`. `LeaderboardReactions` gets `programId={program.id}`.

**4d. `src/modules/qa/dashboard/pages/NewSupervisorDashboard.tsx`** (LF): `const { program, standings } = useActiveRankingByTeam('Team 1');` replaces the window recompute (delete `rankingsDays`, the `computeStandings(...)` memo, `toRankingEntry`, `entries`, `renderScore`, `isCompact` if only used here, and the `ExpandedRankingsTable` / `RankingCardGrid` imports). The card (L215-236) becomes `<RankingStandings program={program} standings={standings} />` (reactions off, no row click). Remove `agent.leaderboard` usage.

**4e. `src/modules/qa/dashboard/pages/NewOperationManagerDashboard.tsx`** (CRLF): delete `OPERATION_MANAGER_RANKING_GOAL` and `OPERATION_MANAGER_RANKINGS` (L324-~380) and the `RankingEntry`/`RankingGoal`/`RankingsTable` imports. Add `const programs = useRankingsStore(selectPrograms); const liveProgram = useMemo(() => sortPrograms(programs.filter((p) => p.status === 'active'))[0] ?? null, [programs]); const liveStandings = useMemo(() => (liveProgram ? computeStandings(liveProgram, TEAM_CALLS) : []), [liveProgram]);` (imports: `useRankingsStore, selectPrograms` from `~/stores/qa/rankingsStore`; `computeStandings, sortPrograms` from `~/modules/qa/rankings/helpers`; `TEAM_CALLS` from `~/modules/qa/analytics/mockData`; `RankingStandings` from `~/modules/qa/rankings/components/RankingStandings`; `useMemo`). The rankings tab panel renders `liveProgram ? <RankingStandings program={liveProgram} standings={liveStandings} reactions={liveProgram.allowReactions ? 'readonly' : 'off'} headerActions={<Button size='xs' variant='subtle' onClick={() => navigate('/qa/qa-manager/rankings')}>{t('page.title', { ns: 'qa.rankings' })}</Button>} /> : <EmptyState message={t('empty.none', { ns: 'qa.rankings' })} />`. Tab label "Team Rankings" → `t('page.title', { ns: 'qa.rankings' })`. Add `'qa.rankings'` to this dashboard's namespaces in `qaNamespaces.ts` if the operation-manager dashboard id does not list it yet (`qa.dashboards.operation-manager` already does).

**4f. Deletions** (after typecheck passes with the new components): `agent/rankings/components/ExpandedRankingsTable.tsx` + `.module.css`, `RankingCardGrid.tsx`, `RankingCard.tsx` + `.module.css` (moved; copy only the classes `StandingCard` uses: `.card`, `[data-clickable]`, `:hover`, `:focus-visible`, `.nameBlock`, `.score`, `.achievement`, `.divider`, `.footer`, `[data-current]`), `LeaderboardHeader.tsx`, `hooks/useLeaderboardStatus.ts` (its only callers were the deleted table and card — verified), `WinnerBadge.tsx` (moved), `dashboard/components/RankingsTable.tsx` + its four export lines in `dashboard/components/index.ts`. `src/models/qa/reactions.ts` and `src/modules/qa/recognition/ReactionManager.ts` (+ its two export lines in `recognition/index.ts`) go only after `grep -rn "models/qa/reactions\|ReactionManager" src` shows no other user; the rest of `recognition/` (BadgesAndAchievements, InboxAlertGenerator) stays. Keep `gamification.ts` intact: `buildRankIndex` is used by `getPointLeadFromRoster`, which the drawer still calls. `operationmanager/configuration/index.ts` only exported the deleted panel: delete it too (grep `operationmanager/configuration` first); `supervisor/configuration` has no barrel.

`npm run typecheck`; `npx prettier --write` on every file created or edited above (explicit list, never a folder); typecheck again.

---

## Files touched

- New (`src/modules/qa/rankings/components/`): `RankingHeader.tsx`, `RankingStats.tsx`, `RankingStandings.tsx`, `RankingView.tsx`, `StandingCard.tsx` + `StandingCard.module.css` (moved), `StandingsCardGrid.tsx`, `WinnerBadge.tsx` (moved)
- Edited: `rankings/components/StandingsTable.tsx`, `rankings/Rankings.module.css`, `rankings/RankingDetailPage/RankingDetailPage.tsx`, `agent/rankings/TeamRankingsPage.tsx`, `agent/rankings/components/RankingDetailDrawer.tsx`, `agent/rankings/components/LeaderboardReactions.tsx`, `agent/rankings/hooks/useUserReaction.ts`, `dashboard/pages/NewSupervisorDashboard.tsx`, `dashboard/pages/NewOperationManagerDashboard.tsx`, `dashboard/components/index.ts`, `components/Sidebar/roleNavigation.tsx`, `src/routes.tsx`, `src/locales/{en,es}/qa.rankings.json`, `src/locales/{en,es}/common.json`
- Deleted: listed in 4f and 1c
- Plan copy: `docs/superpowers/plans/2026-10-12-rankings-one-view-all-roles.md`

## Out of scope (noted)

- Sortable columns (the agent table had them; the shared table keeps rank order).
- Letting managers react.
- The `drawer.*` key prefix (kept to limit churn; it now names the shared view's strings).
- `AgentRankingEntry` stays for the drawer's gamification helpers and its two tabs.

## Verification

1. `npm run typecheck` passes; `grep -rn "ExpandedRankingsTable\|RankingCardGrid\|LeaderboardHeader\|RankingsTable\|models/qa/reactions\|SupervisorRankingsConfigPanel\|agent.leaderboard\|table\.\(rank\|name\|score\|achievements\|reactions\)" src` returns nothing.
2. **Same numbers:** open `/qa/supervisor/rankings`, the live Team 1 ranking, note rank and scorecard of three agents; open `/qa/agent/rankings` as the agent: identical ranks and scores, identical header (name, set by, status, prize, chips, dates, target, days left), stat tiles, podium, standings columns (Rank · Agent · Scorecard · Calls · 7-day · Badges · Reactions), prize and milestone cards. Only differences: the manager sees an Edit button and read-only reaction counts; the agent sees their row highlighted and can react (not on their own row).
3. Reactions: as the agent, react to a teammate; as the supervisor, the same count shows read-only on the ranking page and the supervisor dashboard card (when the ranking allows reactions); a ranking with reactions off shows no column anywhere.
4. Agent page: no 7d/30d control; Current ranking / Past rankings tab labels; row click opens the drawer with translated stats (no Streak), signals and Badges / Reactions tabs; narrow width (<1024px) shows the card grid with the same facts, for the agent and on the manager page alike.
5. Dashboards: supervisor dashboard standings match the ranking page (no week window); operation-manager dashboard "Rankings" tab shows the live ranking from the store with team column and read-only reactions, "Rankings" header button opens `/qa/qa-manager/rankings`; no ranking → "No rankings yet" message.
6. Sidebar: Supervisor and QA manager "Rankings", agent "Team Ranking", operation manager and super admin "Rankings" → `/qa/qa-manager/rankings`; `/qa/operationmanager/rankings` no longer routes.
7. Light and dark mode on the standings card and card grid; Spanish: every new `drawer.*` string resolves, plurals pick `_one`/`_other`.

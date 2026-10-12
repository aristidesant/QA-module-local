# Rankings configuration: filters instead of status tabs

## Context

The manager Rankings page (`src/modules/qa/rankings/ManagerRankingsPage/ManagerRankingsPage.tsx`, routes `/qa/supervisor/rankings` and `/qa/qa-manager/rankings`) splits one list of rankings into four tabs (Active, Inactive, Completed, Drafts), above a KPI row that repeats the same four counts. The user wants status handled by a filtering system, like the other QA list pages, so one list can be searched, narrowed and compared without hopping between tabs.

Decisions made with the user (2026-10-12): **keep the card grid**; filters = **status (multi), team (QA manager only), metric area, period (live / upcoming / ended)** plus search; default view = **everything except completed**; **remove the KPI row** and show each status count inside the status filter.

Mode: refinement. Mockup-level, no backend, same store and mock data. Filters live in the URL (`?status=…&area=…`) so the editor's "back after save" and shared links keep working. No tests. Prettier on touched files only.

Note: the working tree has an uncommitted change (`useSentimentAxis` + the two customer charts). Leave it alone; it is unrelated.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-12-rankings-filters-instead-of-tabs.md`.

---

## Critique summary

| Finding                                                                                                                                                                                                         | Severity | Evidence                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- |
| Status tabs make four silos of one list: you cannot see a draft next to the live ranking it will replace, and every status change moves the card to another tab (`setTab('active')`, `'drafts'`, `'completed'`) | Critical | `ManagerRankingsPage.tsx:107,216,226` |
| KPI row (Active / Inactive / Completed / Agents) repeats the tab badges; the only extra number is "agents participating"                                                                                        | Moderate | `:155-177` vs `:185-191`              |
| No search, no team / metric / period narrowing, no sort; cards appear in store order                                                                                                                            | Moderate | `byTab` `:73-81` has no sort          |
| `?tab=` is read once on mount and never written back, so refresh / share loses the view                                                                                                                         | Minor    | `:61-65`                              |
| Four different empty-state copies, one per tab                                                                                                                                                                  | Minor    | `empty.*` locale keys                 |
| Cards themselves are fine: status switch, metric chips, period bar, prize, leader; keep as is                                                                                                                   | —        | `RankingProgramCard.tsx`              |

What to mirror: `customers/CustomersPage/CustomerFilters.tsx` (controlled `value`/`onChange`, "Clear" only when not default), `coaching/.../SessionsTab.tsx` (`clearable` Selects at fixed widths, search `w={240}`).

---

## Direction

One list, one bar: **search · status chips with counts · metric area · period · team (QA manager)** · Clear, and a dimmed summary ("8 rankings · 21 agents in live rankings") at the right. Cards sorted live first (active → draft → inactive → completed, then newest start date). Filters in the URL. One empty state for "no match", one for "no rankings yet".

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase. Do not commit unless asked.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-12-rankings-filters-instead-of-tabs.md`.

### Phase 1 — Types, helpers, locale

**1a. `src/modules/qa/rankings/constants.ts`** — delete `RANKING_TABS` and `RankingTab` (lines 49-55; the three users are rewritten below). Add:

```ts
/** Where a ranking sits in time, independent of its status. */
export type RankingPeriod = 'live' | 'upcoming' | 'ended';
export const RANKING_PERIODS: RankingPeriod[] = ['live', 'upcoming', 'ended'];

/** Order of the status filter chips and of the cards: what can change first, what is over last. */
export const RANKING_STATUS_ORDER: RankingStatus[] = [
	'active',
	'draft',
	'inactive',
	'completed',
];
/** What the list shows before any filter is touched: everything that can still change. */
export const DEFAULT_RANKING_STATUSES: RankingStatus[] = [
	'active',
	'inactive',
	'draft',
];
```

(`RankingStatus` is already imported there.)

**1b. `src/modules/qa/rankings/helpers.ts`** — add after `programsForRole`:

```ts
import type { RankingPeriod } from './constants';
import { RANKING_STATUS_ORDER } from './constants';
import { RANKING_METRIC_BY_ID, type RankingMetricArea } from './metrics';

export interface RankingFilters {
	q: string;
	status: RankingStatus[];
	team: string | null;
	area: RankingMetricArea | null;
	period: RankingPeriod | null;
}

export const periodOf = (program: RankingProgram): RankingPeriod =>
	program.endDate !== null && program.endDate < TODAY
		? 'ended'
		: program.startDate > TODAY
			? 'upcoming'
			: 'live';

export const programAreas = (program: RankingProgram): RankingMetricArea[] => [
	...new Set(program.metrics.map((m) => RANKING_METRIC_BY_ID[m.metricId].area)),
];

/** Every filter except status; status is applied separately so its chip counts can reflect the rest. */
export const matchesRankingFacets = (
	program: RankingProgram,
	f: Pick<RankingFilters, 'q' | 'team' | 'area' | 'period'>
): boolean => {
	const q = f.q.trim().toLowerCase();
	if (q && !program.name.toLowerCase().includes(q)) return false;
	if (f.team && !program.teams.includes(f.team)) return false;
	if (f.area && !programAreas(program).includes(f.area)) return false;
	if (f.period && periodOf(program) !== f.period) return false;
	return true;
};

export const applyRankingFilters = (
	programs: RankingProgram[],
	f: RankingFilters
): RankingProgram[] =>
	programs.filter(
		(p) => f.status.includes(p.status) && matchesRankingFacets(p, f)
	);

/** Live first, then drafts, inactive and completed; newest start date first inside each group. */
export const sortPrograms = (programs: RankingProgram[]): RankingProgram[] =>
	[...programs].sort(
		(a, b) =>
			RANKING_STATUS_ORDER.indexOf(a.status) -
				RANKING_STATUS_ORDER.indexOf(b.status) ||
			b.startDate.localeCompare(a.startDate)
	);
```

`helpers.ts` already imports `TODAY`, `RankingProgram`/`RankingStatus`, `./constants` and `./metrics` (verified: `metrics.ts` does not import `helpers.ts`, so no cycle); extend those existing import lines rather than adding duplicates.

**1c. Locale — `src/locales/{en,es}/qa.rankings.json`.** Remove `kpis` and `tabs` entirely, and the four keys under `empty`. Add (nested into existing objects; validate with `node -e "JSON.parse(...)"` for both):

`en`:

```json
"filters": {
  "search": "Search rankings",
  "status": "Status",
  "area": "Metric area",
  "period": "Period",
  "periods": { "live": "Live now", "upcoming": "Upcoming", "ended": "Ended" },
  "team": "Team",
  "clear": "Clear filters",
  "summary_one": "{{count}} ranking · {{agents}} agents in live rankings",
  "summary_other": "{{count}} rankings · {{agents}} agents in live rankings"
},
"empty": {
  "noMatch": "No rankings match these filters",
  "none": "No rankings yet — create one to motivate the team"
}
```

`es`:

```json
"filters": {
  "search": "Buscar rankings",
  "status": "Estado",
  "area": "Área de la métrica",
  "period": "Período",
  "periods": { "live": "En curso", "upcoming": "Próximos", "ended": "Finalizados" },
  "team": "Equipo",
  "clear": "Limpiar filtros",
  "summary_one": "{{count}} ranking · {{agents}} agentes en rankings activos",
  "summary_other": "{{count}} rankings · {{agents}} agentes en rankings activos"
},
"empty": {
  "noMatch": "Ningún ranking coincide con estos filtros",
  "none": "Todavía no hay rankings — crea uno para motivar al equipo"
}
```

Status chip labels reuse `status.*`; area labels reuse `areas.*`.

`npm run typecheck` (fails in the page / form / editor until Phase 3; expected).

### Phase 2 — URL-backed filter state and the filter bar

**2a. New `src/modules/qa/rankings/hooks/useRankingFilters.ts`:**

```ts
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { RankingStatus } from '~/models/qa/rankingPrograms';
import {
	DEFAULT_RANKING_STATUSES,
	RANKING_PERIODS,
	RANKING_STATUS_ORDER,
	TEAMS,
	type RankingPeriod,
} from '../constants';
import type { RankingFilters } from '../helpers';
import { RANKING_METRIC_AREAS, type RankingMetricArea } from '../metrics';

export const DEFAULT_RANKING_FILTERS: RankingFilters = {
	q: '',
	status: DEFAULT_RANKING_STATUSES,
	team: null,
	area: null,
	period: null,
};

const sameStatuses = (a: RankingStatus[], b: RankingStatus[]) =>
	a.length === b.length && a.every((s) => b.includes(s));

export const isDefaultRankingFilters = (f: RankingFilters): boolean =>
	f.q === '' &&
	sameStatuses(f.status, DEFAULT_RANKING_STATUSES) &&
	f.team === null &&
	f.area === null &&
	f.period === null;

/** Filters live in the URL: `?q=&status=active,draft&team=&area=&period=`; absent means default. */
export function useRankingFilters() {
	const [params, setParams] = useSearchParams();

	const filters = useMemo<RankingFilters>(() => {
		const statusParam = params.get('status');
		const status =
			statusParam === null
				? DEFAULT_RANKING_STATUSES
				: statusParam
						.split(',')
						.filter((s): s is RankingStatus =>
							RANKING_STATUS_ORDER.includes(s as RankingStatus)
						);
		const team = params.get('team');
		const area = params.get('area');
		const period = params.get('period');
		return {
			q: params.get('q') ?? '',
			status,
			team: team && TEAMS.includes(team) ? team : null,
			area:
				area && RANKING_METRIC_AREAS.includes(area as RankingMetricArea)
					? (area as RankingMetricArea)
					: null,
			period:
				period && RANKING_PERIODS.includes(period as RankingPeriod)
					? (period as RankingPeriod)
					: null,
		};
	}, [params]);

	const setFilters = useCallback(
		(next: RankingFilters) => {
			setParams(
				(prev) => {
					const out = new URLSearchParams(prev);
					const put = (key: string, value: string | null) =>
						value ? out.set(key, value) : out.delete(key);
					put('q', next.q.trim() || null);
					put(
						'status',
						sameStatuses(next.status, DEFAULT_RANKING_STATUSES)
							? null
							: next.status.join(',')
					);
					put('team', next.team);
					put('area', next.area);
					put('period', next.period);
					return out;
				},
				{ replace: true }
			);
		},
		[setParams]
	);

	return { filters, setFilters };
}
```

Note: an empty status set is written as `status=` (empty string) → `put` deletes it because `''` is falsy. To allow "no status selected" to persist, change `put('status', …)` to `out.set('status', next.status.join(','))` when `next.status.length === 0` is intended; simpler: when the user unchecks every chip, keep it in memory only — accept that a refresh restores the default. Implement the simpler behaviour and note it in the summary.

**2b. New `src/modules/qa/rankings/components/RankingFilters.tsx`:**

```tsx
import { Button, Chip, Group, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { RankingStatus } from '~/models/qa/rankingPrograms';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	RANKING_PERIODS,
	RANKING_STATUS_ORDER,
	TEAMS,
	type RankingPeriod,
} from '../constants';
import type { RankingFilters as RankingFiltersState } from '../helpers';
import {
	DEFAULT_RANKING_FILTERS,
	isDefaultRankingFilters,
} from '../hooks/useRankingFilters';
import { RANKING_METRIC_AREAS, type RankingMetricArea } from '../metrics';

interface RankingFiltersProps {
	role: TeamRole;
	value: RankingFiltersState;
	onChange: (value: RankingFiltersState) => void;
	/** How many rankings each status would show with the other filters applied. */
	counts: Record<RankingStatus, number>;
}

/** Search, status chips with counts, metric area, period and (for the QA manager) team. */
export function RankingFilters({
	role,
	value,
	onChange,
	counts,
}: RankingFiltersProps) {
	const { t } = useTranslation('qa.rankings');

	return (
		<Group gap='sm' wrap='wrap' align='center'>
			<TextInput
				size='sm'
				w={240}
				aria-label={t('filters.search')}
				placeholder={t('filters.search')}
				leftSection={<IconSearch size={16} />}
				value={value.q}
				onChange={(e) => onChange({ ...value, q: e.currentTarget.value })}
			/>
			<Chip.Group
				multiple
				value={value.status}
				onChange={(status) =>
					onChange({ ...value, status: status as RankingStatus[] })
				}
			>
				<Group gap={6} wrap='wrap' aria-label={t('filters.status')}>
					{RANKING_STATUS_ORDER.map((status) => (
						<Chip key={status} value={status} size='sm' variant='light'>
							{t(`status.${status}`)} · {counts[status]}
						</Chip>
					))}
				</Group>
			</Chip.Group>
			<Select
				size='sm'
				w={190}
				placeholder={t('filters.area')}
				data={RANKING_METRIC_AREAS.map((area) => ({
					value: area,
					label: t(`areas.${area}`),
				}))}
				value={value.area}
				onChange={(area) =>
					onChange({ ...value, area: (area as RankingMetricArea) ?? null })
				}
				clearable
			/>
			<Select
				size='sm'
				w={150}
				placeholder={t('filters.period')}
				data={RANKING_PERIODS.map((period) => ({
					value: period,
					label: t(`filters.periods.${period}`),
				}))}
				value={value.period}
				onChange={(period) =>
					onChange({ ...value, period: (period as RankingPeriod) ?? null })
				}
				clearable
			/>
			{role === 'qa-manager' && (
				<Select
					size='sm'
					w={140}
					placeholder={t('filters.team')}
					data={TEAMS}
					value={value.team}
					onChange={(team) => onChange({ ...value, team })}
					clearable
				/>
			)}
			{!isDefaultRankingFilters(value) && (
				<Button
					variant='subtle'
					size='xs'
					onClick={() => onChange(DEFAULT_RANKING_FILTERS)}
				>
					{t('filters.clear')}
				</Button>
			)}
		</Group>
	);
}

export default RankingFilters;
```

Supervisors never see Business Insights metrics in the editor (`RankingForm` hides that group), but a QA-manager-made ranking on Team 1 could carry it, so the area filter lists all areas for both roles.

### Phase 3 — Page, editor hand-off

**3a. Rewrite `ManagerRankingsPage.tsx`:**

- Imports: drop `useState`-only usage for tab, `useSearchParams`, `Tabs`, `Badge`, `SimpleGrid` stays (grid), `StatCard`, `IconCheck`, `IconPlayerPause`, `IconUsers`, `RANKING_TABS`, `RankingTab`. Add `useRankingFilters` (`../hooks/useRankingFilters`), `RankingFilters` (`../components/RankingFilters`), `applyRankingFilters`, `matchesRankingFacets`, `sortPrograms` (`../helpers`), `RANKING_STATUS_ORDER` (`../constants`), `type RankingStatus` from `~/models/qa/rankingPrograms`.
- State:

  ```ts
  const { filters, setFilters } = useRankingFilters();
  const [detail, setDetail] = useState<RankingProgram | null>(null);
  const programs = useMemo(
  	() => programsForRole(allPrograms, role),
  	[allPrograms, role]
  );

  // Chip counts reflect every filter except status, so they say what each chip would show.
  const faceted = useMemo(
  	() => programs.filter((p) => matchesRankingFacets(p, filters)),
  	[programs, filters]
  );
  const counts = useMemo(
  	() =>
  		Object.fromEntries(
  			RANKING_STATUS_ORDER.map((s) => [
  				s,
  				faceted.filter((p) => p.status === s).length,
  			])
  		) as Record<RankingStatus, number>,
  	[faceted]
  );
  const visible = useMemo(
  	() => sortPrograms(applyRankingFilters(programs, filters)),
  	[programs, filters]
  );
  const liveAgents = participantCount(
  	programs.filter((p) => p.status === 'active')
  );
  ```

  Keep `standingsOf` and `toggleActive` as they are, except replace `setTab('active')` with `showStatus('active')`, where:

  ```ts
  /** After a status change, make sure the card stays visible. */
  const showStatus = (status: RankingStatus) => {
  	if (!filters.status.includes(status)) {
  		setFilters({ ...filters, status: [...filters.status, status] });
  	}
  };
  ```

  Card callbacks: duplicate → `showStatus('draft')`; end → `showStatus('completed')`.

- JSX: header (eyebrow/title/description/New) unchanged. Then:

  ```tsx
  <Group justify='space-between' align='center' wrap='wrap' gap='sm'>
  	<RankingFilters
  		role={role}
  		value={filters}
  		onChange={setFilters}
  		counts={counts}
  	/>
  	<Text size='sm' c='dimmed'>
  		{t('filters.summary', { count: visible.length, agents: liveAgents })}
  	</Text>
  </Group>;

  {
  	visible.length === 0 ? (
  		<EmptyState
  			icon={<IconTrophy size={32} />}
  			message={t(programs.length === 0 ? 'empty.none' : 'empty.noMatch')}
  			action={
  				programs.length === 0 ? (
  					<Button onClick={() => navigate(rankingNewPath(role))}>
  						{t('page.new')}
  					</Button>
  				) : (
  					<Button
  						variant='default'
  						onClick={() => setFilters(DEFAULT_RANKING_FILTERS)}
  					>
  						{t('filters.clear')}
  					</Button>
  				)
  			}
  		/>
  	) : (
  		<SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing='lg'>
  			…cards unchanged…
  		</SimpleGrid>
  	);
  }
  ```

  (`EmptyState` already takes `action` — it is used that way in `CustomerProfilePage.tsx`. Import `DEFAULT_RANKING_FILTERS` from the hook file.)

- Delete the KPI `SimpleGrid`, the `Tabs`, `byTab`, `tabParam`.

**3b. `src/modules/qa/rankings/components/RankingForm.tsx`:** import `type RankingStatus` from `~/models/qa/rankingPrograms` instead of `type RankingTab` from `../constants`; `onSaved: (status: RankingStatus) => void;`; line 287 becomes `onSaved(status);`.

**3c. `src/modules/qa/rankings/RankingEditorPage/RankingEditorPage.tsx`:** import `rankingsBasePath` only from `../constants` and `type RankingStatus` from the model; `const backToRankings = (status?: RankingStatus) => navigate(`${rankingsBasePath(role)}${status ? `?status=${status}` : ''}`);`. Saving a draft lands on `?status=draft` (only that chip on), activating on `?status=active`. Cancel / breadcrumb go back with no query → default view.

`npm run typecheck` must pass. Then `npx prettier --write` on: `constants.ts`, `helpers.ts`, `hooks/useRankingFilters.ts`, `components/RankingFilters.tsx`, `ManagerRankingsPage/ManagerRankingsPage.tsx`, `components/RankingForm.tsx`, `RankingEditorPage/RankingEditorPage.tsx` (never the whole folder), and typecheck once more.

---

## Files touched

- Edited: `rankings/constants.ts`, `rankings/helpers.ts`, `rankings/ManagerRankingsPage/ManagerRankingsPage.tsx`, `rankings/components/RankingForm.tsx`, `rankings/RankingEditorPage/RankingEditorPage.tsx`, `src/locales/{en,es}/qa.rankings.json`
- New: `rankings/hooks/useRankingFilters.ts`, `rankings/components/RankingFilters.tsx`
- Plan copy: `docs/superpowers/plans/2026-10-12-rankings-filters-instead-of-tabs.md`

## Out of scope (noted)

- The card content and `ProgramDetailDrawer`.
- A sort control (fixed order only); persisting an empty status selection across refresh.
- The agent-side `TeamRankingsPage`.

## Verification

1. `npm run typecheck` passes.
2. `/qa/qa-manager/rankings` (dev server only if the user asks): no KPI row, no tabs; one bar with search, four status chips with counts (Active · n, Draft · n, Inactive · n, Completed · n), Metric area, Period and Team selects, and the "N rankings · M agents in live rankings" summary. Default shows every status except completed; cards sorted live first.
3. Click the Completed chip → completed cards join the list and the URL gains `?status=active,draft,inactive,completed`; Clear filters restores the default and the URL query disappears. Refresh keeps the chosen filters.
4. Type part of a name → only matching cards; choose Period "Ended" → only rankings whose end date passed; Metric area "Compliance" → only rankings carrying a compliance metric; counts on the chips update with those facets.
5. Supervisor (`/qa/supervisor/rankings`): no Team select; only Team 1 rankings.
6. Editor hand-off: New ranking → Save draft returns with only the Draft chip on and the new card visible; Save & activate returns with Active only. Card actions: Duplicate keeps the copy visible (Draft chip turned on if it was off); End now turns on Completed so the card stays; the activate switch still confirms when it replaces a live ranking.
7. Empty states: with filters that match nothing, "No rankings match these filters" + Clear; with no rankings for the role, "No rankings yet…" + New ranking.
8. Light and dark mode (chips, selects) and Spanish (all `filters.*` and `empty.*` strings resolve; `summary_one/other` pluralise).

# Coaching → Agents tab: one filterable table instead of four tier squares

## Context

The Coaching page's **Agents** tab (`src/modules/qa/coaching/CoachingPage/tabs/AgentsTab.tsx`) renders agents grouped into four tier squares (Excellent / Good / Needs improvement / Critical, plus a fifth "No scorecard this week" square). Each square is a compact 3-column table capped at 8 rows with a "Show details" button that opens a dedicated tier page (`CoachingTierPage`, route `coaching/tiers/:tier`) holding the full-column table (`AgentsTierTable`).

The user (product designer, mockup for stakeholders) wants the squares replaced by **a single table with a filter toolbar**. Decisions already taken with the user:

- Keep the tier summary strip (four stat cards) as clickable quick filters, in sync with a Tier select in the toolbar.
- Columns: the full `AgentsTierTable` set plus a new **Group** (tier) badge column.
- Filters: search by name, Team, Tier (incl. "No scorecard"), Weakest aspect, Pending session switch, Clear.
- Remove the now-unreachable tier detail page, its routes and path helpers.

No tests, no dev server, no commit unless asked (DESIGN_ROLE.md).

## Files

| Action  | Path                                                                                                      |
| ------- | --------------------------------------------------------------------------------------------------------- |
| Rewrite | `src/modules/qa/coaching/CoachingPage/tabs/AgentsTab.tsx`                                                 |
| Edit    | `src/modules/qa/coaching/components/AgentsTierTable.tsx` (add Group column, pagination)                   |
| Edit    | `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx` (drop `onShowDetails`, `coachingTierPath` import) |
| Edit    | `src/modules/qa/coaching/constants.ts` (remove tier-page helpers)                                         |
| Delete  | `src/modules/qa/coaching/CoachingTierPage/` (folder: `CoachingTierPage.tsx`, `index.ts`)                  |
| Edit    | `src/routes.tsx` (remove lazy import + 2 route entries)                                                   |
| Edit    | `src/locales/en/qa.coaching.json`, `src/locales/es/qa.coaching.json`                                      |
| Keep    | `AgentsTab.module.css` (tier card styles still used)                                                      |

## 1. `AgentsTierTable.tsx` — add Group column + pagination

- Add a `tier` column right after `team` (before `scorecard`):
  ```tsx
  helper.accessor(
  	(r) => (r.tier ? TIER_ORDER.indexOf(r.tier) : TIER_ORDER.length),
  	{
  		id: 'tier',
  		header: t('agents.columns.tier'),
  		cell: (info) => {
  			const tier = info.row.original.tier;
  			return tier ? (
  				<Badge size='xs' variant='light' color={TIER_META[tier].color}>
  					{t(TIER_META[tier].labelKey)}
  				</Badge>
  			) : (
  				<Badge size='xs' variant='light' color='gray'>
  					{t('agents.tiers.noData.title')}
  				</Badge>
  			);
  		},
  	}
  );
  ```
  Import `TIER_META`, `TIER_ORDER` from `../scorecard`. Sorting by index keeps Excellent→Critical→No data order.
- Add `enablePagination pageSize={12} showPaginationControls` to the `BaseTable` (same as `SessionsTab`). Keep `initialSort` scorecard desc, `density='compact'`, `onRowClick`.
- Update the doc comment: it is now the table of the Agents tab (no longer "for one set of agents").

## 2. `AgentsTab.tsx` — rewrite

Props become `{ rows: AgentCoachingRow[]; onOpen: (agentId: string) => void }` (drop `onShowDetails`, `CoachingTierKey` import, `BaseTable`, `SectionCard` squares, `renderSquare`, `MAX_SQUARE_ROWS`, `byTier`, `showExcellent`, `squareColumns`, `IconArrowUpRight`, `Button`, `EmptyState`, `ScorecardBadge`, `TierTenureText`, `createColumnHelper`).

Local types/state (mirror `TeamFilters.tsx` pattern in `src/modules/qa/team/YourTeamPage/`):

```ts
type TierFilter = PerformanceTier | 'NO_DATA';
interface AgentFilters {
	search: string;
	team: string | null;
	tier: TierFilter | null;
	weakest: ScorecardDimension | null;
	pendingOnly: boolean;
}
const DEFAULT_FILTERS: AgentFilters = {
	search: '',
	team: null,
	tier: null,
	weakest: null,
	pendingOnly: false,
};
const [filters, setFilters] = useState<AgentFilters>(DEFAULT_FILTERS);
```

`filtered` memo applies, in order: name includes search (trim, lowercase) → `team === filters.team` → tier (`'NO_DATA'` ⇒ `r.tier === null`, else `r.tier === filters.tier`) → `r.weakest?.dimension === filters.weakest` → `pendingOnly && !r.pendingSession` excluded.

Keep `tierSummary` memo exactly as today (always full distribution from `rows`).

Layout (`Stack gap='md'`):

1. **Tier strip** — unchanged `SimpleGrid cols={{ base: 2, md: 4 }}` of `UnstyledButton` + `StatCard`, but `data-active`/`aria-pressed` read `filters.tier === tier`, and click toggles `setFilters(f => ({ ...f, tier: f.tier === tier ? null : tier }))`.
2. **`SectionCard`** with `title={t('agents.title')}`, `description={t('agents.description')}`, `headerActions={<Badge size='sm' variant='light' color='gray'>{t('agents.summary.agents', { count: filtered.length })}</Badge>}`. Body `Stack gap='md'`:
   - Toolbar `Group gap='sm' wrap='wrap'`:
     - `TextInput size='sm' leftSection={<IconSearch size={16} />} placeholder={t('agents.filters.search')} w={240}`
     - `Select size='sm' placeholder={t('agents.filters.team')} data={teams} clearable w={180}` — `teams` = sorted distinct `rows.map(r => r.team)`.
     - `Select size='sm' placeholder={t('agents.filters.tier')} clearable w={190}` with data `TIER_ORDER.map(tier => ({ value: tier, label: t(TIER_META[tier].labelKey) }))` plus `{ value: 'NO_DATA', label: t('agents.tiers.noData.title') }`. Value bound to `filters.tier`, so strip and select stay in sync.
     - `Select size='sm' placeholder={t('agents.filters.area')} clearable w={200}` with data `SCORECARD_DIMENSION_ORDER.map(d => ({ value: d, label: t(SCORECARD_DIMENSION_META[d].labelKey) }))`.
     - `Switch label={t('agents.filters.pendingSession')} checked={filters.pendingOnly}`.
     - `Button variant='subtle' size='xs'` `{t('agents.filters.clear')}` rendered only when filters differ from `DEFAULT_FILTERS` → `setFilters(DEFAULT_FILTERS)`.
   - `<AgentsTierTable rows={filtered} onOpen={onOpen} />` (import from `../../components/AgentsTierTable`). Its `emptyMessage` already shows `agents.empty`.

Imports needed: `Badge, Group, Select, SimpleGrid, Stack, Switch, TextInput, UnstyledButton` from Mantine, `IconSearch`, `SectionCard`, `StatCard`, `AgentsTierTable`, `TIER_META, TIER_ORDER, tierRangeLabel, SCORECARD_DIMENSION_META, SCORECARD_DIMENSION_ORDER, type PerformanceTier, type ScorecardDimension` from `../../scorecard`, `styles`.

## 3. `CoachingPage.tsx`

- Line ~342: remove the `onShowDetails={...}` prop.
- Line ~59: remove `coachingTierPath` from the `../constants` import.

## 4. `constants.ts`

Delete lines 179-199: `CoachingTierKey`, `TIER_KEYS`, `coachingTierPath`, `tierFromParam`. Check nothing else imports `PerformanceTier` there only for this type (if the import becomes unused, remove it).

## 5. Tier page removal

- Delete folder `src/modules/qa/coaching/CoachingTierPage/`.
- `src/routes.tsx`: remove the `CoachingTierPage` lazy import (lines ~184-186) and both route objects `qa-manager/coaching/tiers/:tier` (~1431-1441) and `supervisor/coaching/tiers/:tier` (~1541-1551).
- Grep `CoachingTierPage|coachingTierPath|tierFromParam|CoachingTierKey|onShowDetails` must return nothing.

## 6. Locales (`en` and `es` `qa.coaching.json`, both under `agents`)

Add:

- `filters.tier`: en "Group" / es "Grupo"
- `columns.tier`: en "Group" / es "Grupo"

Remove (now unused): `tiers.showDetails`, `tiers.emptyGroup`, `tiers.more`, `tiers.description`, `tiers.noData.description`. Keep `tiers.rangeFrom`, `tiers.rangeBelow`, each tier `label`, `tiers.noData.title`, `summary.*`, `filters.*` (existing `search`, `team`, `area`, `pendingSession`, `clear` are reused; leave `all`, `burnoutRisk`, `evaluationPeriod` untouched).

Grep `agents.tiers.description|tiers.noData.description` to confirm no remaining usage before removing.

## Dark/light mode

Only Mantine components with semantic colors (`Badge variant='light'`, `TIER_META` colors, existing `.tierCard` CSS vars). No new hardcoded colors.

## Verification

1. `npm run typecheck` passes.
2. Greps from sections 5 and 6 return nothing.
3. Both locale files remain valid JSON with identical key sets under `agents`.
4. No dev server / visual run (DESIGN_ROLE). Do not commit unless the user asks.

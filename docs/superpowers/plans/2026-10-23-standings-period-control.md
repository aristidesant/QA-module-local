# Standings: period control (7d / 30d / Whole period)

> On execution: copy this file to `docs/superpowers/plans/2026-10-23-standings-period-control.md`. `npm run typecheck` after each task. No dev server, no tests, no commit unless asked. Prettier on touched files only. "Today" in the mocks is 2026-09-12 (`TODAY`, `src/modules/qa/analytics/constants.ts`).

## Context

The standings card (`src/modules/qa/rankings/components/RankingStandings.tsx`, shared by the agent page, the manager detail page and the supervisor dashboard) ranks every participant over the whole ranking period and shows one "7-day" movement arrow per row. There is no way to look at how participants behave over a shorter stretch.

Decision with the user (2026-10-23): a **period segmented control on the standings card: 7d / 30d / Whole period**, which **re-ranks the table over that trailing window**. One control covers both the ranking and the movement column (the user's "span" answer is the same control).

Known trade-off, accepted by the user: a windowed rank can differ from the official one (the prize and the "you" strip stay on the whole period). The design makes that explicit: the control defaults to Whole period, a note under the title says which window is on and that the official standing is the whole period, and the movement column names the window it compares against.

Engine: `computeStandings(program, calls, asOf, windowDays?)` (`helpers.ts:171`) already ranks over a trailing window and measures movement against the previous equal-length window. Checked on the mocks: RP-001 7d → 7/7 ranked, RP-002 7d → 9/14 ranked (the rest stay listed as "Below minimum calls"), RP-006 (default, permanent) works for all three.

Decided by me: the control lives inside `RankingStandings` (local state, default `all`), hidden in `dense` mode (dashboard) and while a scheduled ranking has no standings yet; the drawer opened from a row keeps showing the official (whole-period) standing, since it is "Standing in the current ranking".

---

## Task 1 · Period control in the standings card

### `src/modules/qa/rankings/constants.ts`

```ts
/** Trailing windows the standings can be re-ranked over; `all` is the ranking's own period. */
export type StandingsWindow = '7' | '30' | 'all';
export const STANDINGS_WINDOWS: StandingsWindow[] = ['7', '30', 'all'];
```

### `src/modules/qa/rankings/components/RankingStandings.tsx`

- Imports: `useMemo`, `useState` from react; `AppSegmentedControl` from `~/components/ui/AppSegmentedControl/AppSegmentedControl`; `TEAM_CALLS` from `~/modules/qa/analytics/mockData`; `TODAY` from `~/modules/qa/analytics/constants`; `computeStandings` from `../helpers`; `STANDINGS_WINDOWS, type StandingsWindow` from `../constants`.
- State: `const [window, setWindow] = useState<StandingsWindow>('all');`
- Shown standings:

```ts
// The whole-period standings come from the parent (they are the official ones);
// a trailing window is ranked here so every page gets the same control.
const shown = useMemo(
	() =>
		window === 'all'
			? standings
			: computeStandings(program, TEAM_CALLS, TODAY, Number(window)),
	[window, standings, program]
);
```

- `qualified` is computed from `shown`; `StandingsTable` / `StandingsCardGrid` receive `standings={shown}` and a new prop `window={window}`.
- Header: `headerActions` becomes `Group gap='sm'`: `{headerActions}`, then when `!dense && qualifiedAll > 0` (qualified over the whole period, so the control does not show on a ranking that has not started) the `AppSegmentedControl size='xs' value={window} onChange={(v) => setWindow(v as StandingsWindow)} data={STANDINGS_WINDOWS.map((w) => ({ value: w, label: t(`standings.window.${w}`) }))}`, then the count badge (count of `shown`).
- Description: `window === 'all' ? `${t('editor.target')}: ${formatTarget(program)}` : t('standings.windowNote', { days: window })`.
- The "pending" text stays when the whole-period standings are empty.

### `src/modules/qa/rankings/components/StandingsTable.tsx` and `StandingsCardGrid.tsx` → `StandingCard.tsx`

- New optional prop `window?: StandingsWindow` (default `'all'`), passed through the grid to the card.
- Movement header (`StandingsTable.tsx:229`): `window === 'all' ? t('drawer.columns.delta') : t('standings.deltaWindow', { days: window })`.
- `StandingCard`: the `{t('drawer.columns.delta')}:` label uses the same expression.

### Locale `src/locales/{en,es}/qa.rankings.json`

Add at root:

```json
"standings": {
	"window": { "7": "7 days", "30": "30 days", "all": "Whole period" },
	"windowNote": "Ranked over the last {{days}} days. The official standing is the whole period.",
	"deltaWindow": "vs previous {{days}}d"
}
```

es: `"7": "7 días"`, `"30": "30 días"`, `"all": "Periodo completo"`, `"windowNote": "Clasificado sobre los últimos {{days}} días. La posición oficial es la del periodo completo."`, `"deltaWindow": "vs {{days}} d anteriores"`.

**Typecheck.** Prettier on the four `.tsx` and `constants.ts`.

---

## Verification

1. `npm run typecheck` clean; locale parity en/es for `qa.rankings`.
2. `scratchpad/window_check.mjs` (already written, read-only) prints, for RP-001 / RP-006 / RP-002, the ranked count and top 3 for `all`, `30` and `7`: all three windows rank, RP-002 7d leaves 5 agents below minimum calls.
3. Code review: the control is absent in `dense` mode; `shown` is only recomputed when the window or the official standings change; the drawer still receives the parent's official standing.

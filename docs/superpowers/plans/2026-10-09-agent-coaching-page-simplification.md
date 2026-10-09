# Agent coaching page: one scorecard row, and material impact as a single ranked table

## Context

The page opened from Coaching → Agents (`CoachingAgentPage` → `AgentCoachingPanel.tsx`) is heavier than it needs to be:

- **"Since the last coaching session"** (`PostCoachingCards.tsx`) shows seven tiles: the coaching scorecard, time in the current group, four aspect tiles (Quality Assurance, Compliance, Operational, Business Insights, each with "Before N" and a delta chip, numbers colored orange/green by score band) and materials completed. The four aspect tiles repeat the scorecard's own breakdown and add the most color on the page.
- **Impact tab** (`AgentCoachingPanel.tsx:223-244`) opens with a "Performance over time" area chart (four lines, raw series names `overall`, `qa`, `compliance`, `sentiment` in the legend, and no operational or business line, so it does not even match the new scorecard), then `MaterialImpactRanking`: three top-material cards with sparklines, then a seven-column table. There is no "worst impact" view; the ranking is best-first only.

User decisions (2026-10-09): remove the four aspect tiles and keep Scorecard, Time in current group and Materials completed; remove "Performance over time"; show greatest and worst material impact in **one ranked table**, best at the top, worst at the bottom, with a sortable Change column.

Mode: Operate. Pure removal and simplification; no new data.

---

## Critique summary

| Finding                                                                                                                                           | Severity | Evidence                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| Four aspect tiles duplicate the scorecard and carry the page's loudest color (score-band orange/green)                                            | 🟡       | `PostCoachingCards.tsx:166-186`, `getScoreBandColor` |
| The tile grid is hard-wired to 7 columns at `xl`, and its doc comment says "Six cards" while it renders seven                                     | 🟢       | `PostCoachingCards.tsx:42-46, 111`                   |
| "Performance over time" has untranslated legend names and omits the operational and business aspects, so it disagrees with the scorecard above it | 🟡       | `AgentCoachingPanel.tsx:98-104, 225-240`             |
| Top-3 cards + a table repeat the same materials twice; no way to see the worst impact                                                             | 🟡       | `MaterialImpactRanking.tsx:122-166`                  |
| A "Completed" column and a "Rank #N" badge add width but not signal                                                                               | 🟢       | `MaterialImpactRanking.tsx:54-62, 128-130`           |
| Trophy icon on the ranking card is decoration (the Impact tab's other cards have no icon)                                                         | 🟢       | `MaterialImpactRanking.tsx:117`                      |

What works: `rankMaterialImpact` already returns every material sorted by change with the lower-is-better sign flip handled (`postCoaching.ts:237-275`); `ImpactBadge` already gives the Improved / No change / Declined result; `BaseTable` sorts by header click and accepts `initialSort`. The post-coaching card has one consumer (the supervisor and QA-manager agent page), so removing tiles changes no other screen.

---

## Direction

1. **Card: three tiles, one row.** Scorecard (with Before + delta), Time in current group, Materials completed. Aspects live in the scorecard's own views, not repeated here.
2. **Impact tab: one table.** Every measured material ranked by change, greatest at the top, worst at the bottom; materials still measuring last. Columns: Material, Metric, Before, After 30 days, Change, Result. The Change header is sortable, so one click shows the worst first.
3. **No chart, no cards, no trophy.**

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase.

### Phase 1 — Post-coaching card (`src/modules/qa/coaching/components/PostCoachingCards.tsx`)

- Delete the aspect loop (`:166-186`, the `aspects.map(...)` block).
- Grid: `<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='sm'>` (`:111`).
- Remove now-dead code: `aspects` from the destructure (`:60`); imports `getScoreBandColor` (`:8`) and `SCORECARD_DIMENSION_META` (`:13`). Keep `TIER_META`, `beforeText`, `DeltaBadge` (the scorecard tile uses them).
- Fix the doc comment (`:42-46`): "Three tiles: the coaching scorecard since the last completed coach-led session, how long the agent has been in their current group, and the material completed since — the scorecard against the equal-length window before the session."

### Phase 2 — Drop the unused aspect data (`src/modules/qa/coaching/postCoaching.ts`)

`aspects` has no other consumer (grep `.aspects` only finds unrelated call-evaluation code). Remove: the `AspectComparison` interface (`:69-76`), `aspects: AspectComparison[]` in `PostCoachingSummary` (`:89`), the `SCORECARD_DIMENSION_ORDER.map(...)` block that builds it (`:130-143`) and `aspects,` in the returned object (`:163`); drop the `SCORECARD_DIMENSION_ORDER` import (`:16`) if nothing else in the file uses it (it does not). `verdictForDelta` stays (the session-impact helper uses it).

### Phase 3 — Impact tab (`src/modules/qa/coaching/components/AgentCoachingPanel.tsx`)

- Replace the Impact panel body (`:223-244`) with:
  ```tsx
  <Tabs.Panel value='impact' pt='md'>
  	<MaterialImpactRanking rows={ranked} />
  </Tabs.Panel>
  ```
- Delete the `performance` constant (`:98-104`) and the `AreaChart` import (`:3`); `Stack`, `SectionCard`, `useMemo` remain used elsewhere in the file (typecheck will confirm; remove any import it flags). `profile.performance` stays in the model (other screens read it).

### Phase 4 — One ranked table (`src/modules/qa/coaching/components/MaterialImpactRanking.tsx`)

Rewrite the component body:

- Delete the top-3 `SimpleGrid` of cards, `top`, the `Paper`/`SimpleGrid`/`Badge`/`Stack` imports it needed, the `IconTrophy` import and the `ImpactSparkline`, `AreaBadge` imports.
- Columns (6), in this order, all `density='compact'`:
  1. **Material**: title + `FormatBadge size='xs'` (unchanged).
  2. **Metric**: `t(\`metrics.${id}\`, { ns: 'qa.triggers' })`, `size='xs' c='dimmed'` (unchanged).
  3. **Before**: `impact.baseline` (unchanged).
  4. **After 30 days**: `impact.checkpoint30 ?? '—'` (unchanged).
  5. **Change**: the existing `delta` column, changed to sort with still-measuring rows last in both directions:
     ```tsx
     helper.accessor((r) => r.delta ?? undefined, {
     	id: 'delta',
     	header: t('agents.impactRanking.columns.delta'),
     	sortUndefined: 'last',
     	sortDescFirst: true,
     	cell: …unchanged (signed, green > 0, red < 0, "Still measuring" when null)…
     })
     ```
  6. **Result**: `ImpactBadge` (the existing `verdict` column, header text "Result").
     Remove the **Completed** column (`:54-62`) and the `dayjs` import.
- Table: `initialSort={[{ id: 'delta', desc: true }]}` so the greatest change is first on load; the Change header toggles to worst-first.
- Card: `<SectionCard title={t('agents.impactRanking.title')} description={t('agents.impactRanking.description')}>` with no `icon`; body is just the `BaseTable` (no wrapping `Stack`). Keep the empty message for `rows.length === 0`.
- Keep `signed` and `deltaColor` helpers. `rankMaterialImpact` is unchanged (it already returns all rows, best first).

### Phase 5 — Copy (`src/locales/{en,es}/qa.coaching.json`)

en:

- `agents.impactRanking.title` → "Impact of materials"
- `agents.impactRanking.description` → "Completed materials by how much their metric moved 30 days after. Sort by Change to see the lowest first."
- `agents.impactRanking.columns.verdict` → "Result"
- remove `agents.impactRanking.rank` and `agents.impactRanking.columns.completed`
- remove `agents.drawer.performance`

es:

- `title` → "Impacto de los materiales"
- `description` → "Materiales completados según cuánto se movió su métrica 30 días después. Ordena por Cambio para ver los más bajos primero."
- `columns.verdict` → "Resultado"
- remove `rank`, `columns.completed`, `agents.drawer.performance`

Before removing, grep that `agents.impactRanking.rank`, `agents.impactRanking.columns.completed` and `agents.drawer.performance` have no other references (only the two files above use them today). Leave `agents.drawer.scores` and the aspect labels (`agents.scorecard.dimensions.*`, still used by the Agents tab and session brief).

---

## Files touched

- `src/modules/qa/coaching/components/PostCoachingCards.tsx` (1)
- `src/modules/qa/coaching/postCoaching.ts` (2)
- `src/modules/qa/coaching/components/AgentCoachingPanel.tsx` (3)
- `src/modules/qa/coaching/components/MaterialImpactRanking.tsx` (4)
- `src/locales/{en,es}/qa.coaching.json` (5)

Do not touch: `ImpactSparkline` (used by `ContentSidebar`, `AssignmentDetailDrawer`, `HistoryTab`), `buildTierTenure`, `SCORECARD_DIMENSION_META`, `rankMaterialImpact`, the agent's own LMS screens.

## Out of scope (noted)

- The "Time in current group" subtitle still truncates ("Since 6 Sep · was Needs…") in a narrow tile; with three tiles in a row it has more room, so no change is made.
- `PostCoachingCards` still repeats call counts in three places (scorecard badge, description, tenure subtitle).

## Verification

Per DESIGN_ROLE.md the dev server runs only if asked.

1. `npm run typecheck` passes.
2. `/qa/supervisor/coaching/agents/AGT-004`: the "Since the last coaching session" card shows three tiles in one row (Coaching scorecard 86 with Before and delta, Time in current group, Materials completed); the header badges and description are unchanged; no QA, Compliance, Operational or Business tiles.
3. Impact tab: no "Performance over time" chart; one card "Impact of materials" with a six-column table, greatest change first (+ values green at the top, negative red lower), "Still measuring" rows last.
4. Click the Change header: the order flips to the worst change first, and still-measuring rows stay at the bottom. Click again: back to greatest first.
5. An agent with no measured materials shows "Nothing measured yet."
6. Dark mode and a narrow viewport: the three tiles stack to one column; the table scrolls horizontally.

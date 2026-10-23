# Operation Manager · "Insights" dashboard (BI-style, ECharts, particles)

> On execution: copy this file to `docs/superpowers/plans/2026-10-23-operation-manager-insights.md` and follow the tasks in order. `npm run typecheck` after every task. No dev server, no tests, no commit unless asked. Prettier on touched files only. Strings in `qa.dashboard` en + es. Mock "today" is 2026-09-12 (`TODAY`, `src/modules/qa/analytics/constants.ts`).

## Context

The Operation Manager dashboard (`src/modules/qa/dashboard/pages/NewOperationManagerDashboard.tsx`, route `/qa/dashboards/operation-manager`) is a stack of Mantine cards: five Performance Score cards with progress bars, a team trend `LineChart`, ESG bars, burnout, a Human vs AI `BarChart` and a campaign table. The user wants the **same information** shown the way Tableau / Power BI do it: dense tiles, BI-grade visuals, cross-filtering, subtle chart animation, a professional, avant-garde, slightly futuristic look with **particle animation**.

Decisions with the user (2026-10-23):

- **Apache ECharts** as the chart engine (new dependency).
- **Classic / Insights switch** in the header; the page opens on Insights; the current dashboard stays as "Classic" for comparison.
- **Follows the app theme**: a deep "command centre" canvas in dark mode, a clean light canvas in light mode.
- **Cross-filtering**: clicking a team, campaign or line of business in any visual filters every other visual; pills above the grid show the active filters and clear them.

Decided by me: one modular ECharts build (`echarts/core` + only the charts used) behind a tiny wrapper, no `echarts-for-react`; the particle field is a ~120-line canvas component (no particle library); all numbers come from the builders the classic view already uses plus four small new aggregations over `TEAM_CALLS`; ESG and Human vs AI keep their existing static mocks.

---

## Visual direction

- **Canvas**: light → `var(--mantine-color-gray-0)` page, white tiles; dark → near-black navy page (`#070B14`-ish via `light-dark()`), translucent tiles (`rgba(15, 23, 42, 0.62)`) with a 1px hairline border (`rgba(148, 163, 184, 0.14)`) and a faint top highlight (`linear-gradient(180deg, rgba(255,255,255,0.04), transparent 40%)`). Radius `--mantine-radius-lg`. No drop shadows in dark; `--mantine-shadow-xs` in light.
- **Type**: tile titles 12px uppercase, letter-spacing 0.08em, dimmed; KPI numbers 30px / 600 with `font-variant-numeric: tabular-nums`; small labels 11–12px.
- **Palette** (series, read at runtime from Mantine CSS vars so it follows theme): Team 1 `cyan`, Team 2 `violet`, Team 3 `teal`; secondary series `indigo`, `blue`; alert `red`; neutral `gray`. Shades: 6 in light, 4 in dark. Sequential scale for heatmap / treemap: from tile surface → `cyan-6/4`.
- **Motion**: chart entry 600 ms `cubicOut`, updates 400 ms; KPI numbers count up once (400 ms); tiles fade/rise in with a 40 ms stagger; particles drift slowly behind the hero band only. Everything off under `prefers-reduced-motion` (charts `animation: false`, particles drawn once, no count-up).
- **Hover**: series emphasis with `focus: 'series'` and blur of the others (Power BI style); tooltips use the tile surface, hairline border, tabular numbers.

---

## Layout (12-column CSS grid, gap 16, rows auto)

```
Header: eyebrow · title · subtitle            [Classic | Insights]  [LOB select] [period segmented]
Filter pills: Team 2 ×  ·  camp-003 Collections ×  · Clear all        (only when a cross-filter is on)

┌ Hero band (span 12) — ParticleField behind ─────────────────────────────────────────────┐
│ KPI · Calls │ KPI · Effective % │ KPI · QA │ KPI · Compliance │ KPI · Customer sent. │ KPI · Conversion │
│ value, delta vs previous window (▲/▼ + %), sparkline (one point per day/week)          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
┌ Team performance trend (span 8) ─────────┐ ┌ Quality gauges (span 4) ─────┐
│ smooth lines per team, area glow,         │ │ 3 ring gauges: QA, Compliance,│
│ metric switch QA | Compliance | Sentiment │ │ Customer sentiment (as %)     │
└───────────────────────────────────────────┘ └───────────────────────────────┘
┌ Volume & quality by campaign (span 6) ───┐ ┌ Call flow (span 6) ─────────────┐
│ treemap LOB → campaign, size = calls,     │ │ sankey Team → Contact outcome → │
│ colour = QA score                         │ │ Result (Sale / No sale / No offer)│
└───────────────────────────────────────────┘ └─────────────────────────────────┘
┌ When calls happen (span 7) ──────────────┐ ┌ Human vs AI (span 5) ────────────┐
│ heatmap weekday × hour, switch Volume|QA │ │ radar, 5 axes, two polygons        │
└───────────────────────────────────────────┘ └──────────────────────────────────┘
┌ Burnout (span 6) ────────────────────────┐ ┌ ESG (span 6) ─────────────────────┐
│ donut LOW/MED/HIGH + per-team negative-   │ │ polar bars 3 pillars + overall in │
│ emotion lines (small multiple)            │ │ the centre                         │
└───────────────────────────────────────────┘ └──────────────────────────────────┘
┌ Campaigns (span 12) — existing CampaignPerformanceTable, cross-filter aware ────────────┐
```

Below 1200px: spans collapse to 6/6, below 768px every tile is 12. The hero KPIs wrap 3/2/1 per row.

---

## Files

New (all under `src/modules/qa/dashboard/insights/`):

- `echarts.ts` — modular registration
- `EChart.tsx` — React wrapper (init, update, resize, theme, click, reduced motion)
- `useInsightsTheme.ts` — palette + base option built from Mantine CSS vars
- `ParticleField.tsx`, `ParticleField.module.css`
- `InsightsTile.tsx`, `Insights.module.css`
- `crossFilter.ts` — filter type, apply, pills
- `insightsMetrics.ts` — the four new aggregations + sparkline series
- `charts/KpiStrip.tsx`, `charts/TeamTrendChart.tsx`, `charts/QualityGauges.tsx`, `charts/CampaignTreemap.tsx`, `charts/CallFlowSankey.tsx`, `charts/ActivityHeatmap.tsx`, `charts/HumanVsAiRadar.tsx`, `charts/BurnoutPanel.tsx`, `charts/EsgPolar.tsx`
- `OperationManagerInsights.tsx` — assembles the grid

Modified:

- `package.json` (+ `echarts`)
- `src/modules/qa/dashboard/pages/NewOperationManagerDashboard.tsx` — view switch
- `src/modules/qa/dashboard/components/CampaignPerformanceTable.tsx` — optional `onRowClick` + `activeId` props (row highlight)
- `src/locales/{en,es}/qa.dashboard.json` — `operationManager.insights.*`

---

## Task 1 · Dependency, ECharts wrapper, theme

1. `npm install echarts@5.6.0` (exact version).

2. `insights/echarts.ts`

```ts
import * as echarts from 'echarts/core';
import {
	GaugeChart,
	HeatmapChart,
	LineChart,
	PieChart,
	BarChart,
	RadarChart,
	SankeyChart,
	TreemapChart,
} from 'echarts/charts';
import {
	GridComponent,
	LegendComponent,
	PolarComponent,
	RadarComponent,
	TooltipComponent,
	VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
	GaugeChart,
	HeatmapChart,
	LineChart,
	PieChart,
	BarChart,
	RadarChart,
	SankeyChart,
	TreemapChart,
	GridComponent,
	LegendComponent,
	PolarComponent,
	RadarComponent,
	TooltipComponent,
	VisualMapComponent,
	CanvasRenderer,
]);

export { echarts };
export type { EChartsCoreOption as EChartsOption } from 'echarts/core';
```

3. `insights/EChart.tsx` — props `{ option: EChartsOption; height: number; ariaLabel: string; onItemClick?: (params: { name: string; seriesName?: string; data?: unknown }) => void }`.
   - `useRef<HTMLDivElement>`, `useEffect` on mount: `chart = echarts.init(el, undefined, { renderer: 'canvas' })`; `ResizeObserver` → `chart.resize()`; cleanup `dispose()`.
   - `useEffect([option, reduced])`: `chart.setOption({ ...option, animation: !reduced }, { notMerge: true })` — `reduced = useReducedMotion()` from `@mantine/hooks`.
   - `useEffect([onItemClick])`: `chart.off('click'); if (onItemClick) chart.on('click', (p) => onItemClick({ name: p.name, seriesName: p.seriesName, data: p.data }))`.
   - Render `<div ref role='img' aria-label={ariaLabel} className={styles.chart} />` with height via the CSS variable `--chart-h` set through `style` (one documented `// inline-style-allow:` like `CallPlayer`), or pass `h` with a Mantine `Box` (`<Box h={height}>`) to avoid the exception — prefer `Box h`.

4. `insights/useInsightsTheme.ts` — `useComputedColorScheme('light')` + reads CSS vars with `getComputedStyle(document.documentElement)` inside `useMemo([scheme])`:

```ts
export interface InsightsTheme {
	dark: boolean;
	text: string;
	dimmed: string;
	border: string;
	surface: string;
	team: Record<string, string>; // 'Team 1' → cyan, 'Team 2' → violet, 'Team 3' → teal
	accent: string; // cyan
	ai: string;
	human: string; // violet, cyan
	alert: string; // red
	sequential: [string, string]; // [surface-ish, accent]
	base: Partial<EChartsOption>; // textStyle, tooltip, animation timings
}
```

- `const v = (name) => css.getPropertyValue(name).trim();` shade = dark ? 4 : 6: `v(`--mantine-color-cyan-${shade}`)` etc.
- `base`: `{ textStyle: { fontFamily: 'inherit', color: text }, animationDuration: 600, animationEasing: 'cubicOut', animationDurationUpdate: 400, tooltip: { backgroundColor: surface, borderColor: border, borderWidth: 1, textStyle: { color: text, fontSize: 12 }, extraCssText: 'border-radius:8px;box-shadow:none;font-variant-numeric:tabular-nums;' } }`.
- Axis helpers exported: `axisStyle(theme)` → `{ axisLine: { lineStyle: { color: border } }, axisTick: { show: false }, axisLabel: { color: dimmed, fontSize: 11 }, splitLine: { lineStyle: { color: border, type: 'dashed', opacity: 0.6 } } }`.

**Typecheck.**

---

## Task 2 · Tiles, particles, cross-filter

### `Insights.module.css`

```css
.page {
	--ins-bg: light-dark(var(--mantine-color-gray-0), #070b14);
	--ins-tile: light-dark(var(--mantine-color-white), rgba(15, 23, 42, 0.62));
	--ins-line: light-dark(
		var(--mantine-color-gray-3),
		rgba(148, 163, 184, 0.14)
	);
	background: var(--ins-bg);
	border-radius: var(--mantine-radius-lg);
	padding: var(--mantine-spacing-md);
}
.grid {
	display: grid;
	grid-template-columns: repeat(12, minmax(0, 1fr));
	gap: 16px;
}
.tile {
	grid-column: span var(--span, 12);
	position: relative;
	background: var(--ins-tile);
	border: 1px solid var(--ins-line);
	border-radius: var(--mantine-radius-lg);
	padding: 16px 18px;
	backdrop-filter: blur(8px);
	box-shadow: light-dark(var(--mantine-shadow-xs), none);
	animation: tile-in 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	animation-delay: calc(var(--i, 0) * 40ms);
}
.tile::before {
	/* top highlight, dark only */
	content: '';
	position: absolute;
	inset: 0;
	border-radius: inherit;
	pointer-events: none;
	background: light-dark(
		transparent,
		linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 40%)
	);
}
.tileTitle {
	font-size: 12px;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--mantine-color-dimmed);
	font-weight: 600;
}
.kpiValue {
	font-size: 30px;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
	line-height: 1.1;
}
.hero {
	position: relative;
	overflow: hidden;
}
@keyframes tile-in {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: none;
	}
}
@media (max-width: 75em) {
	.tile {
		grid-column: span min(var(--span, 12), 6);
	}
	.wide {
		grid-column: span 12;
	}
}
@media (max-width: 48em) {
	.tile {
		grid-column: span 12;
	}
}
@media (prefers-reduced-motion: reduce) {
	.tile {
		animation: none;
	}
}
```

`--span` and `--i` are set per tile through `style` (documented `// inline-style-allow:` comment: runtime grid placement), the only inline style in the feature.

### `InsightsTile.tsx`

Props `{ title: string; subtitle?: string; span: number; index: number; actions?: ReactNode; wide?: boolean; children }`. Renders `<section className={tile} aria-label={title}>` with a header row (title + subtitle dimmed 12px, actions right) and the body.

### `ParticleField.tsx`

- Canvas absolutely positioned (`inset: 0`, `z-index: 0`, `pointer-events: none`); content above it gets `position: relative; z-index: 1`.
- ~1 particle per 9 000 px² of the band (cap 70). Each: position, velocity (±0.12 px/frame), radius 0.6–1.6 px.
- Colour from `--mantine-primary-color-filled` (read once per theme change); dots alpha 0.55 dark / 0.35 light; links drawn between particles closer than 110 px with alpha `(1 - d/110) * 0.18` (dark) / `0.10` (light).
- `devicePixelRatio`-aware sizing via `ResizeObserver`; animation via `requestAnimationFrame`, paused when `document.hidden` or when the band is out of view (`IntersectionObserver`); `useReducedMotion()` → draw one static frame.
- Cleanup cancels the frame, disconnects observers.

### `crossFilter.ts`

```ts
export interface CrossFilter {
	team: string | null;
	campaignId: string | null;
}
export const EMPTY_FILTER: CrossFilter = { team: null, campaignId: null };
export const applyCrossFilter = (calls: TeamCallMetric[], f: CrossFilter) =>
	calls.filter(
		(c) =>
			(!f.team || c.team === f.team) &&
			(!f.campaignId || c.campaignId === f.campaignId)
	);
/** Clicking the active value again clears it, like Power BI. */
export const toggle = (
	f: CrossFilter,
	key: keyof CrossFilter,
	value: string
): CrossFilter => ({ ...f, [key]: f[key] === value ? null : value });
```

Line of business stays on the header select (it already filters `teamCallsInWindow`); clicking an LOB rectangle in the treemap sets the header select.

**Typecheck.**

---

## Task 3 · Data builders (`insightsMetrics.ts`)

All take the already windowed, LOB-filtered, cross-filtered `calls` (from `teamCallsInWindow('qa-manager', days, lob)` → `applyCrossFilter`). Reuse: `aggregateDashboardMetrics` (`calls/agentMetrics.ts:180`), `buildTeamDashboardMetrics` for trends, `buildTeamPerformanceSeries` / `buildTeamBurnoutSeries` / `platformBurnoutSummary` / `buildCampaignPerformanceRows` (`dashboard/operationManagerMetrics.ts`), `chartGranularity`, `periodKeyOf` (`analytics/helpers.ts`), `dashboardLineOfBusinessFor`, `OPERATION_MANAGER_ESG`, `HUMAN_VS_AI_PERFORMANCE`.

```ts
export interface KpiPoint { label: string; value: number }
export interface Kpi { key: 'calls' | 'effective' | 'qa' | 'compliance' | 'sentiment' | 'conversion'; value: number; unit: '' | '%' | '/5'; delta: number | null; spark: KpiPoint[] }

/** One value per day (≤14 days) or ISO week, for the KPI sparklines. */
export const kpiSparks = (calls: TeamCallMetric[], days: number): Record<Kpi['key'], KpiPoint[]> => { … group by periodKeyOf(call.date, chartGranularity(days)); per bucket: calls count, effective % (contactOutcome === 'EFFECTIVE'), mean qaScore, mean of (security+regulatory+legal)/3, mean customerSentiment, conversion % (converted / offeredProduct !== null) … }

/** Current values from aggregateDashboardMetrics; deltas from the same window shifted back (teamCallsInWindow(..., endOffsetDays = days) → applyCrossFilter → aggregate). */
export const buildKpis = (current: TeamCallMetric[], previous: TeamCallMetric[], days: number, thresholds): Kpi[]

/** LOB → campaign; size = calls, colour = mean QA. */
export interface TreemapNode { name: string; id: string; value: number; qa: number; children?: TreemapNode[] }
export const campaignTreemap = (calls): TreemapNode[]

/** Team → Effective / Not effective → Sale / No sale / No offer. */
export const callFlow = (calls): { nodes: { name: string }[]; links: { source: string; target: string; value: number }[] }

/** weekday 0-6 × hour 0-23: [hourIndex, weekdayIndex, value]; mode 'volume' = count, 'qa' = mean qaScore (null cells skipped). */
export const activityMatrix = (calls, mode: 'volume' | 'qa'): { cells: [number, number, number][]; max: number; hours: number[] }
```

Hours limited to the span that has calls (min..max hour across calls) so the heatmap is not mostly empty. Weekday order Mon→Sun.

**Typecheck.** Node/Vite SSR check (pattern of `scratchpad/load_check.mjs`): print KPI values for `week` and `quarter`, treemap totals = calls in window, sankey link sums per team = team calls, heatmap cell count.

---

## Task 4 · The visuals (each a component in `charts/`, each wrapped in `InsightsTile`)

| Component         | Tile                                                                                              | ECharts option essentials                                                                                                                                                                                                                                                                                                                                                                                                                                  | Click                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `KpiStrip`        | hero band (span 12) with `ParticleField`                                                          | 6 KPI blocks in a CSS grid (`repeat(auto-fit, minmax(150px,1fr))`); each: label, `kpiValue` (count-up 400 ms via rAF unless reduced motion), delta (▲ cyan / ▼ red + `%`, text not colour-only: arrow glyph from Tabler `IconArrowUpRight/DownRight`), a 36px-high `EChart` sparkline: `line`, `smooth: true`, `symbol: 'none'`, `lineStyle.width 1.5`, `areaStyle` gradient accent→transparent (opacity 0.25), no axes (`xAxis/yAxis show:false`, grid 0) | —                                                          |
| `TeamTrendChart`  | span 8, h 300, actions = `SegmentedControl` QA / Compliance / Sentiment (reuse `TeamTrendMetric`) | data from `buildTeamPerformanceSeries`; `xAxis` category labels, `yAxis` 0-100 (or 1-5); one `line` per team, `smooth: 0.35`, `showSymbol: false`, `areaStyle` team colour opacity 0.08, `emphasis: { focus: 'series' }`; legend top-right, icon `roundRect`                                                                                                                                                                                               | series name → `team`                                       |
| `QualityGauges`   | span 4, h 300                                                                                     | three `gauge` series side by side (`center` 18%/50%/82%, `radius` 30%), `type: 'gauge'`, `startAngle 220`, `endAngle -40`, `progress: { show: true, width: 8, roundCap: true }`, `axisLine.lineStyle.width 8` colour `border`, no ticks/labels, `detail` 22px tabular, `title` below 11px; values QA, compliance mean, sentiment as `(avg-1)/4*100` with detail formatter showing `x.x/5`                                                                  | —                                                          |
| `CampaignTreemap` | span 6, h 320                                                                                     | `treemap`, `roam: false`, `nodeClick: false`, `breadcrumb.show: false`, `levels` [ { itemStyle: { borderColor: tile, borderWidth: 3, gapWidth: 3 } }, { itemStyle: { gapWidth: 1 }, upperLabel: { show: true, height: 20, color: dimmed } } ]; `visualMap` (hidden, `dimension: 'qa'` via `value: [calls, qa]`, `visualDimension: 1`, range 60-100, colours `sequential`); labels `{b}\n{c} calls`                                                         | LOB node → header LOB select; campaign leaf → `campaignId` |
| `CallFlowSankey`  | span 6, h 320                                                                                     | `sankey`, `nodeAlign: 'justify'`, `nodeGap 12`, `nodeWidth 10`, `lineStyle: { color: 'gradient', opacity: 0.28, curveness: 0.5 }`, node colours: teams from `team`, outcome nodes `indigo`, Sale `cyan`, No sale `gray`, No offer `border`; `emphasis: { focus: 'adjacency' }`                                                                                                                                                                             | team node → `team`                                         |
| `ActivityHeatmap` | span 7, h 300, actions = `SegmentedControl` Volume / QA                                           | `heatmap`, xAxis hours `HH:00`, yAxis Mon…Sun, `itemStyle.borderColor tile, borderWidth 2, borderRadius 4`; `visualMap` horizontal bottom, `calculable: false`, colours `sequential`; QA mode range 60-100                                                                                                                                                                                                                                                 | —                                                          |
| `HumanVsAiRadar`  | span 5, h 300                                                                                     | `radar` indicators from `HUMAN_VS_AI_PERFORMANCE` normalised to 0-100 (`max: 100`), `shape: 'polygon'`, `splitArea` off, split lines `border`; two series: Human (`human` colour, area opacity 0.15), AI (`ai` colour, dashed line, area opacity 0.10); tooltip shows raw values                                                                                                                                                                           | —                                                          |
| `BurnoutPanel`    | span 6, h 300                                                                                     | left: `pie` donut (`radius ['62%','80%']`, `padAngle 2`, `itemStyle.borderRadius 4`) LOW gray / MEDIUM indigo / HIGH red from `platformBurnoutSummary`, centre label "X at risk"; right: 3 tiny `line` charts stacked (one per team) from `buildTeamBurnoutSeries`, 0-100, same smooth/no-symbol style                                                                                                                                                     | team line → `team`                                         |
| `EsgPolar`        | span 6, h 300                                                                                     | `polar` + `angleAxis` max 100 hidden + `radiusAxis` category pillars; `bar` with `coordinateSystem: 'polar'`, `roundCap: true`, `barWidth 12`, colours teal / cyan / indigo; `graphic`-free centre text via a positioned Mantine `Text` overlay showing `overall` + status                                                                                                                                                                                 | —                                                          |
| Campaign table    | span 12                                                                                           | existing `CampaignPerformanceTable` with new `onRowClick={(row) => setFilter(toggle(filter, 'campaignId', row.id))}` and `activeId` (row background `var(--mantine-primary-color-light)`)                                                                                                                                                                                                                                                                  | row → `campaignId`                                         |

Each `EChart` gets an `ariaLabel` sentence from the data (e.g. "QA by team, Team 1 leads at 88"). Every tile shows an empty state (`EmptyState` small, `operationManager.insights.empty`) when the filtered calls are empty.

Cross-filter highlight on the source visual: instead of hiding other items, the clicked chart keeps all items and sets `itemStyle.opacity 0.25` on the non-selected ones (line series `lineStyle.opacity`), so it reads like Power BI's highlight.

---

## Task 5 · Page wiring and locale

### `OperationManagerInsights.tsx`

Props `{ days: number; period: PerformanceScorePeriod; lineOfBusiness: DashboardLineOfBusiness | null; onLineOfBusinessChange: (lob) => void }`. State: `filter: CrossFilter`, `teamMetric`, `heatMode`. Memo chain: `windowCalls = teamCallsInWindow('qa-manager', days, lob)` → `calls = applyCrossFilter(windowCalls, filter)`; previous window the same with `endOffsetDays = days`. Pills row (Mantine `Pill` with remove button, `Button variant='subtle' size='xs'` "Clear all"). Grid in the order of the layout table, `index` incrementing for the stagger.

### `NewOperationManagerDashboard.tsx`

- `const [params, setParams] = useSearchParams(); const view = params.get('view') === 'classic' ? 'classic' : 'insights';`
- Header right side: `AppSegmentedControl` (`~/components/ui/AppSegmentedControl/AppSegmentedControl`) Classic | Insights before the existing `PerformanceScoreControls`.
- `view === 'insights'` → `<div className={insights.page}><OperationManagerInsights … /></div>`; else the current body unchanged.

### `qa.dashboard.json` (en; es equivalents)

`operationManager.insights`: `view.classic` "Classic", `view.insights` "Insights"; `kpis.{calls,effective,qa,compliance,sentiment,conversion}` ("Calls", "Effective contacts", "QA score", "Compliance", "Customer sentiment", "Conversion"); `vsPrevious` "vs previous period"; tiles `teamTrend`, `gauges`, `treemap`, `flow`, `heatmap`, `humanVsAi`, `burnout`, `esg`, `campaigns` each `{ title, subtitle }`; `heatmapMode.{volume,qa}`; `flow.{effective,notEffective,sale,noSale,noOffer}`; `filters.{team,campaign,clear}`; `burnout.atRisk` "{{count}} at risk"; `empty` "No calls match these filters."; `weekdays` array Mon…Sun and their es versions.

**Typecheck**, locale parity, Vite SSR load of `NewOperationManagerDashboard.tsx` and `OperationManagerInsights.tsx`.

---

## Verification

1. `npm run typecheck` clean; `npm run build` once to confirm the ECharts modular import tree-shakes (note the chunk size in the report).
2. Locale parity en/es for `qa.dashboard`.
3. Vite SSR script: builders return consistent totals (treemap sum = sankey team totals = KPI calls = calls in window) for `week`, `month`, `quarter`, with and without a team cross-filter.
4. Code review: only Mantine CSS variables or values read from them at runtime; `light-dark()` on every surface; reduced motion disables chart animation, count-up, tile entrance and particle drift; particles pause when hidden; every chart has an aria-label and tooltip; no inline styles beyond the documented grid placement.

## Open notes

- ESG and Human vs AI stay on their static mocks (as in Classic). Real AI calls exist in `AI_TEAM_CALLS`; wiring them is a separate step.
- The classic view is untouched and reachable with `?view=classic`.

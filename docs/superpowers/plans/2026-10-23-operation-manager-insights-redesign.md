# Operation Manager · Insights redesign (design-system colors, Mantine charts, no chrome)

> On execution: follow the tasks in order. `npm run typecheck` after every task. No dev server, no tests, no commit unless asked. Prettier on touched files only. Strings in `qa.dashboard` en + es. Mock "today" is 2026-09-12 (`TODAY`, `src/modules/qa/analytics/constants.ts`).

## Context

The Insights view of the Operation Manager dashboard (`src/modules/qa/dashboard/insights/`, default view of `NewOperationManagerDashboard.tsx`, route `/qa/dashboards/operation-manager`) was built as a BI poster: a dark "control centre" canvas, glass tiles, a particle field, count-up numbers, staggered entrances, and ECharts gauges, treemap, sankey, radar and polar bars drawn in cyan, violet, teal and indigo. None of that is in the Newtech design system (green brand, blue accent, ink neutrals, amber and danger for status) and the rest of the app, including the Classic view beside it and Team Analytics, uses `SectionCard` and `@mantine/charts`.

Decisions with the user (2026-10-23):

- **Rebuild on the Mantine chart kit** (`@mantine/charts` plus the Team Analytics kit in `src/modules/qa/analytics/TeamAnalyticsPage/charts/`). ECharts goes.
- **Match the rest of the app.** No separate canvas, glass, particles, count-up or entrance stagger. Tiles are `SectionCard`.

Decided by me after the dataviz validator: team series use the app's already validated chart tokens `--series-1/2/3` (blue, teal, grape), not an ink/blue/gray scheme (that one fails the normal-vision floor, ΔE 9.7). Validator results, both modes PASS: light `#007aae,#12b886,#be4bdb`; dark `#0098d4,#0ca678,#be4bdb`. Light teal is a contrast WARN (2.49:1), so every team line is direct-labeled by the team chips above the chart and the legend stays on.

What the critique keeps: the cross-filter (team and campaign, with removable pills), KPIs with a delta against the previous period and a sparkline, the campaigns table as the campaign filter, the weekday-by-hour heatmap idea, reduced motion, the Insights / Classic toggle.

What goes: Quality gauges (repeat three KPIs), Campaign treemap (repeats the table), Sankey (becomes share bars), radar (becomes the existing bar pair), donut and polar bars (become a share bar and the existing ESG meters), the footnote hint, uppercase tracked captions.

---

## Layout (12-column grid, gap `--mantine-spacing-md`)

```
Header (unchanged): title · subtitle                [Insights | Classic] [LOB select] [period]
Pills (only when a cross-filter is on): Team 2 ×  ·  Collections ×  ·  Clear all

┌ Headline numbers (12) ───────────────────────────────────────────────────────────────┐
│ MetricTileRow: Calls · Effective contacts · QA score · Compliance · Customer sentiment · Conversion │
└──────────────────────────────────────────────────────────────────────────────────────┘
┌ Team trend (8) ──────────────────────────────┐ ┌ Call outcomes (4) ───────────────────┐
│ chips: Team 1 · Team 2 · Team 3 (toggle = filter) │ one row per team:                      │
│ metric switch QA | Compliance | Sentiment     │ team name (clickable) · ShareBar reached / not │
│ LineChart, 3 series, legend on                │ reached; under it sale / no sale / no offer    │
└───────────────────────────────────────────────┘ └────────────────────────────────────────┘
┌ Activity by hour (7) ────────────────────────┐ ┌ Human vs AI (5) ─────────────────────┐
│ Heatmap weekday × hour, Volume | QA           │ HumanVsAiCard (bar pair)               │
└───────────────────────────────────────────────┘ └────────────────────────────────────────┘
┌ Burnout risk (6) ────────────────────────────┐ ┌ ESG (6) ──────────────────────────────┐
│ "{atRisk} of {total} at risk" · ShareBar low/medium/high │ EsgScoreCard                     │
│ SmallMultiples: negative agent emotion % per team │                                      │
└───────────────────────────────────────────────┘ └────────────────────────────────────────┘
┌ Campaigns (12) — CampaignPerformanceTable, row click = campaign filter ───────────────┐
```

Below 75em: spans collapse to 6; below 48em every tile is 12.

---

## Files

New:

- `src/styles/chart-tokens.css` — the chart color tokens, on `:root`
- `src/modules/qa/dashboard/insights/charts/HeadlineTiles.tsx`
- `src/modules/qa/dashboard/insights/charts/TeamTrendCard.tsx`
- `src/modules/qa/dashboard/insights/charts/CallOutcomesCard.tsx`
- `src/modules/qa/dashboard/insights/charts/ActivityHeatmapCard.tsx`
- `src/modules/qa/dashboard/insights/charts/BurnoutCard.tsx`

Modified:

- `src/styles/global.css` (import), `src/modules/qa/analytics/TeamAnalyticsPage/TeamAnalyticsPage.module.css` (tokens removed from `.pageContainer`)
- `src/modules/qa/dashboard/insights/Insights.module.css` (slimmed), `OperationManagerInsights.tsx` (new grid), `insightsMetrics.ts` (new builders)
- `src/modules/qa/dashboard/pages/NewOperationManagerDashboard.tsx` (drop the canvas wrapper)
- `src/locales/{en,es}/qa.dashboard.json` — `operationManager.insights.*`
- `package.json` (remove `echarts`)

Deleted: `insights/EChart.tsx`, `echarts.ts`, `useInsightsTheme.ts`, `ParticleField.tsx`, `ParticleField.module.css`, `InsightsTile.tsx`, `charts/KpiStrip.tsx`, `charts/QualityGauges.tsx`, `charts/TeamTrendChart.tsx`, `charts/CampaignTreemap.tsx`, `charts/CallFlowSankey.tsx`, `charts/ActivityHeatmap.tsx`, `charts/HumanVsAiRadar.tsx`, `charts/EsgPolar.tsx`, `charts/BurnoutPanel.tsx`.

Reused as they are: `SectionCard` (`~/components/SectionCard`), `MetricTileRow` / `MetricTileProps`, `ShareBar`, `SmallMultiples`, `Heatmap`, `SERIES`, `SERIES_CURRENT`, `HEAT`, `STATUS` (all from `~/modules/qa/analytics/TeamAnalyticsPage/charts`), `HumanVsAiCard`, `EsgScoreCard`, `CampaignPerformanceTable` (`../components`), `buildTeamPerformanceSeries`, `buildTeamBurnoutSeries`, `platformBurnoutSummary`, `buildCampaignPerformanceRows`, `OPERATION_MANAGER_TEAMS`, `chartGranularity`, `periodLabel` (`../operationManagerMetrics`), `HUMAN_VS_AI_PERFORMANCE`, `OPERATION_MANAGER_ESG` (`../mockData`), `HEATMAP_MIN_CALLS` (`~/modules/qa/analytics/constants`), `crossFilter.ts` (unchanged).

---

## Task 1 · Shared chart tokens

1. Create `src/styles/chart-tokens.css` with the block below. It is the token block of `TeamAnalyticsPage.module.css` `.pageContainer` moved to `:root`, values unchanged.

```css
/* Chart colors shared by Team Analytics and the dashboards. Six categorical slots
   validated for color-vision safety in both modes; the order is fixed (blue beside
   grape fails for deutan). Current = ink, previous period = gray. */
:root {
	--series-current: var(--mantine-color-text);
	--series-previous: var(--mantine-color-gray-5);
	--series-other: var(--mantine-color-gray-5);
	--series-1: light-dark(
		var(--mantine-color-blue-6),
		var(--mantine-color-blue-5)
	);
	--series-2: light-dark(
		var(--mantine-color-teal-6),
		var(--mantine-color-teal-7)
	);
	--series-3: var(--mantine-color-grape-6);
	--series-4: light-dark(
		var(--mantine-color-orange-6),
		var(--mantine-color-orange-8)
	);
	--series-5: light-dark(
		var(--mantine-color-indigo-6),
		var(--mantine-color-indigo-5)
	);
	--series-6: var(--mantine-color-pink-6);

	/* One hue, light to dark: heatmaps and ordered outcomes. */
	--heat-1: light-dark(
		var(--mantine-color-blue-0),
		var(--mantine-color-blue-9)
	);
	--heat-2: light-dark(
		var(--mantine-color-blue-2),
		var(--mantine-color-blue-7)
	);
	--heat-3: light-dark(
		var(--mantine-color-blue-4),
		var(--mantine-color-blue-5)
	);
	--heat-4: light-dark(
		var(--mantine-color-blue-6),
		var(--mantine-color-blue-4)
	);
	--heat-5: light-dark(
		var(--mantine-color-blue-8),
		var(--mantine-color-blue-3)
	);

	/* Two hues around a neutral middle: ordered scales such as sentiment. */
	--div-neg-2: light-dark(
		var(--mantine-color-orange-7),
		var(--mantine-color-orange-5)
	);
	--div-neg-1: light-dark(
		var(--mantine-color-orange-3),
		var(--mantine-color-orange-8)
	);
	--div-mid: light-dark(
		var(--mantine-color-gray-4),
		var(--mantine-color-dark-3)
	);
	--div-pos-1: light-dark(
		var(--mantine-color-blue-3),
		var(--mantine-color-blue-8)
	);
	--div-pos-2: light-dark(
		var(--mantine-color-blue-7),
		var(--mantine-color-blue-4)
	);

	/* Status colors only where the value means a state (burnout level). */
	--status-high: var(--mantine-color-danger-6);
	--status-medium: var(--mantine-color-amber-6);
	--status-low: var(--mantine-color-gray-5);
}
```

2. `src/styles/global.css`: after `@import url('../../design_system/tokens.css');` add `@import url('./chart-tokens.css');`.

3. `TeamAnalyticsPage.module.css`: `.pageContainer` keeps only `display: flex; flex-direction: column; gap: var(--mantine-spacing-lg);`. Delete the custom properties and their comments from it.

**Typecheck.** `grep -rn "var(--series-\|var(--heat-\|var(--status-" src/modules/qa/analytics` still resolves (the names did not change).

---

## Task 2 · Data builders (`insightsMetrics.ts`)

Replace the file. Keep `KpiKey`, `KPI_KEYS`, `snapshotOf` and the sparkline bucketing; drop `Kpi`, `buildKpis`, `TreemapNode`, `campaignTreemap`, `FlowNodeId`, `CallFlow`, `callFlow`, `ActivityMatrix`, `activityMatrix`.

```ts
import type {
	AnalyticsMetricId,
	HeatmapData,
	TeamCallMetric,
} from '~/modules/qa/analytics/types';
import { periodKeyOf } from '~/modules/qa/analytics/helpers';
import { aggregateDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import type { ThresholdSettings } from '~/modules/qa/settings/types';
import { chartGranularity } from '../operationManagerMetrics';

export type KpiKey =
	| 'calls'
	| 'effective'
	| 'qa'
	| 'compliance'
	| 'sentiment'
	| 'conversion';

export const KPI_KEYS: KpiKey[] = [
	'calls',
	'effective',
	'qa',
	'compliance',
	'sentiment',
	'conversion',
];

/** The analytics metric each headline number is, so MetricTile formats and judges it. */
export const KPI_METRIC: Record<KpiKey, AnalyticsMetricId> = {
	calls: 'OPS_CALLS_HANDLED',
	effective: 'OPS_EFFECTIVE_CONTACT_RATE',
	qa: 'QA_OVERALL_SCORE',
	compliance: 'COMPLIANCE_OVERALL_SCORE',
	sentiment: 'CUSTOMER_SENTIMENT_SCORE',
	conversion: 'BI_CONVERSION_RATE',
};

export interface HeadlineKpi {
	key: KpiKey;
	metricId: AnalyticsMetricId;
	current: number;
	/** null when the previous window had no calls. */
	previous: number | null;
	/** One value per day (short windows) or per ISO week. */
	sparkline: number[];
}

type Snapshot = Record<KpiKey, number>;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** The six headline numbers of a set of calls, from the same aggregator the classic cards use. */
const snapshotOf = (
	calls: TeamCallMetric[],
	thresholds: ThresholdSettings
): Snapshot => {
	const metrics = aggregateDashboardMetrics(calls, thresholds);
	const categories = metrics.complianceCategories;
	return {
		calls: metrics.calls,
		effective: metrics.calls
			? Math.round((100 * metrics.effectiveContacts) / metrics.calls)
			: 0,
		qa: metrics.qa.total,
		compliance: categories.length
			? Math.round(
					categories.reduce((sum, category) => sum + category.score, 0) /
						categories.length
				)
			: 0,
		sentiment: round1(metrics.sentiment.customerAvg),
		conversion: metrics.sales.offered
			? Math.round((100 * metrics.sales.sold) / metrics.sales.offered)
			: 0,
	};
};

/** Headline numbers with the previous window and a sparkline each. */
export const buildHeadlineKpis = (
	current: TeamCallMetric[],
	previous: TeamCallMetric[],
	days: number,
	thresholds: ThresholdSettings
): HeadlineKpi[] => {
	const now = snapshotOf(current, thresholds);
	const before = previous.length > 0 ? snapshotOf(previous, thresholds) : null;
	const granularity = chartGranularity(days);
	const buckets = new Map<string, TeamCallMetric[]>();
	for (const call of current) {
		const key = periodKeyOf(call.date, granularity);
		buckets.set(key, [...(buckets.get(key) ?? []), call]);
	}
	const periods = [...buckets.keys()].sort();
	const snapshots = periods.map((period) =>
		snapshotOf(buckets.get(period) ?? [], thresholds)
	);
	return KPI_KEYS.map((key) => ({
		key,
		metricId: KPI_METRIC[key],
		current: now[key],
		previous: before ? before[key] : null,
		sparkline: snapshots.map((snapshot) => snapshot[key]),
	}));
};

export type OutcomeKey = 'EFFECTIVE' | 'NOT_EFFECTIVE';
export type OfferKey = 'SALE' | 'NO_SALE' | 'NO_OFFER';

export interface TeamOutcomes {
	team: string;
	calls: number;
	reached: Record<OutcomeKey, number>;
	/** Of the reached calls only. */
	offer: Record<OfferKey, number>;
}

/** Per team: reached or not, and what happened with the offer on the reached calls. */
export const teamOutcomes = (
	calls: TeamCallMetric[],
	teams: string[]
): TeamOutcomes[] =>
	teams
		.map((team) => {
			const own = calls.filter((call) => call.team === team);
			const reached = own.filter((call) => call.contactOutcome === 'EFFECTIVE');
			const sale = reached.filter(
				(call) => call.offeredProduct !== null && call.converted
			).length;
			const noSale = reached.filter(
				(call) => call.offeredProduct !== null && !call.converted
			).length;
			return {
				team,
				calls: own.length,
				reached: {
					EFFECTIVE: reached.length,
					NOT_EFFECTIVE: own.length - reached.length,
				},
				offer: {
					SALE: sale,
					NO_SALE: noSale,
					NO_OFFER: reached.length - sale - noSale,
				},
			};
		})
		.filter((row) => row.calls > 0);

export type ActivityMode = 'volume' | 'qa';

/**
 * Weekday (Monday first) by hour, as the analytics Heatmap wants it: a value per
 * cell (calls, or mean QA; null without calls) and the call count behind each cell.
 * Hours run from the first to the last hour that has calls.
 */
export const activityHeatmap = (
	calls: TeamCallMetric[],
	mode: ActivityMode,
	weekdayLabels: string[]
): HeatmapData => {
	if (calls.length === 0) return { rows: [], cols: [], cells: [], counts: [] };
	const first = Math.min(...calls.map((call) => call.hour));
	const last = Math.max(...calls.map((call) => call.hour));
	const hours = Array.from({ length: last - first + 1 }, (_, i) => first + i);
	const groups = new Map<string, TeamCallMetric[]>();
	for (const call of calls) {
		const weekday = (call.weekday + 6) % 7;
		const key = `${weekday}:${call.hour}`;
		groups.set(key, [...(groups.get(key) ?? []), call]);
	}
	const rows = weekdayLabels.map((label, i) => ({ key: String(i), label }));
	const cells = rows.map((_, weekday) =>
		hours.map((hour) => {
			const group = groups.get(`${weekday}:${hour}`);
			if (!group) return null;
			return mode === 'volume'
				? group.length
				: round1(
						group.reduce((sum, call) => sum + call.qaScore, 0) / group.length
					);
		})
	);
	const counts = rows.map((_, weekday) =>
		hours.map((hour) => groups.get(`${weekday}:${hour}`)?.length ?? 0)
	);
	return {
		rows,
		cols: hours.map((hour) => `${String(hour).padStart(2, '0')}:00`),
		cells,
		counts,
	};
};
```

**Typecheck.** (Nothing imports the removed names after Task 5; typecheck errors from the old chart files are expected until then. Do Task 2 and Task 5 back to back if that is simpler.)

---

## Task 3 · Chrome: `Insights.module.css`, the page wrapper

### `Insights.module.css` (replace the whole file)

```css
/* The Insights grid: twelve columns on wide screens, six on tablets, one on phones. */
.grid {
	display: grid;
	grid-template-columns: repeat(12, minmax(0, 1fr));
	gap: var(--mantine-spacing-md);
}

.cell {
	grid-column: span var(--span, 12);
	min-width: 0;
}

/* Team chips above the trend chart: the swatch carries the series color, the text stays ink. */
.swatch {
	width: 10px;
	height: 10px;
	border-radius: 3px;
	flex: none;
}

/* One team's outcome rows. */
.outcomeRow + .outcomeRow {
	margin-top: var(--mantine-spacing-sm);
	padding-top: var(--mantine-spacing-sm);
	border-top: 1px solid var(--mantine-color-default-border);
}

.teamButton {
	font-weight: 600;
	font-size: var(--mantine-font-size-sm);
	border-radius: var(--mantine-radius-sm);
	padding: 2px 6px;
	margin-left: -6px;
}

.teamButton:hover,
.teamButton:focus-visible {
	background-color: light-dark(
		var(--mantine-color-gray-0),
		var(--mantine-color-dark-5)
	);
}

.teamButton[data-active='true'] {
	background-color: var(--mantine-primary-color-light);
}

@media (max-width: 75em) {
	.cell {
		grid-column: span min(var(--span, 12), 6);
	}

	.wide {
		grid-column: span 12;
	}
}

@media (max-width: 48em) {
	.cell {
		grid-column: span 12;
	}
}
```

`--span` is set per cell through `style` with the existing `// inline-style-allow:` comment (runtime grid placement), the only inline style in the feature.

### `NewOperationManagerDashboard.tsx`

- Remove `import insightsStyles from '../insights/Insights.module.css';`.
- Replace `<div className={insightsStyles.page}><OperationManagerInsights … /></div>` with `<OperationManagerInsights … />` (same props).

**Typecheck** after Task 5.

---

## Task 4 · The cards (`insights/charts/`)

A tiny grid cell helper lives in `OperationManagerInsights.tsx` (Task 5); every card below is a plain component that renders a `SectionCard` and is placed by the page.

### `charts/HeadlineTiles.tsx`

```tsx
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import {
	MetricTileRow,
	type MetricTileProps,
} from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import { formatMetric } from '~/modules/qa/analytics/helpers';
import type { HeadlineKpi } from '../insightsMetrics';

interface HeadlineTilesProps {
	kpis: HeadlineKpi[];
}

/** The six headline numbers: value, change against the previous window and a sparkline each. */
export function HeadlineTiles({ kpis }: HeadlineTilesProps) {
	const { t } = useTranslation('qa.dashboard');
	const tiles: MetricTileProps[] = kpis.map((kpi) => ({
		label: t(`operationManager.insights.kpis.${kpi.key}`),
		value: formatMetric(kpi.metricId, kpi.current),
		metricId: kpi.metricId,
		current: kpi.current,
		previous: kpi.previous,
		neutral: kpi.key === 'calls',
		sparkline: kpi.sparkline,
		compare: kpi.previous !== null,
		hint:
			kpi.previous === null
				? t('operationManager.insights.noPrevious')
				: undefined,
	}));

	return (
		<SectionCard
			padding='md'
			title={t('operationManager.insights.glance.title')}
			description={t('operationManager.insights.glance.subtitle')}
		>
			<MetricTileRow tiles={tiles} columns={6} />
		</SectionCard>
	);
}

export default HeadlineTiles;
```

`MetricTile` already colors a worsening delta `danger.7` and leaves the rest ink, and draws the sparkline in `SERIES_CURRENT` (ink). Nothing else to style.

### `charts/TeamTrendCard.tsx`

```tsx
import {
	Group,
	SegmentedControl,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { SERIES } from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import type {
	TeamSeriesPoint,
	TeamTrendMetric,
} from '../../operationManagerMetrics';
import styles from '../Insights.module.css';

const METRICS: { id: TeamTrendMetric; key: string }[] = [
	{ id: 'QA_OVERALL_SCORE', key: 'qa' },
	{ id: 'COMPLIANCE_OVERALL_SCORE', key: 'compliance' },
	{ id: 'CUSTOMER_SENTIMENT_SCORE', key: 'customerSentiment' },
];

/** Team → validated series slot. Fixed by roster position, never by what is selected. */
export const teamColor = (teams: string[], team: string): string =>
	SERIES[Math.max(0, teams.indexOf(team)) % SERIES.length];

interface TeamTrendCardProps {
	data: TeamSeriesPoint[];
	teams: string[];
	metric: TeamTrendMetric;
	onMetricChange: (metric: TeamTrendMetric) => void;
	selectedTeam: string | null;
	onTeamClick: (team: string) => void;
}

/** One line per team; the chips above are the legend and the team filter at once. */
export function TeamTrendCard({
	data,
	teams,
	metric,
	onMetricChange,
	selectedTeam,
	onTeamClick,
}: TeamTrendCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const ready = useChartReady();
	const domain: [number, number] =
		metric === 'CUSTOMER_SENTIMENT_SCORE' ? [1, 5] : [0, 100];

	return (
		<SectionCard
			padding='md'
			fullHeight
			title={t('operationManager.insights.teamTrend.title')}
			description={t('operationManager.insights.teamTrend.subtitle')}
			headerActions={
				<SegmentedControl
					size='xs'
					value={metric}
					onChange={(value) => onMetricChange(value as TeamTrendMetric)}
					data={METRICS.map(({ id, key }) => ({
						value: id,
						label: t(`operationManager.teams.metric.${key}`),
					}))}
				/>
			}
		>
			<Stack gap='sm'>
				<Group gap='xs' wrap='wrap'>
					{teams.map((team) => (
						<UnstyledButton
							key={team}
							className={styles.teamButton}
							data-active={selectedTeam === team || undefined}
							aria-pressed={selectedTeam === team}
							onClick={() => onTeamClick(team)}
						>
							<Group gap={6} wrap='nowrap'>
								<span
									className={styles.swatch}
									// inline-style-allow: the swatch takes the team's series token at runtime
									style={{ backgroundColor: teamColor(teams, team) }}
								/>
								{team}
							</Group>
						</UnstyledButton>
					))}
				</Group>
				{data.length < 2 ? (
					<Text size='sm' c='dimmed' py='xl' ta='center'>
						{t('operationManager.teams.needLongerPeriod')}
					</Text>
				) : !ready ? null : (
					<LineChart
						h={260}
						data={data}
						dataKey='label'
						series={teams.map((team) => ({
							name: team,
							label: team,
							color: teamColor(teams, team),
							strokeDasharray:
								selectedTeam !== null && selectedTeam !== team
									? '2 4'
									: undefined,
						}))}
						curveType='monotone'
						strokeWidth={2}
						withDots={data.length <= 31}
						connectNulls
						gridAxis='y'
						tickLine='none'
						withLegend
						legendProps={{ verticalAlign: 'top', height: 28 }}
						yAxisProps={{ domain, width: 40 }}
						xAxisProps={{ minTickGap: 24 }}
					/>
				)}
			</Stack>
		</SectionCard>
	);
}

export default TeamTrendCard;
```

When a team is selected the other lines go dotted, so the focus is readable without opacity tricks or recoloring (color follows the team).

### `charts/CallOutcomesCard.tsx`

```tsx
import { Stack, Text, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import {
	HEAT,
	SERIES_OTHER,
	ShareBar,
} from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import type { TeamOutcomes } from '../insightsMetrics';
import styles from '../Insights.module.css';

interface CallOutcomesCardProps {
	rows: TeamOutcomes[];
	selectedTeam: string | null;
	onTeamClick: (team: string) => void;
}

/** Per team: how many calls reached the customer, and what the offer led to. */
export function CallOutcomesCard({
	rows,
	selectedTeam,
	onTeamClick,
}: CallOutcomesCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const node = (key: string) => t(`operationManager.insights.flow.node.${key}`);

	return (
		<SectionCard
			padding='md'
			fullHeight
			title={t('operationManager.insights.flow.title')}
			description={t('operationManager.insights.flow.subtitle')}
		>
			{rows.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('operationManager.insights.empty')}
				</Text>
			) : (
				<div>
					{rows.map((row) => (
						<div key={row.team} className={styles.outcomeRow}>
							<Stack gap='xs'>
								<UnstyledButton
									className={styles.teamButton}
									data-active={selectedTeam === row.team || undefined}
									aria-pressed={selectedTeam === row.team}
									onClick={() => onTeamClick(row.team)}
								>
									{row.team}
									<Text span size='xs' c='dimmed' ml={6}>
										{t('drill.calls', { count: row.calls })}
									</Text>
								</UnstyledButton>
								<ShareBar
									segments={[
										{
											key: 'EFFECTIVE',
											label: node('EFFECTIVE'),
											value: row.reached.EFFECTIVE,
											color: HEAT[3],
										},
										{
											key: 'NOT_EFFECTIVE',
											label: node('NOT_EFFECTIVE'),
											value: row.reached.NOT_EFFECTIVE,
											color: SERIES_OTHER,
										},
									]}
								/>
								<ShareBar
									title={t('operationManager.insights.flow.ofReached')}
									segments={[
										{
											key: 'SALE',
											label: node('SALE'),
											value: row.offer.SALE,
											color: HEAT[4],
										},
										{
											key: 'NO_SALE',
											label: node('NO_SALE'),
											value: row.offer.NO_SALE,
											color: HEAT[2],
										},
										{
											key: 'NO_OFFER',
											label: node('NO_OFFER'),
											value: row.offer.NO_OFFER,
											color: SERIES_OTHER,
										},
									]}
								/>
							</Stack>
						</div>
					))}
				</div>
			)}
		</SectionCard>
	);
}

export default CallOutcomesCard;
```

Colors are one hue (the blue heat ramp) for "better" outcomes and gray for the rest, so the bars are ordered, not categorical.

### `charts/ActivityHeatmapCard.tsx`

```tsx
import { SegmentedControl, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { Heatmap } from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import type { HeatmapData } from '~/modules/qa/analytics/types';
import type { ActivityMode } from '../insightsMetrics';

interface ActivityHeatmapCardProps {
	data: HeatmapData;
	mode: ActivityMode;
	onModeChange: (mode: ActivityMode) => void;
}

/** When the calls happen: weekday by hour, as volume or as mean QA. */
export function ActivityHeatmapCard({
	data,
	mode,
	onModeChange,
}: ActivityHeatmapCardProps) {
	const { t } = useTranslation('qa.dashboard');

	return (
		<SectionCard
			padding='md'
			fullHeight
			title={t('operationManager.insights.heatmap.title')}
			description={t('operationManager.insights.heatmap.subtitle')}
			headerActions={
				<SegmentedControl
					size='xs'
					value={mode}
					onChange={(value) => onModeChange(value as ActivityMode)}
					data={[
						{
							value: 'volume',
							label: t('operationManager.insights.heatmap.mode.volume'),
						},
						{
							value: 'qa',
							label: t('operationManager.insights.heatmap.mode.qa'),
						},
					]}
				/>
			}
		>
			{data.rows.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('operationManager.insights.empty')}
				</Text>
			) : (
				<Heatmap
					data={data}
					metricId={
						mode === 'volume' ? 'OPS_CALLS_HANDLED' : 'QA_OVERALL_SCORE'
					}
				/>
			)}
		</SectionCard>
	);
}

export default ActivityHeatmapCard;
```

`Heatmap` (analytics kit) already uses the `HEAT` ramp, fades cells under `HEATMAP_MIN_CALLS` and puts the count in the tooltip.

### `charts/BurnoutCard.tsx`

```tsx
import { Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import {
	ShareBar,
	SmallMultiples,
	STATUS,
} from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import type {
	PlatformBurnoutSummary,
	TeamSeriesPoint,
} from '../../operationManagerMetrics';
import { BurnoutRiskLevel } from '../../types/burnoutRisk';
import dashboardStyles from '../../Dashboard.module.css';

interface BurnoutCardProps {
	summary: PlatformBurnoutSummary;
	/** Share of calls with a negative agent emotion, per team and period. */
	series: TeamSeriesPoint[];
	teams: string[];
}

/** Where the agents stand today and how negative emotion moves per team. */
export function BurnoutCard({ summary, series, teams }: BurnoutCardProps) {
	const { t } = useTranslation('qa.dashboard');

	return (
		<SectionCard
			padding='md'
			fullHeight
			title={t('operationManager.insights.burnout.title')}
			description={t('operationManager.insights.burnout.subtitle')}
		>
			<Stack gap='md'>
				<Group gap='xs' align='baseline'>
					<Text className={dashboardStyles.scoreValue}>{summary.atRisk}</Text>
					<Text size='sm' c='dimmed'>
						{t('operationManager.insights.burnout.ofTotal', {
							total: summary.total,
						})}
					</Text>
				</Group>
				<ShareBar
					segments={[
						{
							key: 'low',
							label: t(`burnout.level.${BurnoutRiskLevel.LOW}`),
							value: summary.counts[BurnoutRiskLevel.LOW],
							color: STATUS.low,
						},
						{
							key: 'medium',
							label: t(`burnout.level.${BurnoutRiskLevel.MEDIUM}`),
							value: summary.counts[BurnoutRiskLevel.MEDIUM],
							color: STATUS.medium,
						},
						{
							key: 'high',
							label: t(`burnout.level.${BurnoutRiskLevel.HIGH}`),
							value: summary.counts[BurnoutRiskLevel.HIGH],
							color: STATUS.high,
						},
					]}
				/>
				<Text size='xs' c='dimmed'>
					{t('operationManager.burnout.chartCaption')}
				</Text>
				{series.length < 2 ? (
					<Text size='sm' c='dimmed'>
						{t('operationManager.teams.needLongerPeriod')}
					</Text>
				) : (
					<SmallMultiples
						metricId='AGENT_NEGATIVE_EMOTION_CALL_SHARE'
						items={teams.map((team) => ({
							key: team,
							label: team,
							data: series.map((point) => ({
								period: point.period,
								value: point[team] as number | null,
							})),
						}))}
					/>
				)}
			</Stack>
		</SectionCard>
	);
}

export default BurnoutCard;
```

Status colors are used because the three levels are states; the small multiples are ink, one per team, so no team color is needed here. (`SmallMultiples` lays out 4 columns on `lg`; three teams leave one empty column, which is fine. If it looks unbalanced, pass `cols={{ base: 1, sm: 3 }}` by adding an optional `cols` prop to `SmallMultiples` that defaults to today's value.)

### Human vs AI and ESG

No new files. `OperationManagerInsights.tsx` renders:

```tsx
<SectionCard padding='md' fullHeight title={t('operationManager.insights.humanVsAi.title')} description={t('operationManager.insights.humanVsAi.subtitle')}>
	<HumanVsAiCard data={HUMAN_VS_AI_PERFORMANCE} />
</SectionCard>

<SectionCard padding='md' fullHeight title={t('operationManager.insights.esg.title')} description={t('operationManager.insights.esg.subtitle')}>
	<EsgScoreCard esg={OPERATION_MANAGER_ESG} />
</SectionCard>
```

In `HumanVsAiCard.tsx` change the AI series color from `'violet.6'` to `'var(--series-1)'` (the human series stays ink). Violet is not a design-system color; this also fixes the Classic view.

---

## Task 5 · Page wiring (`OperationManagerInsights.tsx`)

Replace the file.

```tsx
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Group, Pill } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { teamCallsInWindow } from '~/modules/qa/calls/agentMetrics';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import {
	selectTriggerRules,
	useTriggerRulesStore,
} from '~/stores/qa/triggerRulesStore';
import { CampaignPerformanceTable } from '../components/CampaignPerformanceTable';
import { EsgScoreCard } from '../components/EsgScoreCard';
import { HumanVsAiCard } from '../components/HumanVsAiCard';
import type { DashboardLineOfBusiness } from '../lineOfBusiness';
import { HUMAN_VS_AI_PERFORMANCE, OPERATION_MANAGER_ESG } from '../mockData';
import {
	OPERATION_MANAGER_TEAMS,
	buildCampaignPerformanceRows,
	buildTeamBurnoutSeries,
	buildTeamPerformanceSeries,
	platformBurnoutSummary,
	type TeamTrendMetric,
} from '../operationManagerMetrics';
import { ActivityHeatmapCard } from './charts/ActivityHeatmapCard';
import { BurnoutCard } from './charts/BurnoutCard';
import { CallOutcomesCard } from './charts/CallOutcomesCard';
import { HeadlineTiles } from './charts/HeadlineTiles';
import { TeamTrendCard } from './charts/TeamTrendCard';
import {
	EMPTY_FILTER,
	applyCrossFilter,
	isFiltered,
	toggleFilter,
	type CrossFilter,
} from './crossFilter';
import {
	activityHeatmap,
	buildHeadlineKpis,
	teamOutcomes,
	type ActivityMode,
} from './insightsMetrics';
import styles from './Insights.module.css';

interface OperationManagerInsightsProps {
	days: number;
	lineOfBusiness: DashboardLineOfBusiness | null;
	onLineOfBusinessChange: (value: DashboardLineOfBusiness | null) => void;
}

/** One grid cell: `span` columns out of 12 on a wide screen. */
function Cell({
	span,
	wide = false,
	children,
}: {
	span: number;
	wide?: boolean;
	children: ReactNode;
}) {
	return (
		<div
			className={[styles.cell, wide ? styles.wide : '']
				.filter(Boolean)
				.join(' ')}
			// inline-style-allow: the grid placement of each cell is a runtime value
			style={{ '--span': span } as CSSProperties}
		>
			{children}
		</div>
	);
}

/**
 * The operation's data as linked cards: headline numbers, then visuals that
 * share one filter. Picking a team (chips, outcome rows) or a campaign (table
 * row) narrows every other card; picking it again clears it.
 */
export function OperationManagerInsights({
	days,
	lineOfBusiness,
}: OperationManagerInsightsProps) {
	const { t } = useTranslation('qa.dashboard');
	const thresholds = useSettingsStore(selectThresholds);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const [rawFilter, setRawFilter] = useState<CrossFilter>(EMPTY_FILTER);
	const [teamMetric, setTeamMetric] =
		useState<TeamTrendMetric>('QA_OVERALL_SCORE');
	const [heatMode, setHeatMode] = useState<ActivityMode>('volume');
	const weekdays = t('operationManager.insights.weekdays', {
		returnObjects: true,
	}) as unknown as string[];

	// … keep the existing memo chain unchanged: windowCalls, previousCalls, filter, calls, previous, allTeams, allCampaigns …

	const kpis = useMemo(
		() => buildHeadlineKpis(calls, previous, days, thresholds),
		[calls, previous, days, thresholds]
	);
	const teamSeries = useMemo(
		() => buildTeamPerformanceSeries(allTeams, days, teamMetric),
		[allTeams, days, teamMetric]
	);
	const burnoutSeries = useMemo(
		() => buildTeamBurnoutSeries(allTeams, days),
		[allTeams, days]
	);
	const burnoutSummary = useMemo(
		() => platformBurnoutSummary(triggerRules),
		[triggerRules]
	);
	const outcomes = useMemo(
		() => teamOutcomes(allTeams, OPERATION_MANAGER_TEAMS),
		[allTeams]
	);
	const heatmap = useMemo(
		() => activityHeatmap(calls, heatMode, weekdays),
		[calls, heatMode, weekdays]
	);
	const campaignRows = useMemo(
		() => buildCampaignPerformanceRows(allCampaigns, thresholds),
		[allCampaigns, thresholds]
	);

	const pickTeam = (team: string) =>
		setRawFilter((current) => toggleFilter(current, 'team', team));
	const pickCampaign = (campaignId: string) =>
		setRawFilter((current) => toggleFilter(current, 'campaignId', campaignId));
	const campaignName = (id: string) =>
		windowCalls.find((call) => call.campaignId === id)?.campaignName ?? id;

	if (windowCalls.length === 0)
		return <EmptyState message={t('operationManager.insights.empty')} />;

	return (
		<div>
			{/* pills block: unchanged from today */}

			<div className={styles.grid}>
				<Cell span={12}>
					<HeadlineTiles kpis={kpis} />
				</Cell>
				<Cell span={8} wide>
					<TeamTrendCard
						data={teamSeries}
						teams={OPERATION_MANAGER_TEAMS}
						metric={teamMetric}
						onMetricChange={setTeamMetric}
						selectedTeam={filter.team}
						onTeamClick={pickTeam}
					/>
				</Cell>
				<Cell span={4}>
					<CallOutcomesCard
						rows={outcomes}
						selectedTeam={filter.team}
						onTeamClick={pickTeam}
					/>
				</Cell>
				<Cell span={7} wide>
					<ActivityHeatmapCard
						data={heatmap}
						mode={heatMode}
						onModeChange={setHeatMode}
					/>
				</Cell>
				<Cell span={5}>
					<SectionCard
						padding='md'
						fullHeight
						title={t('operationManager.insights.humanVsAi.title')}
						description={t('operationManager.insights.humanVsAi.subtitle')}
					>
						<HumanVsAiCard data={HUMAN_VS_AI_PERFORMANCE} />
					</SectionCard>
				</Cell>
				<Cell span={6}>
					<BurnoutCard
						summary={burnoutSummary}
						series={burnoutSeries}
						teams={OPERATION_MANAGER_TEAMS}
					/>
				</Cell>
				<Cell span={6}>
					<SectionCard
						padding='md'
						fullHeight
						title={t('operationManager.insights.esg.title')}
						description={t('operationManager.insights.esg.subtitle')}
					>
						<EsgScoreCard esg={OPERATION_MANAGER_ESG} />
					</SectionCard>
				</Cell>
				<Cell span={12}>
					<SectionCard
						padding='md'
						title={t('operationManager.insights.campaigns.title')}
						description={t('operationManager.insights.campaigns.subtitle')}
					>
						<CampaignPerformanceTable
							rows={campaignRows}
							activeId={filter.campaignId}
							onRowClick={(row) => pickCampaign(row.id)}
						/>
					</SectionCard>
				</Cell>
			</div>
		</div>
	);
}

export default OperationManagerInsights;
```

Notes:

- `onLineOfBusinessChange` is no longer used inside (the treemap was the only in-grid LOB picker; the header select still drives it). Keep the prop in the interface and the call site, or drop both; either is fine, do not leave an unused destructured variable.
- The trailing hint `Text` is removed.
- Delete the files listed under "Deleted" above, then `npm uninstall echarts` (confirm `grep -rn "from 'echarts" src` is empty first; the only hit today is `insights/echarts.ts`).

**Typecheck.**

---

## Task 6 · Locale (`qa.dashboard.json`, `operationManager.insights`)

Remove: `gauges`, `treemap`, `hint`, `pts`, `vsPrevious` (MetricTile brings its own from `qa.teamAnalytics`).

Change / add (en → es):

- `glance.subtitle`: "Headline numbers of the selected period against the one before" (keep) → keep es.
- `noPrevious`: "No previous period to compare" → "Sin periodo anterior para comparar".
- `teamTrend.subtitle`: "Pick a team to focus the dashboard on it" → "Elige un equipo para enfocar el tablero en él".
- `flow.title`: "Call outcomes" → "Resultado de las llamadas"; `flow.subtitle`: "Reached customers per team and what the offer led to" → "Clientes contactados por equipo y a qué llevó la oferta"; `flow.ofReached`: "Of the reached calls" → "De las llamadas contactadas"; keep `flow.node.*`.
- `heatmap.title`: "Activity by hour" → "Actividad por hora"; keep subtitle, modes, `calls_*`, `qa`.
- `burnout.*`, `esg.*`, `humanVsAi.*`, `campaigns.*`, `filters.*`, `empty`, `weekdays`, `kpis.*`, `view.*`: keep.

Key parity en/es after the edit (same keys, same order).

**Typecheck.**

---

## Verification

1. `npm run typecheck` clean.
2. `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba\(|echarts|cyan|violet|indigo|teal" src/modules/qa/dashboard/insights` → no hits (teal only appears via `--series-2` in `chart-tokens.css`, outside the folder).
3. `grep -rn "echarts" package.json src` → no hits.
4. Team Analytics unchanged: `grep -rn "var(--series-\|var(--heat-\|var(--status-" src/modules/qa/analytics` resolve through `:root`; open `/qa/supervisor/analytics` once when the dev server is allowed.
5. Palette: already validated (see Context); re-run `validate_palette.js` only if the series tokens change.
6. Visual check in light and dark at desktop and 48em: headline tiles, chips select and dotted lines, outcome rows, heatmap legend, burnout share bar, campaigns row highlight. Needs the user's go-ahead for the dev server.
7. No commit unless asked.

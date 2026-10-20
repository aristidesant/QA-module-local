# Team Analytics for Supervisor, QA Manager and Operation Manager: every area, charts, Human vs AI, Disputes

## Context

The Analytics section (`/qa/supervisor/analytics`, `/qa/qa-manager/analytics`, and the Operation Manager's sidebar item pointing at the QA Manager page) is one page with six tabs: QA, Sentiment & Emotion, Compliance, Business Insights, Agent Finder, Burnout Risk. Audit findings (2026-10-20):

- **No charts.** QA, Sentiment and Compliance are one comparison table each. Business is cards and progress bars; its conversion trend is computed but never drawn. Burnout is a table.
- **Missing areas.** No Operational view (AHT, contact outcome and hours exist in the data but are shown nowhere). No Disputes view (disputes are not joined to calls at all). No Human vs AI (no call records an AI agent; the Operation Manager dashboard card uses fixed numbers). No Overview.
- **Sentiment is thin.** No sentiment-type distribution, no emotion-type breakdown, no agent vs customer comparison; the agent's own emotion is in the data but unused.
- **Periods.** 7d / 30d / 90d / custom over 180 days of data; the "Compare with previous period" flag exists but has no control; applying a saved view does not switch the tab.
- **Roles.** The Operation Manager is served the QA Manager page with the QA Manager heading.
- **Volume.** About 7,300 calls today; no index by date or agent, so every filter re-scans everything, and the only large-data devices are the 8-segment cap and "Other".

Decisions made with the user (2026-10-20):

- **One page, three scopes.** Supervisor = own team; QA Manager and Operation Manager = all teams. The Operation Manager gets `/qa/operation-manager/analytics` so heading and scope are right.
- **AI agents are seeded with real call data**: an analytics-only roster of six AI agents (two per team) with their own generated calls. Every view can filter or group by agent type; the Human vs AI tab is computed.
- **Tabs:** Overview · Operational · QA · Compliance · Business Insights · Sentiment & Emotion · Human vs AI · Burnout Risk · Disputes · Agent Finder.
- **Periods:** 7d · 30d · 90d · 12m · custom over 365 days of history, with the bucket (daily / weekly / monthly) chosen from the period length and still overridable.
- Charts follow the dataviz rules: form first, one colour device per chart, neutral primary series with gray previous period, categorical only when the series are the subject (max 4 lines, then small multiples), sequential single hue for heatmaps, every chart has a table twin, legends for 2+ series, no dual axes, thin marks and hairline grids. Delta colours follow the repo rule "colour means exception": neutral unless the change is bad for the metric.

Mode: mockup. Mantine v9 + `@mantine/charts` 9.2 (already installed; the only chart library used in `src/modules/qa`). CSS modules, no inline styles, strings in `en` and `es`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-20-team-analytics-all-areas.md`.

---

## Verified facts (do not re-explore)

**Page** (`src/modules/qa/analytics/TeamAnalyticsPage/`): `TeamAnalyticsPage.tsx` reads `?view=` (`VIEW_PARAM`, default `qa`), renders header → `FilterBar` + `SavedViewsMenu` → `ViewSelector` (Mantine `Tabs` over `TEAM_ANALYTICS_VIEWS`) → `KPIStrip` → view. `TeamAnalyticsContext.tsx` computes `{ role, filters, groupBy, scopedAgents, calls, previousCalls, scopedCalls, kpis, previousKpis }` in one `useMemo` from `TEAM_CALLS` via `filterCalls`, `shiftFilters(previousPeriod())`, `computeKpis`. Views: `Segmentation/SegmentationView.tsx` (props `viewType: 'qa'|'sentiment'|'compliance'`; metric `Select` from `VIEW_METRICS[viewType]`, `GroupBySelector`, `BreadcrumbNav`, `SegmentationTable` which is a Mantine `Table` with trend icon coloured green/red via `METRIC_BY_ID[metricId].higherIsBetter`), `Business/BusinessView.tsx` (`aggregateBusiness(calls, previousCalls, granularity)` → `BusinessSummary`), `Finder/FinderView.tsx`, `Burnout/BurnoutView.tsx` (`burnoutCandidates(role, rules)`, `assessBurnout`, ignores filters, link to `/qa/${role}/triggers`). `FilterDrawer.tsx` has `QUICK_RANGES = ['7d','30d','90d']`, `QUICK_RANGE_DAYS`, `GRANULARITIES`, `SCORE_METRICS = Object.values(VIEW_METRICS).flat()`. `FilterBar.tsx` has `VALUE_LABEL_NAMESPACE` for chip labels. Store `src/stores/qa/teamAnalyticsStore.ts` (`filters`, `groupBy`, `drill`, `presets`, `finderQuery`, …; `applyPreset` returns the preset but `SavedViewsMenu.tsx:86` discards it). CSS `TeamAnalyticsPage.module.css` (`.pageContainer`, `.viewSelector`, `.controlsRow`, `.filterBar`, `.kpiStrip`, `.contentArea`, `.tableSurface`, …).

**Role:** `roleFromPath` (`src/modules/qa/team/helpers.ts:19`) returns `TeamRole = 'supervisor' | 'qa-manager'` and is used across the module. `scopeAgents(role)` (`analytics/helpers.ts:130`) = `TEAM_AGENTS` filtered to `SUPERVISOR_PERSONA.id` for supervisors. Routes `supervisor/analytics` and `qa-manager/analytics` (`routes.tsx:1215–1236`) both render `TeamAnalyticsPage`; namespaces in `src/modules/qa/qaNamespaces.ts:364–380`. Sidebar OM item: `roleNavigation.tsx` key `operationmanager-analytics` → `/qa/qa-manager/analytics`, namespace `qa.teamAnalytics`.

**Data** (`src/modules/qa/analytics/`): `types.ts` — `TeamCallMetric extends CallMetric` (fields listed in the audit: identity, campaign, shift/hour/weekday/timeSlot/afterHours, `handleTimeSeconds`, `contactOutcome`, `qaScore`, `qaScores{ecn,enc,ecc,ecuf}` counts, `autoFail`, `complianceByArea.{security,regulatory,legal}.{score,items}`, `customerSentiment`, `agentSentiment` 1–5, `predominantEmotion` (customer) and `agentEmotion` (8 `CallEmotion` values), `sentimentRecovered`, `signals`, `offeredProduct`, `converted`, `nonConversionReason`, `competitorMentioned`); `TeamAnalyticsFilters` (`from,to,quickRange,granularity,compareWithPrevious,…arrays…,flags,scoreRange,minCalls`); `GroupByDimension`; `QuickRange = '7d'|'30d'|'90d'|'custom'`; `Granularity`; `SegmentMetricId = Extract<TriggerMetricId, …21 ids>`; `SegmentRow`, `SegmentSeriesPoint`, `ComparisonSeriesPoint`, `TeamKpis`, `BusinessSummary`. `constants.ts` — `TODAY`, `addDays`, `TEAM_ANALYTICS_VIEWS`, `GROUP_BY_OPTIONS` (`managerOnly`), `DRILL_NEXT`, `VIEW_METRICS`, `PRIMARY_METRIC`, `TIME_SLOTS`, `EMOTIONS`, `WEEKDAYS`, `WEEKDAY_SHORT`, `MAX_SEGMENT_SERIES = 8`, `OTHER_SEGMENT_KEY`, `SEGMENT_COLORS`, `DEFAULT_FILTERS`, `BUILT_IN_PRESETS`, finder defaults. `helpers.ts` — `filterCalls(calls, f, role)`, `previousPeriod`, `shiftFilters`, `isEqualFilters`, `filterChips` (+`ARRAY_KEYS`), `narrowFilters`, `metricOf(call, TriggerMetricId)`, `aggregateMetric` (COUNT → sum; `SHARE_METRIC_IDS` → 100×mean; else mean; reads `METRIC_BY_ID[id].unit`), `comparison`, `isImprovement`, `formatMetric` (→ `formatMetricValue` from `triggers/helpers.ts`, PERCENT/SCORE_5/COUNT only), `periodKeyOf(iso, granularity)` (weekly = local-time year + Jan-1-based week index), `segmentKeyOf`, `buildSegments`, `sparklineFor`, `buildSegmentSeries`, `alignedComparisonSeries`, `computeKpis`, `aggregateBusiness`, `runFinderQuery`, `burnoutCandidates`, `assessBurnout`. `mockData.ts` — `DAYS = 180`, `TREND_DAYS = 90`, `seeded(seed)`, `generateCalls({ seed, idPrefix, personas, days, extraCallsPerDay })` resolving each persona through `TEAM_AGENTS.find` (L141), per-call draw order ends with `contactOutcome` (L255), the literal `out.push({...})` (L261–323) is the only place a `TeamCallMetric` is constructed; `buildTeamCalls` (seed 11, `TCALL`), `buildRoughPatchCalls` (seed 29, `TXCALL`, 45 days, +1/day), `blurCustomerEmotions`, `TEAM_CALLS = buildAllCalls()`, two post-hoc AGT-004 incidents (L413–463), `BURNOUT_ACTIONS_SEED`. `Persona` is exported from `src/modules/qa/team/mockData.ts` (since the Team configuration plan), as are `AVATAR_COLORS` and `buildAgentProfile`.

**Metric catalog:** `TriggerMetricId` (`src/models/qa/triggerRules.ts:12–37`), `MetricUnit = 'PERCENT'|'SCORE_5'|'COUNT'`, `TRIGGER_METRIC_CATALOG` / `METRIC_BY_ID` (`src/modules/qa/triggers/constants.ts:48–271`, each entry has `unit`, `higherIsBetter`, `area`), `formatMetricValue` (`triggers/helpers.ts:24`). No operational or dispute ids exist. Rankings already solved "extra metric ids" locally: `OperationalMetricId` (`src/models/qa/rankingPrograms.ts:4–10`: `OPS_AHT_SECONDS`, `OPS_CALLS_HANDLED`, …) with a local meta map and `rankingMetricOf` falling through to `metricOf` (`src/modules/qa/rankings/metrics.ts:21–132`). `formatSeconds(s)` → `m:ss` in `src/modules/qa/team/helpers.ts:72`. Thresholds: `useSettingsStore.getState().thresholds.{qa.lowScoreIncident, compliance.areaTargetPerCall, sentiment.lowSentimentIncident}` (used by `calls/issues.ts`).

**Consumers of the call data outside the page** (all must keep seeing humans only): `assessBurnout`, `burnoutEvidenceCalls`, `computeWorkload` (BurnoutTab), `calls/helpers.ts` (`buildAgentCalls`, `buildCampaignCalls`), `calls/agentMetrics.ts`, the four dashboards through `teamCallsInWindow`, `dashboard/operationManagerMetrics.ts`, coaching (`EvidenceCallsModal`, `weeklyBatch`, `scorecard`, `postCoaching`), rankings (`computeStandings`, `rankingsStore` resolves seed winners at module load), reports (`buildReportData.ts:124` `filterCalls(TEAM_CALLS, …)`; `reportBuilder.ts:73` `metrics: TriggerMetricId[]` compared against `SegmentMetricId` at `buildReportData.ts:144`), `ConversationsPage.tsx:77` `FULL_HISTORY_DAYS = 180`, `reports/components/composer/PeriodScopeStep.tsx` (`PRESET_DAYS: Partial<Record<QuickRange, number>>`).

**Disputes:** `src/models/qa/disputeCases.ts` — `DisputeStatus = 'open'|'accepted'|'partially-accepted'|'rejected'`, `DisputeEvaluationType = 'qa'|'sentiment-emotion'|'compliance'|'business-insights'`. Store `src/stores/qa/disputesStore.ts` with 15 seeded cases whose `callId`s (`CALL-20xx`) never match analytics ids; stays untouched.

**AI agent type:** `AgentType = 'HUMAN' | 'AI_BOT'` in `src/models/qa/agents.ts:3`. `HumanVsAiCard` (`src/modules/qa/dashboard/components/HumanVsAiCard.tsx`) draws a normalised grouped `BarChart` with human = `var(--mantine-color-text)`; stays as is.

**Chart conventions:** `useChartReady()` (`src/modules/qa/hooks/useChartReady.ts`) delays chart mount one frame. `StatCard` (`src/components/StatCard`: `title, value, subtitle?: ReactNode, chart?: ReactNode, icon?, color?, variant?: 'default'|'compact'`) is the repo's stat tile and the only one with a chart slot. `SectionCard` (`title, description, headerActions, footer, padding, fullHeight`). `BaseTable` (paginate with `enablePagination showPaginationControls pageSize`). Theme colours `amber` and `danger` exist (`src/theme.ts:149`). `docs/superpowers/plans/2026-10-09-supervisor-dashboard-quieter-color.md`: colour means exception; deltas dimmed unless bad; bars and numbers neutral; `amber`/`danger` for warning/danger, never stock yellow/red.

**Palette validated** with the dataviz validator (`scripts/validate_palette.js`, 2026-10-20) — six categorical slots in this order pass every check in both modes (light has a contrast WARN on teal and orange, relieved by legends plus the table twin every chart has):

| Slot | Light              | Dark               |
| ---- | ------------------ | ------------------ |
| 1    | blue.6 `#228be6`   | blue.5 `#339af0`   |
| 2    | teal.6 `#12b886`   | teal.7 `#0ca678`   |
| 3    | grape.6 `#be4bdb`  | grape.6 `#be4bdb`  |
| 4    | orange.6 `#fd7e14` | orange.8 `#e8590c` |
| 5    | indigo.6 `#4c6ef5` | indigo.5 `#5c7cfa` |
| 6    | pink.6 `#e64980`   | pink.6 `#e64980`   |

Adjacency matters: blue next to grape fails for deuteranopia, so the order above is fixed and never re-sorted by rank. The current 8-slot `SEGMENT_COLORS` fails the dark lightness band (teal/orange/cyan/lime .6) and is replaced.

**Locale** `src/locales/{en,es}/qa.teamAnalytics.json`: blocks `page` (eyebrow/description per role `supervisor`/`qa-manager`, `views`), `filters` (quickRange, granularityOptions, `compare`, groupByOptions, chips, labels incl. `emotionLabels`, `statusLabels`, `weekdayLabels`, `tenureLabels`, `shiftLabels`, `directionLabels`, `campaignTypeLabels`), `presets`, `kpis`, `areas`, `metrics` (flat by id; orphan `CONVERSION_RATE`), `segments`, `overview` (used by `SegmentationTable` for the comparison columns — not a view), `business`, `finder`, `burnout` (`listDescription` per role), `actions`, `common` (`na`).

---

## Direction

```
SUPERVISOR · TEAM 1                                   (eyebrow per role)
Team Analytics
Explore your team's performance across every area …

[⚙ Filters (2)] [Period 30d ×] [Shift: Night ×]  [Compare with previous ●]        [Saved views ▾]

Overview | Operational | QA | Compliance | Business Insights | Sentiment & Emotion | Human vs AI | Burnout Risk | Disputes | Agent Finder
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
┌ Calls ─────┐ ┌ Effective ──┐ ┌ QA score ───┐ ┌ Compliance ─┐ ┌ Cust. sent. ┐ ┌ Conversion ─┐      ← MetricTile row
│ 1,284      │ │ 78%         │ │ 84%         │ │ 91%         │ │ 3.9         │ │ 23%         │        value · delta vs
│ ▲ 4% ▁▂▃▅▆ │ │ ▼ 2 pts ▅▃▂ │ │ ▲ 1 pt      │ │ — flat      │ │ ▼ 0.2 (red) │ │ ▲ 3 pts     │        previous · sparkline
└────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
┌ QA score · trend ───────────────── [Metric ▾] [Group by ▾] ┐ ┌ Error mix per week ───────────────────┐
│  ── current (ink)   ┄┄ previous (gray)   ┄ target 75       │ │ ▇▇▇▇ ENC ▇ ECN ▇ ECC ▇ ECUF (100% bars) │
│                                                            │ │                                         │
└────────────────────────────────────────────────────────────┘ └─────────────────────────────────────────┘
┌ Compare by agent ───────────────────────────────────────────────────────────────────── [Metric ▾] ┐
│ Agent        Calls   Current   Previous   Change   Trend    ›   (existing SegmentationTable, drill-down)│
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Every area tab has the same anatomy: **tiles → trend + one breakdown → segmentation table**. Group-by with ≤ 4 segments draws one multi-line chart in the validated slot order; 5–8 segments switch to small multiples (one neutral line per card); the 8-cap + "Other" stays.

---

## Chart kit rules (apply everywhere)

- **Primary series** = `var(--series-current)` (`--mantine-color-text`); **previous period** = `var(--series-previous)` (gray.5) dashed `4 4`, only when `filters.compareWithPrevious`; **target** = gray hairline reference line labelled "Target".
- **Categorical** (group-by lines, stacked error mix, human vs AI): slots `--series-1…6` from the table above; "Other" = `--series-other` (gray.5). Colour follows the segment's position in `buildSegments` output, which is sorted by calls and stable for a given filter set.
- **Sequential** (heatmaps): `--heat-1…5` = blue.0/2/4/6/8 light, blue.9/7/5/4/3 dark.
- **Diverging** (sentiment bands): `--div-neg-2/-1`, `--div-mid`, `--div-pos-1/+2` = orange.7, orange.3, gray.4, blue.3, blue.7 (light) / orange.5, orange.8, dark.3, blue.8, blue.4 (dark).
- **Status** only where the value means state: burnout level (high `danger.6`, medium `amber.6`, low `gray.5`) and delta text (`danger.7` only when the change is bad for the metric; otherwise dimmed).
- Marks: `strokeWidth 2`, dots only when ≤ 31 points, `gridAxis='y'`, `tickLine='none'`, no dashed grid, bar radius 4, 2px gaps between stacked segments, `withLegend` for ≥ 2 series, Mantine tooltip on every chart, `valueFormatter` from `formatMetric`.
- Every chart card has a table twin on the same tab (the segmentation table or a BaseTable) and an empty state (`charts.empty`).
- No dual axes. Two measures of different scale → two cards or an index (Human vs AI uses a 0–100 index with the raw values in its table).
- All colours are CSS variables declared on `.pageContainer` with `light-dark()`; no hex in TSX.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. New files follow the existing `TeamAnalyticsPage/<Area>/<Area>View.tsx` + `index.ts` convention; the chart kit lives in `TeamAnalyticsPage/charts/`. Prettier on touched files only.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-20-team-analytics-all-areas.md`.

### Task 1 — Types and constants

**`src/modules/qa/analytics/types.ts`**

```ts
import type { AgentType } from '~/models/qa/agents';
import type {
	DisputeEvaluationType,
	DisputeStatus,
} from '~/models/qa/disputeCases';
import type { MetricUnit, EvaluationArea } from '~/models/qa';

export type TeamAnalyticsView =
	| 'overview'
	| 'operational'
	| 'qa'
	| 'compliance'
	| 'business'
	| 'sentiment'
	| 'humanVsAi'
	| 'burnout'
	| 'disputes'
	| 'finder';
/** Views whose segmentation table runs on VIEW_METRICS. */
export type MetricView = Exclude<
	TeamAnalyticsView,
	'overview' | 'finder' | 'burnout' | 'humanVsAi'
>;

export type GroupByDimension /* existing */ = 'agentType';
export type QuickRange = '7d' | '30d' | '90d' | '12m' | 'custom';

/** Analytics-only metric ids (not in the triggers catalog); meta in ANALYTICS_METRIC_META. */
export type AnalyticsOnlyMetricId =
	| 'OPS_CALLS_HANDLED'
	| 'OPS_EFFECTIVE_CONTACT_RATE'
	| 'OPS_AHT_SECONDS'
	| 'OPS_HOLD_SECONDS'
	| 'OPS_WRAP_UP_SECONDS'
	| 'OPS_TRANSFER_RATE'
	| 'OPS_FCR_RATE'
	| 'OPS_AFTER_HOURS_SHARE'
	| 'AGENT_NEGATIVE_EMOTION_CALL_SHARE'
	| 'AGENT_POSITIVE_EMOTION_CALL_SHARE'
	| 'SENTIMENT_RECOVERY_RATE'
	| 'BI_CONVERSION_RATE'
	| 'DISPUTE_COUNT'
	| 'DISPUTE_RATE';
export type AnalyticsMetricId = TriggerMetricId | AnalyticsOnlyMetricId;
export type AnalyticsMetricUnit = MetricUnit | 'SECONDS';
export type AnalyticsMetricArea = EvaluationArea | 'OPERATIONAL' | 'DISPUTES';
export interface AnalyticsMetricMeta {
	unit: AnalyticsMetricUnit;
	higherIsBetter: boolean;
	area: AnalyticsMetricArea;
}

export type SegmentMetricId =
	| Extract<TriggerMetricId /* existing 21 */>
	| AnalyticsOnlyMetricId;

export interface TeamCallMetric extends CallMetric {
	/* existing fields … */
	agentType: AgentType;
	holdTimeSeconds: number;
	wrapUpSeconds: number;
	transferred: boolean;
	/** Only meaningful when contactOutcome === 'EFFECTIVE'. */
	firstContactResolved: boolean;
}

export interface TeamAnalyticsFilters {
	/* existing */ agentTypes: AgentType[];
}
export type FilterChipKey /* existing */ = 'agentTypes';
export interface ScoreRangeFilter {
	metricId: AnalyticsMetricId | null;
	min: number | null;
	max: number | null;
}
export interface FinderQuery {
	metricId: AnalyticsMetricId; /* rest unchanged */
}

export interface TeamDispute {
	id: string;
	callId: string;
	agentId: string;
	agentName: string;
	supervisorId: string;
	team: string;
	campaignId: string;
	evaluationType: DisputeEvaluationType;
	status: DisputeStatus;
	createdAt: string;
	resolvedAt: string | null;
	scoreDelta: number;
}
export interface DisputeSummary {
	total: number;
	open: number;
	accepted: number;
	partiallyAccepted: number;
	rejected: number;
	acceptanceRate: number | null;
	avgResolutionDays: number | null;
	ratePer100Calls: number | null;
	byType: { type: DisputeEvaluationType; count: number; share: number }[];
}
export interface DisputeSeriesPoint {
	period: string;
	filed: number;
	resolved: number;
}
export interface DisputesByAgentRow {
	agentId: string;
	agentName: string;
	team: string;
	calls: number;
	filed: number;
	open: number;
	accepted: number;
	rejected: number;
	acceptanceRate: number | null;
}

export type SentimentBand =
	| 'very-negative'
	| 'negative'
	| 'neutral'
	| 'positive'
	| 'very-positive';
export interface DistributionRow {
	key: string;
	count: number;
	share: number;
}
export interface HeatmapData {
	rows: { key: string; label: string }[];
	cols: string[];
	cells: (number | null)[][];
}
export interface HumanVsAiMetricRow {
	id: AnalyticsMetricId;
	human: number | null;
	ai: number | null;
	index: { human: number; ai: number };
}
export interface HumanVsAiSummary {
	humanCalls: number;
	aiCalls: number;
	aiShare: number | null;
	aiAgents: number;
	metrics: HumanVsAiMetricRow[];
	byAgent: {
		agentId: string;
		agentName: string;
		team: string;
		calls: number;
		qa: number | null;
		compliance: number | null;
		sentiment: number | null;
		effective: number | null;
	}[];
}
export interface OverviewException {
	area: AnalyticsMetricArea;
	metricId: AnalyticsMetricId;
	segmentKey: string;
	segmentLabel: string;
	dimension: GroupByDimension;
	value: number;
	previous: number | null;
	target: number | null;
	reason: 'BELOW_TARGET' | 'WORSENED';
}
```

Delete `KPIStrip`-only types (`TeamKpis` stays; it feeds Overview tiles).

**`src/models/qa/reportBuilder.ts:73`**: `metrics: SegmentMetricId[]` (import from `~/modules/qa/analytics/types`).

**`src/modules/qa/analytics/constants.ts`**

- `DEFAULT_VIEW = 'overview'`; `TEAM_ANALYTICS_VIEWS` in the tab order above.
- `GROUP_BY_OPTIONS`: add `{ value: 'agentType', managerOnly: false }` after `agent`; `DRILL_NEXT.agentType = 'agent'`.
- `QUICK_RANGES: Exclude<QuickRange,'custom'>[] = ['7d','30d','90d','12m']`, `QUICK_RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 }` (move here from `FilterDrawer.tsx`), `HISTORY_DAYS = 365`.
- `VIEW_METRICS` gains `operational: ['OPS_CALLS_HANDLED','OPS_EFFECTIVE_CONTACT_RATE','OPS_AHT_SECONDS','OPS_FCR_RATE','OPS_TRANSFER_RATE','OPS_HOLD_SECONDS','OPS_WRAP_UP_SECONDS','OPS_AFTER_HOURS_SHARE']`, `disputes: ['DISPUTE_COUNT','DISPUTE_RATE']`; `sentiment` gains `'AGENT_NEGATIVE_EMOTION_CALL_SHARE'`, `'SENTIMENT_RECOVERY_RATE'`; `business` gets `'BI_CONVERSION_RATE'` first. `PRIMARY_METRIC.operational = 'OPS_CALLS_HANDLED'`, `.disputes = 'DISPUTE_RATE'`, `.business = 'BI_CONVERSION_RATE'`.
- Replace `SEGMENT_COLORS` with `SERIES_VARS = ['var(--series-1)', …, 'var(--series-6)']`, `OTHER_SERIES_VAR = 'var(--series-other)'`, `MAX_LINE_SERIES = 4`, keep `MAX_SEGMENT_SERIES = 8`. (`PlatformBurnoutCard` and `TeamPerformanceTrendCard` import `SEGMENT_COLORS`: keep a `SEGMENT_COLORS` export equal to the 6 Mantine keys plus `gray.5` so they compile; they are outside this plan.)
- `DEFAULT_FILTERS.agentTypes = []`.
- `SENTIMENT_BANDS: { key: SentimentBand; max: number }[] = [['very-negative',1.8],['negative',2.6],['neutral',3.4],['positive',4.2],['very-positive',5.01]]`; `QA_SCORE_BANDS = [{ key:'lt60', min:0, max:59 }, {key:'60to69',…}, {key:'70to79'}, {key:'80to89'}, {key:'90plus', min:90, max:100}]`; `COMPLIANCE_ITEMS = [['security','dataProtection'],['security','disclosureCompliance'],['regulatory','cobranzaRegulada'],['regulatory','transparenciaConsentimiento'],['legal','amenazasTradicionales'],['legal','rrss'],['legal','superintendenciaBancos'],['legal','noLlamarList']]`; `DISPUTE_TYPES: DisputeEvaluationType[]`, `DISPUTE_STATUSES: DisputeStatus[]`; `HUMAN_VS_AI_METRICS: AnalyticsMetricId[] = ['QA_OVERALL_SCORE','COMPLIANCE_OVERALL_SCORE','CUSTOMER_SENTIMENT_SCORE','OPS_EFFECTIVE_CONTACT_RATE','OPS_FCR_RATE','BI_CONVERSION_RATE','OPS_AHT_SECONDS']`.

### Task 2 — Generator refactor and 365 days (`src/modules/qa/analytics/mockData.ts`)

Goal: the existing 180 days stay byte-identical (same seeds, same RNG draw order), then an older 185-day pass is added in front, and AI agents get their own pass.

```ts
import type { Persona } from '~/modules/qa/team/mockData'; // replaces `type Persona = (typeof PERSONAS)[number]`
import type { AgentType } from '~/models/qa/agents';

const RECENT_DAYS = 180;
const OLDER_DAYS = 185;
export const HISTORY_DAYS = RECENT_DAYS + OLDER_DAYS; // 365

/** What differs per agent type when a call is generated. Humans keep today's numbers. */
interface CallShape {
	agentType: AgentType;
	worksSunday: boolean;
	callsPerDay: (weekday: number, rand: () => number) => number;
	hourFor: (shift: Shift, rand: () => number) => number;
	handleTime: (rand: () => number, burnout: BurnoutRiskLevel) => number;
	holdTime: (rand: () => number) => number;
	wrapUp: (rand: () => number) => number;
	transferRate: number;
	/** P(first-contact resolution | EFFECTIVE), scaled by base.qa. */
	fcrRate: number;
}
const HUMAN_SHAPE: CallShape = {
	agentType: 'HUMAN',
	worksSunday: false,
	callsPerDay: (wd, rand) =>
		wd === 6 ? (rand() < 0.5 ? 0 : 1) : 1 + Math.floor(rand() * 3),
	hourFor,
	handleTime: (rand, burnout) =>
		Math.round(
			240 + rand() * 480 + (burnout === BurnoutRiskLevel.HIGH ? 180 : 0)
		),
	holdTime: (rand) => (rand() < 0.6 ? 0 : Math.round(15 + rand() * 105)),
	wrapUp: (rand) => Math.round(30 + rand() * 120),
	transferRate: 0.08,
	fcrRate: 0.72,
};
const AI_SHAPE: CallShape = {
	agentType: 'AI_BOT',
	worksSunday: true,
	callsPerDay: (_wd, rand) => 3 + Math.floor(rand() * 3),
	hourFor: (_shift, rand) => 8 + Math.floor(rand() * 12),
	handleTime: (rand) => Math.round((240 + rand() * 480) * 0.6),
	holdTime: () => 0,
	wrapUp: (rand) => Math.round(rand() * 5),
	transferRate: 0.16,
	fcrRate: 0.55,
};

interface GenerateOptions {
	seed: number;
	idPrefix: string;
	personas: Persona[];
	/** Roster the personas resolve against. */
	roster: RosterAgent[];
	shape: CallShape;
	days: number;
	/** 0 = window ends on TODAY; RECENT_DAYS = it ends the day before the recent window. */
	endOffsetDays: number;
	extraCallsPerDay: number;
}
```

Inside `generateCalls`: `const agent = roster.find(...)`; the day loop keeps `for (let dayIndex = RECENT_DAYS - days; dayIndex < RECENT_DAYS; dayIndex++)` with `isoDay = addDays(TODAY, dayIndex - (RECENT_DAYS - 1) - endOffsetDays)`; add `if (isoDay < agent.hireDate) continue;` right after; `if (weekday === 0 && !shape.worksSunday) continue;`; `callsToday = shape.callsPerDay(weekday, rand) + extraCallsPerDay`; `hour = shape.hourFor(agent.shift, rand)`; `handleTimeSeconds: shape.handleTime(rand, burnout)` stays where it is. **After** `contactOutcome` (so earlier draws are unchanged) add: `const holdTimeSeconds = shape.holdTime(rand); const wrapUpSeconds = shape.wrapUp(rand); const transferred = rand() < shape.transferRate; const firstContactResolved = contactOutcome === 'EFFECTIVE' && rand() < shape.fcrRate * (0.7 + 0.3 * base.qa);` and push `agentType: shape.agentType, holdTimeSeconds, wrapUpSeconds, transferred, firstContactResolved`. For `AI_SHAPE` skip `burnoutPenalty` (bots are LOW anyway) and clamp `agentSentiment` to `[3.6, 4.0]`.

Builds:

```ts
const buildTeamCalls = () => [
	...generateCalls({
		seed: 11,
		idPrefix: 'TCALL',
		personas: PERSONAS,
		roster: TEAM_AGENTS,
		shape: HUMAN_SHAPE,
		days: RECENT_DAYS,
		endOffsetDays: 0,
		extraCallsPerDay: 0,
	}),
	...generateCalls({
		seed: 17,
		idPrefix: 'TOCALL',
		personas: PERSONAS,
		roster: TEAM_AGENTS,
		shape: HUMAN_SHAPE,
		days: OLDER_DAYS,
		endOffsetDays: RECENT_DAYS,
		extraCallsPerDay: 0,
	}),
];
// rough patches unchanged (seed 29, roster TEAM_AGENTS, shape HUMAN_SHAPE, endOffsetDays 0)
export const TEAM_CALLS = buildAllCalls(); // humans only, 365 days, date-sorted; incidents below unchanged
```

`generateCalls` loops `RECENT_DAYS - days … RECENT_DAYS`; for `days = OLDER_DAYS = 185 > 180` the start index is negative, which is fine because `isoDay` is computed from the index (verify the loop uses `dayIndex` only through `isoDay`, `progress` and the inactive-agent guard; the `progress` term uses `Math.max(0, …)` so older days sit at the starting level).

Keep both AGT-004 incidents after `TEAM_CALLS` (they slice the most recent calls). Update `ConversationsPage.tsx:77` to `import { HISTORY_DAYS }` and `PeriodScopeStep.tsx` `PRESET_DAYS` with `'12m': 365`.

**Weekly buckets:** replace the weekly branch of `periodKeyOf` with a UTC ISO week:

```ts
export function isoWeekKey(iso: string): string {
	const d = new Date(iso);
	const u = new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
	);
	const day = u.getUTCDay() || 7;
	u.setUTCDate(u.getUTCDate() + 4 - day);
	const week = Math.ceil(
		((u.getTime() - Date.UTC(u.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7
	);
	return `${u.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
```

Keep the `YYYY-Www` shape (`operationManagerMetrics.periodLabel` matches `-W\d{2}$`). Update the comment that says it mirrors the dashboard bucketing.

### Task 3 — AI roster and calls (`mockData.ts`, `helpers.ts`, context)

```ts
export const AI_PERSONAS: Persona[] = [
	{
		id: 'AIB-001',
		name: 'Aria (AI)',
		supervisorId: 'SUP-001',
		campaignIds: ['camp-001'],
		hireDate: '2025-11-03',
		trackedSince: '2025-11-03',
		shift: 'morning',
		base: { qa: 0.86, sentiment: 0.66, compliance: 0.96, business: 0.44 },
		slope: 0,
		burnout: BurnoutRiskLevel.LOW,
		skills: ['Voice bot'],
	},
	{
		id: 'AIB-002',
		name: 'Nova (AI)',
		supervisorId: 'SUP-001',
		campaignIds: ['camp-004'],
		hireDate: '2025-11-03',
		trackedSince: '2025-11-03',
		shift: 'afternoon',
		base: { qa: 0.84, sentiment: 0.63, compliance: 0.95, business: 0.47 },
		slope: 0,
		burnout: BurnoutRiskLevel.LOW,
		skills: ['Voice bot'],
	},
	{
		id: 'AIB-003',
		name: 'Echo (AI)',
		supervisorId: 'SUP-002',
		campaignIds: ['camp-002'],
		hireDate: '2026-02-16',
		trackedSince: '2026-02-16',
		shift: 'night',
		base: { qa: 0.88, sentiment: 0.68, compliance: 0.97, business: 0.42 },
		slope: 0,
		burnout: BurnoutRiskLevel.LOW,
		skills: ['Voice bot'],
	},
	{
		id: 'AIB-004',
		name: 'Iris (AI)',
		supervisorId: 'SUP-002',
		campaignIds: ['camp-001', 'camp-003'],
		hireDate: '2026-02-16',
		trackedSince: '2026-02-16',
		shift: 'morning',
		base: { qa: 0.83, sentiment: 0.62, compliance: 0.94, business: 0.46 },
		slope: 0,
		burnout: BurnoutRiskLevel.LOW,
		skills: ['Voice bot'],
	},
	{
		id: 'AIB-005',
		name: 'Sol (AI)',
		supervisorId: 'SUP-003',
		campaignIds: ['camp-003'],
		hireDate: '2026-05-04',
		trackedSince: '2026-05-04',
		shift: 'afternoon',
		base: { qa: 0.87, sentiment: 0.67, compliance: 0.96, business: 0.43 },
		slope: 0,
		burnout: BurnoutRiskLevel.LOW,
		skills: ['Voice bot'],
	},
	{
		id: 'AIB-006',
		name: 'Luna (AI)',
		supervisorId: 'SUP-003',
		campaignIds: ['camp-004', 'camp-002'],
		hireDate: '2026-05-04',
		trackedSince: '2026-05-04',
		shift: 'night',
		base: { qa: 0.85, sentiment: 0.64, compliance: 0.95, business: 0.45 },
		slope: 0,
		burnout: BurnoutRiskLevel.LOW,
		skills: ['Voice bot'],
	},
];
export const AI_AGENTS: RosterAgent[] = AI_PERSONAS.map((p) => {
	const sup = TEAM_SUPERVISORS.find((s) => s.id === p.supervisorId)!;
	return {
		id: p.id,
		name: p.name,
		email: `${p.id.toLowerCase()}@newtech.ai`,
		supervisorId: sup.id,
		supervisorName: sup.name,
		team: sup.team,
		campaignIds: p.campaignIds,
		status: 'active',
		shift: p.shift ?? 'morning',
		hireDate: p.hireDate,
		trackedSince: p.trackedSince,
		skills: p.skills,
		avatarColor: 'gray',
	};
});
export const AI_TEAM_CALLS = generateCalls({
	seed: 71,
	idPrefix: 'AICALL',
	personas: AI_PERSONAS,
	roster: AI_AGENTS,
	shape: AI_SHAPE,
	days: HISTORY_DAYS,
	endOffsetDays: 0,
	extraCallsPerDay: 0,
});
export const ANALYTICS_CALLS: TeamCallMetric[] = [
	...TEAM_CALLS,
	...AI_TEAM_CALLS,
].sort((a, b) => a.date.localeCompare(b.date));
export const AI_AGENT_IDS: ReadonlySet<string> = new Set(
	AI_AGENTS.map((a) => a.id)
);
export const isAiAgentId = (id: string) => AI_AGENT_IDS.has(id);
```

(`days: HISTORY_DAYS` with `endOffsetDays: 0` walks the whole year; the `hireDate` guard cuts each bot's history at its deployment date.)

`helpers.ts`: `scopeAiAgents(role)`, `scopeAnalyticsAgents(role) = [...scopeAgents(role), ...scopeAiAgents(role)]`. `TeamAnalyticsContext.tsx` switches to `ANALYTICS_CALLS` and `scopeAnalyticsAgents`; everything else keeps `TEAM_CALLS` / `scopeAgents` (humans). `FilterDrawer` agent options come from `scopedAgents` and therefore list bots; label them `${name}` (the name already ends in "(AI)").

**UI guard:** anything that opens an agent profile, coaching, LMS or cohort from an analytics row (Finder actions, Burnout actions, Business by-agent, Disputes by-agent, Overview exceptions) checks `isAiAgentId(id)` and hides the action for bots.

### Task 4 — Metric layer and filters (`helpers.ts`, `constants.ts`, `FilterBar.tsx`, `FilterDrawer.tsx`)

```ts
export const ANALYTICS_METRIC_META: Record<
	AnalyticsOnlyMetricId,
	AnalyticsMetricMeta
> = {
	OPS_CALLS_HANDLED: {
		unit: 'COUNT',
		higherIsBetter: true,
		area: 'OPERATIONAL',
	},
	OPS_EFFECTIVE_CONTACT_RATE: {
		unit: 'PERCENT',
		higherIsBetter: true,
		area: 'OPERATIONAL',
	},
	OPS_AHT_SECONDS: {
		unit: 'SECONDS',
		higherIsBetter: false,
		area: 'OPERATIONAL',
	},
	OPS_HOLD_SECONDS: {
		unit: 'SECONDS',
		higherIsBetter: false,
		area: 'OPERATIONAL',
	},
	OPS_WRAP_UP_SECONDS: {
		unit: 'SECONDS',
		higherIsBetter: false,
		area: 'OPERATIONAL',
	},
	OPS_TRANSFER_RATE: {
		unit: 'PERCENT',
		higherIsBetter: false,
		area: 'OPERATIONAL',
	},
	OPS_FCR_RATE: { unit: 'PERCENT', higherIsBetter: true, area: 'OPERATIONAL' },
	OPS_AFTER_HOURS_SHARE: {
		unit: 'PERCENT',
		higherIsBetter: false,
		area: 'OPERATIONAL',
	},
	AGENT_NEGATIVE_EMOTION_CALL_SHARE: {
		unit: 'PERCENT',
		higherIsBetter: false,
		area: 'SENTIMENT_EMOTION',
	},
	AGENT_POSITIVE_EMOTION_CALL_SHARE: {
		unit: 'PERCENT',
		higherIsBetter: true,
		area: 'SENTIMENT_EMOTION',
	},
	SENTIMENT_RECOVERY_RATE: {
		unit: 'PERCENT',
		higherIsBetter: true,
		area: 'SENTIMENT_EMOTION',
	},
	BI_CONVERSION_RATE: {
		unit: 'PERCENT',
		higherIsBetter: true,
		area: 'BUSINESS_INSIGHTS',
	},
	DISPUTE_COUNT: { unit: 'COUNT', higherIsBetter: false, area: 'DISPUTES' },
	DISPUTE_RATE: { unit: 'PERCENT', higherIsBetter: false, area: 'DISPUTES' },
};
export const isAnalyticsOnlyMetric = (
	id: AnalyticsMetricId
): id is AnalyticsOnlyMetricId => id in ANALYTICS_METRIC_META;
export const metricMeta = (id: AnalyticsMetricId): AnalyticsMetricMeta =>
	isAnalyticsOnlyMetric(id) ? ANALYTICS_METRIC_META[id] : METRIC_BY_ID[id];
```

- `SHARE_METRIC_IDS` adds every PERCENT id above except none (all the new PERCENT ids are 1/0 shares: `OPS_EFFECTIVE_CONTACT_RATE`, `OPS_TRANSFER_RATE`, `OPS_FCR_RATE`, `OPS_AFTER_HOURS_SHARE`, `AGENT_*_EMOTION_CALL_SHARE`, `SENTIMENT_RECOVERY_RATE`, `BI_CONVERSION_RATE`, `DISPUTE_RATE`).
- `metricOf(call, id: AnalyticsMetricId)` new cases: `OPS_CALLS_HANDLED → 1`; `OPS_EFFECTIVE_CONTACT_RATE → toBool(call.contactOutcome === 'EFFECTIVE')`; `OPS_AHT_SECONDS → call.handleTimeSeconds`; `OPS_HOLD_SECONDS → call.holdTimeSeconds`; `OPS_WRAP_UP_SECONDS → call.wrapUpSeconds`; `OPS_TRANSFER_RATE → toBool(call.transferred)`; `OPS_FCR_RATE → call.contactOutcome === 'EFFECTIVE' ? toBool(call.firstContactResolved) : null`; `OPS_AFTER_HOURS_SHARE → toBool(call.afterHours)`; `AGENT_NEGATIVE_EMOTION_CALL_SHARE → toBool(isNegativeCallEmotion(call.agentEmotion))`; `AGENT_POSITIVE_… → toBool(isPositiveCallEmotion(call.agentEmotion))`; `SENTIMENT_RECOVERY_RATE → toBool(call.sentimentRecovered)`; `BI_CONVERSION_RATE → call.offeredProduct === null ? null : toBool(call.converted)`; `DISPUTE_COUNT` / `DISPUTE_RATE → toBool(DISPUTE_BY_CALL_ID.has(call.id))`.
- `aggregateMetric`: use `metricMeta(id).unit`; `SECONDS → Math.round(mean)`.
- `formatMetric(id: AnalyticsMetricId, value)`: analytics-only ids format locally (`SECONDS → formatSeconds`, `PERCENT → Math.round + '%'`, `COUNT → Math.round`), others go to `formatMetricValue`. Replace the two `formatMetricValue` calls in `describeFinderQuery` with `formatMetric`. `SegmentationTable` and `FinderView` read `metricMeta(id).higherIsBetter` instead of `METRIC_BY_ID`.
- Widen `TriggerMetricId → AnalyticsMetricId` in `sparklineFor`, `buildSegments`, `buildSegmentSeries`, `alignedComparisonSeries`, `runFinderQuery`.
- `filterCalls`: add `!has(f.agentTypes, c.agentType)`; `ARRAY_KEYS` + `'agentTypes'`; `narrowFilters` `case 'agentType': return { ...f, agentTypes: [key as AgentType] }`; `segmentKeyOf` `case 'agentType': return { key: call.agentType, label: call.agentType }`.
- `sliceByDay(sorted: TeamCallMetric[], from, to)`: binary search on `date` for `${from}T00:00:00Z` / `${to}T23:59:59Z`; `TeamAnalyticsContext` applies it before `filterCalls` for both periods (the arrays are date-sorted).
- `autoGranularity(from, to): Granularity` → days ≤ 31 `daily`, ≤ 120 `weekly`, else `monthly`. `FilterDrawer.setQuickRange` sets `granularity: autoGranularity(...)` as well (the Select stays editable). Custom ranges: when `from`/`to` change and the user has not touched the Select since opening, re-derive.
- **12m and compare:** `previousPeriod` for 365 days falls before the history, so `canCompare(filters) = daysBetween(from,to) + 1 <= 182`; when false the compare switch is disabled with a tooltip (`filters.compareUnavailable`) and deltas / previous series are hidden.
- **Compare switch:** `FilterBar` gets a Mantine `Switch` labelled `filters.compare` bound to `filters.compareWithPrevious` through `setFilters` (does not clear the drill). Views read `compareWithPrevious && canCompare` from the context (`compare: boolean`).
- `FilterBar.VALUE_LABEL_NAMESPACE.agentTypes = 'filters.agentTypeLabels'`; `chipLabels.agentTypes = t('filters.agentTypes')`. `FilterDrawer` Scope section: `MultiSelect` `filters.agentTypes` with HUMAN / AI_BOT.
- Preset fix: `SavedViewsMenu.tsx:86` uses the returned preset to `navigate` with `?view=<preset.view>`.
- Series helpers (new):
  - `bucketSeries(calls, metricId, granularity): { period: string; value: number | null }[]`
  - `distribution(calls, keyOf: (c) => string | null, keys: string[]): DistributionRow[]` (count and share of non-null)
  - `sentimentBandOf(score): SentimentBand`; `sentimentBands(calls, side: 'customer'|'agent'): DistributionRow[]`; `emotionShares(calls): { emotion: CallEmotion; customer: number; agent: number }[]` sorted by customer share desc.
  - `heatmap(calls, metricId, includeSunday: boolean): HeatmapData` (rows = weekdays Mon→Sat (+Sun), cols = `TIME_SLOTS`; `null` when no calls).
  - `qaScoreBands(calls): DistributionRow[]`; `errorMixSeries(calls, granularity): { period; ecn; enc; ecc; ecuf }[]`.
  - `complianceItemShares(calls, target): { area; item; share }[]` (share of calls where the item < target, 8 rows, sorted desc).
  - `burnoutSummary(candidates): { high; medium; low; byTeam: { team; atRisk }[] }`.
  - `overviewExceptions(calls, previousCalls, dimension: 'agent' | 'team', thresholds): OverviewException[]` — for each area primary metric (`QA_OVERALL_SCORE` vs `qa.lowScoreIncident`, `COMPLIANCE_OVERALL_SCORE` vs `compliance.areaTargetPerCall`, `CUSTOMER_SENTIMENT_SCORE` vs `sentiment.lowSentimentIncident`, `OPS_EFFECTIVE_CONTACT_RATE` worsened only, `BI_CONVERSION_RATE` worsened only, `DISPUTE_RATE` worsened only): segments with ≥ `minCalls` calls that are below target (`BELOW_TARGET`) or worse than the previous period by more than 5% relative (`WORSENED`); worst first; max 8.

### Task 5 — Disputes dataset (`mockData.ts`, `helpers.ts`)

```ts
const DISPUTE_TYPE_WEIGHTS = [
	['qa', 45],
	['compliance', 20],
	['sentiment-emotion', 25],
	['business-insights', 10],
];
const DISPUTE_STATUS_WEIGHTS = [
	['accepted', 35],
	['partially-accepted', 20],
	['rejected', 25],
	['open', 20],
];
function buildDisputes(calls: TeamCallMetric[]): TeamDispute[] {
	const rand = seeded(97);
	const out: TeamDispute[] = [];
	let seq = 0;
	for (const call of calls) {
		if (call.agentType !== 'HUMAN') continue;
		const weak =
			call.qaScore < 70 ||
			call.autoFail ||
			call.complianceByArea.regulatory.score < 75 ||
			call.customerSentiment < 2.6;
		if (rand() >= (weak ? 0.12 : 0.015)) continue;
		const createdAt =
			addDays(dayOf(call.date), 1 + Math.floor(rand() * 3)) + 'T12:00:00Z';
		if (createdAt > NOW_ISO) continue;
		let status = pickWeighted(DISPUTE_STATUS_WEIGHTS, rand);
		const ageDays = daysBetween(dayOf(createdAt), TODAY);
		if (status !== 'open' && ageDays < 2) status = 'open';
		const resolvedAt =
			status === 'open'
				? null
				: addDays(dayOf(createdAt), 1 + Math.floor(rand() * 9)) + 'T15:00:00Z';
		seq += 1;
		out.push({
			id: `TDSP-${String(seq).padStart(4, '0')}`,
			callId: call.id,
			agentId: call.agentId,
			agentName: call.agentName,
			supervisorId: call.supervisorId,
			team: call.team,
			campaignId: call.campaignId,
			evaluationType: pickWeighted(DISPUTE_TYPE_WEIGHTS, rand),
			status,
			createdAt,
			resolvedAt: resolvedAt && resolvedAt <= NOW_ISO ? resolvedAt : null,
			scoreDelta:
				status === 'accepted'
					? 4 + Math.round(rand() * 8)
					: status === 'partially-accepted'
						? 1 + Math.round(rand() * 4)
						: 0,
		});
	}
	return out;
}
export const TEAM_DISPUTES = buildDisputes(TEAM_CALLS);
export const DISPUTE_BY_CALL_ID: ReadonlyMap<string, TeamDispute> = new Map(
	TEAM_DISPUTES.map((d) => [d.callId, d])
);
```

(A dispute whose `resolvedAt` would be in the future stays `open`: set `status = 'open'` in that case.) Expected volume ≈ 3–4% of human calls (~450).

`helpers.ts`: `disputesOf(calls)` = disputes whose `callId` is in the filtered set; `aggregateDisputes(calls): DisputeSummary` (`acceptanceRate = (accepted + partially) / resolved`, `avgResolutionDays` over resolved, `ratePer100Calls = total / calls × 100`, `byType` over `DISPUTE_TYPES`); `disputeSeries(calls, granularity): DisputeSeriesPoint[]` (filed by `createdAt`, resolved by `resolvedAt`, bucketed with `periodKeyOf`); `disputesByAgent(calls): DisputesByAgentRow[]`.

### Task 6 — Role plumbing and page frame

- `helpers.ts`: `export type AnalyticsRole = TeamRole | 'operation-manager'; export const analyticsRoleFromPath = (p: string): AnalyticsRole => p.startsWith('/qa/operation-manager') ? 'operation-manager' : p.startsWith('/qa/qa-manager') ? 'qa-manager' : 'supervisor'; export const scopeRoleOf = (r: AnalyticsRole): TeamRole => r === 'operation-manager' ? 'qa-manager' : r;`
- `TeamAnalyticsContext` exposes `analyticsRole` (for copy) and `role` (scope), plus `compare: boolean` (see Task 4), `disputes: TeamDispute[]`, `previousDisputes`.
- `routes.tsx`: add `{ path: 'operation-manager/analytics', id: 'qa.operation-manager.analytics', element: <I18nNamespaceLoader><Suspense fallback={<SuspenseFallback />}><TeamAnalyticsPage /></Suspense></I18nNamespaceLoader> }` next to the inbox routes (reuse the lazy import used by the other two analytics routes). `qaNamespaces.ts`: `'qa.operation-manager.analytics'` with the same namespaces as `'qa.qa-manager.analytics'`. `roleNavigation.tsx`: `operationmanager-analytics` → `/qa/operation-manager/analytics`.
- `TeamAnalyticsPage.tsx`: role copy from `analyticsRole`; remove `KPIStrip` (delete `KPIStrip.tsx` and `.kpiStrip`); `filtersApply = currentView !== 'burnout'`; switch renders the ten views. `ViewSelector`: wrap `Tabs.List` in a horizontally scrollable container (`.viewSelector { overflow-x: auto }`, `Tabs.List` with `flexWrap: nowrap` via `classNames`), no other change.
- Burnout "Manage rules" keeps `/qa/${role}/triggers` with `role` = scope role.

### Task 7 — Chart kit (`TeamAnalyticsPage/charts/`)

Files: `charts.module.css`, `seriesColors.ts`, `ChartCard.tsx`, `MetricTile.tsx`, `MetricTileRow.tsx`, `TrendChart.tsx`, `SmallMultiples.tsx`, `TrendSection.tsx`, `BreakdownBars.tsx`, `ShareBar.tsx`, `Heatmap.tsx`, `StackedMix.tsx`, `index.ts`.

**CSS variables** on `.pageContainer` in `TeamAnalyticsPage.module.css`:

```css
.pageContainer {
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
	--status-high: var(--mantine-color-danger-6);
	--status-medium: var(--mantine-color-amber-6);
	--status-low: var(--mantine-color-gray-5);
}
```

`seriesColors.ts` exports the var strings (`SERIES_CURRENT`, `SERIES_PREVIOUS`, `SERIES_OTHER`, `SERIES[0..5]`, `HEAT[0..4]`, `DIVERGING[0..4]`, `STATUS`) and `seriesColorAt(i)` (slot i, "Other" → `SERIES_OTHER`).

**Components** (props; all take `t` from `qa.teamAnalytics` internally):

- `ChartCard { title; description?; controls?: ReactNode; footer?: ReactNode; empty?: boolean; children }` → `SectionCard padding='md'` with `headerActions={controls}`; when `empty` renders `Text c='dimmed' ta='center' py='xl'` `charts.empty`. Children render only after `useChartReady()`.
- `MetricTile { label; value: string; metricId?: AnalyticsMetricId; current: number|null; previous: number|null; higherIsBetter?: boolean; neutral?: boolean; sparkline?: number[]; compare: boolean; onClick?: () => void; hint?: string }` → `StatCard variant='compact'` with `subtitle` = delta line (`comparison()` → `▲/▼ ±abs unit · vs previous`, `c='dimmed'`, `c='danger.7'` when `isImprovement === false && !neutral`; "—" when `!compare`) and `chart` = Mantine `Sparkline h={28} color={SERIES_CURRENT} fillOpacity={0.08} strokeWidth={1.5}`; `onClick` wraps the card in `UnstyledButton` (Overview tiles link to tabs).
- `MetricTileRow { tiles: MetricTileProps[] }` → `SimpleGrid cols={{ base: 2, md: 3, lg: tiles.length >= 6 ? 6 : tiles.length }} spacing='sm'`.
- `TrendChart { data: ComparisonSeriesPoint[] | SegmentSeriesPoint[]; series: { name: string; label: string; color: string; dashed?: boolean }[]; metricId: AnalyticsMetricId; granularity; target?: number | null; h?: number }` → `LineChart` (`dataKey='period'`, `curveType='monotone'`, `strokeWidth={2}`, `withDots={data.length <= 31}`, `gridAxis='y'`, `tickLine='none'`, `withLegend={series.length > 1}`, `legendProps={{ verticalAlign: 'top' }}`, `valueFormatter={(v) => formatMetric(metricId, v)}`, `yAxisProps={{ domain: unit === 'PERCENT' ? [0, 100] : unit === 'SCORE_5' ? [1, 5] : ['auto','auto'], width: 44 }}`, `xAxisProps={{ tickFormatter: periodLabel(granularity) }}`, `referenceLines={target != null ? [{ y: target, label: t('charts.target'), color: 'gray.5' }] : []}`, dashed series via `strokeDasharray: '4 4'`). `periodLabel`: daily `DD MMM`, weekly `W##`, monthly `MMM yy` (dayjs).
- `SmallMultiples { items: { key; label; data: ComparisonSeriesPoint[]; last: string }[]; metricId; granularity }` → `SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}` of `Paper withBorder p='sm'`: label + last value + `TrendChart h={120}` single neutral series, no legend, `withXAxis={false}`.
- `TrendSection { metricIds: SegmentMetricId[]; primary: SegmentMetricId; target?: (id) => number | null }` — the reusable "trend + metric select" block: metric `Select`, reads `groupBy`; `groupBy === 'none'` → `alignedComparisonSeries` → `TrendChart` with current (+ previous when `compare`); else `buildSegments` → keys; `keys.length <= MAX_LINE_SERIES` → `buildSegmentSeries` → multi-line `TrendChart` with `seriesColorAt(i)`; else → `SmallMultiples`. Footer: `charts.callsInPeriod {{count}}`.
- `BreakdownBars { rows: { key; label; value: number; secondary?: number }[]; valueLabel; secondaryLabel?; unit: 'PERCENT'|'COUNT'; h? }` → `BarChart orientation='vertical' dataKey='label' series=[{ name:'value', color: SERIES[0] }, secondary && { name:'secondary', color: SERIES_OTHER }] withBarValueLabel barProps={{ radius: 4 }} gridAxis='x' tickLine='none'`, height `rows.length * 32 + 40`.
- `ShareBar { segments: { key; label; value: number; color: string }[]; total?: number }` → CSS flex bar (`.shareBar` height 14px, `gap: 2px`, segment `flex: value`, `border-radius 4px` on ends) with a `Tooltip` per segment (`label · value · share%`) and a legend row underneath (`swatch label value (share%)`).
- `Heatmap { data: HeatmapData; metricId; rowLabel: (key) => string }` → CSS grid (`grid-template-columns: 56px repeat(cols, 1fr)`), cells `.heatCell` with background `--heat-N` by quantile of the non-null values (5 steps), value text inside when ≥ 1 digit fits, `Tooltip` with `row · col · value`, `null` cells `--mantine-color-default-hover` with "—".
- `StackedMix { data: { period: string; [k: string]: number | string }[]; keys: { name; label; color }[]; granularity; percent?: boolean }` → `BarChart type={percent ? 'percent' : 'stacked'} dataKey='period' withLegend barProps={{ radius: 2 }}`, x labels via `periodLabel`.

### Task 8 — Views

Shared: generalise `SegmentationView` to `{ metricIds: SegmentMetricId[]; primary: SegmentMetricId; title?: string }` (keep file; `viewType` callers become the new props); `SegmentationTable` trend icon colour → `gray` when neutral/improving, `danger` when worsening. Every tab below ends with `<SegmentationView metricIds={VIEW_METRICS[view]} primary={PRIMARY_METRIC[view]} />` unless stated.

**Overview** (`Overview/OverviewView.tsx`): tiles (8, `lg: 4` two rows): Calls (neutral), Effective contact, QA score (target `qa.lowScoreIncident`), Compliance, Customer sentiment, Conversion rate, Open disputes (`aggregateDisputes(calls).open`, delta vs previous period's open, neutral), Agents at risk (`burnoutSummary` high+medium, no delta, hint `overviewView.burnoutHint`); each tile `onClick` → `navigate(?view=<tab>)`. Then two cards side by side (`SimpleGrid cols={{ base: 1, lg: 2 }}`): **Calls volume** `TrendChart` (OPS_CALLS_HANDLED current vs previous, area-style via `AreaChart` is allowed for the single series) and **Needs attention** (`ChartCard` with a BaseTable of `overviewExceptions(calls, previousCalls, role === 'supervisor' ? 'agent' : 'team', thresholds)`: Area badge (gray), Segment, Value, Change, Why (`BELOW_TARGET` → `overviewView.belowTarget {{target}}`, `WORSENED` → `overviewView.worsened`), row click → `navigate(?view=<area tab>)` + `drillInto` for the segment; no segmentation table on Overview.

**Operational** (`Operational/OperationalView.tsx`): tiles Calls, Effective contact rate, AHT, FCR (hint `operational.fcrHint` "of effective contacts"), Transfer rate, After-hours share. `TrendSection` (operational metrics, default calls). Breakdown row (`lg: 2`): **Volume by weekday and time** `Heatmap(heatmap(calls, 'OPS_CALLS_HANDLED', includeSunday = calls.some(c => c.weekday === 0)))`; **Contact outcome** `ShareBar` effective (`SERIES_CURRENT`) vs non-effective (`SERIES_OTHER`) + **Direction** `ShareBar` inbound/outbound (`SERIES[0]`, `SERIES[1]`) stacked in one card. Segmentation table.

**QA** (`Quality/QaView.tsx`): tiles QA score (target), Auto-fails, ECN, ENC, ECC, ECUF (counts, `higherIsBetter=false`). `TrendSection` (qa metrics, target for `QA_OVERALL_SCORE`). Breakdown row: **Error mix** `StackedMix` (`errorMixSeries`, keys enc/ecn/ecc/ecuf → `SERIES[0..3]`, percent) and **Score distribution** `BreakdownBars(qaScoreBands)` (COUNT, single hue). Segmentation table.

**Compliance** (`Compliance/ComplianceView.tsx`): tiles Overall (target `compliance.areaTargetPerCall`), Security, Regulatory, Legal, Violations. `TrendSection` (compliance metrics). Breakdown row: **By area** `SmallMultiples` of the three area scores (always 3 cards, each `bucketSeries` current + previous) and **Items below target** `BreakdownBars(complianceItemShares(calls, target))` (PERCENT, labels `compliance.items.<item>`). Segmentation table.

**Business Insights** (`Business/BusinessView.tsx`, rewrite on top of `aggregateBusiness`): tiles Offered, Converted, Conversion rate (BI_CONVERSION_RATE), Early objection, Unhandled objection, Competitor + price. **Conversion trend** `TrendChart` from `summary.conversionTrend` (rate; previous period from `aggregateBusiness(previousCalls…)` when `compare`). Breakdown row: **Why offers do not convert** `BreakdownBars(summary.reasons)` (PERCENT share) and **Products** BaseTable (product, offered, converted, rate) + competitors as gray badges under it. **Signals by agent** BaseTable (`summary.byAgent`, `enablePagination pageSize={25}`, columns agent (no profile link for bots), team, calls, early, unhandled, competitor, mis-targeted, conversion). Segmentation table (business metrics).

**Sentiment & Emotion** (`Sentiment/SentimentView.tsx`): tiles Customer sentiment (target `sentiment.lowSentimentIncident`), Agent sentiment, Negative-emotion calls (customer), Negative-emotion calls (agent), Recovery rate. **Trend**: `TrendSection` restricted to score metrics, plus when `groupBy === 'none'` a two-series variant: customer (`SERIES_CURRENT`) and agent (`SERIES[0]`) sentiment, previous period hidden (`sentiment.trendHint`). Breakdown row: **Sentiment type** two `ShareBar`s (Customer, Agent) over `SENTIMENT_BANDS` with `DIVERGING` colours; **Emotion type** `BreakdownBars(emotionShares)` with value = customer share, secondary = agent share (labels `filters.emotionLabels.*`). Third row: **Negative emotion by weekday and time** `Heatmap(heatmap(calls, 'NEGATIVE_EMOTION_CALL_SHARE'))`. Segmentation table.

**Human vs AI** (`HumanVsAi/HumanVsAiView.tsx`): `humanVsAi(calls, previousCalls)` → tiles Calls handled by AI (share, neutral), Human calls, AI calls, AI agents (count). **Comparison** `BarChart orientation='vertical' dataKey='metric'` over `HUMAN_VS_AI_METRICS` with series human (`SERIES_CURRENT`) and ai (`SERIES[0]`) on a 0–100 index (PERCENT as is, SCORE_5 × 20, SECONDS indexed `100 × min / value` so lower AHT scores higher; `humanVsAi.indexHint`), `withLegend`, plus a **Raw values** BaseTable (metric, human, AI, gap) beside it. **AI share of volume** `TrendChart` (`aiShareSeries`, PERCENT). **AI agents** BaseTable (`byAgent` filtered to bots: agent, team, calls, QA, compliance, sentiment, effective contact). Segmentation table with `metricIds = HUMAN_VS_AI_METRICS` and `GroupBySelector` defaulting to `agentType` (call `setGroupBy('agentType')` on mount when `groupBy === 'none'`).

**Burnout Risk** (`Burnout/BurnoutView.tsx`, extend): tiles High, Medium, Low (counts; status colours as the tile `color`), Rules active; row: **Risk distribution** `ShareBar` (high/medium/low with `STATUS`) and, for managers, **At-risk agents by team** `BreakdownBars(burnoutSummary.byTeam)`. Existing table and notice stay; bots never appear (candidates come from `scopeAgents`).

**Disputes** (`Disputes/DisputesView.tsx`): tiles Filed, Open, Acceptance rate, Avg resolution days (SECONDS-like: format `n d`), Dispute rate (per 100 calls, `DISPUTE_RATE`). **Filed vs resolved** `TrendChart` (`disputeSeries`, two series filed `SERIES_CURRENT` / resolved `SERIES[0]`, COUNT). Breakdown row: **By evaluation type** `BreakdownBars(byType)` (labels `disputes.types.*`), **Outcome** `ShareBar` accepted / partially accepted / rejected / open with `--heat-5/4/3/2` (one-hue ordered). **By agent** BaseTable (`disputesByAgent`, paginated 25). Segmentation table (`DISPUTE_COUNT`, `DISPUTE_RATE`).

**Agent Finder**: unchanged except `SCORE_METRICS` now includes the operational and dispute ids and bot rows hide profile/coaching/LMS actions.

### Task 9 — Copy (`src/locales/{en,es}/qa.teamAnalytics.json`, additions only unless stated)

```json
"page": {
	"eyebrow": { "operation-manager": "Operation Manager · All teams" },
	"description": { "operation-manager": "Compare every team's operations, quality, compliance, sentiment, business results, AI agents and disputes over time." },
	"views": { "overview": "Overview", "operational": "Operational", "humanVsAi": "Human vs AI", "disputes": "Disputes" }
},
"filters": {
	"quickRange": { "12m": "12 months" },
	"compareUnavailable": "No earlier data to compare with for periods over 6 months",
	"agentTypes": "Agent type",
	"agentTypeLabels": { "HUMAN": "Human", "AI_BOT": "AI agent" },
	"groupByOptions": { "agentType": "Agent type" }
},
"areas": { "OPERATIONAL": "Operational", "DISPUTES": "Disputes" },
"metrics": {
	"OPS_CALLS_HANDLED": "Calls handled", "OPS_EFFECTIVE_CONTACT_RATE": "Effective contact rate", "OPS_AHT_SECONDS": "Average handle time",
	"OPS_HOLD_SECONDS": "Average hold time", "OPS_WRAP_UP_SECONDS": "Average wrap-up time", "OPS_TRANSFER_RATE": "Transfer rate",
	"OPS_FCR_RATE": "First-contact resolution", "OPS_AFTER_HOURS_SHARE": "After-hours calls",
	"AGENT_NEGATIVE_EMOTION_CALL_SHARE": "Negative-emotion calls (agent)", "AGENT_POSITIVE_EMOTION_CALL_SHARE": "Positive-emotion calls (agent)",
	"SENTIMENT_RECOVERY_RATE": "Recovery rate", "BI_CONVERSION_RATE": "Conversion rate",
	"DISPUTE_COUNT": "Disputes", "DISPUTE_RATE": "Dispute rate"
},
"charts": {
	"empty": "No data for the current filters", "target": "Target", "current": "Current period", "previous": "Previous period",
	"callsInPeriod_one": "{{count}} call in the period", "callsInPeriod_other": "{{count}} calls in the period",
	"trend": "Trend", "metric": "Metric", "smallMultiplesHint": "More than 4 segments: one chart per segment",
	"vsPrevious": "vs previous period", "noCompare": "Comparison off", "share": "Share", "calls": "Calls", "indexed": "Index (0–100)"
},
"overviewView": {
	"calls": "Calls", "effective": "Effective contact", "openDisputes": "Open disputes", "atRisk": "Agents at risk",
	"burnoutHint": "Burnout ignores the period filter", "volumeTitle": "Calls volume", "attentionTitle": "Needs attention",
	"attentionDescription": "Segments below target or worse than the previous period, worst first.",
	"columns": { "area": "Area", "segment": "Segment", "value": "Value", "change": "Change", "why": "Why" },
	"belowTarget": "Below target ({{target}})", "worsened": "Worse than previous period", "none": "Nothing needs attention with the current filters."
},
"operational": {
	"heatmapTitle": "Volume by weekday and time", "heatmapDescription": "Calls per weekday and time slot.",
	"outcomeTitle": "Contact outcome", "effective": "Effective", "nonEffective": "Non-effective", "direction": "Direction", "inbound": "Inbound", "outbound": "Outbound",
	"fcrHint": "Of effective contacts"
},
"qaView": {
	"errorMixTitle": "Error mix", "errorMixDescription": "Share of each error type per period.",
	"distributionTitle": "QA score distribution", "bands": { "lt60": "< 60", "60to69": "60–69", "70to79": "70–79", "80to89": "80–89", "90plus": "90+" },
	"errors": { "ecn": "Critical business", "enc": "Non-critical", "ecc": "Critical compliance", "ecuf": "Critical end-user" }
},
"complianceView": {
	"byAreaTitle": "By area", "itemsTitle": "Items below target", "itemsDescription": "Share of calls where the item scored under the target.",
	"items": { "dataProtection": "Data protection", "disclosureCompliance": "Disclosure compliance", "cobranzaRegulada": "Regulated collections", "transparenciaConsentimiento": "Transparency & consent", "amenazasTradicionales": "Threats", "rrss": "Social media", "superintendenciaBancos": "Banking superintendence", "noLlamarList": "Do-not-call list" }
},
"sentimentView": {
	"customer": "Customer", "agent": "Agent", "typeTitle": "Sentiment type", "typeDescription": "Share of calls per sentiment band, customer and agent side.",
	"bands": { "very-negative": "Very negative", "negative": "Negative", "neutral": "Neutral", "positive": "Positive", "very-positive": "Very positive" },
	"emotionTitle": "Emotion type", "emotionDescription": "Share of calls by predominant emotion.",
	"heatmapTitle": "Negative emotion by weekday and time", "trendHint": "Customer vs agent sentiment; the previous period is hidden in this view.",
	"negativeCustomer": "Negative-emotion calls (customer)", "negativeAgent": "Negative-emotion calls (agent)"
},
"businessView": { "offered": "Offers presented", "converted": "Converted", "reasonsTitle": "Why offers do not convert", "productsTitle": "Products", "competitorsTitle": "Competitors mentioned", "byAgentTitle": "Signals by agent", "conversionTrendTitle": "Conversion trend" },
"humanVsAi": {
	"aiShare": "Calls handled by AI", "humanCalls": "Human calls", "aiCalls": "AI calls", "aiAgents": "AI agents",
	"comparisonTitle": "Human vs AI", "comparisonDescription": "Each metric indexed to 0–100 so they share one axis; raw values on the right.",
	"indexHint": "Lower handle time scores higher.", "human": "Human", "ai": "AI", "gap": "Gap", "rawTitle": "Raw values",
	"shareTrendTitle": "AI share of volume", "agentsTitle": "AI agents",
	"columns": { "agent": "Agent", "team": "Team", "calls": "Calls", "qa": "QA", "compliance": "Compliance", "sentiment": "Customer sentiment", "effective": "Effective contact" }
},
"burnout": {
	"listDescription": { "operation-manager": "Agents at risk across every team, from the active burnout rules." },
	"tiles": { "high": "High risk", "medium": "Medium risk", "low": "Low risk", "rules": "Active rules" },
	"distributionTitle": "Risk distribution", "byTeamTitle": "At-risk agents by team"
},
"disputes": {
	"filed": "Filed", "open": "Open", "acceptanceRate": "Acceptance rate", "resolutionDays": "Avg. resolution", "days": "{{count}} d", "rate": "Dispute rate",
	"ratePer100": "per 100 calls", "trendTitle": "Filed vs resolved", "resolved": "Resolved",
	"byTypeTitle": "By evaluation type", "types": { "qa": "QA", "compliance": "Compliance", "sentiment-emotion": "Sentiment & Emotion", "business-insights": "Business Insights" },
	"outcomeTitle": "Outcome", "statuses": { "accepted": "Accepted", "partially-accepted": "Partially accepted", "rejected": "Rejected", "open": "Open" },
	"byAgentTitle": "By agent", "columns": { "agent": "Agent", "team": "Team", "calls": "Calls", "filed": "Filed", "open": "Open", "accepted": "Accepted", "rejected": "Rejected", "acceptanceRate": "Acceptance" }
}
```

Spanish (same keys): "Gerente de Operaciones · Todos los equipos"; "Compara operación, calidad, cumplimiento, sentimiento, resultados de negocio, agentes de IA y disputas de todos los equipos en el tiempo."; views "Resumen", "Operación", "Humanos vs IA", "Disputas"; "12 meses"; "No hay datos anteriores para comparar en períodos de más de 6 meses"; "Tipo de agente"; "Humano" / "Agente de IA"; areas "Operación" / "Disputas"; metrics "Llamadas atendidas", "Tasa de contacto efectivo", "Tiempo medio de atención", "Tiempo medio en espera", "Tiempo medio de cierre", "Tasa de transferencia", "Resolución en el primer contacto", "Llamadas fuera de horario", "Llamadas con emoción negativa (agente)", "Llamadas con emoción positiva (agente)", "Tasa de recuperación", "Tasa de conversión", "Disputas", "Tasa de disputas"; charts "Sin datos para los filtros actuales", "Objetivo", "Período actual", "Período anterior", "{{count}} llamada en el período" / "{{count}} llamadas en el período", "Tendencia", "Métrica", "Más de 4 segmentos: un gráfico por segmento", "vs período anterior", "Comparación desactivada", "Proporción", "Llamadas", "Índice (0–100)"; overviewView "Llamadas", "Contacto efectivo", "Disputas abiertas", "Agentes en riesgo", "El riesgo de burnout ignora el filtro de período", "Volumen de llamadas", "Requiere atención", "Segmentos por debajo del objetivo o peor que el período anterior, los peores primero.", columns "Área" / "Segmento" / "Valor" / "Cambio" / "Motivo", "Por debajo del objetivo ({{target}})", "Peor que el período anterior", "Nada requiere atención con los filtros actuales."; operational "Volumen por día y franja", "Llamadas por día de la semana y franja horaria.", "Resultado del contacto", "Efectivo", "No efectivo", "Dirección", "Entrante", "Saliente", "Sobre contactos efectivos"; qaView "Mezcla de errores", "Proporción de cada tipo de error por período.", "Distribución del puntaje QA", bands same, errors "Crítico de negocio" / "No crítico" / "Crítico de cumplimiento" / "Crítico de usuario final"; complianceView "Por área", "Ítems por debajo del objetivo", "Proporción de llamadas donde el ítem quedó bajo el objetivo.", items "Protección de datos" / "Cumplimiento de divulgación" / "Cobranza regulada" / "Transparencia y consentimiento" / "Amenazas" / "Redes sociales" / "Superintendencia de Bancos" / "Lista no llamar"; sentimentView "Cliente", "Agente", "Tipo de sentimiento", "Proporción de llamadas por banda de sentimiento, lado cliente y lado agente.", bands "Muy negativo" / "Negativo" / "Neutral" / "Positivo" / "Muy positivo", "Tipo de emoción", "Proporción de llamadas por emoción predominante.", "Emoción negativa por día y franja", "Sentimiento del cliente vs del agente; el período anterior se oculta en esta vista.", "Llamadas con emoción negativa (cliente)", "Llamadas con emoción negativa (agente)"; businessView "Ofertas presentadas", "Convertidas", "Por qué no convierten las ofertas", "Productos", "Competidores mencionados", "Señales por agente", "Tendencia de conversión"; humanVsAi "Llamadas atendidas por IA", "Llamadas humanas", "Llamadas de IA", "Agentes de IA", "Humanos vs IA", "Cada métrica indexada a 0–100 para compartir un eje; valores reales a la derecha.", "Menor tiempo de atención puntúa más alto.", "Humano", "IA", "Brecha", "Valores reales", "Proporción de volumen de la IA", "Agentes de IA", columns "Agente" / "Equipo" / "Llamadas" / "QA" / "Cumplimiento" / "Sentimiento del cliente" / "Contacto efectivo"; burnout "Agentes en riesgo en todos los equipos, según las reglas de burnout activas.", tiles "Riesgo alto" / "Riesgo medio" / "Riesgo bajo" / "Reglas activas", "Distribución del riesgo", "Agentes en riesgo por equipo"; disputes "Presentadas", "Abiertas", "Tasa de aceptación", "Resolución media", "{{count}} d", "Tasa de disputas", "por cada 100 llamadas", "Presentadas vs resueltas", "Resueltas", "Por tipo de evaluación", types "QA" / "Cumplimiento" / "Sentimiento y Emoción" / "Business Insights", "Resultado", statuses "Aceptada" / "Parcialmente aceptada" / "Rechazada" / "Abierta", "Por agente", columns "Agente" / "Equipo" / "Llamadas" / "Presentadas" / "Abiertas" / "Aceptadas" / "Rechazadas" / "Aceptación".

Also: `sidebar.operationmanager.analytics` already exists in `common.json`; no change.

### Task 10 — Checks

- `npm run typecheck` clean.
- Key script over `src/modules/qa/analytics/**` for `t('…')` keys (plurals `_one/_other`) in en and es.
- Greps: `style=` in `src/modules/qa/analytics/**` → none; `#[0-9a-f]{6}` in `src/modules/qa/analytics/**/*.tsx` → none (colours are CSS vars); `SEGMENT_COLORS` only in the two dashboard cards; `KPIStrip` → none; `METRIC_BY_ID[` inside `analytics/TeamAnalyticsPage/**` → none (use `metricMeta`).
- Palette: `node <dataviz skill>/scripts/validate_palette.js "#228be6,#12b886,#be4bdb,#fd7e14,#4c6ef5,#e64980" --mode light` and `"#339af0,#0ca678,#be4bdb,#e8590c,#5c7cfa,#e64980" --mode dark` → all pass (light WARN on contrast is accepted: legends + table twins).
- Data sanity (node script against the TS is impractical): read-check that `TEAM_CALLS` recent 180 days are built with the same seed/order (first id `TCALL-00001` unchanged), `AI_TEAM_CALLS` ids start with `AICALL`, `TEAM_DISPUTES` ids `TDSP-0001…`; `ANALYTICS_CALLS` length is roughly 18–22k.
- Prettier on touched files; `git status --short` lists only intended files.

---

## Behaviour summary (demo script)

| Where                          | Action                          | Result                                                                                                                                                                                               |
| ------------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supervisor sidebar → Analytics | Open                            | Eyebrow "Supervisor · Team 1"; Overview tab: 8 tiles with deltas and sparklines, Calls volume chart (current vs previous), Needs attention list for Team 1 agents and its two AI agents (Aria, Nova) |
| Filters                        | Period 12m                      | Buckets switch to monthly; Compare switch disabled with tooltip; tiles show "—" for deltas; trends show the current series only                                                                      |
| Operational                    | Open                            | Tiles incl. AHT `m:ss`, FCR "of effective contacts"; heatmap Mon–Sun × 5 slots (Sunday only has AI calls); contact outcome and direction share bars; segmentation table with operational metrics     |
| QA                             | Group by agent, metric QA score | ≤ 4 agents → 4 coloured lines in slot order; 5+ → small multiples; error mix 100% bars; score histogram                                                                                              |
| Compliance                     | Open                            | Three small multiples (security/regulatory/legal) and the 8 items-below-target bars                                                                                                                  |
| Sentiment & Emotion            | Open                            | Customer vs agent sentiment lines; diverging sentiment bands for both sides; emotion bars with agent share in gray; negative-emotion heatmap                                                         |
| Human vs AI                    | Open                            | Tiles (AI handles ~25% of Team 1 volume), indexed comparison bars + raw table, AI share trend, AI agents table; group-by preset to Agent type                                                        |
| Human vs AI                    | Filter Agent type = AI agent    | Every tab now shows AI-only numbers; Burnout stays human (notice)                                                                                                                                    |
| Disputes                       | Open                            | Filed/open/acceptance/resolution tiles, filed vs resolved lines, type bars, outcome share bar, by-agent table                                                                                        |
| Saved views                    | Apply "Night shift sentiment"   | Filters apply **and** the tab switches to Sentiment & Emotion                                                                                                                                        |
| QA Manager / Operation Manager | Open their Analytics            | Eyebrow per role; Team and Supervisor group-by available; Needs attention lists teams, drill-down team → supervisor → agent                                                                          |
| Dark mode                      | Toggle                          | Series switch to the dark slots, heatmap ramp inverts, tooltips and legends keep contrast                                                                                                            |

## Verification

No dev server and no tests: typecheck, key script, greps and the palette validator from Task 10. Visual check by the user on the three roles' Analytics routes in light and dark mode following the demo script; then confirm the QA Manager dashboard, coaching and rankings still show human-only numbers (they keep `TEAM_CALLS`).

## Out of scope

- Dashboard cards linking into Analytics; feeding `HumanVsAiCard` on the OM dashboard from `humanVsAi()` (easy follow-up).
- AI agents anywhere outside Analytics (Team configuration, Your Team, coaching, LMS, rankings).
- Joining the 15 seeded dispute cases of `disputesStore` to analytics calls (ids never match); the analytics disputes are a derived dataset.
- CSV/PNG export, URL-synced filters beyond `?view=`, virtualisation (all tables paginate at 25).
- Two-year history (so "12m vs previous 12m" stays unavailable by design).

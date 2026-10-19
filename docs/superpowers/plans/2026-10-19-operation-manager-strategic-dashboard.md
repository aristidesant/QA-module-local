# Operation Manager dashboard: strategic layout

## Context

The Operation Manager dashboard (`src/modules/qa/dashboard/pages/NewOperationManagerDashboard.tsx`, route `/qa/dashboards/operation-manager`) still carries the operational widgets copied from the QA Manager page: Critical Issues, a 4-week Sentiment Trend, Quick Insights, Best & Worst Calls and an Operations tab set (Rankings, Team Health, Clients, Critical Alerts) fed by local mocks. The Operation Manager is a strategic, management-level role and does not need that granularity.

The page keeps only the compact Performance Score section (done in the previous plan) and gains five strategic views: burnout risk, ESG score, campaigns performance, teams performance over time, and Human vs AI agent performance. Everything else goes.

Decisions made with the user (2026-10-19):

- **Burnout:** headline level (Low / Medium / High) with the agent distribution, plus a line chart with one line per team.
- **Human vs AI:** grouped bar chart, one bar pair per metric. No data marks AI agents today, so it is a static mock, labelled as illustrative.
- **Controls:** the period segmented control and the line-of-business dropdown move to the page header and drive every data-driven section (Performance Score, teams chart, burnout lines, campaigns table).
- **Campaigns:** a `BaseTable` computed from the call data (the 4 roster campaigns), following the period and line of business. No row click.
- **ESG:** one card for the client: overall score and the three pillars. Static mock (no ESG exists on call records).

Mode: mockup. Mantine v9 (`@mantine/charts` for charts), CSS modules, no inline styles, strings in `en` and `es`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-19-operation-manager-strategic-dashboard.md`.

---

## Verified facts (do not re-explore)

**Page today** (`NewOperationManagerDashboard.tsx`, 684 lines): imports L1-56; local mocks and helpers L58-419 (`OPERATION_MANAGER_INBOX_PATH`, `WINDOW_PHRASE`, `DEFAULT_OPERATION_MANAGER_INSIGHTS`, `TeamHealthKpi`/`TEAM_HEALTH_KPIS`, `RiskIndicatorRow`/`RISK_INDICATORS`, `ClientPortfolioRow`/`CLIENTS_PORTFOLIO`/`handleClientClick`/`clientScoreColor`/`clientColumns`, `CriticalAlertRow`/`CRITICAL_ALERTS`/`getSeverityColor`/`criticalAlertColumns`); component from L421 with `liveProgram`/`liveStandings` (rankings), `copy`, `period`/`days`/`lineOfBusiness`/`thresholds`/`metrics`/business insights state; header L461-466; Performance Score section L468-535 (keep verbatim except the `headerActions`); sections 3-5 from L537 to the end (remove).

**Call data.** `TEAM_CALLS: TeamCallMetric[]` (`src/modules/qa/analytics/mockData.ts`), 180 days ending on `TODAY` (`src/modules/qa/analytics/constants.ts`, also `addDays(isoDay, delta)`). Fields used here: `date`, `team` ('Team 1'..'Team 3'), `campaignId` ('camp-001'..'camp-004'), `campaignName`, `agentEmotion`, `qaScore`, `autoFail`, `complianceByArea`, `customerSentiment`, `offeredProduct`, `converted`. `teamCallsInWindow(role, days, lineOfBusiness?)` (`src/modules/qa/calls/agentMetrics.ts` L156) returns the calls in scope for the window; `'qa-manager'` scope = every agent. `aggregateDashboardMetrics(calls, thresholds?)` (L180) returns `AgentDashboardMetrics` (`calls`, `qa.total`, `autoFails`, `complianceCategories[{name,score,status}]`, `sentiment.customerAvg`, `sales?{offered,sold}`).

**Series helpers** (`src/modules/qa/analytics/helpers.ts`): `buildSegmentSeries(calls, 'team', metricId, from, to, granularity, segmentKeys)` (L592) → `SegmentSeriesPoint[]` = `{ period: 'YYYY-Www' | 'YYYY-MM-DD', [team]: number | null }`; `periodKeyOf(iso, granularity)` (L452); `aggregateMetric(calls, id)` (L397) with ids `'QA_OVERALL_SCORE'`, `'COMPLIANCE_OVERALL_SCORE'`, `'CUSTOMER_SENTIMENT_SCORE'`; `Granularity = 'per-call'|'daily'|'weekly'|'monthly'`, `GroupByDimension` includes `'team'` (`analytics/types.ts`). `isNegativeCallEmotion(emotion)` (L99) is **not exported** and reads the negative emotions from the settings store. `SEGMENT_COLORS` (`analytics/constants.ts` L145): `['blue.6','teal.6','grape.6', …]`.

**Teams.** `TEAM_SUPERVISORS` (`src/modules/qa/team/mockData.ts` L36): three entries whose `team` is 'Team 1' / 'Team 2' / 'Team 3'. `scopeAgents('qa-manager')` (`analytics/helpers.ts` L130) = all `TEAM_AGENTS`.

**Burnout.** Levels `BurnoutRiskLevel` enum `LOW|MEDIUM|HIGH` (`src/modules/qa/dashboard/types/burnoutRisk.ts`). Live levels come from trigger rules: `useTriggerRulesStore(selectTriggerRules)` (`src/stores/qa/triggerRulesStore.ts` L174) and `burnoutLevelsByAgent(rules)` (`analytics/helpers.ts` L668) → `Record<agentId, BurnoutRiskLevel>` for every agent. The supervisor page already does `const triggerRules = useTriggerRulesStore(selectTriggerRules)` + `useMemo(..., [triggerRules])`. Colour convention from `TeamBurnoutRiskCard.tsx`: `LOW → 'gray'`, `MEDIUM → 'amber'`, `HIGH → 'danger'`. No burnout history exists; the per-team line uses the share of calls with a negative agent emotion (the driver behind rule ALR-009), see Task 1.

**Charts.** `@mantine/charts` 9.2 is in `package.json`; it follows the Mantine colour scheme so no dark-mode CSS is needed. Multi-series line reference: `src/modules/qa/team/components/PerformanceTrendChart.tsx` (`<LineChart h={320} data dataKey='label' series={[{name,label,color}]} curveType='monotone' withDots yAxisProps={{domain}} strokeWidth={2} />`). Bar reference: `src/modules/qa/coaching/CoachingPage/tabs/ImpactTab.tsx` L575 (`<BarChart h={200} data dataKey='area' series={[{name,label,color}]} />`). `NEUTRAL_BAR_SERIES` (`src/modules/qa/team/helpers.ts` L65). AI agents are violet in `AGENT_TYPE_COLORS` (`src/modules/qa/constants/badgeColors.ts`).

**ESG.** Only exists per call: `ESG_PILLARS` (`src/views/Campaigns/constants.ts` L572) with `label`, `description`, `icon` (`IconLeaf`, `IconUsersGroup`, `IconBuildingBank`) per pillar key `environmental|social|governance`; `EsgPillarKey` in `src/views/Campaigns/types.ts`. Reuse the icons and labels, not the panel.

**Controls.** `PerformanceScoreControls` (`src/modules/qa/dashboard/components/PerformanceScoreControls.tsx`): props `period, onPeriodChange, lineOfBusiness?, onLineOfBusinessChange?`; its doc comment says it is rendered in the Performance Score header. `PERFORMANCE_SCORE_PERIODS`, `DEFAULT_PERFORMANCE_SCORE_PERIOD`, `performanceScoreDays(period)` in `../constants` (today 1, week 7, month 30, quarter 90, sixMonths 180).

**Primitives.** `SectionCard` (`title`, `description`, `headerActions`, `fullHeight`), `BaseTable` + `BaseTableColumnDef<T>` (`~/components/BaseTable/BaseTable`), `EmptyState`, `Dashboard.module.css` classes `metricCard`, `gridCard`, `scoreValue`. `copy = useDashboardCopy('operationManager')` gives `title`, `subtitle`, `cardSubtitle(measure)`.

**i18n.** `qa.dashboard.json` (en/es, LF) has `roleDashboard.filters.{period,lineOfBusiness,allLines}`, `burnout.level.{low,medium,high}`, `sections.*`. No `operationManager` block yet. `qaNamespaces.ts` L72: `'qa.dashboards.operation-manager': ['qa.dashboard', 'qa.rankings', 'qa.teamAnalytics']`.

Line endings: every file touched here is LF except `useDashboardCopy.ts` (not touched).

---

## Direction

```
Operation Manager Dashboard                         [Line of business ▾] [Today|Week|Month|Quarter|6M]
Client portfolio and team health overview

┌ Performance Score (unchanged, compact) ───────────────────────────────────────────────────────┐
│ Operational │ Quality Assurance │ Compliance │ Sentiment & Emotion │ Business Insights         │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
┌ Teams performance ───────────────── (md: 8/12) ┐ ┌ ESG score ─────────────── (md: 4/12) ┐
│ [QA score | Compliance | Customer sentiment]   │ │ 81  ESG score · Good                 │
│  ── Team 1  ── Team 2  ── Team 3  (line chart) │ │ 🍃 Environmental   74 ▓▓▓▓▓░░        │
│                                                │ │ 👥 Social          86 ▓▓▓▓▓▓░        │
│                                                │ │ 🏛 Governance      83 ▓▓▓▓▓▓░        │
└────────────────────────────────────────────────┘ └──────────────────────────────────────┘
┌ Burnout risk ────────────────────── (md: 6/12) ┐ ┌ Human vs AI agents ────── (md: 6/12) ┐
│ MEDIUM  · 7 of 21 agents at risk (2 high)      │ │ ▌▌ QA  ▌▌ Compliance ▌▌ Cust. sent.  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ low / medium / high       │ │ ▌▌ Effective contacts ▌▌ Conversion  │
│  ── Team 1 ── Team 2 ── Team 3 (negative-      │ │ ■ Human  ■ AI agent · illustrative   │
│     agent-emotion call share, line chart)      │ │                                      │
└────────────────────────────────────────────────┘ └──────────────────────────────────────┘
┌ Campaigns performance ────────────────────────────────────────────────────────────────────────┐
│ Campaign            Line of business   Calls  QA   Compliance  Cust. sent.  Auto-fails  Conv. │
│ Q3 Customer Service Services            412   84   91%         3.8          3           —     │
│ …                                                                                             │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

Everything in rows 2-4 reads the same `calls` array (window + line of business) except the burnout headline (live rule levels, "now"), the ESG card and the Human vs AI card (static mocks).

---

## Implementation plan

Execute in order; `npm run typecheck` after each task.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-19-operation-manager-strategic-dashboard.md`.

### Task 1 — Data helpers and mocks

**1a. Export the emotion helper.** In `src/modules/qa/analytics/helpers.ts` L99 change `const isNegativeCallEmotion` to `export const isNegativeCallEmotion`. Nothing else changes there.

**1b. New file `src/modules/qa/dashboard/operationManagerMetrics.ts`** (pure functions, no React):

```ts
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import {
	scopeAgents,
	buildSegmentSeries,
	periodKeyOf,
	isNegativeCallEmotion,
	burnoutLevelsByAgent,
} from '~/modules/qa/analytics/helpers';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import { aggregateDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import { BurnoutRiskLevel } from './types/burnoutRisk';

/** Team names in roster order, one chart line each. */
export const OPERATION_MANAGER_TEAMS = TEAM_SUPERVISORS.map((s) => s.team);

/** Short windows get a point per day, longer ones a point per ISO week. */
export const chartGranularity = (days: number): 'daily' | 'weekly' =>
	days <= 14 ? 'daily' : 'weekly';

export type TeamTrendMetric =
	| 'QA_OVERALL_SCORE'
	| 'COMPLIANCE_OVERALL_SCORE'
	| 'CUSTOMER_SENTIMENT_SCORE';

/** One point per period with a value per team; `label` is what the X axis shows. */
export interface TeamSeriesPoint {
	period: string;
	label: string;
	[team: string]: number | string | null;
}

export function buildTeamPerformanceSeries(
	calls,
	days,
	metric: TeamTrendMetric
): TeamSeriesPoint[];
// = buildSegmentSeries(calls, 'team', metric, addDays(TODAY, -(days - 1)), TODAY, chartGranularity(days), OPERATION_MANAGER_TEAMS)
//   .map(p => ({ ...p, label: periodLabel(p.period) }))

export function buildTeamBurnoutSeries(calls, days): TeamSeriesPoint[];
// Groups calls by periodKeyOf(call.date, granularity) and call.team; value = round1(100 * negative / total)
// where negative counts calls with isNegativeCallEmotion(call.agentEmotion). Teams with no calls in a period get null.
// Same period ordering and label as above.

export interface PlatformBurnoutSummary {
	level: BurnoutRiskLevel;
	counts: Record<BurnoutRiskLevel, number>;
	total: number;
	atRisk: number;
}

export function platformBurnoutSummary(rules): PlatformBurnoutSummary;
// levels = burnoutLevelsByAgent(rules); agents = scopeAgents('qa-manager'); count per level.
// atRisk = medium + high. Headline: HIGH when high / total >= 0.15 or atRisk / total >= 0.4;
// MEDIUM when atRisk / total >= 0.15; otherwise LOW. Document these cut-points in a comment.

export interface CampaignPerformanceRow {
	id;
	name;
	lineOfBusiness: string | null;
	calls;
	qaScore;
	compliance;
	customerSentiment;
	autoFails;
	conversionRate: number | null;
}

export function buildCampaignPerformanceRows(
	calls,
	thresholds
): CampaignPerformanceRow[];
// Group by campaignId (name from the first call), run aggregateDashboardMetrics(group, thresholds) per campaign:
// qaScore = qa.total; compliance = rounded mean of complianceCategories[].score (same maths as ComplianceCard);
// customerSentiment = sentiment.customerAvg; autoFails; conversionRate = sales && sales.offered > 0 ? round(100 * sold / offered) : null;
// lineOfBusiness = dashboardLineOfBusinessFor(campaignId) (`../lineOfBusiness`). Sort by calls desc.
```

`periodLabel(period)`: `'YYYY-Www'` → `'W30'`; `'YYYY-MM-DD'` → `'12 Sep'` (local helper, `toLocaleDateString('en', { day: 'numeric', month: 'short' })`). Before writing it, grep `src/modules/qa/analytics` for an existing period-label formatter (`periodLabel`, `formatPeriod`) and reuse it if one exists.

**1c. Mocks in `src/modules/qa/dashboard/mockData.ts`** (append at the end, typed):

```ts
export interface EsgPillarScore { key: EsgPillarKey; score: number }
export interface OperationManagerEsg { overall: number; status: 'good' | 'watch' | 'atRisk'; pillars: EsgPillarScore[] }
export const OPERATION_MANAGER_ESG: OperationManagerEsg = { overall: 81, status: 'good', pillars: [environmental 74, social 86, governance 83] };

export type HumanVsAiMetricKey = 'qa' | 'compliance' | 'customerSentiment' | 'effectiveContacts' | 'conversion';
export interface HumanVsAiPoint { metric: HumanVsAiMetricKey; human: number; ai: number; max: number }
/** Illustrative: nothing in the call data marks an AI agent yet. Scores are 0-100 except sentiment (1-5). */
export const HUMAN_VS_AI_PERFORMANCE: HumanVsAiPoint[] = [
  { metric: 'qa', human: 84, ai: 79, max: 100 }, { metric: 'compliance', human: 91, ai: 96, max: 100 },
  { metric: 'customerSentiment', human: 3.8, ai: 3.4, max: 5 }, { metric: 'effectiveContacts', human: 71, ai: 64, max: 100 },
  { metric: 'conversion', human: 34, ai: 27, max: 100 },
];
```

Import `EsgPillarKey` from `~/views/Campaigns/types`. The chart normalises every value to 0-100 (`value / max * 100`) so the five pairs share one axis; the tooltip shows the raw value.

### Task 2 — Components (`src/modules/qa/dashboard/components/`, each exported from `index.ts`)

All cards: `Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='none' h='100%'` like the Performance Score cards, title `Text fw={600} size='md'`, optional `subtitle` dimmed. Strings through `useTranslation('qa.dashboard')` under the new `operationManager` block (Task 3). Series colours by team index from `SEGMENT_COLORS`.

**2a. `TeamPerformanceTrendCard.tsx`** — props `{ data: TeamSeriesPoint[]; teams: string[]; metric: TeamTrendMetric; onMetricChange(metric); subtitle? }`. Header: title + a `SegmentedControl size='xs'` with the three metrics. Body: `<LineChart h={280} data dataKey='label' series={teams.map((team, i) => ({ name: team, label: team, color: SEGMENT_COLORS[i] }))} curveType='monotone' withDots withLegend strokeWidth={2} yAxisProps={{ domain }} />` with domain `[0, 100]` for QA/compliance and `[1, 5]` for sentiment. When `data.length < 2` render the chart area as a dimmed `Text` ("Pick a longer period to see the trend").

**2b. `PlatformBurnoutCard.tsx`** — props `{ summary: PlatformBurnoutSummary; data: TeamSeriesPoint[]; teams: string[]; subtitle? }`. Top: `Badge` with the level (`t('burnout.level.<level>')`, colour `gray|amber|danger` as in `TeamBurnoutRiskCard`) and `Text` "{atRisk} of {total} agents at risk · {high} high". Then a `Progress.Root size='sm'` with three `Progress.Section`s (low gray.4, medium amber, high danger) sized by the counts. Then `Divider`, a small dimmed caption for the chart ("Share of calls with a negative agent emotion, per team") and the same `LineChart` as 2a (`h={200}`, domain `[0, 100]`, unit `%`), with the same `< 2 points` fallback.

**2c. `EsgScoreCard.tsx`** — props `{ esg: OperationManagerEsg; subtitle? }`. Score row: `Text className={styles.scoreValue}` with `overall`, dimmed "ESG score", `Badge` for the status (good gray / watch amber / atRisk danger). Then one row per pillar: `ThemeIcon size='sm' variant='light' color='gray'` with `ESG_PILLARS[key].icon`, the pillar label, the score right-aligned, and a `Progress size='xs' color='gray'` underneath. Pillar labels come from the i18n block (not from `ESG_PILLARS.label`, which is English only).

**2d. `HumanVsAiCard.tsx`** — props `{ data: HumanVsAiPoint[]; subtitle? }`. Builds `chartData = data.map(p => ({ metric: t(label), human: normalise, ai: normalise, rawHuman, rawAi, max }))` and renders `<BarChart h={240} data dataKey='metric' series={[{ name: 'human', label: t(...), color: 'var(--mantine-color-text)' }, { name: 'ai', label: t(...), color: 'violet.6' }]} withLegend yAxisProps={{ domain: [0, 100] }} />`. Tooltip via `valueFormatter` is not enough for raw values, so pass `tooltipProps={{ content: ... }}` only if simple; otherwise show the raw values as a compact legend row under the chart (`Group` of "QA 84 vs 79", etc.). Choose the simpler one that keeps raw values visible. A dimmed `Text size='xs'` at the bottom: "Illustrative data: AI agents are not tracked in call records yet."

**2e. `CampaignPerformanceTable.tsx`** — props `{ rows: CampaignPerformanceRow[] }`. `BaseTable<CampaignPerformanceRow>` with columns: campaign (name, `fw={500}`), line of business (dimmed, `—` when null), calls, QA score (number + band `Badge` using `bandFor(score, thresholds.qa.scoreBands)` / `SCORE_BAND_TONE` exactly as `QualityAssuranceCard` does), compliance `%`, customer sentiment (`toFixed(1)`), auto-fails (danger-coloured text when `> 0`), conversion `%` or `—`. `getRowId={(r) => r.id}`, no `onRowClick`, `emptyMessage` from i18n. Column labels from i18n.

### Task 3 — Copy (`src/locales/{en,es}/qa.dashboard.json`)

Add a top-level `operationManager` block (keep the file's key order, append before the closing brace). Keys and English text; Spanish alongside:

| key                                                                                                                                      | en                                                                                                      | es                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `controls.hint`                                                                                                                          | Filters every section below                                                                             | Filtra todas las secciones                                                                                        |
| `teams.title`                                                                                                                            | Teams performance                                                                                       | Desempeño de los equipos                                                                                          |
| `teams.description`                                                                                                                      | How each team is trending {{window}}                                                                    | Tendencia de cada equipo {{window}}                                                                               |
| `teams.metric.qa` / `.compliance` / `.customerSentiment`                                                                                 | QA score / Compliance / Customer sentiment                                                              | Puntaje QA / Cumplimiento / Sentimiento del cliente                                                               |
| `teams.needLongerPeriod`                                                                                                                 | Pick a longer period to see the trend                                                                   | Elige un período más largo para ver la tendencia                                                                  |
| `burnout.title`                                                                                                                          | Burnout risk                                                                                            | Riesgo de burnout                                                                                                 |
| `burnout.description`                                                                                                                    | Current level from the trigger rules; the lines follow the selected period                              | Nivel actual según las reglas de alertas; las líneas siguen el período seleccionado                               |
| `burnout.atRisk`                                                                                                                         | {{atRisk}} of {{total}} agents at risk · {{high}} high                                                  | {{atRisk}} de {{total}} agentes en riesgo · {{high}} alto                                                         |
| `burnout.chartCaption`                                                                                                                   | Share of calls with a negative agent emotion, per team                                                  | Porcentaje de llamadas con emoción negativa del agente, por equipo                                                |
| `esg.title`                                                                                                                              | ESG score                                                                                               | Puntaje ESG                                                                                                       |
| `esg.description`                                                                                                                        | Environmental, social and governance practices on the client's calls                                    | Prácticas ambientales, sociales y de gobernanza en las llamadas del cliente                                       |
| `esg.score`                                                                                                                              | ESG score                                                                                               | Puntaje ESG                                                                                                       |
| `esg.status.good` / `.watch` / `.atRisk`                                                                                                 | Good / Watch / At risk                                                                                  | Bien / Atención / En riesgo                                                                                       |
| `esg.pillar.environmental` / `.social` / `.governance`                                                                                   | Environmental / Social / Governance                                                                     | Ambiental / Social / Gobernanza                                                                                   |
| `humanVsAi.title`                                                                                                                        | Human vs AI agents                                                                                      | Agentes humanos vs IA                                                                                             |
| `humanVsAi.description`                                                                                                                  | Same metrics, both kinds of agent                                                                       | Las mismas métricas para ambos tipos de agente                                                                    |
| `humanVsAi.human` / `.ai`                                                                                                                | Human / AI agent                                                                                        | Humano / Agente IA                                                                                                |
| `humanVsAi.metric.qa` / `.compliance` / `.customerSentiment` / `.effectiveContacts` / `.conversion`                                      | QA / Compliance / Cust. sentiment / Effective contacts / Conversion                                     | QA / Cumplimiento / Sentimiento cliente / Contactos efectivos / Conversión                                        |
| `humanVsAi.illustrative`                                                                                                                 | Illustrative data: AI agents are not tracked in call records yet                                        | Datos ilustrativos: las llamadas aún no registran agentes IA                                                      |
| `campaigns.title`                                                                                                                        | Campaigns performance                                                                                   | Desempeño de las campañas                                                                                         |
| `campaigns.description`                                                                                                                  | Every campaign with calls {{window}}                                                                    | Todas las campañas con llamadas {{window}}                                                                        |
| `campaigns.column.campaign` / `.lineOfBusiness` / `.calls` / `.qa` / `.compliance` / `.customerSentiment` / `.autoFails` / `.conversion` | Campaign / Line of business / Calls / QA score / Compliance / Cust. sentiment / Auto-fails / Conversion | Campaña / Línea de negocio / Llamadas / Puntaje QA / Cumplimiento / Sentimiento cliente / Auto-fails / Conversión |
| `campaigns.empty`                                                                                                                        | No calls in this period                                                                                 | No hay llamadas en este período                                                                                   |

The `{{window}}` value is `WINDOW_PHRASE[period]` from the page (English, like the Performance Score description today). Validate both files with `JSON.parse`.

### Task 4 — Page rewrite (`NewOperationManagerDashboard.tsx`)

**Remove** (and their imports): sections 3-5 (L537-end of the `Stack`), the local mocks/helpers L58-59 and L72-419 (`OPERATION_MANAGER_INBOX_PATH`, insights, team-health KPIs, risk indicators, clients portfolio, critical alerts, their column defs and colour helpers), the rankings state (`programs`, `liveProgram`, `liveStandings`), `useNavigate`. Imports that go: `Tabs, Group, Badge, Button` from Mantine (keep `Stack, Title, Text, SimpleGrid`, add `Grid`), `EmptyState`, `BaseTable`/`BaseTableColumnDef`, `DashboardMetricCard`, `ProfileBadge`, `SentimentTrendChart`, `CriticalIssuesTable`, `BestWorstCallsTable`, `QuickInsightsWidget`, `Insight`, `TEAM_CALLS`, `StandingsTable`, `rankingPath`, `computeStandings`/`sortPrograms`, `useRankingsStore`/`selectPrograms`, `OPERATION_MANAGER_SENTIMENT_TREND`/`OPERATION_MANAGER_CALLS`/`CRITICAL_ISSUES_OPERATION_MANAGER`, `CriticalIssue`. Keep `WINDOW_PHRASE`. `useTranslation('qa.dashboard')` only.

**Add** imports: `Grid` (Mantine), `teamCallsInWindow` (`~/modules/qa/calls/agentMetrics`), `useTriggerRulesStore, selectTriggerRules` (`~/stores/qa/triggerRulesStore`), the Task 1 helpers and types from `../operationManagerMetrics`, `OPERATION_MANAGER_ESG, HUMAN_VS_AI_PERFORMANCE` from `../mockData`, the five Task 2 components from `'../components'`.

**State** (after the existing `metrics`/business-insights memos):

```ts
const calls = useMemo(
	() => teamCallsInWindow('qa-manager', days, lineOfBusiness),
	[days, lineOfBusiness]
);
const [teamMetric, setTeamMetric] =
	useState<TeamTrendMetric>('QA_OVERALL_SCORE');
const teamSeries = useMemo(
	() => buildTeamPerformanceSeries(calls, days, teamMetric),
	[calls, days, teamMetric]
);
const burnoutSeries = useMemo(
	() => buildTeamBurnoutSeries(calls, days),
	[calls, days]
);
const triggerRules = useTriggerRulesStore(selectTriggerRules);
const burnoutSummary = useMemo(
	() => platformBurnoutSummary(triggerRules),
	[triggerRules]
);
const campaignRows = useMemo(
	() => buildCampaignPerformanceRows(calls, thresholds),
	[calls, thresholds]
);
```

**Header**: replace the `<div>` with `<Group justify='space-between' align='flex-start' wrap='wrap'>` holding the title/subtitle block and `<PerformanceScoreControls period onPeriodChange lineOfBusiness onLineOfBusinessChange />` (so `Group` stays imported). Remove `headerActions` from the Performance Score `SectionCard`; its description keeps the window phrase and the `· {lineOfBusiness}` suffix.

**Sections after Performance Score** (replace everything from the `{/* 3. Critical issues */}` comment to the end of the `Stack`):

```tsx
{
	/* 3. Teams trend and ESG */
}
<Grid gutter='lg'>
	<Grid.Col span={{ base: 12, md: 8 }}>
		<SectionCard
			title={t('operationManager.teams.title')}
			description={t('operationManager.teams.description', {
				window: WINDOW_PHRASE[period],
			})}
			fullHeight
		>
			<TeamPerformanceTrendCard
				data={teamSeries}
				teams={OPERATION_MANAGER_TEAMS}
				metric={teamMetric}
				onMetricChange={setTeamMetric}
			/>
		</SectionCard>
	</Grid.Col>
	<Grid.Col span={{ base: 12, md: 4 }}>
		<SectionCard
			title={t('operationManager.esg.title')}
			description={t('operationManager.esg.description')}
			fullHeight
		>
			<EsgScoreCard esg={OPERATION_MANAGER_ESG} />
		</SectionCard>
	</Grid.Col>
</Grid>;

{
	/* 4. Burnout and Human vs AI */
}
<Grid gutter='lg'>
	<Grid.Col span={{ base: 12, md: 6 }}>
		{' '}
		SectionCard burnout →{' '}
		<PlatformBurnoutCard
			summary
			data={burnoutSeries}
			teams={OPERATION_MANAGER_TEAMS}
		/>{' '}
	</Grid.Col>
	<Grid.Col span={{ base: 12, md: 6 }}>
		{' '}
		SectionCard humanVsAi →{' '}
		<HumanVsAiCard data={HUMAN_VS_AI_PERFORMANCE} />{' '}
	</Grid.Col>
</Grid>;

{
	/* 5. Campaigns performance */
}
<SectionCard
	title={t('operationManager.campaigns.title')}
	description={t('operationManager.campaigns.description', {
		window: WINDOW_PHRASE[period],
	})}
>
	<CampaignPerformanceTable rows={campaignRows} />
</SectionCard>;
```

Because the `SectionCard` already carries title and description, the Task 2 cards render **without** their own `Card` wrapper and title when used here; simplest: make the five components plain content blocks (a `Stack`) and let the page's `SectionCard` frame them. Apply that to Task 2: no `Card`, no title inside the components; `subtitle` prop dropped.

**`PerformanceScoreControls.tsx`**: update the doc comment to "Period (and Line of Business) controls. Rendered in the Performance Score header on team dashboards, and in the page header on the Operation Manager dashboard where they filter every section." No behaviour change.

**`qaNamespaces.ts` L72**: `'qa.dashboards.operation-manager': ['qa.dashboard']` once no `qa.rankings` / `qa.teamAnalytics` key is used by the page (grep `ns:` in the file).

### Task 5 — Checks

- `grep -n "OPERATION_MANAGER_INBOX_PATH\|CLIENTS_PORTFOLIO\|CRITICAL_ALERTS\|TEAM_HEALTH_KPIS\|RISK_INDICATORS\|liveProgram\|useNavigate\|Tabs\|qa.rankings" src/modules/qa/dashboard/pages/NewOperationManagerDashboard.tsx` → nothing.
- `grep -rn "isNegativeCallEmotion" src/modules/qa` → the export plus the new helper only.
- `JSON.parse` on both `qa.dashboard.json`; a script asserting every `operationManager.*` key in the table above exists in both locales (walk the keys used by the five components with `t('operationManager.…')`).
- `npx prettier --write` on: the page, the five components, `index.ts`, `operationManagerMetrics.ts`, `mockData.ts`, `analytics/helpers.ts`, `PerformanceScoreControls.tsx`, `qaNamespaces.ts`, both locale files.
- `npm run typecheck` clean.
- Mock constants `OPERATION_MANAGER_SENTIMENT_TREND`, `OPERATION_MANAGER_CALLS`, `CRITICAL_ISSUES_OPERATION_MANAGER`, `OPERATION_MANAGER_WEEKLY_METRICS` stay in `mockData.ts` (unused is fine for a mockup).

---

## Behaviour summary (demo script)

| Where                                      | Action                                    | Result                                                                                                                                                                                  |
| ------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OM dashboard                               | Open                                      | Header with controls on the right; Performance Score; Teams trend (QA, 3 lines) + ESG; Burnout (level badge, distribution bar, 3 lines) + Human vs AI bars; Campaigns table with 4 rows |
| Header                                     | Period → Quarter                          | Performance Score, teams chart, burnout lines and campaigns table all recompute over 90 days (weekly points); ESG, Human vs AI and the burnout headline do not change                   |
| Header                                     | Line of business → Collections            | Teams chart, burnout lines and the table narrow to that line (table shows the Collections campaign only)                                                                                |
| Header                                     | Period → Today                            | Charts show the "pick a longer period" note; the table shows today's calls                                                                                                              |
| Teams card                                 | Metric → Customer sentiment               | Y axis becomes 1-5; lines recompute                                                                                                                                                     |
| Burnout card                               | Change a burnout trigger rule in Triggers | Headline level and counts update (same store as the supervisor card)                                                                                                                    |
| Supervisor / QA Manager / Agent dashboards | Open                                      | Unchanged                                                                                                                                                                               |

## Verification

No dev server and no tests. `npm run typecheck` after each task, the JSON parse and key script, the greps in Task 5. Visual check by the user in their dev server at `/qa/dashboards/operation-manager`, light and dark, desktop and a narrow width (every `Grid.Col` collapses to full width under `md`).

## Out of scope

- Marking real agents as AI in the roster or call data (the Human vs AI card is a labelled mock).
- Aggregating ESG from call evaluations (static mock).
- A Conversations drill-down for the Operation Manager (no row clicks by decision).
- Removing the now-unused `OPERATION_MANAGER_*` and `CRITICAL_ISSUES_OPERATION_MANAGER` constants from `mockData.ts`.

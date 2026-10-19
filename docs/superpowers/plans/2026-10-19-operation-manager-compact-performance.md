# Operation Manager dashboard: compact Performance Score cards with period and line-of-business controls

## Context

The Operation Manager dashboard (`src/modules/qa/dashboard/pages/NewOperationManagerDashboard.tsx`) still shows the old Performance Score section: four cards (QA, Compliance, a single-score Sentiment card, Business Insights) fed by a fixed weekly mock (`OPERATION_MANAGER_WEEKLY_METRICS`), with no period or line-of-business controls, no trends and no Operational card. The Supervisor and QA Manager dashboards have since gained the Operational card, `PerformanceScoreControls` (period + line of business), real per-window metrics with trends, call counts on every row and the drill-down into Conversations.

The Operation Manager is a portfolio-level view, so it should get the same structure and controls but **simplified**: the cards keep their subcategory rows, but show no "N calls" counts, no clickable rows and no progress bars.

Decisions made with the user (2026-10-19):

- **Compact look only on the Operation Manager dashboard.** Supervisor and QA Manager keep their progress bars, counts and drill-down.
- **Sentiment card:** the agent-vs-customer split card, compact (no negative-call rows, no bars).
- **Data:** computed over the whole platform with the same helpers as the QA Manager (`buildTeamDashboardMetrics('qa-manager', …)`), so period and line of business change the numbers and trends appear. The fixed mock stops feeding these cards.

Mode: mockup. Mantine v9, CSS modules, no inline styles, strings in `en` and `es`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-19-operation-manager-compact-performance.md`.

---

## Verified facts (do not re-explore)

- **OM page** `NewOperationManagerDashboard.tsx`: imports L1-43 (`React, { useMemo }`, card components from `'../components'` incl. `SentimentEmotionCard`, mock imports L36-41 incl. `OPERATION_MANAGER_WEEKLY_METRICS`); page function from L399; the mock destructure L413-420 and `overallSentiment` L422-423 feed **only** the Performance Score cards (nothing else on the page reads `OPERATION_MANAGER_WEEKLY_METRICS`); header L429-434 is hard-coded English; Performance Score `SectionCard` L437-470 with `SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}`. Everything after L472 (Critical Issues, Sentiment Trend, Quick Insights, Best & Worst, Operations tabs) stays untouched. Route `qa.dashboards.operation-manager` already loads `qa.dashboard`.
- **Supervisor page** `NewSupervisorDashboard.tsx` is the template: `WINDOW_PHRASE` L48-54; state `period` (`DEFAULT_PERFORMANCE_SCORE_PERIOD`) + `days = performanceScoreDays(period)` + `lineOfBusiness` L61-66; `thresholds = useSettingsStore(selectThresholds)`; `metrics = useMemo(() => buildTeamDashboardMetrics('supervisor', days, lineOfBusiness, thresholds), [days, lineOfBusiness, thresholds])`; `{ insights, outcome, conversionTrend } = useMemo(() => buildTeamBusinessInsights('supervisor', days, lineOfBusiness), [days, lineOfBusiness])`; `SectionCard title='Performance Score' description={…WINDOW_PHRASE[period]…} headerActions={<PerformanceScoreControls period onPeriodChange lineOfBusiness onLineOfBusinessChange />}`; `SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }}`; cards L117-183.
- **Helpers** (`src/modules/qa/calls/agentMetrics.ts`): `buildTeamDashboardMetrics(role: TeamRole, days, lineOfBusiness?, thresholds?)` L341; `buildTeamBusinessInsights(role, days, lineOfBusiness?)` L463; `TeamRole = 'supervisor' | 'qa-manager'`; `'qa-manager'` scope = every agent (`scopeAgents`). `AgentDashboardMetrics` has `calls, effectiveContacts, nonEffectiveContacts, qa, autoFails, complianceCategories, sentiment{agentAvg, customerAvg, agentEmotion, customerEmotion, agentNegativeCount, customerNegativeCount}, trends?{effectiveContacts, qa, compliance, agentSentiment, customerSentiment}`.
- **Cards** (`src/modules/qa/dashboard/components/`):
  - `QualityAssuranceCard.tsx`: props L36-47; `Progress` L174-179 (always rendered); counts only when `issueCounts` given; clicks only when `onCategoryClick` given; auto-fails row L212-243 has no bar.
  - `ComplianceCard.tsx`: props L21-29; `Progress` L154-159 (always); counts/clicks conditional as above.
  - `SentimentEmotionSplitCard.tsx`: `SentimentSide` L27-36 (`negativeCount` required), props L38-44; `SideColumn` L57-104 with `Progress` L82-87 (always); `Divider` L189 + review rows L191-202 always render `t('drill.calls', { count })`.
  - `OperationalCard.tsx`: props L18-37 (incl. `onCallsClick`); effective row count L115-117 + `Progress` L120-125; non-effective count L140-142 + `Progress` L146-151; sales block L154-182 (not used by OM).
  - `PerformanceScoreControls.tsx`: `period`, `onPeriodChange`, `lineOfBusiness?`, `onLineOfBusinessChange?` (LOB select shown only when the handler is passed).
- **Copy hook** `src/modules/qa/dashboard/useDashboardCopy.ts` (CRLF file): `DashboardCopyRole = 'agent' | 'supervisor' | 'qaManager'`; keys `roleDashboard.title.<role>`, `roleDashboard.subtitle.<role>`, `roleDashboard.scope.<role>`, `roleDashboard.measure.*`, `roleDashboard.scoped`. `qa.dashboard.json` (LF) `roleDashboard.title` has `supervisor`, `qaManager`; `subtitle` and `scope` have `agent`, `supervisor`, `qaManager`.
- Line endings: all touched files are LF except `useDashboardCopy.ts` (CRLF) — edit it preserving CRLF.

---

## Direction

```
Operation Manager · Performance Score  (title/description from useDashboardCopy('operationManager'))
header: "Cross-client quality assurance, compliance, sentiment and business results <window> [· LOB]"   [Period ▾▾▾▾▾] [Line of business ▾]
┌ Operational ┐ ┌ Quality Assurance ┐ ┌ Compliance ┐ ┌ Sentiment & Emotion ┐ ┌ Business Insights ┐
│ 1 284 calls │ │ 86 avg · On target│ │ 91 % avg   │ │ Agent 3.9 · Customer│ │ 34% conversion     │
│ Effective 71%│ │ ECN 82%  Watch   │ │ Legal 78% ⚠│ │  3.6 · emotions     │ │ signals …          │
│ Non-eff. 29%│ │ Auto-fails 12    │ │ show all   │ │ (no review rows)    │ │                    │
│ (no bars, no│ │ (no bars, counts │ │ (no bars…) │ │ (no bars)           │ │ (unchanged)        │
│  counts)    │ │  or clicks)      │ │            │ │                     │ │                    │
```

One new boolean prop, `compact`, on the four cards; the page passes it and omits every count/click prop.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-19-operation-manager-compact-performance.md`.

### Task 1 — `compact` prop on the four cards

Add to each props interface, with the same doc comment:

```ts
	/** Portfolio view (Operation Manager): keeps the rows but drops progress bars, call counts and drill-down. */
	compact?: boolean;
```

**1a. `QualityAssuranceCard.tsx`** — destructure `compact = false`; wrap the `Progress` (L174-179) as `{!compact && (<Progress … />)}`; change the row `Group justify='space-between' mb={4}` (L151) to `mb={compact ? 0 : 4}`. Counts and clicks are already absent when `issueCounts` / `onCategoryClick` are not passed; nothing else changes (toggle, badges, auto-fails row stay).

**1b. `ComplianceCard.tsx`** — same: `compact = false`, `{!compact && (<Progress … />)}` around L154-159, `mb={compact ? 0 : 4}` at L127.

**1c. `SentimentEmotionSplitCard.tsx`**

- Add `compact?: boolean` to the card props and to `SideColumn`'s props (`compact?: boolean`); in `SideColumn` wrap the `Progress` (L82-87) in `{!compact && (…)}`.
- Pass `compact={compact}` to both `SideColumn`s (L177-186).
- Wrap the `Divider` (L189) and the review-rows `Stack` (L191-202) in `{!compact && (<> … </>)}` — without counts those rows carry nothing, so they go entirely.

**1d. `OperationalCard.tsx`** — `compact = false`; on the Effective row hide the count text (L115-117) and the `Progress` (L120-125) with `{!compact && …}`; same on the Non-effective row (count L140-142, `Progress` L146-151); set both rows' `Group justify='space-between' mb={4}` to `mb={compact ? 0 : 4}`. The total-calls block and the sales block are unchanged (OM passes neither `onCallsClick` nor `sales`).

`npm run typecheck`.

### Task 2 — Copy for the Operation Manager

**2a. `src/modules/qa/dashboard/useDashboardCopy.ts`** (CRLF): `export type DashboardCopyRole = 'agent' | 'supervisor' | 'qaManager' | 'operationManager';`

**2b. `src/locales/{en,es}/qa.dashboard.json`** — add under `roleDashboard`:

| key                         | en                                        | es                                                          |
| --------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| `title.operationManager`    | Operation Manager Dashboard               | Panel del gerente de operaciones                            |
| `subtitle.operationManager` | Client portfolio and team health overview | Resumen de la cartera de clientes y la salud de los equipos |
| `scope.operationManager`    | Cross-client                              | Entre clientes                                              |

Validate both files with `node -e "JSON.parse(...)"`.

### Task 3 — Operation Manager page

**`NewOperationManagerDashboard.tsx`**

Imports:

- `import React, { useMemo, useState } from 'react';`
- From `'../components'`: remove `SentimentEmotionCard`; add `SentimentEmotionSplitCard`, `OperationalCard`, `PerformanceScoreControls`.
- Remove `OPERATION_MANAGER_WEEKLY_METRICS` from the `'../mockData'` import (keep the other three).
- Add: `import { useDashboardCopy } from '../useDashboardCopy';`, `import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';`, `import { buildTeamDashboardMetrics, buildTeamBusinessInsights } from '~/modules/qa/calls/agentMetrics';`, `import type { DashboardLineOfBusiness } from '../lineOfBusiness';`, `import { DEFAULT_PERFORMANCE_SCORE_PERIOD, performanceScoreDays, type PerformanceScorePeriod } from '../constants';`.

Module-level, next to `OPERATION_MANAGER_INBOX_PATH`, copy from the supervisor page:

```ts
/** Time-window clause per period, used in the Performance Score description. */
const WINDOW_PHRASE: Record<PerformanceScorePeriod, string> = {
	today: 'today',
	week: 'this week',
	month: 'this month',
	quarter: 'over the last 3 months',
	sixMonths: 'over the last 6 months',
};
```

Inside the component, replace the mock destructure (L413-423) with:

```ts
const copy = useDashboardCopy('operationManager');
const [period, setPeriod] = useState<PerformanceScorePeriod>(
	DEFAULT_PERFORMANCE_SCORE_PERIOD
);
const days = performanceScoreDays(period);
const [lineOfBusiness, setLineOfBusiness] =
	useState<DashboardLineOfBusiness | null>(null);
const thresholds = useSettingsStore(selectThresholds);
// Portfolio view: every team, the same window and thresholds the QA manager sees.
const metrics = useMemo(
	() =>
		buildTeamDashboardMetrics('qa-manager', days, lineOfBusiness, thresholds),
	[days, lineOfBusiness, thresholds]
);
const {
	insights: businessInsights,
	outcome: businessOutcome,
	conversionTrend,
} = useMemo(
	() => buildTeamBusinessInsights('qa-manager', days, lineOfBusiness),
	[days, lineOfBusiness]
);
```

Header (L429-434): `<Title order={1}>{copy.title}</Title>` and `<Text c='dimmed' mt='xs'>{copy.subtitle}</Text>` (same words as today, now translated).

Performance Score section (replace L436-470):

```tsx
{
	/* 2. Performance Score: the five evaluation aspects, portfolio-wide and compact */
}
<SectionCard
	title='Performance Score'
	description={`Cross-client quality assurance, compliance, sentiment and business results ${WINDOW_PHRASE[period]}${lineOfBusiness ? ` · ${lineOfBusiness}` : ''}`}
	headerActions={
		<PerformanceScoreControls
			period={period}
			onPeriodChange={setPeriod}
			lineOfBusiness={lineOfBusiness}
			onLineOfBusinessChange={setLineOfBusiness}
		/>
	}
>
	<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing='md'>
		<div className={styles.gridCard}>
			<OperationalCard
				calls={metrics.calls}
				effectiveContacts={metrics.effectiveContacts}
				nonEffectiveContacts={metrics.nonEffectiveContacts}
				subtitle={copy.cardSubtitle('operational')}
				trend={metrics.trends?.effectiveContacts}
				compact
			/>
		</div>
		<div className={styles.gridCard}>
			<QualityAssuranceCard
				score={metrics.qa}
				subtitle={copy.cardSubtitle('qa')}
				autoFails={metrics.autoFails}
				trend={metrics.trends?.qa}
				compact
			/>
		</div>
		<div className={styles.gridCard}>
			<ComplianceCard
				categories={metrics.complianceCategories}
				subtitle={copy.cardSubtitle('compliance')}
				trend={metrics.trends?.compliance}
				compact
			/>
		</div>
		<div className={styles.gridCard}>
			<SentimentEmotionSplitCard
				agent={{
					score: metrics.sentiment.agentAvg,
					emotion: metrics.sentiment.agentEmotion,
					negativeCount: metrics.sentiment.agentNegativeCount,
					trend: metrics.trends?.agentSentiment,
				}}
				customer={{
					score: metrics.sentiment.customerAvg,
					emotion: metrics.sentiment.customerEmotion,
					negativeCount: metrics.sentiment.customerNegativeCount,
					trend: metrics.trends?.customerSentiment,
				}}
				subtitle={copy.cardSubtitle('sentiment')}
				compact
			/>
		</div>
		<div className={styles.gridCard}>
			<BusinessInsightsCard
				insights={businessInsights}
				outcome={businessOutcome}
				subtitle={copy.cardSubtitle('business')}
				conversionTrend={conversionTrend}
			/>
		</div>
	</SimpleGrid>
</SectionCard>;
```

No `issueCounts`, `onCategoryClick`, `onReviewClick`, `onCallsClick` or `onNonEffectiveClick` are passed, so nothing on these cards is clickable.

`npm run typecheck`.

### Task 4 — Checks

- `grep -n "OPERATION_MANAGER_WEEKLY_METRICS\|SentimentEmotionCard\b\|overallSentiment" src/modules/qa/dashboard/pages/NewOperationManagerDashboard.tsx` → nothing. The mock export in `mockData.ts` stays (unused is fine for a mockup).
- `grep -rn "compact" src/modules/qa/dashboard/pages` → only the OM page passes it.
- JSON parse of both `qa.dashboard.json`; `useDashboardCopy.ts` still CRLF (`git ls-files --eol`).
- Copy keys resolve (a missing one does not fail the typecheck, it renders the raw key): `node -e` reading both locale files and asserting `roleDashboard.title.operationManager`, `roleDashboard.subtitle.operationManager` and `roleDashboard.scope.operationManager` are non-empty strings.
- `npx prettier --write` on the four cards, the OM page, `useDashboardCopy.ts` and both locale files.
- `npm run typecheck` clean.

---

## Behaviour summary (demo script)

| Where                              | Action                         | Result                                                                                            |
| ---------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| OM dashboard                       | Open                           | Five cards; Operational first; no bars anywhere; no "N calls"; no chevrons; rows not clickable    |
| OM dashboard                       | Change period to Monthly       | All five cards recompute over 30 days of every team; description says "this month"; trends update |
| OM dashboard                       | Line of business = Collections | Cards narrow to that line; description gets "· Collections"                                       |
| OM dashboard                       | QA card "Show all 4"           | Toggle still works; rows show % and band badge only                                               |
| OM dashboard                       | Sentiment card                 | Agent and customer columns with score, emotion badge and trend; no negative-call rows             |
| Supervisor / QA Manager dashboards | Open                           | Unchanged: bars, counts, drill-down to Conversations                                              |
| Agent dashboard                    | Open                           | Unchanged                                                                                         |

## Verification

No dev server and no tests. `npm run typecheck` after each task, the JSON parse, the greps in Task 4. Visual check by the user in their dev server at `/qa/dashboards/operation-manager`, light and dark, and a glance at the supervisor dashboard to confirm it still shows progress bars and counts.

## Out of scope

- A Conversations route for the Operation Manager (no drill-down on this dashboard by decision).
- Translating the rest of the OM page (Critical Issues, Quick Insights, Operations tabs stay hard-coded English as today).
- Deleting `OPERATION_MANAGER_WEEKLY_METRICS` or the single-score `SentimentEmotionCard` (still used by `PerformanceScoresSection.tsx`).

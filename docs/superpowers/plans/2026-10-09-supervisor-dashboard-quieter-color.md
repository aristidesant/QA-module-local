# Supervisor dashboard: quieter color, lower visual load

## Context

The Supervisor dashboard (`src/modules/qa/dashboard/pages/NewSupervisorDashboard.tsx`, route `/qa/dashboards/supervisor`) reads as saturated and overwhelming. A code read shows why: every status value on the page is painted, so with typical data **~50 colored elements** (badges, progress bars, filled icon slabs, colored numbers, colored trend arrows) sit in the viewport at once, in **seven hues** (green, yellow, red, gray, teal, blue, orange). Three of those hues (yellow, red, orange, plus teal) are Mantine's stock scales, which the project never overrode, so they render at 94-98% saturation, well past the design system's "no accents above 80% saturation" rule (DESIGN.md §2) and off-brand against the amber `#F59E0B` / danger `#E53935` tokens that already exist in `design_system/tokens.css:52-55`.

Goal: a dashboard where color means **"exception"** (watch / at-risk / declining) and everything on target reads as calm neutral ink. Same information, same layout, same components. Mockup-level change, no backend, no new state beyond an optional "show all" toggle.

Mode: Operate. Refinement, not redesign. Keep the incumbent identity (SectionCard, Mantine Card, DM Sans, green primary).

---

## Critique summary (what the code says)

### Where the saturation comes from

| Source                                                                                          | Where                                                                                                                                                                                                                                                                            | Count on screen (typical data)      |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Stock Mantine `yellow`/`red`/`orange`/`teal` scales (never overridden in `src/theme.ts:95-144`) | every band badge, Progress bar, trend icon, rank medal                                                                                                                                                                                                                           | all warning/critical/medal elements |
| Band color on **every** row, including "on target"                                              | `QualityAssuranceCard.tsx:144,163`, `ComplianceCard.tsx:119-143`, `SentimentEmotionSplitCard.tsx:57-73`, `TeamBurnoutRiskCard.tsx:113-137`                                                                                                                                       | ~12 badges + ~12 Progress bars      |
| Filled (solid) `ThemeIcon` header slabs                                                         | `OperationalCard.tsx:76`, `QualityAssuranceCard.tsx:106`, `ComplianceCard.tsx:90`, `TeamBurnoutRiskCard.tsx:82` (gray filled = dark `gray-6` block); `BusinessInsightsCard.tsx:105` (**teal** filled); `SentimentEmotionSplitCard.tsx:152` (filled in band color, usually green) | 7 solid blocks                      |
| Colored numbers                                                                                 | `QualityAssuranceCard.tsx:199`, `SentimentEmotionSplitCard.tsx:111`, `BusinessInsightsCard.tsx:175` (`c='red'`); `ExpandedRankingsTable.module.css:127` (score in `blue-7`)                                                                                                      | 3-10                                |
| Colored trend lines on every card, good and bad                                                 | `TrendIndicator.tsx:39-46` (green/red icon + text) ×5 cards, + `BusinessInsightsCard.tsx:180` ×4 rows, + `TeamBurnoutRiskCard.tsx:125` ×N                                                                                                                                        | ~12                                 |
| Primary-green count badges by default                                                           | `NewSupervisorDashboard.tsx:219`, `WeekCoachingSessionsCard.tsx:69,92`, `Button variant='subtle'` at `:121`                                                                                                                                                                      | 3-4                                 |
| Rank medals yellow / gray / orange + blue sort icon                                             | `ExpandedRankingsTable.tsx:48-52`, `.module.css:73`                                                                                                                                                                                                                              | 3-4                                 |

### Where the "overwhelming" feeling comes from

- **Layering.** Page canvas → SectionCard (border + `shadow-md`, `SectionCard.module.css:34-38`) → five inner `Card`s each with `withBorder` + `shadow='sm'` + hover lift (`Dashboard.module.css:9-12`) → inside Sentiment, two more sunken gray panels (`.splitColumn`, `:91-98`). Four nested surfaces before the first number.
- **Five-up grid at `lg`** (`NewSupervisorDashboard.tsx:143`): each card carries a headline number, 2-5 breakdown rows, each row with label + badge + value + count + chevron + bar. Roughly 90 text tokens in the top band alone; nothing recedes because every row has the same weight and its own color.
- **Everything is a hierarchy level.** Headline value (`.scoreValue`, 1.5rem/700) vs. row value (sm/600) vs. badge vs. bar: four competing emphasis devices per row. The cognitive-load checklist fails on _single focus_, _chunking ≤4_, _visual hierarchy_ and _progressive disclosure_ (4 fails = high load).
- **Detector findings** (impeccable `detect.mjs`): side-tab accent stripe in `.currentAgentRow` (`Dashboard.module.css:61`) and `ExpandedRankingsTable.module.css:98-100` (not shown for supervisor, no `currentAgentId`), plus two 4px `borderLeft` stripes in `BestWorstCallsPanel.tsx:76` and `QuickInsightsWidget.tsx:116` (other dashboards; out of scope, noted only).

### What works (keep)

- One shared band scale (`SCORE_BAND_COLOR`, `badgeColors.ts:97-101`) feeding every card: one place to change the rule.
- The filters live in the Performance Score header (`PerformanceScoreControls`) so their scope is unambiguous.
- Consistent card anatomy (title / subtitle / headline / rows) across the five KPI cards, and across the agent, QA-manager and ops-manager dashboards that reuse them.
- Shared primitives are respected (`SectionCard`, `BaseTable`), and every custom color already uses Mantine variables or `light-dark()`.

### Heuristic snapshot (Operate mode, 0-4)

| #   | Heuristic              | Score     | Note                                                                                                                                                 |
| --- | ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Visibility of status   | 3         | trends + bands everywhere, arguably too visible                                                                                                      |
| 2   | Match real world       | 3         | ECN/ENC/ECC/ECUF unexplained acronyms                                                                                                                |
| 3   | User control           | 3         | clearable filters, drill-downs                                                                                                                       |
| 4   | Consistency            | 2         | stock vs. DS palettes mixed; teal header icon odd one out; dark mode via `[data-mantine-color-scheme]` in one CSS module, `light-dark()` in the next |
| 5   | Error prevention       | n/a       | read-only surface                                                                                                                                    |
| 6   | Recognition vs recall  | 3         | labels on everything                                                                                                                                 |
| 7   | Flexibility            | 2         | no keyboard shortcuts, no collapse                                                                                                                   |
| 8   | Aesthetic & minimalist | **1**     | every value painted; nothing recedes                                                                                                                 |
| 9   | Error recovery         | n/a       | read-only surface                                                                                                                                    |
| 10  | Help                   | 2         | tooltips on signals only                                                                                                                             |
|     | **Total**              | **19/32** | Acceptable, driven down by #8                                                                                                                        |

---

## Recommended direction: "color means exception"

Three rules, applied everywhere on the page:

1. **Neutral by default.** On-target / stable / improving values render in ink and gray. Only _watch_, _at-risk_, _declining_ and _alerting_ get a hue.
2. **One color device per row.** A row shows its status through _one_ element (the badge). Bars and numbers stay neutral; numbers are never colored.
3. **The brand palette, not Mantine's.** Warning and danger come from the DS tokens (`--nt-warn`, `--nt-danger`), registered in `src/theme.ts` as two **new** color names, `amber` and `danger`. Existing `red` / `yellow` usages elsewhere in the app are untouched (user decision: dashboard only). The dashboard cards reference the new names through one map.

Plus two structural rules: **flatten one layer** (inner KPI cards lose their shadow and hover lift, the Sentiment split loses its sunken panels) and **exceptions first** (QA and Compliance breakdowns show only watch / at-risk rows until the reader asks for all of them).

---

## Implementation plan

Execute in order. Each phase is independently shippable and visible.

### Phase 1 — Register the semantic scales as new names (`src/theme.ts`)

Add two color arrays next to `green`/`blue`/`gray`/`dark` inside `colors:` (`src/theme.ts:95`), under the **new** keys `amber` and `danger`. Do not touch the existing `red` / `yellow` scales. Shade 5 is the DS token (so `primaryShade.light = 5` picks it for filled/Progress), shade 4 the dark-mode filled shade. Mantine generates `--mantine-color-amber-N` / `--mantine-color-danger-N` variables and the `light` / `filled` variants automatically; `color='amber'` is accepted anywhere a Mantine color is (the `MantineColor` type allows any string).

```ts
amber: [
	'#fffbeb', // 0
	'#fef3c7', // 1  – DS --nt-warn-bg
	'#fde68a', // 2
	'#fcd34d', // 3
	'#fbbf24', // 4  – dark-mode filled
	'#f59e0b', // 5  – DS --nt-warn (PRIMARY SHADE)
	'#d97706', // 6
	'#b45309', // 7
	'#92400e', // 8
	'#78350f', // 9
],
danger: [
	'#fef2f2', // 0
	'#fee2e2', // 1  – DS --nt-danger-bg
	'#fecaca', // 2
	'#f99a9a', // 3
	'#f06b6b', // 4  – dark-mode filled
	'#e53935', // 5  – DS --nt-danger (PRIMARY SHADE)
	'#c62828', // 6
	'#b71c1c', // 7
	'#8f1a1a', // 8
	'#6b1414', // 9
],
```

Effect: zero change anywhere until a component opts in with `color='amber'` / `color='danger'`. Only the files listed in Phases 3-4 opt in. `orange` and `teal` are left stock because Phase 4 removes their only uses on this page.

### Phase 2 — Flatten the card chrome

`src/modules/qa/dashboard/Dashboard.module.css`

- Delete the `.metricCard:hover` block (`:9-12`) and the `transition` in `.metricCard` (`:3-7`). Cards are not clickable; rows are, and `.drillRow:hover` already shows that.
- `.splitColumn` (`:91-98`): remove `background-color` and `border-radius`; keep `padding` at `var(--mantine-spacing-xs) 0`.
- `.currentAgentRow` (`:56-62`): drop the `box-shadow: inset 3px …` stripe; the tinted background is enough. (Also `ExpandedRankingsTable.module.css:98-100`, same stripe.)

The five KPI cards + `TeamBurnoutRiskCard` share one `<Card … withBorder shadow='sm' …>` shell (e.g. `OperationalCard.tsx:55-62`). In each of the six files change `shadow='sm'` → `shadow='none'`. Keep `withBorder` and `radius='md'`.

### Phase 3 — Status color discipline on the KPI cards

**3a. Shared helpers, `src/modules/qa/constants/badgeColors.ts`** (append after `SCORE_BAND_COLOR`, `:101`):

```ts
/**
 * Dashboard tone of a band: the Performance Score cards color exceptions only,
 * so an on-target value reads as neutral ink while watch / at-risk keep their hue.
 */
export const SCORE_BAND_TONE: Record<ScoreBand, string> = {
	good: 'gray',
	warning: 'amber',
	critical: 'danger',
};

/** True when a band deserves a visible status badge on a breakdown row. */
export const isExceptionBand = (band: ScoreBand) => band !== 'good';
```

`SCORE_BAND_COLOR` stays as is for its other consumers (`AgentsTierTable`, `PostCoachingCards`, `PerformanceScoresSection`, `CampaignPerformanceCard`, call-evaluation panels). Only the files below switch to `SCORE_BAND_TONE`.

Throughout Phase 3, every literal `'red'` that marks an alert becomes `'danger'`, and every band `'yellow'` becomes `'amber'`. The literal `'green'` disappears from these cards except where noted.

**3b. Header icons** — all six cards use the same neutral treatment: `<ThemeIcon size='lg' variant='light' color='gray' radius='md'>`.

- `OperationalCard.tsx:76`, `QualityAssuranceCard.tsx:106`, `ComplianceCard.tsx:90`, `TeamBurnoutRiskCard.tsx:82`: add `variant='light'`.
- `BusinessInsightsCard.tsx:105`: `color='teal'` → `color='gray'`, add `variant='light'`.
- `SentimentEmotionSplitCard.tsx:152`: `color={headerBand.color}` → `color='gray'`, add `variant='light'`. The mood glyph (`HeaderIcon`) still conveys the band.

**3c. `TrendIndicator.tsx`** — neutral unless bad:

```ts
const color = isGood === false ? 'danger' : 'dimmed';
```

Icon: `color={isGood === false ? 'var(--mantine-color-danger-6)' : 'var(--mantine-color-dimmed)'}`. Text keeps `c={color}` (`'dimmed'` is a valid Mantine color key).

**3d. `QualityAssuranceCard.tsx`**

- Headline badge (`:116`): keep, but `color={totalBandColor}` → `color={SCORE_BAND_TONE[totalBand]}`. The headline is the one place "on target" may still carry a label.
- Row badge (`:144-146`): wrap in `{isExceptionBand(band) && (…)}` and use `color={SCORE_BAND_TONE[band]}`.
- Row Progress (`:160-164`): `size='xs'`, `color={SCORE_BAND_TONE[band]}`.
- Auto-fails row: badge (`:185-193`) render only when `autoFails > 0`, with `color='danger'`; number (`:196-202`) drop `c={…}` so it is plain ink.
- Import `SCORE_BAND_TONE, isExceptionBand` instead of `SCORE_BAND_COLOR`.
- Row rendering is reshaped by Phase 5 (see there); apply 3d first, then 5.

**3e. `ComplianceCard.tsx`**

- `getComplianceColor` (`:31-42`) → return `SCORE_BAND_TONE.*` instead of `SCORE_BAND_COLOR.*`. Add `isComplianceException = (status) => status !== 'compliant'`.
- Row badge (`:119-125`): render only when `isComplianceException(category.status)`.
- Progress (`:139-143`): `size='xs'`.

**3f. `SentimentEmotionSplitCard.tsx`**

- `SideColumn` icon (`:57`): `color='gray'`.
- Add a local map at the top of the file: `const SENTIMENT_TONE: Record<string, string> = { red: 'danger', gray: 'gray', green: 'gray' };` and `const tone = SENTIMENT_TONE[band.color] ?? 'gray';`. (Sentiment bands are in `SentimentEmotionCard.tsx:40-62`: red/red/gray/green/green. Do **not** edit that file; it is shared with other dashboards.)
- Progress (`:70`): `size='xs'`, `color={tone}`.
- Band badge (`:71-73`): render only when `band.color === 'red'`, with `color='danger'`; emotion badge (`:74-81`) stays gray.
- Review rows (`:111`): drop `c={count > 0 ? 'red' : undefined}`; the chevron + count is the affordance.

**3g. `BusinessInsightsCard.tsx`**

- `TREND_META` (`:55-62`): `up` → `'danger'`, `down` → `'gray'`, `stable` → `'gray'`.
- Headline badge (`:118-122`): `color={SCORE_BAND_TONE[conversionBand]}`.
- Signal rows: replace the two-icon cluster (`:165-182`) with one status device. Keep the alert `ThemeIcon` (`:170`) only when `alerting`, with `color='danger'`; render the trend as a bare icon, not a `ThemeIcon`: `<TrendIcon size={12} color={`var(--mantine-color-${meta.color}-6)`} />`; number (`:175`) drops `c={…}`.

**3h. `OperationalCard.tsx`** — Progress (`:103`, `:124`): `size='xs'`, both `color='gray'` (effective vs. non-effective is already told by the label; the pair of bars is a share, not a status).

**3i. `TeamBurnoutRiskCard.tsx`**

- `LEVEL_COLOR` (`:34-38`): `LOW` → `'gray'`, `MEDIUM` → `'amber'`, `HIGH` → `'danger'`.
- `TREND_META` (`:40-47`): `improving` → `'gray'`, `declining` → `'danger'`.
- Trend `ThemeIcon` (`:125-131`) → bare icon as in 3g. Progress (`:134-138`): `size='xs'`.

### Phase 4 — Leaderboard and coaching cards

`src/modules/qa/agent/rankings/components/ExpandedRankingsTable.tsx`

- `RANK_BADGE_COLORS` (`:48-52`): delete. Rank cell (`:118-124`): `<Badge variant='default' radius='sm' fw={rank <= 3 ? 700 : 500}>#{rank}</Badge>`. `WinnerBadge` (yellow, only when the program is completed) stays: that is a real event.

`ExpandedRankingsTable.module.css`

- `.score` (`:126-128`) and its dark override (`:208-210`): delete the rules (score becomes default ink; it already has `fw={700}` at `.tsx:148`).
- `.th[data-sorted] .sortIcon` (`:72-75`): `blue-6` → `gray-7`; dark override (`:191-193`): `blue-4` → `dark-0`.
- `.row[data-even] > td` (`:81-83`) and dark (`:200-202`): delete striping; the 1px row borders are enough at 52px rows.

`RankingCard.tsx` / `RankingCard.module.css` (mobile grid, < 1024px): apply the same rank-badge neutralization at `RankingCard.tsx:16-20`; leave the rest.

Count badges in SectionCard headers: `NewSupervisorDashboard.tsx:219` and `WeekCoachingSessionsCard.tsx:92` → `variant='default'`. `WeekCoachingSessionsCard.tsx:69` GROUP badge → `variant='default'`. The "View all" `Button variant='subtle'` (`:120`) stays green: it is the one action on that card.

### Phase 5 — "Exceptions first" on the QA and Compliance breakdowns

Local toggle state only, no store, no persistence. Same pattern in both cards.

**5a. `QualityAssuranceCard.tsx`**

- `import { useState } from 'react'`; `import { Anchor } from '@mantine/core'` (add to the existing import).
- Inside the component, before `return`:
  ```ts
  const [showAll, setShowAll] = useState(false);
  const rows = QA_CATEGORIES.map((category) => ({
  	...category,
  	band: bandFor(
  		score[category.key],
  		thresholds.qa.categoryBands[category.key]
  	),
  }));
  const exceptions = rows.filter((row) => isExceptionBand(row.band));
  const visibleRows = showAll ? rows : exceptions;
  const hiddenCount = rows.length - visibleRows.length;
  ```
- Replace `QA_CATEGORIES.map(…)` (`:122-167`) with `visibleRows.map(…)`, using `row.band` instead of recomputing it; the row body is the 3d version (badge only for exceptions, `size='xs'` gray/amber/danger bar).
- After the rows and before the auto-fails row, add:
  ```tsx
  {
  	!showAll && exceptions.length === 0 && (
  		<Text size='sm' c='dimmed'>
  			{t('breakdown.allOnTarget')}
  		</Text>
  	);
  }
  {
  	hiddenCount > 0 && (
  		<Anchor
  			component='button'
  			type='button'
  			size='xs'
  			c='dimmed'
  			onClick={() => setShowAll(true)}
  		>
  			{t('breakdown.showAll', { count: rows.length })}
  		</Anchor>
  	);
  }
  {
  	showAll && exceptions.length < rows.length && (
  		<Anchor
  			component='button'
  			type='button'
  			size='xs'
  			c='dimmed'
  			onClick={() => setShowAll(false)}
  		>
  			{t('breakdown.showExceptions')}
  		</Anchor>
  	);
  }
  ```
  The auto-fails row is always shown (it is an exception by definition when > 0; when 0 it reads as a neutral "None" line and still shows so the reader knows the check ran).

**5b. `ComplianceCard.tsx`** — same shape: `exceptions = categories.filter((c) => isComplianceException(c.status))`, `visibleRows = showAll ? categories : exceptions`, same three lines after the rows.

**5c. Copy** — two files exist: `src/locales/en/qa.dashboard.json` and `src/locales/es/qa.dashboard.json`. Add a `breakdown` object next to the existing `drill` object (`:65` in both):

en:

```json
"breakdown": {
	"allOnTarget": "All categories on target",
	"showAll": "Show all {{count}} categories",
	"showExceptions": "Show exceptions only"
}
```

es:

```json
"breakdown": {
	"allOnTarget": "Todas las categorías en objetivo",
	"showAll": "Ver las {{count}} categorías",
	"showExceptions": "Ver solo excepciones"
}
```

**5d. Sentiment, Business Insights, Operational, Burnout**: no collapse. Sentiment has two fixed columns, Business Insights four signals that are the point of the card, Operational two shares, Burnout lists exceptions already.

Effect on a healthy week: the QA and Compliance cards drop from 5 and 4-5 rows to one dimmed line plus a link; the top band loses roughly 40% of its tokens and all of its on-target chips.

---

## Files touched

- `src/theme.ts` (Phase 1)
- `src/modules/qa/dashboard/Dashboard.module.css` (2)
- `src/modules/qa/constants/badgeColors.ts` (3a)
- `src/modules/qa/dashboard/components/{OperationalCard,QualityAssuranceCard,ComplianceCard,SentimentEmotionSplitCard,BusinessInsightsCard,TrendIndicator,TeamBurnoutRiskCard,WeekCoachingSessionsCard}.tsx` (2, 3, 4)
- `src/modules/qa/dashboard/pages/NewSupervisorDashboard.tsx` (4, one badge)
- `src/modules/qa/agent/rankings/components/ExpandedRankingsTable.tsx`, `.module.css`, `RankingCard.tsx` (4)

Do not touch: `SentimentEmotionCard.tsx` (shared band table), `SectionCard`, `BaseTable`, `PerformanceScoreControls`.

- `src/locales/*/qa.dashboard.json` (5c)

## Blast radius

- Phase 1 adds two color names and changes nothing until a component uses them. Existing `red` / `yellow` badges across the app are untouched (user decision).
- Phases 3-5 also change the Agent, QA-manager and Ops-manager dashboards, which reuse the same KPI cards. That is intended: same rule everywhere. `SentimentEmotionCard` (used by the Ops-manager dashboard instead of the split card) is not edited and keeps its current colors; flag this as a follow-up if the Ops-manager view should match.

## Verification

Per DESIGN_ROLE.md the dev server is not started unless asked. When the user runs it:

1. `npm run typecheck` passes (new exports, removed imports of `SCORE_BAND_COLOR` in the three cards, new i18n keys).
2. `/qa/dashboards/supervisor`, light mode: with the default mock week, the only green left in the Performance Score band is the "View all" button on the coaching card and the SegmentedControl indicator; QA and Compliance show exception rows only plus a "Show all" link, which expands to all rows with gray bars and no badges on the on-target ones; warning/at-risk rows show one amber or red badge each.
3. Toggle dark mode: KPI cards still separate from the SectionCard by border alone; amber/red light badges remain legible; no `.score` blue remains in the leaderboard.
4. Resize to < 1024px: `RankingCardGrid` ranks are neutral badges.
5. Re-run `node <impeccable>/scripts/detect.mjs --json src/modules/qa/dashboard`: the `.currentAgentRow` side-tab finding is gone.

---

## Addendum — from the independent design review (apply with the phases above)

The second review confirmed the diagnosis (≈80 colored elements, 7 hues, bands encoded 2-4× per row, 5 nested surfaces) and added the following. Mantine 9 resolution facts it verified in `node_modules/@mantine/core`: `filled` and `c='<color>'` text use **shade 5** in light / 4 in dark; `variant='light'` uses **shade 1 background + shade 9 text** in light mode. The `amber` / `danger` scales in Phase 1 were chosen with that in mind (shade 9 on shade 1 passes AA comfortably).

**A1. Trend text contrast (Phase 3c).** `c='danger'` resolves to shade 5 `#e53935`, ≈4.0:1 on white, which fails AA for 12px text. In `TrendIndicator.tsx` use `c='danger.7'` for the text and `var(--mantine-color-danger-7)` for the icon in light mode. Simplest: `const textColor = isGood === false ? 'danger.7' : 'dimmed';` and icon `color={isGood === false ? 'var(--mantine-color-danger-7)' : 'var(--mantine-color-dimmed)'}`. Dark mode: Mantine maps `danger.7` to the same shade; `#b71c1c` on `dark-8` is ≈4.6:1, acceptable.

**A2. (Dropped.)** The reviewer flagged `Grid gap` as ignored, but Mantine 9 renamed `gutter` to `gap`; `gap='lg'` is correct and stays.

**A3. Progress bars have no accessible name.** Every `Progress` touched in Phase 3 gets `aria-label`: e.g. `aria-label={`${category.label} ${score[category.key]}%`}` (QA), `aria-label={`${category.name} ${category.score}%`}` (Compliance), `aria-label={`${title} ${side.score.toFixed(1)}/5`}` (Sentiment), `aria-label={`${entry.agentName} ${entry.percentage}%`}` (Burnout), `aria-label='Effective contacts …'` / non-effective (Operational, use the row label text).

**A4. `DrillRow` accessible name.** `DrillRow.tsx:21` sets `aria-label={hint}`, which replaces the row's own text for screen readers (19 rows all announce "Open the calls behind this number"). Remove the `aria-label`; keep `title={hint}`. The children already carry the metric name and value.

**A5. Burnout row keyboard.** `TeamBurnoutRiskCard.tsx:104-106` handles Enter only. Add Space: `if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEvidence(entry.agentId); }`.

**A6. Business headline size.** `BusinessInsightsCard.tsx:112` uses `size='xl'` (18px) while the other four tiles use `className={styles.scoreValue}` (24px/700). Switch to `<Text className={styles.scoreValue}>` so the conversion rate is not the smallest headline on the strip.

**A7. Hover shadow color.** Phase 2 already deletes `.metricCard:hover`; note that `src/styles/global.css:123-126` also lifts every `.mantine-Card-root` on hover. Leave `global.css` alone (app-wide), but if the tiles still lift after Phase 2, add `.metricCard:hover { box-shadow: none; transform: none; }` to `Dashboard.module.css` to cancel it locally.

**Noted, not in scope of this plan (product/IA, not color):**

- All 19 drill rows navigate to the same unfiltered `/qa/supervisor/analytics` (`NewSupervisorDashboard.tsx:63,113`); the category key is ignored.
- Three vocabularies for one 3-band scale ("On target/Watch/At risk", "Compliant/Warning/Violation", "LOW/MEDIUM/HIGH") plus ECN/ENC/ECC/ECUF never expanded.
- Period and Line-of-business filters do not apply to the leaderboard or burnout card, and that scope gap is not stated.
- Hard-coded English strings in Operational, QA, Compliance and Burnout cards.
- The reviewer's bolder flatten option (tiles with no border, separated by a 1px left rule) was not adopted; the approved plan keeps `withBorder` and removes shadow only.

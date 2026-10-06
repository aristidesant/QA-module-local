# NPS in Customer Header + ESG Brand-level Area Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project override on testing:** per `CLAUDE.md` ("Do not create tests unless explicitly requested") and
> `DESIGN_ROLE.md` (stakeholder-mockup session), **no test-writing steps are included**. Each task's verification is
> `npm run typecheck` (must stay clean). Do not run the dev server.
>
> **When executing:** first copy this file to `docs/superpowers/plans/2026-10-06-nps-header-esg-area.md`, then follow
> tasks in order. One commit per task.

## Context

The platform must integrate two concepts: **NPS** (Net Promoter Score) and **ESG** (Environmental, Social, Governance).

- **NPS already exists per customer** (`SurveyResponse.type: 'NPS' | 'CSAT'`, `CustomerKpis.npsLatest`, the Overview tab
  KPI card, the Surveys tab with NPS trend, and the `npsBand` helper). What is missing, and what the user asked for, is
  surfacing it in the **customer profile header** so it reads at a glance next to receptiveness/churn.
- **ESG does not exist anywhere.** Decision (confirmed with the user 2026-10-06): ESG describes the **brand**, not the
  individual customer. It is modelled as a **new evaluation area** with 3 pillars (E/S/G), detected **per call** (new
  "ESG" tab in the Call Evaluation detail, same layout as the Compliance tab) and aggregated at **brand/platform level**
  as a new area in the Performance Score widget of the **QA Manager and Supervisor** dashboards. The agent role does
  **not** see ESG (hidden like Business Insights). No Team Analytics view, no Reports section, no Settings thresholds
  (fixed target constant instead) — out of scope.

**Goal:** (1) NPS badge in `CustomerHeader`. (2) ESG area in Supervisor/QA Manager dashboards fed by per-call ESG pillar
scores in the mock call generator. (3) ESG tab + panel in the Call Evaluation detail page.

**Architecture:** ESG copies the Compliance pattern end-to-end:

- Per-call data: `TeamCallMetric.esg: { environmental, social, governance }` (0-100) generated in
  `src/modules/qa/analytics/mockData.ts` `generateCalls`.
- Aggregation: new `esg` block in `buildAreaMetrics` (`src/modules/qa/dashboard/areaMetrics.ts`), headline = average of
  the 3 pillars, cards = 3 pillars + "Flagged calls". `atRisk` uses the existing 3-tier `getScoreBand` from
  `src/modules/qa/constants/badgeColors.ts` (critical < 70).
- UI: `DashboardMeasure`/`DASHBOARD_AREAS` gain `'esg'`; both dashboards render it automatically through
  `AreaSelector`/`AreaSummary`/`AreaMetricCard` (no changes needed in the two dashboard pages).
- Call detail: `CallEvaluationDetail.esg: CallEsgEvaluation` (mirrors `CallComplianceEvaluation`), `EsgPanel.tsx`
  cloned from `CompliancePanel.tsx`, tab added via a separate `ESG_TAB` constant so the disputes module (which maps
  over `CALL_EVALUATION_TABS` and keys `Record<DisputeEvaluationType, …>`) is **not** touched.

## Global Constraints

- Mantine CSS variables / `light-dark()` only — no hardcoded hex; every new UI must look right in dark and light.
- No new inline `style={{}}` (pre-commit hook blocks it) except reusing patterns already present in the edited file
  (`CompliancePanel` uses `style={{ color: 'var(--mantine-color-green-6)' }}` on icons — keep exactly that form).
- Dashboard strings go through i18n namespace `qa.dashboard`; customer header strings through `qa.customers`. Write every
  key in **both** `src/locales/en/*.json` and `src/locales/es/*.json`.
- Call Evaluation panels (`src/views/Campaigns/components/call-evaluation/*`) and `src/views/Campaigns/constants.ts` are
  **English-only hardcoded** today (no i18n). Keep that convention there — do not introduce i18n to those files.
- Reuse `SectionCard`, `Badge`, `Progress`, `RingProgress`, `Paper`. No new primitives.
- `npm run typecheck` clean after every task; finish all of a task's edits before committing.
- Commit message style: `feat(qa-customers): …`, `feat(qa-dashboard): …`, `feat(qa-call-evaluation): …` (see `git log`).
- Commit trailer: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## File Structure

**New files:**

- `src/views/Campaigns/components/call-evaluation/EsgPanel.tsx` — ESG tab panel (clone of `CompliancePanel.tsx`).

**Modified files:**

- `src/modules/qa/customers/CustomerProfilePage/CustomerHeader.tsx` — NPS row with band badge.
- `src/locales/en/qa.customers.json`, `src/locales/es/qa.customers.json` — `header.nps`.
- `src/modules/qa/analytics/types.ts` — `EsgPillarScores`, `EsgPillarKey`, `TeamCallMetric.esg`.
- `src/modules/qa/analytics/mockData.ts` — generate `esg` per call.
- `src/modules/qa/dashboard/useDashboardCopy.ts` — `DashboardMeasure` + `'esg'`.
- `src/modules/qa/dashboard/constants.ts` — `DASHBOARD_AREAS` + esg entry.
- `src/modules/qa/dashboard/areaMetrics.ts` — `esg` block in `buildAreaMetrics`.
- `src/locales/en/qa.dashboard.json`, `src/locales/es/qa.dashboard.json` — area/measure/metrics keys.
- `src/views/Campaigns/types.ts` — `CallDetailTab`, ESG types, `CallEvaluationDetail.esg`.
- `src/views/Campaigns/constants.ts` — `CallEvaluationTabMeta.key` widened, `ESG_TAB`, `ESG_PILLARS`,
  `ESG_PILLAR_ORDER`, `mockCallEvaluationDetail.esg`.
- `src/views/Campaigns/pages/ConversationEvaluations.tsx` — ESG tab button, badge, panel mount, agent hiding.

---

## Task 1 — NPS badge in the customer profile header

**Files:** `src/modules/qa/customers/CustomerProfilePage/CustomerHeader.tsx`, `src/locales/en/qa.customers.json`,
`src/locales/es/qa.customers.json`.

Existing pieces to reuse (verified):

- `kpis.npsLatest?: number` on `CustomerKpis` (`src/modules/qa/customers/types.ts:122`).
- `npsBand(score)` → `{ label: 'promoter'|'passive'|'detractor', color: 'green'|'yellow'|'red' }`
  (`src/modules/qa/customers/helpers.ts:45`).
- Band labels already exist at `surveys.band.promoter|passive|detractor` in both locales.
- Header right column is a `<Stack gap={6}>` with rows "Churn risk" and "Best window" (`CustomerHeader.tsx:99-123`).

- [ ] **1.1** Add i18n key in both files, inside `"header"` right after `"bestWindow"`:
  - en: `"nps": "NPS"`
  - es: `"nps": "NPS"`
- [ ] **1.2** In `CustomerHeader.tsx`:
  - Add `import { npsBand, windowLabel } from '../helpers';` (replace the existing `windowLabel` import line).
  - After `const highChurn = …` add:
    ```ts
    const nps = kpis.npsLatest !== undefined ? npsBand(kpis.npsLatest) : null;
    ```
  - Insert this row **between** the "Churn risk" `<Group>` and the "Best window" `<Group>` in the right-hand `Stack`:
    ```tsx
    <Group gap='xs'>
    	<Text size='xs' c='dimmed' tt='uppercase'>
    		{t('header.nps')}
    	</Text>
    	{nps ? (
    		<Badge variant='light' color={nps.color} size='sm'>
    			{kpis.npsLatest} · {t(`surveys.band.${nps.label}`)}
    		</Badge>
    	) : (
    		<Text size='sm'>—</Text>
    	)}
    </Group>
    ```
    `Badge` is already imported in this file. Keep the header's "red only for attention" comment intact — the badge
    colour comes from the existing band helper, which is the same scale used by the Surveys tab.
- [ ] **1.3** `npm run typecheck` clean → commit `feat(qa-customers): show the latest NPS with its band in the profile header`.

---

## Task 2 — Per-call ESG pillar scores in the mock call data

**Files:** `src/modules/qa/analytics/types.ts`, `src/modules/qa/analytics/mockData.ts`.

Only `generateCalls` builds `TeamCallMetric` objects (verified: single `const out: TeamCallMetric[] = []` at
`mockData.ts:137`), so adding a required field is safe.

- [ ] **2.1** In `src/modules/qa/analytics/types.ts`, right before `export interface TeamCallMetric`:
  ```ts
  /** 0-100 score of each ESG pillar on one call. */
  export interface EsgPillarScores {
  	environmental: number;
  	social: number;
  	governance: number;
  }
  export type EsgPillarKey = keyof EsgPillarScores;
  ```
  and add to `TeamCallMetric` after `contactOutcome: ContactOutcome;`:
  ```ts
  esg: EsgPillarScores;
  ```
- [ ] **2.2** In `generateCalls` (`mockData.ts`), after the `// --- Business ---` block (after `const contactOutcome …`,
      before `seq += 1;`) add:
  ```ts
  // --- ESG: governance tracks compliance, social tracks sentiment, environmental is its own habit ---
  const environmental = clamp(
  	Math.round(62 + base.business * 20 + (rand() - 0.5) * 24),
  	30,
  	100
  );
  const social = clamp(
  	Math.round(
  		60 + base.sentiment * 38 + (rand() - 0.5) * 14 - burnoutPenalty * 10
  	),
  	30,
  	100
  );
  const governance = clamp(Math.round(compBase + (rand() - 0.5) * 10), 40, 100);
  ```
  (`clamp`, `rand`, `base`, `burnoutPenalty`, `compBase` are all in scope at that point — verified lines 148-218.)
  Then add `esg: { environmental, social, governance },` to the `out.push({ … })` literal after `contactOutcome,`.
- [ ] **2.3** `npm run typecheck` clean → commit `feat(qa-analytics): add ESG pillar scores to every mock call`.

---

## Task 3 — ESG area in the Supervisor and QA Manager dashboards

**Files:** `src/modules/qa/dashboard/useDashboardCopy.ts`, `src/modules/qa/dashboard/constants.ts`,
`src/modules/qa/dashboard/areaMetrics.ts`, `src/locales/en/qa.dashboard.json`, `src/locales/es/qa.dashboard.json`.

Both dashboards (`NewQAManagerDashboard.tsx:319-334`, `NewSupervisorDashboard.tsx:136-150`) already render
`AreaSelector` + `AreaSummary` + `current.cards.map(AreaMetricCard)` from `buildAreaMetrics(...)[area]`, so adding the
area to the union, the selector list and the builder is enough. Card grid is `cols={{ lg: 5 }}`; ESG has 4 cards.

- [ ] **3.1** `useDashboardCopy.ts`: add `| 'esg'` at the end of the `DashboardMeasure` union.
- [ ] **3.2** `constants.ts`: append to `DASHBOARD_AREAS`:
  ```ts
  	{ value: 'esg', labelKey: 'performanceScore.area.esg' },
  ```
- [ ] **3.3** `areaMetrics.ts`:
  - Imports: add `import type { EsgPillarKey, TeamCallMetric } from '~/modules/qa/analytics/types';` (merge with the
    existing `TeamCallMetric` type import) and `import { getScoreBand } from '~/modules/qa/constants/badgeColors';`.
  - After the `SIGNALS` constant add:

    ```ts
    const ESG_PILLARS: EsgPillarKey[] = [
    	'environmental',
    	'social',
    	'governance',
    ];

    /** A call is flagged when any pillar falls under this score. ESG has no Settings thresholds yet. */
    const ESG_PILLAR_TARGET = 70;

    const esgPillarAverage = (calls: TeamCallMetric[], pillar: EsgPillarKey) =>
    	calls.length === 0
    		? 0
    		: Math.round(
    				calls.reduce((sum, c) => sum + c.esg[pillar], 0) / calls.length
    			);

    const esgFlaggedCalls = (calls: TeamCallMetric[]) =>
    	calls.filter((c) => ESG_PILLARS.some((p) => c.esg[p] < ESG_PILLAR_TARGET))
    		.length;
    ```

  - Inside `buildAreaMetrics`, after the `businessArea` constant and before `return {`, add:

    ```ts
    const esgAvg = (list: TeamCallMetric[]) =>
    	Object.fromEntries(
    		ESG_PILLARS.map((p) => [p, esgPillarAverage(list, p)])
    	) as Record<EsgPillarKey, number>;
    const esgNow = esgAvg(calls);
    const esgBefore = esgAvg(previousCalls);
    const esgScoreOf = (avg: Record<EsgPillarKey, number>) =>
    	Math.round(
    		ESG_PILLARS.reduce((sum, p) => sum + avg[p], 0) / ESG_PILLARS.length
    	);
    const esgScore = esgScoreOf(esgNow);
    const esgFlagged = esgFlaggedCalls(calls);

    const esg: AreaMetrics = {
    	headline: {
    		id: 'esgScore',
    		value: `${esgScore}%`,
    		trend: rate(esgScore, esgScoreOf(esgBefore)),
    		atRisk: hasCalls && getScoreBand(esgScore) === 'critical',
    	},
    	cards: [
    		...ESG_PILLARS.map((pillar) => ({
    			id: pillar,
    			value: `${esgNow[pillar]}%`,
    			secondary: {
    				key: 'drill.calls',
    				values: {
    					count: calls.filter((c) => c.esg[pillar] < ESG_PILLAR_TARGET)
    						.length,
    				},
    			},
    			trend: rate(esgNow[pillar], esgBefore[pillar]),
    			atRisk: hasCalls && getScoreBand(esgNow[pillar]) === 'critical',
    		})),
    		{
    			id: 'esgFlagged',
    			value: String(esgFlagged),
    			trend: change(esgFlagged, esgFlaggedCalls(previousCalls)),
    			atRisk: esgFlagged > 0,
    		},
    	],
    };
    ```

  - Add `esg,` to the returned object after `business: businessArea,`.
    (`drill.calls` key already exists with `_one`/`_other` plurals — verified `qa.dashboard.json:49-53`.)

- [ ] **3.4** i18n `qa.dashboard.json` (both locales):
  - `performanceScore.area.esg`: en `"ESG"`, es `"ESG"`.
  - `performanceScore.metrics` — append:
    - en: `"esgScore": "ESG score"`, `"environmental": "Environmental"`, `"social": "Social"`,
      `"governance": "Governance"`, `"esgFlagged": "Flagged calls"`
    - es: `"esgScore": "Puntuación ESG"`, `"environmental": "Ambiental"`, `"social": "Social"`,
      `"governance": "Gobernanza"`, `"esgFlagged": "Llamadas señaladas"`
  - `roleDashboard.measure.esg`: en `"Score by ESG pillar"`, es `"Puntaje por pilar ESG"`.
- [ ] **3.5** `npm run typecheck` clean → commit
      `feat(qa-dashboard): add an ESG area with pillar scores to the Supervisor and QA Manager Performance Score`.

---

## Task 4 — ESG tab and panel in the Call Evaluation detail

**Files:** `src/views/Campaigns/types.ts`, `src/views/Campaigns/constants.ts`,
`src/views/Campaigns/components/call-evaluation/EsgPanel.tsx` (new),
`src/views/Campaigns/pages/ConversationEvaluations.tsx`.

**Why a separate `ESG_TAB` instead of adding `'esg'` to `CallEvaluationTab`:** `DisputeEvaluationType = CallEvaluationTab`
(`src/models/qa/disputeCases.ts:13`) and the disputes module keys `Record<DisputeEvaluationType, …>`
(`disputes/cases/mockData.ts:32`) and maps `CALL_EVALUATION_TABS` in `OpenDisputeDrawer.tsx:96`. ESG is not disputable
and the agent never sees it, so it stays out of that union and out of `CALL_EVALUATION_TABS`.

- [ ] **4.1** `types.ts`:
  - After `export type CallEvaluationTab = …` (line 127) add:
    ```ts
    /** Every tab of the call detail page. ESG is not a dispute type, so it is not part of `CallEvaluationTab`. */
    export type CallDetailTab = CallEvaluationTab | 'esg';
    ```
  - After the `// ---------- Compliance ----------` block (after `CallComplianceEvaluation`) add:

    ```ts
    // ---------- ESG ----------

    export type EsgPillarKey = 'environmental' | 'social' | 'governance';

    export interface EsgPillarResult {
    	key: EsgPillarKey;
    	score: number;
    	items: ComplianceItemResult[];
    }

    /** Same shape and status scale as compliance, grouped by ESG pillar instead of compliance area. */
    export interface CallEsgEvaluation {
    	overallScore: number;
    	status: ComplianceItemStatus;
    	violationCount: number;
    	warningCount: number;
    	pillars: EsgPillarResult[];
    }
    ```

  - Add `esg: CallEsgEvaluation;` to `CallEvaluationDetail` after `business: CallBusinessEvaluation;`.

- [ ] **4.2** `constants.ts`:
  - Import `CallDetailTab` and `EsgPillarKey` from `./types` (add to the existing type import list).
  - Add `IconLeaf, IconUsersGroup, IconBuildingBank, IconScale` to the `@tabler/icons-react` import (all exist in the
    installed version — verified under `node_modules/@tabler/icons-react/dist/esm/icons/`).
  - Change `CallEvaluationTabMeta.key: CallEvaluationTab` → `key: CallDetailTab`.
  - After `CALL_EVALUATION_TABS` add:
    ```ts
    /** Shown after the dispute-able tabs for Supervisor / QA Manager only; the agent role never sees it. */
    export const ESG_TAB: CallEvaluationTabMeta = {
    	key: 'esg',
    	label: 'ESG',
    	description: 'Environmental, Social and Governance practices on the call',
    	icon: IconLeaf,
    	color: 'teal',
    };
    ```
  - After `COMPLIANCE_AREA_ORDER` add:

    ```ts
    // ---------- ESG pillars ----------

    export interface EsgPillarMeta {
    	key: EsgPillarKey;
    	label: string;
    	description: string;
    	icon: TablerIcon;
    	items: { key: string; label: string }[];
    }

    export const ESG_PILLARS: Record<EsgPillarKey, EsgPillarMeta> = {
    	environmental: {
    		key: 'environmental',
    		label: 'Environmental',
    		description: 'Paperless options and responsible equipment handling',
    		icon: IconLeaf,
    		items: [
    			{ key: 'paperlessBilling', label: 'Paperless Billing Offered' },
    			{ key: 'equipmentRecycling', label: 'Equipment Return & Recycling' },
    			{ key: 'sustainableOption', label: 'Sustainable Option Mentioned' },
    		],
    	},
    	social: {
    		key: 'social',
    		label: 'Social',
    		description: 'Inclusive, accessible and fair treatment of the customer',
    		icon: IconUsersGroup,
    		items: [
    			{
    				key: 'inclusiveLanguage',
    				label: 'Inclusive & Respectful Language',
    			},
    			{ key: 'accessibility', label: 'Accessibility Accommodations' },
    			{ key: 'vulnerableCustomer', label: 'Vulnerable Customer Handling' },
    		],
    	},
    	governance: {
    		key: 'governance',
    		label: 'Governance',
    		description: 'Transparent terms, consent and escalation paths',
    		icon: IconBuildingBank,
    		items: [
    			{ key: 'transparentTerms', label: 'Transparent Pricing & Terms' },
    			{ key: 'dataConsent', label: 'Data Consent & Privacy' },
    			{ key: 'escalationPath', label: 'Complaint & Escalation Path' },
    		],
    	},
    };

    export const ESG_PILLAR_ORDER: EsgPillarKey[] = [
    	'environmental',
    	'social',
    	'governance',
    ];
    ```

    (`IconScale` is not needed — remove it from the import if unused; keep imports clean.)

  - In `mockCallEvaluationDetail`, after the `business: { … }` block (end of the object), add:
    ```ts
    	esg: {
    		overallScore: 81,
    		status: 'warning',
    		violationCount: 0,
    		warningCount: 3,
    		pillars: [
    			{
    				key: 'environmental',
    				score: 67,
    				items: [
    					{
    						key: 'paperlessBilling',
    						label: 'Paperless Billing Offered',
    						status: 'warning',
    						score: 50,
    						note: 'Digital billing was never offered while discussing the new bundle',
    					},
    					{
    						key: 'equipmentRecycling',
    						label: 'Equipment Return & Recycling',
    						status: 'compliant',
    						score: 100,
    						note: 'Old router return explained correctly',
    						evidence: {
    							timestamp: '1:32',
    							speaker: 'agent',
    							quote: 'We pick up your current router at installation so it gets recycled.',
    						},
    					},
    					{
    						key: 'sustainableOption',
    						label: 'Sustainable Option Mentioned',
    						status: 'warning',
    						score: 50,
    						note: 'Energy-saving modem option not mentioned',
    					},
    				],
    			},
    			{
    				key: 'social',
    				score: 92,
    				items: [
    					{
    						key: 'inclusiveLanguage',
    						label: 'Inclusive & Respectful Language',
    						status: 'compliant',
    						score: 100,
    					},
    					{
    						key: 'accessibility',
    						label: 'Accessibility Accommodations',
    						status: 'compliant',
    						score: 100,
    						note: 'Agent offered to send the summary in writing',
    					},
    					{
    						key: 'vulnerableCustomer',
    						label: 'Vulnerable Customer Handling',
    						status: 'compliant',
    						score: 75,
    						note: 'Budget concern acknowledged, no pressure applied',
    						evidence: {
    							timestamp: '0:50',
    							speaker: 'agent',
    							quote: "I completely understand, nobody wants a bigger bill.",
    						},
    					},
    				],
    			},
    			{
    				key: 'governance',
    				score: 83,
    				items: [
    					{
    						key: 'transparentTerms',
    						label: 'Transparent Pricing & Terms',
    						status: 'warning',
    						score: 50,
    						note: 'Regular price after the promotional period was not stated',
    						evidence: {
    							timestamp: '1:15',
    							speaker: 'agent',
    							quote: 'For the first six months it would be $49.99, and it includes the TV package.',
    						},
    					},
    					{
    						key: 'dataConsent',
    						label: 'Data Consent & Privacy',
    						status: 'compliant',
    						score: 100,
    						note: 'Recording disclosure and follow-up consent captured',
    					},
    					{
    						key: 'escalationPath',
    						label: 'Complaint & Escalation Path',
    						status: 'compliant',
    						score: 100,
    					},
    				],
    			},
    		],
    	},
    ```
    Note: overall 81 = round((67+92+83)/3); `warningCount: 3` = the three `warning` items across pillars.

- [ ] **4.3** Create `EsgPanel.tsx` by copying `CompliancePanel.tsx` and applying these changes only:
  - Props: `interface EsgPanelProps { esg: CallEsgEvaluation }`; export `EsgPanel`.
  - Imports: `ESG_PILLARS, ESG_PILLAR_ORDER` from `'../../constants'`; types `CallEsgEvaluation, ComplianceItemStatus`
    from `'../../types'`. Keep `getScoreColor`, `EvidenceQuote`, `statusMeta` (identical compliant/warning/violation
    meta). Remove the `IconShieldCheck` import (each pillar brings its own icon).
  - Header card: `RingProgress` on `esg.overallScore`; title text `ESG Score`; badges on `esg.status`,
    `esg.violationCount` violations, `esg.warningCount` warnings; helper text
    `Average of Environmental, Social and Governance pillar scores`.
  - Pillars: `ESG_PILLAR_ORDER.map((key) => { const meta = ESG_PILLARS[key]; const pillar = esg.pillars.find((p) => p.key === key)!; … })`
    rendering `<SectionCard title={meta.label} description={meta.description} icon={meta.icon} headerActions={<Badge color={getScoreColor(pillar.score)} variant='light' size='lg'>{pillar.score}%</Badge>}>` with the same
    `Progress` + items list (`pillar.items`) as the compliance panel.
- [ ] **4.4** `ConversationEvaluations.tsx`:
  - Import `type CallDetailTab` (replace `CallEvaluationTab`), `ESG_TAB` from `'../constants'`, `EsgPanel` from
    `'../components/call-evaluation/EsgPanel'`, and `type DisputeEvaluationType` from `'~/models/qa/disputeCases'`.
  - `useState<CallDetailTab>('qa')`.
  - `selectedMeta`: search in `[...CALL_EVALUATION_TABS, ESG_TAB]`.
  - `visibleTabs`:
    ```ts
    // Business Insights and ESG carry brand-level data the agent shouldn't see.
    const visibleTabs =
    	previewRole === 'agent'
    		? CALL_EVALUATION_TABS.filter((tab) => tab.key !== 'business-insights')
    		: [...CALL_EVALUATION_TABS, ESG_TAB];
    ```
  - Disputes only exist for the agent role, who never reaches the ESG tab; keep the drawer props typed:
    ```ts
    const disputeType: DisputeEvaluationType =
    	selectedTab === 'esg' ? 'qa' : selectedTab;
    ```
    and use `disputeType` in `hasOpenDispute(disputeCases, call.callId, disputeType)` and `initialType={disputeType}`.
  - `getTabBadge`: add `case 'esg': return \`${call.esg.overallScore}%\`;`.
  - Right column: add
    ```tsx
    {
    	selectedTab === 'esg' && previewRole !== 'agent' && (
    		<EsgPanel esg={call.esg} />
    	);
    }
    ```
- [ ] **4.5** `npm run typecheck` clean. If `mockCallEvaluationDetail` is spread/cloned anywhere with an explicit
      `CallEvaluationDetail` literal (grep `: CallEvaluationDetail = {`), add the same `esg` block there — verified today
      the only literal is in `constants.ts`. Commit
      `feat(qa-call-evaluation): add an ESG tab with Environmental, Social and Governance pillars`.

---

## Verification (end-to-end, after Task 4)

No dev server in this session (DESIGN_ROLE.md). Verify by:

1. `npm run typecheck` clean.
2. Read-through checklist:
   - `CustomerHeader.tsx` shows `NPS` row with `Badge` colour from `npsBand` between Churn risk and Best window.
   - `DASHBOARD_AREAS` has 6 entries ending in `esg`; `buildAreaMetrics` returns `esg` with headline `esgScore` and 4
     cards `environmental`, `social`, `governance`, `esgFlagged`; all 5 metric ids + `area.esg` + `measure.esg` exist in
     **both** `qa.dashboard.json` files.
   - `ConversationEvaluations.tsx`: 5 tab buttons for supervisor/QA Manager, 3 for agent (no Business Insights, no ESG).
   - `OpenDisputeDrawer.tsx`, `disputes/cases/*` untouched (`git diff --stat` shows no files under `src/modules/qa/disputes`).
3. If the user later runs the app: QA Manager dashboard → Performance Score → "ESG" segment shows the ESG score ring
   and 4 cards; Campaigns → Q2 Sales Performance → Conversations → play a call → "ESG" tab shows the 3 pillar cards.

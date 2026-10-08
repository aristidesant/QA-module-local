# Coaching: configurable performance groups (Excellent / Good / Needs improvement / Critical) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project override on testing:** per `CLAUDE.md` ("Do not create tests unless explicitly requested") and
> `DESIGN_ROLE.md` (stakeholder-mockup session), **no test-writing steps**. Each task's verification is
> `npm run typecheck` (must stay clean). Do not run the dev server.
>
> **When executing:** first copy this file to `docs/superpowers/plans/2026-10-08-coaching-tier-settings.md`, then
> follow tasks in order on the current branch `feature/coaching-agent-post-coaching`. One commit per task; finish
> every edit of a task before staging (husky runs `tsc` over the whole project). Commit trailer:
> `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Context

The user asked where the performance groups of the coaching scorecard (Excellent, Good, Needs improvement, Critical)
are configured. Today they are not: the cut-offs are constants in `src/modules/qa/coaching/scorecard.ts`
(`TIER_MIN_SCORE` = 90 / 80 / 70, Critical below 70) and the range labels ("90–100", "Below 70") are hardcoded in
`qa.coaching.json` under `agents.tiers.<TIER>.range`. Those groups drive the Agents tab squares and their detail
pages, the weekly batch decision (Critical and Needs improvement → 1:1), the brief of every session and the
"Time in current group" card.

The QA Manager already has a Settings page (`/qa/qa-manager/settings`) with one tab per aspect (QA, Compliance,
Sentiment, Business) where score bands are edited through a draft (`useSettingsDraft`), saved per aspect into
`useSettingsStore.thresholds`, and read by the rest of the app through `useSettingsStore.getState().thresholds`.

**Decision with the user (2026-10-08):** add a **Coaching** tab to that Settings page with the three lower cut-offs
(Excellent, Good, Needs improvement; Critical is everything below). The scorecard **weights** stay fixed. Every
consumer of the fixed cut-offs reads the store instead; the range labels become dynamic.

## Architecture (reuse-first)

- A new `coaching` slice in `ThresholdSettings` (`settings/types.ts`), defaults in `settings/constants.ts`,
  validation in `settings/helpers.ts`, saved through the existing generic `saveThresholds('coaching', …)`.
- `scorecard.ts`: `tierFor(score, cuts = liveTierCuts())` reads the store by default, the same pattern
  `aggregateDashboardMetrics(calls, thresholds = useSettingsStore.getState().thresholds)` already uses in
  `calls/agentMetrics.ts`. `TIER_MIN_SCORE` is removed (no other consumer); `TIER_META.rangeKey` is replaced by a
  `tierRangeParams()` helper plus two i18n keys with placeholders.
- UI: `settings/SettingsPage/tabs/CoachingTab.tsx` built like `BusinessTab.tsx` (draft, `BandPreview`,
  `SettingsActions`), registered in `SettingsPage.tsx`.
- Reactivity: the memos that build rows add the settings slice to their deps so a save re-tiers on the next render;
  seeded weekly-batch briefs keep the tier they were generated with (documented, no change).

## Global Constraints

- Mantine color names only; dark + light must work (the preview uses `BandPreview` fill/text pairs like the other tabs).
- Every string through i18n, **both** `src/locales/en` and `src/locales/es` (`qa.settings` and `qa.coaching`).
- `npm run typecheck` clean after every task; `noUnusedLocals` is on.
- Commit style: `feat(qa-settings): …` / `feat(qa-coaching): …`.

---

## File Structure

**New**

- `src/modules/qa/settings/SettingsPage/tabs/CoachingTab.tsx`

**Modified**

- `src/modules/qa/settings/types.ts`, `constants.ts`, `helpers.ts`, `SettingsPage/SettingsPage.tsx`
- `src/modules/qa/coaching/scorecard.ts`
- `src/modules/qa/coaching/CoachingPage/tabs/AgentsTab.tsx`, `CoachingTierPage/CoachingTierPage.tsx`
- `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx`, `coaching/agentRows.ts`,
  `coaching/components/AgentCoachingPanel.tsx` (deps only)
- `src/locales/{en,es}/qa.settings.json`, `src/locales/{en,es}/qa.coaching.json`

**Untouched:** `settingsStore.ts` (generic over `SettingsAspect`), `weeklyBatch.ts`, `postCoaching.ts`,
`ScorecardBadges.tsx`, `QuietIndicators.tsx` (they call `tierFor(score)` and keep working).

---

## Task 1 — Settings model: the `coaching` slice

**Files:** `settings/types.ts`, `settings/constants.ts`, `settings/helpers.ts`.

**Verified facts:** `SettingsAspect = 'qa' | 'compliance' | 'sentiment' | 'business'` (`types.ts:1`);
`ThresholdSettings { qa; compliance; sentiment; business }` (`types.ts:70-75`); `DEFAULT_SETTINGS.thresholds`
(`constants.ts:38-75`); `helpers.ts:18` declares `type BandedAspect = Exclude<SettingsAspect, 'sentiment' | 'qa'>`
and `bandsFor` reads `section.overrides` / `section.bands` — a `coaching` slice without those fields would break it.
`validateBands` returns i18n keys under `qa.settings` (`validation.*`).

- [ ] **1.1** `types.ts`:
  - `export type SettingsAspect = 'qa' | 'compliance' | 'sentiment' | 'business' | 'coaching';`
  - Before `ThresholdSettings` add:

    ```ts
    /** Lower bound (inclusive) of each coaching performance group on the 0-100 weekly scorecard. Critical is everything below `needsImprovement`. */
    export interface CoachingTierCuts {
    	excellent: number;
    	good: number;
    	needsImprovement: number;
    }

    export interface CoachingThresholds {
    	tierCuts: CoachingTierCuts;
    }
    ```

  - `ThresholdSettings`: add `coaching: CoachingThresholds;` after `business`.

- [ ] **1.2** `constants.ts` — in `DEFAULT_SETTINGS.thresholds`, after the `business` block:
  ```ts
  		coaching: {
  			tierCuts: { excellent: 90, good: 80, needsImprovement: 70 },
  		},
  ```
- [ ] **1.3** `helpers.ts`:
  - `type BandedAspect = 'compliance' | 'business';` (explicit, so the new slice does not widen it).
  - After `validateCutPoints` add:
    ```ts
    /** Excellent > Good > Needs improvement, all inside 0-100. Keys under `qa.settings`. */
    export const validateTierCuts = (c: CoachingTierCuts): string | null => {
    	if (!(c.excellent > c.good && c.good > c.needsImprovement))
    		return 'validation.tierCutsOrder';
    	if (c.needsImprovement < 0 || c.excellent > 100)
    		return 'validation.tierCutsRange';
    	return null;
    };
    ```
    (import `CoachingTierCuts` from `./types`).
- [ ] **1.4** `npm run typecheck` (clean: `settingsStore` is generic; nothing reads the slice yet) → commit
      `feat(qa-settings): coaching performance-group cut-offs in the threshold settings model`.

---

## Task 2 — Scorecard reads the store; dynamic range labels

**Files:** `coaching/scorecard.ts`, `AgentsTab.tsx`, `CoachingTierPage.tsx`, `CoachingPage.tsx`, `agentRows.ts`,
`AgentCoachingPanel.tsx`, both `qa.coaching.json`.

**Verified facts:** `scorecard.ts:82-89` `TIER_MIN_SCORE`, `92-120` `TIER_META` with `{ labelKey, rangeKey, color }`,
`122-129` `tierFor`. `rangeKey` is read in `AgentsTab.tsx` (lines ~129, 193, 202) and `CoachingTierPage.tsx:61`;
`labelKey`/`color` are read in several components and stay. `tierFor(score)` callers: `ScorecardBadges.tsx:77`,
`postCoaching.ts:159, 194`, `weeklyBatch.ts:67, 205` — all keep the one-argument form. `scorecard.ts` already imports
`IMPACT_THRESHOLD` from lms and `OPERATIONAL_META` from team; `calls/agentMetrics.ts` imports `useSettingsStore`
from `~/stores/qa/settingsStore` (no cycle: the store imports only `settings/constants` and `settings/types`).
Row builders: `CoachingPage.tsx:152-155` `agentRows = useMemo(() => buildAgentRows(...), [scopeProfiles, scopeAssignments, scopeSessions])`;
`agentRows.ts` `useAgentCoachingRows` memo deps `[profilesMap, triggerRules, assignments, sessions, scopeAgents, role]`;
`AgentCoachingPanel.tsx` memos `tenure` (`[profile.agent.id]`) and `summary` (`[profile, sessions, assignments]`).
i18n `agents.tiers.<TIER>.range` exists in both locales (en "90–100", "80–89", "70–79", "Below 70"; es
"90–100", "80–89", "70–79", "Menos de 70").

- [ ] **2.1** `scorecard.ts`:
  - Imports: `import { useSettingsStore } from '~/stores/qa/settingsStore';` and
    `import type { CoachingTierCuts } from '~/modules/qa/settings/types';`.
  - Replace the `TIER_MIN_SCORE` block (lines 81-89) with:
    ```ts
    /** The cut-offs the QA Manager saved in Settings → Coaching. */
    export const liveTierCuts = (): CoachingTierCuts =>
    	useSettingsStore.getState().thresholds.coaching.tierCuts;
    ```
  - `TIER_META`: drop `rangeKey` from the type and from the four entries (keep `labelKey` and `color`).
  - `tierFor`:
    ```ts
    export const tierFor = (
    	score: number,
    	cuts: CoachingTierCuts = liveTierCuts()
    ): PerformanceTier =>
    	score >= cuts.excellent
    		? 'EXCELLENT'
    		: score >= cuts.good
    			? 'GOOD'
    			: score >= cuts.needsImprovement
    				? 'NEEDS_IMPROVEMENT'
    				: 'CRITICAL';
    ```
  - After `tierFor` add:

    ```ts
    /** i18n params of a group's score range: `{ from, to }` → `agents.tiers.rangeFrom`, `{ below }` → `agents.tiers.rangeBelow`. */
    export const tierRangeParams = (
    	tier: PerformanceTier,
    	cuts: CoachingTierCuts = liveTierCuts()
    ): { from: number; to: number } | { below: number } =>
    	tier === 'EXCELLENT'
    		? { from: cuts.excellent, to: 100 }
    		: tier === 'GOOD'
    			? { from: cuts.good, to: cuts.excellent - 1 }
    			: tier === 'NEEDS_IMPROVEMENT'
    				? { from: cuts.needsImprovement, to: cuts.good - 1 }
    				: { below: cuts.needsImprovement };

    /** The translated range label of a group ("90–100", "Below 70"). */
    export const tierRangeLabel = (
    	t: (key: string, opts?: Record<string, unknown>) => string,
    	tier: PerformanceTier,
    	cuts: CoachingTierCuts = liveTierCuts()
    ): string => {
    	const p = tierRangeParams(tier, cuts);
    	return 'below' in p
    		? t('agents.tiers.rangeBelow', p)
    		: t('agents.tiers.rangeFrom', p);
    };
    ```

- [ ] **2.2** Replace every `t(TIER_META[x].rangeKey)` with `tierRangeLabel(t, x)` (import `tierRangeLabel` from
      `../../scorecard` / `../scorecard`): `AgentsTab.tsx` (three places: the square description, the StatCard subtitle
      fallback and its badge) and `CoachingTierPage.tsx` (the description). If `t` from `useTranslation` does not match
      the helper's parameter type, cast at the call site: `tierRangeLabel(t as never, tier)` is **not** acceptable —
      instead type the parameter as `TFunction` from `i18next` (`import type { TFunction } from 'i18next'`), which the
      repo already uses in `lms/helpers.ts:32` (`dueLabel(t: TFunction, …)`).
- [ ] **2.3** Reactivity — add the settings slice to the memos so a saved change re-tiers without a reload:
  - `CoachingPage.tsx`: `const tierCuts = useSettingsStore(selectThresholds).coaching.tierCuts;` (import both from
    `~/stores/qa/settingsStore`) and append `tierCuts` to the `agentRows` memo deps (the value is unused inside; add
    `// eslint-disable-next-line react-hooks/exhaustive-deps` is NOT needed — an extra dep is allowed).
  - `agentRows.ts` `useAgentCoachingRows`: same selector, append `tierCuts` to the deps.
  - `AgentCoachingPanel.tsx`: same selector, append `tierCuts` to the `tenure` and `summary` memo deps.
- [ ] **2.4** i18n `qa.coaching.json` (both): under `agents.tiers` remove the four `"range"` entries (keep each
      `"label"`) and add `"rangeFrom": "{{from}}–{{to}}"`, `"rangeBelow": "Below {{value}}"` / es `"rangeBelow": "Menos de {{value}}"`
      — note the helper passes `{ below }`, so use `{{below}}` in both: en `"rangeBelow": "Below {{below}}"`, es
      `"rangeBelow": "Menos de {{below}}"`, and `"rangeFrom": "{{from}}–{{to}}"` in both.
- [ ] **2.5** `npm run typecheck` → commit `feat(qa-coaching): performance groups read their cut-offs from Settings`.

---

## Task 3 — Settings → Coaching tab

**Files:** `settings/SettingsPage/tabs/CoachingTab.tsx` (new), `settings/SettingsPage/SettingsPage.tsx`, both
`qa.settings.json`.

**Verified facts:** `BusinessTab.tsx` is the template: `useSettingsStore(selectThresholds).business`,
`saveThresholds`, `useSettingsDraft<BusinessThresholds>(stored)` → `{ draft, setDraft, dirty, discard, fillWith }`,
`<SettingsActions dirty invalid onSave onDiscard onReset />`, `notifySuccess(t('saved'))`,
`fillWith(DEFAULT_SETTINGS.thresholds.business)`. `BandPreview` takes `segments: { key, label, size, bg, c }[]`;
`SCORE_SEGMENT_COLORS` has `critical` (red.8/white), `warning` (yellow.5/dark.9), `good` (green.8/white).
`SettingsPage.tsx` tabs: `qa`, `compliance`, `sentiment`, `business` with Tabler icons; `IconSchool` is the
coaching icon elsewhere in the app. `SectionCard` default export is used in settings (`import SectionCard from '~/components/SectionCard'`).

- [ ] **3.1** Create `CoachingTab.tsx`:

  ```tsx
  import React from 'react';
  import { useTranslation } from 'react-i18next';
  import { Group, NumberInput, Stack, Text } from '@mantine/core';
  import SectionCard from '~/components/SectionCard';
  import { notifySuccess } from '~/modules/qa/utils/notifications';
  import {
  	useSettingsStore,
  	selectThresholds,
  } from '~/stores/qa/settingsStore';
  import { DEFAULT_SETTINGS } from '../../constants';
  import { validateTierCuts } from '../../helpers';
  import { useSettingsDraft } from '../../useSettingsDraft';
  import { SettingsActions } from '../../components/SettingsActions';
  import {
  	BandPreview,
  	SCORE_SEGMENT_COLORS,
  	type BandPreviewSegment,
  } from '../../components/BandPreview';
  import type { CoachingThresholds, CoachingTierCuts } from '../../types';

  const toNumber = (value: string | number, fallback: number) =>
  	typeof value === 'number' ? value : Number(value) || fallback;

  /** Good sits between the warning and the on-target fills of the other tabs. */
  const GOOD_SEGMENT = { bg: 'blue.7', c: 'white' } as const;

  /** The three lower cut-offs of the coaching performance groups; Critical is everything below the last one. */
  export const CoachingTab: React.FC = () => {
  	const { t } = useTranslation('qa.settings');
  	const stored = useSettingsStore(selectThresholds).coaching;
  	const saveThresholds = useSettingsStore((s) => s.saveThresholds);
  	const { draft, setDraft, dirty, discard, fillWith } =
  		useSettingsDraft<CoachingThresholds>(stored);
  	const cuts = draft.tierCuts;
  	const errorKey = validateTierCuts(cuts);

  	const setCut = (key: keyof CoachingTierCuts, value: string | number) =>
  		setDraft({
  			...draft,
  			tierCuts: { ...cuts, [key]: toNumber(value, cuts[key]) },
  		});

  	const segments: BandPreviewSegment[] = [
  		{
  			key: 'critical',
  			label: t('coaching.preview.critical', { value: cuts.needsImprovement }),
  			size: cuts.needsImprovement,
  			...SCORE_SEGMENT_COLORS.critical,
  		},
  		{
  			key: 'needsImprovement',
  			label: t('coaching.preview.range', {
  				from: cuts.needsImprovement,
  				to: cuts.good - 1,
  			}),
  			size: cuts.good - cuts.needsImprovement,
  			...SCORE_SEGMENT_COLORS.warning,
  		},
  		{
  			key: 'good',
  			label: t('coaching.preview.range', {
  				from: cuts.good,
  				to: cuts.excellent - 1,
  			}),
  			size: cuts.excellent - cuts.good,
  			...GOOD_SEGMENT,
  		},
  		{
  			key: 'excellent',
  			label: t('coaching.preview.excellent', { value: cuts.excellent }),
  			size: 100 - cuts.excellent,
  			...SCORE_SEGMENT_COLORS.good,
  		},
  	];

  	return (
  		<Stack gap='lg'>
  			<SectionCard
  				title={t('coaching.groupsTitle')}
  				description={t('coaching.groupsDescription')}
  			>
  				<Stack gap='md'>
  					<Group align='flex-start' gap='md'>
  						<NumberInput
  							label={t('coaching.excellent')}
  							value={cuts.excellent}
  							onChange={(v) => setCut('excellent', v)}
  							min={0}
  							max={100}
  							w={180}
  							error={errorKey ? t(errorKey) : undefined}
  						/>
  						<NumberInput
  							label={t('coaching.good')}
  							value={cuts.good}
  							onChange={(v) => setCut('good', v)}
  							min={0}
  							max={100}
  							w={180}
  						/>
  						<NumberInput
  							label={t('coaching.needsImprovement')}
  							value={cuts.needsImprovement}
  							onChange={(v) => setCut('needsImprovement', v)}
  							min={0}
  							max={100}
  							w={180}
  						/>
  					</Group>
  					{!errorKey && <BandPreview segments={segments} />}
  					<Text size='xs' c='dimmed'>
  						{t('coaching.hint', { value: cuts.needsImprovement })}
  					</Text>
  				</Stack>
  			</SectionCard>

  			<SectionCard title={t('coaching.usedByTitle')}>
  				<Stack gap={4}>
  					<Text size='sm'>• {t('coaching.usedBy.agents')}</Text>
  					<Text size='sm'>• {t('coaching.usedBy.batch')}</Text>
  					<Text size='sm'>• {t('coaching.usedBy.tenure')}</Text>
  				</Stack>
  			</SectionCard>

  			<SettingsActions
  				dirty={dirty}
  				invalid={errorKey !== null}
  				onSave={() => {
  					saveThresholds('coaching', draft);
  					notifySuccess(t('saved'));
  				}}
  				onDiscard={discard}
  				onReset={() => fillWith(DEFAULT_SETTINGS.thresholds.coaching)}
  			/>
  		</Stack>
  	);
  };

  export default CoachingTab;
  ```

- [ ] **3.2** `SettingsPage.tsx`: import `IconSchool` and `CoachingTab`; add after the Business tab
      `<Tabs.Tab value='coaching' leftSection={<IconSchool size={16} />}>{t('page.tabs.coaching')}</Tabs.Tab>` and the
      panel `<Tabs.Panel value='coaching' pt='lg'><CoachingTab /></Tabs.Panel>`.
- [ ] **3.3** i18n `qa.settings.json`:
  - `page.tabs.coaching`: en `"Coaching"`, es `"Coaching"`.
  - New top-level `coaching` block (place it after `business`, before `validation`):
    en
    ```json
    "coaching": {
    	"groupsTitle": "Performance groups",
    	"groupsDescription": "Where the weekly coaching scorecard (0–100) splits into Excellent, Good, Needs improvement and Critical.",
    	"excellent": "Excellent from",
    	"good": "Good from",
    	"needsImprovement": "Needs improvement from",
    	"hint": "Anything below {{value}} is Critical.",
    	"preview": {
    		"critical": "Critical < {{value}}",
    		"range": "{{from}}–{{to}}",
    		"excellent": "Excellent ≥ {{value}}"
    	},
    	"usedByTitle": "Where these groups are used",
    	"usedBy": {
    		"agents": "Coaching → Agents: the group squares and their detail pages.",
    		"batch": "Weekly coaching batch: Critical and Needs improvement get a 1:1; a Good agent who declined too.",
    		"tenure": "Agent coaching profile: the time an agent has spent in their current group."
    	}
    }
    ```
    es
    ```json
    "coaching": {
    	"groupsTitle": "Grupos de desempeño",
    	"groupsDescription": "Dónde se divide el scorecard semanal de coaching (0–100) en Excelente, Bueno, Necesita mejorar y Crítico.",
    	"excellent": "Excelente desde",
    	"good": "Bueno desde",
    	"needsImprovement": "Necesita mejorar desde",
    	"hint": "Todo lo que esté por debajo de {{value}} es Crítico.",
    	"preview": {
    		"critical": "Crítico < {{value}}",
    		"range": "{{from}}–{{to}}",
    		"excellent": "Excelente ≥ {{value}}"
    	},
    	"usedByTitle": "Dónde se usan estos grupos",
    	"usedBy": {
    		"agents": "Coaching → Agentes: los cuadros por grupo y sus páginas de detalle.",
    		"batch": "Lote semanal de coaching: Crítico y Necesita mejorar reciben un 1:1; también un Bueno que empeoró.",
    		"tenure": "Perfil de coaching del agente: el tiempo que lleva en su grupo actual."
    	}
    }
    ```
  - `validation`: add en `"tierCutsOrder": "Excellent must be higher than Good, and Good higher than Needs improvement"`,
    `"tierCutsRange": "Use values between 0 and 100"`; es `"tierCutsOrder": "Excelente debe ser mayor que Bueno, y Bueno mayor que Necesita mejorar"`,
    `"tierCutsRange": "Usa valores entre 0 y 100"`.
- [ ] **3.4** `npm run typecheck` → commit `feat(qa-settings): Coaching tab to configure the performance-group cut-offs`.

---

## Verification (after Task 3)

1. `npm run typecheck` clean; `git diff --stat main` touches only the files in **File Structure** (plus `src/version.ts`).
2. Read-through:
   - `grep -rn "TIER_MIN_SCORE\|rangeKey" src` returns nothing; `grep -rn "agents.tiers.*range\"" src/locales` returns
     nothing — only `rangeFrom` / `rangeBelow` remain, in both locales.
   - `tierFor` defaults to `liveTierCuts()`; `DEFAULT_SETTINGS.thresholds.coaching.tierCuts` = 90 / 80 / 70, so every
     screen looks exactly as before until the QA Manager saves a change.
   - `SettingsAspect` includes `'coaching'`; `helpers.ts` `BandedAspect` is `'compliance' | 'business'`.
   - Both `qa.settings.json` have `page.tabs.coaching`, the `coaching` block and the two `validation.tierCuts*` keys.
3. Mock sanity (mental, no dev server): QA Manager → Settings → new **Coaching** tab shows three inputs (90 / 80 / 70),
   a four-band preview and the "where used" card; typing 85 into Good updates the preview to Critical < 70 ·
   70–84 · 85–89 · Excellent ≥ 90; Save enables; after Save, Coaching →
   Agents re-groups agents on the next render (the memos depend on the slice) and the square descriptions read the
   new ranges; the weekly batch table keeps the tiers stored in each brief when it was generated (seeded 7 Sep run).
   Supervisors cannot open Settings (QA Manager route only) — they inherit the QA Manager's cut-offs, which is the
   intended behaviour.

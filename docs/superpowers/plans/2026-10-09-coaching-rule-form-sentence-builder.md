# Coaching rule form: sentence-style When builder, tighter column, calmer sections

## Context

The "New coaching rule" page (`src/modules/qa/coaching/CoachingRulePage/CoachingRulePage.tsx` → `src/modules/qa/coaching/components/CoachingRuleForm.tsx`, routes `…/coaching/rules/new` and `…/rules/:ruleId/edit` for `qa-manager` and `supervisor`) is a 960px single column where every input stretches to the full width, including a 900px-wide "Due in (days)" number box. The **When** section reuses the Triggers `ConditionRow` (`src/modules/qa/triggers/components/ConditionRow/ConditionRow.tsx`): six labelled `size='xs'` selects in a 12-column grid whose spans add to 12.5, so the delete icon wraps onto its own line under an empty gray box, and the user has to make two decisions ("Condition: Nominal value" then "Operator: Less than") that are really one. The product designer finds it spread out, too wide and hard to reason about.

Goal (user decisions, 2026-10-09): a **sentence-style condition row** (one condition reads `[QA score ▾] [is less than ▾] [80 %] [over the last 14 days ▾]`), a **720px column with fixed-width short fields**, **Who in two columns**, **Then switches grouped**, a **sticky action footer**, and **inline validation**. Mockup-level: same `RuleCondition` model, same store, same routes. Triggers keeps its current row; the new row is shared so Triggers can adopt it later.

Mode: Operate. Refinement of the incumbent identity (SectionCard, DM Sans, green primary).

---

## Critique summary

### First impression

Five equal white cards on a gray canvas, each a stack of full-width inputs. The eye lands on the green "Add condition" bar (the only saturated element, stretched to 900px because it sits in a `Stack`) rather than on the rule logic. Nothing says "this is a rule builder": the When row looks like a filter toolbar.

### Usability

| Finding                                                                                    | Severity | Evidence                                                                                                               |
| ------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Two controls for one decision: "Condition = Nominal value" + "Operator = Less than"        | 🔴       | `ConditionRow.tsx:187-216`; mode labels in `qa.triggers.json` `modes.*` ("Nominal value", "Within a range") are jargon |
| Delete icon wraps under the row, aligned with `marginTop: 24px`                            | 🔴       | spans 2+2+2.5+1.5+1.5+2+1 = 12.5 (`ConditionRow.tsx:144-410`)                                                          |
| Any/All control appears only after a second condition, with hardcoded `ALL` / `ANY` labels | 🟡       | `CoachingRuleForm.tsx:360-372`; section copy "unless you choose Any" refers to a control that is not on screen         |
| 900px-wide number inputs (Due in, Wait between triggers, Max triggers)                     | 🟡       | `CoachingRuleForm.tsx:457-468, 506-515, 524-536`; column `maw={960}` at `CoachingRulePage.tsx:43`                      |
| Validation is a toast only; the field with the problem is not marked                       | 🟡       | `validate()` at `:233-253`, `notifyWarning` at `:301`                                                                  |
| Actions at the very bottom of a ~1,900px form                                              | 🟡       | `:590-608`; the Campaigns form already has a sticky pattern (`CampaignsForm.module.css:1-38`)                          |
| "Campaign type" label hardcoded in English                                                 | 🟢       | `:552`                                                                                                                 |
| `cadence` and `followUp` are form state with no UI                                         | 🟢       | `:67, :63`; `buildRule` forces LAST_7_DAYS when WEEKLY (`:268-275`)                                                    |

### Visual hierarchy

- **What draws the eye first**: the full-width green "Add condition" bar. Wrong: it is a secondary action.
- **Reading flow**: top to bottom, but every row has the same weight: a label, a full-width box, repeat. The condition sentence, which is the point of the page, is the smallest text on it (`size='xs'`, dimmed summary at `ConditionRow.tsx:434`).
- **Emphasis**: section titles (16px) vs. 24px page title vs. 13px labels. Fine. Inside the sections nothing leads.

### Consistency

| Element               | Issue                                                                                                                                                      | Fix                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Switch sizes          | `size='xs'` for "Show material…" (`:438`) vs. default for the other three                                                                                  | one size (`sm`)                      |
| Any/All control       | `AppSegmentedControl` with `ALL`/`ANY` in coaching, Mantine `SegmentedControl` with i18n "Match ALL conditions" in Triggers (`ConditionSection.tsx:47-59`) | connector words "and / or" from i18n |
| Add-condition default | coaching builds from the row's area (`buildCondition`), Triggers hardcodes QA 80                                                                           | keep coaching's                      |
| Max conditions        | `MAX_RULE_CONDITIONS` (coaching) duplicates `MAX_CONDITIONS` (triggers)                                                                                    | leave; out of scope                  |

### Accessibility

- Selects in the row are labelled; after the change they lose visible labels, so every control needs an `aria-label` (keys exist in `qa.triggers` `editor.fields.*`).
- Delete icon is `color='red' variant='subtle'` (`ConditionRow.tsx:416-425`): a red 16px glyph with no text. Use a gray `IconX` with tooltip and `aria-label`.
- Inline errors must be text under the field, not color only.

### What works

- One `RuleCondition` model and one `describeCondition` helper (`src/modules/qa/triggers/helpers.ts:45`) feed the row, the summary, the rules table and the store. The new row can reuse both untouched.
- The When / Then / Recurrence / Who order is the right mental model and the section copy under each title is good.
- `buildCondition(area)` keeps a new condition inside the rule's area with a sensible operator (`CoachingRuleForm.tsx:84-100`).
- Save as draft vs. Save & activate is the right pair of primary actions.

### Heuristic snapshot (Operate, 0-4)

| #   | Heuristic              | Score     | Note                                                                       |
| --- | ---------------------- | --------- | -------------------------------------------------------------------------- |
| 1   | Visibility of status   | 2         | summary line exists but is the smallest text on the page; no inline errors |
| 2   | Match real world       | 1         | "Nominal value", "Evaluation window", ALL/ANY                              |
| 3   | User control           | 3         | discard confirm, clearable selects, remove row                             |
| 4   | Consistency            | 2         | two Any/All widgets, two switch sizes, one hardcoded label                 |
| 5   | Error prevention       | 3         | min/max on numbers, metric-aware defaults                                  |
| 6   | Recognition vs recall  | 2         | mode+operator split forces the user to assemble the meaning                |
| 7   | Flexibility            | 2         | no keyboard shortcuts; fine for a form                                     |
| 8   | Aesthetic & minimalist | 2         | full-width everything, gray box-in-card, stretched button                  |
| 9   | Error recovery         | 1         | toast names the rule but not the field                                     |
| 10  | Help                   | 2         | hints on cooldown/max only                                                 |
|     | **Total**              | **20/40** | Acceptable                                                                 |

---

## Direction

1. **The condition is a sentence.** One row = one readable clause built from compact controls that wrap naturally. Area folds into a grouped metric list, mode + operator + direction fold into one "comparison" list, "N consecutive calls" becomes a window choice. The old `ConditionRow` stays for Triggers.
2. **Width follows content.** 720px column. Short fields get a fixed width. Long fields (selects, description) keep the column.
3. **Fewer, calmer containers.** No gray box per row. Rows are separated by the connector word ("and" / "or"). The "Add condition" button is a normal left-aligned button.
4. **Say what the rule does.** One preview line per section-end for When ("Fires when QA score < 80% over the last 14 days and …"), built from `describeCondition`.
5. **Tell the user where the problem is.** Inline field errors plus one generic toast.

---

## Implementation plan

Execute in order. Typecheck after each phase (`npm run typecheck`).

### Phase 1 — New shared `ConditionSentenceRow`

**1a. i18n, `src/locales/en/qa.triggers.json`** (add three top-level objects next to `modes` / `windows`; mirror in `src/locales/es/qa.triggers.json`):

en:

```json
"comparisons": {
	"LT": "is less than",
	"LTE": "is at most",
	"GT": "is greater than",
	"GTE": "is at least",
	"BETWEEN": "is between",
	"DECREASE": "drops by at least",
	"INCREASE": "rises by at least"
},
"sentenceWindows": {
	"PER_CALL": "on each call",
	"LAST_N_CALLS": "over the last N calls",
	"LAST_7_DAYS": "over the last 7 days",
	"LAST_14_DAYS": "over the last 14 days",
	"LAST_30_DAYS": "over the last 30 days",
	"CONSECUTIVE": "for N consecutive calls"
},
"sentence": {
	"and": "and",
	"for": "for",
	"calls": "calls",
	"comparison": "Comparison",
	"window": "Window"
}
```

es:

```json
"comparisons": {
	"LT": "es menor que",
	"LTE": "es como máximo",
	"GT": "es mayor que",
	"GTE": "es al menos",
	"BETWEEN": "está entre",
	"DECREASE": "baja al menos",
	"INCREASE": "sube al menos"
},
"sentenceWindows": {
	"PER_CALL": "en cada llamada",
	"LAST_N_CALLS": "en las últimas N llamadas",
	"LAST_7_DAYS": "en los últimos 7 días",
	"LAST_14_DAYS": "en los últimos 14 días",
	"LAST_30_DAYS": "en los últimos 30 días",
	"CONSECUTIVE": "en N llamadas consecutivas"
},
"sentence": {
	"and": "y",
	"for": "para",
	"calls": "llamadas",
	"comparison": "Comparación",
	"window": "Ventana"
}
```

**1b. `src/modules/qa/triggers/components/ConditionSentenceRow/ConditionSentenceRow.module.css`**

```css
/* One condition as a wrapping sentence of compact controls. No box: rows are
 * separated by the connector word the form renders between them. */
.row {
	padding: 2px 0;
}

.word {
	color: var(--mantine-color-dimmed);
	font-size: var(--mantine-font-size-sm);
	white-space: nowrap;
}
```

**1c. `src/modules/qa/triggers/components/ConditionSentenceRow/ConditionSentenceRow.tsx`** — paste-ready:

```tsx
import {
	ActionIcon,
	Group,
	NumberInput,
	Select,
	Tooltip,
	type ComboboxData,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	ComparisonOperator,
	EvaluationArea,
	EvaluationWindow,
	RuleCondition,
	TriggerMetricId,
} from '~/models/qa';
import {
	COMPLIANCE_SUB_ITEMS,
	EMOTION_SUB_ITEMS,
	EVALUATION_AREAS,
	METRIC_BY_ID,
	TRIGGER_METRIC_CATALOG,
	WINDOWS,
} from '~/modules/qa/triggers/constants';
import classes from './ConditionSentenceRow.module.css';

/** One list merges mode, operator and direction: one decision instead of two. */
export type Comparison =
	| ComparisonOperator
	| 'BETWEEN'
	| 'DECREASE'
	| 'INCREASE';
const COMPARISONS: Comparison[] = [
	'LT',
	'LTE',
	'GT',
	'GTE',
	'BETWEEN',
	'DECREASE',
	'INCREASE',
];

/** "N consecutive calls" is offered as a window; it maps to mode CONSECUTIVE. */
type WindowChoice = EvaluationWindow | 'CONSECUTIVE';
const WINDOW_CHOICES: WindowChoice[] = [...WINDOWS, 'CONSECUTIVE'];
const FALLBACK_WINDOW: EvaluationWindow = 'LAST_14_DAYS';

const isOperator = (c: Comparison): c is ComparisonOperator =>
	c === 'LT' || c === 'LTE' || c === 'GT' || c === 'GTE';

export const toComparison = (c: RuleCondition): Comparison =>
	c.mode === 'RANGE'
		? 'BETWEEN'
		: c.mode === 'PERCENT_CHANGE'
			? c.changeDirection
			: c.operator;

export const toWindowChoice = (c: RuleCondition): WindowChoice =>
	c.mode === 'CONSECUTIVE' ? 'CONSECUTIVE' : c.window;

export const applyComparison = (
	c: RuleCondition,
	next: Comparison
): RuleCondition => {
	// Only a plain operator can run over consecutive calls.
	const window = c.mode === 'CONSECUTIVE' ? FALLBACK_WINDOW : c.window;
	if (next === 'BETWEEN') {
		return {
			...c,
			mode: 'RANGE',
			window,
			value2: c.value2 ?? METRIC_BY_ID[c.metricId].max,
		};
	}
	if (next === 'DECREASE' || next === 'INCREASE') {
		return { ...c, mode: 'PERCENT_CHANGE', window, changeDirection: next };
	}
	return {
		...c,
		mode: c.mode === 'CONSECUTIVE' ? 'CONSECUTIVE' : 'THRESHOLD',
		operator: next,
	};
};

export const applyWindow = (
	c: RuleCondition,
	next: WindowChoice
): RuleCondition =>
	next === 'CONSECUTIVE'
		? { ...c, mode: 'CONSECUTIVE', window: 'LAST_N_CALLS' }
		: {
				...c,
				mode: c.mode === 'CONSECUTIVE' ? 'THRESHOLD' : c.mode,
				window: next,
			};

const num = (v: string | number, fallback: number) =>
	typeof v === 'number' ? v : Number(v) || fallback;

/** Dropdowns grow to their longest option and never clear on re-click. */
const SELECT_PROPS = {
	size: 'sm',
	allowDeselect: false,
	comboboxProps: { width: 'max-content', position: 'bottom-start' },
} as const;

interface ConditionSentenceRowProps {
	condition: RuleCondition;
	/** Areas measured on a 0-5 scale: their percentage and count metrics are not offered. */
	scoreOnlyAreas?: EvaluationArea[];
	onChange: (updated: RuleCondition) => void;
	onRemove: () => void;
	canRemove: boolean;
}

/**
 * One rule condition rendered as a sentence of compact controls:
 * [metric] [for sub-item] [comparison] [value(s)] [window] [N].
 * Reads and writes the shared RuleCondition model, so describeCondition and
 * the stores keep working unchanged.
 */
export function ConditionSentenceRow({
	condition,
	scoreOnlyAreas,
	onChange,
	onRemove,
	canRemove,
}: ConditionSentenceRowProps) {
	const { t } = useTranslation('qa.triggers');
	const metric = METRIC_BY_ID[condition.metricId];
	const comparison = toComparison(condition);
	const windowChoice = toWindowChoice(condition);
	const operatorOnly = isOperator(comparison);

	// Metrics grouped by area. A metric already picked stays listed so editing an older rule never loses it.
	const metricData: ComboboxData = EVALUATION_AREAS.map((area) => ({
		group: t(`areas.${area}`),
		items: TRIGGER_METRIC_CATALOG.filter(
			(m) =>
				m.area === area &&
				(m.id === condition.metricId ||
					!scoreOnlyAreas?.includes(m.area) ||
					m.unit === 'SCORE_5')
		).map((m) => ({ value: m.id, label: t(`metrics.${m.id}`) })),
	})).filter((g) => g.items.length > 0);

	const subItemGroup = metric.subItemGroup;
	const subItems =
		subItemGroup === 'COMPLIANCE_ITEMS'
			? COMPLIANCE_SUB_ITEMS
			: subItemGroup === 'EMOTIONS'
				? EMOTION_SUB_ITEMS
				: [];
	const subItemData: ComboboxData = [
		{ value: '', label: t('subItems.any') },
		...subItems.map((si) => ({ value: si, label: t(`subItems.${si}`) })),
	];

	const comparisonData = COMPARISONS.map((c) => ({
		value: c,
		label: t(`comparisons.${c}`),
	}));

	const windowData = WINDOW_CHOICES.filter(
		(w) => w !== 'CONSECUTIVE' || operatorOnly
	).map((w) => ({ value: w, label: t(`sentenceWindows.${w}`) }));

	const handleMetricChange = (metricId: string) => {
		const m = METRIC_BY_ID[metricId as TriggerMetricId];
		onChange({
			...condition,
			metricId: metricId as TriggerMetricId,
			subItem: null,
			value: m.defaultThreshold,
		});
	};

	const valueInput = (
		field: 'value' | 'value2',
		label: string,
		fallback: number
	) => (
		<NumberInput
			size='sm'
			w={104}
			aria-label={label}
			value={
				field === 'value2' ? (condition.value2 ?? metric.max) : condition.value
			}
			onChange={(v) => onChange({ ...condition, [field]: num(v, fallback) })}
			min={metric.min}
			max={metric.max}
			step={metric.step}
			suffix={metric.unit === 'PERCENT' ? ' %' : undefined}
			decimalScale={metric.unit === 'SCORE_5' ? 1 : undefined}
		/>
	);

	return (
		<Group gap='xs' align='center' wrap='wrap' className={classes.row}>
			<Select
				{...SELECT_PROPS}
				w={220}
				aria-label={t('editor.fields.metric')}
				data={metricData}
				value={condition.metricId}
				onChange={(v) => v && handleMetricChange(v)}
				searchable
			/>

			{subItemGroup && (
				<>
					<span className={classes.word}>{t('sentence.for')}</span>
					<Select
						{...SELECT_PROPS}
						w={170}
						aria-label={t('editor.fields.subItem')}
						data={subItemData}
						value={condition.subItem ?? ''}
						onChange={(v) => onChange({ ...condition, subItem: v ? v : null })}
						searchable
					/>
				</>
			)}

			<Select
				{...SELECT_PROPS}
				w={170}
				aria-label={t('sentence.comparison')}
				data={comparisonData}
				value={comparison}
				onChange={(v) =>
					v && onChange(applyComparison(condition, v as Comparison))
				}
			/>

			{comparison === 'BETWEEN' ? (
				<>
					{valueInput('value', t('editor.fields.from'), metric.min)}
					<span className={classes.word}>{t('sentence.and')}</span>
					{valueInput('value2', t('editor.fields.to'), metric.max)}
				</>
			) : comparison === 'DECREASE' || comparison === 'INCREASE' ? (
				<NumberInput
					size='sm'
					w={96}
					aria-label={t('editor.fields.percent')}
					value={condition.changePercent}
					onChange={(v) =>
						onChange({ ...condition, changePercent: num(v, 10) })
					}
					min={1}
					max={100}
					step={1}
					suffix=' %'
				/>
			) : (
				valueInput('value', t('editor.fields.value'), metric.defaultThreshold)
			)}

			<Select
				{...SELECT_PROPS}
				w={200}
				aria-label={t('sentence.window')}
				data={windowData}
				value={windowChoice}
				onChange={(v) =>
					v && onChange(applyWindow(condition, v as WindowChoice))
				}
			/>

			{windowChoice === 'LAST_N_CALLS' && (
				<NumberInput
					size='sm'
					w={72}
					aria-label={t('editor.fields.windowSize')}
					value={condition.windowSize}
					onChange={(v) => onChange({ ...condition, windowSize: num(v, 10) })}
					min={5}
					max={50}
					step={1}
				/>
			)}
			{windowChoice === 'CONSECUTIVE' && (
				<NumberInput
					size='sm'
					w={72}
					aria-label={t('editor.fields.consecutiveCount')}
					value={condition.consecutiveCount}
					onChange={(v) =>
						onChange({ ...condition, consecutiveCount: num(v, 3) })
					}
					min={2}
					max={20}
					step={1}
				/>
			)}

			<Tooltip label={t('editor.fields.removeCondition')} disabled={!canRemove}>
				<ActionIcon
					variant='subtle'
					color='gray'
					size='sm'
					onClick={onRemove}
					disabled={!canRemove}
					aria-label={t('editor.fields.removeCondition')}
				>
					<IconX size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}

export default ConditionSentenceRow;
```

**1d. `src/modules/qa/triggers/components/ConditionSentenceRow/index.ts`**: `export { ConditionSentenceRow } from './ConditionSentenceRow';` (same style as `../ConditionRow/index.ts`).

Notes for the executor:

- Grouped `Select` data is `[{ group, items }]` (`ComboboxData`, verified in `node_modules/@mantine/core/lib/components/Combobox/Combobox.types.d.ts`). `allowDeselect` exists on `Select` (`Select.d.ts:32`).
- `NumberInput` `onChange` receives `string | number`; `num()` normalises it.
- The `subItem` select's "Any" option has `value: ''`; Mantine `Select` accepts an empty-string value.
- `ActionIcon` default variant in this app is `light` with a fixed 38px size (`theme.ts` `ActionIcon.styles`); pass `variant='subtle'` and `size='sm'` explicitly as above. If the 38px theme override still applies, add `style={{ width: 28, height: 28 }}`.
- Do not touch `ConditionRow`, `describeCondition`, `RuleCondition` or the stores.

### Phase 2 — When section in `CoachingRuleForm.tsx`

**2a. i18n, `src/locales/en/qa.coaching.json`** under `rules.editor` (mirror in es):

- `sections.conditionDescription` → en "Pick what to measure and when it should count. Add more conditions to combine them." / es "Elige qué medir y cuándo debe contar. Añade más condiciones para combinarlas."
- add `"logicWord": { "ALL": "and", "ANY": "or" }` / es `{ "ALL": "y", "ANY": "o" }`
- add `"preview": "Fires when {{summary}}"` / es `"Se activa cuando {{summary}}"`
- add `"fields.options": "Options"` / es `"Opciones"`
- add `"scope.campaignType": "Campaign type"` / es `"Tipo de campaña"`
- add `"validation.fixFields": "Fix the highlighted fields"` / es `"Corrige los campos marcados"`
- remove the unused `fields.logic` and `fields.area` keys (both files).

**2b. Imports** (`CoachingRuleForm.tsx:1-53`): replace `ConditionRow` import with `import { ConditionSentenceRow } from '~/modules/qa/triggers/components/ConditionSentenceRow';`; add `import { describeCondition } from '~/modules/qa/triggers/helpers';`; add `Box, SimpleGrid, Text` to the Mantine import; add `import styles from './CoachingRuleForm.module.css';` (Phase 5). Add a second translation hook: `const { t: tTriggers } = useTranslation('qa.triggers');` (describeCondition expects a `qa.triggers`-scoped `t`).

**2c. Replace the When section body** (`:359-400`) with:

```tsx
<Stack gap='sm'>
	{form.values.conditions.map((condition, index) => (
		<Stack gap='sm' key={condition.id}>
			{index === 1 && (
				<Group gap='xs' align='center'>
					<AppSegmentedControl
						size='xs'
						value={form.values.conditionLogic}
						onChange={(v) =>
							form.setFieldValue('conditionLogic', v as ConditionLogic)
						}
						data={[
							{ label: t('rules.editor.logicWord.ALL'), value: 'ALL' },
							{ label: t('rules.editor.logicWord.ANY'), value: 'ANY' },
						]}
					/>
				</Group>
			)}
			{index > 1 && (
				<Text size='sm' c='dimmed'>
					{t(`rules.editor.logicWord.${form.values.conditionLogic}`)}
				</Text>
			)}
			<ConditionSentenceRow
				condition={condition}
				scoreOnlyAreas={['SENTIMENT_EMOTION']}
				onChange={(updated) =>
					form.setFieldValue(`conditions.${index}`, updated)
				}
				onRemove={() => form.removeListItem('conditions', index)}
				canRemove={form.values.conditions.length > 1}
			/>
		</Stack>
	))}

	<Group>
		<Button
			variant='light'
			size='sm'
			leftSection={<IconPlus size={14} />}
			onClick={addCondition}
			disabled={form.values.conditions.length >= MAX_RULE_CONDITIONS}
		>
			{t('rules.editor.fields.addCondition')}
		</Button>
	</Group>

	<Text size='sm' c='dimmed'>
		{t('rules.editor.preview', {
			summary: form.values.conditions
				.map((c) => describeCondition(tTriggers, c))
				.join(` ${t(`rules.editor.logicWord.${form.values.conditionLogic}`)} `),
		})}
	</Text>
	{form.values.conditions.some(
		(c) => METRIC_BY_ID[c.metricId].unit === 'SCORE_5'
	) && (
		<Text size='xs' c='dimmed'>
			{tTriggers('editor.fields.scoreScaleHint')}
		</Text>
	)}
</Stack>
```

The `allowedModes` prop disappears: the sentence row always offers every comparison (coaching allowed all four modes anyway).

### Phase 3 — Width and short fields

- `CoachingRulePage.tsx:43`: `maw={960}` → `maw={720}`.
- Basics `TextInput` (`:337`): add `maw={480}`.
- Then: wrap Material/Path and Due in one row:
  ```tsx
  <Group align='flex-start' gap='md' wrap='nowrap'>
  	<Box flex={1} miw={0}>{/* MultiSelect or Select as today */}</Box>
  	<NumberInput w={140} label=… /* Due in, as today */ />
  </Group>
  ```
  Keep the "Show material from every aspect" `Switch` directly under the row, `size='sm'`.
- Recurrence: `NumberInput` cooldown (`:506`) `w={160}`; when `limitEnabled`, the max-triggers `NumberInput` (`:524`) `w={160}`. Keep the Stack; the inputs no longer stretch.
- Who: replace the `Stack gap='sm'` (`:542`) with `<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>`; the four `MultiSelect`s unchanged except `label={t('rules.editor.scope.campaignType')}` at `:552`.

### Phase 4 — Then: group the switches

Replace the three standalone `Switch`es (`:470-496`) with:

```tsx
<Stack gap='xs'>
	<Text size='sm' fw={500}>{t('rules.editor.fields.options')}</Text>
	<Switch size='sm' label=… checked=… onChange=… />  {/* mandatory */}
	<Switch size='sm' … />                                {/* requireAcceptance */}
	<Switch size='sm' … />                                {/* notifySupervisor */}
</Stack>
```

Same props as today; only the wrapper, the heading and `size='sm'` change.

### Phase 5 — Sticky action footer

New `src/modules/qa/coaching/components/CoachingRuleForm.module.css`, copied from the Campaigns pattern (`src/modules/campaigns/CampaignsForm/CampaignsForm.module.css:1-38`):

```css
/* Keeps Cancel / Save in view while the long form scrolls. Same recipe as CampaignsForm. */
.stickyActions {
	position: sticky;
	bottom: var(--mantine-spacing-xs);
	margin-top: var(--mantine-spacing-md);
	padding: var(--mantine-spacing-sm) var(--mantine-spacing-md);
	background: var(--surface-card);
	border: 1px solid var(--surface-border);
	border-radius: var(--mantine-radius-lg);
	box-shadow: var(--mantine-shadow-sm);
	z-index: 10;
}

@media (max-width: 48em) {
	.stickyActions {
		bottom: 0;
		padding: var(--mantine-spacing-sm);
	}
}
```

Replace `<Group justify='flex-end'>` (`:590`) with `<Box className={styles.stickyActions}><Group justify='flex-end' gap='xs'>…</Group></Box>`. Buttons unchanged. (`--surface-card` / `--surface-border` are defined per color scheme in `src/styles/global.css`, so dark mode is covered.)

### Phase 6 — Inline validation

Replace `validate()` (`:233-253`) with one that marks fields and returns a boolean:

```ts
const validate = (): boolean => {
	form.clearErrors();
	const errors: Record<string, string> = {};
	if (!form.values.name.trim()) errors.name = t('rules.editor.validation.name');
	if (form.values.conditions.length === 0)
		errors.conditions = t('rules.editor.validation.condition');
	if (
		form.values.action.kind === 'ASSIGN_CONTENT' &&
		form.values.action.contentIds.length === 0
	)
		errors['action.contentIds'] = t('rules.editor.validation.content');
	if (form.values.action.kind === 'ASSIGN_PATH' && !form.values.action.pathId)
		errors['action.pathId'] = t('rules.editor.validation.path');
	if (form.values.action.dueInDays < 1 || form.values.action.dueInDays > 90)
		errors['action.dueInDays'] = t('rules.editor.validation.due');
	form.setErrors(errors);
	return Object.keys(errors).length === 0;
};
```

`handleSave`: `if (!validate()) { notifyWarning(t('rules.editor.validation.fixFields')); return; }`.
Pass `error={form.errors.name}` to the Name input, `error={form.errors['action.contentIds']}` to the Material `MultiSelect`, `error={form.errors['action.pathId']}` to the path `Select`, `error={form.errors['action.dueInDays']}` to Due in. In each of those `onChange` handlers add `form.clearFieldError(<path>)` so the message disappears as the user fixes it. (`setErrors`, `clearErrors`, `clearFieldError`, `errors` are all on Mantine `UseFormReturnType`.)

---

## Files touched

- New: `src/modules/qa/triggers/components/ConditionSentenceRow/{ConditionSentenceRow.tsx, ConditionSentenceRow.module.css, index.ts}`
- New: `src/modules/qa/coaching/components/CoachingRuleForm.module.css`
- `src/modules/qa/coaching/components/CoachingRuleForm.tsx` (Phases 2-6)
- `src/modules/qa/coaching/CoachingRulePage/CoachingRulePage.tsx` (one prop)
- `src/locales/{en,es}/qa.triggers.json`, `src/locales/{en,es}/qa.coaching.json`

Do not touch: `ConditionRow`, `ConditionSection`, `RuleEditorDrawer`, `describeCondition`, `RuleCondition`, `coachingStore`, `SectionCard`, `AppSegmentedControl`.

## Out of scope (noted)

- `cadence` and `followUp` live in form state without UI; `buildRule` silently rewrites windows for WEEKLY. Decide later whether to expose or drop.
- Triggers adopting `ConditionSentenceRow` (its `allowedModes` per rule type would need a `comparisons` filter prop).
- `MAX_RULE_CONDITIONS` duplicating `MAX_CONDITIONS`.

## Verification

Per DESIGN_ROLE.md the dev server is started only if asked.

1. `npm run typecheck` passes.
2. `/qa/supervisor/coaching/rules/new` at 1280px: the column is 720px; the first condition reads as one line `[QA score] [is less than] [80 %] [over the last 14 days] ×`; "Add condition" is a normal-width button; the preview line below says "Fires when QA score < 80% · Last 14 days".
3. Add a second condition: an `and | or` toggle appears between rows; switching it changes the preview's connector word. Add a third: a static "and"/"or" appears before it.
4. Change comparison to "is between": two value inputs with "and" between; the window list no longer offers "for N consecutive calls". Change window to "for N consecutive calls" on an operator comparison: a count input appears and the preview reads "3 consecutive calls with QA score < 80%".
5. Pick a Compliance metric with sub-items: a "for [Any item]" select appears after the metric.
6. Then: Material and Due in share one row; the three switches sit under "Options". Who: two columns. Footer stays visible while scrolling, in light and dark mode.
7. Click "Save & activate" with an empty name and no material: Name and Material show inline errors, one toast says "Fix the highlighted fields"; typing in Name clears its error.
8. Resize to 600px: the sentence wraps onto two or three lines without horizontal scroll; Who collapses to one column; the footer spans the width.

---

## Implementation notes (deviations from the plan above)

- The remove control is a plain gray `IconX` with `aria-label` and `title`; the `Tooltip` wrapper was dropped (a tooltip around a disabled button needs a wrapper element and added nothing).
- Changing the metric also resets the operator to the metric's natural direction (`higherIsBetter ? LT : GT`) and re-seeds `value2` to the new max when the row is a range, so the sentence never keeps a stale comparison.
- `validate()` also rejects a range whose upper bound is not above its lower bound and shows the Triggers `rangeInvalid` message under the conditions.
- Locale keys: `comparisons`, `sentenceWindows` and `sentence` live in `qa.triggers`; `logicWord`, `preview`, `fields.options`, `scope.campaignType`, `validation.fixFields` in `qa.coaching`. The unused `fields.logic` and `fields.area` keys were removed from `qa.coaching`.

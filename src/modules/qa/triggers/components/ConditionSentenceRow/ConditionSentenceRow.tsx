import {
	ActionIcon,
	Group,
	NumberInput,
	Select,
	type ComboboxItem,
	type ComboboxItemGroup,
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

/** NumberInput emits '' or a partial string while typing; keep the model numeric. */
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
	const metricData: ComboboxItemGroup<ComboboxItem>[] = EVALUATION_AREAS.map(
		(area) => ({
			group: t(`areas.${area}`),
			items: TRIGGER_METRIC_CATALOG.filter(
				(m) =>
					m.area === area &&
					(m.id === condition.metricId ||
						!scoreOnlyAreas?.includes(m.area) ||
						m.unit === 'SCORE_5')
			).map((m) => ({ value: m.id, label: t(`metrics.${m.id}`) })),
		})
	).filter((group) => group.items.length > 0);

	const subItemGroup = metric.subItemGroup;
	const subItems =
		subItemGroup === 'COMPLIANCE_ITEMS'
			? COMPLIANCE_SUB_ITEMS
			: subItemGroup === 'EMOTIONS'
				? EMOTION_SUB_ITEMS
				: [];
	const subItemData: ComboboxItem[] = [
		{ value: '', label: t('subItems.any') },
		...subItems.map((si) => ({ value: si, label: t(`subItems.${si}`) })),
	];

	const comparisonData: ComboboxItem[] = COMPARISONS.map((c) => ({
		value: c,
		label: t(`comparisons.${c}`),
	}));

	const windowData: ComboboxItem[] = WINDOW_CHOICES.filter(
		(w) => w !== 'CONSECUTIVE' || operatorOnly
	).map((w) => ({ value: w, label: t(`sentenceWindows.${w}`) }));

	const handleMetricChange = (metricId: string) => {
		const next = METRIC_BY_ID[metricId as TriggerMetricId];
		onChange({
			...condition,
			metricId: metricId as TriggerMetricId,
			subItem: null,
			operator: next.higherIsBetter ? 'LT' : 'GT',
			value: next.defaultThreshold,
			value2: condition.mode === 'RANGE' ? next.max : null,
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

			<ActionIcon
				variant='subtle'
				color='gray'
				size='sm'
				onClick={onRemove}
				disabled={!canRemove}
				aria-label={t('editor.fields.removeCondition')}
				title={t('editor.fields.removeCondition')}
			>
				<IconX size={16} />
			</ActionIcon>
		</Group>
	);
}

export default ConditionSentenceRow;

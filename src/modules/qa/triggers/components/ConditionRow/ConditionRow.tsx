import { ActionIcon, Grid, NumberInput, Select, Stack, Text, Tooltip, type SelectProps } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { ConditionMode, RuleCondition, TriggerMetricId } from '~/models/qa';
import {
	COMPLIANCE_SUB_ITEMS, EMOTION_SUB_ITEMS, EVALUATION_AREAS, METRIC_BY_ID,
	OPERATORS, TRIGGER_METRIC_CATALOG, WINDOWS,
} from '~/modules/qa/triggers/constants';
import { describeCondition } from '~/modules/qa/triggers/helpers';
import classes from './ConditionRow.module.css';

interface ConditionRowProps {
	index?: number;
	condition: RuleCondition;
	allowedModes: ConditionMode[];
	onChange: (updated: RuleCondition) => void;
	onRemove: () => void;
	canRemove: boolean;
	error?: string;
}

export function ConditionRow({ condition, allowedModes, onChange, onRemove, canRemove, error }: ConditionRowProps) {
	const { t } = useTranslation('qa.triggers');
	const metric = METRIC_BY_ID[condition.metricId];

	const areaOptions = EVALUATION_AREAS.map((area) => ({
		label: t(`areas.${area}`),
		value: area,
	}));

	const areaMetrics = TRIGGER_METRIC_CATALOG.filter((m) => m.area === metric.area);
	const metricOptions = areaMetrics.map((m) => ({
		label: t(`metrics.${m.id}`),
		value: m.id,
	}));

	const subItemGroup = metric.subItemGroup;
	const subItemOptions: SelectProps['data'] = [
		{ label: t('subItems.any'), value: '' },
		...(subItemGroup === 'COMPLIANCE_ITEMS'
			? COMPLIANCE_SUB_ITEMS.map((si) => ({ label: t(`subItems.${si}`), value: si }))
			: subItemGroup === 'EMOTIONS'
				? EMOTION_SUB_ITEMS.map((si) => ({ label: t(`subItems.${si}`), value: si }))
				: []),
	];

	const handleAreaChange = (area: string) => {
		const firstMetric = TRIGGER_METRIC_CATALOG.find((m) => m.area === area);
		if (firstMetric) {
			onChange({
				...condition,
				metricId: firstMetric.id as TriggerMetricId,
				subItem: null,
				value: firstMetric.defaultThreshold,
			});
		}
	};

	const handleMetricChange = (metricId: string) => {
		const m = METRIC_BY_ID[metricId as TriggerMetricId];
		onChange({
			...condition,
			metricId: metricId as TriggerMetricId,
			subItem: null,
			value: m.defaultThreshold,
		});
	};

	const modeOptions = allowedModes.map((m) => ({
		label: t(`modes.${m}`),
		value: m,
	}));

	const operatorOptions = OPERATORS.map((op) => ({
		label: t(`operators.${op}`),
		value: op,
	}));

	const directionOptions = [
		{ label: t(`directions.DECREASE`), value: 'DECREASE' },
		{ label: t(`directions.INCREASE`), value: 'INCREASE' },
	];

	const windowOptions = WINDOWS.filter((w) => condition.mode !== 'CONSECUTIVE' || w === 'LAST_N_CALLS').map((w) => ({
		label: w === 'LAST_N_CALLS' ? t('windows.LAST_N_CALLS') : t(`windows.${w}`),
		value: w,
	}));

	return (
		<Stack gap={0}>
			<div className={classes.row}>
				<Grid>
					{/* Area */}
					<Grid.Col span={{ base: 12, md: 2 }}>
						<Select
							size='xs'
							label={t('editor.fields.area')}
							data={areaOptions}
							value={metric.area}
							onChange={(v) => v && handleAreaChange(v)}
							searchable
						/>
					</Grid.Col>

					{/* Metric */}
					<Grid.Col span={{ base: 12, md: 2 }}>
						<Select
							size='xs'
							label={t('editor.fields.metric')}
							data={metricOptions}
							value={condition.metricId}
							onChange={(v) => v && handleMetricChange(v)}
							searchable
						/>
					</Grid.Col>

					{/* Sub-item */}
					{subItemGroup && (
						<Grid.Col span={{ base: 12, md: 2 }}>
							<Select
								size='xs'
								label={t('editor.fields.subItem')}
								data={subItemOptions}
								value={condition.subItem ?? ''}
								onChange={(v) => onChange({ ...condition, subItem: v === '' ? null : v })}
								searchable
							/>
						</Grid.Col>
					)}

					{/* Mode */}
					<Grid.Col span={{ base: 12, md: subItemGroup ? 2 : 2.5 }}>
						<Select
							size='xs'
							label={t('editor.fields.mode')}
							data={modeOptions}
							value={condition.mode}
							onChange={(v) => {
								if (v && v !== condition.mode) {
									onChange({ ...condition, mode: v as ConditionMode });
								}
							}}
						/>
					</Grid.Col>

					{/* Mode-specific inputs */}
					{condition.mode === 'THRESHOLD' && (
						<>
							<Grid.Col span={{ base: 6, md: 1.5 }}>
								<Select
									size='xs'
									label={t('editor.fields.operator')}
									data={operatorOptions}
									value={condition.operator}
									onChange={(v) => v && onChange({ ...condition, operator: v as any })}
								/>
							</Grid.Col>
							<Grid.Col span={{ base: 6, md: 1.5 }}>
								<NumberInput
									size='xs'
									label={t('editor.fields.value')}
									value={condition.value}
									onChange={(v) => onChange({ ...condition, value: typeof v === 'number' ? v : (Number(v) || 0) })}
									min={metric.min}
									max={metric.max}
									step={metric.step}
									suffix={metric.unit === 'PERCENT' ? ' %' : undefined}
									decimalScale={metric.unit === 'SCORE_5' ? 1 : undefined}
								/>
							</Grid.Col>
						</>
					)}

					{condition.mode === 'RANGE' && (
						<>
							<Grid.Col span={{ base: 6, md: 1.5 }}>
								<NumberInput
									size='xs'
									label={t('editor.fields.from')}
									value={condition.value}
									onChange={(v) => onChange({ ...condition, value: typeof v === 'number' ? v : (Number(v) || 0) })}
									min={metric.min}
									max={metric.max}
									step={metric.step}
									suffix={metric.unit === 'PERCENT' ? ' %' : undefined}
									decimalScale={metric.unit === 'SCORE_5' ? 1 : undefined}
								/>
							</Grid.Col>
							<Grid.Col span={{ base: 6, md: 1.5 }}>
								<NumberInput
									size='xs'
									label={t('editor.fields.to')}
									value={condition.value2 ?? metric.max}
									onChange={(v) => onChange({ ...condition, value2: typeof v === 'number' ? v : (v ? Number(v) : metric.max) })}
									min={metric.min}
									max={metric.max}
									step={metric.step}
									suffix={metric.unit === 'PERCENT' ? ' %' : undefined}
									decimalScale={metric.unit === 'SCORE_5' ? 1 : undefined}
									error={error === 'rangeInvalid' ? t('editor.validation.rangeInvalid') : undefined}
								/>
							</Grid.Col>
						</>
					)}

					{condition.mode === 'PERCENT_CHANGE' && (
						<>
							<Grid.Col span={{ base: 6, md: 1.5 }}>
								<Select
									size='xs'
									label={t('editor.fields.direction')}
									data={directionOptions}
									value={condition.changeDirection}
									onChange={(v) => v && onChange({ ...condition, changeDirection: v as any })}
								/>
							</Grid.Col>
							<Grid.Col span={{ base: 6, md: 1.5 }}>
								<NumberInput
									size='xs'
									label={t('editor.fields.percent')}
									value={condition.changePercent}
									onChange={(v) => onChange({ ...condition, changePercent: typeof v === 'number' ? v : (Number(v) || 10) })}
									min={1}
									max={100}
									step={1}
									suffix=' %'
								/>
							</Grid.Col>
						</>
					)}

					{condition.mode === 'CONSECUTIVE' && (
						<>
							<Grid.Col span={{ base: 4, md: 1 }}>
								<NumberInput
									size='xs'
									label={t('editor.fields.consecutiveCount')}
									value={condition.consecutiveCount}
									onChange={(v) => onChange({ ...condition, consecutiveCount: typeof v === 'number' ? v : (Number(v) || 3) })}
									min={2}
									max={20}
									step={1}
								/>
							</Grid.Col>
							<Grid.Col span={{ base: 4, md: 1.5 }}>
								<Select
									size='xs'
									label={t('editor.fields.operator')}
									data={operatorOptions}
									value={condition.operator}
									onChange={(v) => v && onChange({ ...condition, operator: v as any })}
								/>
							</Grid.Col>
							<Grid.Col span={{ base: 4, md: 1.5 }}>
								<NumberInput
									size='xs'
									label={t('editor.fields.value')}
									value={condition.value}
									onChange={(v) => onChange({ ...condition, value: typeof v === 'number' ? v : (Number(v) || 0) })}
									min={metric.min}
									max={metric.max}
									step={metric.step}
									suffix={metric.unit === 'PERCENT' ? ' %' : undefined}
									decimalScale={metric.unit === 'SCORE_5' ? 1 : undefined}
								/>
							</Grid.Col>
						</>
					)}

					{/* Window */}
					{condition.mode !== 'CONSECUTIVE' && (
						<Grid.Col span={{ base: 12, md: 2 }}>
							<Select
								size='xs'
								label={t('editor.fields.window')}
								data={windowOptions}
								value={condition.window}
								onChange={(v) => v && onChange({ ...condition, window: v as any })}
							/>
						</Grid.Col>
					)}

					{/* Window size for LAST_N_CALLS */}
					{condition.window === 'LAST_N_CALLS' && condition.mode !== 'CONSECUTIVE' && (
						<Grid.Col span={{ base: 12, md: 1 }}>
							<NumberInput
								size='xs'
								label={t('editor.fields.windowSize')}
								value={condition.windowSize}
								onChange={(v) => onChange({ ...condition, windowSize: typeof v === 'number' ? v : (Number(v) || 10) })}
								min={5}
								max={50}
								step={1}
							/>
						</Grid.Col>
					)}

					{/* Remove button */}
					<Grid.Col span={{ base: 12, md: 1 }}>
						<Tooltip label={t('editor.fields.removeCondition')} disabled={canRemove}>
							<div>
								<ActionIcon
									size='sm'
									color='red'
									variant='subtle'
									onClick={onRemove}
									disabled={!canRemove}
									style={{ marginTop: '24px' }}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</div>
						</Tooltip>
					</Grid.Col>
				</Grid>
			</div>

			{/* Live description and error */}
			<Stack gap={2} mt='xs' ml='sm'>
				<Text size='xs' c='dimmed'>
					{describeCondition(t, condition)}
				</Text>
				{error && (
					<Text size='xs' c='red'>
						{error}
					</Text>
				)}
			</Stack>
		</Stack>
	);
}

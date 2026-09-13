import { Paper, Progress, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { OperationalMetric } from '../types';
import { OPERATIONAL_META } from '../constants';
import { formatSeconds } from '../helpers';
import { TrendDelta } from './TrendDelta';

interface OperationalMetricCardProps {
	metric: OperationalMetric;
}

function formatValue(value: number, unit: OperationalMetric['unit']): string {
	if (unit === 'seconds') return formatSeconds(value);
	if (unit === 'percent') return `${value}%`;
	return `${value}`;
}

export function OperationalMetricCard({ metric }: OperationalMetricCardProps) {
	const { t } = useTranslation('qa.team');
	const meta = OPERATIONAL_META[metric.key];
	const ratio = metric.teamAverage === 0 ? 50 : (metric.value / metric.teamAverage) * 50;
	const better = metric.betterWhen === 'lower' ? metric.value <= metric.teamAverage : metric.value >= metric.teamAverage;
	const diffPct = metric.teamAverage === 0 ? 0 : Math.abs((metric.value - metric.teamAverage) / metric.teamAverage) * 100;

	return (
		<Paper withBorder p='sm' radius='md'>
			<Stack gap={4}>
				<Text size='xs' c='dimmed'>{t(meta.labelKey)}</Text>
				<Text fw={700} size='lg'>{formatValue(metric.value, metric.unit)}</Text>
				<Text size='xs' c='dimmed'>{t('ops.teamAverage', { value: formatValue(metric.teamAverage, metric.unit) })}</Text>
				<TrendDelta
					delta={metric.delta}
					trend={metric.delta > 0 ? 'up' : metric.delta < 0 ? 'down' : 'flat'}
					unit={metric.unit === 'seconds' ? 's' : metric.unit === 'percent' ? '%' : ''}
					betterWhen={metric.betterWhen}
				/>
				<Progress value={Math.min(100, Math.max(0, ratio))} color={diffPct > 5 ? (better ? 'teal' : 'red') : 'gray'} size='xs' />
			</Stack>
		</Paper>
	);
}

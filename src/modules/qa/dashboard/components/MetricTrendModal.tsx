import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Box,
	Group,
	Modal,
	SegmentedControl,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { formatPeriod } from '~/modules/qa/analytics/TeamAnalyticsPage/charts/format';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import {
	TREND_PERIODS,
	type TrendMetricKey,
	type TrendPeriod,
	type TrendUnit,
} from '../trend/constants';
import { buildAgentMetricTrend } from '../trend/buildMetricTrend';
import { TrendIndicator } from './TrendIndicator';
import styles from '../Dashboard.module.css';

interface MetricTrendModalProps {
	/** Which card's metric to chart; null keeps the modal closed. */
	metric: TrendMetricKey | null;
	agentId: string;
	/** Window selected when the modal opens; the user can change it inside. */
	initialPeriod: TrendPeriod;
	onClose: () => void;
}

const CHART_HEIGHT = 280;

const formatValue = (unit: TrendUnit, v: number | null) =>
	v === null ? null : unit === 'percent' ? `${v}%` : v.toFixed(1);

/**
 * One Performance Score aspect over time: the selected window as a solid
 * line, the equal-length window before it dashed, with a period picker.
 */
export const MetricTrendModal: React.FC<MetricTrendModalProps> = ({
	metric,
	agentId,
	initialPeriod,
	onClose,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const thresholds = useSettingsStore(selectThresholds);
	const [period, setPeriod] = useState<TrendPeriod>(initialPeriod);
	const opened = metric !== null;
	const ready = useChartReady();

	// Each opening starts on the dashboard's current window.
	useEffect(() => {
		if (opened) setPeriod(initialPeriod);
	}, [opened, initialPeriod]);

	const trend = useMemo(
		() =>
			metric
				? buildAgentMetricTrend(agentId, metric, period, thresholds)
				: null,
		[agentId, metric, period, thresholds]
	);

	const metricLabel = metric ? t(`metricTrend.metric.${metric}`) : '';
	const hasData =
		trend !== null && trend.points.some((p) => p.current !== null);
	const domain: [number, number] = trend?.unit === 'score5' ? [1, 5] : [0, 100];
	const format = (v: number) => formatValue(trend?.unit ?? 'percent', v) ?? '';

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('metricTrend.title', { metric: metricLabel })}
			size='lg'
			centered
		>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<Text size='sm' c='dimmed'>
						{t('metricTrend.description')}
					</Text>
					<SegmentedControl
						size='xs'
						value={period}
						onChange={(value) => setPeriod(value as TrendPeriod)}
						data={TREND_PERIODS.map((p) => ({
							value: p.value,
							label: t(`metricTrend.period.${p.value}`),
						}))}
					/>
				</Group>

				{trend && (
					<SimpleGrid cols={3} spacing='md'>
						<div>
							<Text size='xs' c='dimmed'>
								{t('metricTrend.summary.current')}
							</Text>
							<Text className={styles.scoreValue}>
								{formatValue(trend.unit, trend.current) ??
									t('metricTrend.noPrevious')}
							</Text>
						</div>
						<div>
							<Text size='xs' c='dimmed'>
								{t('metricTrend.summary.previous')}
							</Text>
							<Text className={styles.scoreValue} c='dimmed'>
								{formatValue(trend.unit, trend.previous) ??
									t('metricTrend.noPrevious')}
							</Text>
						</div>
						<div>
							<Text size='xs' c='dimmed'>
								{t('metricTrend.summary.delta')}
							</Text>
							{trend.delta ? (
								<TrendIndicator trend={trend.delta} />
							) : (
								<Text size='sm' c='dimmed'>
									{t('metricTrend.noPrevious')}
								</Text>
							)}
						</div>
					</SimpleGrid>
				)}

				{!trend || !hasData ? (
					<Text size='sm' c='dimmed'>
						{t('metricTrend.empty')}
					</Text>
				) : !ready ? (
					<Box h={CHART_HEIGHT} />
				) : (
					<LineChart
						h={CHART_HEIGHT}
						data={trend.points}
						dataKey='period'
						series={[
							{
								name: 'current',
								label: t('metricTrend.series.current'),
								color: 'var(--mantine-color-text)',
							},
							{
								name: 'previous',
								label: t('metricTrend.series.previous'),
								color: 'gray.5',
								strokeDasharray: '4 4',
							},
						]}
						curveType='monotone'
						strokeWidth={2}
						withDots={trend.points.length <= 31}
						connectNulls
						gridAxis='y'
						tickLine='none'
						withLegend
						legendProps={{ verticalAlign: 'top', height: 28 }}
						valueFormatter={format}
						yAxisProps={{ domain, width: 48, tickFormatter: format }}
						xAxisProps={{ tickFormatter: formatPeriod, minTickGap: 24 }}
					/>
				)}
			</Stack>
		</Modal>
	);
};

export default MetricTrendModal;

import { LineChart } from '@mantine/charts';
import { Group, Text } from '@mantine/core';
import {
	IconChartLine,
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useChartReady } from '~/hooks/useChartReady';
import {
	buildWidgetComparisonCopy,
	getWidgetChartMetrics,
	formatMetricValue,
	resolveMetricDisplayValue,
} from '../../../CampaignDashboardViewer.helpers';
import DashboardWidgetCard from '../DashboardWidgetCard';
import type { TimeSeriesWidgetContentProps } from '../widgetContent.types';
import sharedStyles from '../../CampaignDashboardViewerWidgetContent.module.css';
import styles from './LineChartWidgetContent.module.css';

type TimeSeriesChartDatum = {
	label: string;
	currentValue: number | null;
	currentDisplayValue: string | number | boolean | null;
	previousValue: number | null;
};

const toTimestamp = (value: string) => {
	const timestamp = new Date(value).getTime();

	return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatSignedMetricValue = (value: number) => {
	const magnitude = formatMetricValue(Math.abs(value));

	if (value > 0) return `+${magnitude}`;
	if (value < 0) return `-${magnitude}`;

	return magnitude;
};

const getDeltaTone = (delta: number) => {
	if (delta > 0) return 'up';
	if (delta < 0) return 'down';

	return 'flat';
};

const isValueDefined = (value: number | null | undefined): value is number =>
	value !== null && value !== undefined;

const formatPointValue = (
	value: string | number | boolean | null | undefined
) => (value !== null && value !== undefined ? formatMetricValue(value) : '-');

const LineChartWidgetContent = ({
	widget,
	accentColor,
	layout,
	comparisonData,
	selectedTimeRange,
}: TimeSeriesWidgetContentProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const ready = useChartReady();
	const { chartHeight } = getWidgetChartMetrics(layout);

	const currentPoints = [...widget.result.points].sort(
		(left, right) =>
			toTimestamp(left.bucketStart) - toTimestamp(right.bucketStart)
	);
	const previousPoints =
		comparisonData?.previous?.kind === 'time_series'
			? [...comparisonData.previous.points].sort(
					(left, right) =>
						toTimestamp(left.bucketStart) - toTimestamp(right.bucketStart)
				)
			: [];
	const hasComparisonSeries = previousPoints.length > 0;
	const comparisonCopy = buildWidgetComparisonCopy(
		comparisonData?.compareWith ?? widget.result.meta.compareWith,
		selectedTimeRange,
		undefined,
		t
	);
	const chartData = Array.from(
		{ length: Math.max(currentPoints.length, previousPoints.length) },
		(_, index): TimeSeriesChartDatum => {
			const currentPoint = currentPoints[index];
			const previousPoint = previousPoints[index];

			return {
				label: currentPoint?.label ?? previousPoint?.label ?? String(index + 1),
				currentValue: currentPoint?.value ?? null,
				currentDisplayValue:
					resolveMetricDisplayValue(
						currentPoint?.value,
						currentPoint?.valueFormat
					) ?? null,
				previousValue: previousPoint?.value ?? null,
			};
		}
	).filter(
		(point) =>
			point.label.length > 0 ||
			isValueDefined(point.currentValue) ||
			isValueDefined(point.previousValue)
	);
	const currentLatestPoint = currentPoints.at(-1);
	const previousCurrentPoint = currentPoints.at(-2);
	const change =
		currentLatestPoint && previousCurrentPoint
			? currentLatestPoint.value - previousCurrentPoint.value
			: null;
	const changeTone = change !== null ? getDeltaTone(change) : 'flat';
	const rangeLabel = selectedTimeRange
		? t(`dashboard.timeRange.${selectedTimeRange}`)
		: null;
	const showDelta = currentPoints.length > 1;
	const showDots = chartData.length <= 10;
	const showAllTicks = chartData.length <= 8;

	const renderTooltip = ({
		active,
		payload,
		label,
	}: {
		active?: boolean;
		payload?: readonly { payload?: TimeSeriesChartDatum }[];
		label?: string | number;
	}): ReactNode => {
		if (!active || !payload?.length) return null;

		const point = payload[0]?.payload as TimeSeriesChartDatum | undefined;

		if (!point) return null;

		return (
			<div className={styles.tooltip}>
				<Text size='xs' c='dimmed' className={styles.tooltipLabel}>
					{String(label ?? point.label)}
				</Text>

				<div className={styles.tooltipSeriesList}>
					{point.currentValue !== null && point.currentValue !== undefined ? (
						<div className={styles.tooltipSeriesRow}>
							<Group gap={6} wrap='nowrap' className={styles.tooltipSeriesMeta}>
								<span
									className={styles.tooltipSwatch}
									style={{ backgroundColor: accentColor }}
								/>
								<Text size='xs' fw={600} className={styles.tooltipSeriesName}>
									{t('dashboard.lineChart.current')}
								</Text>
							</Group>
							<Text fw={700} size='sm' className={styles.tooltipValue}>
								{formatPointValue(point.currentDisplayValue)}
							</Text>
						</div>
					) : null}

					{hasComparisonSeries &&
					point.previousValue !== null &&
					point.previousValue !== undefined ? (
						<div className={styles.tooltipSeriesRow}>
							<Group gap={6} wrap='nowrap' className={styles.tooltipSeriesMeta}>
								<span
									className={styles.tooltipSwatch}
									style={{
										backgroundColor: 'var(--mantine-color-gray-5)',
									}}
								/>
								<Text size='xs' fw={600} className={styles.tooltipSeriesName}>
									{comparisonCopy.seriesLabel}
								</Text>
							</Group>
							<Text fw={700} size='sm' className={styles.tooltipValue}>
								{formatPointValue(point.previousValue)}
							</Text>
						</div>
					) : null}
				</div>
			</div>
		);
	};

	if (currentPoints.length === 0) {
		return (
			<DashboardWidgetCard title={widget.title} accentColor={accentColor}>
				<div className={styles.emptyState}>
					<IconChartLine size={18} stroke={1.8} className={styles.emptyIcon} />
					<Text size='sm' fw={600} ta='center' className={styles.emptyText}>
						{t('dashboard.emptyWidgetData')}
					</Text>
				</div>
			</DashboardWidgetCard>
		);
	}

	return (
		<DashboardWidgetCard title={widget.title} accentColor={accentColor}>
			<div className={styles.lineChartContent}>
				<Group
					align='flex-start'
					justify='space-between'
					wrap='nowrap'
					gap='xs'
					className={styles.metaRow}
				>
					{rangeLabel ? (
						<span className={styles.rangePill}>{rangeLabel}</span>
					) : (
						<span />
					)}
					<div className={styles.latestBlock}>
						<Text size='xs' c='dimmed' className={styles.latestLabel}>
							{t('dashboard.lineChart.latest')}
						</Text>
						<Group gap={8} wrap='nowrap' justify='flex-end'>
							<Text fw={800} size='xl' className={styles.latestValue}>
								{formatPointValue(
									resolveMetricDisplayValue(
										currentLatestPoint?.value,
										currentLatestPoint?.valueFormat
									)
								)}
							</Text>
							{showDelta ? (
								<span
									className={`${styles.deltaChip} ${styles[`deltaChip--${changeTone}`]}`}
								>
									{changeTone === 'up' ? (
										<IconTrendingUp size={12} stroke={2.2} />
									) : changeTone === 'down' ? (
										<IconTrendingDown size={12} stroke={2.2} />
									) : (
										<IconMinus size={12} stroke={2.2} />
									)}
									{formatSignedMetricValue(change ?? 0)}
								</span>
							) : null}
						</Group>
					</div>
				</Group>

				{hasComparisonSeries ? (
					<Text size='xs' c='dimmed' className={styles.comparisonCaption}>
						{comparisonCopy.label}
					</Text>
				) : null}

				<div
					className={`${sharedStyles.chartWrapper} ${styles.lineChartChartWrapper}`}
				>
					{ready ? (
						<LineChart
							h={chartHeight}
							data={chartData}
							dataKey='label'
							series={[
								{ name: 'currentValue', color: accentColor },
								...(hasComparisonSeries
									? [
											{
												name: 'previousValue',
												color: 'gray.5',
												strokeDasharray: '6 4',
											},
										]
									: []),
							]}
							type='default'
							withLegend={false}
							withTooltip
							withDots={showDots}
							dotProps={{ r: 3, strokeWidth: 2 }}
							activeDotProps={{ r: 4.5, strokeWidth: 2 }}
							curveType='monotone'
							tickLine='none'
							gridAxis='y'
							strokeDasharray='4 4'
							gridColor='gray.1'
							strokeWidth={2}
							xAxisProps={{
								axisLine: false,
								tickMargin: 8,
								minTickGap: showAllTicks ? 8 : 20,
								interval: showAllTicks ? 0 : 'preserveStartEnd',
								padding: { left: 4, right: 12 },
							}}
							yAxisProps={{
								axisLine: false,
								width: 36,
								tickMargin: 6,
							}}
							tooltipProps={{
								content: renderTooltip,
								cursor: {
									stroke: accentColor,
									strokeDasharray: '3 3',
									strokeOpacity: 0.12,
								},
							}}
							valueFormatter={(value) =>
								typeof value === 'number' && Number.isFinite(value)
									? formatMetricValue(value)
									: '-'
							}
						/>
					) : (
						<div className={styles.chartPlaceholder} />
					)}
				</div>
			</div>
		</DashboardWidgetCard>
	);
};

export default LineChartWidgetContent;

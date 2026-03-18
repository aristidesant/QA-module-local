import { AreaChart } from '@mantine/charts';
import { Group, Text } from '@mantine/core';
import {
	IconChartLine,
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import type { TooltipProps } from 'recharts';
import { useTranslation } from 'react-i18next';
import {
	formatMetricValue,
	getWidgetChartMetrics,
} from '../../../CampaignDashboardViewer.helpers';
import DashboardWidgetCard from '../DashboardWidgetCard';
import type { TimeSeriesWidgetContentProps } from '../widgetContent.types';
import sharedStyles from '../../CampaignDashboardViewerWidgetContent.module.css';
import styles from './LineChartWidgetContent.module.css';

const toTimestamp = (value: string) => {
	const timestamp = new Date(value).getTime();

	return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatAxisLabel = (
	bucketStart: string,
	granularity: 'hour' | 'day' | 'week' | 'month',
	locale?: string
) => {
	const date = new Date(bucketStart);

	if (!Number.isFinite(date.getTime())) {
		return bucketStart;
	}

	if (granularity === 'hour') {
		return date.toLocaleTimeString(locale, {
			hour: 'numeric',
			minute: '2-digit',
		});
	}

	if (granularity === 'month') {
		return date.toLocaleDateString(locale, {
			month: 'short',
		});
	}

	return date.toLocaleDateString(locale, {
		month: 'short',
		day: 'numeric',
	});
};

const formatTooltipLabel = (
	bucketStart: string,
	bucketEnd: string,
	locale?: string
) => {
	const start = new Date(bucketStart);
	const end = new Date(bucketEnd);

	if (!Number.isFinite(start.getTime())) {
		return bucketStart;
	}

	if (!Number.isFinite(end.getTime()) || start.getTime() === end.getTime()) {
		return start.toLocaleString(locale, {
			dateStyle: 'medium',
			timeStyle: 'short',
		});
	}

	return `${start.toLocaleString(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
	})} - ${end.toLocaleString(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
	})}`;
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

const LineChartWidgetContent = ({
	widget,
	accentColor,
	layout,
	selectedTimeRange,
}: TimeSeriesWidgetContentProps) => {
	const { t, i18n } = useTranslation('campaign.form.dashboards');
	const metrics = getWidgetChartMetrics(layout);
	const locale = i18n.language;

	const sortedPoints = [...widget.result.points].sort(
		(left, right) =>
			toTimestamp(left.bucketStart) - toTimestamp(right.bucketStart)
	);
	const data = sortedPoints.map((point) => ({
		axisLabel: formatAxisLabel(
			point.bucketStart,
			widget.result.meta.granularity,
			locale
		),
		tooltipLabel: formatTooltipLabel(
			point.bucketStart,
			point.bucketEnd,
			locale
		),
		value: point.value,
	}));
	const latestPoint = data[data.length - 1];
	const previousPoint = data[data.length - 2];
	const change = previousPoint ? latestPoint.value - previousPoint.value : null;
	const changeTone = change !== null ? getDeltaTone(change) : 'flat';
	const rangeLabel = selectedTimeRange
		? t(`dashboard.timeRange.${selectedTimeRange}`)
		: null;
	const chartHeight = Math.max(metrics.chartHeight - 8, 72);
	const showDelta = data.length > 1;
	const showDots = data.length <= 10;
	const showAllTicks = data.length <= 8;

	const renderTooltip: NonNullable<TooltipProps<number, string>['content']> = ({
		active,
		payload,
		label,
	}) => {
		if (!active || !payload?.length) return null;

		const point = payload[0]?.payload as
			| { axisLabel: string; tooltipLabel: string; value: number }
			| undefined;

		if (!point) return null;

		return (
			<div className={styles.tooltip}>
				<Text size='xs' c='dimmed' className={styles.tooltipLabel}>
					{point.tooltipLabel || String(label ?? point.axisLabel)}
				</Text>
				<Group gap={6} wrap='nowrap'>
					<span
						className={styles.tooltipSwatch}
						style={{ backgroundColor: accentColor }}
					/>
					<Text fw={700} size='sm' className={styles.tooltipValue}>
						{formatMetricValue(point.value)}
					</Text>
				</Group>
			</div>
		);
	};

	if (data.length === 0) {
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
								{formatMetricValue(latestPoint.value)}
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

				<div
					className={`${sharedStyles.chartWrapper} ${styles.lineChartChartWrapper}`}
				>
					<AreaChart
						data={data}
						dataKey='axisLabel'
						series={[{ name: 'value', color: accentColor }]}
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
						textColor='gray.5'
						strokeWidth={2}
						tooltipAnimationDuration={80}
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
						areaProps={{
							strokeLinecap: 'round',
							strokeLinejoin: 'round',
						}}
						tooltipProps={{
							content: renderTooltip,
							cursor: {
								stroke: accentColor,
								strokeDasharray: '3 3',
								strokeOpacity: 0.12,
							},
						}}
						h={chartHeight}
						valueFormatter={(value) =>
							Number.isFinite(value) ? value.toLocaleString() : '0'
						}
					/>
				</div>
			</div>
		</DashboardWidgetCard>
	);
};

export default LineChartWidgetContent;

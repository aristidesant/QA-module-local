import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
	LineChart,
	type LineChartProps,
	type LineChartSeries,
} from '@mantine/charts';
import { SegmentedControl, Skeleton, Stack } from '@mantine/core';
import { IconChartLine, type TablerIcon } from '@tabler/icons-react';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { ANALYTICS_PERIODS, type AnalyticsPeriod } from '../constants';
import classes from './TrendWidget.module.css';

interface TrendWidgetProps<T extends { label: string }> {
	title: string;
	description: string;
	icon: TablerIcon;
	period: AnalyticsPeriod;
	onPeriodChange: (period: AnalyticsPeriod) => void;
	data: T[];
	series: LineChartSeries[];
	yAxisProps?: LineChartProps['yAxisProps'];
	valueFormatter?: LineChartProps['valueFormatter'];
	/** Rendered under the chart (e.g. predominant-emotion badges). */
	extra?: ReactNode;
}

/** One analytics widget: SectionCard + its own 1W/1M/3M/6M selector + a theme-safe Mantine LineChart. */
export function TrendWidget<T extends { label: string }>({
	title,
	description,
	icon,
	period,
	onPeriodChange,
	data,
	series,
	yAxisProps,
	valueFormatter,
	extra,
}: TrendWidgetProps<T>) {
	const { t } = useTranslation('qa.agent.analytics');
	const chartReady = useChartReady();
	const isEmpty = data.every((point) =>
		series.every((s) => !(point as Record<string, unknown>)[s.name])
	);

	return (
		<SectionCard
			icon={icon}
			title={title}
			description={description}
			headerActions={
				<SegmentedControl
					size='xs'
					value={period}
					onChange={(value) => onPeriodChange(value as AnalyticsPeriod)}
					data={ANALYTICS_PERIODS.map((p) => ({
						value: p.value,
						label: t(p.labelKey),
					}))}
				/>
			}
		>
			<Stack gap='md'>
				{!chartReady ? (
					<Skeleton className={classes.chartArea} />
				) : isEmpty ? (
					<div className={classes.chartArea}>
						<EmptyState
							message={t('empty')}
							icon={<IconChartLine size={32} />}
						/>
					</div>
				) : (
					<LineChart
						className={classes.chartArea}
						data={data}
						dataKey='label'
						series={series}
						curveType='monotone'
						gridAxis='y'
						withLegend
						withDots
						connectNulls
						strokeWidth={2}
						yAxisProps={yAxisProps}
						valueFormatter={valueFormatter}
					/>
				)}
				{extra}
			</Stack>
		</SectionCard>
	);
}

export default TrendWidget;

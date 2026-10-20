import { useTranslation } from 'react-i18next';
import { Box } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { formatMetric, metricMeta } from '../../helpers';
import type { AnalyticsMetricId } from '../../types';
import { formatPeriod } from './format';
import classes from './charts.module.css';

export interface TrendSeries {
	name: string;
	label: string;
	color: string;
	/** The previous period reads as context: dashed and gray. */
	dashed?: boolean;
}

interface TrendChartProps {
	data: Record<string, string | number | null>[];
	series: TrendSeries[];
	metricId: AnalyticsMetricId;
	target?: number | null;
	h?: number;
	/** Small multiples: no legend, no x axis. */
	compact?: boolean;
}

/** A line chart with a recessive grid, a legend for 2+ series, an optional target and the metric's own formatting. */
export default function TrendChart({
	data,
	series,
	metricId,
	target = null,
	h = 240,
	compact = false,
}: TrendChartProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const ready = useChartReady();
	const { unit } = metricMeta(metricId);
	const domain: [number | 'auto', number | 'auto'] =
		unit === 'PERCENT' ? [0, 100] : unit === 'SCORE_5' ? [1, 5] : [0, 'auto'];

	if (!ready) return <Box h={h} className={classes.chartPlaceholder} />;

	return (
		<LineChart
			h={h}
			data={data}
			dataKey='period'
			series={series.map((s) => ({
				name: s.name,
				label: s.label,
				color: s.color,
				strokeDasharray: s.dashed ? '4 4' : undefined,
			}))}
			curveType='monotone'
			strokeWidth={2}
			withDots={!compact && data.length <= 31}
			connectNulls
			gridAxis='y'
			tickLine='none'
			withLegend={!compact && series.length > 1}
			legendProps={{ verticalAlign: 'top', height: 28 }}
			withXAxis={!compact}
			valueFormatter={(value) => formatMetric(metricId, value)}
			yAxisProps={{
				domain,
				width: 48,
				tickFormatter: (value: number) => formatMetric(metricId, value),
			}}
			xAxisProps={{ tickFormatter: formatPeriod, minTickGap: 24 }}
			referenceLines={
				target !== null
					? [{ y: target, label: t('charts.target'), color: 'gray.5' }]
					: undefined
			}
		/>
	);
}

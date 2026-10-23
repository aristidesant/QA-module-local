import { useMemo } from 'react';
import { SegmentedControl, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import type { ActivityMatrix, ActivityMode } from '../insightsMetrics';
import { axisStyle, useInsightsTheme } from '../useInsightsTheme';

interface ActivityHeatmapProps {
	index: number;
	matrix: ActivityMatrix;
	mode: ActivityMode;
	onModeChange: (mode: ActivityMode) => void;
}

/** When the calls happen: weekday by hour, as volume or as mean QA. */
export function ActivityHeatmap({
	index,
	matrix,
	mode,
	onModeChange,
}: ActivityHeatmapProps) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();
	const weekdays = t('operationManager.insights.weekdays', {
		returnObjects: true,
	}) as unknown as string[];

	const option = useMemo<EChartsOption>(() => {
		const hourLabels = matrix.hours.map(
			(hour) => `${String(hour).padStart(2, '0')}:00`
		);
		const axis = axisStyle(theme);
		return {
			...theme.base,
			grid: { left: 40, right: 8, top: 8, bottom: 60 },
			tooltip: {
				...theme.tooltip,
				formatter: (params: unknown) => {
					const [hour, weekday, value] = (
						params as unknown as { value: number[] }
					).value;
					const what =
						mode === 'volume'
							? t('operationManager.insights.heatmap.calls', { count: value })
							: t('operationManager.insights.heatmap.qa', { value });
					return `${weekdays[weekday]} ${hourLabels[hour]}<br/>${what}`;
				},
			},
			xAxis: {
				type: 'category',
				data: hourLabels,
				...axis,
				splitLine: { show: false },
			},
			yAxis: {
				type: 'category',
				data: weekdays,
				inverse: true,
				...axis,
				splitLine: { show: false },
			},
			visualMap: {
				type: 'continuous',
				min: mode === 'qa' ? 60 : 0,
				max: matrix.max || 1,
				orient: 'horizontal',
				left: 'center',
				bottom: 4,
				calculable: false,
				itemWidth: 10,
				itemHeight: 140,
				textStyle: { color: theme.dimmed, fontSize: 11 },
				inRange: { color: theme.sequential },
			},
			series: [
				{
					type: 'heatmap',
					data: matrix.cells,
					itemStyle: {
						borderColor: theme.surface,
						borderWidth: 2,
						borderRadius: 4,
					},
					emphasis: { itemStyle: { borderColor: theme.text, borderWidth: 1 } },
				},
			],
		};
	}, [matrix, mode, theme, weekdays, t]);

	return (
		<InsightsTile
			span={7}
			index={index}
			title={t('operationManager.insights.heatmap.title')}
			subtitle={t('operationManager.insights.heatmap.subtitle')}
			actions={
				<SegmentedControl
					size='xs'
					value={mode}
					onChange={(value) => onModeChange(value as ActivityMode)}
					data={[
						{
							value: 'volume',
							label: t('operationManager.insights.heatmap.mode.volume'),
						},
						{
							value: 'qa',
							label: t('operationManager.insights.heatmap.mode.qa'),
						},
					]}
				/>
			}
		>
			{matrix.cells.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('operationManager.insights.empty')}
				</Text>
			) : (
				<EChart
					option={option}
					height={300}
					ariaLabel={t('operationManager.insights.heatmap.title')}
				/>
			)}
		</InsightsTile>
	);
}

export default ActivityHeatmap;

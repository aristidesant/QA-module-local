import { useMemo } from 'react';
import { SegmentedControl, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import { axisStyle, useInsightsTheme, withAlpha } from '../useInsightsTheme';
import type {
	TeamSeriesPoint,
	TeamTrendMetric,
} from '../../operationManagerMetrics';

const METRICS: { id: TeamTrendMetric; key: string }[] = [
	{ id: 'QA_OVERALL_SCORE', key: 'qa' },
	{ id: 'COMPLIANCE_OVERALL_SCORE', key: 'compliance' },
	{ id: 'CUSTOMER_SENTIMENT_SCORE', key: 'customerSentiment' },
];

interface TeamTrendChartProps {
	index: number;
	data: TeamSeriesPoint[];
	teams: string[];
	metric: TeamTrendMetric;
	onMetricChange: (metric: TeamTrendMetric) => void;
	selectedTeam: string | null;
	onTeamClick: (team: string) => void;
}

/** One smooth line per team; a selected team keeps its colour and the rest step back. */
export function TeamTrendChart({
	index,
	data,
	teams,
	metric,
	onMetricChange,
	selectedTeam,
	onTeamClick,
}: TeamTrendChartProps) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();

	const option = useMemo<EChartsOption>(
		() => ({
			...theme.base,
			grid: { left: 36, right: 12, top: 36, bottom: 24 },
			legend: {
				top: 0,
				right: 0,
				icon: 'roundRect',
				itemWidth: 10,
				itemHeight: 4,
				textStyle: { color: theme.dimmed, fontSize: 11 },
			},
			tooltip: {
				...theme.tooltip,
				trigger: 'axis',
				axisPointer: { type: 'line', lineStyle: { color: theme.border } },
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: data.map((point) => point.label),
				...axisStyle(theme),
				splitLine: { show: false },
			},
			yAxis: { type: 'value', scale: true, ...axisStyle(theme) },
			series: teams.map((team) => {
				const color = theme.team[team] ?? theme.accent;
				const dim = selectedTeam !== null && selectedTeam !== team;
				return {
					name: team,
					type: 'line',
					data: data.map((point) => point[team] as number | null),
					smooth: 0.35,
					showSymbol: false,
					lineStyle: { width: dim ? 1.5 : 2.2, color, opacity: dim ? 0.25 : 1 },
					itemStyle: { color },
					areaStyle: { color: withAlpha(color, dim ? '05' : '14') },
					emphasis: { focus: 'series' },
				};
			}),
		}),
		[data, teams, selectedTeam, theme]
	);

	return (
		<InsightsTile
			span={8}
			index={index}
			title={t('operationManager.insights.teamTrend.title')}
			subtitle={t('operationManager.insights.teamTrend.subtitle')}
			actions={
				<SegmentedControl
					size='xs'
					value={metric}
					onChange={(value) => onMetricChange(value as TeamTrendMetric)}
					data={METRICS.map(({ id, key }) => ({
						value: id,
						label: t(`operationManager.teams.metric.${key}`),
					}))}
				/>
			}
		>
			{data.length < 2 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('operationManager.teams.needLongerPeriod')}
				</Text>
			) : (
				<EChart
					option={option}
					height={280}
					ariaLabel={t('operationManager.insights.teamTrend.title')}
					onItemClick={({ seriesName }) => {
						if (seriesName && teams.includes(seriesName))
							onTeamClick(seriesName);
					}}
				/>
			)}
		</InsightsTile>
	);
}

export default TeamTrendChart;

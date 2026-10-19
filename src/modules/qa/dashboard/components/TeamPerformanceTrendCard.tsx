import React from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { SEGMENT_COLORS } from '~/modules/qa/analytics/constants';
import type {
	TeamSeriesPoint,
	TeamTrendMetric,
} from '../operationManagerMetrics';

interface TeamPerformanceTrendCardProps {
	data: TeamSeriesPoint[];
	teams: string[];
	metric: TeamTrendMetric;
	onMetricChange: (metric: TeamTrendMetric) => void;
}

const METRIC_KEY: Record<TeamTrendMetric, string> = {
	QA_OVERALL_SCORE: 'qa',
	COMPLIANCE_OVERALL_SCORE: 'compliance',
	CUSTOMER_SENTIMENT_SCORE: 'customerSentiment',
};

const METRICS = Object.keys(METRIC_KEY) as TeamTrendMetric[];

/** One line per team over the selected window, for a metric picked from a segmented control. */
export const TeamPerformanceTrendCard: React.FC<
	TeamPerformanceTrendCardProps
> = ({ data, teams, metric, onMetricChange }) => {
	const { t } = useTranslation('qa.dashboard');
	const domain: [number, number] =
		metric === 'CUSTOMER_SENTIMENT_SCORE' ? [1, 5] : [0, 100];

	return (
		<Stack gap='md'>
			<SegmentedControl
				size='xs'
				w='fit-content'
				aria-label={t('operationManager.teams.title')}
				value={metric}
				onChange={(value) => onMetricChange(value as TeamTrendMetric)}
				data={METRICS.map((id) => ({
					value: id,
					label: t(`operationManager.teams.metric.${METRIC_KEY[id]}`),
				}))}
			/>
			{data.length < 2 ? (
				<Text size='sm' c='dimmed'>
					{t('operationManager.teams.needLongerPeriod')}
				</Text>
			) : (
				<LineChart
					h={280}
					data={data}
					dataKey='label'
					series={teams.map((team, index) => ({
						name: team,
						label: team,
						color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
					}))}
					curveType='monotone'
					withDots
					withLegend
					strokeWidth={2}
					yAxisProps={{ domain }}
				/>
			)}
		</Stack>
	);
};

export default TeamPerformanceTrendCard;

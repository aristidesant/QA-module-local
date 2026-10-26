import { SegmentedControl, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { Heatmap } from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import type { HeatmapData } from '~/modules/qa/analytics/types';
import type { ActivityMode } from '../insightsMetrics';

interface ActivityHeatmapCardProps {
	data: HeatmapData;
	mode: ActivityMode;
	onModeChange: (mode: ActivityMode) => void;
}

/** When the calls happen: weekday by hour, as volume or as mean QA. */
export function ActivityHeatmapCard({
	data,
	mode,
	onModeChange,
}: ActivityHeatmapCardProps) {
	const { t } = useTranslation('qa.dashboard');

	return (
		<SectionCard
			padding='md'
			fullHeight
			title={t('operationManager.insights.heatmap.title')}
			description={t('operationManager.insights.heatmap.subtitle')}
			headerActions={
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
			{data.rows.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('operationManager.insights.empty')}
				</Text>
			) : (
				<Heatmap
					data={data}
					metricId={
						mode === 'volume' ? 'OPS_CALLS_HANDLED' : 'QA_OVERALL_SCORE'
					}
				/>
			)}
		</SectionCard>
	);
}

export default ActivityHeatmapCard;

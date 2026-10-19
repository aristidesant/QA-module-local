import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import type { HumanVsAiPoint } from '../mockData';

interface HumanVsAiCardProps {
	data: HumanVsAiPoint[];
}

/** Human vs AI agent performance: one bar pair per metric, every pair normalised to 0-100. */
export const HumanVsAiCard: React.FC<HumanVsAiCardProps> = ({ data }) => {
	const { t } = useTranslation('qa.dashboard');

	const chartData = useMemo(
		() =>
			data.map((point) => ({
				metric: t(`operationManager.humanVsAi.metric.${point.metric}`),
				human: Math.round((point.human / point.max) * 100),
				ai: Math.round((point.ai / point.max) * 100),
			})),
		[data, t]
	);

	return (
		<Stack gap='md'>
			<BarChart
				h={240}
				data={chartData}
				dataKey='metric'
				series={[
					{
						name: 'human',
						label: t('operationManager.humanVsAi.human'),
						color: 'var(--mantine-color-text)',
					},
					{
						name: 'ai',
						label: t('operationManager.humanVsAi.ai'),
						color: 'violet.6',
					},
				]}
				withLegend
				yAxisProps={{ domain: [0, 100] }}
			/>

			<Group gap='md' wrap='wrap'>
				{data.map((point) => (
					<Text key={point.metric} size='xs' c='dimmed'>
						{t(`operationManager.humanVsAi.metric.${point.metric}`)}{' '}
						<Text span size='xs' fw={600} c='var(--mantine-color-text)'>
							{point.human} vs {point.ai}
						</Text>
					</Text>
				))}
			</Group>

			<Text size='xs' c='dimmed'>
				{t('operationManager.humanVsAi.illustrative')}
			</Text>
		</Stack>
	);
};

export default HumanVsAiCard;

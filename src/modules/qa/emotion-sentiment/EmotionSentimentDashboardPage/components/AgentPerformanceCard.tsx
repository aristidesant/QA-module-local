import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { OverallPerformance } from '../../utils/types';

interface AgentPerformanceCardProps {
	data: OverallPerformance | null;
	loading: boolean;
}

export default function AgentPerformanceCard({
	data,
	loading,
}: AgentPerformanceCardProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	const chartData = data
		? [
				{
					metric: 'Overall Performance',
					empathy: data.avgEmpathy,
					effectiveness: data.avgEffectiveness,
				},
			]
		: [];

	return (
		<Card withBorder radius='md' p='md' className='h-full'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text fw={600}>{t('charts.agentPerformance.title')}</Text>
						<Text size='sm' c='dimmed'>
							{t('charts.agentPerformance.subtitle')}
						</Text>
					</div>
					{loading && <Loader size='xs' />}
				</Group>

				{loading || !data ? (
					// inline-style-allow: flex centering for loader
					<div
						style={{
							height: 300,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Loader />
					</div>
				) : (
					<BarChart
						h={300}
						data={chartData}
						dataKey='metric'
						series={[
							{
								name: 'empathy',
								label: t('charts.agentPerformance.labels.empathy'),
								color: 'grape',
							},
							{
								name: 'effectiveness',
								label: t('charts.agentPerformance.labels.effectiveness'),
								color: 'teal',
							},
						]}
						withLegend
						withTooltip
					/>
				)}
			</Stack>
		</Card>
	);
}

import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { AgentPerformance } from '../../utils/types';

interface AgentPerformanceCardProps {
	data: AgentPerformance[];
	loading: boolean;
}

export default function AgentPerformanceCard({
	data,
	loading,
}: AgentPerformanceCardProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	const chartData = data.map((agent) => ({
		agent: agent.agentName.split(' ')[0],
		empathy: agent.empathyScore,
		effectiveness: Math.round(agent.responseEffectiveness * 100),
	}));

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

				{loading || data.length === 0 ? (
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
						dataKey='agent'
						series={[
							{ name: 'empathy', label: 'Empathy Score', color: 'grape' },
							{
								name: 'effectiveness',
								label: 'Effectiveness %',
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

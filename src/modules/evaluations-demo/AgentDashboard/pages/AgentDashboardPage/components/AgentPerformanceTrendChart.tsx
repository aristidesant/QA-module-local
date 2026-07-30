import React from 'react';
import { LineChart } from '@mantine/charts';
import { Box, Card, Text } from '@mantine/core';
import type { DemoAgentKpis } from '../../../types';

interface AgentPerformanceTrendChartProps {
	kpis: DemoAgentKpis;
}

const AgentPerformanceTrendChart: React.FC<AgentPerformanceTrendChartProps> = ({
	kpis,
}) => {
	return (
		<Card withBorder radius='md' p='md' mt='md'>
			<Card.Section withBorder inheritPadding py='md'>
				<Text fw={700} size='lg'>
					Performance Trend (12 Months)
				</Text>
				<Text size='sm' c='dimmed'>
					Monthly average score
				</Text>
			</Card.Section>

			<Card.Section inheritPadding py='md'>
				<Box style={{ width: '100%', height: 400, minHeight: 300 }}>
					<LineChart
						w='100%'
						h={400}
						data={kpis.monthlyTrends}
						dataKey='month'
						series={[{ name: 'score', label: 'Score (%)', color: 'green' }]}
						curveType='monotone'
						withLegend
						withXAxis
						withYAxis
						type='default'
						yAxisProps={{ domain: [0, 100] }}
						tooltipProps={{
							contentStyle: {
								backgroundColor:
									'var(--mantine-color-dark-7)',
								border: '1px solid var(--mantine-color-gray-3)',
							},
						}}
					/>
				</Box>
			</Card.Section>
		</Card>
	);
};

export default AgentPerformanceTrendChart;

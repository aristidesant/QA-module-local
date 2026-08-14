import React, { useMemo } from 'react';
import { LineChart } from '@mantine/charts';
import { Box, Card, Text } from '@mantine/core';
import type { DemoAgentCall } from '../../../types';
import styles from './AgentPerformanceTrendChart.module.css';

interface AgentPerformanceTrendChartProps {
	calls: DemoAgentCall[];
}

const AgentPerformanceTrendChart: React.FC<AgentPerformanceTrendChartProps> = ({
	calls,
}) => {
	const chartData = useMemo(() => {
		// Generate data for the last 4 weeks with scores for each evaluation type
		const weeks = [];
		const today = new Date();

		for (let i = 3; i >= 0; i--) {
			const weekStart = new Date(today);
			weekStart.setDate(weekStart.getDate() - i * 7);
			const weekLabel = `Week ${4 - i}`;

			// Calculate average scores for each evaluation type
			const qaScores = calls
				.filter((call) => call.evaluationType === 'QA' && call.score !== null)
				.map((call) => call.score as number);
			const sentimentScores = calls
				.filter(
					(call) =>
						call.evaluationType === 'Sentiment Analysis' && call.score !== null
				)
				.map((call) => call.score as number);
			const complianceScores = calls
				.filter(
					(call) => call.evaluationType === 'Compliance' && call.score !== null
				)
				.map((call) => call.score as number);

			const getAverage = (scores: number[]) =>
				scores.length > 0
					? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
					: 0;

			weeks.push({
				week: weekLabel,
				QA: getAverage(qaScores),
				'Emotion & Sentiment': getAverage(sentimentScores),
				Compliance: getAverage(complianceScores),
			});
		}

		return weeks;
	}, [calls]);

	return (
		<Card withBorder radius='md' p='md' className={styles.card}>
			<Card.Section withBorder inheritPadding py='md'>
				<Text fw={700} size='lg'>
					Performance Trend (1 Month)
				</Text>
				<Text size='sm' c='dimmed'>
					Weekly average by analysis type
				</Text>
			</Card.Section>

			<Card.Section inheritPadding py='md' className={styles.chartSection}>
				{/* inline-style-allow: chart container sizing */}
				<Box style={{ width: '100%', height: 400, minHeight: 300 }}>
					<LineChart
						w='100%'
						h={400}
						data={chartData}
						dataKey='week'
						series={[
							{ name: 'QA', label: 'QA Analysis', color: 'blue' },
							{
								name: 'Emotion & Sentiment',
								label: 'Emotion & Sentiment',
								color: 'green',
							},
							{ name: 'Compliance', label: 'Compliance', color: 'grape' },
						]}
						curveType='monotone'
						withLegend
						withXAxis
						withYAxis
						type='default'
						yAxisProps={{ domain: [0, 100] }}
						tooltipProps={{
							contentStyle: {
								backgroundColor: 'var(--mantine-color-dark-7)',
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

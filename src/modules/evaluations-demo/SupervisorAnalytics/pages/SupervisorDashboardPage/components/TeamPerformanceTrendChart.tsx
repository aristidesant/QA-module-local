import React, { useMemo } from 'react';
import { LineChart } from '@mantine/charts';
import { Box, Card, Text } from '@mantine/core';
import type { DemoAgentCall } from '../../../../AgentDashboard/types';
import styles from './TeamPerformanceTrendChart.module.css';

interface TeamPerformanceTrendChartProps {
	calls: DemoAgentCall[];
}

const TeamPerformanceTrendChart: React.FC<TeamPerformanceTrendChartProps> = ({
	calls,
}) => {
	const chartData = useMemo(() => {
		const weeks = [];
		const today = new Date();

		for (let i = 3; i >= 0; i--) {
			const weekStart = new Date(today);
			weekStart.setDate(weekStart.getDate() - i * 7);
			const weekLabel = `Week ${4 - i}`;

			// Calculate team average for QA
			const qaScores = calls
				.filter((call) => call.evaluationType === 'QA' && call.score !== null)
				.map((call) => call.score as number);
			const qaAvg =
				qaScores.length > 0
					? Math.round(qaScores.reduce((a, b) => a + b, 0) / qaScores.length)
					: 0;

			// Calculate team average for Emotion & Sentiment
			const emotionScores = calls
				.filter(
					(call) =>
						call.evaluationType === 'Sentiment Analysis' && call.score !== null
				)
				.map((call) => call.score as number);
			const emotionAvg =
				emotionScores.length > 0
					? Math.round(
							emotionScores.reduce((a, b) => a + b, 0) / emotionScores.length
						)
					: 0;

			// Calculate team average for Compliance
			const complianceScores = calls
				.filter(
					(call) => call.evaluationType === 'Compliance' && call.score !== null
				)
				.map((call) => call.score as number);
			const complianceAvg =
				complianceScores.length > 0
					? Math.round(
							complianceScores.reduce((a, b) => a + b, 0) /
								complianceScores.length
						)
					: 0;

			const weekData: Record<string, number | string> = {
				week: weekLabel,
				'QA Analysis': qaAvg,
				'Emotion & Sentiment': emotionAvg,
				Compliance: complianceAvg,
			};

			weeks.push(weekData);
		}

		return weeks;
	}, [calls]);

	const getSeries = useMemo(
		() => [
			{ name: 'QA Analysis', label: 'QA Analysis', color: 'blue' },
			{
				name: 'Emotion & Sentiment',
				label: 'Emotion & Sentiment',
				color: 'green',
			},
			{ name: 'Compliance', label: 'Compliance', color: 'grape' },
		],
		[]
	);

	return (
		<Card withBorder radius='md' p='md' className={styles.card}>
			<Card.Section withBorder inheritPadding py='md'>
				<Text fw={700} size='lg'>
					Performance Trend (4 Weeks)
				</Text>
				<Text size='sm' c='dimmed'>
					Team average (bold) vs. individual agents
				</Text>
			</Card.Section>

			<Card.Section inheritPadding py='md' className={styles.chartSection}>
				{/* inline-style-allow: required for dynamic chart sizing */}
				<Box style={{ width: '100%', height: 400, minHeight: 300 }}>
					<LineChart
						w='100%'
						h={400}
						data={chartData}
						dataKey='week'
						series={getSeries}
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

export default TeamPerformanceTrendChart;

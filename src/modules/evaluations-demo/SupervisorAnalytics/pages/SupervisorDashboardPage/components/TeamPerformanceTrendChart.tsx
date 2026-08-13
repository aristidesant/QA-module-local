import React, { useMemo } from 'react';
import { LineChart } from '@mantine/charts';
import { Box, Card, Text } from '@mantine/core';
import type { DemoAgentCall } from '../../../../AgentDashboard/types';

interface TeamPerformanceTrendChartProps {
	calls: DemoAgentCall[];
	analysisType: string;
}

const TeamPerformanceTrendChart: React.FC<TeamPerformanceTrendChartProps> = ({
	calls,
	analysisType,
}) => {
	const chartData = useMemo(() => {
		const weeks = [];
		const today = new Date();
		const agentNames = [
			...new Set(calls.map((call) => call.agentName || 'Unknown Agent')),
		];

		for (let i = 3; i >= 0; i--) {
			const weekStart = new Date(today);
			weekStart.setDate(weekStart.getDate() - i * 7);
			const weekLabel = `Week ${4 - i}`;

			// Filter calls for this analysis type
			const filteredCalls = calls.filter((call) => {
				if (analysisType === 'qa')
					return call.evaluationType === 'QA' && call.score !== null;
				if (analysisType === 'emotion')
					return (
						call.evaluationType === 'Sentiment Analysis' && call.score !== null
					);
				if (analysisType === 'compliance')
					return call.evaluationType === 'Compliance' && call.score !== null;
				return false;
			});

			// Calculate team average
			const teamScores = filteredCalls.map((call) => call.score as number);
			const teamAvg =
				teamScores.length > 0
					? Math.round(
							teamScores.reduce((a, b) => a + b, 0) / teamScores.length
						)
					: 0;

			const weekData: Record<string, number | string> = {
				week: weekLabel,
				'Team Avg': teamAvg,
			};

			// Calculate per-agent average
			agentNames.forEach((agent) => {
				const agentScores = filteredCalls
					.filter((call) => (call.agentName || 'Unknown Agent') === agent)
					.map((call) => call.score as number);

				const agentAvg =
					agentScores.length > 0
						? Math.round(
								agentScores.reduce((a, b) => a + b, 0) / agentScores.length
							)
						: 0;

				weekData[agent] = agentAvg;
			});

			weeks.push(weekData);
		}

		return weeks;
	}, [calls, analysisType]);

	const getSeries = useMemo(() => {
		const agentNames = [
			...new Set(calls.map((call) => call.agentName || 'Unknown Agent')),
		];
		const series: Array<{ name: string; label: string; color: string }> = [
			{ name: 'Team Avg', label: 'Team Average', color: 'blue' },
		];

		const colors = ['green', 'grape', 'cyan', 'yellow', 'red'];
		agentNames.forEach((agent) => {
			if (agent) {
				series.push({
					name: agent,
					label: agent,
					color: colors[series.length % colors.length],
				});
			}
		});

		return series;
	}, [calls]);

	return (
		<Card withBorder radius='md' p='md'>
			<Card.Section withBorder inheritPadding py='md'>
				<Text fw={700} size='lg'>
					Performance Trend (4 Weeks)
				</Text>
				<Text size='sm' c='dimmed'>
					Team average (bold) vs. individual agents
				</Text>
			</Card.Section>

			<Card.Section inheritPadding py='md'>
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

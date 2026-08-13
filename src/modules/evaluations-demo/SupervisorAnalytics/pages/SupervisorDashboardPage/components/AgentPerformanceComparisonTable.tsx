import React, { useMemo, useState } from 'react';
import {
	Card,
	Table,
	Text,
	Badge,
	Group,
	Button,
	Select,
	Stack,
} from '@mantine/core';
import {
	IconArrowUp,
	IconArrowDown,
	IconMinus,
	IconEye,
} from '@tabler/icons-react';
import type { DemoAgentCall } from '../../../../AgentDashboard/types';
import styles from './AgentPerformanceComparisonTable.module.css';

interface AgentPerformanceComparisonTableProps {
	calls: DemoAgentCall[];
}

interface AgentPerformanceData {
	agentName: string;
	score: number;
	callCount: number;
	trend: 'up' | 'down' | 'stable';
}

const AgentPerformanceComparisonTable: React.FC<
	AgentPerformanceComparisonTableProps
> = ({ calls }) => {
	const [sortBy, setSortBy] = useState<'score' | 'gap' | 'name'>('score');

	const { agentMetrics, teamAverage } = useMemo(() => {
		// Filter calls by QA Analysis (default metric for agent ranking)
		const filteredCalls = calls.filter(
			(call) => call.evaluationType === 'QA' && call.score !== null
		);

		// Group by agent and calculate metrics
		const agentMap = new Map<string, number[]>();
		filteredCalls.forEach((call) => {
			const agentName = call.agentName || 'Unknown Agent';
			if (!agentMap.has(agentName)) {
				agentMap.set(agentName, []);
			}
			agentMap.get(agentName)!.push(call.score as number);
		});

		const metrics: AgentPerformanceData[] = [];
		agentMap.forEach((scores, agentName) => {
			const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
			const trend: 'up' | 'down' | 'stable' =
				Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable';

			metrics.push({
				agentName,
				score: avg,
				callCount: scores.length,
				trend,
			});
		});

		const teamAvg = Math.round(
			metrics.reduce((sum, m) => sum + m.score, 0) / Math.max(metrics.length, 1)
		);

		return {
			agentMetrics: metrics,
			teamAverage: teamAvg,
		};
	}, [calls]);

	const sortedMetrics = useMemo(() => {
		const sorted = [...agentMetrics];
		switch (sortBy) {
			case 'score':
				return sorted.sort((a, b) => b.score - a.score);
			case 'gap':
				return sorted.sort(
					(a, b) =>
						Math.abs(b.score - teamAverage) - Math.abs(a.score - teamAverage)
				);
			case 'name':
				return sorted.sort((a, b) => a.agentName.localeCompare(b.agentName));
			default:
				return sorted;
		}
	}, [agentMetrics, sortBy, teamAverage]);

	const getTrendIcon = (trend: string) => {
		switch (trend) {
			case 'up':
				return <IconArrowUp size={16} color='var(--mantine-color-green-6)' />;
			case 'down':
				return <IconArrowDown size={16} color='var(--mantine-color-red-6)' />;
			default:
				return <IconMinus size={16} color='var(--mantine-color-gray-6)' />;
		}
	};

	const getTrendLabel = (trend: string) => {
		switch (trend) {
			case 'up':
				return 'Improving';
			case 'down':
				return 'Declining';
			default:
				return 'Stable';
		}
	};

	const getGapBadgeColor = (score: number): string => {
		const gap = score - teamAverage;
		if (gap > 10) return 'green';
		if (gap < -10) return 'red';
		return 'gray';
	};

	const getScoreBadgeColor = (score: number): string => {
		if (score >= 85) return 'green';
		if (score >= 70) return 'yellow';
		return 'red';
	};

	return (
		<Card withBorder radius='md' shadow='sm' className={styles.card}>
			<Card.Section withBorder inheritPadding py='md'>
				<Group justify='space-between' align='center'>
					<Stack gap={0}>
						<Text fw={700} size='lg'>
							Agent Performance Ranking
						</Text>
						<Text size='sm' c='dimmed'>
							Team Average: {teamAverage}
						</Text>
					</Stack>
					<Select
						placeholder='Sort by'
						value={sortBy}
						onChange={(value) => setSortBy(value as 'score' | 'gap' | 'name')}
						data={[
							{ value: 'score', label: 'Score (High to Low)' },
							{ value: 'gap', label: 'Gap to Team Avg' },
							{ value: 'name', label: 'Name' },
						]}
						w={180}
						size='sm'
					/>
				</Group>
			</Card.Section>

			<Card.Section>
				{sortedMetrics.length > 0 ? (
					<Table striped highlightOnHover className={styles.table}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Agent Name</Table.Th>
								<Table.Th>Score</Table.Th>
								<Table.Th>vs Team Avg</Table.Th>
								<Table.Th>Trend</Table.Th>
								<Table.Th>Calls</Table.Th>
								<Table.Th>Action</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{sortedMetrics.map((agent) => {
								const gap = agent.score - teamAverage;
								const gapText = gap > 0 ? `+${gap}` : `${gap}`;

								return (
									<Table.Tr
										key={agent.agentName}
										className={styles.clickableRow}
									>
										<Table.Td fw={500}>{agent.agentName}</Table.Td>
										<Table.Td>
											<Badge
												variant='light'
												color={getScoreBadgeColor(agent.score)}
												size='sm'
											>
												{agent.score}%
											</Badge>
										</Table.Td>
										<Table.Td>
											<Badge
												variant='light'
												color={getGapBadgeColor(agent.score)}
												size='sm'
											>
												{gapText}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Group gap='xs'>
												{getTrendIcon(agent.trend)}
												<Text size='sm' c='dimmed'>
													{getTrendLabel(agent.trend)}
												</Text>
											</Group>
										</Table.Td>
										<Table.Td>
											<Text size='sm' c='dimmed'>
												{agent.callCount}
											</Text>
										</Table.Td>
										<Table.Td>
											<Button
												variant='light'
												size='sm'
												rightSection={<IconEye size={14} />}
											>
												Coach
											</Button>
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				) : (
					<Text p='md' c='dimmed' ta='center'>
						No agents found
					</Text>
				)}
			</Card.Section>
		</Card>
	);
};

export default AgentPerformanceComparisonTable;

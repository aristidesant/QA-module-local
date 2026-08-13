import React, { useMemo } from 'react';
import {
	Card,
	Stack,
	Text,
	Table,
	Badge,
	Group,
	Button,
	Select,
	Center,
} from '@mantine/core';
import {
	IconArrowUp,
	IconArrowDown,
	IconMinus,
	IconEye,
} from '@tabler/icons-react';
import { AgentMetrics } from '../../../types/supervisorTypes';

interface AgentRankingTableProps {
	agents: AgentMetrics[];
	sortBy: 'score' | 'trend' | 'name';
	onSortChange: (sort: 'score' | 'trend' | 'name') => void;
	onAgentSelect?: (agent: AgentMetrics) => void;
}

const getAgentId = (agentName: string): string => {
	const match = agentName.match(/\d+/);
	return match ? `AGT-${String(match[0]).padStart(3, '0')}` : 'AGT-000';
};

const AgentRankingTable: React.FC<AgentRankingTableProps> = ({
	agents,
	sortBy,
	onSortChange,
	onAgentSelect,
}) => {
	const sortedAgents = useMemo(() => {
		const sorted = [...agents];
		switch (sortBy) {
			case 'score': {
				return sorted.sort((a, b) => {
					const aScore = a.metrics[0]?.value as number;
					const bScore = b.metrics[0]?.value as number;
					return (bScore || 0) - (aScore || 0);
				});
			}
			case 'trend': {
				return sorted.sort((a, b) => {
					const trendOrder: Record<string, number> = {
						up: 2,
						down: 0,
						neutral: 1,
					};
					return (
						(trendOrder[b.trend || 'neutral'] || 0) -
						(trendOrder[a.trend || 'neutral'] || 0)
					);
				});
			}
			case 'name': {
				return sorted.sort((a, b) => a.agentName.localeCompare(b.agentName));
			}
			default:
				return sorted;
		}
	}, [agents, sortBy]);

	const teamAverageScore = useMemo(() => {
		if (agents.length === 0) return 0;
		const scores = agents
			.map((agent) => agent.metrics[0]?.value as number)
			.filter((score) => typeof score === 'number');
		return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
	}, [agents]);

	const getTrendIcon = (trend?: string) => {
		switch (trend) {
			case 'up':
				return <IconArrowUp size={16} color='var(--mantine-color-green-6)' />;
			case 'down':
				return <IconArrowDown size={16} color='var(--mantine-color-red-6)' />;
			default:
				return <IconMinus size={16} color='var(--mantine-color-gray-6)' />;
		}
	};

	return (
		<Card withBorder radius='md' shadow='sm'>
			<Card.Section withBorder inheritPadding py='md'>
				<Stack gap='md'>
					<Text fw={600} size='sm'>
						Agent Performance Ranking
					</Text>
					<Group justify='space-between'>
						<Text size='sm' c='dimmed'>
							Team Average: {teamAverageScore}
						</Text>
						<Select
							placeholder='Sort by'
							value={sortBy}
							onChange={(value) =>
								onSortChange(value as 'score' | 'trend' | 'name')
							}
							data={[
								{ value: 'score', label: 'Score' },
								{ value: 'trend', label: 'Trend' },
								{ value: 'name', label: 'Name' },
							]}
							w={150}
							size='sm'
						/>
					</Group>
				</Stack>
			</Card.Section>

			<Card.Section>
				{sortedAgents.length === 0 ? (
					<Center py='xl'>
						<Text c='dimmed'>No agents found</Text>
					</Center>
				) : (
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Agent ID</Table.Th>
								<Table.Th>Agent Name</Table.Th>
								<Table.Th>Score</Table.Th>
								<Table.Th>Trend</Table.Th>
								<Table.Th>vs. Team Average</Table.Th>
								<Table.Th>Action</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{sortedAgents.map((agent) => {
								const score = agent.metrics[0]?.value as number;
								const difference = score - teamAverageScore;
								const differenceText =
									difference > 0
										? `+${Math.round(difference)}`
										: `${Math.round(difference)}`;
								const badgeColor =
									difference > 0 ? 'green' : difference < 0 ? 'red' : 'gray';

								return (
									<Table.Tr key={agent.agentName}>
										<Table.Td fw={500}>{getAgentId(agent.agentName)}</Table.Td>
										<Table.Td fw={500}>{agent.agentName}</Table.Td>
										<Table.Td fw={600}>{Math.round(score)}</Table.Td>
										<Table.Td>
											<Group gap='xs'>
												{getTrendIcon(agent.trend)}
												<Text size='sm' c='dimmed'>
													{agent.trend === 'up'
														? 'Improving'
														: agent.trend === 'down'
															? 'Declining'
															: 'Stable'}
												</Text>
											</Group>
										</Table.Td>
										<Table.Td>
											<Badge color={badgeColor} variant='light'>
												{differenceText}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Button
												variant='light'
												size='sm'
												rightSection={<IconEye size={14} />}
												onClick={() => onAgentSelect?.(agent)}
											>
												View
											</Button>
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				)}
			</Card.Section>
		</Card>
	);
};

export default AgentRankingTable;

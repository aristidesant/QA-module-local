import React, { useMemo } from 'react';
import {
	Card,
	Table,
	Text,
	Badge,
	Group,
	Stack,
	ThemeIcon,
} from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';
import type { DemoAgentCall } from '../../../../AgentDashboard/types';
import styles from './DowntrendingAgentsTable.module.css';

interface DowntrendingAgentsTableProps {
	calls: DemoAgentCall[];
}

interface DowntrendingAgent {
	agentName: string;
	trend: number;
	recentScore: number;
	previousScore: number;
	change: number;
}

const DowntrendingAgentsTable: React.FC<DowntrendingAgentsTableProps> = ({
	calls,
}) => {
	const downtrendingAgents = useMemo(() => {
		// Group calls by agent
		const agentCallsMap = new Map<string, DemoAgentCall[]>();
		calls.forEach((call) => {
			const agentName = call.agentName || 'Unknown Agent';
			if (!agentCallsMap.has(agentName)) {
				agentCallsMap.set(agentName, []);
			}
			agentCallsMap.get(agentName)!.push(call);
		});

		// Calculate trend for each agent
		const agents: DowntrendingAgent[] = [];
		agentCallsMap.forEach((callsList, agentName) => {
			if (callsList.length >= 2) {
				// Sort by date to get recent vs previous
				const sorted = [...callsList].sort(
					(a, b) =>
						new Date(b.callDate).getTime() - new Date(a.callDate).getTime()
				);

				// Split into recent (first half) and previous (second half)
				const midpoint = Math.ceil(sorted.length / 2);
				const recentCalls = sorted.slice(0, midpoint);
				const previousCalls = sorted.slice(midpoint);

				// Calculate averages
				const recentScores = recentCalls
					.map((c) => c.score)
					.filter((s) => s !== null) as number[];
				const previousScores = previousCalls
					.map((c) => c.score)
					.filter((s) => s !== null) as number[];

				if (recentScores.length > 0 && previousScores.length > 0) {
					const recentAvg = Math.round(
						recentScores.reduce((a, b) => a + b, 0) / recentScores.length
					);
					const previousAvg = Math.round(
						previousScores.reduce((a, b) => a + b, 0) / previousScores.length
					);
					const change = recentAvg - previousAvg;

					if (change < 0) {
						agents.push({
							agentName,
							trend: change,
							recentScore: recentAvg,
							previousScore: previousAvg,
							change: Math.abs(change),
						});
					}
				}
			}
		});

		// Sort by biggest downtrend first
		return agents.sort((a, b) => a.trend - b.trend).slice(0, 10);
	}, [calls]);

	const getTrendColor = (change: number): string => {
		if (change > 15) return 'red';
		if (change > 8) return 'yellow';
		return 'orange';
	};

	return (
		<Card withBorder radius='md' shadow='sm' className={styles.card}>
			<Card.Section withBorder inheritPadding py='md'>
				<Group gap='xs'>
					<ThemeIcon
						size='lg'
						radius='md'
						variant='light'
						color='red'
						className={styles.icon}
					>
						<IconArrowDown size={20} />
					</ThemeIcon>
					<Stack gap={0}>
						<Text fw={700} size='lg'>
							Downtrending Agents
						</Text>
						<Text size='sm' c='dimmed'>
							Agents with declining performance
						</Text>
					</Stack>
				</Group>
			</Card.Section>

			<Card.Section>
				{downtrendingAgents.length > 0 ? (
					<Table striped highlightOnHover className={styles.table}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Agent Name</Table.Th>
								<Table.Th>Recent Score</Table.Th>
								<Table.Th>Previous Score</Table.Th>
								<Table.Th>Trend</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{downtrendingAgents.map((agent) => (
								<Table.Tr key={agent.agentName}>
									<Table.Td fw={500}>{agent.agentName}</Table.Td>
									<Table.Td>
										<Badge variant='light' color='orange' size='sm'>
											{agent.recentScore}%
										</Badge>
									</Table.Td>
									<Table.Td>
										<Badge variant='light' color='gray' size='sm'>
											{agent.previousScore}%
										</Badge>
									</Table.Td>
									<Table.Td>
										<Group gap={4}>
											<IconArrowDown
												size={16}
												color='var(--mantine-color-red-6)'
											/>
											<Badge
												variant='light'
												color={getTrendColor(agent.change)}
												size='sm'
											>
												-{agent.change}%
											</Badge>
										</Group>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				) : (
					<Text p='md' c='dimmed' ta='center'>
						No downtrending agents detected
					</Text>
				)}
			</Card.Section>
		</Card>
	);
};

export default DowntrendingAgentsTable;

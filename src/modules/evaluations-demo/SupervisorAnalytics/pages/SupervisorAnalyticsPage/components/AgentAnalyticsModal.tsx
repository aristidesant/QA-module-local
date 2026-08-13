import React, { useMemo } from 'react';
import {
	Modal,
	Stack,
	Text,
	Title,
	SimpleGrid,
	Table,
	Card,
	Badge,
	Group,
} from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconMinus } from '@tabler/icons-react';
import StatCard from '~/components/StatCard';
import { AgentMetrics, AnalysisType } from '../../../types/supervisorTypes';

interface AgentAnalyticsModalProps {
	agent: AgentMetrics | null;
	analysisType: AnalysisType;
	onClose: () => void;
}

const AgentAnalyticsModal: React.FC<AgentAnalyticsModalProps> = ({
	agent,
	analysisType,
	onClose,
}) => {
	const isOpen = agent !== null;

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

	const trendLabel = useMemo(() => {
		switch (agent?.trend) {
			case 'up':
				return 'Improving';
			case 'down':
				return 'Declining';
			default:
				return 'Stable';
		}
	}, [agent?.trend]);

	const getAnalysisTypeLabel = () => {
		switch (analysisType) {
			case 'qa':
				return 'QA Analysis';
			case 'emotion':
				return 'Emotion & Sentiment';
			case 'compliance':
				return 'Compliance';
			case 'behavioral':
				return 'Behavioral Analysis';
			default:
				return 'Analysis';
		}
	};

	return (
		<Modal
			opened={isOpen}
			onClose={onClose}
			title={
				<Stack gap={0}>
					<Title order={3}>{agent?.agentName}</Title>
					<Text size='sm' c='dimmed'>
						{getAnalysisTypeLabel()} Performance Details
					</Text>
				</Stack>
			}
			size='lg'
			centered
		>
			{agent && (
				<Stack gap='lg'>
					{/* Header Stats */}
					<Card withBorder p='md' radius='md'>
						<Group justify='space-between' mb='md'>
							<div>
								<Text size='sm' c='dimmed'>
									Primary Metric
								</Text>
								<Group gap='xs' mt='xs'>
									<Text fw={700} size='lg'>
										{Math.round(agent.metrics[0]?.value as number)}
									</Text>
									<Group gap={4}>
										{getTrendIcon(agent.trend)}
										<Text size='sm'>{trendLabel}</Text>
									</Group>
								</Group>
							</div>
							<div>
								<Text size='sm' c='dimmed'>
									Calls Evaluated
								</Text>
								<Text fw={700} size='lg' mt='xs'>
									{agent.callCount}
								</Text>
							</div>
						</Group>
					</Card>

					{/* Metric Cards */}
					<div>
						<Text fw={600} size='sm' mb='md'>
							Detailed Metrics
						</Text>
						<SimpleGrid cols={{ base: 2, sm: 2 }} spacing='md'>
							{agent.metrics.map((metric, idx) => (
								<StatCard
									key={idx}
									title={metric.label}
									value={`${metric.value}${metric.suffix ? ` ${metric.suffix}` : ''}`}
								/>
							))}
						</SimpleGrid>
					</div>

					{/* Performance Summary Table */}
					<Card withBorder radius='md'>
						<Card.Section withBorder inheritPadding py='md'>
							<Text fw={600} size='sm'>
								Performance Summary
							</Text>
						</Card.Section>
						<Card.Section>
							<Table striped>
								<Table.Tbody>
									<Table.Tr>
										<Table.Td>
											<Text size='sm' fw={500}>
												Analysis Type
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{getAnalysisTypeLabel()}</Text>
										</Table.Td>
									</Table.Tr>
									<Table.Tr>
										<Table.Td>
											<Text size='sm' fw={500}>
												Performance Status
											</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												color={
													agent.trend === 'up'
														? 'green'
														: agent.trend === 'down'
															? 'red'
															: 'gray'
												}
												variant='light'
											>
												{trendLabel}
											</Badge>
										</Table.Td>
									</Table.Tr>
									<Table.Tr>
										<Table.Td>
											<Text size='sm' fw={500}>
												Total Calls
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{agent.callCount}</Text>
										</Table.Td>
									</Table.Tr>
								</Table.Tbody>
							</Table>
						</Card.Section>
					</Card>

					{/* Info Message */}
					<Card
						withBorder
						p='md'
						radius='md'
						bg='var(--mantine-color-blue-0, var(--mantine-color-blue-9))'
					>
						<Text size='sm' c='blue.7'>
							💡 This agent's detailed call records can be viewed in the full
							analytics page for deeper drill-down into individual calls.
						</Text>
					</Card>
				</Stack>
			)}
		</Modal>
	);
};

export default AgentAnalyticsModal;

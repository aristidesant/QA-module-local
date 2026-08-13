import React, { useMemo, useState } from 'react';
import {
	Card,
	Table,
	Text,
	Badge,
	Group,
	SegmentedControl,
	Center,
} from '@mantine/core';
import { useNavigate } from 'react-router';
import type { DemoAgentCall } from '../../../types';
import styles from './BestWorstCallsPanel.module.css';

interface BestWorstCallsPanelProps {
	calls: DemoAgentCall[];
}

const BestWorstCallsPanel: React.FC<BestWorstCallsPanelProps> = ({ calls }) => {
	const navigate = useNavigate();
	const [viewMode, setViewMode] = useState<'best' | 'worst'>('best');

	const { bestCalls, worstCalls } = useMemo(() => {
		const sorted = [...calls]
			.filter((call) => call.score !== null)
			.sort((a, b) => (b.score as number) - (a.score as number));

		return {
			bestCalls: sorted.slice(0, 5),
			worstCalls: sorted.slice(-5).reverse(),
		};
	}, [calls]);

	const displayCalls = viewMode === 'best' ? bestCalls : worstCalls;

	const getAnalysisTypeLabel = (evaluationType: string): string => {
		switch (evaluationType) {
			case 'QA':
				return 'QA';
			case 'Sentiment Analysis':
				return 'Emotion & Sentiment';
			case 'Compliance':
				return 'Compliance';
			default:
				return evaluationType;
		}
	};

	const getScoreBadgeColor = (isBest: boolean): string => {
		return isBest ? 'green' : 'red';
	};

	return (
		<Card withBorder radius='md' shadow='sm' className={styles.card}>
			<Card.Section withBorder inheritPadding py='md'>
				<Group justify='space-between' align='center'>
					<div>
						<Text fw={700} size='lg'>
							{viewMode === 'best' ? '📈 Best Calls' : '📉 Worst Calls'}
						</Text>
						<Text size='sm' c='dimmed'>
							{viewMode === 'best'
								? `Top ${bestCalls.length} performing calls this week`
								: `Bottom ${worstCalls.length} performing calls this week`}
						</Text>
					</div>
					<SegmentedControl
						value={viewMode}
						onChange={(value) => setViewMode(value as 'best' | 'worst')}
						data={[
							{ label: '📈 Best', value: 'best' },
							{ label: '📉 Worst', value: 'worst' },
						]}
						size='sm'
					/>
				</Group>
			</Card.Section>

			<Card.Section>
				{displayCalls.length > 0 ? (
					<Table striped highlightOnHover className={styles.table}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Call ID</Table.Th>
								<Table.Th>Campaign</Table.Th>
								<Table.Th>Analysis Type</Table.Th>
								<Table.Th>Score</Table.Th>
								<Table.Th>Date & Duration</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{displayCalls.map((call) => (
								<Table.Tr
									key={call.id}
									className={styles.clickableRow}
									onClick={() =>
										navigate(
											`/role-preview/agent-dashboard/evaluations/${call.id}`
										)
									}
								>
									<Table.Td fw={500} className={styles.callId}>
										{call.id}
									</Table.Td>
									<Table.Td fw={500}>{call.campaign}</Table.Td>
									<Table.Td>
										<Text size='sm' c='dimmed'>
											{getAnalysisTypeLabel(call.evaluationType)}
										</Text>
									</Table.Td>
									<Table.Td>
										<Badge
											variant='light'
											color={getScoreBadgeColor(viewMode === 'best')}
											size='sm'
										>
											{call.score}%
										</Badge>
									</Table.Td>
									<Table.Td>
										<Text size='sm' c='dimmed'>
											{call.callDate} • {Math.floor(call.durationSeconds / 60)}m{' '}
											{call.durationSeconds % 60}s
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				) : (
					<Center py='xl'>
						<Text size='sm' c='dimmed'>
							No calls available
						</Text>
					</Center>
				)}
			</Card.Section>
		</Card>
	);
};

export default BestWorstCallsPanel;

import React, { useState } from 'react';
import { Card, Stack, Group, Text, Table, Badge, SegmentedControl, ThemeIcon, Center } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import type { BestWorstCall } from './BestWorstCallsPanel';
import styles from '../Dashboard.module.css';

interface BestWorstCallsTableProps {
	calls: BestWorstCall[];
	/** Row click handler, used to drill into a call from the dashboard */
	onCallClick?: (call: BestWorstCall) => void;
}

/** Formats a duration in seconds as whole minutes */
const formatDuration = (seconds: number): string => `${Math.round(seconds / 60)}m`;

/** Formats an ISO date string as MM/DD */
const formatDate = (dateString: string): string => {
	try {
		return new Date(dateString).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
	} catch {
		return dateString;
	}
};

/**
 * BestWorstCallsTable
 *
 * Replaces the side-by-side BestWorstCallsPanel with a single table whose
 * contents are switched by a segmented control at the top ("Best Calls" /
 * "Worst Calls"). Only one set is visible at a time.
 */
export const BestWorstCallsTable: React.FC<BestWorstCallsTableProps> = ({ calls, onCallClick }) => {
	const [view, setView] = useState<'best' | 'worst'>('best');

	const bestCalls = calls.filter(call => call.type === 'best');
	const worstCalls = calls.filter(call => call.type === 'worst');
	const visibleCalls = view === 'best' ? bestCalls : worstCalls;

	const isBest = view === 'best';
	const accentColor = isBest ? 'green' : 'red';
	const AccentIcon = isBest ? IconTrendingUp : IconTrendingDown;

	return (
		<Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm'>
			<Stack gap='md'>
				<Group justify='space-between' align='center' wrap='wrap'>
					<Group gap='sm' align='center'>
						<ThemeIcon size='lg' color={accentColor} radius='md'>
							<AccentIcon size={20} />
						</ThemeIcon>
						<Badge color={accentColor} variant='light' size='lg'>
							{visibleCalls.length} {isBest ? 'best' : 'worst'} calls
						</Badge>
					</Group>

					<SegmentedControl
						value={view}
						onChange={value => setView(value as 'best' | 'worst')}
						data={[
							{ label: 'Best Calls', value: 'best' },
							{ label: 'Worst Calls', value: 'worst' },
						]}
					/>
				</Group>

				<div style={{ overflowX: 'auto' }}>
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Date</Table.Th>
								<Table.Th>Agent</Table.Th>
								<Table.Th>Duration</Table.Th>
								<Table.Th ta='right'>QA Score</Table.Th>
								<Table.Th ta='right'>Sentiment</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{visibleCalls.length === 0 ? (
								<Table.Tr>
									<Table.Td colSpan={5}>
										<Center p='lg'>
											<Text size='sm' c='dimmed'>
												No {isBest ? 'best' : 'worst'} calls this week
											</Text>
										</Center>
									</Table.Td>
								</Table.Tr>
							) : (
								visibleCalls.map(call => (
									<Table.Tr
										key={call.id}
										onClick={onCallClick ? () => onCallClick(call) : undefined}
										style={onCallClick ? { cursor: 'pointer' } : undefined}
									>
										<Table.Td>
											<Text size='sm' fw={500}>
												{formatDate(call.date)}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm' fw={500}>
												{call.agent}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{formatDuration(call.duration)}</Text>
										</Table.Td>
										<Table.Td ta='right'>
											<Text size='sm' fw={600} c={accentColor}>
												{call.qaScore}%
											</Text>
										</Table.Td>
										<Table.Td ta='right'>
											<Text size='sm' fw={600} c={accentColor}>
												{call.sentiment.toFixed(1)}
											</Text>
										</Table.Td>
									</Table.Tr>
								))
							)}
						</Table.Tbody>
					</Table>
				</div>
			</Stack>
		</Card>
	);
};

export default BestWorstCallsTable;

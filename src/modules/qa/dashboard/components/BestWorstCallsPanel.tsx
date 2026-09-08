import React from 'react';
import {
	Card,
	SimpleGrid,
	Text,
	ThemeIcon,
	Group,
	Stack,
	Badge,
} from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

/**
 * Represents a call for Best/Worst Calls display
 * Extends the concept of CallData with performance metrics
 */
export interface BestWorstCall {
	id: string;
	date: string;
	agent: string;
	duration: number;
	qaScore: number;
	sentiment: number;
	type: 'best' | 'worst';
	ecn?: number;
	enc?: number;
	ecc?: number;
	ecuf?: number;
	compliance?: number;
}

interface BestWorstCallsPanelProps {
	calls: BestWorstCall[];
}

/**
 * Formats the duration in seconds to a readable minutes format
 */
const formatDuration = (seconds: number): string => {
	const minutes = Math.round(seconds / 60);
	return `${minutes}m`;
};

/**
 * Formats a date string to a readable format (MM/DD or just the date part)
 */
const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: '2-digit',
			day: '2-digit',
		});
	} catch {
		return dateString;
	}
};

/**
 * Renders a single call row with appropriate styling
 */
const CallRow: React.FC<{ call: BestWorstCall }> = ({ call }) => {
	const isBest = call.type === 'best';
	const borderColor = isBest
		? 'var(--mantine-color-green-5)'
		: 'var(--mantine-color-red-5)';

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '80px 140px 100px 90px 90px',
				gap: 'var(--mantine-spacing-md)',
				padding: 'var(--mantine-spacing-md)',
				borderLeft: `4px solid ${borderColor}`,
				backgroundColor: 'var(--mantine-color-gray-0)',
				borderRadius: 'var(--mantine-radius-md)',
				alignItems: 'center',
			}}
		>
			<div>
				<Text size="sm" fw={500}>
					{formatDate(call.date)}
				</Text>
			</div>
			<div>
				<Text size="sm" fw={500} truncate>
					{call.agent}
				</Text>
			</div>
			<div>
				<Text size="sm" fw={500}>
					{formatDuration(call.duration)}
				</Text>
			</div>
			<div>
				<Text size="sm" fw={600} c={isBest ? 'green' : 'red'}>
					{call.qaScore}%
				</Text>
			</div>
			<div>
				<Text size="sm" fw={600} c={isBest ? 'green' : 'red'}>
					{call.sentiment.toFixed(1)}
				</Text>
			</div>
		</div>
	);
};

/**
 * Renders a section for either best or worst calls
 */
const CallsSection: React.FC<{
	title: string;
	calls: BestWorstCall[];
	type: 'best' | 'worst';
	emptyStateText: string;
}> = ({ title, calls, type, emptyStateText }) => {
	const isBest = type === 'best';
	const badgeColor = isBest ? 'green' : 'red';
	const iconColor = isBest ? 'green' : 'red';
	const Icon = isBest ? IconTrendingUp : IconTrendingDown;

	return (
		<Card className={styles.metricCard} p="lg" radius="md" withBorder shadow="sm">
			<Stack gap="md">
				{/* Header with title and badge */}
				<Group justify="space-between" align="flex-start">
					<Group gap="sm" align="center">
						<ThemeIcon size="lg" color={iconColor} radius="md">
							<Icon size={20} />
						</ThemeIcon>
						<div>
							<Text fw={600} size="md">
								{title}
							</Text>
						</div>
					</Group>
					<Badge color={badgeColor} variant="filled" size="lg">
						{calls.length}
					</Badge>
				</Group>

				{/* Column headers */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '80px 140px 100px 90px 90px',
						gap: 'var(--mantine-spacing-md)',
						paddingBottom: 'var(--mantine-spacing-sm)',
						borderBottom: '1px solid var(--mantine-color-gray-2)',
					}}
				>
					<Text size="xs" fw={600} c="dimmed" tt="uppercase">
						Date
					</Text>
					<Text size="xs" fw={600} c="dimmed" tt="uppercase">
						Agent
					</Text>
					<Text size="xs" fw={600} c="dimmed" tt="uppercase">
						Duration
					</Text>
					<Text size="xs" fw={600} c="dimmed" tt="uppercase">
						QA Score
					</Text>
					<Text size="xs" fw={600} c="dimmed" tt="uppercase">
						Sentiment
					</Text>
				</div>

				{/* Call rows or empty state */}
				{calls.length === 0 ? (
					<Stack gap="xs" align="center" py="lg">
						<ThemeIcon size="lg" color="gray" radius="md" variant="light">
							{isBest ? <IconTrendingUp size={20} /> : <IconTrendingDown size={20} />}
						</ThemeIcon>
						<Text size="sm" c="dimmed" ta="center">
							{emptyStateText}
						</Text>
					</Stack>
				) : (
					<Stack gap="sm">
						{calls.map((call) => (
							<CallRow key={call.id} call={call} />
						))}
					</Stack>
				)}
			</Stack>
		</Card>
	);
};

/**
 * BestWorstCallsPanel Component
 *
 * Displays a two-column layout (responsive: 1 col on mobile, 2 cols on md+) showing:
 * - Left: Best calls (green styling)
 * - Right: Worst calls (red styling)
 *
 * Each section displays a table-like view with columns for Date, Agent, Duration, QA Score, and Sentiment.
 * Calls are filtered by their type ('best' or 'worst') from the input array.
 */
export const BestWorstCallsPanel: React.FC<BestWorstCallsPanelProps> = ({
	calls,
}) => {
	// Filter calls by type
	const bestCalls = calls.filter((call) => call.type === 'best');
	const worstCalls = calls.filter((call) => call.type === 'worst');

	return (
		<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
			<CallsSection
				title="Best Calls"
				calls={bestCalls}
				type="best"
				emptyStateText="No best calls this week"
			/>
			<CallsSection
				title="Worst Calls"
				calls={worstCalls}
				type="worst"
				emptyStateText="No worst calls this week"
			/>
		</SimpleGrid>
	);
};

export default BestWorstCallsPanel;

import React from 'react';
import {
	Card,
	Table,
	Stack,
	Text,
	ThemeIcon,
	Badge,
} from '@mantine/core';
import { IconAlertTriangle, IconAlertCircle } from '@tabler/icons-react';
import type { CriticalIssue } from '../mockData';
import styles from '../Dashboard.module.css';

interface CriticalIssuesTableProps {
	issues: CriticalIssue[];
	/**
	 * Row click handler. When provided, rows become interactive (pointer cursor,
	 * keyboard focusable) and are typically wired to the role's inbox.
	 */
	onIssueClick?: (issue: CriticalIssue) => void;
}

/**
 * Gets color for severity level
 */
const getSeverityColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
	switch (severity) {
		case 'critical':
			return 'red';
		case 'high':
			return 'orange';
		case 'medium':
			return 'yellow';
		case 'low':
			return 'blue';
		default:
			return 'gray';
	}
};

/**
 * Gets icon for severity level
 */
const getSeverityIcon = (severity: 'critical' | 'high' | 'medium' | 'low') => {
	if (severity === 'critical' || severity === 'high') {
		return <IconAlertCircle size={16} />;
	}
	return <IconAlertTriangle size={16} />;
};

/**
 * Formats a date string to readable format
 */
const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return dateString;
	}
};

/**
 * CriticalIssuesTable Component
 *
 * Displays critical issues in a table format with:
 * - Title and description
 * - Severity level with color-coded badge
 * - Affected count
 * - Timestamp
 */
export const CriticalIssuesTable: React.FC<CriticalIssuesTableProps> = ({
	issues,
	onIssueClick,
}) => {
	if (issues.length === 0) {
		return (
			<Card className={styles.metricCard} p="lg" radius="md" withBorder>
				<Stack gap="md" align="center" py="lg">
					<ThemeIcon size="lg" color="green" radius="md" variant="light">
						<IconAlertTriangle size={20} />
					</ThemeIcon>
					<Text size="sm" c="dimmed" ta="center">
						No critical issues detected. Keep up the great work!
					</Text>
				</Stack>
			</Card>
		);
	}

	return (
		<Card className={styles.metricCard} p="lg" radius="md" withBorder shadow="sm">
			<Stack gap="md">
				<div style={{ overflowX: 'auto' }}>
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Issue</Table.Th>
								<Table.Th>Severity</Table.Th>
								<Table.Th>Affected</Table.Th>
								<Table.Th>Timestamp</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{issues.map((issue) => (
								<Table.Tr
									key={issue.id}
									onClick={onIssueClick ? () => onIssueClick(issue) : undefined}
									onKeyDown={
										onIssueClick
											? (event) => {
													if (event.key === 'Enter' || event.key === ' ') {
														event.preventDefault();
														onIssueClick(issue);
													}
												}
											: undefined
									}
									tabIndex={onIssueClick ? 0 : undefined}
									role={onIssueClick ? 'button' : undefined}
									style={onIssueClick ? { cursor: 'pointer' } : undefined}
								>
									<Table.Td>
										<Stack gap="xs">
											<Text size="sm" fw={600}>
												{issue.title}
											</Text>
											<Text size="xs" c="dimmed">
												{issue.description}
											</Text>
										</Stack>
									</Table.Td>
									<Table.Td>
										<Badge
											color={getSeverityColor(issue.severity)}
											variant="filled"
											size="sm"
											leftSection={getSeverityIcon(issue.severity)}
										>
											{issue.severity.charAt(0).toUpperCase() +
												issue.severity.slice(1)}
										</Badge>
									</Table.Td>
									<Table.Td>
										<Text size="sm" fw={600}>
											{issue.affectedCount}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size="xs" c="dimmed">
											{formatDate(issue.timestamp)}
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</div>
			</Stack>
		</Card>
	);
};

export default CriticalIssuesTable;

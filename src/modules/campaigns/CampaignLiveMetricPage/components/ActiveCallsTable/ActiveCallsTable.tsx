import { Table, Badge, Text, Box } from '@mantine/core';
import styles from './ActiveCallsTable.module.css';

export interface ActiveCall {
	station: string;
	user: string;
	sessionId: string;
	status: string;
	pause: string;
	mmss: string;
	campaign: string;
	calls: number;
	hold: string;
	inGroup: string;
}

interface ActiveCallsTableProps {
	calls: ActiveCall[];
}

const getStatusColor = (status: string): string => {
	switch (status.toLowerCase()) {
		case 'incall':
			return 'green';
		case 'paused':
			return 'yellow';
		case 'waiting':
			return 'blue';
		default:
			return 'gray';
	}
};

export const ActiveCallsTable = ({ calls }: ActiveCallsTableProps) => {
	return (
		<Box className={styles.tableContainer}>
			<Table className={styles.table} striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Station</Table.Th>
						<Table.Th>User</Table.Th>
						<Table.Th>Session ID</Table.Th>
						<Table.Th>Status</Table.Th>
						<Table.Th>Pause</Table.Th>
						<Table.Th>MM:SS</Table.Th>
						<Table.Th>Campaign</Table.Th>
						<Table.Th>Calls</Table.Th>
						<Table.Th>Hold</Table.Th>
						<Table.Th>In-Group</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{calls.map((call, index) => (
						<Table.Tr key={`${call.sessionId}-${index}`}>
							<Table.Td>
								<Text size='sm'>{call.station}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{call.user}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm' c='dimmed'>
									{call.sessionId}
								</Text>
							</Table.Td>
							<Table.Td>
								<Badge
									color={getStatusColor(call.status)}
									variant='light'
									size='sm'
								>
									{call.status}
								</Badge>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{call.pause}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{call.mmss}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{call.campaign}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{call.calls}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{call.hold}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{call.inGroup}</Text>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
			{calls.length === 0 && (
				<Box p='xl' className={styles.emptyState}>
					<Text c='dimmed' ta='center'>
						No active calls
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default ActiveCallsTable;

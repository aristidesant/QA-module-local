import { Skeleton, Group, Table } from '@mantine/core';
import styles from '../ContactListOverview.module.css';

interface ContactListSkeletonProps {
	rows?: number;
}

export const ContactListSkeleton: React.FC<ContactListSkeletonProps> = ({
	rows = 10,
}) => {
	return (
		<Table className={styles.table} striped>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Name</Table.Th>
					<Table.Th>Primary number</Table.Th>
					<Table.Th>Email</Table.Th>
					<Table.Th>Status</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{Array.from({ length: rows }).map((_, index) => (
					<Table.Tr key={index}>
						{/* Name column with avatar */}
						<Table.Td>
							<Group gap='sm'>
								<Skeleton height={32} width={32} radius='sm' />
								<Skeleton height={16} width={120} radius='sm' />
							</Group>
						</Table.Td>

						{/* Primary number column with badges */}
						<Table.Td>
							<Group gap={4}>
								<Skeleton height={24} width={100} radius='sm' />
								<Skeleton height={24} width={100} radius='sm' />
							</Group>
						</Table.Td>

						{/* Email column */}
						<Table.Td>
							<Skeleton height={16} width={150} radius='sm' />
						</Table.Td>

						{/* Status column */}
						<Table.Td>
							<Skeleton height={24} width={80} radius='sm' />
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
};

export default ContactListSkeleton;

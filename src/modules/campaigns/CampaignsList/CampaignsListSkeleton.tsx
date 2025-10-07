import React from 'react';
import { Skeleton, Table } from '@mantine/core';
import styles from './CampaignsList.module.css';

const CampaignsListSkeleton: React.FC = () => {
	const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

	return (
		<div className={styles.tableWrapper}>
			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th style={{ width: 300 }}>
							<Skeleton height={16} width={80} />
						</Table.Th>
						<Table.Th style={{ width: 120 }}>
							<Skeleton height={16} width={40} />
						</Table.Th>
						<Table.Th style={{ width: 120 }}>
							<Skeleton height={16} width={50} />
						</Table.Th>
						<Table.Th style={{ width: 150 }}>
							<Skeleton height={16} width={60} />
						</Table.Th>
						<Table.Th style={{ width: 100 }}>
							<Skeleton height={16} width={40} />
						</Table.Th>
						<Table.Th style={{ width: 150 }}>
							<Skeleton height={16} width={50} />
						</Table.Th>
						<Table.Th style={{ width: 60 }}>
							<Skeleton height={16} width={20} />
						</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{skeletonRows.map((row) => (
						<Table.Tr key={row}>
							<Table.Td>
								<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
									<Skeleton circle height={24} width={24} />
									<div>
										<Skeleton height={14} width={120} />
										<Skeleton height={12} width={180} mt={4} />
									</div>
								</div>
							</Table.Td>
							<Table.Td>
								<Skeleton height={20} width={80} radius='lg' />
							</Table.Td>
							<Table.Td>
								<Skeleton height={20} width={70} radius='sm' />
							</Table.Td>
							<Table.Td>
								<div>
									<Skeleton height={8} width={120} radius='xl' />
									<Skeleton height={12} width={30} mt={4} />
								</div>
							</Table.Td>
							<Table.Td>
								<Skeleton circle height={40} width={40} />
							</Table.Td>
							<Table.Td>
								<div style={{ display: 'flex', gap: 4 }}>
									<Skeleton circle height={24} width={24} />
									<Skeleton circle height={24} width={24} />
									<Skeleton circle height={24} width={24} />
								</div>
							</Table.Td>
							<Table.Td>
								<Skeleton height={16} width={16} />
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</div>
	);
};

export default CampaignsListSkeleton;

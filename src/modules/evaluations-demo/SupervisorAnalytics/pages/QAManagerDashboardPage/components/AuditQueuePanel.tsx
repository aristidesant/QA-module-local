import React from 'react';
import { Table, Text, Badge } from '@mantine/core';
import SectionCard from '~/components/SectionCard';

interface Dispute {
	id: string;
	agentId: string;
	agentName: string;
	evaluationScore: number;
	evaluationDate: string;
	submittedDate: string;
	status: 'pending' | 'in-review' | 'resolved';
	reason: string;
}

interface AuditQueuePanelProps {
	disputes: Dispute[];
}

const AuditQueuePanel: React.FC<AuditQueuePanelProps> = ({ disputes }) => {

	return (
		<SectionCard
			title='Evaluation Disputes'
			description='Recent disputes submitted by agents and supervisors for evaluation corrections'
		>
			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Agent ID</Table.Th>
						<Table.Th>Agent Name</Table.Th>
						<Table.Th>Evaluation Score</Table.Th>
						<Table.Th>Evaluation Date</Table.Th>
						<Table.Th>Submitted Date</Table.Th>
						<Table.Th>Reason</Table.Th>
						<Table.Th>Status</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{disputes.map((dispute) => (
						<Table.Tr
							key={dispute.id}
							onClick={() => {
								// Navigate to dispute detail page or show detail modal
								console.log('Clicked dispute:', dispute.id);
							}}
							style={{ cursor: 'pointer' }}
						>
							<Table.Td>
								<Text fw={500} size='sm'>{dispute.agentId}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{dispute.agentName}</Text>
							</Table.Td>
							<Table.Td>
								<Text fw={500} size='sm'>{dispute.evaluationScore}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{dispute.evaluationDate}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{dispute.submittedDate}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm' c='dimmed'>{dispute.reason}</Text>
							</Table.Td>
							<Table.Td>
								<Badge
									color='gray'
									variant='light'
									size='sm'
								>
									Open
								</Badge>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</SectionCard>
	);
};

export default AuditQueuePanel;

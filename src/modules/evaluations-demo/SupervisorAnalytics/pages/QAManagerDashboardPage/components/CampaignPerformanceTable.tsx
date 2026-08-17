import React from 'react';
import { Table, Badge, Stack, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';

interface CampaignRow {
	id: string;
	name: string;
	callVolume: number;
	complianceViolations: number;
	performance: 'best' | 'lowest';
}

interface CampaignPerformanceTableProps {
	bestPerforming: CampaignRow[];
	lowestPerforming: CampaignRow[];
}

const CampaignPerformanceTable: React.FC<CampaignPerformanceTableProps> = ({
	bestPerforming,
	lowestPerforming,
}) => {
	return (
		<SectionCard
			title='Campaign Performance'
			description='Best and lowest performing campaigns'
		>
			<Stack gap='md'>
				<div>
					<Text size='xs' c='dimmed' fw={600} mb='xs'>
						TOP PERFORMERS
					</Text>
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Campaign</Table.Th>
								<Table.Th align='right'>Call Volume</Table.Th>
								<Table.Th align='right'>Violations</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{bestPerforming.map((campaign) => (
								<Table.Tr key={campaign.id}>
									<Table.Td>
										<Text size='sm' fw={500}>
											{campaign.name}
										</Text>
									</Table.Td>
									<Table.Td align='right'>
										<Text size='sm'>
											{campaign.callVolume.toLocaleString()}
										</Text>
									</Table.Td>
									<Table.Td align='right'>
										<Badge size='sm' variant='light' color='green'>
											{campaign.complianceViolations}
										</Badge>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</div>

				<div>
					<Text size='xs' c='dimmed' fw={600} mb='xs'>
						NEEDS ATTENTION
					</Text>
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Campaign</Table.Th>
								<Table.Th align='right'>Call Volume</Table.Th>
								<Table.Th align='right'>Violations</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{lowestPerforming.map((campaign) => (
								<Table.Tr key={campaign.id}>
									<Table.Td>
										<Text size='sm' fw={500}>
											{campaign.name}
										</Text>
									</Table.Td>
									<Table.Td align='right'>
										<Text size='sm'>
											{campaign.callVolume.toLocaleString()}
										</Text>
									</Table.Td>
									<Table.Td align='right'>
										<Badge size='sm' variant='light' color='red'>
											{campaign.complianceViolations}
										</Badge>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</div>
			</Stack>
		</SectionCard>
	);
};

export default CampaignPerformanceTable;

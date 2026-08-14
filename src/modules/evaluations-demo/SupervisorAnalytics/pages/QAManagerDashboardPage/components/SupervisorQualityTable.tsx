import React from 'react';
import { Table, Badge, Text, Progress, Avatar, Group } from '@mantine/core';
import SectionCard from '~/components/SectionCard';

interface Supervisor {
	id: string;
	name: string;
	teamSize: number;
	complianceAdherence: number;
	emotionScore: number;
	sentimentScore: number;
	uptrendingAgentsPercent: number;
	avatar: string;
	status: 'strong' | 'caution' | 'at-risk';
}

interface SupervisorQualityTableProps {
	supervisors: Supervisor[];
	onSelectSupervisor: (id: string) => void;
}

const SupervisorQualityTable: React.FC<SupervisorQualityTableProps> = ({
	supervisors,
	onSelectSupervisor,
}) => {
	const getStatusColor = (status: Supervisor['status']) => {
		switch (status) {
			case 'strong':
				return 'green';
			case 'caution':
				return 'yellow';
			case 'at-risk':
				return 'red';
		}
	};

	const getStatusLabel = (status: Supervisor['status']) => {
		switch (status) {
			case 'strong':
				return 'Strong';
			case 'caution':
				return 'Needs Attention';
			case 'at-risk':
				return 'At Risk';
		}
	};

	return (
		<SectionCard
			title='Supervisor Quality Scorecard'
			description='Ranked supervisors by compliance, emotion/sentiment, and coaching effectiveness'
		>
			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Supervisor</Table.Th>
						<Table.Th>Team Size</Table.Th>
						<Table.Th>Compliance Adherence</Table.Th>
						<Table.Th>Emotion Score</Table.Th>
						<Table.Th>Sentiment Score</Table.Th>
						<Table.Th>Uptrending Agents</Table.Th>
						<Table.Th>Status</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{supervisors.map((supervisor) => (
						<Table.Tr
							key={supervisor.id}
							onClick={() => onSelectSupervisor(supervisor.id)}
							style={{ cursor: 'pointer' }}
						>
							<Table.Td>
								<Group gap='sm'>
									<Avatar src={supervisor.avatar} name={supervisor.name} size='sm' />
									<Text fw={500}>{supervisor.name}</Text>
								</Group>
							</Table.Td>
							<Table.Td>{supervisor.teamSize}</Table.Td>
							<Table.Td>
								<div>
									<Text size='sm' fw={500} mb={4}>
										{supervisor.complianceAdherence}%
									</Text>
									<Progress
										value={supervisor.complianceAdherence}
										color={
											supervisor.complianceAdherence >= 90
												? 'green'
												: supervisor.complianceAdherence >= 75
												? 'yellow'
												: 'red'
										}
										size='xs'
									/>
								</div>
							</Table.Td>
							<Table.Td>
								<Text size='sm' fw={500}>
									{supervisor.emotionScore.toFixed(1)}/10
								</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm' fw={500}>
									{supervisor.sentimentScore.toFixed(1)}/10
								</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm' fw={500}>
									{supervisor.uptrendingAgentsPercent}%
								</Text>
							</Table.Td>
							<Table.Td>
								<Badge
									color={getStatusColor(supervisor.status)}
									variant='light'
									size='sm'
								>
									{getStatusLabel(supervisor.status)}
								</Badge>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</SectionCard>
	);
};

export default SupervisorQualityTable;

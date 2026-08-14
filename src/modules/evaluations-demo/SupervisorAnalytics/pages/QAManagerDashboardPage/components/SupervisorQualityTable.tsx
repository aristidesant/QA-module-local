import React from 'react';
import { Table, Badge, Text, Progress, Avatar, Group } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import type { Emotion } from '../../../../components/SentimentAnalysisView/types';

interface Supervisor {
	id: string;
	name: string;
	teamSize: number;
	complianceAdherence: number;
	emotionScore: number;
	uptrendingAgentsPercent: number;
	qaAnalysisScore: number;
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

	// Calculate predominant emotion from emotion score
	const getPredominantEmotion = (score: number) => {
		let emotion: Emotion = 'neutral';
		if (score >= 85) {
			emotion = Math.random() > 0.5 ? 'satisfaction' : 'excitement';
		} else if (score >= 70) {
			emotion = 'satisfaction';
		} else if (score >= 50) {
			emotion = 'neutral';
		} else if (score >= 30) {
			emotion = 'frustration';
		} else {
			emotion = 'anger';
		}
		return emotion;
	};

	return (
		<SectionCard
			title='Supervisor Quality Scorecard'
			description='Ranked supervisors by compliance, predominant emotion, QA analysis, and coaching effectiveness'
		>
			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Supervisor</Table.Th>
						<Table.Th>Team Size</Table.Th>
						<Table.Th>Compliance Adherence</Table.Th>
						<Table.Th>Predominant Emotion</Table.Th>
						<Table.Th>QA Analysis Score</Table.Th>
						<Table.Th>Status</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{supervisors.map((supervisor) => {
						const dominantEmotion = getPredominantEmotion(
							supervisor.emotionScore
						);
						const emotionPercentage = Math.round(
							(supervisor.emotionScore / 10) * 100
						);

						return (
							<Table.Tr
								key={supervisor.id}
								onClick={() => onSelectSupervisor(supervisor.id)}
								// inline-style-allow: cursor pointer for clickable row
								style={{ cursor: 'pointer' }}
							>
								<Table.Td>
									<Group gap='sm'>
										<Avatar
											src={supervisor.avatar}
											name={supervisor.name}
											size='sm'
										/>
										<Text fw={500}>{supervisor.name}</Text>
									</Group>
								</Table.Td>
								<Table.Td>{supervisor.teamSize}</Table.Td>
								<Table.Td>
									<div>
										<Text size='sm' fw={500} mb={4}>
											{supervisor.complianceAdherence}
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
										{dominantEmotion.charAt(0).toUpperCase() +
											dominantEmotion.slice(1)}{' '}
										{emotionPercentage}%
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm' fw={500}>
										{supervisor.qaAnalysisScore}
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
						);
					})}
				</Table.Tbody>
			</Table>
		</SectionCard>
	);
};

export default SupervisorQualityTable;

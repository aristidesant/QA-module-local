import React from 'react';
import { Text, Progress, Group, Table } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import type { Emotion } from '../../../../components/SentimentAnalysisView/types';

interface CampaignAnalytic {
	id: string;
	name: string;
	compliance: number;
	emotion: number;
	affectedSupervisors: string[];
	trend: Array<{ week: string; value: number }>;
}

interface AnalyticsPanelProps {
	analytics: {
		campaigns: CampaignAnalytic[];
	};
	dateRange: '1w' | '2w' | '4w';
	onDateRangeChange: (range: '1w' | '2w' | '4w') => void;
	selectedSupervisor: string | null;
	selectedCampaign: string | null;
	onCampaignChange: (id: string | null) => void;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ analytics }) => {
	const getComplianceColor = (value: number) => {
		if (value >= 90) return 'green';
		if (value >= 75) return 'yellow';
		return 'red';
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
			title='QA Analytics'
			description='Campaign performance and evaluation metrics'
		>
			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Campaign</Table.Th>
						<Table.Th>Compliance %</Table.Th>
						<Table.Th>Predominant Emotion</Table.Th>
						<Table.Th>Supervisors</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{analytics.campaigns.map((campaign) => {
						const dominantEmotion = getPredominantEmotion(campaign.emotion);
						return (
							<Table.Tr key={campaign.id}>
								<Table.Td>{campaign.name}</Table.Td>
								<Table.Td>
									<Group gap='xs'>
										<Progress
											value={campaign.compliance}
											color={getComplianceColor(campaign.compliance)}
											size='sm'
											// inline-style-allow: flex sizing for responsive progress
											style={{ flex: 1 }}
										/>
										<Text
											size='sm'
											fw={500}
											// inline-style-allow: width constraint for text label
											style={{ minWidth: 40 }}
										>
											{campaign.compliance}%
										</Text>
									</Group>
								</Table.Td>
								<Table.Td>
									<Text size='sm' fw={500}>
										{dominantEmotion.charAt(0).toUpperCase() +
											dominantEmotion.slice(1)}
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size='xs'>
										{campaign.affectedSupervisors.join(', ')}
									</Text>
								</Table.Td>
							</Table.Tr>
						);
					})}
				</Table.Tbody>
			</Table>
		</SectionCard>
	);
};

export default AnalyticsPanel;

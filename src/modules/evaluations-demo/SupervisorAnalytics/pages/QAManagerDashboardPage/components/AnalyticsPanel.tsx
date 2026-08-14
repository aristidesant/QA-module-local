import React from 'react';
import { SimpleGrid, Card, Text, Progress, Group, Table, Tabs } from '@mantine/core';
import SectionCard from '~/components/SectionCard';

interface KpiData {
	compliance: number;
	emotion: number;
	sentiment: number;
}

interface SupervisorAnalytic {
	id: string;
	name: string;
	compliance: number;
	emotion: number;
	sentiment: number;
	trend: Array<{ week: string; value: number }>;
}

interface CampaignAnalytic {
	id: string;
	name: string;
	compliance: number;
	emotion: number;
	sentiment: number;
	affectedSupervisors: string[];
	trend: Array<{ week: string; value: number }>;
}

interface AnalyticsPanelProps {
	analytics: {
		kpi: KpiData;
		supervisors: SupervisorAnalytic[];
		campaigns: CampaignAnalytic[];
	};
	dateRange: '1w' | '2w' | '4w';
	onDateRangeChange: (range: '1w' | '2w' | '4w') => void;
	selectedSupervisor: string | null;
	selectedCampaign: string | null;
	onCampaignChange: (id: string | null) => void;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
	analytics,
}) => {
	const getComplianceColor = (value: number) => {
		if (value >= 90) return 'green';
		if (value >= 75) return 'yellow';
		return 'red';
	};

	return (
		<SectionCard
			title='QA Analytics'
			description='Evaluation data broken down by supervisor team and campaign'
		>
			<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md' mb='lg'>
				<Card withBorder>
					<Text size='sm' c='dimmed' fw={500} mb='sm'>
						System Compliance
					</Text>
					<Group justify='space-between' align='center' mb='sm'>
						<Text size='xl' fw={700}>
							{analytics.kpi.compliance}%
						</Text>
					</Group>
					<Progress value={analytics.kpi.compliance} color={getComplianceColor(analytics.kpi.compliance)} size='sm' />
				</Card>

				<Card withBorder>
					<Text size='sm' c='dimmed' fw={500} mb='sm'>
						Overall Emotion
					</Text>
					<Group justify='space-between' align='center' mb='sm'>
						<Text size='xl' fw={700}>
							{Math.round(analytics.kpi.emotion * 10)}%
						</Text>
					</Group>
					<Progress value={Math.round(analytics.kpi.emotion * 10)} color='blue' size='sm' />
				</Card>

				<Card withBorder>
					<Text size='sm' c='dimmed' fw={500} mb='sm'>
						Overall Sentiment
					</Text>
					<Group justify='space-between' align='center' mb='sm'>
						<Text size='xl' fw={700}>
							{Math.round(analytics.kpi.sentiment * 10)}%
						</Text>
					</Group>
					<Progress value={Math.round(analytics.kpi.sentiment * 10)} color='cyan' size='sm' />
				</Card>
			</SimpleGrid>

			<Tabs defaultValue='supervisors'>
				<Tabs.List>
					<Tabs.Tab value='supervisors'>By Supervisor</Tabs.Tab>
					<Tabs.Tab value='campaigns'>By Campaign</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='supervisors' pt='md'>
					<Table striped highlightOnHover size='sm'>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Supervisor</Table.Th>
								<Table.Th>Compliance %</Table.Th>
								<Table.Th>Emotion</Table.Th>
								<Table.Th>Sentiment</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{analytics.supervisors.map((supervisor) => (
								<Table.Tr key={supervisor.id}>
									<Table.Td>{supervisor.name}</Table.Td>
									<Table.Td>
										<Group gap='xs'>
											<Progress
												value={supervisor.compliance}
												color={getComplianceColor(supervisor.compliance)}
												size='sm'
												style={{ flex: 1 }}
											/>
											<Text size='sm' fw={500} style={{ minWidth: 40 }}>
												{supervisor.compliance}%
											</Text>
										</Group>
									</Table.Td>
									<Table.Td>
										<Text size='sm' fw={500}>
											{supervisor.emotion.toFixed(1)}/10
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size='sm' fw={500}>
											{supervisor.sentiment.toFixed(1)}/10
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Tabs.Panel>

				<Tabs.Panel value='campaigns' pt='md'>
					<Table striped highlightOnHover size='sm'>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Campaign</Table.Th>
								<Table.Th>Compliance %</Table.Th>
								<Table.Th>Emotion</Table.Th>
								<Table.Th>Sentiment</Table.Th>
								<Table.Th>Supervisors</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{analytics.campaigns.map((campaign) => (
								<Table.Tr key={campaign.id}>
									<Table.Td>{campaign.name}</Table.Td>
									<Table.Td>
										<Group gap='xs'>
											<Progress
												value={campaign.compliance}
												color={getComplianceColor(campaign.compliance)}
												size='sm'
												style={{ flex: 1 }}
											/>
											<Text size='sm' fw={500} style={{ minWidth: 40 }}>
												{campaign.compliance}%
											</Text>
										</Group>
									</Table.Td>
									<Table.Td>
										<Text size='sm' fw={500}>
											{campaign.emotion.toFixed(1)}/10
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size='sm' fw={500}>
											{campaign.sentiment.toFixed(1)}/10
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size='xs'>
											{campaign.affectedSupervisors.join(', ')}
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Tabs.Panel>
			</Tabs>
		</SectionCard>
	);
};

export default AnalyticsPanel;

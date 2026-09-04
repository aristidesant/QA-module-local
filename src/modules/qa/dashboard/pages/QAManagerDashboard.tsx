import React, { useState } from 'react';
import { Stack, Title, Text, SimpleGrid, Tabs, Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { DashboardMetricCard, ProfileBadge, AlertsInbox } from '../components';
import BaseTable from '~/components/BaseTable/BaseTable';
import DashboardRoleGuard from '../components/DashboardRoleGuard';

interface Dispute {
	id: number;
	agentName: string;
	type: string;
	status: 'pending' | 'approved' | 'rejected';
	createdDate: string;
}

interface Campaign {
	id: number;
	name: string;
	status: 'active' | 'archived';
	callsCount: number;
	createdDate: string;
}

const QAManagerDashboard: React.FC = () => {
	const [alerts, setAlerts] = useState([
		{
			id: 1,
			title: 'New Disputes to Review',
			description: '3 new disputes submitted this week',
			severity: 'medium' as const,
			timestamp: '30 mins ago',
			read: false,
		},
		{
			id: 2,
			title: 'Compliance Spike',
			description: 'Regulatory violations up 8% this week',
			severity: 'high' as const,
			timestamp: '2 hours ago',
			read: false,
		},
	]);

	const disputes: Dispute[] = [
		{
			id: 101,
			agentName: 'Sarah Johnson',
			type: 'QA Score Challenge',
			status: 'pending',
			createdDate: 'Today',
		},
		{
			id: 102,
			agentName: 'Mike Chen',
			type: 'Sentiment Disagreement',
			status: 'pending',
			createdDate: 'Yesterday',
		},
		{
			id: 103,
			agentName: 'Emily Watson',
			type: 'Compliance Question',
			status: 'approved',
			createdDate: '2 days ago',
		},
	];

	const campaigns: Campaign[] = [
		{
			id: 1,
			name: 'Q3 Customer Service',
			status: 'active',
			callsCount: 847,
			createdDate: 'Aug 1, 2026',
		},
		{
			id: 2,
			name: 'Sales Training',
			status: 'active',
			callsCount: 432,
			createdDate: 'Aug 10, 2026',
		},
		{
			id: 3,
			name: 'Q2 Training Program',
			status: 'archived',
			callsCount: 623,
			createdDate: 'Jun 1, 2026',
		},
	];

	return (
		<DashboardRoleGuard>
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>QA Manager Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Manage evaluations, campaigns, and disputes
					</Text>
				</div>

				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md'>
					<DashboardMetricCard
						label='Evaluations Today'
						value={24}
						trend='up'
						trendValue='+8 vs yesterday'
					/>
					<DashboardMetricCard
						label='Disputes Pending'
						value={3}
						trend='down'
						trendValue='-1 vs last week'
						color='orange'
					/>
					<DashboardMetricCard
						label='Quality Score'
						value={81.5}
						unit='%'
						progress={81}
						trend='up'
						trendValue='+2% vs last week'
						color='green'
					/>
					<DashboardMetricCard
						label='Active Campaigns'
						value={2}
						trend='up'
						trendValue='2 new this month'
					/>
				</SimpleGrid>

				<AlertsInbox
					alerts={alerts}
					onMarkAsRead={id =>
						setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)))
					}
					onDismiss={id => setAlerts(prev => prev.filter(a => a.id !== id))}
				/>

				<Tabs defaultValue='disputes'>
					<Tabs.List>
						<Tabs.Tab value='disputes'>Disputes</Tabs.Tab>
						<Tabs.Tab value='campaigns'>Campaigns</Tabs.Tab>
						<Tabs.Tab value='evaluations'>Evaluations</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='disputes' pt='lg'>
						<SectionCard
							title='Pending Disputes'
							description='Disputes awaiting your review'
						>
							<BaseTable
								columns={[
									{
										key: 'agentName',
										title: 'Agent',
										render: r => r.agentName,
									},
									{
										key: 'type',
										title: 'Type',
										render: r => r.type,
									},
									{
										key: 'status',
										title: 'Status',
										render: r => r.status,
									},
									{
										key: 'date',
										title: 'Date',
										render: r => r.createdDate,
									},
								]}
								data={disputes}
								onRowClick={(dispute: Dispute) => {
									console.log('Viewing dispute:', dispute.id);
								}}
							/>
						</SectionCard>
					</Tabs.Panel>

					<Tabs.Panel value='campaigns' pt='lg'>
						<SectionCard
							title='Campaigns'
							description='Manage evaluation campaigns'
						>
							<Stack gap='sm'>
								<Group justify='flex-end' mb='md'>
									<Button leftSection={<IconPlus size={14} />}>
										New Campaign
									</Button>
								</Group>
								<BaseTable
									columns={[
										{
											key: 'name',
											title: 'Campaign Name',
											render: r => r.name,
										},
										{
											key: 'status',
											title: 'Status',
											render: r => r.status,
										},
										{
											key: 'calls',
											title: 'Calls',
											render: r => r.callsCount,
										},
										{
											key: 'date',
											title: 'Created',
											render: r => r.createdDate,
										},
									]}
									data={campaigns}
									onRowClick={(campaign: Campaign) => {
										console.log('Viewing campaign:', campaign.id);
									}}
								/>
							</Stack>
						</SectionCard>
					</Tabs.Panel>

					<Tabs.Panel value='evaluations' pt='lg'>
						<SectionCard
							title="Today's Evaluations"
							description='Evaluations pending completion'
						>
							<Stack gap='sm'>
								{[1, 2, 3].map(i => (
									<ProfileBadge
										key={i}
										name={`Evaluation #${10000 + i}`}
										role='Agent: Sarah Johnson'
										status='active'
										onClick={() =>
											console.log('Evaluate call')
										}
									/>
								))}
							</Stack>
						</SectionCard>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
		</DashboardRoleGuard>
	);
};

export default QAManagerDashboard;

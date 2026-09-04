import React, { useState } from 'react';
import { Stack, Title, Text, SimpleGrid, Tabs } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { DashboardMetricCard, ProfileBadge, AlertsInbox } from '../components';
import BaseTable from '~/components/BaseTable/BaseTable';

interface TeamMember {
	id: number;
	name: string;
	score: number;
	callsThisWeek: number;
	sentiment: string;
	compliance: number;
}

const SupervisorDashboard: React.FC = () => {
	const [alerts, setAlerts] = useState([
		{
			id: 1,
			title: 'Agent Alert: Low Performance',
			description: 'Sarah Johnson QA score dropped to 65%',
			severity: 'high' as const,
			timestamp: '1 hour ago',
			read: false,
		},
	]);

	const teamMembers: TeamMember[] = [
		{
			id: 1,
			name: 'Sarah Johnson',
			score: 65,
			callsThisWeek: 18,
			sentiment: 'Neutral',
			compliance: 92,
		},
		{
			id: 2,
			name: 'Mike Chen',
			score: 88,
			callsThisWeek: 22,
			sentiment: 'Positive',
			compliance: 98,
		},
		{
			id: 3,
			name: 'Emily Watson',
			score: 82,
			callsThisWeek: 20,
			sentiment: 'Positive',
			compliance: 95,
		},
	];

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Team Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Manage and monitor your team's performance
					</Text>
				</div>

				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md'>
					<DashboardMetricCard
						label='Team QA Average'
						value={78.3}
						unit='%'
						progress={78}
						trend='up'
						trendValue='+2.1% vs last week'
						color='blue'
					/>
					<DashboardMetricCard
						label='Team Sentiment'
						value='Positive'
						progress={76}
						trend='up'
						trendValue='+4% vs last week'
						color='green'
					/>
					<DashboardMetricCard
						label='Compliance'
						value={95}
						unit='%'
						progress={95}
						color='orange'
					/>
					<DashboardMetricCard
						label='Total Calls'
						value={60}
						trend='up'
						trendValue='+10 vs last week'
					/>
				</SimpleGrid>

				<AlertsInbox
					alerts={alerts}
					onMarkAsRead={id =>
						setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)))
					}
					onDismiss={id => setAlerts(prev => prev.filter(a => a.id !== id))}
				/>

				<Tabs defaultValue='team'>
					<Tabs.List>
						<Tabs.Tab value='team'>Team Members</Tabs.Tab>
						<Tabs.Tab value='disputes'>Disputes</Tabs.Tab>
						<Tabs.Tab value='reports'>Reports</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='team' pt='lg'>
						<SectionCard title='Team Performance' description='All team members'>
							<BaseTable
								columns={[
									{ key: 'name', title: 'Name', render: r => r.name },
									{
										key: 'score',
										title: 'QA Score',
										render: r => `${r.score}%`,
									},
									{
										key: 'sentiment',
										title: 'Sentiment',
										render: r => r.sentiment,
									},
									{
										key: 'calls',
										title: 'Calls This Week',
										render: r => r.callsThisWeek,
									},
									{
										key: 'compliance',
										title: 'Compliance',
										render: r => `${r.compliance}%`,
									},
								]}
								data={teamMembers}
								onRowClick={(member: TeamMember) => {
									console.log('Viewing profile:', member.name);
								}}
							/>
						</SectionCard>
					</Tabs.Panel>

					<Tabs.Panel value='disputes' pt='lg'>
						<SectionCard title='Open Disputes' description='Disputes awaiting action'>
							<Stack gap='sm'>
								<ProfileBadge
									name='Dispute #101'
									role='Sarah Johnson - QA Score Challenge'
									status='active'
								/>
								<ProfileBadge
									name='Dispute #99'
									role='Mike Chen - Compliance Question'
									status='active'
								/>
							</Stack>
						</SectionCard>
					</Tabs.Panel>

					<Tabs.Panel value='reports' pt='lg'>
						<SectionCard
							title='Generate Report'
							description='Create weekly/monthly reports'
						>
							<Stack gap='sm'>
								<ProfileBadge
									name='Weekly Team Report'
									role='Generated: Last Monday'
									status='inactive'
									onClick={() =>
										console.log('Download weekly report')
									}
								/>
								<ProfileBadge
									name='Monthly Compliance Report'
									role='Generated: Last Month'
									status='inactive'
									onClick={() =>
										console.log('Download monthly report')
									}
								/>
							</Stack>
						</SectionCard>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default SupervisorDashboard;

import React from 'react';
import { Stack, Title, Text, SimpleGrid, Tabs } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useDashboardRoleRedirect } from '~/hooks/useDashboardRoleRedirect';
import { DashboardMetricCard, ProfileBadge } from '../components';
import BaseTable from '~/components/BaseTable/BaseTable';

interface SupervisorMetric {
	id: number;
	name: string;
	teamSize: number;
	avgScore: number;
	sentiment: string;
	compliance: number;
}

const OperationManagerDashboard: React.FC = () => {
	useDashboardRoleRedirect();

	const supervisors: SupervisorMetric[] = [
		{
			id: 1,
			name: 'David Martinez',
			teamSize: 8,
			avgScore: 86,
			sentiment: 'Positive',
			compliance: 96,
		},
		{
			id: 2,
			name: 'Lisa Wong',
			teamSize: 6,
			avgScore: 79,
			sentiment: 'Positive',
			compliance: 92,
		},
		{
			id: 3,
			name: 'James Wilson',
			teamSize: 7,
			avgScore: 74,
			sentiment: 'Neutral',
			compliance: 88,
		},
	];

	return (
		
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Client: Acme Corp</Title>
					<Text c='dimmed' mt='xs'>
						Operation Manager Dashboard - Overall client performance
					</Text>
				</div>

				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md'>
					<DashboardMetricCard
						label='Overall QA Score'
						value={79.7}
						unit='%'
						progress={79}
						trend='up'
						trendValue='+1.5% vs last week'
						color='blue'
					/>
					<DashboardMetricCard
						label='Customer Sentiment'
						value='Positive'
						progress={73}
						trend='up'
						trendValue='+5% vs last week'
						color='green'
					/>
					<DashboardMetricCard
						label='Compliance %'
						value={92}
						unit='%'
						progress={92}
						trend='down'
						trendValue='-1% vs last week'
						color='orange'
					/>
					<DashboardMetricCard
						label='Total Agents'
						value={21}
						trend='up'
						trendValue='+2 new hires'
					/>
				</SimpleGrid>

				<Tabs defaultValue='supervisors'>
					<Tabs.List>
						<Tabs.Tab value='supervisors'>Supervisors</Tabs.Tab>
						<Tabs.Tab value='team-health'>Team Health</Tabs.Tab>
						<Tabs.Tab value='clients'>Clients</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='supervisors' pt='lg'>
						<SectionCard
							title='Supervisor Performance'
							description='Metrics for all supervisors in this client'
						>
							<BaseTable
								columns={[
									{
										id: 'name',
										header: 'Supervisor',
										accessorKey: 'name',
									},
									{
										id: 'teamSize',
										header: 'Team Size',
										accessorKey: 'teamSize',
									},
									{
										id: 'score',
										header: 'Avg QA Score',
										cell: info => `${(info.row.original as SupervisorMetric).avgScore}%`,
									},
									{
										id: 'sentiment',
										header: 'Sentiment',
										accessorKey: 'sentiment',
									},
									{
										id: 'compliance',
										header: 'Compliance',
										cell: info => `${(info.row.original as SupervisorMetric).compliance}%`,
									},
								]}
								data={supervisors}
								onRowClick={(supervisor: SupervisorMetric) => {
									console.log('Viewing supervisor:', supervisor.name);
								}}
							/>
						</SectionCard>
					</Tabs.Panel>

					<Tabs.Panel value='team-health' pt='lg'>
						<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
							<SectionCard
								title='Key Performance Indicators'
								description='Client-wide metrics'
							>
								<Stack gap='md'>
									<DashboardMetricCard
										label='Avg Handle Time'
										value='4.2'
										unit='mins'
									/>
									<DashboardMetricCard
										label='Customer Satisfaction'
										value={87}
										unit='%'
									/>
									<DashboardMetricCard
										label='First Call Resolution'
										value={82}
										unit='%'
									/>
								</Stack>
							</SectionCard>

							<SectionCard
								title='Risk Indicators'
								description='Areas requiring attention'
							>
								<Stack gap='sm'>
									<ProfileBadge
										name='High Turnover Rate'
										role='3 agents left this month'
										status='inactive'
									/>
									<ProfileBadge
										name='Compliance Issues'
										role='2 supervisors below 90%'
										status='inactive'
									/>
									<ProfileBadge
										name='Quality Drift'
										role='Avg score down 2% vs last month'
										status='inactive'
									/>
								</Stack>
							</SectionCard>
						</SimpleGrid>
					</Tabs.Panel>

					<Tabs.Panel value='clients' pt='lg'>
						<SectionCard
							title='Client Portfolio'
							description='All clients managed'
						>
							<Stack gap='sm'>
								<ProfileBadge
									name='Acme Corp'
									role='21 agents • 79.7% QA • Positive Sentiment'
									status='active'
									score={79}
									onClick={() =>
										console.log('View client details')
									}
								/>
								<ProfileBadge
									name='TechStart Inc'
									role='15 agents • 85.2% QA • Very Positive Sentiment'
									status='active'
									score={85}
									onClick={() =>
										console.log('View client details')
									}
								/>
								<ProfileBadge
									name='Global Services Ltd'
									role='18 agents • 72.1% QA • Neutral Sentiment'
									status='inactive'
									score={72}
									onClick={() =>
										console.log('View client details')
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

export default OperationManagerDashboard;

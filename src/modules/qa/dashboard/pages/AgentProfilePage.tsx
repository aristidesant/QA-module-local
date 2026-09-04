import React from 'react';
import { Stack, Title, Text, SimpleGrid, Avatar, Group } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	DashboardMetricCard,
	BadgeCollection,
	LeaderboardTable,
} from '../components';

const AgentProfilePage: React.FC = () => {
	const badges = [
		{
			id: 1,
			name: 'QA Excellence',
			description: '3 calls with 90%+ score',
			emoji: '⭐',
			earnedDate: 'Sep 1, 2026',
		},
		{
			id: 2,
			name: 'Sentiment Champion',
			description: 'Avg 4.5+ sentiment',
			emoji: '😊',
			earnedDate: 'Aug 28, 2026',
		},
		{
			id: 3,
			name: 'Compliance Guardian',
			description: 'Zero violations in 10 calls',
			emoji: '🛡️',
			earnedDate: 'Aug 15, 2026',
		},
	];

	const leaderboardData = [
		{ rank: 1, name: 'Sarah Johnson', score: 88, change: 'up', changeValue: 2, reactions: 14 },
		{ rank: 2, name: 'Mike Chen', score: 86, change: 'stable', reactions: 12 },
		{ rank: 3, name: 'Agent Smith', score: 82, change: 'down', changeValue: 1, reactions: 8 },
		{ rank: 4, name: 'Emily Watson', score: 78, change: 'up', changeValue: 3, reactions: 6 },
	];

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group align='flex-end'>
					<Avatar name='Agent Smith' size='lg' color='blue' radius='md' />
					<div>
						<Title order={1}>Agent Smith</Title>
						<Text c='dimmed'>QA Agent • Team: North Region</Text>
					</div>
				</Group>

				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md'>
					<DashboardMetricCard
						label='Total Calls'
						value={287}
						trend='up'
						trendValue='+12 vs last week'
					/>
					<DashboardMetricCard
						label='QA Score'
						value={82}
						unit='%'
						progress={82}
						trend='up'
						trendValue='+4% vs last week'
						color='blue'
					/>
					<DashboardMetricCard
						label='Avg Sentiment'
						value={4.2}
						unit='/5.0'
						progress={84}
						color='green'
					/>
					<DashboardMetricCard
						label='Compliance'
						value={94}
						unit='%'
						progress={94}
						color='orange'
					/>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Performance Trends'
						description='Last 30 days'
					>
						<Stack gap='md'>
							<DashboardMetricCard
								label='Week 1'
								value={80}
								unit='%'
							/>
							<DashboardMetricCard
								label='Week 2'
								value={81}
								unit='%'
							/>
							<DashboardMetricCard
								label='Week 3'
								value={79}
								unit='%'
							/>
							<DashboardMetricCard
								label='Week 4'
								value={82}
								unit='%'
							/>
						</Stack>
					</SectionCard>

					<SectionCard
						title='Sentiment Distribution'
						description='Customer emotion feedback'
					>
						<Stack gap='md'>
							<DashboardMetricCard
								label='Very Positive'
								value={32}
								unit='%'
							/>
							<DashboardMetricCard
								label='Positive'
								value={28}
								unit='%'
							/>
							<DashboardMetricCard
								label='Neutral'
								value={24}
								unit='%'
							/>
							<DashboardMetricCard
								label='Negative'
								value={16}
								unit='%'
							/>
						</Stack>
					</SectionCard>
				</SimpleGrid>

				<BadgeCollection badges={badges} />

				<LeaderboardTable
					entries={leaderboardData}
					metric='QA Score'
					title='Team Rankings'
				/>

				<SectionCard
					title='Recent Evaluations'
					description='Last 5 evaluated calls'
				>
					<Stack gap='sm'>
						{[1, 2, 3, 4, 5].map(i => (
							<div key={i} style={{ padding: '12px', borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
								<Group justify='space-between'>
									<Text size='sm'>Call #{12450 + i}</Text>
									<Text size='sm' fw={500}>{78 + i}%</Text>
								</Group>
								<Text size='xs' c='dimmed'>
									{new Date(Date.now() - i * 86400000).toLocaleDateString()}
								</Text>
							</div>
						))}
					</Stack>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default AgentProfilePage;

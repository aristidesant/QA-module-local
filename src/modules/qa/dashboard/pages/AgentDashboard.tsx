import React, { useState } from 'react';
import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { DashboardMetricCard, AlertsInbox, ProfileBadge } from '../components';

interface AlertMock {
	id: number;
	title: string;
	description: string;
	severity: 'low' | 'medium' | 'high';
	timestamp: string;
	read: boolean;
}

const AgentDashboard: React.FC = () => {
	const [alerts, setAlerts] = useState<AlertMock[]>([
		{
			id: 1,
			title: 'Low QA Score',
			description: 'Your QA score dropped to 72% this week',
			severity: 'medium',
			timestamp: '2 hours ago',
			read: false,
		},
		{
			id: 2,
			title: 'Compliance Issue Detected',
			description: 'Call #12456 has a regulatory compliance violation',
			severity: 'high',
			timestamp: '1 hour ago',
			read: false,
		},
	]);

	const handleMarkAsRead = (alertId: number) => {
		setAlerts(prev =>
			prev.map(a => (a.id === alertId ? { ...a, read: true } : a))
		);
	};

	const handleDismiss = (alertId: number) => {
		setAlerts(prev => prev.filter(a => a.id !== alertId));
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Welcome, Agent Smith</Title>
					<Text c='dimmed' mt='xs'>
						Here's an overview of your performance
					</Text>
				</div>

				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md'>
					<DashboardMetricCard
						label='QA Score'
						value={78}
						unit='%'
						progress={78}
						trend='up'
						trendValue='+5% vs last week'
						color='blue'
					/>
					<DashboardMetricCard
						label='Sentiment'
						value='Positive'
						progress={72}
						trend='up'
						trendValue='+3% vs last week'
						color='green'
					/>
					<DashboardMetricCard
						label='Compliance'
						value={85}
						unit='%'
						progress={85}
						trend='down'
						trendValue='-2% vs last week'
						color='orange'
					/>
					<DashboardMetricCard
						label='Calls This Week'
						value={24}
						trend='up'
						trendValue='+4 vs last week'
					/>
				</SimpleGrid>

				<AlertsInbox
					alerts={alerts}
					onMarkAsRead={handleMarkAsRead}
					onDismiss={handleDismiss}
				/>

				<SectionCard
					title='My Recent Calls'
					description='Last 5 calls you handled'
				>
					<Stack gap='sm'>
						{[1, 2, 3, 4, 5].map(i => (
							<ProfileBadge
								key={i}
								name={`Call #${12450 + i}`}
								role='Customer: John Doe'
								score={78 + i}
								status='active'
							/>
						))}
					</Stack>
				</SectionCard>

				<SectionCard
					title='My Badges & Achievements'
					description='Badges earned this month'
				>
					<Stack gap='sm'>
						<ProfileBadge name='QA Excellence' role='3 calls with 90%+ score' />
						<ProfileBadge name='Sentiment Champion' role='Avg 4.5+ sentiment' />
					</Stack>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default AgentDashboard;

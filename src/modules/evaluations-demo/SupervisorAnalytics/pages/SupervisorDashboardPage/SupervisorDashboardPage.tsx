import React from 'react';
import { Stack, Text, Title, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import TeamScoreCardsPanel from './components/TeamScoreCardsPanel';
import TeamPerformanceTrendChart from './components/TeamPerformanceTrendChart';
import DowntrendingAgentsTable from './components/DowntrendingAgentsTable';
import ActiveCampaignsWidget from './components/ActiveCampaignsWidget';
import AgentPerformanceComparisonTable from './components/AgentPerformanceComparisonTable';
import BestWorstCallsPanel from '../../../AgentDashboard/pages/AgentDashboardPage/components/BestWorstCallsPanel';
import EmotionGaugeWidget from '../../../components/EmotionGaugeWidget';
import { DEMO_AGENT_CALLS } from '../../../AgentDashboard/mockData';
import styles from './SupervisorDashboardPage.module.css';

const SupervisorDashboardPage: React.FC = () => {
	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						Team Analytics Dashboard
					</Title>
					<Text className={styles.headerSubtitle}>
						Monitor your team's performance across all dimensions
					</Text>
				</div>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<div>
						<Text fw={700} size='lg' mb='md'>
							Team Performance Scores
						</Text>
						<TeamScoreCardsPanel calls={DEMO_AGENT_CALLS} />
					</div>
					<div>
						<Text fw={700} size='lg' mb='md'>
							Customer Sentiment
						</Text>
						<EmotionGaugeWidget
							calls={DEMO_AGENT_CALLS}
							title='Your avg customer emotion for your team'
						/>
					</div>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, md: 3 }} spacing='lg'>
					<div>
						<Text fw={700} size='lg' mb='md'>
							Team Performance Trend (4 Weeks)
						</Text>
						<TeamPerformanceTrendChart calls={DEMO_AGENT_CALLS} />
					</div>

					<div>
						<Text fw={700} size='lg' mb='md'>
							Performance Alerts
						</Text>
						<DowntrendingAgentsTable calls={DEMO_AGENT_CALLS} />
					</div>

					<div>
						<Text fw={700} size='lg' mb='md'>
							Campaigns
						</Text>
						<ActiveCampaignsWidget calls={DEMO_AGENT_CALLS} />
					</div>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<div>
						<Text fw={700} size='lg' mb='md'>
							Agent Performance Comparison
						</Text>
						<AgentPerformanceComparisonTable calls={DEMO_AGENT_CALLS} />
					</div>

					<div>
						<Text fw={700} size='lg' mb='md'>
							Team Best & Worst Calls
						</Text>
						<BestWorstCallsPanel calls={DEMO_AGENT_CALLS} />
					</div>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default SupervisorDashboardPage;

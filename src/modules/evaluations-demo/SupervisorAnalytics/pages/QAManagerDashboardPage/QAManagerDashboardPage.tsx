import React from 'react';
import { Stack, Text, Title, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import TeamScoreCardsPanel from '../SupervisorDashboardPage/components/TeamScoreCardsPanel';
import TeamPerformanceTrendChart from '../SupervisorDashboardPage/components/TeamPerformanceTrendChart';
import DowntrendingAgentsTable from '../SupervisorDashboardPage/components/DowntrendingAgentsTable';
import ActiveCampaignsWidget from '../SupervisorDashboardPage/components/ActiveCampaignsWidget';
import AgentPerformanceComparisonTable from '../SupervisorDashboardPage/components/AgentPerformanceComparisonTable';
import TeamQuickStatsWidget from '../SupervisorDashboardPage/components/TeamQuickStatsWidget';
import BestWorstCallsPanel from '../../../AgentDashboard/pages/AgentDashboardPage/components/BestWorstCallsPanel';
import EmotionGaugeWidget from '../../../components/EmotionGaugeWidget';
import { DEMO_AGENT_CALLS } from '../../../AgentDashboard/mockData';
import styles from './QAManagerDashboardPage.module.css';

const QAManagerDashboardPage: React.FC = () => {
	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						QA Team Analytics Dashboard
					</Title>
					<Text className={styles.headerSubtitle}>
						Monitor QA team performance across all dimensions
					</Text>
				</div>

				<SimpleGrid cols={{ base: 1, md: 3 }} spacing='lg'>
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
							title='Team avg customer emotion'
						/>
					</div>
					<div>
						<Text fw={700} size='lg' mb='md'>
							Quick Stats
						</Text>
						<TeamQuickStatsWidget calls={DEMO_AGENT_CALLS} />
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
							QA Campaigns
						</Text>
						<ActiveCampaignsWidget calls={DEMO_AGENT_CALLS} />
					</div>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<div>
						<Text fw={700} size='lg' mb='md'>
							QA Analyst Performance Comparison
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

export default QAManagerDashboardPage;

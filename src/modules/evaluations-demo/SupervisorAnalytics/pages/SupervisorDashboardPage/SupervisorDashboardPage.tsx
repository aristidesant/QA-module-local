import React from 'react';
import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import TeamScoreCardsPanel from './components/TeamScoreCardsPanel';
import TeamPerformanceTrendChart from './components/TeamPerformanceTrendChart';
import DowntrendingAgentsTable from './components/DowntrendingAgentsTable';
import ActiveCampaignsWidget from './components/ActiveCampaignsWidget';
import AgentPerformanceComparisonTable from './components/AgentPerformanceComparisonTable';
import TeamQuickStatsWidget from './components/TeamQuickStatsWidget';
import BestWorstCallsPanel from '../../../AgentDashboard/pages/AgentDashboardPage/components/BestWorstCallsPanel';
import EmotionGaugeWidget from '../../../components/EmotionGaugeWidget';
import CriticalIssuesPanel from '../QAManagerDashboardPage/components/CriticalIssuesPanel';
import { SentimentCategoryComparison } from '../../../../qa/emotion-sentiment/components/SentimentCategoryComparison';
import { EmotionBreakdownComparison } from '../../../../qa/emotion-sentiment/components/EmotionBreakdownComparison';
import { useSupervisorTeamSentimentMetrics } from '../../../../qa/emotion-sentiment/hooks/useSupervisorTeamSentimentMetrics';
import { DEMO_AGENT_CALLS } from '../../../AgentDashboard/mockData';
import { mockCriticalIssuesQAManager } from '../QAManagerDashboardPage/mockCriticalIssues';
import styles from './SupervisorDashboardPage.module.css';

const SupervisorDashboardPage: React.FC = () => {
	// In a real app, supervisor name would come from route params or context
	// For demo, we'll show all critical issues with team scope
	const teamCriticalIssues = mockCriticalIssuesQAManager;
	const { data: sentimentData, teamBenchmark } = useSupervisorTeamSentimentMetrics();

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						Welcome, Sarah Chen
					</Title>
					<Text className={styles.headerSubtitle}>
						Here's an overview of your team's performance this week
					</Text>
					<Text size='xs' c='dimmed' fw={400}>
						This week's data
					</Text>
				</div>

				<SectionCard
					title='Team Performance Scores'
					description="Your team's QA analysis, emotion and sentiment, and compliance scores"
				>
					<TeamScoreCardsPanel calls={DEMO_AGENT_CALLS} />
				</SectionCard>

				<CriticalIssuesPanel issues={teamCriticalIssues} />

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Customer Sentiment'
						description="Average emotion scores from your team's customer interactions"
					>
						<EmotionGaugeWidget
							calls={DEMO_AGENT_CALLS}
							title='Your avg customer emotion for your team'
						/>
					</SectionCard>

					<SectionCard
						title='Quick Stats'
						description="Key metrics for your team's performance this week"
					>
						<TeamQuickStatsWidget calls={DEMO_AGENT_CALLS} />
					</SectionCard>
				</SimpleGrid>

				{sentimentData && (
					<>
						<SectionCard
							title='Sentiment Category Distribution'
							description="Your team's emotions vs. client emotions this week"
						>
							<SentimentCategoryComparison
								agentCategories={sentimentData.agent.categories}
								clientCategories={sentimentData.client.categories}
								teamAverage={teamBenchmark?.categories}
								role='supervisor'
							/>
						</SectionCard>

						<SectionCard
							title='Individual Emotion Breakdown'
							description="Detailed emotion percentages for your team's interactions"
						>
							<EmotionBreakdownComparison
								agentEmotions={sentimentData.agent.emotions}
								clientEmotions={sentimentData.client.emotions}
								teamAverages={teamBenchmark?.emotions}
								role='supervisor'
							/>
						</SectionCard>
					</>
				)}

				<SectionCard
					title='Team Performance Trend'
					description="4-week trend analysis of your team's performance scores"
				>
					<TeamPerformanceTrendChart calls={DEMO_AGENT_CALLS} />
				</SectionCard>

				<SectionCard
					title='Performance Alerts'
					description='Agents with declining performance requiring attention'
				>
					<DowntrendingAgentsTable calls={DEMO_AGENT_CALLS} />
				</SectionCard>

				<SectionCard
					title='Active Campaigns'
					description='Current campaigns your team is working on'
				>
					<ActiveCampaignsWidget calls={DEMO_AGENT_CALLS} />
				</SectionCard>

				<SectionCard
					title='Agent Performance Comparison'
					description='Ranked comparison of your team members'
				>
					<AgentPerformanceComparisonTable calls={DEMO_AGENT_CALLS} />
				</SectionCard>

				<SectionCard
					title='Team Best and Worst Calls'
					description="Your team's top and bottom performing calls this week"
				>
					<BestWorstCallsPanel calls={DEMO_AGENT_CALLS} />
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default SupervisorDashboardPage;

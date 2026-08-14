import React from 'react';
import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import AgentPerformanceTrendChart from './components/AgentPerformanceTrendChart';
import ScoreCardsPanel from './components/ScoreCardsPanel';
import BestWorstCallsPanel from './components/BestWorstCallsPanel';
import AgentMetricsSidebar from './components/AgentMetricsSidebar';
import EmotionGaugeWidget from '../../../components/EmotionGaugeWidget';
import { DEMO_AGENT_CALLS, THIS_WEEK_KPIS } from '../../mockData';
import styles from './AgentDashboardPage.module.css';

const AgentDashboardPage: React.FC = () => {
	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						Welcome, Agent Smith
					</Title>
					<Text className={styles.headerSubtitle}>
						Here's an overview of your performance this week
					</Text>
				</div>

				<SectionCard
					title='Performance Scores'
					description='Your QA analysis, emotion and sentiment, and compliance scores'
				>
					<ScoreCardsPanel calls={DEMO_AGENT_CALLS} />
				</SectionCard>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Customer Sentiment'
						description='Average emotion scores from your customer interactions'
					>
						<EmotionGaugeWidget
							calls={DEMO_AGENT_CALLS}
							title='Your customer avg emotion'
						/>
					</SectionCard>

					<SectionCard
						title='Quick Stats'
						description='Key metrics for your performance this week'
					>
						<AgentMetricsSidebar
							calls={DEMO_AGENT_CALLS}
							kpis={THIS_WEEK_KPIS}
						/>
					</SectionCard>
				</SimpleGrid>

				<SectionCard
					title='Best and Worst Calls'
					description='Your top and bottom performing calls this week'
				>
					<BestWorstCallsPanel calls={DEMO_AGENT_CALLS} />
				</SectionCard>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Performance Trend'
						description='4-week trend analysis of your performance scores'
					>
						<AgentPerformanceTrendChart calls={DEMO_AGENT_CALLS} />
					</SectionCard>

					<SectionCard
						title='Quick Insights'
						description='Performance analysis and recommendations'
					>
						<Stack gap='md'>
							<Text size='sm' c='dimmed'>
								Your performance is trending positively this week. Keep up the
								great work!
							</Text>
						</Stack>
					</SectionCard>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default AgentDashboardPage;

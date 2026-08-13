import React from 'react';
import { Stack, Text, Title, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import AgentPerformanceTrendChart from './components/AgentPerformanceTrendChart';
import SecondaryMetrics from './components/SecondaryMetrics';
import ScoreCardsPanel from './components/ScoreCardsPanel';
import BestWorstCallsPanel from './components/BestWorstCallsPanel';
import { DEMO_AGENT_KPIS, DEMO_AGENT_CALLS } from '../../mockData';
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

				<div>
					<Text fw={700} size='lg' mb='md'>
						Performance Scores
					</Text>
					<ScoreCardsPanel calls={DEMO_AGENT_CALLS} />
				</div>

				<div>
					<Text fw={700} size='lg' mb='md'>
						Best & Worst Calls
					</Text>
					<BestWorstCallsPanel calls={DEMO_AGENT_CALLS} />
				</div>

				<SimpleGrid
					cols={{ base: 1, sm: 2, md: 3 }}
					spacing='lg'
					className={styles.bottomGrid}
				>
					<div className={styles.chartColumn}>
						<AgentPerformanceTrendChart calls={DEMO_AGENT_CALLS} />
					</div>
					<div className={styles.metricsColumn}>
						<SecondaryMetrics kpis={DEMO_AGENT_KPIS} />
					</div>
					<div className={styles.summaryColumn}>
						{/* Third column for additional insights or summary */}
						<Stack gap='md' style={{ height: '100%' }}>
							<Text fw={700} size='lg'>
								Quick Insights
							</Text>
							<Text size='sm' c='dimmed'>
								Your performance is trending positively this week. Keep up the
								great work!
							</Text>
						</Stack>
					</div>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default AgentDashboardPage;

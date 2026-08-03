import React from 'react';
import { Stack, Text, Title } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import AgentDashboardKpisV2 from './components/AgentDashboardKpisV2';
import AgentPerformanceTrendChart from './components/AgentPerformanceTrendChart';
import { DEMO_AGENT_KPIS } from '../../mockData';
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

				<div className={styles.kpiSection}>
					<AgentDashboardKpisV2 kpis={DEMO_AGENT_KPIS} />
				</div>

				<div className={styles.chartGrid}>
					<AgentPerformanceTrendChart kpis={DEMO_AGENT_KPIS} />
				</div>
			</Stack>
		</ContentContainer>
	);
};

export default AgentDashboardPage;

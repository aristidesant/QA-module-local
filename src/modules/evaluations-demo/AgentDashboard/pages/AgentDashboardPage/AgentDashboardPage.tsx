import React from 'react';
import { Stack, Text, Title } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import AgentDashboardKpis from './components/AgentDashboardKpis';
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
					<AgentDashboardKpis kpis={DEMO_AGENT_KPIS} />
				</div>

				<AgentPerformanceTrendChart kpis={DEMO_AGENT_KPIS} />
			</Stack>
		</ContentContainer>
	);
};

export default AgentDashboardPage;

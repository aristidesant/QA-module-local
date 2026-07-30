import React from 'react';
import { Box, SimpleGrid, Text } from '@mantine/core';
import type { DemoAgentKpis } from '../../../types';
import styles from './AgentDashboardKpisV2.module.css';

interface AgentDashboardKpisV2Props {
	kpis: DemoAgentKpis;
}

interface MetricProps {
	label: string;
	value: string | number;
	subtitle?: string;
	size?: 'large' | 'small';
}

const MetricCard: React.FC<MetricProps> = ({ label, value, subtitle, size = 'small' }) => (
	<div className={`${styles.metricCard} ${styles[`metric-${size}`]}`}>
		<Text size='xs' className={styles.metricLabel}>
			{label}
		</Text>
		<div className={styles.metricValue}>{value}</div>
		{subtitle && (
			<Text size='xs' className={styles.metricSubtitle}>
				{subtitle}
			</Text>
		)}
	</div>
);

const AgentDashboardKpisV2: React.FC<AgentDashboardKpisV2Props> = ({ kpis }) => {
	return (
		<Box className={styles.container}>
			{/* Featured Metrics - Top Row */}
			<SimpleGrid cols={2} spacing='md' className={styles.featuredRow}>
				<MetricCard
					label='Avg Call Score'
					value={`${kpis.avgCallScore}%`}
					subtitle='This week average'
					size='large'
				/>
				<MetricCard
					label='Pass Rate'
					value={`${kpis.weeklyPerformance}%`}
					subtitle='Calls ≥ 80 score'
					size='large'
				/>
			</SimpleGrid>

			{/* Secondary Metrics - Bottom Row */}
			<SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing='md' className={styles.secondaryRow}>
				<MetricCard
					label='Weekly Call Volume'
					value={kpis.totalCallsPerformed}
					subtitle='This week'
				/>
				<MetricCard
					label='Effective Contacts'
					value={kpis.effectiveContactsCount}
					subtitle='Productive calls'
				/>
				<MetricCard
					label='Active Campaigns'
					value={kpis.totalCampaigns}
					subtitle='Currently on'
				/>
				<MetricCard
					label='Quality Trend'
					value='+2%'
					subtitle='vs last week'
				/>
				<MetricCard
					label='Last Evaluation'
					value='2 hrs ago'
					subtitle='Most recent'
				/>
			</SimpleGrid>
		</Box>
	);
};

export default AgentDashboardKpisV2;

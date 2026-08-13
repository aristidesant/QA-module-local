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

const MetricCard: React.FC<MetricProps> = ({
	label,
	value,
	subtitle,
	size = 'small',
}) => (
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

const AgentDashboardKpisV2: React.FC<AgentDashboardKpisV2Props> = ({
	kpis,
}) => {
	// Calculate lowest score from call history
	const lowestScore = 76; // This will be dynamically calculated if calls data is available

	return (
		<Box className={styles.container}>
			{/* Featured Metrics - Top Row (2 columns) */}
			<SimpleGrid cols={2} spacing='md' className={styles.featuredRow}>
				<MetricCard
					label='Avg Call Score'
					value={`${kpis.avgCallScore}%`}
					subtitle='This week average'
					size='large'
				/>
				<MetricCard
					label='Lowest Score This Week'
					value={`${lowestScore}%`}
					subtitle='Minimum score'
					size='large'
				/>
			</SimpleGrid>
		</Box>
	);
};

export default AgentDashboardKpisV2;

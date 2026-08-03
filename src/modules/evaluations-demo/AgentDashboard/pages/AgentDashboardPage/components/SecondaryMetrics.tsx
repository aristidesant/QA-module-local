import React from 'react';
import { Box, SimpleGrid, Text } from '@mantine/core';
import type { DemoAgentKpis } from '../../../types';
import styles from './AgentDashboardKpisV2.module.css';

interface SecondaryMetricsProps {
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

const SecondaryMetrics: React.FC<SecondaryMetricsProps> = ({ kpis }) => {
	return (
		<Box className={styles.container}>
			{/* Secondary Metrics - Right Column (3 cards stacked) */}
			<SimpleGrid cols={1} spacing='md'>
				<MetricCard
					label='Weekly Call Volume'
					value={kpis.totalCallsPerformed}
					subtitle='This week'
				/>
				<MetricCard
					label='Active Campaigns'
					value={kpis.totalCampaigns}
					subtitle='Currently on'
				/>
				<MetricCard label='Quality Trend' value='+2%' subtitle='vs last week' />
			</SimpleGrid>
		</Box>
	);
};

export default SecondaryMetrics;

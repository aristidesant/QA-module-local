import React from 'react';
import { Box } from '@mantine/core';
import { KpiCard } from '~/components/KpiCard';
import type { DemoAgentKpis } from '../../../types';
import styles from './AgentDashboardKpis.module.css';

interface AgentDashboardKpisProps {
	kpis: DemoAgentKpis;
}

const AgentDashboardKpis: React.FC<AgentDashboardKpisProps> = ({ kpis }) => {
	return (
		<Box className={styles.kpisContainer}>
			{/* Primary 4 KPIs - Top Row */}
			<Box className={styles.primaryRow}>
				<Box className={styles.kpiCol}>
					<KpiCard
						title='Weekly Call Volume'
						value={kpis.totalCallsPerformed.toString()}
						subtitle='This week'
						accentColor='blue'
					/>
				</Box>

				<Box className={styles.kpiCol}>
					<KpiCard
						title='Avg Call Score'
						value={`${kpis.avgCallScore}%`}
						subtitle='This week average'
						accentColor='green'
					/>
				</Box>

				<Box className={styles.kpiCol}>
					<KpiCard
						title='Pass Rate'
						value={`${kpis.weeklyPerformance}%`}
						subtitle='Calls ≥ 80 score'
						accentColor='teal'
					/>
				</Box>

				<Box className={styles.kpiCol}>
					<KpiCard
						title='Effective Contacts'
						value={kpis.effectiveContactsCount.toString()}
						subtitle='Productive calls'
						accentColor='cyan'
					/>
				</Box>
			</Box>

			{/* Secondary 3 KPIs - Bottom Row */}
			<Box className={styles.secondaryRow}>
				<Box className={styles.kpiCol3}>
					<KpiCard
						title='Active Campaigns'
						value={kpis.totalCampaigns.toString()}
						subtitle='Currently on'
						accentColor='violet'
					/>
				</Box>

				<Box className={styles.kpiCol3}>
					<KpiCard
						title='Quality Trend'
						value='+2%'
						subtitle='vs last week'
						accentColor='orange'
					/>
				</Box>

				<Box className={styles.kpiCol3}>
					<KpiCard
						title='Last Evaluation'
						value='2 hrs ago'
						subtitle='Most recent'
						accentColor='gray'
					/>
				</Box>
			</Box>
		</Box>
	);
};

export default AgentDashboardKpis;

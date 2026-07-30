import React from 'react';
import { SimpleGrid, Stack } from '@mantine/core';
import { KpiCard } from '~/components/KpiCard';
import type { DemoAgentKpis } from '../../../types';

interface AgentDashboardKpisProps {
	kpis: DemoAgentKpis;
}

const AgentDashboardKpis: React.FC<AgentDashboardKpisProps> = ({ kpis }) => {
	return (
		<Stack gap='md'>
			{/* Primary 4 KPIs - Top Row */}
			<SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 2, lg: 4 }} spacing='md'>
				<KpiCard
					title='Weekly Call Volume'
					value={kpis.totalCallsPerformed.toString()}
					subtitle='This week'
					accentColor='blue'
				/>

				<KpiCard
					title='Avg Call Score'
					value={`${kpis.avgCallScore}%`}
					subtitle='This week average'
					accentColor='green'
				/>

				<KpiCard
					title='Pass Rate'
					value={`${kpis.weeklyPerformance}%`}
					subtitle='Calls ≥ 80 score'
					accentColor='teal'
				/>

				<KpiCard
					title='Effective Contacts'
					value={kpis.effectiveContactsCount.toString()}
					subtitle='Productive calls'
					accentColor='cyan'
				/>
			</SimpleGrid>

			{/* Secondary 3 KPIs - Bottom Row */}
			<SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 3 }} spacing='md'>
				<KpiCard
					title='Active Campaigns'
					value={kpis.totalCampaigns.toString()}
					subtitle='Currently on'
					accentColor='violet'
				/>

				<KpiCard
					title='Quality Trend'
					value='+2%'
					subtitle='vs last week'
					accentColor='orange'
				/>

				<KpiCard
					title='Last Evaluation'
					value='2 hrs ago'
					subtitle='Most recent'
					accentColor='gray'
				/>
			</SimpleGrid>
		</Stack>
	);
};

export default AgentDashboardKpis;

import React from 'react';
import { Grid } from '@mantine/core';
import { KpiCard } from '~/components/KpiCard';
import type { DemoAgentKpis } from '../../../types';

interface AgentDashboardKpisProps {
	kpis: DemoAgentKpis;
}

const AgentDashboardKpis: React.FC<AgentDashboardKpisProps> = ({ kpis }) => {
	return (
		<Grid gutter='md' grow>
			{/* Primary 4 KPIs - Top Row */}
			<Grid.Col span={{ base: 12, xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}>
				<KpiCard
					title='Weekly Call Volume'
					value={kpis.totalCallsPerformed.toString()}
					subtitle='This week'
					accentColor='blue'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}>
				<KpiCard
					title='Avg Call Score'
					value={`${kpis.avgCallScore}%`}
					subtitle='This week average'
					accentColor='green'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}>
				<KpiCard
					title='Pass Rate'
					value={`${kpis.weeklyPerformance}%`}
					subtitle='Calls ≥ 80 score'
					accentColor='teal'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}>
				<KpiCard
					title='Effective Contacts'
					value={kpis.effectiveContactsCount.toString()}
					subtitle='Productive calls'
					accentColor='cyan'
				/>
			</Grid.Col>

			{/* Secondary 3 KPIs - Bottom Row */}
			<Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
				<KpiCard
					title='Active Campaigns'
					value={kpis.totalCampaigns.toString()}
					subtitle='Currently on'
					accentColor='violet'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
				<KpiCard
					title='Quality Trend'
					value='+2%'
					subtitle='vs last week'
					accentColor='orange'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
				<KpiCard
					title='Last Evaluation'
					value='2 hrs ago'
					subtitle='Most recent'
					accentColor='gray'
				/>
			</Grid.Col>
		</Grid>
	);
};

export default AgentDashboardKpis;

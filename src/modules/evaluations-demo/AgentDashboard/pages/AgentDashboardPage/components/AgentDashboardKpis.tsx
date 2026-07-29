import React from 'react';
import { Grid } from '@mantine/core';
import { KpiCard } from '~/components/KpiCard';
import type { DemoAgentKpis } from '../../../types';

interface AgentDashboardKpisProps {
	kpis: DemoAgentKpis;
}

const AgentDashboardKpis: React.FC<AgentDashboardKpisProps> = ({ kpis }) => {
	return (
		<Grid gap='md'>
			<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
				<KpiCard
					title='Total Campaigns'
					value={kpis.totalCampaigns.toString()}
					subtitle='Currently enrolled'
					accentColor='blue'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
				<KpiCard
					title='Weekly Performance'
					value={`${kpis.weeklyPerformance}%`}
					subtitle='This week average'
					accentColor='green'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
				<KpiCard
					title='Avg Call Score'
					value={`${kpis.avgCallScore}%`}
					subtitle='All-time average'
					accentColor='teal'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
				<KpiCard
					title='Total Calls Performed'
					value={kpis.totalCallsPerformed.toString()}
					subtitle='Since start'
					accentColor='violet'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
				<KpiCard
					title='Effective Contacts'
					value={kpis.effectiveContactsCount.toString()}
					subtitle='Successful outcomes'
					accentColor='cyan'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
				<KpiCard
					title='Non-Effective Contacts'
					value={kpis.nonEffectiveContactsCount.toString()}
					subtitle='Unsuccessful outcomes'
					accentColor='orange'
				/>
			</Grid.Col>

			<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
				<KpiCard
					title='Last Updated'
					value='Today'
					accentColor='gray'
				/>
			</Grid.Col>
		</Grid>
	);
};

export default AgentDashboardKpis;

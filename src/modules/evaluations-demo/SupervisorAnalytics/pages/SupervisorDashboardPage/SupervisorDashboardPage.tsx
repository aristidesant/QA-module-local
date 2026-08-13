import React, { useState } from 'react';
import { Stack, Text, Title, Select } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import TeamScoreCardsPanel from './components/TeamScoreCardsPanel';
import TeamPerformanceTrendChart from './components/TeamPerformanceTrendChart';
import AgentPerformanceComparisonTable from './components/AgentPerformanceComparisonTable';
import BestWorstCallsPanel from '../../../AgentDashboard/pages/AgentDashboardPage/components/BestWorstCallsPanel';
import { DEMO_AGENT_CALLS } from '../../../AgentDashboard/mockData';
import styles from './SupervisorDashboardPage.module.css';

const SupervisorDashboardPage: React.FC = () => {
	const [selectedAnalysis, setSelectedAnalysis] = useState<string>('qa');

	const analysisOptions = [
		{ value: 'qa', label: 'QA Analysis' },
		{ value: 'emotion', label: 'Emotion & Sentiment' },
		{ value: 'compliance', label: 'Compliance' },
	];

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						Team Analytics Dashboard
					</Title>
					<Text className={styles.headerSubtitle}>
						Monitor your team's performance across all dimensions
					</Text>
				</div>

				<div className={styles.filterBar}>
					<Select
						label='Analysis Type'
						placeholder='Select analysis type'
						value={selectedAnalysis}
						onChange={(value) => setSelectedAnalysis(value || 'qa')}
						data={analysisOptions}
						w={200}
					/>
				</div>

				<div>
					<Text fw={700} size='lg' mb='md'>
						Team Performance Scores
					</Text>
					<TeamScoreCardsPanel
						calls={DEMO_AGENT_CALLS}
						analysisType={selectedAnalysis}
					/>
				</div>

				<div>
					<Text fw={700} size='lg' mb='md'>
						Team Performance Trend (4 Weeks)
					</Text>
					<TeamPerformanceTrendChart
						calls={DEMO_AGENT_CALLS}
						analysisType={selectedAnalysis}
					/>
				</div>

				<div>
					<Text fw={700} size='lg' mb='md'>
						Agent Performance Comparison
					</Text>
					<AgentPerformanceComparisonTable
						calls={DEMO_AGENT_CALLS}
						analysisType={selectedAnalysis}
					/>
				</div>

				<div>
					<Text fw={700} size='lg' mb='md'>
						Team Best & Worst Calls
					</Text>
					<BestWorstCallsPanel calls={DEMO_AGENT_CALLS} />
				</div>
			</Stack>
		</ContentContainer>
	);
};

export default SupervisorDashboardPage;

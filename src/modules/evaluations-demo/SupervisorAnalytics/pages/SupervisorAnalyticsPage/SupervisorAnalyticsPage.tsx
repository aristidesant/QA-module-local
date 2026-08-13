import React, { useState, useCallback } from 'react';
import { Stack, Text, Title, Button, Divider, Tabs } from '@mantine/core';
import { IconFileText, IconCheck, IconX } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import {
	AnalysisType,
	DateRange,
	AgentMetrics,
} from '../../types/supervisorTypes';
import { useSupervisorAnalyticsData } from '../../hooks/useSupervisorAnalyticsData';
import AnalysisTypeSelector from './components/AnalysisTypeSelector';
import DateRangeFilter from './components/DateRangeFilter';
import CampaignFilter from './components/CampaignFilter';
import SupervisorMetricsPanel from './components/SupervisorMetricsPanel';
import AgentRankingTable from './components/AgentRankingTable';
import AgentAnalyticsModal from './components/AgentAnalyticsModal';
import AgentFilter from './components/AgentFilter';
import CallListWithAnalysis from '../../../AgentAnalytics/pages/AgentAnalyticsPage/components/CallListWithAnalysis';
import AutofailFilter from './components/AutofailFilter';
import DisputeFilter from './components/DisputeFilter';
import ScoreRangeFilter from './components/ScoreRangeFilter';
import styles from './SupervisorAnalyticsPage.module.css';

const CAMPAIGNS = [
	'Customer Support Quality',
	'Sales Campaign A',
	'Billing Department',
	'Technical Support',
	'Customer Retention',
];

const SUPERVISOR_ID = 'SUP-001';

const SupervisorAnalyticsPage: React.FC = () => {
	const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>('qa');
	const [dateRange, setDateRange] = useState<DateRange>(() => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 30);
		return { startDate, endDate };
	});
	const [compareEnabled, setCompareEnabled] = useState(false);
	const [compareDateRange, setCompareDateRange] = useState<DateRange>(() => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 60);
		endDate.setDate(endDate.getDate() - 30);
		return { startDate, endDate };
	});
	const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
	const [selectedAutofail, setSelectedAutofail] = useState<string[]>([]);
	const [selectedDisputes, setSelectedDisputes] = useState<string[]>([]);
	const [minScore, setMinScore] = useState<number | ''>('');
	const [maxScore, setMaxScore] = useState<number | ''>('');
	const [selectedAgents, setSelectedAgents] = useState<string[]>(['All']);
	const [sortBy, setSortBy] = useState<'score' | 'trend' | 'name'>('score');
	const [selectedAgent, setSelectedAgent] = useState<AgentMetrics | null>(null);
	const [viewMode, setViewMode] = useState<'agents' | 'calls'>('agents');

	const { teamMetrics, agentMetrics, calls } = useSupervisorAnalyticsData(
		SUPERVISOR_ID,
		selectedAnalysis,
		dateRange,
		compareEnabled,
		selectedCampaigns,
		minScore !== '' ? minScore : undefined,
		maxScore !== '' ? maxScore : undefined,
		selectedAutofail,
		selectedDisputes,
		selectedAgents
	);

	const handleReset = useCallback(() => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 30);
		setDateRange({ startDate, endDate });
		setCompareEnabled(false);
		setSelectedCampaigns([]);
		setSelectedAgents(['All']);
		setSelectedAutofail([]);
		setSelectedDisputes([]);
		setMinScore('');
		setMaxScore('');
		setSortBy('score');
	}, []);

	const handleGenerateReport = useCallback(() => {
		const reportData = {
			analysisType: selectedAnalysis,
			dateRange,
			teamMetrics,
			agentMetrics,
			timestamp: new Date().toISOString(),
		};
		console.log('Report generated:', reportData);
		alert(
			`Report generated for ${selectedAnalysis} analysis with ${agentMetrics.length} agents.\nCheck console for details.`
		);
	}, [selectedAnalysis, dateRange, teamMetrics, agentMetrics]);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						Team Analytics
					</Title>
					<Text className={styles.headerSubtitle}>
						Monitor your team's performance across different analysis types
					</Text>
				</div>

				<div className={styles.filterSection}>
					<div className={styles.filtersGrid}>
						<AnalysisTypeSelector
							value={selectedAnalysis}
							onChange={setSelectedAnalysis}
						/>
						<CampaignFilter
							selectedCampaigns={selectedCampaigns}
							onCampaignsChange={setSelectedCampaigns}
							availableCampaigns={CAMPAIGNS}
						/>
						<DateRangeFilter
							dateRange={dateRange}
							onDateRangeChange={setDateRange}
							compareEnabled={compareEnabled}
							onCompareToggle={setCompareEnabled}
							compareDateRange={compareDateRange}
							onCompareDateRangeChange={setCompareDateRange}
						/>
						<AgentFilter
							selectedAgents={selectedAgents}
							onAgentsChange={setSelectedAgents}
							availableAgents={agentMetrics.map((a) => a.agentName)}
						/>
						<DisputeFilter
							selectedDisputes={selectedDisputes}
							onDisputesChange={setSelectedDisputes}
						/>
						<AutofailFilter
							selectedAutofail={selectedAutofail}
							onAutofailChange={setSelectedAutofail}
						/>
						<ScoreRangeFilter
							minScore={minScore}
							maxScore={maxScore}
							onMinScoreChange={setMinScore}
							onMaxScoreChange={setMaxScore}
						/>
					</div>

					<Divider />

					<div className={styles.filterActions}>
						<Button
							onClick={handleGenerateReport}
							leftSection={<IconFileText size={18} />}
							variant='light'
							color='blue'
						>
							Generate Report
						</Button>
						<Button
							onClick={handleReset}
							leftSection={<IconX size={18} />}
							variant='light'
							color='gray'
						>
							Reset Filters
						</Button>
						<Button leftSection={<IconCheck size={18} />} color='green'>
							Apply Filters
						</Button>
					</div>
				</div>

				<div className={styles.metricsPanel}>
					<SupervisorMetricsPanel metrics={teamMetrics} />
				</div>

				<Tabs
					value={viewMode}
					onChange={(value) => setViewMode(value as 'agents' | 'calls')}
				>
					<Tabs.List>
						<Tabs.Tab value='agents'>📊 Agents</Tabs.Tab>
						<Tabs.Tab value='calls'>📋 Calls</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='agents' pt='md'>
						<div className={styles.agentTableContainer}>
							<AgentRankingTable
								agents={agentMetrics}
								sortBy={sortBy}
								onSortChange={setSortBy}
								onAgentSelect={setSelectedAgent}
							/>
						</div>
					</Tabs.Panel>

					<Tabs.Panel value='calls' pt='md'>
						<div className={styles.agentTableContainer}>
							<CallListWithAnalysis analysis={selectedAnalysis} calls={calls} />
						</div>
					</Tabs.Panel>
				</Tabs>

				<AgentAnalyticsModal
					agent={selectedAgent}
					analysisType={selectedAnalysis}
					onClose={() => setSelectedAgent(null)}
				/>
			</Stack>
		</ContentContainer>
	);
};

export default SupervisorAnalyticsPage;

import React, { useState, useCallback } from 'react';
import { Stack, Text, Title, Button, Group } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import { AnalysisType, DateRange } from '../../types/analyticsTypes';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import AnalysisTypeSelector from './components/AnalysisTypeSelector';
import DateRangeFilter from './components/DateRangeFilter';
import CampaignFilter from './components/CampaignFilter';
import AggregatedMetricsPanel from './components/AggregatedMetricsPanel';
import CallListWithAnalysis from './components/CallListWithAnalysis';
import AutofailFilter from './components/AutofailFilter';
import DisputeFilter from './components/DisputeFilter';
import ScoreRangeFilter from './components/ScoreRangeFilter';
import styles from './AgentAnalyticsPage.module.css';

const CAMPAIGNS = [
	'Customer Support Quality',
	'Sales Campaign A',
	'Billing Department',
	'Technical Support',
	'Customer Retention',
];

const AgentAnalyticsPage: React.FC = () => {
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

	const { calls, aggregatedMetrics } = useAnalyticsData(
		selectedAnalysis,
		dateRange,
		compareEnabled,
		selectedCampaigns,
		minScore !== '' ? minScore : undefined,
		maxScore !== '' ? maxScore : undefined,
		selectedAutofail,
		selectedDisputes
	);

	const handleReset = useCallback(() => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 30);
		setDateRange({ startDate, endDate });
		setCompareEnabled(false);
		setSelectedCampaigns([]);
		setSelectedAutofail([]);
		setSelectedDisputes([]);
		setMinScore('');
		setMaxScore('');
	}, []);

	const handleGenerateReport = useCallback(() => {
		// Mock report generation
		const reportData = {
			analysisType: selectedAnalysis,
			dateRange,
			totalCalls: calls.length,
			metrics: aggregatedMetrics,
			timestamp: new Date().toISOString(),
		};
		console.log('Report generated:', reportData);
		alert(
			`Report generated for ${selectedAnalysis} analysis with ${calls.length} calls.\nCheck console for details.`
		);
	}, [selectedAnalysis, calls.length, aggregatedMetrics, dateRange]);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						Analytics
					</Title>
					<Text className={styles.headerSubtitle}>
						View your performance across different analysis types
					</Text>
				</div>

				<div className={styles.filterSection}>
					<AnalysisTypeSelector
						value={selectedAnalysis}
						onChange={setSelectedAnalysis}
					/>
					<DateRangeFilter
						dateRange={dateRange}
						onDateRangeChange={setDateRange}
						compareEnabled={compareEnabled}
						onCompareToggle={setCompareEnabled}
						compareDateRange={compareDateRange}
						onCompareDateRangeChange={setCompareDateRange}
						onReset={handleReset}
					/>
					<CampaignFilter
						selectedCampaigns={selectedCampaigns}
						onCampaignsChange={setSelectedCampaigns}
						availableCampaigns={CAMPAIGNS}
					/>
					<AutofailFilter
						selectedAutofail={selectedAutofail}
						onAutofailChange={setSelectedAutofail}
					/>
					<DisputeFilter
						selectedDisputes={selectedDisputes}
						onDisputesChange={setSelectedDisputes}
					/>
					<ScoreRangeFilter
						minScore={minScore}
						maxScore={maxScore}
						onMinScoreChange={setMinScore}
						onMaxScoreChange={setMaxScore}
					/>
					<Group>
						<Button
							leftSection={<IconFileText size={18} />}
							onClick={handleGenerateReport}
						>
							Generate Report
						</Button>
					</Group>
				</div>

				<div className={styles.metricsPanel}>
					<AggregatedMetricsPanel metrics={aggregatedMetrics} />
				</div>

				<div className={styles.callListContainer}>
					<CallListWithAnalysis analysis={selectedAnalysis} calls={calls} />
				</div>
			</Stack>
		</ContentContainer>
	);
};

export default AgentAnalyticsPage;

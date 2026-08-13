import React, { useState, useCallback } from 'react';
import { Stack, Text, Title } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import { AnalysisType, DateRange } from '../../types/analyticsTypes';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import AnalysisTypeSelector from './components/AnalysisTypeSelector';
import DateRangeFilter from './components/DateRangeFilter';
import CampaignFilter from './components/CampaignFilter';
import AggregatedMetricsPanel from './components/AggregatedMetricsPanel';
import CallListWithAnalysis from './components/CallListWithAnalysis';
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
	const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

	const { calls, aggregatedMetrics } = useAnalyticsData(
		selectedAnalysis,
		dateRange,
		compareEnabled,
		selectedCampaigns
	);

	const handleReset = useCallback(() => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 30);
		setDateRange({ startDate, endDate });
		setCompareEnabled(false);
		setSelectedCampaigns([]);
	}, []);

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
						onReset={handleReset}
					/>
					<CampaignFilter
						selectedCampaigns={selectedCampaigns}
						onCampaignsChange={setSelectedCampaigns}
						availableCampaigns={CAMPAIGNS}
					/>
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

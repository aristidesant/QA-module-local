import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { Stack, Tabs } from '@mantine/core';
import { useAgentAnalyticsStore } from '~/stores/qa/agentAnalyticsStore';
import { DateRangeAndGranularityControl } from './components/DateRangeAndGranularityControl';
import { QAAnalyticsTab, SentimentAnalyticsTab, ComplianceAnalyticsTab } from './tabs';
import { AGENT_CALL_METRICS, aggregateMetricsByDateRange } from '~/modules/qa/dashboard/mockData';

const AgentAnalyticsPage: React.FC = () => {
	const { t } = useTranslation('qa.agent.analytics');
	const { activeTab, setActiveTab, dateRange, granularity, selectedCampaign } = useAgentAnalyticsStore();

	// Filter metrics by selected campaign
	const campaignFilteredMetrics = useMemo(() => {
		if (selectedCampaign === null) {
			return AGENT_CALL_METRICS;
		}
		return AGENT_CALL_METRICS.filter(metric => metric.campaignId === selectedCampaign);
	}, [selectedCampaign]);

	// Aggregate metrics based on date range and granularity
	const aggregatedMetrics = useMemo(() => {
		return aggregateMetricsByDateRange(
			campaignFilteredMetrics,
			dateRange.from.toISOString(),
			dateRange.to.toISOString(),
			granularity
		);
	}, [campaignFilteredMetrics, dateRange, granularity]);

	const handleApply = (
		_range: { from: Date; to: Date },
		_granularity: string,
		_compare: boolean
	) => {
		// Handler for when the user applies date range/granularity changes
	};

	return (
		<ContentContainer
			contentWidth='full'
			title={t('page.title')}
			description={t('page.subtitle')}
		>
			<Stack gap='lg'>
				{/* Date Range and Granularity Control */}
				<div style={{ maxWidth: 600 }}>
					<DateRangeAndGranularityControl onApply={handleApply} />
				</div>

				{/* Tabs for different analytics sections */}
				<Tabs
					value={activeTab}
					onChange={(value) => setActiveTab(value as 'qa' | 'sentiment' | 'compliance')}
					defaultValue='qa'
				>
					<Tabs.List>
						<Tabs.Tab value='qa'>{t('tabs.qa')}</Tabs.Tab>
						<Tabs.Tab value='sentiment'>{t('tabs.sentiment')}</Tabs.Tab>
						<Tabs.Tab value='compliance'>{t('tabs.compliance')}</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='qa' pt='lg'>
						<QAAnalyticsTab aggregated={aggregatedMetrics} />
					</Tabs.Panel>

					<Tabs.Panel value='sentiment' pt='lg'>
						<SentimentAnalyticsTab calls={campaignFilteredMetrics} aggregated={aggregatedMetrics} />
					</Tabs.Panel>

					<Tabs.Panel value='compliance' pt='lg'>
						<ComplianceAnalyticsTab calls={campaignFilteredMetrics} aggregated={aggregatedMetrics} />
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default AgentAnalyticsPage;

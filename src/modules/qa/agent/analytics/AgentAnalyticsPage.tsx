import React, { useMemo } from 'react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { Stack, Tabs } from '@mantine/core';
import { useAgentAnalyticsStore } from '~/stores/qa/agentAnalyticsStore';
import { DateRangeAndGranularityControl } from './components/DateRangeAndGranularityControl';
import { QAAnalyticsTab, SentimentAnalyticsTab, ComplianceAnalyticsTab } from './tabs';
import { AGENT_CALL_METRICS, aggregateMetricsByDateRange } from '~/modules/qa/dashboard/mockData';

const AgentAnalyticsPage: React.FC = () => {
	const { activeTab, setActiveTab, dateRange, granularity } = useAgentAnalyticsStore();

	// Aggregate metrics based on date range and granularity
	const aggregatedMetrics = useMemo(() => {
		return aggregateMetricsByDateRange(
			AGENT_CALL_METRICS,
			dateRange.from.toISOString(),
			dateRange.to.toISOString(),
			granularity
		);
	}, [dateRange, granularity]);

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
			title='Analytics'
			description='Your performance across QA, Sentiment, and Compliance'
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
						<Tabs.Tab value='qa'>QA</Tabs.Tab>
						<Tabs.Tab value='sentiment'>Sentiment & Emotion</Tabs.Tab>
						<Tabs.Tab value='compliance'>Compliance</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='qa' pt='lg'>
						<QAAnalyticsTab aggregated={aggregatedMetrics} />
					</Tabs.Panel>

					<Tabs.Panel value='sentiment' pt='lg'>
						<SentimentAnalyticsTab calls={AGENT_CALL_METRICS} aggregated={aggregatedMetrics} />
					</Tabs.Panel>

					<Tabs.Panel value='compliance' pt='lg'>
						<ComplianceAnalyticsTab calls={AGENT_CALL_METRICS} aggregated={aggregatedMetrics} />
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default AgentAnalyticsPage;

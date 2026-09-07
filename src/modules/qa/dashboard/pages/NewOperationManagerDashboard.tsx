import React from 'react';
import { Stack, Title, Text } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	PerformanceScoresSection,
	SentimentTrendChart,
	QuickStatsWidget,
	PerformanceTrendChart,
	QuickInsightsWidget,
	BestWorstCallsPanel,
	CriticalIssuesTable,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import type { PerformanceTrendPoint } from '../components/PerformanceTrendChart';
import {
	OPERATION_MANAGER_WEEKLY_METRICS,
	OPERATION_MANAGER_SENTIMENT_TREND,
	OPERATION_MANAGER_QUICK_STATS,
	OPERATION_MANAGER_CALLS,
	CRITICAL_ISSUES_OPERATION_MANAGER,
} from '../mockData';

/**
 * Mock 4-week performance trend data for operational health
 * This shows the platform's operational score progression over the past 4 weeks
 */
const OPERATION_MANAGER_PERFORMANCE_TREND: PerformanceTrendPoint[] = [
	{ week: 'Week 1', score: 79 },
	{ week: 'Week 2', score: 80 },
	{ week: 'Week 3', score: 80 },
	{ week: 'Week 4', score: 81 },
];

/**
 * Default insights for Operation Manager dashboard
 * These are generic recommendations for operational improvement across all clients
 */
const DEFAULT_OPERATION_MANAGER_INSIGHTS: Insight[] = [
	{
		title: 'Multi-Client Compliance',
		description: 'Regulatory compliance issues detected across multiple clients - immediate remediation required.',
		type: 'warning',
	},
	{
		title: 'Resource Constraints',
		description: 'Several clients approaching resource capacity limits - consider workforce optimization.',
		type: 'warning',
	},
	{
		title: 'SLA Performance',
		description: 'Monitor SLA adherence across clients - some teams approaching threshold limits.',
		type: 'warning',
	},
	{
		title: 'Platform Stability',
		description: 'Overall platform stability at 86% - continue infrastructure monitoring and improvements.',
		type: 'neutral',
	},
];

const OperationManagerDashboard: React.FC = () => {
	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* Header Section */}
				<div>
					<Title order={1}>Operation Manager Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Operational Insights & Platform Health
					</Text>
				</div>

				{/* Performance Scores Section */}
				<SectionCard
					title='Performance Scores'
					description='Cross-client operational analysis, sentiment, compliance, and business insights'
				>
					<PerformanceScoresSection metrics={OPERATION_MANAGER_WEEKLY_METRICS} />
				</SectionCard>

				{/* Quick Stats Widget */}
				<SectionCard
					title='Quick Stats'
					description='Key platform-wide metrics this week'
				>
					<QuickStatsWidget
						data={OPERATION_MANAGER_QUICK_STATS}
						title='Platform Statistics'
					/>
				</SectionCard>

				{/* Sentiment Trend Chart */}
				<SectionCard
					title='Sentiment Trend'
					description='4-week sentiment analysis across all clients and customers'
				>
					<SentimentTrendChart data={OPERATION_MANAGER_SENTIMENT_TREND} />
				</SectionCard>

				{/* Performance Trend Chart */}
				<SectionCard
					title='Performance Trend'
					description='Operational health score progression over the past 4 weeks'
				>
					<PerformanceTrendChart data={OPERATION_MANAGER_PERFORMANCE_TREND} />
				</SectionCard>

				{/* Critical Issues Table */}
				{CRITICAL_ISSUES_OPERATION_MANAGER.length > 0 && (
					<SectionCard
						title='Critical Issues'
						description='Urgent operational items requiring immediate attention across all clients'
					>
						<CriticalIssuesTable issues={CRITICAL_ISSUES_OPERATION_MANAGER} />
					</SectionCard>
				)}

				{/* Best and Worst Calls Panel */}
				<SectionCard
					title='Best and Worst Calls'
					description='Top and bottom performing calls from across all clients this week'
				>
					<BestWorstCallsPanel calls={OPERATION_MANAGER_CALLS} />
				</SectionCard>

				{/* Quick Insights Widget */}
				<SectionCard
					title='Quick Insights'
					description='Operational recommendations for platform improvement'
				>
					<QuickInsightsWidget insights={DEFAULT_OPERATION_MANAGER_INSIGHTS} />
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default OperationManagerDashboard;

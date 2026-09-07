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
	QA_MANAGER_WEEKLY_METRICS,
	QA_MANAGER_SENTIMENT_TREND,
	QA_MANAGER_QUICK_STATS,
	QA_MANAGER_CALLS,
	CRITICAL_ISSUES_QA_MANAGER,
} from '../mockData';

/**
 * Mock 4-week performance trend data for the platform
 * This shows the platform's QA score progression over the past 4 weeks
 */
const QA_MANAGER_PERFORMANCE_TREND: PerformanceTrendPoint[] = [
	{ week: 'Week 1', score: 82 },
	{ week: 'Week 2', score: 83 },
	{ week: 'Week 3', score: 83 },
	{ week: 'Week 4', score: 84 },
];

/**
 * Default insights for QA manager dashboard
 * These are generic recommendations that apply to all QA managers overseeing the platform
 */
const DEFAULT_QA_MANAGER_INSIGHTS: Insight[] = [
	{
		title: 'Platform Performance',
		description: 'Platform-wide QA scores are trending upward with consistent improvements.',
		type: 'positive',
	},
	{
		title: 'Compliance Monitoring',
		description: 'Multiple supervisors need reinforced compliance training across the platform.',
		type: 'warning',
	},
	{
		title: 'Escalation Management',
		description: 'Escalation rates remain elevated - coordinate with supervisors for improvement.',
		type: 'warning',
	},
	{
		title: 'Resource Optimization',
		description: 'Consider redistributing QA resources for more balanced team coverage.',
		type: 'neutral',
	},
];

const QAManagerDashboard: React.FC = () => {
	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* Header Section */}
				<div>
					<Title order={1}>QA Manager Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Platform performance overview
					</Text>
				</div>

				{/* Performance Scores Section */}
				<SectionCard
					title='Performance Scores'
					description='Platform QA analysis, sentiment, compliance, and business insights'
				>
					<PerformanceScoresSection metrics={QA_MANAGER_WEEKLY_METRICS} />
				</SectionCard>

				{/* Quick Stats Widget */}
				<SectionCard
					title='Quick Stats'
					description='Key platform metrics this week'
				>
					<QuickStatsWidget
						data={QA_MANAGER_QUICK_STATS}
						title='Platform Statistics'
					/>
				</SectionCard>

				{/* Sentiment Trend Chart */}
				<SectionCard
					title='Sentiment Trend'
					description='4-week sentiment analysis across the platform and customers'
				>
					<SentimentTrendChart data={QA_MANAGER_SENTIMENT_TREND} />
				</SectionCard>

				{/* Performance Trend Chart */}
				<SectionCard
					title='Performance Trend'
					description='Platform QA score progression over the past 4 weeks'
				>
					<PerformanceTrendChart data={QA_MANAGER_PERFORMANCE_TREND} />
				</SectionCard>

				{/* Critical Issues Table */}
				{CRITICAL_ISSUES_QA_MANAGER.length > 0 && (
					<SectionCard
						title='Critical Issues'
						description='Urgent platform-wide items requiring immediate attention'
					>
						<CriticalIssuesTable issues={CRITICAL_ISSUES_QA_MANAGER} />
					</SectionCard>
				)}

				{/* Best and Worst Calls Panel */}
				<SectionCard
					title='Best and Worst Calls'
					description='Top and bottom performing calls from across all teams this week'
				>
					<BestWorstCallsPanel calls={QA_MANAGER_CALLS} />
				</SectionCard>

				{/* Quick Insights Widget */}
				<SectionCard
					title='Quick Insights'
					description='Performance recommendations for platform improvement'
				>
					<QuickInsightsWidget insights={DEFAULT_QA_MANAGER_INSIGHTS} />
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default QAManagerDashboard;

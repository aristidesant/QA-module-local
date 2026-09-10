import React from 'react';
import { Stack, Title, Text, Grid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useDashboardRoleRedirect } from '~/hooks/useDashboardRoleRedirect';
import {
	PerformanceScoresSection,
	SentimentTrendChart,
	QuickStatsWidget,
	PerformanceTrendChart,
	QuickInsightsWidget,
	BestWorstCallsPanel,
	CriticalIssuesTable,
} from '../components';
import BurnoutRiskWidget from '../components/BurnoutRiskWidget';
import type { Insight } from '../components/QuickInsightsWidget';
import type { PerformanceTrendPoint } from '../components/PerformanceTrendChart';
import {
	AGENT_WEEKLY_METRICS,
	AGENT_SENTIMENT_TREND,
	AGENT_QUICK_STATS,
	BEST_WORST_CALLS,
	CRITICAL_ISSUES_AGENT,
	AGENT_BURNOUT_RISK,
} from '../mockData';

/**
 * Mock 4-week performance trend data for the agent
 * This shows the agent's QA score progression over the past 4 weeks
 */
const AGENT_PERFORMANCE_TREND: PerformanceTrendPoint[] = [
	{ week: 'Week 1', score: 88 },
	{ week: 'Week 2', score: 89 },
	{ week: 'Week 3', score: 91 },
	{ week: 'Week 4', score: 92 },
];

/**
 * Default insights for agent dashboard
 * These are generic recommendations that apply to all agents
 */
const DEFAULT_AGENT_INSIGHTS: Insight[] = [
	{
		title: 'Strong Performance',
		description: 'Your QA score is performing well. Keep up the great work!',
		type: 'positive',
	},
	{
		title: 'Sentiment Improvement',
		description:
			'Customer sentiment is trending positively this week.',
		type: 'positive',
	},
	{
		title: 'Compliance Status',
		description: 'All compliance categories are in good standing.',
		type: 'positive',
	},
];

const AgentDashboard: React.FC = () => {
	useDashboardRoleRedirect();

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* Header Section */}
				<div>
					<Title order={1}>Agent Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Your personal performance overview - This week
					</Text>
				</div>

				{/* Performance Scores Section */}
				<SectionCard
					title='Performance Scores'
					description='Your QA analysis, sentiment, compliance, and business insights'
				>
					<PerformanceScoresSection metrics={AGENT_WEEKLY_METRICS} />
				</SectionCard>

				{/* Quick Stats Widget */}
				<SectionCard
					title='Quick Stats'
					description='Key metrics for this week'
				>
					<QuickStatsWidget
						data={AGENT_QUICK_STATS}
						title='Weekly Statistics'
					/>
				</SectionCard>

				{/* Sentiment Trend Chart */}
				<SectionCard
					title='Sentiment Trend'
					description='4-week sentiment analysis for you and your customers'
				>
					<SentimentTrendChart data={AGENT_SENTIMENT_TREND} />
				</SectionCard>

				{/* Performance Trend Chart */}
				<SectionCard
					title='Performance Trend'
					description='Your QA score progression over the past 4 weeks'
				>
					<PerformanceTrendChart data={AGENT_PERFORMANCE_TREND} />
				</SectionCard>

				{/* 2-Row Grid: Burnout Risk and Critical Issues */}
				<Grid>
					{/* Burnout Risk Widget */}
					<Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 6 }}>
						<SectionCard
							title='Burnout Assessment'
							description='Your current burnout risk level'
						>
							<BurnoutRiskWidget data={AGENT_BURNOUT_RISK} />
						</SectionCard>
					</Grid.Col>

					{/* Critical Issues Table */}
					<Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 6 }}>
						{CRITICAL_ISSUES_AGENT.length > 0 && (
							<SectionCard
								title='Critical Issues'
								description='Urgent items requiring your attention'
							>
								<CriticalIssuesTable issues={CRITICAL_ISSUES_AGENT} />
							</SectionCard>
						)}
					</Grid.Col>
				</Grid>

				{/* Best and Worst Calls Panel */}
				<SectionCard
					title='Best and Worst Calls'
					description='Your top and bottom performing calls this week'
				>
					<BestWorstCallsPanel calls={BEST_WORST_CALLS} />
				</SectionCard>

				{/* Quick Insights Widget */}
				<SectionCard
					title='Quick Insights'
					description='Performance recommendations and analysis'
				>
					<QuickInsightsWidget insights={DEFAULT_AGENT_INSIGHTS} />
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default AgentDashboard;

import React from 'react';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, SimpleGrid, Tabs, Card } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionCard,
	AutoFailsCard,
	SentimentTrendChart,
	CriticalIssuesTable,
	BestWorstCallsTable,
	QuickInsightsWidget,
	RankingsTable,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import type { RankingEntry, RankingGoal } from '../components/RankingsTable';
import {
	AGENT_WEEKLY_METRICS,
	AGENT_SENTIMENT_TREND,
	BEST_WORST_CALLS,
	CRITICAL_ISSUES_AGENT,
} from '../mockData';
import styles from '../Dashboard.module.css';

/** Inbox this dashboard's critical issues drill into */
const AGENT_INBOX_PATH = '/qa/agent/inbox';

/**
 * Default insights for the agent dashboard
 */
const DEFAULT_AGENT_INSIGHTS: Insight[] = [
	{
		title: 'Strong Performance',
		description: 'Your QA score is performing well. Keep up the great work!',
		type: 'positive',
	},
	{
		title: 'Sentiment Improvement',
		description: 'Customer sentiment is trending positively this week.',
		type: 'positive',
	},
	{
		title: 'Compliance Status',
		description: 'All compliance categories are in good standing.',
		type: 'positive',
	},
];

/**
 * Ranking goal defined by the agent's supervisor: the metrics the ranking
 * score is built from and how they are weighted.
 */
const AGENT_RANKING_GOAL: RankingGoal = {
	metric: 'QA Score',
	criteria: 'Weighted average with compliance adjustments',
	target: 'Score of 90 or above',
	dueDate: '2026-12-31',
	setBy: 'Sarah Johnson · Supervisor',
};

/**
 * Mock team rankings for the "Team Rankings" tab.
 * Includes the current agent (John Smith, matching the agent identity used
 * across this module's other mock datasets) alongside the top team members.
 */
const AGENT_TEAM_RANKINGS: RankingEntry[] = [
	{
		position: 1,
		name: 'Mike Chen',
		score: 97,
		reactions: { applause: 12, reverence: 8, salute: 5, thumbsUp: 10 },
		trend: 'up',
		trendValue: 3,
	},
	{
		position: 2,
		name: 'Sarah Johnson',
		score: 95,
		reactions: { applause: 10, reverence: 7, salute: 4, thumbsUp: 6 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 3,
		name: 'Jessica Martinez',
		score: 93,
		reactions: { applause: 9, reverence: 5, salute: 3, thumbsUp: 4 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 4,
		name: 'John Smith',
		score: 90,
		reactions: { applause: 8, reverence: 4, salute: 2, thumbsUp: 3 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 5,
		name: 'Emma Davis',
		score: 88,
		reactions: { applause: 6, reverence: 3, salute: 1, thumbsUp: 2 },
		trend: 'down',
		trendValue: 1,
	},
];

export const NewAgentDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { qaScore, sentiment, complianceCategories, autoFailsCount } = AGENT_WEEKLY_METRICS;

	/** Overall sentiment on the 0-5 scale, averaging agent and customer readings */
	const overallSentiment = (sentiment.agentAvg + sentiment.customerAvg) / 2;

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* 1. Header Section */}
				<div>
					<Title order={1}>Agent Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Your personal performance overview
					</Text>
				</div>

				{/* 2. Performance Score Row: Quality Assurance | Compliance | Sentiment & Emotion | Auto-Fails */}
				<SectionCard
					title='Performance Score'
					description='Your quality assurance, compliance, sentiment, and auto-fails results this week'
				>
					<SimpleGrid cols={{ base: 1, md: 4 }} spacing='md'>
						<QualityAssuranceCard score={qaScore} subtitle='Category breakdown' />
						<ComplianceCard categories={complianceCategories} subtitle='Category overview' />
						<SentimentEmotionCard
							score={overallSentiment}
							predominantEmotion={sentiment.predominantEmotion}
							subtitle='0-5 scale assessment'
						/>
						<div>
							<AutoFailsCard sectionAutoFails={autoFailsCount} globalAutoFails={18} compact />
						</div>
					</SimpleGrid>
				</SectionCard>

				{/* 3-4. Critical Issues + Team Rankings (same row) */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Critical Issues' description='Personal issues requiring your attention'>
						<CriticalIssuesTable
							issues={CRITICAL_ISSUES_AGENT}
							onIssueClick={() => navigate(AGENT_INBOX_PATH)}
						/>
					</SectionCard>

					<SectionCard title='Team Rankings' description="Your current ranking alongside the team's top performers this period">
						<RankingsTable
							entries={AGENT_TEAM_RANKINGS}
							title='Team Rankings'
							description="Your current ranking alongside the team's top performers this period"
							goal={AGENT_RANKING_GOAL}
							maxDisplay={5}
						/>
					</SectionCard>
				</SimpleGrid>

				{/* 5. Sentiment trend and quick insights */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Sentiment Trend' description='4-week sentiment progression'>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<SentimentTrendChart data={AGENT_SENTIMENT_TREND} />
						</Card>
					</SectionCard>

					<SectionCard title='Quick Insights' description='Performance recommendations and analysis'>
						<QuickInsightsWidget insights={DEFAULT_AGENT_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				{/* 6. Best & Worst Calls (full-width) */}
				<SectionCard title='Best & Worst Calls' description='Your top and bottom performing calls this week'>
					<BestWorstCallsTable calls={BEST_WORST_CALLS} />
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default NewAgentDashboard;

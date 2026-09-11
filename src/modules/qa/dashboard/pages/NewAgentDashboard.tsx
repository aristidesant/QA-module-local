import React, { useState } from 'react';
import { Stack, Title, Text, SimpleGrid, Card } from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionCard,
	AutoFailsCard,
	SentimentTrendChart,
	BestWorstCallsTable,
	QuickInsightsWidget,
	RankingsTable,
	BurnoutRiskWidget,
	InboxSummary,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import type { RankingEntry, RankingGoal } from '../components/RankingsTable';
import {
	AGENT_WEEKLY_METRICS,
	AGENT_SENTIMENT_TREND,
	BEST_WORST_CALLS,
	AGENT_BURNOUT_RISK,
} from '../mockData';
import styles from '../Dashboard.module.css';

/** Inbox this dashboard's critical issues drill into */

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
	metric: 'Sentiment & Emotion',
	criteria: 'Customer and agent sentiment scores',
	target: 'Average score of 4.0 or above',
	startDate: '2026-09-01',
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
		score: 4.9,
		reactions: { LIKE: 10, HELPFUL: 12, INSPIRING: 8, AMAZING: 5, LEADER: 2 },
		trend: 'up',
		trendValue: 3,
	},
	{
		position: 2,
		name: 'Sarah Johnson',
		score: 4.7,
		reactions: { LIKE: 6, HELPFUL: 10, INSPIRING: 7, AMAZING: 4, LEADER: 2 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 3,
		name: 'Jessica Martinez',
		score: 4.5,
		reactions: { LIKE: 4, HELPFUL: 9, INSPIRING: 5, AMAZING: 3, LEADER: 1 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 4,
		name: 'John Smith',
		score: 4.2,
		reactions: { LIKE: 3, HELPFUL: 8, INSPIRING: 4, AMAZING: 2, LEADER: 1 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 5,
		name: 'Emma Davis',
		score: 4.0,
		reactions: { LIKE: 2, HELPFUL: 6, INSPIRING: 3, AMAZING: 1, LEADER: 0 },
		trend: 'down',
		trendValue: 1,
	},
];

type EvaluationType = 'all' | 'qa' | 'sentiment' | 'compliance' | 'business';

export const NewAgentDashboard: React.FC = () => {
	const [evaluationType, setEvaluationType] = useState<EvaluationType>('all');
	const { qaScore, sentiment, complianceCategories, autoFailsCount } =
		AGENT_WEEKLY_METRICS;

	/** Overall sentiment on the 0-5 scale, averaging agent and customer readings */
	const overallSentiment = (sentiment.agentAvg + sentiment.customerAvg) / 2;

	/** Helper to determine if a card should be shown based on filter */
	const shouldShowCard = (type: EvaluationType | EvaluationType[]): boolean => {
		if (evaluationType === 'all') return true;
		const types = Array.isArray(type) ? type : [type];
		return types.includes(evaluationType);
	};

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
						<QualityAssuranceCard
							score={qaScore}
							subtitle='Category breakdown'
						/>
						<ComplianceCard
							categories={complianceCategories}
							subtitle='Category overview'
						/>
						<SentimentEmotionCard
							score={overallSentiment}
							predominantEmotion={sentiment.predominantEmotion}
							subtitle='0-5 scale assessment'
						/>
						<div>
							<AutoFailsCard
								sectionAutoFails={autoFailsCount}
								globalAutoFails={18}
								compact
							/>
						</div>
					</SimpleGrid>
				</SectionCard>

				{/* 2.5. Evaluation Type Filter */}
				<div>
					<Text size='sm' fw={500} mb='xs'>
						Filter by evaluation type
					</Text>
					<AppSegmentedControl
						value={evaluationType}
						onChange={(value) => setEvaluationType(value as EvaluationType)}
						data={[
							{ label: 'All', value: 'all' },
							{ label: 'QA', value: 'qa' },
							{ label: 'Sentiment & Emotion', value: 'sentiment' },
							{ label: 'Compliance', value: 'compliance' },
							{ label: 'Business Insight', value: 'business' },
						]}
					/>
				</div>

				{/* 3. Inbox Summary & Burnout Assessment (Side by side) */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					{/* inline-style-allow: dynamic opacity based on filter state */}
					<div
						style={{
							opacity: shouldShowCard('qa') ? 1 : 0.5,
							transition: 'opacity 0.2s',
						}}
					>
						<InboxSummary
							autoDrivenCount={3}
							negativeCount={2}
							trendCount={5}
							inboxPath='/qa/agent/inbox'
						/>
					</div>

					{/* inline-style-allow: dynamic opacity based on filter state */}
					<div
						style={{
							opacity: shouldShowCard('qa') ? 1 : 0.5,
							transition: 'opacity 0.2s',
						}}
					>
						<SectionCard
							title='Burnout Assessment'
							description='Your current burnout risk level'
						>
							<BurnoutRiskWidget data={AGENT_BURNOUT_RISK} />
						</SectionCard>
					</div>
				</SimpleGrid>

				{/* 4. Team Rankings */}
				<div
					style={{
						opacity: shouldShowCard('qa') ? 1 : 0.5,
						transition: 'opacity 0.2s',
					}}
				>
					<SectionCard
						title='Team Rankings'
						description="Your current ranking alongside the team's top performers this period"
					>
						<RankingsTable
							entries={AGENT_TEAM_RANKINGS}
							title='Team Rankings'
							description="Your current ranking alongside the team's top performers this period"
							goal={AGENT_RANKING_GOAL}
							maxDisplay={5}
							onViewAll={() => {
								// Navigate to full rankings view
								const element = document.getElementById(
									'team-rankings-section'
								);
								if (element) {
									element.scrollIntoView({ behavior: 'smooth' });
								}
							}}
						/>
					</SectionCard>
				</div>

				{/* 5. Sentiment trend and quick insights */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<div
						style={{
							opacity: shouldShowCard('sentiment') ? 1 : 0.5,
							transition: 'opacity 0.2s',
						}}
					>
						<SectionCard
							title='Sentiment Trend'
							description='4-week sentiment progression'
						>
							<Card className={styles.metricCard} p='md' radius='md' withBorder>
								<SentimentTrendChart data={AGENT_SENTIMENT_TREND} />
							</Card>
						</SectionCard>
					</div>

					<div
						style={{
							opacity: shouldShowCard(['sentiment', 'compliance', 'business'])
								? 1
								: 0.5,
							transition: 'opacity 0.2s',
						}}
					>
						<SectionCard
							title='Quick Insights'
							description='Performance recommendations and analysis'
						>
							<QuickInsightsWidget insights={DEFAULT_AGENT_INSIGHTS} />
						</SectionCard>
					</div>
				</SimpleGrid>

				{/* 6. Best & Worst Calls (full-width) */}
				<div
					style={{
						opacity: shouldShowCard('qa') ? 1 : 0.5,
						transition: 'opacity 0.2s',
					}}
				>
					<SectionCard
						title='Best & Worst Calls'
						description='Your top and bottom performing calls this week'
					>
						<BestWorstCallsTable calls={BEST_WORST_CALLS} />
					</SectionCard>
				</div>
			</Stack>
		</ContentContainer>
	);
};

export default NewAgentDashboard;

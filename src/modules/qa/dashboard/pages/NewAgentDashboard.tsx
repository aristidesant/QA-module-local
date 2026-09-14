import React from 'react';
import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionCard,
	BusinessInsightsCard,
	SentimentTrendChart,
	BestWorstCallsTable,
	QuickInsightsWidget,
	RankingsTable,
	InboxSummary,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import { useDashboardRankings } from '~/modules/qa/rankings/hooks/useDashboardRankings';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import {
	AGENT_WEEKLY_METRICS,
	AGENT_SENTIMENT_TREND,
	BEST_WORST_CALLS,
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

export const NewAgentDashboard: React.FC = () => {
	const {
		entries: rankingEntries,
		goal: rankingGoal,
		myPosition: rankingMyPosition,
	} = useDashboardRankings('Team 1', 7, AGENT_PERSONA_ID);
	const {
		qaScore,
		sentiment,
		complianceCategories,
		autoFailsCount,
		businessInsights,
		businessOutcome,
	} = AGENT_WEEKLY_METRICS;

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

				{/* 2. Performance Score: the four evaluation aspects */}
				<SectionCard
					title='Performance Score'
					description='Your quality assurance, compliance, sentiment and business results this week'
				>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
						<div className={styles.gridCard}>
							<QualityAssuranceCard
								score={qaScore}
								subtitle='Category breakdown'
								autoFails={autoFailsCount}
							/>
						</div>
						<div className={styles.gridCard}>
							<ComplianceCard
								categories={complianceCategories}
								subtitle='Category overview'
							/>
						</div>
						<div className={styles.gridCard}>
							<SentimentEmotionCard
								score={overallSentiment}
								predominantEmotion={sentiment.predominantEmotion}
								subtitle='0-5 scale assessment'
							/>
						</div>
						<div className={styles.gridCard}>
							<BusinessInsightsCard
								insights={businessInsights}
								outcome={businessOutcome}
								subtitle='Conversion and signals'
							/>
						</div>
					</SimpleGrid>
				</SectionCard>

				{/* 3. Inbox summary */}
				<InboxSummary
					autoDrivenCount={3}
					negativeCount={2}
					trendCount={5}
					inboxPath='/qa/agent/inbox'
				/>

				{/* 4. Team rankings */}
				<SectionCard
					title='Team Rankings'
					description="Your current ranking alongside the team's top performers this period"
				>
					<RankingsTable
						entries={rankingEntries}
						title='Team Rankings'
						description="Your current ranking alongside the team's top performers this period"
						goal={rankingGoal}
						maxDisplay={5}
						currentAgentId={AGENT_PERSONA_ID}
						myPosition={rankingMyPosition}
					/>
				</SectionCard>

				{/* 5. Sentiment trend & quick insights */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Sentiment Trend'
						description='4-week sentiment progression'
						fullHeight
					>
						<SentimentTrendChart data={AGENT_SENTIMENT_TREND} />
					</SectionCard>
					<SectionCard
						title='Quick Insights'
						description='Performance recommendations and analysis'
						fullHeight
					>
						<QuickInsightsWidget insights={DEFAULT_AGENT_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				{/* 6. Best & worst calls */}
				<SectionCard
					title='Best & Worst Calls'
					description='Your top and bottom performing calls this week'
				>
					<BestWorstCallsTable calls={BEST_WORST_CALLS} />
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default NewAgentDashboard;

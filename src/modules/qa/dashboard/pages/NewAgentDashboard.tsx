import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionSplitCard,
	SentimentTrendChart,
	BestWorstCallsTable,
	QuickInsightsWidget,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import {
	AGENT_DASHBOARD_DAYS,
	buildAgentDashboardMetrics,
} from '~/modules/qa/calls/agentMetrics';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import { AGENT_SENTIMENT_TREND, BEST_WORST_CALLS } from '../mockData';
import styles from '../Dashboard.module.css';

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

/** Card rows → the My Calls issue they open. */
const QA_ISSUE: Record<
	'ecn' | 'enc' | 'ecc' | 'ecuf' | 'autoFails',
	CallIssueKey
> = {
	ecn: 'qa-ecn',
	enc: 'qa-enc',
	ecc: 'qa-ecc',
	ecuf: 'qa-ecuf',
	autoFails: 'auto-fail',
};
const COMPLIANCE_ISSUE: Record<
	'Security' | 'Regulatory' | 'Legal',
	CallIssueKey
> = {
	Security: 'compliance-security',
	Regulatory: 'compliance-regulatory',
	Legal: 'compliance-legal',
};
const MY_CALLS_PATH = '/qa/agent/calls';

export const NewAgentDashboard: React.FC = () => {
	const navigate = useNavigate();
	const metrics = useMemo(
		() => buildAgentDashboardMetrics(AGENT_PERSONA_ID, AGENT_DASHBOARD_DAYS),
		[]
	);

	/** Opens My Calls filtered on one issue, over the same 30-day window the cards summarise. */
	const openIssue = (issue: CallIssueKey) =>
		navigate(`${MY_CALLS_PATH}?tab=calls&issue=${issue}&period=30d`);

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

				{/* 2. Performance Score: QA, Compliance, Sentiment & Emotion — each row opens the calls behind it */}
				<SectionCard
					title='Performance Score'
					description={`Your quality assurance, compliance and sentiment results over the last ${AGENT_DASHBOARD_DAYS} days · ${metrics.calls} calls evaluated`}
				>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='md'>
						<div className={styles.gridCard}>
							<QualityAssuranceCard
								score={metrics.qa}
								subtitle='Calls without each error type'
								autoFails={metrics.autoFails}
								issueCounts={{
									...metrics.qaIssueCounts,
									autoFails: metrics.autoFails,
								}}
								onCategoryClick={(key) => openIssue(QA_ISSUE[key])}
							/>
						</div>
						<div className={styles.gridCard}>
							<ComplianceCard
								categories={metrics.complianceCategories}
								subtitle='Calls meeting each area target'
								issueCounts={metrics.complianceIssueCounts}
								onCategoryClick={(name) => openIssue(COMPLIANCE_ISSUE[name])}
							/>
						</div>
						<div className={styles.gridCard}>
							<SentimentEmotionSplitCard
								agent={{
									score: metrics.sentiment.agentAvg,
									emotion: metrics.sentiment.agentEmotion,
									negativeCount: metrics.sentiment.agentNegativeCount,
								}}
								customer={{
									score: metrics.sentiment.customerAvg,
									emotion: metrics.sentiment.customerEmotion,
									negativeCount: metrics.sentiment.customerNegativeCount,
								}}
								subtitle='You vs the customers you contacted'
								onReviewClick={(side) =>
									openIssue(
										side === 'agent'
											? 'negative-agent-emotion'
											: 'negative-customer-emotion'
									)
								}
							/>
						</div>
					</SimpleGrid>
				</SectionCard>

				{/* 3. Sentiment trend & quick insights */}
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

				{/* 4. Best & worst calls */}
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

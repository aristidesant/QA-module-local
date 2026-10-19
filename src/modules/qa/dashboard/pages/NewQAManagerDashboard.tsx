import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	COMPLIANCE_ISSUE,
	QA_ISSUE,
	teamConversationsPath,
} from '~/modules/qa/calls/constants';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionSplitCard,
	BusinessInsightsCard,
	OperationalCard,
	CampaignPerformanceCard,
	DisputesSummaryCard,
	PerformanceScoreControls,
	type CampaignPerformanceEntry,
} from '../components';
import { useDashboardCopy } from '../useDashboardCopy';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import {
	buildTeamDashboardMetrics,
	buildTeamBusinessInsights,
} from '~/modules/qa/calls/agentMetrics';
import type { DashboardLineOfBusiness } from '../lineOfBusiness';
import {
	DEFAULT_PERFORMANCE_SCORE_PERIOD,
	performanceScoreDays,
	type PerformanceScorePeriod,
} from '../constants';
import styles from '../Dashboard.module.css';

/** Time-window clause per period, used in the Performance Score description. */
const WINDOW_PHRASE: Record<PerformanceScorePeriod, string> = {
	today: 'today',
	week: 'this week',
	month: 'this month',
	quarter: 'over the last 3 months',
	sixMonths: 'over the last 6 months',
};

const ACTIVE_CAMPAIGNS: CampaignPerformanceEntry[] = [
	{
		id: 'CMP-1',
		name: 'Q2 Sales Performance',
		status: 'active',
		qaScore: 92,
		complianceScore: 88,
		sentimentScore: 90,
		businessScore: 85,
		callsScored: 612,
	},
	{
		id: 'CMP-2',
		name: 'Customer Support Quality',
		status: 'active',
		qaScore: 78,
		complianceScore: 95,
		sentimentScore: 72,
		businessScore: 69,
		callsScored: 845,
	},
	{
		id: 'CMP-3',
		name: 'Compliance Audit Wave 2',
		status: 'active',
		qaScore: 95,
		complianceScore: 98,
		sentimentScore: 91,
		businessScore: 88,
		callsScored: 421,
	},
	{
		id: 'CMP-4',
		name: 'Retention Outreach',
		status: 'active',
		qaScore: 65,
		complianceScore: 74,
		sentimentScore: 58,
		businessScore: 52,
		callsScored: 298,
	},
	{
		id: 'CMP-5',
		name: 'VIP Escalations',
		status: 'active',
		qaScore: 88,
		complianceScore: 90,
		sentimentScore: 95,
		businessScore: 93,
		callsScored: 156,
	},
	{
		id: 'CMP-6',
		name: 'New Hire Training - June',
		status: 'paused',
		qaScore: 70,
		complianceScore: 80,
		sentimentScore: 75,
		businessScore: 60,
		callsScored: 45,
	},
];

export const NewQAManagerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const copy = useDashboardCopy('qaManager');
	const [period, setPeriod] = useState<PerformanceScorePeriod>(
		DEFAULT_PERFORMANCE_SCORE_PERIOD
	);
	const days = performanceScoreDays(period);
	const [lineOfBusiness, setLineOfBusiness] =
		useState<DashboardLineOfBusiness | null>(null);
	const thresholds = useSettingsStore(selectThresholds);
	const metrics = useMemo(
		() =>
			buildTeamDashboardMetrics('qa-manager', days, lineOfBusiness, thresholds),
		[days, lineOfBusiness, thresholds]
	);
	const {
		insights: businessInsights,
		outcome: businessOutcome,
		conversionTrend,
	} = useMemo(
		() => buildTeamBusinessInsights('qa-manager', days, lineOfBusiness),
		[days, lineOfBusiness]
	);

	/** Card rows open the team's Conversations list, pre-filtered to the row's issue and this widget's period. */
	const openConversations = (issue?: CallIssueKey) =>
		navigate(
			teamConversationsPath('qa-manager', { issue, period, lineOfBusiness })
		);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>{copy.title}</Title>
					<Text c='dimmed' mt='xs'>
						{copy.subtitle}
					</Text>
				</div>

				<SectionCard
					title='Performance Score'
					description={`Platform quality assurance, compliance, sentiment and business results ${WINDOW_PHRASE[period]}${lineOfBusiness ? ` · ${lineOfBusiness}` : ''}`}
					headerActions={
						<PerformanceScoreControls
							period={period}
							onPeriodChange={setPeriod}
							lineOfBusiness={lineOfBusiness}
							onLineOfBusinessChange={setLineOfBusiness}
						/>
					}
				>
					<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing='md'>
						<div className={styles.gridCard}>
							<OperationalCard
								calls={metrics.calls}
								effectiveContacts={metrics.effectiveContacts}
								nonEffectiveContacts={metrics.nonEffectiveContacts}
								subtitle={copy.cardSubtitle('operational')}
								onCallsClick={() => openConversations()}
								onNonEffectiveClick={() =>
									openConversations('non-effective-contact')
								}
								trend={metrics.trends?.effectiveContacts}
							/>
						</div>
						<div className={styles.gridCard}>
							<QualityAssuranceCard
								score={metrics.qa}
								subtitle={copy.cardSubtitle('qa')}
								onCategoryClick={(key) => openConversations(QA_ISSUE[key])}
								autoFails={metrics.autoFails}
								issueCounts={{
									...metrics.qaIssueCounts,
									autoFails: metrics.autoFails,
								}}
								trend={metrics.trends?.qa}
							/>
						</div>
						<div className={styles.gridCard}>
							<ComplianceCard
								categories={metrics.complianceCategories}
								subtitle={copy.cardSubtitle('compliance')}
								onCategoryClick={(name) =>
									openConversations(COMPLIANCE_ISSUE[name])
								}
								issueCounts={metrics.complianceIssueCounts}
								trend={metrics.trends?.compliance}
							/>
						</div>
						<div className={styles.gridCard}>
							<SentimentEmotionSplitCard
								agent={{
									score: metrics.sentiment.agentAvg,
									emotion: metrics.sentiment.agentEmotion,
									negativeCount: metrics.sentiment.agentNegativeCount,
									trend: metrics.trends?.agentSentiment,
								}}
								customer={{
									score: metrics.sentiment.customerAvg,
									emotion: metrics.sentiment.customerEmotion,
									negativeCount: metrics.sentiment.customerNegativeCount,
									trend: metrics.trends?.customerSentiment,
								}}
								subtitle={copy.cardSubtitle('sentiment')}
								onReviewClick={(side) =>
									openConversations(
										side === 'agent'
											? 'negative-agent-emotion'
											: 'negative-customer-emotion'
									)
								}
							/>
						</div>
						<div className={styles.gridCard}>
							<BusinessInsightsCard
								insights={businessInsights}
								outcome={businessOutcome}
								subtitle={copy.cardSubtitle('business')}
								conversionTrend={conversionTrend}
							/>
						</div>
					</SimpleGrid>
				</SectionCard>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<DisputesSummaryCard role='qa-manager' />

					<CampaignPerformanceCard entries={ACTIVE_CAMPAIGNS} />
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewQAManagerDashboard;

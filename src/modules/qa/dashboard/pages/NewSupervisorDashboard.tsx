import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Stack, Title, Text, Grid, SimpleGrid } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionSplitCard,
	BusinessInsightsCard,
	OperationalCard,
	TeamBurnoutRiskCard,
	WeekCoachingSessionsCard,
	PerformanceScoreControls,
} from '../components';
import { useDashboardCopy } from '../useDashboardCopy';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { useActiveRankingByTeam } from '~/modules/qa/rankings/hooks/useActiveRanking';
import RankingStandings from '~/modules/qa/rankings/components/RankingStandings';
import {
	buildTeamDashboardMetrics,
	buildTeamBusinessInsights,
} from '~/modules/qa/calls/agentMetrics';
import { teamBurnoutRisk } from '~/modules/qa/analytics/helpers';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
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

/** Team-wide drill-down target: no team calls list exists yet, so rows open Team Analytics. */
const ANALYTICS_PATH = '/qa/supervisor/analytics';

export const NewSupervisorDashboard: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const copy = useDashboardCopy('supervisor');
	const navigate = useNavigate();
	const { program, standings } = useActiveRankingByTeam('Team 1');
	const [period, setPeriod] = useState<PerformanceScorePeriod>(
		DEFAULT_PERFORMANCE_SCORE_PERIOD
	);
	const days = performanceScoreDays(period);
	const [lineOfBusiness, setLineOfBusiness] =
		useState<DashboardLineOfBusiness | null>(null);
	const thresholds = useSettingsStore(selectThresholds);
	const metrics = useMemo(
		() =>
			buildTeamDashboardMetrics('supervisor', days, lineOfBusiness, thresholds),
		[days, lineOfBusiness, thresholds]
	);
	const {
		insights: businessInsights,
		outcome: businessOutcome,
		conversionTrend,
	} = useMemo(
		() => buildTeamBusinessInsights('supervisor', days, lineOfBusiness),
		[days, lineOfBusiness]
	);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const burnoutRisk = useMemo(
		() => teamBurnoutRisk('supervisor', triggerRules),
		[triggerRules]
	);

	const openAnalytics = () => navigate(ANALYTICS_PATH);

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
					description={`Your team's quality assurance, compliance, sentiment and business results ${WINDOW_PHRASE[period]}${lineOfBusiness ? ` · ${lineOfBusiness}` : ''}`}
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
								onNonEffectiveClick={openAnalytics}
								trend={metrics.trends?.effectiveContacts}
							/>
						</div>
						<div className={styles.gridCard}>
							<QualityAssuranceCard
								score={metrics.qa}
								subtitle={copy.cardSubtitle('qa')}
								onCategoryClick={openAnalytics}
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
								onCategoryClick={openAnalytics}
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
								onReviewClick={openAnalytics}
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

				<Grid gap='lg'>
					<Grid.Col span={{ base: 12, lg: 4 }}>
						{!program ? (
							<SectionCard fullHeight>
								<EmptyState
									icon={<IconTrophy size={32} />}
									message={t('agent.empty.noActive')}
								/>
							</SectionCard>
						) : (
							<RankingStandings program={program} standings={standings} dense />
						)}
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
						<TeamBurnoutRiskCard
							entries={burnoutRisk}
							role='supervisor'
							subtitle="Your team's members showing signs of burnout"
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
						<WeekCoachingSessionsCard
							role='supervisor'
							coachId={SUPERVISOR_PERSONA.id}
						/>
					</Grid.Col>
				</Grid>
			</Stack>
		</ContentContainer>
	);
};

export default NewSupervisorDashboard;

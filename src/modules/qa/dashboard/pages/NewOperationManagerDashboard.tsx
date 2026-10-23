import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { Stack, Title, Text, SimpleGrid, Grid, Group } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl/AppSegmentedControl';
import { OperationManagerInsights } from '../insights/OperationManagerInsights';
import insightsStyles from '../insights/Insights.module.css';
import SectionCard from '~/components/SectionCard';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionSplitCard,
	OperationalCard,
	PerformanceScoreControls,
	BusinessInsightsCard,
	TeamPerformanceTrendCard,
	PlatformBurnoutCard,
	EsgScoreCard,
	HumanVsAiCard,
	CampaignPerformanceTable,
} from '../components';
import { OPERATION_MANAGER_ESG, HUMAN_VS_AI_PERFORMANCE } from '../mockData';
import { useDashboardCopy } from '../useDashboardCopy';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import {
	buildTeamDashboardMetrics,
	buildTeamBusinessInsights,
	teamCallsInWindow,
} from '~/modules/qa/calls/agentMetrics';
import {
	OPERATION_MANAGER_TEAMS,
	buildTeamPerformanceSeries,
	buildTeamBurnoutSeries,
	platformBurnoutSummary,
	buildCampaignPerformanceRows,
	type TeamTrendMetric,
} from '../operationManagerMetrics';
import type { DashboardLineOfBusiness } from '../lineOfBusiness';
import {
	DEFAULT_PERFORMANCE_SCORE_PERIOD,
	performanceScoreDays,
	type PerformanceScorePeriod,
} from '../constants';
import styles from '../Dashboard.module.css';

/** Time-window clause per period, used in the section descriptions. */
const WINDOW_PHRASE: Record<PerformanceScorePeriod, string> = {
	today: 'today',
	week: 'this week',
	month: 'this month',
	quarter: 'over the last 3 months',
	sixMonths: 'over the last 6 months',
};

export const NewOperationManagerDashboard: React.FC = () => {
	const { t } = useTranslation('qa.dashboard');
	const copy = useDashboardCopy('operationManager');
	// Insights is the default view; ?view=classic keeps the card layout for comparison.
	const [params, setParams] = useSearchParams();
	const view = params.get('view') === 'classic' ? 'classic' : 'insights';
	const [period, setPeriod] = useState<PerformanceScorePeriod>(
		DEFAULT_PERFORMANCE_SCORE_PERIOD
	);
	const days = performanceScoreDays(period);
	const [lineOfBusiness, setLineOfBusiness] =
		useState<DashboardLineOfBusiness | null>(null);
	const thresholds = useSettingsStore(selectThresholds);
	// Portfolio view: every team, over the same window and thresholds the QA manager sees.
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

	// Every strategic section below reads the same window and line of business.
	const calls = useMemo(
		() => teamCallsInWindow('qa-manager', days, lineOfBusiness),
		[days, lineOfBusiness]
	);
	const [teamMetric, setTeamMetric] =
		useState<TeamTrendMetric>('QA_OVERALL_SCORE');
	const teamSeries = useMemo(
		() => buildTeamPerformanceSeries(calls, days, teamMetric),
		[calls, days, teamMetric]
	);
	const burnoutSeries = useMemo(
		() => buildTeamBurnoutSeries(calls, days),
		[calls, days]
	);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const burnoutSummary = useMemo(
		() => platformBurnoutSummary(triggerRules),
		[triggerRules]
	);
	const campaignRows = useMemo(
		() => buildCampaignPerformanceRows(calls, thresholds),
		[calls, thresholds]
	);
	const windowPhrase = WINDOW_PHRASE[period];

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* 1. Header Section: the filters drive every section below */}
				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<div>
						<Title order={1}>{copy.title}</Title>
						<Text c='dimmed' mt='xs'>
							{copy.subtitle}
						</Text>
					</div>
					<Group gap='sm' wrap='wrap' justify='flex-end'>
						<AppSegmentedControl
							value={view}
							onChange={(next) =>
								setParams(
									(prev) => {
										const out = new URLSearchParams(prev);
										if (next === 'classic') out.set('view', 'classic');
										else out.delete('view');
										return out;
									},
									{ replace: true }
								)
							}
							data={[
								{
									value: 'insights',
									label: t('operationManager.insights.view.insights'),
								},
								{
									value: 'classic',
									label: t('operationManager.insights.view.classic'),
								},
							]}
						/>
						<PerformanceScoreControls
							period={period}
							onPeriodChange={setPeriod}
							lineOfBusiness={lineOfBusiness}
							onLineOfBusinessChange={setLineOfBusiness}
						/>
					</Group>
				</Group>

				{view === 'insights' ? (
					<div className={insightsStyles.page}>
						<OperationManagerInsights
							days={days}
							lineOfBusiness={lineOfBusiness}
							onLineOfBusinessChange={setLineOfBusiness}
						/>
					</div>
				) : (
					<>
						{/* 2. Performance Score: the five evaluation aspects, portfolio-wide and compact */}
						<SectionCard
							title='Performance Score'
							description={`Cross-client quality assurance, compliance, sentiment and business results ${windowPhrase}${lineOfBusiness ? ` · ${lineOfBusiness}` : ''}`}
						>
							<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing='md'>
								<div className={styles.gridCard}>
									<OperationalCard
										calls={metrics.calls}
										effectiveContacts={metrics.effectiveContacts}
										nonEffectiveContacts={metrics.nonEffectiveContacts}
										subtitle={copy.cardSubtitle('operational')}
										trend={metrics.trends?.effectiveContacts}
										compact
									/>
								</div>
								<div className={styles.gridCard}>
									<QualityAssuranceCard
										score={metrics.qa}
										subtitle={copy.cardSubtitle('qa')}
										autoFails={metrics.autoFails}
										trend={metrics.trends?.qa}
										compact
									/>
								</div>
								<div className={styles.gridCard}>
									<ComplianceCard
										categories={metrics.complianceCategories}
										subtitle={copy.cardSubtitle('compliance')}
										trend={metrics.trends?.compliance}
										compact
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
										compact
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

						{/* 3. Teams performance over time and the client's ESG score */}
						<Grid gap='lg'>
							<Grid.Col span={{ base: 12, md: 8 }}>
								<SectionCard
									title={t('operationManager.teams.title')}
									description={t('operationManager.teams.description', {
										window: windowPhrase,
									})}
									fullHeight
								>
									<TeamPerformanceTrendCard
										data={teamSeries}
										teams={OPERATION_MANAGER_TEAMS}
										metric={teamMetric}
										onMetricChange={setTeamMetric}
									/>
								</SectionCard>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 4 }}>
								<SectionCard
									title={t('operationManager.esg.title')}
									description={t('operationManager.esg.description')}
									fullHeight
								>
									<EsgScoreCard esg={OPERATION_MANAGER_ESG} />
								</SectionCard>
							</Grid.Col>
						</Grid>

						{/* 4. Burnout risk and Human vs AI agents */}
						<Grid gap='lg'>
							<Grid.Col span={{ base: 12, md: 6 }}>
								<SectionCard
									title={t('operationManager.burnout.title')}
									description={t('operationManager.burnout.description')}
									fullHeight
								>
									<PlatformBurnoutCard
										summary={burnoutSummary}
										data={burnoutSeries}
										teams={OPERATION_MANAGER_TEAMS}
									/>
								</SectionCard>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 6 }}>
								<SectionCard
									title={t('operationManager.humanVsAi.title')}
									description={t('operationManager.humanVsAi.description')}
									fullHeight
								>
									<HumanVsAiCard data={HUMAN_VS_AI_PERFORMANCE} />
								</SectionCard>
							</Grid.Col>
						</Grid>

						{/* 5. Campaigns performance */}
						<SectionCard
							title={t('operationManager.campaigns.title')}
							description={t('operationManager.campaigns.description', {
								window: windowPhrase,
							})}
						>
							<CampaignPerformanceTable rows={campaignRows} />
						</SectionCard>
					</>
				)}
			</Stack>
		</ContentContainer>
	);
};

export default NewOperationManagerDashboard;

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
	Badge,
	Group,
	SegmentedControl,
} from '@mantine/core';
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
	PerformanceScoreControls,
	NeedsAttentionStrip,
	type NeedsAttentionItem,
} from '../components';
import { useDashboardCopy } from '../useDashboardCopy';
import {
	useSettingsStore,
	selectBurnout,
	selectThresholds,
} from '~/stores/qa/settingsStore';
import { coachingBasePath } from '~/modules/qa/coaching/constants';
import { useActiveRankingByTeam } from '~/modules/qa/rankings/hooks/useActiveRanking';
import {
	computeStandings,
	formatScore as formatRankingScore,
	toRankingEntry,
} from '~/modules/qa/rankings/helpers';
import ExpandedRankingsTable from '~/modules/qa/agent/rankings/components/ExpandedRankingsTable';
import RankingCardGrid from '~/modules/qa/agent/rankings/components/RankingCardGrid';
import {
	buildTeamDashboardMetrics,
	buildTeamBusinessInsights,
} from '~/modules/qa/calls/agentMetrics';
import { teamBurnoutRisk } from '~/modules/qa/analytics/helpers';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TODAY } from '~/modules/qa/analytics/constants';
import type { DashboardLineOfBusiness } from '../lineOfBusiness';
import {
	PERFORMANCE_SCORE_PERIODS,
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

/** Below this width the leaderboard table is replaced by the responsive card grid. */
const TABLE_BREAKPOINT = '(max-width: 1024px)';

/** Team-wide drill-down target: no team calls list exists yet, so rows open Team Analytics. */
const ANALYTICS_PATH = '/qa/supervisor/analytics';

export const NewSupervisorDashboard: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const { t: tDashboard } = useTranslation('qa.dashboard');
	const copy = useDashboardCopy('supervisor');
	const navigate = useNavigate();
	const isCompact = useMediaQuery(TABLE_BREAKPOINT);
	const { program } = useActiveRankingByTeam('Team 1');
	const [period, setPeriod] = useState<PerformanceScorePeriod>(
		DEFAULT_PERFORMANCE_SCORE_PERIOD
	);
	const days = performanceScoreDays(period);
	const [rankingsPeriod, setRankingsPeriod] = useState<PerformanceScorePeriod>(
		DEFAULT_PERFORMANCE_SCORE_PERIOD
	);
	const rankingsDays = performanceScoreDays(rankingsPeriod);
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
	const burnoutSettings = useSettingsStore(selectBurnout);
	const burnoutRisk = useMemo(
		() => teamBurnoutRisk('supervisor'),
		[burnoutSettings]
	);

	const standings = useMemo(
		() =>
			program ? computeStandings(program, TEAM_CALLS, TODAY, rankingsDays) : [],
		[program, rankingsDays]
	);

	const entries = useMemo(
		() =>
			program
				? standings.map((standing) => toRankingEntry(standing, program))
				: [],
		[program, standings]
	);

	const openAnalytics = () => navigate(ANALYTICS_PATH);

	const attentionItems: NeedsAttentionItem[] = [
		{
			id: 'burnout',
			label: tDashboard('roleDashboard.attention.burnout.label'),
			value: burnoutRisk.length,
			hint: tDashboard('roleDashboard.attention.burnout.hint'),
			onOpen: () => navigate(coachingBasePath('supervisor')),
		},
		{
			id: 'autoFails',
			label: tDashboard('roleDashboard.attention.autoFails.label'),
			value: metrics.autoFails,
			hint: tDashboard('roleDashboard.attention.autoFails.hint'),
			onOpen: openAnalytics,
		},
		{
			id: 'negativeCustomer',
			label: tDashboard('roleDashboard.attention.negativeCustomer.label'),
			value: metrics.sentiment.customerNegativeCount,
			hint: tDashboard('roleDashboard.attention.negativeCustomer.hint'),
			onOpen: openAnalytics,
		},
	];

	const renderScore = useCallback(
		(score: number) =>
			program ? formatRankingScore(program, score) : String(score),
		[program]
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

				<NeedsAttentionStrip items={attentionItems} />

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

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					{!program ? (
						<SectionCard fullHeight>
							<EmptyState
								icon={<IconTrophy size={32} />}
								message={t('agent.empty.noActive')}
							/>
						</SectionCard>
					) : (
						<SectionCard
							title={t('agent.leaderboard')}
							description={t('agent.leaderboardDescription')}
							headerActions={
								<Group gap='sm' wrap='nowrap'>
									<SegmentedControl
										size='sm'
										aria-label={tDashboard('roleDashboard.filters.period')}
										value={rankingsPeriod}
										onChange={(v) =>
											setRankingsPeriod(v as PerformanceScorePeriod)
										}
										data={PERFORMANCE_SCORE_PERIODS.map((p) => ({
											value: p.value,
											label: tDashboard(p.labelKey),
										}))}
									/>
									<Badge variant='light' size='sm'>
										{standings.length}
									</Badge>
								</Group>
							}
						>
							{isCompact ? (
								<RankingCardGrid
									data={entries}
									formatScore={renderScore}
									hideReactions
								/>
							) : (
								<ExpandedRankingsTable
									data={entries}
									formatScore={renderScore}
									hideReactions
								/>
							)}
						</SectionCard>
					)}

					<TeamBurnoutRiskCard
						entries={burnoutRisk}
						role='supervisor'
						subtitle="Your team's members showing signs of burnout"
					/>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewSupervisorDashboard;

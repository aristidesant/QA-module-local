import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
	Badge,
	Group,
	Select,
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
} from '../components';
import { useActiveRankingByTeam } from '~/modules/qa/rankings/hooks/useActiveRanking';
import {
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
import {
	DASHBOARD_LINES_OF_BUSINESS,
	type DashboardLineOfBusiness,
} from '../lineOfBusiness';
import {
	PERFORMANCE_SCORE_PERIODS,
	DEFAULT_PERFORMANCE_SCORE_PERIOD,
	performanceScoreDays,
	type PerformanceScorePeriod,
} from '../constants';
import styles from '../Dashboard.module.css';

/** Time-window clause per period, in this page's existing "...this week" voice. */
const WINDOW_PHRASE: Record<PerformanceScorePeriod, string> = {
	today: 'today',
	week: 'this week',
	month: 'this month',
	quarter: 'over the last 3 months',
	sixMonths: 'over the last 6 months',
};

/** Below this width the leaderboard table is replaced by the responsive card grid. */
const TABLE_BREAKPOINT = '(max-width: 1024px)';

export const NewSupervisorDashboard: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const { t: tDashboard } = useTranslation('qa.dashboard');
	const isCompact = useMediaQuery(TABLE_BREAKPOINT);
	const { program, standings } = useActiveRankingByTeam('Team 1');
	const [period, setPeriod] = useState<PerformanceScorePeriod>(
		DEFAULT_PERFORMANCE_SCORE_PERIOD
	);
	const days = performanceScoreDays(period);
	const [lineOfBusiness, setLineOfBusiness] =
		useState<DashboardLineOfBusiness | null>(null);
	const metrics = useMemo(
		() => buildTeamDashboardMetrics('supervisor', days, lineOfBusiness),
		[days, lineOfBusiness]
	);
	const {
		insights: businessInsights,
		outcome: businessOutcome,
		conversionTrend,
	} = useMemo(
		() => buildTeamBusinessInsights('supervisor', days, lineOfBusiness),
		[days, lineOfBusiness]
	);
	const burnoutRisk = teamBurnoutRisk('supervisor');

	const entries = useMemo(
		() =>
			program
				? standings.map((standing) => toRankingEntry(standing, program))
				: [],
		[program, standings]
	);

	const renderScore = useCallback(
		(score: number) =>
			program ? formatRankingScore(program, score) : String(score),
		[program]
	);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Supervisor Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Your team's performance overview
					</Text>
				</div>

				<Group justify='flex-end'>
					<Select
						label='Line of Business'
						placeholder='All lines of business'
						data={DASHBOARD_LINES_OF_BUSINESS}
						value={lineOfBusiness}
						onChange={(value) =>
							setLineOfBusiness(value as DashboardLineOfBusiness | null)
						}
						clearable
						w={220}
					/>
				</Group>

				<SectionCard
					title='Performance Score'
					description={`Your team's quality assurance, compliance, sentiment and business results ${WINDOW_PHRASE[period]}${lineOfBusiness ? ` · ${lineOfBusiness}` : ''}`}
					headerActions={
						<SegmentedControl
							size='xs'
							value={period}
							onChange={(v) => setPeriod(v as PerformanceScorePeriod)}
							data={PERFORMANCE_SCORE_PERIODS.map((p) => ({
								value: p.value,
								label: tDashboard(p.labelKey),
							}))}
						/>
					}
				>
					<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing='md'>
						<div className={styles.gridCard}>
							<OperationalCard
								calls={metrics.calls}
								effectiveContacts={metrics.effectiveContacts}
								nonEffectiveContacts={metrics.nonEffectiveContacts}
								subtitle="Team's contact effectiveness this week"
								trend={metrics.trends?.effectiveContacts}
							/>
						</div>
						<div className={styles.gridCard}>
							<QualityAssuranceCard
								score={metrics.qa}
								subtitle='Team category breakdown'
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
								subtitle='Team category overview'
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
								subtitle='Team vs the customers they contacted'
							/>
						</div>
						<div className={styles.gridCard}>
							<BusinessInsightsCard
								insights={businessInsights}
								outcome={businessOutcome}
								subtitle='Team conversion and signals'
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
								<Badge variant='light' size='sm'>
									{standings.length}
								</Badge>
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

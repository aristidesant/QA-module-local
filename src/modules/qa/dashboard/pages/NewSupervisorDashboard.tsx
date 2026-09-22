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
import { buildTeamDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import { teamBurnoutRisk } from '~/modules/qa/analytics/helpers';
import {
	DASHBOARD_LINES_OF_BUSINESS,
	type DashboardLineOfBusiness,
} from '../lineOfBusiness';
import { SUPERVISOR_WEEKLY_METRICS } from '../mockData';
import styles from '../Dashboard.module.css';

/** Below this width the leaderboard table is replaced by the responsive card grid. */
const TABLE_BREAKPOINT = '(max-width: 1024px)';

export const NewSupervisorDashboard: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const isCompact = useMediaQuery(TABLE_BREAKPOINT);
	const { program, standings } = useActiveRankingByTeam('Team 1');
	const { businessInsights, businessOutcome } = SUPERVISOR_WEEKLY_METRICS;
	const [lineOfBusiness, setLineOfBusiness] =
		useState<DashboardLineOfBusiness | null>(null);
	const metrics = buildTeamDashboardMetrics('supervisor', 7, lineOfBusiness);
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
					description={`Your team's quality assurance, compliance, sentiment and business results this week${lineOfBusiness ? ` · ${lineOfBusiness}` : ''}`}
				>
					<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing='md'>
						<div className={styles.gridCard}>
							<OperationalCard
								calls={metrics.calls}
								effectiveContacts={metrics.effectiveContacts}
								nonEffectiveContacts={metrics.nonEffectiveContacts}
								subtitle="Team's contact effectiveness this week"
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
							/>
						</div>
						<div className={styles.gridCard}>
							<ComplianceCard
								categories={metrics.complianceCategories}
								subtitle='Team category overview'
								issueCounts={metrics.complianceIssueCounts}
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
								subtitle='Team vs the customers they contacted'
							/>
						</div>
						<div className={styles.gridCard}>
							<BusinessInsightsCard
								insights={businessInsights}
								outcome={businessOutcome}
								subtitle='Team conversion and signals'
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
						subtitle="Your team's members showing signs of burnout"
					/>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewSupervisorDashboard;

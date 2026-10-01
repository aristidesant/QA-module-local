import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionSplitCard,
	OperationalCard,
	BestWorstCallsTable,
	CoachingLearningWidget,
	CommitLearningModal,
	PerformanceScoreControls,
	type PendingLearningItem,
} from '../components';
import { useDashboardCopy } from '../useDashboardCopy';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { buildAgentDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import {
	DEFAULT_PERFORMANCE_SCORE_PERIOD,
	performanceScoreDays,
	type PerformanceScorePeriod,
} from '../constants';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import {
	useCoachingStore,
	selectCohorts,
	selectSessions,
} from '~/stores/qa/coachingStore';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
} from '~/stores/qa/lmsStore';
import { groupAssignments, needsResponse } from '~/modules/qa/lms/helpers';
import { agentContentPath } from '~/modules/qa/lms/constants';
import { coachingPath } from '~/modules/qa/inbox/constants';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { BEST_WORST_CALLS } from '../mockData';
import styles from '../Dashboard.module.css';

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

/** Time-window clause per period, in this page's existing "over the last N days" voice. */
const WINDOW_PHRASE: Record<PerformanceScorePeriod, string> = {
	today: 'today',
	week: 'over the last 7 days',
	month: 'over the last 30 days',
	quarter: 'over the last 3 months',
	sixMonths: 'over the last 6 months',
};

export const NewAgentDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('qa.dashboard');
	const copy = useDashboardCopy('agent');
	const agentName =
		TEAM_AGENTS.find((agent) => agent.id === AGENT_PERSONA_ID)?.name ?? '';
	const [period, setPeriod] = useState<PerformanceScorePeriod>(
		DEFAULT_PERFORMANCE_SCORE_PERIOD
	);
	const days = performanceScoreDays(period);
	const metrics = useMemo(
		() => buildAgentDashboardMetrics(AGENT_PERSONA_ID, days),
		[days]
	);

	const allSessions = useCoachingStore(selectSessions);
	const cohorts = useCoachingStore(selectCohorts);
	const assignments = useLmsStore(selectAssignments);
	const content = useLmsStore(selectContent);
	const [commitTarget, setCommitTarget] = useState<PendingLearningItem | null>(
		null
	);

	const lastCoachingSession = useMemo(() => {
		const myCohortIds = cohorts
			.filter((c) => c.agentIds.includes(AGENT_PERSONA_ID))
			.map((c) => c.id);
		return (
			allSessions
				.filter(
					(s) =>
						(s.agentId === AGENT_PERSONA_ID ||
							(s.cohortId && myCohortIds.includes(s.cohortId))) &&
						s.status === 'COMPLETED'
				)
				.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
		);
	}, [allSessions, cohorts]);

	const pendingLearning = useMemo(() => {
		const contentById = Object.fromEntries(content.map((c) => [c.id, c]));
		const mine = assignments.filter((a) => a.agentId === AGENT_PERSONA_ID);
		const groups = groupAssignments(mine);
		return [...groups.needsResponse, ...groups.mandatory]
			.slice(0, 3)
			.map((assignment) => ({
				assignment,
				content: contentById[assignment.contentId],
			}));
	}, [assignments, content]);

	/** Opens My Calls filtered on one issue, over the same weekly window the cards summarise. */
	const openIssue = (issue: CallIssueKey) =>
		navigate(`${MY_CALLS_PATH}?tab=calls&issue=${issue}&period=7d`);

	/** Confirms the agent's commitment to the supervisor's due date before opening the material. */
	const handleCommitLearning = () => {
		if (!commitTarget) return;
		const { assignment } = commitTarget;
		if (needsResponse(assignment)) {
			useLmsStore.getState().accept(assignment.id);
			notifySuccess('Commitment confirmed');
		}
		navigate(agentContentPath(assignment.contentId));
		setCommitTarget(null);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* 1. Header Section */}
				<div>
					<Title order={1}>
						{t('roleDashboard.welcomeBack', { name: agentName })}
					</Title>
					<Text c='dimmed' mt='xs'>
						{copy.subtitle}
					</Text>
				</div>

				{/* 2. Performance Score: QA, Compliance, Sentiment & Emotion — each row opens the calls behind it */}
				<SectionCard
					title='Performance Score'
					description={`Your quality assurance, compliance and sentiment results ${WINDOW_PHRASE[period]} · ${metrics.calls} calls evaluated`}
					headerActions={
						<PerformanceScoreControls
							period={period}
							onPeriodChange={setPeriod}
						/>
					}
				>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
						<div className={styles.gridCard}>
							<OperationalCard
								calls={metrics.calls}
								effectiveContacts={metrics.effectiveContacts}
								nonEffectiveContacts={metrics.nonEffectiveContacts}
								sales={metrics.sales}
								subtitle={copy.cardSubtitle('operational')}
								onNonEffectiveClick={() => openIssue('non-effective-contact')}
								trend={metrics.trends?.effectiveContacts}
							/>
						</div>
						<div className={styles.gridCard}>
							<QualityAssuranceCard
								score={metrics.qa}
								subtitle={copy.cardSubtitle('qa')}
								autoFails={metrics.autoFails}
								issueCounts={{
									...metrics.qaIssueCounts,
									autoFails: metrics.autoFails,
								}}
								onCategoryClick={(key) => openIssue(QA_ISSUE[key])}
								trend={metrics.trends?.qa}
							/>
						</div>
						<div className={styles.gridCard}>
							<ComplianceCard
								categories={metrics.complianceCategories}
								subtitle={copy.cardSubtitle('compliance')}
								issueCounts={metrics.complianceIssueCounts}
								onCategoryClick={(name) => openIssue(COMPLIANCE_ISSUE[name])}
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

				{/* 3. Coaching & learning, and best/worst calls */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Coaching & Learning'
						description='Your last coaching session and pending learning material'
						fullHeight
					>
						<CoachingLearningWidget
							lastSession={lastCoachingSession}
							pendingLearning={pendingLearning}
							onOpenCoaching={() => navigate(coachingPath('agent'))}
							onOpenLearning={(item) => setCommitTarget(item)}
						/>
					</SectionCard>
					<SectionCard
						title='Best & Worst Calls'
						description={t('roleDashboard.bestWorst.description')}
						fullHeight
					>
						<BestWorstCallsTable calls={BEST_WORST_CALLS} />
					</SectionCard>
				</SimpleGrid>
			</Stack>

			<CommitLearningModal
				item={commitTarget}
				opened={commitTarget !== null}
				onClose={() => setCommitTarget(null)}
				onCommit={handleCommitLearning}
			/>
		</ContentContainer>
	);
};

export default NewAgentDashboard;

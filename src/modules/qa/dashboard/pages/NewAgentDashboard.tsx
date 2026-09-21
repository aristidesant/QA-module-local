import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionSplitCard,
	BestWorstCallsTable,
	CoachingLearningWidget,
} from '../components';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import {
	AGENT_DASHBOARD_DAYS,
	buildAgentDashboardMetrics,
} from '~/modules/qa/calls/agentMetrics';
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
import { groupAssignments } from '~/modules/qa/lms/helpers';
import { agentContentPath } from '~/modules/qa/lms/constants';
import { coachingPath } from '~/modules/qa/inbox/constants';
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

export const NewAgentDashboard: React.FC = () => {
	const navigate = useNavigate();
	const metrics = useMemo(
		() => buildAgentDashboardMetrics(AGENT_PERSONA_ID, AGENT_DASHBOARD_DAYS),
		[]
	);

	const allSessions = useCoachingStore(selectSessions);
	const cohorts = useCoachingStore(selectCohorts);
	const assignments = useLmsStore(selectAssignments);
	const content = useLmsStore(selectContent);

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
							onOpenLearning={(contentId) =>
								navigate(agentContentPath(contentId))
							}
						/>
					</SectionCard>
					<SectionCard
						title='Best & Worst Calls'
						description='Your top and bottom performing calls this week'
						fullHeight
					>
						<BestWorstCallsTable calls={BEST_WORST_CALLS} />
					</SectionCard>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewAgentDashboard;

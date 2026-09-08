import React from 'react';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, SimpleGrid, Tabs, Card, Badge } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionCard,
	AutoFailsCard,
	SentimentTrendChart,
	CriticalIssuesTable,
	BestWorstCallsTable,
	QuickInsightsWidget,
	RankingsTable,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import type { RankingEntry, RankingGoal } from '../components/RankingsTable';
import {
	SUPERVISOR_WEEKLY_METRICS,
	SUPERVISOR_SENTIMENT_TREND,
	SUPERVISOR_CALLS,
	CRITICAL_ISSUES_SUPERVISOR,
} from '../mockData';
import styles from '../Dashboard.module.css';

/** Inbox this dashboard's critical issues drill into */
const SUPERVISOR_INBOX_PATH = '/qa/supervisor/inbox';

/**
 * Default insights for the supervisor dashboard (team-level recommendations)
 */
const DEFAULT_SUPERVISOR_INSIGHTS: Insight[] = [
	{
		title: 'Team Consistency',
		description: 'Your team is maintaining steady performance with positive trends.',
		type: 'positive',
	},
	{
		title: 'Compliance Focus',
		description: 'Consider reinforcing compliance training for regulatory adherence.',
		type: 'warning',
	},
	{
		title: 'Escalation Pattern',
		description: 'Monitor escalation rates - a slight uptick was detected this week.',
		type: 'warning',
	},
];

/**
 * Row shape for the "Team Members" tab table.
 * No shared model/mock export exists for this yet, so it is defined locally
 * (mirrors the approach taken for AGENT_TEAM_RANKINGS in NewAgentDashboard.tsx).
 */
interface TeamMemberRow {
	id: string;
	name: string;
	qaScore: number;
	sentiment: number;
	callsThisWeek: number;
	compliance: number;
}

const TEAM_MEMBERS: TeamMemberRow[] = [
	{ id: 'AGT-001', name: 'Sarah Johnson', qaScore: 95, sentiment: 4.6, callsThisWeek: 32, compliance: 96 },
	{ id: 'AGT-002', name: 'Mike Chen', qaScore: 97, sentiment: 4.7, callsThisWeek: 29, compliance: 98 },
	{ id: 'AGT-003', name: 'Jessica Martinez', qaScore: 93, sentiment: 4.4, callsThisWeek: 35, compliance: 92 },
	{ id: 'AGT-004', name: 'John Smith', qaScore: 90, sentiment: 4.2, callsThisWeek: 24, compliance: 91 },
	{ id: 'AGT-005', name: 'Emma Davis', qaScore: 88, sentiment: 4.0, callsThisWeek: 27, compliance: 89 },
	{ id: 'AGT-006', name: 'David Brown', qaScore: 62, sentiment: 2.1, callsThisWeek: 19, compliance: 71 },
	{ id: 'AGT-007', name: 'Lisa Wong', qaScore: 58, sentiment: 2.3, callsThisWeek: 22, compliance: 68 },
];

/**
 * Row shape for the "Disputes" tab table.
 * Status colors follow the same convention used in the real DisputesListPage
 * ('open' | 'approved' | 'rejected'), plus 'pending' for disputes awaiting review.
 */
interface DisputeRow {
	id: string;
	agentName: string;
	type: string;
	status: 'open' | 'pending' | 'approved' | 'rejected';
	createdDate: string;
}

const DISPUTES_SAMPLE: DisputeRow[] = [
	{ id: 'DSP-1042', agentName: 'David Brown', type: 'Score Dispute', status: 'open', createdDate: '2026-09-06T09:15:00Z' },
	{ id: 'DSP-1041', agentName: 'Lisa Wong', type: 'Auto-Fail Dispute', status: 'pending', createdDate: '2026-09-05T14:30:00Z' },
	{ id: 'DSP-1038', agentName: 'Jessica Martinez', type: 'Compliance Dispute', status: 'approved', createdDate: '2026-09-04T11:00:00Z' },
	{ id: 'DSP-1035', agentName: 'John Smith', type: 'Score Dispute', status: 'rejected', createdDate: '2026-09-03T16:45:00Z' },
	{ id: 'DSP-1030', agentName: 'Sarah Johnson', type: 'Evaluation Error', status: 'approved', createdDate: '2026-09-01T10:20:00Z' },
];

const DISPUTE_STATUS_COLORS: Record<DisputeRow['status'], string> = {
	open: 'blue',
	pending: 'yellow',
	approved: 'green',
	rejected: 'red',
};

/**
 * Ranking goal the supervisor set for their team: which metrics feed the
 * ranking score and how they are weighted.
 */
const SUPERVISOR_RANKING_GOAL: RankingGoal = {
	metrics: ['QA Score', 'Compliance'],
	criteria: '60% QA Score + 40% Compliance',
	target: 'Every team member at 85 or above',
	setBy: 'You · Supervisor',
};

/**
 * Team ranking entries for the "Team Rankings" tab, derived from the same
 * roster as the "Team Members" tab so both views stay consistent.
 */
const SUPERVISOR_TEAM_RANKINGS: RankingEntry[] = [
	{
		position: 1,
		name: 'Mike Chen',
		score: 97,
		reactions: { applause: 14, reverence: 9, salute: 6, thumbsUp: 11 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 2,
		name: 'Sarah Johnson',
		score: 95,
		reactions: { applause: 11, reverence: 7, salute: 5, thumbsUp: 8 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 3,
		name: 'Jessica Martinez',
		score: 93,
		reactions: { applause: 9, reverence: 6, salute: 3, thumbsUp: 5 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 4,
		name: 'John Smith',
		score: 90,
		reactions: { applause: 7, reverence: 4, salute: 2, thumbsUp: 4 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 5,
		name: 'Emma Davis',
		score: 88,
		reactions: { applause: 5, reverence: 3, salute: 1, thumbsUp: 3 },
		trend: 'down',
		trendValue: 1,
	},
	{
		position: 6,
		name: 'David Brown',
		score: 62,
		reactions: { applause: 2, reverence: 1, salute: 0, thumbsUp: 1 },
		trend: 'down',
		trendValue: 4,
	},
	{
		position: 7,
		name: 'Lisa Wong',
		score: 58,
		reactions: { applause: 1, reverence: 0, salute: 0, thumbsUp: 1 },
		trend: 'down',
		trendValue: 3,
	},
];

const teamMemberColumns: BaseTableColumnDef<TeamMemberRow>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => (
			<Text fw={500} size='sm'>
				{row.original.name}
			</Text>
		),
	},
	{
		accessorKey: 'qaScore',
		header: 'QA Score',
		cell: ({ row }) => (
			<Text fw={600} size='sm' c={row.original.qaScore < 70 ? 'red' : undefined}>
				{row.original.qaScore}%
			</Text>
		),
	},
	{
		accessorKey: 'sentiment',
		header: 'Sentiment',
		cell: ({ row }) => <Text size='sm'>{row.original.sentiment.toFixed(1)} / 5.0</Text>,
	},
	{
		accessorKey: 'callsThisWeek',
		header: 'Calls This Week',
		cell: ({ row }) => <Text size='sm'>{row.original.callsThisWeek}</Text>,
	},
	{
		accessorKey: 'compliance',
		header: 'Compliance',
		cell: ({ row }) => (
			<Badge color={row.original.compliance < 80 ? 'red' : 'teal'} variant='light'>
				{row.original.compliance}%
			</Badge>
		),
	},
];

const disputeColumns: BaseTableColumnDef<DisputeRow>[] = [
	{
		accessorKey: 'agentName',
		header: 'Agent Name',
		cell: ({ row }) => (
			<Text fw={500} size='sm'>
				{row.original.agentName}
			</Text>
		),
	},
	{
		accessorKey: 'type',
		header: 'Type',
		cell: ({ row }) => <Text size='sm'>{row.original.type}</Text>,
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge color={DISPUTE_STATUS_COLORS[row.original.status]} variant='light'>
				{row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
			</Badge>
		),
	},
	{
		accessorKey: 'createdDate',
		header: 'Created Date',
		cell: ({ row }) => (
			<Text c='dimmed' size='sm'>
				{new Date(row.original.createdDate).toLocaleDateString()}
			</Text>
		),
	},
];

export const NewSupervisorDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { qaScore, sentiment, complianceCategories, autoFailsCount } = SUPERVISOR_WEEKLY_METRICS;

	/** Overall sentiment on the 0-5 scale, averaging agent and customer readings */
	const overallSentiment = (sentiment.agentAvg + sentiment.customerAvg) / 2;

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* 1. Header Section */}
				<div>
					<Title order={1}>Supervisor Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Your team's performance overview
					</Text>
				</div>

				{/* 2. Performance Score Row: Quality Assurance | Compliance | Sentiment & Emotion */}
				<SectionCard
					title='Performance Score'
					description="Your team's quality assurance, compliance, and sentiment results this week"
				>
					<SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
						<QualityAssuranceCard score={qaScore} subtitle='Team category breakdown' />
						<ComplianceCard categories={complianceCategories} subtitle='Team category overview' />
						<SentimentEmotionCard
							score={overallSentiment}
							predominantEmotion={sentiment.predominantEmotion}
							subtitle='0-5 scale assessment'
						/>
					</SimpleGrid>
				</SectionCard>

				{/* 3. Critical Issues (2-column) alongside Auto-Fails */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Critical Issues' description='Team issues, disputes, and auto-fails requiring your attention'>
						<CriticalIssuesTable
							issues={CRITICAL_ISSUES_SUPERVISOR}
							onIssueClick={() => navigate(SUPERVISOR_INBOX_PATH)}
						/>
					</SectionCard>

					<SectionCard title='Auto-Fails' description="Automatic failures detected across your team this week">
						<AutoFailsCard totalCount={autoFailsCount} />
					</SectionCard>
				</SimpleGrid>

				{/* 4. Sentiment trend and quick insights */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Sentiment Trend' description='4-week team sentiment progression'>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<SentimentTrendChart data={SUPERVISOR_SENTIMENT_TREND} />
						</Card>
					</SectionCard>

					<SectionCard title='Quick Insights' description='Team-level recommendations and analysis'>
						<QuickInsightsWidget insights={DEFAULT_SUPERVISOR_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				{/* 5-6. Best & Worst Calls + Tabs Section (same row) */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Best & Worst Calls' description="Your team's top and bottom performing calls this week">
						<BestWorstCallsTable calls={SUPERVISOR_CALLS} />
					</SectionCard>

					<Tabs defaultValue='rankings' style={{ flex: 1 }}>
						<Tabs.List>
							<Tabs.Tab value='rankings'>Team Rankings</Tabs.Tab>
							<Tabs.Tab value='team-members'>Team Members</Tabs.Tab>
							<Tabs.Tab value='disputes'>Disputes</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='rankings' pt='lg'>
							<RankingsTable
								entries={SUPERVISOR_TEAM_RANKINGS}
								title='Team Rankings'
								description='Your team ranked against the goal you defined for this period'
								goal={SUPERVISOR_RANKING_GOAL}
								maxDisplay={7}
							/>
						</Tabs.Panel>

						<Tabs.Panel value='team-members' pt='lg'>
							<SectionCard title='Team Members' description="Individual performance across your team this week">
								<BaseTable<TeamMemberRow>
									columns={teamMemberColumns}
									data={TEAM_MEMBERS}
									getRowId={member => member.id}
									emptyMessage='No team members found'
								/>
							</SectionCard>
						</Tabs.Panel>

						<Tabs.Panel value='disputes' pt='lg'>
							<SectionCard title='Disputes' description='Evaluation disputes raised by your team'>
								<BaseTable<DisputeRow>
									columns={disputeColumns}
									data={DISPUTES_SAMPLE}
									getRowId={dispute => dispute.id}
									emptyMessage='No disputes found'
								/>
							</SectionCard>
						</Tabs.Panel>
					</Tabs>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewSupervisorDashboard;

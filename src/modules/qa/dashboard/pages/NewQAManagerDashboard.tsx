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
	QA_MANAGER_WEEKLY_METRICS,
	QA_MANAGER_SENTIMENT_TREND,
	QA_MANAGER_CALLS,
	CRITICAL_ISSUES_QA_MANAGER,
} from '../mockData';
import styles from '../Dashboard.module.css';

/** Inbox this dashboard's critical issues drill into */
const QA_MANAGER_INBOX_PATH = '/qa/qa-manager/inbox';

/**
 * Default insights for the QA manager dashboard (platform-level recommendations)
 */
const DEFAULT_QA_MANAGER_INSIGHTS: Insight[] = [
	{
		title: 'Platform Performance',
		description: 'Platform-wide QA scores are trending upward with consistent improvements.',
		type: 'positive',
	},
	{
		title: 'Compliance Monitoring',
		description: 'Multiple supervisors need reinforced compliance training across the platform.',
		type: 'warning',
	},
	{
		title: 'Escalation Management',
		description: 'Escalation rates remain elevated - coordinate with supervisors for improvement.',
		type: 'warning',
	},
	{
		title: 'Resource Optimization',
		description: 'Consider redistributing QA resources for more balanced team coverage.',
		type: 'neutral',
	},
];

/**
 * Row shape for the "Supervisors" tab table.
 * No shared model/mock export exists for this yet, so it is defined locally
 * (mirrors the approach taken for TEAM_MEMBERS in NewSupervisorDashboard.tsx).
 */
interface SupervisorRow {
	id: string;
	name: string;
	teamSize: number;
	avgQaScore: number;
	sentiment: number;
	compliance: number;
}

const SUPERVISORS_OVERVIEW: SupervisorRow[] = [
	{ id: 'SUP-001', name: 'Sarah Johnson', teamSize: 8, avgQaScore: 91, sentiment: 4.3, compliance: 94 },
	{ id: 'SUP-002', name: 'Mike Chen', teamSize: 9, avgQaScore: 89, sentiment: 4.1, compliance: 92 },
	{ id: 'SUP-003', name: 'Jessica Martinez', teamSize: 7, avgQaScore: 86, sentiment: 3.9, compliance: 88 },
	{ id: 'SUP-004', name: 'James Wilson', teamSize: 8, avgQaScore: 84, sentiment: 3.8, compliance: 85 },
	{ id: 'SUP-005', name: 'Amanda Taylor', teamSize: 6, avgQaScore: 82, sentiment: 3.7, compliance: 83 },
	{ id: 'SUP-006', name: 'Robert Kim', teamSize: 9, avgQaScore: 78, sentiment: 3.4, compliance: 76 },
	{ id: 'SUP-007', name: 'Patricia Lopez', teamSize: 7, avgQaScore: 75, sentiment: 3.2, compliance: 72 },
];

/**
 * Row shape for the "Disputes" tab table (platform-wide audit view).
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

const ALL_DISPUTES: DisputeRow[] = [
	{ id: 'DSP-1042', agentName: 'David Brown', type: 'Score Dispute', status: 'open', createdDate: '2026-09-06T09:15:00Z' },
	{ id: 'DSP-1041', agentName: 'Lisa Wong', type: 'Auto-Fail Dispute', status: 'pending', createdDate: '2026-09-05T14:30:00Z' },
	{ id: 'DSP-1038', agentName: 'Jessica Martinez', type: 'Compliance Dispute', status: 'approved', createdDate: '2026-09-04T11:00:00Z' },
	{ id: 'DSP-1035', agentName: 'John Smith', type: 'Score Dispute', status: 'rejected', createdDate: '2026-09-03T16:45:00Z' },
	{ id: 'DSP-1030', agentName: 'Sarah Johnson', type: 'Evaluation Error', status: 'approved', createdDate: '2026-09-01T10:20:00Z' },
	{ id: 'DSP-1027', agentName: 'Robert Kim', type: 'Score Dispute', status: 'pending', createdDate: '2026-08-31T13:10:00Z' },
	{ id: 'DSP-1022', agentName: 'Patricia Lopez', type: 'Auto-Fail Dispute', status: 'open', createdDate: '2026-08-30T08:40:00Z' },
	{ id: 'DSP-1019', agentName: 'Thomas Anderson', type: 'Compliance Dispute', status: 'rejected', createdDate: '2026-08-29T15:55:00Z' },
];

const DISPUTE_STATUS_COLORS: Record<DisputeRow['status'], string> = {
	open: 'blue',
	pending: 'yellow',
	approved: 'green',
	rejected: 'red',
};

/**
 * Row shape for the "Campaigns" tab table.
 */
interface CampaignRow {
	id: string;
	name: string;
	status: 'active' | 'archived';
	callsCount: number;
	createdDate: string;
}

const CAMPAIGNS_LIST: CampaignRow[] = [
	{ id: 'CMP-001', name: 'Q3 Renewal Outreach', status: 'active', callsCount: 542, createdDate: '2026-07-01T09:00:00Z' },
	{ id: 'CMP-002', name: 'Customer Retention Sprint', status: 'active', callsCount: 389, createdDate: '2026-07-15T09:00:00Z' },
	{ id: 'CMP-003', name: 'New Product Launch', status: 'active', callsCount: 271, createdDate: '2026-08-01T09:00:00Z' },
	{ id: 'CMP-004', name: 'Compliance Refresh Campaign', status: 'active', callsCount: 198, createdDate: '2026-08-10T09:00:00Z' },
	{ id: 'CMP-005', name: 'Winter Promo 2025', status: 'archived', callsCount: 764, createdDate: '2025-11-20T09:00:00Z' },
	{ id: 'CMP-006', name: 'Spring Cleanup Follow-ups', status: 'archived', callsCount: 412, createdDate: '2026-03-05T09:00:00Z' },
];

const CAMPAIGN_STATUS_COLORS: Record<CampaignRow['status'], string> = {
	active: 'teal',
	archived: 'gray',
};

/**
 * Ranking goal applied platform-wide by the QA Manager. Supervisors are
 * ranked on a broader metric mix than individual agents.
 */
const QA_MANAGER_RANKING_GOAL: RankingGoal = {
	metrics: ['QA Score', 'Compliance', 'Sentiment & Emotion'],
	criteria: '40% QA Score + 40% Compliance + 20% Sentiment & Emotion',
	target: 'All supervisor teams at 85 or above',
	setBy: 'You · QA Manager',
};

/**
 * Supervisor ranking entries for the "Team Rankings" tab, derived from the
 * same roster as the "Supervisors" tab so both views stay consistent.
 */
const QA_MANAGER_RANKINGS: RankingEntry[] = [
	{
		position: 1,
		name: 'Sarah Johnson',
		score: 91,
		reactions: { applause: 16, reverence: 10, salute: 7, thumbsUp: 12 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 2,
		name: 'Mike Chen',
		score: 89,
		reactions: { applause: 13, reverence: 8, salute: 5, thumbsUp: 9 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 3,
		name: 'Jessica Martinez',
		score: 86,
		reactions: { applause: 10, reverence: 6, salute: 4, thumbsUp: 7 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 4,
		name: 'James Wilson',
		score: 84,
		reactions: { applause: 8, reverence: 5, salute: 3, thumbsUp: 5 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 5,
		name: 'Amanda Taylor',
		score: 82,
		reactions: { applause: 6, reverence: 4, salute: 2, thumbsUp: 4 },
		trend: 'down',
		trendValue: 1,
	},
	{
		position: 6,
		name: 'Robert Kim',
		score: 78,
		reactions: { applause: 4, reverence: 2, salute: 1, thumbsUp: 2 },
		trend: 'down',
		trendValue: 3,
	},
	{
		position: 7,
		name: 'Patricia Lopez',
		score: 75,
		reactions: { applause: 2, reverence: 1, salute: 0, thumbsUp: 1 },
		trend: 'down',
		trendValue: 2,
	},
];

const supervisorColumns: BaseTableColumnDef<SupervisorRow>[] = [
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
		accessorKey: 'teamSize',
		header: 'Team Size',
		cell: ({ row }) => <Text size='sm'>{row.original.teamSize}</Text>,
	},
	{
		accessorKey: 'avgQaScore',
		header: 'Avg QA Score',
		cell: ({ row }) => (
			<Text fw={600} size='sm' c={row.original.avgQaScore < 80 ? 'red' : undefined}>
				{row.original.avgQaScore}%
			</Text>
		),
	},
	{
		accessorKey: 'sentiment',
		header: 'Sentiment',
		cell: ({ row }) => <Text size='sm'>{row.original.sentiment.toFixed(1)} / 5.0</Text>,
	},
	{
		accessorKey: 'compliance',
		header: 'Compliance %',
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
		header: 'Date Created',
		cell: ({ row }) => (
			<Text c='dimmed' size='sm'>
				{new Date(row.original.createdDate).toLocaleDateString()}
			</Text>
		),
	},
];

const campaignColumns: BaseTableColumnDef<CampaignRow>[] = [
	{
		accessorKey: 'name',
		header: 'Campaign Name',
		cell: ({ row }) => (
			<Text fw={500} size='sm'>
				{row.original.name}
			</Text>
		),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge color={CAMPAIGN_STATUS_COLORS[row.original.status]} variant='light'>
				{row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
			</Badge>
		),
	},
	{
		accessorKey: 'callsCount',
		header: 'Calls Count',
		cell: ({ row }) => <Text size='sm'>{row.original.callsCount.toLocaleString()}</Text>,
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

export const NewQAManagerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { qaScore, sentiment, complianceCategories, autoFailsCount } = QA_MANAGER_WEEKLY_METRICS;

	/** Overall sentiment on the 0-5 scale, averaging agent and customer readings */
	const overallSentiment = (sentiment.agentAvg + sentiment.customerAvg) / 2;

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* 1. Header Section */}
				<div>
					<Title order={1}>QA Manager Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Platform performance overview
					</Text>
				</div>

				{/* 2. Performance Score Row: Quality Assurance | Compliance | Sentiment & Emotion */}
				<SectionCard
					title='Performance Score'
					description='Platform-wide quality assurance, compliance, and sentiment results this week'
				>
					<SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
						<QualityAssuranceCard score={qaScore} subtitle='Platform category breakdown' />
						<ComplianceCard categories={complianceCategories} subtitle='Platform category overview' />
						<SentimentEmotionCard
							score={overallSentiment}
							predominantEmotion={sentiment.predominantEmotion}
							subtitle='0-5 scale assessment'
						/>
					</SimpleGrid>
				</SectionCard>

				{/* 3. Critical Issues (2-column) alongside Auto-Fails */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Critical Issues' description='Platform-wide issues, disputes, and auto-fails requiring attention'>
						<CriticalIssuesTable
							issues={CRITICAL_ISSUES_QA_MANAGER}
							onIssueClick={() => navigate(QA_MANAGER_INBOX_PATH)}
						/>
					</SectionCard>

					<SectionCard title='Auto-Fails' description='Automatic failures detected across the platform this week'>
						<AutoFailsCard sectionAutoFails={autoFailsCount} globalAutoFails={42} />
					</SectionCard>
				</SimpleGrid>

				{/* 4. Sentiment trend and quick insights */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Sentiment Trend' description='4-week platform sentiment progression'>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<SentimentTrendChart data={QA_MANAGER_SENTIMENT_TREND} />
						</Card>
					</SectionCard>

					<SectionCard title='Quick Insights' description='Platform-level recommendations and analysis'>
						<QuickInsightsWidget insights={DEFAULT_QA_MANAGER_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				{/* 5-6. Best & Worst Calls + Tabs Section (same row) */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Best & Worst Calls' description='Top and bottom performing calls from across all teams this week'>
						<BestWorstCallsTable calls={QA_MANAGER_CALLS} />
					</SectionCard>

					<Tabs defaultValue='rankings' style={{ flex: 1 }}>
						<Tabs.List>
							<Tabs.Tab value='rankings'>Team Rankings</Tabs.Tab>
							<Tabs.Tab value='supervisors'>Supervisors</Tabs.Tab>
							<Tabs.Tab value='disputes'>Disputes</Tabs.Tab>
							<Tabs.Tab value='campaigns'>Campaigns</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='rankings' pt='lg'>
							<RankingsTable
								entries={QA_MANAGER_RANKINGS}
								title='Supervisor Rankings'
								description='Supervisor teams ranked against the platform goal for this period'
								goal={QA_MANAGER_RANKING_GOAL}
								maxDisplay={7}
							/>
						</Tabs.Panel>

						<Tabs.Panel value='supervisors' pt='lg'>
							<SectionCard title='Supervisors' description="All supervisors' performance metrics across the platform">
								<BaseTable<SupervisorRow>
									columns={supervisorColumns}
									data={SUPERVISORS_OVERVIEW}
									getRowId={supervisor => supervisor.id}
									emptyMessage='No supervisors found'
								/>
							</SectionCard>
						</Tabs.Panel>

						<Tabs.Panel value='disputes' pt='lg'>
							<SectionCard title='Disputes' description='All platform disputes across supervisors and teams'>
								<BaseTable<DisputeRow>
									columns={disputeColumns}
									data={ALL_DISPUTES}
									getRowId={dispute => dispute.id}
									emptyMessage='No disputes found'
								/>
							</SectionCard>
						</Tabs.Panel>

						<Tabs.Panel value='campaigns' pt='lg'>
							<SectionCard title='Campaigns' description='Active and archived campaigns across the platform'>
								<BaseTable<CampaignRow>
									columns={campaignColumns}
									data={CAMPAIGNS_LIST}
									getRowId={campaign => campaign.id}
									emptyMessage='No campaigns found'
								/>
							</SectionCard>
						</Tabs.Panel>
					</Tabs>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewQAManagerDashboard;

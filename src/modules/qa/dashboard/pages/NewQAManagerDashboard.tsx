import React from 'react';
import { Stack, Title, Text, SimpleGrid, Tabs, Card, Group, ThemeIcon, Progress, Badge } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	DashboardMetricCard,
	SentimentScaleCard,
	AutoFailsCard,
	SentimentTrendChart,
	PerformanceTrendChart,
	CriticalIssuesTable,
	BestWorstCallsPanel,
	QuickInsightsWidget,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import type { PerformanceTrendPoint } from '../components/PerformanceTrendChart';
import {
	QA_MANAGER_WEEKLY_METRICS,
	QA_MANAGER_SENTIMENT_TREND,
	QA_MANAGER_CALLS,
	CRITICAL_ISSUES_QA_MANAGER,
} from '../mockData';
import type { ComplianceCategory } from '../mockData';
import styles from '../Dashboard.module.css';

/**
 * Mock 4-week performance trend data for the platform.
 * Mirrors the QA score progression shown on the legacy QA Manager dashboard.
 */
const QA_MANAGER_PERFORMANCE_TREND: PerformanceTrendPoint[] = [
	{ week: 'Week 1', score: 82 },
	{ week: 'Week 2', score: 83 },
	{ week: 'Week 3', score: 83 },
	{ week: 'Week 4', score: 84 },
];

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

/** Maps a compliance category status to a theme-aware Mantine color token */
const getComplianceColor = (status: ComplianceCategory['status']) => {
	switch (status) {
		case 'compliant':
			return 'teal';
		case 'warning':
			return 'yellow';
		case 'violation':
			return 'red';
		default:
			return 'gray';
	}
};

/**
 * Compact compliance breakdown card for the QA Manager dashboard's secondary
 * metrics row. Mirrors the visual language of the other dashboard cards
 * (Card + Progress + Badge) using Mantine color tokens only, so it renders
 * correctly in both dark and light mode.
 */
const QAManagerComplianceCard: React.FC<{ categories: ComplianceCategory[] }> = ({ categories }) => (
	<Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm'>
		<Stack gap='md'>
			<Group justify='space-between' align='flex-start'>
				<div>
					<Text fw={600} size='md'>
						Compliance
					</Text>
					<Text size='xs' c='dimmed'>
						Platform category overview
					</Text>
				</div>
				<ThemeIcon size='lg' color='green' radius='md'>
					<IconShieldCheck size={20} />
				</ThemeIcon>
			</Group>

			<Stack gap='sm'>
				{categories.map(category => (
					<div key={category.name}>
						<Group justify='space-between' mb={4}>
							<Group gap='xs' align='center'>
								<Text size='sm' fw={500}>
									{category.name}
								</Text>
								<Badge size='xs' color={getComplianceColor(category.status)} variant='light'>
									{category.status.charAt(0).toUpperCase() + category.status.slice(1)}
								</Badge>
							</Group>
							<Text size='sm' fw={600}>
								{category.score}%
							</Text>
						</Group>
						<Progress value={category.score} size='sm' color={getComplianceColor(category.status)} />
					</div>
				))}
			</Stack>
		</Stack>
	</Card>
);

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
	const { qaScore, sentiment, complianceCategories, autoFailsCount } = QA_MANAGER_WEEKLY_METRICS;

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

				{/* 2. Performance Scores Row */}
				<SectionCard
					title='Performance Scores'
					description='Platform-wide QA score breakdown by category this week'
				>
					<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md'>
						<DashboardMetricCard
							label='ECN'
							value={qaScore.ecn}
							unit='%'
							progress={qaScore.ecn}
							color='cyan'
						/>
						<DashboardMetricCard
							label='ENC'
							value={qaScore.enc}
							unit='%'
							progress={qaScore.enc}
							color='blue'
						/>
						<DashboardMetricCard
							label='ECC'
							value={qaScore.ecc}
							unit='%'
							progress={qaScore.ecc}
							color='grape'
						/>
						<DashboardMetricCard
							label='ECUF'
							value={qaScore.ecuf}
							unit='%'
							progress={qaScore.ecuf}
							color='indigo'
						/>
					</SimpleGrid>
				</SectionCard>

				{/* 3. Secondary Metrics Row (asymmetric 2-column layout) */}
				<SectionCard
					title='Sentiment, Compliance & Auto-Fails'
					description='Detailed breakdown of platform-wide sentiment analysis, compliance status, and auto-fail tracking'
				>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						<Stack gap='md'>
							<SentimentScaleCard agentScore={sentiment.agentAvg} customerScore={sentiment.customerAvg} />
							<QAManagerComplianceCard categories={complianceCategories} />
						</Stack>
						<AutoFailsCard totalCount={autoFailsCount} />
					</SimpleGrid>
				</SectionCard>

				{/* 4. Charts Section */}
				<SectionCard title='Trends' description='4-week platform sentiment and performance trends'>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<SentimentTrendChart data={QA_MANAGER_SENTIMENT_TREND} />
						</Card>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<PerformanceTrendChart data={QA_MANAGER_PERFORMANCE_TREND} />
						</Card>
					</SimpleGrid>
				</SectionCard>

				{/* 5. Critical Issues Table (full width, platform-scoped) */}
				{CRITICAL_ISSUES_QA_MANAGER.length > 0 && (
					<SectionCard title='Critical Issues' description='Platform-wide issues, disputes, and auto-fails requiring attention'>
						<CriticalIssuesTable issues={CRITICAL_ISSUES_QA_MANAGER} />
					</SectionCard>
				)}

				{/* 6. Best & Worst Calls Panel (full width, platform-scoped) */}
				<SectionCard title='Best & Worst Calls' description='Top and bottom performing calls from across all teams this week'>
					<BestWorstCallsPanel calls={QA_MANAGER_CALLS} />
				</SectionCard>

				{/* 7. Quick Insights Widget (smaller width section) */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Quick Insights' description='Platform-level recommendations and analysis'>
						<QuickInsightsWidget insights={DEFAULT_QA_MANAGER_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				{/* 8. Tabs Section: Supervisors + Disputes + Campaigns (full width) */}
				<Tabs defaultValue='supervisors'>
					<Tabs.List>
						<Tabs.Tab value='supervisors'>Supervisors</Tabs.Tab>
						<Tabs.Tab value='disputes'>Disputes</Tabs.Tab>
						<Tabs.Tab value='campaigns'>Campaigns</Tabs.Tab>
					</Tabs.List>

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
			</Stack>
		</ContentContainer>
	);
};

export default NewQAManagerDashboard;

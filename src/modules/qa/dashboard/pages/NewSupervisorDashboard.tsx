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
	SUPERVISOR_WEEKLY_METRICS,
	SUPERVISOR_SENTIMENT_TREND,
	SUPERVISOR_CALLS,
	CRITICAL_ISSUES_SUPERVISOR,
} from '../mockData';
import type { ComplianceCategory } from '../mockData';
import styles from '../Dashboard.module.css';

/**
 * Mock 4-week performance trend data for the supervisor's team.
 * Mirrors the QA score progression shown on the legacy Supervisor dashboard.
 */
const SUPERVISOR_PERFORMANCE_TREND: PerformanceTrendPoint[] = [
	{ week: 'Week 1', score: 85 },
	{ week: 'Week 2', score: 86 },
	{ week: 'Week 3', score: 86 },
	{ week: 'Week 4', score: 87 },
];

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
 * Compact compliance breakdown card for the Supervisor dashboard's secondary
 * metrics row. Mirrors the visual language of the other dashboard cards
 * (Card + Progress + Badge) using Mantine color tokens only, so it renders
 * correctly in both dark and light mode.
 */
const SupervisorComplianceCard: React.FC<{ categories: ComplianceCategory[] }> = ({ categories }) => (
	<Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm'>
		<Stack gap='md'>
			<Group justify='space-between' align='flex-start'>
				<div>
					<Text fw={600} size='md'>
						Compliance
					</Text>
					<Text size='xs' c='dimmed'>
						Team category overview
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
	const { qaScore, sentiment, complianceCategories, autoFailsCount } = SUPERVISOR_WEEKLY_METRICS;

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

				{/* 2. Performance Scores Row */}
				<SectionCard
					title='Performance Scores'
					description="Your team's QA score breakdown by category this week"
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
					description="Detailed breakdown of your team's sentiment analysis, compliance status, and auto-fail tracking"
				>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						<Stack gap='md'>
							<SentimentScaleCard agentScore={sentiment.agentAvg} customerScore={sentiment.customerAvg} />
							<SupervisorComplianceCard categories={complianceCategories} />
						</Stack>
						<AutoFailsCard totalCount={autoFailsCount} />
					</SimpleGrid>
				</SectionCard>

				{/* 4. Charts Section */}
				<SectionCard title='Trends' description="4-week team sentiment and performance trends">
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<SentimentTrendChart data={SUPERVISOR_SENTIMENT_TREND} />
						</Card>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<PerformanceTrendChart data={SUPERVISOR_PERFORMANCE_TREND} />
						</Card>
					</SimpleGrid>
				</SectionCard>

				{/* 5. Critical Issues Table (full width, team-scoped) */}
				{CRITICAL_ISSUES_SUPERVISOR.length > 0 && (
					<SectionCard title='Critical Issues' description='Team issues, disputes, and auto-fails requiring your attention'>
						<CriticalIssuesTable issues={CRITICAL_ISSUES_SUPERVISOR} />
					</SectionCard>
				)}

				{/* 6. Best & Worst Calls Panel (full width, team-scoped) */}
				<SectionCard title='Best & Worst Calls' description="Your team's top and bottom performing calls this week">
					<BestWorstCallsPanel calls={SUPERVISOR_CALLS} />
				</SectionCard>

				{/* 7. Quick Insights Widget (smaller width section) */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Quick Insights' description='Team-level recommendations and analysis'>
						<QuickInsightsWidget insights={DEFAULT_SUPERVISOR_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				{/* 8. Tabs Section: Team Members + Disputes (full width) */}
				<Tabs defaultValue='team-members'>
					<Tabs.List>
						<Tabs.Tab value='team-members'>Team Members</Tabs.Tab>
						<Tabs.Tab value='disputes'>Disputes</Tabs.Tab>
					</Tabs.List>

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
			</Stack>
		</ContentContainer>
	);
};

export default NewSupervisorDashboard;

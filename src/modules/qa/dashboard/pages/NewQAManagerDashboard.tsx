import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, SimpleGrid, Tabs, Badge } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionCard,
	BusinessInsightsCard,
	DashboardEvaluationFilter,
	isCardVisible,
	SentimentTrendChart,
	BestWorstCallsTable,
	QuickInsightsWidget,
	RankingsTable,
	InboxSummary,
} from '../components';
import type { DashboardEvaluationType } from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import { useDashboardRankings } from '~/modules/qa/rankings/hooks/useDashboardRankings';
import {
	QA_MANAGER_WEEKLY_METRICS,
	QA_MANAGER_SENTIMENT_TREND,
	QA_MANAGER_CALLS,
} from '../mockData';
import styles from '../Dashboard.module.css';

const DEFAULT_QA_MANAGER_INSIGHTS: Insight[] = [
	{
		title: 'Platform Performance',
		description:
			'Platform-wide QA scores are trending upward with consistent improvements.',
		type: 'positive',
	},
	{
		title: 'Compliance Monitoring',
		description:
			'Multiple supervisors need reinforced compliance training across the platform.',
		type: 'warning',
	},
	{
		title: 'Escalation Management',
		description:
			'Escalation rates remain elevated - coordinate with supervisors for improvement.',
		type: 'warning',
	},
	{
		title: 'Resource Optimization',
		description:
			'Consider redistributing QA resources for more balanced team coverage.',
		type: 'neutral',
	},
];

interface SupervisorRow {
	id: string;
	name: string;
	teamSize: number;
	avgQaScore: number;
	sentiment: number;
	compliance: number;
}

const SUPERVISORS_OVERVIEW: SupervisorRow[] = [
	{
		id: 'SUP-001',
		name: 'Sarah Johnson',
		teamSize: 8,
		avgQaScore: 91,
		sentiment: 4.3,
		compliance: 94,
	},
	{
		id: 'SUP-002',
		name: 'Mike Chen',
		teamSize: 9,
		avgQaScore: 89,
		sentiment: 4.1,
		compliance: 92,
	},
	{
		id: 'SUP-003',
		name: 'Jessica Martinez',
		teamSize: 7,
		avgQaScore: 86,
		sentiment: 3.9,
		compliance: 88,
	},
	{
		id: 'SUP-004',
		name: 'James Wilson',
		teamSize: 8,
		avgQaScore: 84,
		sentiment: 3.8,
		compliance: 85,
	},
	{
		id: 'SUP-005',
		name: 'Amanda Taylor',
		teamSize: 6,
		avgQaScore: 82,
		sentiment: 3.7,
		compliance: 83,
	},
	{
		id: 'SUP-006',
		name: 'Robert Kim',
		teamSize: 9,
		avgQaScore: 78,
		sentiment: 3.4,
		compliance: 76,
	},
	{
		id: 'SUP-007',
		name: 'Patricia Lopez',
		teamSize: 7,
		avgQaScore: 75,
		sentiment: 3.2,
		compliance: 72,
	},
];

interface DisputeRow {
	id: string;
	agentName: string;
	type: string;
	status: 'open' | 'pending' | 'approved' | 'rejected';
	createdDate: string;
}

const ALL_DISPUTES: DisputeRow[] = [
	{
		id: 'DSP-1042',
		agentName: 'David Brown',
		type: 'Score Dispute',
		status: 'open',
		createdDate: '2026-09-06T09:15:00Z',
	},
	{
		id: 'DSP-1041',
		agentName: 'Lisa Wong',
		type: 'Auto-Fail Dispute',
		status: 'pending',
		createdDate: '2026-09-05T14:30:00Z',
	},
	{
		id: 'DSP-1038',
		agentName: 'Jessica Martinez',
		type: 'Compliance Dispute',
		status: 'approved',
		createdDate: '2026-09-04T11:00:00Z',
	},
	{
		id: 'DSP-1035',
		agentName: 'John Smith',
		type: 'Score Dispute',
		status: 'rejected',
		createdDate: '2026-09-03T16:45:00Z',
	},
	{
		id: 'DSP-1030',
		agentName: 'Sarah Johnson',
		type: 'Evaluation Error',
		status: 'approved',
		createdDate: '2026-09-01T10:20:00Z',
	},
	{
		id: 'DSP-1027',
		agentName: 'Robert Kim',
		type: 'Score Dispute',
		status: 'pending',
		createdDate: '2026-08-31T13:10:00Z',
	},
	{
		id: 'DSP-1022',
		agentName: 'Patricia Lopez',
		type: 'Auto-Fail Dispute',
		status: 'open',
		createdDate: '2026-08-30T08:40:00Z',
	},
	{
		id: 'DSP-1019',
		agentName: 'Thomas Anderson',
		type: 'Compliance Dispute',
		status: 'rejected',
		createdDate: '2026-08-29T15:55:00Z',
	},
];

const DISPUTE_STATUS_COLORS: Record<DisputeRow['status'], string> = {
	open: 'blue',
	pending: 'yellow',
	approved: 'green',
	rejected: 'red',
};

interface CampaignRow {
	id: string;
	name: string;
	status: 'active' | 'archived';
	callsCount: number;
	createdDate: string;
}

const CAMPAIGNS_LIST: CampaignRow[] = [
	{
		id: 'CMP-001',
		name: 'Q3 Renewal Outreach',
		status: 'active',
		callsCount: 542,
		createdDate: '2026-07-01T09:00:00Z',
	},
	{
		id: 'CMP-002',
		name: 'Customer Retention Sprint',
		status: 'active',
		callsCount: 389,
		createdDate: '2026-07-15T09:00:00Z',
	},
	{
		id: 'CMP-003',
		name: 'New Product Launch',
		status: 'active',
		callsCount: 271,
		createdDate: '2026-08-01T09:00:00Z',
	},
	{
		id: 'CMP-004',
		name: 'Compliance Refresh Campaign',
		status: 'active',
		callsCount: 198,
		createdDate: '2026-08-10T09:00:00Z',
	},
	{
		id: 'CMP-005',
		name: 'Winter Promo 2025',
		status: 'archived',
		callsCount: 764,
		createdDate: '2025-11-20T09:00:00Z',
	},
	{
		id: 'CMP-006',
		name: 'Spring Cleanup Follow-ups',
		status: 'archived',
		callsCount: 412,
		createdDate: '2026-03-05T09:00:00Z',
	},
];

const CAMPAIGN_STATUS_COLORS: Record<CampaignRow['status'], string> = {
	active: 'teal',
	archived: 'gray',
};

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
			<Text
				fw={600}
				size='sm'
				c={row.original.avgQaScore < 80 ? 'red' : undefined}
			>
				{row.original.avgQaScore}%
			</Text>
		),
	},
	{
		accessorKey: 'sentiment',
		header: 'Sentiment',
		cell: ({ row }) => (
			<Text size='sm'>{row.original.sentiment.toFixed(1)} / 5.0</Text>
		),
	},
	{
		accessorKey: 'compliance',
		header: 'Compliance %',
		cell: ({ row }) => (
			<Badge
				color={row.original.compliance < 80 ? 'red' : 'teal'}
				variant='light'
			>
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
				{row.original.status.charAt(0).toUpperCase() +
					row.original.status.slice(1)}
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
			<Badge
				color={CAMPAIGN_STATUS_COLORS[row.original.status]}
				variant='light'
			>
				{row.original.status.charAt(0).toUpperCase() +
					row.original.status.slice(1)}
			</Badge>
		),
	},
	{
		accessorKey: 'callsCount',
		header: 'Calls Count',
		cell: ({ row }) => (
			<Text size='sm'>{row.original.callsCount.toLocaleString()}</Text>
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

export const NewQAManagerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('qa.dashboard');
	const { entries: rankingEntries, goal: rankingGoal } = useDashboardRankings(
		'all',
		7
	);
	const [evaluationType, setEvaluationType] =
		useState<DashboardEvaluationType>('all');
	const {
		qaScore,
		sentiment,
		complianceCategories,
		autoFailsCount,
		businessInsights,
		businessOutcome,
	} = QA_MANAGER_WEEKLY_METRICS;

	const overallSentiment = (sentiment.agentAvg + sentiment.customerAvg) / 2;

	const cardClass = (
		types: DashboardEvaluationType | DashboardEvaluationType[]
	) =>
		isCardVisible(evaluationType, types) ? styles.gridCard : styles.dimmedCard;

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>QA Manager Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Platform performance overview
					</Text>
				</div>

				<SectionCard
					title='Performance Score'
					description='Platform quality assurance, compliance, sentiment and business results this week'
				>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
						<div className={cardClass('qa')}>
							<QualityAssuranceCard
								score={qaScore}
								subtitle='Platform category breakdown'
								autoFails={autoFailsCount}
							/>
						</div>
						<div className={cardClass('compliance')}>
							<ComplianceCard
								categories={complianceCategories}
								subtitle='Platform category overview'
							/>
						</div>
						<div className={cardClass('sentiment')}>
							<SentimentEmotionCard
								score={overallSentiment}
								predominantEmotion={sentiment.predominantEmotion}
								subtitle='0-5 scale assessment'
							/>
						</div>
						<div className={cardClass('business')}>
							<BusinessInsightsCard
								insights={businessInsights}
								outcome={businessOutcome}
								subtitle='Platform conversion and signals'
							/>
						</div>
					</SimpleGrid>
				</SectionCard>

				<DashboardEvaluationFilter
					value={evaluationType}
					onChange={setEvaluationType}
				/>

				<InboxSummary
					autoDrivenCount={5}
					negativeCount={4}
					trendCount={8}
					inboxPath='/qa/qa-manager/inbox'
					dimmed={!isCardVisible(evaluationType, 'qa')}
				/>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Sentiment Trend'
						description='4-week platform sentiment progression'
						fullHeight
						dimmed={!isCardVisible(evaluationType, 'sentiment')}
					>
						<SentimentTrendChart data={QA_MANAGER_SENTIMENT_TREND} />
					</SectionCard>

					<SectionCard
						title='Quick Insights'
						description='Platform-level recommendations and analysis'
						fullHeight
						dimmed={
							!isCardVisible(evaluationType, [
								'sentiment',
								'compliance',
								'business',
							])
						}
					>
						<QuickInsightsWidget insights={DEFAULT_QA_MANAGER_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Best & Worst Calls'
						description='Top and bottom performing calls from across all teams this week'
						fullHeight
						dimmed={!isCardVisible(evaluationType, 'qa')}
					>
						<BestWorstCallsTable calls={QA_MANAGER_CALLS} />
					</SectionCard>

					<SectionCard
						title={t('sections.organisation')}
						description='Rankings, supervisors, disputes and campaigns'
						fullHeight
					>
						<Tabs defaultValue='rankings'>
							<Tabs.List>
								<Tabs.Tab value='rankings'>Team Rankings</Tabs.Tab>
								<Tabs.Tab value='supervisors'>Supervisors</Tabs.Tab>
								<Tabs.Tab value='disputes'>Disputes</Tabs.Tab>
								<Tabs.Tab value='campaigns'>Campaigns</Tabs.Tab>
							</Tabs.List>

							<Tabs.Panel value='rankings' pt='lg'>
								<RankingsTable
									entries={rankingEntries}
									title='Agent Rankings'
									description='Agents ranked against the active ranking program for this period'
									goal={rankingGoal}
									maxDisplay={7}
									onViewAll={() => navigate('/qa/qa-manager/rankings')}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='supervisors' pt='lg'>
								<BaseTable<SupervisorRow>
									columns={supervisorColumns}
									data={SUPERVISORS_OVERVIEW}
									getRowId={(supervisor) => supervisor.id}
									emptyMessage='No supervisors found'
								/>
							</Tabs.Panel>

							<Tabs.Panel value='disputes' pt='lg'>
								<BaseTable<DisputeRow>
									columns={disputeColumns}
									data={ALL_DISPUTES}
									getRowId={(dispute) => dispute.id}
									emptyMessage='No disputes found'
								/>
							</Tabs.Panel>

							<Tabs.Panel value='campaigns' pt='lg'>
								<BaseTable<CampaignRow>
									columns={campaignColumns}
									data={CAMPAIGNS_LIST}
									getRowId={(campaign) => campaign.id}
									emptyMessage='No campaigns found'
								/>
							</Tabs.Panel>
						</Tabs>
					</SectionCard>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewQAManagerDashboard;

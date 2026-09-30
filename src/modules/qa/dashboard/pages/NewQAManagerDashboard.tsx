import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
	Badge,
	Group,
	Button,
} from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionSplitCard,
	BusinessInsightsCard,
	OperationalCard,
	CampaignPerformanceCard,
	DashboardFilterBar,
	NeedsAttentionStrip,
	type CampaignPerformanceEntry,
	type NeedsAttentionItem,
} from '../components';
import { useDashboardCopy } from '../useDashboardCopy';
import { TODAY } from '~/modules/qa/analytics/constants';
import {
	buildTeamDashboardMetrics,
	buildTeamBusinessInsights,
} from '~/modules/qa/calls/agentMetrics';
import type { DashboardLineOfBusiness } from '../lineOfBusiness';
import {
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
	{
		id: 'DSP-1016',
		agentName: 'Maria Gonzalez',
		type: 'Score Dispute',
		status: 'open',
		createdDate: '2026-08-28T12:05:00Z',
	},
	{
		id: 'DSP-1013',
		agentName: 'Kevin Park',
		type: 'Evaluation Error',
		status: 'pending',
		createdDate: '2026-08-27T09:40:00Z',
	},
	{
		id: 'DSP-1010',
		agentName: 'Angela Torres',
		type: 'Auto-Fail Dispute',
		status: 'open',
		createdDate: '2026-08-26T17:20:00Z',
	},
	{
		id: 'DSP-1007',
		agentName: 'Brian Walsh',
		type: 'Compliance Dispute',
		status: 'approved',
		createdDate: '2026-08-25T10:15:00Z',
	},
	{
		id: 'DSP-1004',
		agentName: 'Nicole Foster',
		type: 'Score Dispute',
		status: 'open',
		createdDate: '2026-08-24T14:50:00Z',
	},
	{
		id: 'DSP-1001',
		agentName: 'Daniel Reyes',
		type: 'Evaluation Error',
		status: 'rejected',
		createdDate: '2026-08-22T08:30:00Z',
	},
];

const ACTIVE_CAMPAIGNS: CampaignPerformanceEntry[] = [
	{
		id: 'CMP-1',
		name: 'Q2 Sales Performance',
		status: 'active',
		qaScore: 92,
		complianceScore: 88,
		sentimentScore: 90,
		businessScore: 85,
		callsScored: 612,
	},
	{
		id: 'CMP-2',
		name: 'Customer Support Quality',
		status: 'active',
		qaScore: 78,
		complianceScore: 95,
		sentimentScore: 72,
		businessScore: 69,
		callsScored: 845,
	},
	{
		id: 'CMP-3',
		name: 'Compliance Audit Wave 2',
		status: 'active',
		qaScore: 95,
		complianceScore: 98,
		sentimentScore: 91,
		businessScore: 88,
		callsScored: 421,
	},
	{
		id: 'CMP-4',
		name: 'Retention Outreach',
		status: 'active',
		qaScore: 65,
		complianceScore: 74,
		sentimentScore: 58,
		businessScore: 52,
		callsScored: 298,
	},
	{
		id: 'CMP-5',
		name: 'VIP Escalations',
		status: 'active',
		qaScore: 88,
		complianceScore: 90,
		sentimentScore: 95,
		businessScore: 93,
		callsScored: 156,
	},
	{
		id: 'CMP-6',
		name: 'New Hire Training - June',
		status: 'paused',
		qaScore: 70,
		complianceScore: 80,
		sentimentScore: 75,
		businessScore: 60,
		callsScored: 45,
	},
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days a dispute has been waiting, measured from the dashboard's reference "today". */
const disputeAgeDays = (createdDate: string) =>
	Math.max(
		0,
		Math.floor((Date.parse(TODAY) - Date.parse(createdDate)) / DAY_MS)
	);

/** Below this QA score a campaign counts as under target (the "critical" score band). */
const CAMPAIGN_QA_TARGET = 70;

/** Team-wide drill-down target: no platform calls list exists yet, so rows open Team Analytics. */
const ANALYTICS_PATH = '/qa/qa-manager/analytics';

const DISPUTE_STATUS_COLORS: Record<DisputeRow['status'], string> = {
	open: 'blue',
	pending: 'yellow',
	approved: 'green',
	rejected: 'red',
};

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
		header: 'Age',
		cell: ({ row }) => (
			<Text
				c='dimmed'
				size='sm'
				title={new Date(row.original.createdDate).toLocaleDateString()}
			>
				{disputeAgeDays(row.original.createdDate)}d
			</Text>
		),
	},
];

export const NewQAManagerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('qa.dashboard');
	const copy = useDashboardCopy('qaManager');
	const [period, setPeriod] = useState<PerformanceScorePeriod>(
		DEFAULT_PERFORMANCE_SCORE_PERIOD
	);
	const days = performanceScoreDays(period);
	const [lineOfBusiness, setLineOfBusiness] =
		useState<DashboardLineOfBusiness | null>(null);
	const metrics = useMemo(
		() => buildTeamDashboardMetrics('qa-manager', days, lineOfBusiness),
		[days, lineOfBusiness]
	);
	const {
		insights: businessInsights,
		outcome: businessOutcome,
		conversionTrend,
	} = useMemo(
		() => buildTeamBusinessInsights('qa-manager', days, lineOfBusiness),
		[days, lineOfBusiness]
	);

	// Open and pending both still wait on a decision; oldest first so the longest wait leads.
	const openDisputes = ALL_DISPUTES.filter(
		(d) => d.status === 'open' || d.status === 'pending'
	).sort((a, b) => a.createdDate.localeCompare(b.createdDate));
	const openDisputeCount = openDisputes.length;
	const oldestDisputeDays = openDisputes.length
		? disputeAgeDays(openDisputes[0].createdDate)
		: 0;
	const campaignsBelowTarget = ACTIVE_CAMPAIGNS.filter(
		(c) => c.status === 'active' && c.qaScore < CAMPAIGN_QA_TARGET
	).length;

	const openAnalytics = () => navigate(ANALYTICS_PATH);

	const attentionItems: NeedsAttentionItem[] = [
		{
			id: 'disputes',
			label: t('roleDashboard.attention.disputes.label'),
			value: openDisputeCount,
			hint: t('roleDashboard.attention.disputes.hint', {
				days: oldestDisputeDays,
			}),
			onOpen: () => navigate('/qa/qa-manager/disputes'),
		},
		{
			id: 'campaigns',
			label: t('roleDashboard.attention.campaigns.label'),
			value: campaignsBelowTarget,
			hint: t('roleDashboard.attention.campaigns.hint'),
			onOpen: () => navigate('/qa/qa-manager/campaigns'),
		},
		{
			id: 'autoFails',
			label: t('roleDashboard.attention.autoFails.label'),
			value: metrics.autoFails,
			hint: t('roleDashboard.attention.autoFails.hint'),
			onOpen: openAnalytics,
		},
	];

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>{copy.title}</Title>
					<Text c='dimmed' mt='xs'>
						{copy.subtitle}
					</Text>
				</div>

				<DashboardFilterBar
					period={period}
					onPeriodChange={setPeriod}
					lineOfBusiness={lineOfBusiness}
					onLineOfBusinessChange={setLineOfBusiness}
				/>

				<NeedsAttentionStrip items={attentionItems} />

				<SectionCard
					title='Performance Score'
					description={`Platform quality assurance, compliance, sentiment and business results ${WINDOW_PHRASE[period]}${lineOfBusiness ? ` · ${lineOfBusiness}` : ''}`}
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
					<SectionCard
						title='Open Disputes'
						description='Evaluations being contested across the platform right now'
						fullHeight
						headerActions={
							<Group gap='xs'>
								<Badge size='lg' color='blue' variant='light'>
									{openDisputeCount}
								</Badge>
								<Button
									variant='subtle'
									size='xs'
									onClick={() => navigate('/qa/qa-manager/disputes')}
								>
									Manage →
								</Button>
							</Group>
						}
					>
						<BaseTable<DisputeRow>
							columns={disputeColumns}
							data={openDisputes}
							getRowId={(dispute) => dispute.id}
							onRowClick={(dispute) =>
								navigate(`/qa/qa-manager/disputes/${dispute.id}`)
							}
							emptyMessage='No open disputes'
						/>
					</SectionCard>

					<CampaignPerformanceCard entries={ACTIVE_CAMPAIGNS} />
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewQAManagerDashboard;

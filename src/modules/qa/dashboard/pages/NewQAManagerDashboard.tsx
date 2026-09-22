import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
	Badge,
	Group,
	Button,
	Select,
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
	type CampaignPerformanceEntry,
} from '../components';
import { buildTeamDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import {
	DASHBOARD_LINES_OF_BUSINESS,
	type DashboardLineOfBusiness,
} from '../lineOfBusiness';
import { QA_MANAGER_WEEKLY_METRICS } from '../mockData';
import styles from '../Dashboard.module.css';

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
		header: 'Date Created',
		cell: ({ row }) => (
			<Text c='dimmed' size='sm'>
				{new Date(row.original.createdDate).toLocaleDateString()}
			</Text>
		),
	},
];

export const NewQAManagerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { businessInsights, businessOutcome } = QA_MANAGER_WEEKLY_METRICS;
	const [lineOfBusiness, setLineOfBusiness] =
		useState<DashboardLineOfBusiness | null>(null);
	const metrics = buildTeamDashboardMetrics('qa-manager', 7, lineOfBusiness);

	const openDisputes = ALL_DISPUTES.filter((d) => d.status === 'open');
	const openDisputeCount = openDisputes.length;

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>QA Manager Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Platform performance overview
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
					description={`Platform quality assurance, compliance, sentiment and business results this week${lineOfBusiness ? ` · ${lineOfBusiness}` : ''}`}
				>
					<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing='md'>
						<div className={styles.gridCard}>
							<OperationalCard
								calls={metrics.calls}
								effectiveContacts={metrics.effectiveContacts}
								nonEffectiveContacts={metrics.nonEffectiveContacts}
								subtitle="Platform's contact effectiveness this week"
							/>
						</div>
						<div className={styles.gridCard}>
							<QualityAssuranceCard
								score={metrics.qa}
								subtitle='Platform category breakdown'
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
								subtitle='Platform category overview'
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
								subtitle='Platform vs the customers they contacted'
							/>
						</div>
						<div className={styles.gridCard}>
							<BusinessInsightsCard
								insights={businessInsights}
								outcome={businessOutcome}
								subtitle='Platform conversion and signals'
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

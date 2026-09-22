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
	TeamBurnoutRiskCard,
} from '../components';
import { buildTeamDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import { teamBurnoutRisk } from '~/modules/qa/analytics/helpers';
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
	const burnoutRisk = teamBurnoutRisk('qa-manager');

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

					<TeamBurnoutRiskCard
						entries={burnoutRisk}
						subtitle='Team members across the platform showing signs of burnout'
					/>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewQAManagerDashboard;

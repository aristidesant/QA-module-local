import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, SimpleGrid, Tabs, Card, Badge, Group, Button } from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionCard,
	AutoFailsCard,
	SentimentTrendChart,
	BestWorstCallsTable,
	QuickInsightsWidget,
	RankingsTable,
	InboxSummary,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import type { RankingEntry, RankingGoal } from '../components/RankingsTable';
import {
	SUPERVISOR_WEEKLY_METRICS,
	SUPERVISOR_SENTIMENT_TREND,
	SUPERVISOR_CALLS,
} from '../mockData';
import styles from '../Dashboard.module.css';


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

const SUPERVISOR_RANKING_GOAL: RankingGoal = {
	metric: 'Sentiment & Emotion',
	criteria: 'Team average sentiment and emotion scores',
	target: 'Team average of 4.0 or above',
	startDate: '2026-09-01',
	dueDate: '2026-12-31',
	setBy: 'You · Supervisor',
};

const SUPERVISOR_TEAM_RANKINGS: RankingEntry[] = [
	{
		position: 1,
		name: 'Mike Chen',
		score: 4.9,
		reactions: { LIKE: 11, HELPFUL: 14, INSPIRING: 9, AMAZING: 6, LEADER: 3 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 2,
		name: 'Sarah Johnson',
		score: 4.7,
		reactions: { LIKE: 8, HELPFUL: 11, INSPIRING: 7, AMAZING: 5, LEADER: 2 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 3,
		name: 'Jessica Martinez',
		score: 4.5,
		reactions: { LIKE: 5, HELPFUL: 9, INSPIRING: 6, AMAZING: 3, LEADER: 1 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 4,
		name: 'John Smith',
		score: 4.2,
		reactions: { LIKE: 4, HELPFUL: 7, INSPIRING: 4, AMAZING: 2, LEADER: 1 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 5,
		name: 'Emma Davis',
		score: 4.0,
		reactions: { LIKE: 3, HELPFUL: 5, INSPIRING: 3, AMAZING: 1, LEADER: 0 },
		trend: 'down',
		trendValue: 1,
	},
	{
		position: 6,
		name: 'David Brown',
		score: 2.9,
		reactions: { LIKE: 1, HELPFUL: 2, INSPIRING: 1, AMAZING: 0, LEADER: 0 },
		trend: 'down',
		trendValue: 4,
	},
	{
		position: 7,
		name: 'Lisa Wong',
		score: 2.6,
		reactions: { LIKE: 1, HELPFUL: 1, INSPIRING: 0, AMAZING: 0, LEADER: 0 },
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

type EvaluationType = 'all' | 'qa' | 'sentiment' | 'compliance' | 'business';

export const NewSupervisorDashboard: React.FC = () => {
	const navigate = useNavigate();
	const [evaluationType, setEvaluationType] = useState<EvaluationType>('all');
	const { qaScore, sentiment, complianceCategories, autoFailsCount } = SUPERVISOR_WEEKLY_METRICS;

	const overallSentiment = (sentiment.agentAvg + sentiment.customerAvg) / 2;

	const openDisputes = DISPUTES_SAMPLE.filter(d => d.status === 'open');
	const openDisputeCount = openDisputes.length;

	const shouldShowCard = (type: EvaluationType | EvaluationType[]): boolean => {
		if (evaluationType === 'all') return true;
		const types = Array.isArray(type) ? type : [type];
		return types.includes(evaluationType);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Supervisor Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Your team's performance overview
					</Text>
				</div>

				<SectionCard
					title='Performance Score'
					description="Your team's quality assurance, compliance, sentiment, and auto-fails results this week"
				>
					<SimpleGrid cols={{ base: 1, md: 4 }} spacing='md'>
						<QualityAssuranceCard score={qaScore} subtitle='Team category breakdown' />
						<ComplianceCard categories={complianceCategories} subtitle='Team category overview' />
						<SentimentEmotionCard
							score={overallSentiment}
							predominantEmotion={sentiment.predominantEmotion}
							subtitle='0-5 scale assessment'
						/>
						<div>
							<AutoFailsCard sectionAutoFails={autoFailsCount} globalAutoFails={18} compact />
						</div>
					</SimpleGrid>
				</SectionCard>

				<div>
					<Text size='sm' fw={500} mb='xs'>
						Filter by evaluation type
					</Text>
					<AppSegmentedControl
						value={evaluationType}
						onChange={(value) => setEvaluationType(value as EvaluationType)}
						data={[
							{ label: 'All', value: 'all' },
							{ label: 'QA', value: 'qa' },
							{ label: 'Sentiment & Emotion', value: 'sentiment' },
							{ label: 'Compliance', value: 'compliance' },
							{ label: 'Business Insight', value: 'business' },
						]}
					/>
				</div>

				<div style={{ opacity: shouldShowCard('qa') ? 1 : 0.5, transition: 'opacity 0.2s' }}>
					<InboxSummary
						autoDrivenCount={4}
						negativeCount={3}
						trendCount={6}
						inboxPath='/qa/supervisor/inbox'
					/>
				</div>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<div style={{ opacity: shouldShowCard('sentiment') ? 1 : 0.5, transition: 'opacity 0.2s' }}>
						<SectionCard title='Sentiment Trend' description='4-week team sentiment progression'>
							<Card className={styles.metricCard} p='md' radius='md' withBorder>
								<SentimentTrendChart data={SUPERVISOR_SENTIMENT_TREND} />
							</Card>
						</SectionCard>
					</div>

					<div style={{ opacity: shouldShowCard('compliance') ? 1 : 0.5, transition: 'opacity 0.2s' }}>
						<SectionCard>
							<Group justify='space-between' align='center' mb='md'>
								<div>
									<Title order={4}>Open Disputes</Title>
									<Badge size='lg' color='blue' variant='light'>
										{openDisputeCount} {openDisputeCount === 1 ? 'dispute' : 'disputes'} open
									</Badge>
								</div>
								<Button
									variant='subtle'
									size='xs'
									onClick={() => navigate('/qa/supervisor/disputes')}
								>
									Manage →
								</Button>
							</Group>
							<BaseTable<DisputeRow>
								columns={disputeColumns}
								data={openDisputes}
								getRowId={dispute => dispute.id}
								emptyMessage='No open disputes'
							/>
						</SectionCard>
					</div>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<div style={{ opacity: shouldShowCard('qa') ? 1 : 0.5, transition: 'opacity 0.2s' }}>
						<SectionCard title='Best & Worst Calls' description="Your team's top and bottom performing calls this week">
							<BestWorstCallsTable calls={SUPERVISOR_CALLS} />
						</SectionCard>
					</div>

					<div style={{ opacity: shouldShowCard(['qa', 'sentiment', 'compliance', 'business']) ? 1 : 0.5, transition: 'opacity 0.2s' }}>
						<Tabs defaultValue='rankings' style={{ flex: 1 }}>
							<Tabs.List>
								<Tabs.Tab value='rankings'>Team Rankings</Tabs.Tab>
								<Tabs.Tab value='team-members'>Team Members</Tabs.Tab>
								<Tabs.Tab value='insights'>Quick Insights</Tabs.Tab>
							</Tabs.List>

							<Tabs.Panel value='rankings' pt='lg'>
								<RankingsTable
									entries={SUPERVISOR_TEAM_RANKINGS}
									title='Team Rankings'
									description='Your team ranked against the goal you defined for this period'
									goal={SUPERVISOR_RANKING_GOAL}
									maxDisplay={7}
									onViewAll={() => navigate('/qa/supervisor/rankings')}
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

							<Tabs.Panel value='insights' pt='lg'>
								<SectionCard title='Quick Insights' description='Team-level recommendations and analysis'>
									<QuickInsightsWidget insights={DEFAULT_SUPERVISOR_INSIGHTS} />
								</SectionCard>
							</Tabs.Panel>
						</Tabs>
					</div>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewSupervisorDashboard;

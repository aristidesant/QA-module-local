import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
	Tabs,
	Group,
	Badge,
} from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	DashboardMetricCard,
	ProfileBadge,
	QualityAssuranceCard,
	ComplianceCard,
	SentimentEmotionCard,
	BusinessInsightsCard,
	SentimentTrendChart,
	CriticalIssuesTable,
	BestWorstCallsTable,
	QuickInsightsWidget,
	RankingsTable,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import type { RankingEntry, RankingGoal } from '../components/RankingsTable';
import {
	OPERATION_MANAGER_WEEKLY_METRICS,
	OPERATION_MANAGER_SENTIMENT_TREND,
	OPERATION_MANAGER_CALLS,
	CRITICAL_ISSUES_OPERATION_MANAGER,
} from '../mockData';
import type { CriticalIssue } from '../mockData';
import styles from '../Dashboard.module.css';

/** Inbox this dashboard's critical issues drill into */
const OPERATION_MANAGER_INBOX_PATH = '/qa/operation-manager/inbox';

/**
 * Default insights for the Operation Manager dashboard (operations-level recommendations)
 */
const DEFAULT_OPERATION_MANAGER_INSIGHTS: Insight[] = [
	{
		title: 'Multi-Client Compliance',
		description:
			'Regulatory compliance issues detected across multiple clients - immediate remediation required.',
		type: 'warning',
	},
	{
		title: 'Resource Constraints',
		description:
			'Several clients approaching resource capacity limits - consider workforce optimization.',
		type: 'warning',
	},
	{
		title: 'SLA Performance',
		description:
			'Monitor SLA adherence across clients - some teams approaching threshold limits.',
		type: 'warning',
	},
	{
		title: 'Platform Stability',
		description:
			'Overall platform stability at 86% - continue infrastructure monitoring and improvements.',
		type: 'neutral',
	},
];

/**
 * Team Health KPIs for the "Team Health" tab.
 * No shared model/mock export exists for this yet, so it is defined locally
 * (mirrors the approach taken for TEAM_MEMBERS in NewSupervisorDashboard.tsx).
 */
interface TeamHealthKpi {
	label: string;
	value: string | number;
	unit?: string;
	progress?: number;
	color: string;
	trend?: 'up' | 'down';
	trendValue?: string;
}

const TEAM_HEALTH_KPIS: TeamHealthKpi[] = [
	{
		label: 'Avg Handle Time',
		value: '7.5',
		unit: 'min',
		progress: 75,
		color: 'blue',
		trend: 'down',
		trendValue: '0.4m faster vs last week',
	},
	{
		label: 'Customer Satisfaction',
		value: 84,
		unit: '%',
		progress: 84,
		color: 'teal',
		trend: 'up',
		trendValue: '2pts vs last week',
	},
	{
		label: 'First Call Resolution',
		value: 78,
		unit: '%',
		progress: 78,
		color: 'grape',
		trend: 'down',
		trendValue: '3pts vs last week',
	},
];

/**
 * Risk indicator row for the "Team Health" tab, displayed via ProfileBadge.
 * ProfileBadge's `status` prop only supports 'active' | 'inactive' | 'on-break',
 * so risk severity is mapped onto that palette (active=low risk/green,
 * on-break=medium risk/yellow, inactive=high risk/gray - the closest available
 * neutral-warning tone since no red option exists on this component).
 */
interface RiskIndicatorRow {
	id: string;
	name: string;
	description: string;
	value: number;
	status: 'active' | 'inactive' | 'on-break';
}

const RISK_INDICATORS: RiskIndicatorRow[] = [
	{
		id: 'RISK-001',
		name: 'Turnover Rate',
		description: 'Cross-client agent attrition, trailing 30 days',
		value: 12,
		status: 'on-break',
	},
	{
		id: 'RISK-002',
		name: 'Compliance Issues',
		description: 'Open compliance findings across all clients',
		value: 8,
		status: 'inactive',
	},
	{
		id: 'RISK-003',
		name: 'Quality Drift',
		description: 'QA score deviation from target across teams',
		value: 3,
		status: 'active',
	},
];

/**
 * Client portfolio row for the "Clients" tab, displayed via ProfileBadge.
 * No shared model/mock export exists for this yet, so it is defined locally.
 */
interface ClientPortfolioRow {
	id: string;
	name: string;
	agentCount: number;
	qaScore: number;
	sentiment: number;
	status: 'active' | 'inactive';
}

const CLIENTS_PORTFOLIO: ClientPortfolioRow[] = [
	{
		id: 'CLIENT-A',
		name: 'Client A - Retail Services',
		agentCount: 42,
		qaScore: 91,
		sentiment: 4.4,
		status: 'active',
	},
	{
		id: 'CLIENT-B',
		name: 'Client B - Telecom Support',
		agentCount: 38,
		qaScore: 87,
		sentiment: 4.1,
		status: 'active',
	},
	{
		id: 'CLIENT-C',
		name: 'Client C - Financial Services',
		agentCount: 55,
		qaScore: 84,
		sentiment: 3.8,
		status: 'active',
	},
	{
		id: 'CLIENT-D',
		name: 'Client D - Healthcare Enrollment',
		agentCount: 29,
		qaScore: 79,
		sentiment: 3.5,
		status: 'active',
	},
	{
		id: 'CLIENT-E',
		name: 'Client E - Insurance Claims',
		agentCount: 33,
		qaScore: 74,
		sentiment: 3.1,
		status: 'active',
	},
	{
		id: 'CLIENT-F',
		name: 'Client F - Utilities',
		agentCount: 21,
		qaScore: 68,
		sentiment: 2.7,
		status: 'active',
	},
	{
		id: 'CLIENT-G',
		name: 'Client G - Legacy Program',
		agentCount: 12,
		qaScore: 71,
		sentiment: 3.2,
		status: 'inactive',
	},
];

/** Logs a client detail-view intent (mock action - no real navigation in this mockup). */
const handleClientClick = (client: ClientPortfolioRow) => {
	// eslint-disable-next-line no-console
	console.log('Client detail view requested for', client.name);
};

/** QA score bands reused across the client table. */
const clientScoreColor = (score: number) =>
	score >= 90 ? 'green' : score >= 80 ? 'teal' : score >= 70 ? 'yellow' : 'red';

const clientColumns: BaseTableColumnDef<ClientPortfolioRow>[] = [
	{
		accessorKey: 'name',
		header: 'Client',
		cell: ({ row }) => (
			<Text fw={600} size='sm'>
				{row.original.name}
			</Text>
		),
	},
	{
		accessorKey: 'agentCount',
		header: 'Agents',
		cell: ({ row }) => <Text size='sm'>{row.original.agentCount}</Text>,
	},
	{
		accessorKey: 'qaScore',
		header: 'QA',
		cell: ({ row }) => (
			<Badge
				size='sm'
				variant='light'
				color={clientScoreColor(row.original.qaScore)}
			>
				{row.original.qaScore}%
			</Badge>
		),
	},
	{
		accessorKey: 'sentiment',
		header: 'Sentiment',
		cell: ({ row }) => (
			<Text size='sm'>{row.original.sentiment.toFixed(1)}/5.0</Text>
		),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge
				size='sm'
				variant='light'
				color={row.original.status === 'active' ? 'green' : 'gray'}
			>
				{row.original.status === 'active' ? 'Active' : 'Inactive'}
			</Badge>
		),
	},
];

/**
 * Cross-client critical alert row for the "Critical Alerts" tab.
 * Builds on the shared CriticalIssue mock shape, adding an affected-clients
 * list and a recommended action - fields not present on CriticalIssue.
 */
interface CriticalAlertRow extends CriticalIssue {
	affectedClients: string[];
	action: string;
}

const CRITICAL_ALERTS: CriticalAlertRow[] =
	CRITICAL_ISSUES_OPERATION_MANAGER.slice(0, 6).map((issue, index) => {
		const affectedClientsByIndex: string[][] = [
			['Client C', 'Client E', 'Client F'],
			['Client B', 'Client D'],
			['Client A', 'Client C', 'Client E', 'Client G'],
			['Client D', 'Client F'],
			['Client B', 'Client E'],
			['Client A', 'Client C'],
		];
		const actionsByIndex: string[] = [
			'Escalate to compliance for immediate remediation',
			'Notify account managers and confirm SLA recovery plan',
			'Schedule client check-in to review satisfaction drivers',
			'Reallocate staffing from lower-priority queues',
			'Coordinate joint training session across affected teams',
			'Review budget allocation with finance',
		];

		return {
			...issue,
			affectedClients: affectedClientsByIndex[index] ?? ['Client A'],
			action: actionsByIndex[index] ?? 'Review and assign owner',
		};
	});

/**
 * Ranking goal applied across the client portfolio. Client teams are ranked
 * on an operations-weighted mix rather than QA score alone.
 */
const OPERATION_MANAGER_RANKING_GOAL: RankingGoal = {
	metric: 'Sentiment & Emotion',
	criteria: 'Cross-client sentiment and emotion performance',
	target: 'All clients at 4.0 or above',
	startDate: '2026-09-01',
	dueDate: '2026-12-31',
	setBy: 'You · Operation Manager',
};

/**
 * Client ranking entries for the "Team Rankings" tab, derived from the same
 * portfolio as the "Clients" tab so both views stay consistent.
 */
const OPERATION_MANAGER_RANKINGS: RankingEntry[] = [
	{
		position: 1,
		name: 'Client A - Retail Services',
		score: 4.6,
		reactions: { LIKE: 11, HELPFUL: 15, INSPIRING: 9, AMAZING: 6, LEADER: 3 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 2,
		name: 'Client B - Telecom Support',
		score: 4.4,
		reactions: { LIKE: 8, HELPFUL: 12, INSPIRING: 7, AMAZING: 5, LEADER: 2 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 3,
		name: 'Client C - Financial Services',
		score: 4.2,
		reactions: { LIKE: 6, HELPFUL: 9, INSPIRING: 6, AMAZING: 3, LEADER: 1 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 4,
		name: 'Client D - Healthcare Enrollment',
		score: 4.0,
		reactions: { LIKE: 4, HELPFUL: 7, INSPIRING: 4, AMAZING: 2, LEADER: 1 },
		trend: 'down',
		trendValue: 1,
	},
	{
		position: 5,
		name: 'Client E - Insurance Claims',
		score: 3.7,
		reactions: { LIKE: 3, HELPFUL: 5, INSPIRING: 2, AMAZING: 1, LEADER: 0 },
		trend: 'down',
		trendValue: 2,
	},
	{
		position: 6,
		name: 'Client G - Legacy Program',
		score: 3.6,
		reactions: { LIKE: 2, HELPFUL: 3, INSPIRING: 1, AMAZING: 1, LEADER: 0 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 7,
		name: 'Client F - Utilities',
		score: 3.4,
		reactions: { LIKE: 1, HELPFUL: 2, INSPIRING: 1, AMAZING: 0, LEADER: 0 },
		trend: 'down',
		trendValue: 3,
	},
];

/** Maps a critical issue severity to a theme-aware Mantine color token (matches CriticalIssuesTable convention) */
const getSeverityColor = (severity: CriticalIssue['severity']) => {
	switch (severity) {
		case 'critical':
			return 'red';
		case 'high':
			return 'orange';
		case 'medium':
			return 'yellow';
		case 'low':
			return 'blue';
		default:
			return 'gray';
	}
};

const criticalAlertColumns: BaseTableColumnDef<CriticalAlertRow>[] = [
	{
		accessorKey: 'title',
		header: 'Issue',
		cell: ({ row }) => (
			<Stack gap={2}>
				<Text fw={600} size='sm'>
					{row.original.title}
				</Text>
				<Text size='xs' c='dimmed'>
					{row.original.description}
				</Text>
			</Stack>
		),
	},
	{
		accessorKey: 'affectedClients',
		header: 'Affected Clients',
		cell: ({ row }) => (
			<Group gap={4} wrap='wrap'>
				{row.original.affectedClients.map((client) => (
					<Badge key={client} size='sm' variant='outline' color='gray'>
						{client}
					</Badge>
				))}
			</Group>
		),
	},
	{
		accessorKey: 'severity',
		header: 'Severity',
		cell: ({ row }) => (
			<Badge
				color={getSeverityColor(row.original.severity)}
				variant='filled'
				size='sm'
			>
				{row.original.severity.charAt(0).toUpperCase() +
					row.original.severity.slice(1)}
			</Badge>
		),
	},
	{
		accessorKey: 'action',
		header: 'Recommended Action',
		cell: ({ row }) => (
			<Text size='sm' c='dimmed'>
				{row.original.action}
			</Text>
		),
	},
];

export const NewOperationManagerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('qa.dashboard');
	const {
		qaScore,
		sentiment,
		complianceCategories,
		autoFailsCount,
		businessInsights,
		businessOutcome,
	} = OPERATION_MANAGER_WEEKLY_METRICS;

	/** Overall sentiment on the 0-5 scale, averaging agent and customer readings */
	const overallSentiment = (sentiment.agentAvg + sentiment.customerAvg) / 2;

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* 1. Header Section */}
				<div>
					<Title order={1}>Operation Manager Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Client portfolio and team health overview
					</Text>
				</div>

				{/* 2. Performance Score: the four evaluation aspects */}
				<SectionCard
					title='Performance Score'
					description='Cross-client quality assurance, compliance, sentiment and business results this week'
				>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
						<div className={styles.gridCard}>
							<QualityAssuranceCard
								score={qaScore}
								subtitle='Cross-client category breakdown'
								autoFails={autoFailsCount}
							/>
						</div>
						<div className={styles.gridCard}>
							<ComplianceCard
								categories={complianceCategories}
								subtitle='Cross-client category overview'
							/>
						</div>
						<div className={styles.gridCard}>
							<SentimentEmotionCard
								score={overallSentiment}
								predominantEmotion={sentiment.predominantEmotion}
								subtitle='0-5 scale assessment'
							/>
						</div>
						<div className={styles.gridCard}>
							<BusinessInsightsCard
								insights={businessInsights}
								outcome={businessOutcome}
								subtitle='Cross-client conversion and signals'
							/>
						</div>
					</SimpleGrid>
				</SectionCard>

				{/* 3. Critical issues */}
				<SectionCard
					title='Critical Issues'
					description='Urgent operational items requiring immediate attention across all clients'
				>
					<CriticalIssuesTable
						issues={CRITICAL_ISSUES_OPERATION_MANAGER}
						onIssueClick={() => navigate(OPERATION_MANAGER_INBOX_PATH)}
					/>
				</SectionCard>

				{/* 4. Sentiment trend and quick insights */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Sentiment Trend'
						description='4-week multi-client sentiment progression'
						fullHeight
					>
						<SentimentTrendChart data={OPERATION_MANAGER_SENTIMENT_TREND} />
					</SectionCard>

					<SectionCard
						title='Quick Insights'
						description='Operations-level recommendations for platform improvement'
						fullHeight
					>
						<QuickInsightsWidget
							insights={DEFAULT_OPERATION_MANAGER_INSIGHTS}
						/>
					</SectionCard>
				</SimpleGrid>

				{/* 5. Best & worst calls + operations tabs */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Best & Worst Calls'
						description='Top and bottom performing calls from across all clients this week'
						fullHeight
					>
						<BestWorstCallsTable calls={OPERATION_MANAGER_CALLS} />
					</SectionCard>

					<SectionCard
						title={t('sections.operations')}
						description='Rankings, team health, clients and critical alerts'
						fullHeight
					>
						<Tabs defaultValue='rankings'>
							<Tabs.List>
								<Tabs.Tab value='rankings'>Team Rankings</Tabs.Tab>
								<Tabs.Tab value='team-health'>Team Health</Tabs.Tab>
								<Tabs.Tab value='clients'>{t('sections.clients')}</Tabs.Tab>
								<Tabs.Tab value='critical-alerts'>Critical Alerts</Tabs.Tab>
							</Tabs.List>

							<Tabs.Panel value='rankings' pt='lg'>
								<RankingsTable
									entries={OPERATION_MANAGER_RANKINGS}
									title='Client Rankings'
									description='Client accounts ranked against the operational goal for this period'
									goal={OPERATION_MANAGER_RANKING_GOAL}
									maxDisplay={7}
									onViewAll={() => navigate('/qa/qa-manager/rankings')}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='team-health' pt='lg'>
								<Stack gap='lg'>
									<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
										{TEAM_HEALTH_KPIS.map((kpi) => (
											<DashboardMetricCard
												key={kpi.label}
												label={kpi.label}
												value={kpi.value}
												unit={kpi.unit}
												progress={kpi.progress}
												color={kpi.color}
												trend={kpi.trend}
												trendValue={kpi.trendValue}
											/>
										))}
									</SimpleGrid>

									<Stack gap='sm'>
										{RISK_INDICATORS.map((risk) => (
											<ProfileBadge
												key={risk.id}
												name={risk.name}
												role={risk.description}
												status={risk.status}
												score={risk.value}
											/>
										))}
									</Stack>
								</Stack>
							</Tabs.Panel>

							<Tabs.Panel value='clients' pt='lg'>
								<BaseTable<ClientPortfolioRow>
									columns={clientColumns}
									data={CLIENTS_PORTFOLIO}
									getRowId={(client) => client.id}
									onRowClick={handleClientClick}
									emptyMessage='No clients found'
								/>
							</Tabs.Panel>

							<Tabs.Panel value='critical-alerts' pt='lg'>
								<BaseTable<CriticalAlertRow>
									columns={criticalAlertColumns}
									data={CRITICAL_ALERTS}
									getRowId={(alert) => alert.id}
									emptyMessage='No critical alerts found'
								/>
							</Tabs.Panel>
						</Tabs>
					</SectionCard>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewOperationManagerDashboard;

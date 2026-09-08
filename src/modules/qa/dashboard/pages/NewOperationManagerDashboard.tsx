import React from 'react';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, SimpleGrid, Tabs, Card, Group, Badge } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	DashboardMetricCard,
	ProfileBadge,
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
		description: 'Regulatory compliance issues detected across multiple clients - immediate remediation required.',
		type: 'warning',
	},
	{
		title: 'Resource Constraints',
		description: 'Several clients approaching resource capacity limits - consider workforce optimization.',
		type: 'warning',
	},
	{
		title: 'SLA Performance',
		description: 'Monitor SLA adherence across clients - some teams approaching threshold limits.',
		type: 'warning',
	},
	{
		title: 'Platform Stability',
		description: 'Overall platform stability at 86% - continue infrastructure monitoring and improvements.',
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
	{ id: 'CLIENT-A', name: 'Client A - Retail Services', agentCount: 42, qaScore: 91, sentiment: 4.4, status: 'active' },
	{ id: 'CLIENT-B', name: 'Client B - Telecom Support', agentCount: 38, qaScore: 87, sentiment: 4.1, status: 'active' },
	{ id: 'CLIENT-C', name: 'Client C - Financial Services', agentCount: 55, qaScore: 84, sentiment: 3.8, status: 'active' },
	{ id: 'CLIENT-D', name: 'Client D - Healthcare Enrollment', agentCount: 29, qaScore: 79, sentiment: 3.5, status: 'active' },
	{ id: 'CLIENT-E', name: 'Client E - Insurance Claims', agentCount: 33, qaScore: 74, sentiment: 3.1, status: 'active' },
	{ id: 'CLIENT-F', name: 'Client F - Utilities', agentCount: 21, qaScore: 68, sentiment: 2.7, status: 'active' },
	{ id: 'CLIENT-G', name: 'Client G - Legacy Program', agentCount: 12, qaScore: 71, sentiment: 3.2, status: 'inactive' },
];

/** Logs a client detail-view intent (mock action - no real navigation in this mockup). */
const handleClientClick = (client: ClientPortfolioRow) => {
	// eslint-disable-next-line no-console
	console.log('Client detail view requested for', client.name);
};

/**
 * Cross-client critical alert row for the "Critical Alerts" tab.
 * Builds on the shared CriticalIssue mock shape, adding an affected-clients
 * list and a recommended action - fields not present on CriticalIssue.
 */
interface CriticalAlertRow extends CriticalIssue {
	affectedClients: string[];
	action: string;
}

const CRITICAL_ALERTS: CriticalAlertRow[] = CRITICAL_ISSUES_OPERATION_MANAGER.slice(0, 6).map((issue, index) => {
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
	metrics: ['QA Score', 'Compliance', 'Sentiment & Emotion'],
	criteria: '35% QA Score + 45% Compliance + 20% Sentiment & Emotion',
	target: 'Every client account at 80 or above',
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
		score: 91,
		reactions: { applause: 15, reverence: 9, salute: 6, thumbsUp: 11 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 2,
		name: 'Client B - Telecom Support',
		score: 87,
		reactions: { applause: 12, reverence: 7, salute: 5, thumbsUp: 8 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 3,
		name: 'Client C - Financial Services',
		score: 84,
		reactions: { applause: 9, reverence: 6, salute: 3, thumbsUp: 6 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 4,
		name: 'Client D - Healthcare Enrollment',
		score: 79,
		reactions: { applause: 7, reverence: 4, salute: 2, thumbsUp: 4 },
		trend: 'down',
		trendValue: 1,
	},
	{
		position: 5,
		name: 'Client E - Insurance Claims',
		score: 74,
		reactions: { applause: 5, reverence: 2, salute: 1, thumbsUp: 3 },
		trend: 'down',
		trendValue: 2,
	},
	{
		position: 6,
		name: 'Client G - Legacy Program',
		score: 71,
		reactions: { applause: 3, reverence: 1, salute: 1, thumbsUp: 2 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 7,
		name: 'Client F - Utilities',
		score: 68,
		reactions: { applause: 2, reverence: 1, salute: 0, thumbsUp: 1 },
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
				{row.original.affectedClients.map(client => (
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
			<Badge color={getSeverityColor(row.original.severity)} variant='filled' size='sm'>
				{row.original.severity.charAt(0).toUpperCase() + row.original.severity.slice(1)}
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
	const { qaScore, sentiment, complianceCategories, autoFailsCount } = OPERATION_MANAGER_WEEKLY_METRICS;

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

				{/* 2. Performance Score Row: Quality Assurance | Compliance | Sentiment & Emotion */}
				<SectionCard
					title='Performance Score'
					description='Cross-client quality assurance, compliance, and sentiment results this week'
				>
					<SimpleGrid cols={{ base: 1, md: 4 }} spacing='md'>
						<QualityAssuranceCard score={qaScore} subtitle='Cross-client category breakdown' />
						<ComplianceCard categories={complianceCategories} subtitle='Cross-client category overview' />
						<SentimentEmotionCard
							score={overallSentiment}
							predominantEmotion={sentiment.predominantEmotion}
							subtitle='0-5 scale assessment'
						/>
						<div>
							<AutoFailsCard sectionAutoFails={autoFailsCount} globalAutoFails={autoFailsCount} compact />
						</div>
					</SimpleGrid>
				</SectionCard>

				{/* 3. Critical Issues */}
				<SectionCard title='Critical Issues' description='Urgent operational items requiring immediate attention across all clients'>
					<CriticalIssuesTable
						issues={CRITICAL_ISSUES_OPERATION_MANAGER}
						onIssueClick={() => navigate(OPERATION_MANAGER_INBOX_PATH)}
					/>
				</SectionCard>

				{/* 4. Sentiment trend and quick insights */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Sentiment Trend' description='4-week multi-client sentiment progression'>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<SentimentTrendChart data={OPERATION_MANAGER_SENTIMENT_TREND} />
						</Card>
					</SectionCard>

					<SectionCard title='Quick Insights' description='Operations-level recommendations for platform improvement'>
						<QuickInsightsWidget insights={DEFAULT_OPERATION_MANAGER_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				{/* 5-6. Best & Worst Calls + Tabs Section (same row) */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Best & Worst Calls' description='Top and bottom performing calls from across all clients this week'>
						<BestWorstCallsTable calls={OPERATION_MANAGER_CALLS} />
					</SectionCard>

					<Tabs defaultValue='rankings' style={{ flex: 1 }}>
						<Tabs.List>
							<Tabs.Tab value='rankings'>Team Rankings</Tabs.Tab>
							<Tabs.Tab value='team-health'>Team Health</Tabs.Tab>
							<Tabs.Tab value='clients'>Clients</Tabs.Tab>
							<Tabs.Tab value='critical-alerts'>Critical Alerts</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='rankings' pt='lg'>
							<RankingsTable
								entries={OPERATION_MANAGER_RANKINGS}
								title='Client Rankings'
								description='Client accounts ranked against the operational goal for this period'
								goal={OPERATION_MANAGER_RANKING_GOAL}
								maxDisplay={7}
							/>
						</Tabs.Panel>

						<Tabs.Panel value='team-health' pt='lg'>
							<Stack gap='lg'>
								<SectionCard title='Key KPIs' description='Cross-client operational health indicators this week'>
									<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
										{TEAM_HEALTH_KPIS.map(kpi => (
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
								</SectionCard>

								<SectionCard title='Risk Indicators' description='Areas of operational risk across the client portfolio'>
									<Stack gap='sm'>
										{RISK_INDICATORS.map(risk => (
											<ProfileBadge
												key={risk.id}
												name={risk.name}
												role={risk.description}
												status={risk.status}
												score={risk.value}
											/>
										))}
									</Stack>
								</SectionCard>
							</Stack>
						</Tabs.Panel>

						<Tabs.Panel value='clients' pt='lg'>
							<SectionCard title='Client Portfolio' description='All clients under management with agent count, QA score, and sentiment'>
								<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
									{CLIENTS_PORTFOLIO.map(client => (
										<ProfileBadge
											key={client.id}
											name={client.name}
											role={`${client.agentCount} agents · Sentiment ${client.sentiment.toFixed(1)}/5.0`}
											status={client.status}
											score={client.qaScore}
											onClick={() => handleClientClick(client)}
										/>
									))}
								</SimpleGrid>
							</SectionCard>
						</Tabs.Panel>

						<Tabs.Panel value='critical-alerts' pt='lg'>
							<SectionCard title='Critical Alerts' description='High-severity issues affecting one or more clients'>
								<BaseTable<CriticalAlertRow>
									columns={criticalAlertColumns}
									data={CRITICAL_ALERTS}
									getRowId={alert => alert.id}
									emptyMessage='No critical alerts found'
								/>
							</SectionCard>
						</Tabs.Panel>
					</Tabs>
				</SimpleGrid>
			</Stack>
		</ContentContainer>
	);
};

export default NewOperationManagerDashboard;

import React from 'react';
import { Stack, Title, Text, SimpleGrid, Tabs, Card, Group, ThemeIcon, Progress, Badge } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	DashboardMetricCard,
	SentimentScaleCard,
	AutoFailsCard,
	SentimentTrendChart,
	PerformanceTrendChart,
	CriticalIssuesTable,
	BestWorstCallsPanel,
	QuickInsightsWidget,
	RankingsTable,
} from '../components';
import type { Insight } from '../components/QuickInsightsWidget';
import type { PerformanceTrendPoint } from '../components/PerformanceTrendChart';
import type { RankingEntry } from '../components/RankingsTable';
import {
	AGENT_WEEKLY_METRICS,
	AGENT_SENTIMENT_TREND,
	BEST_WORST_CALLS,
	CRITICAL_ISSUES_AGENT,
} from '../mockData';
import type { ComplianceCategory } from '../mockData';
import styles from '../Dashboard.module.css';

/**
 * Mock 4-week performance trend data for the agent
 * Mirrors the QA score progression shown on the legacy Agent dashboard
 */
const AGENT_PERFORMANCE_TREND: PerformanceTrendPoint[] = [
	{ week: 'Week 1', score: 88 },
	{ week: 'Week 2', score: 89 },
	{ week: 'Week 3', score: 91 },
	{ week: 'Week 4', score: 92 },
];

/**
 * Default insights for the agent dashboard
 */
const DEFAULT_AGENT_INSIGHTS: Insight[] = [
	{
		title: 'Strong Performance',
		description: 'Your QA score is performing well. Keep up the great work!',
		type: 'positive',
	},
	{
		title: 'Sentiment Improvement',
		description: 'Customer sentiment is trending positively this week.',
		type: 'positive',
	},
	{
		title: 'Compliance Status',
		description: 'All compliance categories are in good standing.',
		type: 'positive',
	},
];

/**
 * Mock team rankings for the "Team Rankings" tab.
 * Includes the current agent (John Smith, matching the agent identity used
 * across this module's other mock datasets) alongside the top team members.
 */
const AGENT_TEAM_RANKINGS: RankingEntry[] = [
	{
		position: 1,
		name: 'Mike Chen',
		score: 97,
		reactions: { like: 12, helpful: 8, inspiring: 5, amazing: 10, leader: 3 },
		trend: 'up',
		trendValue: 3,
	},
	{
		position: 2,
		name: 'Sarah Johnson',
		score: 95,
		reactions: { like: 10, helpful: 7, inspiring: 4, amazing: 6, leader: 2 },
		trend: 'up',
		trendValue: 1,
	},
	{
		position: 3,
		name: 'Jessica Martinez',
		score: 93,
		reactions: { like: 9, helpful: 5, inspiring: 3, amazing: 4, leader: 1 },
		trend: 'stable',
		trendValue: 0,
	},
	{
		position: 4,
		name: 'John Smith',
		score: 90,
		reactions: { like: 8, helpful: 4, inspiring: 2, amazing: 3, leader: 0 },
		trend: 'up',
		trendValue: 2,
	},
	{
		position: 5,
		name: 'Emma Davis',
		score: 88,
		reactions: { like: 6, helpful: 3, inspiring: 1, amazing: 2, leader: 0 },
		trend: 'down',
		trendValue: 1,
	},
];

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
 * Compact compliance breakdown card for the Agent dashboard's secondary
 * metrics row. Mirrors the visual language of the other dashboard cards
 * (Card + Progress + Badge) using Mantine color tokens only, so it renders
 * correctly in both dark and light mode.
 */
const AgentComplianceCard: React.FC<{ categories: ComplianceCategory[] }> = ({ categories }) => (
	<Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm'>
		<Stack gap='md'>
			<Group justify='space-between' align='flex-start'>
				<div>
					<Text fw={600} size='md'>
						Compliance
					</Text>
					<Text size='xs' c='dimmed'>
						Category overview
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

export const NewAgentDashboard: React.FC = () => {
	const { qaScore, sentiment, complianceCategories, autoFailsCount } = AGENT_WEEKLY_METRICS;

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* 1. Header Section */}
				<div>
					<Title order={1}>Agent Dashboard</Title>
					<Text c='dimmed' mt='xs'>
						Your personal performance overview
					</Text>
				</div>

				{/* 2. Performance Scores Row */}
				<SectionCard
					title='Performance Scores'
					description='Your QA score breakdown by category this week'
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
					description='Detailed breakdown of sentiment analysis, compliance status, and auto-fail tracking'
				>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						<Stack gap='md'>
							<SentimentScaleCard agentScore={sentiment.agentAvg} customerScore={sentiment.customerAvg} />
							<AgentComplianceCard categories={complianceCategories} />
						</Stack>
						<AutoFailsCard totalCount={autoFailsCount} />
					</SimpleGrid>
				</SectionCard>

				{/* 4. Charts Section */}
				<SectionCard title='Trends' description='4-week sentiment and performance trends'>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<SentimentTrendChart data={AGENT_SENTIMENT_TREND} />
						</Card>
						<Card className={styles.metricCard} p='md' radius='md' withBorder>
							<PerformanceTrendChart data={AGENT_PERFORMANCE_TREND} />
						</Card>
					</SimpleGrid>
				</SectionCard>

				{/* 5. Critical Issues Table (full width) */}
				{CRITICAL_ISSUES_AGENT.length > 0 && (
					<SectionCard title='Critical Issues' description='Personal issues requiring your attention'>
						<CriticalIssuesTable issues={CRITICAL_ISSUES_AGENT} />
					</SectionCard>
				)}

				{/* 6. Best & Worst Calls Panel (full width) */}
				<SectionCard title='Best & Worst Calls' description='Your top and bottom performing calls this week'>
					<BestWorstCallsPanel calls={BEST_WORST_CALLS} />
				</SectionCard>

				{/* 7. Quick Insights Widget (smaller width section) */}
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<SectionCard title='Quick Insights' description='Performance recommendations and analysis'>
						<QuickInsightsWidget insights={DEFAULT_AGENT_INSIGHTS} />
					</SectionCard>
				</SimpleGrid>

				{/* 8. Team Rankings Tab (full width) */}
				<Tabs defaultValue='rankings'>
					<Tabs.List>
						<Tabs.Tab value='rankings'>Team Rankings</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='rankings' pt='lg'>
						<RankingsTable
							entries={AGENT_TEAM_RANKINGS}
							title='Team Rankings'
							description="Your current ranking alongside the team's top performers this period"
							maxDisplay={5}
						/>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default NewAgentDashboard;

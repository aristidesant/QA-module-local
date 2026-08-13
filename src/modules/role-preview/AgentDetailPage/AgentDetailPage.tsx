import React, { useMemo } from 'react';
import {
	Stack,
	Text,
	Title,
	SimpleGrid,
	Card,
	Group,
	Badge,
	Button,
	Alert,
	Skeleton,
} from '@mantine/core';
import { IconArrowLeft, IconAlertTriangle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import ContentContainer from '~/components/ContentContainer';
import { useAgentsQuery } from '~/queries/qa/agentsQueries';
import { getAgentDisplayName } from '~/modules/qa/utils/agent';
import { DEMO_AGENT_CALLS } from '../../evaluations-demo/AgentDashboard/mockData';
import AgentPerformanceTrendChart from '../../evaluations-demo/AgentDashboard/pages/AgentDashboardPage/components/AgentPerformanceTrendChart';
import styles from './AgentDetailPage.module.css';

const AgentDetailPage: React.FC = () => {
	const { agentId } = useParams<{ agentId: string }>();
	const navigate = useNavigate();

	const agentsQuery = useAgentsQuery({
		limit: 100,
		offset: 0,
		sortBy: 'employeeId',
		orderBy: 'ASC',
	});

	const agent = useMemo(() => {
		if (!agentId || !agentsQuery.data?.data) return null;
		return agentsQuery.data.data.find((a) => String(a.id) === agentId);
	}, [agentId, agentsQuery.data?.data]);

	const agentCalls = useMemo(() => {
		if (!agent) return [];
		return DEMO_AGENT_CALLS.filter(
			(call) => call.agentName === `Agent ${agent.id}`
		);
	}, [agent]);

	const metrics = useMemo(() => {
		if (!agentCalls.length) {
			return {
				satisfactionRate: 'N/A',
				bestDay: 'N/A',
				bestHour: 'N/A',
				avgHandleTime: 'N/A',
				totalCalls: '0',
				dominantSentiment: 'N/A',
			};
		}

		// Calculate metrics from mock data
		const scores = agentCalls
			.map((c) => c.score)
			.filter((s) => s !== null) as number[];
		const satisfactionRate =
			scores.length > 0
				? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
					10
				: 0;

		// Best performance day (mock: distribute calls across week)
		const dayMap = new Map<string, number[]>();
		agentCalls.forEach((call) => {
			const date = new Date(call.callDate);
			const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
				date.getDay()
			];
			if (!dayMap.has(day)) dayMap.set(day, []);
			if (call.score !== null) dayMap.get(day)!.push(call.score);
		});

		let bestDay = 'N/A';
		let bestDayScore = 0;
		dayMap.forEach((scores, day) => {
			const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
			if (avg > bestDayScore) {
				bestDayScore = avg;
				bestDay = day;
			}
		});

		// Best performance hour (mock: random hour)
		const bestHour = '02:00 - 03:00 PM';

		// Average handle time (mock)
		const avgHandleTime = '5m 42s';

		// Dominant sentiment
		const sentimentCalls = agentCalls.filter(
			(c) => c.evaluationType === 'Sentiment Analysis'
		);
		let dominantSentiment = 'Neutral';
		if (sentimentCalls.length > 0) {
			const avgSentiment =
				sentimentCalls.reduce((sum, c) => sum + (c.score || 0), 0) /
				sentimentCalls.length;
			if (avgSentiment >= 75) dominantSentiment = 'Very Positive';
			else if (avgSentiment >= 60) dominantSentiment = 'Positive';
			else if (avgSentiment >= 40) dominantSentiment = 'Neutral';
			else if (avgSentiment >= 25) dominantSentiment = 'Slightly Negative';
			else dominantSentiment = 'Very Negative';
		}

		return {
			satisfactionRate: `${satisfactionRate.toFixed(1)}%`,
			bestDay,
			bestHour,
			avgHandleTime,
			totalCalls: String(agentCalls.length),
			dominantSentiment,
		};
	}, [agentCalls]);

	if (agentsQuery.isLoading) {
		return (
			<ContentContainer contentWidth='full'>
				<Stack gap='md'>
					<Button
						leftSection={<IconArrowLeft size={16} />}
						variant='subtle'
						onClick={() => navigate(-1)}
					>
						Back to Roster
					</Button>
					<Skeleton height={200} />
				</Stack>
			</ContentContainer>
		);
	}

	if (!agent) {
		return (
			<ContentContainer contentWidth='full'>
				<Stack gap='md'>
					<Button
						leftSection={<IconArrowLeft size={16} />}
						variant='subtle'
						onClick={() => navigate(-1)}
					>
						Back to Roster
					</Button>
					<Alert
						color='red'
						icon={<IconAlertTriangle size={16} />}
						title='Agent not found'
						variant='light'
					>
						The requested agent could not be found.
					</Alert>
				</Stack>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Button
					leftSection={<IconArrowLeft size={16} />}
					variant='subtle'
					onClick={() => navigate(-1)}
				>
					Back to Roster
				</Button>

				{/* Header */}
				<Card withBorder radius='md' shadow='sm'>
					<Stack gap='md'>
						<div>
							<Group justify='space-between' align='flex-start' mb='sm'>
								<div>
									<Title order={2}>{getAgentDisplayName(agent)}</Title>
									<Text c='dimmed' size='sm'>
										{agent.employeeId}
									</Text>
								</div>
								<Badge
									color={agent.hasUserAccount ? 'green' : 'orange'}
									variant='light'
								>
									{agent.hasUserAccount ? 'Active' : 'Pending'}
								</Badge>
							</Group>
							<Text size='sm'>
								<strong>Email:</strong> {agent.email || 'Not provided'}
							</Text>
							<Text size='sm'>
								<strong>Type:</strong>{' '}
								{agent.agentType === 'AI_BOT' ? 'AI Bot' : 'Human'}
							</Text>
							<Text size='sm'>
								<strong>Created:</strong>{' '}
								{agent.createdAt
									? new Date(agent.createdAt).toLocaleDateString()
									: 'N/A'}
							</Text>
						</div>
					</Stack>
				</Card>

				{/* Key Metrics */}
				<div>
					<Title order={3} mb='md'>
						Performance Metrics
					</Title>
					<SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing='md'>
						<MetricCard
							label='Customer Satisfaction'
							value={metrics.satisfactionRate}
							color='blue'
						/>
						<MetricCard
							label='Best Performance Day'
							value={metrics.bestDay}
							color='green'
						/>
						<MetricCard
							label='Best Performance Hour'
							value={metrics.bestHour}
							color='violet'
						/>
						<MetricCard
							label='Avg Handle Time'
							value={metrics.avgHandleTime}
							color='cyan'
						/>
						<MetricCard
							label='Total Calls Analyzed'
							value={metrics.totalCalls}
							color='orange'
						/>
						<MetricCard
							label='Dominant Sentiment'
							value={metrics.dominantSentiment}
							color='pink'
						/>
					</SimpleGrid>
				</div>

				{/* Performance History */}
				<div>
					<Title order={3} mb='md'>
						Performance History
					</Title>
					<Card withBorder radius='md' shadow='sm' p='md'>
						{agentCalls.length > 0 ? (
							<AgentPerformanceTrendChart calls={agentCalls} />
						) : (
							<Text c='dimmed' ta='center' py='xl'>
								No performance data available
							</Text>
						)}
					</Card>
				</div>

				{/* Additional Info */}
				<div>
					<Title order={3} mb='md'>
						Additional Information
					</Title>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
						<Card withBorder radius='md' shadow='sm' p='md'>
							<Stack gap='sm'>
								<Text fw={700} size='sm'>
									Campaign Performance
								</Text>
								<Text size='sm' c='dimmed'>
									Sales: Excellent
								</Text>
								<Text size='sm' c='dimmed'>
									Retention: Good
								</Text>
								<Text size='sm' c='dimmed'>
									Accounts Receivable: Standard
								</Text>
							</Stack>
						</Card>
						<Card withBorder radius='md' shadow='sm' p='md'>
							<Stack gap='sm'>
								<Text fw={700} size='sm'>
									Additional Metrics
								</Text>
								<Text size='sm' c='dimmed'>
									Localization: English (Primary)
								</Text>
								<Text size='sm' c='dimmed'>
									Supervisor: Not assigned
								</Text>
								<Text size='sm' c='dimmed'>
									Tenure: Since registration
								</Text>
							</Stack>
						</Card>
					</SimpleGrid>
				</div>
			</Stack>
		</ContentContainer>
	);
};

interface MetricCardProps {
	label: string;
	value: string;
	color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
	label,
	value,
	color = 'blue',
}) => (
	<Card withBorder radius='md' shadow='sm' p='md' className={styles.metricCard}>
		<Stack gap='xs'>
			<Text size='xs' c='dimmed' fw={500}>
				{label}
			</Text>
			<Text fw={700} size='lg' c={color}>
				{value}
			</Text>
		</Stack>
	</Card>
);

export default AgentDetailPage;

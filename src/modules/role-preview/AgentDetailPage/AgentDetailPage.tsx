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
import { AGENT_DETAIL_CALLS, AGENT_PERFORMANCE_DATA } from './mockAgentData';
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
		return AGENT_DETAIL_CALLS.filter(
			(call) => call.agentName === agent.employeeId
		);
	}, [agent]);

	const metrics = useMemo(() => {
		if (!agent) {
			return {
				satisfactionRate: 'N/A',
				bestDay: 'N/A',
				bestHour: 'N/A',
				avgHandleTime: 'N/A',
				totalCalls: '0',
				dominantSentiment: 'N/A',
				supervisor: 'N/A',
				campaignPerformance: {},
			};
		}

		const performanceData =
			AGENT_PERFORMANCE_DATA[
				agent.employeeId as keyof typeof AGENT_PERFORMANCE_DATA
			];

		if (!performanceData) {
			return {
				satisfactionRate: 'N/A',
				bestDay: 'N/A',
				bestHour: 'N/A',
				avgHandleTime: 'N/A',
				totalCalls: '0',
				dominantSentiment: 'N/A',
				supervisor: 'N/A',
				campaignPerformance: {},
			};
		}

		return {
			satisfactionRate: `${performanceData.satisfactionRate}%`,
			bestDay: performanceData.bestDay,
			bestHour: performanceData.bestHour,
			avgHandleTime: performanceData.avgHandleTime,
			totalCalls: String(performanceData.totalCalls),
			dominantSentiment: performanceData.dominantSentiment,
			supervisor: performanceData.supervisor,
			campaignPerformance: performanceData.campaignPerformance,
		};
	}, [agent]);

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
								{Object.entries(metrics.campaignPerformance).map(
									([campaign, performance]) => (
										<Group key={campaign} justify='space-between'>
											<Text size='sm' c='dimmed'>
												{campaign}:
											</Text>
											<Badge size='sm' variant='light'>
												{performance as string}
											</Badge>
										</Group>
									)
								)}
							</Stack>
						</Card>
						<Card withBorder radius='md' shadow='sm' p='md'>
							<Stack gap='sm'>
								<Text fw={700} size='sm'>
									Additional Metrics
								</Text>
								<Text size='sm' c='dimmed'>
									<strong>Localization:</strong> English (Primary)
								</Text>
								<Text size='sm' c='dimmed'>
									<strong>Supervisor:</strong> {metrics.supervisor}
								</Text>
								<Text size='sm' c='dimmed'>
									<strong>Tenure:</strong> Since registration to current date
								</Text>
								<Text size='sm' c='dimmed'>
									<strong>Account Status:</strong>{' '}
									{agent.hasUserAccount ? 'Active' : 'Pending'}
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

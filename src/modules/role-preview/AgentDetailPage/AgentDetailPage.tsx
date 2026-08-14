import React, { useMemo, useState } from 'react';
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
	Tabs,
	Progress,
	Table,
} from '@mantine/core';
import { IconArrowLeft, IconAlertTriangle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import ContentContainer from '~/components/ContentContainer';
import { useAgentsQuery } from '~/queries/qa/agentsQueries';
import { getAgentDisplayName } from '~/modules/qa/utils/agent';
import { AGENT_DETAIL_CALLS, AGENT_PERFORMANCE_DATA } from './mockAgentData';
import AgentPerformanceTrendChart from '../../evaluations-demo/AgentDashboard/pages/AgentDashboardPage/components/AgentPerformanceTrendChart';
import PerformanceAlertsSection from './components/PerformanceAlertsSection';
import PeerComparisonSection from './components/PeerComparisonSection';
import CoachingDevelopmentSection from './components/CoachingDevelopmentSection';
import styles from './AgentDetailPage.module.css';

const AgentDetailPage: React.FC = () => {
	const { agentId } = useParams<{ agentId: string }>();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<string | null>('overview');

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

	// Mock alerts based on agent performance
	const alerts = useMemo(() => {
		const mockAlerts = [];
		// Simulate declining QA score alert
		if (Math.random() > 0.3) {
			mockAlerts.push({
				id: 'alert-1',
				type: 'critical' as const,
				title: 'Declining QA Score',
				description:
					'Latest 5 calls show decrease in Communication Clarity from 92% to 85%. Latest 5 calls show decrease in Communication Clarity.',
				relatedTab: 'qa',
			});
		}
		// Simulate compliance gap alert
		if (Math.random() > 0.5) {
			mockAlerts.push({
				id: 'alert-2',
				type: 'caution' as const,
				title: 'Compliance Gap',
				description:
					'2 policy violations detected in the past 14 days. Review compliance training may be needed.',
				relatedTab: 'compliance',
			});
		}
		return mockAlerts;
	}, []);

	// Mock peer comparison data (team averages for demo)
	const peerComparisonMetrics = [
		{ label: 'QA Score', agentValue: 87, teamAverage: 82, unit: '%' },
		{ label: 'Compliance', agentValue: 91, teamAverage: 88, unit: '%' },
		{ label: 'Sentiment Score', agentValue: 82, teamAverage: 78, unit: '' },
		{
			label: 'Customer Satisfaction',
			agentValue: 92,
			teamAverage: 86,
			unit: '%',
		},
	];

	// Mock coaching data
	const coachingReports = [
		{
			id: 'coaching-1',
			date: 'Aug 10, 2026',
			topic: 'QA Gap Analysis',
			supervisor: 'Sarah Chen',
			status: 'completed' as const,
		},
		{
			id: 'coaching-2',
			date: 'Jul 28, 2026',
			topic: 'Policy Updates',
			supervisor: 'Sarah Chen',
			status: 'completed' as const,
		},
	];

	// Mock training data
	const trainingModules = [
		{
			id: 'training-1',
			name: 'Policy Updates',
			dueDate: 'Aug 30, 2026',
			progress: 50,
			status: 'in_progress' as const,
		},
		{
			id: 'training-2',
			name: 'Communication Excellence',
			dueDate: 'Sep 15, 2026',
			progress: 0,
			status: 'not_started' as const,
		},
	];

	// Mock recommendations
	const recommendations = [
		{
			id: 'rec-1',
			title: 'Focus Area: Communication Clarity',
			description:
				'3 recent calls scored <85%. Consider focusing on clear enunciation and avoiding technical jargon.',
			priority: 'high' as const,
		},
		{
			id: 'rec-2',
			title: 'Complete Policy Updates Module by Aug 30',
			description:
				'Currently at 50% completion. This training covers recent compliance changes in your department.',
			priority: 'high' as const,
		},
		{
			id: 'rec-3',
			title: 'Strength: Problem Resolution',
			description:
				'Consistent high scores (avg 90%) - keep up the excellent work!',
			priority: 'low' as const,
		},
	];

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

				{/* Performance Alerts */}
				{alerts.length > 0 && (
					<PerformanceAlertsSection
						alerts={alerts}
						onAlertClick={(tabName) => setActiveTab(tabName)}
					/>
				)}

				{/* Tabs */}
				<Tabs value={activeTab} onChange={setActiveTab} defaultValue='overview'>
					<Tabs.List>
						<Tabs.Tab value='overview'>General Overview</Tabs.Tab>
						<Tabs.Tab value='qa'>QA</Tabs.Tab>
						<Tabs.Tab value='sentiment'>Emotion & Sentiment</Tabs.Tab>
						<Tabs.Tab value='compliance'>Compliance</Tabs.Tab>
						<Tabs.Tab value='coaching'>Coaching & Development</Tabs.Tab>
					</Tabs.List>

					{/* General Overview Tab */}
					<Tabs.Panel value='overview' pt='md'>
						<Stack gap='lg'>
							{/* Peer Comparison Section */}
							<div>
								<Title order={3} mb='md'>
									Peer Comparison
								</Title>
								<PeerComparisonSection
									metrics={peerComparisonMetrics}
									agentName={getAgentDisplayName(agent)}
									percentileRank='Top 15%'
								/>
							</div>

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
												<strong>Tenure:</strong> Since registration to current
												date
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
					</Tabs.Panel>

					{/* QA Tab */}
					<Tabs.Panel value='qa' pt='md'>
						<Stack gap='lg'>
							<SimpleGrid cols={{ base: 1, sm: 4 }} spacing='md'>
								<MetricCard label='QA Score' value='87%' color='blue' />
								<MetricCard label='Calls Passed' value='22/25' color='green' />
								<MetricCard label='Quality Issues' value='3' color='orange' />
								<MetricCard
									label='Improvement Rate'
									value='+12%'
									color='cyan'
								/>
							</SimpleGrid>

							<Card withBorder radius='md' shadow='sm' p='md'>
								<Stack gap='md'>
									<Title order={4}>Quality Breakdown</Title>
									<div>
										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Communication Clarity</Text>
											<Text size='sm' fw={700}>
												92%
											</Text>
										</Group>
										<Progress value={92} size='md' mb='md' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Professionalism</Text>
											<Text size='sm' fw={700}>
												88%
											</Text>
										</Group>
										<Progress value={88} size='md' mb='md' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Problem Resolution</Text>
											<Text size='sm' fw={700}>
												85%
											</Text>
										</Group>
										<Progress value={85} size='md' mb='md' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Customer Courtesy</Text>
											<Text size='sm' fw={700}>
												90%
											</Text>
										</Group>
										<Progress value={90} size='md' />
									</div>
								</Stack>
							</Card>

							<Card withBorder radius='md' shadow='sm' p='md'>
								<Stack gap='md'>
									<Title order={4}>Recent QA Issues</Title>
									<Table striped highlightOnHover>
										<Table.Thead>
											<Table.Tr>
												<Table.Th>Date</Table.Th>
												<Table.Th>Issue Type</Table.Th>
												<Table.Th>Severity</Table.Th>
												<Table.Th>Status</Table.Th>
											</Table.Tr>
										</Table.Thead>
										<Table.Tbody>
											<Table.Tr>
												<Table.Td>
													<Text size='sm'>Aug 2, 2026</Text>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>Missed Policy Step</Text>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='orange'>
														Medium
													</Badge>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='blue'>
														Resolved
													</Badge>
												</Table.Td>
											</Table.Tr>
											<Table.Tr>
												<Table.Td>
													<Text size='sm'>Jul 31, 2026</Text>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>Documentation Error</Text>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='yellow'>
														Low
													</Badge>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='blue'>
														Resolved
													</Badge>
												</Table.Td>
											</Table.Tr>
											<Table.Tr>
												<Table.Td>
													<Text size='sm'>Jul 28, 2026</Text>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>Incomplete Info</Text>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='orange'>
														Medium
													</Badge>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='blue'>
														Resolved
													</Badge>
												</Table.Td>
											</Table.Tr>
										</Table.Tbody>
									</Table>
								</Stack>
							</Card>
						</Stack>
					</Tabs.Panel>

					{/* Emotion & Sentiment Tab */}
					<Tabs.Panel value='sentiment' pt='md'>
						<Stack gap='lg'>
							<SimpleGrid cols={{ base: 1, sm: 4 }} spacing='md'>
								<MetricCard
									label='Sentiment Score'
									value='82/100'
									color='green'
								/>
								<MetricCard label='Positive Calls' value='18/25' color='lime' />
								<MetricCard label='Neutral Calls' value='6/25' color='gray' />
								<MetricCard label='Negative Calls' value='1/25' color='red' />
							</SimpleGrid>

							<Card withBorder radius='md' shadow='sm' p='md'>
								<Stack gap='md'>
									<Title order={4}>Sentiment Distribution</Title>
									<div>
										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Very Positive</Text>
											<Text size='sm' fw={700}>
												32%
											</Text>
										</Group>
										<Progress value={32} size='md' mb='md' color='green' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Positive</Text>
											<Text size='sm' fw={700}>
												40%
											</Text>
										</Group>
										<Progress value={40} size='md' mb='md' color='lime' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Neutral</Text>
											<Text size='sm' fw={700}>
												24%
											</Text>
										</Group>
										<Progress value={24} size='md' mb='md' color='gray' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Negative</Text>
											<Text size='sm' fw={700}>
												4%
											</Text>
										</Group>
										<Progress value={4} size='md' color='red' />
									</div>
								</Stack>
							</Card>

							<Card withBorder radius='md' shadow='sm' p='md'>
								<Stack gap='md'>
									<Title order={4}>Emotion Indicators</Title>
									<Group justify='space-between' mb='xs'>
										<Text size='sm'>Customer Satisfaction</Text>
										<Text size='sm' fw={700}>
											88%
										</Text>
									</Group>
									<Progress value={88} size='md' mb='md' color='blue' />

									<Group justify='space-between' mb='xs'>
										<Text size='sm'>Empathy Level</Text>
										<Text size='sm' fw={700}>
											85%
										</Text>
									</Group>
									<Progress value={85} size='md' mb='md' color='violet' />

									<Group justify='space-between' mb='xs'>
										<Text size='sm'>Recovery Success Rate</Text>
										<Text size='sm' fw={700}>
											92%
										</Text>
									</Group>
									<Progress value={92} size='md' color='cyan' />
								</Stack>
							</Card>
						</Stack>
					</Tabs.Panel>

					{/* Compliance Tab */}
					<Tabs.Panel value='compliance' pt='md'>
						<Stack gap='lg'>
							<SimpleGrid cols={{ base: 1, sm: 4 }} spacing='md'>
								<MetricCard label='Compliance Score' value='91%' color='blue' />
								<MetricCard label='Violations Found' value='2' color='orange' />
								<MetricCard label='Critical Issues' value='0' color='green' />
								<MetricCard label='Resolved Issues' value='2' color='green' />
							</SimpleGrid>

							<Card withBorder radius='md' shadow='sm' p='md'>
								<Stack gap='md'>
									<Title order={4}>Compliance Metrics</Title>
									<div>
										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Policy Adherence</Text>
											<Text size='sm' fw={700}>
												94%
											</Text>
										</Group>
										<Progress value={94} size='md' mb='md' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Documentation Compliance</Text>
											<Text size='sm' fw={700}>
												89%
											</Text>
										</Group>
										<Progress value={89} size='md' mb='md' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Data Security Standards</Text>
											<Text size='sm' fw={700}>
												96%
											</Text>
										</Group>
										<Progress value={96} size='md' mb='md' />

										<Group justify='space-between' mb='xs'>
											<Text size='sm'>Regulatory Requirements</Text>
											<Text size='sm' fw={700}>
												92%
											</Text>
										</Group>
										<Progress value={92} size='md' />
									</div>
								</Stack>
							</Card>

							<Card withBorder radius='md' shadow='sm' p='md'>
								<Stack gap='md'>
									<Title order={4}>Violation History</Title>
									<Table striped highlightOnHover>
										<Table.Thead>
											<Table.Tr>
												<Table.Th>Date</Table.Th>
												<Table.Th>Violation Type</Table.Th>
												<Table.Th>Severity</Table.Th>
												<Table.Th>Resolution</Table.Th>
											</Table.Tr>
										</Table.Thead>
										<Table.Tbody>
											<Table.Tr>
												<Table.Td>
													<Text size='sm'>Aug 1, 2026</Text>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>Missing Verification</Text>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='yellow'>
														Low
													</Badge>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='green'>
														Corrected
													</Badge>
												</Table.Td>
											</Table.Tr>
											<Table.Tr>
												<Table.Td>
													<Text size='sm'>Jul 29, 2026</Text>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>Form Field Incomplete</Text>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='yellow'>
														Low
													</Badge>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' color='green'>
														Corrected
													</Badge>
												</Table.Td>
											</Table.Tr>
										</Table.Tbody>
									</Table>
								</Stack>
							</Card>
						</Stack>
					</Tabs.Panel>

					{/* Coaching & Development Tab */}
					<Tabs.Panel value='coaching' pt='md'>
						<CoachingDevelopmentSection
							coachingReports={coachingReports}
							trainingModules={trainingModules}
							recommendations={recommendations}
							onScheduleCoaching={() => alert('Schedule coaching feature')}
							onAssignTraining={() => alert('Assign training feature')}
						/>
					</Tabs.Panel>
				</Tabs>
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

import { useState } from 'react';
import {
	Stack,
	Card,
	Text,
	Badge,
	Button,
	Group,
	Table,
	Select,
	Modal,
	Tabs,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconBell,
	IconPlus,
	IconHistory,
} from '@tabler/icons-react';

const mockActiveAlerts = [
	{
		id: 1,
		type: 'Sentiment Decline',
		threshold: 'Score drops below 3.5',
		status: 'active',
		lastTriggered: '2 hours ago',
		frequency: 'Immediate',
	},
	{
		id: 2,
		type: 'Recovery Rate Low',
		threshold: 'Recovery rate < 80%',
		status: 'active',
		lastTriggered: '5 hours ago',
		frequency: 'Daily summary',
	},
	{
		id: 3,
		type: 'Empathy Score Decline',
		threshold: 'Empathy score trending down',
		status: 'inactive',
		lastTriggered: '1 week ago',
		frequency: 'Weekly digest',
	},
	{
		id: 4,
		type: 'Campaign Sentiment Alert',
		threshold: 'Campaign sentiment < 3.8',
		status: 'active',
		lastTriggered: '12 hours ago',
		frequency: 'Daily summary',
	},
];

const mockAlertHistory = [
	{
		id: 1,
		alert: 'Sentiment Decline',
		triggered: '2026-08-06 14:30',
		agent: 'Agent 7',
		score: '3.2',
		action: 'Email sent to manager',
	},
	{
		id: 2,
		alert: 'Recovery Rate Low',
		triggered: '2026-08-06 10:00',
		agent: 'Campaign A',
		score: '78%',
		action: 'Slack notification',
	},
	{
		id: 3,
		alert: 'Sentiment Decline',
		triggered: '2026-08-05 16:45',
		agent: 'Agent 12',
		score: '3.4',
		action: 'Email sent',
	},
	{
		id: 4,
		alert: 'Campaign Sentiment Alert',
		triggered: '2026-08-05 09:15',
		agent: 'Campaign B',
		score: '3.6',
		action: 'Slack notification',
	},
];

export function Notifications() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const getStatusColor = (status: string) => {
		return status === 'active' ? 'green' : 'gray';
	};

	return (
		<>
			{/* Create Alert Modal */}
			<Modal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Create Alert Rule'
				centered
			>
				<Stack gap='md'>
					<Select
						label='Alert Type'
						placeholder='Select alert type...'
						data={[
							'Sentiment Score Drop',
							'Recovery Rate Low',
							'Empathy Score Decline',
							'Campaign Performance',
							'Agent Performance',
						]}
					/>
					<Select
						label='Condition'
						placeholder='Select condition...'
						data={[
							'Falls below',
							'Rises above',
							'Equals',
							'Trending down',
							'Trending up',
						]}
					/>
					<Select
						label='Threshold Value'
						placeholder='Enter threshold...'
						data={['3.0', '3.5', '4.0', '4.5', '75%', '80%', '85%', '90%']}
					/>
					<Select
						label='Notification Frequency'
						placeholder='How often should alerts trigger?'
						data={['Immediately', 'Hourly', 'Daily', 'Weekly']}
					/>
					<Group justify='flex-end' gap='xs'>
						<Button variant='default' onClick={() => setIsModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={() => setIsModalOpen(false)}>Create Alert</Button>
					</Group>
				</Stack>
			</Modal>

			<Card withBorder radius='md' p='md'>
				<Tabs defaultValue='history'>
					<Tabs.List>
						<Tabs.Tab value='history' leftSection={<IconHistory size={16} />}>
							Alert History
						</Tabs.Tab>
						<Tabs.Tab
							value='alerts'
							leftSection={<IconAlertCircle size={16} />}
						>
							Alert List
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='history' pt='md'>
						<Stack gap='md'>
							<Group justify='space-between'>
								<Text fw={600} size='lg'>
									Alert History
								</Text>
								<Badge color='gray'>{mockAlertHistory.length} Recent</Badge>
							</Group>
							{/* inline-style-allow: */}
							<div style={{ overflowX: 'auto' }}>
								<Table striped highlightOnHover>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Alert Type</Table.Th>
											<Table.Th>Triggered</Table.Th>
											<Table.Th>Target</Table.Th>
											<Table.Th>Score</Table.Th>
											<Table.Th>Action Taken</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{mockAlertHistory.map((item) => (
											<Table.Tr key={item.id}>
												<Table.Td>
													<Group gap='xs'>
														<IconBell size={16} />
														<Text fw={500} size='sm'>
															{item.alert}
														</Text>
													</Group>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>{item.triggered}</Text>
												</Table.Td>
												<Table.Td>
													<Badge size='sm' variant='light'>
														{item.agent}
													</Badge>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>{item.score}</Text>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>{item.action}</Text>
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</div>
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value='alerts' pt='md'>
						<Stack gap='md'>
							<Group justify='space-between'>
								<Text fw={600} size='lg'>
									Active Alerts
								</Text>
								<Group gap='xs'>
									<Badge color='blue'>
										{
											mockActiveAlerts.filter((a) => a.status === 'active')
												.length
										}{' '}
										Active
									</Badge>
									<Button
										size='sm'
										variant='light'
										leftSection={<IconPlus size={16} />}
										onClick={() => setIsModalOpen(true)}
									>
										New Alert
									</Button>
								</Group>
							</Group>
							{/* inline-style-allow: */}
							<div style={{ overflowX: 'auto' }}>
								<Table striped highlightOnHover>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Alert Type</Table.Th>
											<Table.Th>Threshold</Table.Th>
											<Table.Th>Status</Table.Th>
											<Table.Th>Last Triggered</Table.Th>
											<Table.Th>Frequency</Table.Th>
											<Table.Th>Actions</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{mockActiveAlerts.map((alert) => (
											<Table.Tr key={alert.id}>
												<Table.Td>
													<Group gap='xs'>
														<IconAlertCircle size={16} />
														<Text fw={500} size='sm'>
															{alert.type}
														</Text>
													</Group>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>{alert.threshold}</Text>
												</Table.Td>
												<Table.Td>
													<Badge
														color={getStatusColor(alert.status)}
														size='sm'
														variant='dot'
													>
														{alert.status.charAt(0).toUpperCase() +
															alert.status.slice(1)}
													</Badge>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>{alert.lastTriggered}</Text>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>{alert.frequency}</Text>
												</Table.Td>
												<Table.Td>
													<Group gap='xs'>
														<Button size='xs' variant='subtle'>
															Edit
														</Button>
														<Button size='xs' variant='subtle' color='red'>
															Remove
														</Button>
													</Group>
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</div>
						</Stack>
					</Tabs.Panel>
				</Tabs>
			</Card>
		</>
	);
}

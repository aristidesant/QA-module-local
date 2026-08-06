import { Stack, Card, Text, Badge, Group, Table, Progress, ThemeIcon } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockTeamComparison = [
	{
		agent: 'Agent 1',
		sentiment: 4.2,
		recovery: 85,
		empathy: 4.3,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
	{
		agent: 'Agent 2',
		sentiment: 3.8,
		recovery: 78,
		empathy: 3.9,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
	{
		agent: 'Agent 3',
		sentiment: 4.5,
		recovery: 92,
		empathy: 4.6,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
	{
		agent: 'Agent 4',
		sentiment: 3.5,
		recovery: 75,
		empathy: 3.6,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
	{
		agent: 'Agent 5',
		sentiment: 4.3,
		recovery: 88,
		empathy: 4.4,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
];

const mockBenchmarkData = [
	{ metric: 'Sentiment Score', team: 4.0, industry: 3.8, leader: 4.5 },
	{ metric: 'Recovery Rate', team: 82, industry: 80, leader: 92 },
	{ metric: 'Empathy Score', team: 4.1, industry: 3.9, leader: 4.6 },
	{ metric: 'Response Time', team: 2.3, industry: 2.5, leader: 1.8 },
];

const mockLeaderboard = [
	{ rank: 1, agent: 'Agent 3', score: 4.5, change: '↑ 0.3' },
	{ rank: 2, agent: 'Agent 5', score: 4.3, change: '→ 0.0' },
	{ rank: 3, agent: 'Agent 1', score: 4.2, change: '↓ -0.1' },
	{ rank: 4, agent: 'Agent 2', score: 3.8, change: '↑ 0.2' },
	{ rank: 5, agent: 'Agent 4', score: 3.5, change: '↓ -0.3' },
];

const getTrendIcon = (change: string) => {
	if (change.includes('↑')) return <IconTrendingUp size={16} color='green' />;
	if (change.includes('↓')) return <IconTrendingDown size={16} color='red' />;
	return <IconMinus size={16} color='gray' />;
};

export function ComparativeAndBenchmarking() {

	const getVarianceColor = (actual: number, target: number) => {
		if (actual > target) return 'green';
		if (actual < target) return 'red';
		return 'gray';
	};

	return (
		<Stack gap='md'>
			{/* Team Performance Comparison */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Team Performance Comparison
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					{/* inline-style-allow: */}
					<div style={{ overflowX: 'auto' }}>
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Agent</Table.Th>
									<Table.Th>Sentiment</Table.Th>
									<Table.Th>vs Team Avg</Table.Th>
									<Table.Th>Recovery Rate</Table.Th>
									<Table.Th>vs Team Avg</Table.Th>
									<Table.Th>Empathy Score</Table.Th>
									<Table.Th>vs Team Avg</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{mockTeamComparison.map((item) => (
									<Table.Tr key={item.agent}>
										<Table.Td fw={500}>{item.agent}</Table.Td>
										<Table.Td>
											<Badge
												color={getVarianceColor(item.sentiment, item.teamAvg.sentiment)}
											>
												{item.sentiment}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text
												size='sm'
												c={getVarianceColor(item.sentiment, item.teamAvg.sentiment)}
											>
												{(item.sentiment - item.teamAvg.sentiment).toFixed(1)}
											</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												color={getVarianceColor(item.recovery, item.teamAvg.recovery)}
											>
												{item.recovery}%
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text
												size='sm'
												c={getVarianceColor(item.recovery, item.teamAvg.recovery)}
											>
												{(item.recovery - item.teamAvg.recovery).toFixed(1)}%
											</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												color={getVarianceColor(item.empathy, item.teamAvg.empathy)}
											>
												{item.empathy}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text
												size='sm'
												c={getVarianceColor(item.empathy, item.teamAvg.empathy)}
											>
												{(item.empathy - item.teamAvg.empathy).toFixed(1)}
											</Text>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
				</Card.Section>
			</Card>

			{/* Industry Benchmarks */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Industry Benchmarks
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<ResponsiveContainer width='100%' height={300}>
						<BarChart data={mockBenchmarkData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='metric' />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey='team' fill='var(--mantine-color-blue-6)' name='Your Team' />
							<Bar dataKey='industry' fill='var(--mantine-color-gray-6)' name='Industry Avg' />
							<Bar dataKey='leader' fill='var(--mantine-color-green-6)' name='Top Performer' />
						</BarChart>
					</ResponsiveContainer>
				</Card.Section>
			</Card>

			{/* Leaderboard */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Group justify='space-between'>
						<Text fw={600} size='lg'>
							Top Performers
						</Text>
						<Badge>By Sentiment Score</Badge>
					</Group>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<Stack gap='md'>
						{mockLeaderboard.map((item) => (
							<Group
								key={item.rank}
								justify='space-between'
								p='sm'
								style={{
									backgroundColor: 'var(--mantine-color-gray-0)',
									borderRadius: '6px',
									borderLeft: `4px solid var(--mantine-color-blue-${6 - item.rank})`,
								}}
							>
								<Group gap='md' style={{ flex: 1 }}>
									<ThemeIcon size='lg' radius='md' variant='light'>
										<Text fw={700}>{item.rank}</Text>
									</ThemeIcon>
									<div>
										<Text fw={500}>{item.agent}</Text>
										<Text size='sm' c='dimmed'>
											Sentiment Score: {item.score}
										</Text>
									</div>
								</Group>
								<Group gap='xs'>
									{getTrendIcon(item.change)}
									<Text fw={500}>{item.change}</Text>
								</Group>
							</Group>
						))}
					</Stack>
				</Card.Section>
			</Card>

			{/* Performance Gaps */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Performance Gaps vs Benchmarks
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<Stack gap='md'>
						<div>
							<Group justify='space-between' mb={8}>
								<Text fw={500}>Team Sentiment vs Industry</Text>
								<Badge color='green'>+0.2 (Above Average)</Badge>
							</Group>
							<Progress value={100} />
						</div>
						<div>
							<Group justify='space-between' mb={8}>
								<Text fw={500}>Recovery Rate vs Best Practice</Text>
								<Badge color='orange'>-10% (Below Target)</Badge>
							</Group>
							<Progress value={89} />
						</div>
						<div>
							<Group justify='space-between' mb={8}>
								<Text fw={500}>Empathy Score vs Top Performer</Text>
								<Badge color='red'>-0.5 (Gap Identified)</Badge>
							</Group>
							<Progress value={89} />
						</div>
					</Stack>
				</Card.Section>
			</Card>
		</Stack>
	);
}

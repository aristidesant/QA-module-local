import { useState, useMemo } from 'react';
import {
	Stack,
	Card,
	Text,
	Badge,
	Group,
	Table,
	Select,
	Button,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
	IconX,
} from '@tabler/icons-react';

const mockTeamComparison = [
	{
		agent: 'Agent 1',
		campaign: 'Campaign A',
		supervisor: 'John Doe',
		date: '2026-08-06',
		sentiment: 4.2,
		recovery: 85,
		empathy: 4.3,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
	{
		agent: 'Agent 2',
		campaign: 'Campaign B',
		supervisor: 'Jane Smith',
		date: '2026-08-06',
		sentiment: 3.8,
		recovery: 78,
		empathy: 3.9,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
	{
		agent: 'Agent 3',
		campaign: 'Campaign A',
		supervisor: 'John Doe',
		date: '2026-08-05',
		sentiment: 4.5,
		recovery: 92,
		empathy: 4.6,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
	{
		agent: 'Agent 4',
		campaign: 'Campaign C',
		supervisor: 'Mike Johnson',
		date: '2026-08-06',
		sentiment: 3.5,
		recovery: 75,
		empathy: 3.6,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
	{
		agent: 'Agent 5',
		campaign: 'Campaign B',
		supervisor: 'Jane Smith',
		date: '2026-08-04',
		sentiment: 4.3,
		recovery: 88,
		empathy: 4.4,
		teamAvg: { sentiment: 4.0, recovery: 82, empathy: 4.1 },
	},
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
	const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
	const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(
		null
	);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);

	const campaigns = useMemo(
		() => [...new Set(mockTeamComparison.map((item) => item.campaign))],
		[]
	);
	const supervisors = useMemo(
		() => [...new Set(mockTeamComparison.map((item) => item.supervisor))],
		[]
	);

	const filteredData = useMemo(() => {
		return mockTeamComparison.filter((item) => {
			if (selectedCampaign && item.campaign !== selectedCampaign) return false;
			if (selectedSupervisor && item.supervisor !== selectedSupervisor)
				return false;
			if (startDate) {
				const itemDate = new Date(item.date);
				if (itemDate < startDate) return false;
			}
			if (endDate) {
				const itemDate = new Date(item.date);
				if (itemDate > endDate) return false;
			}
			return true;
		});
	}, [selectedCampaign, selectedSupervisor, startDate, endDate]);

	const getVarianceColor = (actual: number, target: number) => {
		if (actual > target) return 'green';
		if (actual < target) return 'red';
		return 'gray';
	};

	const clearFilters = () => {
		setSelectedCampaign(null);
		setSelectedSupervisor(null);
		setStartDate(null);
		setEndDate(null);
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

				{/* Filters */}
				{/* inline-style-allow: */}
				<Card.Section
					inheritPadding
					py='md'
					style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
				>
					<Stack gap='sm'>
						<Group grow>
							<Select
								label='Campaign'
								placeholder='Select campaign...'
								data={campaigns}
								value={selectedCampaign}
								onChange={setSelectedCampaign}
								clearable
							/>
							<Select
								label='Supervisor'
								placeholder='Select supervisor...'
								data={supervisors}
								value={selectedSupervisor}
								onChange={setSelectedSupervisor}
								clearable
							/>
						</Group>
						<Group grow>
							<DateInput
								label='Start Date'
								placeholder='Select start date'
								value={startDate}
								onChange={(date) => setStartDate(date as Date | null)}
								clearable
							/>
							<DateInput
								label='End Date'
								placeholder='Select end date'
								value={endDate}
								onChange={(date) => setEndDate(date as Date | null)}
								clearable
							/>
						</Group>
						{(selectedCampaign ||
							selectedSupervisor ||
							startDate ||
							endDate) && (
							<Button
								variant='subtle'
								size='sm'
								leftSection={<IconX size={16} />}
								onClick={clearFilters}
							>
								Clear Filters
							</Button>
						)}
					</Stack>
				</Card.Section>

				<Card.Section inheritPadding pb='md'>
					{filteredData.length === 0 ? (
						<Text c='dimmed' ta='center' py='md'>
							No results found with selected filters
						</Text>
					) : (
						<>
							{/* inline-style-allow: */}
							<div style={{ overflowX: 'auto' }}>
								<Table striped highlightOnHover>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Agent</Table.Th>
											<Table.Th>Campaign</Table.Th>
											<Table.Th>Supervisor</Table.Th>
											<Table.Th>Sentiment</Table.Th>
											<Table.Th>vs Team Avg</Table.Th>
											<Table.Th>Recovery Rate</Table.Th>
											<Table.Th>vs Team Avg</Table.Th>
											<Table.Th>Empathy Score</Table.Th>
											<Table.Th>vs Team Avg</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{filteredData.map((item) => (
											<Table.Tr key={item.agent}>
												<Table.Td fw={500}>{item.agent}</Table.Td>
												<Table.Td>
													<Badge size='sm' variant='light'>
														{item.campaign}
													</Badge>
												</Table.Td>
												<Table.Td>
													<Text size='sm'>{item.supervisor}</Text>
												</Table.Td>
												<Table.Td>
													<Badge
														color={getVarianceColor(
															item.sentiment,
															item.teamAvg.sentiment
														)}
													>
														{item.sentiment}
													</Badge>
												</Table.Td>
												<Table.Td>
													<Text
														size='sm'
														c={getVarianceColor(
															item.sentiment,
															item.teamAvg.sentiment
														)}
													>
														{(item.sentiment - item.teamAvg.sentiment).toFixed(
															1
														)}
													</Text>
												</Table.Td>
												<Table.Td>
													<Badge
														color={getVarianceColor(
															item.recovery,
															item.teamAvg.recovery
														)}
													>
														{item.recovery}%
													</Badge>
												</Table.Td>
												<Table.Td>
													<Text
														size='sm'
														c={getVarianceColor(
															item.recovery,
															item.teamAvg.recovery
														)}
													>
														{(item.recovery - item.teamAvg.recovery).toFixed(1)}
														%
													</Text>
												</Table.Td>
												<Table.Td>
													<Badge
														color={getVarianceColor(
															item.empathy,
															item.teamAvg.empathy
														)}
													>
														{item.empathy}
													</Badge>
												</Table.Td>
												<Table.Td>
													<Text
														size='sm'
														c={getVarianceColor(
															item.empathy,
															item.teamAvg.empathy
														)}
													>
														{(item.empathy - item.teamAvg.empathy).toFixed(1)}
													</Text>
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</div>
						</>
					)}
				</Card.Section>
			</Card>

			{/* Top Performers Table */}
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
					{/* inline-style-allow: */}
					<div style={{ overflowX: 'auto' }}>
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Rank</Table.Th>
									<Table.Th>Agent</Table.Th>
									<Table.Th>Sentiment Score</Table.Th>
									<Table.Th>Change</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{mockLeaderboard.map((item) => (
									<Table.Tr key={item.rank}>
										<Table.Td>
											<Badge
												size='lg'
												radius='md'
												variant='light'
												color={
													item.rank === 1
														? 'yellow'
														: item.rank === 2
															? 'gray'
															: 'orange'
												}
											>
												#{item.rank}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text fw={500}>{item.agent}</Text>
										</Table.Td>
										<Table.Td>
											<Text fw={600} size='lg'>
												{item.score}
											</Text>
										</Table.Td>
										<Table.Td>
											<Group gap='xs'>
												{getTrendIcon(item.change)}
												<Text fw={500}>{item.change}</Text>
											</Group>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
				</Card.Section>
			</Card>
		</Stack>
	);
}

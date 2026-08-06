import {
	Stack,
	Card,
	Badge,
	Group,
	Text,
	Progress,
	Table,
} from '@mantine/core';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	ReferenceLine,
} from 'recharts';

const mockChurnRiskTrendData = [
	{ period: 'Week 1', churnRisk: 42, criticalCount: 2, highCount: 5 },
	{ period: 'Week 2', churnRisk: 48, criticalCount: 3, highCount: 8 },
	{ period: 'Week 3', churnRisk: 55, criticalCount: 5, highCount: 11 },
	{ period: 'Week 4', churnRisk: 63, criticalCount: 8, highCount: 14 },
	{ period: 'Week 5', churnRisk: 58, criticalCount: 7, highCount: 12 },
	{ period: 'Week 6', churnRisk: 52, criticalCount: 5, highCount: 10 },
	{ period: 'Week 7', churnRisk: 48, criticalCount: 4, highCount: 8 },
	{ period: 'Week 8', churnRisk: 45, criticalCount: 3, highCount: 6 },
];

const mockTimingRecommendations = [
	{
		id: 1,
		scenario: 'Sentiment drops below 2.0',
		recommendation: 'Offer transfer to supervisor',
		probability: 89,
		impact: 'High',
	},
	{
		id: 2,
		scenario: 'Sentiment declining for 3+ minutes',
		recommendation: 'Suggest short break / callback',
		probability: 76,
		impact: 'High',
	},
	{
		id: 3,
		scenario: 'Neutral sentiment after issue raised',
		recommendation: 'Escalate to specialist',
		probability: 68,
		impact: 'Medium',
	},
	{
		id: 4,
		scenario: 'Rapid sentiment recovery observed',
		recommendation: 'Continue current approach',
		probability: 92,
		impact: 'Medium',
	},
];

const mockKeywordSentimentData = [
	{
		id: 1,
		phrase: 'problem solved',
		sentiment: 4.8,
		frequency: 234,
		trend: '↑',
	},
	{ id: 2, phrase: 'very helpful', sentiment: 4.7, frequency: 189, trend: '↑' },
	{ id: 3, phrase: 'waste of time', sentiment: 1.2, frequency: 45, trend: '↓' },
	{
		id: 4,
		phrase: 'great service',
		sentiment: 4.6,
		frequency: 156,
		trend: '↑',
	},
	{ id: 5, phrase: 'disappointed', sentiment: 1.8, frequency: 67, trend: '↑' },
	{
		id: 6,
		phrase: 'quick resolution',
		sentiment: 4.5,
		frequency: 123,
		trend: '→',
	},
	{
		id: 7,
		phrase: 'frustrating experience',
		sentiment: 1.5,
		frequency: 82,
		trend: '↑',
	},
	{
		id: 8,
		phrase: 'extremely satisfied',
		sentiment: 4.9,
		frequency: 98,
		trend: '↑',
	},
];

const mockToneMismatchData = [
	{
		id: 1,
		callId: '#2847-001',
		agent: 'Agent 5',
		transcriptTone: 'Polite',
		detectedTone: 'Frustrated',
		sentiment: 2.3,
		flag: 'Sarcasm Detected',
	},
	{
		id: 2,
		callId: '#3562-042',
		agent: 'Agent 8',
		transcriptTone: 'Professional',
		detectedTone: 'Angry',
		sentiment: 1.9,
		flag: 'Tone Mismatch',
	},
	{
		id: 3,
		callId: '#1923-156',
		agent: 'Agent 3',
		transcriptTone: 'Friendly',
		detectedTone: 'Neutral',
		sentiment: 3.1,
		flag: 'Minor Divergence',
	},
	{
		id: 4,
		callId: '#4581-089',
		agent: 'Agent 12',
		transcriptTone: 'Apologetic',
		detectedTone: 'Resigned',
		sentiment: 2.6,
		flag: 'Emotional Shift',
	},
];

export function PredictiveAndPrescriptive() {
	return (
		<Stack gap='md'>
			{/* Churn Risk Scoring Trend */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Churn Risk Scoring
					</Text>
					<Text size='sm' c='dimmed'>
						Overall churn risk trend across all customer interactions
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<ResponsiveContainer width='100%' height={300}>
						<LineChart data={mockChurnRiskTrendData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='period' />
							<YAxis domain={[0, 100]} />
							<Tooltip />
							<Legend />
							<ReferenceLine
								y={50}
								stroke='var(--mantine-color-orange-6)'
								strokeDasharray='5 5'
								label='Warning Threshold'
							/>
							<Line
								type='monotone'
								dataKey='churnRisk'
								stroke='var(--mantine-color-red-6)'
								strokeWidth={2}
								name='Churn Risk Score (%)'
								dot={{ r: 5 }}
								activeDot={{ r: 7 }}
							/>
						</LineChart>
					</ResponsiveContainer>
					<Group grow mt='md'>
						<div>
							<Text size='sm' c='dimmed'>
								Current Churn Risk
							</Text>
							<Text fw={600} size='lg'>
								45%
							</Text>
						</div>
						<div>
							<Text size='sm' c='dimmed'>
								Critical Customers
							</Text>
							<Text fw={600} size='lg'>
								3
							</Text>
						</div>
						<div>
							<Text size='sm' c='dimmed'>
								High Risk Customers
							</Text>
							<Text fw={600} size='lg'>
								6
							</Text>
						</div>
						<div>
							<Text size='sm' c='dimmed'>
								Trend
							</Text>
							<Badge color='green'>↓ Improving</Badge>
						</div>
					</Group>
				</Card.Section>
			</Card>

			{/* Optimal Response Timing */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Optimal Response Timing
					</Text>
					<Text size='sm' c='dimmed'>
						Suggest when to offer breaks, transfers, or escalations based on
						sentiment trajectory
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<Stack gap='sm'>
						{mockTimingRecommendations.map((rec) => (
							<div
								key={rec.id}
								style={{
									padding: '12px',
									backgroundColor: 'var(--mantine-color-gray-0)',
									borderRadius: '6px',
									borderLeft: `4px solid var(--mantine-color-blue-6)`,
								}}
							>
								<Group justify='space-between' mb='8px'>
									<div style={{ flex: 1 }}>
										<Text fw={500} size='sm'>
											{rec.scenario}
										</Text>
										<Text size='sm' c='dimmed' mt='4px'>
											→ {rec.recommendation}
										</Text>
									</div>
									<Group gap='xs'>
										<Badge size='sm' variant='light'>
											{rec.probability}% likely
										</Badge>
										<Badge
											color={rec.impact === 'High' ? 'orange' : 'blue'}
											size='sm'
										>
											{rec.impact} Impact
										</Badge>
									</Group>
								</Group>
								<Progress value={rec.probability} size='sm' />
							</div>
						))}
					</Stack>
				</Card.Section>
			</Card>

			{/* Keyword/Phrase Sentiment Association */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Keyword/Phrase Sentiment Association
					</Text>
					<Text size='sm' c='dimmed'>
						Identify which words/phrases customers react to emotionally
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					{/* inline-style-allow: */}
					<div style={{ overflowX: 'auto' }}>
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Phrase</Table.Th>
									<Table.Th>Sentiment Score</Table.Th>
									<Table.Th>Frequency</Table.Th>
									<Table.Th>Trend</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{mockKeywordSentimentData.map((item) => (
									<Table.Tr key={item.id}>
										<Table.Td>
											<Text fw={500} size='sm'>
												{item.phrase}
											</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												color={
													item.sentiment >= 4
														? 'green'
														: item.sentiment >= 3
															? 'gray'
															: 'red'
												}
											>
												{item.sentiment.toFixed(1)}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{item.frequency}</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												color={
													item.trend === '↑'
														? 'orange'
														: item.trend === '↓'
															? 'green'
															: 'gray'
												}
												variant='light'
											>
												{item.trend}
											</Badge>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
				</Card.Section>
			</Card>

			{/* Tone vs Words Mismatch Detection */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Tone vs. Words Mismatch Detection
					</Text>
					<Text size='sm' c='dimmed'>
						Flag calls where transcript and tone analysis diverge (sarcasm,
						frustration despite polite language)
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					{/* inline-style-allow: */}
					<div style={{ overflowX: 'auto' }}>
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Call ID</Table.Th>
									<Table.Th>Agent</Table.Th>
									<Table.Th>Transcript Tone</Table.Th>
									<Table.Th>Detected Tone</Table.Th>
									<Table.Th>Sentiment</Table.Th>
									<Table.Th>Alert</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{mockToneMismatchData.map((item) => (
									<Table.Tr key={item.id}>
										<Table.Td>
											<Text size='sm' fw={500}>
												{item.callId}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{item.agent}</Text>
										</Table.Td>
										<Table.Td>
											<Badge size='sm' variant='light'>
												{item.transcriptTone}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Badge size='sm' color='orange'>
												{item.detectedTone}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{item.sentiment}</Text>
										</Table.Td>
										<Table.Td>
											<Badge color='red' size='sm'>
												{item.flag}
											</Badge>
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

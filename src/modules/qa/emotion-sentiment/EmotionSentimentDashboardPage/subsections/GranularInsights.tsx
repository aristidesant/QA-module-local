import { Grid, Stack, Card, Text, Badge, Group, Progress } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockAgentSentiment = [
	{ name: 'Agent 1', positive: 65, neutral: 20, negative: 15 },
	{ name: 'Agent 2', positive: 58, neutral: 25, negative: 17 },
	{ name: 'Agent 3', positive: 72, neutral: 18, negative: 10 },
	{ name: 'Agent 4', positive: 55, neutral: 30, negative: 15 },
	{ name: 'Agent 5', positive: 68, neutral: 22, negative: 10 },
];

const mockCampaignSentiment = [
	{ name: 'Campaign A', positive: 62, neutral: 24, negative: 14 },
	{ name: 'Campaign B', positive: 59, neutral: 28, negative: 13 },
	{ name: 'Campaign C', positive: 70, neutral: 20, negative: 10 },
	{ name: 'Campaign D', positive: 56, neutral: 32, negative: 12 },
];

const mockEmotionKeywords = [
	{ emotion: 'Joy', keywords: ['happy', 'delighted', 'excellent', 'great'] },
	{ emotion: 'Frustration', keywords: ['annoyed', 'irritated', 'upset', 'disappointed'] },
	{ emotion: 'Empathy', keywords: ['understand', 'care', 'help', 'support'] },
	{ emotion: 'Concern', keywords: ['worried', 'concerned', 'anxious', 'uncertain'] },
];

const mockTopicBreakdown = [
	{ topic: 'Account Issues', percentage: 28 },
	{ topic: 'Billing Inquiry', percentage: 22 },
	{ topic: 'Product Features', percentage: 18 },
	{ topic: 'Technical Support', percentage: 16 },
	{ topic: 'General Inquiry', percentage: 16 },
];

export function GranularInsights() {

	return (
		<Stack gap='md'>
			{/* Sentiment by Agent */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Sentiment Distribution by Agent
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<ResponsiveContainer width='100%' height={300}>
						<BarChart data={mockAgentSentiment}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='name' />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey='positive' stackId='a' fill='var(--mantine-color-green-6)' />
							<Bar dataKey='neutral' stackId='a' fill='var(--mantine-color-gray-6)' />
							<Bar dataKey='negative' stackId='a' fill='var(--mantine-color-red-6)' />
						</BarChart>
					</ResponsiveContainer>
				</Card.Section>
			</Card>

			{/* Sentiment by Campaign */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Sentiment Comparison by Campaign
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<ResponsiveContainer width='100%' height={300}>
						<BarChart data={mockCampaignSentiment}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='name' />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey='positive' stackId='a' fill='var(--mantine-color-green-6)' />
							<Bar dataKey='neutral' stackId='a' fill='var(--mantine-color-gray-6)' />
							<Bar dataKey='negative' stackId='a' fill='var(--mantine-color-red-6)' />
						</BarChart>
					</ResponsiveContainer>
				</Card.Section>
			</Card>

			{/* Emotion Keywords */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Keywords by Emotion
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<Grid>
						{mockEmotionKeywords.map((item, idx) => (
							<Grid.Col key={idx} span={{ base: 12, sm: 6 }}>
								<div
									style={{
										padding: '12px',
										backgroundColor: 'var(--mantine-color-gray-0)',
										borderRadius: '6px',
										borderLeft: `4px solid var(--mantine-color-blue-6)`,
									}}
								>
									<Group mb='8px'>
										<Badge size='lg'>{item.emotion}</Badge>
										<Text size='xs' c='dimmed'>
											{item.keywords.length} keywords
										</Text>
									</Group>
									<Group gap='xs'>
										{item.keywords.map((kw, i) => (
											<Badge key={i} size='sm' variant='dot'>
												{kw}
											</Badge>
										))}
									</Group>
								</div>
							</Grid.Col>
						))}
					</Grid>
				</Card.Section>
			</Card>

			{/* Topic Analysis */}
			<Card withBorder radius='md' p='md'>
				<Card.Section withBorder inheritPadding py='md'>
					<Text fw={600} size='lg'>
						Conversation Topics
					</Text>
				</Card.Section>
				<Card.Section inheritPadding pb='md'>
					<Stack gap='md'>
						{mockTopicBreakdown.map((item, idx) => (
							<div key={idx}>
								<Group justify='space-between' mb={6}>
									<Text size='sm' fw={500}>
										{item.topic}
									</Text>
									<Badge size='sm'>{item.percentage}%</Badge>
								</Group>
								<Progress value={item.percentage} />
							</div>
						))}
					</Stack>
				</Card.Section>
			</Card>
		</Stack>
	);
}

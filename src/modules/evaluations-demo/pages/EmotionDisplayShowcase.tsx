import { Container, Grid, Stack, Text, Title } from '@mantine/core';
import EmotionDisplay from '../components/SentimentAnalysisView/components/EmotionDisplay';

type EmotionType = 'NEUTRAL' | 'JOY' | 'ANGER' | 'RAGE' | 'FRUSTRATION' | 'SADNESS' | 'FEAR' | 'SURPRISE';

const emotions: EmotionType[] = [
	'NEUTRAL',
	'JOY',
	'ANGER',
	'RAGE',
	'FRUSTRATION',
	'SADNESS',
	'FEAR',
	'SURPRISE',
];

export default function EmotionDisplayShowcase() {
	return (
		<Container size='xl' py='xl'>
			<Stack gap='xl'>
				<div>
					<Title order={1}>Emotion Display Component Showcase</Title>
					<Text c='dimmed'>
						All emotion variants and status states
					</Text>
				</div>

				{/* Idle States - Agent */}
				<div>
					<Title order={2} size='h4' mb='md'>
						Agent - Idle States (All Emotions)
					</Title>
					<Grid gap='md'>
						{emotions.map((emotion) => (
							<Grid.Col key={`agent-idle-${emotion}`} span={{ base: 12, sm: 6, md: 3 }}>
								<EmotionDisplay
									emotion={emotion}
									confidence={0.85}
									status='idle'
									type='agent'
								/>
							</Grid.Col>
						))}
					</Grid>
				</div>

				{/* Idle States - Customer */}
				<div>
					<Title order={2} size='h4' mb='md'>
						Customer - Idle States (All Emotions)
					</Title>
					<Grid gap='md'>
						{emotions.map((emotion) => (
							<Grid.Col key={`customer-idle-${emotion}`} span={{ base: 12, sm: 6, md: 3 }}>
								<EmotionDisplay
									emotion={emotion}
									confidence={0.92}
									status='idle'
									type='customer'
								/>
							</Grid.Col>
						))}
					</Grid>
				</div>

				{/* Loading States */}
				<div>
					<Title order={2} size='h4' mb='md'>
						Loading States (Agent & Customer)
					</Title>
					<Grid gap='md'>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Agent Loading
							</Text>
							<EmotionDisplay
								emotion='NEUTRAL'
								status='loading'
								type='agent'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Customer Loading
							</Text>
							<EmotionDisplay
								emotion='JOY'
								status='loading'
								type='customer'
							/>
						</Grid.Col>
					</Grid>
				</div>

				{/* Skeleton States */}
				<div>
					<Title order={2} size='h4' mb='md'>
						Skeleton States (Agent & Customer)
					</Title>
					<Grid gap='md'>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Agent Skeleton
							</Text>
							<EmotionDisplay
								emotion='NEUTRAL'
								status='skeleton'
								type='agent'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Customer Skeleton
							</Text>
							<EmotionDisplay
								emotion='JOY'
								status='skeleton'
								type='customer'
							/>
						</Grid.Col>
					</Grid>
				</div>

				{/* Error States */}
				<div>
					<Title order={2} size='h4' mb='md'>
						Error States (Agent & Customer)
					</Title>
					<Grid gap='md'>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Agent Error
							</Text>
							<EmotionDisplay
								emotion='NEUTRAL'
								status='error'
								type='agent'
								errorMessage='Failed to analyze sentiment'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Customer Error
							</Text>
							<EmotionDisplay
								emotion='JOY'
								status='error'
								type='customer'
								errorMessage='Unable to process audio'
							/>
						</Grid.Col>
					</Grid>
				</div>

				{/* Different Confidence Levels */}
				<div>
					<Title order={2} size='h4' mb='md'>
						Different Confidence Levels (Agent)
					</Title>
					<Grid gap='md'>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Low Confidence (40%)
							</Text>
							<EmotionDisplay
								emotion='NEUTRAL'
								confidence={0.4}
								status='idle'
								type='agent'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Medium Confidence (65%)
							</Text>
							<EmotionDisplay
								emotion='JOY'
								confidence={0.65}
								status='idle'
								type='agent'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								High Confidence (85%)
							</Text>
							<EmotionDisplay
								emotion='ANGER'
								confidence={0.85}
								status='idle'
								type='agent'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Text size='sm' c='dimmed' mb='xs'>
								Very High Confidence (98%)
							</Text>
							<EmotionDisplay
								emotion='SADNESS'
								confidence={0.98}
								status='idle'
								type='agent'
							/>
						</Grid.Col>
					</Grid>
				</div>
			</Stack>
		</Container>
	);
}

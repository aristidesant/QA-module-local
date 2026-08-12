import { Container, Grid, Stack, Text, Title, Divider, Group, Badge, Box } from '@mantine/core';
import EmotionDisplay from '../components/SentimentAnalysisView/components/EmotionDisplay';
import styles from './EmotionDisplayShowcase.module.css';

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

const emotionDescriptions: Record<EmotionType, string> = {
	NEUTRAL: 'Neutral tone, balanced sentiment',
	JOY: 'Positive, happy sentiment',
	ANGER: 'Frustrated or irritated tone',
	RAGE: 'Highly negative, aggressive tone',
	FRUSTRATION: 'Annoyed or exasperated tone',
	SADNESS: 'Nostalgic, sorrowful sentiment',
	FEAR: 'Anxious, worried sentiment',
	SURPRISE: 'Shocked or astonished tone',
};

export default function EmotionDisplayShowcase() {
	return (
		<Container size='lg' py={48} className={styles.container}>
			<Stack gap={40}>
				{/* Header */}
				<Stack gap={12}>
					<div>
						<Group gap='xs' mb={8}>
							<Badge variant='light' color='blue' size='lg'>
								Component Library
							</Badge>
						</Group>
						<Title order={1} className={styles.title}>
							Emotion Display Component
						</Title>
					</div>
					<Text size='lg' c='dimmed' maw={600}>
						Real-time emotion analysis visualization for agent and customer sentiment tracking. Supports multiple emotion types, confidence levels, and status states.
					</Text>
				</Stack>

				<Divider />

				{/* Idle States - All Emotions */}
				<Stack gap={20}>
					<div>
						<Title order={2} size='h3' mb={8} className={styles.sectionTitle}>
							Emotion Variants
						</Title>
						<Text size='sm' c='dimmed'>
							All 8 emotion types with typical confidence levels
						</Text>
					</div>

					{/* Agent Emotions */}
					<div>
						<Text size='sm' fw={600} c='dimmed' tt='uppercase' mb={12} className={styles.subsectionLabel}>
							Agent Perspective
						</Text>
						<Grid gap={16}>
							{emotions.map((emotion) => (
								<Grid.Col key={`agent-idle-${emotion}`} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
									<Stack gap={8}>
										<div>
											<Text size='sm' fw={600}>
												{emotion}
											</Text>
											<Text size='xs' c='dimmed'>
												{emotionDescriptions[emotion]}
											</Text>
										</div>
										<EmotionDisplay
											emotion={emotion}
											confidence={0.85}
											status='idle'
											type='agent'
										/>
									</Stack>
								</Grid.Col>
							))}
						</Grid>
					</div>

					{/* Customer Emotions */}
					<div>
						<Text size='sm' fw={600} c='dimmed' tt='uppercase' mb={12} className={styles.subsectionLabel}>
							Customer Perspective
						</Text>
						<Grid gap={16}>
							{emotions.map((emotion) => (
								<Grid.Col key={`customer-idle-${emotion}`} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
									<Stack gap={8}>
										<div>
											<Text size='sm' fw={600}>
												{emotion}
											</Text>
											<Text size='xs' c='dimmed'>
												{emotionDescriptions[emotion]}
											</Text>
										</div>
										<EmotionDisplay
											emotion={emotion}
											confidence={0.92}
											status='idle'
											type='customer'
										/>
									</Stack>
								</Grid.Col>
							))}
						</Grid>
					</div>
				</Stack>

				<Divider />

				{/* Status States */}
				<Stack gap={20}>
					<div>
						<Title order={2} size='h3' mb={8} className={styles.sectionTitle}>
							Status States
						</Title>
						<Text size='sm' c='dimmed'>
							Loading, skeleton, and error states for different lifecycle phases
						</Text>
					</div>

					{/* Loading State */}
					<Box>
						<Text size='sm' fw={600} c='dimmed' tt='uppercase' mb={12} className={styles.subsectionLabel}>
							Loading
						</Text>
						<Grid gap={16}>
							<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
								<Stack gap={8}>
									<Text size='sm' fw={600}>Agent Loading</Text>
									<EmotionDisplay
										emotion='NEUTRAL'
										status='loading'
										type='agent'
									/>
								</Stack>
							</Grid.Col>
							<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
								<Stack gap={8}>
									<Text size='sm' fw={600}>Customer Loading</Text>
									<EmotionDisplay
										emotion='JOY'
										status='loading'
										type='customer'
									/>
								</Stack>
							</Grid.Col>
						</Grid>
					</Box>

					{/* Skeleton State */}
					<Box>
						<Text size='sm' fw={600} c='dimmed' tt='uppercase' mb={12} className={styles.subsectionLabel}>
							Skeleton (Placeholder)
						</Text>
						<Grid gap={16}>
							<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
								<Stack gap={8}>
									<Text size='sm' fw={600}>Agent Skeleton</Text>
									<EmotionDisplay
										emotion='NEUTRAL'
										status='skeleton'
										type='agent'
									/>
								</Stack>
							</Grid.Col>
							<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
								<Stack gap={8}>
									<Text size='sm' fw={600}>Customer Skeleton</Text>
									<EmotionDisplay
										emotion='JOY'
										status='skeleton'
										type='customer'
									/>
								</Stack>
							</Grid.Col>
						</Grid>
					</Box>

					{/* Error State */}
					<Box>
						<Text size='sm' fw={600} c='dimmed' tt='uppercase' mb={12} className={styles.subsectionLabel}>
							Error
						</Text>
						<Grid gap={16}>
							<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
								<Stack gap={8}>
									<Text size='sm' fw={600}>Agent Error</Text>
									<EmotionDisplay
										emotion='NEUTRAL'
										status='error'
										type='agent'
										errorMessage='Failed to analyze sentiment. Please try again.'
									/>
								</Stack>
							</Grid.Col>
							<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
								<Stack gap={8}>
									<Text size='sm' fw={600}>Customer Error</Text>
									<EmotionDisplay
										emotion='JOY'
										status='error'
										type='customer'
										errorMessage='Unable to process audio. Invalid format.'
									/>
								</Stack>
							</Grid.Col>
						</Grid>
					</Box>
				</Stack>

				<Divider />

				{/* Confidence Levels */}
				<Stack gap={20}>
					<div>
						<Title order={2} size='h3' mb={8} className={styles.sectionTitle}>
							Confidence Levels
						</Title>
						<Text size='sm' c='dimmed'>
							Ring progress indicator shows analysis confidence from 0–100%
						</Text>
					</div>

					<Grid gap={16}>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Stack gap={8}>
								<Text size='sm' fw={600}>Very Low (25%)</Text>
								<EmotionDisplay
									emotion='NEUTRAL'
									confidence={0.25}
									status='idle'
									type='agent'
								/>
							</Stack>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Stack gap={8}>
								<Text size='sm' fw={600}>Low (45%)</Text>
								<EmotionDisplay
									emotion='JOY'
									confidence={0.45}
									status='idle'
									type='agent'
								/>
							</Stack>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Stack gap={8}>
								<Text size='sm' fw={600}>High (75%)</Text>
								<EmotionDisplay
									emotion='ANGER'
									confidence={0.75}
									status='idle'
									type='agent'
								/>
							</Stack>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Stack gap={8}>
								<Text size='sm' fw={600}>Very High (95%)</Text>
								<EmotionDisplay
									emotion='SADNESS'
									confidence={0.95}
									status='idle'
									type='agent'
								/>
							</Stack>
						</Grid.Col>
					</Grid>
				</Stack>

				<Divider />

				{/* API Documentation */}
				<Stack gap={20}>
					<Title order={2} size='h3' className={styles.sectionTitle}>
						Component Props
					</Title>
					<Box className={styles.docsBox}>
						<Stack gap={12} size='sm'>
							<div>
								<Text size='sm' fw={600} ff='monospace'>emotion?: EmotionType</Text>
								<Text size='xs' c='dimmed'>
									One of: NEUTRAL | JOY | ANGER | RAGE | FRUSTRATION | SADNESS | FEAR | SURPRISE
								</Text>
							</div>
							<div>
								<Text size='sm' fw={600} ff='monospace'>confidence?: number</Text>
								<Text size='xs' c='dimmed'>
									Decimal value from 0 to 1 (0% to 100%). Default: 0.85
								</Text>
							</div>
							<div>
								<Text size='sm' fw={600} ff='monospace'>status?: 'idle' | 'loading' | 'error' | 'skeleton'</Text>
								<Text size='xs' c='dimmed'>
									Current state of the component. Default: 'idle'
								</Text>
							</div>
							<div>
								<Text size='sm' fw={600} ff='monospace'>type?: 'agent' | 'customer'</Text>
								<Text size='xs' c='dimmed'>
									Who the emotion is from. Default: 'agent'
								</Text>
							</div>
							<div>
								<Text size='sm' fw={600} ff='monospace'>errorMessage?: string</Text>
								<Text size='xs' c='dimmed'>
									Custom error message for error state. Default: 'Failed to analyze emotion'
								</Text>
							</div>
						</Stack>
					</Box>
				</Stack>
			</Stack>
		</Container>
	);
}

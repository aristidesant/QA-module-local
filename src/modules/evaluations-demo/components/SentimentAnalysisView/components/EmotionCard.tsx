import { Card, Group, Stack, Text, ThemeIcon, Progress } from '@mantine/core';
import { IconUser, IconUsers } from '@tabler/icons-react';
import styles from './EmotionCard.module.css';

interface EmotionCardProps {
	emotion: string;
	confidence: number;
	type: 'agent' | 'customer';
}

const EMOTION_COLORS: Record<string, string> = {
	NEUTRAL: '#748CFF',
	FRUSTRATION: '#FF6B6B',
	SATISFACTION: '#51CF66',
	ANGER: '#FA5252',
	JOY: '#FFD43B',
	SADNESS: '#4C6EF5',
	FEAR: '#9C36B5',
	SURPRISE: '#FF922B',
};

export default function EmotionCard({
	emotion,
	confidence,
	type,
}: EmotionCardProps) {
	const color = EMOTION_COLORS[emotion] || '#748CFF';
	const confidencePercent = Math.round(confidence * 100);
	const label = type === 'agent' ? 'Agent Emotion' : 'Customer Emotion';

	return (
		<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
			<Stack gap='md'>
				<Group justify='space-between' align='center'>
					<Group gap='sm'>
						<ThemeIcon
							size='lg'
							radius='md'
							style={{ backgroundColor: color }}
						>
							{type === 'agent' ? (
								<IconUser size={20} color='white' />
							) : (
								<IconUsers size={20} color='white' />
							)}
						</ThemeIcon>
						<div>
							<Text size='sm' fw={500} c='dimmed'>
								{label}
							</Text>
							<Text size='lg' fw={700}>
								{emotion}
							</Text>
						</div>
					</Group>
				</Group>

				<div>
					<Group justify='space-between' mb='xs'>
						<Text size='xs' fw={500}>
							Confidence
						</Text>
						<Text size='xs' fw={600} c='dimmed'>
							{confidencePercent}%
						</Text>
					</Group>
					<Progress value={confidencePercent} color={color} size='md' />
				</div>
			</Stack>
		</Card>
	);
}

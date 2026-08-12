import { Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import {
	IconHeadphones,
	IconPhone,
	IconMoodSmile,
	IconMoodWink,
	IconMoodAngry,
	IconMoodHappy,
	IconMoodCry,
	IconMoodNervous,
	IconMoodSurprised,
} from '@tabler/icons-react';
import styles from './EmotionCard.module.css';

interface EmotionCardProps {
	emotion: string;
	confidence: number;
	type: 'agent' | 'customer';
}

const EMOTION_ICONS: Record<string, React.ReactNode> = {
	NEUTRAL: <IconMoodSmile size={24} />,
	FRUSTRATION: <IconMoodWink size={24} />,
	SATISFACTION: <IconMoodHappy size={24} />,
	ANGER: <IconMoodAngry size={24} />,
	JOY: <IconMoodHappy size={24} />,
	SADNESS: <IconMoodCry size={24} />,
	FEAR: <IconMoodNervous size={24} />,
	SURPRISE: <IconMoodSurprised size={24} />,
};

export default function EmotionCard({
	emotion,
	confidence,
	type,
}: EmotionCardProps) {
	const confidencePercent = Math.round(confidence * 100);
	const label = type === 'agent' ? 'Agent' : 'Customer';
	const userIcon =
		type === 'agent' ? (
			<IconHeadphones size={16} color='currentColor' />
		) : (
			<IconPhone size={16} color='currentColor' />
		);
	const emotionIcon = EMOTION_ICONS[emotion] || EMOTION_ICONS.NEUTRAL;

	return (
		<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
			<Stack gap='md' h='100%'>
				{/* Header: User Type Tag */}
				<Group gap='xs' align='center'>
					<ThemeIcon
						size='sm'
						radius='md'
						variant='light'
						color='gray'
					>
						{userIcon}
					</ThemeIcon>
					<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
						{label}
					</Text>
				</Group>

				{/* Main: Emotion Display (Emphasized) */}
				<Group justify='center' align='center' gap='md' grow>
					<div style={{ textAlign: 'center' }}>
						<ThemeIcon size='4rem' variant='light' radius='md' mx='auto' mb='md'>
							{emotionIcon}
						</ThemeIcon>
						<Text size='lg' fw={700}>
							{emotion}
						</Text>
					</div>
				</Group>

				{/* Footer: Confidence */}
				<Group justify='center' gap='xs' mt='auto'>
					<Text size='xs' fw={500} c='dimmed'>
						Confidence
					</Text>
					<Text size='sm' fw={700}>
						{confidencePercent}%
					</Text>
				</Group>
			</Stack>
		</Card>
	);
}

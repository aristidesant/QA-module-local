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
	const userIconColor = type === 'agent' ? '#4C6EF5' : '#51CF66';
	const userIcon =
		type === 'agent' ? (
			<IconHeadphones size={20} color='white' />
		) : (
			<IconPhone size={20} color='white' />
		);
	const emotionIcon = EMOTION_ICONS[emotion] || EMOTION_ICONS.NEUTRAL;

	return (
		<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='md' align='flex-start'>
						<ThemeIcon
							size='lg'
							radius='md'
							style={{ backgroundColor: userIconColor }}
						>
							{userIcon}
						</ThemeIcon>
						<div>
							<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
								{label}
							</Text>
							<Text size='sm' fw={700}>
								{emotion}
							</Text>
						</div>
					</Group>
					<ThemeIcon size='xl' variant='light' radius='md'>
						{emotionIcon}
					</ThemeIcon>
				</Group>

				<Group justify='space-between' align='center'>
					<Text size='xs' fw={500} c='dimmed'>
						Confidence
					</Text>
					<Text size='md' fw={700}>
						{confidencePercent}%
					</Text>
				</Group>
			</Stack>
		</Card>
	);
}

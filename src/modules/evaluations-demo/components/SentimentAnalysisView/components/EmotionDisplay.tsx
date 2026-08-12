import { Card, Stack, Text, ThemeIcon, Skeleton, Alert, Group, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import {
	IconMoodSmile,
	IconMoodHappy,
	IconMoodAngry,
	IconMoodCry,
	IconMoodNervous,
	IconMoodSurprised,
} from '@tabler/icons-react';
import styles from './EmotionDisplay.module.css';

type EmotionType = 'NEUTRAL' | 'JOY' | 'ANGER' | 'RAGE' | 'FRUSTRATION' | 'SADNESS' | 'FEAR' | 'SURPRISE';
type Status = 'idle' | 'loading' | 'error' | 'skeleton';

interface EmotionDisplayProps {
	emotion?: EmotionType;
	confidence?: number;
	status?: Status;
	type?: 'agent' | 'customer';
	errorMessage?: string;
}

const EMOTION_COLORS: Record<EmotionType, string> = {
	NEUTRAL: '#748CFF',      // Purple
	JOY: '#FFD43B',          // Yellow
	ANGER: '#FA5252',        // Dark Red
	RAGE: '#C41E3A',         // Deep Red
	FRUSTRATION: '#FF6B6B',  // Red
	SADNESS: '#4C6EF5',      // Blue
	FEAR: '#9C36B5',         // Purple
	SURPRISE: '#FF922B',     // Orange
};

const EMOTION_ICONS: Record<EmotionType, React.ReactNode> = {
	NEUTRAL: <IconMoodSmile size={24} />,
	JOY: <IconMoodHappy size={24} />,
	ANGER: <IconMoodAngry size={24} />,
	RAGE: <IconMoodAngry size={24} />,
	FRUSTRATION: <IconMoodCry size={24} />,
	SADNESS: <IconMoodCry size={24} />,
	FEAR: <IconMoodNervous size={24} />,
	SURPRISE: <IconMoodSurprised size={24} />,
};

export default function EmotionDisplay({
	emotion = 'NEUTRAL',
	confidence = 0.85,
	status = 'idle',
	type = 'agent',
	errorMessage = 'Failed to analyze emotion',
}: EmotionDisplayProps) {
	const emotionColor = EMOTION_COLORS[emotion];
	const emotionIcon = EMOTION_ICONS[emotion];
	const confidencePercent = Math.round((confidence || 0) * 100);
	const label = type === 'agent' ? 'Agent' : 'Customer';

	// Skeleton State
	if (status === 'skeleton') {
		return (
			<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
				<Stack gap='md' h='100%'>
					<Group gap='xs' align='center'>
						<Skeleton height={32} width={32} radius='md' />
						<Skeleton height={14} width={60} />
					</Group>

					<Group justify='center' align='center' gap='md' grow>
						<div style={{ textAlign: 'center' }}>
							<Skeleton height={64} width={64} radius='md' mx='auto' mb='md' circle />
							<Skeleton height={20} width={100} mx='auto' />
						</div>
					</Group>

					<Group justify='center' gap='xs' mt='auto'>
						<Skeleton height={14} width={80} />
					</Group>
				</Stack>
			</Card>
		);
	}

	// Error State
	if (status === 'error') {
		return (
			<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
				<Stack gap='md'>
					<Alert icon={<IconAlertCircle size={16} />} title='Error' color='red'>
						{errorMessage}
					</Alert>
					<Group gap='xs' align='center'>
						<ThemeIcon size='sm' radius='md' variant='light' color='gray'>
							<span>!</span>
						</ThemeIcon>
						<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
							{label}
						</Text>
					</Group>
					<Text size='sm' c='dimmed' ta='center'>
						Unable to determine emotion
					</Text>
				</Stack>
			</Card>
		);
	}

	// Loading State
	if (status === 'loading') {
		return (
			<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
				<Stack gap='md' h='100%' align='center' justify='center'>
					<Group gap='xs' align='center'>
						<ThemeIcon size='sm' radius='md' variant='light' color='gray'>
							<span>⏳</span>
						</ThemeIcon>
						<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
							{label}
						</Text>
					</Group>

					<Group justify='center' align='center' gap='md' grow>
						<div style={{ textAlign: 'center' }}>
							<Loader size='lg' mb='md' />
							<Text size='sm' c='dimmed'>
								Analyzing emotion...
							</Text>
						</div>
					</Group>
				</Stack>
			</Card>
		);
	}

	// Idle State (Default)
	return (
		<Card shadow='sm' p='lg' radius='md' withBorder className={styles.card}>
			<Stack gap='md' h='100%'>
				{/* Header: User Type Tag */}
				<Group gap='xs' align='center'>
					<ThemeIcon size='sm' radius='md' variant='light' color='gray'>
						<span>{type === 'agent' ? '🎧' : '📞'}</span>
					</ThemeIcon>
					<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
						{label}
					</Text>
				</Group>

				{/* Main: Emotion Display (Emphasized) */}
				<Group justify='center' align='center' gap='md' grow>
					<div style={{ textAlign: 'center' }}>
						<ThemeIcon
							size='4rem'
							radius='md'
							mx='auto'
							mb='md'
							style={{ backgroundColor: emotionColor }}
						>
							<div style={{ color: 'white' }}>
								{emotionIcon}
							</div>
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

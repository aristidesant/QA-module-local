import { Card, Stack, Text, ThemeIcon, Skeleton, Alert, Group, Loader, Center, Badge } from '@mantine/core';
import { IconAlertCircle, IconHeadphones, IconPhone } from '@tabler/icons-react';
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
	NEUTRAL: '#868E96',      // Gray
	JOY: '#FFD43B',          // Yellow
	ANGER: '#FA5252',        // Dark Red
	RAGE: '#C41E3A',         // Deep Red
	FRUSTRATION: '#FF6B6B',  // Red
	SADNESS: '#9B8BA8',      // Dusty Mauve (nostalgic)
	FEAR: '#36313D',         // Dark Charcoal (near black)
	SURPRISE: '#FF922B',     // Orange
};

const EMOTION_ICONS: Record<EmotionType, React.ReactNode> = {
	NEUTRAL: <IconMoodSmile size={32} stroke={1.5} />,
	JOY: <IconMoodHappy size={32} stroke={1.5} />,
	ANGER: <IconMoodAngry size={32} stroke={1.5} />,
	RAGE: <IconMoodAngry size={32} stroke={1.5} />,
	FRUSTRATION: <IconMoodCry size={32} stroke={1.5} />,
	SADNESS: <IconMoodCry size={32} stroke={1.5} />,
	FEAR: <IconMoodNervous size={32} stroke={1.5} />,
	SURPRISE: <IconMoodSurprised size={32} stroke={1.5} />,
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
			<Card shadow='sm' p={24} radius={12} withBorder className={styles.card}>
				<Stack gap={20} h='100%'>
					<Group justify='space-between' align='center'>
						<Skeleton height={28} width={100} radius='sm' />
						<Skeleton height={14} width={60} radius='sm' />
					</Group>

					<Center>
						<Stack gap={12} align='center'>
							<Skeleton height={120} width={120} circle />
							<Skeleton height={24} width={140} radius='sm' />
						</Stack>
					</Center>

					<Group justify='center' gap='sm' mt='auto'>
						<Skeleton height={80} width={80} circle />
					</Group>
				</Stack>
			</Card>
		);
	}

	// Error State
	if (status === 'error') {
		return (
			<Card shadow='sm' p={24} radius={12} withBorder className={styles.card}>
				<Stack gap={16}>
					<Badge
						variant='light'
						color='gray'
						size='sm'
						leftSection={
							type === 'agent' ? (
								<IconHeadphones size={14} style={{ marginRight: 4 }} />
							) : (
								<IconPhone size={14} style={{ marginRight: 4 }} />
							)
						}
					>
						{label}
					</Badge>

					<Alert
						icon={<IconAlertCircle size={18} />}
						title='Analysis Failed'
						color='red'
						variant='light'
						className={styles.alert}
					>
						{errorMessage}
					</Alert>
					<Text size='xs' c='dimmed' ta='center' fw={500}>
						Unable to determine emotion from audio
					</Text>
				</Stack>
			</Card>
		);
	}

	// Loading State
	if (status === 'loading') {
		return (
			<Card shadow='sm' p={24} radius={12} withBorder className={styles.card}>
				<Stack gap={20} h='100%' align='center' justify='center'>
					<Badge
						variant='light'
						color='gray'
						size='sm'
						leftSection={
							type === 'agent' ? (
								<IconHeadphones size={14} style={{ marginRight: 4 }} />
							) : (
								<IconPhone size={14} style={{ marginRight: 4 }} />
							)
						}
					>
						{label}
					</Badge>

					<Stack gap='lg' align='center'>
						<Loader size='lg' color='#1BB54A' />
						<Stack gap={4} align='center'>
							<Text size='sm' fw={600}>
								Analyzing emotion
							</Text>
							<Text size='xs' c='dimmed'>
								Processing audio...
							</Text>
						</Stack>
					</Stack>
				</Stack>
			</Card>
		);
	}

	// Idle State (Default)
	return (
		<Card shadow='sm' p={24} radius={12} withBorder className={styles.card}>
			<Stack gap={20} h='100%'>
				{/* Header: Subtle User Type Badge */}
				<Badge
					variant='light'
					color='gray'
					leftSection={
						type === 'agent' ? (
							<IconHeadphones size={14} style={{ marginRight: 6 }} />
						) : (
							<IconPhone size={14} style={{ marginRight: 6 }} />
						)
					}
					className={styles.typeBadge}
				>
					{label}
				</Badge>

				{/* Main: Emotion Display (Hero) */}
				<Center>
					<Stack gap={0} align='center'>
						<div
							className={styles.emotionIconContainer}
							style={{ backgroundColor: emotionColor }}
						>
							<div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
								{emotionIcon}
							</div>
						</div>
						<Text size='xl' fw={700} mt='lg' className={styles.emotionLabel}>
							{emotion}
						</Text>
					</Stack>
				</Center>

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

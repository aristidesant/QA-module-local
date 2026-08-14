import { Stack, Text, Group, Tooltip } from '@mantine/core';
import type { EmotionDistribution, Emotion } from '../types';
import styles from './EmotionDistributionCard.module.css';

const EMOTION_COLORS: Record<Emotion, string> = {
	satisfaction: 'var(--mantine-color-green-6)',
	frustration: 'var(--mantine-color-orange-6)',
	anger: 'var(--mantine-color-red-6)',
	neutral: 'var(--mantine-color-gray-6)',
	excitement: 'var(--mantine-color-yellow-6)',
	sadness: 'var(--mantine-color-blue-6)',
};

interface EmotionDistributionCardProps {
	distribution: EmotionDistribution[];
}

export default function EmotionDistributionCard({
	distribution,
}: EmotionDistributionCardProps) {
	return (
		<Stack gap='md' className={styles.container}>
			<Text fw={600} size='sm'>
				Emotion Distribution
			</Text>

			{/* Horizontal segmented bar */}
			<div className={styles.barContainer}>
				{distribution.map((item) => (
					<Tooltip
						key={item.emotion}
						label={`${item.emotion}: ${item.percentage}%`}
					>
						<div
							className={styles.segment}
							// inline-style-allow: emotion segment width and color
							style={{
								width: `${item.percentage}%`,
								backgroundColor: EMOTION_COLORS[item.emotion],
							}}
						/>
					</Tooltip>
				))}
			</div>

			{/* Legend below bar */}
			<div className={styles.legend}>
				{distribution.map((item) => (
					<Group key={item.emotion} gap='xs' className={styles.legendItem}>
						<div
							className={styles.legendDot}
							// inline-style-allow: emotion legend dot background color
							style={{
								backgroundColor: EMOTION_COLORS[item.emotion],
							}}
						/>
						<Text size='xs' fw={500} className={styles.legendLabel}>
							{item.emotion}
						</Text>
						<Text size='xs' c='dimmed'>
							{item.percentage}%
						</Text>
					</Group>
				))}
			</div>
		</Stack>
	);
}

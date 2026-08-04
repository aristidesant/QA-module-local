import { Stack, Text } from '@mantine/core';
import type { EmotionDistribution, Emotion } from '../types';
import styles from './EmotionDistributionCard.module.css';

const EMOTION_COLORS: Record<Emotion, string> = {
	satisfaction: '#51cf66',
	frustration: '#ff922b',
	anger: '#ff6b6b',
	neutral: '#909090',
	excitement: '#ffd60a',
	sadness: '#748ffc',
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

			<div className={styles.grid}>
				{distribution.map((item) => (
					<div key={item.emotion} className={styles.stat}>
						{/* inline-style-allow: emotion dot background color */}
						<div
							className={styles.dot}
							style={{
								backgroundColor: EMOTION_COLORS[item.emotion],
							}}
						/>
						<Text size='xs' fw={600} className={styles.label}>
							{item.emotion}
						</Text>
						<Text size='xs' c='dimmed' className={styles.percentage}>
							{item.percentage}%
						</Text>
					</div>
				))}
			</div>
		</Stack>
	);
}

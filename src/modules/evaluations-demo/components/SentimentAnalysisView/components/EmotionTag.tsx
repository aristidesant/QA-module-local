import React from 'react';
import type { Emotion } from '../types';
import styles from './EmotionTag.module.css';

const EMOTION_CONFIG: Record<
	Emotion,
	{ label: string; emoji: string; color: string }
> = {
	satisfaction: {
		label: 'Satisfaction',
		emoji: '😊',
		color: 'var(--mantine-color-green-6)',
	},
	frustration: {
		label: 'Frustration',
		emoji: '😤',
		color: 'var(--mantine-color-orange-6)',
	},
	anger: {
		label: 'Anger',
		emoji: '😠',
		color: 'var(--mantine-color-red-6)',
	},
	neutral: {
		label: 'Neutral',
		emoji: '😐',
		color: 'var(--mantine-color-gray-6)',
	},
	excitement: {
		label: 'Excitement',
		emoji: '🎉',
		color: 'var(--mantine-color-yellow-6)',
	},
	sadness: {
		label: 'Sadness',
		emoji: '😢',
		color: 'var(--mantine-color-indigo-6)',
	},
};

interface EmotionTagProps {
	emotion: Emotion;
	intensity?: number;
}

export default function EmotionTag({
	emotion,
	intensity = 100,
}: EmotionTagProps) {
	const config = EMOTION_CONFIG[emotion];
	const opacity = intensity / 100;

	return (
		<div
			className={styles.tag}
			// inline-style-allow: CSS variable styling for emotion colors
			style={
				{
					'--emotion-color': config.color,
					'--emotion-opacity': opacity,
				} as React.CSSProperties
			}
		>
			<span className={styles.emoji}>{config.emoji}</span>
			<span className={styles.label}>{config.label}</span>
		</div>
	);
}

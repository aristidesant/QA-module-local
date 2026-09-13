import type { ReactNode } from 'react';
import { RingProgress, Text } from '@mantine/core';
import { getScoreColor } from '../helpers';

interface ScoreRingProps {
	value: number;
	max?: number;
	size?: number;
	thickness?: number;
	label?: ReactNode;
	color?: string;
}

export function ScoreRing({ value, max = 100, size = 120, thickness = 12, label, color }: ScoreRingProps) {
	const pct = (value / max) * 100;
	const ringColor = color ?? getScoreColor(pct);

	return (
		<RingProgress
			size={size}
			thickness={thickness}
			roundCaps
			sections={[{ value: pct, color: ringColor }]}
			label={
				<Text fw={700} size='xl' ta='center'>
					{label ?? value}
				</Text>
			}
		/>
	);
}

import type { ReactNode } from 'react';
import { Text, Progress } from '@mantine/core';
import {
	IconAdjustments,
	IconSpeedboat,
	IconVectorTriangle,
	IconWaveSine,
} from '@tabler/icons-react';
import styles from './AgentVoiceProgress.module.css';

type AgentVoiceProgressProps = {
	stability: number;
	speed: number;
	similarityBoost: number;
	optimizeLatency: number;
};

type VoiceMetric = {
	key: string;
	label: string;
	status: string;
	value: number;
	icon: ReactNode;
	hint: string;
};

const clamp = (value: number, min = 0, max = 100) =>
	Math.min(Math.max(value, min), max);

export const AgentVoiceProgress: React.FC<AgentVoiceProgressProps> = ({
	stability,
	speed,
	similarityBoost,
	optimizeLatency,
}) => {
	const streamingLatencyProgress = clamp((optimizeLatency / 4) * 100);
	const stabilityProgress = clamp(stability * 100);
	const speedProgress = clamp(((speed - 0.5) / 1.5) * 100);
	const similarityBoostProgress = clamp(similarityBoost * 100);

	const metrics: VoiceMetric[] = [
		{
			key: 'latency',
			label: 'Latency Tuning',
			status:
				optimizeLatency >= 3
					? 'Balanced'
					: optimizeLatency >= 2
						? 'Medium'
						: 'Low',
			value: streamingLatencyProgress,
			icon: <IconWaveSine size={16} />, // streaming icon
			hint: 'Controls streaming responsiveness',
		},
		{
			key: 'stability',
			label: 'Stability',
			status:
				stability >= 0.7 ? 'Balanced' : stability >= 0.4 ? 'Medium' : 'Low',
			value: stabilityProgress,
			icon: <IconVectorTriangle size={16} />,
			hint: 'Keeps voice tone consistent',
		},
		{
			key: 'speed',
			label: 'Delivery Speed',
			status: speed >= 1.1 ? 'Fast' : speed >= 0.9 ? 'Normal' : 'Slow',
			value: speedProgress,
			icon: <IconSpeedboat size={16} />,
			hint: 'Adjusts speaking tempo',
		},
		{
			key: 'similarity',
			label: 'Similarity Boost',
			status:
				similarityBoost >= 0.8
					? 'High'
					: similarityBoost >= 0.5
						? 'Medium'
						: 'Low',
			value: similarityBoostProgress,
			icon: <IconAdjustments size={16} />,
			hint: 'Blends with the original voice print',
		},
	];

	return (
		<div className={styles.wrapper}>
			{metrics.map((metric) => (
				<div key={metric.key} className={styles.metricRow}>
					<div className={styles.metricHeader}>
						<span className={styles.metricIcon}>{metric.icon}</span>
						<div className={styles.metricCopy}>
							<Text className={styles.metricLabel}>{metric.label}</Text>
							<Text className={styles.metricHint}>{metric.hint}</Text>
						</div>
						<Text className={styles.metricStatus}>{metric.status}</Text>
					</div>
					<Progress
						value={metric.value}
						size='sm'
						radius='xl'
						className={styles.metricProgress}
					/>
				</div>
			))}
		</div>
	);
};

export default AgentVoiceProgress;

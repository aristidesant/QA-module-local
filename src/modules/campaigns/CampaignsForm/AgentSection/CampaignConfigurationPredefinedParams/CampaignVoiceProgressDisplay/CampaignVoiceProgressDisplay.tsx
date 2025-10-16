import type { ReactNode } from 'react';
import { Text, Progress } from '@mantine/core';
import {
	IconAdjustments,
	IconFlame,
	IconSpeedboat,
	IconVectorTriangle,
	IconWaveSine,
} from '@tabler/icons-react';
import styles from './CampaignVoiceProgressDisplay.module.css';

type CampaignVoiceProgressDisplayProps = {
	stability?: number;
	speed?: number;
	similarityBoost?: number;
	optimizeLatency?: number;
	temperature?: number;
};

type VoiceMetric = {
	key: string;
	label: string;
	status: string;
	value: number;
	icon: ReactNode;
	hint: string;
};

const clamp = (value: number | undefined, min = 0, max = 100) => {
	if (value === undefined || value === null) return 0;
	return Math.min(Math.max(value, min), max);
};

export const CampaignVoiceProgressDisplay: React.FC<
	CampaignVoiceProgressDisplayProps
> = ({
	stability = 0,
	speed = 1,
	similarityBoost = 0,
	optimizeLatency = 0,
	temperature = 0,
}) => {
	const streamingLatencyProgress = clamp((optimizeLatency / 4) * 100);
	const stabilityProgress = clamp(stability * 100);
	const speedProgress = clamp(((speed - 0.5) / 1.5) * 100);
	const similarityBoostProgress = clamp(similarityBoost * 100);
	const temperatureProgress = clamp((temperature / 2) * 100);

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
			icon: <IconWaveSine size={16} />,
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
		{
			key: 'temperature',
			label: 'Temperature',
			status:
				temperature >= 1.5 ? 'High' : temperature >= 0.8 ? 'Medium' : 'Low',
			value: temperatureProgress,
			icon: <IconFlame size={16} />,
			hint: 'Controls voice creativity and variation',
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

export default CampaignVoiceProgressDisplay;

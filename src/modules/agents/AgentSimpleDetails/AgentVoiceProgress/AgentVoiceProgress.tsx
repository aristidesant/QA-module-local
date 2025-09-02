import React from 'react';
import { Progress, Stack, Group, Text, Tooltip } from '@mantine/core';
import {
	IconWaveSine,
	IconAdjustments,
	IconSpeedboat,
	IconVectorTriangle,
} from '@tabler/icons-react';
import styles from './AgentVoiceProgress.module.css';

type AgentVoiceProgressProps = {
	stability: number;
	speed: number;
	similarityBoost: number;
	optimizeLatency: number;
};

export const AgentVoiceProgress: React.FC<AgentVoiceProgressProps> = ({
	stability,
	speed,
	similarityBoost,
	optimizeLatency,
}) => {
	// Calculate progress values
	const streamingLatencyProgress = (optimizeLatency / 4) * 100;
	const stabilityProgress = stability * 100;
	const speedProgress = ((speed - 0.5) / 1.5) * 100; // Normalize speed from 0.5-2.0 range
	const similarityBoostProgress = similarityBoost * 100;

	// Get status labels
	const getStreamingLatencyLabel = (value: number) => {
		if (value >= 3) return 'Balanced';
		if (value >= 2) return 'Medium';
		return 'Low';
	};

	const getStabilityLabel = (value: number) => {
		if (value >= 0.7) return 'Balanced';
		if (value >= 0.4) return 'Medium';
		return 'Low';
	};

	const getSpeedLabel = (value: number) => {
		if (value >= 1.1) return 'Fast';
		if (value >= 0.9) return 'Normal';
		return 'Slow';
	};

	const getSimilarityBoostLabel = (value: number) => {
		if (value >= 0.8) return 'Normal';
		if (value >= 0.5) return 'Medium';
		return 'Low';
	};

	return (
		<Stack gap='xs' className={styles.progressContainer}>
			{/* Streaming Latency */}
			<Tooltip label={`${optimizeLatency}`} withArrow position='left'>
				<div className={styles.progressCard}>
					<Group justify='space-between' align='center' mb={6}>
						<Group gap='xs' align='center'>
							<IconWaveSine size={18} className={styles.progressIcon} />
							<Text size='sm' fw={500} className={styles.progressLabel}>
								Streaming Latency
							</Text>
						</Group>
						<Text
							size='sm'
							c='dimmed'
							fw={500}
							className={styles.progressValue}
						>
							{getStreamingLatencyLabel(optimizeLatency)}
						</Text>
					</Group>
					<Progress
						value={streamingLatencyProgress}
						size='md'
						radius='sm'
						className={styles.progressBar}
					/>
				</div>
			</Tooltip>

			{/* Stability */}
			<Tooltip label={`${stability}`} withArrow position='left'>
				<div className={styles.progressCard}>
					<Group justify='space-between' align='center' mb={6}>
						<Group gap='xs' align='center'>
							<IconVectorTriangle size={18} className={styles.progressIcon} />
							<Text size='sm' fw={500} className={styles.progressLabel}>
								Stability
							</Text>
						</Group>
						<Text
							size='sm'
							c='dimmed'
							fw={500}
							className={styles.progressValue}
						>
							{getStabilityLabel(stability)}
						</Text>
					</Group>
					<Progress
						value={stabilityProgress}
						size='md'
						radius='sm'
						className={styles.progressBar}
					/>
				</div>
			</Tooltip>

			{/* Speed */}
			<Tooltip label={`${speed}`} withArrow position='left'>
				<div className={styles.progressCard}>
					<Group justify='space-between' align='center' mb={6}>
						<Group gap='xs' align='center'>
							<IconSpeedboat size={18} className={styles.progressIcon} />
							<Text size='sm' fw={500} className={styles.progressLabel}>
								Speed
							</Text>
						</Group>
						<Text
							size='sm'
							c='dimmed'
							fw={500}
							className={styles.progressValue}
						>
							{getSpeedLabel(speed)}
						</Text>
					</Group>
					<Progress
						value={speedProgress}
						size='md'
						radius='sm'
						className={styles.progressBar}
					/>
				</div>
			</Tooltip>

			{/* Similarity Boost */}
			<Tooltip label={`${similarityBoost}`} withArrow position='left'>
				<div className={styles.progressCard}>
					<Group justify='space-between' align='center' mb={6}>
						<Group gap='xs' align='center'>
							<IconAdjustments size={18} className={styles.progressIcon} />
							<Text size='sm' fw={500} className={styles.progressLabel}>
								Similarity Boost
							</Text>
						</Group>
						<Text
							size='sm'
							c='dimmed'
							fw={500}
							className={styles.progressValue}
						>
							{getSimilarityBoostLabel(similarityBoost)}
						</Text>
					</Group>
					<Progress
						value={similarityBoostProgress}
						size='md'
						radius='sm'
						className={styles.progressBar}
					/>
				</div>
			</Tooltip>
		</Stack>
	);
};

export default AgentVoiceProgress;

import { Group, Stack, Text, Badge } from '@mantine/core';
import { IconPhone, IconVolumeOff, IconClock } from '@tabler/icons-react';
import type { SpeechMetrics } from '../types';
import styles from './SpeechPatternsCard.module.css';

interface SpeechPatternsCardProps {
	metrics: SpeechMetrics;
}

export default function SpeechPatternsCard({
	metrics,
}: SpeechPatternsCardProps) {
	const agentTalkPercent = metrics.talkTimeRatio.agent;
	const customerTalkPercent = metrics.talkTimeRatio.customer;

	const getLatencyColor = (delaySeconds: number): string => {
		if (delaySeconds < 2) return 'green';
		if (delaySeconds < 3) return 'yellow';
		return 'red';
	};

	return (
		<Stack gap='lg' className={styles.container}>
			<Text fw={600} size='sm'>
				Speech Patterns
			</Text>

			{/* Metrics Grid */}
			<div className={styles.metricsGrid}>
				<div className={styles.metricCard}>
					<Group gap='xs' mb='xs'>
						<IconPhone size={16} color='var(--mantine-color-blue-6)' />
						<Text size='xs' fw={500} c='dimmed'>
							Avg Agent Response
						</Text>
					</Group>
					<Group justify='space-between'>
						<div>
							<Text fw={700} size='sm'>
								{metrics.agentAvgResponseLengthWords}
							</Text>
							<Text size='xs' c='dimmed'>
								words
							</Text>
						</div>
						<div>
							<Text fw={700} size='sm'>
								{metrics.agentAvgResponseLengthChars}
							</Text>
							<Text size='xs' c='dimmed'>
								chars
							</Text>
						</div>
					</Group>
				</div>

				<div className={styles.metricCard}>
					<Group gap='xs' mb='xs'>
						<IconPhone size={16} color='var(--mantine-color-green-6)' />
						<Text size='xs' fw={500} c='dimmed'>
							Avg Customer Statement
						</Text>
					</Group>
					<Group justify='space-between'>
						<div>
							<Text fw={700} size='sm'>
								{metrics.customerAvgStatementLengthWords}
							</Text>
							<Text size='xs' c='dimmed'>
								words
							</Text>
						</div>
						<div>
							<Text fw={700} size='sm'>
								{metrics.customerAvgStatementLengthChars}
							</Text>
							<Text size='xs' c='dimmed'>
								chars
							</Text>
						</div>
					</Group>
				</div>

				<div className={styles.metricCard}>
					<Group gap='xs' mb='xs'>
						<IconVolumeOff size={16} color='var(--mantine-color-gray-6)' />
						<Text size='xs' fw={500} c='dimmed'>
							Silence/Pauses
						</Text>
					</Group>
					<Group justify='space-between'>
						<div>
							<Text fw={700} size='sm'>
								{metrics.silenceCount}
							</Text>
							<Text size='xs' c='dimmed'>
								instances
							</Text>
						</div>
						<div>
							<Text fw={700} size='sm'>
								{metrics.avgSilenceDurationSeconds}s
							</Text>
							<Text size='xs' c='dimmed'>
								avg
							</Text>
						</div>
					</Group>
				</div>

				<div className={styles.metricCard}>
					<Group gap='xs' mb='xs'>
						<IconClock size={16} color='var(--mantine-color-orange-6)' />
						<Text size='xs' fw={500} c='dimmed'>
							Response Latency
						</Text>
					</Group>
					<Text fw={700} size='sm'>
						{metrics.avgResponseLatencySeconds.toFixed(1)}s
					</Text>
					<Text size='xs' c='dimmed'>
						avg delay
					</Text>
				</div>

				<div className={styles.metricCard}>
					<Text size='xs' fw={500} c='dimmed' mb='xs'>
						Agent Talk Time
					</Text>
					<Group gap='xs'>
						<Badge
							color='blue'
							variant='light'
							styles={{
								root: {
									backgroundColor: 'var(--mantine-color-blue-0)',
									color: 'var(--mantine-color-blue-7)',
								},
							}}
						>
							{agentTalkPercent}%
						</Badge>
						<Text size='xs' c='dimmed'>
							of call
						</Text>
					</Group>
				</div>

				<div className={styles.metricCard}>
					<Text size='xs' fw={500} c='dimmed' mb='xs'>
						Customer Talk Time
					</Text>
					<Group gap='xs'>
						<Badge
							color='green'
							variant='light'
							styles={{
								root: {
									backgroundColor: 'var(--mantine-color-green-0)',
									color: 'var(--mantine-color-green-7)',
								},
							}}
						>
							{customerTalkPercent}%
						</Badge>
						<Text size='xs' c='dimmed'>
							of call
						</Text>
					</Group>
				</div>
			</div>

			{/* Response Latency Examples */}
			{metrics.responseLatencies.length > 0 && (
				<Stack gap='sm'>
					<Text size='xs' fw={500} c='dimmed'>
						Notable Response Times
					</Text>
					<div className={styles.latencyList}>
						{metrics.responseLatencies.map((latency) => (
							<Group
								key={latency.timestamp}
								justify='space-between'
								className={styles.latencyItem}
							>
								<Group gap='xs'>
									<Text size='xs' fw={600}>
										{latency.timestamp}
									</Text>
									<Text size='xs' c='dimmed'>
										{latency.delaySeconds.toFixed(1)}s delay
									</Text>
								</Group>
								<Badge
									size='sm'
									color={getLatencyColor(latency.delaySeconds)}
									variant='light'
								>
									{latency.sentiment > 0 ? '↑' : '↓'}{' '}
									{latency.sentiment > 0 ? '+' : ''}
									{(latency.sentiment * 100).toFixed(0)}%
								</Badge>
							</Group>
						))}
					</div>
				</Stack>
			)}
		</Stack>
	);
}

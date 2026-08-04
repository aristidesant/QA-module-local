import { Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowUp, IconCheck } from '@tabler/icons-react';
import type { RecoveryMetrics } from '../types';
import styles from './RecoveryMetricsCard.module.css';

interface RecoveryMetricsCardProps {
	metrics: RecoveryMetrics;
}

export default function RecoveryMetricsCard({
	metrics,
}: RecoveryMetricsCardProps) {
	return (
		<Stack gap='md' className={styles.container}>
			<Group justify='space-between'>
				<Text fw={600} size='sm'>
					Emotional Recovery
				</Text>
				{metrics.recovered && (
					<ThemeIcon color='green' variant='light' size='sm'>
						<IconCheck size={14} />
					</ThemeIcon>
				)}
			</Group>

			<div className={styles.recoveryFlow}>
				<div className={styles.stage}>
					<Text size='xs' c='dimmed' fw={500}>
						Start
					</Text>
					<Text size='sm' fw={600} className={styles.sentiment}>
						{metrics.startSentiment > 0 ? '+' : ''}
						{metrics.startSentiment.toFixed(2)}
					</Text>
				</div>

				<div className={styles.arrow}>→</div>

				<div className={styles.stage}>
					<Text size='xs' c='dimmed' fw={500}>
						Peak Negative
					</Text>
					<Text size='sm' fw={600} className={styles.negative}>
						{metrics.peakNegativeSentiment.toFixed(2)}
					</Text>
				</div>

				<div className={styles.arrow}>→</div>

				<div className={styles.stage}>
					<Text size='xs' c='dimmed' fw={500}>
						End
					</Text>
					<Text size='sm' fw={600} className={styles.positive}>
						+{metrics.endSentiment.toFixed(2)}
					</Text>
				</div>
			</div>

			<Stack gap='xs' className={styles.metrics}>
				<div className={styles.metricRow}>
					<Text size='sm'>Recovery Time</Text>
					<Text size='sm' fw={600}>
						{metrics.recoveryTime}s
					</Text>
				</div>
				<div className={styles.metricRow}>
					<Text size='sm'>Sentiment Improvement</Text>
					<Group gap='xs'>
						<Text size='sm' fw={600} c='green'>
							+{metrics.improvementDelta}%
						</Text>
						<IconArrowUp size={14} color='var(--mantine-color-green-6)' />
					</Group>
				</div>
				<div className={styles.metricRow}>
					<Text size='sm'>Status</Text>
					<Text size='sm' fw={600} c={metrics.recovered ? 'green' : 'red'}>
						{metrics.recovered ? '✓ Recovered' : '✗ Not Recovered'}
					</Text>
				</div>
			</Stack>
		</Stack>
	);
}

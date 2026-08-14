import { Stack, Text, Group, Badge, Tooltip } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import type { SentimentInflectionPoint } from '../types';
import styles from './SentimentInflectionPointsCard.module.css';

interface SentimentInflectionPointsCardProps {
	inflectionPoints: SentimentInflectionPoint[];
}

export default function SentimentInflectionPointsCard({
	inflectionPoints,
}: SentimentInflectionPointsCardProps) {
	// Sort by impact score (most impactful first)
	const sortedPoints = [...inflectionPoints].sort(
		(a, b) => Math.abs(b.sentimentDelta) - Math.abs(a.sentimentDelta)
	);

	// Show top 5 points
	const topPoints = sortedPoints.slice(0, 5);

	return (
		<Stack gap='md' className={styles.container}>
			<Text fw={600} size='sm'>
				Sentiment Inflection Points
			</Text>

			<div className={styles.inflectionsList}>
				{topPoints.map((point) => (
					<div key={point.id} className={styles.inflectionItem}>
						<div
							className={styles.leftBorder} // inline-style-allow: accent color by sentiment direction
							style={{
								backgroundColor:
									point.direction === 'positive'
										? 'var(--mantine-color-green-6)'
										: 'var(--mantine-color-red-6)',
							}}
						/>

						<div className={styles.content}>
							{/* Header: Timestamp and direction badge */}
							<Group justify='space-between' mb='xs'>
								<Text size='xs' fw={600} c='dimmed'>
									{point.timestamp}
								</Text>
								<Tooltip
									label={`${point.direction === 'positive' ? 'Recovery' : 'Decline'} - Impact: ${point.impactScore}/100`}
								>
									<Badge
										size='sm'
										color={point.direction === 'positive' ? 'green' : 'red'}
										variant='light'
										leftSection={
											point.direction === 'positive' ? (
												<IconTrendingUp size={12} />
											) : (
												<IconTrendingDown size={12} />
											)
										}
									>
										{point.direction === 'positive' ? '+' : ''}
										{(point.sentimentDelta * 100).toFixed(0)}%
									</Badge>
								</Tooltip>
							</Group>

							{/* Quote */}
							<Text size='sm' fw={500} mb='xs' className={styles.quote}>
								"{point.quote}"
							</Text>

							{/* Speaker and sentiment info */}
							<Group justify='space-between' gap='xs'>
								<Badge
									size='xs'
									variant='light'
									color={point.role === 'agent' ? 'blue' : 'gray'}
								>
									{point.role === 'agent' ? 'Agent' : 'Customer'}
								</Badge>
								<Text size='xs' c='dimmed'>
									{point.sentimentBefore.toFixed(2)} →{' '}
									{point.sentimentAfter.toFixed(2)}
								</Text>
							</Group>

							{/* Optional context */}
							{point.context && (
								<Text size='xs' c='dimmed' mt='xs'>
									{point.context}
								</Text>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Summary note */}
			<Text size='xs' c='dimmed'>
				Showing top {Math.min(topPoints.length, 5)} moments with largest
				sentiment shifts
			</Text>
		</Stack>
	);
}

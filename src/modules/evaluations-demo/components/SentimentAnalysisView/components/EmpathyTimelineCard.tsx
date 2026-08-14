import { useMemo } from 'react';
import {
	Stack,
	Text,
	Group,
	Badge,
	Card,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import { IconHeart, IconTrendingUp } from '@tabler/icons-react';
import type { EmpathyIndicator } from '../types';
import styles from './EmpathyTimelineCard.module.css';

interface EmpathyTimelineCardProps {
	indicators: EmpathyIndicator[];
	recoveryDelta?: number; // sentiment improvement percentage
	callDuration?: number; // in seconds
}

export default function EmpathyTimelineCard({
	indicators,
	recoveryDelta = 65,
	callDuration = 300,
}: EmpathyTimelineCardProps) {
	// Parse timestamps to seconds
	const timelinePoints = useMemo(() => {
		return indicators.map((indicator) => {
			const [minutes, seconds] = indicator.timestamp.split(':').map(Number);
			const totalSeconds = minutes * 60 + seconds;
			const percentage = (totalSeconds / callDuration) * 100;
			return {
				...indicator,
				seconds: totalSeconds,
				percentage,
			};
		});
	}, [indicators, callDuration]);

	// Simulate sentiment curve (from negative to positive as agent uses empathy)
	const sentimentCurve = useMemo(() => {
		const points = [];
		for (let i = 0; i <= 100; i += 5) {
			// Start negative, curve upward with each empathy intervention
			const baseNegative = -0.7;
			const interventions = timelinePoints.filter(
				(p) => p.percentage <= i
			).length;
			const recovery = interventions * 0.15; // Each intervention helps
			const sentiment = Math.min(0.8, baseNegative + recovery);
			points.push({ percentage: i, sentiment });
		}
		return points;
	}, [timelinePoints]);

	// Generate SVG path for sentiment curve
	const pathData = sentimentCurve
		.map(
			(point, idx) =>
				`${idx === 0 ? 'M' : 'L'} ${point.percentage * 3} ${100 - (point.sentiment + 1) * 50}`
		)
		.join(' ');

	return (
		<Stack gap='lg' className={styles.container}>
			<div>
				<Group justify='space-between' mb='xs'>
					<Text fw={600} size='sm'>
						Empathy Timeline & Sentiment Recovery
					</Text>
					<Group gap='xs'>
						<IconTrendingUp size={16} color='green' />
						<Text fw={500} size='xs' c='green'>
							+{recoveryDelta}% recovery
						</Text>
					</Group>
				</Group>

				{/* Sentiment Curve Visualization */}
				<div className={styles.chartContainer}>
					<svg viewBox='0 0 300 100' preserveAspectRatio='none'>
						{/* Grid lines */}
						<line x1='0' y1='50' x2='300' y2='50' className={styles.gridLine} />

						{/* Sentiment curve */}
						<path d={pathData} className={styles.curve} />

						{/* Empathy marker circles */}
						{timelinePoints.map((point) => (
							<circle
								key={point.timestamp}
								cx={point.percentage * 3}
								cy={
									100 -
									(sentimentCurve[Math.floor(point.percentage / 5)]?.sentiment +
										1) *
										50
								}
								r='2.5'
								className={styles.marker}
							/>
						))}

						{/* Fill under curve */}
						<path
							d={`${pathData} L 300 100 L 0 100 Z`}
							className={styles.fill}
						/>
					</svg>

					{/* Timeline labels */}
					<div className={styles.timelineLabels}>
						<span>Start</span>
						<span>Mid-call</span>
						<span>End</span>
					</div>

					{/* Sentiment labels */}
					<div className={styles.sentimentLabels}>
						<span>Negative</span>
						<span>Neutral</span>
						<span>Positive</span>
					</div>
				</div>
			</div>

			{/* Empathy Moments */}
			<div>
				<Text fw={500} size='xs' c='dimmed' mb='md' tt='uppercase'>
					Key Empathy Moments
				</Text>
				<Stack gap='sm'>
					{timelinePoints.map((point, idx) => (
						<div key={point.timestamp} className={styles.moment}>
							{/* Timeline marker */}
							<div className={styles.timeline}>
								<div className={styles.dot}>
									<Tooltip label='Empathy signal detected'>
										<IconHeart size={12} />
									</Tooltip>
								</div>
								{idx < timelinePoints.length - 1 && (
									<div className={styles.line} />
								)}
							</div>

							{/* Moment content */}
							<div className={styles.content}>
								<Group justify='space-between' mb={4}>
									<Badge
										size='sm'
										variant='light'
										color='blue'
										leftSection={<Text size='xs'>{point.timestamp}</Text>}
									>
										{Math.round(point.percentage)}% through call
									</Badge>
									<ThemeIcon
										size='sm'
										radius='md'
										color='green'
										variant='light'
									>
										<IconTrendingUp size={12} />
									</ThemeIcon>
								</Group>
								<Text fw={500} size='sm' mb={4}>
									"{point.phrase}"
								</Text>
								<Text size='xs' c='dimmed'>
									{point.context}
								</Text>
							</div>
						</div>
					))}
				</Stack>
			</div>

			{/* Summary card */}
			<Card withBorder bg='var(--mantine-color-green-0)' p='md'>
				<Group justify='space-between'>
					<div>
						<Text fw={600} size='sm'>
							Empathy Impact
						</Text>
						<Text size='xs' c='dimmed'>
							{indicators.length} strategic interventions drove sentiment
							recovery
						</Text>
					</div>
					<div className={styles.summaryMetric}>
						<Text fw={700} size='lg' c='green'>
							+{recoveryDelta}%
						</Text>
						<Text size='xs' c='dimmed'>
							Sentiment improved
						</Text>
					</div>
				</Group>
			</Card>
		</Stack>
	);
}

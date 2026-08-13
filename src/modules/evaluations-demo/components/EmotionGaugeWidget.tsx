import React, { useMemo } from 'react';
import { Card, Stack, Text, Button, RingProgress, Center } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import type { DemoAgentCall } from '../AgentDashboard/types';
import styles from './EmotionGaugeWidget.module.css';

interface EmotionGaugeWidgetProps {
	calls: DemoAgentCall[];
	title: string;
}

const EmotionGaugeWidget: React.FC<EmotionGaugeWidgetProps> = ({
	calls,
	title,
}) => {
	const emotionMetrics = useMemo(() => {
		// Filter sentiment analysis calls
		const sentimentCalls = calls.filter(
			(call) => call.evaluationType === 'Sentiment Analysis'
		);

		if (sentimentCalls.length === 0) {
			return { score: 0, emotionLevel: 'neutral' };
		}

		// Calculate average sentiment score (mock data uses scores from 0-100)
		const scores = sentimentCalls
			.map((call) => call.score)
			.filter((s) => s !== null) as number[];

		const avgScore = Math.round(
			scores.reduce((a, b) => a + b, 0) / scores.length
		);

		// Determine emotion level based on score
		let emotionLevel = 'neutral';
		if (avgScore >= 75) emotionLevel = 'positive';
		else if (avgScore >= 60) emotionLevel = 'slightly-positive';
		else if (avgScore >= 40) emotionLevel = 'neutral';
		else if (avgScore >= 25) emotionLevel = 'slightly-negative';
		else emotionLevel = 'negative';

		return { score: avgScore, emotionLevel };
	}, [calls]);

	const getEmotionColor = (level: string): string => {
		switch (level) {
			case 'positive':
				return 'green';
			case 'slightly-positive':
				return 'lime';
			case 'neutral':
				return 'gray';
			case 'slightly-negative':
				return 'yellow';
			case 'negative':
				return 'red';
			default:
				return 'gray';
		}
	};

	const getEmotionLabel = (level: string): string => {
		switch (level) {
			case 'positive':
				return 'Very Positive';
			case 'slightly-positive':
				return 'Positive';
			case 'neutral':
				return 'Neutral';
			case 'slightly-negative':
				return 'Slightly Negative';
			case 'negative':
				return 'Very Negative';
			default:
				return 'Neutral';
		}
	};

	const getSubtitle = (): string => {
		const color = getEmotionColor(emotionMetrics.emotionLevel);
		if (color === 'green' || color === 'lime') {
			return 'Customers expressing positive emotions';
		} else if (color === 'gray') {
			return 'Neutral customer sentiment';
		} else {
			return 'Customers expressing negative emotions';
		}
	};

	return (
		<Card withBorder radius='md' shadow='sm' className={styles.card}>
			<Stack gap='lg'>
				<div>
					<Text fw={700} size='lg' mb='xs'>
						{title}
					</Text>
					<Text size='sm' c='dimmed'>
						Negative ← | → Positive
					</Text>
				</div>

				<Center>
					<RingProgress
						sections={[
							{
								value: emotionMetrics.score,
								color: getEmotionColor(emotionMetrics.emotionLevel),
							},
						]}
						label={
							<div className={styles.ringLabel}>
								<Text fw={700} size='xl' className={styles.percentage}>
									{emotionMetrics.score}%
								</Text>
								<Text size='sm' c='dimmed' ta='center'>
									{getEmotionLabel(emotionMetrics.emotionLevel)}
								</Text>
							</div>
						}
						size={200}
						thickness={8}
					/>
				</Center>

				<Stack gap='xs' ta='center'>
					<Text size='sm' c='dimmed'>
						{getSubtitle()}
					</Text>
					<Button
						variant='light'
						rightSection={<IconChevronRight size={16} />}
						fullWidth
					>
						Show details
					</Button>
				</Stack>
			</Stack>
		</Card>
	);
};

export default EmotionGaugeWidget;

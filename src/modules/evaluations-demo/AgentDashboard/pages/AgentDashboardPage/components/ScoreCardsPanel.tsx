import React, { useMemo } from 'react';
import { Card, SimpleGrid, Stack, Text, Group, ThemeIcon } from '@mantine/core';
import {
	IconCircleCheck,
	IconMoodSmile,
	IconShieldCheck,
} from '@tabler/icons-react';
import type { DemoAgentCall } from '../../../types';
import type { Emotion } from '../../../../components/SentimentAnalysisView/types';
import styles from './ScoreCardsPanel.module.css';

interface ScorePanelProps {
	calls: DemoAgentCall[];
}

const ScoreCardsPanel: React.FC<ScorePanelProps> = ({ calls }) => {
	const scoreData = useMemo(() => {
		const qaScores = calls
			.filter((call) => call.evaluationType === 'QA' && call.score !== null)
			.map((call) => call.score as number);

		const complianceScores = calls
			.filter(
				(call) => call.evaluationType === 'Compliance' && call.score !== null
			)
			.map((call) => call.score as number);

		// Calculate predominant emotion based on all call scores
		const allScores = calls
			.filter((call) => call.score !== null)
			.map((call) => call.score as number);

		const getPredominantEmotion = (scores: number[]) => {
			const emotionMap: Record<Emotion, number> = {
				satisfaction: 0,
				frustration: 0,
				anger: 0,
				neutral: 0,
				excitement: 0,
				sadness: 0,
			};

			scores.forEach((score) => {
				let emotion: Emotion = 'neutral';
				if (score >= 85) {
					emotion = Math.random() > 0.5 ? 'satisfaction' : 'excitement';
				} else if (score >= 70) {
					emotion = 'satisfaction';
				} else if (score >= 50) {
					emotion = 'neutral';
				} else if (score >= 30) {
					emotion = 'frustration';
				} else {
					emotion = 'anger';
				}

				emotionMap[emotion]++;
			});

			const total = scores.length;
			if (total === 0) return { emotion: 'neutral' as Emotion, percentage: 0 };

			const dominantEmotion = (Object.entries(emotionMap).sort(
				([, a], [, b]) => b - a
			)[0] || ['neutral', 0])[0] as Emotion;
			const percentage = Math.round(
				(emotionMap[dominantEmotion] / total) * 100
			);

			return { emotion: dominantEmotion, percentage };
		};

		const getAverage = (scores: number[]) =>
			scores.length > 0
				? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
				: 0;

		const predominantEmotion = getPredominantEmotion(allScores);

		return [
			{
				label: 'QA Analysis Score',
				score: getAverage(qaScores),
				color: 'blue',
				icon: <IconCircleCheck size={32} />,
			},
			{
				label: 'Predominant Emotion',
				emotion: predominantEmotion,
				color: 'green',
				icon: <IconMoodSmile size={32} />,
			},
			{
				label: 'Compliance Score',
				score: getAverage(complianceScores),
				color: 'grape',
				icon: <IconShieldCheck size={32} />,
			},
		] as any[];
	}, [calls]);

	return (
		<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
			{scoreData.map((data) => (
				<Card
					key={data.label}
					withBorder
					radius='md'
					shadow='sm'
					className={styles.scoreCard}
				>
					<Stack gap='md' h='100%'>
						<Group justify='space-between' align='flex-start'>
							<Stack gap='xs'>
								<Text size='sm' c='dimmed' fw={500}>
									{data.label}
								</Text>
								{data.score !== undefined ? (
									<Text className={styles.scoreValue}>{data.score}</Text>
								) : (
									<div>
										<Text className={styles.scoreValue}>
											{data.emotion!.emotion.charAt(0).toUpperCase() +
												data.emotion!.emotion.slice(1)}
										</Text>
										<Text size='xs' c='dimmed'>
											{data.emotion!.percentage}% of calls
										</Text>
									</div>
								)}
							</Stack>
							<ThemeIcon
								size='lg'
								radius='md'
								variant='light'
								color={data.color}
								className={styles.icon}
							>
								{data.icon}
							</ThemeIcon>
						</Group>
						<Text size='xs' c='dimmed'>
							Based on recent evaluations
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};

export default ScoreCardsPanel;

import React, { useMemo } from 'react';
import { Card, SimpleGrid, Stack, Text, Group, ThemeIcon } from '@mantine/core';
import {
	IconCircleCheck,
	IconMoodSmile,
	IconShieldCheck,
} from '@tabler/icons-react';
import type { DemoAgentCall } from '../../../types';
import styles from './ScoreCardsPanel.module.css';

interface ScorePanelProps {
	calls: DemoAgentCall[];
}

interface ScoreData {
	label: string;
	score: number;
	color: string;
	icon: React.ReactNode;
}

const ScoreCardsPanel: React.FC<ScorePanelProps> = ({ calls }) => {
	const scoreData = useMemo(() => {
		const qaScores = calls
			.filter((call) => call.evaluationType === 'QA' && call.score !== null)
			.map((call) => call.score as number);

		const sentimentScores = calls
			.filter(
				(call) =>
					call.evaluationType === 'Sentiment Analysis' && call.score !== null
			)
			.map((call) => call.score as number);

		const complianceScores = calls
			.filter(
				(call) => call.evaluationType === 'Compliance' && call.score !== null
			)
			.map((call) => call.score as number);

		const getAverage = (scores: number[]) =>
			scores.length > 0
				? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
				: 0;

		return [
			{
				label: 'QA Analysis Score',
				score: getAverage(qaScores),
				color: 'blue',
				icon: <IconCircleCheck size={32} />,
			},
			{
				label: 'Emotion & Sentiment Score',
				score: getAverage(sentimentScores),
				color: 'green',
				icon: <IconMoodSmile size={32} />,
			},
			{
				label: 'Compliance Score',
				score: getAverage(complianceScores),
				color: 'grape',
				icon: <IconShieldCheck size={32} />,
			},
		] as ScoreData[];
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
								<Text className={styles.scoreValue}>{data.score}</Text>
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

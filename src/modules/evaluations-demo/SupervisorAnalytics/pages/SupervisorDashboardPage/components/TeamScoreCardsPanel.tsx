import React, { useMemo } from 'react';
import {
	Card,
	SimpleGrid,
	Stack,
	Text,
	Group,
	ThemeIcon,
	Badge,
} from '@mantine/core';
import {
	IconCircleCheck,
	IconMoodSmile,
	IconShieldCheck,
} from '@tabler/icons-react';
import type { DemoAgentCall } from '../../../../AgentDashboard/types';
import type { Emotion } from '../../../../components/SentimentAnalysisView/types';
import styles from './TeamScoreCardsPanel.module.css';

interface TeamScoreCardsPanelProps {
	calls: DemoAgentCall[];
}

const TeamScoreCardsPanel: React.FC<TeamScoreCardsPanelProps> = ({ calls }) => {
	const scoreData = useMemo(() => {
		const getScores = (type: string) =>
			calls
				.filter((call) => {
					if (type === 'qa')
						return call.evaluationType === 'QA' && call.score !== null;
					if (type === 'compliance')
						return call.evaluationType === 'Compliance' && call.score !== null;
					return false;
				})
				.map((call) => call.score as number);

		const calculateStats = (scores: number[]) => {
			if (scores.length === 0) return { avg: 0, min: 0, max: 0, spread: 0 };
			const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
			const min = Math.min(...scores);
			const max = Math.max(...scores);
			return { avg, min, max, spread: max - min };
		};

		// Calculate predominant emotion based on all call scores
		const allCallScores = calls
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

		const qaScores = getScores('qa');
		const complianceScores = getScores('compliance');
		const predominantEmotion = getPredominantEmotion(allCallScores);

		const qaStats = calculateStats(qaScores);
		const complianceStats = calculateStats(complianceScores);
		const allData: any[] = [
			{
				label: 'QA Analysis Score',
				teamAvg: qaStats.avg,
				min: qaStats.min,
				max: qaStats.max,
				spread: qaStats.spread,
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
				teamAvg: complianceStats.avg,
				min: complianceStats.min,
				max: complianceStats.max,
				spread: complianceStats.spread,
				color: 'grape',
				icon: <IconShieldCheck size={32} />,
			},
		];

		return allData;
	}, [calls]);

	const getSpreadColor = (spread: number): string => {
		if (spread <= 15) return 'green';
		if (spread <= 30) return 'yellow';
		return 'red';
	};

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
								{data.teamAvg !== undefined ? (
									<>
										<Text className={styles.scoreValue}>{data.teamAvg}</Text>
										<Text size='xs' c='dimmed'>
											Range: {data.min}–{data.max}
										</Text>
									</>
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
						{data.spread !== undefined && (
							<Group gap='xs'>
								<Text size='xs' c='dimmed'>
									Spread:
								</Text>
								<Badge
									variant='light'
									color={getSpreadColor(data.spread)}
									size='sm'
								>
									{data.spread} points
								</Badge>
							</Group>
						)}
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};

export default TeamScoreCardsPanel;

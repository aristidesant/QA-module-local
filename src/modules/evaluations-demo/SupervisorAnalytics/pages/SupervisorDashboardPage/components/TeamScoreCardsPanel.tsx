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
import styles from './TeamScoreCardsPanel.module.css';

interface TeamScoreCardsPanelProps {
	calls: DemoAgentCall[];
}

interface TeamScoreData {
	label: string;
	teamAvg: number;
	min: number;
	max: number;
	spread: number;
	color: string;
	icon: React.ReactNode;
}

const TeamScoreCardsPanel: React.FC<TeamScoreCardsPanelProps> = ({ calls }) => {
	const scoreData = useMemo(() => {
		const getScores = (type: string) =>
			calls
				.filter((call) => {
					if (type === 'qa')
						return call.evaluationType === 'QA' && call.score !== null;
					if (type === 'emotion')
						return (
							call.evaluationType === 'Sentiment Analysis' &&
							call.score !== null
						);
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

		const qaScores = getScores('qa');
		const emotionScores = getScores('emotion');
		const complianceScores = getScores('compliance');

		const qaStats = calculateStats(qaScores);
		const emotionStats = calculateStats(emotionScores);
		const complianceStats = calculateStats(complianceScores);
		const allData: TeamScoreData[] = [
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
				label: 'Emotion & Sentiment Score',
				teamAvg: emotionStats.avg,
				min: emotionStats.min,
				max: emotionStats.max,
				spread: emotionStats.spread,
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
								<Text className={styles.scoreValue}>{data.teamAvg}</Text>
								<Text size='xs' c='dimmed'>
									Range: {data.min}–{data.max}
								</Text>
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
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};

export default TeamScoreCardsPanel;

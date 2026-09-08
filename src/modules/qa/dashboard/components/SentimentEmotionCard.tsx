import React from 'react';
import { Card, Stack, Group, Text, Progress, ThemeIcon, Badge, Divider } from '@mantine/core';
import {
	IconMoodSmile,
	IconMoodNeutral,
	IconMoodEmpty,
	IconMoodCry,
	IconMoodHappy,
	IconSparkles,
} from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

interface SentimentEmotionCardProps {
	/** Overall sentiment on the 0-5 scale */
	score: number;
	/** Predominant emotion detected across the period (e.g. "Satisfaction") */
	predominantEmotion: string;
	/** Short line under the card title, used to scope the card per role */
	subtitle?: string;
}

/**
 * Sentiment bands on the 0-5 scale.
 */
const SENTIMENT_BANDS = [
	{ max: 1.5, label: 'Very Negative', color: 'red', icon: IconMoodCry },
	{ max: 2.5, label: 'Negative', color: 'orange', icon: IconMoodEmpty },
	{ max: 3.5, label: 'Neutral', color: 'yellow', icon: IconMoodNeutral },
	{ max: 4.5, label: 'Positive', color: 'lime', icon: IconMoodSmile },
	{ max: Infinity, label: 'Very Positive', color: 'teal', icon: IconMoodHappy },
] as const;

/** Resolves the predominant sentiment band for a 0-5 score */
export const getSentimentBand = (score: number) =>
	SENTIMENT_BANDS.find(band => score < band.max) ?? SENTIMENT_BANDS[SENTIMENT_BANDS.length - 1];

/**
 * SentimentEmotionCard
 *
 * Card 3 of the Performance Score row. Replaces the previous standalone
 * SentimentScaleCard, showing three things only:
 * - the overall sentiment score on the 0-5 scale
 * - the predominant sentiment label (Very Negative -> Very Positive)
 * - the predominant emotion detected
 */
export const SentimentEmotionCard: React.FC<SentimentEmotionCardProps> = ({
	score,
	predominantEmotion,
	subtitle,
}) => {
	const band = getSentimentBand(score);
	const BandIcon = band.icon;

	return (
		<Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm' h='100%'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<div>
						<Text fw={600} size='md'>
							Sentiment &amp; Emotion
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
					</div>
					<ThemeIcon size='lg' color={band.color} radius='md'>
						<BandIcon size={20} />
					</ThemeIcon>
				</Group>

				<div>
					<Group gap='xs' align='baseline'>
						<Text className={styles.scoreValue}>{score.toFixed(1)}</Text>
						<Text size='sm' c='dimmed'>
							/ 5.0
						</Text>
					</Group>
					<Progress value={(score / 5) * 100} size='sm' color={band.color} mt='xs' />
				</div>

				<Divider />

				<Stack gap='sm'>
					<Group justify='space-between' align='center'>
						<Text size='sm' c='dimmed'>
							Predominant sentiment
						</Text>
						<Badge color={band.color} variant='light' size='lg'>
							{band.label}
						</Badge>
					</Group>

					<Group justify='space-between' align='center'>
						<Text size='sm' c='dimmed'>
							Predominant emotion
						</Text>
						<Badge
							color='violet'
							variant='light'
							size='lg'
							leftSection={<IconSparkles size={14} />}
						>
							{predominantEmotion}
						</Badge>
					</Group>
				</Stack>
			</Stack>
		</Card>
	);
};

export default SentimentEmotionCard;

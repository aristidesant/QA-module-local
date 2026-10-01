import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Card,
	Stack,
	Group,
	Text,
	Progress,
	ThemeIcon,
	Badge,
	Divider,
} from '@mantine/core';
import {
	IconMoodSmile,
	IconMoodNeutral,
	IconMoodEmpty,
	IconMoodCry,
	IconMoodHappy,
	IconSparkles,
} from '@tabler/icons-react';
import { sentimentBandIndex } from '~/modules/qa/settings/helpers';
import { DEFAULT_SETTINGS } from '~/modules/qa/settings/constants';
import type { SentimentCutPoints } from '~/modules/qa/settings/types';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
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
 * Sentiment bands on the 0-5 scale. Where one band ends and the next begins is
 * configured in Settings; `labelKey` resolves in `qa.dashboard`.
 */
const SENTIMENT_BANDS = [
	{
		labelKey: 'sentimentBands.veryNegative',
		color: 'red',
		icon: IconMoodCry,
	},
	{ labelKey: 'sentimentBands.negative', color: 'red', icon: IconMoodEmpty },
	{
		labelKey: 'sentimentBands.neutral',
		color: 'gray',
		icon: IconMoodNeutral,
	},
	{
		labelKey: 'sentimentBands.positive',
		color: 'green',
		icon: IconMoodSmile,
	},
	{
		labelKey: 'sentimentBands.veryPositive',
		color: 'green',
		icon: IconMoodHappy,
	},
] as const;

/** Resolves the predominant sentiment band for a 0-5 score */
export const getSentimentBand = (
	score: number,
	cutPoints: SentimentCutPoints = DEFAULT_SETTINGS.thresholds.sentiment
		.cutPoints
) => SENTIMENT_BANDS[sentimentBandIndex(score, cutPoints)];

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
	const { t } = useTranslation('qa.dashboard');
	const { cutPoints } = useSettingsStore(selectThresholds).sentiment;
	const band = getSentimentBand(score, cutPoints);
	const BandIcon = band.icon;

	return (
		<Card
			className={styles.metricCard}
			p='lg'
			radius='md'
			withBorder
			shadow='sm'
			h='100%'
		>
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
					<Progress
						value={(score / 5) * 100}
						size='sm'
						color={band.color}
						mt='xs'
					/>
				</div>

				<Divider />

				<Stack gap='sm'>
					<Group justify='space-between' align='center'>
						<Text size='sm' c='dimmed'>
							Predominant sentiment
						</Text>
						<Badge color={band.color} variant='light' size='lg'>
							{t(band.labelKey)}
						</Badge>
					</Group>

					<Group justify='space-between' align='center'>
						<Text size='sm' c='dimmed'>
							Predominant emotion
						</Text>
						<Badge
							color='gray'
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

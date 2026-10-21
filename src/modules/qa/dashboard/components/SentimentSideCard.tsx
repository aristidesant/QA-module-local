import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Card,
	Divider,
	Group,
	Progress,
	Stack,
	Text,
	ThemeIcon,
	UnstyledButton,
} from '@mantine/core';
import { IconChevronRight, IconSparkles } from '@tabler/icons-react';
import type { Emotion } from '~/modules/qa/emotion-sentiment/types';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import type { SentimentSide } from './SentimentEmotionSplitCard';
import { getSentimentBand } from './SentimentEmotionCard';
import { TrendIndicator } from './TrendIndicator';
import styles from '../Dashboard.module.css';

interface SentimentSideCardProps {
	title: string;
	subtitle?: string;
	/** Header icon, e.g. IconHeadset for the agent, IconUser for customers. */
	icon: React.ReactNode;
	/** Score, negative count and trend for this side; its `emotion` is ignored in favour of the platform `emotion` below. */
	side: SentimentSide;
	/** Predominant emotion in the platform vocabulary, null when there are no calls. */
	emotion: Emotion | null;
	/** Drill-down into the calls with a negative emotion on this side. */
	onReviewClick?: () => void;
}

/** Only the negative side keeps a hue; positive or neutral reads as plain ink. */
const SENTIMENT_TONE: Record<string, string> = {
	red: 'danger',
	gray: 'gray',
	green: 'gray',
};

/** One side (agent or customer) of sentiment & emotion as its own Performance Score card. */
export const SentimentSideCard: React.FC<SentimentSideCardProps> = ({
	title,
	subtitle,
	icon,
	side,
	emotion,
	onReviewClick,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const { cutPoints } = useSettingsStore(selectThresholds).sentiment;
	const band = getSentimentBand(side.score, cutPoints);
	const tone = SENTIMENT_TONE[band.color] ?? 'gray';
	const clickable = Boolean(onReviewClick) && side.negativeCount > 0;

	const reviewContent = (
		<Group justify='space-between' wrap='nowrap'>
			<Text size='sm' fw={500}>
				{t('sentimentSide.negativeCalls')}
			</Text>
			<Group gap={6} wrap='nowrap'>
				<Text size='sm' fw={600}>
					{t('drill.calls', { count: side.negativeCount })}
				</Text>
				{clickable && <IconChevronRight size={14} />}
			</Group>
		</Group>
	);

	return (
		<Card
			className={styles.metricCard}
			p='lg'
			radius='md'
			withBorder
			shadow='none'
			h='100%'
		>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<div>
						<Text fw={600} size='md'>
							{title}
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
					</div>
					<ThemeIcon size='lg' variant='light' color='gray' radius='md'>
						{icon}
					</ThemeIcon>
				</Group>

				<div>
					<Group gap={4} align='baseline'>
						<Text className={styles.scoreValue}>{side.score.toFixed(1)}</Text>
						<Text size='xs' c='dimmed'>
							{t('sentimentSide.outOfFive')}
						</Text>
					</Group>
					<Progress
						value={(side.score / 5) * 100}
						size='xs'
						color={tone}
						mt='xs'
						aria-label={`${title} ${side.score.toFixed(1)}/5`}
					/>
				</div>

				<Group gap='xs'>
					{band.color === 'red' && (
						<Badge color='danger' variant='light' size='sm'>
							{t(band.labelKey)}
						</Badge>
					)}
					{side.trend && <TrendIndicator trend={side.trend} />}
				</Group>

				<Group justify='space-between' align='center' wrap='nowrap'>
					<Text size='sm' c='dimmed'>
						{t('sentimentSide.predominantEmotion')}
					</Text>
					<Badge
						color='gray'
						variant='light'
						size='sm'
						leftSection={<IconSparkles size={12} />}
					>
						{emotion ? t(`emotions.${emotion}`) : t('sentimentSide.none')}
					</Badge>
				</Group>

				<Divider />

				{clickable ? (
					<UnstyledButton
						className={styles.drillRow}
						onClick={onReviewClick}
						title={t('drill.hint')}
					>
						{reviewContent}
					</UnstyledButton>
				) : (
					<div className={styles.drillRowStatic}>{reviewContent}</div>
				)}
			</Stack>
		</Card>
	);
};

export default SentimentSideCard;

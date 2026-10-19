import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Card,
	Divider,
	Group,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	UnstyledButton,
} from '@mantine/core';
import {
	IconChevronRight,
	IconHeadset,
	IconSparkles,
	IconUser,
} from '@tabler/icons-react';
import type { DashboardMetricTrend } from '~/modules/qa/calls/agentMetrics';
import { getSentimentBand } from './SentimentEmotionCard';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { TrendIndicator } from './TrendIndicator';
import styles from '../Dashboard.module.css';

export interface SentimentSide {
	/** Average sentiment on the 1-5 scale */
	score: number;
	/** Predominant emotion label, null when there are no calls */
	emotion: string | null;
	/** Calls whose predominant emotion was negative */
	negativeCount: number;
	/** This side's sentiment trend vs. the prior period of equal length. Omitted when the caller has no period concept. */
	trend?: DashboardMetricTrend;
}

interface SentimentEmotionSplitCardProps {
	agent: SentimentSide;
	customer: SentimentSide;
	subtitle?: string;
	/** Drill-down into the calls with a negative emotion on that side */
	onReviewClick?: (side: 'agent' | 'customer') => void;
	/** Portfolio view (Operation Manager): keeps the rows but drops progress bars, call counts and drill-down. */
	compact?: boolean;
}

/**
 * Dashboard tone of a sentiment band. The shared band table (SentimentEmotionCard)
 * names red / gray / green; here only the negative side keeps a hue, so a positive
 * or neutral column reads as plain ink. Mapped locally to leave that table untouched.
 */
const SENTIMENT_TONE: Record<string, string> = {
	red: 'danger',
	gray: 'gray',
	green: 'gray',
};

const SideColumn: React.FC<{
	title: string;
	icon: React.ReactNode;
	side: SentimentSide;
	compact?: boolean;
}> = ({ title, icon, side, compact = false }) => {
	const { t } = useTranslation('qa.dashboard');
	const { cutPoints } = useSettingsStore(selectThresholds).sentiment;
	const band = getSentimentBand(side.score, cutPoints);
	const tone = SENTIMENT_TONE[band.color] ?? 'gray';
	return (
		<Stack gap='xs' className={styles.splitColumn}>
			<Group gap={6}>
				<ThemeIcon size='sm' variant='light' color='gray' radius='md'>
					{icon}
				</ThemeIcon>
				<Text size='sm' fw={600}>
					{title}
				</Text>
			</Group>
			<Group gap={4} align='baseline'>
				<Text className={styles.scoreValue}>{side.score.toFixed(1)}</Text>
				<Text size='xs' c='dimmed'>
					{t('sentimentSplit.outOfFive')}
				</Text>
			</Group>
			{!compact && (
				<Progress
					value={(side.score / 5) * 100}
					size='xs'
					color={tone}
					aria-label={`${title} ${side.score.toFixed(1)}/5`}
				/>
			)}
			{band.color === 'red' && (
				<Badge color='danger' variant='light' size='sm'>
					{t(band.labelKey)}
				</Badge>
			)}
			<Badge
				color='gray'
				variant='light'
				size='sm'
				leftSection={<IconSparkles size={12} />}
			>
				{side.emotion ?? t('sentimentSplit.none')}
			</Badge>
			{side.trend && <TrendIndicator trend={side.trend} />}
		</Stack>
	);
};

/**
 * Card 3 of the agent Performance Score row: the agent's own sentiment/emotion
 * beside the customers' they contacted, plus the drill-down into negative calls.
 */
export const SentimentEmotionSplitCard: React.FC<
	SentimentEmotionSplitCardProps
> = ({ agent, customer, subtitle, onReviewClick, compact = false }) => {
	const { t } = useTranslation('qa.dashboard');
	const { cutPoints } = useSettingsStore(selectThresholds).sentiment;
	const headerBand = getSentimentBand(customer.score, cutPoints);
	const HeaderIcon = headerBand.icon;

	const reviewRow = (
		side: 'agent' | 'customer',
		label: string,
		count: number
	) => {
		const clickable = Boolean(onReviewClick) && count > 0;
		const content = (
			<Group justify='space-between' wrap='nowrap'>
				<Text size='sm' fw={500}>
					{label}
				</Text>
				<Group gap={6} wrap='nowrap'>
					<Text size='sm' fw={600}>
						{t('drill.calls', { count })}
					</Text>
					{clickable && <IconChevronRight size={14} />}
				</Group>
			</Group>
		);
		return clickable ? (
			<UnstyledButton
				className={styles.drillRow}
				onClick={() => onReviewClick!(side)}
				title={t('drill.hint')}
			>
				{content}
			</UnstyledButton>
		) : (
			<div className={styles.drillRowStatic}>{content}</div>
		);
	};

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
							{t('sentimentSplit.title')}
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
					</div>
					<ThemeIcon size='lg' variant='light' color='gray' radius='md'>
						<HeaderIcon size={20} />
					</ThemeIcon>
				</Group>

				<SimpleGrid cols={2} spacing='sm'>
					<SideColumn
						title={t('sentimentSplit.agent')}
						icon={<IconHeadset size={14} />}
						side={agent}
						compact={compact}
					/>
					<SideColumn
						title={t('sentimentSplit.customer')}
						icon={<IconUser size={14} />}
						side={customer}
						compact={compact}
					/>
				</SimpleGrid>

				{!compact && (
					<>
						<Divider />

						<Stack gap={4}>
							{reviewRow(
								'customer',
								t('sentimentSplit.negativeCustomer'),
								customer.negativeCount
							)}
							{reviewRow(
								'agent',
								t('sentimentSplit.negativeAgent'),
								agent.negativeCount
							)}
						</Stack>
					</>
				)}
			</Stack>
		</Card>
	);
};

export default SentimentEmotionSplitCard;

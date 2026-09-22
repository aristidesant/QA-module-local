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
import { getSentimentBand } from './SentimentEmotionCard';
import styles from '../Dashboard.module.css';

export interface SentimentSide {
	/** Average sentiment on the 1-5 scale */
	score: number;
	/** Predominant emotion label, null when there are no calls */
	emotion: string | null;
	/** Calls whose predominant emotion was negative */
	negativeCount: number;
}

interface SentimentEmotionSplitCardProps {
	agent: SentimentSide;
	customer: SentimentSide;
	subtitle?: string;
	/** Drill-down into the calls with a negative emotion on that side */
	onReviewClick?: (side: 'agent' | 'customer') => void;
}

const SideColumn: React.FC<{
	title: string;
	icon: React.ReactNode;
	side: SentimentSide;
}> = ({ title, icon, side }) => {
	const { t } = useTranslation('qa.dashboard');
	const band = getSentimentBand(side.score);
	return (
		<Stack gap='xs' className={styles.splitColumn}>
			<Group gap={6}>
				<ThemeIcon size='sm' variant='light' color={band.color} radius='md'>
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
			<Progress value={(side.score / 5) * 100} size='sm' color={band.color} />
			<Badge color={band.color} variant='light' size='sm'>
				{band.label}
			</Badge>
			<Badge
				color='gray'
				variant='light'
				size='sm'
				leftSection={<IconSparkles size={12} />}
			>
				{side.emotion ?? t('sentimentSplit.none')}
			</Badge>
		</Stack>
	);
};

/**
 * Card 3 of the agent Performance Score row: the agent's own sentiment/emotion
 * beside the customers' they contacted, plus the drill-down into negative calls.
 */
export const SentimentEmotionSplitCard: React.FC<
	SentimentEmotionSplitCardProps
> = ({ agent, customer, subtitle, onReviewClick }) => {
	const { t } = useTranslation('qa.dashboard');
	const headerBand = getSentimentBand(customer.score);
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
					<Text size='sm' fw={600} c={count > 0 ? 'red' : undefined}>
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
			shadow='sm'
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
					<ThemeIcon size='lg' color={headerBand.color} radius='md'>
						<HeaderIcon size={20} />
					</ThemeIcon>
				</Group>

				<SimpleGrid cols={2} spacing='sm'>
					<SideColumn
						title={t('sentimentSplit.agent')}
						icon={<IconHeadset size={14} />}
						side={agent}
					/>
					<SideColumn
						title={t('sentimentSplit.customer')}
						icon={<IconUser size={14} />}
						side={customer}
					/>
				</SimpleGrid>

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
			</Stack>
		</Card>
	);
};

export default SentimentEmotionSplitCard;

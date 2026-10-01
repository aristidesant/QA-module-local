import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Card,
	Stack,
	Group,
	Text,
	Badge,
	Divider,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
	IconChartHistogram,
	IconAlertTriangle,
} from '@tabler/icons-react';
import type { DashboardMetricTrend } from '~/modules/qa/calls/agentMetrics';
import { bandFor, bandsFor } from '~/modules/qa/settings/helpers';
import type { BusinessSignalKey } from '~/modules/qa/settings/types';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { SCORE_BAND_COLOR } from '~/modules/qa/constants/badgeColors';
import type { BusinessInsight, WeeklyMetrics } from '../mockData';
import { TrendIndicator } from './TrendIndicator';
import styles from '../Dashboard.module.css';

interface BusinessInsightsCardProps {
	insights: BusinessInsight[];
	outcome: WeeklyMetrics['businessOutcome'];
	/** Short line under the card title, used to scope the card per role */
	subtitle?: string;
	/** Conversion rate's trend vs. the prior period of equal length. Omitted when the caller has no period concept. */
	conversionTrend?: DashboardMetricTrend;
}

/** Signal labels live in i18n under stable keys, not under the mock's English wording. */
const SIGNAL_KEY: Record<BusinessInsight['type'], string> = {
	'Early Objection': 'EARLY_OBJECTION',
	'Unhandled objection': 'UNHANDLED_OBJECTION',
	'Competitor plus cost': 'COMPETITOR_PLUS_COST',
	'Mis-targeted offer': 'MISTARGETED_OFFER',
};

/** Maps a signal to the key its alert threshold is stored under in Settings. */
const SIGNAL_SETTING_KEY: Record<BusinessInsight['type'], BusinessSignalKey> = {
	'Early Objection': 'earlyObjection',
	'Unhandled objection': 'unhandledObjection',
	'Competitor plus cost': 'competitorPlusCost',
	'Mis-targeted offer': 'mistargetedOffer',
};

/** Every signal counts against the call, so a rising share is bad news. */
const TREND_META: Record<
	BusinessInsight['trend'],
	{ icon: typeof IconTrendingUp; color: string }
> = {
	up: { icon: IconTrendingUp, color: 'red' },
	down: { icon: IconTrendingDown, color: 'green' },
	stable: { icon: IconMinus, color: 'gray' },
};

/**
 * BusinessInsightsCard
 *
 * Card 4 of the Performance Score row, completing the four evaluation aspects
 * (QA, Compliance, Sentiment & Emotion, Business Insights). Shows the period's
 * conversion outcome plus the share of calls carrying each business signal.
 */
export const BusinessInsightsCard: React.FC<BusinessInsightsCardProps> = ({
	insights,
	outcome,
	subtitle,
	conversionTrend,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const thresholds = useSettingsStore(selectThresholds);
	const conversionBand = bandFor(
		outcome.conversionRate,
		bandsFor(thresholds, 'business', 'conversionRate')
	);

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
							{t('businessInsights.title')}
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
					</div>
					<ThemeIcon size='lg' color='teal' radius='md'>
						<IconChartHistogram size={20} />
					</ThemeIcon>
				</Group>

				<div>
					<Group gap='xs' align='baseline'>
						<Text fw={700} size='xl'>
							{outcome.conversionRate}%
						</Text>
						<Text size='sm' c='dimmed'>
							{t('businessInsights.conversionRate')}
						</Text>
						<Badge
							size='xs'
							variant='light'
							color={SCORE_BAND_COLOR[conversionBand]}
						>
							{t(
								conversionBand === 'good'
									? 'bands.onTarget'
									: conversionBand === 'warning'
										? 'bands.watch'
										: 'bands.atRisk'
							)}
						</Badge>
					</Group>
					<Text size='xs' c='dimmed'>
						{t('businessInsights.offers', {
							converted: outcome.converted,
							offers: outcome.offersPresented,
						})}
					</Text>
					{conversionTrend && <TrendIndicator trend={conversionTrend} />}
				</div>

				<Divider />

				<Stack gap='sm'>
					{insights.map((insight) => {
						const meta = TREND_META[insight.trend];
						const TrendIcon = meta.icon;
						const alerting =
							insight.percentage >=
							thresholds.business.signalAlertShare[
								SIGNAL_SETTING_KEY[insight.type]
							];
						return (
							<Tooltip
								key={insight.type}
								label={insight.description}
								withArrow
								multiline
								w={240}
							>
								<Group justify='space-between' wrap='nowrap'>
									<Text size='sm' fw={500}>
										{t(`businessInsights.signals.${SIGNAL_KEY[insight.type]}`)}
									</Text>
									<Group gap={6} wrap='nowrap'>
										{alerting && (
											<Tooltip
												label={t('businessInsights.signalAlert')}
												withArrow
											>
												<ThemeIcon size='xs' variant='transparent' color='red'>
													<IconAlertTriangle size={12} />
												</ThemeIcon>
											</Tooltip>
										)}
										<Text size='sm' fw={600} c={alerting ? 'red' : undefined}>
											{t('businessInsights.signalCalls', {
												count: insight.count,
											})}
										</Text>
										<ThemeIcon size='xs' variant='light' color={meta.color}>
											<TrendIcon size={12} />
										</ThemeIcon>
									</Group>
								</Group>
							</Tooltip>
						);
					})}
				</Stack>
			</Stack>
		</Card>
	);
};

export default BusinessInsightsCard;

import { Alert, Grid, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import KpiRow from './KpiRow';
import SentimentTrendCard from './SentimentTrendCard';
import SentimentOverviewCard from './SentimentOverviewCard';
import CampaignComparisonCard from './CampaignComparisonCard';
import AgentPerformanceCard from './AgentPerformanceCard';
import ToneConsistencyCard from './ToneConsistencyCard';
import EmotionDistributionCard from './EmotionDistributionCard';
import { useEmotionSentimentMetrics } from '../useEmotionSentimentMetrics';
import { useEmotionSentimentFilterStore } from '~/stores/emotionSentimentFilterStore';

export default function GeneralTab() {
	const { t } = useTranslation('qa.emotionSentiment');
	const timeRange = useEmotionSentimentFilterStore((state) => state.timeRange);
	const {
		metricsQuery,
		kpis,
		sentimentTrend,
		sentimentOverview,
		campaignComparison,
		overallPerformance,
		toneConsistency,
		emotionDistribution,
	} = useEmotionSentimentMetrics(timeRange);

	const isLoading = metricsQuery.isLoading;
	const isError = metricsQuery.isError;

	return (
		<Stack gap='md'>
			{isError ? (
				<Alert
					color='red'
					icon={<IconAlertTriangle size={18} />}
					title={t('error.title')}
					variant='light'
				>
					{t('error.message')}
				</Alert>
			) : null}

			{/* KPI Metrics Row */}
			<KpiRow
				kpis={kpis}
				emotionDistribution={emotionDistribution}
				loading={isLoading}
			/>

			{/* Hero Section: Sentiment Trends & Overview */}
			<Grid>
				<Grid.Col span={{ base: 12, sm: 8 }}>
					<SentimentTrendCard data={sentimentTrend} loading={isLoading} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 4 }}>
					<SentimentOverviewCard
						data={sentimentOverview}
						loading={isLoading}
					/>
				</Grid.Col>
			</Grid>

			{/* Campaign & Emotion Analysis */}
			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<CampaignComparisonCard
						data={campaignComparison}
						loading={isLoading}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<EmotionDistributionCard
						data={emotionDistribution}
						loading={isLoading}
					/>
				</Grid.Col>
			</Grid>

			{/* Agent-Level Insights */}
			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<AgentPerformanceCard
						data={overallPerformance}
						loading={isLoading}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<ToneConsistencyCard
						data={toneConsistency}
						loading={isLoading}
					/>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}

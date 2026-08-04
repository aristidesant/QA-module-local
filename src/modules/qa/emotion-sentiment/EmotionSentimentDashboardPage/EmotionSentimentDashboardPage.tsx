import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { Alert, Grid, Stack, Tabs } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import KpiRow from './components/KpiRow';
import TimeRangeControl from './components/TimeRangeControl';
import SentimentTrendCard from './components/SentimentTrendCard';
import SentimentOverviewCard from './components/SentimentOverviewCard';
import CampaignComparisonCard from './components/CampaignComparisonCard';
import AgentPerformanceCard from './components/AgentPerformanceCard';
import ToneConsistencyCard from './components/ToneConsistencyCard';
import EmotionDistributionCard from './components/EmotionDistributionCard';
import { useEmotionSentimentMetrics } from './useEmotionSentimentMetrics';
import { useEmotionSentimentFilterStore } from '~/stores/emotionSentimentFilterStore';

export default function EmotionSentimentDashboardPage() {
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
		<ContentContainer
			contentWidth='full'
			description={t('description')}
			title={t('title')}
			titleRight={<TimeRangeControl />}
		>
			<Tabs defaultValue='general'>
				<Tabs.List>
					<Tabs.Tab value='general'>General</Tabs.Tab>
					<Tabs.Tab value='report'>Report</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='general' pt='md'>
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
						<KpiRow kpis={kpis} loading={isLoading} />

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
				</Tabs.Panel>

				<Tabs.Panel value='report' pt='md'>
					<Stack gap='md'>
						<Alert color='blue' variant='light'>
							Report content coming soon
						</Alert>
					</Stack>
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}

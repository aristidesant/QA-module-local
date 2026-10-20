import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mantine/core';
import { useSettingsStore } from '~/stores/qa/settingsStore';
import {
	HEATMAP_MIN_CALLS,
	PRIMARY_METRIC,
	SENTIMENT_BANDS,
	VIEW_METRICS,
} from '../../constants';
import {
	bucketSeries,
	emotionShares,
	heatmap,
	sentimentBands,
} from '../../helpers';
import SegmentationView from '../Segmentation/SegmentationView';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	BreakdownBars,
	ChartCard,
	DIVERGING,
	Heatmap,
	MetricTileRow,
	Pair,
	SERIES,
	SERIES_CURRENT,
	ShareBar,
	TrendChart,
	TrendSection,
	useMetricTiles,
} from '../charts';

/** Sentiment and emotion: scores over time, sentiment bands, emotion types and when negative calls happen. */
export default function SentimentView() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, filters } = useTeamAnalyticsData();
	const { tile } = useMetricTiles();
	const lowSentiment = useSettingsStore(
		(s) => s.thresholds.sentiment.lowSentimentIncident
	);

	const sides = useMemo(() => {
		const customer = bucketSeries(
			calls,
			'CUSTOMER_SENTIMENT_SCORE',
			filters.granularity
		);
		const agent = bucketSeries(
			calls,
			'AGENT_SENTIMENT_SCORE',
			filters.granularity
		);
		return customer.map((p, i) => ({
			period: p.period,
			customer: p.value,
			agent: agent[i]?.value ?? null,
		}));
	}, [calls, filters.granularity]);

	const customerBands = useMemo(
		() => sentimentBands(calls, 'customer'),
		[calls]
	);
	const agentBands = useMemo(() => sentimentBands(calls, 'agent'), [calls]);
	const emotions = useMemo(() => emotionShares(calls), [calls]);
	const grid = useMemo(
		() =>
			heatmap(
				calls,
				'NEGATIVE_EMOTION_CALL_SHARE',
				calls.some((c) => c.weekday === 0)
			),
		[calls]
	);

	const bandSegments = (rows: typeof customerBands) =>
		SENTIMENT_BANDS.map((band, i) => ({
			key: band.key,
			label: t(`sentimentView.bands.${band.key}`),
			value: rows.find((r) => r.key === band.key)?.count ?? 0,
			color: DIVERGING[i],
		}));

	return (
		<AreaLayout>
			<MetricTileRow
				tiles={[
					tile('CUSTOMER_SENTIMENT_SCORE'),
					tile('AGENT_SENTIMENT_SCORE'),
					tile('NEGATIVE_EMOTION_CALL_SHARE', {
						label: t('sentimentView.negativeCustomer'),
					}),
					tile('AGENT_NEGATIVE_EMOTION_CALL_SHARE', {
						label: t('sentimentView.negativeAgent'),
					}),
					tile('SENTIMENT_RECOVERY_RATE'),
				]}
			/>
			<TrendSection
				metricIds={VIEW_METRICS.sentiment}
				primary={PRIMARY_METRIC.sentiment}
				targetOf={(id) =>
					id === 'CUSTOMER_SENTIMENT_SCORE' || id === 'AGENT_SENTIMENT_SCORE'
						? lowSentiment
						: null
				}
			/>
			<Pair>
				<ChartCard
					title={t('sentimentView.sidesTitle')}
					description={t('sentimentView.trendHint')}
					empty={sides.length === 0}
				>
					<TrendChart
						data={sides}
						metricId='CUSTOMER_SENTIMENT_SCORE'
						series={[
							{
								name: 'customer',
								label: t('sentimentView.customer'),
								color: SERIES_CURRENT,
							},
							{
								name: 'agent',
								label: t('sentimentView.agent'),
								color: SERIES[0],
							},
						]}
					/>
				</ChartCard>
				<ChartCard
					title={t('sentimentView.typeTitle')}
					description={t('sentimentView.typeDescription')}
				>
					<Stack gap='lg'>
						<ShareBar
							title={t('sentimentView.customer')}
							segments={bandSegments(customerBands)}
						/>
						<ShareBar
							title={t('sentimentView.agent')}
							segments={bandSegments(agentBands)}
						/>
					</Stack>
				</ChartCard>
			</Pair>
			<Pair>
				<ChartCard
					title={t('sentimentView.emotionTitle')}
					description={t('sentimentView.emotionDescription')}
				>
					<BreakdownBars
						unit='PERCENT'
						valueLabel={t('sentimentView.customer')}
						secondaryLabel={t('sentimentView.agent')}
						rows={emotions.map((e) => ({
							key: e.emotion,
							label: t(`filters.emotionLabels.${e.emotion}`),
							value: e.customer,
							secondary: e.agent,
						}))}
					/>
				</ChartCard>
				<ChartCard
					title={t('sentimentView.heatmapTitle')}
					description={t('sentimentView.heatmapDescription')}
					footer={t('charts.lowSampleHint', { count: HEATMAP_MIN_CALLS })}
				>
					<Heatmap data={grid} metricId='NEGATIVE_EMOTION_CALL_SHARE' />
				</ChartCard>
			</Pair>
			<SegmentationView
				metricIds={VIEW_METRICS.sentiment}
				primary={PRIMARY_METRIC.sentiment}
			/>
		</AreaLayout>
	);
}

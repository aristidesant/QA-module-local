import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { TimeRange } from '~/stores/emotionSentimentFilterStore';
import { generateMockMetrics } from '../utils/sentimentAggregation';
import type { EmotionSentimentMetrics } from '../utils/types';

export function useEmotionSentimentMetrics(timeRange: TimeRange) {
	const metricsQuery = useQuery<EmotionSentimentMetrics>({
		queryKey: ['qa', 'emotion-sentiment', timeRange],
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			return generateMockMetrics();
		},
		staleTime: 5 * 60 * 1000,
	});

	const data = useMemo(() => {
		if (!metricsQuery.data) {
			return {
				kpis: null,
				sentimentTrend: [],
				sentimentOverview: null,
				campaignComparison: [],
				agentPerformance: [],
				overallPerformance: null,
				toneConsistency: null,
				emotionDistribution: [],
			};
		}

		return {
			kpis: metricsQuery.data.kpis,
			sentimentTrend: metricsQuery.data.sentimentTrend,
			sentimentOverview: metricsQuery.data.sentimentOverview,
			campaignComparison: metricsQuery.data.campaignComparison,
			agentPerformance: metricsQuery.data.agentPerformance,
			overallPerformance: metricsQuery.data.overallPerformance,
			toneConsistency: metricsQuery.data.toneConsistency,
			emotionDistribution: metricsQuery.data.emotionDistribution,
		};
	}, [metricsQuery.data]);

	return {
		metricsQuery,
		...data,
	};
}

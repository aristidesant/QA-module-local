import { generateMockSentimentAnalysis } from '~/modules/evaluations-demo/components/SentimentAnalysisView/mockSentimentData';
import type { EmotionSentimentMetrics, SentimentKpis } from './types';

export function generateMockMetrics(): EmotionSentimentMetrics {
	const mockData = generateMockSentimentAnalysis();

	// Calculate KPIs
	const avgSentimentScore =
		mockData.customerSentiment.reduce((sum, d) => sum + d.score, 0) /
		mockData.customerSentiment.length;
	const positiveCount = mockData.customerSentiment.filter(
		(s) => s.score > 0.3
	).length;
	const negativeCount = mockData.customerSentiment.filter(
		(s) => s.score < -0.3
	).length;
	const totalCount = mockData.customerSentiment.length;

	const kpis: SentimentKpis = {
		avgSentimentScore,
		totalEvaluations: 142,
		positivePercentage: (positiveCount / totalCount) * 100,
		negativePercentage: (negativeCount / totalCount) * 100,
		recoveryRate: mockData.recoveryMetrics.recovered ? 100 : 0,
		avgEmpathyScore: mockData.agentPerformance.empathyScore,
	};

	// Generate sentiment trend data (mock 30 days)
	const sentimentTrend = Array.from({ length: 30 }, (_, i) => ({
		date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0],
		sentiment: Math.sin(i * 0.2) * 0.3 + 0.4 + Math.random() * 0.2,
		evaluations: Math.floor(Math.random() * 10 + 3),
	}));

	// Sentiment overview
	const sentimentOverview = {
		positive: 35,
		neutral: 40,
		negative: 25,
	};

	// Campaign comparison (mock top campaigns)
	const campaignComparison = [
		{
			campaignId: 1,
			campaignName: 'Q3 Support Campaign',
			evaluationCount: 45,
			positivePercentage: 60,
			negativePercentage: 25,
		},
		{
			campaignId: 2,
			campaignName: 'Premium Support Track',
			evaluationCount: 38,
			positivePercentage: 65,
			negativePercentage: 20,
		},
		{
			campaignId: 3,
			campaignName: 'Retention Program',
			evaluationCount: 32,
			positivePercentage: 50,
			negativePercentage: 35,
		},
		{
			campaignId: 4,
			campaignName: 'Onboarding Calls',
			evaluationCount: 27,
			positivePercentage: 70,
			negativePercentage: 18,
		},
	];

	// Agent performance
	const agentPerformance = [
		{
			agentId: 'agent-001',
			agentName: 'Sarah Martinez',
			empathyScore: 92,
			responseEffectiveness: 0.65,
			evaluationCount: 28,
		},
		{
			agentId: 'agent-002',
			agentName: 'James Chen',
			empathyScore: 88,
			responseEffectiveness: 0.58,
			evaluationCount: 24,
		},
		{
			agentId: 'agent-003',
			agentName: 'Maria Garcia',
			empathyScore: 85,
			responseEffectiveness: 0.52,
			evaluationCount: 19,
		},
		{
			agentId: 'agent-004',
			agentName: 'David Wilson',
			empathyScore: 80,
			responseEffectiveness: 0.45,
			evaluationCount: 16,
		},
	];

	// Tone consistency
	const toneConsistency = {
		polite: 88,
		professional: 82,
		empathetic: 85,
		disrespectful: 5,
	};

	// Emotion distribution
	const emotionDistribution = [
		{
			emotion: 'satisfaction' as const,
			count: 58,
			percentage: 41,
			valence: 'positive' as const,
		},
		{
			emotion: 'frustration' as const,
			count: 32,
			percentage: 22,
			valence: 'negative' as const,
		},
		{
			emotion: 'anger' as const,
			count: 18,
			percentage: 13,
			valence: 'negative' as const,
		},
		{
			emotion: 'neutral' as const,
			count: 22,
			percentage: 15,
			valence: 'neutral' as const,
		},
		{
			emotion: 'excitement' as const,
			count: 10,
			percentage: 7,
			valence: 'positive' as const,
		},
		{
			emotion: 'sadness' as const,
			count: 2,
			percentage: 2,
			valence: 'negative' as const,
		},
	];

	return {
		kpis,
		sentimentTrend,
		sentimentOverview,
		campaignComparison,
		agentPerformance,
		toneConsistency,
		emotionDistribution,
	};
}

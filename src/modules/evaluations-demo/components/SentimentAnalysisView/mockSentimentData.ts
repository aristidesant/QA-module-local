import type {
	SentimentAnalysisData,
	Emotion,
	TranscriptTurnWithEmotion,
	SentimentData,
} from './types';

export function generateMockSentimentAnalysis(): SentimentAnalysisData {
	// Mock transcript data with emotions and sentiment
	const mockTranscript: TranscriptTurnWithEmotion[] = [
		{
			id: 't1',
			role: 'agent',
			timestamp: '0:00',
			text: 'Good morning! Thank you for calling. How can I help you today?',
			emotion: 'satisfaction',
			emotionIntensity: 85,
			sentimentScore: 0.7,
		},
		{
			id: 't2',
			role: 'customer',
			timestamp: '0:07',
			text: 'Hi, I had a question about my recent order. It arrived damaged.',
			emotion: 'frustration',
			emotionIntensity: 70,
			sentimentScore: -0.6,
		},
		{
			id: 't3',
			role: 'agent',
			timestamp: '0:18',
			text: "I'm so sorry to hear that. Let me help you right away. Can I get your order number?",
			emotion: 'satisfaction',
			emotionIntensity: 80,
			sentimentScore: 0.6,
		},
		{
			id: 't4',
			role: 'customer',
			timestamp: '0:28',
			text: "Sure, it's order #45821. I've been trying to reach you for two days.",
			emotion: 'anger',
			emotionIntensity: 85,
			sentimentScore: -0.8,
		},
		{
			id: 't5',
			role: 'agent',
			timestamp: '0:42',
			text: "I completely understand your frustration. I'm going to get this resolved for you today.",
			emotion: 'satisfaction',
			emotionIntensity: 90,
			sentimentScore: 0.8,
		},
		{
			id: 't6',
			role: 'customer',
			timestamp: '1:10',
			text: 'Thank you, I appreciate that.',
			emotion: 'satisfaction',
			emotionIntensity: 75,
			sentimentScore: 0.75,
		},
	];

	// Generate emotion timeline data
	const timestamps = [0, 7, 18, 28, 42, 70];
	const agentIntensities = [85, 70, 80, 85, 90, 85];
	const customerIntensities = [50, 70, 75, 110, 75, 50];
	const customerSentiments = [0.2, -0.6, -0.5, -0.8, 0.0, 0.75];

	const agentEmotions = timestamps.map((ts, idx) => ({
		timestamp: ts,
		emotion: (
			[
				'satisfaction',
				'frustration',
				'satisfaction',
				'anger',
				'satisfaction',
				'satisfaction',
			] as Emotion[]
		)[idx],
		intensity: Math.min(100, agentIntensities[idx] || 50),
	}));

	const customerEmotions = timestamps.map((ts, idx) => ({
		timestamp: ts,
		emotion: (
			[
				'neutral',
				'frustration',
				'frustration',
				'anger',
				'frustration',
				'satisfaction',
			] as Emotion[]
		)[idx],
		intensity: Math.min(100, Math.abs(customerIntensities[idx] - 60) || 50),
	}));

	const customerSentiment: SentimentData[] = timestamps.map((ts, idx) => ({
		timestamp: ts,
		score: customerSentiments[idx],
		polarity:
			customerSentiments[idx] > 0.2
				? 'positive'
				: customerSentiments[idx] < -0.2
					? 'negative'
					: 'neutral',
	}));

	// Emotion distribution
	const emotionDistribution = [
		{ emotion: 'satisfaction' as Emotion, percentage: 42, count: 3 },
		{ emotion: 'frustration' as Emotion, percentage: 28, count: 2 },
		{ emotion: 'anger' as Emotion, percentage: 12, count: 1 },
		{ emotion: 'neutral' as Emotion, percentage: 18, count: 1 },
	];

	// Sentiment polarity distribution
	const sentimentPolarity = {
		positive: 45,
		neutral: 15,
		negative: 40,
	};

	// Tone scores
	const toneScores = {
		polite: 92,
		professional: 88,
		empathetic: 95,
	};

	// Recovery metrics
	const recoveryMetrics = {
		startSentiment: 0.2,
		peakNegativeSentiment: -0.8,
		endSentiment: 0.75,
		recoveryTime: 42, // seconds from peak to recovery
		recovered: true,
		improvementDelta: 55, // percentage point improvement
	};

	// Agent performance
	const agentPerformance = {
		empathyScore: 92,
		responseEffectiveness: 65, // sentiment improved by 65%
		issuesAcknowledged: 2,
		totalIssues: 2,
		averageToneScore: 92,
	};

	// Empathy indicators
	const empathyIndicators = [
		{
			phrase: "I'm so sorry to hear that",
			timestamp: '0:18',
			context: 'Responding to damaged order complaint',
		},
		{
			phrase: 'I completely understand your frustration',
			timestamp: '0:42',
			context: 'Acknowledging customer wait time frustration',
		},
		{
			phrase: "I'm going to get this resolved for you today",
			timestamp: '0:45',
			context: 'Committing to immediate action',
		},
	];

	// Key moments
	const keyMoments = [
		{
			timestamp: '0:07',
			timeSeconds: 7,
			type: 'issue' as const,
			description: 'Customer reports damaged item',
		},
		{
			timestamp: '0:28',
			timeSeconds: 28,
			type: 'peak' as const,
			description: 'Customer mentions wait time, frustration peaks',
		},
		{
			timestamp: '0:42',
			timeSeconds: 42,
			type: 'turning-point' as const,
			description: 'Agent empathizes, commits to immediate resolution',
		},
		{
			timestamp: '1:10',
			timeSeconds: 70,
			type: 'resolution' as const,
			description: 'Customer sentiment recovers to satisfied',
		},
	];

	return {
		agentEmotions,
		customerEmotions,
		customerSentiment,
		transcriptWithEmotions: mockTranscript,
		emotionDistribution,
		sentimentPolarity,
		toneScores,
		recoveryMetrics,
		agentPerformance,
		empathyIndicators,
		keyMoments,
		agentAvgEmotion: 'satisfaction',
		customerAvgEmotion: 'frustration',
		agentTrend: 'improving',
		customerTrend: 'improving',
	};
}

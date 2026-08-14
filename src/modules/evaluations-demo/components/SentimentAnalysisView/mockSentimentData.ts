import type {
	SentimentAnalysisData,
	Emotion,
	TranscriptTurnWithEmotion,
	SentimentData,
	SpeechMetrics,
	SentimentInflectionPoint,
} from './types';

function generateSpeechMetrics(): SpeechMetrics {
	const agentWords = [12, 8, 15, 6, 18, 12];
	const customerWords = [0, 11, 8, 14, 8, 5];

	const totalAgentWords = agentWords.reduce((a, b) => a + b, 0);
	const totalCustomerWords = customerWords.reduce((a, b) => a + b, 0);
	const totalWords = totalAgentWords + totalCustomerWords;

	return {
		agentAvgResponseLengthWords: Math.round(
			totalAgentWords / agentWords.length
		),
		agentAvgResponseLengthChars: Math.round(
			(totalAgentWords / agentWords.length) * 5.5
		), // avg 5.5 chars per word
		customerAvgStatementLengthWords: Math.round(
			totalCustomerWords / customerWords.length
		),
		customerAvgStatementLengthChars: Math.round(
			(totalCustomerWords / customerWords.length) * 5.5
		),
		silencePeriods: [
			{ startSeconds: 3, endSeconds: 5, durationSeconds: 2, timestamp: '0:03' },
			{
				startSeconds: 12,
				endSeconds: 14,
				durationSeconds: 2,
				timestamp: '0:12',
			},
			{
				startSeconds: 35,
				endSeconds: 37,
				durationSeconds: 2,
				timestamp: '0:35',
			},
		],
		totalSilenceDurationSeconds: 6,
		avgSilenceDurationSeconds: 2,
		silenceCount: 3,
		talkTimeRatio: {
			agent: Math.round((totalAgentWords / totalWords) * 100),
			customer: Math.round((totalCustomerWords / totalWords) * 100),
		},
		responseLatencies: [
			{ timestamp: '0:18', delaySeconds: 2.5, sentiment: 0.6 },
			{ timestamp: '0:42', delaySeconds: 1.8, sentiment: 0.8 },
		],
		avgResponseLatencySeconds: 2.2,
	};
}

function generateInflectionPoints(): SentimentInflectionPoint[] {
	return [
		{
			id: 'ip1',
			timestamp: '0:07',
			timeSeconds: 7,
			quote: 'It arrived damaged.',
			role: 'customer',
			sentimentBefore: 0.2,
			sentimentAfter: -0.6,
			sentimentDelta: -0.8,
			direction: 'negative',
			impactScore: 80,
			context: 'Customer introduces the problem',
		},
		{
			id: 'ip2',
			timestamp: '0:28',
			timeSeconds: 28,
			quote: "I've been trying to reach you for two days.",
			role: 'customer',
			sentimentBefore: -0.5,
			sentimentAfter: -0.8,
			sentimentDelta: -0.3,
			direction: 'negative',
			impactScore: 30,
			context: 'Frustration escalates due to wait time',
		},
		{
			id: 'ip3',
			timestamp: '0:42',
			timeSeconds: 42,
			quote:
				"I completely understand your frustration. I'm going to get this resolved for you today.",
			role: 'agent',
			sentimentBefore: -0.8,
			sentimentAfter: 0.0,
			sentimentDelta: 0.8,
			direction: 'positive',
			impactScore: 80,
			context: 'Agent empathy and commitment triggers recovery',
		},
		{
			id: 'ip4',
			timestamp: '1:10',
			timeSeconds: 70,
			quote: 'Thank you, I appreciate that.',
			role: 'customer',
			sentimentBefore: 0.0,
			sentimentAfter: 0.75,
			sentimentDelta: 0.75,
			direction: 'positive',
			impactScore: 75,
			context: 'Resolution achieved, customer satisfied',
		},
	];
}

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

	const speechMetrics = generateSpeechMetrics();
	const sentimentInflectionPoints = generateInflectionPoints();

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
		speechMetrics,
		sentimentInflectionPoints,
	};
}

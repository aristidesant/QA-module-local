export type Emotion =
	| 'satisfaction'
	| 'frustration'
	| 'anger'
	| 'neutral'
	| 'excitement'
	| 'sadness';

export type EmotionValence = 'positive' | 'neutral' | 'negative';

export interface SentimentKpis {
	avgSentimentScore: number;
	totalEvaluations: number;
	positivePercentage: number;
	negativePercentage: number;
	recoveryRate: number;
	avgEmpathyScore: number;
}

export interface SentimentTrendPoint {
	date: string;
	sentiment: number;
	evaluations: number;
}

export interface SentimentOverview {
	positive: number;
	neutral: number;
	negative: number;
}

export interface CampaignComparison {
	campaignId: number;
	campaignName: string;
	evaluationCount: number;
	positivePercentage: number;
	negativePercentage: number;
}

export interface AgentPerformance {
	agentId: string;
	agentName: string;
	empathyScore: number;
	responseEffectiveness: number;
	evaluationCount: number;
}

export interface ToneScore {
	polite: number;
	professional: number;
	empathetic: number;
	disrespectful: number;
}

export interface EmotionCount {
	emotion: Emotion;
	count: number;
	percentage: number;
	valence: EmotionValence;
}

export interface OverallPerformance {
	avgEmpathy: number;
	avgEffectiveness: number;
}

export interface EmotionSentimentMetrics {
	kpis: SentimentKpis;
	sentimentTrend: SentimentTrendPoint[];
	sentimentOverview: SentimentOverview;
	campaignComparison: CampaignComparison[];
	agentPerformance: AgentPerformance[];
	overallPerformance: OverallPerformance;
	toneConsistency: ToneScore;
	emotionDistribution: EmotionCount[];
}

export const getEmotionValence = (emotion: Emotion): EmotionValence => {
	switch (emotion) {
		case 'satisfaction':
		case 'excitement':
			return 'positive';
		case 'neutral':
			return 'neutral';
		case 'frustration':
		case 'anger':
		case 'sadness':
			return 'negative';
	}
};

export const getEmotionColor = (valence: EmotionValence): string => {
	switch (valence) {
		case 'positive':
			return 'var(--mantine-color-green-6)';
		case 'neutral':
			return 'var(--mantine-color-gray-6)';
		case 'negative':
			return 'var(--mantine-color-red-6)';
	}
};

export const getEmotionDetails = (
	emotion: Emotion
): { color: string; emoji: string } => {
	switch (emotion) {
		case 'satisfaction':
			return { color: 'var(--mantine-color-green-5)', emoji: '😊' };
		case 'excitement':
			return { color: 'var(--mantine-color-lime-5)', emoji: '🤩' };
		case 'frustration':
			return { color: 'var(--mantine-color-orange-5)', emoji: '😤' };
		case 'anger':
			return { color: 'var(--mantine-color-red-5)', emoji: '😠' };
		case 'sadness':
			return { color: 'var(--mantine-color-indigo-5)', emoji: '😢' };
		case 'neutral':
			return { color: 'var(--mantine-color-gray-5)', emoji: '😐' };
	}
};

export type Emotion =
	| 'satisfaction'
	| 'frustration'
	| 'anger'
	| 'neutral'
	| 'excitement'
	| 'sadness';

export type Tone =
	| 'polite'
	| 'professional'
	| 'empathetic'
	| 'formal'
	| 'casual';

export interface EmotionData {
	timestamp: number;
	emotion: Emotion;
	intensity: number; // 0-100
}

export interface SentimentData {
	timestamp: number;
	score: number; // -1.0 to +1.0
	polarity: 'positive' | 'neutral' | 'negative';
}

export interface TranscriptTurnWithEmotion {
	id: string;
	role: 'agent' | 'customer';
	timestamp: string;
	text: string;
	emotion: Emotion;
	emotionIntensity: number; // 0-100
	sentimentScore: number; // -1.0 to +1.0
}

export interface KeyMoment {
	timestamp: string;
	timeSeconds: number;
	type: 'issue' | 'peak' | 'turning-point' | 'resolution';
	description: string;
}

export interface EmotionDistribution {
	emotion: Emotion;
	percentage: number;
	count: number;
}

export interface SentimentPolarity {
	positive: number; // percentage
	neutral: number; // percentage
	negative: number; // percentage
}

export interface ToneScores {
	polite: number; // 0-100
	professional: number; // 0-100
	empathetic: number; // 0-100
}

export interface RecoveryMetrics {
	startSentiment: number; // -1.0 to +1.0
	peakNegativeSentiment: number;
	endSentiment: number;
	recoveryTime: number; // seconds
	recovered: boolean;
	improvementDelta: number; // percentage point change
}

export interface AgentPerformance {
	empathyScore: number; // 0-100
	responseEffectiveness: number; // -100 to +100 (sentiment change after response)
	issuesAcknowledged: number;
	totalIssues: number;
	averageToneScore: number;
}

export interface EmpathyIndicator {
	phrase: string;
	timestamp: string;
	context: string;
}

export interface SilencePeriod {
	startSeconds: number;
	endSeconds: number;
	durationSeconds: number;
	timestamp: string; // MM:SS format
}

export interface ResponseLatency {
	timestamp: string;
	delaySeconds: number;
	sentiment: number; // -1.0 to +1.0 after response
}

export interface SpeechMetrics {
	agentAvgResponseLengthWords: number;
	agentAvgResponseLengthChars: number;
	customerAvgStatementLengthWords: number;
	customerAvgStatementLengthChars: number;
	silencePeriods: SilencePeriod[];
	totalSilenceDurationSeconds: number;
	avgSilenceDurationSeconds: number;
	silenceCount: number;
	talkTimeRatio: {
		agent: number; // percentage 0-100
		customer: number; // percentage 0-100
	};
	responseLatencies: ResponseLatency[];
	avgResponseLatencySeconds: number;
}

export interface SentimentInflectionPoint {
	id: string;
	timestamp: string; // MM:SS format
	timeSeconds: number;
	quote: string;
	role: 'agent' | 'customer';
	sentimentBefore: number; // -1.0 to +1.0
	sentimentAfter: number; // -1.0 to +1.0
	sentimentDelta: number; // Change magnitude (positive or negative)
	direction: 'positive' | 'negative'; // Direction of shift
	impactScore: number; // 0-100, indicates severity
	context?: string; // Optional explanation
}

export interface SentimentAnalysisData {
	agentEmotions: EmotionData[];
	customerEmotions: EmotionData[];
	customerSentiment: SentimentData[];
	transcriptWithEmotions: TranscriptTurnWithEmotion[];
	emotionDistribution: EmotionDistribution[];
	sentimentPolarity: SentimentPolarity;
	toneScores: ToneScores;
	recoveryMetrics: RecoveryMetrics;
	agentPerformance: AgentPerformance;
	empathyIndicators: EmpathyIndicator[];
	keyMoments: KeyMoment[];
	agentAvgEmotion: Emotion;
	customerAvgEmotion: Emotion;
	agentTrend: 'improving' | 'declining' | 'stable';
	customerTrend: 'improving' | 'declining' | 'stable';
	speechMetrics: SpeechMetrics;
	sentimentInflectionPoints: SentimentInflectionPoint[];
}

export type SentimentCategory = 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive';

export type Emotion =
  | 'ELATION'
  | 'GRATITUDE'
  | 'JOY'
  | 'RELIEF'
  | 'SATISFACTION'
  | 'NEUTRAL'
  | 'SURPRISE'
  | 'FRUSTRATION'
  | 'SADNESS'
  | 'FEAR'
  | 'DISAPPOINTMENT'
  | 'ANGER'
  | 'RAGE';

export const EMOTION_SENTIMENT_MAP: Record<Emotion, SentimentCategory> = {
  RAGE: 'very-negative',
  ANGER: 'very-negative',
  FRUSTRATION: 'negative',
  DISAPPOINTMENT: 'negative',
  SADNESS: 'negative',
  FEAR: 'negative',
  NEUTRAL: 'neutral',
  SURPRISE: 'neutral',
  RELIEF: 'positive',
  SATISFACTION: 'positive',
  GRATITUDE: 'positive',
  JOY: 'very-positive',
  ELATION: 'very-positive',
};

export interface SentimentDistribution {
  'very-negative': { percentage: number; count: number };
  'negative': { percentage: number; count: number };
  'neutral': { percentage: number; count: number };
  'positive': { percentage: number; count: number };
  'very-positive': { percentage: number; count: number };
}

export interface EmotionBreakdown {
  emotion: Emotion;
  percentage: number;
  count: number;
  sentimentCategory: SentimentCategory;
}

export interface DualSentimentData {
  agent: {
    categories: SentimentDistribution;
    emotions: EmotionBreakdown[];
  };
  client: {
    categories: SentimentDistribution;
    emotions: EmotionBreakdown[];
  };
}

export interface TeamBenchmark {
  categories: Record<SentimentCategory, number>;
  emotions: Record<Emotion, number>;
}

export type UserRole = 'agent' | 'supervisor' | 'qa-manager';

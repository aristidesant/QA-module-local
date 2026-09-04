import { DualSentimentData, EmotionBreakdown, SentimentDistribution, TeamBenchmark } from '../types';

const MOCK_AGENT_DATA: DualSentimentData = {
  agent: {
    categories: {
      'very-negative': { percentage: 8, count: 4 },
      'negative': { percentage: 14, count: 7 },
      'neutral': { percentage: 22, count: 11 },
      'positive': { percentage: 28, count: 14 },
      'very-positive': { percentage: 28, count: 14 },
    },
    emotions: [
      { emotion: 'SATISFACTION', percentage: 18, count: 9, sentimentCategory: 'positive' },
      { emotion: 'JOY', percentage: 10, count: 5, sentimentCategory: 'very-positive' },
      { emotion: 'RELIEF', percentage: 7, count: 4, sentimentCategory: 'positive' },
      { emotion: 'NEUTRAL', percentage: 22, count: 11, sentimentCategory: 'neutral' },
      { emotion: 'FRUSTRATION', percentage: 12, count: 6, sentimentCategory: 'negative' },
      { emotion: 'DISAPPOINTMENT', percentage: 8, count: 4, sentimentCategory: 'negative' },
      { emotion: 'SADNESS', percentage: 3, count: 2, sentimentCategory: 'negative' },
    ],
  },
  client: {
    categories: {
      'very-negative': { percentage: 5, count: 2 },
      'negative': { percentage: 10, count: 4 },
      'neutral': { percentage: 18, count: 7 },
      'positive': { percentage: 32, count: 13 },
      'very-positive': { percentage: 35, count: 14 },
    },
    emotions: [
      { emotion: 'GRATITUDE', percentage: 20, count: 8, sentimentCategory: 'positive' },
      { emotion: 'SATISFACTION', percentage: 15, count: 6, sentimentCategory: 'positive' },
      { emotion: 'RELIEF', percentage: 12, count: 5, sentimentCategory: 'positive' },
      { emotion: 'NEUTRAL', percentage: 18, count: 7, sentimentCategory: 'neutral' },
      { emotion: 'FRUSTRATION', percentage: 8, count: 3, sentimentCategory: 'negative' },
      { emotion: 'DISAPPOINTMENT', percentage: 5, count: 2, sentimentCategory: 'negative' },
      { emotion: 'ANGER', percentage: 2, count: 1, sentimentCategory: 'very-negative' },
    ],
  },
};

const MOCK_TEAM_BENCHMARK: TeamBenchmark = {
  categories: {
    'very-negative': 6,
    negative: 11,
    neutral: 20,
    positive: 30,
    'very-positive': 33,
  },
  emotions: {
    RAGE: 0,
    ANGER: 2,
    FRUSTRATION: 11,
    DISAPPOINTMENT: 8,
    SADNESS: 4,
    FEAR: 2,
    NEUTRAL: 20,
    SURPRISE: 4,
    RELIEF: 9,
    SATISFACTION: 16,
    GRATITUDE: 12,
    JOY: 8,
    ELATION: 4,
  },
};

export interface UseAgentSentimentWithTeamAverageResult {
  data: DualSentimentData | null;
  teamBenchmark: TeamBenchmark | null;
  loading: boolean;
  error: Error | null;
}

export function useAgentSentimentWithTeamAverage(
  agentId?: string,
  period?: string
): UseAgentSentimentWithTeamAverageResult {
  // Mock implementation - returns static data immediately
  // Replace with actual API call when backend is ready
  return {
    data: MOCK_AGENT_DATA,
    teamBenchmark: MOCK_TEAM_BENCHMARK,
    loading: false,
    error: null,
  };
}

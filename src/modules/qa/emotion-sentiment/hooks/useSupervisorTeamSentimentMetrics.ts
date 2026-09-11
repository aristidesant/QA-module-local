import { DualSentimentData, TeamBenchmark } from '../types';

const MOCK_TEAM_DATA: DualSentimentData = {
  agent: {
    categories: {
      'very-negative': { percentage: 6, count: 12 },
      'negative': { percentage: 11, count: 22 },
      'neutral': { percentage: 20, count: 40 },
      'positive': { percentage: 30, count: 60 },
      'very-positive': { percentage: 33, count: 66 },
    },
    emotions: [
      { emotion: 'SATISFACTION', percentage: 16, count: 32, sentimentCategory: 'positive' },
      { emotion: 'RELIEF', percentage: 9, count: 18, sentimentCategory: 'positive' },
      { emotion: 'JOY', percentage: 8, count: 16, sentimentCategory: 'very-positive' },
      { emotion: 'NEUTRAL', percentage: 20, count: 40, sentimentCategory: 'neutral' },
      { emotion: 'FRUSTRATION', percentage: 11, count: 22, sentimentCategory: 'negative' },
      { emotion: 'DISAPPOINTMENT', percentage: 7, count: 14, sentimentCategory: 'negative' },
      { emotion: 'SADNESS', percentage: 4, count: 8, sentimentCategory: 'negative' },
    ],
  },
  client: {
    categories: {
      'very-negative': { percentage: 3, count: 6 },
      'negative': { percentage: 9, count: 18 },
      'neutral': { percentage: 15, count: 30 },
      'positive': { percentage: 35, count: 70 },
      'very-positive': { percentage: 38, count: 76 },
    },
    emotions: [
      { emotion: 'GRATITUDE', percentage: 22, count: 44, sentimentCategory: 'positive' },
      { emotion: 'SATISFACTION', percentage: 13, count: 26, sentimentCategory: 'positive' },
      { emotion: 'RELIEF', percentage: 10, count: 20, sentimentCategory: 'positive' },
      { emotion: 'NEUTRAL', percentage: 15, count: 30, sentimentCategory: 'neutral' },
      { emotion: 'FRUSTRATION', percentage: 9, count: 18, sentimentCategory: 'negative' },
      { emotion: 'DISAPPOINTMENT', percentage: 6, count: 12, sentimentCategory: 'negative' },
      { emotion: 'ANGER', percentage: 3, count: 6, sentimentCategory: 'very-negative' },
    ],
  },
};

const MOCK_SYSTEM_BENCHMARK: TeamBenchmark = {
  categories: {
    'very-negative': 5,
    negative: 10,
    neutral: 19,
    positive: 32,
    'very-positive': 34,
  },
  emotions: {
    RAGE: 0,
    ANGER: 2,
    FRUSTRATION: 10,
    DISAPPOINTMENT: 7,
    SADNESS: 3,
    FEAR: 1,
    NEUTRAL: 19,
    SURPRISE: 4,
    RELIEF: 10,
    SATISFACTION: 15,
    GRATITUDE: 20,
    JOY: 9,
    ELATION: 5,
  },
};

export interface UseSupervisorTeamSentimentMetricsResult {
  data: DualSentimentData | null;
  teamBenchmark?: TeamBenchmark | null;
  loading: boolean;
  error: Error | null;
}

export function useSupervisorTeamSentimentMetrics(
  _supervisorId?: string,
  _period?: string
): UseSupervisorTeamSentimentMetricsResult {
  // Mock implementation - returns static data immediately
  // Replace with actual API call when backend is ready
  return {
    data: MOCK_TEAM_DATA,
    teamBenchmark: MOCK_SYSTEM_BENCHMARK,
    loading: false,
    error: null,
  };
}

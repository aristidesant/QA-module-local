import { DualSentimentData } from '../types';

const MOCK_SYSTEM_DATA: DualSentimentData = {
  agent: {
    categories: {
      'very-negative': { percentage: 5, count: 30 },
      'negative': { percentage: 10, count: 60 },
      'neutral': { percentage: 19, count: 114 },
      'positive': { percentage: 32, count: 192 },
      'very-positive': { percentage: 34, count: 204 },
    },
    emotions: [
      { emotion: 'SATISFACTION', percentage: 15, count: 90, sentimentCategory: 'positive' },
      { emotion: 'RELIEF', percentage: 9, count: 54, sentimentCategory: 'positive' },
      { emotion: 'JOY', percentage: 10, count: 60, sentimentCategory: 'very-positive' },
      { emotion: 'NEUTRAL', percentage: 19, count: 114, sentimentCategory: 'neutral' },
      { emotion: 'FRUSTRATION', percentage: 10, count: 60, sentimentCategory: 'negative' },
      { emotion: 'DISAPPOINTMENT', percentage: 7, count: 42, sentimentCategory: 'negative' },
      { emotion: 'SADNESS', percentage: 5, count: 30, sentimentCategory: 'negative' },
    ],
  },
  client: {
    categories: {
      'very-negative': { percentage: 2, count: 12 },
      'negative': { percentage: 8, count: 48 },
      'neutral': { percentage: 13, count: 78 },
      'positive': { percentage: 37, count: 222 },
      'very-positive': { percentage: 40, count: 240 },
    },
    emotions: [
      { emotion: 'GRATITUDE', percentage: 24, count: 144, sentimentCategory: 'positive' },
      { emotion: 'SATISFACTION', percentage: 13, count: 78, sentimentCategory: 'positive' },
      { emotion: 'RELIEF', percentage: 10, count: 60, sentimentCategory: 'positive' },
      { emotion: 'NEUTRAL', percentage: 13, count: 78, sentimentCategory: 'neutral' },
      { emotion: 'FRUSTRATION', percentage: 8, count: 48, sentimentCategory: 'negative' },
      { emotion: 'DISAPPOINTMENT', percentage: 5, count: 30, sentimentCategory: 'negative' },
      { emotion: 'ANGER', percentage: 2, count: 12, sentimentCategory: 'very-negative' },
    ],
  },
};

export interface UseSystemSentimentMetricsResult {
  data: DualSentimentData | null;
  loading: boolean;
  error: Error | null;
}

export function useSystemSentimentMetrics(_period?: string): UseSystemSentimentMetricsResult {
  // Mock implementation - returns static data immediately
  // Replace with actual API call when backend is ready
  return {
    data: MOCK_SYSTEM_DATA,
    loading: false,
    error: null,
  };
}

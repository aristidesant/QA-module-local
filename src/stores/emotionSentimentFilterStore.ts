import { create } from 'zustand';

export type TimeRange = '7d' | '30d' | '90d' | 'custom';

interface EmotionSentimentFilterState {
	timeRange: TimeRange;
	setTimeRange: (range: TimeRange) => void;
}

export const useEmotionSentimentFilterStore =
	create<EmotionSentimentFilterState>((set) => ({
		timeRange: '30d',
		setTimeRange: (range: TimeRange) => set({ timeRange: range }),
	}));

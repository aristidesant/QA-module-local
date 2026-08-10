import { create } from 'zustand';

export type TimeRange = '7d' | '30d' | '90d' | 'custom';

export type EmotionSentimentSubsection =
	| 'general'
	| 'predictive'
	| 'reports'
	| 'benchmarking'
	| 'notifications'
	| 'calls';

interface EmotionSentimentFilterState {
	timeRange: TimeRange;
	setTimeRange: (range: TimeRange) => void;
	activeSubsection: EmotionSentimentSubsection;
	setActiveSubsection: (subsection: EmotionSentimentSubsection) => void;
}

export const useEmotionSentimentFilterStore =
	create<EmotionSentimentFilterState>((set) => ({
		timeRange: '30d',
		setTimeRange: (range: TimeRange) => set({ timeRange: range }),
		activeSubsection: 'general',
		setActiveSubsection: (subsection: EmotionSentimentSubsection) =>
			set({ activeSubsection: subsection }),
	}));

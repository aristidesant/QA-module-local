import { create } from 'zustand';

export type AnalyticsGranularity = 'per-call' | 'daily' | 'weekly' | 'monthly';
export type AnalyticsTab = 'qa' | 'sentiment' | 'compliance';

interface DateRange {
	from: Date;
	to: Date;
}

interface AgentAnalyticsStoreState {
	// Date and time controls
	dateRange: DateRange;
	granularity: AnalyticsGranularity;
	compareWithPrevious: boolean;

	// Tab state
	activeTab: AnalyticsTab;

	// Actions
	setDateRange: (range: DateRange) => void;
	setGranularity: (granularity: AnalyticsGranularity) => void;
	toggleComparison: () => void;
	setActiveTab: (tab: AnalyticsTab) => void;
}

// Helper to get date 7 days ago from today
const getDefaultFromDate = (): Date => {
	const today = new Date();
	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	return sevenDaysAgo;
};

export const useAgentAnalyticsStore = create<AgentAnalyticsStoreState>((set) => ({
	// Default state: last 7 days
	dateRange: {
		from: getDefaultFromDate(),
		to: new Date(),
	},
	granularity: 'daily',
	compareWithPrevious: false,
	activeTab: 'qa',

	// Actions
	setDateRange: (range) => set({ dateRange: range }),
	setGranularity: (granularity) => set({ granularity }),
	toggleComparison: () =>
		set((state) => ({
			compareWithPrevious: !state.compareWithPrevious,
		})),
	setActiveTab: (tab) => set({ activeTab: tab }),
}));

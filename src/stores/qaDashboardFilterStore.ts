import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DashboardTimeRange = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

interface DashboardFilterState {
	timeRange: DashboardTimeRange;
	setTimeRange: (timeRange: DashboardTimeRange) => void;
}

export const useDashboardFilterStore = create<DashboardFilterState>()(
	persist(
		(set) => ({
			timeRange: 'WEEK',
			setTimeRange: (timeRange) => set({ timeRange }),
		}),
		{
			name: 'qa-frontend-service-dashboard-filters',
		}
	)
);

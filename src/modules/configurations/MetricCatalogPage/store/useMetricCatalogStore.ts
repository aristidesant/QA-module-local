import { create } from 'zustand';
import type { ScopeFilter } from '../MetricCatalogPage.types';

export type TimeSeriesFilter = 'all' | 'supported' | 'unsupported';

interface MetricCatalogStoreState {
	scopeFilter: ScopeFilter;
	sourceFilter: string;
	campaignFilter: string | null;
	timeSeriesFilter: TimeSeriesFilter;
	modalOpened: boolean;
	selectedMetricId: number | null;
	setScopeFilter: (value: ScopeFilter) => void;
	setSourceFilter: (value: string) => void;
	setCampaignFilter: (value: string | null) => void;
	setTimeSeriesFilter: (value: TimeSeriesFilter) => void;
	openCreateModal: () => void;
	openEditModal: (metricId: number) => void;
	closeModal: () => void;
	resetFilters: () => void;
}

const initialState = {
	scopeFilter: 'all' as ScopeFilter,
	sourceFilter: 'all',
	campaignFilter: null,
	timeSeriesFilter: 'all' as TimeSeriesFilter,
	modalOpened: false,
	selectedMetricId: null,
};

export const useMetricCatalogStore = create<MetricCatalogStoreState>((set) => ({
	...initialState,
	setScopeFilter: (value) => set({ scopeFilter: value }),
	setSourceFilter: (value) => set({ sourceFilter: value }),
	setCampaignFilter: (value) => set({ campaignFilter: value }),
	setTimeSeriesFilter: (value) => set({ timeSeriesFilter: value }),
	openCreateModal: () =>
		set({
			modalOpened: true,
			selectedMetricId: null,
		}),
	openEditModal: (metricId) =>
		set({
			modalOpened: true,
			selectedMetricId: metricId,
		}),
	closeModal: () =>
		set({
			modalOpened: false,
			selectedMetricId: null,
		}),
	resetFilters: () =>
		set({
			scopeFilter: initialState.scopeFilter,
			sourceFilter: initialState.sourceFilter,
			campaignFilter: initialState.campaignFilter,
			timeSeriesFilter: initialState.timeSeriesFilter,
		}),
}));

export default useMetricCatalogStore;

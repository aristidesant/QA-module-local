import { create } from 'zustand';
import type { AnalyticsTimeRange } from '~/models/AnalyticsDashboard';
import { areLayoutCollectionsEqual } from '../CampaignDashboardViewer.helpers';
import type { ViewerWidgetLayout } from '../types';

interface CampaignDashboardViewerState {
	selectedDashboardId: string | null;
	isEditingLayout: boolean;
	draftLayouts: ViewerWidgetLayout[];
	selectedTimeRange: AnalyticsTimeRange | null;
	comparisonEnabled: boolean;
	showExternalOnly: boolean;
	reset: (selectedDashboardId?: string | null) => void;
	setSelectedDashboardId: (selectedDashboardId: string | null) => void;
	startEditing: (persistedLayouts: ViewerWidgetLayout[]) => void;
	cancelEditing: (persistedLayouts: ViewerWidgetLayout[]) => void;
	stopEditing: () => void;
	syncDraftLayouts: (persistedLayouts: ViewerWidgetLayout[]) => void;
	setDraftLayouts: (draftLayouts: ViewerWidgetLayout[]) => void;
	setSelectedTimeRange: (timeRange: AnalyticsTimeRange | null) => void;
	setComparisonEnabled: (enabled: boolean) => void;
	setShowExternalOnly: (enabled: boolean) => void;
}

const initialState = {
	selectedDashboardId: null as string | null,
	isEditingLayout: false,
	draftLayouts: [] as ViewerWidgetLayout[],
	selectedTimeRange: 'WEEK' as AnalyticsTimeRange,
	comparisonEnabled: true,
	showExternalOnly: false,
};

export const useCampaignDashboardViewerStore =
	create<CampaignDashboardViewerState>((set) => ({
		...initialState,
		reset: (selectedDashboardId = null) =>
			set({
				...initialState,
				selectedDashboardId,
			}),
		setSelectedDashboardId: (selectedDashboardId) =>
			set({ selectedDashboardId }),
		startEditing: (persistedLayouts) =>
			set({
				isEditingLayout: true,
				draftLayouts: persistedLayouts,
			}),
		cancelEditing: (persistedLayouts) =>
			set({
				isEditingLayout: false,
				draftLayouts: persistedLayouts,
			}),
		stopEditing: () =>
			set((state) => ({
				isEditingLayout: false,
				draftLayouts: state.draftLayouts,
			})),
		syncDraftLayouts: (persistedLayouts) =>
			set((state) => {
				if (areLayoutCollectionsEqual(state.draftLayouts, persistedLayouts)) {
					return state;
				}

				return { draftLayouts: persistedLayouts };
			}),
		setDraftLayouts: (draftLayouts) =>
			set((state) =>
				areLayoutCollectionsEqual(state.draftLayouts, draftLayouts)
					? state
					: { draftLayouts }
			),
		setSelectedTimeRange: (timeRange) =>
			set(
				timeRange === null
					? { selectedTimeRange: null, comparisonEnabled: false }
					: { selectedTimeRange: timeRange, comparisonEnabled: true }
			),
		setComparisonEnabled: (enabled) => set({ comparisonEnabled: enabled }),
		setShowExternalOnly: (enabled) => set({ showExternalOnly: enabled }),
	}));

export default useCampaignDashboardViewerStore;

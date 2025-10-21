import { create } from 'zustand';
import type { Campaign } from '../models/CampaignsModel';

interface CampaignsStoreState {
	selectedCampaign: Campaign | null;
	selectedTab: string;
	editCampaign: Boolean;
	contactsVersion: number;
	setEditCampaign: (editCampaign: Boolean) => void;
	setSelectedTab: (tab: string) => void;
	selectCampaign: (campaign: Campaign | null) => void;
	rightComponent: React.ReactNode;
	setRightComponent: (component: React.ReactNode) => void;
	invalidateContacts: () => void;
	resetView: () => void;
}

export const useCampaignsStore = create<CampaignsStoreState>((set) => ({
	editCampaign: false,
	setEditCampaign: (editCampaign) => set({ editCampaign }),
	selectedCampaign: null,
	selectCampaign: (campaign) => set({ selectedCampaign: campaign }),
	selectedTab: 'general',
	rightComponent: null,
	contactsVersion: 0,
	setSelectedTab: (tab) => set({ selectedTab: tab }),
	setRightComponent: (component) => set({ rightComponent: component }),
	invalidateContacts: () =>
		set((state) => ({ contactsVersion: state.contactsVersion + 1 })),
	resetView: () =>
		set({
			selectedCampaign: null,
			rightComponent: null,
			selectedTab: 'general',
			editCampaign: false,
		}),
}));

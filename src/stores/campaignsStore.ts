import { create } from 'zustand';
import type { Campaign } from '../models/CampaignsModel';
import type ContactGroup from '../models/ContactGroup';

interface CampaignsStoreState {
	selectedCampaign: Campaign | null;
	selectedTab: string;
	editCampaign: Boolean;
	contactsVersion: number;
	selectedVoiceId: string | undefined;
	selectedContactList: ContactGroup | null;
	isContactListDrawerOpen: boolean;
	setEditCampaign: (editCampaign: Boolean) => void;
	setSelectedTab: (tab: string) => void;
	selectCampaign: (campaign: Campaign | null) => void;
	rightComponent: React.ReactNode;
	setRightComponent: (component: React.ReactNode) => void;
	setSelectedContactList: (contactList: ContactGroup | null) => void;
	openContactListDrawer: (contactList: ContactGroup) => void;
	closeContactListDrawer: () => void;
	invalidateContacts: () => void;
	setSelectedVoiceId: (voiceId: string | undefined) => void;
	resetView: () => void;
}

export const useCampaignsStore = create<CampaignsStoreState>((set) => ({
	editCampaign: false,
	setEditCampaign: (editCampaign) => set({ editCampaign }),
	selectedCampaign: null,
	selectCampaign: (campaign) => {
		set((state) => {
			if (!campaign) {
				return { selectedCampaign: null, selectedTab: 'agents' };
			}

			const isSameCampaign =
				state.selectedCampaign?.id &&
				campaign?.id &&
				state.selectedCampaign.id === campaign.id;

			return {
				selectedCampaign: campaign,
				selectedTab: isSameCampaign ? state.selectedTab : 'agents',
			};
		});
	},
	selectedTab: 'agents',
	rightComponent: null,
	contactsVersion: 0,
	selectedVoiceId: undefined,
	selectedContactList: null,
	isContactListDrawerOpen: false,
	setSelectedTab: (tab) => set({ selectedTab: tab }),
	setRightComponent: (component) => set({ rightComponent: component }),
	setSelectedContactList: (contactList) =>
		set({ selectedContactList: contactList }),
	openContactListDrawer: (contactList) =>
		set({
			selectedContactList: contactList,
			isContactListDrawerOpen: true,
		}),
	closeContactListDrawer: () =>
		set({
			selectedContactList: null,
			isContactListDrawerOpen: false,
		}),
	invalidateContacts: () =>
		set((state) => ({ contactsVersion: state.contactsVersion + 1 })),
	setSelectedVoiceId: (voiceId) => set({ selectedVoiceId: voiceId }),
	resetView: () =>
		set({
			selectedCampaign: null,
			rightComponent: null,
			selectedTab: 'agents',
			editCampaign: false,
			selectedVoiceId: undefined,
			selectedContactList: null,
			isContactListDrawerOpen: false,
		}),
}));

import { create } from 'zustand';
import { ReactNode } from 'react';

interface CampaignContactListState {
	rightComponent: ReactNode | null;
	setRightComponent: (component: ReactNode | null) => void;
}

export const useCampaignContactListStore = create<CampaignContactListState>(
	(set) => ({
		rightComponent: null,
		setRightComponent: (component) => set({ rightComponent: component }),
	})
);

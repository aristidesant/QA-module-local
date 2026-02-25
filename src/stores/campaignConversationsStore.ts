import { create } from 'zustand';
import { ReactNode } from 'react';

interface CampaignConversationsState {
	rightComponent: ReactNode | null;
	selectedConversationId: number | null;
	setRightComponent: (component: ReactNode | null) => void;
	setSelectedConversationId: (id: number | null) => void;
	reset: () => void;
}

export const useCampaignConversationsStore = create<CampaignConversationsState>(
	(set) => ({
		rightComponent: null,
		selectedConversationId: null,
		setRightComponent: (component) => set({ rightComponent: component }),
		setSelectedConversationId: (id) => set({ selectedConversationId: id }),
		reset: () => set({ rightComponent: null, selectedConversationId: null }),
	})
);

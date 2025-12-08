import { create } from 'zustand';

interface ClientsPageState {
	rightComponent: React.ReactNode | null;
	setRightComponent: (component: React.ReactNode) => void;
	clearRightComponent: () => void;
}

export const useClientsPageStore = create<ClientsPageState>((set) => ({
	rightComponent: null,
	setRightComponent: (component) => set({ rightComponent: component }),
	clearRightComponent: () => set({ rightComponent: null }),
}));

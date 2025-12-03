import { create } from 'zustand';
import type { ReactNode } from 'react';

export interface RolesPageState {
	rightComponent: ReactNode | null;
	setRightComponent: (component: ReactNode | null) => void;
	clearRightComponent: () => void;
}

const useRolesPageStore = create<RolesPageState>((set) => ({
	rightComponent: null,
	setRightComponent: (component) => set({ rightComponent: component }),
	clearRightComponent: () => set({ rightComponent: null }),
}));

export default useRolesPageStore;

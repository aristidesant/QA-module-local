import { create } from 'zustand';
import type { ReactNode } from 'react';

interface UsersPageState {
	rightComponent: ReactNode | null;
	setRightComponent: (component: ReactNode | null) => void;
	clearRightComponent: () => void;
}

const useUsersPageStore = create<UsersPageState>((set) => ({
	rightComponent: null,
	setRightComponent: (component) => set({ rightComponent: component }),
	clearRightComponent: () => set({ rightComponent: null }),
}));

export default useUsersPageStore;

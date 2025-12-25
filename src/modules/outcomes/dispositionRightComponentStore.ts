import type { ReactNode } from 'react';
import { create } from 'zustand';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';

interface DispositionStore {
	rightComponent: ReactNode;
	setRightComponent: (component: ReactNode) => void;
	clearRightComponent: () => void;
	catalog: DispositionCatalogModel | null;
	setCatalog: (catalog: DispositionCatalogModel) => void;
	clearCatalog: () => void;
}

export const useDispositionStore = create<DispositionStore>((set) => ({
	rightComponent: null,
	setRightComponent: (component) => set({ rightComponent: component }),
	clearRightComponent: () => set({ rightComponent: null }),
	catalog: null,
	setCatalog: (catalog) => set({ catalog }),
	clearCatalog: () => set({ catalog: null }),
}));

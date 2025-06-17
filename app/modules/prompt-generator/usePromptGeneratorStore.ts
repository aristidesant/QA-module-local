import { create } from 'zustand';
import type { ReactNode } from 'react';

interface PromptGeneratorStore {
  rightComponent: ReactNode | null;
  setRightComponent: (component: ReactNode | null) => void;
  clearRightComponent: () => void;
}

export const usePromptGeneratorStore = create<PromptGeneratorStore>((set) => ({
  rightComponent: null,
  
  setRightComponent: (component) => set({ rightComponent: component }),
  
  clearRightComponent: () => set({ rightComponent: null }),
}));

import type { ReactNode } from "react";
import { create } from "zustand";

interface PromptFormStore {
  rightComponent: ReactNode | undefined;
  setRightComponent: (component: ReactNode | undefined) => void;
  resetRightComponent: () => void;
}

const usePromptFormStore = create<PromptFormStore>((set) => ({
  rightComponent: undefined,
  setRightComponent: (component) => set({ rightComponent: component }),
  resetRightComponent: () => set({ rightComponent: undefined }),
}));

export default usePromptFormStore;

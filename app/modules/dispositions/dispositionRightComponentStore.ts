import type { ReactNode } from "react";
import { create } from "zustand";

interface DispositionRightComponentStore {
  rightComponent: ReactNode;
  setRightComponent: (component: ReactNode) => void;
  clearRightComponent: () => void;
}

export const useDispositionRightComponentStore =
  create<DispositionRightComponentStore>((set) => ({
    rightComponent: null,
    setRightComponent: (component) => set({ rightComponent: component }),
    clearRightComponent: () => set({ rightComponent: null }),
  }));

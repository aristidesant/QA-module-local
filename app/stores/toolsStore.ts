import type { ReactNode } from "react";
import { create } from "zustand";
import type { ToolCategoryModel } from "~/models/ToolCategoryModel";

interface ToolsStoreState {
  selectedToolCategory: ToolCategoryModel | null;
  rightComponent: ReactNode | null;
  setToolsCategory: (
    category: ToolCategoryModel | null,
    rightComponent: ReactNode | null
  ) => void;
}

const useToolsStore = create<ToolsStoreState>((set) => ({
  selectedToolCategory: null,
  rightComponent: null,
  setToolsCategory: (category, rightComponent) =>
    set({
      selectedToolCategory: category,
      rightComponent,
    }),
}));

export default useToolsStore;

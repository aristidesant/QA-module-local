import { create, type StateCreator } from 'zustand';
import type { ReactNode } from 'react';

export interface KnowledgeBaseItem {
  id: string;
  name: string;
  description?: string;
}

type RightComponent = ReactNode | null;

interface KnowledgeBaseState {
  items: KnowledgeBaseItem[];
  selectedId?: string | null;
  rightComponent: RightComponent;
  addItem: (item: KnowledgeBaseItem) => void;
  selectItem: (id?: string | null) => void;
  setRightComponent: (c: RightComponent) => void;
  clearRightComponent: () => void;
}
const storeCreator: StateCreator<KnowledgeBaseState> = (set) => ({
  items: [],
  selectedId: null,
  rightComponent: null,
  addItem: (item: KnowledgeBaseItem) =>
    set((s: KnowledgeBaseState) => ({ items: [item, ...s.items], selectedId: item.id })),
  selectItem: (id?: string | null) => set(() => ({ selectedId: id ?? null })),
  setRightComponent: (c: RightComponent) => set(() => ({ rightComponent: c })),
  clearRightComponent: () => set(() => ({ rightComponent: null })),
});

export const useKnowledgeBaseStore = create<KnowledgeBaseState>(storeCreator);

export default useKnowledgeBaseStore;

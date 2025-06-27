import { create } from 'zustand';
import { type ReactNode } from 'react';

type ConversationStore = {
  selectedId: number | null;
  selectionContent: ReactNode | null;
  setSelection: (id: number, content: ReactNode) => void;
  clearSelection: () => void;
};

export const useConversationStore = create<ConversationStore>((set) => ({
  selectedId: null,
  selectionContent: null,
  setSelection: (id, content) => set({ selectedId: id, selectionContent: content }),
  clearSelection: () => set({ selectedId: null, selectionContent: null }),
}));

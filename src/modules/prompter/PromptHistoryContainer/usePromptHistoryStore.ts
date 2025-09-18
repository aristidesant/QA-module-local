import { create } from 'zustand';
import type { Prompt } from '~/models/PromptModel';

interface PromptHistoryStore {
	// Modal state
	viewModalOpened: boolean;
	editModalOpened: boolean;
	selectedPrompt: Prompt | null;

	// Filter state
	searchTerm: string;
	statusFilter: string | null;

	// Actions
	openViewModal: (prompt: Prompt) => void;
	closeViewModal: () => void;
	openEditModal: (prompt: Prompt) => void;
	closeEditModal: () => void;
	setSearchTerm: (term: string) => void;
	setStatusFilter: (status: string | null) => void;
	clearFilters: () => void;
}

export const usePromptHistoryStore = create<PromptHistoryStore>((set) => ({
	// Initial state
	viewModalOpened: false,
	editModalOpened: false,
	selectedPrompt: null,
	searchTerm: '',
	statusFilter: null,

	// Modal actions
	openViewModal: (prompt) =>
		set({
			selectedPrompt: prompt,
			viewModalOpened: true,
		}),
	closeViewModal: () =>
		set({
			viewModalOpened: false,
			selectedPrompt: null,
		}),
	openEditModal: (prompt) =>
		set({
			selectedPrompt: prompt,
			editModalOpened: true,
		}),
	closeEditModal: () =>
		set({
			editModalOpened: false,
			selectedPrompt: null,
		}),

	// Filter actions
	setSearchTerm: (term) => set({ searchTerm: term }),
	setStatusFilter: (status) => set({ statusFilter: status }),
	clearFilters: () => set({ searchTerm: '', statusFilter: null }),
}));

import { create } from 'zustand';

interface KnowledgeBaseSelectionState {
	/** Set of selected knowledge base IDs */
	selectedIds: Set<number>;
	/** Search term for filtering */
	searchTerm: string;
	/** Type filter: 'ALL' | 'URL' | 'TEXT' | 'FILE' */
	typeFilter: 'ALL' | 'URL' | 'TEXT' | 'FILE';

	/** Initialize with given IDs */
	initializeSelection: (ids: number[]) => void;
	/** Toggle a single KB selection */
	toggleSelection: (id: number) => void;
	/** Set selection state for a specific ID */
	setSelected: (id: number, selected: boolean) => void;
	/** Select all given IDs */
	selectAll: (ids: number[]) => void;
	/** Deselect all given IDs */
	deselectAll: (ids: number[]) => void;
	/** Add a newly created KB to selection */
	addToSelection: (id: number) => void;
	/** Set search term */
	setSearchTerm: (term: string) => void;
	/** Set type filter */
	setTypeFilter: (type: 'ALL' | 'URL' | 'TEXT' | 'FILE') => void;
	/** Get selected IDs as array */
	getSelectedArray: () => number[];
	/** Reset all state */
	reset: () => void;
}

const initialState = {
	selectedIds: new Set<number>(),
	searchTerm: '',
	typeFilter: 'ALL' as const,
};

export const useKnowledgeBaseSelectionStore =
	create<KnowledgeBaseSelectionState>((set, get) => ({
		...initialState,

		initializeSelection: (ids) =>
			set({ selectedIds: new Set(ids.map(Number)) }),

		toggleSelection: (id) =>
			set((state) => {
				const numId = Number(id);
				const next = new Set(state.selectedIds);
				if (next.has(numId)) {
					next.delete(numId);
				} else {
					next.add(numId);
				}
				return { selectedIds: next };
			}),

		setSelected: (id, selected) =>
			set((state) => {
				const numId = Number(id);
				const next = new Set(state.selectedIds);
				if (selected) {
					next.add(numId);
				} else {
					next.delete(numId);
				}
				return { selectedIds: next };
			}),

		selectAll: (ids) =>
			set((state) => {
				const next = new Set(state.selectedIds);
				ids.forEach((id) => next.add(Number(id)));
				return { selectedIds: next };
			}),

		deselectAll: (ids) =>
			set((state) => {
				const next = new Set(state.selectedIds);
				ids.forEach((id) => next.delete(Number(id)));
				return { selectedIds: next };
			}),

		addToSelection: (id) =>
			set((state) => {
				const next = new Set(state.selectedIds);
				next.add(Number(id));
				return { selectedIds: next };
			}),

		setSearchTerm: (term) => set({ searchTerm: term }),

		setTypeFilter: (type) => set({ typeFilter: type }),

		getSelectedArray: () => Array.from(get().selectedIds),

		reset: () =>
			set({
				selectedIds: new Set<number>(),
				searchTerm: '',
				typeFilter: 'ALL',
			}),
	}));

import { create } from 'zustand';

type ModalView = 'list' | 'create';

interface KnowledgeBaseModalState {
	/** Current view in the modal */
	view: ModalView;
	/** ID of the newly created knowledge base to auto-select */
	newlyCreatedId: number | null;

	/** Switch to create view */
	showCreateView: () => void;
	/** Switch to list view */
	showListView: () => void;
	/** Set the newly created knowledge base ID */
	setNewlyCreatedId: (id: number | null) => void;
	/** Reset modal state */
	reset: () => void;
}

const initialState = {
	view: 'list' as ModalView,
	newlyCreatedId: null as number | null,
};

export const useKnowledgeBaseModalStore = create<KnowledgeBaseModalState>(
	(set) => ({
		...initialState,

		showCreateView: () => set({ view: 'create' }),
		showListView: () => set({ view: 'list' }),
		setNewlyCreatedId: (id) => set({ newlyCreatedId: id }),
		reset: () => set(initialState),
	})
);

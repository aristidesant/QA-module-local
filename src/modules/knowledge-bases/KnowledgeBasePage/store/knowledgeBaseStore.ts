import { create } from 'zustand';

type KnowledgeBaseDrawerMode = 'create' | 'edit';

interface KnowledgeBaseState {
	opened: boolean;
	mode: KnowledgeBaseDrawerMode;
	selectedId: number | null;
	openCreate: () => void;
	openEdit: (id: number) => void;
	closeDrawer: () => void;
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set) => ({
	opened: false,
	mode: 'create',
	selectedId: null,
	openCreate: () =>
		set({
			opened: true,
			mode: 'create',
			selectedId: null,
		}),
	openEdit: (id) =>
		set({
			opened: true,
			mode: 'edit',
			selectedId: id,
		}),
	closeDrawer: () =>
		set({
			opened: false,
			mode: 'create',
			selectedId: null,
		}),
}));

export default useKnowledgeBaseStore;

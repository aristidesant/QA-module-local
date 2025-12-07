import { create } from 'zustand';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';

interface ToolsStoreState {
	selectedToolCategory: ToolCategoryModel | null;
	setToolsCategory: (category: ToolCategoryModel | null) => void;
}

const useToolsStore = create<ToolsStoreState>((set) => ({
	selectedToolCategory: null,
	setToolsCategory: (category) =>
		set({
			selectedToolCategory: category,
		}),
}));

export default useToolsStore;

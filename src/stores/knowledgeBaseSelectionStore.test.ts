import { describe, it, expect, beforeEach } from 'vitest';
import { useKnowledgeBaseSelectionStore } from './knowledgeBaseSelectionStore';

describe('knowledgeBaseSelectionStore', () => {
	beforeEach(() => {
		useKnowledgeBaseSelectionStore.getState().reset();
	});

	describe('initializeSelection', () => {
		it('sets selected IDs from array', () => {
			useKnowledgeBaseSelectionStore.getState().initializeSelection([1, 2, 3]);

			const state = useKnowledgeBaseSelectionStore.getState();
			expect(state.selectedIds.has(1)).toBe(true);
			expect(state.selectedIds.has(2)).toBe(true);
			expect(state.selectedIds.has(3)).toBe(true);
			expect(state.selectedIds.size).toBe(3);
		});

		it('replaces existing selection', () => {
			useKnowledgeBaseSelectionStore.getState().initializeSelection([1, 2]);
			useKnowledgeBaseSelectionStore.getState().initializeSelection([3, 4]);

			const state = useKnowledgeBaseSelectionStore.getState();
			expect(state.selectedIds.has(1)).toBe(false);
			expect(state.selectedIds.has(3)).toBe(true);
			expect(state.selectedIds.size).toBe(2);
		});
	});

	describe('toggleSelection', () => {
		it('adds ID when not selected', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.toggleSelection(1);

			expect(useKnowledgeBaseSelectionStore.getState().selectedIds.has(1)).toBe(
				true
			);
		});

		it('removes ID when already selected', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.initializeSelection([1, 2, 3]);
			store.toggleSelection(2);

			const state = useKnowledgeBaseSelectionStore.getState();
			expect(state.selectedIds.has(1)).toBe(true);
			expect(state.selectedIds.has(2)).toBe(false);
			expect(state.selectedIds.has(3)).toBe(true);
		});
	});

	describe('setSelected', () => {
		it('adds ID when selected is true', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.setSelected(1, true);

			expect(useKnowledgeBaseSelectionStore.getState().selectedIds.has(1)).toBe(
				true
			);
		});

		it('removes ID when selected is false', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.initializeSelection([1, 2]);
			store.setSelected(1, false);

			const state = useKnowledgeBaseSelectionStore.getState();
			expect(state.selectedIds.has(1)).toBe(false);
			expect(state.selectedIds.has(2)).toBe(true);
		});
	});

	describe('selectAll', () => {
		it('adds all provided IDs to selection', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.initializeSelection([1]);
			store.selectAll([2, 3, 4]);

			const state = useKnowledgeBaseSelectionStore.getState();
			expect(state.selectedIds.size).toBe(4);
			expect(state.selectedIds.has(1)).toBe(true);
			expect(state.selectedIds.has(2)).toBe(true);
			expect(state.selectedIds.has(3)).toBe(true);
			expect(state.selectedIds.has(4)).toBe(true);
		});
	});

	describe('deselectAll', () => {
		it('removes all provided IDs from selection', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.initializeSelection([1, 2, 3, 4]);
			store.deselectAll([2, 3]);

			const state = useKnowledgeBaseSelectionStore.getState();
			expect(state.selectedIds.size).toBe(2);
			expect(state.selectedIds.has(1)).toBe(true);
			expect(state.selectedIds.has(2)).toBe(false);
			expect(state.selectedIds.has(3)).toBe(false);
			expect(state.selectedIds.has(4)).toBe(true);
		});
	});

	describe('addToSelection', () => {
		it('adds a single ID to selection', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.addToSelection(5);

			expect(useKnowledgeBaseSelectionStore.getState().selectedIds.has(5)).toBe(
				true
			);
		});
	});

	describe('setSearchTerm', () => {
		it('updates search term', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.setSearchTerm('test search');

			expect(useKnowledgeBaseSelectionStore.getState().searchTerm).toBe(
				'test search'
			);
		});
	});

	describe('setTypeFilter', () => {
		it('updates type filter', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.setTypeFilter('URL');

			expect(useKnowledgeBaseSelectionStore.getState().typeFilter).toBe('URL');
		});

		it('accepts all valid filter values', () => {
			const store = useKnowledgeBaseSelectionStore.getState();

			store.setTypeFilter('FILE');
			expect(useKnowledgeBaseSelectionStore.getState().typeFilter).toBe('FILE');

			store.setTypeFilter('TEXT');
			expect(useKnowledgeBaseSelectionStore.getState().typeFilter).toBe('TEXT');

			store.setTypeFilter('ALL');
			expect(useKnowledgeBaseSelectionStore.getState().typeFilter).toBe('ALL');
		});
	});

	describe('getSelectedArray', () => {
		it('returns selected IDs as array', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.initializeSelection([1, 2, 3]);

			const result = useKnowledgeBaseSelectionStore
				.getState()
				.getSelectedArray();
			expect(result).toHaveLength(3);
			expect(result).toContain(1);
			expect(result).toContain(2);
			expect(result).toContain(3);
		});

		it('returns empty array when nothing selected', () => {
			const result = useKnowledgeBaseSelectionStore
				.getState()
				.getSelectedArray();
			expect(result).toHaveLength(0);
		});
	});

	describe('reset', () => {
		it('resets all state to initial values', () => {
			const store = useKnowledgeBaseSelectionStore.getState();
			store.initializeSelection([1, 2, 3]);
			store.setSearchTerm('test');
			store.setTypeFilter('URL');

			store.reset();

			const state = useKnowledgeBaseSelectionStore.getState();
			expect(state.selectedIds.size).toBe(0);
			expect(state.searchTerm).toBe('');
			expect(state.typeFilter).toBe('ALL');
		});
	});
});

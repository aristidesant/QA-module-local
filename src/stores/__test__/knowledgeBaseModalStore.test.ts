import { describe, it, expect, beforeEach } from 'vitest';
import { useKnowledgeBaseModalStore } from '../knowledgeBaseModalStore';

describe('knowledgeBaseModalStore', () => {
	beforeEach(() => {
		useKnowledgeBaseModalStore.getState().reset();
	});

	describe('initial state', () => {
		it('starts with list view', () => {
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});

		it('starts with no newly created ID', () => {
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBeNull();
		});

		it('has all required actions defined', () => {
			const state = useKnowledgeBaseModalStore.getState();
			expect(typeof state.showCreateView).toBe('function');
			expect(typeof state.showListView).toBe('function');
			expect(typeof state.setNewlyCreatedId).toBe('function');
			expect(typeof state.reset).toBe('function');
		});
	});

	describe('showCreateView', () => {
		it('changes view to create', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('create');
		});

		it('can be called multiple times without issues', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().showCreateView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('create');
		});

		it('does not affect newlyCreatedId', () => {
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(999);
			useKnowledgeBaseModalStore.getState().showCreateView();
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(999);
		});
	});

	describe('showListView', () => {
		it('changes view to list', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().showListView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});

		it('can be called when already in list view', () => {
			useKnowledgeBaseModalStore.getState().showListView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});

		it('does not affect newlyCreatedId', () => {
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(888);
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().showListView();
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(888);
		});
	});

	describe('setNewlyCreatedId', () => {
		it('sets the newly created ID', () => {
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(123);
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(123);
		});

		it('can clear the newly created ID', () => {
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(123);
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(null);
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBeNull();
		});

		it('can update to a different ID', () => {
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(100);
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(200);
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(200);
		});

		it('handles zero as a valid ID', () => {
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(0);
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(0);
		});

		it('handles large IDs', () => {
			const largeId = 999999999;
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(largeId);
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(
				largeId
			);
		});

		it('does not affect the view', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(777);
			expect(useKnowledgeBaseModalStore.getState().view).toBe('create');
		});
	});

	describe('reset', () => {
		it('resets all state to initial values', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(456);

			useKnowledgeBaseModalStore.getState().reset();

			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBeNull();
		});

		it('can be called when already in initial state', () => {
			useKnowledgeBaseModalStore.getState().reset();

			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBeNull();
		});

		it('can be called multiple times', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().reset();
			useKnowledgeBaseModalStore.getState().reset();
			useKnowledgeBaseModalStore.getState().reset();

			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});

		it('resets view even if only view was changed', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().reset();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});

		it('resets newlyCreatedId even if only ID was changed', () => {
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(555);
			useKnowledgeBaseModalStore.getState().reset();
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBeNull();
		});
	});

	describe('view transitions', () => {
		it('supports list -> create -> list flow', () => {
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
			useKnowledgeBaseModalStore.getState().showCreateView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('create');
			useKnowledgeBaseModalStore.getState().showListView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});

		it('supports multiple transitions', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().showListView();
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().showListView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});
	});

	describe('state persistence between actions', () => {
		it('maintains newlyCreatedId through view changes', () => {
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(42);
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().showListView();
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(42);
		});

		it('maintains view through ID changes', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(1);
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(2);
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(null);
			expect(useKnowledgeBaseModalStore.getState().view).toBe('create');
		});
	});

	describe('typical usage scenarios', () => {
		it('simulates opening modal, creating KB, and returning to list', () => {
			// User opens modal (starts in list view)
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');

			// User clicks "Create new"
			useKnowledgeBaseModalStore.getState().showCreateView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('create');

			// Knowledge base is created successfully
			const newKbId = 12345;
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(newKbId);
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(
				newKbId
			);

			// User is returned to list view
			useKnowledgeBaseModalStore.getState().showListView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBe(
				newKbId
			);
		});

		it('simulates user canceling creation and going back', () => {
			// User clicks "Create new"
			useKnowledgeBaseModalStore.getState().showCreateView();

			// User cancels and goes back
			useKnowledgeBaseModalStore.getState().showListView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBeNull();
		});

		it('simulates closing modal resets state', () => {
			// User opens modal and creates KB
			useKnowledgeBaseModalStore.getState().showCreateView();
			useKnowledgeBaseModalStore.getState().setNewlyCreatedId(999);

			// Modal is closed
			useKnowledgeBaseModalStore.getState().reset();

			// Next time modal opens, it should be fresh
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
			expect(useKnowledgeBaseModalStore.getState().newlyCreatedId).toBeNull();
		});
	});
});

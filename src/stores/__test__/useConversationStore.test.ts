import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useConversationStore } from '../useConversationStore';

describe('useConversationStore', () => {
	beforeEach(() => {
		act(() => {
			useConversationStore.getState().clearSelection();
		});
	});

	it('should have initial state', () => {
		const state = useConversationStore.getState();
		expect(state.selectedId).toBeNull();
		expect(state.selectionContent).toBeNull();
	});

	it('should set selection', () => {
		const mockContent = 'Content';
		act(() => {
			useConversationStore.getState().setSelection(123, mockContent);
		});
		const state = useConversationStore.getState();
		expect(state.selectedId).toBe(123);
		expect(state.selectionContent).toBe(mockContent);
	});

	it('should clear selection', () => {
		act(() => {
			useConversationStore.getState().setSelection(123, 'Content');
		});
		act(() => {
			useConversationStore.getState().clearSelection();
		});
		const state = useConversationStore.getState();
		expect(state.selectedId).toBeNull();
		expect(state.selectionContent).toBeNull();
	});
});

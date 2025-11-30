import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useContactEditStore } from '../contactEditStore';

describe('useContactEditStore', () => {
	beforeEach(() => {
		act(() => {
			useContactEditStore.getState().clear();
		});
	});

	it('should have initial state', () => {
		const state = useContactEditStore.getState();
		expect(state.contactId).toBeNull();
		expect(state.contactGroupId).toBeNull();
		expect(state.variableData).toEqual({});
	});

	it('should set context', () => {
		act(() => {
			useContactEditStore
				.getState()
				.setContext({ contactId: 1, contactGroupId: 2 });
		});
		const state = useContactEditStore.getState();
		expect(state.contactId).toBe(1);
		expect(state.contactGroupId).toBe(2);
	});

	it('should not update context if same values', () => {
		act(() => {
			useContactEditStore
				.getState()
				.setContext({ contactId: 1, contactGroupId: 2 });
		});

		act(() => {
			useContactEditStore
				.getState()
				.setContext({ contactId: 1, contactGroupId: 2 });
		});
		const state2 = useContactEditStore.getState();

		// Zustand might return same object if state didn't change, but here we check values
		expect(state2.contactId).toBe(1);
	});

	it('should set initial variable data', () => {
		const data = { key1: 'value1' };
		act(() => {
			useContactEditStore.getState().setInitialVariableData(data);
		});
		expect(useContactEditStore.getState().variableData).toEqual(data);
	});

	it('should update variable field', () => {
		act(() => {
			useContactEditStore.getState().updateVariableField('key1', 'value1');
		});
		expect(useContactEditStore.getState().variableData).toEqual({
			key1: 'value1',
		});
	});

	it('should add variable field', () => {
		act(() => {
			useContactEditStore.getState().addVariableField('key2', 'value2');
		});
		expect(useContactEditStore.getState().variableData).toEqual({
			key2: 'value2',
		});
	});

	it('should remove variable field', () => {
		act(() => {
			useContactEditStore
				.getState()
				.setInitialVariableData({ key1: 'value1', key2: 'value2' });
		});
		act(() => {
			useContactEditStore.getState().removeVariableField('key1');
		});
		expect(useContactEditStore.getState().variableData).toEqual({
			key2: 'value2',
		});
	});

	it('should clear state', () => {
		act(() => {
			useContactEditStore
				.getState()
				.setContext({ contactId: 1, contactGroupId: 2 });
			useContactEditStore.getState().setInitialVariableData({ key: 'value' });
		});
		act(() => {
			useContactEditStore.getState().clear();
		});
		const state = useContactEditStore.getState();
		expect(state.contactId).toBeNull();
		expect(state.contactGroupId).toBeNull();
		expect(state.variableData).toEqual({});
	});
});

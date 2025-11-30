import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useClientStore } from '../clientStore';
import type { ClientModel } from '~/models/ClientModel';

describe('useClientStore', () => {
	beforeEach(() => {
		act(() => {
			useClientStore.setState({
				selectedClient: null,
				searchQuery: '',
			});
		});
	});

	it('should have initial state', () => {
		const state = useClientStore.getState();
		expect(state.selectedClient).toBeNull();
		expect(state.searchQuery).toBe('');
	});

	it('should set selected client', () => {
		const mockClient = { id: 1, name: 'Test Client' } as ClientModel;
		act(() => {
			useClientStore.getState().setSelectedClient(mockClient);
		});
		expect(useClientStore.getState().selectedClient).toEqual(mockClient);
	});

	it('should set search query', () => {
		act(() => {
			useClientStore.getState().setSearchQuery('query');
		});
		expect(useClientStore.getState().searchQuery).toBe('query');
	});
});

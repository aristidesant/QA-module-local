import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
	useClientConfigsStore,
	ConfigFilters,
	PaginationState,
} from '../clientConfigsStore';

describe('useClientConfigsStore', () => {
	const initialFilters: ConfigFilters = {
		search: '',
		type: null,
		sortBy: 'name',
		sortOrder: 'asc',
	};

	const initialPagination: PaginationState = {
		page: 1,
		pageSize: 10,
		total: 0,
	};

	beforeEach(() => {
		act(() => {
			useClientConfigsStore.setState({
				filters: initialFilters,
				pagination: initialPagination,
			});
		});
	});

	it('should have initial state', () => {
		const state = useClientConfigsStore.getState();
		expect(state.filters).toEqual(initialFilters);
		expect(state.pagination).toEqual(initialPagination);
	});

	it('should set filters and reset pagination page', () => {
		const newFilters: ConfigFilters = {
			search: 'test',
			type: 'custom',
			sortBy: 'updatedAt',
			sortOrder: 'desc',
		};

		// Set pagination to something else first
		act(() => {
			useClientConfigsStore.setState({
				pagination: { page: 5, pageSize: 20, total: 100 },
			});
		});

		act(() => {
			useClientConfigsStore.getState().setFilters(newFilters);
		});

		const state = useClientConfigsStore.getState();
		expect(state.filters).toEqual(newFilters);
		expect(state.pagination.page).toBe(1);
		expect(state.pagination.total).toBe(0);
		expect(state.pagination.pageSize).toBe(10);
	});

	it('should set pagination', () => {
		const newPagination: PaginationState = {
			page: 2,
			pageSize: 50,
			total: 200,
		};

		act(() => {
			useClientConfigsStore.getState().setPagination(newPagination);
		});

		expect(useClientConfigsStore.getState().pagination).toEqual(newPagination);
	});

	it('should reset filters', () => {
		// Change state
		act(() => {
			useClientConfigsStore.setState({
				filters: { ...initialFilters, search: 'changed' },
				pagination: { ...initialPagination, page: 2 },
			});
		});

		act(() => {
			useClientConfigsStore.getState().resetFilters();
		});

		const state = useClientConfigsStore.getState();
		expect(state.filters).toEqual(initialFilters);
		expect(state.pagination).toEqual(initialPagination);
	});
});

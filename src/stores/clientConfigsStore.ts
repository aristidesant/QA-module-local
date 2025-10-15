import { create } from 'zustand';

export interface ConfigFilters {
	search: string;
	type: string | null;
	sortBy: 'name' | 'description' | 'type' | 'updatedAt';
	sortOrder: 'asc' | 'desc';
}

export interface PaginationState {
	page: number;
	pageSize: number;
	total: number;
}

interface ClientConfigsStoreState {
	filters: ConfigFilters;
	pagination: PaginationState;
	setFilters: (filters: ConfigFilters) => void;
	setPagination: (pagination: PaginationState) => void;
	resetFilters: () => void;
}

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

export const useClientConfigsStore = create<ClientConfigsStoreState>((set) => ({
	filters: initialFilters,
	pagination: initialPagination,
	setFilters: (filters) =>
		set({
			filters,
			// Reset to first page when filters change
			pagination: { ...initialPagination, total: 0 },
		}),
	setPagination: (pagination) => set({ pagination }),
	resetFilters: () =>
		set({
			filters: initialFilters,
			pagination: initialPagination,
		}),
}));

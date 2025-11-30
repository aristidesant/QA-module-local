import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFilteredClientConfigs } from './useFilteredClientConfigs';
import * as queries from '~/queries/useClientConfigs';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';
import type { ClientConfig, ClientConfigResponse } from '~/models/ClientConfig';

const setPaginationMock = vi.fn();

vi.mock('~/stores/clientConfigsStore', () => ({
	useClientConfigsStore: vi.fn(),
}));

vi.mock('~/queries/useClientConfigs', () => ({
	useClientConfigs: vi.fn(),
}));

const mockedStore = useClientConfigsStore as unknown as ReturnType<
	typeof vi.fn
>;
const mockedUseClientConfigs =
	queries.useClientConfigs as unknown as ReturnType<typeof vi.fn>;

const sampleConfigs: ClientConfig[] = [
	{
		id: 1,
		name: 'alpha_config',
		description: 'Alpha description',
		type: 'string',
		value: 'alpha_value',
		clientId: 1,
		userId: 1,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-15T00:00:00Z',
		deletedAt: null,
	},
	{
		id: 2,
		name: 'beta_config',
		description: 'Beta description',
		type: 'json',
		value: '{"key": "value"}',
		clientId: 1,
		userId: 1,
		createdAt: '2024-01-02T00:00:00Z',
		updatedAt: '2024-01-10T00:00:00Z',
		deletedAt: null,
	},
	{
		id: 3,
		name: 'gamma_config',
		description: 'Gamma description',
		type: 'number',
		value: '42',
		clientId: 1,
		userId: 1,
		createdAt: '2024-01-03T00:00:00Z',
		updatedAt: '2024-01-20T00:00:00Z',
		deletedAt: null,
	},
];

const defaultFilters = {
	search: '',
	type: null,
	sortBy: 'name' as const,
	sortOrder: 'asc' as const,
};

const defaultPagination = {
	page: 1,
	pageSize: 10,
	total: 0,
};

describe('useFilteredClientConfigs', () => {
	beforeEach(() => {
		setPaginationMock.mockReset();
		mockedStore.mockImplementation(() => ({
			filters: defaultFilters,
			pagination: defaultPagination,
			setPagination: setPaginationMock,
		}));
		mockedUseClientConfigs.mockReturnValue({
			data: {
				configs: sampleConfigs,
				total: 3,
				limit: 10,
				offset: 0,
			} as ClientConfigResponse,
			isLoading: false,
		});
	});

	describe('Basic Functionality', () => {
		it('returns all configs when no filters are applied', () => {
			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs).toHaveLength(3);
			expect(result.current.totalConfigs).toBe(3);
			expect(result.current.allConfigsCount).toBe(3);
			expect(result.current.isLoading).toBe(false);
		});

		it('returns loading state when data is loading', () => {
			mockedUseClientConfigs.mockReturnValue({
				data: undefined,
				isLoading: true,
			});

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.isLoading).toBe(true);
			expect(result.current.configs).toHaveLength(0);
		});
	});

	describe('Search Filtering', () => {
		it('filters by name when search term matches', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, search: 'alpha' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs).toHaveLength(1);
			expect(result.current.configs[0].name).toBe('alpha_config');
		});

		it('filters by description when search term matches', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, search: 'Beta description' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs).toHaveLength(1);
			expect(result.current.configs[0].name).toBe('beta_config');
		});

		it('is case insensitive', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, search: 'GAMMA' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs).toHaveLength(1);
			expect(result.current.configs[0].name).toBe('gamma_config');
		});

		it('returns empty when search matches nothing', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, search: 'nonexistent' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs).toHaveLength(0);
		});
	});

	describe('Type Filtering', () => {
		it('filters by type when type filter is set', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, type: 'json' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs).toHaveLength(1);
			expect(result.current.configs[0].type).toBe('json');
		});

		it('returns all configs when type is null', () => {
			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs).toHaveLength(3);
		});
	});

	describe('Combined Filtering', () => {
		it('combines search and type filters', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, search: 'config', type: 'string' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs).toHaveLength(1);
			expect(result.current.configs[0].name).toBe('alpha_config');
		});
	});

	describe('Sorting', () => {
		it('sorts by name ascending by default', () => {
			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs[0].name).toBe('alpha_config');
			expect(result.current.configs[1].name).toBe('beta_config');
			expect(result.current.configs[2].name).toBe('gamma_config');
		});

		it('sorts by name descending', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, sortBy: 'name', sortOrder: 'desc' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs[0].name).toBe('gamma_config');
			expect(result.current.configs[2].name).toBe('alpha_config');
		});

		it('sorts by description ascending', () => {
			mockedStore.mockImplementation(() => ({
				filters: {
					...defaultFilters,
					sortBy: 'description',
					sortOrder: 'asc',
				},
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs[0].description).toBe('Alpha description');
		});

		it('sorts by type ascending', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, sortBy: 'type', sortOrder: 'asc' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			expect(result.current.configs[0].type).toBe('json');
			expect(result.current.configs[1].type).toBe('number');
			expect(result.current.configs[2].type).toBe('string');
		});

		it('sorts by updatedAt descending (recently updated)', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, sortBy: 'updatedAt', sortOrder: 'desc' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			// gamma has the most recent updatedAt
			expect(result.current.configs[0].name).toBe('gamma_config');
		});

		it('sorts by updatedAt ascending (oldest updated)', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, sortBy: 'updatedAt', sortOrder: 'asc' },
				pagination: defaultPagination,
				setPagination: setPaginationMock,
			}));

			const { result } = renderHook(() => useFilteredClientConfigs());

			// beta has the oldest updatedAt
			expect(result.current.configs[0].name).toBe('beta_config');
		});
	});

	describe('Pagination', () => {
		it('passes correct pagination params to API', () => {
			mockedStore.mockImplementation(() => ({
				filters: defaultFilters,
				pagination: { page: 2, pageSize: 5, total: 0 },
				setPagination: setPaginationMock,
			}));

			renderHook(() => useFilteredClientConfigs());

			expect(mockedUseClientConfigs).toHaveBeenCalledWith({
				limit: 5,
				offset: 5, // (page 2 - 1) * pageSize 5
			});
		});

		it('updates pagination total when server total changes', async () => {
			renderHook(() => useFilteredClientConfigs());

			await waitFor(() => {
				expect(setPaginationMock).toHaveBeenCalledWith(
					expect.objectContaining({ total: 3 })
				);
			});
		});
	});
});

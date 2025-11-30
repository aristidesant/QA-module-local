import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usePagination } from './usePagination';

// Mock @mantine/hooks
vi.mock('@mantine/hooks', () => ({
	useDebouncedValue: vi.fn((value: string) => [value]),
}));

describe('usePagination', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('initial state', () => {
		it('should have currentPage set to 1', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.currentPage).toBe(1);
		});

		it('should have default itemsPerPage of 10', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.itemsPerPage).toBe(10);
		});

		it('should have empty searchValue', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.searchValue).toBe('');
		});

		it('should have empty debouncedSearch', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.debouncedSearch).toBe('');
		});

		it('should use custom initialItemsPerPage when provided', () => {
			const { result } = renderHook(() =>
				usePagination({ initialItemsPerPage: 25 })
			);

			expect(result.current.itemsPerPage).toBe(25);
		});
	});

	describe('setCurrentPage', () => {
		it('should update currentPage', () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setCurrentPage(5);
			});

			expect(result.current.currentPage).toBe(5);
		});

		it('should allow setting any page number', () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setCurrentPage(100);
			});

			expect(result.current.currentPage).toBe(100);
		});
	});

	describe('setItemsPerPage', () => {
		it('should update itemsPerPage', () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setItemsPerPage(50);
			});

			expect(result.current.itemsPerPage).toBe(50);
		});

		it('should reset currentPage to 1 when itemsPerPage changes', async () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setCurrentPage(5);
			});

			expect(result.current.currentPage).toBe(5);

			act(() => {
				result.current.setItemsPerPage(25);
			});

			await waitFor(() => {
				expect(result.current.currentPage).toBe(1);
			});
		});
	});

	describe('setSearchValue', () => {
		it('should update searchValue', () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setSearchValue('test search');
			});

			expect(result.current.searchValue).toBe('test search');
		});
	});

	describe('getApiParams', () => {
		it('should return correct limit and offset for first page', () => {
			const { result } = renderHook(() => usePagination());

			const params = result.current.getApiParams();

			expect(params.limit).toBe(10);
			expect(params.offset).toBe(0);
		});

		it('should calculate correct offset for second page', () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setCurrentPage(2);
			});

			const params = result.current.getApiParams();

			expect(params.offset).toBe(10);
		});

		it('should calculate correct offset for custom itemsPerPage', () => {
			const { result } = renderHook(() =>
				usePagination({ initialItemsPerPage: 25 })
			);

			act(() => {
				result.current.setCurrentPage(3);
			});

			const params = result.current.getApiParams();

			expect(params.limit).toBe(25);
			expect(params.offset).toBe(50);
		});

		it('should include name parameter when search has value', () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setSearchValue('test');
			});

			const params = result.current.getApiParams();

			expect(params).toHaveProperty('name', 'test');
		});

		it('should not include name parameter when search is empty', () => {
			const { result } = renderHook(() => usePagination());

			const params = result.current.getApiParams();

			expect(params).not.toHaveProperty('name');
		});

		it('should not include name parameter when search is only whitespace', () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setSearchValue('   ');
			});

			const params = result.current.getApiParams();

			expect(params).not.toHaveProperty('name');
		});

		it('should trim whitespace from search value', () => {
			const { result } = renderHook(() => usePagination());

			act(() => {
				result.current.setSearchValue('  test  ');
			});

			const params = result.current.getApiParams();

			expect(params).toHaveProperty('name', 'test');
		});
	});

	describe('calculateTotalPages', () => {
		it('should calculate total pages correctly', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.calculateTotalPages(100)).toBe(10);
		});

		it('should round up for partial pages', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.calculateTotalPages(15)).toBe(2);
		});

		it('should return 1 for total less than itemsPerPage', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.calculateTotalPages(5)).toBe(1);
		});

		it('should return 0 for total of 0', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.calculateTotalPages(0)).toBe(0);
		});

		it('should use custom itemsPerPage for calculation', () => {
			const { result } = renderHook(() =>
				usePagination({ initialItemsPerPage: 25 })
			);

			expect(result.current.calculateTotalPages(100)).toBe(4);
		});

		it('should handle large numbers', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current.calculateTotalPages(1000)).toBe(100);
		});
	});

	describe('returned functions', () => {
		it('should return all expected functions', () => {
			const { result } = renderHook(() => usePagination());

			expect(typeof result.current.setCurrentPage).toBe('function');
			expect(typeof result.current.setItemsPerPage).toBe('function');
			expect(typeof result.current.setSearchValue).toBe('function');
			expect(typeof result.current.getApiParams).toBe('function');
			expect(typeof result.current.calculateTotalPages).toBe('function');
		});
	});

	describe('returned values', () => {
		it('should return all expected values', () => {
			const { result } = renderHook(() => usePagination());

			expect(result.current).toHaveProperty('currentPage');
			expect(result.current).toHaveProperty('itemsPerPage');
			expect(result.current).toHaveProperty('searchValue');
			expect(result.current).toHaveProperty('debouncedSearch');
		});
	});
});

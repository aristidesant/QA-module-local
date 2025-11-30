import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useContactFilters } from './useContactFilters';

describe('useContactFilters', () => {
	it('updates filters and tracks active state', () => {
		const { result } = renderHook(() => useContactFilters({ debounceMs: 0 }));

		act(() => {
			result.current.setFilter('name', 'Alice');
		});

		expect(result.current.filters.name).toBe('Alice');
		expect(result.current.hasActiveFilters).toBe(true);

		act(() => {
			result.current.clearFilters();
		});

		expect(result.current.filters).toEqual({ name: '', email: '', phone: '' });
		expect(result.current.hasActiveFilters).toBe(false);
	});

	it('debounces change notifications', () => {
		vi.useFakeTimers();
		const onFiltersChange = vi.fn();
		const { result } = renderHook(() =>
			useContactFilters({ onFiltersChange, debounceMs: 100 })
		);

		act(() => {
			result.current.setFilter('email', 'user@example.com');
		});
		expect(onFiltersChange).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(120);
		});

		expect(onFiltersChange).toHaveBeenCalledWith({
			name: '',
			email: 'user@example.com',
			phone: '',
		});
		vi.useRealTimers();
	});
});

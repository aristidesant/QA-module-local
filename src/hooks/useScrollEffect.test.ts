import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useScrollEffect } from './useScrollEffect';
import * as scrollEffectModule from '../utils/ui/scrollEffect';

// Mock the setupScrollEffect function
vi.mock('../utils/ui/scrollEffect', () => ({
	setupScrollEffect: vi.fn(),
}));

describe('useScrollEffect', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('when hook is mounted', () => {
		it('should call setupScrollEffect on mount', () => {
			renderHook(() => useScrollEffect());

			expect(scrollEffectModule.setupScrollEffect).toHaveBeenCalledTimes(1);
		});

		it('should call setupScrollEffect without arguments', () => {
			renderHook(() => useScrollEffect());

			expect(scrollEffectModule.setupScrollEffect).toHaveBeenCalledWith();
		});
	});

	describe('when hook is unmounted', () => {
		it('should not call setupScrollEffect again on unmount', () => {
			const { unmount } = renderHook(() => useScrollEffect());

			expect(scrollEffectModule.setupScrollEffect).toHaveBeenCalledTimes(1);

			unmount();

			// Should still only have been called once (on mount)
			expect(scrollEffectModule.setupScrollEffect).toHaveBeenCalledTimes(1);
		});
	});

	describe('when hook is re-rendered', () => {
		it('should not call setupScrollEffect again on rerender', () => {
			const { rerender } = renderHook(() => useScrollEffect());

			expect(scrollEffectModule.setupScrollEffect).toHaveBeenCalledTimes(1);

			rerender();

			// Should still only have been called once due to empty dependency array
			expect(scrollEffectModule.setupScrollEffect).toHaveBeenCalledTimes(1);
		});
	});

	describe('hook return value', () => {
		it('should return undefined', () => {
			const { result } = renderHook(() => useScrollEffect());

			expect(result.current).toBeUndefined();
		});
	});
});

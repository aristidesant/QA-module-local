import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDispositionLabel } from './useDispositionLabel';

describe('useDispositionLabel', () => {
	describe('when label is empty or invalid', () => {
		it('should return empty string for empty input', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('')).toBe('');
		});

		it('should return null for null input', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current(null as unknown as string)).toBe(null);
		});

		it('should return undefined for undefined input', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current(undefined as unknown as string)).toBe(undefined);
		});

		it('should return non-string values as-is', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current(123 as unknown as string)).toBe(123);
		});
	});

	describe('singular disposition transformations', () => {
		it('should transform "disposition" to "outcome"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('disposition')).toBe('outcome');
		});

		it('should transform "Disposition" to "Outcome"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('Disposition')).toBe('Outcome');
		});

		it('should transform "DISPOSITION" to "OUTCOME"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('DISPOSITION')).toBe('OUTCOME');
		});
	});

	describe('plural disposition transformations', () => {
		it('should transform "dispositions" to "outcomes"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('dispositions')).toBe('outcomes');
		});

		it('should transform "Dispositions" to "Outcomes"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('Dispositions')).toBe('Outcomes');
		});

		it('should transform "DISPOSITIONS" to "OUTCOMES"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('DISPOSITIONS')).toBe('OUTCOMES');
		});
	});

	describe('outcome passthrough', () => {
		it('should transform "outcome" to "outcome"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('outcome')).toBe('outcome');
		});

		it('should transform "Outcome" to "Outcome"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('Outcome')).toBe('Outcome');
		});

		it('should transform "OUTCOME" to "OUTCOME"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('OUTCOME')).toBe('OUTCOME');
		});

		it('should transform "outcomes" to "outcomes"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('outcomes')).toBe('outcomes');
		});

		it('should transform "Outcomes" to "Outcomes"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('Outcomes')).toBe('Outcomes');
		});

		it('should transform "OUTCOMES" to "OUTCOMES"', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('OUTCOMES')).toBe('OUTCOMES');
		});
	});

	describe('word boundary handling', () => {
		it('should not transform disposition within larger words', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('predisposition')).toBe('predisposition');
		});

		it('should transform disposition in sentences', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('Select a disposition')).toBe('Select a outcome');
		});

		it('should transform multiple occurrences', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('Disposition and dispositions')).toBe(
				'Outcome and outcomes'
			);
		});
	});

	describe('mixed content', () => {
		it('should only transform disposition-related words', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('The disposition flow configuration')).toBe(
				'The outcome flow configuration'
			);
		});

		it('should handle labels without disposition', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(result.current('Campaign Settings')).toBe('Campaign Settings');
		});

		it('should preserve other text unchanged', () => {
			const { result } = renderHook(() => useDispositionLabel());
			const input = 'Some random text without keywords';
			expect(result.current(input)).toBe(input);
		});
	});

	describe('hook returns consistent function', () => {
		it('should return a function', () => {
			const { result } = renderHook(() => useDispositionLabel());
			expect(typeof result.current).toBe('function');
		});
	});
});

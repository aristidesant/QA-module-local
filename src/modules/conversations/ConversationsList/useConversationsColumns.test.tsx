import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';
import { useConversationsColumns } from './useConversationsColumns';
import type { ConversationsModel } from '~/models/ConversationsModels';

// Helper type to access accessorKey from column definitions
type ColumnWithAccessorKey = ColumnDef<ConversationsModel> & {
	accessorKey?: string;
};

describe('useConversationsColumns', () => {
	const userTimezone = 'America/Puerto_Rico';

	describe('column definitions', () => {
		it('returns exactly 6 columns', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current).toHaveLength(6);
		});

		it('has "Contact Name" as the header for the first column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[0].header).toBe('Contact Name');
		});

		it('has "Phone Number" as the header for the second column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[1].header).toBe('Phone Number');
		});

		it('has "Outcome" as the header for the third column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[2].header).toBe('Outcome');
		});

		it('has "Status" as the header for the fourth column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[3].header).toBe('Status');
		});

		it('has "When" as the header for the fifth column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[4].header).toBe('When');
		});

		it('has "Duration" as the header for the sixth column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[5].header).toBe('Duration');
		});

		it('has correct column IDs and accessorKeys', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const columns = result.current as ColumnWithAccessorKey[];
			expect(columns[0].id).toBe('contactName');
			expect(columns[1].id).toBe('phoneNumber');
			expect(columns[2].id).toBe('disposition');
			expect(columns[3].accessorKey).toBe('status');
			expect(columns[4].accessorKey).toBe('startDate');
			expect(columns[5].id).toBe('duration');
		});
	});

	describe('column headers exact match validation', () => {
		const expectedHeaders = [
			'Contact Name',
			'Phone Number',
			'Outcome',
			'Status',
			'When',
			'Duration',
		];

		it.each(expectedHeaders.map((header, index) => [index, header]))(
			'column at index %i has exact header "%s"',
			(index, expectedHeader) => {
				const { result } = renderHook(() =>
					useConversationsColumns(userTimezone)
				);
				expect(result.current[index as number].header).toBe(expectedHeader);
			}
		);

		it('all column headers match expected values in order', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const actualHeaders = result.current.map((col) => col.header);
			expect(actualHeaders).toEqual(expectedHeaders);
		});
	});

	describe('status column existence', () => {
		it('has a status column with accessorKey', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const columns = result.current as ColumnWithAccessorKey[];
			const statusColumn = columns.find((col) => col.accessorKey === 'status');
			expect(statusColumn).toBeDefined();
			expect(statusColumn?.header).toBe('Status');
		});

		it('has a startDate column with accessorKey', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const columns = result.current as ColumnWithAccessorKey[];
			const whenColumn = columns.find((col) => col.accessorKey === 'startDate');
			expect(whenColumn).toBeDefined();
			expect(whenColumn?.header).toBe('When');
		});
	});

	describe('memoization', () => {
		it('returns same reference when timezone does not change', () => {
			const { result, rerender } = renderHook(
				({ tz }) => useConversationsColumns(tz),
				{ initialProps: { tz: userTimezone } }
			);

			const firstResult = result.current;
			rerender({ tz: userTimezone });
			const secondResult = result.current;

			expect(firstResult).toBe(secondResult);
		});

		it('returns new reference when timezone changes', () => {
			const { result, rerender } = renderHook(
				({ tz }) => useConversationsColumns(tz),
				{ initialProps: { tz: userTimezone } }
			);

			const firstResult = result.current;
			rerender({ tz: 'America/New_York' });
			const secondResult = result.current;

			expect(firstResult).not.toBe(secondResult);
		});
	});
});

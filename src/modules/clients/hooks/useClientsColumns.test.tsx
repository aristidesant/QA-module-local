import { renderHook } from '@testing-library/react';
import useClientsColumns from './useClientsColumns';
import { vi } from 'vitest';

describe('useClientsColumns', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();

	it('returns column definitions', () => {
		const { result } = renderHook(() =>
			useClientsColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete })
		);

		expect(result.current).toBeDefined();
		expect(Array.isArray(result.current)).toBe(true);
		expect(result.current.length).toBeGreaterThan(0);
	});

	it('includes name, identifier, email, phone, and actions columns', () => {
		const { result } = renderHook(() =>
			useClientsColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete })
		);

		const columnIds = result.current.map(
			(col: any) => col.accessorKey || col.id
		);
		expect(columnIds).toContain('name');
		expect(columnIds).toContain('identifier');
		expect(columnIds).toContain('email');
		expect(columnIds).toContain('phone');
		expect(columnIds).toContain('actions');
	});
});

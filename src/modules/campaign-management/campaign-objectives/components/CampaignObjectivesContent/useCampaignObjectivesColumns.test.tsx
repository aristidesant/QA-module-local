import { renderHook } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestProviders } from '~/test-utils/renderWithProviders';
import {
	useCampaignObjectivesColumns,
	type EnrichedObjective,
} from './useCampaignObjectivesColumns';

describe('useCampaignObjectivesColumns', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns an array of column definitions', () => {
		const { result } = renderHook(
			() =>
				useCampaignObjectivesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper: TestProviders }
		);

		expect(Array.isArray(result.current)).toBe(true);
		expect(result.current.length).toBeGreaterThan(0);
	});

	it('includes name column', () => {
		const { result } = renderHook(
			() =>
				useCampaignObjectivesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper: TestProviders }
		);

		const nameColumn = result.current.find(
			(col): col is ColumnDef<EnrichedObjective> & { accessorKey: string } =>
				(col as { accessorKey?: unknown }).accessorKey === 'name'
		);
		expect(nameColumn).toBeDefined();
		expect(nameColumn?.header).toBe('Name');
	});

	it('includes categoryName column', () => {
		const { result } = renderHook(
			() =>
				useCampaignObjectivesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper: TestProviders }
		);

		const categoryColumn = result.current.find(
			(col): col is ColumnDef<EnrichedObjective> & { accessorKey: string } =>
				(col as { accessorKey?: unknown }).accessorKey === 'categoryName'
		);
		expect(categoryColumn).toBeDefined();
		expect(categoryColumn?.header).toBe('Category');
	});

	it('includes description column', () => {
		const { result } = renderHook(
			() =>
				useCampaignObjectivesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper: TestProviders }
		);

		const descColumn = result.current.find(
			(col): col is ColumnDef<EnrichedObjective> & { accessorKey: string } =>
				(col as { accessorKey?: unknown }).accessorKey === 'description'
		);
		expect(descColumn).toBeDefined();
		expect(descColumn?.header).toBe('Description');
	});

	it('includes active status column', () => {
		const { result } = renderHook(
			() =>
				useCampaignObjectivesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper: TestProviders }
		);

		const activeColumn = result.current.find(
			(col): col is ColumnDef<EnrichedObjective> & { accessorKey: string } =>
				(col as { accessorKey?: unknown }).accessorKey === 'active'
		);
		expect(activeColumn).toBeDefined();
		expect(activeColumn?.header).toBe('Status');
	});

	it('includes actions column', () => {
		const { result } = renderHook(
			() =>
				useCampaignObjectivesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper: TestProviders }
		);

		const actionsColumn = result.current.find(
			(col): col is ColumnDef<EnrichedObjective> & { id: string } =>
				(col as { id?: unknown }).id === 'actions'
		);
		expect(actionsColumn).toBeDefined();
		expect(actionsColumn?.header).toBe('Actions');
	});

	it('returns the same columns reference for same inputs', () => {
		const { result, rerender } = renderHook(
			({ onEdit, onDelete, isDeletePending }) =>
				useCampaignObjectivesColumns({ onEdit, onDelete, isDeletePending }),
			{
				initialProps: {
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				},
				wrapper: TestProviders,
			}
		);

		const firstResult = result.current.map((column) => ({
			accessorKey: (column as { accessorKey?: unknown }).accessorKey,
			id: (column as { id?: unknown }).id,
			header: column.header,
		}));

		rerender({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		expect(
			result.current.map((column) => ({
				accessorKey: (column as { accessorKey?: unknown }).accessorKey,
				id: (column as { id?: unknown }).id,
				header: column.header,
			}))
		).toEqual(firstResult);
	});
});

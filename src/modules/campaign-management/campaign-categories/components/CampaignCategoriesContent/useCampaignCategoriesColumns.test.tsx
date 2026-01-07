import { renderHook } from '@testing-library/react';
import { useCampaignCategoriesColumns } from './useCampaignCategoriesColumns';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';
import type { CampaignCategory } from '~/models/CampaignCategoryModel';
import { TestProviders } from '~/test-utils/renderWithProviders';

describe('useCampaignCategoriesColumns', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();
	const wrapper = TestProviders;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns an array of column definitions', () => {
		const { result } = renderHook(
			() =>
				useCampaignCategoriesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper }
		);

		expect(Array.isArray(result.current)).toBe(true);
		expect(result.current.length).toBeGreaterThan(0);
	});

	it('includes name column', () => {
		const { result } = renderHook(
			() =>
				useCampaignCategoriesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper }
		);

		const nameColumn = result.current.find(
			(col): col is ColumnDef<CampaignCategory> & { accessorKey: string } =>
				(col as { accessorKey?: unknown }).accessorKey === 'name'
		);
		expect(nameColumn).toBeDefined();
		expect(nameColumn?.header).toBe('Name');
	});

	it('includes code column', () => {
		const { result } = renderHook(
			() =>
				useCampaignCategoriesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper }
		);

		const codeColumn = result.current.find(
			(col): col is ColumnDef<CampaignCategory> & { accessorKey: string } =>
				(col as { accessorKey?: unknown }).accessorKey === 'code'
		);
		expect(codeColumn).toBeDefined();
		expect(codeColumn?.header).toBe('Code');
	});

	it('includes description column', () => {
		const { result } = renderHook(
			() =>
				useCampaignCategoriesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper }
		);

		const descColumn = result.current.find(
			(col): col is ColumnDef<CampaignCategory> & { accessorKey: string } =>
				(col as { accessorKey?: unknown }).accessorKey === 'description'
		);
		expect(descColumn).toBeDefined();
		expect(descColumn?.header).toBe('Description');
	});

	it('includes active status column', () => {
		const { result } = renderHook(
			() =>
				useCampaignCategoriesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper }
		);

		const activeColumn = result.current.find(
			(col): col is ColumnDef<CampaignCategory> & { accessorKey: string } =>
				(col as { accessorKey?: unknown }).accessorKey === 'active'
		);
		expect(activeColumn).toBeDefined();
		expect(activeColumn?.header).toBe('Status');
	});

	it('includes actions column', () => {
		const { result } = renderHook(
			() =>
				useCampaignCategoriesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				}),
			{ wrapper }
		);

		const actionsColumn = result.current.find(
			(col): col is ColumnDef<CampaignCategory> & { id: string } =>
				(col as { id?: unknown }).id === 'actions'
		);
		expect(actionsColumn).toBeDefined();
		expect(actionsColumn?.header).toBe('Actions');
	});

	it('memoizes columns based on dependencies', () => {
		const { result, rerender } = renderHook(
			({ onEdit, onDelete, isDeletePending }) =>
				useCampaignCategoriesColumns({ onEdit, onDelete, isDeletePending }),
			{
				initialProps: {
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending: false,
				},
				wrapper,
			}
		);

		const firstResult = result.current;

		rerender({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		expect(result.current).toBe(firstResult);
	});
});

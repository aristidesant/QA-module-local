import { renderHook as rtlRenderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CellContext, Row } from '@tanstack/react-table';
import type { DoNotCallModel } from '~/models/DoNotCallModel';
import {
	renderWithProviders,
	TestProviders,
} from '~/test-utils/renderWithProviders';
import { useDoNotCallColumns } from './useDoNotCallColumns';
import userEvent from '@testing-library/user-event';

const renderHook: typeof rtlRenderHook = (callback, options) =>
	rtlRenderHook(callback, { wrapper: TestProviders, ...options });

const createMockRow = (entry: DoNotCallModel): Row<DoNotCallModel> => {
	return {
		original: entry,
		getValue: vi.fn(),
	} as unknown as Row<DoNotCallModel>;
};

const renderCell = (cellContent: React.ReactNode) => {
	renderWithProviders(<>{cellContent}</>);
};

describe('useDoNotCallColumns', () => {
	it('returns columns with translated headers', () => {
		const { result } = renderHook(() =>
			useDoNotCallColumns({ onEdit: vi.fn(), onDelete: vi.fn() })
		);

		expect(result.current).toHaveLength(6);
		expect(result.current[0].header).toBe('Phone Number');
		expect(result.current[1].header).toBe('Reason');
		expect(result.current[2].header).toBe('Status');
		expect(result.current[3].header).toBe('Expires At');
		expect(result.current[4].header).toBe('Created At');
		expect(result.current[5].header).toBe('Actions');
	});

	it('renders "Never" for missing expiresAt', () => {
		const { result } = renderHook(() =>
			useDoNotCallColumns({ onEdit: vi.fn(), onDelete: vi.fn() })
		);

		const entry: DoNotCallModel = {
			id: 1,
			clientId: 1,
			phoneNumber: '+1234567890',
			reason: 'CUSTOMER_REQUEST',
			notes: null,
			expiresAt: null,
			createdByUserId: 1,
			callDispositionId: null,
			createdAt: '2025-01-01T00:00:00Z',
			updatedAt: '2025-01-01T00:00:00Z',
			deletedAt: null,
			isActive: true,
		};

		const row = createMockRow(entry);
		const expiresAtColumn = result.current[3];
		const cellFn = expiresAtColumn.cell as (
			props: CellContext<DoNotCallModel, unknown>
		) => React.ReactNode;

		renderCell(
			cellFn({ row } as unknown as CellContext<DoNotCallModel, unknown>)
		);
		expect(screen.getByText('Never')).toBeInTheDocument();
	});

	it('exposes accessible edit/delete actions and calls callbacks', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		const { result } = renderHook(() =>
			useDoNotCallColumns({ onEdit, onDelete })
		);

		const entry: DoNotCallModel = {
			id: 1,
			clientId: 1,
			phoneNumber: '+1234567890',
			reason: 'CUSTOMER_REQUEST',
			notes: null,
			expiresAt: null,
			createdByUserId: 1,
			callDispositionId: null,
			createdAt: '2025-01-01T00:00:00Z',
			updatedAt: '2025-01-01T00:00:00Z',
			deletedAt: null,
			isActive: true,
		};

		const row = createMockRow(entry);
		const actionsColumn = result.current[5];
		const cellFn = actionsColumn.cell as (
			props: CellContext<DoNotCallModel, unknown>
		) => React.ReactNode;

		renderCell(
			cellFn({ row } as unknown as CellContext<DoNotCallModel, unknown>)
		);

		await user.click(screen.getByRole('button', { name: 'Edit entry' }));
		expect(onEdit).toHaveBeenCalledWith(entry);

		await user.click(screen.getByRole('button', { name: 'Delete entry' }));
		expect(onDelete).toHaveBeenCalledWith(entry);
	});
});

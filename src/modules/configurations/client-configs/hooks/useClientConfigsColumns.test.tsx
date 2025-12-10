import React from 'react';
import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { ClientConfig } from '~/models/ClientConfig';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useClientConfigsColumns } from './useClientConfigsColumns';

const sampleConfig: ClientConfig = {
	id: 42,
	name: 'beta_feature',
	description: 'Enables beta feature toggle',
	type: 'boolean',
	value: 'true',
	clientId: 3,
	userId: 7,
	createdAt: '2024-04-01T00:00:00Z',
	updatedAt: '2024-04-05T00:00:00Z',
	deletedAt: null,
};

describe('useClientConfigsColumns', () => {
	it('returns column definitions with stable order', () => {
		const { result } = renderHook(() =>
			useClientConfigsColumns(vi.fn(), vi.fn())
		);

		const headers = result.current.map((column) => column.header);

		expect(headers).toEqual([
			'Name',
			'Description',
			'Type',
			'Value',
			'Last Updated',
			'Actions',
		]);
	});

	it('renders cells and triggers action callbacks', async () => {
		const onEdit = vi.fn();
		const onDelete = vi.fn();
		const { result } = renderHook(() =>
			useClientConfigsColumns(onEdit, onDelete)
		);
		const [nameColumn, , , valueColumn, , actionsColumn] = result.current;

		renderWithProviders(
			(nameColumn.cell as any)?.({
				row: { original: sampleConfig },
			} as never) as React.ReactElement
		);
		expect(screen.getByText('beta_feature')).toBeInTheDocument();

		renderWithProviders(
			(valueColumn.cell as any)?.({
				row: { original: sampleConfig },
			} as never) as React.ReactElement
		);
		expect(screen.getByText('true')).toBeInTheDocument();

		const actionsCell = (actionsColumn.cell as any)?.({
			row: { original: sampleConfig },
		} as never) as React.ReactElement;

		renderWithProviders(actionsCell);

		const user = userEvent.setup();
		const buttons = screen.getAllByRole('button');
		const editButton = buttons.find((btn) =>
			btn.querySelector('svg.tabler-icon-edit')
		);
		const deleteButton = buttons.find((btn) =>
			btn.querySelector('svg.tabler-icon-trash')
		);

		if (editButton) await user.click(editButton);
		if (deleteButton) await user.click(deleteButton);

		expect(onEdit).toHaveBeenCalledWith(sampleConfig);
		expect(onDelete).toHaveBeenCalledWith(sampleConfig);
	});
});

import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { useContactColumns } from './useContactColumns';
import type { Contact } from '~/models/ContactsModel';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import {
	queryClient,
	renderWithProviders,
} from '~/test-utils/renderWithProviders';

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={queryClient}>
		<MantineProvider>{children}</MantineProvider>
	</QueryClientProvider>
);

const baseContact: any = {
	id: 1,
	firstName: 'Ana',
	lastName: 'Doe',
	status: 'ACTIVE',
	emails: ['ana@example.com'],
	phoneNumbers: [{ id: 1, phoneNumber: '+18095551234' }],
	createdAt: '',
	updatedAt: '',
};

describe('useContactColumns', () => {
	it('returns action handlers when provided', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		const onDelete = vi.fn();
		const isDeleting = vi.fn().mockReturnValue(false);

		const { result } = renderHook(
			() => useContactColumns(onEdit, onDelete, isDeleting),
			{ wrapper }
		);

		const actions = result.current.find((col) => col.id === 'actions');
		expect(actions).toBeDefined();

		const { getAllByRole } = renderWithProviders(
			(actions as any)?.cell?.({
				row: { original: baseContact },
			} as any) as React.ReactNode
		);

		const buttons = getAllByRole('button');
		await user.click(buttons[0]);
		await user.click(buttons[1]);

		expect(onEdit).toHaveBeenCalledWith(baseContact);
		expect(onDelete).toHaveBeenCalledWith(baseContact);
	});

	it('omits actions column when callbacks missing', () => {
		const { result } = renderHook(() => useContactColumns(), { wrapper });
		expect(result.current.find((col) => col.id === 'actions')).toBeUndefined();
	});

	it('renders phone column with validation error badges', () => {
		const contact: Contact = {
			...baseContact,
			phoneNumbers: [
				{
					id: 1,
					phoneNumber: '123',
					validationError: { code: 'ERR', message: 'Bad', rawPhone: '123' },
				},
				{ id: 2, phoneNumber: '234' },
				{ id: 3, phoneNumber: '345' },
			],
			emails: [],
		};

		const { result } = renderHook(() => useContactColumns(), { wrapper });
		const phoneColumn = result.current.find(
			(col) => (col as any).accessorKey === 'phones'
		);
		const { getByText } = renderWithProviders(
			(phoneColumn as any)?.cell?.({
				row: { original: contact },
			} as any) as React.ReactNode
		);

		expect(getByText('123')).toBeInTheDocument();
		expect(getByText('+2')).toBeInTheDocument();
		expect(getByText('1')).toBeInTheDocument();
	});

	it('shows empty state when no phone numbers exist', () => {
		const contact: Contact = {
			...baseContact,
			phoneNumbers: [],
			emails: [],
		};

		const { result } = renderHook(() => useContactColumns(), { wrapper });
		const phoneColumn = result.current.find(
			(col) => (col as any).accessorKey === 'phones'
		);

		const { getByText } = renderWithProviders(
			(phoneColumn as any)?.cell?.({
				row: { original: contact },
			} as any) as React.ReactNode
		);

		expect(getByText('—')).toBeInTheDocument();
	});
});

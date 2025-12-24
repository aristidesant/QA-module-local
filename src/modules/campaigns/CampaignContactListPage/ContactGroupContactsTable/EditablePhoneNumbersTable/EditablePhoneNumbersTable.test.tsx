import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditablePhoneNumbersTable from './EditablePhoneNumbersTable';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canPerformAction: () => true,
		canAccessModule: () => true,
		hasAnyPermission: () => true,
		hasAllPermissions: () => true,
	}),
}));

const mutateMock = vi.fn();
const deleteMutateMock = vi.fn();

vi.mock('~/components/BaseTable', () => ({
	default: ({ data, columns }: { data: any[]; columns: any[] }) => (
		<div>
			{data.map((row) => (
				<div key={row.id} data-testid={`row-${row.id}`}>
					{columns.map((col: any) => (
						<div key={col.id ?? col.accessorKey}>
							{col.cell?.({
								row: { original: row },
								getValue: () =>
									col.accessorKey ? (row as any)[col.accessorKey] : undefined,
							})}
						</div>
					))}
				</div>
			))}
		</div>
	),
}));

vi.mock('./AddPhoneNumbersModal', () => ({
	default: ({
		onClose,
		onSaved,
	}: {
		onClose: () => void;
		onSaved: () => void;
	}) => (
		<div data-testid='add-modal'>
			<button onClick={onClose}>Close</button>
			<button onClick={onSaved}>Saved</button>
		</div>
	),
}));

vi.mock('~/queries/contactsQueries', () => ({
	useUpdateContactPhoneNumber: () => ({
		mutate: mutateMock,
		isPending: false,
	}),
	useDeleteContactPhoneNumber: () => ({
		mutate: deleteMutateMock,
		isPending: false,
	}),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		openConfirmModal: ({ onConfirm }: { onConfirm: () => void }) => onConfirm(),
	},
}));

describe('EditablePhoneNumbersTable', () => {
	beforeEach(() => {
		mutateMock.mockReset();
		deleteMutateMock.mockReset();
	});

	it('allows editing and saving a phone number', async () => {
		const user = userEvent.setup();
		const onAfterUpdate = vi.fn();

		mutateMock.mockImplementation((_payload, opts) => {
			opts?.onSuccess?.();
		});

		renderWithProviders(
			<EditablePhoneNumbersTable
				contactId={1}
				contactGroupId={2}
				phoneNumbers={[{ id: 10, phoneNumber: '+18095551234', status: 'OK' }]}
				onAfterUpdate={onAfterUpdate}
			/>
		);

		const row = screen.getByTestId('row-10');
		// Edit button is the first one
		const editButton = within(row).getAllByRole('button')[0];
		await user.click(editButton);

		const input = screen.getByPlaceholderText(
			'contactListPage.faultyPhones.modal.placeholders.enterPhone'
		);
		await user.clear(input);
		await user.type(input, '+18095559999');

		const saveButton = within(row).getAllByRole('button')[0];
		await user.click(saveButton);

		expect(mutateMock).toHaveBeenCalledWith(
			{ contactId: 1, phoneNumberId: 10, phoneNumber: '+18095559999' },
			expect.any(Object)
		);
		expect(onAfterUpdate).toHaveBeenCalled();
	});

	it('allows deleting a phone number', async () => {
		const user = userEvent.setup();
		const onAfterUpdate = vi.fn();

		deleteMutateMock.mockImplementation((_payload, opts) => {
			opts?.onSuccess?.();
		});

		renderWithProviders(
			<EditablePhoneNumbersTable
				contactId={1}
				contactGroupId={2}
				phoneNumbers={[{ id: 10, phoneNumber: '+18095551234', status: 'OK' }]}
				onAfterUpdate={onAfterUpdate}
			/>
		);

		const row = screen.getByTestId('row-10');
		// Delete button is the second one
		const deleteButton = within(row).getAllByRole('button')[1];
		await user.click(deleteButton);

		expect(deleteMutateMock).toHaveBeenCalledWith(
			{ contactId: 1, phoneNumberId: 10 },
			expect.any(Object)
		);
		expect(onAfterUpdate).toHaveBeenCalled();
	});

	it('handles delete error correctly', async () => {
		const user = userEvent.setup();
		const onAfterUpdate = vi.fn();
		const { notifications } = await import('@mantine/notifications');

		deleteMutateMock.mockImplementation((_payload, opts) => {
			opts?.onError?.(new Error('Delete failed'));
		});

		renderWithProviders(
			<EditablePhoneNumbersTable
				contactId={1}
				contactGroupId={2}
				phoneNumbers={[{ id: 10, phoneNumber: '+18095551234', status: 'OK' }]}
				onAfterUpdate={onAfterUpdate}
			/>
		);

		const row = screen.getByTestId('row-10');
		// Delete button is the second one
		const deleteButton = within(row).getAllByRole('button')[1];
		await user.click(deleteButton);

		expect(deleteMutateMock).toHaveBeenCalledWith(
			{ contactId: 1, phoneNumberId: 10 },
			expect.any(Object)
		);
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'contactListPage.phoneNumbersTable.notifications.deleteFailed',
				color: 'red',
			})
		);
		expect(onAfterUpdate).not.toHaveBeenCalled();
	});

	it('opens add phone modal', async () => {
		const user = userEvent.setup();

		renderWithProviders(
			<EditablePhoneNumbersTable
				contactId={1}
				contactGroupId={2}
				phoneNumbers={[]}
			/>
		);

		await user.click(
			screen.getByRole('button', {
				name: 'contactListPage.phoneNumbersTable.add',
			})
		);
		expect(screen.getByTestId('add-modal')).toBeInTheDocument();
	});
});

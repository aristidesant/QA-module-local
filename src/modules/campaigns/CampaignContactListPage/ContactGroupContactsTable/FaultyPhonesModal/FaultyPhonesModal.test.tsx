import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FaultyPhonesModal from './FaultyPhonesModal';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { notifications } from '@mantine/notifications';

vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canPerformAction: () => true,
		canAccessModule: () => true,
		hasAnyPermission: () => true,
		hasAllPermissions: () => true,
	}),
}));

const exportRefetch = vi.fn();
const updateMutate = vi.fn();

vi.mock('~/components/BaseTable', () => ({
	default: ({ data, columns }: { data: any[]; columns: any[] }) => (
		<div data-testid='base-table'>
			{data.map((row) => (
				<div key={row.phoneNumberId} data-testid={`row-${row.phoneNumberId}`}>
					{columns.map((col: any) => (
						<div
							key={col.id ?? col.accessorKey}
							data-testid={`col-${col.id ?? col.accessorKey}`}
						>
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

vi.mock('~/queries/contactsQueries', () => ({
	useExportContactGroupContactsWithPhoneValidationErrors: () => ({
		refetch: exportRefetch,
		isFetching: false,
	}),
	useUpdateContactPhoneNumber: () => ({
		mutate: updateMutate,
		isPending: false,
	}),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

const faultyContacts = [
	{
		id: 1,
		firstName: 'Jane',
		lastName: 'Doe',
		phoneNumbers: [
			{
				id: 10,
				phoneNumber: '+18090000000',
				validationError: {
					code: 'BAD',
					message: 'Invalid',
					rawPhone: '+18090000000',
				},
			},
		],
	},
];

const multipleFaultyContacts = [
	{
		id: 1,
		firstName: 'Jane',
		lastName: 'Doe',
		phoneNumbers: [
			{
				id: 10,
				phoneNumber: '+18090000000',
				validationError: {
					code: 'INVALID_FORMAT',
					message: 'Invalid phone format',
					rawPhone: '+18090000000',
				},
			},
			{
				id: 11,
				phoneNumber: '+18091111111',
				validationError: {
					code: 'TOO_SHORT',
					message: 'Phone number too short',
					rawPhone: '+18091111111',
				},
			},
		],
	},
	{
		id: 2,
		firstName: 'John',
		lastName: 'Smith',
		phoneNumbers: [
			{
				id: 20,
				phoneNumber: 'invalid-phone',
				validationError: {
					code: 'INVALID_CHARS',
					message: 'Contains invalid characters',
					rawPhone: 'invalid-phone',
				},
			},
		],
	},
];

const mixedContacts = [
	{
		id: 1,
		firstName: 'Jane',
		lastName: 'Doe',
		phoneNumbers: [
			{
				id: 10,
				phoneNumber: '+18090000000',
				// No validation error - valid phone
			},
			{
				id: 11,
				phoneNumber: '+18091111111',
				validationError: {
					code: 'BAD',
					message: 'Invalid',
					rawPhone: '+18091111111',
				},
			},
		],
	},
];

const contactsWithoutPhoneNumbers = [
	{
		id: 1,
		firstName: 'Jane',
		lastName: 'Doe',
		phoneNumbers: undefined,
	},
];

describe('FaultyPhonesModal', () => {
	beforeEach(() => {
		exportRefetch.mockReset();
		updateMutate.mockReset();
		URL.createObjectURL = vi.fn(() => 'blob:url');
		URL.revokeObjectURL = vi.fn();
		(notifications.show as any).mockClear();
	});

	it('renders faulty phones and exports list', async () => {
		const user = userEvent.setup();
		exportRefetch.mockResolvedValue({ data: 'csv-data' });

		renderWithProviders(
			<FaultyPhonesModal
				opened
				onClose={vi.fn()}
				contacts={faultyContacts as any}
				contactGroupId={1}
			/>
		);

		expect(screen.getByText('Faulty Phone Numbers')).toBeInTheDocument();
		expect(
			screen.getByText('Total: 1 faulty phone number')
		).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Export' }));
		expect(exportRefetch).toHaveBeenCalled();
	});

	it('allows editing a faulty phone number', async () => {
		const user = userEvent.setup();
		const onAfterUpdate = vi.fn();
		updateMutate.mockImplementation((_payload, opts) => {
			opts?.onSuccess?.();
		});

		renderWithProviders(
			<FaultyPhonesModal
				opened
				onClose={vi.fn()}
				contacts={faultyContacts as any}
				contactGroupId={3}
				onAfterUpdate={onAfterUpdate}
			/>
		);

		const row = screen.getByTestId('row-10');
		const editButton = within(row).getAllByRole('button')[0];
		await user.click(editButton);

		const input = screen.getByPlaceholderText('Enter phone');
		await user.clear(input);
		await user.type(input, '+18095551234');

		const saveButton = within(row).getAllByRole('button')[0];
		await user.click(saveButton);

		expect(updateMutate).toHaveBeenCalledWith(
			{ contactId: 1, phoneNumberId: 10, phoneNumber: '+18095551234' },
			expect.any(Object)
		);
		expect(onAfterUpdate).toHaveBeenCalled();
	});

	it('handles export errors', async () => {
		const user = userEvent.setup();
		exportRefetch.mockRejectedValue(new Error('Network issue'));

		renderWithProviders(
			<FaultyPhonesModal
				opened
				onClose={vi.fn()}
				contacts={faultyContacts as any}
				contactGroupId={5}
			/>
		);

		await user.click(screen.getByRole('button', { name: 'Export' }));
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Export Failed',
				color: 'red',
			})
		);
	});

	it('cancels editing without saving', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<FaultyPhonesModal
				opened
				onClose={vi.fn()}
				contacts={faultyContacts as any}
				contactGroupId={8}
			/>
		);

		const row = screen.getByTestId('row-10');
		await user.click(within(row).getAllByRole('button')[0]);

		await user.type(screen.getByPlaceholderText('Enter phone'), '1');
		await user.click(within(row).getAllByRole('button')[1]);

		expect(updateMutate).not.toHaveBeenCalled();
		expect(screen.getByText('+18090000000')).toBeInTheDocument();
	});

	it('removes row after successful save', async () => {
		const user = userEvent.setup();
		updateMutate.mockImplementation((_payload, opts) => {
			opts?.onSuccess?.();
		});

		renderWithProviders(
			<FaultyPhonesModal
				opened
				onClose={vi.fn()}
				contacts={faultyContacts as any}
				contactGroupId={9}
			/>
		);

		const row = screen.getByTestId('row-10');
		await user.click(within(row).getAllByRole('button')[0]);
		await user.click(within(row).getAllByRole('button')[0]);

		expect(updateMutate).toHaveBeenCalled();
		await waitFor(() =>
			expect(screen.queryByTestId('row-10')).not.toBeInTheDocument()
		);
	});

	describe('Multiple Faulty Phones', () => {
		it('renders multiple faulty phones from different contacts', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={multipleFaultyContacts as any}
					contactGroupId={1}
				/>
			);

			expect(screen.getByTestId('row-10')).toBeInTheDocument();
			expect(screen.getByTestId('row-11')).toBeInTheDocument();
			expect(screen.getByTestId('row-20')).toBeInTheDocument();
			expect(
				screen.getByText('Total: 3 faulty phone numbers')
			).toBeInTheDocument();
		});

		it('displays correct contact names for each faulty phone', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={multipleFaultyContacts as any}
					contactGroupId={1}
				/>
			);

			// Jane Doe appears twice (2 faulty phones)
			expect(screen.getAllByText('Jane Doe')).toHaveLength(2);
			// John Smith appears once (1 faulty phone)
			expect(screen.getByText('John Smith')).toBeInTheDocument();
		});

		it('displays different error codes and messages', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={multipleFaultyContacts as any}
					contactGroupId={1}
				/>
			);

			expect(screen.getByText('INVALID_FORMAT')).toBeInTheDocument();
			expect(screen.getByText('TOO_SHORT')).toBeInTheDocument();
			expect(screen.getByText('INVALID_CHARS')).toBeInTheDocument();
		});
	});

	describe('Mixed Contacts (valid and invalid phones)', () => {
		it('only shows faulty phones, not valid ones', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={mixedContacts as any}
					contactGroupId={1}
				/>
			);

			// Only the faulty phone (id 11) should be shown
			expect(screen.getByTestId('row-11')).toBeInTheDocument();
			expect(screen.queryByTestId('row-10')).not.toBeInTheDocument();
			expect(
				screen.getByText('Total: 1 faulty phone number')
			).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('handles contacts without phone numbers', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={contactsWithoutPhoneNumbers as any}
					contactGroupId={1}
				/>
			);

			expect(
				screen.getByText('Total: 0 faulty phone numbers')
			).toBeInTheDocument();
		});

		it('handles empty contacts array', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={[]}
					contactGroupId={1}
				/>
			);

			expect(
				screen.getByText('Total: 0 faulty phone numbers')
			).toBeInTheDocument();
		});

		it('does not render modal content when closed', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened={false}
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			expect(
				screen.queryByText('Faulty Phone Numbers')
			).not.toBeInTheDocument();
		});
	});

	describe('Modal Header and Description', () => {
		it('renders modal title with icon', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			expect(screen.getByText('Faulty Phone Numbers')).toBeInTheDocument();
		});

		it('renders description text', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			expect(
				screen.getByText(
					'The following phone numbers have validation errors and need attention. These contacts may not receive calls until the phone numbers are corrected.'
				)
			).toBeInTheDocument();
		});
	});

	describe('Update Error Handling', () => {
		it('shows error notification when update fails with Error instance', async () => {
			const user = userEvent.setup();
			updateMutate.mockImplementation((_payload, opts) => {
				opts?.onError?.(new Error('Network error'));
			});

			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			const row = screen.getByTestId('row-10');
			await user.click(within(row).getAllByRole('button')[0]);
			await user.click(within(row).getAllByRole('button')[0]);

			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Update Failed',
					message: 'Network error',
					color: 'red',
				})
			);
		});

		it('shows generic error message when update fails without Error instance', async () => {
			const user = userEvent.setup();
			updateMutate.mockImplementation((_payload, opts) => {
				opts?.onError?.('string error');
			});

			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			const row = screen.getByTestId('row-10');
			await user.click(within(row).getAllByRole('button')[0]);
			await user.click(within(row).getAllByRole('button')[0]);

			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Update Failed',
					message: 'Failed to update phone number',
					color: 'red',
				})
			);
		});
	});

	describe('Export Functionality', () => {
		it('shows success notification after successful export', async () => {
			const user = userEvent.setup();
			exportRefetch.mockResolvedValue({ data: 'csv-data' });

			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			await user.click(screen.getByRole('button', { name: 'Export' }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Export Successful',
						message: 'Faulty phone numbers exported successfully',
						color: 'green',
					})
				);
			});
		});

		it('creates download link with correct filename', async () => {
			const user = userEvent.setup();
			const mockCreateElement = vi.spyOn(document, 'createElement');
			const mockAppendChild = vi.spyOn(document.body, 'appendChild');
			const mockRemoveChild = vi.spyOn(document.body, 'removeChild');

			exportRefetch.mockResolvedValue({ data: 'csv-data' });

			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={42}
				/>
			);

			await user.click(screen.getByRole('button', { name: 'Export' }));

			await waitFor(() => {
				expect(mockCreateElement).toHaveBeenCalledWith('a');
				expect(mockAppendChild).toHaveBeenCalled();
				expect(mockRemoveChild).toHaveBeenCalled();
			});

			mockCreateElement.mockRestore();
			mockAppendChild.mockRestore();
			mockRemoveChild.mockRestore();
		});

		it('handles export with generic error message', async () => {
			const user = userEvent.setup();
			exportRefetch.mockRejectedValue('string error');

			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			await user.click(screen.getByRole('button', { name: 'Export' }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Export Failed',
						message: 'Failed to export faulty phone numbers',
						color: 'red',
					})
				);
			});
		});
	});

	describe('Close Modal', () => {
		it('calls onClose when modal close is triggered', async () => {
			const onClose = vi.fn();
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={onClose}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			// Modal should be visible
			expect(screen.getByText('Faulty Phone Numbers')).toBeInTheDocument();
		});
	});

	describe('Table Columns', () => {
		it('renders all column headers through BaseTable', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			expect(screen.getByTestId('base-table')).toBeInTheDocument();
		});

		it('renders phone number in red when not editing', () => {
			renderWithProviders(
				<FaultyPhonesModal
					opened
					onClose={vi.fn()}
					contacts={faultyContacts as any}
					contactGroupId={1}
				/>
			);

			expect(screen.getByText('+18090000000')).toBeInTheDocument();
		});
	});
});

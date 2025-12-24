import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AddPhoneNumbersModal from './AddPhoneNumbersModal';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

const mutateMock = vi.fn();

vi.mock('~/queries/contactsQueries', () => ({
	useCreateContactPhoneNumbers: () => ({
		mutate: mutateMock,
		isPending: false,
	}),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

describe('AddPhoneNumbersModal', () => {
	it('validates phone numbers and blocks save when invalid', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<AddPhoneNumbersModal
				contactId={1}
				contactGroupId={1}
				onClose={vi.fn()}
				onSaved={vi.fn()}
			/>
		);

		const input = screen.getByPlaceholderText('+18095551234');
		await user.clear(input);
		await user.type(input, '123');

		expect(
			screen.getByText(
				'contactListPage.phoneNumbersTable.addModal.invalidNumber'
			)
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {
				name: 'contactListPage.phoneNumbersTable.addModal.save',
			})
		).toBeDisabled();
	});

	it('submits cleaned phone numbers', async () => {
		const user = userEvent.setup();
		const onSaved = vi.fn();
		mutateMock.mockImplementation((_payload, opts) => {
			opts?.onSuccess?.();
		});

		renderWithProviders(
			<AddPhoneNumbersModal
				contactId={22}
				contactGroupId={5}
				onClose={vi.fn()}
				onSaved={onSaved}
			/>
		);

		const input = screen.getByPlaceholderText('+18095551234');
		await user.clear(input);
		await user.type(input, '+18095551234');

		await user.click(
			screen.getByRole('button', {
				name: 'contactListPage.phoneNumbersTable.addModal.save',
			})
		);

		expect(mutateMock).toHaveBeenCalledWith(
			{ contactId: 22, phones: ['+18095551234'] },
			expect.any(Object)
		);
		expect(onSaved).toHaveBeenCalled();
	});

	it('detects duplicate numbers', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<AddPhoneNumbersModal
				contactId={1}
				contactGroupId={1}
				onClose={vi.fn()}
				onSaved={vi.fn()}
			/>
		);

		await user.click(screen.getByLabelText('Add row'));
		const inputs = screen.getAllByPlaceholderText('+18095551234');
		await user.type(inputs[0], '+18095551234');
		await user.type(inputs[1], '+18095551234');

		expect(
			screen.getByText(
				'contactListPage.phoneNumbersTable.addModal.duplicateNumbers'
			)
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {
				name: 'contactListPage.phoneNumbersTable.addModal.save',
			})
		).toBeDisabled();
	});
});

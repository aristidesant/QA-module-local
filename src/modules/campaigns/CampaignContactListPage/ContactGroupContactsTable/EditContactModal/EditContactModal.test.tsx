import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EditContactModal from './EditContactModal';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

const setContext = vi.fn();
const clear = vi.fn();
const invalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', async () => {
	const actual = await import('@tanstack/react-query');
	return { ...actual, useQueryClient: () => ({ invalidateQueries }) };
});

vi.mock('~/stores/contactEditStore', () => ({
	useContactEditStore: () => ({ setContext, clear }),
}));

vi.mock('~/modules/contacts/ContactsForm/ContactsForm', () => ({
	__esModule: true,
	default: ({ onSuccess }: { onSuccess: () => void }) => (
		<div>
			<button onClick={onSuccess}>Submit</button>
			<span>ContactsForm</span>
		</div>
	),
}));

describe('EditContactModal', () => {
	it('sets context when opened and clears on close', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		renderWithProviders(
			<EditContactModal
				opened
				onClose={onClose}
				contactId={5}
				contactGroupId={10}
			/>
		);

		expect(setContext).toHaveBeenCalledWith({
			contactId: 5,
			contactGroupId: 10,
		});
		expect(screen.getByText('ContactsForm')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Submit' }));
		expect(invalidateQueries).toHaveBeenCalled();
		expect(onClose).toHaveBeenCalled();
		expect(clear).toHaveBeenCalled();
	});

	it('does not render form when contactId is null', () => {
		renderWithProviders(
			<EditContactModal
				opened
				onClose={vi.fn()}
				contactId={null}
				contactGroupId={1}
			/>
		);

		expect(screen.queryByText('ContactsForm')).not.toBeInTheDocument();
	});
});

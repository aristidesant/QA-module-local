import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import DoNotCallForm from './DoNotCallForm';
import type { DoNotCallModel } from '~/models/DoNotCallModel';

describe('DoNotCallForm', () => {
	it('validates phone number in create mode', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		const { container } = renderWithProviders(
			<DoNotCallForm entry={undefined} onSubmit={onSubmit} onCancel={vi.fn()} />
		);

		fireEvent.submit(container.querySelector('form') as HTMLFormElement);

		expect(
			await screen.findByText('Phone number is required')
		).toBeInTheDocument();

		await user.type(screen.getByPlaceholderText('+1234567890'), '+1234567890');
		await user.click(screen.getByRole('button', { name: 'Create' }));

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				phoneNumber: '+1234567890',
			})
		);
	});

	it('hides phone number field in edit mode and shows Update button', () => {
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

		renderWithProviders(
			<DoNotCallForm entry={entry} onSubmit={vi.fn()} onCancel={vi.fn()} />
		);

		expect(screen.queryByLabelText('Phone Number')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
	});
});

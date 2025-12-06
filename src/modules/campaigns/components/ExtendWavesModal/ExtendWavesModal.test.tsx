import { fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ExtendWavesModal from './ExtendWavesModal';

describe('ExtendWavesModal', () => {
	it('renders and submits waves value', () => {
		const onSubmit = vi.fn();
		const onCancel = vi.fn();

		renderWithProviders(
			<ExtendWavesModal onSubmit={onSubmit} onCancel={onCancel} />
		);

		const input = screen.getByTestId('extend-waves-input');
		fireEvent.change(input, { target: { value: '3' } });

		fireEvent.click(screen.getByRole('button', { name: 'Add Waves' }));
		expect(onSubmit).toHaveBeenCalledWith(3);
	});

	it('calls onCancel', () => {
		const onSubmit = vi.fn();
		const onCancel = vi.fn();

		renderWithProviders(
			<ExtendWavesModal onSubmit={onSubmit} onCancel={onCancel} />
		);

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onCancel).toHaveBeenCalled();
	});
});

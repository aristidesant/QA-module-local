import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import * as passwordHelper from '~/utils/passwordHelper';

describe('PasswordStrengthIndicator', () => {
	const mockValidate = vi.spyOn(passwordHelper, 'validateStrongPassword');

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders nothing when password is empty', () => {
		const { container } = renderWithProviders(
			<PasswordStrengthIndicator password='' />
		);

		expect(container.querySelector('div')).toBeNull();
		expect(mockValidate).not.toHaveBeenCalled();
	});

	it('shows requirements and success message for strong password', () => {
		mockValidate.mockReturnValue({
			isValid: true,
			errors: [],
		});

		renderWithProviders(<PasswordStrengthIndicator password='StrongP@ss1' />);

		expect(mockValidate).toHaveBeenCalledWith('StrongP@ss1');
		expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
		expect(
			screen.getByText(/Password meets all requirements/i)
		).toBeInTheDocument();
	});
});

export {};

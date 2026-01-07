import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import OTPVerificationModal from './OTPVerificationModal';

// Mock the auth queries
const mockMutateAsync = vi.fn();
vi.mock('~/queries/authQueries', () => ({
	useVerifyOTP: vi.fn(() => ({
		mutateAsync: mockMutateAsync,
		isPending: false,
	})),
}));

describe('OTPVerificationModal', () => {
	const defaultProps = {
		opened: true,
		onClose: vi.fn(),
		userId: 123,
		onSuccess: vi.fn(),
	};

	beforeEach(() => {
		vi.resetAllMocks();
		mockMutateAsync.mockResolvedValue({});
	});

	test('renders correctly when opened', () => {
		renderWithProviders(<OTPVerificationModal {...defaultProps} />);
		expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Please enter the 6-digit verification code from your authenticator app.'
			)
		).toBeInTheDocument();
	});

	test('validates required input', async () => {
		renderWithProviders(<OTPVerificationModal {...defaultProps} />);

		await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

		expect(screen.getByText('OTP code is required')).toBeInTheDocument();
	});

	test('validates input length', async () => {
		renderWithProviders(<OTPVerificationModal {...defaultProps} />);

		const inputs = screen
			.getByLabelText('Verification Code')
			.querySelectorAll('input');
		await userEvent.type(inputs[0], '123');
		await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

		expect(screen.getByText('OTP code must be 6 digits')).toBeInTheDocument();
	});

	test('calls onSubmit when provided (custom handler)', async () => {
		const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
		renderWithProviders(
			<OTPVerificationModal {...defaultProps} onSubmit={mockOnSubmit} />
		);

		const inputs = screen
			.getByLabelText('Verification Code')
			.querySelectorAll('input');
		// Type 6 digits
		for (let i = 0; i < 6; i++) {
			await userEvent.type(inputs[i], '1');
		}

		// PinInput might auto-submit on complete, or we click button
		await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

		expect(mockOnSubmit).toHaveBeenCalledWith('111111');
		expect(defaultProps.onSuccess).toHaveBeenCalled();
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	test('calls mutation when no onSubmit provided (default behavior)', async () => {
		renderWithProviders(<OTPVerificationModal {...defaultProps} />);

		const inputs = screen
			.getByLabelText('Verification Code')
			.querySelectorAll('input');
		for (let i = 0; i < 6; i++) {
			await userEvent.type(inputs[i], '9');
		}

		await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

		expect(mockMutateAsync).toHaveBeenCalledWith({
			userId: 123,
			otp: '999999',
		});
		expect(defaultProps.onSuccess).toHaveBeenCalled();
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	test('displays server error on failure', async () => {
		mockMutateAsync.mockRejectedValue(new Error('Invalid code'));
		renderWithProviders(<OTPVerificationModal {...defaultProps} />);

		const inputs = screen
			.getByLabelText('Verification Code')
			.querySelectorAll('input');
		for (let i = 0; i < 6; i++) {
			await userEvent.type(inputs[i], '1');
		}

		await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

		await waitFor(() =>
			expect(screen.getByText('Verification failed')).toBeInTheDocument()
		);
		expect(screen.getByText('Invalid code')).toBeInTheDocument();
	});

	test('closes on cancel', async () => {
		renderWithProviders(<OTPVerificationModal {...defaultProps} />);

		await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(defaultProps.onClose).toHaveBeenCalled();
	});
});

import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import * as authQueries from '~/queries/authQueries';
import * as passwordResetStore from '~/stores/passwordResetStore';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock('~/components/Logo', () => ({
	default: () => <div data-testid='logo'>Logo</div>,
}));

vi.mock('./OTPVerificationModal', () => ({
	default: ({ opened, onSuccess, onClose }: any) =>
		opened ? (
			<div data-testid='otp-modal'>
				OTP Modal
				<button onClick={onSuccess}>Success</button>
				<button onClick={onClose}>Close</button>
			</div>
		) : null,
}));

describe('LoginForm', () => {
	const mockLoginMutateAsync = vi.fn();
	const mockSetPendingCredentials = vi.fn();
	const mockClearPendingCredentials = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock useLogin
		vi.spyOn(authQueries, 'useLogin').mockReturnValue({
			mutateAsync: mockLoginMutateAsync,
			isPending: false,
		} as any);

		// Mock usePasswordResetStore
		vi.spyOn(passwordResetStore, 'usePasswordResetStore').mockReturnValue({
			setPendingCredentials: mockSetPendingCredentials,
			clearPendingCredentials: mockClearPendingCredentials,
		} as any);
	});

	it('renders login form correctly', () => {
		renderWithProviders(<LoginForm />);

		expect(
			screen.getByText(/Sign in to manage your agents/i)
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/Enter your username/i)
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/Enter your password/i)
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Sign in/i })
		).toBeInTheDocument();
	});

	it('shows validation errors for empty fields', async () => {
		renderWithProviders(<LoginForm />);

		const submitButton = screen.getByRole('button', { name: /Sign in/i });
		const form = submitButton.closest('form');

		if (form) {
			fireEvent.submit(form);
		}

		expect(
			await screen.findByText(/Username is required/i)
		).toBeInTheDocument();
		expect(
			await screen.findByText(/Password is required/i)
		).toBeInTheDocument();

		expect(mockLoginMutateAsync).not.toHaveBeenCalled();
	});

	it('calls login mutation with correct values on submit', async () => {
		const user = userEvent.setup();
		renderWithProviders(<LoginForm />);

		await user.type(
			screen.getByPlaceholderText(/Enter your username/i),
			'testuser'
		);
		await user.type(
			screen.getByPlaceholderText(/Enter your password/i),
			'password123'
		);

		const submitButton = screen.getByRole('button', { name: /Sign in/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockLoginMutateAsync).toHaveBeenCalledWith({
				username: 'testuser',
				password: 'password123',
				loginType: 'USER_PASS',
			});
		});
	});

	it('displays error message on login failure', async () => {
		const user = userEvent.setup();
		const errorMessage = 'Invalid credentials';
		// Mocking the error structure that getErrorMessage likely expects
		mockLoginMutateAsync.mockRejectedValue({
			response: {
				data: {
					message: errorMessage,
				},
			},
		});

		renderWithProviders(<LoginForm />);

		await user.type(
			screen.getByPlaceholderText(/Enter your username/i),
			'testuser'
		);
		await user.type(
			screen.getByPlaceholderText(/Enter your password/i),
			'password123'
		);

		await user.click(screen.getByRole('button', { name: /Sign in/i }));

		await waitFor(() => {
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});
	});

	it('opens OTP modal when otpEnabled is true', async () => {
		const user = userEvent.setup();
		mockLoginMutateAsync.mockResolvedValue({ otpEnabled: true, userId: 123 });

		renderWithProviders(<LoginForm />);

		await user.type(
			screen.getByPlaceholderText(/Enter your username/i),
			'testuser'
		);
		await user.type(
			screen.getByPlaceholderText(/Enter your password/i),
			'password123'
		);

		await user.click(screen.getByRole('button', { name: /Sign in/i }));

		await waitFor(() => {
			expect(screen.getByTestId('otp-modal')).toBeInTheDocument();
			expect(mockClearPendingCredentials).toHaveBeenCalled();
		});
	});

	it('navigates to force-password-change when password change is required', async () => {
		const user = userEvent.setup();
		mockLoginMutateAsync.mockResolvedValue({
			otpEnabled: false,
			needToChangePassword: true,
		});

		renderWithProviders(<LoginForm />);

		await user.type(
			screen.getByPlaceholderText(/Enter your username/i),
			'testuser'
		);
		await user.type(
			screen.getByPlaceholderText(/Enter your password/i),
			'password123'
		);

		await user.click(screen.getByRole('button', { name: /Sign in/i }));

		await waitFor(() => {
			expect(mockSetPendingCredentials).toHaveBeenCalledWith(
				'testuser',
				'USER_PASS'
			);
			expect(mockNavigate).toHaveBeenCalledWith(
				'/force-password-change',
				expect.objectContaining({
					state: { username: 'testuser', loginType: 'USER_PASS' },
				})
			);
		});
	});

	it('navigates to dashboard on successful login', async () => {
		const user = userEvent.setup();
		mockLoginMutateAsync.mockResolvedValue({
			otpEnabled: false,
			needToChangePassword: false,
		});

		renderWithProviders(<LoginForm />);

		await user.type(
			screen.getByPlaceholderText(/Enter your username/i),
			'testuser'
		);
		await user.type(
			screen.getByPlaceholderText(/Enter your password/i),
			'password123'
		);

		await user.click(screen.getByRole('button', { name: /Sign in/i }));

		await waitFor(() => {
			expect(mockClearPendingCredentials).toHaveBeenCalled();
			expect(mockNavigate).toHaveBeenCalledWith('/');
		});
	});
});

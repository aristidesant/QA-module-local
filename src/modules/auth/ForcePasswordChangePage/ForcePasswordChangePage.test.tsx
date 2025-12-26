import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import * as authQueries from '~/queries/authQueries';
import ForcePasswordChangePage from './ForcePasswordChangePage';
import * as passwordResetStore from '~/stores/passwordResetStore';
import { useSessionStore } from '~/stores/sessionStore';
import * as logoutUtil from '~/utils/logout';

// Mocks for react-router hooks
const mockNavigate = vi.fn();
let mockLocationState: any = { state: {} };
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
		useLocation: () => mockLocationState,
	};
});

// Mock the password change section to simulate user interaction
vi.mock('~/modules/profile/PasswordChangeSection', () => ({
	default: ({ onSuccess, submitLabel }: any) => (
		<div>
			<button
				onClick={() =>
					onSuccess({ newPassword: 'new-password', currentPassword: 'old' })
				}
			>
				{submitLabel || 'Save'}
			</button>
		</div>
	),
}));

vi.mock('~/components/Logo', () => ({
	default: () => <div data-testid='logo'>Logo</div>,
}));

vi.mock('~/components/SectionTitle', () => ({ default: () => <div /> }));

describe('ForcePasswordChangePage', () => {
	const mockLoginMutateAsync = vi.fn();
	const mockClearPendingCredentials = vi.fn();
	const mockSetPendingCredentials = vi.fn();
	const mockLogout = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// default location state empty
		mockLocationState = { state: {} };

		// Mock useLogin
		vi.spyOn(authQueries, 'useLogin').mockReturnValue({
			mutateAsync: mockLoginMutateAsync,
			isPending: false,
		} as any);

		// Mock usePasswordResetStore
		vi.spyOn(passwordResetStore, 'usePasswordResetStore').mockReturnValue({
			pendingUsername: null,
			pendingLoginType: 'USER_PASS',
			setPendingCredentials: mockSetPendingCredentials,
			clearPendingCredentials: mockClearPendingCredentials,
		} as any);

		// Ensure no user to avoid route redirect
		useSessionStore.setState({ user: null });

		// Mock logout util
		vi.spyOn(logoutUtil, 'logout').mockImplementation(
			(redirectTo?: string, _options?: any) => mockLogout(redirectTo)
		);
	});

	it('renders and shows missing credentials alert when no username provided', () => {
		renderWithProviders(<ForcePasswordChangePage />);

		expect(
			screen.getByRole('heading', { name: 'Update Your Password' })
		).toBeInTheDocument();
		expect(screen.getByText('Security Check')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Return to login' })
		).toBeInTheDocument();
		expect(screen.getByText('Sign-in Needed After Update')).toBeInTheDocument();
	});

	it('calls logout and clears pending credentials when Return to login clicked', async () => {
		renderWithProviders(<ForcePasswordChangePage />);
		const user = userEvent.setup();

		await user.click(screen.getByRole('button', { name: 'Return to login' }));

		expect(mockClearPendingCredentials).toHaveBeenCalled();
		expect(mockLogout).toHaveBeenCalledWith('/login');
	});

	it('reauthenticates after password change and navigates to dashboard', async () => {
		// Provide username via route state
		mockLocationState = {
			state: { username: 'testuser', loginType: 'USER_PASS' },
		};
		mockLoginMutateAsync.mockResolvedValueOnce({ otpEnabled: false });

		renderWithProviders(<ForcePasswordChangePage />);

		await waitFor(() =>
			expect(screen.getByText(/Save new password/i)).toBeInTheDocument()
		);

		// Click the PasswordChangeSection mocked button
		await userEvent.click(screen.getByText('Save new password'));

		await waitFor(() => {
			expect(mockLoginMutateAsync).toHaveBeenCalledWith({
				username: 'testuser',
				password: 'new-password',
				loginType: 'USER_PASS',
			});
			expect(mockClearPendingCredentials).toHaveBeenCalled();
			expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
		});
	});

	it('shows reauth error when login fails', async () => {
		const errorMessage = 'Re-auth failed';
		mockLocationState = {
			state: { username: 'failuser', loginType: 'USER_PASS' },
		};
		mockLoginMutateAsync.mockRejectedValueOnce({
			response: { data: { message: errorMessage } },
		});

		renderWithProviders(<ForcePasswordChangePage />);

		await waitFor(() =>
			expect(screen.getByText('Save new password')).toBeInTheDocument()
		);
		await userEvent.click(screen.getByText('Save new password'));

		await waitFor(() => {
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
			// Confirm that navigation / success did not happen
			expect(mockNavigate).not.toHaveBeenCalledWith('/', expect.anything());
		});
	});
});

export {};

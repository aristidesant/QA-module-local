import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MFASection } from './MFASection';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSessionStore } from '~/stores/sessionStore';
import {
	useEnableMFA,
	useVerifyAndEnableMFA,
	useDisableMFA,
	useCurrentUser,
} from '~/queries/userQueries';
import { notifications } from '@mantine/notifications';

// Mock dependencies
vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: vi.fn(),
}));

vi.mock('~/queries/userQueries', () => ({
	useEnableMFA: vi.fn(),
	useVerifyAndEnableMFA: vi.fn(),
	useDisableMFA: vi.fn(),
	useCurrentUser: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('~/components/SectionCard/SectionCard', () => ({
	SectionCard: ({ title, children, headerActions }: any) => (
		<div data-testid='SectionCard'>
			<h2>{title}</h2>
			<div>{headerActions}</div>
			{children}
		</div>
	),
}));

const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

const renderWithProviders = (ui: React.ReactElement) => {
	const queryClient = createQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<MantineProvider>{ui}</MantineProvider>
		</QueryClientProvider>
	);
};

describe('MFASection', () => {
	const mockSetUser = vi.fn();
	const mockEnableMFA = vi.fn();
	const mockVerifyMFA = vi.fn();
	const mockDisableMFA = vi.fn();
	const mockRefetchUser = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useSessionStore as any).mockReturnValue({
			user: { mfaEnabled: false, email: 'test@example.com' },
			setUser: mockSetUser,
		});
		(useEnableMFA as any).mockReturnValue({
			mutateAsync: mockEnableMFA,
			isPending: false,
		});
		(useVerifyAndEnableMFA as any).mockReturnValue({
			mutateAsync: mockVerifyMFA,
			isPending: false,
		});
		(useDisableMFA as any).mockReturnValue({
			mutateAsync: mockDisableMFA,
			isPending: false,
		});
		(useCurrentUser as any).mockReturnValue({
			refetch: mockRefetchUser,
		});
	});

	it('renders correctly when MFA is disabled', () => {
		renderWithProviders(<MFASection />);

		expect(
			screen.getByText('Two-Factor Authentication (MFA)')
		).toBeInTheDocument();
		expect(screen.getByText('Disabled')).toBeInTheDocument();
		expect(screen.getByText('Enable MFA')).toBeInTheDocument();
	});

	it('starts enablement process', async () => {
		renderWithProviders(<MFASection />);

		fireEvent.click(screen.getByText('Enable MFA'));

		expect(screen.getByText('Confirm Your Identity')).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Enter your password')
		).toBeInTheDocument();
	});

	it('submits password to enable MFA and shows QR code (simulated)', async () => {
		mockEnableMFA.mockResolvedValue({ qrCodeUrl: 'mock-qr-code-url' });
		mockRefetchUser.mockResolvedValue({ data: { mfaEnabled: false } });

		renderWithProviders(<MFASection />);

		fireEvent.click(screen.getByText('Enable MFA'));

		const passwordInput = screen.getByPlaceholderText('Enter your password');
		fireEvent.change(passwordInput, { target: { value: 'password123' } });

		fireEvent.click(screen.getByText('Continue'));

		await waitFor(() => {
			expect(mockEnableMFA).toHaveBeenCalledWith({ password: 'password123' });
			expect(screen.getByText('Verification Code Sent')).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('Enter 6-digit code from your email')
			).toBeInTheDocument();
		});
	});

	it('verifies and enables MFA', async () => {
		// Setup state where QR code is shown (simulating previous step)
		// Since we can't easily set internal state, we have to go through the flow
		mockEnableMFA.mockResolvedValue({ qrCodeUrl: 'mock-qr-code-url' });
		mockRefetchUser.mockResolvedValue({ data: { mfaEnabled: false } });

		renderWithProviders(<MFASection />);

		// Enable flow
		fireEvent.click(screen.getByText('Enable MFA'));
		fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByText('Continue'));

		await waitFor(() => {
			expect(
				screen.getByPlaceholderText('Enter 6-digit code from your email')
			).toBeInTheDocument();
		});

		// Verify flow
		const codeInput = screen.getByPlaceholderText(
			'Enter 6-digit code from your email'
		);
		fireEvent.change(codeInput, { target: { value: '123456' } });

		fireEvent.click(screen.getByText('Verify and Enable'));

		await waitFor(() => {
			expect(mockVerifyMFA).toHaveBeenCalledWith({ code: '123456' });
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: '✓ Two-Factor Authentication Enabled',
				})
			);
		});
	});

	it('renders correctly when MFA is enabled', () => {
		(useSessionStore as any).mockReturnValue({
			user: { mfaEnabled: true, email: 'test@example.com' },
			setUser: mockSetUser,
		});

		renderWithProviders(<MFASection />);

		expect(screen.getByText('Enabled')).toBeInTheDocument();
		expect(screen.getByText('Disable MFA')).toBeInTheDocument();
	});

	it('starts disablement process', () => {
		(useSessionStore as any).mockReturnValue({
			user: { mfaEnabled: true, email: 'test@example.com' },
			setUser: mockSetUser,
		});

		renderWithProviders(<MFASection />);

		fireEvent.click(screen.getByText('Disable MFA'));

		expect(screen.getByText('Security Warning')).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Enter your password')
		).toBeInTheDocument();
	});

	it('disables MFA', async () => {
		(useSessionStore as any).mockReturnValue({
			user: { mfaEnabled: true, email: 'test@example.com' },
			setUser: mockSetUser,
		});

		renderWithProviders(<MFASection />);

		fireEvent.click(screen.getByText('Disable MFA'));

		const passwordInput = screen.getByPlaceholderText('Enter your password');
		fireEvent.change(passwordInput, { target: { value: 'password123' } });

		// There are two "Disable MFA" buttons (one to start, one to submit).
		// The first one is gone now. The submit one is in the form.
		// We can find it by type="submit" or color="red" but text is same.
		// Let's use getAllByText and pick the last one or use within form.
		const submitButton = screen.getByRole('button', { name: 'Disable MFA' });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockDisableMFA).toHaveBeenCalledWith({ password: 'password123' });
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Two-Factor Authentication Disabled',
				})
			);
		});
	});
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PasswordChangeSection } from './PasswordChangeSection';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChangePassword } from '~/queries/userQueries';
import { notifications } from '@mantine/notifications';

// Mock dependencies
vi.mock('~/queries/userQueries', () => ({
	useChangePassword: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('~/components/SectionCard/SectionCard', () => ({
	SectionCard: ({ title, children }: any) => (
		<div data-testid='SectionCard'>
			<h2>{title}</h2>
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

describe('PasswordChangeSection', () => {
	const mockMutateAsync = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useChangePassword as any).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false,
		});
	});

	it('renders correctly', () => {
		renderWithProviders(<PasswordChangeSection />);

		// Check that the SectionCard title is rendered
		expect(
			screen.getByRole('heading', { name: 'Change Password' })
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Enter your current password')
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Enter your new password')
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Confirm your new password')
		).toBeInTheDocument();
		// Check button exists
		expect(
			screen.getByRole('button', { name: 'Change Password' })
		).toBeInTheDocument();
	});

	it('validates matching passwords', async () => {
		renderWithProviders(<PasswordChangeSection />);

		const currentPassword = screen.getByPlaceholderText(
			'Enter your current password'
		);
		const newPassword = screen.getByPlaceholderText('Enter your new password');
		const confirmPassword = screen.getByPlaceholderText(
			'Confirm your new password'
		);
		const submitButton = screen.getByRole('button', {
			name: 'Change Password',
		});

		fireEvent.change(currentPassword, { target: { value: 'oldpass' } });
		fireEvent.change(newPassword, { target: { value: 'newpass123' } });
		fireEvent.change(confirmPassword, { target: { value: 'mismatch' } });

		fireEvent.click(submitButton);

		expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
	});

	it('validates new password is different from current', async () => {
		renderWithProviders(<PasswordChangeSection />);

		const currentPassword = screen.getByPlaceholderText(
			'Enter your current password'
		);
		const newPassword = screen.getByPlaceholderText('Enter your new password');
		const confirmPassword = screen.getByPlaceholderText(
			'Confirm your new password'
		);
		const submitButton = screen.getByRole('button', {
			name: 'Change Password',
		});

		fireEvent.change(currentPassword, { target: { value: 'samepass' } });
		fireEvent.change(newPassword, { target: { value: 'samepass' } });
		fireEvent.change(confirmPassword, { target: { value: 'samepass' } });

		fireEvent.click(submitButton);

		expect(
			screen.getByText(
				'New password must be different from your current password'
			)
		).toBeInTheDocument();
	});

	it('submits correctly when valid', async () => {
		renderWithProviders(<PasswordChangeSection />);

		const currentPassword = screen.getByPlaceholderText(
			'Enter your current password'
		);
		const newPassword = screen.getByPlaceholderText('Enter your new password');
		const confirmPassword = screen.getByPlaceholderText(
			'Confirm your new password'
		);
		const submitButton = screen.getByRole('button', {
			name: 'Change Password',
		});

		fireEvent.change(currentPassword, { target: { value: 'oldpass' } });
		fireEvent.change(newPassword, { target: { value: 'newpass123' } });
		fireEvent.change(confirmPassword, { target: { value: 'newpass123' } });

		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalledWith({
				currentPassword: 'oldpass',
				newPassword: 'newpass123',
			});
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: '✓ Password Successfully Updated',
				})
			);
		});
	});

	it('calls onSuccess callback if provided', async () => {
		const onSuccess = vi.fn();
		renderWithProviders(<PasswordChangeSection onSuccess={onSuccess} />);

		const currentPassword = screen.getByPlaceholderText(
			'Enter your current password'
		);
		const newPassword = screen.getByPlaceholderText('Enter your new password');
		const confirmPassword = screen.getByPlaceholderText(
			'Confirm your new password'
		);
		const submitButton = screen.getByRole('button', {
			name: 'Change Password',
		});

		fireEvent.change(currentPassword, { target: { value: 'oldpass' } });
		fireEvent.change(newPassword, { target: { value: 'newpass123' } });
		fireEvent.change(confirmPassword, { target: { value: 'newpass123' } });

		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(onSuccess).toHaveBeenCalledWith({
				currentPassword: 'oldpass',
				newPassword: 'newpass123',
			});
		});
	});

	it('handles submission error', async () => {
		mockMutateAsync.mockRejectedValue({
			response: { data: { message: 'Wrong password' } },
		});
		renderWithProviders(<PasswordChangeSection />);

		const currentPassword = screen.getByPlaceholderText(
			'Enter your current password'
		);
		const newPassword = screen.getByPlaceholderText('Enter your new password');
		const confirmPassword = screen.getByPlaceholderText(
			'Confirm your new password'
		);
		const submitButton = screen.getByRole('button', {
			name: 'Change Password',
		});

		fireEvent.change(currentPassword, { target: { value: 'oldpass' } });
		fireEvent.change(newPassword, { target: { value: 'newpass123' } });
		fireEvent.change(confirmPassword, { target: { value: 'newpass123' } });

		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Password Change Failed',
					message: 'Wrong password',
				})
			);
		});
	});
});

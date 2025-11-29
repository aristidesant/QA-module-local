import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientForm from './ClientForm';

// Mock the queries
vi.mock('~/queries/clientQueries', () => ({
	useCreateClient: vi.fn(() => ({
		mutateAsync: vi.fn(),
		isPending: false,
	})),
}));

vi.mock('~/queries/countryQueries', () => ({
	useGetCountries: vi.fn(() => ({
		data: [
			{ id: 1, name: 'United States' },
			{ id: 2, name: 'Canada' },
			{ id: 3, name: 'Mexico' },
		],
		isLoading: false,
	})),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

import { useCreateClient } from '~/queries/clientQueries';
import { useGetCountries } from '~/queries/countryQueries';
import { notifications } from '@mantine/notifications';

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

describe('ClientForm', () => {
	const mockOnClose = vi.fn();
	const mockOnSuccess = vi.fn();
	const mockMutateAsync = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockMutateAsync.mockReset();
		(notifications.show as ReturnType<typeof vi.fn>).mockReset();
		(useCreateClient as ReturnType<typeof vi.fn>).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false,
		});
		(useGetCountries as ReturnType<typeof vi.fn>).mockReturnValue({
			data: [
				{ id: 1, name: 'United States' },
				{ id: 2, name: 'Canada' },
				{ id: 3, name: 'Mexico' },
			],
			isLoading: false,
		});
	});

	describe('Rendering', () => {
		it('renders the form with all required fields', () => {
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('client@example.com')
			).toBeInTheDocument();
			expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('Enter a brief description of the client')
			).toBeInTheDocument();
		});

		it('renders the form with all optional fields', () => {
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/rnc/i)).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('Enter client address')
			).toBeInTheDocument();
			expect(screen.getByPlaceholderText('Select country')).toBeInTheDocument();
		});

		it('renders section titles correctly', () => {
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			expect(screen.getByText('Required Information')).toBeInTheDocument();
			expect(screen.getByText('Additional Details')).toBeInTheDocument();
		});

		it('renders section descriptions', () => {
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			expect(
				screen.getByText('Fill in the essentials to create the client profile.')
			).toBeInTheDocument();
			expect(
				screen.getByText('Optional contact information and identifiers.')
			).toBeInTheDocument();
		});

		it('renders Cancel and Create Client buttons', () => {
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			expect(
				screen.getByRole('button', { name: /cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /create client/i })
			).toBeInTheDocument();
		});

		it('renders the hint text', () => {
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			expect(
				screen.getByText(
					/check the information before saving to avoid manual corrections later/i
				)
			).toBeInTheDocument();
		});
	});

	describe('User Interactions', () => {
		it('calls onClose when Cancel button is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const cancelButton = screen.getByRole('button', { name: /cancel/i });
			await user.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});

		it('allows typing in text input fields', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const clientNameInput = screen.getByLabelText(/client name/i);
			const apiKeyInput = screen.getByLabelText(/api key/i);
			const phoneInput = screen.getByLabelText(/phone/i);

			await user.type(clientNameInput, 'Test Client');
			await user.type(apiKeyInput, 'api-key-123');
			await user.type(phoneInput, '+1 555 123 4567');

			expect(clientNameInput).toHaveValue('Test Client');
			expect(apiKeyInput).toHaveValue('api-key-123');
			expect(phoneInput).toHaveValue('+1 555 123 4567');
		});

		it('allows typing in email field', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const emailInput = screen.getByPlaceholderText('client@example.com');
			await user.type(emailInput, 'test@example.com');

			expect(emailInput).toHaveValue('test@example.com');
		});

		it('allows typing in description textarea', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const descriptionInput = screen.getByPlaceholderText(
				'Enter a brief description of the client'
			);
			await user.type(descriptionInput, 'Test description');

			expect(descriptionInput).toHaveValue('Test description');
		});

		it('allows typing in address textarea', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const addressInput = screen.getByPlaceholderText('Enter client address');
			await user.type(addressInput, '123 Main St');

			expect(addressInput).toHaveValue('123 Main St');
		});

		it('allows typing in RNC field', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const rncInput = screen.getByLabelText(/rnc/i);
			await user.type(rncInput, '123456789');

			expect(rncInput).toHaveValue('123456789');
		});
	});

	describe('Form Submission', () => {
		it('has a submit button that shows correct text', () => {
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const submitButton = screen.getByRole('button', {
				name: /create client/i,
			});
			expect(submitButton).toBeInTheDocument();
			expect(submitButton).toHaveAttribute('type', 'submit');
		});

		it('uses useCreateClient hook', () => {
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			expect(useCreateClient).toHaveBeenCalled();
		});
	});

	describe('Loading States', () => {
		it('shows loading state on submit button when isPending is true', () => {
			(useCreateClient as ReturnType<typeof vi.fn>).mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: true,
			});

			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			expect(
				screen.getByRole('button', { name: /creating/i })
			).toBeInTheDocument();
		});

		it('disables country select when countries are loading', () => {
			(useGetCountries as ReturnType<typeof vi.fn>).mockReturnValue({
				data: [],
				isLoading: true,
			});

			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const countrySelect = screen.getByPlaceholderText('Select country');
			expect(countrySelect).toBeDisabled();
		});
	});

	describe('Country Select', () => {
		it('populates country options from API data', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const countrySelect = screen.getByPlaceholderText('Select country');
			await user.click(countrySelect);

			await waitFor(() => {
				expect(screen.getByText('United States')).toBeInTheDocument();
				expect(screen.getByText('Canada')).toBeInTheDocument();
				expect(screen.getByText('Mexico')).toBeInTheDocument();
			});
		});

		it('shows empty country list when no countries available', async () => {
			(useGetCountries as ReturnType<typeof vi.fn>).mockReturnValue({
				data: [],
				isLoading: false,
			});

			const user = userEvent.setup();
			renderWithProviders(
				<ClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />
			);

			const countrySelect = screen.getByPlaceholderText('Select country');
			await user.click(countrySelect);

			await waitFor(() => {
				expect(screen.getByText('No countries found')).toBeInTheDocument();
			});
		});
	});
});

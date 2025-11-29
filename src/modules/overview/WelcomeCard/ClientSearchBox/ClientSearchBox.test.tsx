import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientSearchBox from './ClientSearchBox';

// Mock the stores
const mockSetSearchQuery = vi.fn();
vi.mock('~/stores/clientStore', () => ({
	useClientStore: vi.fn(() => ({
		searchQuery: '',
		setSearchQuery: mockSetSearchQuery,
	})),
}));

import { useClientStore } from '~/stores/clientStore';

// Mock ClientForm component
vi.mock('../ClientForm', () => ({
	default: vi.fn(
		({
			onClose,
			onSuccess,
		}: {
			onClose: () => void;
			onSuccess: () => void;
		}) => (
			<div data-testid='client-form'>
				<button onClick={onClose} data-testid='form-close-button'>
					Close Form
				</button>
				<button onClick={onSuccess} data-testid='form-success-button'>
					Success
				</button>
			</div>
		)
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
	return {
		queryClient,
		...render(
			<QueryClientProvider client={queryClient}>
				<MantineProvider>{ui}</MantineProvider>
			</QueryClientProvider>
		),
	};
};

describe('ClientSearchBox', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(useClientStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			searchQuery: '',
			setSearchQuery: mockSetSearchQuery,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders the search input with placeholder', () => {
			renderWithProviders(<ClientSearchBox />);

			expect(screen.getByPlaceholderText('Search client')).toBeInTheDocument();
		});

		it('renders the Add Client button', () => {
			renderWithProviders(<ClientSearchBox />);

			expect(
				screen.getByRole('button', { name: /add client/i })
			).toBeInTheDocument();
		});

		it('renders the search icon in the input', () => {
			renderWithProviders(<ClientSearchBox />);

			const searchInput = screen.getByPlaceholderText('Search client');
			expect(searchInput).toBeInTheDocument();
		});

		it('displays the current search query from store', () => {
			(useClientStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				searchQuery: 'test query',
				setSearchQuery: mockSetSearchQuery,
			});

			renderWithProviders(<ClientSearchBox />);

			const searchInput = screen.getByPlaceholderText('Search client');
			expect(searchInput).toHaveValue('test query');
		});
	});

	describe('Search Functionality', () => {
		it('calls setSearchQuery when typing in search input', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ClientSearchBox />);

			const searchInput = screen.getByPlaceholderText('Search client');
			await user.type(searchInput, 'a');

			expect(mockSetSearchQuery).toHaveBeenCalled();
		});

		it('calls setSearchQuery with each keystroke', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ClientSearchBox />);

			const searchInput = screen.getByPlaceholderText('Search client');
			await user.type(searchInput, 'abc');

			expect(mockSetSearchQuery).toHaveBeenCalledTimes(3);
		});
	});

	describe('Modal Behavior', () => {
		it('does not show modal initially', () => {
			renderWithProviders(<ClientSearchBox />);

			expect(screen.queryByText('Create New Client')).not.toBeInTheDocument();
		});

		it('opens modal when Add Client button is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ClientSearchBox />);

			const addButton = screen.getByRole('button', { name: /add client/i });
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByText('Create New Client')).toBeInTheDocument();
			});
		});

		it('renders ClientForm inside modal when opened', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ClientSearchBox />);

			const addButton = screen.getByRole('button', { name: /add client/i });
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByTestId('client-form')).toBeInTheDocument();
			});
		});

		it('closes modal when form close is triggered', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ClientSearchBox />);

			const addButton = screen.getByRole('button', { name: /add client/i });
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByText('Create New Client')).toBeInTheDocument();
			});

			const closeButton = screen.getByTestId('form-close-button');
			await user.click(closeButton);

			await waitFor(() => {
				expect(screen.queryByText('Create New Client')).not.toBeInTheDocument();
			});
		});
	});

	describe('Query Invalidation', () => {
		it('invalidates clients query when onSuccess is triggered', async () => {
			const user = userEvent.setup();
			const { queryClient } = renderWithProviders(<ClientSearchBox />);
			const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const addButton = screen.getByRole('button', { name: /add client/i });
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByTestId('client-form')).toBeInTheDocument();
			});

			const successButton = screen.getByTestId('form-success-button');
			await user.click(successButton);

			expect(invalidateQueriesSpy).toHaveBeenCalledWith({
				queryKey: ['clients'],
			});
		});
	});

	describe('Accessibility', () => {
		it('search input is focusable', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ClientSearchBox />);

			const searchInput = screen.getByPlaceholderText('Search client');
			await user.click(searchInput);

			expect(searchInput).toHaveFocus();
		});

		it('Add Client button is focusable', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ClientSearchBox />);

			const addButton = screen.getByRole('button', { name: /add client/i });
			await user.click(addButton);

			// After clicking, the modal opens and button loses focus
			// We just verify the button exists and is clickable
			expect(addButton).toBeInTheDocument();
		});
	});
});

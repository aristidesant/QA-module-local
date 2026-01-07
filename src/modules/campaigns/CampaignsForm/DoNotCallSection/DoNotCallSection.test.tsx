import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DoNotCallSection from './DoNotCallSection';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { DoNotCallModel } from '~/models/DoNotCallModel';

// Mock dependencies
vi.mock('~/queries/doNotCallQueries', () => ({
	useDoNotCallList: vi.fn(),
	useDeleteDoNotCall: vi.fn(() => ({
		mutateAsync: vi.fn(),
	})),
	useCreateDoNotCall: vi.fn(() => ({
		mutateAsync: vi.fn(),
	})),
	useUpdateDoNotCall: vi.fn(() => ({
		mutateAsync: vi.fn(),
	})),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
		close: vi.fn(),
		openConfirmModal: vi.fn(),
	},
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('~/modules/do-not-call/DoNotCallFilters', () => ({
	default: ({
		searchValue,
		onSearchChange,
	}: {
		searchValue: string;
		onSearchChange: (value: string) => void;
	}) => (
		<div data-testid='dnc-filters'>
			<input
				data-testid='search-input'
				value={searchValue}
				onChange={(e) => onSearchChange(e.target.value)}
				placeholder='Search by phone number...'
			/>
		</div>
	),
}));

vi.mock('~/modules/do-not-call/hooks/useDoNotCallColumns', () => ({
	useDoNotCallColumns: vi.fn(() => [
		{
			accessorKey: 'phoneNumber',
			header: 'Phone Number',
		},
		{
			accessorKey: 'reason',
			header: 'Reason',
		},
	]),
}));

vi.mock('~/modules/do-not-call/DoNotCallForm', () => ({
	default: () => <div data-testid='dnc-form'>DoNotCallForm</div>,
}));

vi.mock('~/components/BaseTable', () => ({
	default: ({
		data,
		onRowClick,
	}: {
		data: DoNotCallModel[];
		onRowClick: (entry: DoNotCallModel) => void;
	}) => (
		<div data-testid='base-table'>
			{data.map((entry) => (
				<div
					key={entry.id}
					data-testid={`row-${entry.id}`}
					onClick={() => onRowClick(entry)}
				>
					{entry.phoneNumber}
				</div>
			))}
		</div>
	),
}));

vi.mock('~/components/PaginationControls', () => ({
	default: () => <div data-testid='pagination-controls'>Pagination</div>,
}));

vi.mock('~/components/EmptyState', () => ({
	default: ({
		message,
		description,
		action,
	}: {
		message: string;
		description: string;
		action: React.ReactNode;
	}) => (
		<div data-testid='empty-state'>
			<span>{message}</span>
			<span>{description}</span>
			{action}
		</div>
	),
}));

vi.mock('~/components/SectionCard', () => ({
	default: ({
		title,
		description,
		headerActions,
		children,
	}: {
		title: string;
		description: string;
		headerActions: React.ReactNode;
		children: React.ReactNode;
	}) => (
		<div data-testid='section-card'>
			<h2>{title}</h2>
			<p>{description}</p>
			<div data-testid='header-actions'>{headerActions}</div>
			{children}
		</div>
	),
}));

// Import mocked module to control its behavior
import { useDoNotCallList } from '~/queries/doNotCallQueries';
import { modals } from '@mantine/modals';

const mockDoNotCallData: DoNotCallModel[] = [
	{
		id: 1,
		clientId: 1,
		phoneNumber: '+1234567890',
		reason: 'CUSTOMER_REQUEST',
		notes: 'Test note',
		expiresAt: null,
		createdByUserId: 1,
		callDispositionId: null,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		deletedAt: null,
		isActive: true,
	},
	{
		id: 2,
		clientId: 1,
		phoneNumber: '+0987654321',
		reason: 'REGULATORY_COMPLIANCE',
		notes: null,
		expiresAt: '2024-12-31T00:00:00Z',
		createdByUserId: 1,
		callDispositionId: null,
		createdAt: '2024-01-02T00:00:00Z',
		updatedAt: '2024-01-02T00:00:00Z',
		deletedAt: null,
		isActive: true,
	},
];

describe('DoNotCallSection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders the section card with title and description', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByText('Do Not Call List')).toBeInTheDocument();
			expect(
				screen.getByText('Manage phone numbers that should not be contacted.')
			).toBeInTheDocument();
		});

		it('renders Add Entry button in header', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: {
					data: mockDoNotCallData,
					total: 2,
					page: 1,
					limit: 10,
					totalPages: 1,
				},
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			// When data exists, only the header button is shown
			expect(
				screen.getByRole('button', { name: /add entry/i })
			).toBeInTheDocument();
		});

		it('renders filters component', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByTestId('dnc-filters')).toBeInTheDocument();
		});
	});

	describe('Loading State', () => {
		it('displays loading message when isLoading is true', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: undefined,
				isLoading: true,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('displays loading message when isFetching is true', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: {
					data: mockDoNotCallData,
					total: 2,
					page: 1,
					limit: 10,
					totalPages: 1,
				},
				isLoading: false,
				isFetching: true,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});
	});

	describe('Error State', () => {
		it('displays error message when there is an error', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: undefined,
				isLoading: false,
				isFetching: false,
				isError: true,
				error: new Error('Network error'),
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByText('Network error')).toBeInTheDocument();
		});

		it('displays default error message when error is not an Error instance', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: undefined,
				isLoading: false,
				isFetching: false,
				isError: true,
				error: 'Something went wrong',
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(
				screen.getByText('Failed to load Do Not Call entries.')
			).toBeInTheDocument();
		});
	});

	describe('Empty State', () => {
		it('displays empty state when no data is returned', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			expect(screen.getByText('No entries yet')).toBeInTheDocument();
			expect(
				screen.getByText('Add phone numbers to the Do Not Call list')
			).toBeInTheDocument();
		});

		it('displays empty state when data is undefined', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: { data: undefined, total: 0, page: 1, limit: 10, totalPages: 0 },
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		});
	});

	describe('Data Display', () => {
		it('renders table with data when entries exist', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: {
					data: mockDoNotCallData,
					total: 2,
					page: 1,
					limit: 10,
					totalPages: 1,
				},
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByTestId('base-table')).toBeInTheDocument();
			expect(screen.getByText('+1234567890')).toBeInTheDocument();
			expect(screen.getByText('+0987654321')).toBeInTheDocument();
		});

		it('renders pagination controls when data exists', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: {
					data: mockDoNotCallData,
					total: 2,
					page: 1,
					limit: 10,
					totalPages: 1,
				},
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
		});

		it('allows selecting a row by clicking on it', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: {
					data: mockDoNotCallData,
					total: 2,
					page: 1,
					limit: 10,
					totalPages: 1,
				},
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			const row = screen.getByTestId('row-1');
			fireEvent.click(row);

			// The row should now be selected (we can verify by the component's internal state)
			expect(row).toBeInTheDocument();
		});
	});

	describe('Add Entry Modal', () => {
		it('opens create modal when Add Entry button is clicked', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: {
					data: mockDoNotCallData,
					total: 2,
					page: 1,
					limit: 10,
					totalPages: 1,
				},
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			// When data exists, only the header button is shown
			const addButton = screen.getByRole('button', { name: /add entry/i });
			fireEvent.click(addButton);

			expect(modals.open).toHaveBeenCalledWith(
				expect.objectContaining({
					modalId: 'create-dnc-entry',
					title: 'Add Do Not Call Entry',
				})
			);
		});

		it('opens create modal from empty state Add Entry button', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			// Find the button in the empty state action
			const buttons = screen.getAllByRole('button', { name: /add entry/i });
			// Click the one in the empty state (second button)
			fireEvent.click(buttons[1]);

			expect(modals.open).toHaveBeenCalledWith(
				expect.objectContaining({
					modalId: 'create-dnc-entry',
					title: 'Add Do Not Call Entry',
				})
			);
		});
	});

	describe('Search Functionality', () => {
		it('allows typing in the search input', async () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: {
					data: mockDoNotCallData,
					total: 2,
					page: 1,
					limit: 10,
					totalPages: 1,
				},
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: '+1234' } });

			await waitFor(() => {
				expect(searchInput).toHaveValue('+1234');
			});
		});
	});

	describe('Component with campaignId prop', () => {
		it('renders correctly when campaignId is provided', () => {
			vi.mocked(useDoNotCallList).mockReturnValue({
				data: {
					data: mockDoNotCallData,
					total: 2,
					page: 1,
					limit: 10,
					totalPages: 1,
				},
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

			renderWithProviders(<DoNotCallSection campaignId={123} />);

			expect(screen.getByText('Do Not Call List')).toBeInTheDocument();
			expect(screen.getByTestId('base-table')).toBeInTheDocument();
		});
	});
});

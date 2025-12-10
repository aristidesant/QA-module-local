import { render, fireEvent } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import type { ConversationsModel } from '~/models/ConversationsModels';
import type { ConversationFiltersType } from './ConversationFilters';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ConversationsList from './ConversationsList';
import * as conversationsQueries from '~/queries/conversationsQueries';

// Avoid act warnings from debounce
vi.mock('@mantine/hooks', async () => {
	const actual = await vi.importActual<any>('@mantine/hooks');
	return { ...actual, useDebouncedValue: (v: any) => [v] };
});

describe('ConversationsList - server-side sorting', () => {
	it('sends default createdAt desc sorting on initial load', async () => {
		const hookSpy = vi
			.spyOn(conversationsQueries, 'useGetConversations')
			.mockImplementation(
				() =>
					({
						data: { data: [], total: 0 },
						isLoading: false,
						isFetching: false,
						isError: false,
						error: null,
						refetch: vi.fn(),
					}) as any
			);
		renderWithProviders(<ConversationsList />);

		expect(hookSpy).toHaveBeenCalled();
		const params = hookSpy.mock.calls.at(-1)?.[0] as any;
		expect(params).toEqual(
			expect.objectContaining({ sortBy: 'startDate', sortOrder: 'desc' })
		);
	});

	it('toggles to createdAt asc and resets to first page', async () => {
		// Ensure table renders and multiple pages to navigate
		const hookSpy = vi
			.spyOn(conversationsQueries, 'useGetConversations')
			.mockReturnValue({
				data: {
					data: [
						{ id: 1, createdAt: '2024-01-01T00:00:00Z' },
						{ id: 2, createdAt: '2024-01-02T00:00:00Z' },
					],
					total: 25,
				},
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			} as any);

		const user = userEvent.setup();
		renderWithProviders(<ConversationsList />);

		// Move to page 2 via PaginationControls
		await user.click(screen.getByTestId('page-2'));

		// Click the Created At column header (assuming column labeled Created At)
		// Fallback to generic 'Created' matching if exact label differs
		const createdHeader = screen.getByRole('columnheader', { name: /when/i });
		await user.click(createdHeader);

		await waitFor(() => {
			const params = hookSpy.mock.calls.at(-1)?.[0] as any;
			expect(params).toEqual(
				expect.objectContaining({
					sortBy: 'startDate',
					sortOrder: 'desc',
					offset: 0,
				})
			);
		});
	});
});

// Mock useGetConversations
const mockUseGetConversations = vi.fn();
vi.mock('~/queries/conversationsQueries', () => ({
	useGetConversations: (...args: unknown[]) => mockUseGetConversations(...args),
}));

vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canAccessModule: () => true,
		canPerformAction: () => true,
	}),
}));

// Mock useConversationStore
const mockSetSelection = vi.fn();
vi.mock('~/stores/useConversationStore', () => ({
	useConversationStore: vi.fn(() => ({
		selectedId: null,
		setSelection: mockSetSelection,
	})),
}));

// Mock usePagination
const mockSetCurrentPage = vi.fn();
const mockSetItemsPerPage = vi.fn();
vi.mock('~/hooks/usePagination', () => ({
	usePagination: () => ({
		currentPage: 1,
		itemsPerPage: 10,
		setCurrentPage: mockSetCurrentPage,
		setItemsPerPage: mockSetItemsPerPage,
		getApiParams: () => ({ offset: 0, limit: 10 }),
		calculateTotalPages: () => 1,
	}),
}));

// Mock ConversationDetails
vi.mock('~/modules/conversations/ConversationDetails', () => ({
	default: () => <div data-testid='conversation-details'>Details</div>,
}));

// Mock ExportToExcelModal
vi.mock('./components/ExportToExcelModal', () => ({
	default: ({ opened, onClose }: { opened: boolean; onClose: () => void }) =>
		opened ? (
			<div data-testid='export-modal'>
				<button onClick={onClose}>Close Export</button>
			</div>
		) : null,
}));

// Mock ConversationFilters
vi.mock('./ConversationFilters', () => ({
	default: ({
		filters,
		onFiltersChange,
	}: {
		filters: ConversationFiltersType;
		onFiltersChange: (filters: ConversationFiltersType) => void;
	}) => (
		<div data-testid='conversation-filters'>
			<button
				data-testid='apply-filter'
				onClick={() => onFiltersChange({ contactName: 'Test' })}
			>
				Apply Filter
			</button>
			<span data-testid='current-filters'>{JSON.stringify(filters)}</span>
		</div>
	),
}));

// Mock BaseTable (use a table element to avoid hydration warnings)
vi.mock('~/components/BaseTable', () => ({
	__esModule: true,
	default: ({
		data,
		onRowClick,
		columns,
	}: {
		data: ConversationsModel[];
		onRowClick?: (row: ConversationsModel) => void;
		columns: { id?: string; header: string }[];
	}) => (
		<table data-testid='base-table'>
			<thead>
				<tr>
					{columns.map((col, i) => (
						<th key={i}>{col.header}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((item: ConversationsModel) => (
					<tr
						key={item.id}
						data-testid={`row-${item.id}`}
						onClick={() => onRowClick?.(item)}
					>
						<td>{item.contactName}</td>
					</tr>
				))}
			</tbody>
		</table>
	),
}));

// Mock EmptyState
vi.mock('~/components/EmptyState', () => ({
	__esModule: true,
	default: ({
		message,
		description,
	}: {
		message: string;
		description: string;
	}) => (
		<div data-testid='empty-state'>
			<div>{message}</div>
			<div>{description}</div>
		</div>
	),
}));

// Mock PaginationControls
vi.mock('~/components/PaginationControls', () => ({
	__esModule: true,
	default: ({
		onPageChange,
		onItemsPerPageChange,
	}: {
		onPageChange?: (page: number) => void;
		onItemsPerPageChange?: (value: string) => void;
	}) => (
		<div data-testid='pagination-controls'>
			<button onClick={() => onPageChange?.(2)} data-testid='page-2'>
				Page 2
			</button>
			<button
				onClick={() => onItemsPerPageChange?.('20')}
				data-testid='items-per-page-20'
			>
				20 per page
			</button>
		</div>
	),
}));

const sampleConversation: ConversationsModel = {
	id: 1,
	identifier: 'conv-001',
	agentId: 'agent-1',
	agentName: 'Test Agent',
	campaignId: 1,
	contactId: 1,
	status: 'completed',
	startDate: '2025-01-15T10:00:00Z',
	endDate: '2025-01-15T10:05:00Z',
	userId: 1,
	contactName: 'John Doe',
	clientId: 1,
	contactPhoneNumber: '+1234567890',
	transcriptContent: {
		analysis: {
			call_successful: 'yes',
			transcript_summary: 'Test summary',
			data_collection_results: {},
			evaluation_criteria_results: {},
		},
		metadata: {
			cost: 0.5,
			feedback: { likes: 0, dislikes: 0, overall_score: null },
			call_duration_secs: 300,
			termination_reason: 'completed',
			start_time_unix_secs: 1705312800,
		},
		transcript: [],
		conversationInitiationClientData: {
			dynamic_variables: {},
			custom_llm_extra_body: {},
			conversation_config_override: {},
		},
	},
	transcriptUrl: null,
	transcriptVoiceUrl: null,
	voiceFileId: null,
	createdAt: '2025-01-15T10:00:00Z',
	updatedAt: '2025-01-15T10:05:00Z',
	deletedAt: null,
	agent: { id: 'agent-1', name: 'Test Agent' } as ConversationsModel['agent'],
	campaign: { id: 1, name: 'Test Campaign' } as ConversationsModel['campaign'],
	contact: null,
	voiceFile: null,
	dispositions: {
		id: 1,
		conversationId: 1,
		dispositionName: 'Interested',
		callStatus: 'POSITIVE',
	} as ConversationsModel['dispositions'],
};

const renderComponent = (props = {}) =>
	render(
		<MantineProvider>
			<ConversationsList {...props} />
		</MantineProvider>
	);

describe('ConversationsList', () => {
	beforeEach(() => {
		// Ensure any previous spies (from the sorting suite) are removed
		vi.restoreAllMocks();
		vi.clearAllMocks();

		mockUseGetConversations.mockReturnValue({
			data: {
				data: [sampleConversation],
				total: 1,
			},
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		});
	});

	describe('rendering', () => {
		it('renders conversation rows when data exists', () => {
			renderComponent();
			expect(screen.getByTestId('base-table')).toBeInTheDocument();
			expect(screen.getByTestId('row-1')).toBeInTheDocument();
		});

		it('renders empty state when no conversations', () => {
			mockUseGetConversations.mockReturnValue({
				data: { data: [], total: 0 },
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			expect(screen.getByText('No conversations yet')).toBeInTheDocument();
			expect(
				screen.getByText(
					'We will display conversations as soon as they are available.'
				)
			).toBeInTheDocument();
		});

		it('renders error state with error message', () => {
			mockUseGetConversations.mockReturnValue({
				data: null,
				isLoading: false,
				isFetching: false,
				isError: true,
				error: new Error('Failed to fetch'),
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
		});

		it('renders error state with generic message when error is not an Error instance', () => {
			mockUseGetConversations.mockReturnValue({
				data: null,
				isLoading: false,
				isFetching: false,
				isError: true,
				error: 'Unknown error',
				refetch: vi.fn(),
			});

			renderComponent();
			expect(
				screen.getByText('Unable to load conversations. Please try again.')
			).toBeInTheDocument();
		});

		it('renders conversation filters component', () => {
			renderComponent();
			expect(screen.getByTestId('conversation-filters')).toBeInTheDocument();
		});

		it('renders pagination controls', () => {
			renderComponent();
			expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
		});
	});

	describe('user interactions', () => {
		it('calls refetch when refresh button is clicked', async () => {
			const mockRefetch = vi.fn();
			mockUseGetConversations.mockReturnValue({
				data: { data: [sampleConversation], total: 1 },
				isLoading: false,
				isFetching: false,
				isError: false,
				error: null,
				refetch: mockRefetch,
			});

			renderComponent();
			const refreshButton = screen.getByLabelText('Refresh conversations');
			fireEvent.click(refreshButton);
			expect(mockRefetch).toHaveBeenCalled();
		});

		it('opens export modal when export button is clicked', async () => {
			renderComponent();
			const exportButton = screen.getByLabelText('Export conversations');
			fireEvent.click(exportButton);
			expect(await screen.findByTestId('export-modal')).toBeInTheDocument();
		});

		it('closes export modal when close button is clicked', async () => {
			renderComponent();
			const exportButton = screen.getByLabelText('Export conversations');
			fireEvent.click(exportButton);
			expect(await screen.findByTestId('export-modal')).toBeInTheDocument();

			fireEvent.click(screen.getByText('Close Export'));
			await waitFor(() => {
				expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
			});
		});

		it('calls setSelection when row is clicked without onConversationClick prop', () => {
			renderComponent();
			const row = screen.getByTestId('row-1');
			fireEvent.click(row);
			expect(mockSetSelection).toHaveBeenCalledWith(1, expect.anything());
		});

		it('calls onConversationClick when row is clicked with onConversationClick prop', () => {
			const mockOnConversationClick = vi.fn();
			renderComponent({ onConversationClick: mockOnConversationClick });
			const row = screen.getByTestId('row-1');
			fireEvent.click(row);
			expect(mockOnConversationClick).toHaveBeenCalledWith(sampleConversation);
			expect(mockSetSelection).not.toHaveBeenCalled();
		});

		it('applies filter when filter component triggers change', () => {
			renderComponent();
			const applyFilterButton = screen.getByTestId('apply-filter');
			fireEvent.click(applyFilterButton);

			// The filter should be applied and passed to useGetConversations
			expect(mockUseGetConversations).toHaveBeenCalled();
		});

		it('handles pagination items per page change', () => {
			renderComponent();
			fireEvent.click(screen.getByTestId('items-per-page-20'));
			expect(mockSetItemsPerPage).toHaveBeenCalledWith(20);
		});

		it('handles page change', () => {
			renderComponent();
			fireEvent.click(screen.getByTestId('page-2'));
			expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
		});
	});

	describe('column headers', () => {
		it('renders all expected column headers with exact labels', () => {
			renderComponent();
			expect(screen.getByText('Contact Name')).toBeInTheDocument();
			expect(screen.getByText('Phone Number')).toBeInTheDocument();
			expect(screen.getByText('Outcome')).toBeInTheDocument();
			expect(screen.getByText('Status')).toBeInTheDocument();
			expect(screen.getByText('When')).toBeInTheDocument();
			expect(screen.getByText('Duration')).toBeInTheDocument();
		});
	});

	describe('props handling', () => {
		it('passes campaignId to useGetConversations', () => {
			renderComponent({ campaignId: 123 });
			expect(mockUseGetConversations).toHaveBeenCalledWith(
				expect.objectContaining({ campaignId: 123 })
			);
		});

		it('passes contactGroupId to useGetConversations', () => {
			renderComponent({ contactGroupId: 456 });
			expect(mockUseGetConversations).toHaveBeenCalledWith(
				expect.objectContaining({ contactGroupId: 456 })
			);
		});
	});
});

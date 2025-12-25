import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import CampaignPromptTypesContent from './CampaignPromptTypesContent';

// Mock campaignPromptsApi
vi.mock('~/api/campaignPromptApi', () => ({
	default: () => ({
		getCampaignPromptsByType: vi.fn().mockResolvedValue([]),
	}),
}));

// Mock notifications - must be defined with vi.hoisted for proper hoisting
const { mockNotificationsShow, mockDeletePromptType, mockPromptTypesData } =
	vi.hoisted(() => ({
		mockNotificationsShow: vi.fn(),
		mockDeletePromptType: vi.fn(),
		mockPromptTypesData: {
			data: [] as CampaignPromptTypeModel[],
			isLoading: false,
		},
	}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: mockNotificationsShow,
	},
}));

// Store modal close handlers for testing
const modalCloseHandlers: Record<string, () => void> = {};

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Modal: ({
			children,
			opened,
			onClose,
			title,
		}: {
			children: React.ReactNode;
			opened: boolean;
			onClose: () => void;
			title: string;
			size?: string;
		}) => {
			// Store the close handler for testing
			if (title === 'Create Campaign Prompt Type') {
				modalCloseHandlers.create = onClose;
			} else if (title === 'Edit Campaign Prompt Type') {
				modalCloseHandlers.edit = onClose;
			} else if (title === 'Prompt Type in Use') {
				modalCloseHandlers.reassign = onClose;
			}
			return opened ? (
				<div data-testid={`modal-${title.toLowerCase().replace(/\s+/g, '-')}`}>
					<h2>{title}</h2>
					<button
						data-testid={`close-modal-${title.toLowerCase().replace(/\s+/g, '-')}`}
						onClick={onClose}
					>
						Close Modal
					</button>
					{children}
				</div>
			) : null;
		},
	};
});

const mockPromptTypes: CampaignPromptTypeModel[] = [
	{
		id: 1,
		name: 'Test Prompt Type',
		icon: 'IconSparkles',
		order: 1,
		createdAt: new Date().toISOString(),
	},
	{
		id: 2,
		name: 'Another Prompt Type',
		icon: 'IconBolt',
		order: 2,
		createdAt: new Date().toISOString(),
	},
	{
		id: 3,
		name: 'Third Type',
		icon: '',
		order: 3,
		createdAt: '',
	},
];

vi.mock('~/queries/campaignPromptTypeQueries', () => ({
	useGetAllCampaignPromptTypes: () => ({
		data: mockPromptTypesData.data,
		isLoading: mockPromptTypesData.isLoading,
	}),
	useDeleteCampaignPromptType: () => ({
		mutateAsync: mockDeletePromptType,
		isPending: false,
	}),
}));

vi.mock('../CampaignPromptTypesFilters', () => ({
	default: ({
		filters,
		onFiltersChange,
	}: {
		filters: Record<string, unknown>;
		onFiltersChange: (filters: Record<string, unknown>) => void;
	}) => (
		<div data-testid='prompt-types-filters'>
			<input
				data-testid='search-input'
				value={(filters.search as string) || ''}
				onChange={(e) =>
					onFiltersChange({ ...filters, search: e.target.value })
				}
			/>
			<select
				data-testid='sort-by-select'
				value={(filters.sortBy as string) || 'order'}
				onChange={(e) =>
					onFiltersChange({ ...filters, sortBy: e.target.value })
				}
			>
				<option value='order'>Order</option>
				<option value='name'>Name</option>
				<option value='createdAt'>Created At</option>
			</select>
			<select
				data-testid='sort-order-select'
				value={(filters.sortOrder as string) || 'asc'}
				onChange={(e) =>
					onFiltersChange({ ...filters, sortOrder: e.target.value })
				}
			>
				<option value='asc'>Ascending</option>
				<option value='desc'>Descending</option>
			</select>
		</div>
	),
}));

vi.mock('../CampaignPromptTypesForm', () => ({
	default: ({
		promptType,
		onSuccess,
		onCancel,
	}: {
		promptType?: CampaignPromptTypeModel;
		onSuccess: () => void;
		onCancel: () => void;
	}) => (
		<div data-testid='prompt-types-form'>
			<span data-testid='form-mode'>{promptType ? 'edit' : 'create'}</span>
			{promptType && (
				<span data-testid='editing-prompt-type-id'>{promptType.id}</span>
			)}
			{promptType && (
				<span data-testid='editing-prompt-type-name'>{promptType.name}</span>
			)}
			<button data-testid='form-submit' onClick={onSuccess}>
				Submit
			</button>
			<button data-testid='form-cancel' onClick={onCancel}>
				Cancel
			</button>
		</div>
	),
}));

// Store column handlers for testing
let capturedColumns: Array<{
	id?: string;
	accessorKey?: string;
	cell?: (props: {
		row: { original: CampaignPromptTypeModel };
	}) => React.ReactNode;
}> = [];

vi.mock('~/components/BaseTable', () => ({
	default: ({
		data,
		columns,
		isLoading,
	}: {
		data: CampaignPromptTypeModel[];
		columns: typeof capturedColumns;
		isLoading: boolean;
	}) => {
		// Capture columns for testing
		capturedColumns = columns;
		return (
			<div data-testid='base-table'>
				<span data-testid='table-row-count'>{data.length}</span>
				<span data-testid='table-loading'>
					{isLoading ? 'loading' : 'loaded'}
				</span>
				{/* Render column cells for testing */}
				{data.map((item, rowIndex) => (
					<div key={item.id} data-testid={`table-row-${rowIndex}`}>
						{columns.map((col, colIndex) => {
							if (col.cell) {
								return (
									<div
										key={col.id || col.accessorKey || colIndex}
										data-testid={`cell-${col.id || col.accessorKey || colIndex}-${rowIndex}`}
									>
										{col.cell({ row: { original: item } })}
									</div>
								);
							}
							return null;
						})}
					</div>
				))}
			</div>
		);
	},
}));

vi.mock('~/components/EmptyState', () => ({
	default: ({
		message,
		description,
		action,
	}: {
		icon: React.ReactNode;
		message: string;
		description: string;
		action: React.ReactNode;
	}) => (
		<div data-testid='empty-state'>
			<span data-testid='empty-message'>{message}</span>
			<span data-testid='empty-description'>{description}</span>
			<div data-testid='empty-action'>{action}</div>
		</div>
	),
}));

vi.mock('~/components/PaginationControls', () => ({
	default: ({
		currentPage,
		totalPages,
		onPageChange,
		onItemsPerPageChange,
		itemsPerPage,
	}: {
		currentPage: number;
		totalPages: number;
		itemsPerPage: number;
		totalItems: number;
		onPageChange: (page: number) => void;
		onItemsPerPageChange: (value: string | null) => void;
		isLoading: boolean;
		itemLabel: string;
		searchTerm?: string;
	}) => (
		<div data-testid='pagination-controls'>
			<span data-testid='current-page'>{currentPage}</span>
			<span data-testid='total-pages'>{totalPages}</span>
			<span data-testid='items-per-page'>{itemsPerPage}</span>
			<button
				data-testid='next-page'
				onClick={() => onPageChange(currentPage + 1)}
			>
				Next
			</button>
			<button
				data-testid='change-page-size'
				onClick={() => onItemsPerPageChange('25')}
			>
				Change Page Size
			</button>
			<button
				data-testid='change-page-size-null'
				onClick={() => onItemsPerPageChange(null)}
			>
				Change Page Size Null
			</button>
		</div>
	),
}));

vi.mock('~/components/SectionCard/SectionCard', () => ({
	default: ({
		children,
		title,
		description,
		headerActions,
	}: {
		children: React.ReactNode;
		icon: React.ComponentType;
		title: string;
		description: string;
		padding: string;
		headerActions?: React.ReactNode;
	}) => (
		<div data-testid='section-card'>
			<h2>{title}</h2>
			<p>{description}</p>
			{headerActions && <div data-testid='header-actions'>{headerActions}</div>}
			{children}
		</div>
	),
}));

// Mock the modals from @mantine/modals
vi.mock('@mantine/modals', () => ({
	ModalsProvider: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	modals: {
		openConfirmModal: vi.fn(({ onConfirm }) => {
			// Immediately call onConfirm to simulate user clicking confirm
			onConfirm?.();
		}),
	},
}));

const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

const renderWithProviders = (ui: React.ReactNode) => {
	const queryClient = createTestQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<MantineProvider>
				<ModalsProvider>{ui}</ModalsProvider>
			</MantineProvider>
		</QueryClientProvider>
	);
};

describe('CampaignPromptTypesContent', () => {
	const defaultProps = {
		createModalOpened: false,
		setCreateModalOpened: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockDeletePromptType.mockReset();
		mockNotificationsShow.mockReset();
		// Reset to default mock data with prompt types
		mockPromptTypesData.data = mockPromptTypes;
		mockPromptTypesData.isLoading = false;
	});

	describe('Rendering with data', () => {
		it('renders the section card with correct title and description', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			expect(screen.getByText('Prompt Types')).toBeInTheDocument();
			expect(
				screen.getByText(
					'Label and organize the prompt templates used by campaigns.'
				)
			).toBeInTheDocument();
		});

		it('renders the filters component', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			expect(screen.getByTestId('prompt-types-filters')).toBeInTheDocument();
		});

		it('renders the table with data', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			expect(screen.getByTestId('base-table')).toBeInTheDocument();
			expect(screen.getByTestId('table-row-count')).toHaveTextContent('3');
		});

		it('renders pagination controls', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
		});

		it('renders header actions with add button', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			expect(screen.getByTestId('header-actions')).toBeInTheDocument();
		});
	});

	describe('Create modal functionality', () => {
		it('shows create modal when createModalOpened is true', () => {
			renderWithProviders(
				<CampaignPromptTypesContent
					{...defaultProps}
					createModalOpened={true}
				/>
			);

			expect(
				screen.getByText('Create Campaign Prompt Type')
			).toBeInTheDocument();
			expect(screen.getByTestId('prompt-types-form')).toBeInTheDocument();
			expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
		});

		it('calls setCreateModalOpened with false when modal is closed', async () => {
			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<CampaignPromptTypesContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			const cancelButton = screen.getByTestId('form-cancel');
			fireEvent.click(cancelButton);

			expect(setCreateModalOpened).toHaveBeenCalledWith(false);
		});

		it('calls setCreateModalOpened with true when add button is clicked', () => {
			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<CampaignPromptTypesContent
					createModalOpened={false}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			const headerActions = screen.getByTestId('header-actions');
			const addButton = headerActions.querySelector('button');
			if (addButton) {
				fireEvent.click(addButton);
				expect(setCreateModalOpened).toHaveBeenCalledWith(true);
			}
		});

		it('closes create modal when modal close button is clicked', () => {
			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<CampaignPromptTypesContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			const closeButton = screen.getByTestId(
				'close-modal-create-campaign-prompt-type'
			);
			fireEvent.click(closeButton);

			expect(setCreateModalOpened).toHaveBeenCalledWith(false);
		});

		it('closes create modal when form submit is clicked', () => {
			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<CampaignPromptTypesContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			const submitButton = screen.getByTestId('form-submit');
			fireEvent.click(submitButton);

			expect(setCreateModalOpened).toHaveBeenCalledWith(false);
		});
	});

	describe('Edit modal functionality', () => {
		it('opens edit modal when edit button is clicked', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const actionsCell = screen.getByTestId('cell-actions-0');
			const editBtn = actionsCell.querySelector('button');
			if (editBtn) {
				fireEvent.click(editBtn);
				await waitFor(() => {
					expect(
						screen.getByText('Edit Campaign Prompt Type')
					).toBeInTheDocument();
				});
			}
		});

		it('shows edit form with selected prompt type data', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const actionsCell = screen.getByTestId('cell-actions-0');
			const buttons = actionsCell.querySelectorAll('button');
			const editBtn = buttons[0]; // First button is edit
			if (editBtn) {
				fireEvent.click(editBtn);
				await waitFor(() => {
					expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
					expect(
						screen.getByTestId('editing-prompt-type-id')
					).toHaveTextContent('1');
					expect(
						screen.getByTestId('editing-prompt-type-name')
					).toHaveTextContent('Test Prompt Type');
				});
			}
		});

		it('closes edit modal when form is submitted', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			// Open edit modal
			const actionsCell = screen.getByTestId('cell-actions-0');
			const editBtn = actionsCell.querySelectorAll('button')[0];
			fireEvent.click(editBtn);

			await waitFor(() => {
				expect(
					screen.getByText('Edit Campaign Prompt Type')
				).toBeInTheDocument();
			});

			// Submit the form
			const submitBtn = screen.getByTestId('form-submit');
			fireEvent.click(submitBtn);

			await waitFor(() => {
				expect(
					screen.queryByText('Edit Campaign Prompt Type')
				).not.toBeInTheDocument();
			});
		});

		it('closes edit modal when cancel is clicked', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			// Open edit modal
			const actionsCell = screen.getByTestId('cell-actions-0');
			const editBtn = actionsCell.querySelectorAll('button')[0];
			fireEvent.click(editBtn);

			await waitFor(() => {
				expect(
					screen.getByText('Edit Campaign Prompt Type')
				).toBeInTheDocument();
			});

			// Cancel the form
			const cancelBtn = screen.getByTestId('form-cancel');
			fireEvent.click(cancelBtn);

			await waitFor(() => {
				expect(
					screen.queryByText('Edit Campaign Prompt Type')
				).not.toBeInTheDocument();
			});
		});

		it('closes edit modal when modal close button is clicked', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			// Open edit modal
			const actionsCell = screen.getByTestId('cell-actions-0');
			const editBtn = actionsCell.querySelectorAll('button')[0];
			fireEvent.click(editBtn);

			await waitFor(() => {
				expect(
					screen.getByText('Edit Campaign Prompt Type')
				).toBeInTheDocument();
			});

			// Click the modal close button
			const closeButton = screen.getByTestId(
				'close-modal-edit-campaign-prompt-type'
			);
			fireEvent.click(closeButton);

			await waitFor(() => {
				expect(
					screen.queryByText('Edit Campaign Prompt Type')
				).not.toBeInTheDocument();
			});
		});
	});

	describe('Delete functionality', () => {
		it('calls delete handler when delete button is clicked', async () => {
			mockDeletePromptType.mockResolvedValueOnce({});
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const actionsCell = screen.getByTestId('cell-actions-0');
			const buttons = actionsCell.querySelectorAll('button');
			const deleteBtn = buttons[1]; // Second button is delete
			if (deleteBtn) {
				fireEvent.click(deleteBtn);
				await waitFor(() => {
					expect(mockDeletePromptType).toHaveBeenCalledWith(1);
				});
			}
		});

		it('shows success notification when delete succeeds', async () => {
			mockDeletePromptType.mockResolvedValueOnce({});
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const actionsCell = screen.getByTestId('cell-actions-0');
			const deleteBtn = actionsCell.querySelectorAll('button')[1];
			fireEvent.click(deleteBtn);

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith({
					title: 'Success',
					message: 'Campaign prompt type deleted successfully',
					color: 'green',
				});
			});
		});

		it('shows error notification when delete fails', async () => {
			mockDeletePromptType.mockRejectedValueOnce(new Error('Delete failed'));
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const actionsCell = screen.getByTestId('cell-actions-0');
			const deleteBtn = actionsCell.querySelectorAll('button')[1];
			fireEvent.click(deleteBtn);

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith({
					title: 'Error',
					message: 'Failed to delete campaign prompt type',
					color: 'red',
				});
			});
		});

		it('deletes correct prompt type from second row', async () => {
			mockDeletePromptType.mockResolvedValueOnce({});
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const actionsCell = screen.getByTestId('cell-actions-1');
			const deleteBtn = actionsCell.querySelectorAll('button')[1];
			fireEvent.click(deleteBtn);

			await waitFor(() => {
				expect(mockDeletePromptType).toHaveBeenCalledWith(2);
			});
		});
	});

	describe('Filtering', () => {
		it('filters data when search is applied', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'Test' } });

			await waitFor(() => {
				expect(searchInput).toHaveValue('Test');
			});
		});

		it('filters by icon name', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'IconBolt' } });

			await waitFor(() => {
				expect(searchInput).toHaveValue('IconBolt');
				// Only the prompt type with IconBolt icon should be shown
				expect(screen.getByTestId('table-row-count')).toHaveTextContent('1');
			});
		});

		it('sorts by name when sortBy is changed', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const sortBySelect = screen.getByTestId('sort-by-select');
			fireEvent.change(sortBySelect, { target: { value: 'name' } });

			await waitFor(() => {
				expect(sortBySelect).toHaveValue('name');
			});
		});

		it('sorts by createdAt when sortBy is changed', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const sortBySelect = screen.getByTestId('sort-by-select');
			fireEvent.change(sortBySelect, { target: { value: 'createdAt' } });

			await waitFor(() => {
				expect(sortBySelect).toHaveValue('createdAt');
			});
		});

		it('sorts in descending order when sortOrder is changed', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const sortOrderSelect = screen.getByTestId('sort-order-select');
			fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

			await waitFor(() => {
				expect(sortOrderSelect).toHaveValue('desc');
			});
		});

		it('shows no results empty state when filter returns no matches', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'NonExistentType' } });

			await waitFor(() => {
				expect(screen.getByTestId('empty-state')).toBeInTheDocument();
				expect(screen.getByTestId('empty-message')).toHaveTextContent(
					'No prompt types match your filters'
				);
			});
		});

		it('shows filtered empty state description', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'NonExistentType' } });

			await waitFor(() => {
				expect(screen.getByTestId('empty-description')).toHaveTextContent(
					'Try adjusting your search or sorting options.'
				);
			});
		});

		it('opens create modal when clicking create button in filtered empty state', async () => {
			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<CampaignPromptTypesContent
					createModalOpened={false}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'NonExistentType' } });

			await waitFor(() => {
				expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			});

			const actionContainer = screen.getByTestId('empty-action');
			const createButton = actionContainer.querySelector('button');
			if (createButton) {
				fireEvent.click(createButton);
				expect(setCreateModalOpened).toHaveBeenCalledWith(true);
			}
		});

		it('resets pagination when filters change', async () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			// First, change page
			const nextPageBtn = screen.getByTestId('next-page');
			fireEvent.click(nextPageBtn);

			// Then apply filter
			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'Test' } });

			await waitFor(() => {
				expect(screen.getByTestId('current-page')).toHaveTextContent('1');
			});
		});
	});

	describe('Pagination functionality', () => {
		it('calls onPageChange when next page is clicked', () => {
			// Add more items to have multiple pages
			mockPromptTypesData.data = Array.from({ length: 15 }, (_, i) => ({
				id: i + 1,
				name: `Prompt Type ${i + 1}`,
				icon: 'IconTest',
				order: i + 1,
				createdAt: new Date().toISOString(),
			}));

			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const nextBtn = screen.getByTestId('next-page');
			fireEvent.click(nextBtn);

			expect(screen.getByTestId('current-page')).toHaveTextContent('2');
		});

		it('calls onItemsPerPageChange when page size is changed', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const changePageSizeBtn = screen.getByTestId('change-page-size');
			fireEvent.click(changePageSizeBtn);

			expect(screen.getByTestId('items-per-page')).toHaveTextContent('25');
		});

		it('keeps current page size when value is null', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const initialPageSize = screen.getByTestId('items-per-page').textContent;
			const changePageSizeNullBtn = screen.getByTestId('change-page-size-null');
			fireEvent.click(changePageSizeNullBtn);

			expect(screen.getByTestId('items-per-page')).toHaveTextContent(
				initialPageSize || '10'
			);
		});

		it('resets to page 1 when page size changes', () => {
			// Add more items to have multiple pages
			mockPromptTypesData.data = Array.from({ length: 15 }, (_, i) => ({
				id: i + 1,
				name: `Prompt Type ${i + 1}`,
				icon: 'IconTest',
				order: i + 1,
				createdAt: new Date().toISOString(),
			}));

			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			// First go to page 2
			const nextBtn = screen.getByTestId('next-page');
			fireEvent.click(nextBtn);

			// Then change page size
			const changePageSizeBtn = screen.getByTestId('change-page-size');
			fireEvent.click(changePageSizeBtn);

			expect(screen.getByTestId('current-page')).toHaveTextContent('1');
		});
	});

	describe('Column rendering', () => {
		it('renders order column with correct value', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const orderCell = screen.getByTestId('cell-order-0');
			expect(orderCell).toHaveTextContent('1');
		});

		it('renders name column with correct value', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const nameCell = screen.getByTestId('cell-name-0');
			expect(nameCell).toHaveTextContent('Test Prompt Type');
		});

		it('renders icon column with badge', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const iconCell = screen.getByTestId('cell-icon-0');
			expect(iconCell).toHaveTextContent('IconSparkles');
		});

		it('renders "Not set" when icon is empty', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const iconCell = screen.getByTestId('cell-icon-2');
			expect(iconCell).toHaveTextContent('Not set');
		});

		it('renders createdAt column with formatted date', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const createdAtCell = screen.getByTestId('cell-createdAt-0');
			// Check that it contains some date-like content
			expect(createdAtCell.textContent).toBeTruthy();
		});

		it('renders "Not available" when createdAt is undefined', () => {
			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const createdAtCell = screen.getByTestId('cell-createdAt-2');
			expect(createdAtCell).toHaveTextContent('Not available');
		});

		it('renders "--" when order is undefined', () => {
			mockPromptTypesData.data = [
				{
					id: 4,
					name: 'No Order Type',
					icon: 'IconTest',
					order: undefined as unknown as number,
					createdAt: new Date().toISOString(),
				},
			];

			renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

			const orderCell = screen.getByTestId('cell-order-0');
			expect(orderCell).toHaveTextContent('--');
		});
	});
});

describe('CampaignPromptTypesContent - Empty State', () => {
	const renderWithProviders = (ui: React.ReactNode) => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		return render(
			<QueryClientProvider client={queryClient}>
				<MantineProvider>
					<ModalsProvider>{ui}</ModalsProvider>
				</MantineProvider>
			</QueryClientProvider>
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockDeletePromptType.mockReset();
		// Set empty prompt types for empty state tests
		mockPromptTypesData.data = [];
		mockPromptTypesData.isLoading = false;
	});

	afterEach(() => {
		// Restore prompt types for other tests
		mockPromptTypesData.data = mockPromptTypes;
	});

	it('renders empty state when no prompt types exist', () => {
		renderWithProviders(
			<CampaignPromptTypesContent
				createModalOpened={false}
				setCreateModalOpened={vi.fn()}
			/>
		);

		expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		expect(screen.getByTestId('empty-message')).toHaveTextContent(
			'No prompt types found'
		);
		expect(screen.getByTestId('empty-description')).toHaveTextContent(
			'Define your first campaign prompt type to start organizing prompts.'
		);
	});

	it('renders create button in empty state', () => {
		renderWithProviders(
			<CampaignPromptTypesContent
				createModalOpened={false}
				setCreateModalOpened={vi.fn()}
			/>
		);

		const actionContainer = screen.getByTestId('empty-action');
		expect(actionContainer.querySelector('button')).toBeInTheDocument();
	});

	it('opens create modal when create button is clicked in empty state', () => {
		const setCreateModalOpened = vi.fn();
		renderWithProviders(
			<CampaignPromptTypesContent
				createModalOpened={false}
				setCreateModalOpened={setCreateModalOpened}
			/>
		);

		const actionContainer = screen.getByTestId('empty-action');
		const createButton = actionContainer.querySelector('button');
		if (createButton) {
			fireEvent.click(createButton);
			expect(setCreateModalOpened).toHaveBeenCalledWith(true);
		}
	});

	it('shows create modal in empty state when createModalOpened is true', () => {
		renderWithProviders(
			<CampaignPromptTypesContent
				createModalOpened={true}
				setCreateModalOpened={vi.fn()}
			/>
		);

		expect(screen.getByText('Create Campaign Prompt Type')).toBeInTheDocument();
		expect(screen.getByTestId('prompt-types-form')).toBeInTheDocument();
	});

	it('closes create modal in empty state when form is submitted', async () => {
		const setCreateModalOpened = vi.fn();
		renderWithProviders(
			<CampaignPromptTypesContent
				createModalOpened={true}
				setCreateModalOpened={setCreateModalOpened}
			/>
		);

		const submitBtn = screen.getByTestId('form-submit');
		fireEvent.click(submitBtn);

		expect(setCreateModalOpened).toHaveBeenCalledWith(false);
	});

	it('closes create modal in empty state when form is cancelled', async () => {
		const setCreateModalOpened = vi.fn();
		renderWithProviders(
			<CampaignPromptTypesContent
				createModalOpened={true}
				setCreateModalOpened={setCreateModalOpened}
			/>
		);

		const cancelBtn = screen.getByTestId('form-cancel');
		fireEvent.click(cancelBtn);

		expect(setCreateModalOpened).toHaveBeenCalledWith(false);
	});

	it('closes create modal in empty state when modal close button is clicked', async () => {
		const setCreateModalOpened = vi.fn();
		renderWithProviders(
			<CampaignPromptTypesContent
				createModalOpened={true}
				setCreateModalOpened={setCreateModalOpened}
			/>
		);

		const closeButton = screen.getByTestId(
			'close-modal-create-campaign-prompt-type'
		);
		fireEvent.click(closeButton);

		expect(setCreateModalOpened).toHaveBeenCalledWith(false);
	});
});

// Test the useCampaignPromptTypesColumns hook integration
describe('useCampaignPromptTypesColumns hook integration', () => {
	const defaultProps = {
		createModalOpened: false,
		setCreateModalOpened: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockDeletePromptType.mockReset();
		// Restore prompt types for these tests
		mockPromptTypesData.data = mockPromptTypes;
		mockPromptTypesData.isLoading = false;
	});

	const renderWithProviders = (ui: React.ReactNode) => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});
		return render(
			<QueryClientProvider client={queryClient}>
				<MantineProvider>
					<ModalsProvider>{ui}</ModalsProvider>
				</MantineProvider>
			</QueryClientProvider>
		);
	};

	it('renders all column headers correctly', () => {
		renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

		// Verify columns are captured and contain expected structure
		expect(capturedColumns.length).toBe(5);
		expect(capturedColumns[0].accessorKey).toBe('order');
		expect(capturedColumns[1].accessorKey).toBe('name');
		expect(capturedColumns[2].accessorKey).toBe('icon');
		expect(capturedColumns[3].accessorKey).toBe('createdAt');
		expect(capturedColumns[4].id).toBe('actions');
	});

	it('renders prompt type name with proper formatting', () => {
		renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

		const nameCell = screen.getByTestId('cell-name-0');
		expect(nameCell.textContent).toBe('Test Prompt Type');
	});

	it('renders icon as badge', () => {
		renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

		const iconCell = screen.getByTestId('cell-icon-0');
		expect(iconCell.textContent).toBe('IconSparkles');
	});

	it('renders edit and delete action buttons', () => {
		renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

		const actionsCell = screen.getByTestId('cell-actions-0');
		const buttons = actionsCell.querySelectorAll('button');
		expect(buttons.length).toBe(2);
	});

	it('edit button triggers onEdit callback with correct prompt type', async () => {
		renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

		const actionsCell = screen.getByTestId('cell-actions-0');
		const editBtn = actionsCell.querySelectorAll('button')[0];
		fireEvent.click(editBtn);

		await waitFor(() => {
			expect(screen.getByTestId('editing-prompt-type-id')).toHaveTextContent(
				'1'
			);
		});
	});

	it('delete button triggers onDelete callback with correct id', async () => {
		mockDeletePromptType.mockResolvedValueOnce({});
		renderWithProviders(<CampaignPromptTypesContent {...defaultProps} />);

		const actionsCell = screen.getByTestId('cell-actions-0');
		const deleteBtn = actionsCell.querySelectorAll('button')[1];
		fireEvent.click(deleteBtn);

		await waitFor(() => {
			expect(mockDeletePromptType).toHaveBeenCalledWith(1);
		});
	});
});

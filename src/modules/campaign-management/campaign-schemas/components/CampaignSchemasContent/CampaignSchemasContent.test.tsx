import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from '@mantine/notifications';
import CampaignSchemasContent from './CampaignSchemasContent';
import renderWithProviders from '~/test-utils/renderWithProviders';

// Mock Mantine Modal to expose onClose
vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Modal: ({
			opened,
			onClose,
			title,
			children,
		}: {
			opened: boolean;
			onClose: () => void;
			title: string;
			children: React.ReactNode;
			size?: string;
		}) =>
			opened ? (
				<div data-testid='mock-modal'>
					<h3>{title}</h3>
					<button data-testid='close-modal' onClick={onClose}>
						Close
					</button>
					{children}
				</div>
			) : null,
	};
});

// Mock dependencies
const mockUseDeleteMutateAsync = vi.fn();
let mockDeleteIsPending = false;

const mockCanPerformAction = vi.fn(() => true);
const mockCanAccessModule = vi.fn(() => true);

vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
		canAccessModule: mockCanAccessModule,
	}),
}));

const mockUseFilteredSchemasModule = vi.hoisted(() => {
	const baseValue = {
		schemas: [
			{
				id: 1,
				name: 'Test Schema',
				code: 'test-schema',
				description: 'Test description',
				objectiveId: 1,
				objective: { id: 1, name: 'Test Objective' },
				isActive: true,
				schemaFields: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		],
		pagination: { page: 1, pageSize: 10, total: 1 },
		filters: {
			search: '',
			objectiveId: null,
			sortBy: 'name',
			sortOrder: 'asc',
		},
		setPagination: vi.fn(),
		setFilters: vi.fn(),
		isLoading: false,
	};

	let value = baseValue;

	return {
		useCampaignSchemasWithFilters: () => value,
		__setMockValue: (v: any) => {
			value = v;
		},
		__reset: () => {
			value = baseValue;
		},
	};
});

vi.mock('~/queries/campaignContactSchemasQueries', () => ({
	useDeleteCampaignContactSchema: () => ({
		mutateAsync: mockUseDeleteMutateAsync,
		isPending: mockDeleteIsPending,
	}),
	useGetCampaignContactSchemas: vi.fn(() => ({
		data: { data: [], total: 0 },
		isLoading: false,
	})),
}));

const setMockSchemasValue = (value: any) =>
	mockUseFilteredSchemasModule.__setMockValue(value);
const resetMockSchemasValue = () => mockUseFilteredSchemasModule.__reset();

vi.mock('~/modules/campaigns/hooks/useFilteredSchemas', () => ({
	__esModule: true,
	...mockUseFilteredSchemasModule,
}));

vi.mock('../CampaignSchemasFilters', () => ({
	default: ({
		filters,
		onFiltersChange,
	}: {
		filters: Record<string, unknown>;
		onFiltersChange: (filters: Record<string, unknown>) => void;
	}) => (
		<div data-testid='schemas-filters'>
			<input
				data-testid='search-input'
				value={(filters.search as string) || ''}
				onChange={(e) =>
					onFiltersChange({ ...filters, search: e.target.value })
				}
			/>
		</div>
	),
}));

vi.mock('../CampaignSchemasForm', () => ({
	default: ({
		schema,
		onSuccess,
		onCancel,
	}: {
		schema?: Record<string, unknown>;
		onSuccess: () => void;
		onCancel: () => void;
	}) => (
		<div data-testid='schemas-form'>
			<span data-testid='form-mode'>{schema ? 'edit' : 'create'}</span>
			<button data-testid='form-submit' onClick={onSuccess}>
				Submit
			</button>
			<button data-testid='form-cancel' onClick={onCancel}>
				Cancel
			</button>
		</div>
	),
}));

vi.mock('~/components/BaseTable', () => ({
	default: ({
		data,
		columns,
		isLoading,
	}: {
		data: any[];
		columns: any[];
		isLoading: boolean;
	}) => (
		<div data-testid='base-table'>
			<span data-testid='table-row-count'>{data.length}</span>
			<span data-testid='table-loading'>
				{isLoading ? 'loading' : 'loaded'}
			</span>
			{data.map((row, idx) => (
				<div key={`row-${idx}`} data-testid={`table-row-${idx}`}>
					{columns?.map((col) => (
						<div key={col.id || col.accessorKey} data-testid='table-cell'>
							{col?.cell?.({ row: { original: row } })}
						</div>
					))}
				</div>
			))}
		</div>
	),
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
	}: {
		currentPage: number;
		totalPages: number;
		itemsPerPage: number;
		totalItems: number;
		onPageChange: (page: number) => void;
		onItemsPerPageChange: (value: string | null) => void;
		isLoading: boolean;
		itemLabel: string;
	}) => (
		<div data-testid='pagination-controls'>
			<span data-testid='current-page'>{currentPage}</span>
			<span data-testid='total-pages'>{totalPages}</span>
			<button
				data-testid='next-page'
				onClick={() => onPageChange(currentPage + 1)}
			>
				Next
			</button>
			<button
				data-testid='change-page-size'
				onClick={() => onItemsPerPageChange('20')}
			>
				Change Size
			</button>
			<button
				data-testid='change-page-size-null'
				onClick={() => onItemsPerPageChange(null)}
			>
				Change Size Null
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

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

// Mock the columns hook to expose testable action buttons
vi.mock('./useCampaignSchemasColumns', () => ({
	useCampaignSchemasColumns: ({ onEdit, onDelete }: any) => [
		{
			id: 'actions',
			header: 'Actions',
			cell: () => (
				<div>
					<button
						data-testid='test-edit-btn'
						onClick={() => onEdit({ id: 1, name: 'Test Schema' })}
					>
						Edit
					</button>
					<button data-testid='test-delete-btn' onClick={() => onDelete(1)}>
						Delete
					</button>
				</div>
			),
		},
	],
}));

describe('CampaignSchemasContent', () => {
	const defaultProps = {
		createModalOpened: false,
		setCreateModalOpened: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		resetMockSchemasValue();
	});

	describe('Rendering with data', () => {
		it('renders the section card with correct title and description', () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			expect(screen.getByText('Campaign Schemas')).toBeInTheDocument();
			expect(
				screen.getByText('Campaign Schemas where the objectives belong to')
			).toBeInTheDocument();
		});

		it('renders the filters component', () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			expect(screen.getByTestId('schemas-filters')).toBeInTheDocument();
		});

		it('renders the table with data', () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			expect(screen.getByTestId('base-table')).toBeInTheDocument();
			expect(screen.getByTestId('table-row-count')).toHaveTextContent('1');
		});

		it('renders pagination controls', () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
		});

		it('shows loading state in table when data is loading', () => {
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: vi.fn(),
				isLoading: true,
			});

			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			expect(screen.getByTestId('table-loading')).toHaveTextContent('loading');
		});

		it('renders header actions with add button', () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			expect(screen.getByTestId('header-actions')).toBeInTheDocument();
		});

		it('opens create modal with existing data and closes via handlers', async () => {
			renderWithProviders(
				<CampaignSchemasContent
					{...defaultProps}
					createModalOpened={true}
					setCreateModalOpened={defaultProps.setCreateModalOpened}
				/>
			);

			expect(
				screen.getByRole('heading', { name: 'Create Schema' })
			).toBeInTheDocument();
			expect(screen.getByTestId('schemas-form')).toBeInTheDocument();

			fireEvent.click(screen.getByTestId('form-submit'));
			expect(defaultProps.setCreateModalOpened).toHaveBeenCalledWith(false);

			fireEvent.click(screen.getByTestId('form-cancel'));
			expect(defaultProps.setCreateModalOpened).toHaveBeenCalledWith(false);

			fireEvent.click(screen.getByTestId('close-modal'));
			expect(defaultProps.setCreateModalOpened).toHaveBeenCalledWith(false);
		});

		it('updates filters when search input changes', () => {
			const setFiltersMock = vi.fn();
			setMockSchemasValue({
				schemas: [
					{
						id: 1,
						name: 'Test Schema',
						code: 'test-schema',
						description: 'Test description',
						objectiveId: 1,
						objective: { id: 1, name: 'Test Objective' },
						isActive: true,
						schemaFields: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				],
				pagination: { page: 1, pageSize: 10, total: 1 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: setFiltersMock,
				isLoading: false,
			});

			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'welcome' } });

			expect(setFiltersMock).toHaveBeenCalledWith(
				expect.objectContaining({ search: 'welcome' })
			);
		});

		it('handles pagination changes when next is clicked', () => {
			const setPaginationMock = vi.fn();
			setMockSchemasValue({
				schemas: [
					{
						id: 1,
						name: 'Test Schema',
						code: 'test-schema',
						description: 'Test description',
						objectiveId: 1,
						objective: { id: 1, name: 'Test Objective' },
						isActive: true,
						schemaFields: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				],
				pagination: { page: 1, pageSize: 10, total: 30 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: setPaginationMock,
				setFilters: vi.fn(),
				isLoading: false,
			});

			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			fireEvent.click(screen.getByTestId('next-page'));

			expect(setPaginationMock).toHaveBeenCalledWith(
				expect.objectContaining({ page: 2 })
			);
		});

		it('handles items per page change', () => {
			const setPaginationMock = vi.fn();
			setMockSchemasValue({
				schemas: Array.from({ length: 50 }, (_, i) => ({
					id: i + 1,
					name: `Test Schema ${i + 1}`,
					code: `test-schema-${i + 1}`,
					description: 'Test description',
					objectiveId: 1,
					objective: { id: 1, name: 'Test Objective' },
					isActive: true,
					schemaFields: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})),
				pagination: { page: 1, pageSize: 10, total: 50 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: setPaginationMock,
				setFilters: vi.fn(),
				isLoading: false,
			});

			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();

			fireEvent.click(screen.getByTestId('change-page-size'));

			expect(setPaginationMock).toHaveBeenCalledWith(
				expect.objectContaining({ page: 1, pageSize: 20 })
			);
		});

		it('handles items per page change with null value', () => {
			const setPaginationMock = vi.fn();
			setMockSchemasValue({
				schemas: Array.from({ length: 50 }, (_, i) => ({
					id: i + 1,
					name: `Test Schema ${i + 1}`,
					code: `test-schema-${i + 1}`,
					description: 'Test description',
					objectiveId: 1,
					objective: { id: 1, name: 'Test Objective' },
					isActive: true,
					schemaFields: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})),
				pagination: { page: 1, pageSize: 10, total: 50 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: setPaginationMock,
				setFilters: vi.fn(),
				isLoading: false,
			});

			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			fireEvent.click(screen.getByTestId('change-page-size-null'));

			expect(setPaginationMock).not.toHaveBeenCalled();
		});

		it('shows loading table instead of empty state when loading with no schemas', () => {
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: vi.fn(),
				isLoading: true,
			});

			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
			expect(screen.getByTestId('table-loading')).toHaveTextContent('loading');
		});
	});

	describe('Create modal functionality', () => {
		it('shows create modal when createModalOpened is true', () => {
			renderWithProviders(
				<CampaignSchemasContent {...defaultProps} createModalOpened={true} />
			);

			expect(
				screen.getByRole('heading', { name: 'Create Schema' })
			).toBeInTheDocument();
			expect(screen.getByTestId('schemas-form')).toBeInTheDocument();
			expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
		});

		it('calls setCreateModalOpened with false when create form is submitted', async () => {
			renderWithProviders(
				<CampaignSchemasContent {...defaultProps} createModalOpened={true} />
			);

			const submitButton = screen.getByTestId('form-submit');
			fireEvent.click(submitButton);

			expect(defaultProps.setCreateModalOpened).toHaveBeenCalledWith(false);
		});

		it('calls setCreateModalOpened with false when create modal is closed via onClose', () => {
			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<CampaignSchemasContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			expect(
				screen.getByRole('heading', { name: 'Create Schema' })
			).toBeInTheDocument();

			// Click the modal close button to trigger onClose
			const closeButton = screen.getByTestId('close-modal');
			fireEvent.click(closeButton);

			expect(setCreateModalOpened).toHaveBeenCalledWith(false);
		});

		it('calls setCreateModalOpened with false when create form is canceled', () => {
			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<CampaignSchemasContent
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
				<CampaignSchemasContent
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
	});

	describe('Actions: edit and delete', () => {
		it('opens edit modal when edit button is clicked', async () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			const editBtns = screen.getAllByTestId('test-edit-btn');
			fireEvent.click(editBtns[0]);
			await waitFor(() =>
				expect(screen.getByText('Edit Campaign Schema')).toBeInTheDocument()
			);
			expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
		});

		it('calls edit modal onSuccess when form is submitted', async () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			const editBtns = screen.getAllByTestId('test-edit-btn');
			fireEvent.click(editBtns[0]);
			await waitFor(() =>
				expect(screen.getByText('Edit Campaign Schema')).toBeInTheDocument()
			);

			const submitButton = screen.getByTestId('form-submit');
			fireEvent.click(submitButton);

			await waitFor(() =>
				expect(
					screen.queryByText('Edit Campaign Schema')
				).not.toBeInTheDocument()
			);
		});

		it('calls edit modal onCancel when form is canceled', async () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			const editBtns = screen.getAllByTestId('test-edit-btn');
			fireEvent.click(editBtns[0]);
			await waitFor(() =>
				expect(screen.getByText('Edit Campaign Schema')).toBeInTheDocument()
			);

			const cancelButton = screen.getByTestId('form-cancel');
			fireEvent.click(cancelButton);

			await waitFor(() =>
				expect(
					screen.queryByText('Edit Campaign Schema')
				).not.toBeInTheDocument()
			);
		});

		it('calls delete mutation and shows success notification on success', async () => {
			mockUseDeleteMutateAsync.mockResolvedValueOnce(undefined);
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			const deleteBtns = screen.getAllByTestId('test-delete-btn');
			fireEvent.click(deleteBtns[0]);

			// ensure the delete mutation is called with the correct id
			expect(mockUseDeleteMutateAsync).toHaveBeenCalledWith(1);

			await waitFor(() =>
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Success',
						message: 'Campaign schema deleted successfully',
					})
				)
			);
		});

		it('shows error notification when delete mutation fails', async () => {
			mockUseDeleteMutateAsync.mockRejectedValueOnce(new Error('boom'));
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			const deleteBtns = screen.getAllByTestId('test-delete-btn');
			fireEvent.click(deleteBtns[0]);

			await waitFor(() =>
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Error',
						message: 'Failed to delete campaign schema',
					})
				)
			);
		});

		it('closes edit modal when modal onClose is triggered via close button', async () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			const editBtns = screen.getAllByTestId('test-edit-btn');
			fireEvent.click(editBtns[0]);
			await waitFor(() =>
				expect(screen.getByText('Edit Campaign Schema')).toBeInTheDocument()
			);

			// Click the modal close button to trigger onClose
			const closeButtons = screen.getAllByTestId('close-modal');
			// Find the close button for the edit modal (should be the last one if create modal is closed)
			fireEvent.click(closeButtons[closeButtons.length - 1]);

			await waitFor(() =>
				expect(
					screen.queryByText('Edit Campaign Schema')
				).not.toBeInTheDocument()
			);
		});

		it('resets selectedSchema when edit modal is closed via onClose and reopened', async () => {
			renderWithProviders(<CampaignSchemasContent {...defaultProps} />);

			// Open edit modal
			const editBtns = screen.getAllByTestId('test-edit-btn');
			fireEvent.click(editBtns[0]);
			await waitFor(() =>
				expect(screen.getByText('Edit Campaign Schema')).toBeInTheDocument()
			);

			// Close modal via close button (triggers onClose)
			const closeButtons = screen.getAllByTestId('close-modal');
			fireEvent.click(closeButtons[closeButtons.length - 1]);

			await waitFor(() =>
				expect(
					screen.queryByText('Edit Campaign Schema')
				).not.toBeInTheDocument()
			);

			// Reopen modal - this ensures the state was properly reset
			fireEvent.click(editBtns[0]);
			await waitFor(() =>
				expect(screen.getByText('Edit Campaign Schema')).toBeInTheDocument()
			);
		});
	});

	describe('CampaignSchemasContent - Empty State', () => {
		beforeEach(() => {
			vi.clearAllMocks();
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: vi.fn(),
				isLoading: false,
			});
		});

		it('renders without crashing when props are provided', () => {
			const defaultProps = {
				createModalOpened: false,
				setCreateModalOpened: vi.fn(),
			};

			const { container } = renderWithProviders(
				<CampaignSchemasContent {...defaultProps} />
			);

			expect(container).toBeInTheDocument();
		});

		it('renders the no-results state when filters are applied but no schemas', () => {
			// re-set mock to simulate filtered, no-results case
			const setFiltersMock = vi.fn();
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: 'term',
					objectiveId: 1,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: setFiltersMock,
				isLoading: false,
			});

			renderWithProviders(
				<CampaignSchemasContent
					createModalOpened={false}
					setCreateModalOpened={vi.fn()}
				/>
			);

			expect(
				screen.getByText('No schemas match your filters')
			).toBeInTheDocument();

			const clearBtn = screen.getByText('Clear Filters');
			fireEvent.click(clearBtn);

			expect(setFiltersMock).toHaveBeenCalledWith(
				expect.objectContaining({ search: '', objectiveId: null })
			);
		});

		it('shows empty state when no schemas exist and opens creation flow', async () => {
			const setCreateModalOpened = vi.fn();
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: vi.fn(),
				isLoading: false,
			});

			renderWithProviders(
				<CampaignSchemasContent
					createModalOpened={false}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			fireEvent.click(screen.getByText('Create Schema'));
			expect(setCreateModalOpened).toHaveBeenCalledWith(true);
		});

		it('shows create modal in empty state when createModalOpened is true', () => {
			const setCreateModalOpened = vi.fn();
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: vi.fn(),
				isLoading: false,
			});

			renderWithProviders(
				<CampaignSchemasContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			expect(
				screen.getByRole('heading', { name: 'Create Schema' })
			).toBeInTheDocument();
			expect(screen.getByTestId('schemas-form')).toBeInTheDocument();
		});

		it('calls setCreateModalOpened with false when form is submitted in empty state', () => {
			const setCreateModalOpened = vi.fn();
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: vi.fn(),
				isLoading: false,
			});

			renderWithProviders(
				<CampaignSchemasContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			const submitButton = screen.getByTestId('form-submit');
			fireEvent.click(submitButton);

			expect(setCreateModalOpened).toHaveBeenCalledWith(false);
		});

		it('calls setCreateModalOpened with false when form is canceled in empty state', () => {
			const setCreateModalOpened = vi.fn();
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: vi.fn(),
				isLoading: false,
			});

			renderWithProviders(
				<CampaignSchemasContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			const cancelButton = screen.getByTestId('form-cancel');
			fireEvent.click(cancelButton);

			expect(setCreateModalOpened).toHaveBeenCalledWith(false);
		});

		it('closes create modal in empty state via close button', async () => {
			const setCreateModalOpened = vi.fn();
			setMockSchemasValue({
				schemas: [],
				pagination: { page: 1, pageSize: 10, total: 0 },
				filters: {
					search: '',
					objectiveId: null,
					sortBy: 'name',
					sortOrder: 'asc',
				},
				setPagination: vi.fn(),
				setFilters: vi.fn(),
				isLoading: false,
			});

			renderWithProviders(
				<CampaignSchemasContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			expect(
				screen.getByRole('heading', { name: 'Create Schema' })
			).toBeInTheDocument();

			// Click the modal close button to trigger onClose
			const closeButton = screen.getByTestId('close-modal');
			fireEvent.click(closeButton);

			expect(setCreateModalOpened).toHaveBeenCalledWith(false);
		});
	});
});

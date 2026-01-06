import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from '@mantine/notifications';
import CampaignObjectivesContent from './CampaignObjectivesContent';
import renderWithProviders from '~/test-utils/renderWithProviders';

const deleteMutateAsync = vi.fn();
let deleteIsPending = false;

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
		}) =>
			opened ? (
				<div data-testid='mock-modal'>
					<h3>{title}</h3>
					<button type='button' onClick={onClose} data-testid='close-modal'>
						Close
					</button>
					{children}
				</div>
			) : null,
	};
});

const mockCanPerformAction = vi.fn(() => true);
const mockCanAccessModule = vi.fn(() => true);

vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
		canAccessModule: mockCanAccessModule,
	}),
}));

const mockUseObjectivesWithFilters = vi.hoisted(() => {
	const baseValue = {
		objectives: [
			{
				id: 1,
				name: 'Objective One',
				description: 'Desc',
				categoryId: 1,
				categoryName: 'Category',
				active: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		],
		pagination: { page: 1, pageSize: 10, total: 1 },
		filters: {
			search: '',
			status: 'all' as const,
			categoryId: null,
			sortBy: 'name' as const,
			sortOrder: 'asc' as const,
		},
		setPagination: vi.fn(),
		setFilters: vi.fn(),
		isLoading: false,
	};

	let value = baseValue;

	return {
		useCampaignObjectivesWithFilters: () => value,
		__setValue: (v: any) => {
			value = v;
		},
		__reset: () => {
			value = baseValue;
		},
	};
});

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
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
			<span data-testid='row-count'>{data.length}</span>
			<span data-testid='table-loading'>
				{isLoading ? 'loading' : 'loaded'}
			</span>
			{data.map((row, idx) => (
				<div key={row.id} data-testid={`row-${idx}`}>
					{columns?.map((col) => (
						<div key={col.id || col.accessorKey}>
							{col.cell?.({ row: { original: row } })}
						</div>
					))}
				</div>
			))}
		</div>
	),
}));

vi.mock('../CampaignObjectivesFilters', () => ({
	CampaignObjectivesFilters: ({
		filters,
		onFiltersChange,
	}: {
		filters: Record<string, unknown>;
		onFiltersChange: (filters: Record<string, unknown>) => void;
	}) => (
		<div data-testid='filters'>
			<input
				data-testid='search'
				value={(filters.search as string) || ''}
				onChange={(event) =>
					onFiltersChange({ ...filters, search: event.currentTarget.value })
				}
			/>
		</div>
	),
}));

vi.mock('../CampaignObjectivesForm/CampaignObjectivesForm', () => ({
	CampaignObjectivesForm: ({
		objective,
		onSuccess,
		onCancel,
	}: {
		objective?: Record<string, unknown>;
		onSuccess: () => void;
		onCancel: () => void;
	}) => (
		<div data-testid='objectives-form'>
			<span data-testid='form-mode'>{objective ? 'edit' : 'create'}</span>
			<button type='button' onClick={onSuccess} data-testid='submit-form'>
				Submit
			</button>
			<button type='button' onClick={onCancel} data-testid='cancel-form'>
				Cancel
			</button>
			{objective && (
				<span data-testid='selected-objective'>{objective.name as string}</span>
			)}
		</div>
	),
}));

vi.mock('./useCampaignObjectivesColumns', () => ({
	useCampaignObjectivesColumns: ({
		onEdit,
		onDelete,
		isDeletePending,
	}: any) => [
		{
			id: 'name',
			header: 'Name',
			cell: ({ row }: any) => <span>{row.original.name}</span>,
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }: any) => (
				<div>
					<button
						type='button'
						onClick={() => onEdit(row.original)}
						data-testid='edit-button'
					>
						Edit
					</button>
					<button
						type='button'
						onClick={() => onDelete(row.original.id)}
						disabled={isDeletePending}
						data-testid='delete-button'
					>
						Delete
					</button>
				</div>
			),
		},
	],
}));

vi.mock('~/components/EmptyState', () => ({
	default: ({
		message,
		description,
		action,
	}: {
		message: string;
		description: string;
		action?: React.ReactNode;
	}) => (
		<div data-testid='empty-state'>
			<p>{message}</p>
			<span>{description}</span>
			{action}
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
		onPageChange: (page: number) => void;
		onItemsPerPageChange: (size: string | null) => void;
	}) => (
		<div data-testid='pagination-controls'>
			<span data-testid='current-page'>{currentPage}</span>
			<span data-testid='total-pages'>{totalPages}</span>
			<button type='button' onClick={() => onPageChange(currentPage + 1)}>
				Next
			</button>
			<button type='button' onClick={() => onItemsPerPageChange('20')}>
				PageSize
			</button>
		</div>
	),
}));

vi.mock('~/components/SectionCard/SectionCard', () => ({
	default: ({
		title,
		description,
		headerActions,
		children,
	}: {
		title: string;
		description: string;
		headerActions?: React.ReactNode;
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

vi.mock('~/queries/campaignObjectivesQueries', () => ({
	useDeleteCampaignObjective: () => ({
		mutateAsync: deleteMutateAsync,
		isPending: deleteIsPending,
	}),
	useGetCampaignObjectives: vi.fn(() => ({
		data: { data: [], total: 0 },
		isLoading: false,
	})),
}));

vi.mock('~/modules/campaigns/hooks/useFilteredObjectives', () => ({
	__esModule: true,
	...mockUseObjectivesWithFilters,
}));

describe('CampaignObjectivesContent', () => {
	const defaultProps = {
		createModalOpened: false,
		setCreateModalOpened: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		deleteMutateAsync.mockResolvedValue({});
		deleteIsPending = false;
		mockUseObjectivesWithFilters.__reset();
	});

	it('renders table and pagination when data exists', () => {
		renderWithProviders(<CampaignObjectivesContent {...defaultProps} />);

		expect(screen.getByTestId('section-card')).toBeInTheDocument();
		expect(screen.getByTestId('filters')).toBeInTheDocument();
		expect(screen.getByTestId('base-table')).toBeInTheDocument();
		expect(screen.getByTestId('row-count')).toHaveTextContent('1');
		expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
	});

	it('shows initial empty state when no objectives and default filters', () => {
		mockUseObjectivesWithFilters.__setValue({
			...mockUseObjectivesWithFilters.useCampaignObjectivesWithFilters(),
			objectives: [],
			isLoading: false,
		});

		renderWithProviders(<CampaignObjectivesContent {...defaultProps} />);

		expect(screen.getByText('No objectives found')).toBeInTheDocument();
	});

	it('shows filtered empty state when filters active', () => {
		mockUseObjectivesWithFilters.__setValue({
			...mockUseObjectivesWithFilters.useCampaignObjectivesWithFilters(),
			objectives: [],
			filters: {
				search: 'abc',
				status: 'all',
				categoryId: null,
				sortBy: 'name',
				sortOrder: 'asc',
			},
			isLoading: false,
		});

		renderWithProviders(<CampaignObjectivesContent {...defaultProps} />);

		expect(
			screen.getByText('No objectives match your filters')
		).toBeInTheDocument();
	});

	it('handles delete success', async () => {
		deleteMutateAsync.mockResolvedValueOnce({});

		renderWithProviders(<CampaignObjectivesContent {...defaultProps} />);

		fireEvent.click(screen.getByTestId('delete-button'));

		await waitFor(() => {
			expect(deleteMutateAsync).toHaveBeenCalledWith(1);
		});
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({ color: 'green' })
		);
	});

	it('handles delete failure', async () => {
		deleteMutateAsync.mockRejectedValueOnce(new Error('fail'));

		renderWithProviders(<CampaignObjectivesContent {...defaultProps} />);

		fireEvent.click(screen.getByTestId('delete-button'));

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({ color: 'red' })
			);
		});
	});

	it('opens edit modal from actions and closes on success', async () => {
		renderWithProviders(<CampaignObjectivesContent {...defaultProps} />);

		fireEvent.click(screen.getByTestId('edit-button'));

		expect(screen.getByTestId('objectives-form')).toBeInTheDocument();
		expect(screen.getByTestId('selected-objective')).toHaveTextContent(
			'Objective One'
		);

		fireEvent.click(screen.getByTestId('submit-form'));
		await waitFor(() => {
			expect(
				screen.queryByTestId('selected-objective')
			).not.toBeInTheDocument();
		});
	});

	it('opens create modal and closes with handlers', async () => {
		renderWithProviders(
			<CampaignObjectivesContent
				{...defaultProps}
				createModalOpened
				setCreateModalOpened={defaultProps.setCreateModalOpened}
			/>
		);

		expect(screen.getByTestId('objectives-form')).toBeInTheDocument();
		expect(screen.getByTestId('form-mode')).toHaveTextContent('create');

		fireEvent.click(screen.getByTestId('submit-form'));
		expect(defaultProps.setCreateModalOpened).toHaveBeenCalledWith(false);

		fireEvent.click(screen.getByTestId('cancel-form'));
		expect(defaultProps.setCreateModalOpened).toHaveBeenCalledWith(false);

		fireEvent.click(screen.getByTestId('close-modal'));
		expect(defaultProps.setCreateModalOpened).toHaveBeenCalledWith(false);
	});

	it('updates filters and pagination', () => {
		renderWithProviders(<CampaignObjectivesContent {...defaultProps} />);

		fireEvent.change(screen.getByTestId('search'), {
			target: { value: 'new' },
		});
		expect(
			mockUseObjectivesWithFilters.useCampaignObjectivesWithFilters().setFilters
		).toHaveBeenCalledWith(expect.objectContaining({ search: 'new' }));

		fireEvent.click(screen.getByText('Next'));
		expect(
			mockUseObjectivesWithFilters.useCampaignObjectivesWithFilters()
				.setPagination
		).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
	});
});

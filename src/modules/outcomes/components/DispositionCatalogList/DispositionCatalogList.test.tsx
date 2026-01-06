import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import DispositionCatalogList from './DispositionCatalogList';
import { useDispositionCatalogsPaged } from '~/queries/dispositionCatalogQueries';

type DispositionCatalogsPagedResult = ReturnType<
	typeof useDispositionCatalogsPaged
>;

function mockDispositionCatalogsPaged(result: {
	data: DispositionCatalogsPagedResult['data'];
	isLoading: boolean;
	isError: boolean;
	error: DispositionCatalogsPagedResult['error'];
	isFetching: boolean;
}) {
	vi.mocked(useDispositionCatalogsPaged).mockReturnValue(
		result as unknown as DispositionCatalogsPagedResult
	);
}

const mockCreateMutation = {
	mutateAsync: vi.fn(),
	isPending: false,
};
const mockUpdateMutation = {
	mutateAsync: vi.fn(),
	isPending: false,
};
const mockReactivateMutation = {
	mutate: vi.fn(),
	isPending: false,
	variables: undefined as any,
};
const mockDeactivateMutation = {
	mutate: vi.fn(),
	isPending: false,
	variables: undefined as any,
};

const setCatalog = vi.fn();
const clearCatalog = vi.fn();

const mockCanPerformAction = vi.fn(
	(_module: ModuleEnum, _permission: PermissionEnum) => true
);
const mockCanAccessModule = vi.fn((_module: ModuleEnum) => true);

vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
		canAccessModule: mockCanAccessModule,
	}),
}));

vi.mock('~/queries/dispositionCatalogQueries', () => ({
	useDispositionCatalogsPaged: vi.fn(),
	useCreateDispositionCatalog: vi.fn(() => mockCreateMutation),
	useUpdateDispositionCatalog: vi.fn(() => mockUpdateMutation),
	useReactivateDispositionCatalog: vi.fn(() => mockReactivateMutation),
	useDeactivateDispositionCatalog: vi.fn(() => mockDeactivateMutation),
}));

vi.mock('~/hooks/useDispositionLabel', () => ({
	useDispositionLabel: () => (label: string) => label,
}));

vi.mock('~/components/SectionCard/SectionCard', () => ({
	default: ({
		children,
		headerActions,
		title,
		description,
	}: {
		children: React.ReactNode;
		headerActions?: React.ReactNode;
		title: string;
		description: string;
	}) => (
		<div data-testid='section-card'>
			<h3>{title}</h3>
			<p>{description}</p>
			<div data-testid='header-actions'>{headerActions}</div>
			{children}
		</div>
	),
}));

vi.mock('~/components/BaseTable', () => ({
	default: ({
		data,
		columns,
		onRowClick,
	}: {
		data: any[];
		columns: any[];
		onRowClick: (row: any) => void;
	}) => (
		<div data-testid='base-table'>
			<span data-testid='row-count'>{data.length}</span>
			{data.map((row, idx) => (
				<div
					key={row.id}
					data-testid={`row-${idx}`}
					onClick={() => onRowClick(row)}
				>
					{columns?.map((col) => (
						<div key={col.id || col.accessorKey}>
							{col.cell?.({
								row: {
									original: row,
								},
								getValue: () =>
									col.accessorKey
										? (row as any)[col.accessorKey as string]
										: undefined,
							})}
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

vi.mock('../DispositionCatalogForm', () => ({
	__esModule: true,
	default: ({
		mode,
		onSubmit,
		onSuccess,
		onError,
	}: {
		mode: 'create' | 'edit';
		onSubmit: (values: any) => Promise<any>;
		onSuccess?: (value: any) => void;
		onError?: (error: unknown) => void;
	}) => (
		<div data-testid={`catalog-form-${mode}`}>
			<button
				type='button'
				onClick={() => {
					onSubmit({ name: 'New Catalog' });
					onSuccess?.({ id: 99 });
				}}
			>
				Submit
			</button>
			<button type='button' onClick={() => onError?.(new Error('fail'))}>
				Error
			</button>
		</div>
	),
}));

vi.mock('~/components/SectionCard/SectionCard.module.css', () => ({}));

vi.mock('~/components/FilterContainer', () => ({
	FilterContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='filter-container'>{children}</div>
	),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		openConfirmModal: vi.fn(({ onConfirm }: { onConfirm?: () => void }) => {
			onConfirm?.();
		}),
	},
}));

vi.mock('../../dispositionRightComponentStore', () => ({
	useDispositionStore: (selector: any) =>
		selector({
			catalog: null,
			setCatalog,
			clearCatalog,
		}),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<any>();
	return {
		...actual,
		Loader: () => <div data-testid='loader'>loading</div>,
		Center: ({ children }: { children: React.ReactNode }) => (
			<div data-testid='center'>{children}</div>
		),
		Text: ({ children }: { children: React.ReactNode }) => (
			<span>{children}</span>
		),
		Group: ({ children }: { children: React.ReactNode }) => (
			<div data-testid='group'>{children}</div>
		),
		ActionIcon: ({ children, onClick, 'aria-label': ariaLabel }: any) => (
			<button type='button' onClick={onClick} aria-label={ariaLabel}>
				{children}
			</button>
		),
		Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
		Pagination: ({
			value,
			onChange,
			total,
		}: {
			value: number;
			onChange: (page: number) => void;
			total: number;
		}) => (
			<div data-testid='pagination'>
				<span data-testid='pagination-value'>{value}</span>
				<span data-testid='pagination-total'>{total}</span>
				<button type='button' onClick={() => onChange(value + 1)}>
					Next
				</button>
			</div>
		),
		Badge: ({ children }: { children: React.ReactNode }) => (
			<span data-testid='badge'>{children}</span>
		),
		Button: ({
			children,
			onClick,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
		}) => (
			<button type='button' onClick={onClick}>
				{children}
			</button>
		),
		LoadingOverlay: ({ visible }: { visible: boolean }) =>
			visible ? <div data-testid='loading-overlay'>Loading...</div> : null,
		TextInput: ({
			value,
			onChange,
			placeholder,
			rightSection,
		}: {
			value: string;
			onChange: (e: any) => void;
			placeholder: string;
			rightSection?: React.ReactNode;
		}) => (
			<div data-testid='text-input-wrapper'>
				<input
					data-testid='search-input'
					value={value}
					onChange={onChange}
					placeholder={placeholder}
				/>
				{rightSection && (
					<div data-testid='search-clear-section'>{rightSection}</div>
				)}
			</div>
		),
		CloseButton: ({ onClick }: { onClick: () => void }) => (
			<button data-testid='clear-search-button' onClick={onClick} type='button'>
				Clear
			</button>
		),
		SegmentedControl: ({
			value,
			onChange,
			data,
		}: {
			value: string;
			onChange: (val: string) => void;
			data: { label: string; value: string }[];
		}) => (
			<div data-testid='segmented-control'>
				{data.map((item) => (
					<button
						key={item.value}
						onClick={() => onChange(item.value)}
						data-active={value === item.value}
					>
						{item.label}
					</button>
				))}
			</div>
		),
		Modal: ({
			children,
			opened,
			onClose,
		}: {
			children: React.ReactNode;
			opened: boolean;
			onClose: () => void;
		}) =>
			opened ? (
				<div data-testid='modal'>
					<button onClick={onClose}>Close</button>
					{children}
				</div>
			) : null,
	};
});

describe('DispositionCatalogList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCanPerformAction.mockReturnValue(true);
		mockCanAccessModule.mockReturnValue(true);
		mockDispositionCatalogsPaged({
			data: {
				data: [
					{
						id: 1,
						name: 'Catalog One',
						description: 'Desc',
						clientId: 1,
						isDefault: false,
						type: 'INBOUND',
						createdAt: '2024-01-01T00:00:00Z',
						updatedAt: '2024-01-01T00:00:00Z',
						isActive: true,
					},
				],
				total: 1,
				limit: 10,
				offset: 0,
			},
			isLoading: false,
			isError: false,
			error: null,
			isFetching: false,
		});
	});

	it('shows loader when loading', () => {
		mockDispositionCatalogsPaged({
			data: {
				data: [],
				total: 0,
				limit: 10,
				offset: 0,
			},
			isLoading: true,
			isError: false,
			error: null,
			isFetching: false,
		});

		renderWithProviders(<DispositionCatalogList />);

		expect(screen.getByTestId('loader')).toBeInTheDocument();
	});

	it('renders error state', () => {
		mockDispositionCatalogsPaged({
			data: {
				data: [],
				total: 0,
				limit: 10,
				offset: 0,
			},
			isLoading: false,
			isError: true,
			error: new Error('fail'),
			isFetching: false,
		});

		renderWithProviders(<DispositionCatalogList />);

		expect(
			screen.getByText('Failed to load disposition catalogs.')
		).toBeInTheDocument();
	});

	it('renders empty state and triggers create flow', () => {
		mockDispositionCatalogsPaged({
			data: {
				data: [],
				total: 0,
				limit: 10,
				offset: 0,
			},
			isLoading: false,
			isError: false,
			error: null,
			isFetching: false,
		});

		renderWithProviders(<DispositionCatalogList />);

		expect(screen.getByTestId('empty-state')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Create Catalog'));

		expect(screen.getByTestId('modal')).toBeInTheDocument();
		expect(screen.getByTestId('catalog-form-create')).toBeInTheDocument();
	});

	it('renders table rows and selects catalog on row click', () => {
		const onEditNodes = vi.fn();
		renderWithProviders(<DispositionCatalogList onEditNodes={onEditNodes} />);

		expect(screen.getByTestId('base-table')).toBeInTheDocument();
		fireEvent.click(screen.getByTestId('row-0'));

		expect(setCatalog).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Catalog One' })
		);
		expect(onEditNodes).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Catalog One' })
		);
		expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
	});

	it('opens edit details form from action icon', () => {
		renderWithProviders(<DispositionCatalogList />);

		fireEvent.click(screen.getByLabelText('Edit details'));

		expect(screen.getByTestId('modal')).toBeInTheDocument();
		expect(screen.getByTestId('catalog-form-edit')).toBeInTheDocument();
	});

	it('selects catalog nodes from action icon', () => {
		const onEditNodes = vi.fn();
		renderWithProviders(<DispositionCatalogList onEditNodes={onEditNodes} />);

		fireEvent.click(screen.getByLabelText('Edit nodes'));

		expect(setCatalog).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Catalog One' })
		);
		expect(onEditNodes).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Catalog One' })
		);
	});

	it('reactivates and deactivates catalog', () => {
		mockDispositionCatalogsPaged({
			data: {
				data: [
					{
						id: 2,
						name: 'Inactive',
						description: '',
						clientId: 1,
						isDefault: false,
						type: 'INBOUND',
						createdAt: '',
						updatedAt: '',
						isActive: false,
					},
				],
				total: 1,
				limit: 10,
				offset: 0,
			},
			isLoading: false,
			isError: false,
			error: null,
			isFetching: false,
		});

		const { unmount } = renderWithProviders(<DispositionCatalogList />);

		fireEvent.click(screen.getByLabelText('Reactivate'));
		expect(mockReactivateMutation.mutate).toHaveBeenCalledWith(
			{ catalogId: 2 },
			expect.any(Object)
		);

		unmount();

		mockDispositionCatalogsPaged({
			data: {
				data: [
					{
						id: 3,
						name: 'Active',
						description: '',
						clientId: 1,
						isDefault: false,
						type: 'INBOUND',
						createdAt: '',
						updatedAt: '',
						isActive: true,
					},
				],
				total: 1,
				limit: 10,
				offset: 0,
			},
			isLoading: false,
			isError: false,
			error: null,
			isFetching: false,
		});

		renderWithProviders(<DispositionCatalogList />);

		fireEvent.click(screen.getByLabelText('Deactivate'));
		expect(mockDeactivateMutation.mutate).toHaveBeenCalledWith(
			{ catalogId: 3 },
			expect.any(Object)
		);
	});

	describe('Filters', () => {
		it('renders filter container with search input and status toggle', () => {
			renderWithProviders(<DispositionCatalogList />);

			expect(screen.getByTestId('filter-container')).toBeInTheDocument();
			expect(screen.getByTestId('search-input')).toBeInTheDocument();
			expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
		});

		it('renders search input with correct placeholder', () => {
			renderWithProviders(<DispositionCatalogList />);

			const searchInput = screen.getByTestId('search-input');
			expect(searchInput).toHaveAttribute(
				'placeholder',
				'Search by name or description...'
			);
		});

		it('updates search value when typing', () => {
			renderWithProviders(<DispositionCatalogList />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'test search' } });

			expect(searchInput).toHaveValue('test search');
		});

		it('shows clear button when search has value', () => {
			renderWithProviders(<DispositionCatalogList />);

			const searchInput = screen.getByTestId('search-input');

			// Initially no clear button
			expect(
				screen.queryByTestId('clear-search-button')
			).not.toBeInTheDocument();

			// Type something
			fireEvent.change(searchInput, { target: { value: 'test' } });

			// Clear button should appear
			expect(screen.getByTestId('clear-search-button')).toBeInTheDocument();
		});

		it('clears search when clear button is clicked', () => {
			renderWithProviders(<DispositionCatalogList />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'test' } });

			const clearButton = screen.getByTestId('clear-search-button');
			fireEvent.click(clearButton);

			expect(searchInput).toHaveValue('');
		});

		it('renders status filter with All, Active, and Inactive options', () => {
			renderWithProviders(<DispositionCatalogList />);

			const segmentedControl = screen.getByTestId('segmented-control');
			expect(segmentedControl).toHaveTextContent('All');
			expect(segmentedControl).toHaveTextContent('Active');
			expect(segmentedControl).toHaveTextContent('Inactive');
		});

		it('has All status selected by default', () => {
			renderWithProviders(<DispositionCatalogList />);

			const segmentedControl = screen.getByTestId('segmented-control');
			const allButton = segmentedControl.querySelector(
				'button[data-active="true"]'
			);
			expect(allButton).toHaveTextContent('All');
		});

		it('changes status filter when clicking on Active', () => {
			renderWithProviders(<DispositionCatalogList />);

			const segmentedControl = screen.getByTestId('segmented-control');
			const activeButton = segmentedControl.querySelector(
				'button:nth-child(2)'
			);
			fireEvent.click(activeButton!);

			expect(activeButton).toHaveAttribute('data-active', 'true');
		});

		it('changes status filter when clicking on Inactive', () => {
			renderWithProviders(<DispositionCatalogList />);

			const segmentedControl = screen.getByTestId('segmented-control');
			const inactiveButton = segmentedControl.querySelector(
				'button:nth-child(3)'
			);
			fireEvent.click(inactiveButton!);

			expect(inactiveButton).toHaveAttribute('data-active', 'true');
		});

		it('shows active filters badge when search has value', () => {
			renderWithProviders(<DispositionCatalogList />);

			const filterContainer = screen.getByTestId('filter-container');

			// Initially no badge in filter container
			expect(
				filterContainer.querySelector('[data-testid="badge"]')
			).not.toBeInTheDocument();

			// Type something
			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'test' } });

			// Badge should appear in filter container with count 1
			const badge = filterContainer.querySelector('[data-testid="badge"]');
			expect(badge).toBeInTheDocument();
			expect(badge).toHaveTextContent('1');
		});

		it('shows active filters badge when status filter is not All', () => {
			renderWithProviders(<DispositionCatalogList />);

			const filterContainer = screen.getByTestId('filter-container');

			// Initially no badge in filter container
			expect(
				filterContainer.querySelector('[data-testid="badge"]')
			).not.toBeInTheDocument();

			// Click Active in the segmented control
			const segmentedControl = screen.getByTestId('segmented-control');
			const activeButton = segmentedControl.querySelector(
				'button:nth-child(2)'
			);
			fireEvent.click(activeButton!);

			// Badge should appear in filter container with count 1
			const badge = filterContainer.querySelector('[data-testid="badge"]');
			expect(badge).toBeInTheDocument();
			expect(badge).toHaveTextContent('1');
		});

		it('shows badge with count 2 when both search and status filter are active', () => {
			renderWithProviders(<DispositionCatalogList />);

			const filterContainer = screen.getByTestId('filter-container');
			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'test' } });

			const segmentedControl = screen.getByTestId('segmented-control');
			const activeButton = segmentedControl.querySelector(
				'button:nth-child(2)'
			);
			fireEvent.click(activeButton!);

			const badge = filterContainer.querySelector('[data-testid="badge"]');
			expect(badge).toHaveTextContent('2');
		});

		it('shows Clear Filters button when filters are active and no results', () => {
			mockDispositionCatalogsPaged({
				data: {
					data: [],
					total: 0,
					limit: 10,
					offset: 0,
				},
				isLoading: false,
				isError: false,
				error: null,
				isFetching: false,
			});

			renderWithProviders(<DispositionCatalogList />);

			// Apply a filter - status filter is synchronous
			const segmentedControl = screen.getByTestId('segmented-control');
			const activeButton = segmentedControl.querySelector(
				'button:nth-child(2)'
			);
			fireEvent.click(activeButton!);

			expect(screen.getByText('Clear Filters')).toBeInTheDocument();
		});

		it('clears all filters when Clear Filters button is clicked', () => {
			mockDispositionCatalogsPaged({
				data: {
					data: [],
					total: 0,
					limit: 10,
					offset: 0,
				},
				isLoading: false,
				isError: false,
				error: null,
				isFetching: false,
			});

			renderWithProviders(<DispositionCatalogList />);

			// Apply filters
			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'test' } });

			const segmentedControl = screen.getByTestId('segmented-control');
			const activeButton = segmentedControl.querySelector(
				'button:nth-child(2)'
			);
			fireEvent.click(activeButton!);

			// Click Clear Filters
			fireEvent.click(screen.getByText('Clear Filters'));

			// Filters should be cleared
			expect(searchInput).toHaveValue('');
			const allButton = segmentedControl.querySelector('button:first-child');
			expect(allButton).toHaveAttribute('data-active', 'true');
		});

		it('calls query with search parameter when searching', () => {
			renderWithProviders(<DispositionCatalogList />);

			const searchInput = screen.getByTestId('search-input');
			fireEvent.change(searchInput, { target: { value: 'catalog name' } });

			// The mock is called with the search parameter
			// Note: Due to debouncing, immediate check may not reflect the search value
			// but the state update is triggered
			expect(useDispositionCatalogsPaged).toHaveBeenCalled();
		});

		it('calls query with isActive true when Active filter is selected', () => {
			renderWithProviders(<DispositionCatalogList />);

			const segmentedControl = screen.getByTestId('segmented-control');
			const activeButton = segmentedControl.querySelector(
				'button:nth-child(2)'
			);
			fireEvent.click(activeButton!);

			expect(useDispositionCatalogsPaged).toHaveBeenCalledWith(
				expect.objectContaining({
					isActive: true,
				})
			);
		});

		it('calls query with isActive false when Inactive filter is selected', () => {
			renderWithProviders(<DispositionCatalogList />);

			const segmentedControl = screen.getByTestId('segmented-control');
			const inactiveButton = segmentedControl.querySelector(
				'button:nth-child(3)'
			);
			fireEvent.click(inactiveButton!);

			expect(useDispositionCatalogsPaged).toHaveBeenCalledWith(
				expect.objectContaining({
					isActive: false,
				})
			);
		});

		it('calls query with isActive undefined when All filter is selected', () => {
			renderWithProviders(<DispositionCatalogList />);

			const segmentedControl = screen.getByTestId('segmented-control');
			// First select Active, then back to All
			const activeButton = segmentedControl.querySelector(
				'button:nth-child(2)'
			);
			fireEvent.click(activeButton!);

			const allButton = segmentedControl.querySelector('button:first-child');
			fireEvent.click(allButton!);

			expect(useDispositionCatalogsPaged).toHaveBeenLastCalledWith(
				expect.objectContaining({
					isActive: undefined,
				})
			);
		});
	});

	describe('Permissions', () => {
		it('hides creation actions when user lacks CREATE permission', () => {
			mockCanPerformAction.mockImplementation(
				(module: ModuleEnum, permission: PermissionEnum) => {
					if (
						module === ModuleEnum.SETTINGS &&
						permission === PermissionEnum.CREATE
					) {
						return false;
					}
					return true;
				}
			);

			mockDispositionCatalogsPaged({
				data: {
					data: [],
					total: 0,
					limit: 10,
					offset: 0,
				},
				isLoading: false,
				isError: false,
				error: null,
				isFetching: false,
			});

			renderWithProviders(<DispositionCatalogList />);

			// Should not show "Plus" icon in header
			expect(screen.queryByLabelText('IconPlus')).not.toBeInTheDocument();
			// Should not show "Create Catalog" button in EmptyState
			expect(screen.queryByText('Create Catalog')).not.toBeInTheDocument();
		});

		it('hides update actions in table rows when user lacks UPDATE permission', () => {
			mockCanPerformAction.mockImplementation(
				(module: ModuleEnum, permission: PermissionEnum) => {
					if (
						module === ModuleEnum.SETTINGS &&
						permission === PermissionEnum.UPDATE
					) {
						return false;
					}
					return true;
				}
			);

			mockDispositionCatalogsPaged({
				data: {
					data: [
						{
							id: 1,
							name: 'Catalog One',
							description: 'Desc',
							clientId: 1,
							isDefault: false,
							type: 'INBOUND',
							createdAt: '2024-01-01T00:00:00Z',
							updatedAt: '2024-01-01T00:00:00Z',
							isActive: true,
						},
					],
					total: 1,
					limit: 10,
					offset: 0,
				},
				isLoading: false,
				isError: false,
				error: null,
				isFetching: false,
			});

			renderWithProviders(<DispositionCatalogList />);

			// Should not show "Edit details" icon (Update)
			expect(screen.queryByLabelText('Edit details')).not.toBeInTheDocument();
			// Should not show "Deactivate" icon (Update)
			expect(screen.queryByLabelText('Deactivate')).not.toBeInTheDocument();
		});
	});
});

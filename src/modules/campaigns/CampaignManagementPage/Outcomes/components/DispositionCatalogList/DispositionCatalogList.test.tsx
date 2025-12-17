import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DispositionCatalogList from './DispositionCatalogList';

const mockCreateMutation = {
	mutateAsync: vi.fn(),
	isPending: false,
};
const mockUpdateMutation = {
	mutateAsync: vi.fn(),
	isPending: false,
};
const mockDeleteMutation = {
	mutate: vi.fn(),
	isPending: false,
	variables: undefined as any,
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

const mockUseCatalogs = vi.hoisted(() => {
	let value = {
		data: [
			{
				id: 1,
				name: 'Catalog One',
				description: 'Desc',
				type: 'INBOUND',
				createdAt: '2024-01-01T00:00:00Z',
				isActive: true,
			},
		],
		isLoading: false,
		isError: false,
		error: undefined,
	};

	return {
		useDispositionCatalogs: () => value,
		__setValue: (v: any) => {
			value = v;
		},
		__reset: () => {
			value = {
				data: [
					{
						id: 1,
						name: 'Catalog One',
						description: 'Desc',
						type: 'INBOUND',
						createdAt: '2024-01-01T00:00:00Z',
						isActive: true,
					},
				],
				isLoading: false,
				isError: false,
				error: undefined,
			};
		},
	};
});

const setCatalog = vi.fn();
const clearCatalog = vi.fn();

vi.mock('~/queries/dispositionCatalogQueries', () => ({
	useDispositionCatalogs: () => mockUseCatalogs.useDispositionCatalogs(),
	useCreateDispositionCatalog: () => mockCreateMutation,
	useUpdateDispositionCatalog: () => mockUpdateMutation,
	useDeleteDispositionCatalog: () => mockDeleteMutation,
	useReactivateDispositionCatalog: () => mockReactivateMutation,
	useDeactivateDispositionCatalog: () => mockDeactivateMutation,
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

vi.mock('@mantine/core', () => ({
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
}));

describe('DispositionCatalogList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCatalogs.__reset();
	});

	it('shows loader when loading', () => {
		mockUseCatalogs.__setValue({
			data: [],
			isLoading: true,
			isError: false,
			error: undefined,
		});

		render(<DispositionCatalogList />);

		expect(screen.getByTestId('loader')).toBeInTheDocument();
	});

	it('renders error state', () => {
		mockUseCatalogs.__setValue({
			data: [],
			isLoading: false,
			isError: true,
			error: new Error('fail'),
		});

		render(<DispositionCatalogList />);

		expect(
			screen.getByText('Failed to load disposition catalogs.')
		).toBeInTheDocument();
	});

	it('renders empty state and triggers create flow', () => {
		mockUseCatalogs.__setValue({
			data: [],
			isLoading: false,
			isError: false,
			error: undefined,
		});

		render(<DispositionCatalogList />);

		expect(screen.getByTestId('empty-state')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Create Catalog'));

		expect(screen.getByTestId('modal')).toBeInTheDocument();
		expect(screen.getByTestId('catalog-form-create')).toBeInTheDocument();
	});

	it('renders table rows and selects catalog on row click', () => {
		const onEditNodes = vi.fn();
		render(<DispositionCatalogList onEditNodes={onEditNodes} />);

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
		render(<DispositionCatalogList />);

		fireEvent.click(screen.getByLabelText('Edit details'));

		expect(screen.getByTestId('modal')).toBeInTheDocument();
		expect(screen.getByTestId('catalog-form-edit')).toBeInTheDocument();
	});

	it('selects catalog nodes from action icon', () => {
		const onEditNodes = vi.fn();
		render(<DispositionCatalogList onEditNodes={onEditNodes} />);

		fireEvent.click(screen.getByLabelText('Edit nodes'));

		expect(setCatalog).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Catalog One' })
		);
		expect(onEditNodes).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Catalog One' })
		);
	});

	it('reactivates, deactivates and deletes catalog', () => {
		mockUseCatalogs.__setValue({
			data: [
				{
					id: 2,
					name: 'Inactive',
					description: '',
					type: 'INBOUND',
					createdAt: '',
					isActive: false,
				},
			],
			isLoading: false,
			isError: false,
			error: undefined,
		});

		const { unmount } = render(<DispositionCatalogList />);

		fireEvent.click(screen.getByLabelText('Reactivate'));
		expect(mockReactivateMutation.mutate).toHaveBeenCalledWith(
			{ catalogId: 2 },
			expect.any(Object)
		);

		unmount();

		mockUseCatalogs.__setValue({
			data: [
				{
					id: 3,
					name: 'Active',
					description: '',
					type: 'INBOUND',
					createdAt: '',
					isActive: true,
				},
			],
			isLoading: false,
			isError: false,
			error: undefined,
		});

		render(<DispositionCatalogList />);

		fireEvent.click(screen.getByLabelText('Deactivate'));
		expect(mockDeactivateMutation.mutate).toHaveBeenCalledWith(
			{ catalogId: 3 },
			expect.any(Object)
		);

		fireEvent.click(screen.getByLabelText('Delete'));
		expect(mockDeleteMutation.mutate).toHaveBeenCalledWith(
			{ id: 3 },
			expect.any(Object)
		);
	});

	it('supports pagination controls when data exceeds page size', () => {
		mockUseCatalogs.__setValue({
			data: Array.from({ length: 11 }).map((_, index) => ({
				id: index + 1,
				name: `Catalog ${index + 1}`,
				description: '',
				type: 'INBOUND',
				createdAt: '',
				isActive: true,
			})),
			isLoading: false,
			isError: false,
			error: undefined,
		});

		render(<DispositionCatalogList />);

		expect(screen.getByTestId('pagination')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Next'));
		expect(screen.getByTestId('pagination-value')).toHaveTextContent('2');
	});
});

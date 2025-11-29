import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	renderWithProviders,
	queryClient,
} from '~/test-utils/renderWithProviders';
import UsersList from './UsersList';
import * as userQueries from '~/queries/userQueries';

const mockUseUsersColumns = vi.fn();
vi.mock('../hooks/useUsersColumns', () => ({
	__esModule: true,
	default: (...args: any[]) => mockUseUsersColumns(...args),
}));

const mockBaseTableOnRowClick = vi.fn();
vi.mock('~/components/BaseTable', () => ({
	__esModule: true,
	default: ({ data, onRowClick, columns }: any) => {
		mockBaseTableOnRowClick(onRowClick);
		return (
			<div data-testid='base-table'>
				<div>rows-{data.length}</div>
				<div>cols-{columns.length}</div>
				<button onClick={() => onRowClick && onRowClick(data[0])}>
					row-click
				</button>
			</div>
		);
	},
}));

const mockPaginationProps = vi.fn();
vi.mock('~/components/PaginationControls', () => ({
	__esModule: true,
	default: (props: any) => {
		mockPaginationProps(props);
		return (
			<div data-testid='pagination'>
				<button onClick={() => props.onPageChange(props.currentPage + 1)}>
					next-page
				</button>
				<button onClick={() => props.onItemsPerPageChange('20')}>
					items-20
				</button>
				<span>page-{props.currentPage}</span>
			</div>
		);
	},
}));

vi.mock('@mantine/core', async () => {
	const actual =
		await vi.importActual<typeof import('@mantine/core')>('@mantine/core');
	return {
		...actual,
		Loader: (props: any) => <div data-testid='loader' {...props} />,
	};
});

describe('UsersList', () => {
	const mockUseGetAllUsers = vi.spyOn(userQueries, 'useGetAllUsers');
	const baseUser = {
		id: 1,
		email: 'user@example.com',
		username: 'user',
		firstName: 'John',
		lastName: 'Doe',
		clientId: 10,
		client: { id: 10, name: 'ACME', identifier: 'acme', email: 'c@acme.com' },
		status: 'active',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		deletedAt: null,
		lastLogin: '2024-01-02T00:00:00Z',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient.clear();
		mockUseUsersColumns.mockReturnValue([{ id: 'col', header: 'Column' }]);
	});

	afterEach(() => {
		queryClient.clear();
	});

	it('shows loader while fetching', () => {
		mockUseGetAllUsers.mockReturnValue({
			isLoading: true,
			isError: false,
			error: null,
		} as any);

		renderWithProviders(
			<UsersList
				search=''
				onView={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		expect(screen.getByTestId('loader')).toBeInTheDocument();
		expect(screen.queryByTestId('base-table')).not.toBeInTheDocument();
	});

	it('renders error alert when query fails', () => {
		mockUseGetAllUsers.mockReturnValue({
			isLoading: false,
			isError: true,
			error: new Error('Boom'),
		} as any);

		renderWithProviders(
			<UsersList
				search=''
				onView={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		expect(screen.getByText(/Unable to load users/i)).toBeInTheDocument();
		expect(screen.getByText('Boom')).toBeInTheDocument();
	});

	it('shows empty state when no users are returned', () => {
		mockUseGetAllUsers.mockReturnValue({
			isLoading: false,
			isError: false,
			error: null,
			data: { data: [], total: 0, totalPages: 0 },
		} as any);

		renderWithProviders(
			<UsersList
				search=''
				onView={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		expect(screen.getByText(/No users found/i)).toBeInTheDocument();
		expect(screen.queryByTestId('base-table')).not.toBeInTheDocument();
	});

	it('renders table with data and forwards callbacks', async () => {
		const onView = vi.fn();
		const onEdit = vi.fn();
		const onDelete = vi.fn();
		mockUseGetAllUsers.mockReturnValue({
			isLoading: false,
			isError: false,
			error: null,
			data: { data: [baseUser], total: 1, totalPages: 1 },
		} as any);

		const user = userEvent.setup();
		renderWithProviders(
			<UsersList
				search='Jane'
				onView={onView}
				onEdit={onEdit}
				onDelete={onDelete}
			/>
		);

		expect(mockUseUsersColumns).toHaveBeenCalledWith({
			onView,
			onEdit,
			onDelete,
		});
		expect(screen.getByTestId('base-table')).toBeInTheDocument();
		expect(screen.getByTestId('pagination')).toBeInTheDocument();

		await user.click(screen.getByText('row-click'));
		expect(onView).toHaveBeenCalledWith(1);
	});

	it('updates pagination parameters when controls are used', async () => {
		mockUseGetAllUsers.mockReturnValue({
			isLoading: false,
			isError: false,
			error: null,
			data: { data: [baseUser], total: 5, totalPages: 2 },
		} as any);

		const user = userEvent.setup();
		renderWithProviders(
			<UsersList
				search=' query '
				onView={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		expect(mockUseGetAllUsers).toHaveBeenLastCalledWith({
			page: 1,
			limit: 10,
			search: 'query',
		});

		await user.click(screen.getByText('next-page'));
		expect(mockUseGetAllUsers).toHaveBeenLastCalledWith({
			page: 2,
			limit: 10,
			search: 'query',
		});

		await user.click(screen.getByText('items-20'));
		expect(mockUseGetAllUsers).toHaveBeenLastCalledWith({
			page: 1,
			limit: 20,
			search: 'query',
		});
	});
});

export {};

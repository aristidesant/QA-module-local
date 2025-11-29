import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	renderWithProviders,
	queryClient,
} from '~/test-utils/renderWithProviders';
import UsersPage from './UsersPage';
import * as userQueries from '~/queries/userQueries';
import useUsersPageStore from '../store/useUsersPageStore';

const modalsMocks = vi.hoisted(() => ({
	open: vi.fn(),
	openConfirmModal: vi.fn(),
	closeAll: vi.fn(),
}));

vi.mock('@mantine/modals', () => ({
	modals: modalsMocks,
}));

const notificationMocks = vi.hoisted(() => ({
	show: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: notificationMocks,
}));

const mockUsersListProps = vi.fn();
vi.mock('../UsersList', () => ({
	__esModule: true,
	default: (props: any) => {
		mockUsersListProps(props);
		return (
			<div data-testid='users-list'>
				<button onClick={() => props.onView(1)}>view-user</button>
				<button onClick={() => props.onEdit(2)}>edit-user</button>
				<button
					onClick={() =>
						props.onDelete({ id: 3, email: 'delete@example.com' } as any)
					}
				>
					delete-user
				</button>
				<div>search:{props.search}</div>
			</div>
		);
	},
}));

vi.mock('../UserForm', () => ({
	__esModule: true,
	default: ({ mode, userId }: any) => (
		<div>
			UserForm-{mode}
			{userId ? `-${userId}` : ''}
		</div>
	),
}));

vi.mock('../UserDetails', () => ({
	__esModule: true,
	default: ({ userId }: any) => <div>UserDetails-{userId}</div>,
}));

describe('UsersPage', () => {
	const deleteMutateAsync = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient.clear();
		useUsersPageStore.setState({ rightComponent: null });

		vi.spyOn(userQueries, 'useDeleteUser').mockReturnValue({
			mutateAsync: deleteMutateAsync,
		} as any);
	});

	afterEach(() => {
		queryClient.clear();
	});

	it('renders search input, title, and list', () => {
		renderWithProviders(<UsersPage />);

		expect(screen.getByRole('heading', { name: /Users/i })).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/Search users/i)).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /New User/i })
		).toBeInTheDocument();
		expect(screen.getByTestId('users-list')).toBeInTheDocument();
	});

	it('updates search term and passes it to UsersList', async () => {
		const user = userEvent.setup();
		renderWithProviders(<UsersPage />);

		const searchInput = screen.getByPlaceholderText(/Search users/i);
		await user.type(searchInput, 'Alice');

		await waitFor(() => {
			const lastCall = mockUsersListProps.mock.calls.at(-1)?.[0];
			expect(lastCall?.search).toBe('Alice');
		});
	});

	it('opens create modal when clicking New User', async () => {
		const user = userEvent.setup();
		renderWithProviders(<UsersPage />);

		await user.click(screen.getByRole('button', { name: /New User/i }));

		expect(modalsMocks.open).toHaveBeenCalledTimes(1);
		const config = modalsMocks.open.mock.calls[0][0];
		expect(config.title).toBe('New User');
		expect(config.children.props.mode).toBe('create');
	});

	it('renders user details when a row is viewed', async () => {
		const user = userEvent.setup();
		renderWithProviders(<UsersPage />);

		await user.click(screen.getByText('view-user'));

		expect(screen.getByText('UserDetails-1')).toBeInTheDocument();
	});

	it('opens edit modal from list action', async () => {
		const user = userEvent.setup();
		renderWithProviders(<UsersPage />);

		await user.click(screen.getByText('edit-user'));

		expect(modalsMocks.open).toHaveBeenCalledTimes(1);
		const config = modalsMocks.open.mock.calls[0][0];
		expect(config.title).toBe('Edit User');
		expect(config.children.props.mode).toBe('edit');
		expect(config.children.props.userId).toBe(2);
	});

	it('confirms deletion and clears right section', async () => {
		deleteMutateAsync.mockResolvedValueOnce(undefined);
		const user = userEvent.setup();
		renderWithProviders(<UsersPage />);

		// Set right section after mount (component clears it on mount)
		act(() => {
			useUsersPageStore
				.getState()
				.setRightComponent(<div data-testid='right-section'>Side content</div>);
		});

		expect(await screen.findByTestId('right-section')).toBeInTheDocument();

		await user.click(screen.getByText('delete-user'));

		expect(modalsMocks.openConfirmModal).toHaveBeenCalledTimes(1);
		const confirmConfig = modalsMocks.openConfirmModal.mock.calls[0][0];

		await act(async () => {
			await confirmConfig.onConfirm();
		});

		expect(deleteMutateAsync).toHaveBeenCalledWith(3);
		expect(notificationMocks.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'User deleted',
				message: 'delete@example.com has been removed',
				color: 'green',
			})
		);
		expect(screen.queryByTestId('right-section')).not.toBeInTheDocument();
	});
});

export {};

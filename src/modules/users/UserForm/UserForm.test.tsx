import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	renderWithProviders,
	queryClient,
} from '~/test-utils/renderWithProviders';
import UserForm from './UserForm';
import * as userQueries from '~/queries/userQueries';
import * as clientQueries from '~/queries/clientQueries';

const notificationMocks = vi.hoisted(() => ({
	show: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: notificationMocks,
}));

vi.mock('@mantine/core', async () => {
	const actual =
		await vi.importActual<typeof import('@mantine/core')>('@mantine/core');
	return {
		...actual,
		Select: ({
			label,
			data,
			value,
			onChange,
			searchable,
			withAsterisk,
			...rest
		}: any) => (
			<label>
				{label}
				<select
					aria-label={label}
					value={value ?? ''}
					onChange={(event) => onChange?.(event.target.value)}
					{...rest}
				>
					<option value='' />
					{data.map((option: any) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>
		),
	};
});

vi.mock('./UserFormSkeleton', () => ({
	__esModule: true,
	default: () => <div>Loading skeleton</div>,
}));

describe('UserForm', () => {
	const mockUseGetUser = vi.spyOn(userQueries, 'useGetUser');
	const mockUseCreateUser = vi.spyOn(userQueries, 'useCreateUser');
	const mockUseUpdateUser = vi.spyOn(userQueries, 'useUpdateUser');
	const mockUseGetAllClients = vi.spyOn(clientQueries, 'useGetAllClients');

	const createMutateAsync = vi.fn();
	const updateMutateAsync = vi.fn();

	const baseUser = {
		id: 5,
		email: 'existing@example.com',
		username: 'existing',
		firstName: 'Existing',
		lastName: 'User',
		clientId: 3,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		deletedAt: null,
		status: 'active',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient.clear();
		mockUseGetAllClients.mockReturnValue({
			data: [{ id: 3, name: 'Client A', identifier: 'ca', email: 'c@a.com' }],
			isLoading: false,
		} as any);
		mockUseCreateUser.mockReturnValue({
			mutateAsync: createMutateAsync,
			isPending: false,
		} as any);
		mockUseUpdateUser.mockReturnValue({
			mutateAsync: updateMutateAsync,
			isPending: false,
		} as any);
	});

	afterEach(() => {
		queryClient.clear();
	});

	it('renders skeleton when loading user on edit mode', () => {
		mockUseGetUser.mockReturnValue({
			isLoading: true,
			isError: false,
			error: null,
		} as any);

		renderWithProviders(
			<UserForm mode='edit' userId={baseUser.id} onSuccess={() => {}} />
		);

		expect(screen.getByText(/Loading skeleton/i)).toBeInTheDocument();
	});

	it('shows error alert when user fetch fails in edit mode', () => {
		mockUseGetUser.mockReturnValue({
			isLoading: false,
			isError: true,
			error: new Error('Not found'),
		} as any);

		renderWithProviders(
			<UserForm mode='edit' userId={baseUser.id} onSuccess={() => {}} />
		);

		expect(screen.getByText(/Unable to load user/i)).toBeInTheDocument();
		expect(screen.getByText('Not found')).toBeInTheDocument();
	});

	it('creates a new user and resets the form', async () => {
		const onSuccess = vi.fn();
		createMutateAsync.mockResolvedValueOnce(undefined);
		mockUseGetUser.mockReturnValue({
			isLoading: false,
			isError: false,
			error: null,
			data: undefined,
		} as any);

		const user = userEvent.setup();
		renderWithProviders(<UserForm mode='create' onSuccess={onSuccess} />);

		await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
		await user.type(screen.getByLabelText(/Username/i), 'new-user');
		await user.type(screen.getByLabelText(/First name/i), 'First');
		await user.type(screen.getByLabelText(/Last name/i), 'Last');
		await user.selectOptions(screen.getByLabelText(/Client/i), '3');
		await user.type(screen.getByLabelText(/Password/i), 'StrongP@ss1');

		await user.click(screen.getByRole('button', { name: /Create user/i }));

		await waitFor(() => {
			expect(createMutateAsync).toHaveBeenCalledWith({
				email: 'new@example.com',
				username: 'new-user',
				firstName: 'First',
				lastName: 'Last',
				clientId: 3,
				password: 'StrongP@ss1',
			});
			expect(onSuccess).toHaveBeenCalled();
		});

		expect(screen.getByLabelText(/Email/i)).toHaveValue('');
		expect(notificationMocks.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'User created',
			})
		);
	});

	it('updates an existing user without password field', async () => {
		const onSuccess = vi.fn();
		updateMutateAsync.mockResolvedValueOnce(undefined);
		mockUseGetUser.mockReturnValue({
			isLoading: false,
			isError: false,
			error: null,
			data: baseUser,
		} as any);

		const user = userEvent.setup();
		renderWithProviders(
			<UserForm mode='edit' userId={baseUser.id} onSuccess={onSuccess} />
		);

		expect(screen.queryByLabelText(/Password/i)).not.toBeInTheDocument();

		await user.clear(screen.getByLabelText(/First name/i));
		await user.type(screen.getByLabelText(/First name/i), 'Updated');

		await user.click(screen.getByRole('button', { name: /Save changes/i }));

		await waitFor(() => {
			expect(updateMutateAsync).toHaveBeenCalledWith({
				id: baseUser.id,
				data: {
					email: baseUser.email,
					username: baseUser.username,
					firstName: 'Updated',
					lastName: baseUser.lastName,
					clientId: baseUser.clientId,
				},
			});
			expect(onSuccess).toHaveBeenCalled();
		});

		expect(notificationMocks.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'User updated',
			})
		);
	});
});

export {};

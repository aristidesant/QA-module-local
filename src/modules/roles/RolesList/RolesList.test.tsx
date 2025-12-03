import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RolesList from './RolesList';
import * as roleQueries from '~/queries/roleQueries';
import { vi, describe, it, afterEach, expect } from 'vitest';

vi.mock('~/queries/roleQueries');

const mockRoles = [
	{
		id: 1,
		name: 'Admin',
		code: 'ADMIN',
		description: 'Administrator role',
		isActive: true,
		isSystem: true,
		createdAt: '2024-01-15T10:00:00Z',
		updatedAt: '2024-01-20T15:30:00Z',
	},
	{
		id: 2,
		name: 'Support',
		code: 'SUPPORT',
		isActive: false,
		isSystem: false,
		description: 'Support role',
		createdAt: '2024-01-16T10:00:00Z',
		updatedAt: '2024-01-21T15:30:00Z',
	},
];

describe('RolesList', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders loading state', () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			error: null,
		} as any);

		renderWithProviders(
			<RolesList
				search=''
				onView={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		// Mantine loader doesn't expose a role by default; look for its class name
		const loader = document.querySelector('[class*="mantine-Loader-root"]');
		expect(loader).toBeInTheDocument();
	});

	it('renders error state', async () => {
		const error = new Error('Failed to fetch');
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: null,
			isLoading: false,
			isError: true,
			error,
		} as any);

		renderWithProviders(
			<RolesList
				search=''
				onView={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		expect(screen.getByText('Unable to load roles')).toBeInTheDocument();
		expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
	});

	it('renders empty state when no roles', () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		renderWithProviders(
			<RolesList
				search=''
				onView={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		expect(screen.getByText('No roles found.')).toBeInTheDocument();
	});

	it('renders roles and filters by search', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		renderWithProviders(
			<RolesList
				search='Admin'
				onView={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		expect(screen.getByText('Admin')).toBeInTheDocument();
		expect(screen.queryByText('Support')).not.toBeInTheDocument();
	});

	it('calls callbacks on action icons', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const onView = vi.fn();
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		renderWithProviders(
			<RolesList
				search=''
				onView={onView}
				onEdit={onEdit}
				onDelete={onDelete}
			/>
		);

		// There are two rows, so get the first 'View role' and click
		const viewButtons = screen.getAllByLabelText('View role');
		const editButtons = screen.getAllByLabelText('Edit role');
		const deleteButtons = screen.getAllByLabelText('Delete role');

		await userEvent.click(viewButtons[0]);
		await userEvent.click(editButtons[0]);
		await userEvent.click(deleteButtons[1]);

		expect(onView).toHaveBeenCalled();
		expect(onEdit).toHaveBeenCalled();
		expect(onDelete).toHaveBeenCalled();
	});

	it('calls onView when row clicked', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const onView = vi.fn();
		renderWithProviders(
			<RolesList
				search=''
				onView={onView}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>
		);

		await userEvent.click(screen.getByText('Admin'));
		expect(onView).toHaveBeenCalledWith(1);
	});

	it('disables delete for system roles', () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const onView = vi.fn();
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		renderWithProviders(
			<RolesList
				search=''
				onView={onView}
				onEdit={onEdit}
				onDelete={onDelete}
			/>
		);

		const deleteButtons = screen.getAllByLabelText('Delete role');
		expect(deleteButtons[0]).toBeDisabled();
		expect(deleteButtons[1]).not.toBeDisabled();
	});
});

export {};

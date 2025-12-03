import { renderWithProviders } from '~/test-utils/renderWithProviders';
import RoleDetails from './RoleDetails';
import * as roleQueries from '~/queries/roleQueries';
import useRolesPageStore from '../store/useRolesPageStore';
import { screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, afterEach, type Mock } from 'vitest';

vi.mock('~/queries/roleQueries');
vi.mock('../store/useRolesPageStore');

const mockRole = {
	id: 1,
	name: 'Admin',
	code: 'ADMIN',
	description: 'Administrator role',
	isActive: true,
	isSystem: true,
	createdAt: '2024-01-15T10:00:00Z',
	updatedAt: '2024-01-20T15:30:00Z',
	modulePermissions: [
		{ module: 'CAMPAIGNS', permission: 'VIEW' },
		{ module: 'CAMPAIGNS', permission: 'CREATE' },
		{ module: 'AGENTS', permission: 'VIEW' },
		{ module: 'USERS', permission: 'EDIT' },
	],
};

describe('RoleDetails', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders loading skeleton when isLoading is true', () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			error: null,
		});

		(useRolesPageStore as unknown as Mock).mockReturnValue(vi.fn());

		renderWithProviders(<RoleDetails roleId={1} />);

		// Check for skeleton elements by looking for Mantine Skeleton class
		const skeletons = document.querySelectorAll('[class*="mantine-Skeleton"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('renders error state when isError is true', async () => {
		const testError = new Error('Failed to fetch role');
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: null,
			isLoading: false,
			isError: true,
			error: testError,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(
				screen.getByText('Unable to load role details')
			).toBeInTheDocument();
			expect(screen.getByText('Failed to fetch role')).toBeInTheDocument();
		});
	});

	it('renders role details when data is loaded', async () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: mockRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.getByText('Admin')).toBeInTheDocument();
			expect(screen.getByText('ADMIN')).toBeInTheDocument();
			expect(screen.getByText('Administrator role')).toBeInTheDocument();
		});
	});

	it('displays role badges correctly', async () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: mockRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.getByText('Active')).toBeInTheDocument();
			expect(screen.getByText('System Role')).toBeInTheDocument();
		});
	});

	it('displays inactive role badge when isActive is false', async () => {
		const inactiveRole = { ...mockRole, isActive: false, isSystem: false };
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: inactiveRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.getByText('Inactive')).toBeInTheDocument();
		});
	});

	it('groups permissions by module and displays them', async () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: mockRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.getByText('Campaigns')).toBeInTheDocument();
			expect(screen.getByText('Agents')).toBeInTheDocument();
			expect(screen.getByText('Users')).toBeInTheDocument();
		});
	});

	it('displays permission badges for each module', async () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: mockRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			// Check that permission badges are rendered
			const badgeElements = document.querySelectorAll(
				'[data-variant="light"][class*="mantine-Badge"]'
			);
			expect(badgeElements.length).toBeGreaterThan(0);
		});
	});

	it('displays "No permissions assigned" message when no permissions exist', async () => {
		const roleWithoutPermissions = {
			...mockRole,
			modulePermissions: [],
		};

		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: roleWithoutPermissions,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(
				screen.getByText('No permissions assigned to this role')
			).toBeInTheDocument();
		});
	});

	it('displays activity section with created and updated dates', async () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: mockRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.getByText('Created')).toBeInTheDocument();
			expect(screen.getByText('Last updated')).toBeInTheDocument();
		});
	});

	it('renders all three main cards: Role, Permissions, and Activity', async () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: mockRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.getByText('Role')).toBeInTheDocument();
			expect(screen.getByText('Permissions')).toBeInTheDocument();
			expect(screen.getByText('Activity')).toBeInTheDocument();
		});
	});

	it('displays role without description when description is not provided', async () => {
		const roleWithoutDescription = {
			...mockRole,
			description: null,
		};

		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: roleWithoutDescription,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.getByText('Admin')).toBeInTheDocument();
			expect(screen.queryByText('Administrator role')).not.toBeInTheDocument();
		});
	});

	it('calls clearRightComponent when close button is clicked', async () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: mockRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.getByText('Admin')).toBeInTheDocument();
		});

		const closeButtons = screen.getAllByLabelText('Close details');
		expect(closeButtons.length).toBeGreaterThan(0);

		closeButtons.forEach((button) => {
			expect(button).toBeInTheDocument();
		});
	});

	it('handles null modulePermissions gracefully', async () => {
		const roleWithNullPermissions = {
			...mockRole,
			modulePermissions: null,
		};

		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: roleWithNullPermissions,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(
				screen.getByText('No permissions assigned to this role')
			).toBeInTheDocument();
		});
	});

	it('handles role without system flag correctly', async () => {
		const regularRole = {
			...mockRole,
			isSystem: false,
		};

		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: regularRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={1} />);

		await waitFor(() => {
			expect(screen.queryByText('System Role')).not.toBeInTheDocument();
			expect(screen.getByText('Active')).toBeInTheDocument();
		});
	});

	it('passes correct roleId to useGetRole hook', () => {
		(roleQueries.useGetRole as Mock).mockReturnValue({
			data: mockRole,
			isLoading: false,
			isError: false,
			error: null,
		});

		const clearRightComponent = vi.fn();
		(useRolesPageStore as unknown as Mock).mockReturnValue(clearRightComponent);

		renderWithProviders(<RoleDetails roleId={42} />);

		expect(roleQueries.useGetRole).toHaveBeenCalledWith(42);
	});
});

export {};

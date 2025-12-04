import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	renderWithProviders,
	queryClient,
} from '~/test-utils/renderWithProviders';
import UserClientRoles from './UserClientRoles';
import * as clientQueries from '~/queries/clientQueries';
import * as roleQueries from '~/queries/roleQueries';
import type { UserRoleModel } from '~/models/UserModels';

describe('UserClientRoles', () => {
	const mockUseGetAllClients = vi.spyOn(clientQueries, 'useGetAllClients');
	const mockUseGetAllRoles = vi.spyOn(roleQueries, 'useGetAllRoles');

	const mockClients = [
		{
			id: 1,
			name: 'Client Alpha',
			identifier: 'alpha',
			email: 'alpha@test.com',
		},
		{ id: 2, name: 'Client Beta', identifier: 'beta', email: 'beta@test.com' },
	];

	const mockRoles = [
		{
			id: 10,
			name: 'Admin',
			code: 'ADMIN',
			description: 'Admin role',
			isSystem: false,
			isActive: true,
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
		},
		{
			id: 20,
			name: 'Editor',
			code: 'EDITOR',
			description: 'Editor role',
			isSystem: false,
			isActive: true,
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
		},
	];

	const defaultProps = {
		value: [] as UserRoleModel[],
		onChange: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient.clear();

		mockUseGetAllClients.mockReturnValue({
			data: mockClients,
			isLoading: false,
		} as any);

		mockUseGetAllRoles.mockReturnValue({
			data: mockRoles,
			isLoading: false,
		} as any);
	});

	afterEach(() => {
		queryClient.clear();
	});

	it('renders loading state when clients are loading', () => {
		mockUseGetAllClients.mockReturnValue({
			data: [],
			isLoading: true,
		} as any);

		renderWithProviders(<UserClientRoles {...defaultProps} />);

		// When loading, show empty state message (no clients fetched yet)
		expect(
			screen.getByText(
				/Client and role assignments will appear here once available/i
			)
		).toBeInTheDocument();
	});

	it('renders loading state when roles are loading', () => {
		mockUseGetAllRoles.mockReturnValue({
			data: [],
			isLoading: true,
		} as any);

		renderWithProviders(<UserClientRoles {...defaultProps} />);

		// Loading state is shown in the roles panel
		expect(screen.getByText(/Loading assignments/i)).toBeInTheDocument();
	});

	it('renders empty state when no clients available', () => {
		mockUseGetAllClients.mockReturnValue({
			data: [],
			isLoading: false,
		} as any);

		renderWithProviders(<UserClientRoles {...defaultProps} />);

		// When no clients are available, show empty state
		expect(
			screen.getByText(
				/Client and role assignments will appear here once available/i
			)
		).toBeInTheDocument();
	});

	it('renders client list with names', () => {
		renderWithProviders(<UserClientRoles {...defaultProps} />);

		expect(screen.getAllByText('Client Alpha').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Client Beta').length).toBeGreaterThan(0);
	});

	it('renders roles as checkboxes', () => {
		renderWithProviders(<UserClientRoles {...defaultProps} />);

		expect(
			screen.getByRole('checkbox', { name: /Admin/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole('checkbox', { name: /Editor/i })
		).toBeInTheDocument();
	});

	it('selects first client by default', () => {
		renderWithProviders(<UserClientRoles {...defaultProps} />);

		const rolesCount = screen.getByText(/0 of 2 roles assigned/i);
		expect(rolesCount).toBeInTheDocument();

		const panelTitles = screen.getAllByText('Client Alpha');
		expect(panelTitles.length).toBeGreaterThan(0);
	});

	it('switches active client when clicking client tab', async () => {
		const user = userEvent.setup();
		renderWithProviders(<UserClientRoles {...defaultProps} />);

		const betaButton = screen.getByRole('button', { name: /Client Beta/i });
		await user.click(betaButton);

		const panelTitles = screen.getAllByText('Client Beta');
		expect(panelTitles.length).toBeGreaterThanOrEqual(1);
	});

	it('toggles role when clicking checkbox', async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();

		renderWithProviders(
			<UserClientRoles {...defaultProps} onChange={onChange} />
		);

		const adminCheckbox = screen.getByRole('checkbox', { name: /Admin/i });
		await user.click(adminCheckbox);

		expect(onChange).toHaveBeenCalledWith([
			{ userId: 0, clientId: 1, roleId: 10 },
		]);
	});

	it('removes role when unchecking checkbox', async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();
		const existingRoles: UserRoleModel[] = [
			{ id: 100, userId: 5, clientId: 1, roleId: 10 },
		];

		renderWithProviders(
			<UserClientRoles value={existingRoles} onChange={onChange} userId={5} />
		);

		const adminCheckbox = screen.getByRole('checkbox', { name: /Admin/i });
		expect(adminCheckbox).toBeChecked();

		await user.click(adminCheckbox);

		expect(onChange).toHaveBeenCalledWith([]);
	});

	it('shows role count badge for clients with assigned roles', () => {
		const existingRoles: UserRoleModel[] = [
			{ id: 100, userId: 5, clientId: 1, roleId: 10 },
			{ id: 101, userId: 5, clientId: 1, roleId: 20 },
		];

		renderWithProviders(
			<UserClientRoles value={existingRoles} onChange={vi.fn()} userId={5} />
		);

		const badge = screen.getByText('2');
		expect(badge).toBeInTheDocument();
	});

	it('displays correct count in roles panel header', () => {
		const existingRoles: UserRoleModel[] = [
			{ id: 100, userId: 5, clientId: 1, roleId: 10 },
		];

		renderWithProviders(
			<UserClientRoles value={existingRoles} onChange={vi.fn()} userId={5} />
		);

		expect(screen.getByText(/1 of 2 roles assigned/i)).toBeInTheDocument();
	});

	it('disables checkboxes when disabled prop is true', () => {
		renderWithProviders(<UserClientRoles {...defaultProps} disabled={true} />);

		const adminCheckbox = screen.getByRole('checkbox', { name: /Admin/i });
		const editorCheckbox = screen.getByRole('checkbox', { name: /Editor/i });

		expect(adminCheckbox).toBeDisabled();
		expect(editorCheckbox).toBeDisabled();
	});

	it('disables client tabs when disabled prop is true', () => {
		renderWithProviders(<UserClientRoles {...defaultProps} disabled={true} />);

		const clientButtons = screen.getAllByRole('button');
		clientButtons.forEach((button) => {
			expect(button).toBeDisabled();
		});
	});

	it('preserves roles from other clients when toggling', async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();
		const existingRoles: UserRoleModel[] = [
			{ id: 200, userId: 5, clientId: 2, roleId: 20 }, // User has Editor role on Client Beta
		];

		renderWithProviders(
			<UserClientRoles value={existingRoles} onChange={onChange} userId={5} />
		);

		// Component sets active client to the one with existing roles (Client Beta id: 2)
		// Click on Client Alpha tab to switch clients
		const alphaButton = screen.getByRole('button', { name: /Client Alpha/i });
		await user.click(alphaButton);

		// Now click Admin role checkbox on Client Alpha
		const adminCheckbox = screen.getByRole('checkbox', { name: /Admin/i });
		await user.click(adminCheckbox);

		// Should preserve client 2's role and add new role to client 1
		expect(onChange).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ clientId: 2, roleId: 20 }),
				expect.objectContaining({ clientId: 1, roleId: 10 }),
			])
		);
	});

	it('shows empty roles message when no roles available', () => {
		mockUseGetAllRoles.mockReturnValue({
			data: [],
			isLoading: false,
		} as any);

		renderWithProviders(<UserClientRoles {...defaultProps} />);

		expect(
			screen.getByText(/No roles available in the system/i)
		).toBeInTheDocument();
	});

	it('uses userId prop when creating new role entries', async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();

		renderWithProviders(
			<UserClientRoles value={[]} onChange={onChange} userId={42} />
		);

		const adminCheckbox = screen.getByRole('checkbox', { name: /Admin/i });
		await user.click(adminCheckbox);

		expect(onChange).toHaveBeenCalledWith([
			expect.objectContaining({ userId: 42 }),
		]);
	});

	it('derives userId from value when userId prop is not provided', async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();
		const existingRoles: UserRoleModel[] = [
			{ id: 100, userId: 99, clientId: 2, roleId: 20 },
		];

		renderWithProviders(
			<UserClientRoles value={existingRoles} onChange={onChange} />
		);

		const adminCheckbox = screen.getByRole('checkbox', { name: /Admin/i });
		await user.click(adminCheckbox);

		expect(onChange).toHaveBeenCalledWith(
			expect.arrayContaining([expect.objectContaining({ userId: 99 })])
		);
	});

	it('displays total roles count in badge', () => {
		renderWithProviders(<UserClientRoles {...defaultProps} />);

		expect(screen.getByText('2 total roles')).toBeInTheDocument();
	});
});

export {};

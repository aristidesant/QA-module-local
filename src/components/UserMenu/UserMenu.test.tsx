import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserMenu } from './UserMenu';
import { ModuleEnum } from '~/constants/ModuleEnum';

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
	useNavigate: () => mockNavigate,
}));

// Mock session store
vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: vi.fn(),
}));

// Mock impersonation hook
const mockIsImpersonating = vi.fn();
vi.mock('~/hooks/useImpersonationState', () => ({
	useImpersonationState: () => ({
		isImpersonating: mockIsImpersonating(),
		originalClientId: null,
		currentClientId: null,
	}),
}));

const mockCanAccessModule = vi.fn((_module: any) => true);
const mockCanPerformAction = vi.fn((_module: any, _permission: any) => true);

vi.mock('~/hooks/usePermissions', () => ({
	usePermissions: () => ({
		activeClientId: 1,
		permissionMap: {},
		canAccessModule: mockCanAccessModule,
		canPerformAction: mockCanPerformAction,
		hasAnyPermission: vi.fn(),
		hasAllPermissions: vi.fn(),
	}),
}));

// Mock logout utility
const mockLogout = vi.fn();
vi.mock('~/utils/logout', () => ({
	__esModule: true,
	default: () => mockLogout(),
}));

// Helper
const renderComponent = () => renderWithProviders(<UserMenu />);

describe('UserMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsImpersonating.mockReturnValue(false);
		mockCanAccessModule.mockImplementation(() => true);
		mockCanPerformAction.mockImplementation(() => true);
	});

	it('renders user name, email and initials when not impersonating', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: {
				firstName: 'Jane',
				lastName: 'Doe',
				username: 'janedoe',
				email: 'jane@example.com',
			},
			targetClient: null,
		});

		renderComponent();

		expect(screen.getByText('Jane Doe')).toBeInTheDocument();
		expect(screen.getByText('jane@example.com')).toBeInTheDocument();
		// initials
		expect(screen.getByText('JD')).toBeInTheDocument();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		// Wait for menu items to be visible
		expect(await screen.findByText('Profile')).toBeInTheDocument();
		expect(screen.getByText('Logout')).toBeInTheDocument();
	});

	it('navigates to profile on clicking Profile', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'janedoe', email: 'jane@example.com' },
			targetClient: null,
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		const profile = await screen.findByText('Profile');
		await userEvent.click(profile);

		expect(mockNavigate).toHaveBeenCalledWith('/profile');
	});

	it('calls logout when logout is clicked', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'janedoe', email: 'jane@example.com' },
			targetClient: null,
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		const logout = await screen.findByText('Logout');
		await userEvent.click(logout);

		expect(mockLogout).toHaveBeenCalled();
	});

	it('includes Users and Roles in maintenance sections when not impersonating', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'janedoe', email: 'jane@example.com' },
			targetClient: null,
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		// Users and Roles should be available in normal mode
		await waitFor(() => {
			expect(screen.getByText('Users')).toBeInTheDocument();
		});
		expect(screen.getByText('Roles')).toBeInTheDocument();
	});

	it('renders impersonation UI and hides Users and Roles when impersonating', async () => {
		mockIsImpersonating.mockReturnValue(true);
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'owner', email: 'owner@example.com' },
			targetClient: { id: 'client-1', name: 'SomeClient' },
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		// Impersonation mode title
		await waitFor(() => {
			expect(screen.getByText('Impersonation Mode')).toBeInTheDocument();
		});

		// target client name should be displayed
		expect(screen.getByText('SomeClient')).toBeInTheDocument();

		// users and roles should NOT appear
		expect(screen.queryByText('Users')).not.toBeInTheDocument();
		expect(screen.queryByText('Roles')).not.toBeInTheDocument();
	});

	it('navigates to maintenance paths', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'janedoe', email: 'jane@example.com' },
			targetClient: null,
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		const campaignLabels = await screen.findAllByText('Campaign Management');
		const item = campaignLabels.find(
			(label) =>
				label.closest('button')?.getAttribute('data-menu-item') === 'true'
		);
		expect(item).toBeDefined();
		if (item) {
			await userEvent.click(item);
		}

		expect(mockNavigate).toHaveBeenCalledWith('/campaign-management');
	});

	it('shows initials from username when only username is provided', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'mario', email: 'mario@example.com' },
			targetClient: null,
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		expect(await screen.findByText('MA')).toBeInTheDocument();
	});

	it('navigates to Tools and Configurations properly', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'janedoe', email: 'jane@example.com' },
			targetClient: null,
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		// Click Configurations and ensure it navigates to client-configs
		// find the correct 'Configurations' menu item that is an actual menu button
		const configLabels = await screen.findAllByText('Configurations');
		const configurationsItem = configLabels.find(
			(label) =>
				label.closest('button')?.getAttribute('data-menu-item') === 'true'
		);
		expect(configurationsItem).toBeDefined();
		if (configurationsItem) {
			await userEvent.click(configurationsItem);
		}
		expect(mockNavigate).toHaveBeenCalledWith('/configurations/client-configs');
	});

	it('navigates to Tools properly', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'janedoe', email: 'jane@example.com' },
			targetClient: null,
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		const toolLabels = await screen.findAllByText('Tools');
		const tools = toolLabels.find(
			(label) =>
				label.closest('button')?.getAttribute('data-menu-item') === 'true'
		);
		expect(tools).toBeDefined();
		if (tools) {
			await userEvent.click(tools);
		}
		expect(mockNavigate).toHaveBeenCalledWith('/tools');
	});

	it('shows impersonated email when impersonating and navigates to tools', async () => {
		mockIsImpersonating.mockReturnValue(true);
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'owner', email: 'owner@example.com' },
			targetClient: { id: 'client-1', name: 'SomeClient' },
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText('Impersonated Client')).toBeInTheDocument();
		});

		// Safely find Tools by scanning all menuitem elements
		// Safely find Tools by scanning all visible labels and matching menu button
		const toolLabels = await screen.findAllByText('Tools');
		const tools = toolLabels.find(
			(label) =>
				label.closest('button')?.getAttribute('data-menu-item') === 'true'
		);
		expect(tools).toBeDefined();
		if (tools) {
			await userEvent.click(tools);
		}
		expect(mockNavigate).toHaveBeenCalledWith('/tools');
	});

	it('filters maintenance items based on permissions', async () => {
		mockCanAccessModule.mockImplementation(
			(module) => module === ModuleEnum.TOOLS
		);
		mockCanPerformAction.mockImplementation(
			(module) => module === ModuleEnum.TOOLS
		);
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: { username: 'janedoe', email: 'jane@example.com' },
			targetClient: null,
		});

		renderComponent();

		const trigger = screen.getByRole('button', { name: /user menu/i });
		await userEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText('Tools')).toBeInTheDocument();
		});
		expect(screen.queryByText('Campaign Management')).not.toBeInTheDocument();
		expect(screen.queryByText('Configurations')).not.toBeInTheDocument();
		expect(screen.queryByText('Prompter')).not.toBeInTheDocument();
	});
});

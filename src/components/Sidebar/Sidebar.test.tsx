import { screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Sidebar, renderMenuItem } from './Sidebar';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

const { mockCanAccessModule, mockUsePermissions } = vi.hoisted(() => {
	const canAccess = vi.fn(() => true);
	return {
		mockCanAccessModule: canAccess,
		mockUsePermissions: vi.fn(() => ({
			activeClientId: 1,
			permissionMap: {},
			canAccessModule: canAccess,
			canPerformAction: vi.fn(),
			hasAnyPermission: vi.fn(),
			hasAllPermissions: vi.fn(),
		})),
	};
});

vi.mock('~/hooks/usePermissions', () => ({
	usePermissions: () => mockUsePermissions(),
}));

// Mock the Logo component
vi.mock('../Logo', () => ({
	default: () => <div data-testid='logo'>Logo</div>,
}));

// Mock the version
vi.mock('~/version', () => ({
	APP_VERSION: '1.0.0',
}));

const renderSidebar = () => {
	return renderWithProviders(
		<MemoryRouter initialEntries={['/']}>
			<Sidebar />
		</MemoryRouter>
	);
};

describe('Sidebar', () => {
	beforeEach(() => {
		mockCanAccessModule.mockReturnValue(true);
	});

	describe('Rendering', () => {
		it('renders the navigation element', () => {
			renderSidebar();

			const nav = screen.getByRole('navigation', { name: 'Main navigation' });
			expect(nav).toBeInTheDocument();
		});

		it('renders the logo component', () => {
			renderSidebar();

			expect(screen.getByTestId('logo')).toBeInTheDocument();
		});

		it('renders menu items', () => {
			renderSidebar();

			expect(screen.getByText('Overview')).toBeInTheDocument();
			expect(screen.getByText('Campaigns')).toBeInTheDocument();
			expect(screen.getByText('Conversations')).toBeInTheDocument();
		});

		it('renders MENU section header', () => {
			renderSidebar();

			expect(screen.getByText('MENU')).toBeInTheDocument();
		});

		it('renders version text', () => {
			renderSidebar();

			expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
		});

		it('shows an empty state when no modules are available', () => {
			mockCanAccessModule.mockReturnValue(false);
			renderSidebar();

			expect(screen.getByText('No modules available')).toBeInTheDocument();
			expect(
				screen.getByText('Request access to see navigation options.')
			).toBeInTheDocument();
			expect(screen.queryByText('Overview')).not.toBeInTheDocument();
		});
	});

	describe('Menu Items Navigation', () => {
		it('renders menu items as links', () => {
			renderSidebar();

			const links = screen.getAllByRole('link');
			expect(links.length).toBeGreaterThanOrEqual(3);
		});

		it('links have correct href attributes', () => {
			renderSidebar();

			const overviewLink = screen.getByRole('link', { name: /overview/i });
			const campaignsLink = screen.getByRole('link', { name: /campaigns/i });
			const conversationsLink = screen.getByRole('link', {
				name: /conversations/i,
			});

			expect(overviewLink.getAttribute('href')).toBe('/');
			expect(campaignsLink.getAttribute('href')).toBe('/campaigns');
			expect(conversationsLink.getAttribute('href')).toBe('/conversations');
		});

		it('links are focusable with tabIndex=0', () => {
			renderSidebar();

			const links = screen.getAllByRole('link');
			links.forEach((link) => {
				expect(link.getAttribute('tabindex')).toBe('0');
			});
		});
	});

	describe('Active State', () => {
		it('marks Overview as active when on root path', () => {
			renderWithProviders(
				<MemoryRouter initialEntries={['/']}>
					<Sidebar />
				</MemoryRouter>
			);

			const overviewLink = screen.getByRole('link', { name: /overview/i });
			expect(overviewLink.getAttribute('aria-current')).toBe('page');
		});

		it('marks Campaigns as active when on campaigns path', () => {
			renderWithProviders(
				<MemoryRouter initialEntries={['/campaigns']}>
					<Sidebar />
				</MemoryRouter>
			);

			const campaignsLink = screen.getByRole('link', { name: /campaigns/i });
			expect(campaignsLink.getAttribute('aria-current')).toBe('page');
		});

		it('marks Campaigns as active on campaigns sub-route', () => {
			renderWithProviders(
				<MemoryRouter initialEntries={['/campaigns/123']}>
					<Sidebar />
				</MemoryRouter>
			);

			const campaignsLink = screen.getByRole('link', { name: /campaigns/i });
			expect(campaignsLink.getAttribute('aria-current')).toBe('page');
		});

		it('does not mark other items as active', () => {
			renderWithProviders(
				<MemoryRouter initialEntries={['/']}>
					<Sidebar />
				</MemoryRouter>
			);

			const campaignsLink = screen.getByRole('link', { name: /campaigns/i });
			const conversationsLink = screen.getByRole('link', {
				name: /conversations/i,
			});

			expect(campaignsLink.getAttribute('aria-current')).toBeNull();
			expect(conversationsLink.getAttribute('aria-current')).toBeNull();
		});
	});

	describe('renderMenuItem Function', () => {
		// Create a wrapper component since renderMenuItem uses hooks internally
		const RenderMenuItemWrapper = ({
			label,
			icon,
			to,
			exact,
			module = ModuleEnum.DASHBOARD,
		}: {
			label: string;
			icon: React.ReactNode;
			to: string;
			exact?: boolean;
			module?: ModuleEnum;
		}) => {
			return renderMenuItem({ label, icon, to, exact, module });
		};

		it('renders menu item with icon and label', () => {
			renderWithProviders(
				<MemoryRouter initialEntries={['/']}>
					<RenderMenuItemWrapper
						label='sidebar.items.overview'
						icon={<span data-testid='test-icon'>Icon</span>}
						to='/test'
					/>
				</MemoryRouter>
			);

			expect(screen.getByTestId('test-icon')).toBeInTheDocument();
			expect(screen.getByText('Overview')).toBeInTheDocument();
		});

		it('applies selected style for exact match when exact is true', () => {
			const { container } = renderWithProviders(
				<MemoryRouter initialEntries={['/']}>
					<RenderMenuItemWrapper
						label='sidebar.items.overview'
						icon={<span>Icon</span>}
						to='/'
						exact={true}
					/>
				</MemoryRouter>
			);

			const link = container.querySelector('a');
			expect(link?.className).toContain('menuItemSelected');
		});

		it('does not apply selected style when path does not match exactly with exact=true', () => {
			const { container } = renderWithProviders(
				<MemoryRouter initialEntries={['/other']}>
					<RenderMenuItemWrapper
						label='sidebar.items.overview'
						icon={<span>Icon</span>}
						to='/'
						exact={true}
					/>
				</MemoryRouter>
			);

			const link = container.querySelector('a');
			expect(link?.className).not.toContain('menuItemSelected');
		});

		it('applies selected style for prefix match when exact is false', () => {
			const { container } = renderWithProviders(
				<MemoryRouter initialEntries={['/campaigns/123']}>
					<RenderMenuItemWrapper
						label='sidebar.items.campaigns'
						icon={<span>Icon</span>}
						to='/campaigns'
						exact={false}
					/>
				</MemoryRouter>
			);

			const link = container.querySelector('a');
			expect(link?.className).toContain('menuItemSelected');
		});
	});

	describe('Accessibility', () => {
		it('has proper aria-label on navigation', () => {
			renderSidebar();

			const nav = screen.getByRole('navigation');
			expect(nav.getAttribute('aria-label')).toBe('Main navigation');
		});

		it('has proper aria-current for active links', () => {
			renderWithProviders(
				<MemoryRouter initialEntries={['/campaigns']}>
					<Sidebar />
				</MemoryRouter>
			);

			const activeLink = screen.getByRole('link', { name: /campaigns/i });
			expect(activeLink.getAttribute('aria-current')).toBe('page');
		});

		it('inactive links do not have aria-current', () => {
			renderWithProviders(
				<MemoryRouter initialEntries={['/campaigns']}>
					<Sidebar />
				</MemoryRouter>
			);

			const inactiveLink = screen.getByRole('link', { name: /overview/i });
			expect(inactiveLink.getAttribute('aria-current')).toBeNull();
		});
	});
});

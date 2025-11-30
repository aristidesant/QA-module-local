import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { MantineProvider } from '@mantine/core';
import { Sidebar, renderMenuItem } from './Sidebar';

// Mock the Logo component
vi.mock('../Logo', () => ({
	default: ({ compact }: { compact: boolean }) => (
		<div data-testid='logo' data-compact={compact}>
			Logo
		</div>
	),
}));

// Mock the version
vi.mock('~/version', () => ({
	APP_VERSION: '1.0.0',
}));

// Mock menuItems
vi.mock('./menuItems', () => ({
	menuItems: [
		{
			label: 'Overview',
			icon: <span data-testid='overview-icon'>Overview Icon</span>,
			to: '/',
			exact: true,
		},
		{
			label: 'Campaigns',
			icon: <span data-testid='campaigns-icon'>Campaigns Icon</span>,
			to: '/campaigns',
		},
		{
			label: 'Conversations',
			icon: <span data-testid='conversations-icon'>Conversations Icon</span>,
			to: '/conversations',
		},
	],
}));

const renderSidebar = (opened: boolean = true) => {
	return render(
		<MantineProvider>
			<MemoryRouter initialEntries={['/']}>
				<Sidebar opened={opened} />
			</MemoryRouter>
		</MantineProvider>
	);
};

describe('Sidebar', () => {
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

		it('renders MENU section header when expanded', () => {
			renderSidebar(true);

			expect(screen.getByText('MENU')).toBeInTheDocument();
		});

		it('does not render MENU section header when collapsed', () => {
			renderSidebar(false);

			expect(screen.queryByText('MENU')).not.toBeInTheDocument();
		});
	});

	describe('Expanded State', () => {
		it('applies expanded class when opened is true', () => {
			const { container } = renderSidebar(true);

			const nav = container.querySelector('nav');
			expect(nav?.className).toContain('sidebarExpanded');
			expect(nav?.className).not.toContain('sidebarCollapsed');
		});

		it('renders version text when expanded', () => {
			renderSidebar(true);

			expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
		});

		it('passes compact=false to Logo when expanded', () => {
			renderSidebar(true);

			const logo = screen.getByTestId('logo');
			expect(logo.getAttribute('data-compact')).toBe('false');
		});

		it('shows menu item text when expanded', () => {
			renderSidebar(true);

			expect(screen.getByText('Overview')).toBeInTheDocument();
			expect(screen.getByText('Campaigns')).toBeInTheDocument();
		});

		it('sets aria-expanded to true when opened', () => {
			renderSidebar(true);

			const nav = screen.getByRole('navigation');
			expect(nav.getAttribute('aria-expanded')).toBe('true');
		});
	});

	describe('Collapsed State', () => {
		it('applies collapsed class when opened is false', () => {
			const { container } = renderSidebar(false);

			const nav = container.querySelector('nav');
			expect(nav?.className).toContain('sidebarCollapsed');
			expect(nav?.className).not.toContain('sidebarExpanded');
		});

		it('passes compact=true to Logo when collapsed', () => {
			renderSidebar(false);

			const logo = screen.getByTestId('logo');
			expect(logo.getAttribute('data-compact')).toBe('true');
		});

		it('does not render version text directly when collapsed', () => {
			renderSidebar(false);

			// When collapsed, version is shown in a tooltip, not as plain text
			expect(screen.queryByText('Version 1.0.0')).not.toBeInTheDocument();
		});

		it('sets aria-expanded to false when collapsed', () => {
			renderSidebar(false);

			const nav = screen.getByRole('navigation');
			expect(nav.getAttribute('aria-expanded')).toBe('false');
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
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<Sidebar opened={true} />
					</MemoryRouter>
				</MantineProvider>
			);

			const overviewLink = screen.getByRole('link', { name: /overview/i });
			expect(overviewLink.getAttribute('aria-current')).toBe('page');
		});

		it('marks Campaigns as active when on campaigns path', () => {
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/campaigns']}>
						<Sidebar opened={true} />
					</MemoryRouter>
				</MantineProvider>
			);

			const campaignsLink = screen.getByRole('link', { name: /campaigns/i });
			expect(campaignsLink.getAttribute('aria-current')).toBe('page');
		});

		it('marks Campaigns as active on campaigns sub-route', () => {
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/campaigns/123']}>
						<Sidebar opened={true} />
					</MemoryRouter>
				</MantineProvider>
			);

			const campaignsLink = screen.getByRole('link', { name: /campaigns/i });
			expect(campaignsLink.getAttribute('aria-current')).toBe('page');
		});

		it('does not mark other items as active', () => {
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<Sidebar opened={true} />
					</MemoryRouter>
				</MantineProvider>
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
			opened,
		}: {
			label: string;
			icon: React.ReactNode;
			to: string;
			exact?: boolean;
			opened?: boolean;
		}) => {
			return renderMenuItem({ label, icon, to, exact, opened });
		};

		it('renders menu item with icon and label when opened', () => {
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<RenderMenuItemWrapper
							label='Test Item'
							icon={<span data-testid='test-icon'>Icon</span>}
							to='/test'
							opened={true}
						/>
					</MemoryRouter>
				</MantineProvider>
			);

			expect(screen.getByTestId('test-icon')).toBeInTheDocument();
			expect(screen.getByText('Test Item')).toBeInTheDocument();
		});

		it('renders menu item with icon in tooltip when collapsed', () => {
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<RenderMenuItemWrapper
							label='Test Item'
							icon={<span data-testid='test-icon'>Icon</span>}
							to='/test'
							opened={false}
						/>
					</MemoryRouter>
				</MantineProvider>
			);

			expect(screen.getByTestId('test-icon')).toBeInTheDocument();
			// Label should not be visible as text when collapsed
			expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
		});

		it('applies selected style for exact match when exact is true', () => {
			const { container } = render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<RenderMenuItemWrapper
							label='Home'
							icon={<span>Icon</span>}
							to='/'
							exact={true}
							opened={true}
						/>
					</MemoryRouter>
				</MantineProvider>
			);

			const link = container.querySelector('a');
			expect(link?.className).toContain('menuItemSelected');
		});

		it('does not apply selected style when path does not match exactly with exact=true', () => {
			const { container } = render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/other']}>
						<RenderMenuItemWrapper
							label='Home'
							icon={<span>Icon</span>}
							to='/'
							exact={true}
							opened={true}
						/>
					</MemoryRouter>
				</MantineProvider>
			);

			const link = container.querySelector('a');
			expect(link?.className).not.toContain('menuItemSelected');
		});

		it('applies selected style for prefix match when exact is false', () => {
			const { container } = render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/campaigns/123']}>
						<RenderMenuItemWrapper
							label='Campaigns'
							icon={<span>Icon</span>}
							to='/campaigns'
							exact={false}
							opened={true}
						/>
					</MemoryRouter>
				</MantineProvider>
			);

			const link = container.querySelector('a');
			expect(link?.className).toContain('menuItemSelected');
		});

		it('applies collapsed style when opened is false', () => {
			const { container } = render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<RenderMenuItemWrapper
							label='Test'
							icon={<span>Icon</span>}
							to='/test'
							opened={false}
						/>
					</MemoryRouter>
				</MantineProvider>
			);

			const link = container.querySelector('a');
			expect(link?.className).toContain('menuItemCollapsed');
		});

		it('does not apply collapsed style when opened is true', () => {
			const { container } = render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<RenderMenuItemWrapper
							label='Test'
							icon={<span>Icon</span>}
							to='/test'
							opened={true}
						/>
					</MemoryRouter>
				</MantineProvider>
			);

			const link = container.querySelector('a');
			expect(link?.className).not.toContain('menuItemCollapsed');
		});

		it('defaults opened to true when not provided', () => {
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<RenderMenuItemWrapper
							label='Test Item'
							icon={<span data-testid='test-icon'>Icon</span>}
							to='/test'
						/>
					</MemoryRouter>
				</MantineProvider>
			);

			// Label should be visible when opened defaults to true
			expect(screen.getByText('Test Item')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has proper aria-label on navigation', () => {
			renderSidebar();

			const nav = screen.getByRole('navigation');
			expect(nav.getAttribute('aria-label')).toBe('Main navigation');
		});

		it('has proper aria-current for active links', () => {
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/campaigns']}>
						<Sidebar opened={true} />
					</MemoryRouter>
				</MantineProvider>
			);

			const activeLink = screen.getByRole('link', { name: /campaigns/i });
			expect(activeLink.getAttribute('aria-current')).toBe('page');
		});

		it('inactive links do not have aria-current', () => {
			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/campaigns']}>
						<Sidebar opened={true} />
					</MemoryRouter>
				</MantineProvider>
			);

			const inactiveLink = screen.getByRole('link', { name: /overview/i });
			expect(inactiveLink.getAttribute('aria-current')).toBeNull();
		});
	});
});

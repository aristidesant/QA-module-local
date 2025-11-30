import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, Routes, Route } from 'react-router';
import Layout from './Layout';

// Mock useScrollEffect
vi.mock('../../hooks/useScrollEffect', () => ({
	useScrollEffect: vi.fn(),
}));

// Mock Sidebar component
vi.mock('../Sidebar', () => ({
	default: ({ opened, onClose }: { opened: boolean; onClose: () => void }) => (
		<div data-testid='sidebar' data-opened={opened}>
			<button onClick={onClose} data-testid='sidebar-toggle'>
				Toggle
			</button>
		</div>
	),
}));

// Mock Header component
vi.mock('../Header', () => ({
	Header: ({ opened, toggle }: { opened: boolean; toggle: () => void }) => (
		<div data-testid='header' data-opened={opened}>
			<button onClick={toggle} data-testid='header-toggle'>
				Toggle
			</button>
		</div>
	),
}));

// Mock useImpersonationState (used by Header)
vi.mock('~/hooks/useImpersonationState', () => ({
	useImpersonationState: () => ({
		isImpersonating: false,
		originalClientId: null,
		currentClientId: null,
	}),
}));

// Mock useEndImpersonation (used by Header)
vi.mock('~/queries/authQueries', () => ({
	useEndImpersonation: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
}));

const renderLayout = () => {
	return render(
		<MantineProvider>
			<MemoryRouter initialEntries={['/']}>
				<Routes>
					<Route path='/' element={<Layout />}>
						<Route
							index
							element={<div data-testid='child-content'>Child Content</div>}
						/>
					</Route>
				</Routes>
			</MemoryRouter>
		</MantineProvider>
	);
};

describe('Layout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders the layout structure', () => {
			renderLayout();

			expect(screen.getByTestId('sidebar')).toBeInTheDocument();
			expect(screen.getByTestId('header')).toBeInTheDocument();
		});

		it('renders child routes via Outlet', () => {
			renderLayout();

			expect(screen.getByTestId('child-content')).toBeInTheDocument();
			expect(screen.getByText('Child Content')).toBeInTheDocument();
		});

		it('sidebar is expanded by default', () => {
			renderLayout();

			const sidebar = screen.getByTestId('sidebar');
			expect(sidebar).toHaveAttribute('data-opened', 'true');
		});

		it('header shows opened state by default', () => {
			renderLayout();

			const header = screen.getByTestId('header');
			expect(header).toHaveAttribute('data-opened', 'true');
		});
	});

	describe('Sidebar Toggle', () => {
		it('toggles sidebar state when sidebar toggle is clicked', () => {
			renderLayout();

			const sidebar = screen.getByTestId('sidebar');
			const sidebarToggle = screen.getByTestId('sidebar-toggle');

			expect(sidebar).toHaveAttribute('data-opened', 'true');

			fireEvent.click(sidebarToggle);

			expect(sidebar).toHaveAttribute('data-opened', 'false');
		});

		it('toggles sidebar state when header toggle is clicked', () => {
			renderLayout();

			const sidebar = screen.getByTestId('sidebar');
			const headerToggle = screen.getByTestId('header-toggle');

			expect(sidebar).toHaveAttribute('data-opened', 'true');

			fireEvent.click(headerToggle);

			expect(sidebar).toHaveAttribute('data-opened', 'false');
		});

		it('can toggle sidebar multiple times', () => {
			renderLayout();

			const sidebar = screen.getByTestId('sidebar');
			const headerToggle = screen.getByTestId('header-toggle');

			// Initial state
			expect(sidebar).toHaveAttribute('data-opened', 'true');

			// First toggle - collapse
			fireEvent.click(headerToggle);
			expect(sidebar).toHaveAttribute('data-opened', 'false');

			// Second toggle - expand
			fireEvent.click(headerToggle);
			expect(sidebar).toHaveAttribute('data-opened', 'true');

			// Third toggle - collapse again
			fireEvent.click(headerToggle);
			expect(sidebar).toHaveAttribute('data-opened', 'false');
		});
	});

	describe('Synchronized State', () => {
		it('sidebar and header share the same opened state', () => {
			renderLayout();

			const sidebar = screen.getByTestId('sidebar');
			const header = screen.getByTestId('header');
			const headerToggle = screen.getByTestId('header-toggle');

			// Both should be opened initially
			expect(sidebar).toHaveAttribute('data-opened', 'true');
			expect(header).toHaveAttribute('data-opened', 'true');

			// Toggle via header
			fireEvent.click(headerToggle);

			// Both should be closed
			expect(sidebar).toHaveAttribute('data-opened', 'false');
			expect(header).toHaveAttribute('data-opened', 'false');
		});
	});
});

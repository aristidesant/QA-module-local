import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import Layout from './Layout';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock useScrollEffect
vi.mock('../../hooks/useScrollEffect', () => ({
	useScrollEffect: vi.fn(),
}));

// Mock Sidebar component
vi.mock('../Sidebar', () => ({
	default: () => <div data-testid='sidebar'>Sidebar</div>,
}));

// Mock Header component
vi.mock('../Header', () => ({
	Header: () => <div data-testid='header'>Header</div>,
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
	return renderWithProviders(
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
	});
});

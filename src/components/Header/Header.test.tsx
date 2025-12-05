import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { Header } from './Header';

// Mock react-router
vi.mock('react-router', () => ({
	useNavigate: () => vi.fn(),
}));

// Mock session store
const mockUseSessionStore = vi.fn();
vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: () => mockUseSessionStore(),
}));

const renderHeader = () => {
	return render(
		<MantineProvider>
			<Header />
		</MantineProvider>
	);
};

describe('Header', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseSessionStore.mockReturnValue({ user: null });
	});

	describe('Rendering', () => {
		it('renders the header', () => {
			renderHeader();

			expect(screen.getByRole('banner')).toBeInTheDocument();
		});

		it('renders the notification bell icon', () => {
			renderHeader();

			// The bell icon is in an ActionIcon
			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBeGreaterThan(0);
		});
	});

	describe('Client Display', () => {
		it('does not show client badge when no client', () => {
			mockUseSessionStore.mockReturnValue({ user: null });
			renderHeader();

			expect(screen.queryByText(/client/i)).not.toBeInTheDocument();
		});

		it('shows client badge when user has a client', () => {
			const mockUser = {
				id: 1,
				email: 'test@example.com',
				username: 'tester',
				clientId: 2,
				client: {
					id: 2,
					name: 'Acme Corporation',
					identifier: 'acme',
					email: 'info@acme.com',
				},
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
				status: 'active',
			} as any;
			mockUseSessionStore.mockReturnValue({ user: mockUser });

			renderHeader();

			expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /return to master client/i })
			).not.toBeInTheDocument();
		});
	});
});

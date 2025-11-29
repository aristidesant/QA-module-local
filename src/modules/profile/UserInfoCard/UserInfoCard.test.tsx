import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { UserInfoCard } from './UserInfoCard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSessionStore } from '~/stores/sessionStore';

// Mock dependencies
vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: vi.fn(),
}));

vi.mock('~/components/RightSectionCard/RightSectionCard', () => ({
	RightSectionCard: ({ title, children }: any) => (
		<div data-testid='RightSectionCard'>
			<h2>{title}</h2>
			{children}
		</div>
	),
}));

const renderWithProviders = (ui: React.ReactElement) => {
	return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('UserInfoCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders nothing if user is not logged in', () => {
		(useSessionStore as any).mockReturnValue({ user: null });
		renderWithProviders(<UserInfoCard />);
		// Component returns null, so RightSectionCard should not be rendered
		expect(screen.queryByTestId('RightSectionCard')).not.toBeInTheDocument();
	});

	it('renders user info correctly when user is logged in', () => {
		const mockUser = {
			firstName: 'John',
			lastName: 'Doe',
			username: 'johndoe',
			email: 'john@example.com',
			clientId: '12345',
			createdAt: '2023-01-01T00:00:00.000Z',
			mfaEnabled: true,
		};
		(useSessionStore as any).mockReturnValue({ user: mockUser });

		renderWithProviders(<UserInfoCard />);

		expect(screen.getByText('User Profile')).toBeInTheDocument();
		expect(screen.getByText('JD')).toBeInTheDocument(); // Initials
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('@johndoe')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
		expect(screen.getByText('#12345')).toBeInTheDocument();
		expect(screen.getByText('MFA Enabled')).toBeInTheDocument();
	});

	it('renders correctly with only username', () => {
		const mockUser = {
			username: 'johndoe',
			email: 'john@example.com',
			clientId: '12345',
			createdAt: '2023-01-01T00:00:00.000Z',
			mfaEnabled: false,
		};
		(useSessionStore as any).mockReturnValue({ user: mockUser });

		renderWithProviders(<UserInfoCard />);

		expect(screen.getByText('JO')).toBeInTheDocument(); // Initials from username
		expect(screen.getByText('johndoe')).toBeInTheDocument();
		expect(screen.queryByText('@johndoe')).not.toBeInTheDocument(); // Shouldn't show @username if it's the main display
		expect(screen.getByText('MFA Disabled')).toBeInTheDocument();
	});

	it('handles invalid date gracefully', () => {
		const mockUser = {
			username: 'johndoe',
			email: 'john@example.com',
			clientId: '12345',
			createdAt: 'invalid-date',
			mfaEnabled: false,
		};
		(useSessionStore as any).mockReturnValue({ user: mockUser });
		renderWithProviders(<UserInfoCard />);
		// Invalid date should render as "Invalid Date" from JS Date API
		expect(screen.getByText('Invalid Date')).toBeInTheDocument();
	});
});

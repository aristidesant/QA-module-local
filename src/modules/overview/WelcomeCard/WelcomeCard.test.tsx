import { screen } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import WelcomeCard from './WelcomeCard';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { MemoryRouter } from 'react-router';

// Mock hooks
vi.mock('~/hooks/useIsMasterClient', () => ({
	useIsMasterClient: vi.fn(),
}));
vi.mock('~/hooks/useImpersonationState', () => ({
	useImpersonationState: vi.fn(),
}));
vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: vi.fn(),
}));

import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { useSessionStore } from '~/stores/sessionStore';

// Mock child components (simple structure so we can assert on DOM)
vi.mock('./CampaignStatusCard', () => ({
	__esModule: true,
	default: () => <div data-testid='campaign-status-card'>Campaign status</div>,
}));

vi.mock('./DispositionChart', () => ({
	__esModule: true,
	default: () => <div data-testid='disposition-chart'>Disposition Chart</div>,
}));

vi.mock('./StatsCard', () => ({
	__esModule: true,
	default: () => <div data-testid='stats-card'>Stats</div>,
}));

vi.mock('./ClientList', () => ({
	__esModule: true,
	default: () => <div data-testid='client-list'>Client list</div>,
}));

vi.mock('./ClientSearchBox', () => ({
	__esModule: true,
	default: () => <div data-testid='client-search'>Client Search</div>,
}));

describe('WelcomeCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders default welcome section when not master client', () => {
		vi.mocked(useIsMasterClient).mockReturnValue(false);
		vi.mocked(useImpersonationState).mockReturnValue({
			isImpersonating: false,
		} as any);
		vi.mocked(useSessionStore).mockReturnValue({
			user: { clientId: 42 },
		} as any);

		renderWithProviders(
			<MemoryRouter>
				<WelcomeCard />
			</MemoryRouter>
		);

		// default heading and subheading
		expect(screen.getByText('Overview')).toBeInTheDocument();
		expect(
			screen.getByText('Your AI-powered call center management platform')
		).toBeInTheDocument();

		// Welcome card content
		expect(
			screen.getByText('Welcome to your AI Call Center Platform')
		).toBeInTheDocument();
		// Ensure navigation buttons text exist
		expect(screen.getByText('Campaigns')).toBeInTheDocument();
		expect(screen.getByText('Agents')).toBeInTheDocument();
		expect(screen.getByText('Contacts')).toBeInTheDocument();
		expect(screen.getByText('Conversations')).toBeInTheDocument();
		expect(screen.getByText('Outcomes')).toBeInTheDocument();
		expect(screen.getByText('Tools')).toBeInTheDocument();
	});

	it('renders master dashboard when in master client and not impersonating', () => {
		vi.mocked(useIsMasterClient).mockReturnValue(true);
		vi.mocked(useImpersonationState).mockReturnValue({
			isImpersonating: false,
		} as any);
		vi.mocked(useSessionStore).mockReturnValue({
			user: { clientId: 99 },
		} as any);

		renderWithProviders(
			<MemoryRouter>
				<WelcomeCard heading='Overview' subheading='Global Snapshot' />
			</MemoryRouter>
		);

		// dashboard components visible
		expect(screen.getByTestId('campaign-status-card')).toBeInTheDocument();
		expect(screen.getByTestId('disposition-chart')).toBeInTheDocument();
		expect(screen.getByTestId('stats-card')).toBeInTheDocument();

		// Client details header should show user.clientId
		expect(screen.getByText(/Client details overview 99/i)).toBeInTheDocument();
		expect(screen.getByText('Global Snapshot')).toBeInTheDocument();
	});

	it('displays impersonation welcome heading when impersonating and targetClient provided', () => {
		vi.mocked(useIsMasterClient).mockReturnValue(false);
		vi.mocked(useImpersonationState).mockReturnValue({
			isImpersonating: true,
		} as any);
		vi.mocked(useSessionStore).mockReturnValue({
			targetClient: { id: 200, name: 'Acme Corp' },
			user: { clientId: 100 },
		} as any);

		renderWithProviders(
			<MemoryRouter>
				<WelcomeCard />
			</MemoryRouter>
		);

		expect(screen.getByText('Welcome to Acme Corp')).toBeInTheDocument();
		expect(
			screen.getByText('Your AI-powered call center management platform')
		).toBeInTheDocument();
	});
});

export {};

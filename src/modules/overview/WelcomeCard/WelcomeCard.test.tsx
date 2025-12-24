import { screen } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import WelcomeCard from './WelcomeCard';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => {
			if (key === 'welcomeBackHeading')
				return `Welcome back, ${options?.name}!`;
			if (key === 'impersonationHeading') return `Welcome to ${options?.name}`;
			if (key === 'defaultHeading') return 'The Future of AI Voice';
			if (key === 'defaultSubheading')
				return 'Scale your business with intelligent conversational agents';
			if (key === 'impersonationSubheading')
				return 'Your AI-powered destination for seamless voice automation and customer engagement.';
			if (key === 'features.smartCampaigns.title') return 'Smart Campaigns';
			if (key === 'features.aiAgents.title') return 'AI Digital Agents';
			if (key === 'features.interactionHub.title') return 'Interaction Hub';
			if (key === 'features.seamlessTools.title') return 'Seamless Tools';
			if (key === 'features.activeContacts.title') return 'Active Contacts';
			if (key === 'features.growthAnalytics.title') return 'Growth Analytics';
			return key;
		},
	}),
}));

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
			user: { clientId: 42, firstName: 'User' },
		} as any);

		renderWithProviders(<WelcomeCard />);

		// default title and description are present
		expect(screen.getByText('Welcome back, User!')).toBeInTheDocument();
		expect(
			screen.getByText(
				/Scale your business with intelligent conversational agents/
			)
		).toBeInTheDocument();

		// Welcome card content is rendered through heading/subheading above
		// Ensure feature cards text exist
		expect(screen.getByText('Smart Campaigns')).toBeInTheDocument();
		expect(screen.getByText('AI Digital Agents')).toBeInTheDocument();
		expect(screen.getByText('Interaction Hub')).toBeInTheDocument();
		expect(screen.getByText('Seamless Tools')).toBeInTheDocument();
		expect(screen.getByText('Active Contacts')).toBeInTheDocument();
		expect(screen.getByText('Growth Analytics')).toBeInTheDocument();
	});

	it('renders master dashboard when in master client and not impersonating', () => {
		vi.mocked(useIsMasterClient).mockReturnValue(true);
		vi.mocked(useImpersonationState).mockReturnValue({
			isImpersonating: false,
		} as any);
		vi.mocked(useSessionStore).mockReturnValue({
			user: { clientId: 99, firstName: 'Admin' },
		} as any);

		renderWithProviders(<WelcomeCard />);

		// dashboard components visible

		// For master client, heading should reflect client details
		expect(screen.getByText('Welcome back, Admin!')).toBeInTheDocument();
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

		renderWithProviders(<WelcomeCard />);

		// When impersonating, the main title and description update
		expect(screen.getByText('Welcome to Acme Corp')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Your AI-powered destination for seamless voice automation and customer engagement.'
			)
		).toBeInTheDocument();
	});
});

export {};

import { screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AssignedAgents from './AssignedAgents';

const { mockUseGetCampaignAgents, mockUseCampaignsStore } = vi.hoisted(() => ({
	mockUseGetCampaignAgents: vi.fn(),
	mockUseCampaignsStore: vi.fn(),
}));

vi.mock('~/queries/campaignAgentsQueries', () => ({
	useGetCampaignAgents: (...args: unknown[]) =>
		mockUseGetCampaignAgents(...args),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (
		selector: (s: { selectedCampaign: { id: number } | null }) => any
	) => mockUseCampaignsStore(selector),
}));

vi.mock('./AssignedAgentCard', () => ({
	__esModule: true,
	default: ({ agent }: { agent: any }) => (
		<span>{`AssignedAgent-${agent.id}`}</span>
	),
}));

describe('AssignedAgents', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({ selectedCampaign: { id: 1 } })
		);
	});

	it('renders loading skeleton when loading', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: undefined,
			isLoading: true,
		});
		renderWithProviders(<AssignedAgents />);
		expect(screen.getAllByText(/Loading agent/i).length).toBeGreaterThan(0);
	});

	it('renders assigned agents when data is present', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: [{ id: 1 } as any, { id: 2 } as any],
			isLoading: false,
		});
		renderWithProviders(<AssignedAgents />);
		expect(screen.getByText('AssignedAgent-1')).toBeInTheDocument();
		expect(screen.getByText('AssignedAgent-2')).toBeInTheDocument();
	});

	it('renders empty state when no agents', () => {
		mockUseGetCampaignAgents.mockReturnValue({ data: [], isLoading: false });
		renderWithProviders(<AssignedAgents />);
		expect(screen.getByText('No agents assigned yet')).toBeInTheDocument();
	});
});

export {};

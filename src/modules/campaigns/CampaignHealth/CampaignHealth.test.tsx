import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CampaignHealth from './CampaignHealth';
import { useGetCampaignRequirements } from '~/queries/campaignsQueries';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock the query hook
vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaignRequirements: vi.fn(),
}));

describe('CampaignHealth', () => {
	const mockCampaignId = '123';

	it('renders loading state', () => {
		(useGetCampaignRequirements as any).mockReturnValue({
			isLoading: true,
		});

		renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
		expect(screen.getByText('Loading campaign health...')).toBeInTheDocument();
	});

	it('renders error state', () => {
		(useGetCampaignRequirements as any).mockReturnValue({
			isLoading: false,
			error: new Error('Failed'),
		});

		renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
		expect(
			screen.getByText('Failed to load campaign requirements.')
		).toBeInTheDocument();
	});

	it('renders no data state', () => {
		(useGetCampaignRequirements as any).mockReturnValue({
			isLoading: false,
			data: null,
		});

		renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
		expect(
			screen.getByText('No requirements data available.')
		).toBeInTheDocument();
	});

	it('renders healthy campaign state', () => {
		(useGetCampaignRequirements as any).mockReturnValue({
			isLoading: false,
			data: {
				canRun: true,
				campaignType: 'OUTBOUND',
				missingRequirements: [],
			},
		});

		renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
		expect(screen.getByText('Overall status')).toBeInTheDocument();
		expect(screen.getByText('Campaign type: OUTBOUND')).toBeInTheDocument();
		expect(screen.getByText('Ready to Run')).toBeInTheDocument();
	});

	it('renders unhealthy campaign state with missing requirements', () => {
		(useGetCampaignRequirements as any).mockReturnValue({
			isLoading: false,
			data: {
				canRun: false,
				campaignType: 'INBOUND',
				missingRequirements: ['Missing phone number', 'Missing script'],
			},
		});

		renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
		expect(screen.getByText('Not Ready')).toBeInTheDocument();
		expect(screen.getByText('Missing requirements')).toBeInTheDocument();
		expect(screen.getByText('Missing phone number')).toBeInTheDocument();
		expect(screen.getByText('Missing script')).toBeInTheDocument();
	});
});

import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CampaignsDetails } from './CampaignsDetails';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock the useGetCampaign hook
vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaign: vi.fn(),
}));

// Mock the SectionCard component
vi.mock('~/components/SectionCard', () => ({
	default: ({ title, description, children }: any) => (
		<div data-testid='section-card'>
			<h1>{title}</h1>
			<p>{description}</p>
			{children}
		</div>
	),
}));

// Mock the InformationDetails component
vi.mock('~/components/ui/InformationDetails/InformationDetails', () => ({
	InformationDetails: ({ label, value }: any) => (
		<div data-testid='information-details'>
			<span>{label}:</span>
			<span>{value}</span>
		</div>
	),
}));

describe('CampaignsDetails', () => {
	const mockCampaignId = '123';

	it('renders loading state correctly', () => {
		(useGetCampaign as any).mockReturnValue({
			data: null,
			isLoading: true,
			isFetching: false,
		});

		renderWithProviders(<CampaignsDetails campaignId={mockCampaignId} />);

		expect(screen.getByText('Loading Campaign Details...')).toBeInTheDocument();
		expect(
			screen.getByText('Fetching campaign details, please wait...')
		).toBeInTheDocument();
	});

	it('renders not found state correctly', () => {
		(useGetCampaign as any).mockReturnValue({
			data: null,
			isLoading: false,
			isFetching: false,
		});

		renderWithProviders(<CampaignsDetails campaignId={mockCampaignId} />);

		expect(screen.getByText('Campaign Not Found')).toBeInTheDocument();
		expect(
			screen.getByText('The requested campaign does not exist.')
		).toBeInTheDocument();
	});

	it('renders campaign details correctly', () => {
		const mockCampaign = {
			id: '123',
			name: 'Test Campaign',
			description: 'Test Description',
			status: 'ACTIVE',
			type: 'OUTBOUND',
			budget: 1000,
			spent: 500,
			userId: 'user1',
			clientId: 'client1',
			createdAt: '2023-01-01T00:00:00Z',
			updatedAt: '2023-01-02T00:00:00Z',
			tags: ['tag1', 'tag2'],
		};

		(useGetCampaign as any).mockReturnValue({
			data: mockCampaign,
			isLoading: false,
			isFetching: false,
		});

		renderWithProviders(<CampaignsDetails campaignId={mockCampaignId} />);

		expect(screen.getByText('Test Campaign Details')).toBeInTheDocument();
		expect(screen.getByText('Test Description')).toBeInTheDocument();
		expect(screen.getByText('Type:')).toBeInTheDocument();
		expect(screen.getByText('OUTBOUND')).toBeInTheDocument();
		expect(screen.getByText('Budget:')).toBeInTheDocument();
		expect(screen.getByText('$1,000')).toBeInTheDocument();
		expect(screen.getByText('Spent:')).toBeInTheDocument();
		expect(screen.getByText('$500')).toBeInTheDocument();
		expect(screen.getByText('tag1')).toBeInTheDocument();
		expect(screen.getByText('tag2')).toBeInTheDocument();
	});

	it('handles missing campaign data gracefully', () => {
		const mockCampaign = {
			id: '123',
			name: 'Test Campaign',
			// Missing description, budget, spent, etc.
		};

		(useGetCampaign as any).mockReturnValue({
			data: mockCampaign,
			isLoading: false,
			isFetching: false,
		});

		renderWithProviders(<CampaignsDetails campaignId={mockCampaignId} />);

		expect(screen.getByText('Test Campaign Details')).toBeInTheDocument();
		expect(screen.getByText('No description available')).toBeInTheDocument();
		expect(screen.getByText('Budget:')).toBeInTheDocument();
		expect(screen.getAllByText('-').length).toBeGreaterThan(0);
	});
});

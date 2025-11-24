import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampaignLiveMetricPage } from './CampaignLiveMetricPage';
import {
	useGetCampaign,
	useGetCampaignLiveMetrics,
} from '~/queries/campaignsQueries';
import { useNavigate, useParams } from 'react-router';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock dependencies
vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaign: vi.fn(),
	useGetCampaignLiveMetrics: vi.fn(),
}));

vi.mock('react-router', () => ({
	useNavigate: vi.fn(),
	useParams: vi.fn(),
}));

vi.mock('~/components/ContentContainer', () => ({
	ContentContainer: ({ title, description, children, onBackClick }: any) => (
		<div data-testid='content-container'>
			<h1>{title}</h1>
			<p>{description}</p>
			{onBackClick && <button onClick={onBackClick}>Back</button>}
			{children}
		</div>
	),
}));

vi.mock('~/components/SectionCard', () => ({
	SectionCard: ({ title, children, headerActions }: any) => (
		<div data-testid='section-card'>
			<h2>{title}</h2>
			<div>{headerActions}</div>
			{children}
		</div>
	),
}));

vi.mock('./components/MetricInfoCard', () => ({
	MetricInfoCard: ({ label, value }: any) => (
		<div data-testid='metric-card'>
			<span>{label}:</span>
			<span>{value}</span>
		</div>
	),
}));

describe('CampaignLiveMetricPage', () => {
	const mockNavigate = vi.fn();
	const mockCampaignId = '123';

	beforeEach(() => {
		vi.clearAllMocks();
		(useNavigate as any).mockReturnValue(mockNavigate);
		(useParams as any).mockReturnValue({ campaignId: mockCampaignId });
	});

	it('renders loading state', () => {
		(useGetCampaign as any).mockReturnValue({
			isLoading: true,
		});
		(useGetCampaignLiveMetrics as any).mockReturnValue({
			data: null,
		});

		renderWithProviders(<CampaignLiveMetricPage />);
		expect(screen.getByText('Loading Campaign...')).toBeInTheDocument();
	});

	it('renders error state', () => {
		(useGetCampaign as any).mockReturnValue({
			isLoading: false,
			isError: true,
			error: new Error('Failed to load'),
		});
		(useGetCampaignLiveMetrics as any).mockReturnValue({
			data: null,
		});

		renderWithProviders(<CampaignLiveMetricPage />);
		expect(screen.getByText('Error Loading Campaign')).toBeInTheDocument();
		expect(screen.getByText('Failed to load')).toBeInTheDocument();
	});

	it('renders campaign metrics correctly', () => {
		const mockCampaign = { id: mockCampaignId, name: 'Test Campaign' };
		const mockMetrics = {
			campaign: 'Test Campaign',
			aht: '5m 30s',
			calls: {
				total: 100,
				contactable: 60,
				non_contactable: 40,
			},
			percentages: {
				contactable: '60%',
				non_contactable: '40%',
			},
		};

		(useGetCampaign as any).mockReturnValue({
			data: mockCampaign,
			isLoading: false,
			isError: false,
		});
		(useGetCampaignLiveMetrics as any).mockReturnValue({
			data: mockMetrics,
		});

		renderWithProviders(<CampaignLiveMetricPage />);

		expect(screen.getAllByText('Test Campaign')[0]).toBeInTheDocument();
		expect(screen.getByText('Campaign Live Metrics')).toBeInTheDocument();

		// Check metrics
		expect(screen.getByText('Average Handle Time:')).toBeInTheDocument();
		expect(screen.getByText('5m 30s')).toBeInTheDocument();
		expect(screen.getByText('Total Calls:')).toBeInTheDocument();
		expect(screen.getByText('100')).toBeInTheDocument();
	});

	it('handles back navigation', () => {
		const mockCampaign = { id: mockCampaignId, name: 'Test Campaign' };

		(useGetCampaign as any).mockReturnValue({
			data: mockCampaign,
			isLoading: false,
		});
		(useGetCampaignLiveMetrics as any).mockReturnValue({
			data: null,
		});

		renderWithProviders(<CampaignLiveMetricPage />);

		fireEvent.click(screen.getByText('Back'));
		expect(mockNavigate).toHaveBeenCalledWith('/campaigns');
	});
});

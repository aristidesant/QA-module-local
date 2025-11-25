import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNavigate } from 'react-router';
import CampaignHealth from './CampaignHealth';
import { useGetCampaignRequirements } from '~/queries/campaignsQueries';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock dependencies
vi.mock('react-router', () => ({
	useNavigate: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaignRequirements: vi.fn(),
}));

describe('CampaignHealth', () => {
	const mockCampaignId = '123';
	const mockNavigate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
	});

	describe('Loading state', () => {
		it('renders loading indicator and text', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: true,
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
			expect(
				screen.getByText('Loading campaign health...')
			).toBeInTheDocument();
		});
	});

	describe('Error state', () => {
		it('renders error alert', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				error: new Error('Failed'),
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
			expect(
				screen.getByText('Failed to load campaign requirements.')
			).toBeInTheDocument();
		});
	});

	describe('No data state', () => {
		it('renders nothing when data is null', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				data: null,
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			// Component should not render any meaningful content
			expect(screen.queryByText('Disposition Flow')).not.toBeInTheDocument();
			expect(screen.queryByText('Active Schedule')).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /go to edit/i })
			).not.toBeInTheDocument();
		});
	});

	describe('Healthy campaign state', () => {
		it('renders nothing when all requirements are met', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				data: {
					hasDispositionFlow: true,
					hasActiveSchedule: true,
				},
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			// Component should not render any meaningful content when healthy
			expect(screen.queryByText('Disposition Flow')).not.toBeInTheDocument();
			expect(screen.queryByText('Active Schedule')).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /go to edit/i })
			).not.toBeInTheDocument();
		});
	});

	describe('Missing requirements', () => {
		it('shows disposition flow warning when not configured', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				data: {
					hasDispositionFlow: false,
					hasActiveSchedule: true,
				},
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			expect(screen.getByText('Disposition Flow')).toBeInTheDocument();
			expect(screen.getByText('Not configured')).toBeInTheDocument();
			expect(screen.queryByText('Active Schedule')).not.toBeInTheDocument();
		});

		it('shows active schedule warning when not active', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				data: {
					hasDispositionFlow: true,
					hasActiveSchedule: false,
				},
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			expect(screen.getByText('Active Schedule')).toBeInTheDocument();
			expect(screen.getByText('Not active')).toBeInTheDocument();
			expect(screen.queryByText('Disposition Flow')).not.toBeInTheDocument();
		});

		it('shows both warnings when both requirements are missing', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				data: {
					hasDispositionFlow: false,
					hasActiveSchedule: false,
				},
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			expect(screen.getByText('Disposition Flow')).toBeInTheDocument();
			expect(screen.getByText('Not configured')).toBeInTheDocument();
			expect(screen.getByText('Active Schedule')).toBeInTheDocument();
			expect(screen.getByText('Not active')).toBeInTheDocument();
		});

		it('shows "Go to edit" button and navigates on click', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				data: {
					hasDispositionFlow: false,
					hasActiveSchedule: false,
				},
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			const editButton = screen.getByRole('button', { name: /go to edit/i });
			expect(editButton).toBeInTheDocument();

			fireEvent.click(editButton);
			expect(mockNavigate).toHaveBeenCalledWith(`/campaign/${mockCampaignId}`);
		});
	});
});

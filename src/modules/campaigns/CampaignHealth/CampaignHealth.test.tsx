import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignHealth from './CampaignHealth';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

const { mockNavigate, mockUseGetCampaignRequirements, mockCanPerformAction } =
	vi.hoisted(() => ({
		mockNavigate: vi.fn(),
		mockUseGetCampaignRequirements: vi.fn(),
		mockCanPerformAction: vi.fn(),
	}));

// Mock dependencies
vi.mock('react-router', () => ({
	useNavigate: () => mockNavigate,
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaignRequirements: mockUseGetCampaignRequirements,
}));

// Mock usePermissions so we can control edit visibility in tests
vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));

describe('CampaignHealth', () => {
	const mockCampaignId = '123';

	beforeEach(() => {
		vi.clearAllMocks();
		mockCanPerformAction.mockReturnValue(false);
	});

	describe('Loading state', () => {
		it('renders loading indicator and text', () => {
			mockUseGetCampaignRequirements.mockReturnValue({
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
			mockUseGetCampaignRequirements.mockReturnValue({
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
			mockUseGetCampaignRequirements.mockReturnValue({
				isLoading: false,
				data: null,
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			// Component should not render any meaningful content
			expect(screen.queryByText('Disposition Flow')).not.toBeInTheDocument();
			expect(screen.queryByText('Active Schedule')).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /Go to edit/i })
			).not.toBeInTheDocument();
		});
	});

	describe('Healthy campaign state', () => {
		it('renders nothing when all requirements are met', () => {
			mockUseGetCampaignRequirements.mockReturnValue({
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
				screen.queryByRole('button', { name: /Go to edit/i })
			).not.toBeInTheDocument();
		});
	});

	describe('Missing requirements', () => {
		it('shows disposition flow warning when not configured', () => {
			mockUseGetCampaignRequirements.mockReturnValue({
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
			mockUseGetCampaignRequirements.mockReturnValue({
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
			mockUseGetCampaignRequirements.mockReturnValue({
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
			mockUseGetCampaignRequirements.mockReturnValue({
				isLoading: false,
				data: {
					hasDispositionFlow: false,
					hasActiveSchedule: false,
				},
			});

			// Grant permission for edit
			mockCanPerformAction.mockReturnValue(true);
			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			const editButton = screen.getByRole('button', {
				name: /Go to edit/i,
			});
			expect(editButton).toBeInTheDocument();

			fireEvent.click(editButton);
			expect(mockNavigate).toHaveBeenCalledWith(`/campaign/${mockCampaignId}`);
		});

		it('does not show "Go to edit" button when user lacks permission', () => {
			mockCanPerformAction.mockReturnValue(false);
			mockUseGetCampaignRequirements.mockReturnValue({
				isLoading: false,
				data: {
					hasDispositionFlow: false,
					hasActiveSchedule: false,
				},
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			expect(
				screen.queryByRole('button', { name: /Go to edit/i })
			).not.toBeInTheDocument();
		});
	});
});

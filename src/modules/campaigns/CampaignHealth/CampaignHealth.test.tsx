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

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaignRequirements: vi.fn(),
}));

// Mock usePermissions so we can control edit visibility in tests
const mockCanPerformAction = vi.fn((_module: any, _permission: any) => false);
vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));

describe('CampaignHealth', () => {
	const mockCampaignId = '123';
	const mockNavigate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
		mockCanPerformAction.mockReturnValue(false);
	});

	describe('Loading state', () => {
		it('renders loading indicator and text', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: true,
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
			expect(screen.getByText('health.loading')).toBeInTheDocument();
		});
	});

	describe('Error state', () => {
		it('renders error alert', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				error: new Error('Failed'),
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);
			expect(screen.getByText('health.failedToLoad')).toBeInTheDocument();
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
			expect(
				screen.queryByText('health.dispositionFlow')
			).not.toBeInTheDocument();
			expect(
				screen.queryByText('health.activeSchedule')
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /health.goToEdit/i })
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
			expect(
				screen.queryByText('health.dispositionFlow')
			).not.toBeInTheDocument();
			expect(
				screen.queryByText('health.activeSchedule')
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /health.goToEdit/i })
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

			expect(screen.getByText('health.dispositionFlow')).toBeInTheDocument();
			expect(screen.getByText('health.notConfigured')).toBeInTheDocument();
			expect(
				screen.queryByText('health.activeSchedule')
			).not.toBeInTheDocument();
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

			expect(screen.getByText('health.activeSchedule')).toBeInTheDocument();
			expect(screen.getByText('health.notActive')).toBeInTheDocument();
			expect(
				screen.queryByText('health.dispositionFlow')
			).not.toBeInTheDocument();
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

			expect(screen.getByText('health.dispositionFlow')).toBeInTheDocument();
			expect(screen.getByText('health.notConfigured')).toBeInTheDocument();
			expect(screen.getByText('health.activeSchedule')).toBeInTheDocument();
			expect(screen.getByText('health.notActive')).toBeInTheDocument();
		});

		it('shows "Go to edit" button and navigates on click', () => {
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
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
				name: /health.goToEdit/i,
			});
			expect(editButton).toBeInTheDocument();

			fireEvent.click(editButton);
			expect(mockNavigate).toHaveBeenCalledWith(`/campaign/${mockCampaignId}`);
		});

		it('does not show "Go to edit" button when user lacks permission', () => {
			mockCanPerformAction.mockReturnValue(false);
			(useGetCampaignRequirements as ReturnType<typeof vi.fn>).mockReturnValue({
				isLoading: false,
				data: {
					hasDispositionFlow: false,
					hasActiveSchedule: false,
				},
			});

			renderWithProviders(<CampaignHealth campaignId={mockCampaignId} />);

			expect(
				screen.queryByRole('button', { name: /health.goToEdit/i })
			).not.toBeInTheDocument();
		});
	});
});

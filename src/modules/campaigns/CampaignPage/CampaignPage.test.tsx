import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignPage from './CampaignPage';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useNavigate, useParams } from 'react-router';

vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaign: vi.fn(),
}));

const mockUsePermissions = vi.fn();
vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canPerformAction: mockUsePermissions,
	}),
}));

vi.mock('react-router', () => ({
	useNavigate: vi.fn(),
	useParams: vi.fn(),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn(),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, _options?: any) => key,
	}),
}));

vi.mock('../CampaignsForm/CampaignsForm', () => ({
	CampaignsForm: ({ campaign, onBack }: any) => (
		<div>
			<div data-testid='campaigns-form'>Campaign Form: {campaign?.name}</div>
			<button data-testid='campaign-form-back' onClick={onBack}>
				Back
			</button>
		</div>
	),
}));

describe('CampaignPage', () => {
	const mockNavigate = vi.fn();
	const mockSelectCampaign = vi.fn();
	const mockResetView = vi.fn();
	const mockSetEditCampaign = vi.fn();
	const mockSetSelectedTab = vi.fn();
	const mockSetRightComponent = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useNavigate as any).mockReturnValue(mockNavigate);
		(useParams as any).mockReturnValue({ campaignId: '1' });
		(useCampaignsStore as any).mockImplementation((selector: any) => {
			const state = {
				selectedCampaign: null,
				selectCampaign: mockSelectCampaign,
				resetView: mockResetView,
				setEditCampaign: mockSetEditCampaign,
				setSelectedTab: mockSetSelectedTab,
				setRightComponent: mockSetRightComponent,
			};
			return selector ? selector(state) : state;
		});

		// default: allow access unless a test overrides it
		(mockUsePermissions as any).mockReturnValue(true);
	});

	it('renders loading state', () => {
		(useGetCampaign as any).mockReturnValue({ isLoading: true });
		(mockUsePermissions as any).mockReturnValue(true);
		renderWithProviders(<CampaignPage />);
		expect(screen.getByText('page.loadingTitle')).toBeInTheDocument();
	});

	it('renders error state', () => {
		(useGetCampaign as any).mockReturnValue({
			isLoading: false,
			isError: true,
			error: new Error('Failed to fetch'),
		});
		(mockUsePermissions as any).mockReturnValue(true);
		renderWithProviders(<CampaignPage />);
		expect(screen.getByText('page.errorTitle')).toBeInTheDocument();
		expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
	});

	it('renders form and navigates back', () => {
		const mockCampaign = { id: '1', name: 'My Campaign' } as any;
		(useGetCampaign as any).mockReturnValue({
			isLoading: false,
			data: mockCampaign,
		});
		(mockUsePermissions as any).mockReturnValue(true);

		renderWithProviders(<CampaignPage />);

		expect(screen.getByTestId('campaigns-form')).toBeInTheDocument();
		expect(screen.getByText('Campaign Form: My Campaign')).toBeInTheDocument();

		const backButton = screen.getByTestId('campaign-form-back');
		fireEvent.click(backButton);
		expect(mockNavigate).toHaveBeenCalledWith('/campaigns');
	});

	it('selects campaign on initial load', () => {
		const mockCampaign = { id: '1', name: 'My Campaign' } as any;
		(useGetCampaign as any).mockReturnValue({
			isLoading: false,
			data: mockCampaign,
		});
		(mockUsePermissions as any).mockReturnValue(true);

		renderWithProviders(<CampaignPage />);

		expect(mockSelectCampaign).toHaveBeenCalledWith(mockCampaign);
	});

	it('refreshes selected campaign when store has stale/partial data', () => {
		const mockCampaign = {
			id: '1',
			name: 'Updated Campaign',
			updatedAt: '2024-01-01T00:00:00Z',
		} as any;

		// Simulate existing partial campaign in store (missing updatedAt)
		(useCampaignsStore as any).mockImplementationOnce((selector: any) => {
			const state = {
				selectedCampaign: { id: '1', name: 'Old Campaign' },
				selectCampaign: mockSelectCampaign,
				resetView: mockResetView,
				setEditCampaign: mockSetEditCampaign,
				setSelectedTab: mockSetSelectedTab,
				setRightComponent: mockSetRightComponent,
			};
			return selector ? selector(state) : state;
		});

		(useGetCampaign as any).mockReturnValue({
			isLoading: false,
			data: mockCampaign,
		});
		(mockUsePermissions as any).mockReturnValue(true);

		renderWithProviders(<CampaignPage />);

		expect(mockSelectCampaign).toHaveBeenCalledWith(mockCampaign);
	});

	it('shows AccessDenied when user lacks edit permission', () => {
		(mockUsePermissions as any).mockReturnValue(false);
		(useGetCampaign as any).mockReturnValue({
			isLoading: false,
			data: undefined,
		});

		renderWithProviders(<CampaignPage />);

		expect(
			screen.getAllByText('accessDenied.description', { ns: 'common' } as any)
				.length
		).toBeGreaterThan(0);
		expect(
			screen.getByRole('button', { name: /common.goToHome/i })
		).toBeInTheDocument();
	});
});

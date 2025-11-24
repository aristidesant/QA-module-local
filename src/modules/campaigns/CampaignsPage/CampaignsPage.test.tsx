import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignsPage from './CampaignsPage';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock dependencies
vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaign: vi.fn(),
}));

vi.mock('../CampaignsList', () => ({
	default: () => <div data-testid='campaigns-list'>Campaigns List</div>,
}));

vi.mock('../CampaignsForm/CampaignsForm', () => ({
	CampaignsForm: ({ campaign }: any) => (
		<div data-testid='campaigns-form'>Campaign Form: {campaign.name}</div>
	),
}));

describe('CampaignsPage', () => {
	const mockSelectCampaign = vi.fn();
	const mockResetView = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useCampaignsStore as any).mockImplementation((selector: any) => {
			const state = {
				selectedCampaign: null,
				editCampaign: false,
				resetView: mockResetView,
				selectCampaign: mockSelectCampaign,
			};
			return selector ? selector(state) : state;
		});
		(useGetCampaign as any).mockReturnValue({ data: null });
	});

	it('renders CampaignsList by default', () => {
		renderWithProviders(<CampaignsPage />);
		expect(screen.getByTestId('campaigns-list')).toBeInTheDocument();
	});

	it('renders CampaignsForm when editCampaign is true and campaign data is available', () => {
		const mockCampaign = { id: '123', name: 'Test Campaign' };

		(useCampaignsStore as any).mockImplementation((selector: any) => {
			const state = {
				selectedCampaign: mockCampaign,
				editCampaign: true,
				resetView: mockResetView,
				selectCampaign: mockSelectCampaign,
			};
			return selector ? selector(state) : state;
		});

		(useGetCampaign as any).mockReturnValue({ data: mockCampaign });

		renderWithProviders(<CampaignsPage />);
		expect(screen.getByTestId('campaigns-form')).toBeInTheDocument();
		expect(
			screen.getByText('Campaign Form: Test Campaign')
		).toBeInTheDocument();
	});

	it('syncs fetched campaign to store when it changes', () => {
		const mockCampaign = { id: '123', name: 'Updated Campaign' };

		(useCampaignsStore as any).mockImplementation((selector: any) => {
			const state = {
				selectedCampaign: { id: '123' }, // Matches ID but maybe old data
				editCampaign: false,
				resetView: mockResetView,
				selectCampaign: mockSelectCampaign,
			};
			return selector ? selector(state) : state;
		});

		(useGetCampaign as any).mockReturnValue({ data: mockCampaign });

		renderWithProviders(<CampaignsPage />);
		expect(mockSelectCampaign).toHaveBeenCalledWith(mockCampaign);
	});

	it('resets view on unmount', () => {
		const { unmount } = renderWithProviders(<CampaignsPage />);
		unmount();
		expect(mockResetView).toHaveBeenCalled();
	});
});

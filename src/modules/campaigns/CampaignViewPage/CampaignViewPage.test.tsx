import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignViewPage from './CampaignViewPage';
import { useNavigate, useParams } from 'react-router';
import {
	useGetCampaign,
	useGetCampaignRequirements,
} from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';

vi.mock('react-router', () => ({
	useNavigate: vi.fn(),
	useParams: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaign: vi.fn(),
	useGetCampaignRequirements: vi.fn(),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn(),
}));

// Mock usePermissions so edit button visibility can be controlled
const mockCanPerformAction = vi.fn((_module: any, _permission: any) => true);
vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));

vi.mock('../CampaignsForm/ContactSection', () => ({
	ContactSection: () => <div data-testid='contact-section' />,
}));

vi.mock('../CampaignHealth', () => ({
	__esModule: true,
	default: ({ campaignId }: any) => (
		<div data-testid='campaign-health'>health-{campaignId}</div>
	),
}));

describe('CampaignViewPage', () => {
	const navigate = vi.fn();
	const selectCampaign = vi.fn();
	const resetView = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useNavigate as unknown as Mock).mockReturnValue(navigate);
		(useParams as unknown as Mock).mockReturnValue({ campaignId: '1' });
		(useCampaignsStore as unknown as Mock).mockImplementation((selector: any) =>
			selector({
				selectCampaign,
				resetView,
				rightComponent: undefined,
			})
		);
		(useGetCampaignRequirements as unknown as Mock).mockReturnValue({
			data: { canRun: 'yes' },
		});
		mockCanPerformAction.mockReturnValue(true);
	});

	it('renders missing campaign state when id is absent', () => {
		(useParams as unknown as Mock).mockReturnValue({});
		(useGetCampaign as unknown as Mock).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
			error: null,
		});

		renderWithProviders(<CampaignViewPage />);

		expect(screen.getByText('Missing campaign')).toBeInTheDocument();
		expect(navigate).not.toHaveBeenCalled();
	});

	it('renders loading state while fetching campaign', () => {
		(useGetCampaign as unknown as Mock).mockReturnValue({
			isLoading: true,
			data: undefined,
			isError: false,
			error: null,
		});

		renderWithProviders(<CampaignViewPage />);

		expect(screen.getByText('Loading campaign...')).toBeInTheDocument();
	});

	it('renders error state when campaign fetch fails', () => {
		(useGetCampaign as unknown as Mock).mockReturnValue({
			isLoading: false,
			isError: true,
			error: new Error('Boom'),
			data: undefined,
		});

		renderWithProviders(<CampaignViewPage />);

		expect(screen.getByText('Campaign unavailable')).toBeInTheDocument();
		expect(screen.getByText('Boom')).toBeInTheDocument();
	});

	it('renders campaign details and handles interactions', async () => {
		const user = userEvent.setup();
		const campaign = {
			id: 1,
			name: 'Campaign Alpha',
			description: 'desc',
		};
		(useGetCampaign as unknown as Mock).mockReturnValue({
			isLoading: false,
			isError: false,
			error: null,
			data: campaign,
		});

		const { unmount } = renderWithProviders(<CampaignViewPage />);

		expect(screen.getByText('Campaign Alpha')).toBeInTheDocument();
		expect(screen.getByTestId('contact-section')).toBeInTheDocument();
		expect(screen.getByTestId('campaign-health')).toHaveTextContent('health-1');
		expect(selectCampaign).toHaveBeenCalledWith(campaign);

		await user.click(screen.getByRole('button', { name: 'Edit Campaign' }));
		expect(navigate).toHaveBeenCalledWith('/campaign/1');

		unmount();
		expect(resetView).toHaveBeenCalled();
	});

	it('does not show edit action when user lacks Campaign/Update permission', () => {
		(useGetCampaign as unknown as Mock).mockReturnValue({
			isLoading: false,
			isError: false,
			error: null,
			data: { id: 1, name: 'Campaign Alpha' },
		});

		mockCanPerformAction.mockReturnValue(false);

		renderWithProviders(<CampaignViewPage />);
		expect(
			screen.queryByRole('button', { name: 'Edit Campaign' })
		).not.toBeInTheDocument();
	});
});

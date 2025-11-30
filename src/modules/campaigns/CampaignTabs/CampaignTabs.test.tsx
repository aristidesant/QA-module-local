import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignTabs from './CampaignTabs';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn(),
}));

vi.mock('~/hooks/useDispositionLabel', () => ({
	useDispositionLabel: vi.fn(),
}));

describe('CampaignTabs', () => {
	const setSelectedTab = vi.fn();
	const setRightComponent = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useCampaignsStore as unknown as Mock).mockImplementation((selector: any) =>
			selector({
				selectedTab: 'agents',
				setSelectedTab,
				setRightComponent,
			})
		);
		(useDispositionLabel as unknown as Mock).mockReturnValue(
			(label: string) => `Custom ${label}`
		);
	});

	it('renders tabs with custom disposition label', () => {
		renderWithProviders(<CampaignTabs />);

		expect(screen.getByRole('tab', { name: 'Agents' })).toBeInTheDocument();
		expect(
			screen.getByRole('tab', { name: 'Custom Outcomes' })
		).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Params' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument();
	});

	it('updates selected tab and clears right component when changed', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CampaignTabs />);

		await user.click(screen.getByRole('tab', { name: 'Custom Outcomes' }));

		expect(setSelectedTab).toHaveBeenCalledWith('outcomes');
		expect(setRightComponent).toHaveBeenCalledWith(undefined);
	});
});

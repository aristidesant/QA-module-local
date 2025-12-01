import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AgentSection from './AgentSection';

const mockSetRightComponent = vi.fn();

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (selector: any = (state: any) => state) =>
		selector({ setRightComponent: mockSetRightComponent }),
}));

vi.mock('./AgentCampaignList', () => ({
	default: () => <div>AgentCampaignListMock</div>,
}));

vi.mock('./CampaignConfigurationBasic/CampaignConfigurationBasic', () => ({
	default: () => <div>CampaignConfigurationBasicMock</div>,
}));

vi.mock('./CampaignConfigurationPrompt/CampaignConfigurationPrompt', () => ({
	default: () => <div>CampaignConfigurationPromptMock</div>,
}));

vi.mock('./CampaignConfigurationTools/CampaignConfigurationTools', () => ({
	default: () => <div>CampaignConfigurationToolsMock</div>,
}));

vi.mock(
	'./CampaignConfigurationSystemTools/CampaignConfigurationSystemTools',
	() => ({
		default: () => <div>CampaignConfigurationSystemToolsMock</div>,
	})
);

vi.mock(
	'./CampaignConfigurationKnowledgeBase/CampaignConfigurationKnowledgeBase',
	() => ({
		default: () => <div>CampaignConfigurationKnowledgeBaseMock</div>,
	})
);

vi.mock(
	'./CampaignConfigurationPredefinedParams/CampaignConfigurationPredefinedParams',
	() => ({
		default: () => <div>CampaignConfigurationPredefinedParamsMock</div>,
	})
);

describe('AgentSection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders all configuration sections and save button', () => {
		renderWithProviders(<AgentSection />);

		expect(screen.getByText('CampaignConfigurationBasicMock')).toBeVisible();
		expect(screen.getByText('CampaignConfigurationPromptMock')).toBeVisible();
		expect(screen.getByText('CampaignConfigurationToolsMock')).toBeVisible();
		expect(
			screen.getByText('CampaignConfigurationSystemToolsMock')
		).toBeVisible();
		expect(
			screen.getByText('CampaignConfigurationKnowledgeBaseMock')
		).toBeVisible();
		expect(
			screen.getByText('CampaignConfigurationPredefinedParamsMock')
		).toBeVisible();
		expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
	});

	it('sets the right component to the agent campaign list on mount', () => {
		renderWithProviders(<AgentSection />);

		expect(mockSetRightComponent).toHaveBeenCalledTimes(1);
		expect(mockSetRightComponent.mock.calls[0][0]).toBeTruthy();
	});
});

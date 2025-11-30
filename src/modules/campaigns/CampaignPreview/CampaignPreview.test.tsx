import { screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CampaignStatus } from '~/models/CampaignStatus';
import type { Campaign } from '~/models/CampaignsModel';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignPreview from './CampaignPreview';

const mockCampaignOverview = vi.fn();
const mockContactOutcomeSummary = vi.fn();
const mockCampaignParameters = vi.fn();
const mockAssignedAgents = vi.fn();
const mockCleanQueueButton = vi.fn();

vi.mock('./CampaignOverview', () => ({
	__esModule: true,
	default: (props: unknown) => {
		mockCampaignOverview(props);
		return <div data-testid='campaign-overview'>Campaign Overview</div>;
	},
}));

vi.mock('./CampaignContactOutcomeSummary', () => ({
	__esModule: true,
	default: (props: unknown) => {
		mockContactOutcomeSummary(props);
		return <div data-testid='campaign-contact-summary'>Contact Summary</div>;
	},
}));

vi.mock('./CampaignParameters', () => ({
	__esModule: true,
	default: (props: unknown) => {
		mockCampaignParameters(props);
		return <div data-testid='campaign-parameters'>Parameters</div>;
	},
}));

vi.mock('./AssignedAgents', () => ({
	__esModule: true,
	default: (props: unknown) => {
		mockAssignedAgents(props);
		return <div data-testid='assigned-agents'>Assigned Agents</div>;
	},
}));

vi.mock('./CleanQueueButton', () => ({
	__esModule: true,
	default: (props: unknown) => {
		mockCleanQueueButton(props);
		return <div data-testid='clean-queue-button'>Clean Queue</div>;
	},
}));

const baseCampaign: Campaign = {
	id: 1,
	name: 'Test Campaign',
	agentName: 'Test Agent',
	description: 'Test description',
	budget: 1000,
	configId: 'cfg-1',
	spent: 0,
	type: 'INBOUND',
	status: CampaignStatus.RUNNING,
	userId: 1,
	clientId: 1,
	createdAt: '2024-01-01T00:00:00.000Z',
	updatedAt: '2024-01-01T00:00:00.000Z',
	contactList: {
		id: 99,
		name: 'Contact List',
		totalContacts: 10,
	},
};

describe('CampaignPreview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders overview for inbound campaigns and always renders other sections', () => {
		renderWithProviders(<CampaignPreview campaign={baseCampaign} />);

		expect(screen.getByTestId('campaign-overview')).toBeInTheDocument();
		expect(screen.getByTestId('campaign-contact-summary')).toBeInTheDocument();
		expect(screen.getByTestId('campaign-parameters')).toBeInTheDocument();
		expect(screen.getByTestId('assigned-agents')).toBeInTheDocument();
		expect(screen.getByTestId('clean-queue-button')).toBeInTheDocument();

		expect(mockCampaignOverview).toHaveBeenCalledWith(
			expect.objectContaining({ campaign: baseCampaign })
		);
		expect(mockContactOutcomeSummary).toHaveBeenCalledWith(
			expect.objectContaining({ campaign: baseCampaign })
		);
	});

	it('omits overview for outbound campaigns', () => {
		renderWithProviders(
			<CampaignPreview campaign={{ ...baseCampaign, type: 'OUTBOUND' }} />
		);

		expect(screen.queryByTestId('campaign-overview')).not.toBeInTheDocument();
		expect(screen.getByTestId('campaign-contact-summary')).toBeInTheDocument();
	});

	it('forwards campaign ids to clean queue button', () => {
		renderWithProviders(<CampaignPreview campaign={baseCampaign} />);

		expect(mockCleanQueueButton).toHaveBeenCalledWith(
			expect.objectContaining({
				campaignId: baseCampaign.id,
				contactGroupId: baseCampaign.contactList?.id,
				fullWidth: true,
			})
		);
	});
});

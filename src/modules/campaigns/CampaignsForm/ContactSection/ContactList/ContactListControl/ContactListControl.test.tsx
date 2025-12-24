import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContactListControl from './ContactListControl';
import renderWithProviders from '~/test-utils/renderWithProviders';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import type ContactGroup from '~/models/ContactGroup';

const mockCanPerformAction = vi.fn();

vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));

const mockStartMutation = { mutate: vi.fn(), isPending: false };
const mockPauseMutation = { mutate: vi.fn(), isPending: false };
const mockResumeMutation = { mutate: vi.fn(), isPending: false };
const mockUseGetCampaignRequirements = vi.fn();

vi.mock('~/queries/campaignsQueries', () => ({
	useStartOutboundCampaign: () => mockStartMutation,
	usePauseOutboundCampaign: () => mockPauseMutation,
	useResumeOutboundCampaign: () => mockResumeMutation,
	useGetCampaignRequirements: (campaignId: string) =>
		mockUseGetCampaignRequirements(campaignId) ?? {
			data: { hasDispositionFlow: true, hasActiveSchedule: true },
		},
}));

vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

const baseContactGroup: ContactGroup = {
	id: 1,
	name: 'Test group',
	description: 'Group for testing',
	campaignId: 7,
	createdAt: '2024-01-01T00:00:00Z',
	scheduleId: 3,
	queueStatus: 'PENDING',
	isActive: true,
	contactCount: 10,
	expirationDate: '2024-12-31T00:00:00Z',
	maxCallsPerContact: 1,
	maxCallsPerList: 1,
	humanEquivalent: 1,
};

beforeEach(() => {
	vi.clearAllMocks();
	mockCanPerformAction.mockReturnValue(true);
	mockUseGetCampaignRequirements.mockReturnValue({
		data: { hasDispositionFlow: true, hasActiveSchedule: true },
	});
});

describe('ContactListControl', () => {
	it('hides action icon when user lacks execute permission', () => {
		mockCanPerformAction.mockReturnValue(false);

		renderWithProviders(<ContactListControl contactGroup={baseContactGroup} />);

		expect(
			screen.queryByRole('button', { name: /contact list/i })
		).not.toBeInTheDocument();
		expect(mockCanPerformAction).toHaveBeenCalledWith(
			ModuleEnum.CAMPAIGNS,
			PermissionEnum.EXECUTE
		);
	});

	it('renders light variant action icon when permitted', () => {
		renderWithProviders(<ContactListControl contactGroup={baseContactGroup} />);

		const actionButton = screen.getByRole('button', {
			name: 'campaigns.form.contacts.controls.start',
		});

		expect(actionButton).toHaveAttribute('data-variant', 'light');
		expect(mockUseGetCampaignRequirements).toHaveBeenCalledWith(
			baseContactGroup.campaignId.toString()
		);
	});
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { notifications } from '@mantine/notifications';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CloneCampaignForm from './CloneCampaignForm';
import { useCloneCampaign } from '~/queries/campaignsQueries';
import type { Campaign } from '~/models/CampaignsModel';

vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useCloneCampaign: vi.fn(),
}));

describe('CloneCampaignForm', () => {
	const baseCampaign: Campaign = {
		id: 123,
		name: 'Starter Campaign',
		agentName: 'Agent Root',
		description: 'A sample description',
		budget: 0,
		configId: 'cfg',
		spent: 0,
		type: 'OUTBOUND',
		status: 'draft' as any,
		userId: 1,
		clientId: 1,
		createdAt: '',
		updatedAt: '',
		agents: [
			{
				id: 1,
				campaignId: 123,
				agentId: 'a1',
				agent: { name: 'Agent One', status: 'active', language: 'en' },
				userId: 1,
				clientId: 1,
				createdAt: '',
				updatedAt: '',
			},
			{
				id: 2,
				campaignId: 123,
				agentId: 'a2',
				agent: { name: 'Agent Two', status: 'active', language: 'en' },
				userId: 1,
				clientId: 1,
				createdAt: '',
				updatedAt: '',
			},
		],
	} as Campaign;

	const mutateMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mutateMock.mockImplementation((_payload, { onSuccess }: any) =>
			onSuccess?.()
		);
		(useCloneCampaign as unknown as Mock).mockReturnValue({
			mutate: mutateMock,
			isPending: false,
			isError: false,
			error: null,
		});
	});

	it('renders prefilled form values and agent list', () => {
		renderWithProviders(<CloneCampaignForm campaign={baseCampaign} />);

		expect(
			screen.getByDisplayValue('Copy of Starter Campaign')
		).toBeInTheDocument();
		expect(
			screen.getByDisplayValue('A sample description')
		).toBeInTheDocument();
		expect(screen.getByText('Agent One')).toBeInTheDocument();
		expect(screen.getByText('Agent Two')).toBeInTheDocument();
		expect(screen.getByText('2 / 2 selected')).toBeInTheDocument();
	});

	it('prevents submission when no agents are selected', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CloneCampaignForm campaign={baseCampaign} />);

		const checkboxes = screen.getAllByRole('checkbox');
		for (const checkbox of checkboxes) {
			await user.click(checkbox);
		}

		await user.click(screen.getByRole('button', { name: /clone campaign/i }));

		expect(mutateMock).not.toHaveBeenCalled();

		// We now surface agent validation errors inline (Alert) rather than using notifications
		expect(
			screen.getByText('At least one agent must be selected')
		).toBeInTheDocument();
	});

	it('submits selected agents and calls completion handlers', async () => {
		const user = userEvent.setup();
		const onComplete = vi.fn();
		renderWithProviders(
			<CloneCampaignForm campaign={baseCampaign} onComplete={onComplete} />
		);

		const firstAgentInput = screen.getAllByPlaceholderText('New agent name')[0];
		await user.clear(firstAgentInput);
		await user.type(firstAgentInput, 'Duplicated Agent One');

		await user.click(screen.getByRole('button', { name: /clone campaign/i }));

		expect(mutateMock).toHaveBeenCalledWith(
			{
				campaignId: '123',
				data: {
					name: 'Copy of Starter Campaign',
					description: 'A sample description',
					agentsToDuplicate: [
						{ agentId: 'a1', newName: 'Duplicated Agent One' },
						{ agentId: 'a2', newName: 'Copy of Agent Two' },
					],
				},
			},
			expect.objectContaining({
				onSuccess: expect.any(Function),
				onError: expect.any(Function),
			})
		);
		expect(notifications.show).toHaveBeenCalledWith({
			title: 'Campaign Cloned',
			message: 'The campaign has been successfully cloned.',
			color: 'green',
		});
		expect(onComplete).toHaveBeenCalled();
	});

	it('displays API error message in notification when clone fails', async () => {
		const serverMessage =
			'Agent name conflict: the following name(s) already exist: Copy of Element. Please choose different names for duplication.';

		const user = userEvent.setup();

		mutateMock.mockImplementation((_payload, { onError }: any) => {
			onError?.({ response: { data: { message: serverMessage } } });
		});

		(useCloneCampaign as unknown as Mock).mockReturnValue({
			mutate: mutateMock,
			isPending: false,
			isError: false,
			error: null,
		});

		renderWithProviders(<CloneCampaignForm campaign={baseCampaign} />);

		await user.click(screen.getByRole('button', { name: /clone campaign/i }));

		// server message should be shown in notification
		expect(notifications.show).toHaveBeenCalledWith({
			title: 'Error',
			message: serverMessage,
			color: 'red',
		});
	});
});

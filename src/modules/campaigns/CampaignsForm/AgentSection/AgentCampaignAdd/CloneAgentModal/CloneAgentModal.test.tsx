import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notifications } from '@mantine/notifications';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CloneAgentModal from './CloneAgentModal';
import * as agentQueries from '~/queries/agentQueries';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';

vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

const mockClose = vi.fn();
vi.mock('@mantine/modals', () => ({
	modals: { close: (...args: any[]) => mockClose(...args) },
}));

const mutateAsyncMock = vi.fn();
const defaultHookMock = {
	mutateAsync: mutateAsyncMock,
	isPending: false,
	error: null,
};

vi.mock('~/queries/agentQueries', () => ({
	useDuplicateAgent: vi.fn(() => defaultHookMock),
}));

describe('CloneAgentModal', () => {
	const agent: AgentWithCampaignListItem = {
		id: 'a1',
		name: 'Agent One',
		language: 'en',
		status: 'active',
		createdAt: '',
		updatedAt: '',
		campaignCount: 0,
	} as any;

	beforeEach(() => {
		vi.clearAllMocks();
		mutateAsyncMock.mockReset();
		(agentQueries.useDuplicateAgent as any).mockReturnValue(defaultHookMock);
	});

	it('renders with default name and shows UI elements', () => {
		renderWithProviders(<CloneAgentModal agent={agent} onSuccess={vi.fn()} />);

		// initial input contains "Copy"
		expect(screen.getByDisplayValue(/Agent One.*Copy/i)).toBeInTheDocument();
		expect(screen.getByLabelText('Agent Name')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Clone' })).toBeInTheDocument();
	});

	it('validates and prevents submission when empty', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CloneAgentModal agent={agent} onSuccess={vi.fn()} />);

		const input = screen.getByLabelText('Agent Name');
		await user.clear(input);
		await user.click(screen.getByRole('button', { name: 'Clone' }));

		expect(await screen.findByText('Name is required')).toBeInTheDocument();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	it('validates when name equals original', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CloneAgentModal agent={agent} onSuccess={vi.fn()} />);

		// set name exactly equal to agent.name
		const input = screen.getByLabelText('Agent Name');
		await user.clear(input);
		await user.type(input, 'Agent One');
		await user.click(screen.getByRole('button', { name: 'Clone' }));

		expect(
			await screen.findByText(
				'The new name must be different from the original agent name'
			)
		).toBeInTheDocument();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	it('submits successfully and calls onSuccess, notifications, and modal close', async () => {
		const onSuccess = vi.fn();
		mutateAsyncMock.mockResolvedValue({});

		renderWithProviders(
			<CloneAgentModal agent={agent} onSuccess={onSuccess} />
		);
		const user = userEvent.setup();

		// Submit with default name
		await user.click(screen.getByRole('button', { name: 'Clone' }));

		await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());
		expect(mockClose).toHaveBeenCalledWith('clone-agent-modal');
		expect(notifications.show).toHaveBeenCalledWith({
			title: 'Success',
			message: 'Agent cloned successfully',
			color: 'green',
		});
		expect(onSuccess).toHaveBeenCalled();
	});

	it('shows notification with API error message when mutateAsync rejects with axios error', async () => {
		const axiosLikeError = {
			isAxiosError: true,
			response: { data: { message: 'Detailed API error' } },
		};
		mutateAsyncMock.mockRejectedValue(axiosLikeError);

		renderWithProviders(<CloneAgentModal agent={agent} onSuccess={vi.fn()} />);
		const user = userEvent.setup();

		await user.click(screen.getByRole('button', { name: 'Clone' }));

		await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error',
				message: 'Detailed API error',
				color: 'red',
			})
		);
	});

	it('displays duplicateMutation.error message when hook returns an error', () => {
		// Make the hook return an error synchronously
		const hook = agentQueries;
		const errorObj = {
			isAxiosError: true,
			response: { data: { message: 'Blocked' } },
		};
		(hook.useDuplicateAgent as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
			error: errorObj,
		});

		renderWithProviders(<CloneAgentModal agent={agent} onSuccess={vi.fn()} />);

		expect(screen.getByText('Blocked')).toBeInTheDocument();
	});

	it('closes modal when Cancel button is clicked', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CloneAgentModal agent={agent} onSuccess={vi.fn()} />);

		await user.click(screen.getByRole('button', { name: /Cancel/i }));

		expect(mockClose).toHaveBeenCalledWith('clone-agent-modal');
	});

	it('disables input and buttons when mutation is loading', async () => {
		(agentQueries.useDuplicateAgent as any).mockReturnValue({
			...defaultHookMock,
			isPending: true,
		});

		renderWithProviders(<CloneAgentModal agent={agent} onSuccess={vi.fn()} />);

		expect(screen.getByLabelText('Agent Name')).toBeDisabled();
		expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Clone' })).toHaveAttribute(
			'data-loading',
			'true'
		);
	});

	it('submits with trimmed name and calls onSuccess', async () => {
		const onSuccess = vi.fn();
		mutateAsyncMock.mockResolvedValue({});

		renderWithProviders(
			<CloneAgentModal agent={agent} onSuccess={onSuccess} />
		);
		const user = userEvent.setup();

		const input = screen.getByLabelText('Agent Name');
		await user.clear(input);
		await user.type(input, '  New Agent Name  ');
		await user.click(screen.getByRole('button', { name: 'Clone' }));

		await waitFor(() =>
			expect(mutateAsyncMock).toHaveBeenCalledWith({
				agentId: 'a1',
				data: { name: 'New Agent Name' },
			})
		);
		expect(onSuccess).toHaveBeenCalled();
	});

	it('shows generic error message for non-axios errors', async () => {
		const genericError = new Error('Network error');
		mutateAsyncMock.mockRejectedValue(genericError);

		renderWithProviders(<CloneAgentModal agent={agent} onSuccess={vi.fn()} />);
		const user = userEvent.setup();

		await user.click(screen.getByRole('button', { name: 'Clone' }));

		await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error',
				message: 'Failed to clone agent',
				color: 'red',
			})
		);
	});

	it('does not call onSuccess on error', async () => {
		const onSuccess = vi.fn();
		mutateAsyncMock.mockRejectedValue(new Error('Error'));

		renderWithProviders(
			<CloneAgentModal agent={agent} onSuccess={onSuccess} />
		);
		const user = userEvent.setup();

		await user.click(screen.getByRole('button', { name: 'Clone' }));

		await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());
		expect(onSuccess).not.toHaveBeenCalled();
	});
});

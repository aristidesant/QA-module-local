import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CleanQueueButton from './CleanQueueButton';
import { useCleanOutboundQueue } from '~/queries/outboundQueries';

vi.mock('~/queries/outboundQueries', () => ({
	useCleanOutboundQueue: vi.fn(),
}));

describe('CleanQueueButton', () => {
	const mutate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useCleanOutboundQueue as unknown as Mock).mockReturnValue({
			mutate,
			isPending: false,
		});
	});

	it('disables the action when contact group is missing', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CleanQueueButton campaignId={5} />);

		const button = screen.getByRole('button', {
			name: /preview\.cleanQueue\.cleanQueueConfirm/i,
		});
		expect(button).toBeDisabled();

		await user.click(button);
		expect(mutate).not.toHaveBeenCalled();
	});

	it('calls mutate with ids when valid', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<CleanQueueButton campaignId={7} contactGroupId={11} />
		);

		await user.click(
			screen.getByRole('button', {
				name: /preview\.cleanQueue\.cleanQueueConfirm/i,
			})
		);

		expect(mutate).toHaveBeenCalledWith({
			campaignId: 7,
			contactGroupId: 11,
		});
	});

	it('remains disabled while request is pending', () => {
		(useCleanOutboundQueue as unknown as Mock).mockReturnValue({
			mutate,
			isPending: true,
		});

		renderWithProviders(
			<CleanQueueButton campaignId={7} contactGroupId={11} />
		);

		expect(
			screen.getByRole('button', {
				name: /preview\.cleanQueue\.cleanQueueConfirm/i,
			})
		).toBeDisabled();
	});
});

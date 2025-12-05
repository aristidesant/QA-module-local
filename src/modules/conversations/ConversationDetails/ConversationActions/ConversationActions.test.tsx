import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ConversationActions from './ConversationActions';
import { modals } from '@mantine/modals';
import {
	useFailAndPauseConversation,
	useFetchAndProcessConversation,
} from '~/queries/conversationsQueries';
import usePermissions from '~/hooks/usePermissions';

vi.mock('~/queries/conversationsQueries', () => ({
	useFailAndPauseConversation: vi.fn(),
	useFetchAndProcessConversation: vi.fn(),
}));

vi.mock('~/hooks/usePermissions', () => ({
	default: vi.fn(),
}));

describe('ConversationActions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders Reprocess Event for initiated status', async () => {
		(useFailAndPauseConversation as unknown as any).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		(useFetchAndProcessConversation as unknown as any).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => true,
		});

		renderWithProviders(
			<ConversationActions
				conversation={{ id: 1, status: 'initiated' } as any}
			/>
		);

		expect(screen.getByText('Reprocess Event')).toBeInTheDocument();
	});

	it('renders Fetch and Process for non-initiated status', () => {
		(useFailAndPauseConversation as unknown as any).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		(useFetchAndProcessConversation as unknown as any).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => true,
		});

		renderWithProviders(
			<ConversationActions conversation={{ id: 2, status: 'failed' } as any} />
		);

		expect(screen.getByText('Fetch and Process')).toBeInTheDocument();
	});

	it('opens confirm modal on button click', async () => {
		const mockOpenConfirm = vi
			.spyOn(modals, 'openConfirmModal' as any)
			.mockImplementation(() => undefined);
		(useFailAndPauseConversation as unknown as any).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		(useFetchAndProcessConversation as unknown as any).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => true,
		});

		const user = userEvent.setup();
		renderWithProviders(
			<ConversationActions conversation={{ id: 3, status: 'failed' } as any} />
		);

		const button = screen.getByRole('button');
		await user.click(button);
		expect(mockOpenConfirm).toHaveBeenCalled();
	});
});

export {};

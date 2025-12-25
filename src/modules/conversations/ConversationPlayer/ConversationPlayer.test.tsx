import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ConversationPlayer from './ConversationPlayer';
import { useExportConversationAudio } from '~/queries/conversationsQueries';
import { useConversationStore } from '~/stores/useConversationStore';
import usePermissions from '~/hooks/usePermissions';

vi.mock('~/queries/conversationsQueries', () => ({
	useExportConversationAudio: vi.fn(),
}));

vi.mock('~/stores/useConversationStore', () => ({
	useConversationStore: vi.fn(),
}));

vi.mock('~/hooks/usePermissions', () => ({
	default: vi.fn(),
}));

describe('ConversationPlayer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders empty state when no file available', () => {
		(useConversationStore as unknown as any).mockReturnValue({
			selectedId: null,
		});
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => false,
		});
		const mockExport = { mutateAsync: vi.fn(), isPending: false };
		(useExportConversationAudio as unknown as any).mockReturnValue(mockExport);

		renderWithProviders(<ConversationPlayer />);

		expect(screen.getByText('Conversation not available')).toBeInTheDocument();
	});

	it('shows audio controls and download button when file and permission available', async () => {
		const mockExport = {
			mutateAsync: vi.fn().mockResolvedValue(new Blob(['audio'])),
			isPending: false,
		};
		(useExportConversationAudio as unknown as any).mockReturnValue(mockExport);
		(useConversationStore as unknown as any).mockReturnValue({
			selectedId: '123',
		});
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => true,
		});

		renderWithProviders(
			<ConversationPlayer
				voiceFile={
					{
						id: 1,
						repositoryRoute: 'https://example.com/audio.mp3',
					} as unknown as any
				}
				contactName={'John Doe'}
			/>
		);

		const playButton = screen.getByLabelText('Play');
		expect(playButton).toBeInTheDocument();

		const download = screen.getByRole('button', {
			name: 'Download Audio',
		});
		expect(download).toBeInTheDocument();
	});
});

export {};

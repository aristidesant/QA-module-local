import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import PromptHistoryModal from './PromptHistoryModal';

const sampleItem = {
	id: 1,
	campaignId: 1,
	userId: 2,
	version: 2,
	promptText: 'Old prompt text',
	agentConfig: { conversationConfig: { agent: { prompt: { prompt: '' } } } },
	clientId: 1,
	createdAt: '2024-01-01T00:00:00.000Z',
	comment: '',
	campaign: { id: 1, name: 'Campaign' },
	user: { id: 2, username: 'Alice' },
};

describe('PromptHistoryModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders prompt text when no currentPromptText is provided', () => {
		renderWithProviders(
			<PromptHistoryModal
				item={sampleItem as any}
				onRestore={() => {}}
				onClose={() => {}}
			/>
		);

		expect(screen.getByText('Old prompt text')).toBeInTheDocument();
		expect(screen.getByText('Modified By')).toBeInTheDocument();
		expect(screen.getByText('Alice')).toBeInTheDocument();
	});

	it('shows no-changes alert when current prompt is identical', () => {
		renderWithProviders(
			<PromptHistoryModal
				item={sampleItem as any}
				currentPromptText={sampleItem.promptText}
				onRestore={() => {}}
				onClose={() => {}}
			/>
		);

		expect(screen.getByText('No Changes')).toBeInTheDocument();
		expect(
			screen.getByText(/This version is identical to the current prompt/i)
		).toBeInTheDocument();
	});

	it('renders diff view when currentPromptText differs and calls handlers', async () => {
		const mockOnRestore = vi.fn();
		const mockOnClose = vi.fn();

		renderWithProviders(
			<PromptHistoryModal
				item={sampleItem as any}
				currentPromptText={'New prompt text'}
				onRestore={mockOnRestore}
				onClose={mockOnClose}
			/>
		);

		expect(screen.getByText(/Previous Version/)).toBeInTheDocument();
		expect(screen.getByText(/Current Version/)).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: /Close/i }));
		expect(mockOnClose).toHaveBeenCalled();

		await user.click(
			screen.getByRole('button', { name: /Restore This Version/i })
		);
		expect(mockOnRestore).toHaveBeenCalledWith(sampleItem.promptText);
	});
});

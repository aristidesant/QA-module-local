import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import PromptHistoryModal from './PromptHistoryModal';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => {
			if (options) {
				// Handle interpolation
				return key.replace(
					/\{\{(\w+)\}\}/g,
					(match, p1) => options[p1] || match
				);
			}
			return key;
		},
	}),
}));

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
		expect(screen.getByText('promptHistory.modifiedBy')).toBeInTheDocument();
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

		expect(screen.getByText('promptHistory.noChanges')).toBeInTheDocument();
		expect(
			screen.getByText(/promptHistory\.noChangesDesc/i)
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

		expect(
			screen.getByText(/promptHistory\.previousVersion/)
		).toBeInTheDocument();
		expect(
			screen.getByText(/promptHistory\.currentVersion/)
		).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(
			screen.getByRole('button', { name: /promptHistory\.close/i })
		);
		expect(mockOnClose).toHaveBeenCalled();

		await user.click(
			screen.getByRole('button', { name: /promptHistory\.restoreVersion/i })
		);
		expect(mockOnRestore).toHaveBeenCalledWith(sampleItem.promptText);
	});
});

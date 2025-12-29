import { screen } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import ConversationPage from './ConversationPage';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock the conversation store hook
vi.mock('~/stores/useConversationStore', () => ({
	useConversationStore: vi.fn(),
}));

// Mock child component to avoid complex data fetching in the list
vi.mock('~/modules/conversations/ConversationsList', () => ({
	__esModule: true,
	default: () => <div data-testid='conversations-list' />,
}));

import { useConversationStore } from '~/stores/useConversationStore';

describe('ConversationPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders fallback right component when no selection content', () => {
		vi.mocked(useConversationStore).mockReturnValue({
			selectionContent: null,
			clearSelection: vi.fn(),
		} as any);

		renderWithProviders(<ConversationPage />);

		expect(
			screen.getByText(
				'No conversation selected. Choose a conversation to view transcripts, notes, and associated actions.'
			)
		).toBeInTheDocument();
		expect(screen.getByText('Nothing selected')).toBeInTheDocument();
	});

	it('renders selectionContent when provided', () => {
		vi.mocked(useConversationStore).mockReturnValue({
			selectionContent: <div>Selected Content</div>,
			clearSelection: vi.fn(),
		} as any);

		renderWithProviders(<ConversationPage />);

		expect(screen.getByText('Selected Content')).toBeInTheDocument();
		expect(
			screen.queryByText(
				'No conversation selected. Choose a conversation to view transcripts, notes, and associated actions.'
			)
		).not.toBeInTheDocument();
	});

	it('calls clearSelection when unmounted', () => {
		const clearMock = vi.fn();

		vi.mocked(useConversationStore).mockReturnValue({
			selectionContent: null,
			clearSelection: clearMock,
		} as any);

		const { unmount } = renderWithProviders(<ConversationPage />);
		unmount();

		expect(clearMock).toHaveBeenCalled();
	});
});

export {};

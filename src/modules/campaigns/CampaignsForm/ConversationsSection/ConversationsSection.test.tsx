import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import ConversationsSection from './ConversationsSection';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

vi.mock('~/components/SectionCard', () => ({
	__esModule: true,
	default: ({
		title,
		children,
	}: {
		title: string;
		children: React.ReactNode;
	}) => (
		<div data-testid='section-card'>
			<div>{title}</div>
			{children}
		</div>
	),
}));

vi.mock('~/modules/conversations/ConversationsList', () => ({
	__esModule: true,
	default: ({
		onConversationClick,
	}: {
		onConversationClick: (conversation: { id: string }) => void;
	}) => (
		<div data-testid='conversations-list'>
			<button
				type='button'
				onClick={() => onConversationClick({ id: 'conversation-123' })}
			>
				Open conversation
			</button>
		</div>
	),
}));

vi.mock('~/modules/conversations/ConversationDetails', () => ({
	__esModule: true,
	default: ({ id }: { id: string }) => (
		<div data-testid='conversation-details'>Detail {id}</div>
	),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn(),
}));

const mockUseCampaignsStore = useCampaignsStore as unknown as Mock;

describe('ConversationsSection', () => {
	const setRightComponent = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		setRightComponent.mockClear();
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				setRightComponent,
			})
		);
	});

	it('shows an empty state when there is no campaign id and clears the right panel', () => {
		const { unmount } = renderWithProviders(<ConversationsSection />);

		expect(screen.getByText('Conversations')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Save the campaign details to start tracking conversations.'
			)
		).toBeInTheDocument();
		expect(setRightComponent).toHaveBeenCalledWith(null);

		unmount();

		expect(setRightComponent).toHaveBeenCalledTimes(2);
		expect(setRightComponent).toHaveBeenLastCalledWith(null);
	});

	it('renders the conversations list when a campaign id is provided and opens details on click', async () => {
		const { unmount } = renderWithProviders(
			<ConversationsSection campaignId={101} />
		);
		const user = userEvent.setup();

		expect(screen.getByTestId('conversations-list')).toBeInTheDocument();
		expect(setRightComponent).toHaveBeenCalledWith(null);

		await user.click(screen.getByText('Open conversation'));

		expect(setRightComponent).toHaveBeenCalledTimes(2);
		const lastCallArgs = setRightComponent.mock.calls[1]?.[0];
		expect(lastCallArgs?.props?.id).toBe('conversation-123');

		unmount();
		expect(setRightComponent).toHaveBeenLastCalledWith(null);
	});
});

import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ConversationDetails from './ConversationDetails';
import { useGetConversation } from '~/queries/conversationsQueries';
import {
	useFailAndPauseConversation,
	useFetchAndProcessConversation,
	useExportConversationPdf,
} from '~/queries/conversationsQueries';
import usePermissions from '~/hooks/usePermissions';

vi.mock('~/queries/conversationsQueries', () => ({
	useGetConversation: vi.fn(),
	useFailAndPauseConversation: vi.fn(),
	useFetchAndProcessConversation: vi.fn(),
	useExportConversationPdf: vi.fn(),
	useExportConversationAudio: vi.fn(),
}));

vi.mock('~/hooks/usePermissions', () => ({
	default: vi.fn(),
}));

describe('ConversationDetails', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows loader when fetching', () => {
		(useGetConversation as unknown as any).mockReturnValue({
			isLoading: true,
			isFetching: false,
		});
		(usePermissions as unknown as any).mockReturnValue({
			canAccessModule: () => true,
		});

		renderWithProviders(
			<MemoryRouter>
				<ConversationDetails id={1} />
			</MemoryRouter>
		);

		// When loading, the Overview tab should not render yet
		expect(screen.queryByText('Overview')).not.toBeInTheDocument();
	});

	it('shows AccessDenied when user cannot access module', () => {
		(useGetConversation as unknown as any).mockReturnValue({
			isLoading: false,
			isFetching: false,
			data: null,
		});
		(usePermissions as unknown as any).mockReturnValue({
			canAccessModule: () => false,
		});

		renderWithProviders(
			<MemoryRouter>
				<ConversationDetails id={1} />
			</MemoryRouter>
		);

		expect(
			screen.getAllByText('You do not have permission to view conversations.')
				.length
		).toBeGreaterThan(0);
	});

	it('renders ConversationOverview when authorized and conversation data present', () => {
		const mockConversation = {
			id: '1',
			status: 'active',
			transcriptContent: { metadata: {}, transcript: [] },
		} as any;
		(useGetConversation as unknown as any).mockReturnValue({
			isLoading: false,
			isFetching: false,
			data: mockConversation,
		});
		(usePermissions as unknown as any).mockReturnValue({
			canAccessModule: () => true,
			canPerformAction: () => true,
		});
		(useFailAndPauseConversation as unknown as any).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		(useFetchAndProcessConversation as unknown as any).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		(useExportConversationPdf as unknown as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		});

		renderWithProviders(
			<MemoryRouter>
				<ConversationDetails id={1} />
			</MemoryRouter>
		);

		expect(screen.getByText('Overview')).toBeInTheDocument();
	});
});

export {};

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
import type { PermissionEvaluator } from '~/hooks/usePermissions';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const { mockUsePermissions } = vi.hoisted(() => ({
	mockUsePermissions: vi.fn<() => PermissionEvaluator>(),
}));

const buildPermissionEvaluator = (
	overrides: Partial<PermissionEvaluator> = {}
): PermissionEvaluator => ({
	activeClientId: 1,
	permissionMap: {},
	canAccessModule: () => true,
	canPerformAction: () => false,
	hasAnyPermission: () => false,
	hasAllPermissions: () => false,
	...overrides,
});

vi.mock('~/queries/conversationsQueries', () => ({
	useGetConversation: vi.fn(),
	useFailAndPauseConversation: vi.fn(),
	useFetchAndProcessConversation: vi.fn(),
	useExportConversationPdf: vi.fn(),
	useExportConversationAudio: vi.fn(),
}));

vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: mockUsePermissions,
	usePermissions: mockUsePermissions,
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
		mockUsePermissions.mockReturnValue(buildPermissionEvaluator());

		renderWithProviders(
			<MemoryRouter>
				<ConversationDetails id={1} />
			</MemoryRouter>
		);

		// When loading, the Overview tab should not render yet
		expect(screen.queryByText('details.tabs.overview')).not.toBeInTheDocument();
	});

	it('shows AccessDenied when user cannot access module', () => {
		(useGetConversation as unknown as any).mockReturnValue({
			isLoading: false,
			isFetching: false,
			data: null,
		});
		mockUsePermissions.mockReturnValue(
			buildPermissionEvaluator({
				canAccessModule: () => false,
			})
		);

		renderWithProviders(
			<MemoryRouter>
				<ConversationDetails id={1} />
			</MemoryRouter>
		);

		expect(screen.getAllByText('list.accessDenied').length).toBeGreaterThan(0);
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
		mockUsePermissions.mockReturnValue(
			buildPermissionEvaluator({
				canPerformAction: () => true,
			})
		);
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

		expect(screen.getByText('details.tabs.overview')).toBeInTheDocument();
	});
});

export {};

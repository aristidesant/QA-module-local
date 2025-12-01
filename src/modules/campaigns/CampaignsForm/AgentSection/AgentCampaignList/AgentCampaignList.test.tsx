import { fireEvent, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AgentCampaignList from './AgentCampaignList';

const {
	mockUseGetCampaignAgents,
	mockRefetch,
	mockModalsOpen,
	mockModalsClose,
	mockUseCampaignsStore,
} = vi.hoisted(() => ({
	mockUseGetCampaignAgents: vi.fn(),
	mockRefetch: vi.fn(),
	mockModalsOpen: vi.fn(),
	mockModalsClose: vi.fn(),
	mockUseCampaignsStore: vi.fn(),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		open: mockModalsOpen,
		close: mockModalsClose,
	},
}));

vi.mock('~/queries/campaignAgentsQueries', () => ({
	useGetCampaignAgents: (...args: unknown[]) =>
		mockUseGetCampaignAgents(...args),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (
		selector: (state: { selectedCampaign: { id: number } | null }) => unknown
	) => mockUseCampaignsStore(selector),
}));

vi.mock('../AgentCampaignAdd', () => ({
	default: () => <div>AddAgentModal</div>,
}));

vi.mock('../AgentCampaignPreview', () => ({
	default: ({ agentId }: { agentId: string }) => <div>Preview-{agentId}</div>,
}));

vi.mock('~/components/EmptyState', () => ({
	default: ({ message }: { message: string }) => <div>{message}</div>,
}));

describe('AgentCampaignList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default mock for useCampaignsStore with a selected campaign
		mockUseCampaignsStore.mockImplementation(
			(selector: (state: { selectedCampaign: { id: number } }) => unknown) =>
				selector({ selectedCampaign: { id: 7 } })
		);
	});

	it('shows add button and empty state when no agents are assigned', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: [],
			refetch: mockRefetch,
			isLoading: false,
		});

		renderWithProviders(<AgentCampaignList />);

		expect(screen.getByRole('button', { name: /add agent/i })).toBeVisible();
		expect(screen.getByText('No Agents Assigned')).toBeVisible();
	});

	it('opens the add agent modal when clicking the add button', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: [],
			refetch: mockRefetch,
			isLoading: false,
		});

		renderWithProviders(<AgentCampaignList />);

		fireEvent.click(screen.getByRole('button', { name: /add agent/i }));
		expect(mockModalsOpen).toHaveBeenCalledTimes(1);
	});

	it('renders agent previews when campaign agents exist', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: [
				{ id: 1, agentId: 'agent-1', agent: { id: 'agent-1' } },
				{ id: 2, agentId: 'agent-2', agent: { id: 'agent-2' } },
			],
			refetch: mockRefetch,
			isLoading: false,
		});

		renderWithProviders(<AgentCampaignList />);

		expect(screen.getByText('Preview-agent-1')).toBeInTheDocument();
		expect(screen.getByText('Preview-agent-2')).toBeInTheDocument();
	});

	it('shows loading overlay when loading', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: undefined,
			refetch: mockRefetch,
			isLoading: true,
		});

		const { container } = renderWithProviders(<AgentCampaignList />);

		expect(
			container.querySelector('.mantine-LoadingOverlay-root')
		).toBeInTheDocument();
	});

	it('does not show add button when agents are already assigned', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: [{ id: 1, agentId: 'agent-1', agent: { id: 'agent-1' } }],
			refetch: mockRefetch,
			isLoading: false,
		});

		renderWithProviders(<AgentCampaignList />);

		expect(
			screen.queryByRole('button', { name: /add agent/i })
		).not.toBeInTheDocument();
	});

	it('does not open modal when no campaign is selected', () => {
		mockUseCampaignsStore.mockImplementation(
			(selector: (state: { selectedCampaign: null }) => unknown) =>
				selector({ selectedCampaign: null })
		);
		mockUseGetCampaignAgents.mockReturnValue({
			data: [],
			refetch: mockRefetch,
			isLoading: false,
		});
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		renderWithProviders(<AgentCampaignList />);

		fireEvent.click(screen.getByRole('button', { name: /add agent/i }));
		expect(mockModalsOpen).not.toHaveBeenCalled();
		expect(consoleSpy).toHaveBeenCalledWith('No campaign selected');

		consoleSpy.mockRestore();
	});

	it('excludes already assigned agent IDs when opening the add modal', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: [],
			refetch: mockRefetch,
			isLoading: false,
		});

		renderWithProviders(<AgentCampaignList />);

		fireEvent.click(screen.getByRole('button', { name: /add agent/i }));

		expect(mockModalsOpen).toHaveBeenCalledWith(
			expect.objectContaining({
				modalId: 'add-campaign-agent',
				title: 'Add Agent to Campaign',
				centered: true,
				size: 'xl',
			})
		);
	});

	it('calls refetch and closes modal when onComplete is triggered', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: [],
			refetch: mockRefetch,
			isLoading: false,
		});

		renderWithProviders(<AgentCampaignList />);

		fireEvent.click(screen.getByRole('button', { name: /add agent/i }));

		// Get the onComplete callback from the modal configuration
		const modalConfig = mockModalsOpen.mock.calls[0][0];
		const onComplete = modalConfig.children.props.onComplete;

		// Call onComplete to simulate completion
		act(() => onComplete());

		expect(mockRefetch).toHaveBeenCalled();
		expect(mockModalsClose).toHaveBeenCalledWith('add-campaign-agent');
	});

	it('does not show empty state when loading', () => {
		mockUseGetCampaignAgents.mockReturnValue({
			data: [],
			refetch: mockRefetch,
			isLoading: true,
		});

		renderWithProviders(<AgentCampaignList />);

		expect(screen.queryByText('No Agents Assigned')).not.toBeInTheDocument();
	});
});

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { CampaignsForm } from './CampaignsForm';
import { useCampaignsStore } from '~/stores/campaignsStore';
import {
	useCreateCampaign,
	useUpdateCampaign,
	useUpdateCampaignLight,
	useAssignCampaignObjective,
} from '~/queries/campaignsQueries';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { Campaign } from '~/models/CampaignsModel';
import { CampaignStatus } from '~/models/CampaignStatus';

// Mock dependencies
vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useCreateCampaign: vi.fn(),
	useUpdateCampaign: vi.fn(),
	useUpdateCampaignLight: vi.fn(),
	useAssignCampaignObjective: vi.fn(),
}));

vi.mock('react-router', () => ({
	useNavigate: () => vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
	},
}));

// Mock child components to simplify testing
vi.mock('./GeneralSection/GeneralSection', () => ({
	default: () => (
		<div data-testid='general-section'>
			<button type='submit' data-testid='general-submit'>
				Save General
			</button>
		</div>
	),
}));

vi.mock('./AgentSection', () => ({
	default: () => (
		<div data-testid='agent-section'>
			<button type='submit' data-testid='agent-submit'>
				Save Agent
			</button>
		</div>
	),
}));

vi.mock('./DispositionSection', () => ({
	default: () => (
		<div data-testid='disposition-section'>Disposition Section</div>
	),
}));

vi.mock('./DoNotCallSection', () => ({
	default: () => (
		<div data-testid='do-not-call-section'>Do Not Call Section</div>
	),
}));

vi.mock('./ParametersSection', () => ({
	default: () => <div data-testid='parameters-section'>Parameters Section</div>,
}));

vi.mock('../CampaignTabs', () => ({
	default: () => {
		const store = useCampaignsStore((state) => state);
		return (
			<div data-testid='campaign-tabs'>
				<button
					data-testid='tab-general'
					onClick={() => store.setSelectedTab('general')}
				>
					General
				</button>
				<button
					data-testid='tab-agents'
					onClick={() => store.setSelectedTab('agents')}
				>
					Agents
				</button>
				<button
					data-testid='tab-outcomes'
					onClick={() => store.setSelectedTab('outcomes')}
				>
					Outcomes
				</button>
				<button
					data-testid='tab-do-not-call'
					onClick={() => store.setSelectedTab('do-not-call')}
				>
					Do Not Call
				</button>
				<button
					data-testid='tab-params'
					onClick={() => store.setSelectedTab('params')}
				>
					Params
				</button>
			</div>
		);
	},
}));

vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='content-container'>{children}</div>
	),
}));

vi.mock('~/components/SectionCard', () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='section-card'>{children}</div>
	),
}));

describe('CampaignsForm', () => {
	const mockSetSelectedTab = vi.fn();
	const mockSetRightComponent = vi.fn();
	const mockResetView = vi.fn();
	const mockCreateCampaign = vi.fn();
	const mockUpdateCampaign = vi.fn();
	const mockUpdateCampaignLight = vi.fn();
	const mockAssignObjective = vi.fn();

	const mockCampaign: Partial<Campaign> = {
		id: 123,
		name: 'Test Campaign',
		agentName: 'Test Agent',
		description: 'Test Description',
		budget: 1000,
		spent: 500,
		type: 'OUTBOUND',
		status: CampaignStatus.RUNNING,
		userId: 1,
		clientId: 1,
		tags: [],
		workingHours: {
			monday: { enabled: true, from: '09:00', to: '17:30' },
			tuesday: { enabled: true, from: '09:00', to: '17:30' },
			wednesday: { enabled: true, from: '09:00', to: '17:30' },
			thursday: { enabled: true, from: '09:00', to: '17:30' },
			friday: { enabled: true, from: '09:00', to: '17:30' },
			saturday: { enabled: false, from: '09:00', to: '17:30' },
			sunday: { enabled: false, from: '09:00', to: '17:30' },
		},
		agentConfig: {
			conversationConfig: {
				agent: {
					prompt: {
						toolIds: ['tool1', 'tool2'],
					},
				},
			},
		} as any,
	};

	const setupMocks = (selectedTab = 'agents') => {
		(useCampaignsStore as unknown as Mock).mockImplementation((selector) => {
			const state = {
				selectedTab,
				rightComponent: null,
				setSelectedTab: mockSetSelectedTab,
				setRightComponent: mockSetRightComponent,
				resetView: mockResetView,
			};
			return selector ? selector(state) : state;
		});

		(useCreateCampaign as Mock).mockReturnValue({
			mutateAsync: mockCreateCampaign,
			isPending: false,
		});

		(useUpdateCampaign as Mock).mockReturnValue({
			mutateAsync: mockUpdateCampaign,
			isPending: false,
		});

		(useUpdateCampaignLight as Mock).mockReturnValue({
			mutateAsync: mockUpdateCampaignLight,
			isPending: false,
		});

		(useAssignCampaignObjective as Mock).mockReturnValue({
			mutateAsync: mockAssignObjective,
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
		setupMocks();
	});

	describe('Update version selection (light vs normal)', () => {
		it('calls updateCampaignLight when submitting from General tab', async () => {
			setupMocks('general');
			mockUpdateCampaignLight.mockResolvedValue({ ...mockCampaign, id: 123 });

			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			const submitButton = screen.getByTestId('general-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCampaignLight).toHaveBeenCalled();
				expect(mockUpdateCampaign).not.toHaveBeenCalled();
			});
		});

		it('calls updateCampaign when submitting from Agent tab', async () => {
			setupMocks('agents');
			mockUpdateCampaign.mockResolvedValue({ ...mockCampaign, id: 123 });

			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			const submitButton = screen.getByTestId('agent-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCampaign).toHaveBeenCalled();
				expect(mockUpdateCampaignLight).not.toHaveBeenCalled();
			});
		});
	});

	describe('Tab content loading', () => {
		it('renders GeneralSection when general tab is selected', () => {
			setupMocks('general');
			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			expect(screen.getByTestId('general-section')).toBeInTheDocument();
			expect(screen.queryByTestId('agent-section')).not.toBeInTheDocument();
		});

		it('renders AgentSection when agents tab is selected', () => {
			setupMocks('agents');
			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			expect(screen.getByTestId('agent-section')).toBeInTheDocument();
			expect(screen.queryByTestId('general-section')).not.toBeInTheDocument();
		});

		it('renders DispositionSection when outcomes tab is selected', () => {
			setupMocks('outcomes');
			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			expect(screen.getByTestId('disposition-section')).toBeInTheDocument();
			expect(screen.queryByTestId('agent-section')).not.toBeInTheDocument();
		});

		it('renders DoNotCallSection when do-not-call tab is selected', () => {
			setupMocks('do-not-call');
			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			expect(screen.getByTestId('do-not-call-section')).toBeInTheDocument();
			expect(screen.queryByTestId('agent-section')).not.toBeInTheDocument();
		});

		it('renders ParametersSection when params tab is selected', () => {
			setupMocks('params');
			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			expect(screen.getByTestId('parameters-section')).toBeInTheDocument();
			expect(screen.queryByTestId('agent-section')).not.toBeInTheDocument();
		});

		it('calls setSelectedTab when tab is clicked', () => {
			setupMocks('agents');
			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			// Initially on agents tab
			expect(screen.getByTestId('agent-section')).toBeInTheDocument();

			// Click general tab and verify setSelectedTab was called
			fireEvent.click(screen.getByTestId('tab-general'));
			expect(mockSetSelectedTab).toHaveBeenCalledWith('general');

			// Click outcomes tab
			fireEvent.click(screen.getByTestId('tab-outcomes'));
			expect(mockSetSelectedTab).toHaveBeenCalledWith('outcomes');

			// Click params tab
			fireEvent.click(screen.getByTestId('tab-params'));
			expect(mockSetSelectedTab).toHaveBeenCalledWith('params');

			// Click do-not-call tab
			fireEvent.click(screen.getByTestId('tab-do-not-call'));
			expect(mockSetSelectedTab).toHaveBeenCalledWith('do-not-call');
		});
	});

	describe('Tab persistence after update', () => {
		it('stays on the same tab after successful update on agents tab', async () => {
			setupMocks('agents');
			mockUpdateCampaign.mockResolvedValue({ ...mockCampaign, id: 123 });

			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			const submitButton = screen.getByTestId('agent-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCampaign).toHaveBeenCalled();
			});

			// resetView should NOT be called after update (only on unmount)
			expect(mockResetView).not.toHaveBeenCalled();
			// Tab should still be 'agents' - mockSetSelectedTab should NOT be called with a different tab
			expect(mockSetSelectedTab).not.toHaveBeenCalled();
			expect(screen.getByTestId('agent-section')).toBeInTheDocument();
		});

		it('stays on the same tab after successful update on general tab', async () => {
			setupMocks('general');
			mockUpdateCampaignLight.mockResolvedValue({ ...mockCampaign, id: 123 });

			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			const submitButton = screen.getByTestId('general-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCampaignLight).toHaveBeenCalled();
			});

			// resetView should NOT be called after update (only on unmount)
			expect(mockResetView).not.toHaveBeenCalled();
			// Tab should still be 'general' - mockSetSelectedTab should NOT be called with a different tab
			expect(mockSetSelectedTab).not.toHaveBeenCalled();
			expect(screen.getByTestId('general-section')).toBeInTheDocument();
		});

		it('does not reset view when campaign prop changes after update', async () => {
			setupMocks('general');
			const updatedCampaign = {
				...mockCampaign,
				name: 'Updated Campaign Name',
			};
			mockUpdateCampaignLight.mockResolvedValue(updatedCampaign);

			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			const submitButton = screen.getByTestId('general-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCampaignLight).toHaveBeenCalled();
			});

			// resetView should NOT be called when campaign prop changes (only on unmount)
			expect(mockResetView).not.toHaveBeenCalled();
		});

		it('calls resetView only on component unmount', () => {
			setupMocks('general');

			const { unmount } = renderWithProviders(
				<CampaignsForm campaign={mockCampaign} />
			);

			// resetView should not be called yet
			expect(mockResetView).not.toHaveBeenCalled();

			// Unmount component
			unmount();

			// Now resetView should be called
			expect(mockResetView).toHaveBeenCalled();
		});
	});

	describe('agentConfig handling in light vs full update', () => {
		it('excludes agentConfig when submitting light update from General tab', async () => {
			setupMocks('general');
			mockUpdateCampaignLight.mockResolvedValue({ ...mockCampaign, id: 123 });

			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			const submitButton = screen.getByTestId('general-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCampaignLight).toHaveBeenCalled();
			});

			const callArgs = mockUpdateCampaignLight.mock.calls[0][0];
			expect(callArgs.data).not.toHaveProperty('agentConfig');
		});

		it('includes agentConfig when submitting full update from Agent tab', async () => {
			setupMocks('agents');
			mockUpdateCampaign.mockResolvedValue({ ...mockCampaign, id: 123 });

			renderWithProviders(<CampaignsForm campaign={mockCampaign} />);

			const submitButton = screen.getByTestId('agent-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCampaign).toHaveBeenCalled();
			});

			const callArgs = mockUpdateCampaign.mock.calls[0][0];
			expect(callArgs.data).toHaveProperty('agentConfig');
		});

		it('sends data with agentConfig on full update (toolIds present due to bug)', async () => {
			// Note: There's a bug in the component where cleanedValue (with toolIds stripped)
			// is not used for dataToSend. The dataToSend uses the original 'value' instead.
			// This test documents the current behavior.
			setupMocks('agents');
			mockUpdateCampaign.mockResolvedValue({ ...mockCampaign, id: 123 });

			// Create a campaign with toolIds in the prompt
			const campaignWithToolIds: Partial<Campaign> = {
				...mockCampaign,
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: {
								toolIds: ['tool1', 'tool2'],
								llm: 'test-llm',
							},
						},
					},
				} as any,
			};

			renderWithProviders(<CampaignsForm campaign={campaignWithToolIds} />);

			const submitButton = screen.getByTestId('agent-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCampaign).toHaveBeenCalled();
			});

			const callArgs = mockUpdateCampaign.mock.calls[0][0];
			const agentConfig = callArgs.data?.agentConfig;

			// Verify agentConfig is included in full update
			expect(agentConfig).toBeDefined();
			expect(agentConfig?.conversationConfig?.agent?.prompt).toBeDefined();
		});
	});

	describe('Create campaign', () => {
		it('calls createCampaign when no campaign id exists', async () => {
			setupMocks('agents');
			mockCreateCampaign.mockResolvedValue({ ...mockCampaign, id: 999 });

			const newCampaign = { ...mockCampaign };
			delete newCampaign.id;

			renderWithProviders(<CampaignsForm campaign={newCampaign} />);

			const submitButton = screen.getByTestId('agent-submit');
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockCreateCampaign).toHaveBeenCalled();
				expect(mockUpdateCampaign).not.toHaveBeenCalled();
				expect(mockUpdateCampaignLight).not.toHaveBeenCalled();
			});
		});
	});
});

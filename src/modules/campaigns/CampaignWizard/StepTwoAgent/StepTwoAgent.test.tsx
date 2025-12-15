import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepTwoAgent } from './StepTwoAgent';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import useCampaignsPredefinedParams from '../../CampaignsForm/useCampaignsPredefinedParams';
import { useUpdateCampaign, useGetCampaign } from '~/queries/campaignsQueries';
import { useQueryClient } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// Mock stores and hooks
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
}));

vi.mock('../../CampaignsForm/useCampaignsPredefinedParams', () => ({
	default: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useUpdateCampaign: vi.fn(),
	useGetCampaign: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
	useQueryClient: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

// Mock child components
vi.mock('./KnowledgeBaseSection', () => ({
	default: () => (
		<div data-testid='knowledge-base-section'>Knowledge Base Section</div>
	),
}));

vi.mock(
	'~/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptEditModal',
	() => ({
		default: ({ onClose, onSave }: any) => (
			<div data-testid='prompt-edit-modal'>
				Prompt Edit Modal
				<button onClick={onClose}>Close</button>
				<button onClick={onSave}>Save</button>
			</div>
		),
	})
);

describe('StepTwoAgent', () => {
	const mockOnNext = vi.fn();
	const mockOnBack = vi.fn();
	const mockMutateAsync = vi.fn();
	const mockInvalidateQueries = vi.fn();
	const mockReloadFreshCampaign = vi.fn();

	let mockStore: ReturnType<typeof createMockStore>;

	const createMockStore = ({
		agentPrompt = '',
	}: { agentPrompt?: string } = {}) => ({
		agentBehaviorId: null,
		language: 'es',
		firstMessage: '',
		agentPrompt,
		createdCampaign: { id: 1, agentConfig: {} },
		knowledgeBaseIds: [] as number[],
		setAgentBehaviorId: vi.fn(),
		setLanguage: vi.fn(),
		setFirstMessage: vi.fn(),
		setAgentPrompt: vi.fn(),
		setKnowledgeBaseIds: vi.fn(),
		setIsSubmitting: vi.fn(),
		setCreatedCampaign: vi.fn(),
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockStore = createMockStore();
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);

		// Mock getState for non-hook usage
		(useCampaignWizardStore as any).getState = vi
			.fn()
			.mockReturnValue(mockStore);

		(
			useCampaignsPredefinedParams as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue([{ id: 1, name: 'Behavior 1' }]);

		(useUpdateCampaign as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false,
		});

		(useGetCampaign as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			data: null,
			isLoading: false,
			refetch: mockReloadFreshCampaign,
		});

		(useQueryClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			invalidateQueries: mockInvalidateQueries,
		});
	});

	const renderComponent = () => {
		return render(
			<MantineProvider>
				<StepTwoAgent onNext={mockOnNext} onBack={mockOnBack} />
			</MantineProvider>
		);
	};

	it('renders form fields', () => {
		renderComponent();
		expect(screen.getByText(/Conversation Setup/i)).toBeInTheDocument();
		expect(screen.getByText(/Agent Behavior/i)).toBeInTheDocument();
		// Language appears multiple times (in text and as label), just verify it's present
		expect(screen.getAllByText(/Language/i).length).toBeGreaterThan(0);
		expect(screen.getByLabelText(/Agent First Message/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Agent prompt/i)).toBeInTheDocument();
		expect(screen.getByTestId('knowledge-base-section')).toBeInTheDocument();
	});

	it('validates required fields', async () => {
		renderComponent();

		const submitButton = screen.getByRole('button', {
			name: /Save & Continue/i,
		});
		expect(submitButton).toBeDisabled();
	});

	it('enables submit button when valid', async () => {
		mockStore = createMockStore({
			agentPrompt: 'This is a valid prompt with enough length.',
		});
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);
		(useCampaignWizardStore as any).getState = vi
			.fn()
			.mockReturnValue(mockStore);

		renderComponent();

		const submitButton = screen.getByRole('button', {
			name: /Save & Continue/i,
		});
		await waitFor(() => expect(submitButton).not.toBeDisabled());
	});

	it('submits form successfully', async () => {
		mockMutateAsync.mockResolvedValue({ id: 1, agentConfig: {} });
		mockStore = createMockStore({
			agentPrompt: 'This is a valid prompt with enough length.',
		});
		mockStore.knowledgeBaseIds = [100]; // Set some KB IDs for the test
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);
		(useCampaignWizardStore as any).getState = vi
			.fn()
			.mockReturnValue(mockStore);

		renderComponent();

		const submitButton = screen.getByRole('button', {
			name: /Save & Continue/i,
		});
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						agentConfig: expect.objectContaining({
							knowledgeBaseIds: [100], // Verify Root Path update
							conversationConfig: expect.objectContaining({
								agent: expect.objectContaining({
									prompt: expect.objectContaining({
										knowledgeBase: [100], // Verify Deep Path update
									}),
								}),
							}),
						}),
					}),
				})
			);
		});
		expect(mockInvalidateQueries).toHaveBeenCalled();
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Agent Configured',
				color: 'green',
			})
		);
		expect(mockOnNext).toHaveBeenCalled();
	});

	it('handles submission error', async () => {
		mockMutateAsync.mockRejectedValue(new Error('Update failed'));
		mockStore = createMockStore({
			agentPrompt: 'This is a valid prompt with enough length.',
		});
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);
		(useCampaignWizardStore as any).getState = vi
			.fn()
			.mockReturnValue(mockStore);

		renderComponent();

		const submitButton = screen.getByRole('button', {
			name: /Save & Continue/i,
		});
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Error',
					message: 'Update failed',
					color: 'red',
				})
			);
		});
	});

	it('opens prompt editor modal', async () => {
		renderComponent();
		const editButton = screen.getByRole('button', { name: /Edit prompt/i });
		fireEvent.click(editButton);
		await waitFor(() => {
			expect(screen.getByTestId('prompt-edit-modal')).toBeInTheDocument();
		});
	});

	it('calls updateCampaign and onNext when valid form is submitted, removing toolIds', async () => {
		mockMutateAsync.mockResolvedValue({ id: 1, name: 'Updated Campaign' });
		const storeWithToolIds = {
			...mockStore,
			createdCampaign: {
				...mockStore.createdCampaign,
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: {
								prompt: 'Existing prompt',
								toolIds: [1, 2, 3],
							},
						},
					},
				},
			},
		};
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(storeWithToolIds);

		renderComponent();

		// Fill in required valid data
		fireEvent.change(screen.getByPlaceholderText(/Select language/i), {
			target: { value: 'es' },
		});

		const submitButton = screen.getByRole('button', {
			name: /Save & Continue/i,
		});
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalled();
			const payload = mockMutateAsync.mock.calls[0][0].data;
			expect(
				payload.agentConfig.conversationConfig.agent.prompt.toolIds
			).toBeUndefined();
			expect(mockOnNext).toHaveBeenCalled();
		});
	});
});

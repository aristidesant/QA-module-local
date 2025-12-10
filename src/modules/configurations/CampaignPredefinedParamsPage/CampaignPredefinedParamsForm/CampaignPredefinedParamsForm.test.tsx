import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CampaignPredefinedParamsForm from './CampaignPredefinedParamsForm';
import * as queries from '~/queries/useClientConfigs';
import { notifications } from '@mantine/notifications';
import type { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import type { ClientConfig } from '~/models/ClientConfig';

// Mock the queries
vi.mock('~/queries/useClientConfigs', () => ({
	useCreateClientConfig: () => ({
		mutateAsync: vi.fn().mockResolvedValue({}),
		isPending: false,
	}),
	useUpdateClientConfig: () => ({
		mutateAsync: vi.fn().mockResolvedValue({}),
		isPending: false,
	}),
}));

// Mock notifications
vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

describe('CampaignPredefinedParamsForm', () => {
	const mockConfig: ClientConfig = {
		id: 1,
		name: 'test-config',
		description: 'Test config',
		type: 'campaign_params',
		value: '[]',
		clientId: 1,
		userId: 1,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		deletedAt: null,
	};

	const mockEmptyList: CampaignPredefinedParam[] = [];

	const mockExistingParam: CampaignPredefinedParam = {
		id: 'param-1',
		name: 'Fast Response Agent',
		params: {
			conversationConfig: {
				asr: {
					quality: 'high',
					keywords: ['hello', 'world'],
					provider: 'elevenlabs',
					userInputAudioFormat: 'pcm_16000',
				},
				tts: {
					modelId: 'eleven_turbo_v2_5',
					stability: 0.5,
					speed: 1.0,
					similarityBoost: 0.75,
					optimizeStreamingLatency: 3,
					agentOutputAudioFormat: 'pcm_16000',
				},
				agent: {
					prompt: {
						llm: 'gpt-4o-mini-2024-07-18',
						temperature: 1.0,
					},
				},
			},
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Create mode', () => {
		it('should render the form in create mode when no param is provided', () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
					mode='create'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			expect(screen.getByText('New preset')).toBeInTheDocument();
			expect(screen.getAllByText('General').length).toBeGreaterThan(0);
			expect(screen.getByText('Speech Recognition')).toBeInTheDocument();
			expect(screen.getByText('Voice Output')).toBeInTheDocument();
			expect(screen.getByText('Agent Personality')).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Create/i })
			).toBeInTheDocument();
		});

		it('validates required name', async () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
					mode='create'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			const createBtn = screen.getByRole('button', { name: /Create/i });
			const form = createBtn.closest('form');
			fireEvent.submit(form!);

			await waitFor(() =>
				expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
			);
		});

		it('prevents duplicate names', async () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={[mockExistingParam]}
					config={mockConfig}
					mode='create'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			const nameInput = screen.getByPlaceholderText(
				'e.g., Fast response agent'
			);
			await userEvent.type(nameInput, 'Fast Response Agent');

			const createBtn = screen.getByRole('button', { name: /Create/i });
			await userEvent.click(createBtn);

			await waitFor(() =>
				expect(
					screen.getByText('A parameter with this name already exists')
				).toBeInTheDocument()
			);
		});

		it('submits and calls update mutation on success', async () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			const mutateAsync = vi.fn().mockResolvedValue({});
			vi.spyOn(queries, 'useUpdateClientConfig').mockReturnValue({
				mutateAsync,
				isPending: false,
			} as any);

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
					mode='create'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			await userEvent.type(
				screen.getByPlaceholderText('e.g., Fast response agent'),
				'New Param'
			);
			await userEvent.click(screen.getByRole('button', { name: /Create/i }));

			await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
			expect(onSuccess).toHaveBeenCalled();
			expect(notifications.show).toHaveBeenCalledWith({
				title: 'Success',
				message: 'Parameter created successfully',
				color: 'green',
			});
		});

		it('shows notification on mutation error', async () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			const mutateAsync = vi.fn().mockRejectedValue(new Error('err'));
			vi.spyOn(queries, 'useUpdateClientConfig').mockReturnValue({
				mutateAsync,
				isPending: false,
			} as any);

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
					mode='create'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			await userEvent.type(
				screen.getByPlaceholderText('e.g., Fast response agent'),
				'New Param'
			);
			await userEvent.click(screen.getByRole('button', { name: /Create/i }));

			await waitFor(() => expect(notifications.show).toHaveBeenCalled());
			expect(onSuccess).not.toHaveBeenCalled();
		});
	});

	describe('Edit mode', () => {
		it('renders edit mode and populates values', () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={mockExistingParam}
					list={[mockExistingParam]}
					config={mockConfig}
					mode='edit'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			expect(screen.getByText('Editing preset')).toBeInTheDocument();
			expect(
				screen.getByDisplayValue('Fast Response Agent')
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Update/i })
			).toBeInTheDocument();
		});
	});

	describe('Form actions', () => {
		it('should have Cancel and Create buttons in create mode', () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
					mode='create'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			expect(
				screen.getByRole('button', { name: /Cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Create/i })
			).toBeInTheDocument();
		});

		it('should have Cancel and Update buttons in edit mode', () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={mockExistingParam}
					list={[mockExistingParam]}
					config={mockConfig}
					mode='edit'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			expect(
				screen.getByRole('button', { name: /Cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Update/i })
			).toBeInTheDocument();
		});
	});

	describe('Help text', () => {
		it('should display description text for each section', async () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
					mode='create'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			// General is active by default
			expect(
				screen.getByText(
					'Name this preset and keep it discoverable for teammates.'
				)
			).toBeInTheDocument();

			// Switch to Speech Recognition
			await userEvent.click(screen.getByText('Speech Recognition'));
			expect(
				screen.getByText(
					'Control quality, keywords, and input formats for calls.'
				)
			).toBeInTheDocument();

			// Switch to Voice Output
			await userEvent.click(screen.getByText('Voice Output'));
			expect(
				screen.getByText('Tune speed, clarity, and latency for outbound audio.')
			).toBeInTheDocument();

			// Switch to Agent Personality
			await userEvent.click(screen.getByText('Agent Personality'));
			expect(
				screen.getByText(
					'Pick the model and tone that will represent the brand.'
				)
			).toBeInTheDocument();
		});

		it('should display slider help text', async () => {
			const onCancel = vi.fn();
			const onSuccess = vi.fn();
			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
					mode='create'
					saveStrategy='update'
					onCancel={onCancel}
					onSuccess={onSuccess}
				/>
			);

			// Switch to Voice Output to access TTS sliders
			await userEvent.click(screen.getByText('Voice Output'));
			expect(screen.getByText('Speech rate (0.25–4.0)')).toBeInTheDocument();
			expect(screen.getByText('Voice consistency (0–1)')).toBeInTheDocument();
			expect(
				screen.getByText('Match to original voice (0–1)')
			).toBeInTheDocument();
			expect(
				screen.getByText('0 = best quality, 4 = lowest latency')
			).toBeInTheDocument();

			// Switch to Agent Personality for the temperature slider helper text
			await userEvent.click(screen.getByText('Agent Personality'));
			expect(screen.getByText('Controls randomness (0–2)')).toBeInTheDocument();
		});
	});
});

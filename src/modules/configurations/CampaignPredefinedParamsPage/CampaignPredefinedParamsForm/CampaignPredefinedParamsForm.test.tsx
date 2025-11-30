import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	describe,
	it,
	expect,
	vi,
	beforeEach,
	afterEach,
	type Mock,
} from 'vitest';
import CampaignPredefinedParamsForm from './CampaignPredefinedParamsForm';
import * as queries from '~/queries/useClientConfigs';
import useCampaignPredefinedParamsStore from '../store/useCampaignPredefinedParamsStore';
import { notifications } from '@mantine/notifications';
import type { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import type { ClientConfig } from '~/models/ClientConfig';

// Mock the queries
vi.mock('~/queries/useClientConfigs', () => ({
	useUpdateClientConfig: () => ({
		mutateAsync: vi.fn().mockResolvedValue({}),
		isPending: false,
	}),
}));

// Mock the store
vi.mock('../store/useCampaignPredefinedParamsStore', () => ({
	__esModule: true,
	default: vi.fn(),
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
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
				/>
			);

			expect(screen.getByText('Create Parameter')).toBeInTheDocument();
			expect(screen.getByText('General information')).toBeInTheDocument();
			expect(screen.getByText('Speech recognition')).toBeInTheDocument();
			expect(screen.getByText('Voice output')).toBeInTheDocument();
			expect(screen.getByText('Agent personality')).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Create/i })
			).toBeInTheDocument();
		});

		it('validates required name', async () => {
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
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
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={[mockExistingParam]}
					config={mockConfig}
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
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

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
				/>
			);

			await userEvent.type(
				screen.getByPlaceholderText('e.g., Fast response agent'),
				'New Param'
			);
			await userEvent.click(screen.getByRole('button', { name: /Create/i }));

			await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
			expect(clearRightComponent).toHaveBeenCalled();
			expect(notifications.show).toHaveBeenCalledWith({
				title: 'Success',
				message: 'Parameter created successfully',
				color: 'green',
			});
		});

		it('shows notification on mutation error', async () => {
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

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
				/>
			);

			await userEvent.type(
				screen.getByPlaceholderText('e.g., Fast response agent'),
				'New Param'
			);
			await userEvent.click(screen.getByRole('button', { name: /Create/i }));

			await waitFor(() => expect(notifications.show).toHaveBeenCalled());
			expect(clearRightComponent).not.toHaveBeenCalled();
		});
	});

	describe('Edit mode', () => {
		it('renders edit mode and populates values', () => {
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={mockExistingParam}
					list={[mockExistingParam]}
					config={mockConfig}
				/>
			);

			expect(screen.getByText('Edit Parameter')).toBeInTheDocument();
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
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
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
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={mockExistingParam}
					list={[mockExistingParam]}
					config={mockConfig}
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

	describe('Close button', () => {
		it('should render close button in the header', () => {
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
				/>
			);

			const closeButton = screen.getByLabelText('Close form');
			expect(closeButton).toBeInTheDocument();
		});
	});

	describe('Help text', () => {
		it('should display description text for each section', () => {
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
				/>
			);

			expect(
				screen.getByText(
					'Name and organize this preset so the team recognizes it quickly.'
				)
			).toBeInTheDocument();
			expect(
				screen.getByText('Configure how the system transcribes caller speech.')
			).toBeInTheDocument();
			expect(
				screen.getByText(
					'Tune the ElevenLabs synthesis defaults that callers will hear.'
				)
			).toBeInTheDocument();
			expect(
				screen.getByText('Shape the tone and behaviour of the assistant.')
			).toBeInTheDocument();
		});

		it('should display slider help text', () => {
			const clearRightComponent = vi.fn();
			(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
				clearRightComponent,
			});

			renderWithProviders(
				<CampaignPredefinedParamsForm
					param={undefined}
					list={mockEmptyList}
					config={mockConfig}
				/>
			);

			expect(screen.getByText('Speech rate (0.25–4.0)')).toBeInTheDocument();
			expect(screen.getByText('Voice consistency (0–1)')).toBeInTheDocument();
			expect(
				screen.getByText('Match to original voice (0–1)')
			).toBeInTheDocument();
			expect(screen.getByText('Controls randomness (0–2)')).toBeInTheDocument();
			expect(
				screen.getByText('0 = best quality, 4 = lowest latency')
			).toBeInTheDocument();
		});
	});
});

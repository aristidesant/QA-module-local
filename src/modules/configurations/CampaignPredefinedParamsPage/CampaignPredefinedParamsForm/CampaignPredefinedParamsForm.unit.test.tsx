import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
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

vi.mock('../store/useCampaignPredefinedParamsStore', () => ({
	__esModule: true,
	default: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

const mockConfig = {
	id: 1,
	name: 'campaign_predefined_params',
	description: 'desc',
	type: 'json',
	value: '[]',
	clientId: 1,
	userId: 1,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z',
	deletedAt: null,
};

const existingParam = {
	id: 'param-1',
	name: 'Fast Response Agent',
	params: {
		conversationConfig: {
			asr: {
				quality: 'high',
				keywords: [],
				provider: 'elevenlabs',
				userInputAudioFormat: 'pcm_16000',
			},
			tts: {
				modelId: 'v1',
				stability: 0.5,
				speed: 1.0,
				similarityBoost: 0.5,
				optimizeStreamingLatency: 3,
				agentOutputAudioFormat: 'pcm_16000',
			},
			agent: { prompt: { llm: 'gpt-4o-mini-2024-07-18', temperature: 1 } },
		},
	},
};

describe('CampaignPredefinedParamsForm (unit)', () => {
	beforeEach(() => vi.clearAllMocks());
	afterEach(() => vi.restoreAllMocks());

	it('renders create mode and shows sections', () => {
		const clearRightComponent = vi.fn();
		(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
			clearRightComponent,
		});

		renderWithProviders(
			<CampaignPredefinedParamsForm list={[]} config={mockConfig as any} />
		);

		expect(screen.getByText('Create Parameter')).toBeInTheDocument();
		expect(screen.getByText('General information')).toBeInTheDocument();
	});

	it('validates required name and prevents duplicate', async () => {
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
				list={[existingParam as any]}
				config={mockConfig as any}
			/>
		);

		const user = userEvent.setup();
		const createBtn = screen.getByRole('button', { name: /^Create$/i });

		// Clear the name field to ensure it's empty and submit
		const nameInput = screen.getByPlaceholderText('e.g., Fast response agent');
		await user.clear(nameInput);
		await user.click(createBtn);

		// Mutation should NOT be called when name is empty (validation prevents submission)
		await waitFor(() => {
			expect(mutateAsync).not.toHaveBeenCalled();
		});

		// Now type a duplicate name and submit
		await user.type(nameInput, 'Fast Response Agent');
		await user.click(createBtn);

		// Mutation should NOT be called for duplicate name (validation prevents submission)
		await waitFor(() => {
			expect(mutateAsync).not.toHaveBeenCalled();
		});
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
			<CampaignPredefinedParamsForm list={[]} config={mockConfig as any} />
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
			<CampaignPredefinedParamsForm list={[]} config={mockConfig as any} />
		);

		await userEvent.type(
			screen.getByPlaceholderText('e.g., Fast response agent'),
			'New Param'
		);
		await userEvent.click(screen.getByRole('button', { name: /Create/i }));

		await waitFor(() => expect(notifications.show).toHaveBeenCalled());
		expect(clearRightComponent).not.toHaveBeenCalled();
	});

	it('renders edit mode and populates values', () => {
		const clearRightComponent = vi.fn();
		(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
			clearRightComponent,
		});

		renderWithProviders(
			<CampaignPredefinedParamsForm
				param={existingParam as any}
				list={[existingParam as any]}
				config={mockConfig as any}
			/>
		);
		expect(screen.getByText('Edit Parameter')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Fast Response Agent')).toBeInTheDocument();
	});
});

export {};

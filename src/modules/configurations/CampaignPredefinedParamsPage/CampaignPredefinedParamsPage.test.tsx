import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignPredefinedParamsPage from './CampaignPredefinedParamsPage';
import * as queries from '~/queries/useClientConfigs';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';

vi.mock('~/hooks/useIsMasterClient', () => ({
	useIsMasterClient: vi.fn(),
}));

const sampleParams = [
	{
		id: '1',
		name: 'Param 1',
		params: {
			conversationConfig: {
				agent: { prompt: { llm: 'gpt-4', temperature: 0.2 } },
				tts: { agentOutputAudioFormat: 'wav', modelId: 'v1', stability: 0 },
				asr: {
					quality: 'high',
					keywords: [],
					provider: 'x',
					userInputAudioFormat: 'wav',
				},
			},
		},
	},
];

describe('CampaignPredefinedParamsPage', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders list with params', () => {
		vi.mocked(useIsMasterClient).mockReturnValue(false);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'campaign_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleParams),
				clientId: 5,
			},
		} as any);

		renderWithProviders(<CampaignPredefinedParamsPage />);

		expect(screen.getByText('Param 1')).toBeInTheDocument();
		expect(screen.getByText('gpt-4')).toBeInTheDocument();
		expect(screen.getByText('wav')).toBeInTheDocument();
	});

	it('opens create modal when clicking Add parameter', async () => {
		vi.mocked(useIsMasterClient).mockReturnValue(false);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'campaign_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleParams),
				clientId: 5,
			},
		} as any);

		renderWithProviders(<CampaignPredefinedParamsPage />);

		fireEvent.click(screen.getByLabelText('Add parameter'));

		await waitFor(() =>
			expect(screen.getByText('Create Campaign Parameter')).toBeInTheDocument()
		);
	});

	it('opens edit modal when clicking a row', async () => {
		vi.mocked(useIsMasterClient).mockReturnValue(false);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'campaign_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleParams),
				clientId: 5,
			},
		} as any);

		renderWithProviders(<CampaignPredefinedParamsPage />);

		fireEvent.click(screen.getByText('Param 1'));

		await waitFor(() =>
			expect(screen.getByText('Edit Campaign Parameter')).toBeInTheDocument()
		);
		expect(screen.getByDisplayValue('Param 1')).toBeInTheDocument();
	});

	it('delete parameter flow calls update mutation', async () => {
		vi.mocked(useIsMasterClient).mockReturnValue(false);
		const configData = {
			name: 'campaign_predefined_params',
			description: 'desc',
			type: 'json',
			value: JSON.stringify(sampleParams),
			clientId: 5,
		};

		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: configData,
		} as any);

		const mutateAsync = vi.fn().mockResolvedValue({});
		// mock update mutation hook
		vi.spyOn(queries, 'useUpdateClientConfig').mockReturnValue({
			mutateAsync,
			isPending: false,
		} as any);

		renderWithProviders(<CampaignPredefinedParamsPage />);

		const deleteButtons = screen.getAllByLabelText('Delete parameter');
		expect(deleteButtons.length).toBeGreaterThan(0);
		fireEvent.click(deleteButtons[0]);

		await waitFor(() => {
			expect(screen.getByText('Delete Parameter')).toBeInTheDocument();
		});

		const modalDelete = screen.getByRole('button', { name: /^Delete$/i });
		fireEvent.click(modalDelete);

		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalled();
		});
	});

	it('disables delete actions for global config and shows guidance', () => {
		vi.mocked(useIsMasterClient).mockReturnValue(false);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'campaign_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleParams),
				clientId: null,
			},
		} as any);

		renderWithProviders(<CampaignPredefinedParamsPage />);

		expect(screen.getByText('Global configuration')).toBeInTheDocument();
		const deleteButtons = screen.getAllByLabelText('Delete parameter');
		deleteButtons.forEach((button) => {
			expect(button).toBeDisabled();
		});
	});

	it('shows create override action for global configs when not master', () => {
		vi.mocked(useIsMasterClient).mockReturnValue(false);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'campaign_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleParams),
				clientId: null,
			},
		} as any);

		renderWithProviders(<CampaignPredefinedParamsPage />);

		expect(screen.getByLabelText('Create override')).toBeInTheDocument();
	});
});

export {};

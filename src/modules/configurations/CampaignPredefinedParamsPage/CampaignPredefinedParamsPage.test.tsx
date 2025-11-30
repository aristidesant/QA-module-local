import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignPredefinedParamsPage from './CampaignPredefinedParamsPage';
import * as queries from '~/queries/useClientConfigs';
import useCampaignPredefinedParamsStore from './store/useCampaignPredefinedParamsStore';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, afterEach, type Mock } from 'vitest';

vi.mock('./store/useCampaignPredefinedParamsStore', () => ({
	__esModule: true,
	default: vi.fn(),
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
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'campaign_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleParams),
			},
		} as any);

		// provide a minimal store implementation
		(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent: vi.fn(),
			setSelectedParam: vi.fn(),
			setMode: vi.fn(),
		});

		renderWithProviders(<CampaignPredefinedParamsPage />);

		expect(screen.getByText('Param 1')).toBeInTheDocument();
		expect(screen.getByText('gpt-4')).toBeInTheDocument();
		expect(screen.getByText('wav')).toBeInTheDocument();
	});

	it('clicking Add New triggers create flow', () => {
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'campaign_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleParams),
			},
		} as any);

		const setSelectedParam = vi.fn();
		const setMode = vi.fn();
		const setRightComponent = vi.fn();
		(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
			rightComponent: null,
			setRightComponent,
			clearRightComponent: vi.fn(),
			setSelectedParam,
			setMode,
		});

		renderWithProviders(<CampaignPredefinedParamsPage />);

		fireEvent.click(screen.getByRole('button', { name: /Add New/i }));

		expect(setSelectedParam).toHaveBeenCalledWith(null);
		expect(setMode).toHaveBeenCalledWith('create');
		expect(setRightComponent).toHaveBeenCalled();
	});

	it('clicking row triggers view flow', () => {
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'campaign_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleParams),
			},
		} as any);

		const setSelectedParam = vi.fn();
		const setMode = vi.fn();
		const setRightComponent = vi.fn();
		(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
			rightComponent: null,
			setRightComponent,
			clearRightComponent: vi.fn(),
			setSelectedParam,
			setMode,
		});

		renderWithProviders(<CampaignPredefinedParamsPage />);

		fireEvent.click(screen.getByText('Param 1'));

		expect(setSelectedParam).toHaveBeenCalledWith(sampleParams[0]);
		expect(setMode).toHaveBeenCalledWith('view');
		expect(setRightComponent).toHaveBeenCalled();
	});

	it('delete parameter flow calls update mutation and clears right component', async () => {
		const configData = {
			name: 'campaign_predefined_params',
			description: 'desc',
			type: 'json',
			value: JSON.stringify(sampleParams),
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

		const clearRightComponent = vi.fn();
		(useCampaignPredefinedParamsStore as unknown as Mock).mockReturnValue({
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent,
			setSelectedParam: vi.fn(),
			setMode: vi.fn(),
		});

		renderWithProviders(<CampaignPredefinedParamsPage />);

		// click delete action (aria-label provided in column cell)
		const deleteButtons = screen.getAllByLabelText('Delete parameter');
		expect(deleteButtons.length).toBeGreaterThan(0);
		fireEvent.click(deleteButtons[0]);

		// modal should show - wait for it to appear in the DOM
		await waitFor(() => {
			expect(screen.getByText('Delete Parameter')).toBeInTheDocument();
		});

		expect(
			screen.getByText(/Are you sure you want to delete/i)
		).toBeInTheDocument();

		// click delete in modal
		const modalDelete = screen.getByRole('button', { name: /^Delete$/i });
		fireEvent.click(modalDelete);

		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalled();
			expect(clearRightComponent).toHaveBeenCalled();
		});
	});
});

export {};

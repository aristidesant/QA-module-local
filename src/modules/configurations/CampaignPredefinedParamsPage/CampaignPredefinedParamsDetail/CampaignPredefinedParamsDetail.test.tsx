import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import type { CampaignPredefinedParam } from '~/models/CampaignPredefinedParam';
import CampaignPredefinedParamsDetail from './CampaignPredefinedParamsDetail';
import useCampaignPredefinedParamsStore from '../store/useCampaignPredefinedParamsStore';

const setModeMock = vi.fn();
const setRightComponentMock = vi.fn();
const clearRightComponentMock = vi.fn();

vi.mock('../CampaignPredefinedParamsForm', () => ({
	__esModule: true,
	default: () => <div data-testid='mock-form'>Mocked Param Form</div>,
}));

vi.mock('../store/useCampaignPredefinedParamsStore', () => ({
	__esModule: true,
	default: vi.fn(),
}));

const mockedStore = useCampaignPredefinedParamsStore as unknown as Mock;

const conversationConfig: CampaignPredefinedParam['params']['conversationConfig'] =
	{
		asr: {
			quality: 'high',
			keywords: ['alpha'],
			provider: 'provider-x',
			userInputAudioFormat: 'wav',
		},
		tts: {
			modelId: 'eleven_model_x',
			stability: 0.7,
			speed: 1.5,
			similarityBoost: 0.8,
			optimizeStreamingLatency: 2,
			agentOutputAudioFormat: 'mp3',
		},
		agent: {
			prompt: {
				llm: 'gpt-4o-mini',
				temperature: 0.9,
			},
		},
	};

const paramWithConfig: CampaignPredefinedParam = {
	id: 'param-1',
	name: 'Detailed parameter',
	params: {
		conversationConfig,
	},
};

const paramWithoutConfig: CampaignPredefinedParam = {
	id: 'param-2',
	name: 'Empty parameter',
	params: {},
};

const list = [paramWithConfig];

beforeEach(() => {
	setModeMock.mockReset();
	setRightComponentMock.mockReset();
	clearRightComponentMock.mockReset();

	mockedStore.mockImplementation(() => ({
		clearRightComponent: clearRightComponentMock,
		setMode: setModeMock,
		setRightComponent: setRightComponentMock,
	}));
});

describe('CampaignPredefinedParamsDetail', () => {
	it('renders summary and configuration cards when data exists', () => {
		renderWithProviders(
			<CampaignPredefinedParamsDetail
				param={paramWithConfig}
				list={list}
				config={undefined}
			/>
		);

		expect(screen.getByText('Detailed parameter')).toBeInTheDocument();
		expect(screen.getByText('TTS Model')).toBeInTheDocument();
		// eleven_model_x may appear multiple times (in summary and detail), use getAllByText
		expect(screen.getAllByText('eleven_model_x').length).toBeGreaterThan(0);
		expect(screen.getByText('LLM')).toBeInTheDocument();
		// gpt-4o-mini may appear multiple times (in summary and detail)
		expect(screen.getAllByText('gpt-4o-mini').length).toBeGreaterThan(0);
		expect(screen.getByText('TTS Configuration')).toBeInTheDocument();
		expect(screen.getByText('Agent Configuration')).toBeInTheDocument();
		expect(screen.getByText('Speed')).toBeInTheDocument();
		expect(screen.getByText('Temperature')).toBeInTheDocument();
	});

	it('omits detail cards when no conversation config is supplied', () => {
		renderWithProviders(
			<CampaignPredefinedParamsDetail
				param={paramWithoutConfig}
				list={[]}
				config={undefined}
			/>
		);

		expect(screen.getByText('Empty parameter')).toBeInTheDocument();
		expect(screen.queryByText('TTS Configuration')).not.toBeInTheDocument();
		expect(screen.queryByText('Agent Configuration')).not.toBeInTheDocument();
		expect(screen.queryByText('TTS Model')).not.toBeInTheDocument();
		expect(screen.queryByText('LLM')).not.toBeInTheDocument();
	});

	it('triggers edit flow when edit action icon is clicked', async () => {
		renderWithProviders(
			<CampaignPredefinedParamsDetail
				param={paramWithConfig}
				list={list}
				config={undefined}
			/>
		);

		const user = userEvent.setup();
		await user.click(screen.getByLabelText('Edit parameter'));

		expect(setModeMock).toHaveBeenCalledWith('edit');

		expect(setRightComponentMock).toHaveBeenCalled();
		const rightComponent = setRightComponentMock.mock.calls[0][0];
		expect(rightComponent.props.param).toBe(paramWithConfig);
		expect(rightComponent.props.list).toBe(list);
		expect(rightComponent.props.config).toBeUndefined();
	});
});

import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import useCampaignPredefinedParamsColumns from './useCampaignPredefinedParamsColumns';
import type { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import renderWithProviders, {
	TestProviders,
} from '~/test-utils/renderWithProviders';

const wrapper = TestProviders;

const sampleParam: CampaignPredefinedParam = {
	id: 'param-1',
	name: 'Fast response agent',
	params: {
		conversationConfig: {
			asr: {
				quality: 'high',
				keywords: [],
				provider: 'deepgram',
				userInputAudioFormat: 'wav',
			},
			tts: {
				modelId: 'elevenlabs',
				stability: 0.5,
				speed: 1,
				similarityBoost: 0.5,
				optimizeStreamingLatency: 2,
				agentOutputAudioFormat: 'mp3',
			},
			agent: {
				prompt: {
					llm: 'gpt-4o-mini',
					temperature: 0.7,
				},
			},
		},
	},
};

describe('useCampaignPredefinedParamsColumns', () => {
	const getActionsCellRenderer = (
		columns: ReturnType<typeof useCampaignPredefinedParamsColumns>
	) => {
		const actionsColumn = columns.find((col) => col.id === 'actions');
		if (!actionsColumn) {
			throw new Error('Expected actions column to exist');
		}
		if (typeof actionsColumn.cell !== 'function') {
			throw new Error('Expected actions column cell to be a function');
		}
		return actionsColumn.cell;
	};

	it('returns translated column headers', () => {
		const { result } = renderHook(() => useCampaignPredefinedParamsColumns(), {
			wrapper,
		});

		const columns = result.current;
		expect(columns).toHaveLength(4);

		const nameColumn = columns.find((col: any) => col.accessorKey === 'name');
		expect(nameColumn?.header).toBe('Name');

		const llmColumn = columns.find(
			(col: any) =>
				col.accessorKey === 'params.conversationConfig.agent.prompt.llm'
		);
		expect(llmColumn?.header).toBe('LLM Model');

		const audioFormatColumn = columns.find(
			(col: any) =>
				col.accessorKey ===
				'params.conversationConfig.tts.agentOutputAudioFormat'
		);
		expect(audioFormatColumn?.header).toBe('Audio Format');

		const actionsColumn = columns.find((col: any) => col.id === 'actions');
		expect(actionsColumn?.header).toBe('Actions');
	});

	it('disables delete action when onDelete is not provided', () => {
		const { result } = renderHook(() => useCampaignPredefinedParamsColumns(), {
			wrapper,
		});

		const cellRenderer = getActionsCellRenderer(result.current);
		const cell = cellRenderer({ row: { original: sampleParam } } as any);
		renderWithProviders(<div>{cell}</div>);

		expect(
			screen.getByRole('button', { name: 'Delete parameter' })
		).toBeDisabled();
	});

	it('calls onDelete and stops click propagation', async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		const onParentClick = vi.fn();

		const { result } = renderHook(
			() => useCampaignPredefinedParamsColumns({ onDelete }),
			{ wrapper }
		);

		const cellRenderer = getActionsCellRenderer(result.current);
		const cell = cellRenderer({ row: { original: sampleParam } } as any);
		renderWithProviders(<div onClick={onParentClick}>{cell}</div>);

		await user.click(screen.getByRole('button', { name: 'Delete parameter' }));

		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(onDelete).toHaveBeenCalledWith(sampleParam);
		expect(onParentClick).not.toHaveBeenCalled();
	});
});

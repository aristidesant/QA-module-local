import { renderHook } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import type { ColumnDef, CellContext, Row } from '@tanstack/react-table';
import { useAgentVoicesColumns } from './useAgentVoicesColumns';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';

// Mock language flag util
vi.mock('~/utils/agentUtils', () => ({
	getLanguageFlagEmoji: () => '🇺🇸',
}));

type ColumnWithAccessorKey = ColumnDef<AgentVoiceModel> & {
	accessorKey?: string;
};

const renderCell = (cellContent: React.ReactNode) => {
	return render(<MantineProvider>{cellContent}</MantineProvider>);
};

const createMockRow = (
	data: Partial<AgentVoiceModel>
): Row<AgentVoiceModel> => {
	const defaultVoice: AgentVoiceModel = {
		id: 1,
		voiceId: 'v-123',
		clientId: 1,
		userId: 1,
		voice: {
			id: 'voice-1',
			name: 'Test Voice',
			gender: 'MALE',
			description: 'A test voice',
			language: 'English',
			age: '30',
			previewUrl: 'https://example.com/preview.mp3',
			accent: 'US',
			status: 'ACTIVE',
			userId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		},
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
		...data,
	};

	return {
		original: defaultVoice,
		getValue: vi.fn(),
	} as unknown as Row<AgentVoiceModel>;
};

// previously removed helper
describe('useAgentVoicesColumns', () => {
	it('returns two columns with the expected headers', () => {
		const { result } = renderHook(() =>
			useAgentVoicesColumns({
				onPlayVoice: vi.fn(),
				playingVoiceId: null,
				playProgress: 0,
			})
		);

		expect(result.current).toHaveLength(2);
		const columns = result.current as ColumnWithAccessorKey[];
		expect(columns[0].accessorKey).toBe('voice');
		expect(columns[0].header).toBe('Voice');
		expect(columns[1].id).toBe('controls');
		expect(columns[1].header).toBe('Preview');
	});

	it('renders voice name, language and gender badge in the voice cell', () => {
		const { result } = renderHook(() =>
			useAgentVoicesColumns({
				onPlayVoice: vi.fn(),
				playingVoiceId: null,
				playProgress: 0,
			})
		);
		const voiceColumn = result.current[0];
		const row = createMockRow({});

		const cellFn = voiceColumn.cell as (
			props: CellContext<AgentVoiceModel, unknown>
		) => React.ReactNode;

		renderCell(cellFn({ row } as CellContext<AgentVoiceModel, unknown>));

		expect(screen.getByText('Test Voice')).toBeInTheDocument();
		expect(screen.getByText('English')).toBeInTheDocument();
		// Badge shows the original gender value
		expect(screen.getByText('MALE')).toBeInTheDocument();
	});

	it('calls onPlayVoice when play button clicked and shows progress when playing', () => {
		const onPlayVoice = vi.fn();

		// initial: not playing
		const { result, rerender } = renderHook(
			({ playingVoiceId, playProgress }) =>
				useAgentVoicesColumns({ onPlayVoice, playingVoiceId, playProgress }),
			{ initialProps: { playingVoiceId: null, playProgress: 0 } }
		);

		const controlsColumn = result.current[1];
		const row = createMockRow({});

		const cellFn = controlsColumn.cell as (
			props: CellContext<AgentVoiceModel, unknown>
		) => React.ReactNode;

		renderCell(cellFn({ row } as CellContext<AgentVoiceModel, unknown>));

		const playButton = screen.getByLabelText('Play voice preview');
		fireEvent.click(playButton);
		expect(onPlayVoice).toHaveBeenCalledWith(
			'voice-1',
			'https://example.com/preview.mp3'
		);

		// Rerender hook as playing
		rerender({ playingVoiceId: 'voice-1', playProgress: 50 } as any);
		const playingControls = result.current[1];
		const playingCellFn = playingControls.cell as (
			props: CellContext<AgentVoiceModel, unknown>
		) => React.ReactNode;
		renderCell(playingCellFn({ row } as CellContext<AgentVoiceModel, unknown>));

		const pauseButton = screen.getByLabelText('Pause voice preview');
		expect(pauseButton).toBeInTheDocument();

		const progress = screen.getByRole('progressbar');
		expect(progress).toHaveAttribute('aria-valuenow', '50');
	});

	it('is memoized and returns same reference if props do not change', () => {
		const { result, rerender } = renderHook(
			({ playingVoiceId, playProgress }) =>
				useAgentVoicesColumns({
					onPlayVoice: vi.fn(),
					playingVoiceId,
					playProgress,
				}),
			{ initialProps: { playingVoiceId: null, playProgress: 0 } }
		);

		const first = result.current;
		rerender({ playingVoiceId: null, playProgress: 0 });
		const second = result.current;
		expect(first).toBe(second);
	});

	it('returns new reference when playingVoiceId changes', () => {
		const { result, rerender } = renderHook(
			({ playingVoiceId, playProgress }) =>
				useAgentVoicesColumns({
					onPlayVoice: vi.fn(),
					playingVoiceId,
					playProgress,
				}),
			{ initialProps: { playingVoiceId: null, playProgress: 0 } }
		);

		const first = result.current;
		rerender({ playingVoiceId: 'some-other-id', playProgress: 0 } as any);
		const second = result.current;
		expect(first).not.toBe(second);
	});
});

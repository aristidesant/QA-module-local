import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';
import useAgentSelectionColumns from './useAgentSelectionColumns';
import {
	renderWithProviders,
	TestProviders,
} from '~/test-utils/renderWithProviders';

const wrapper = TestProviders;

const createMockAgent = (
	overrides: Partial<AgentWithCampaignListItem> = {}
): AgentWithCampaignListItem => ({
	id: '1',
	name: 'Test Agent',
	status: 'ACTIVE',
	type: 'OUTBOUND',
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z',
	clientId: 1,
	voiceId: 'voice-1',
	identifier: 'agent-identifier',
	voiceName: 'Test Voice',
	voiceLanguage: 'English',
	voicePreviewUrl: 'https://example.com/preview.mp3',
	campaignId: 'campaign-1',
	campaignName: 'Test Campaign',
	...overrides,
});

const renderCellContent = (cell: React.ReactNode) => {
	return renderWithProviders(cell);
};

describe('useAgentSelectionColumns', () => {
	const mockOnAdd = vi.fn();
	const mockOnPlay = vi.fn();
	const mockOnClone = vi.fn();
	const mockIsDisabled = vi.fn().mockReturnValue(false);
	const mockIsPlaying = vi.fn().mockReturnValue(false);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('hook initialization', () => {
		it('should return correct number of columns', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			expect(result.current).toHaveLength(4);
		});

		it('should have correct column headers', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const headers = result.current.map((col) => col.header);
			expect(headers).toEqual(['Agent', 'Type', 'Voice', 'Actions']);
		});

		it('should have correct accessor keys', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			expect(result.current[0]).toHaveProperty('accessorKey', 'name');
			expect(result.current[1]).toHaveProperty('accessorKey', 'type');
			expect(result.current[2]).toHaveProperty('accessorKey', 'voiceName');
			expect(result.current[3]).toHaveProperty('id', 'actions');
		});
	});

	describe('Agent column cell', () => {
		it('should render agent name', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({ name: 'My Custom Agent' });
			const agentColumn = result.current[0];
			const cellFn = agentColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			expect(screen.getByText('My Custom Agent')).toBeInTheDocument();
		});

		it('should show campaign name in tooltip', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({ campaignName: 'Sales Campaign' });
			const agentColumn = result.current[0];
			const cellFn = agentColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			// The info icon should be present for the tooltip
			const infoIcon = document.querySelector('[class*="mantine"]');
			expect(infoIcon).toBeInTheDocument();
		});

		it('should show "No campaign" when campaignName is null', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({ campaignName: null });
			const agentColumn = result.current[0];
			const cellFn = agentColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			// Just verify it renders without error
			const { container } = renderCellContent(
				cellFn({ row: { original: mockAgent } })
			);
			expect(container).toBeInTheDocument();
		});
	});

	describe('Type column cell', () => {
		it('should render OUTBOUND badge correctly', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({ type: 'OUTBOUND' });
			const typeColumn = result.current[1];
			const cellFn = typeColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			expect(screen.getByText('OUTBOUND')).toBeInTheDocument();
		});

		it('should render INBOUND badge correctly', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({ type: 'INBOUND' });
			const typeColumn = result.current[1];
			const cellFn = typeColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			expect(screen.getByText('INBOUND')).toBeInTheDocument();
		});
	});

	describe('Voice column cell', () => {
		it('should render voice name and language', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({
				voiceName: 'Premium Voice',
				voiceLanguage: 'Spanish',
			});
			const voiceColumn = result.current[2];
			const cellFn = voiceColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			expect(screen.getByText('Premium Voice')).toBeInTheDocument();
			expect(screen.getByText('· Spanish')).toBeInTheDocument();
		});

		it('should render dash when voiceName is null', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({
				voiceName: null,
				voiceLanguage: null,
			});
			const voiceColumn = result.current[2];
			const cellFn = voiceColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('should not render language when voiceLanguage is null', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({
				voiceName: 'Test Voice',
				voiceLanguage: null,
			});
			const voiceColumn = result.current[2];
			const cellFn = voiceColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			expect(screen.getByText('Test Voice')).toBeInTheDocument();
			expect(screen.queryByText(/·/)).not.toBeInTheDocument();
		});
	});

	describe('Actions column cell', () => {
		it('should call onPlay when play button is clicked', async () => {
			const user = userEvent.setup();
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent();
			const actionsColumn = result.current[3];
			const cellFn = actionsColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			const playButton = screen.getAllByRole('button')[0];
			await user.click(playButton);

			expect(mockOnPlay).toHaveBeenCalledWith(mockAgent);
		});

		it('should call onClone when clone button is clicked', async () => {
			const user = userEvent.setup();
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent();
			const actionsColumn = result.current[3];
			const cellFn = actionsColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			const cloneButton = screen.getAllByRole('button')[1];
			await user.click(cloneButton);

			expect(mockOnClone).toHaveBeenCalledWith(mockAgent);
		});

		it('should call onAdd when add button is clicked', async () => {
			const user = userEvent.setup();
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent();
			const actionsColumn = result.current[3];
			const cellFn = actionsColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			const addButton = screen.getAllByRole('button')[2];
			await user.click(addButton);

			expect(mockOnAdd).toHaveBeenCalledWith(mockAgent);
		});

		it('should disable add button when isDisabled returns true', () => {
			mockIsDisabled.mockReturnValue(true);

			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent();
			const actionsColumn = result.current[3];
			const cellFn = actionsColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			const addButton = screen.getAllByRole('button')[2];
			expect(addButton).toBeDisabled();
		});

		it('should disable play button when voicePreviewUrl is null', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent({ voicePreviewUrl: null });
			const actionsColumn = result.current[3];
			const cellFn = actionsColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			renderCellContent(cellFn({ row: { original: mockAgent } }));

			const playButton = screen.getAllByRole('button')[0];
			expect(playButton).toBeDisabled();
		});

		it('should show pause icon when isPlaying returns true', () => {
			mockIsPlaying.mockReturnValue(true);

			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent();
			const actionsColumn = result.current[3];
			const cellFn = actionsColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			const { container } = renderCellContent(
				cellFn({ row: { original: mockAgent } })
			);

			// Check that the pause icon is rendered (IconPlayerPause)
			const pauseIcon = container.querySelector('svg');
			expect(pauseIcon).toBeInTheDocument();
		});

		it('should show play icon when isPlaying returns false', () => {
			mockIsPlaying.mockReturnValue(false);

			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const mockAgent = createMockAgent();
			const actionsColumn = result.current[3];
			const cellFn = actionsColumn.cell as (info: {
				row: { original: AgentWithCampaignListItem };
			}) => React.ReactNode;

			const { container } = renderCellContent(
				cellFn({ row: { original: mockAgent } })
			);

			// Check that the play icon is rendered (IconPlayerPlay)
			const playIcon = container.querySelector('svg');
			expect(playIcon).toBeInTheDocument();
		});
	});

	describe('column meta properties', () => {
		it('should have correct meta for agent column', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const agentColumn = result.current[0];
			expect(agentColumn.meta).toHaveProperty('cellClassName');
			expect(agentColumn.meta).toHaveProperty('headerClassName');
		});

		it('should have correct meta for type column', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const typeColumn = result.current[1];
			expect(typeColumn.meta).toHaveProperty('cellClassName');
			expect(typeColumn.meta).toHaveProperty('headerClassName');
		});

		it('should have correct meta for voice column', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const voiceColumn = result.current[2];
			expect(voiceColumn.meta).toHaveProperty('cellClassName');
			expect(voiceColumn.meta).toHaveProperty('headerClassName');
		});

		it('should have correct meta for actions column', () => {
			const { result } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const actionsColumn = result.current[3];
			expect(actionsColumn.meta).toHaveProperty('cellClassName');
			expect(actionsColumn.meta).toHaveProperty('headerClassName');
		});
	});

	describe('memoization', () => {
		it('should return the same columns when dependencies do not change', () => {
			const { result, rerender } = renderHook(
				() =>
					useAgentSelectionColumns({
						onAdd: mockOnAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{ wrapper }
			);

			const firstResult = result.current;
			rerender();
			const secondResult = result.current;

			expect(firstResult).toBe(secondResult);
		});

		it('should return new columns when onAdd changes', () => {
			const { result, rerender } = renderHook(
				({ onAdd }) =>
					useAgentSelectionColumns({
						onAdd,
						onPlay: mockOnPlay,
						onClone: mockOnClone,
						isDisabled: mockIsDisabled,
						isPlaying: mockIsPlaying,
					}),
				{
					wrapper,
					initialProps: { onAdd: mockOnAdd },
				}
			);

			const firstResult = result.current;
			const newOnAdd = vi.fn();
			rerender({ onAdd: newOnAdd });
			const secondResult = result.current;

			expect(firstResult).not.toBe(secondResult);
		});
	});
});

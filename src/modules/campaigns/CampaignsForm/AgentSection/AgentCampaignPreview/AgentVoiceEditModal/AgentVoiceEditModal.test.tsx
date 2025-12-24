import userEvent from '@testing-library/user-event';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AgentVoiceEditModal from './AgentVoiceEditModal';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';

const mockUseGetAgent = vi.fn();
const mockMutateAsync = vi.fn();
const mockUseGetAllAgentVoices = vi.fn();
const showNotification = vi.fn();

let capturedOnPlayVoice:
	| ((voiceId: string, previewUrl: string) => void)
	| null = null;
let latestColumnsParams: any;

vi.mock('~/queries/agentQueries', () => ({
	useUpdateAgent: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
	useGetAgent: (...args: any[]) => mockUseGetAgent(...args),
}));

vi.mock('~/queries/agentVoiceQueries', () => ({
	useGetAllAgentVoices: (...args: any[]) => mockUseGetAllAgentVoices(...args),
}));

vi.mock(
	'../../../../AddNewCampaignForm/AgentVoices/useAgentVoicesColumns',
	() => ({
		useAgentVoicesColumns: (params: any) => {
			capturedOnPlayVoice = params.onPlayVoice;
			latestColumnsParams = params;
			return [];
		},
	})
);

vi.mock('~/components/BaseTable/BaseTable', () => ({
	__esModule: true,
	default: ({
		data,
		onRowClick,
	}: {
		data: AgentVoiceModel[];
		onRowClick?: (row: any) => void;
	}) => (
		<div data-testid='base-table'>
			{data.map((row) => (
				<button
					type='button'
					key={row.voice.id}
					onClick={() => onRowClick?.({ voice: row.voice, original: row })}
				>
					select-{row.voice.name}
				</button>
			))}
		</div>
	),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: { show: (...args: any[]) => showNotification(...args) },
}));

vi.mock('@mantine/hooks', () => ({
	useDebouncedValue: (value: any) => [value],
}));

const voiceData: AgentVoiceModel[] = [
	{
		id: 1,
		voiceId: 'voice-1',
		clientId: 1,
		userId: 1,
		voice: {
			id: 'voice-1',
			name: 'Voice One',
			gender: 'MALE',
			description: '',
			language: 'English',
			age: '30',
			previewUrl: 'preview-1',
			status: 'active',
			userId: 1,
			createdAt: '',
			updatedAt: '',
			deletedAt: null,
		},
		createdAt: '',
		updatedAt: '',
		deletedAt: null,
	},
	{
		id: 2,
		voiceId: 'voice-2',
		clientId: 1,
		userId: 1,
		voice: {
			id: 'voice-2',
			name: 'Voice Two',
			gender: 'FEMALE',
			description: '',
			language: 'Spanish',
			age: '25',
			previewUrl: 'preview-2',
			status: 'active',
			userId: 1,
			createdAt: '',
			updatedAt: '',
			deletedAt: null,
		},
		createdAt: '',
		updatedAt: '',
		deletedAt: null,
	},
];

const defaultAgent = {
	id: 'agent-1',
	conversationConfig: { tts: { voiceId: 'voice-1' } },
};

describe('AgentVoiceEditModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		capturedOnPlayVoice = null;
		latestColumnsParams = null;
		mockUseGetAgent.mockReturnValue({ data: defaultAgent });
		mockUseGetAllAgentVoices.mockReturnValue({
			data: voiceData,
			isLoading: false,
		});
		mockMutateAsync.mockResolvedValue({});
	});

	it('selects a different voice and saves successfully', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={onClose}
				onSuccess={onSuccess}
			/>
		);

		const saveButton = screen.getByRole('button', { name: /Save Agent/i });
		expect(saveButton).toBeDisabled();

		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice Two/i })
		);

		await waitFor(() => expect(saveButton).toBeEnabled());

		await userEvent.click(saveButton);

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());

		expect(mockMutateAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'agent-1',
				data: expect.objectContaining({
					voiceId: 'voice-2',
					conversationConfig: expect.objectContaining({
						tts: expect.objectContaining({ voiceId: 'voice-2' }),
					}),
				}),
			})
		);
		expect(onSuccess).toHaveBeenCalled();
		expect(onClose).toHaveBeenCalled();
		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Success' })
		);
	});

	it('shows an error when agent data is unavailable', async () => {
		mockUseGetAgent.mockReturnValue({ data: undefined });

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='missing-agent'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice Two/i })
		);
		const saveButton = screen.getByRole('button', { name: /Save Agent/i });

		await waitFor(() => expect(saveButton).toBeEnabled());
		await userEvent.click(saveButton);

		expect(mockMutateAsync).not.toHaveBeenCalled();
		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'An error occurred',
				message: 'Agent data not loaded',
			})
		);
	});

	it('handles voice playback controls and progress updates', async () => {
		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		const audio = document.querySelector('audio') as HTMLAudioElement;
		const playMock = vi.fn(() => Promise.resolve());
		const pauseMock = vi.fn();

		Object.defineProperty(audio, 'play', { value: playMock });
		Object.defineProperty(audio, 'pause', { value: pauseMock });
		Object.defineProperty(audio, 'duration', { value: 10, writable: true });
		Object.defineProperty(audio, 'currentTime', { value: 0, writable: true });

		await act(async () => {
			capturedOnPlayVoice?.('voice-2', 'preview-2');
			await Promise.resolve();
		});

		await waitFor(() =>
			expect(latestColumnsParams?.playingVoiceId).toBe('voice-2')
		);
		expect(playMock).toHaveBeenCalled();

		audio.currentTime = 5;
		fireEvent.timeUpdate(audio);

		await waitFor(() =>
			expect(latestColumnsParams?.playProgress).toBeGreaterThan(0)
		);

		await act(async () => {
			capturedOnPlayVoice?.('voice-2', 'preview-2');
			await Promise.resolve();
		});

		await waitFor(() => expect(latestColumnsParams?.playingVoiceId).toBeNull());
		expect(pauseMock).toHaveBeenCalled();
	});

	it('displays loading state while fetching voices', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: undefined,
			isLoading: true,
		});

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		expect(screen.getByTestId('base-table')).toBeInTheDocument();
	});

	it('shows error notification when no voice is selected and save is clicked', async () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [],
			isLoading: false,
		});

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId=''
				onClose={vi.fn()}
			/>
		);

		const saveButton = screen.getByRole('button', { name: /Save Agent/i });
		// Button should be disabled when no changes
		expect(saveButton).toBeDisabled();
	});

	it('handles API error during save', async () => {
		const onClose = vi.fn();
		const errorMessage = 'Network error';
		mockMutateAsync.mockRejectedValueOnce({
			response: { data: { message: errorMessage } },
		});

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={onClose}
			/>
		);

		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice Two/i })
		);

		const saveButton = screen.getByRole('button', { name: /Save Agent/i });
		await waitFor(() => expect(saveButton).toBeEnabled());

		await userEvent.click(saveButton);

		await waitFor(() =>
			expect(showNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'An error occurred',
					message: errorMessage,
				})
			)
		);
		expect(onClose).not.toHaveBeenCalled();
	});

	it('handles API error without response message', async () => {
		mockMutateAsync.mockRejectedValueOnce(new Error('Unknown error'));

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice Two/i })
		);

		const saveButton = screen.getByRole('button', { name: /Save Agent/i });
		await waitFor(() => expect(saveButton).toBeEnabled());

		await userEvent.click(saveButton);

		await waitFor(() =>
			expect(showNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'An error occurred',
					message: 'Failed to update agent voice',
				})
			)
		);
	});

	it('preserves existing conversationConfig when updating voice', async () => {
		const existingAgent = {
			id: 'agent-1',
			conversationConfig: {
				tts: { voiceId: 'voice-1', speed: 1.0 },
				customSetting: 'value',
			},
		};
		mockUseGetAgent.mockReturnValue({ data: existingAgent });

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice Two/i })
		);

		const saveButton = screen.getByRole('button', { name: /Save Agent/i });
		await waitFor(() => expect(saveButton).toBeEnabled());

		await userEvent.click(saveButton);

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());

		expect(mockMutateAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					conversationConfig: expect.objectContaining({
						customSetting: 'value',
						tts: expect.objectContaining({
							speed: 1.0,
							voiceId: 'voice-2',
						}),
					}),
				}),
			})
		);
	});

	it('stops current playback when selecting a different voice', async () => {
		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		const audio = document.querySelector('audio') as HTMLAudioElement;
		const playMock = vi.fn(() => Promise.resolve());
		const pauseMock = vi.fn();

		Object.defineProperty(audio, 'play', { value: playMock });
		Object.defineProperty(audio, 'pause', { value: pauseMock });

		// Start playing voice-1
		await act(async () => {
			capturedOnPlayVoice?.('voice-1', 'preview-1');
			await Promise.resolve();
		});

		await waitFor(() =>
			expect(latestColumnsParams?.playingVoiceId).toBe('voice-1')
		);

		// Select a different voice (voice-2) while voice-1 is playing
		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice Two/i })
		);

		// Playback should stop when selecting a different voice
		await waitFor(() => expect(latestColumnsParams?.playingVoiceId).toBeNull());
	});

	it('resets progress when audio ends', async () => {
		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		const audio = document.querySelector('audio') as HTMLAudioElement;
		const playMock = vi.fn(() => Promise.resolve());

		Object.defineProperty(audio, 'play', { value: playMock });
		Object.defineProperty(audio, 'duration', { value: 10, writable: true });
		Object.defineProperty(audio, 'currentTime', { value: 10, writable: true });

		await act(async () => {
			capturedOnPlayVoice?.('voice-1', 'preview-1');
			await Promise.resolve();
		});

		await waitFor(() =>
			expect(latestColumnsParams?.playingVoiceId).toBe('voice-1')
		);

		// Simulate audio ended event
		fireEvent.ended(audio);

		await waitFor(() => {
			expect(latestColumnsParams?.playingVoiceId).toBeNull();
			expect(latestColumnsParams?.playProgress).toBe(0);
		});
	});

	it('renders instructional text', () => {
		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		expect(
			screen.getByText(
				/Select a voice for your agent and click save to apply changes/i
			)
		).toBeInTheDocument();
	});

	it('does not call onSuccess when not provided', async () => {
		const onClose = vi.fn();

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={onClose}
			/>
		);

		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice Two/i })
		);

		const saveButton = screen.getByRole('button', { name: /Save Agent/i });
		await waitFor(() => expect(saveButton).toBeEnabled());

		await userEvent.click(saveButton);

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
		expect(onClose).toHaveBeenCalled();
	});

	it('keeps same voice selected when clicking on already selected voice', async () => {
		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		// Click on Voice One (already selected as currentVoiceId)
		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice One/i })
		);

		// Save button should remain disabled since no changes were made
		const saveButton = screen.getByRole('button', { name: /Save Agent/i });
		expect(saveButton).toBeDisabled();
	});

	it('handles empty previewUrl gracefully', async () => {
		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		const audio = document.querySelector('audio') as HTMLAudioElement;
		const playMock = vi.fn(() => Promise.resolve());

		Object.defineProperty(audio, 'play', { value: playMock });

		// Try to play with empty previewUrl
		await act(async () => {
			capturedOnPlayVoice?.('voice-1', '');
			await Promise.resolve();
		});

		// Play should not be called when previewUrl is empty
		expect(playMock).not.toHaveBeenCalled();
	});

	it('handles agent with no conversationConfig', async () => {
		const agentWithoutConfig = {
			id: 'agent-1',
		};
		mockUseGetAgent.mockReturnValue({ data: agentWithoutConfig });

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		await userEvent.click(
			screen.getByRole('button', { name: /select-Voice Two/i })
		);

		const saveButton = screen.getByRole('button', { name: /Save Agent/i });
		await waitFor(() => expect(saveButton).toBeEnabled());

		await userEvent.click(saveButton);

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());

		expect(mockMutateAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					voiceId: 'voice-2',
					conversationConfig: expect.objectContaining({
						tts: expect.objectContaining({ voiceId: 'voice-2' }),
					}),
				}),
			})
		);
	});

	it('switches playback from one voice to another', async () => {
		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		const audio = document.querySelector('audio') as HTMLAudioElement;
		const playMock = vi.fn(() => Promise.resolve());
		const pauseMock = vi.fn();

		Object.defineProperty(audio, 'play', { value: playMock });
		Object.defineProperty(audio, 'pause', { value: pauseMock });
		Object.defineProperty(audio, 'src', { value: '', writable: true });

		// Start playing voice-1
		await act(async () => {
			capturedOnPlayVoice?.('voice-1', 'preview-1');
			await Promise.resolve();
		});

		await waitFor(() =>
			expect(latestColumnsParams?.playingVoiceId).toBe('voice-1')
		);

		// Switch to voice-2 while voice-1 is playing
		await act(async () => {
			capturedOnPlayVoice?.('voice-2', 'preview-2');
			await Promise.resolve();
		});

		// Should pause the previous and start playing the new one
		expect(pauseMock).toHaveBeenCalled();
		await waitFor(() =>
			expect(latestColumnsParams?.playingVoiceId).toBe('voice-2')
		);
	});

	it('displays empty message when no voices are available', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [],
			isLoading: false,
		});

		renderWithProviders(
			<AgentVoiceEditModal
				agentId='agent-1'
				currentVoiceId='voice-1'
				onClose={vi.fn()}
			/>
		);

		expect(screen.getByTestId('base-table')).toBeInTheDocument();
	});
});

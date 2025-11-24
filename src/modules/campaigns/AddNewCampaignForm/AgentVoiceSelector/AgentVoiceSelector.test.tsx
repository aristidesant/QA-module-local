import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import AgentVoiceSelector from './AgentVoiceSelector';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';

const mockUseGetAllAgentVoices = vi.fn();
vi.mock('~/queries/agentVoiceQueries', () => ({
	useGetAllAgentVoices: (...args: any[]) => mockUseGetAllAgentVoices(...args),
}));

// Replace VoiceMiniPlayer and VoiceList to simplify interactions
vi.mock('~/components/VoiceMiniPlayer', () => ({
	VoiceMiniPlayer: ({ voiceUrl }: any) => (
		<div data-testid='voice-mini-player'>{voiceUrl}</div>
	),
}));

vi.mock('./VoiceList', () => ({
	default: ({ voices, onVoiceSelect }: any) => (
		<div data-testid='voice-list'>
			{voices.map((v: any) => (
				<button key={v.voice.id} onClick={() => onVoiceSelect(v.voice.id)}>
					Select {v.voice.name}
				</button>
			))}
		</div>
	),
}));

// Mock Modal to inline render children
vi.mock('@mantine/core', async () => {
	const actual = await vi.importActual<any>('@mantine/core');
	return {
		...actual,
		Modal: ({ opened, onClose, children }: any) =>
			opened ? (
				<div>
					<button onClick={onClose} data-testid='modal-close-btn'>
						Close Modal
					</button>
					{children}
				</div>
			) : null,
	};
});

describe('AgentVoiceSelector', () => {
	beforeEach(() => vi.clearAllMocks());

	it('shows loading state', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: null,
			isLoading: true,
			isError: false,
		});

		render(
			<MantineProvider>
				<AgentVoiceSelector onSelect={vi.fn()} />
			</MantineProvider>
		);

		expect(screen.getByText('Loading voices...')).toBeInTheDocument();
	});

	it('shows error state', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: null,
			isLoading: false,
			isError: true,
		});

		render(
			<MantineProvider>
				<AgentVoiceSelector onSelect={vi.fn()} />
			</MantineProvider>
		);

		expect(screen.getByText('Failed to load voices')).toBeInTheDocument();
	});

	it('opens modal and selects a voice', () => {
		const agentVoice: AgentVoiceModel = {
			id: 1,
			voiceId: 'voice-1',
			clientId: 1,
			userId: 1,
			voice: {
				id: 'voice-1',
				name: 'Voice One',
				gender: 'MALE',
				description: 'desc',
				language: 'en',
				age: '30',
				previewUrl: 'https://preview',
				status: 'active',
				userId: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		} as unknown as AgentVoiceModel;

		mockUseGetAllAgentVoices.mockReturnValue({
			data: [agentVoice],
			isLoading: false,
			isError: false,
		});

		const onSelect = vi.fn();
		render(
			<MantineProvider>
				<AgentVoiceSelector onSelect={onSelect} />
			</MantineProvider>
		);

		// Click the empty card to open the modal
		fireEvent.click(screen.getByText('Select a voice'));

		// Click the mocked voice list button
		fireEvent.click(screen.getByText('Select Voice One'));

		expect(onSelect).toHaveBeenCalledWith(
			expect.objectContaining({
				voice: expect.objectContaining({ id: 'voice-1' }),
			})
		);
	});

	it('renders selected voice and change triggers modal', () => {
		const agentVoice: AgentVoiceModel = {
			id: 1,
			voiceId: 'voice-1',
			clientId: 1,
			userId: 1,
			voice: {
				id: 'voice-1',
				name: 'Voice One',
				gender: 'MALE',
				description: 'desc',
				language: 'en',
				age: '30',
				previewUrl: 'https://preview',
				status: 'active',
				userId: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		} as unknown as AgentVoiceModel;

		mockUseGetAllAgentVoices.mockReturnValue({
			data: [agentVoice],
			isLoading: false,
			isError: false,
		});

		const onSelect = vi.fn();
		render(
			<MantineProvider>
				<AgentVoiceSelector onSelect={onSelect} selectedVoiceId='voice-1' />
			</MantineProvider>
		);

		expect(screen.getByText('Voice One')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Change'));
		fireEvent.click(screen.getByText('Select Voice One'));
		expect(onSelect).toHaveBeenCalled();
	});
});

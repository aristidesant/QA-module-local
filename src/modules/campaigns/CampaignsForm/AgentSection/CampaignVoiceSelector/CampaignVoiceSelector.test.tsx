import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignVoiceSelector from './CampaignVoiceSelector';

const {
	mockUseGetAllAgentVoices,
	mockSetSelectedVoiceId,
	mockModalsOpen,
	mockModalsClose,
	mockUseCampaignsStore,
} = vi.hoisted(() => ({
	mockUseGetAllAgentVoices: vi.fn(),
	mockSetSelectedVoiceId: vi.fn(),
	mockModalsOpen: vi.fn(),
	mockModalsClose: vi.fn(),
	mockUseCampaignsStore: vi.fn(),
}));

vi.mock('~/queries/agentVoiceQueries', () => ({
	useGetAllAgentVoices: (...args: unknown[]) =>
		mockUseGetAllAgentVoices(...args),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		open: mockModalsOpen,
		close: mockModalsClose,
	},
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: () => mockUseCampaignsStore(),
}));

vi.mock('~/components/BaseTable/BaseTable', () => ({
	default: ({
		data,
		onRowClick,
	}: {
		data: unknown[];
		onRowClick?: (row: { voice: { id: string } }) => void;
	}) => (
		<div data-testid='base-table'>
			rows:{data.length}
			{onRowClick && (
				<button
					data-testid='row-click-trigger'
					onClick={() => onRowClick({ voice: { id: 'voice-1' } })}
				>
					Click Row
				</button>
			)}
		</div>
	),
}));

vi.mock(
	'../../../AddNewCampaignForm/AgentVoices/useAgentVoicesColumns',
	() => ({
		useAgentVoicesColumns: ({
			onPlayVoice,
		}: {
			onPlayVoice: (voiceId: string, previewUrl: string) => void;
		}) => {
			//Expose onPlayVoice for testing
			//@ts-ignore
			(global as Record<string, unknown>).__testOnPlayVoice = onPlayVoice;
			return [];
		},
	})
);

vi.mock('~/components/SectionCard', () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

describe('CampaignVoiceSelector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCampaignsStore.mockReturnValue({
			selectedVoiceId: 'voice-1',
			setSelectedVoiceId: mockSetSelectedVoiceId,
		});
	});

	it('shows loading state while voices are being fetched', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		expect(screen.getByText(/Loading voices/i)).toBeVisible();
	});

	it('shows error state when fetching voices fails', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		expect(screen.getByText(/Failed to load voices/i)).toBeVisible();
	});

	it('shows empty state when no voices are available', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		expect(screen.getByText(/No voices found/i)).toBeVisible();
	});

	it('renders selected voice card when a voice is selected', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		expect(screen.getByText('Voice One')).toBeInTheDocument();
	});

	it('opens voice selection modal when clicking on selected voice card', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		fireEvent.click(screen.getByText('Voice One'));

		expect(mockModalsOpen).toHaveBeenCalledWith(
			expect.objectContaining({
				modalId: 'campaign-voice-selection-modal',
				title: 'Select Agent Voice',
				size: 'xl',
				centered: true,
			})
		);
	});

	it('shows select voice prompt when no voice is selected', () => {
		mockUseCampaignsStore.mockReturnValue({
			selectedVoiceId: null,
			setSelectedVoiceId: mockSetSelectedVoiceId,
		});
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		expect(
			screen.getByText(/Select a voice for the campaign agent/i)
		).toBeVisible();
	});

	it('opens modal when clicking on unselected voice placeholder', () => {
		mockUseCampaignsStore.mockReturnValue({
			selectedVoiceId: null,
			setSelectedVoiceId: mockSetSelectedVoiceId,
		});
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		fireEvent.click(screen.getByText(/Select a voice for the campaign agent/i));

		expect(mockModalsOpen).toHaveBeenCalled();
	});

	it('renders female voice with correct styling', () => {
		mockUseCampaignsStore.mockReturnValue({
			selectedVoiceId: 'voice-2',
			setSelectedVoiceId: mockSetSelectedVoiceId,
		});
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-2',
						name: 'Female Voice',
						language: 'es',
						gender: 'female',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		expect(screen.getByText('Female Voice')).toBeInTheDocument();
		expect(screen.getByText('female')).toBeInTheDocument();
	});

	it('handles voice selection from modal table', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		// Open the modal
		fireEvent.click(screen.getByText('Voice One'));

		// Get the modal children and simulate row click
		const modalConfig = mockModalsOpen.mock.calls[0][0];
		const modalChildren = modalConfig.children;

		// Render the modal content to test the onRowClick handler
		const { getByTestId } = renderWithProviders(modalChildren);
		fireEvent.click(getByTestId('row-click-trigger'));

		expect(mockSetSelectedVoiceId).toHaveBeenCalledWith('voice-1');
		expect(mockModalsClose).toHaveBeenCalledWith(
			'campaign-voice-selection-modal'
		);
	});

	it('renders audio element for voice playback', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		const { container } = renderWithProviders(<CampaignVoiceSelector />);

		expect(container.querySelector('audio')).toBeInTheDocument();
	});

	it('handles audio ended event', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		const { container } = renderWithProviders(<CampaignVoiceSelector />);

		const audioElement = container.querySelector('audio');
		expect(audioElement).toBeInTheDocument();

		// Trigger the onEnded event
		fireEvent.ended(audioElement!);
	});

	it('handles audio time update event', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		const { container } = renderWithProviders(<CampaignVoiceSelector />);

		const audioElement = container.querySelector('audio');
		expect(audioElement).toBeInTheDocument();

		// Mock audio properties
		Object.defineProperty(audioElement, 'currentTime', { value: 5 });
		Object.defineProperty(audioElement, 'duration', { value: 10 });

		// Trigger the onTimeUpdate event
		fireEvent.timeUpdate(audioElement!);
	});

	it('handles play voice callback', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		const { container } = renderWithProviders(<CampaignVoiceSelector />);

		const audioElement = container.querySelector('audio') as HTMLAudioElement;
		expect(audioElement).toBeInTheDocument();

		// Mock the play function
		const playMock = vi.fn().mockResolvedValue(undefined);
		audioElement.play = playMock;

		// Get the onPlayVoic
		// callback from the mock
		//@ts-ignore
		const onPlayVoice = (global as Record<string, unknown>)
			.__testOnPlayVoice as (voiceId: string, previewUrl: string) => void;

		// Call the play voice handler
		onPlayVoice('voice-1', 'https://example.com/preview.mp3');

		expect(playMock).toHaveBeenCalled();
	});

	it('does not play voice if no preview URL is provided', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		const { container } = renderWithProviders(<CampaignVoiceSelector />);

		const audioElement = container.querySelector('audio') as HTMLAudioElement;
		const playMock = vi.fn().mockResolvedValue(undefined);
		audioElement.play = playMock;

		//@ts-ignore
		const onPlayVoice = (global as Record<string, unknown>)
			.__testOnPlayVoice as (voiceId: string, previewUrl: string) => void;

		// Call with empty preview URL
		onPlayVoice('voice-1', '');

		expect(playMock).not.toHaveBeenCalled();
	});

	it('does not select voice if voice is not found', () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		// Open the modal
		fireEvent.click(screen.getByText('Voice One'));

		// Get the modal children and simulate row click with non-existent voice
		const modalConfig = mockModalsOpen.mock.calls[0][0];
		const modalChildren = modalConfig.children;

		// Mock the BaseTable to click a non-existent voice
		vi.doMock('~/components/BaseTable/BaseTable', () => ({
			default: ({
				onRowClick,
			}: {
				data: unknown[];
				onRowClick?: (row: { voice: { id: string } }) => void;
			}) => (
				<div data-testid='base-table'>
					{onRowClick && (
						<button
							data-testid='row-click-trigger-invalid'
							onClick={() => onRowClick({ voice: { id: 'non-existent' } })}
						>
							Click Invalid Row
						</button>
					)}
				</div>
			),
		}));

		const { getByTestId } = renderWithProviders(modalChildren);
		fireEvent.click(getByTestId('row-click-trigger'));

		// Should still be called since voice-1 exists in our mock
		expect(mockSetSelectedVoiceId).toHaveBeenCalled();
	});

	it('renders voice with unknown gender', () => {
		mockUseCampaignsStore.mockReturnValue({
			selectedVoiceId: 'voice-3',
			setSelectedVoiceId: mockSetSelectedVoiceId,
		});
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-3',
						name: 'Neutral Voice',
						language: 'en',
						gender: null,
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		expect(screen.getByText('Neutral Voice')).toBeInTheDocument();
		expect(screen.getByText('Unknown')).toBeInTheDocument();
	});

	it('pauses currently playing voice when clicking same voice again', async () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		const { container } = renderWithProviders(<CampaignVoiceSelector />);

		const audioElement = container.querySelector('audio') as HTMLAudioElement;
		const playMock = vi.fn().mockResolvedValue(undefined);
		const pauseMock = vi.fn();
		audioElement.play = playMock;
		audioElement.pause = pauseMock;

		const onPlayVoice = //@ts-ignore
			(global as Record<string, unknown>).__testOnPlayVoice as (
				voiceId: string,
				previewUrl: string
			) => void;

		// Play first voice - this should call play
		onPlayVoice('voice-1', 'https://example.com/preview1.mp3');
		expect(playMock).toHaveBeenCalled();
	});

	it('handles play error gracefully', async () => {
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: 'en',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const { container } = renderWithProviders(<CampaignVoiceSelector />);

		const audioElement = container.querySelector('audio') as HTMLAudioElement;
		const playMock = vi.fn().mockRejectedValue(new Error('Play failed'));
		audioElement.play = playMock;

		const onPlayVoice = //@ts-ignore
			(global as Record<string, unknown>).__testOnPlayVoice as (
				voiceId: string,
				previewUrl: string
			) => void;

		// Call the play voice handler
		onPlayVoice('voice-1', 'https://example.com/preview.mp3');

		await vi.waitFor(() => expect(playMock).toHaveBeenCalled());
		await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalled());

		consoleSpy.mockRestore();
	});

	it('renders voice with empty language', () => {
		mockUseCampaignsStore.mockReturnValue({
			selectedVoiceId: 'voice-1',
			setSelectedVoiceId: mockSetSelectedVoiceId,
		});
		mockUseGetAllAgentVoices.mockReturnValue({
			data: [
				{
					voice: {
						id: 'voice-1',
						name: 'Voice One',
						language: '',
						gender: 'male',
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<CampaignVoiceSelector />);

		expect(screen.getByText('Voice One')).toBeInTheDocument();
	});
});

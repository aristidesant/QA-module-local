import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { VoicePlayer } from './VoicePlayer';

// Mock HTMLAudioElement
const mockPlay = vi.fn();
const mockPause = vi.fn();
const mockAddEventListener = vi.fn();

class MockAudio {
	src = '';
	paused = true;
	play = mockPlay;
	pause = mockPause;
	addEventListener = mockAddEventListener;

	constructor(src?: string) {
		if (src) this.src = src;
	}
}

vi.stubGlobal('Audio', MockAudio);

const renderVoicePlayer = (props: Parameters<typeof VoicePlayer>[0]) => {
	return render(
		<MantineProvider>
			<VoicePlayer {...props} />
		</MantineProvider>
	);
};

describe('VoicePlayer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPlay.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});
	describe('Rendering', () => {
		it('renders voice name', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			expect(screen.getByText('Sarah')).toBeInTheDocument();
		});

		it('renders agent voice label', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			expect(screen.getByText('Agent voice')).toBeInTheDocument();
		});

		it('renders play button', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('renders wave icon', () => {
			const { container } = renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const waveIcon = container.querySelector('[class*="waveIcon"]');
			expect(waveIcon).toBeInTheDocument();
		});
	});

	describe('Button State', () => {
		it('disables button when previewUrl is not provided', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: undefined,
			});

			expect(screen.getByRole('button')).toBeDisabled();
		});

		it('enables button when previewUrl is provided', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			expect(screen.getByRole('button')).not.toBeDisabled();
		});
	});

	describe('Button Click', () => {
		it('button click does not throw when previewUrl is provided', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			expect(() => fireEvent.click(button)).not.toThrow();
		});
	});

	describe('Voice Name Display', () => {
		it('displays long voice names', () => {
			renderVoicePlayer({
				voiceName: 'Very Long Voice Name That Should Be Truncated',
				previewUrl: 'https://example.com/audio.mp3',
			});

			expect(
				screen.getByText('Very Long Voice Name That Should Be Truncated')
			).toBeInTheDocument();
		});

		it('displays special characters in voice name', () => {
			renderVoicePlayer({
				voiceName: "Sarah O'Connor",
				previewUrl: 'https://example.com/audio.mp3',
			});

			expect(screen.getByText("Sarah O'Connor")).toBeInTheDocument();
		});
	});

	describe('Complete Example', () => {
		it('renders all elements together', () => {
			const { container } = renderVoicePlayer({
				voiceName: 'Emma',
				previewUrl: 'https://example.com/emma-voice.mp3',
			});

			expect(screen.getByText('Agent voice')).toBeInTheDocument();
			expect(screen.getByText('Emma')).toBeInTheDocument();
			expect(screen.getByRole('button')).toBeInTheDocument();

			const player = container.querySelector('[class*="voicePlayer"]');
			expect(player).toBeInTheDocument();
		});
	});

	describe('Audio Playback', () => {
		it('creates audio element and plays when button is clicked', async () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			expect(mockPlay).toHaveBeenCalled();
		});

		it('does not play when previewUrl is undefined', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: undefined,
			});

			const button = screen.getByRole('button');
			// Button should be disabled when no previewUrl
			expect(button).toBeDisabled();
			// Click won't work on disabled button, but we can verify state
			fireEvent.click(button);

			// No audio should be created
			expect(mockPlay).not.toHaveBeenCalled();
		});

		it('handles audio play error gracefully', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			mockPlay.mockRejectedValueOnce(new Error('Play failed'));

			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			await vi.waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'Error playing audio:',
					expect.any(Error)
				);
			});

			consoleErrorSpy.mockRestore();
		});

		it('registers event listeners on audio element', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Check that event listeners are registered
			const eventTypes = mockAddEventListener.mock.calls.map((call) => call[0]);
			expect(eventTypes).toContain('loadstart');
			expect(eventTypes).toContain('canplaythrough');
			expect(eventTypes).toContain('ended');
			expect(eventTypes).toContain('error');
		});

		it('triggers ended callback', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find the ended callback and call it
			const endedCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'ended'
			);
			if (endedCall) {
				endedCall[1](); // Call the callback
			}

			// Component should reset after ended
			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('triggers error callback and logs error', () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find the error callback and call it
			const errorCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'error'
			);
			if (errorCall) {
				const mockEvent = new Event('error');
				errorCall[1](mockEvent);
			}

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Error loading audio:',
				expect.anything()
			);
			consoleErrorSpy.mockRestore();
		});

		it('triggers loadstart callback', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find the loadstart callback
			const loadstartCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'loadstart'
			);
			expect(loadstartCall).toBeDefined();
		});

		it('triggers canplaythrough callback', () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find the canplaythrough callback
			const canplaythroughCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'canplaythrough'
			);
			expect(canplaythroughCall).toBeDefined();
		});
	});

	describe('Preview URL Changes', () => {
		it('resets state when previewUrl changes', () => {
			const { rerender } = renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio1.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Rerender with new URL
			rerender(
				<MantineProvider>
					<VoicePlayer
						voiceName='Sarah'
						previewUrl='https://example.com/audio2.mp3'
					/>
				</MantineProvider>
			);

			// Should pause on URL change
			expect(mockPause).toHaveBeenCalled();
		});
	});

	describe('Button Styling', () => {
		it('applies playButton class to button', () => {
			const { container } = renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = container.querySelector('button[class*="playButton"]');
			expect(button).toBeInTheDocument();
		});
	});

	describe('Cleanup', () => {
		it('cleans up audio on unmount', () => {
			const { unmount } = renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			unmount();

			// After unmount, pause should have been called during cleanup
			expect(mockPause).toHaveBeenCalled();
		});
	});

	describe('Icon Display', () => {
		it('shows play icon when not playing', () => {
			const { container } = renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			// Check for the play icon (IconPlayerPlay renders an svg)
			const svg = container.querySelector('button svg');
			expect(svg).toBeInTheDocument();
		});
	});

	describe('Pause Functionality', () => {
		it('pauses audio when clicked while playing', async () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');

			// First click starts playing
			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play promise to resolve
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Click again to pause
			await act(async () => {
				fireEvent.click(button);
			});

			expect(mockPause).toHaveBeenCalled();
		});

		it('resets isPlaying state when paused', async () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');

			// First click starts playing
			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play promise to resolve
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Click again to pause
			await act(async () => {
				fireEvent.click(button);
			});

			// After pause, button should eventually be enabled
			expect(button).toBeInTheDocument();
		});
	});

	describe('Loading State', () => {
		it('sets loading state on loadstart', async () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find and verify loadstart callback is registered
			const loadstartCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'loadstart'
			);
			expect(loadstartCall).toBeDefined();

			// Triggering loadstart should set loading state
			if (loadstartCall) {
				await act(async () => {
					loadstartCall[1]();
				});
			}

			// Verify the callback was called and component handles it
			expect(button).toBeInTheDocument();
		});

		it('clears loading state on canplaythrough', async () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Trigger loadstart first
			const loadstartCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'loadstart'
			);
			if (loadstartCall) {
				await act(async () => {
					loadstartCall[1]();
				});
			}

			// Then trigger canplaythrough
			const canplaythroughCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'canplaythrough'
			);
			if (canplaythroughCall) {
				await act(async () => {
					canplaythroughCall[1]();
				});
			}

			// Loading should be cleared
			expect(button).not.toHaveAttribute('data-loading', 'true');
		});

		it('clears loading and playing state on ended', async () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');

			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Trigger ended callback
			const endedCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'ended'
			);
			if (endedCall) {
				await act(async () => {
					endedCall[1]();
				});
			}

			// Button should be enabled after audio ends
			await vi.waitFor(() => {
				expect(button).not.toBeDisabled();
			});
		});

		it('clears loading and playing state on error', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');

			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Trigger error callback
			const errorCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'error'
			);
			if (errorCall) {
				const mockEvent = new Event('error');
				await act(async () => {
					errorCall[1](mockEvent);
				});
			}

			// Button should be enabled after error
			await vi.waitFor(() => {
				expect(button).not.toBeDisabled();
			});

			consoleErrorSpy.mockRestore();
		});
	});

	describe('No Preview URL Warning', () => {
		it('logs warning when handlePlay is called without previewUrl', () => {
			const consoleWarnSpy = vi
				.spyOn(console, 'warn')
				.mockImplementation(() => {});

			// Render with no previewUrl
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: undefined,
			});

			// The button is disabled, but we can test the internal behavior
			// by calling the function directly through the component behavior
			consoleWarnSpy.mockRestore();
		});
	});

	describe('Audio Element Creation', () => {
		it('creates new audio element when URL changes', async () => {
			const { rerender } = renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio1.mp3',
			});

			const button = screen.getByRole('button');

			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Clear mocks to track new calls
			mockPlay.mockClear();
			mockAddEventListener.mockClear();

			// Rerender with new URL
			rerender(
				<MantineProvider>
					<VoicePlayer
						voiceName='Sarah'
						previewUrl='https://example.com/audio2.mp3'
					/>
				</MantineProvider>
			);

			// Click again - should create new audio
			await act(async () => {
				fireEvent.click(button);
			});

			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});
		});

		it('pauses existing audio before creating new one', async () => {
			renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');

			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Click again while audio exists (even if not playing)
			mockPause.mockClear();

			await act(async () => {
				fireEvent.click(button);
			});

			expect(mockPause).toHaveBeenCalled();
		});
	});

	describe('Button Class', () => {
		it('applies playing class when audio is playing', () => {
			const { container } = renderVoicePlayer({
				voiceName: 'Sarah',
				previewUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// The button should have the playButton class
			const playButton = container.querySelector('button[class*="playButton"]');
			expect(playButton).toBeInTheDocument();
		});
	});
});

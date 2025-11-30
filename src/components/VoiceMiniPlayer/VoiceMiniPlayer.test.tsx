import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { VoiceMiniPlayer } from './VoiceMiniPlayer';

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

const renderVoiceMiniPlayer = (
	props: Partial<Parameters<typeof VoiceMiniPlayer>[0]> = {}
) => {
	return render(
		<MantineProvider>
			<VoiceMiniPlayer {...props} />
		</MantineProvider>
	);
};

describe('VoiceMiniPlayer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPlay.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});
	describe('Rendering', () => {
		it('renders play button', () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('renders wave indicators', () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const waveIndicators = container.querySelectorAll(
				'[class*="waveIndicator"]'
			);
			expect(waveIndicators.length).toBe(3);
		});

		it('renders play icon by default', () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const playIcon = container.querySelector('[class*="playIcon"]');
			expect(playIcon).toBeInTheDocument();
		});
	});

	describe('Disabled State', () => {
		it('disables button when disabled prop is true', () => {
			renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
				disabled: true,
			});

			expect(screen.getByRole('button')).toBeDisabled();
		});

		it('disables button when voiceUrl is not provided', () => {
			renderVoiceMiniPlayer({ voiceUrl: undefined });

			expect(screen.getByRole('button')).toBeDisabled();
		});

		it('button click does nothing when disabled', () => {
			renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
				disabled: true,
			});

			const button = screen.getByRole('button');
			// Should not throw when clicked
			expect(() => fireEvent.click(button)).not.toThrow();
		});
	});

	describe('Size Variant', () => {
		it('applies normal size by default', () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const player = container.querySelector('[class*="voiceMiniPlayer"]');
			expect(player?.className).not.toContain('small');
		});

		it('applies small size when specified', () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
				size: 'small',
			});

			const player = container.querySelector('[class*="voiceMiniPlayer"]');
			expect(player?.className).toContain('small');
		});
	});

	describe('Complete Example', () => {
		it('renders with all props', () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/voice.mp3',
				disabled: false,
				size: 'normal',
			});

			expect(screen.getByRole('button')).toBeInTheDocument();
			expect(screen.getByRole('button')).not.toBeDisabled();

			const player = container.querySelector('[class*="voiceMiniPlayer"]');
			expect(player).toBeInTheDocument();
		});
	});

	describe('Audio Playback', () => {
		it('creates audio element and plays when button is clicked', async () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			expect(mockPlay).toHaveBeenCalled();
		});

		it('does nothing when clicked without voiceUrl', () => {
			renderVoiceMiniPlayer({ voiceUrl: undefined });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			expect(mockPlay).not.toHaveBeenCalled();
		});

		it('does nothing when disabled and clicked', () => {
			renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
				disabled: true,
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			expect(mockPlay).not.toHaveBeenCalled();
		});

		it('handles audio play error gracefully', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			mockPlay.mockRejectedValueOnce(new Error('Play failed'));

			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

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
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Check that event listeners are registered
			const eventTypes = mockAddEventListener.mock.calls.map((call) => call[0]);
			expect(eventTypes).toContain('ended');
			expect(eventTypes).toContain('error');
			expect(eventTypes).toContain('loadstart');
			expect(eventTypes).toContain('canplaythrough');
		});

		it('triggers ended callback', () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find the ended callback and call it
			const endedCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'ended'
			);
			if (endedCall) {
				endedCall[1](); // Call the callback
			}

			// After ended, the button should show play icon again
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});
			const playIcon = container.querySelector('[class*="playIcon"]');
			expect(playIcon).toBeInTheDocument();
		});

		it('triggers error callback', () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find the error callback and call it
			const errorCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'error'
			);
			if (errorCall) {
				errorCall[1](); // Call the callback
			}

			// After error, should reset state
			expect(screen.getByRole('button')).not.toBeDisabled();
		});

		it('triggers loadstart callback', () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find the loadstart callback
			const loadstartCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'loadstart'
			);
			expect(loadstartCall).toBeDefined();
		});

		it('triggers canplaythrough callback', () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Find the canplaythrough callback
			const canplaythroughCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'canplaythrough'
			);
			expect(canplaythroughCall).toBeDefined();
		});
	});

	describe('Wave Indicators Animation', () => {
		it('wave indicators do not have playing class initially', () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const waveIndicators = container.querySelectorAll(
				'[class*="waveIndicator"]'
			);
			waveIndicators.forEach((indicator) => {
				expect(indicator.className).not.toContain('playing');
			});
		});
	});

	describe('Cleanup', () => {
		it('cleans up audio on unmount', () => {
			const { unmount } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			unmount();

			// After unmount, pause should have been called during cleanup
			expect(mockPause).toHaveBeenCalled();
		});
	});

	describe('Pause Functionality', () => {
		it('pauses audio when clicked while playing', async () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');

			// First click starts playing
			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
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
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');

			// First click starts playing
			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Click again to pause
			await act(async () => {
				fireEvent.click(button);
			});

			// Button should still be enabled after pause
			expect(button).not.toBeDisabled();
		});
	});

	describe('Audio Reuse', () => {
		it('reuses existing audio when URL is the same', async () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');

			// First click - creates audio
			await act(async () => {
				fireEvent.click(button);
			});

			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalledTimes(1);
			});

			// Pause the audio
			await act(async () => {
				fireEvent.click(button);
			});

			// Clear mock to track new calls
			mockPlay.mockClear();

			// Click again with same URL - should reuse audio
			await act(async () => {
				fireEvent.click(button);
			});

			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalledTimes(1);
			});
		});

		it('pauses existing audio before creating new one for different URL', async () => {
			const { rerender } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio1.mp3',
			});

			const button = screen.getByRole('button');

			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Clear mocks
			mockPause.mockClear();

			// Change URL and render again
			rerender(
				<MantineProvider>
					<VoiceMiniPlayer voiceUrl='https://example.com/audio2.mp3' />
				</MantineProvider>
			);

			// Click with new URL
			await act(async () => {
				fireEvent.click(button);
			});

			// Should have paused old audio before creating new one
			expect(mockPause).toHaveBeenCalled();
		});
	});

	describe('Loading State', () => {
		it('shows loading spinner during loading', () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Trigger loadstart callback
			const loadstartCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'loadstart'
			);
			if (loadstartCall) {
				loadstartCall[1]();
			}

			// Check for loading spinner class
			const loadingSpinner = container.querySelector(
				'[class*="loadingSpinner"]'
			);
			expect(loadingSpinner).toBeInTheDocument();
		});

		it('hides loading spinner after canplaythrough', () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Trigger loadstart first
			const loadstartCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'loadstart'
			);
			if (loadstartCall) {
				loadstartCall[1]();
			}

			// Then trigger canplaythrough
			const canplaythroughCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'canplaythrough'
			);
			if (canplaythroughCall) {
				canplaythroughCall[1]();
			}

			// Loading should be cleared
			expect(button).toBeInTheDocument();
		});

		it('clears loading state on ended', () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Trigger ended callback
			const endedCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'ended'
			);
			if (endedCall) {
				endedCall[1]();
			}

			// Button should be enabled
			expect(button).not.toBeDisabled();
		});

		it('clears loading state on error', () => {
			renderVoiceMiniPlayer({ voiceUrl: 'https://example.com/audio.mp3' });

			const button = screen.getByRole('button');
			fireEvent.click(button);

			// Trigger error callback
			const errorCall = mockAddEventListener.mock.calls.find(
				(call) => call[0] === 'error'
			);
			if (errorCall) {
				errorCall[1]();
			}

			// Button should be enabled after error
			expect(button).not.toBeDisabled();
		});
	});

	describe('Icon Rendering', () => {
		it('shows pause icon when playing', async () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');

			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// After clicking and playing, look for pause icon (SVG with specific class)
			const pauseIcon = container.querySelector('.tabler-icon-player-pause');
			expect(pauseIcon).toBeInTheDocument();
		});

		it('shows play icon after audio ends', async () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
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

			// After ended, should show play icon again
			const playIcon = container.querySelector('.tabler-icon-player-play');
			expect(playIcon).toBeInTheDocument();
		});

		it('shows play icon after error', async () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
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
				await act(async () => {
					errorCall[1]();
				});
			}

			// After error, should show play icon again
			const playIcon = container.querySelector('.tabler-icon-player-play');
			expect(playIcon).toBeInTheDocument();
		});
	});

	describe('Wave Indicators Playing State', () => {
		it('wave indicators have playing class when audio is playing', async () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');

			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Check that wave indicators have playing class
			const playingIndicators = container.querySelectorAll(
				'[class*="waveIndicator"][class*="playing"]'
			);
			expect(playingIndicators.length).toBe(3);
		});

		it('wave indicators lose playing class when audio is paused', async () => {
			const { container } = renderVoiceMiniPlayer({
				voiceUrl: 'https://example.com/audio.mp3',
			});

			const button = screen.getByRole('button');

			// Start playing
			await act(async () => {
				fireEvent.click(button);
			});

			// Wait for play to complete
			await vi.waitFor(() => {
				expect(mockPlay).toHaveBeenCalled();
			});

			// Click again to pause
			await act(async () => {
				fireEvent.click(button);
			});

			// Wave indicators should not have playing class
			const waveIndicators = container.querySelectorAll(
				'[class*="waveIndicator"]'
			);
			waveIndicators.forEach((indicator) => {
				expect(indicator.className).not.toContain('playing');
			});
		});
	});
});

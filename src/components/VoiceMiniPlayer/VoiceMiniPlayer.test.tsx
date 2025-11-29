import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { VoiceMiniPlayer } from './VoiceMiniPlayer';

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
});

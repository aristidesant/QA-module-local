import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { VoicePlayer } from './VoicePlayer';

const renderVoicePlayer = (props: Parameters<typeof VoicePlayer>[0]) => {
	return render(
		<MantineProvider>
			<VoicePlayer {...props} />
		</MantineProvider>
	);
};

describe('VoicePlayer', () => {
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
});

import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VoiceList from './VoiceList';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock dependencies
vi.mock('~/components/VoiceMiniPlayer', () => ({
	VoiceMiniPlayer: () => <div data-testid='voice-mini-player'>Player</div>,
}));

vi.mock('~/utils/agentUtils', () => ({
	getLanguageFlagEmoji: () => '🇺🇸',
}));

describe('VoiceList', () => {
	const mockVoices: any[] = [
		{
			voice: {
				id: '1',
				name: 'Voice 1',
				gender: 'male',
				language: 'English',
				previewUrl: 'url1',
			},
		},
		{
			voice: {
				id: '2',
				name: 'Voice 2',
				gender: 'female',
				language: 'Spanish',
				previewUrl: 'url2',
			},
		},
	];

	it('renders voices correctly', () => {
		renderWithProviders(
			<VoiceList voices={mockVoices} onVoiceSelect={vi.fn()} />
		);

		expect(screen.getByText('Voice 1')).toBeInTheDocument();
		expect(screen.getByText('Voice 2')).toBeInTheDocument();
		expect(screen.getAllByTestId('voice-mini-player')).toHaveLength(2);
	});

	it('handles voice selection', () => {
		const onVoiceSelect = vi.fn();
		renderWithProviders(
			<VoiceList voices={mockVoices} onVoiceSelect={onVoiceSelect} />
		);

		fireEvent.click(screen.getByText('Voice 1'));
		expect(onVoiceSelect).toHaveBeenCalledWith('1');
	});

	it('renders empty state', () => {
		renderWithProviders(<VoiceList voices={[]} onVoiceSelect={vi.fn()} />);
		expect(screen.getByText('No voices found')).toBeInTheDocument();
	});
});

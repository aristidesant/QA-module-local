import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VoiceList from './VoiceList';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';

// Mock dependencies
vi.mock('~/components/VoiceMiniPlayer', () => ({
	VoiceMiniPlayer: () => <div data-testid='voice-mini-player'>Player</div>,
}));

vi.mock('~/utils/agentUtils', () => ({
	getLanguageFlagEmoji: () => '🇺🇸',
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

describe('VoiceList', () => {
	const mockVoices: AgentVoiceModel[] = [
		{
			id: 1,
			voiceId: '1',
			clientId: 1,
			userId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
			voice: {
				id: '1',
				name: 'Voice 1',
				gender: 'male',
				language: 'English',
				previewUrl: 'url1',
				description: 'Desc 1',
				accent: 'US',
				age: 'Young',
				status: 'Active',
				userId: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
		},
		{
			id: 2,
			voiceId: '2',
			clientId: 1,
			userId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
			voice: {
				id: '2',
				name: 'Voice 2',
				gender: 'female',
				language: 'Spanish',
				previewUrl: 'url2',
				description: 'Desc 2',
				accent: 'ES',
				age: 'Old',
				status: 'Active',
				userId: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
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
		expect(screen.getByText('addNewCampaign.voices.male')).toBeInTheDocument();
		expect(
			screen.getByText('addNewCampaign.voices.female')
		).toBeInTheDocument();
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
		expect(
			screen.getByText('addNewCampaign.voices.noVoices')
		).toBeInTheDocument();
	});
});

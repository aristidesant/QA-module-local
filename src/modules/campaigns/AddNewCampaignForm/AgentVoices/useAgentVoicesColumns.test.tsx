import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useAgentVoicesColumns } from './useAgentVoicesColumns';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => {
			if (key === 'addNewCampaign.voices.age') {
				return `Age: ${options.age}`;
			}
			return key;
		},
	}),
}));

// Mock agentUtils
vi.mock('~/utils/agentUtils', () => ({
	getLanguageFlagEmoji: vi.fn((lang: string) => `Emoji-${lang}`),
}));

describe('useAgentVoicesColumns', () => {
	const mockOnPlayVoice = vi.fn();
	const defaultProps = {
		onPlayVoice: mockOnPlayVoice,
		playingVoiceId: null as string | null,
		playProgress: 0,
	};

	const sampleVoice: AgentVoiceModel = {
		id: 1,
		voiceId: 'voice-1',
		clientId: 1,
		userId: 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
		voice: {
			id: 'voice-1',
			name: 'Test Voice',
			language: 'English',
			gender: 'Female',
			previewUrl: 'https://example.com/preview.mp3',
			description: 'A test voice description',
			accent: 'American',
			age: 'Young',
			status: 'Active',
			userId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderCell = (
		columnId: string,
		voice: AgentVoiceModel,
		props: {
			onPlayVoice: (voiceId: string, previewUrl: string) => void;
			playingVoiceId: string | null;
			playProgress: number;
		} = defaultProps
	) => {
		const TestComponent = () => {
			const columns = useAgentVoicesColumns(props);
			const col = columns.find(
				(c) => (c as any).accessorKey === columnId || (c as any).id === columnId
			);
			if (!col) return <div>Column not found</div>;
			return <div>{(col as any).cell({ row: { original: voice } })}</div>;
		};

		return renderWithProviders(<TestComponent />);
	};

	it('renders voice column with name and language', () => {
		renderCell('voice', sampleVoice);
		expect(screen.getByText('Test Voice')).toBeInTheDocument();
		expect(screen.getByText('Emoji-English English')).toBeInTheDocument();
		expect(
			screen.getByText('addNewCampaign.voices.female')
		).toBeInTheDocument();
	});

	it('renders unknown gender when gender is missing', () => {
		const voiceWithoutGender: AgentVoiceModel = {
			...sampleVoice,
			voice: {
				...sampleVoice.voice,
				gender: '',
			},
		};
		renderCell('voice', voiceWithoutGender);
		expect(
			screen.getByText('addNewCampaign.voices.unknown')
		).toBeInTheDocument();
	});

	it('renders controls column with play button', () => {
		renderCell('controls', sampleVoice);
		const playButton = screen.getByLabelText('addNewCampaign.voices.playAria');
		expect(playButton).toBeInTheDocument();
		expect(playButton).not.toBeDisabled();
	});

	it('calls onPlayVoice when play button is clicked', () => {
		renderCell('controls', sampleVoice);
		const playButton = screen.getByLabelText('addNewCampaign.voices.playAria');
		fireEvent.click(playButton);
		expect(mockOnPlayVoice).toHaveBeenCalledWith(
			'voice-1',
			'https://example.com/preview.mp3'
		);
	});

	it('renders pause button when voice is playing', () => {
		const playingProps = {
			...defaultProps,
			playingVoiceId: 'voice-1',
		};
		renderCell('controls', sampleVoice, playingProps);
		expect(
			screen.getByLabelText('addNewCampaign.voices.pauseAria')
		).toBeInTheDocument();
	});

	it('disables play button when previewUrl is missing', () => {
		const voiceWithoutPreview: AgentVoiceModel = {
			...sampleVoice,
			voice: {
				...sampleVoice.voice,
				previewUrl: '',
			},
		};
		renderCell('controls', voiceWithoutPreview);
		const playButton = screen.getByLabelText('addNewCampaign.voices.playAria');
		expect(playButton).toBeDisabled();
	});
});

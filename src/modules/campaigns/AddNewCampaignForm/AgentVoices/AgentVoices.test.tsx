import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgentVoices from './AgentVoices';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import { modals } from '@mantine/modals';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock dependencies
vi.mock('~/queries/agentVoiceQueries', () => ({
	useGetAllAgentVoices: vi.fn(),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
		close: vi.fn(),
	},
}));

vi.mock('~/components/SectionCard', () => ({
	default: ({ title, children }: any) => (
		<div data-testid='section-card'>
			<h1>{title}</h1>
			{children}
		</div>
	),
}));

vi.mock('~/components/BaseTable/BaseTable', () => ({
	default: ({ data, onRowClick }: any) => (
		<div data-testid='base-table'>
			{data.map((row: any) => (
				<div key={row.voice.id} onClick={() => onRowClick({ original: row })}>
					{row.voice.name}
				</div>
			))}
		</div>
	),
}));

vi.mock('~/utils/agentUtils', () => ({
	getLanguageFlagEmoji: () => '🇺🇸',
}));

describe('AgentVoices', () => {
	const mockVoices = [
		{
			voice: {
				id: '1',
				name: 'Voice 1',
				gender: 'male',
				language: 'English',
				previewUrl: 'url1',
			},
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders loading state', () => {
		(useGetAllAgentVoices as any).mockReturnValue({ isLoading: true });
		renderWithProviders(<AgentVoices onVoiceSelect={vi.fn()} />);
		expect(
			screen.getByText('addNewCampaign.voices.loading')
		).toBeInTheDocument();
	});

	it('renders error state', () => {
		(useGetAllAgentVoices as any).mockReturnValue({
			isLoading: false,
			isError: true,
		});
		renderWithProviders(<AgentVoices onVoiceSelect={vi.fn()} />);
		expect(screen.getByText('addNewCampaign.voices.error')).toBeInTheDocument();
	});

	it('renders empty state', () => {
		(useGetAllAgentVoices as any).mockReturnValue({
			isLoading: false,
			data: [],
		});
		renderWithProviders(<AgentVoices onVoiceSelect={vi.fn()} />);
		expect(
			screen.getByText('addNewCampaign.voices.noVoices')
		).toBeInTheDocument();
	});

	it('renders select voice card when no voice selected', () => {
		(useGetAllAgentVoices as any).mockReturnValue({
			isLoading: false,
			data: mockVoices,
		});
		renderWithProviders(<AgentVoices onVoiceSelect={vi.fn()} />);
		expect(
			screen.getByText('addNewCampaign.voices.selectVoice')
		).toBeInTheDocument();
	});

	it('renders selected voice card when voice selected', () => {
		(useGetAllAgentVoices as any).mockReturnValue({
			isLoading: false,
			data: mockVoices,
		});
		renderWithProviders(
			<AgentVoices onVoiceSelect={vi.fn()} selectedVoiceId='1' />
		);
		expect(screen.getByText('Voice 1')).toBeInTheDocument();
	});

	it('opens modal on click', () => {
		(useGetAllAgentVoices as any).mockReturnValue({
			isLoading: false,
			data: mockVoices,
		});
		renderWithProviders(<AgentVoices onVoiceSelect={vi.fn()} />);

		fireEvent.click(screen.getByText('addNewCampaign.voices.selectVoice'));
		expect(modals.open).toHaveBeenCalled();
	});
});

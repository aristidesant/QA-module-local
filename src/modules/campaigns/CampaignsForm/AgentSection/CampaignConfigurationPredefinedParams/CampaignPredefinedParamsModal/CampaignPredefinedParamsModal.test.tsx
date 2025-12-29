import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignPredefinedParamsModal from './CampaignPredefinedParamsModal';
import { vi } from 'vitest';

const mockPredefinedParams = [
	{
		id: '1',
		name: 'Friendly Assistant',
		params: {
			conversationConfig: {
				asr: {
					quality: 'high',
					keywords: [],
					provider: 'default',
					userInputAudioFormat: 'wav',
				},
				tts: {
					modelId: 'model-1',
					stability: 0.7,
					speed: 1.0,
					similarityBoost: 0.5,
					optimizeStreamingLatency: 1,
					agentOutputAudioFormat: 'mp3',
				},
				agent: {
					prompt: {
						llm: 'gpt-4',
						temperature: 0.7,
					},
				},
			},
		},
	},
	{
		id: '2',
		name: 'Professional Agent',
		params: {
			conversationConfig: {
				asr: {
					quality: 'high',
					keywords: [],
					provider: 'default',
					userInputAudioFormat: 'wav',
				},
				tts: {
					modelId: 'model-2',
					stability: 0.5,
					speed: 1.0,
					similarityBoost: 0.5,
					optimizeStreamingLatency: 1,
					agentOutputAudioFormat: 'mp3',
				},
				agent: {
					prompt: {
						llm: 'gpt-4',
						temperature: 0.5,
					},
				},
			},
		},
	},
];

describe('CampaignPredefinedParamsModal', () => {
	const mockOnClose = vi.fn();
	const mockOnApply = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders modal when opened', () => {
		renderWithProviders(
			<CampaignPredefinedParamsModal
				opened={true}
				onClose={mockOnClose}
				predefinedParams={mockPredefinedParams}
				initialSelectionName={null}
				onApply={mockOnApply}
			/>
		);

		expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
	});

	it('does not render modal when closed', () => {
		renderWithProviders(
			<CampaignPredefinedParamsModal
				opened={false}
				onClose={mockOnClose}
				predefinedParams={mockPredefinedParams}
				initialSelectionName={null}
				onApply={mockOnApply}
			/>
		);

		expect(screen.queryByText('Configuration Preview')).not.toBeInTheDocument();
	});

	it('displays predefined params in select dropdown', () => {
		renderWithProviders(
			<CampaignPredefinedParamsModal
				opened={true}
				onClose={mockOnClose}
				predefinedParams={mockPredefinedParams}
				initialSelectionName={null}
				onApply={mockOnApply}
			/>
		);

		expect(
			screen.getByText('Select a predefined parameter set')
		).toBeInTheDocument();
	});

	it('calls onClose when cancel button is clicked', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<CampaignPredefinedParamsModal
				opened={true}
				onClose={mockOnClose}
				predefinedParams={mockPredefinedParams}
				initialSelectionName={null}
				onApply={mockOnApply}
			/>
		);

		const cancelButton = screen.getByText('Cancel');
		await user.click(cancelButton);

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it('disables apply button when no selection is made', () => {
		renderWithProviders(
			<CampaignPredefinedParamsModal
				opened={true}
				onClose={mockOnClose}
				predefinedParams={mockPredefinedParams}
				initialSelectionName={null}
				onApply={mockOnApply}
			/>
		);

		const applyButton = screen.getByRole('button', {
			name: /Apply/i,
		});
		expect(applyButton).toBeDisabled();
	});

	it('sets initial selection when provided', () => {
		renderWithProviders(
			<CampaignPredefinedParamsModal
				opened={true}
				onClose={mockOnClose}
				predefinedParams={mockPredefinedParams}
				initialSelectionName='Friendly Assistant'
				onApply={mockOnApply}
			/>
		);

		const applyButton = screen.getByRole('button', {
			name: /Apply/i,
		});
		expect(applyButton).not.toBeDisabled();
	});
});

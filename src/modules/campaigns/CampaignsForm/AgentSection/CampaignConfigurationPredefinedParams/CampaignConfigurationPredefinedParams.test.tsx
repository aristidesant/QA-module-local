import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import CampaignConfigurationPredefinedParams from './CampaignConfigurationPredefinedParams';
import type { CampaignPredefinedParam } from '~/models/CampaignPredefinedParam';

// Mock the form context
const mockSetValues = vi.fn();
const mockSetFieldValue = vi.fn();
const mockFormValues = {
	configId: '',
	agentConfig: {
		conversationConfig: {
			tts: {
				modelId: 'original-model',
				stability: 0.5,
				speed: 1,
				similarityBoost: 0.5,
				optimizeStreamingLatency: 1,
				agentOutputAudioFormat: 'pcm_16000',
			},
			asr: {
				quality: 'low',
				keywords: [],
				provider: 'original-provider',
				userInputAudioFormat: 'pcm_16000',
			},
			agent: {
				prompt: {
					llm: 'original-llm',
					temperature: 0.5,
				},
			},
		},
	},
};

vi.mock('~/modules/campaigns/campaignFormFunctions', () => ({
	useCampaignFormContext: () => ({
		values: mockFormValues,
		setValues: mockSetValues,
		setFieldValue: mockSetFieldValue,
	}),
}));

// Mock predefined params hook
const mockPredefinedParams: CampaignPredefinedParam[] = [
	{
		id: 'config-1',
		name: 'High Quality Config',
		params: {
			conversationConfig: {
				tts: {
					modelId: 'eleven_turbo_v2_5',
					stability: 0.8,
					speed: 1.2,
					similarityBoost: 0.75,
					optimizeStreamingLatency: 3,
					agentOutputAudioFormat: 'pcm_24000',
				},
				asr: {
					quality: 'high',
					keywords: ['keyword1', 'keyword2'],
					provider: 'deepgram',
					userInputAudioFormat: 'pcm_16000',
				},
				agent: {
					prompt: {
						llm: 'gpt-4o',
						temperature: 0.7,
					},
				},
			},
		},
	},
	{
		id: 'config-2',
		name: 'Fast Config',
		params: {
			conversationConfig: {
				tts: {
					modelId: 'eleven_flash_v2_5',
					stability: 0.5,
					speed: 1.5,
					similarityBoost: 0.5,
					optimizeStreamingLatency: 4,
					agentOutputAudioFormat: 'pcm_16000',
				},
				asr: {
					quality: 'medium',
					keywords: [],
					provider: 'google',
					userInputAudioFormat: 'pcm_16000',
				},
				agent: {
					prompt: {
						llm: 'gpt-4o-mini',
						temperature: 0.3,
					},
				},
			},
		},
	},
];

vi.mock('../../useCampaignsPredefinedParams', () => ({
	default: () => mockPredefinedParams,
}));

// Mock deepMergeConfig utility
vi.mock('~/utils/objectUtils', () => ({
	deepMergeConfig: (
		base: Record<string, any>,
		override: Record<string, any>
	) => ({
		...base,
		...override,
		tts: override.tts ? { ...base.tts, ...override.tts } : base.tts,
		asr: override.asr ? { ...base.asr, ...override.asr } : base.asr,
		agent: override.agent
			? {
					...base.agent,
					prompt: {
						...base.agent?.prompt,
						...override.agent?.prompt,
					},
				}
			: base.agent,
	}),
}));

// Helper to render component
const renderComponent = () =>
	render(
		<MantineProvider>
			<CampaignConfigurationPredefinedParams />
		</MantineProvider>
	);

describe('CampaignConfigurationPredefinedParams', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFormValues.configId = '';
		mockFormValues.agentConfig = {
			conversationConfig: {
				tts: {
					modelId: 'original-model',
					stability: 0.5,
					speed: 1,
					similarityBoost: 0.5,
					optimizeStreamingLatency: 1,
					agentOutputAudioFormat: 'pcm_16000',
				},
				asr: {
					quality: 'low',
					keywords: [],
					provider: 'original-provider',
					userInputAudioFormat: 'pcm_16000',
				},
				agent: {
					prompt: {
						llm: 'original-llm',
						temperature: 0.5,
					},
				},
			},
		};
	});

	describe('Initial Rendering', () => {
		it('renders the section card with title', () => {
			renderComponent();
			expect(screen.getByText('Agent Behavior')).toBeInTheDocument();
		});

		it('shows empty state when no configuration is applied', () => {
			renderComponent();
			expect(screen.getByText('No configuration applied')).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Select Configuration/i })
			).toBeInTheDocument();
		});

		it('shows current configuration when configId matches a predefined param', () => {
			mockFormValues.configId = 'config-1';
			renderComponent();
			expect(screen.getByText('High Quality Config')).toBeInTheDocument();
			expect(screen.getByText('Active configuration')).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Change/i })
			).toBeInTheDocument();
		});
	});

	describe('Modal Interactions', () => {
		it('opens modal when Select Configuration button is clicked', async () => {
			renderComponent();
			const selectButton = screen.getByRole('button', {
				name: /Select Configuration/i,
			});
			fireEvent.click(selectButton);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});
		});

		it('opens modal when Change button is clicked', async () => {
			mockFormValues.configId = 'config-1';
			renderComponent();
			const changeButton = screen.getByRole('button', { name: /Change/i });
			fireEvent.click(changeButton);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});
		});

		it('closes modal when Cancel button is clicked', async () => {
			renderComponent();
			fireEvent.click(
				screen.getByRole('button', { name: /Select Configuration/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});

			const cancelButton = screen.getByRole('button', { name: /Cancel/i });
			fireEvent.click(cancelButton);

			await waitFor(() => {
				expect(
					screen.queryByText('Configuration Preview')
				).not.toBeInTheDocument();
			});
		});
	});

	describe('Applying Configuration from Modal', () => {
		it('applies selected configuration to form when Apply is clicked', async () => {
			renderComponent();

			// Open modal
			fireEvent.click(
				screen.getByRole('button', { name: /Select Configuration/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});

			// Select a configuration from dropdown
			const select = screen.getByRole('textbox', {
				name: /Select a predefined parameter set/i,
			});
			fireEvent.click(select);

			// Wait for options and click on one
			const option = await screen.findByText('High Quality Config');
			fireEvent.click(option);

			// Click Apply button
			const applyButton = screen.getByRole('button', { name: /^Apply$/i });
			fireEvent.click(applyButton);

			// Verify setValues was called with the merged configuration
			await waitFor(() => {
				expect(mockSetValues).toHaveBeenCalledWith({
					agentConfig: expect.objectContaining({
						conversationConfig: expect.objectContaining({
							tts: expect.objectContaining({
								modelId: 'eleven_turbo_v2_5',
								stability: 0.8,
								speed: 1.2,
								similarityBoost: 0.75,
								optimizeStreamingLatency: 3,
								agentOutputAudioFormat: 'pcm_24000',
							}),
							asr: expect.objectContaining({
								quality: 'high',
								provider: 'deepgram',
							}),
							agent: expect.objectContaining({
								prompt: expect.objectContaining({
									llm: 'gpt-4o',
									temperature: 0.7,
								}),
							}),
						}),
					}),
				});
			});
		});

		it('sets configId field value when Apply is clicked', async () => {
			renderComponent();

			// Open modal
			fireEvent.click(
				screen.getByRole('button', { name: /Select Configuration/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});

			// Select a configuration
			const select = screen.getByRole('textbox', {
				name: /Select a predefined parameter set/i,
			});
			fireEvent.click(select);
			const option = await screen.findByText('High Quality Config');
			fireEvent.click(option);

			// Click Apply
			const applyButton = screen.getByRole('button', { name: /^Apply$/i });
			fireEvent.click(applyButton);

			// Verify setFieldValue was called with configId
			await waitFor(() => {
				expect(mockSetFieldValue).toHaveBeenCalledWith('configId', 'config-1');
			});
		});

		it('applies a different configuration when selecting another option', async () => {
			renderComponent();

			// Open modal
			fireEvent.click(
				screen.getByRole('button', { name: /Select Configuration/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});

			// Select Fast Config
			const select = screen.getByRole('textbox', {
				name: /Select a predefined parameter set/i,
			});
			fireEvent.click(select);
			const option = await screen.findByText('Fast Config');
			fireEvent.click(option);

			// Click Apply
			const applyButton = screen.getByRole('button', { name: /^Apply$/i });
			fireEvent.click(applyButton);

			// Verify setValues was called with Fast Config values
			await waitFor(() => {
				expect(mockSetValues).toHaveBeenCalledWith({
					agentConfig: expect.objectContaining({
						conversationConfig: expect.objectContaining({
							tts: expect.objectContaining({
								modelId: 'eleven_flash_v2_5',
								speed: 1.5,
							}),
							asr: expect.objectContaining({
								quality: 'medium',
								provider: 'google',
							}),
							agent: expect.objectContaining({
								prompt: expect.objectContaining({
									llm: 'gpt-4o-mini',
									temperature: 0.3,
								}),
							}),
						}),
					}),
				});
			});

			// Verify setFieldValue was called with config-2
			expect(mockSetFieldValue).toHaveBeenCalledWith('configId', 'config-2');
		});

		it('closes modal after applying configuration', async () => {
			renderComponent();

			// Open modal
			fireEvent.click(
				screen.getByRole('button', { name: /Select Configuration/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});

			// Select and apply
			const select = screen.getByRole('textbox', {
				name: /Select a predefined parameter set/i,
			});
			fireEvent.click(select);
			const option = await screen.findByText('High Quality Config');
			fireEvent.click(option);

			const applyButton = screen.getByRole('button', { name: /^Apply$/i });
			fireEvent.click(applyButton);

			// Modal should be closed
			await waitFor(() => {
				expect(
					screen.queryByText('Configuration Preview')
				).not.toBeInTheDocument();
			});
		});

		it('does not apply when Apply is clicked without selection', async () => {
			renderComponent();

			// Open modal
			fireEvent.click(
				screen.getByRole('button', { name: /Select Configuration/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});

			// Apply button should be disabled without selection
			const applyButton = screen.getByRole('button', { name: /^Apply$/i });
			expect(applyButton).toBeDisabled();

			// setValues should not be called
			expect(mockSetValues).not.toHaveBeenCalled();
			expect(mockSetFieldValue).not.toHaveBeenCalled();
		});
	});

	describe('Form State Updates', () => {
		it('merges new configuration with existing agentConfig', async () => {
			// Set some initial agentConfig values
			mockFormValues.agentConfig = {
				conversationConfig: {
					tts: {
						modelId: 'existing-model',
						stability: 0.3,
						speed: 1,
						similarityBoost: 0.4,
						optimizeStreamingLatency: 2,
						agentOutputAudioFormat: 'pcm_16000',
					},
					asr: {
						quality: 'low',
						keywords: [],
						provider: 'existing-provider',
						userInputAudioFormat: 'pcm_16000',
					},
					agent: {
						prompt: {
							llm: 'existing-llm',
							temperature: 0.2,
						},
					},
				},
			};

			renderComponent();

			// Open modal and apply configuration
			fireEvent.click(
				screen.getByRole('button', { name: /Select Configuration/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});

			const select = screen.getByRole('textbox', {
				name: /Select a predefined parameter set/i,
			});
			fireEvent.click(select);
			const option = await screen.findByText('High Quality Config');
			fireEvent.click(option);

			const applyButton = screen.getByRole('button', { name: /^Apply$/i });
			fireEvent.click(applyButton);

			// Verify the merge happened correctly
			await waitFor(() => {
				expect(mockSetValues).toHaveBeenCalled();
				const call = mockSetValues.mock.calls[0][0];
				expect(call.agentConfig.conversationConfig).toBeDefined();
			});
		});

		it('handles empty initial agentConfig gracefully', async () => {
			// Use type assertion to simulate an empty agentConfig scenario
			(mockFormValues as any).agentConfig = {};

			renderComponent();

			// Open modal and apply configuration
			fireEvent.click(
				screen.getByRole('button', { name: /Select Configuration/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Configuration Preview')).toBeInTheDocument();
			});

			const select = screen.getByRole('textbox', {
				name: /Select a predefined parameter set/i,
			});
			fireEvent.click(select);
			const option = await screen.findByText('High Quality Config');
			fireEvent.click(option);

			const applyButton = screen.getByRole('button', { name: /^Apply$/i });
			fireEvent.click(applyButton);

			// Should not throw and should apply the configuration
			await waitFor(() => {
				expect(mockSetValues).toHaveBeenCalled();
			});
		});
	});
});

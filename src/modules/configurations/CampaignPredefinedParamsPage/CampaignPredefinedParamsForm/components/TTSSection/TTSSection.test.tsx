import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import TTSSection from './TTSSection';
import CampaignPredefinedFormProvider from '../../CampaignPredefinedFormProvider';

describe('TTSSection', () => {
	const fakeValues: Record<string, any> = {
		ttsModelId: 'tts-1',
		ttsAgentOutputAudioFormat: 'mp3',
		ttsSpeed: 1.5,
		ttsOptimizeStreamingLatency: 2,
		ttsStability: 0.5,
		ttsSimilarityBoost: 0.3,
	};

	const fakeForm = {
		values: fakeValues,
		getInputProps: (field: string) => ({
			value: (fakeValues as any)[field],
			onChange: (v: any) => ((fakeValues as any)[field] = v),
		}),
		setFieldValue: (name: string, value: any) =>
			((fakeValues as any)[name] = value),
	} as any;

	it('renders model select, audio format select and speed slider', () => {
		renderWithProviders(
			<CampaignPredefinedFormProvider form={fakeForm} isEditMode={false}>
				<TTSSection />
			</CampaignPredefinedFormProvider>
		);

		expect(screen.getByText('Model')).toBeInTheDocument();
		expect(screen.getByText('Output Audio Format')).toBeInTheDocument();
		expect(screen.getByText('Speed')).toBeInTheDocument();
		// Check slider values displayed next to each slider label
		const speedLabel = screen.getByText('Speed');
		expect(speedLabel.nextElementSibling?.textContent).toBe(
			fakeValues.ttsSpeed.toFixed(2)
		);

		const latencyLabel = screen.getByText('Streaming Latency');
		expect(latencyLabel.nextElementSibling?.textContent).toBe(
			String(fakeValues.ttsOptimizeStreamingLatency)
		);

		const stabilityLabel = screen.getByText('Stability');
		expect(stabilityLabel.nextElementSibling?.textContent).toBe(
			fakeValues.ttsStability.toFixed(2)
		);

		const similarityLabel = screen.getByText('Similarity Boost');
		expect(similarityLabel.nextElementSibling?.textContent).toBe(
			fakeValues.ttsSimilarityBoost.toFixed(2)
		);
	});
});

export {};

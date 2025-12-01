import { screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConfigurationSummary from './ConfigurationSummary';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('ConfigurationSummary', () => {
	const getProgressForLabel = (label: string) => {
		const labelEl = screen.getByText(label);
		let ancestor: HTMLElement | null = labelEl.parentElement;
		while (ancestor && ancestor.querySelector('[role="progressbar"]') == null) {
			ancestor = ancestor.parentElement;
		}
		if (!ancestor) throw new Error(`Could not find progress row for ${label}`);
		return ancestor;
	};
	it('does not render the CampaignVoiceProgressDisplay when config has no tts', () => {
		renderWithProviders(<ConfigurationSummary config={undefined} />);
		expect(screen.queryByText('Latency Tuning')).toBeNull();
	});

	it('clamps out-of-range tts values and renders clamped metrics', () => {
		const config = {
			tts: {
				stability: 1.5,
				speed: 2.5,
				similarityBoost: 1.5,
				optimizeStreamingLatency: 5,
			},
			agent: { prompt: { temperature: 10 } },
		} as any;

		renderWithProviders(<ConfigurationSummary config={config} />);

		// All progressbars should be clamped to 100
		const labels = [
			'Latency Tuning',
			'Stability',
			'Delivery Speed',
			'Similarity Boost',
			'Temperature',
		];

		labels.forEach((label) => {
			const labelEl = screen.getByText(label);
			let ancestor: HTMLElement | null = labelEl.parentElement;
			while (
				ancestor &&
				ancestor.querySelector('[role="progressbar"]') == null
			) {
				ancestor = ancestor.parentElement;
			}
			if (!ancestor)
				throw new Error(`Could not find progress row for ${label}`);
			const progress = within(ancestor).getByRole('progressbar', {
				name: label,
			});
			const value = progress.getAttribute('aria-valuenow');
			expect(Math.round(parseFloat(value || '0'))).toBe(100);
			// Also ensure statuses reflect the high values (or balanced for latency)
			switch (label) {
				case 'Latency Tuning':
					expect(within(ancestor).getByText('Balanced')).toBeInTheDocument();
					break;
				case 'Stability':
					expect(within(ancestor).getByText('Balanced')).toBeInTheDocument();
					break;
				case 'Delivery Speed':
					expect(within(ancestor).getByText('Fast')).toBeInTheDocument();
					break;
				case 'Similarity Boost':
					expect(within(ancestor).getByText('High')).toBeInTheDocument();
					break;
				case 'Temperature':
					expect(within(ancestor).getByText('High')).toBeInTheDocument();
					break;
			}
		});
	});

	it('renders voice metrics when config.tts exists and uses agent.prompt.temperature', () => {
		const config = {
			tts: {
				stability: 0.8,
				speed: 1.4,
				similarityBoost: 0.8,
				optimizeStreamingLatency: 3,
			},
			agent: { prompt: { temperature: 1.6 } },
		} as any;

		renderWithProviders(<ConfigurationSummary config={config} />);

		// Ensure the voice metric labels appear
		const labels = [
			'Latency Tuning',
			'Stability',
			'Delivery Speed',
			'Similarity Boost',
			'Temperature',
		];

		labels.forEach((label) =>
			expect(screen.getByText(label)).toBeInTheDocument()
		);

		// Expected statuses for provided values
		const expectedStatuses = {
			'Latency Tuning': 'Balanced',
			Stability: 'Balanced',
			'Delivery Speed': 'Fast',
			'Similarity Boost': 'High',
			Temperature: 'High',
		} as const;

		for (const [label, status] of Object.entries(expectedStatuses)) {
			const ancestor = getProgressForLabel(label);
			expect(within(ancestor).getByText(status)).toBeInTheDocument();
			const progress = screen.getByRole('progressbar', { name: label });
			const value = progress.getAttribute('aria-valuenow');
			if (!value) throw new Error('progress element has no aria-valuenow');
			const numeric = Math.round(parseFloat(value));
			const expected =
				label === 'Latency Tuning'
					? 75
					: label === 'Stability'
						? 80
						: label === 'Delivery Speed'
							? 60
							: label === 'Similarity Boost'
								? 80
								: 80;
			expect(numeric).toBe(expected);
		}
	});

	it('falls back to default temperature when agent.prompt.temperature is missing', () => {
		const config = {
			tts: {
				stability: 0.5,
				speed: 1.0,
				similarityBoost: 0.2,
				optimizeStreamingLatency: 1,
			},
			// no agent provided -> temperature defaults to 0 in component
		} as any;

		renderWithProviders(<ConfigurationSummary config={config} />);

		// Temperature row should be present and show 'Low' status
		const ancestor = getProgressForLabel('Temperature');
		const p = screen.getByRole('progressbar', { name: 'Temperature' });
		expect(within(ancestor).getByText('Low')).toBeInTheDocument();
		const v = p.getAttribute('aria-valuenow');
		expect(Math.round(parseFloat(v || '0'))).toBe(0);
	});
});

export {};

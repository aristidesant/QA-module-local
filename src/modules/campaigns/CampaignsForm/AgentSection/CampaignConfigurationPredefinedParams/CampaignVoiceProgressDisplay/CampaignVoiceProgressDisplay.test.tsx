import { screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampaignVoiceProgressDisplay from './CampaignVoiceProgressDisplay';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('CampaignVoiceProgressDisplay', () => {
	it('renders all metrics with default values', () => {
		renderWithProviders(<CampaignVoiceProgressDisplay />);

		// Labels
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

		// Check status text and progressbars exist for each label
		labels.forEach((label) => {
			const labelEl = screen.getByText(label);
			// climb up the DOM tree until a container containing a progressbar is found
			let ancestor: HTMLElement | null = labelEl.parentElement;
			while (
				ancestor &&
				ancestor.querySelector('[role="progressbar"]') == null
			) {
				ancestor = ancestor.parentElement;
			}
			expect(ancestor).not.toBeNull();
			const progress = within(ancestor as HTMLElement).getByRole('progressbar');
			expect(progress).toBeInTheDocument();
		});

		// Default status expectations per label
		const defaultStatuses = {
			'Latency Tuning': 'Low',
			Stability: 'Low',
			'Delivery Speed': 'Normal',
			'Similarity Boost': 'Low',
			Temperature: 'Low',
		} as const;

		for (const [label, status] of Object.entries(defaultStatuses)) {
			const ancestor = labels.includes(label)
				? (() => {
						// reuse logic to find ancestor
						const labelEl = screen.getByText(label);
						let node: HTMLElement | null = labelEl.parentElement;
						while (node && node.querySelector('[role="progressbar"]') == null)
							node = node.parentElement;
						if (!node) throw new Error('ancestor not found');
						return node;
					})()
				: null;
			if (!ancestor) throw new Error(`Missing ancestor for ${label}`);
			expect(within(ancestor).getByText(status)).toBeInTheDocument();

			const progress = within(ancestor).getByRole('progressbar');
			const val = parseFloat(progress.getAttribute('aria-valuenow') ?? '0');
			// round for approximate check
			const expectedVal =
				label === 'Delivery Speed' ? Math.round(((1 - 0.5) / 1.5) * 100) : 0;
			expect(Math.round(val)).toBe(expectedVal);
		}
	});

	it('displays the expected statuses and progress values for given props', () => {
		renderWithProviders(
			<CampaignVoiceProgressDisplay
				stability={0.8}
				speed={1.4}
				similarityBoost={0.8}
				optimizeLatency={3}
				temperature={1.6}
			/>
		);

		// Status texts we expect for our props
		const expectedStatuses = {
			'Latency Tuning': 'Balanced',
			Stability: 'Balanced',
			'Delivery Speed': 'Fast',
			'Similarity Boost': 'High',
			Temperature: 'High',
		} as const;

		const getProgressForLabel = (label: string) => {
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
			return ancestor;
		};

		for (const [label, status] of Object.entries(expectedStatuses)) {
			expect(screen.getByText(label)).toBeInTheDocument();
			const ancestor = getProgressForLabel(label);
			expect(within(ancestor).getByText(status)).toBeInTheDocument();
			const progress = within(ancestor).getByRole('progressbar');
			// Validate actual aria-valuenow values per label
			const value = progress.getAttribute('aria-valuenow');
			if (!value) throw new Error('progress element has no aria-valuenow');
			const numeric = parseFloat(value);
			// compute expected
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
			expect(Math.round(numeric)).toBe(expected);
		}
	});
});

export {};

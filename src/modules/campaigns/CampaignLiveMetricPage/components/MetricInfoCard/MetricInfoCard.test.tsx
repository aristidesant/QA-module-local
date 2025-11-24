import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricInfoCard } from './MetricInfoCard';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('MetricInfoCard', () => {
	it('renders label and value correctly', () => {
		renderWithProviders(<MetricInfoCard label='Test Label' value='100' />);
		expect(screen.getByText('Test Label')).toBeInTheDocument();
		expect(screen.getByText('100')).toBeInTheDocument();
	});

	it('renders tooltip when provided', () => {
		// Note: Tooltip content might not be in the document immediately or might be in a portal.
		// For this simple test, we just check if the icon is rendered which implies the tooltip structure is there.
		// Testing Mantine tooltips can be tricky without user interaction.
		// We can check if the ActionIcon is present.
		const { container } = renderWithProviders(
			<MetricInfoCard label='Test Label' value='100' tooltip='Test Tooltip' />
		);
		// Look for the info icon
		expect(
			container.querySelector('.tabler-icon-info-circle')
		).toBeInTheDocument();
	});

	it('does not render tooltip icon when not provided', () => {
		const { container } = renderWithProviders(
			<MetricInfoCard label='Test Label' value='100' />
		);
		expect(
			container.querySelector('.tabler-icon-info-circle')
		).not.toBeInTheDocument();
	});
});

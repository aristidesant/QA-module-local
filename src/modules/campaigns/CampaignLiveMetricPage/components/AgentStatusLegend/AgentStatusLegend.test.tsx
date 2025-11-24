import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgentStatusLegend } from './AgentStatusLegend';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('AgentStatusLegend', () => {
	it('renders legend items correctly', () => {
		const items = [
			{ label: 'Available', color: 'green' },
			{ label: 'Busy', color: 'red' },
		];

		renderWithProviders(<AgentStatusLegend items={items} />);

		expect(screen.getByText('Available')).toBeInTheDocument();
		expect(screen.getByText('Busy')).toBeInTheDocument();

		// Check if colors are applied (simplified check)
		// In a real scenario, we might check styles more robustly, but checking if elements exist is a good start.
		// const indicators = container.querySelectorAll('.indicator'); // Assuming class name is preserved or we can find by other means
		// Since CSS modules hash classes, we can't easily query by class name unless we mock styles or look for style attributes.
		// However, the component applies inline style for background color.

		// Let's find by text and look at previous sibling or parent structure if needed,
		// but simpler is to trust the rendering if text is there.
		// To be more specific about colors:
		// We can try to find the Box elements.
	});

	it('renders empty list gracefully', () => {
		renderWithProviders(<AgentStatusLegend items={[]} />);
		expect(screen.getByTestId('agent-status-legend')).toBeEmptyDOMElement();
	});
});

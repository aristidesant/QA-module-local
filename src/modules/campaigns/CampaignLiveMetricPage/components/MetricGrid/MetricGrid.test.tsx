import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricGrid } from './MetricGrid';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('MetricGrid', () => {
	it('renders children correctly', () => {
		renderWithProviders(
			<MetricGrid>
				<div data-testid='child'>Child 1</div>
				<div data-testid='child'>Child 2</div>
			</MetricGrid>
		);

		const children = screen.getAllByTestId('child');
		expect(children).toHaveLength(2);
		expect(children[0]).toHaveTextContent('Child 1');
		expect(children[1]).toHaveTextContent('Child 2');
	});
});

import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import StatsCard from './StatsCard';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('StatsCard', () => {
	it('renders labels, numbers and change indicator', () => {
		renderWithProviders(<StatsCard />);

		expect(screen.getByText('Statistics')).toBeInTheDocument();
		expect(screen.getByText('Total calls')).toBeInTheDocument();
		expect(screen.getByText('424,456')).toBeInTheDocument();
		expect(screen.getByText('+21.01%')).toBeInTheDocument();
	});
});

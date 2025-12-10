import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import DispositionChart from './DispositionChart';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('DispositionChart', () => {
	it('renders heading, center percent and legend items', () => {
		renderWithProviders(<DispositionChart />);

		expect(screen.getByText('Outcome Results')).toBeInTheDocument();
		expect(screen.getByText('33.3%')).toBeInTheDocument();
		expect(screen.getByText('Effective Contact')).toBeInTheDocument();
		expect(screen.getByText('No Effective Contact')).toBeInTheDocument();
		expect(screen.getByText('No Contact')).toBeInTheDocument();
	});
});

import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { WorkingHoursHeader } from './WorkingHoursHeader';

describe('WorkingHoursHeader', () => {
	it('renders default title and description', () => {
		renderWithProviders(<WorkingHoursHeader />);

		expect(screen.getByText('Working Hours')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Define the days and time ranges during which your agents are allowed to make calls.'
			)
		).toBeInTheDocument();
	});

	it('renders custom title and description', () => {
		renderWithProviders(
			<WorkingHoursHeader
				title='Custom Title'
				description='Custom Description'
			/>
		);

		expect(screen.getByText('Custom Title')).toBeInTheDocument();
		expect(screen.getByText('Custom Description')).toBeInTheDocument();
	});
});

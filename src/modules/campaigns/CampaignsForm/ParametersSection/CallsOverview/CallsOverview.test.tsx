import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { CallsOverview } from './CallsOverview';

// Mock the context hook
const mockFormValues = {
	callsPerHour: 100,
	estimatedCompletionDays: 5,
};

vi.mock('../SchedulerCard/schedulerFormProvider', () => ({
	useSchedulerFormContext: () => ({
		values: mockFormValues,
	}),
}));

describe('CallsOverview', () => {
	it('renders calls per hour and estimated completion time correctly', () => {
		renderWithProviders(<CallsOverview />);

		// Check titles (using English translations loaded by renderWithProviders)
		expect(screen.getAllByText('Calls per hour')).toHaveLength(2);
		expect(screen.getByText('Estimated completion time')).toBeInTheDocument();

		// Check subtitles
		expect(
			screen.getByText('Hourly distribution of daily call capacity')
		).toBeInTheDocument();
		expect(
			screen.getByText('Projected timeline based on current capacity')
		).toBeInTheDocument();

		// Check values from context
		expect(screen.getByText('100')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();

		// Check units/labels
		expect(screen.getByText('days')).toBeInTheDocument();
	});
});

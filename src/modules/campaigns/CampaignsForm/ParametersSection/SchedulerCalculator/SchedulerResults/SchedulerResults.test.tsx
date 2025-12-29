import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import SchedulerResults from './SchedulerResults';

// Mock the store
vi.mock('~/stores/schedulerCalculatorStore', () => ({
	useSchedulerCalculatorStore: () => ({
		mode: 'resources',
		formValues: { totalRecords: 1000 },
		summary: {
			totalAgents: 10,
			daysEstimation: 5,
			totalTries: 1500,
			operationalHours: 80,
			totalTeamHoursByDay: 16,
			waveDistribution: [],
			waves: [],
		},
	}),
}));

describe('SchedulerResults', () => {
	it('renders summary metrics correctly', () => {
		renderWithProviders(<SchedulerResults />);

		expect(screen.getByText('Projection summary')).toBeInTheDocument();
		expect(screen.getByText('Campaign volume')).toBeInTheDocument();
		expect(screen.getByText(/1,000\s*records/)).toBeInTheDocument();
		expect(screen.getByText('Agents required')).toBeInTheDocument();
		expect(screen.getByText(/10(\.00)?\s*agents/)).toBeInTheDocument();
	});
});

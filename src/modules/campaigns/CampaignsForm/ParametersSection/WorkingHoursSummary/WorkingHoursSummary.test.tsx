import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { WorkingHoursSummary } from './WorkingHoursSummary';

describe('WorkingHoursSummary', () => {
	it('renders no active days when empty', () => {
		renderWithProviders(<WorkingHoursSummary workingHours={{}} />);
		// Check for "No active days" appearing twice (time range and days text)
		const elements = screen.getAllByText('No active days');
		expect(elements).toHaveLength(2);
	});

	it('renders weekdays correctly', () => {
		const workingHours = {
			monday: { enabled: true, from: '09:00', to: '17:00' },
			tuesday: { enabled: true, from: '09:00', to: '17:00' },
			wednesday: { enabled: true, from: '09:00', to: '17:00' },
			thursday: { enabled: true, from: '09:00', to: '17:00' },
			friday: { enabled: true, from: '09:00', to: '17:00' },
		};

		renderWithProviders(<WorkingHoursSummary workingHours={workingHours} />);

		expect(screen.getByText('09:00 - 17:00')).toBeInTheDocument();
		expect(screen.getByText('Weekdays')).toBeInTheDocument();
	});
});

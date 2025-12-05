import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import SchedulerPredefinedParamsList from './SchedulerPredefinedParamsList';

const sampleSchedules = [
	{
		name: 'Weekday',
		dayConfigs: [
			{
				dayOfWeek: 'monday',
				dayOrder: 1,
				isActive: true,
				dailyCallLimit: 50,
				startHour: '08:00',
				endHour: '17:00',
				hourConfigs: [],
			},
			{
				dayOfWeek: 'tuesday',
				dayOrder: 2,
				isActive: true,
				dailyCallLimit: 50,
				startHour: '08:00',
				endHour: '17:00',
				hourConfigs: [],
			},
		],
	},
];

describe('SchedulerPredefinedParamsList', () => {
	it('renders schedule information', () => {
		renderWithProviders(
			<SchedulerPredefinedParamsList data={sampleSchedules as any} />
		);

		expect(screen.getByText('Weekday')).toBeInTheDocument();
		expect(screen.getByText(/Mon, Tue/)).toBeInTheDocument();
		expect(screen.getByText(/08:00 - 17:00/)).toBeInTheDocument();
	});

	it('handles row click', () => {
		const onRowClick = vi.fn();
		renderWithProviders(
			<SchedulerPredefinedParamsList
				data={sampleSchedules as any}
				onRowClick={onRowClick}
			/>
		);

		fireEvent.click(screen.getByText('Weekday'));

		expect(onRowClick).toHaveBeenCalledWith(sampleSchedules[0]);
	});
});

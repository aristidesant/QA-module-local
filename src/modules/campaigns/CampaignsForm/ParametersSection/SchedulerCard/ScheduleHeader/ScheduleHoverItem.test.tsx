import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ScheduleHoverItem from './ScheduleHoverItem';
import type { DayConfig } from '~/models/SchedulerModel';

describe('ScheduleHoverItem', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders day name, times and hours badge', () => {
		const day: DayConfig = {
			id: 1,
			scheduleId: 1,
			clientId: 1,
			userId: 1,
			dayOfWeek: 'monday',
			dayOrder: 1,
			isActive: true,
			dailyCallLimit: null,
			dayCapacity: null,
			startHour: '08:00:00',
			endHour: '12:30:00',
			createdAt: '2020-01-01T00:00:00.000Z',
			updatedAt: '2020-01-01T00:00:00.000Z',
			deletedAt: null,
			hourConfigs: [],
		};

		const { getByText } = renderWithProviders(<ScheduleHoverItem day={day} />);

		// Day name should be capitalized
		expect(getByText('Monday')).toBeInTheDocument();

		// Formatted time should be visible
		expect(getByText('8:00am — 12:30pm')).toBeInTheDocument();

		// Hours badge should show the computed hours (4.5h)
		expect(getByText('4.50h')).toBeInTheDocument();
	});
});

export {};

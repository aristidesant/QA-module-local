import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ScheduleHeader from './ScheduleHeader';
import type { Scheduler } from '~/models/SchedulerModel';

describe('ScheduleHeader', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders title, status, metrics and calls handlers', async () => {
		const handleChange = vi.fn();
		const handleEdit = vi.fn();
		const handleDelete = vi.fn();

		const schedule: Partial<Scheduler> = {
			id: 1,
			name: 'Test Schedule',
			status: 'active',
			humanEquivalent: 2,
			estimatedCompletionDays: 5,
			dayConfigs: [
				{
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
					endHour: '11:00:00',
					createdAt: '2020-01-01T00:00:00.000Z',
					updatedAt: '2020-01-01T00:00:00.000Z',
					deletedAt: null,
					hourConfigs: [],
				},
			],
		};

		renderWithProviders(
			<ScheduleHeader
				schedule={schedule as Scheduler}
				onChange={handleChange}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		);

		// Title and status
		expect(screen.getByText('Test Schedule')).toBeInTheDocument();
		expect(screen.getByText('Active')).toBeInTheDocument();
		expect(screen.getByText('1 active day')).toBeInTheDocument();

		// Metrics: Equivalents, Weekly, Per Agent, ETA
		expect(screen.getByText('Equivalents')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();

		expect(screen.getByText('Weekly')).toBeInTheDocument();
		expect(screen.getByText('6.0h')).toBeInTheDocument();

		expect(screen.getByText('Per Agent')).toBeInTheDocument();
		expect(screen.getByText('3.0h')).toBeInTheDocument();

		expect(screen.getByText('ETA')).toBeInTheDocument();
		expect(screen.getByText('5d')).toBeInTheDocument();

		// Actions
		const switchEl = screen.getByLabelText('Toggle schedule status');
		await userEvent.click(switchEl);
		expect(handleChange).toHaveBeenCalledWith(false);

		await userEvent.click(screen.getByLabelText('Edit'));
		expect(handleEdit).toHaveBeenCalled();

		await userEvent.click(screen.getByLabelText('Delete'));
		expect(handleDelete).toHaveBeenCalled();
	});
});

export {};

import { useEffect } from 'react';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DayScheduleCard } from './DayScheduleCard';
import {
	SchedulerFormProvider,
	useSchedulerForm,
} from '../SchedulerCard/schedulerFormProvider';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
// types
import type { DayConfig } from '~/models/SchedulerModel';

type MockTimePickerProps = {
	value?: string | Date | null;
	onChange?: (value: string | Date | null) => void;
	'aria-label'?: string;
};

// Keep the time picker simple so we can drive onChange deterministically
vi.mock('@mantine/dates', () => ({
	TimePicker: ({
		value,
		onChange,
		'aria-label': ariaLabel,
	}: MockTimePickerProps) => {
		const displayValue =
			typeof value === 'string' && value.length >= 5
				? value.slice(0, 5)
				: value instanceof Date
					? `${value.getHours().toString().padStart(2, '0')}:${value
							.getMinutes()
							.toString()
							.padStart(2, '0')}`
					: '';

		return (
			<input
				aria-label={ariaLabel || 'time-picker'}
				value={displayValue}
				onChange={(event) => {
					const val = event.target.value;
					if (!val || (typeof val === 'string' && val.trim().length < 2)) {
						onChange?.(null);
						return;
					}

					const [hour = '0', minute = '0'] = val.split(':');
					if (hour === '' && minute === '') {
						onChange?.(null);
						return;
					}

					const date = new Date();
					date.setHours(Number(hour), Number(minute), 0, 0);
					onChange?.(date);
				}}
			/>
		);
	},
}));

const createDayConfigs = (): DayConfig[] => [
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
		endHour: '12:00:00',
		createdAt: '2020-01-01T00:00:00.000Z',
		updatedAt: '2020-01-01T00:00:00.000Z',
		deletedAt: null,
		hourConfigs: [],
	},
	{
		id: 2,
		scheduleId: 1,
		clientId: 1,
		userId: 1,
		dayOfWeek: 'tuesday',
		dayOrder: 2,
		isActive: false,
		dailyCallLimit: null,
		dayCapacity: null,
		startHour: '09:00:00',
		endHour: '11:00:00',
		createdAt: '2020-01-01T00:00:00.000Z',
		updatedAt: '2020-01-01T00:00:00.000Z',
		deletedAt: null,
		hourConfigs: [],
	},
];

const renderComponent = () => {
	const formRef: {
		current: ReturnType<typeof useSchedulerForm> | null;
	} = { current: null };

	const Wrapper = () => {
		const form = useSchedulerForm({
			initialValues: {
				humanEquivalent: 2,
				dayConfigs: createDayConfigs(),
			},
		});

		useEffect(() => {
			formRef.current = form;
		}, [form]);

		return (
			<SchedulerFormProvider form={form}>
				<DayScheduleCard />
			</SchedulerFormProvider>
		);
	};

	return {
		user: userEvent.setup(),
		formRef,
		...renderWithProviders(<Wrapper />),
	};
};

describe('DayScheduleCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders active day metrics and calling window', () => {
		renderComponent();

		const mondayRow = screen.getByLabelText(/monday schedule/i);
		expect(within(mondayRow).getByText('Window: 240 min')).toBeInTheDocument();
		expect(within(mondayRow).getByText('154 min')).toBeInTheDocument();
		expect(within(mondayRow).getByText('308 min')).toBeInTheDocument();

		const tuesdayRow = screen.getByLabelText(/tuesday schedule/i);
		expect(within(tuesdayRow).getByText('Closed')).toBeInTheDocument();
	});

	it('toggles selected state when clicking and keyboard pressing', async () => {
		const { user } = renderComponent();

		const mondayRow = screen.getByLabelText(/monday schedule/i);
		expect(mondayRow).toHaveAttribute('aria-pressed', 'false');

		// Click to select
		await user.click(mondayRow);
		expect(mondayRow).toHaveAttribute('aria-pressed', 'true');

		// Press Space to deselect
		await user.keyboard(' ');
		expect(mondayRow).toHaveAttribute('aria-pressed', 'false');
	});

	it('toggles a day active state through the switch', async () => {
		const { user, formRef } = renderComponent();

		// Ensure both switches are visible as 'switch' role
		const switches = screen.getAllByRole('switch');
		expect(switches).toHaveLength(2);

		const tuesdayRow = screen.getByLabelText(/tuesday schedule/i);
		const tuesdaySwitch = within(tuesdayRow).getByRole('switch');

		// Activate Tuesday via the switch in its row
		await user.click(tuesdaySwitch);

		await waitFor(() => {
			expect(formRef.current?.values.dayConfigs?.[1]?.isActive).toBe(true);
		});

		expect(within(tuesdayRow).queryByText('Closed')).not.toBeInTheDocument();

		// After activation, ensure time inputs appear for Tuesday
		expect(within(tuesdayRow).getByLabelText('Start time')).toBeInTheDocument();
		expect(within(tuesdayRow).getByLabelText('End time')).toBeInTheDocument();
	});

	it('updates start time and recalculates metrics', async () => {
		const { user, formRef } = renderComponent();

		const mondayRow = screen.getByLabelText(/monday schedule/i);
		const startInput = within(mondayRow).getByLabelText('Start time');

		// Replace the start time with a new value deterministically
		await user.clear(startInput);
		// Use fireEvent.change to provide a single deterministic value
		fireEvent.change(startInput, { target: { value: '09:00' } });

		// Wait for the UI to show the new start time
		await waitFor(() => {
			expect(
				(within(mondayRow).getByLabelText('Start time') as HTMLInputElement)
					.value
			).toBe('09:00');
		});

		// Then wait for the form value to update to the expected hour string
		await waitFor(() => {
			expect(formRef.current?.values.dayConfigs?.[0]?.startHour).toBe(
				'09:00:00'
			);
		});

		expect(within(mondayRow).getByText('Window: 180 min')).toBeInTheDocument();
		expect(within(mondayRow).getByText('116 min')).toBeInTheDocument();
		// Per-agent rounds to 116, team total is 231
		expect(within(mondayRow).getByText('231 min')).toBeInTheDocument();
	});
});

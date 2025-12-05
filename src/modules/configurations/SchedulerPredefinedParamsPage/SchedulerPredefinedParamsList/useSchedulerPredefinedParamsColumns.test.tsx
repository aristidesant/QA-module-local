import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import useSchedulerPredefinedParamsColumns from './useSchedulerPredefinedParamsColumns';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';

describe('useSchedulerPredefinedParamsColumns', () => {
	const sampleConfig: PredefinedScheduleConfig = {
		name: 'Test Schedule',
		dayConfigs: [
			{
				dayOfWeek: 'monday',
				dayOrder: 1,
				isActive: true,
				dailyCallLimit: 100,
				startHour: '09:00',
				endHour: '17:00',
				hourConfigs: [],
			},
			{
				dayOfWeek: 'tuesday',
				dayOrder: 2,
				isActive: false,
				dailyCallLimit: 0,
				startHour: '08:00',
				endHour: '18:00',
				hourConfigs: [],
			},
		],
	};

	const renderCell = (
		columnId: string,
		config: PredefinedScheduleConfig,
		onDelete?: (param: PredefinedScheduleConfig) => void
	) => {
		const TestComponent = () => {
			const columns = useSchedulerPredefinedParamsColumns({ onDelete });
			const col = columns.find(
				(c) => (c as any).accessorKey === columnId || (c as any).id === columnId
			);
			if (!col) return <div>Column not found</div>;
			return <div>{(col as any).cell({ row: { original: config } })}</div>;
		};

		return renderWithProviders(<TestComponent />);
	};

	it('returns 4 columns', () => {
		const TestComponent = () => {
			const columns = useSchedulerPredefinedParamsColumns();
			return <div>{columns.length}</div>;
		};

		renderWithProviders(<TestComponent />);
		expect(screen.getByText('4')).toBeInTheDocument();
	});

	it('renders name cell correctly', () => {
		renderCell('name', sampleConfig);
		expect(screen.getByText('Preset')).toBeInTheDocument();
		expect(screen.getByText('Test Schedule')).toBeInTheDocument();
	});

	it('renders activeDays cell correctly', () => {
		renderCell('activeDays', sampleConfig);
		expect(screen.getByText('Mon')).toBeInTheDocument();
	});

	it('renders window cell correctly', () => {
		renderCell('window', sampleConfig);
		expect(screen.getByText('09:00 - 17:00')).toBeInTheDocument();
	});

	it('renders actions cell and handles delete click', () => {
		const onDelete = vi.fn();
		renderCell('actions', sampleConfig, onDelete);

		const deleteButton = screen.getByLabelText('Delete schedule');
		expect(deleteButton).toBeInTheDocument();
		expect(deleteButton).not.toBeDisabled();

		fireEvent.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(sampleConfig);
	});

	it('disables delete button when onDelete is not provided', () => {
		renderCell('actions', sampleConfig);

		const deleteButton = screen.getByLabelText('Delete schedule');
		expect(deleteButton).toBeDisabled();
	});
});

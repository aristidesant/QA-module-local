import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import SchedulerPredefinedParamsPage from './SchedulerPredefinedParamsPage';
import * as queries from '~/queries/useClientConfigs';
import * as rr from 'react-router';

const mockCanPerformAction = vi.fn().mockReturnValue(true);

vi.mock('~/hooks/usePermissions', () => ({
	usePermissions: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));

const sampleSchedules = [
	{
		name: 'Weekday',
		dayConfigs: [
			{
				dayOfWeek: 'monday',
				dayOrder: 1,
				isActive: true,
				dailyCallLimit: 10,
				startHour: '08:00',
				endHour: '17:00',
				hourConfigs: [],
			},
		],
	},
];

describe('SchedulerPredefinedParamsPage', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		mockCanPerformAction.mockReturnValue(true);
		mockCanPerformAction.mockClear();
	});

	it('renders schedules list and handles row click', () => {
		vi.spyOn(rr, 'useNavigate').mockReturnValue(vi.fn() as any);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'scheduler_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleSchedules),
			},
		} as any);

		renderWithProviders(<SchedulerPredefinedParamsPage />);

		expect(screen.getByText('Weekday')).toBeInTheDocument();
	});

	it('triggers add new flow', async () => {
		vi.spyOn(rr, 'useNavigate').mockReturnValue(vi.fn() as any);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'scheduler_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleSchedules),
			},
		} as any);

		renderWithProviders(<SchedulerPredefinedParamsPage />);

		fireEvent.click(screen.getByRole('button', { name: /Add schedule/i }));

		expect(
			await screen.findByLabelText(/Preset name/i, { selector: 'input' })
		).toBeInTheDocument();
	});

	it('confirms delete flow', async () => {
		vi.spyOn(rr, 'useNavigate').mockReturnValue(vi.fn() as any);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'scheduler_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleSchedules),
			},
		} as any);

		const mutateAsync = vi.fn().mockResolvedValue({});
		vi.spyOn(queries, 'useUpdateClientConfig').mockReturnValue({
			mutateAsync,
			isPending: false,
		} as any);

		renderWithProviders(<SchedulerPredefinedParamsPage />);

		fireEvent.click(screen.getByLabelText('Delete schedule'));

		await waitFor(() => {
			expect(screen.getByText('Delete schedule')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }));

		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalled();
		});
	});

	it('shows permission message when manage is missing', () => {
		mockCanPerformAction.mockReturnValue(false);
		vi.spyOn(rr, 'useNavigate').mockReturnValue(vi.fn() as any);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: undefined,
		} as any);

		renderWithProviders(<SchedulerPredefinedParamsPage />);

		expect(
			screen.getByText(/No permission to edit scheduler presets/i)
		).toBeInTheDocument();
	});
});

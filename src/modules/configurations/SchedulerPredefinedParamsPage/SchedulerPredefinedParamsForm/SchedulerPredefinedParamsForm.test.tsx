import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import SchedulerPredefinedParamsForm from './SchedulerPredefinedParamsForm';
import * as queries from '~/queries/useClientConfigs';

const schedule = {
	name: 'Weekday',
	dayConfigs: [
		{
			dayOfWeek: 'monday',
			dayOrder: 1,
			isActive: true,
			dailyCallLimit: 20,
			dayCapacity: 30,
			startHour: '08:00',
			endHour: '17:00',
			hourConfigs: [],
		},
	],
};

const config = {
	name: 'scheduler_predefined_params',
	description: 'desc',
	type: 'json',
};

describe('SchedulerPredefinedParamsForm', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('submits updated preset', async () => {
		const mutateAsync = vi.fn().mockResolvedValue({});
		vi.spyOn(queries, 'useUpdateClientConfig').mockReturnValue({
			mutateAsync,
			isPending: false,
		} as any);

		renderWithProviders(
			<SchedulerPredefinedParamsForm
				schedule={schedule as any}
				list={[schedule as any]}
				config={config as any}
				onClose={vi.fn()}
			/>
		);

		fireEvent.change(screen.getByLabelText(/Preset name/i), {
			target: { value: 'Updated Weekday' },
		});

		fireEvent.click(screen.getByRole('button', { name: /Update preset/i }));

		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalled();
		});

		const payload = mutateAsync.mock.calls[0][0];
		const parsed = JSON.parse(payload.data.value);

		expect(parsed[0].name).toBe('Updated Weekday');
	});
});

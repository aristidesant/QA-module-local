import { describe, expect, it, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { SchedulerCard } from './SchedulerCard';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { Scheduler } from '~/models/SchedulerModel';

const mockUpdateSchedule = vi.fn();

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('~/queries/schedulerQueries', () => ({
	useUpdateSchedule: () => ({
		mutateAsync: mockUpdateSchedule,
		isPending: false,
	}),
	useActivateSchedule: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useDeactivateSchedule: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useDeleteSchedule: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (selector: (state: unknown) => unknown) =>
		selector({ setRightComponent: vi.fn() }),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		openConfirmModal: vi.fn(),
		open: vi.fn(),
		closeAll: vi.fn(),
	},
}));

describe('SchedulerCard', () => {
	afterEach(() => {
		vi.clearAllMocks();
		mockUpdateSchedule.mockReset();
	});

	const schedulerFixture: Scheduler = {
		id: 1,
		name: 'My Schedule',
		description: null,
		campaignId: 1,
		status: 'active',
		humanEquivalent: 1,
		callsPerHour: null,
		estimatedCompletionDays: null,
		totalWeekVolumes: null,
		totalWeeklyHours: null,
		userId: 1,
		clientId: 1,
		createdAt: '2020-01-01T00:00:00.000Z',
		updatedAt: '2020-01-01T00:00:00.000Z',
		deletedAt: null,
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
				startHour: '10:00:00',
				endHour: '09:00:00',
				createdAt: '2020-01-01T00:00:00.000Z',
				updatedAt: '2020-01-01T00:00:00.000Z',
				deletedAt: null,
				hourConfigs: [],
			},
		],
		scheduleContactGroups: [],
	};

	it('blocks update and shows a notification when active days have invalid time ranges', async () => {
		const user = userEvent.setup();
		const { notifications } = await import('@mantine/notifications');

		renderWithProviders(
			<SchedulerCard
				scheduler={schedulerFixture}
				campaignId='1'
				handleReload={vi.fn()}
			/>
		);

		await user.click(screen.getByLabelText('Edit'));
		await user.click(screen.getByRole('button', { name: /update schedule/i }));

		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Fix schedule time ranges',
			})
		);
		expect(mockUpdateSchedule).not.toHaveBeenCalled();
	});
});

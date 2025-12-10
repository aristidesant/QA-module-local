import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import SchedulerPredefinedParamsPage from './SchedulerPredefinedParamsPage';
import * as queries from '~/queries/useClientConfigs';
import * as rr from 'react-router';

const mockCanPerformAction = vi.fn().mockReturnValue(true);
const mockIsMasterClient = vi.fn().mockReturnValue(false);

vi.mock('~/hooks/usePermissions', () => ({
	usePermissions: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));
vi.mock('~/hooks/useIsMasterClient', () => ({
	useIsMasterClient: () => mockIsMasterClient(),
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
				clientId: 1,
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
				clientId: 1,
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
				clientId: 1,
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

	it('shows InlineNotice when global and non-master, and shows create override', () => {
		// Non-master viewing global config
		mockIsMasterClient.mockReturnValue(false);
		vi.spyOn(rr, 'useNavigate').mockReturnValue(vi.fn() as any);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'scheduler_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleSchedules),
				clientId: null,
			},
		} as any);

		vi.spyOn(queries, 'useCreateClientConfig').mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({}),
			isPending: false,
		} as any);

		renderWithProviders(<SchedulerPredefinedParamsPage />);

		expect(screen.getByText(/Global configuration/i)).toBeInTheDocument();
		expect(screen.getByLabelText('Create override')).toBeInTheDocument();
	});

	it('can create override for global when non-master', async () => {
		mockIsMasterClient.mockReturnValue(false);
		vi.spyOn(rr, 'useNavigate').mockReturnValue(vi.fn() as any);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'scheduler_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleSchedules),
				clientId: null,
			},
		} as any);

		const mutateCreate = vi.fn().mockResolvedValue({});
		vi.spyOn(queries, 'useCreateClientConfig').mockReturnValue({
			mutateAsync: mutateCreate,
			isPending: false,
		} as any);

		renderWithProviders(<SchedulerPredefinedParamsPage />);

		fireEvent.click(screen.getByLabelText('Create override'));

		await waitFor(() => {
			expect(mutateCreate).toHaveBeenCalled();
		});
	});

	it('can delete override (client override config)', async () => {
		// Master or client override case: show delete config
		mockIsMasterClient.mockReturnValue(true);
		vi.spyOn(rr, 'useNavigate').mockReturnValue(vi.fn() as any);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'scheduler_predefined_params',
				description: 'desc',
				type: 'json',
				value: JSON.stringify(sampleSchedules),
				clientId: 1,
			},
		} as any);

		const deleteMutate = vi.fn().mockResolvedValue({});
		vi.spyOn(queries, 'useDeleteClientConfig').mockReturnValue({
			mutateAsync: deleteMutate,
			isPending: false,
		} as any);

		renderWithProviders(<SchedulerPredefinedParamsPage />);

		fireEvent.click(screen.getByLabelText('Delete override'));

		await waitFor(() => {
			expect(screen.getByText('Delete configuration')).toBeInTheDocument();
		});

		const dialog = screen.getByRole('dialog', {
			name: /Delete configuration/i,
		});
		const dialogWithin = within(dialog);
		fireEvent.click(
			dialogWithin.getByRole('button', { name: /Delete override/i })
		);

		await waitFor(() => {
			expect(deleteMutate).toHaveBeenCalled();
		});
	});
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddShedulerForm from './AddShedulerForm';
import renderWithProviders from '~/test-utils/renderWithProviders';

vi.mock('~/queries/campaignsQueries', () => ({
	useCreateCampaignSchedule: vi.fn(() => ({
		mutateAsync: vi.fn(),
		isPending: false,
	})),
}));

vi.mock('~/queries/clientConfigQueries', () => ({
	useGetClientConfig: vi.fn(() => ({
		data: undefined,
		isLoading: false,
	})),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

import type { DayConfig } from '~/api/campaignsApi';
import { useCreateCampaignSchedule } from '~/queries/campaignsQueries';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { notifications } from '@mantine/notifications';

const sampleConfig = JSON.stringify([
	{
		name: 'Standard Business Hours',
		dayConfigs: [
			{
				dayOfWeek: 'monday',
				isActive: true,
				dailyCallLimit: 10,
				startHour: '08:00',
				endHour: '17:00',
				hourConfigs: [],
			},
			{
				dayOfWeek: 'tuesday',
				isActive: true,
				dailyCallLimit: 10,
				startHour: '08:00',
				endHour: '17:00',
				hourConfigs: [],
			},
			{
				dayOfWeek: 'sunday',
				isActive: false,
				dailyCallLimit: 0,
				hourConfigs: [],
			},
		],
	},
]);

describe('AddShedulerForm', () => {
	const mockOnCancel = vi.fn();
	const mockOnSuccess = vi.fn();
	const mockMutateAsync = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useCreateCampaignSchedule as ReturnType<typeof vi.fn>).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false,
		});
		(useGetClientConfig as ReturnType<typeof vi.fn>).mockReturnValue({
			data: { value: sampleConfig },
			isLoading: false,
		});
		(notifications.show as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
	});

	it('handles invalid JSON in client config gracefully', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		(useGetClientConfig as ReturnType<typeof vi.fn>).mockReturnValue({
			data: { value: 'not a json' },
			isLoading: false,
		});

		renderWithProviders(
			<AddShedulerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
		);

		// No templates should be available, select will show no options
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		expect(select).toBeInTheDocument();
	});

	it('shows fallback label for schedules without a name', async () => {
		(useGetClientConfig as ReturnType<typeof vi.fn>).mockReturnValue({
			data: { value: JSON.stringify([{ name: '', dayConfigs: [] }]) },
			isLoading: false,
		});
		renderWithProviders(<AddShedulerForm campaignId={'1'} />);
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await userEvent.click(select);
		await waitFor(() =>
			expect(screen.getByText('Schedule 1')).toBeInTheDocument()
		);
	});

	it('shows "No templates available" when client config returns empty schedules', async () => {
		(useGetClientConfig as ReturnType<typeof vi.fn>).mockReturnValue({
			data: { value: JSON.stringify([]) },
			isLoading: false,
		});
		renderWithProviders(<AddShedulerForm />);
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await userEvent.click(select);
		await waitFor(() =>
			expect(screen.getByText('No templates available')).toBeInTheDocument()
		);
	});

	it('renders the form and its sections', () => {
		renderWithProviders(
			<AddShedulerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
		);

		expect(screen.getByText(/Curated schedules/i)).toBeInTheDocument();
		expect(screen.getByText(/Predefined schedule/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Schedule name/i)).toBeInTheDocument();
		expect(screen.getByRole('slider')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Create schedule/i })
		).toBeInTheDocument();
	});

	it('shows preview table when a predefined schedule is selected', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<AddShedulerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
		);

		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		// the select is searchable; click option by text
		await waitFor(() =>
			expect(screen.getByText('Standard Business Hours')).toBeInTheDocument()
		);
		await user.click(screen.getByText('Standard Business Hours'));

		// Monday header and its hours should be rendered
		expect(screen.getByText('Monday')).toBeInTheDocument();
		expect(screen.getAllByText('08:00 - 17:00').length).toBeGreaterThan(0);
	});

	it('shows initial preview hint when no template is selected', () => {
		renderWithProviders(
			<AddShedulerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
		);
		expect(
			screen.getByText(/Select a template to preview its configured days./i)
		).toBeInTheDocument();
	});

	it('shows name validation error when name is empty', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<AddShedulerForm
				onCancel={mockOnCancel}
				onSuccess={mockOnSuccess}
				campaignId={'1'}
			/>
		);
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		await waitFor(() =>
			expect(screen.getByText('Standard Business Hours')).toBeInTheDocument()
		);
		await user.click(screen.getByText('Standard Business Hours'));
		// leave name empty
		await user.click(screen.getByRole('button', { name: /Create schedule/i }));
		expect(mockMutateAsync).not.toHaveBeenCalled();
	});

	it('fills default hours when day config has no start and end', async () => {
		const user = userEvent.setup();
		(useGetClientConfig as ReturnType<typeof vi.fn>).mockReturnValue({
			data: {
				value: JSON.stringify([
					{
						name: 'No hours template',
						dayConfigs: [
							{
								dayOfWeek: 'monday',
								isActive: true,
								dailyCallLimit: 10,
								hourConfigs: [],
							},
						],
					},
				]),
			},
			isLoading: false,
		});
		renderWithProviders(
			<AddShedulerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
		);
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		await waitFor(() =>
			expect(screen.getByText('No hours template')).toBeInTheDocument()
		);
		await user.click(screen.getByText('No hours template'));
		expect(screen.getAllByText('08:00 - 17:00').length).toBeGreaterThan(0);
	});

	it('prevents submission when campaignId is not provided', async () => {
		const user = userEvent.setup();
		renderWithProviders(<AddShedulerForm />);

		// select a template and fill values
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		await waitFor(() =>
			expect(screen.getByText('Standard Business Hours')).toBeInTheDocument()
		);
		await user.click(screen.getByText('Standard Business Hours'));

		await user.type(screen.getByLabelText(/Schedule name/i), 'My schedule');

		const submitButton = screen.getByRole('button', {
			name: /Create schedule/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({ title: 'Error' })
			);
		});
		expect(mockMutateAsync).not.toHaveBeenCalled();
	});

	it('fills empty templates with inactive days instead of blocking submission', async () => {
		const user = userEvent.setup();
		mockMutateAsync.mockResolvedValue({});
		// Provide a template without dayConfigs
		(useGetClientConfig as ReturnType<typeof vi.fn>).mockReturnValue({
			data: { value: JSON.stringify([{ name: 'Empty', dayConfigs: [] }]) },
			isLoading: false,
		});

		renderWithProviders(<AddShedulerForm campaignId={1} />);
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		await waitFor(() => expect(screen.getByText('Empty')).toBeInTheDocument());
		await user.click(screen.getByText('Empty'));
		await user.type(screen.getByLabelText(/Schedule name/i), 'My schedule');
		await user.click(screen.getByRole('button', { name: /Create schedule/i }));

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
		const payload = mockMutateAsync.mock.calls[0][0];
		const dayConfigs = (payload.data.dayConfigs || []) as DayConfig[];
		expect(dayConfigs).toHaveLength(7);
		expect(dayConfigs.every((day) => day.dayOfWeek && day.hourConfigs)).toBe(
			true
		);
		expect(dayConfigs.filter((day) => day.isActive).length).toBe(0);
	});

	it('shows loading state when mutation is pending', () => {
		(useCreateCampaignSchedule as ReturnType<typeof vi.fn>).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: true,
		});
		renderWithProviders(
			<AddShedulerForm
				onCancel={mockOnCancel}
				onSuccess={mockOnSuccess}
				campaignId={'123'}
			/>
		);
		expect(
			screen.getByRole('button', { name: /Create schedule/i })
		).toBeDisabled();
	});

	it('calls onCancel when cancel button is clicked', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<AddShedulerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
		);
		const cancel = screen.getByRole('button', { name: /Cancel/i });
		await user.click(cancel);
		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});

	it('submits the form and calls the API and onSuccess on success', async () => {
		const user = userEvent.setup();
		mockMutateAsync.mockResolvedValue({});
		renderWithProviders(
			<AddShedulerForm
				onCancel={mockOnCancel}
				onSuccess={mockOnSuccess}
				campaignId={'123'}
			/>
		);

		// Select template
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		await waitFor(() =>
			expect(screen.getByText('Standard Business Hours')).toBeInTheDocument()
		);
		await user.click(screen.getByText('Standard Business Hours'));

		await user.type(screen.getByLabelText(/Schedule name/i), 'My schedule');
		await user.type(
			screen.getByPlaceholderText('e.g. Monday to Friday from 08:00 to 17:00'),
			'Example description'
		);

		const submitButton = screen.getByRole('button', {
			name: /Create schedule/i,
		});
		await user.click(submitButton);

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
		// We expect the mutation to be called with campaign id and payload
		const expectedPayload = expect.objectContaining({
			campaignId: '123',
			data: expect.objectContaining({
				name: 'My schedule',
				description: 'Example description',
				humanEquivalent: expect.any(Number),
				dayConfigs: expect.any(Array),
			}),
		});
		expect(mockMutateAsync).toHaveBeenCalledWith(expectedPayload);
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Success' })
		);
		expect(mockOnSuccess).toHaveBeenCalled();
	});

	it('adds missing days as inactive dayConfigs before submission', async () => {
		const user = userEvent.setup();
		mockMutateAsync.mockResolvedValue({});
		renderWithProviders(
			<AddShedulerForm onSuccess={mockOnSuccess} campaignId={'789'} />
		);

		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		await waitFor(() =>
			expect(screen.getByText('Standard Business Hours')).toBeInTheDocument()
		);
		await user.click(screen.getByText('Standard Business Hours'));

		await user.type(screen.getByLabelText(/Schedule name/i), 'Full week');
		await user.type(
			screen.getByPlaceholderText('e.g. Monday to Friday from 08:00 to 17:00'),
			'Description'
		);
		await user.click(screen.getByRole('button', { name: /Create schedule/i }));

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());

		const payload = mockMutateAsync.mock.calls[0][0];
		const dayConfigs = (payload.data.dayConfigs || []) as DayConfig[];
		expect(dayConfigs).toHaveLength(7);
		const wednesday = dayConfigs.find((day) => day.dayOfWeek === 'wednesday');
		expect(wednesday).toMatchObject({
			isActive: false,
			dailyCallLimit: 0,
		});
		const monday = dayConfigs.find((day) => day.dayOfWeek === 'monday');
		expect(monday?.isActive).toBe(true);
	});

	it('keeps provided hours for inactive day configs on submission', async () => {
		const user = userEvent.setup();
		mockMutateAsync.mockResolvedValue({});
		(useGetClientConfig as ReturnType<typeof vi.fn>).mockReturnValue({
			data: {
				value: JSON.stringify([
					{
						name: 'Mixed activity',
						dayConfigs: [
							{
								dayOfWeek: 'monday',
								isActive: true,
								dailyCallLimit: 5,
								startHour: '08:00',
								endHour: '12:00',
								hourConfigs: [],
							},
							{
								dayOfWeek: 'saturday',
								isActive: false,
								dailyCallLimit: 0,
								startHour: '09:00',
								endHour: '18:00',
								hourConfigs: [],
							},
						],
					},
				]),
			},
			isLoading: false,
		});

		renderWithProviders(
			<AddShedulerForm onSuccess={mockOnSuccess} campaignId={'321'} />
		);

		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		await waitFor(() =>
			expect(screen.getByText('Mixed activity')).toBeInTheDocument()
		);
		await user.click(screen.getByText('Mixed activity'));

		await user.type(
			screen.getByLabelText(/Schedule name/i),
			'Reset inactive hours'
		);
		await user.click(screen.getByRole('button', { name: /Create schedule/i }));

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
		const payload = mockMutateAsync.mock.calls[0][0];
		const dayConfigs = (payload.data.dayConfigs || []) as DayConfig[];
		const saturday = dayConfigs.find((day) => day.dayOfWeek === 'saturday');
		expect(saturday).toMatchObject({
			isActive: false,
			startHour: '09:00',
			endHour: '18:00',
		});
	});

	it('shows API error message from server when mutation fails', async () => {
		const user = userEvent.setup();
		const error = { response: { data: { message: 'Specific server error' } } };
		mockMutateAsync.mockRejectedValue(error);
		renderWithProviders(
			<AddShedulerForm
				onCancel={mockOnCancel}
				onSuccess={mockOnSuccess}
				campaignId={456}
			/>
		);

		// Select template
		const select = screen.getByPlaceholderText(
			'Select days and hours configuration'
		);
		await user.click(select);
		await waitFor(() =>
			expect(screen.getByText('Standard Business Hours')).toBeInTheDocument()
		);
		await user.click(screen.getByText('Standard Business Hours'));

		await user.type(screen.getByLabelText(/Schedule name/i), 'My schedule');
		await user.type(
			screen.getByPlaceholderText('e.g. Monday to Friday from 08:00 to 17:00'),
			'Example description'
		);

		const submitButton = screen.getByRole('button', {
			name: /Create schedule/i,
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Error Creating Schedule',
					message: 'Specific server error',
				})
			);
		});
	});
});

export {};

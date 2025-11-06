import {
	Button,
	Group,
	Stack,
	TextInput,
	Textarea,
	Slider,
	Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import type { DayConfig } from '~/api/campaignsApi';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { useCreateCampaignSchedule } from '~/queries/campaignsQueries';

interface AddShedulerFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	campaignId?: string | number | null;
}

interface PredefinedScheduleFormValues {
	name: string;
	description: string;
	humanEquivalent: number | '';
	predefinedScheduleId: string | null;
}

interface PredefinedScheduleConfig {
	dayConfigs: DayConfig[];
}

// Helper function to generate a label for a schedule based on active days and times
const generateScheduleLabel = (schedule: PredefinedScheduleConfig): string => {
	const activeDays = schedule.dayConfigs.filter((day) => day.isActive);

	if (activeDays.length === 0) {
		return 'No active days';
	}

	// Get unique start and end hours from the day's startHour and endHour properties
	const timeRanges = new Set<string>();
	activeDays.forEach((day) => {
		if (day.startHour && day.endHour) {
			timeRanges.add(`${day.startHour}-${day.endHour}`);
		}
	});

	// Format day names (handle both lowercase and uppercase)
	const dayNames = activeDays.map((day) => {
		const dayMap: Record<string, string> = {
			monday: 'Mon',
			tuesday: 'Tue',
			wednesday: 'Wed',
			thursday: 'Thu',
			friday: 'Fri',
			saturday: 'Sat',
			sunday: 'Sun',
			MONDAY: 'Mon',
			TUESDAY: 'Tue',
			WEDNESDAY: 'Wed',
			THURSDAY: 'Thu',
			FRIDAY: 'Fri',
			SATURDAY: 'Sat',
			SUNDAY: 'Sun',
		};
		return dayMap[day.dayOfWeek] || day.dayOfWeek;
	});

	// Check if it's weekdays (handle both lowercase and uppercase)
	const isWeekdays =
		activeDays.length === 5 &&
		activeDays.every((day) =>
			[
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'MONDAY',
				'TUESDAY',
				'WEDNESDAY',
				'THURSDAY',
				'FRIDAY',
			].includes(day.dayOfWeek)
		);

	const dayLabel = isWeekdays ? 'Weekdays' : dayNames.join(', ');
	const timeLabel = Array.from(timeRanges).join(', ');

	return `${dayLabel} ${timeLabel}`;
};

const AddShedulerForm: React.FC<AddShedulerFormProps> = ({
	onSuccess,
	onCancel,
	campaignId,
}) => {
	const createScheduleMutation = useCreateCampaignSchedule();
	const clientConfigQuery = useGetClientConfig('scheduler_predefined_params');

	// Parse predefined schedules from client config
	const predefinedSchedules = useMemo<PredefinedScheduleConfig[]>(() => {
		try {
			if (!clientConfigQuery.data?.value) return [];
			return JSON.parse(clientConfigQuery.data.value);
		} catch (error) {
			console.error('Error parsing predefined schedules:', error);
			return [];
		}
	}, [clientConfigQuery.data?.value]);

	// Transform schedules to select options with generated labels
	const scheduleOptions = useMemo(
		() =>
			predefinedSchedules.map((schedule, index) => ({
				value: String(index),
				label: generateScheduleLabel(schedule),
			})),
		[predefinedSchedules]
	);

	const form = useForm<PredefinedScheduleFormValues>({
		initialValues: {
			name: '',
			description: '',
			humanEquivalent: 0,
			predefinedScheduleId: null,
		},
		validate: {
			name: (value) => (value.trim() ? null : 'Name is required'),
			predefinedScheduleId: (value) =>
				value ? null : 'Please select a predefined schedule',
			humanEquivalent: (value) => {
				if (value === undefined || value === null) {
					return 'Human Equivalent is required';
				}
				if (typeof value !== 'number' || isNaN(value)) {
					return 'Human Equivalent must be a number';
				}

				return null;
			},
		},
	});

	const handleSubmit = async (values: PredefinedScheduleFormValues) => {
		if (!campaignId) {
			notifications.show({
				title: 'Error',
				message: 'Campaign ID is required',
				color: 'red',
			});
			return;
		}

		// Get the selected predefined schedule's dayConfigs
		let dayConfigs: DayConfig[] = [];
		if (values.predefinedScheduleId !== null) {
			const selectedSchedule =
				predefinedSchedules[parseInt(values.predefinedScheduleId, 10)];
			if (selectedSchedule?.dayConfigs) {
				dayConfigs = selectedSchedule.dayConfigs;
			}
		}

		// Validate that we have dayConfigs
		if (dayConfigs.length === 0) {
			notifications.show({
				title: 'Error',
				message: 'Please select a predefined schedule',
				color: 'red',
			});
			return;
		}

		// Build the payload according to the required structure
		const payload = {
			name: values.name.trim(),
			description: values.description.trim(),
			campaignId: Number(campaignId),
			humanEquivalent: Number(values.humanEquivalent),
			dayConfigs,
		};

		try {
			await createScheduleMutation.mutateAsync({
				campaignId: String(campaignId),
				data: payload,
			});

			notifications.show({
				title: 'Success',
				message: 'Predefined schedule created successfully',
				color: 'green',
				icon: <IconCheck size={16} />,
			});

			if (onSuccess) {
				onSuccess();
			}
		} catch (error: any) {
			console.error('Error creating predefined schedule:', error);

			// Extract error message from API response
			let errorMessage = 'Failed to create predefined schedule';

			if (error?.response?.data?.message) {
				// API returned a specific error message
				errorMessage = error.response.data.message;
			} else if (error?.message) {
				// Generic error message
				errorMessage = error.message;
			}

			notifications.show({
				title: 'Error Creating Schedule',
				message: errorMessage,
				color: 'red',
				autoClose: 8000, // Keep notification visible longer for error messages
			});
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack gap='md'>
				<Select
					label='Predefined Schedule'
					placeholder='Select days and hours configuration'
					description='Choose a predefined schedule template with days and working hours'
					data={scheduleOptions}
					searchable
					required
					{...form.getInputProps('predefinedScheduleId')}
				/>
				<TextInput
					label='Schedule Name'
					placeholder='e.g. Standard Business Hours'
					required
					{...form.getInputProps('name')}
				/>
				<Textarea
					label='Description'
					placeholder='e.g. Monday-Friday 8:00 AM to 5:00 PM'
					minRows={6}
					rows={6}
					maxLength={250}
					{...form.getInputProps('description')}
				/>
				<Stack gap={4}>
					<label htmlFor='humanEquivalent'>Human Equivalent</label>
					<Slider
						id='humanEquivalent'
						min={0}
						max={500}
						step={1}
						value={form.values.humanEquivalent as number}
						onChange={(value) => form.setFieldValue('humanEquivalent', value)}
						marks={Array.from({ length: 11 }, (_, i) => ({
							value: i * 50,
							label: String(i * 50),
						}))}
					/>
					{form.errors.humanEquivalent && (
						<div style={{ color: 'red', fontSize: 12 }}>
							{form.errors.humanEquivalent}
						</div>
					)}
				</Stack>
				<Group justify='flex-end' mt='md'>
					{onCancel && (
						<Button variant='outline' onClick={onCancel}>
							Cancel
						</Button>
					)}
					<Button type='submit' loading={createScheduleMutation.isPending}>
						Create Schedule
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default AddShedulerForm;

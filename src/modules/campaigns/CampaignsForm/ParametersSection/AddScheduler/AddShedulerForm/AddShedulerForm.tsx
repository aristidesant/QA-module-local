import {
	Button,
	Group,
	Stack,
	TextInput,
	Textarea,
	Slider,
	Select,
	Text,
	Paper,
	Badge,
	ThemeIcon,
	Table,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendarStats, IconCheck, IconGauge } from '@tabler/icons-react';
import React, { useCallback, useMemo } from 'react';
import type { DayConfig } from '~/api/campaignsApi';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { useCreateCampaignSchedule } from '~/queries/campaignsQueries';
import classes from './AddShedulerForm.module.css';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';

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

const dayLabelMap: Record<DayConfig['dayOfWeek'], string> = {
	monday: 'Monday',
	tuesday: 'Tuesday',
	wednesday: 'Wednesday',
	thursday: 'Thursday',
	friday: 'Friday',
	saturday: 'Saturday',
	sunday: 'Sunday',
};

const allDaysOfWeek: Array<DayConfig['dayOfWeek']> = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
];

const humanEquivalentMarks = [
	{ value: 0, label: '0' },
	{ value: 50, label: '50' },
	{ value: 100, label: '100' },
	{ value: 150, label: '150' },
];

const DEFAULT_START_HOUR = '08:00';
const DEFAULT_END_HOUR = '17:00';

const normalizeDayConfigs = (dayConfigs: DayConfig[]): DayConfig[] => {
	return allDaysOfWeek.map((dayOfWeek, index) => {
		const existing = dayConfigs.find((day) => day.dayOfWeek === dayOfWeek);
		const isActive = existing?.isActive ?? false;
		const startHour =
			existing?.startHour && existing.startHour.trim()
				? existing.startHour
				: DEFAULT_START_HOUR;
		const endHour =
			existing?.endHour && existing.endHour.trim()
				? existing.endHour
				: DEFAULT_END_HOUR;

		return {
			dayOfWeek,
			dayOrder: existing?.dayOrder ?? index + 1,
			isActive,
			dailyCallLimit: existing?.dailyCallLimit ?? 0,
			dayCapacity: existing?.dayCapacity,
			hourConfigs: existing?.hourConfigs ?? [],
			startHour,
			endHour,
		};
	});
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

	// Transform schedules to select options using the name property
	const scheduleOptions = useMemo(
		() =>
			predefinedSchedules.map((schedule, index) => ({
				value: String(index),
				label: schedule.name || `Schedule ${index + 1}`,
			})),
		[predefinedSchedules]
	);

	const form = useForm<PredefinedScheduleFormValues>({
		initialValues: {
			name: '',
			description: '',
			humanEquivalent: 1,
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

	const selectedSchedule = useMemo<PredefinedScheduleConfig | null>(() => {
		if (form.values.predefinedScheduleId === null) return null;
		return (
			predefinedSchedules[Number(form.values.predefinedScheduleId)] ?? null
		);
	}, [form.values.predefinedScheduleId, predefinedSchedules]);

	const normalizedDayConfigs = useMemo<DayConfig[]>(() => {
		if (!selectedSchedule?.dayConfigs) return [];

		return normalizeDayConfigs(selectedSchedule.dayConfigs);
	}, [selectedSchedule?.dayConfigs]);

	const dayConfigMap = useMemo(() => {
		const map = new Map<DayConfig['dayOfWeek'], DayConfig>();
		normalizedDayConfigs.forEach((day) => {
			map.set(day.dayOfWeek, day);
		});
		return map;
	}, [normalizedDayConfigs]);

	const getDayStatus = useCallback(
		(dayOfWeek: DayConfig['dayOfWeek']) => {
			const dayConfig = dayConfigMap.get(dayOfWeek);
			if (!dayConfig || !dayConfig.isActive) {
				return { isActive: false, times: 'Off' };
			}
			const times =
				dayConfig.startHour && dayConfig.endHour
					? `${dayConfig.startHour.slice(0, 5)} - ${dayConfig.endHour.slice(0, 5)}`
					: 'No hours';
			return { isActive: true, times };
		},
		[dayConfigMap]
	);

	const previewRow = useMemo(() => {
		if (!selectedSchedule) return null;
		return allDaysOfWeek.map((day) => getDayStatus(day).times);
	}, [getDayStatus, selectedSchedule]);

	const handleSubmit = async (values: PredefinedScheduleFormValues) => {
		if (!campaignId) {
			notifications.show({
				title: 'Error',
				message: 'Campaign ID is required',
				color: 'red',
			});
			return;
		}

		// Get the selected predefined schedule's dayConfigs and ensure all days exist
		const dayConfigs =
			values.predefinedScheduleId !== null ? normalizedDayConfigs : [];

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
		<form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text size='sm' fw={700}>
							Curated schedules
						</Text>
						<Text size='xs' c='dimmed'>
							Pick a template, personalize the naming, and tune the human
							equivalent you want to simulate.
						</Text>
					</div>
					<Badge
						variant='light'
						size='sm'
						leftSection={<IconCalendarStats size={14} />}
					>
						Schedule builder
					</Badge>
				</Group>

				<Paper withBorder radius='md' className={classes.panel}>
					<Stack gap='sm'>
						<Group gap='xs' align='center'>
							<ThemeIcon variant='light' color='blue' size='md' radius='md'>
								<IconCalendarStats size={16} />
							</ThemeIcon>
							<div>
								<Text size='sm' fw={600}>
									Predefined schedule
								</Text>
								<Text size='xs' c='dimmed'>
									Choose a schedule template with the working days and hours
									already mapped.
								</Text>
							</div>
						</Group>
						<Select
							placeholder='Select days and hours configuration'
							data={scheduleOptions}
							searchable
							required
							size='sm'
							nothingFoundMessage='No templates available'
							className={classes.field}
							{...form.getInputProps('predefinedScheduleId')}
						/>
						<div className={classes.preview}>
							<Group justify='space-between' align='center' gap='xs'>
								<div>
									<Text size='xs' fw={600}>
										Template preview
									</Text>
									<Text size='xs' c='dimmed'>
										Working hours per weekday for the selected template.
									</Text>
								</div>
								{selectedSchedule && (
									<Badge size='sm' variant='light' color='blue'>
										{selectedSchedule.name}
									</Badge>
								)}
							</Group>
							{selectedSchedule ? (
								<Table
									withRowBorders={false}
									striped={false}
									highlightOnHover={false}
									className={classes.previewTable}
								>
									<Table.Thead>
										<Table.Tr>
											{allDaysOfWeek.map((dayOfWeek) => (
												<Table.Th
													key={dayOfWeek}
													className={classes.previewHeaderCell}
												>
													{dayLabelMap[dayOfWeek]}
												</Table.Th>
											))}
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										<Table.Tr>
											{previewRow?.map((value, index) => {
												const isOff = value === 'Off';
												return (
													<Table.Td key={allDaysOfWeek[index]}>
														<Text
															size='xs'
															fw={600}
															c={
																isOff
																	? 'var(--mantine-color-gray-5)'
																	: undefined
															}
														>
															{value}
														</Text>
													</Table.Td>
												);
											})}
										</Table.Tr>
									</Table.Tbody>
								</Table>
							) : (
								<Text size='xs' c='dimmed'>
									Select a template to preview its configured days.
								</Text>
							)}
						</div>
					</Stack>
				</Paper>

				<Paper withBorder radius='md' pb={'xl'} className={classes.panel}>
					<Stack gap='sm'>
						<Group gap='xs' align='center'>
							<ThemeIcon variant='light' color='indigo' size='md' radius='md'>
								<IconGauge size={16} />
							</ThemeIcon>
							<div>
								<Text size='sm' fw={600}>
									Schedule details
								</Text>
								<Text size='xs' c='dimmed'>
									Add a clear name, short description, and adjust the expected
									human effort.
								</Text>
							</div>
						</Group>
						<TextInput
							label='Schedule name'
							placeholder='e.g. Standard Business Hours'
							required
							size='sm'
							className={classes.field}
							{...form.getInputProps('name')}
						/>
						<Textarea
							label='Description'
							placeholder='e.g. Monday to Friday from 08:00 to 17:00'
							minRows={3}
							rows={3}
							maxLength={250}
							size='sm'
							className={classes.field}
							{...form.getInputProps('description')}
						/>
						<Stack gap='xs' className={classes.field}>
							<Group justify='space-between' align='center'>
								<Text size='sm' fw={600}>
									Human equivalent
								</Text>
								<Badge size='sm' variant='outline' color='blue'>
									{form.values.humanEquivalent}
								</Badge>
							</Group>
							<Slider
								min={0}
								max={150}
								step={1}
								value={form.values.humanEquivalent as number}
								onChange={(value) =>
									form.setFieldValue('humanEquivalent', value)
								}
								marks={humanEquivalentMarks}
								size='sm'
								label={null}
							/>
							{form.errors.humanEquivalent && (
								<Text c='red' size='xs'>
									{form.errors.humanEquivalent}
								</Text>
							)}
						</Stack>
					</Stack>
				</Paper>

				<Group justify='flex-end' className={classes.actionBar}>
					{onCancel && (
						<Button variant='default' onClick={onCancel} size='sm'>
							Cancel
						</Button>
					)}
					<Button
						type='submit'
						loading={createScheduleMutation.isPending}
						size='sm'
					>
						Create schedule
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default AddShedulerForm;

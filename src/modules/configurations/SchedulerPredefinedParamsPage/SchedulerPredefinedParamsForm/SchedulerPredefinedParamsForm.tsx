import { Button, Group, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import type { DayConfig } from '~/api/campaignsApi';
import type { ClientConfig } from '~/models/ClientConfig';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';
import { useUpdateClientConfig } from '~/queries/useClientConfigs';
import {
	DEFAULT_END_HOUR,
	DEFAULT_START_HOUR,
	fullDayLabelMap,
	normalizeDayConfigs,
} from '../utils';
import classes from './SchedulerPredefinedParamsForm.module.css';

interface SchedulerPredefinedParamsFormProps {
	schedule?: PredefinedScheduleConfig;
	list: PredefinedScheduleConfig[];
	config: ClientConfig | undefined;
	onClose: () => void;
}

type FormDayConfig = DayConfig & {
	startHour: string;
	endHour: string;
	dayCapacity?: number | null;
	dailyCallLimit?: number;
};

type FormValues = {
	name: string;
	dayConfigs: FormDayConfig[];
};

const normalizeTimeInput = (value: string, fallback = '00:00'): string => {
	const trimmed = value.trim();
	if (!trimmed) return fallback;

	const sanitized = trimmed.replace(/[^\d:]/g, '');

	let hourPart = '';
	let minutePart = '';

	if (sanitized.includes(':')) {
		[hourPart, minutePart = ''] = sanitized.split(':');
	} else if (sanitized.length > 2) {
		hourPart = sanitized.slice(0, 2);
		minutePart = sanitized.slice(2, 4);
	} else {
		hourPart = sanitized;
		minutePart = '';
	}

	const parsedHour = Number.parseInt(hourPart, 10);
	const parsedMinute = minutePart ? Number.parseInt(minutePart, 10) : 0;

	const safeHour = Number.isNaN(parsedHour)
		? 0
		: Math.min(Math.max(parsedHour, 0), 23);
	const safeMinute = Number.isNaN(parsedMinute)
		? 0
		: Math.min(Math.max(parsedMinute, 0), 59);

	return `${safeHour.toString().padStart(2, '0')}:${safeMinute
		.toString()
		.padStart(2, '0')}`;
};

const SchedulerPredefinedParamsForm: React.FC<
	SchedulerPredefinedParamsFormProps
> = ({ schedule, list, config, onClose }) => {
	const isEditMode = !!schedule;
	const updateMutation = useUpdateClientConfig();

	const form = useForm<FormValues>({
		initialValues: {
			name: schedule?.name || '',
			dayConfigs: normalizeDayConfigs(schedule?.dayConfigs).map((day) => ({
				...day,
				startHour: day.startHour || DEFAULT_START_HOUR,
				endHour: day.endHour || DEFAULT_END_HOUR,
				dailyCallLimit: day.dailyCallLimit ?? 0,
				dayCapacity:
					typeof day.dayCapacity === 'number' ? day.dayCapacity : undefined,
			})),
		},
		validate: {
			name: (value) => {
				const trimmed = value.trim();
				if (!trimmed) return 'Name is required';
				const isDuplicate = list.some((item) => {
					if (isEditMode && item.name === schedule?.name) return false;
					return item.name.toLowerCase() === trimmed.toLowerCase();
				});
				return isDuplicate ? 'Preset name must be unique' : null;
			},
		},
	});

	const updateDayField = <K extends keyof FormDayConfig>(
		index: number,
		field: K,
		value: FormDayConfig[K]
	) => {
		const updated = [...form.values.dayConfigs];
		updated[index] = {
			...updated[index],
			[field]: value,
		};
		form.setFieldValue('dayConfigs', updated);
	};

	const handleTimeBlur = (index: number, field: 'startHour' | 'endHour') => {
		const normalizedTime = normalizeTimeInput(
			form.values.dayConfigs[index]?.[field] ?? ''
		);
		updateDayField(index, field, normalizedTime);
	};

	const handleSubmit = async (values: FormValues) => {
		if (!config) {
			notifications.show({
				title: 'Configuration missing',
				message: 'Client configuration could not be loaded.',
				color: 'red',
			});
			return;
		}

		const normalizedDayConfigs = values.dayConfigs.map((day, index) => {
			const startHour = normalizeTimeInput(day.startHour, DEFAULT_START_HOUR);
			const endHour = normalizeTimeInput(day.endHour, DEFAULT_END_HOUR);

			return {
				...day,
				startHour,
				endHour,
				dayOrder: day.dayOrder ?? index + 1,
			};
		});

		const activeDays = normalizedDayConfigs.filter((day) => day.isActive);
		if (!activeDays.length) {
			notifications.show({
				title: 'Add at least one active day',
				message: 'Select the days where calls are allowed.',
				color: 'red',
			});
			return;
		}

		const invalidDay = activeDays.find((day) => day.startHour >= day.endHour);

		if (invalidDay) {
			notifications.show({
				title: 'Check day hours',
				message:
					'Each active day needs a start and end hour, and end must be after start.',
				color: 'red',
			});
			return;
		}

		const normalizedDays: DayConfig[] = normalizedDayConfigs.map((day) => ({
			dayOfWeek: day.dayOfWeek,
			dayOrder: day.dayOrder,
			isActive: day.isActive,
			dailyCallLimit:
				typeof day.dailyCallLimit === 'number' ? day.dailyCallLimit : 0,
			dayCapacity:
				typeof day.dayCapacity === 'number' ? day.dayCapacity : undefined,
			startHour: day.startHour,
			endHour: day.endHour,
			hourConfigs: day.hourConfigs ?? [],
		}));

		const newEntry: PredefinedScheduleConfig = {
			name: values.name.trim(),
			dayConfigs: normalizedDays,
		};

		let updatedList: PredefinedScheduleConfig[];
		if (isEditMode && schedule) {
			const index = list.findIndex((item) => item.name === schedule.name);
			if (index === -1) {
				notifications.show({
					title: 'Preset not found',
					message: 'The selected preset could not be located.',
					color: 'red',
				});
				return;
			}
			updatedList = [...list];
			updatedList[index] = newEntry;
		} else {
			updatedList = [...list, newEntry];
		}

		try {
			await updateMutation.mutateAsync({
				name: config.name,
				data: {
					description: config.description,
					value: JSON.stringify(updatedList),
					type: config.type,
				},
			});

			notifications.show({
				title: isEditMode ? 'Preset updated' : 'Preset created',
				message: 'Scheduler preset saved successfully.',
				color: 'green',
			});

			onClose();
		} catch (error) {
			console.error('Failed to save preset', error);
			notifications.show({
				title: 'Save failed',
				message: 'We could not save this preset. Please retry.',
				color: 'red',
			});
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
			<Stack gap='sm'>
				<TextInput
					label='Scheduler preset name'
					placeholder='Example: Standard business hours'
					required
					size='sm'
					{...form.getInputProps('name')}
				/>

				<div className={classes.sectionHeader}>
					<Text className={classes.sectionTitle}>Weekly windows</Text>
					<Text className={classes.sectionDescription}>
						Activate days for this scheduler preset and set their start and end
						time. Everything stays on one line to scan quickly.
					</Text>
				</div>

				<div className={classes.daysHeader}>
					<Text size='xs' fw={600}>
						Day
					</Text>
					<Text size='xs' fw={600}>
						Start
					</Text>
					<Text size='xs' fw={600}>
						End
					</Text>
					<Text size='xs' fw={600}>
						Status
					</Text>
				</div>

				<div className={classes.daysGrid}>
					{form.values.dayConfigs.map((day, index) => (
						<div
							key={day.dayOfWeek}
							className={`${classes.dayCard} ${
								day.isActive ? classes.dayCardActive : ''
							}`}
						>
							<div className={classes.dayCell}>
								<Switch
									size='sm'
									checked={day.isActive}
									onChange={(event) =>
										updateDayField(
											index,
											'isActive',
											event.currentTarget.checked
										)
									}
								/>
								<div className={classes.dayTitleGroup}>
									<Text fw={700} size='sm'>
										{fullDayLabelMap[day.dayOfWeek]}
									</Text>
									<Text size='xs' className={classes.dayStatus}>
										{day.isActive ? 'Enabled' : 'Disabled'}
									</Text>
								</div>
							</div>
							<TextInput
								placeholder='08:00'
								size='xs'
								variant='filled'
								value={day.startHour}
								onChange={(event) =>
									updateDayField(index, 'startHour', event.currentTarget.value)
								}
								onBlur={() => handleTimeBlur(index, 'startHour')}
								className={classes.inlineInput}
							/>
							<TextInput
								placeholder='17:00'
								size='xs'
								variant='filled'
								value={day.endHour}
								onChange={(event) =>
									updateDayField(index, 'endHour', event.currentTarget.value)
								}
								onBlur={() => handleTimeBlur(index, 'endHour')}
								className={classes.inlineInput}
							/>
							<Text size='xs' className={classes.helperText}>
								Use 24h format
							</Text>
						</div>
					))}
				</div>
			</Stack>

			<Group justify='flex-end' className={classes.actions}>
				<Button variant='light' size='sm' onClick={onClose}>
					Cancel
				</Button>
				<Button type='submit' loading={updateMutation.isPending} size='sm'>
					{isEditMode ? 'Update preset' : 'Create preset'}
				</Button>
			</Group>
		</form>
	);
};

export default SchedulerPredefinedParamsForm;

import { Button, Group, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type { DayConfig } from '~/api/campaignsApi';
import type { ClientConfig } from '~/models/ClientConfig';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';
import {
	useUpdateClientConfig,
	useCreateClientConfig,
} from '~/queries/useClientConfigs';
import {
	DEFAULT_END_HOUR,
	DEFAULT_START_HOUR,
	normalizeDayConfigs,
} from '../utils';
import classes from './SchedulerPredefinedParamsForm.module.css';

interface SchedulerPredefinedParamsFormProps {
	schedule?: PredefinedScheduleConfig;
	list: PredefinedScheduleConfig[];
	config: ClientConfig | undefined;
	onClose: () => void;
	saveStrategy?: 'create' | 'update';
	canSubmit?: boolean;
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
> = ({
	schedule,
	list,
	config,
	onClose,
	saveStrategy = 'update',
	canSubmit = true,
}) => {
	const { t } = useTranslation('scheduler-predefined-params');
	const { i18n } = useTranslation();
	const isEditMode = !!schedule;
	const updateMutation = useUpdateClientConfig();
	const createMutation = useCreateClientConfig();

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
				if (!trimmed) return t('form.validation.nameRequired');
				const isDuplicate = list.some((item) => {
					if (isEditMode && item.name === schedule?.name) return false;
					return item.name.toLowerCase() === trimmed.toLowerCase();
				});
				return isDuplicate ? t('form.validation.nameUnique') : null;
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
				title: t('notifications.configurationMissing.title'),
				message: t('notifications.configurationMissing.message'),
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
				title: t('notifications.noActiveDays.title'),
				message: t('notifications.noActiveDays.message'),
				color: 'red',
			});
			return;
		}

		const invalidDay = activeDays.find((day) => day.startHour >= day.endHour);

		if (invalidDay) {
			notifications.show({
				title: t('notifications.invalidHours.title'),
				message: t('notifications.invalidHours.message'),
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
					title: t('notifications.presetNotFound.title'),
					message: t('notifications.presetNotFound.message'),
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
			if (saveStrategy === 'create') {
				await createMutation.mutateAsync({
					name: config.name,
					description: config.description,
					value: JSON.stringify(updatedList),
					type: config.type,
				});
			} else {
				await updateMutation.mutateAsync({
					name: config.name,
					data: {
						description: config.description,
						value: JSON.stringify(updatedList),
						type: config.type,
					},
				});
			}

			notifications.show({
				title: isEditMode
					? t('notifications.saved.updatedTitle')
					: t('notifications.saved.createdTitle'),
				message: t('notifications.saved.message'),
				color: 'green',
			});

			onClose();
		} catch (error) {
			void error;
			notifications.show({
				title: t('notifications.saveFailed.title'),
				message: t('notifications.saveFailed.message'),
				color: 'red',
			});
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
			<Stack gap='sm'>
				<TextInput
					label={t('form.name.label')}
					placeholder={t('form.name.placeholder')}
					required
					size='sm'
					{...form.getInputProps('name')}
				/>

				<div className={classes.sectionHeader}>
					<Text className={classes.sectionTitle}>
						{t('form.weeklyWindows.title')}
					</Text>
					<Text className={classes.sectionDescription}>
						{t('form.weeklyWindows.description')}
					</Text>
				</div>

				<div className={classes.daysHeader}>
					<Text size='xs' fw={600}>
						{t('form.daysHeader.day')}
					</Text>
					<Text size='xs' fw={600}>
						{t('form.daysHeader.start')}
					</Text>
					<Text size='xs' fw={600}>
						{t('form.daysHeader.end')}
					</Text>
					<Text size='xs' fw={600}>
						{t('form.daysHeader.status')}
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
										{t(`days.full.${day.dayOfWeek}`, {
											lng: i18n.language,
										})}
									</Text>
									<Text size='xs' className={classes.dayStatus}>
										{day.isActive
											? t('form.status.enabled')
											: t('form.status.disabled')}
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
								{t('form.helper.use24h')}
							</Text>
						</div>
					))}
				</div>
			</Stack>

			<Group justify='flex-end' className={classes.actions}>
				<Button variant='light' size='sm' onClick={onClose}>
					{t('actions.cancel', { ns: 'common' })}
				</Button>
				{canSubmit && (
					<Button
						type='submit'
						loading={updateMutation.isPending || createMutation.isPending}
						size='sm'
					>
						{isEditMode
							? t('form.actions.updatePreset')
							: t('form.actions.createPreset')}
					</Button>
				)}
			</Group>
		</form>
	);
};

export default SchedulerPredefinedParamsForm;

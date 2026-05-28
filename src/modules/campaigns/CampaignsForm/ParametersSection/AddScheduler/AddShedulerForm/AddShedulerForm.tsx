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
import {
	IconCalendarStats,
	IconCheck,
	IconGauge,
	IconArrowsLeftRight,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { DayConfig } from '~/api/campaignsApi';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { useCreateCampaignSchedule } from '~/queries/campaignsQueries';
import classes from './AddShedulerForm.module.css';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';
import { ScheduleType, ScheduleDirection } from '~/models/SchedulerModel';

interface AddShedulerFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	campaignId?: string | number | null;
	/** Campaign type used to determine the default schedule direction */
	campaignType?: 'OUTBOUND' | 'INBOUND' | 'HYBRID';
}

interface PredefinedScheduleFormValues {
	name: string;
	description: string;
	humanEquivalent: number | '';
	predefinedScheduleId: string | null;
	scheduleType: ScheduleType;
	direction: ScheduleDirection;
}

const getDayLabelMap = (
	t: TFunction
): Record<DayConfig['dayOfWeek'], string> => ({
	monday: t('scheduler.schedulerBuilder.days.monday'),
	tuesday: t('scheduler.schedulerBuilder.days.tuesday'),
	wednesday: t('scheduler.schedulerBuilder.days.wednesday'),
	thursday: t('scheduler.schedulerBuilder.days.thursday'),
	friday: t('scheduler.schedulerBuilder.days.friday'),
	saturday: t('scheduler.schedulerBuilder.days.saturday'),
	sunday: t('scheduler.schedulerBuilder.days.sunday'),
});

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

/** Maps a campaign type to the corresponding schedule direction */
const mapCampaignTypeToDirection = (
	campaignType?: string
): ScheduleDirection => {
	switch (campaignType) {
		case 'INBOUND':
			return ScheduleDirection.INBOUND;
		case 'OUTBOUND':
			return ScheduleDirection.OUTBOUND;
		default:
			return ScheduleDirection.BOTH;
	}
};

const AddShedulerForm: React.FC<AddShedulerFormProps> = ({
	onSuccess,
	onCancel,
	campaignId,
	campaignType,
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);
	const createScheduleMutation = useCreateCampaignSchedule();
	const clientConfigQuery = useGetClientConfig('scheduler_predefined_params');

	const dayLabelMap = useMemo(() => getDayLabelMap(t), [t]);

	// Parse predefined schedules from client config
	const predefinedSchedules = useMemo<PredefinedScheduleConfig[]>(() => {
		try {
			if (!clientConfigQuery.data?.value) return [];
			return JSON.parse(clientConfigQuery.data.value);
		} catch (error) {
			void error;
			return [];
		}
	}, [clientConfigQuery.data?.value]);

	// Transform schedules to select options using the name property
	const scheduleOptions = useMemo(
		() =>
			predefinedSchedules.map((schedule, index) => ({
				value: String(index),
				label:
					schedule.name ||
					t('scheduler.schedulerBuilder.status.scheduleN', {
						index: index + 1,
					}),
			})),
		[predefinedSchedules, t]
	);

	const defaultDirection = useMemo(
		() => mapCampaignTypeToDirection(campaignType),
		[campaignType]
	);

	const form = useForm<PredefinedScheduleFormValues>({
		initialValues: {
			name: '',
			description: '',
			humanEquivalent: 1,
			predefinedScheduleId: null,
			scheduleType: ScheduleType.CUSTOM,
			direction: defaultDirection,
		},
		validate: {
			name: (value) =>
				value.trim()
					? null
					: t('scheduler.schedulerBuilder.validation.nameRequired'),
			predefinedScheduleId: (value, values) =>
				values.scheduleType === ScheduleType.ALWAYS_ON_24_7 || value
					? null
					: t('scheduler.schedulerBuilder.validation.scheduleRequired'),
			humanEquivalent: (value, values) => {
				if (values.scheduleType === ScheduleType.ALWAYS_ON_24_7) return null;

				if (value === undefined || value === null) {
					return t(
						'scheduler.schedulerBuilder.validation.humanEquivalentRequired'
					);
				}
				if (typeof value !== 'number' || isNaN(value)) {
					return t(
						'scheduler.schedulerBuilder.validation.humanEquivalentNumber'
					);
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
				return {
					isActive: false,
					times: t('scheduler.schedulerBuilder.status.off'),
				};
			}
			const times =
				dayConfig.startHour && dayConfig.endHour
					? `${dayConfig.startHour.slice(0, 5)} - ${dayConfig.endHour.slice(0, 5)}`
					: t('scheduler.schedulerBuilder.status.noHours');
			return { isActive: true, times };
		},
		[dayConfigMap, t]
	);

	const previewRow = useMemo(() => {
		if (!selectedSchedule) return null;
		return allDaysOfWeek.map((day) => getDayStatus(day).times);
	}, [getDayStatus, selectedSchedule]);

	const handleSubmit = async (values: PredefinedScheduleFormValues) => {
		if (!campaignId) {
			notifications.show({
				title: t('scheduler.schedulerBuilder.notifications.error'),
				message: t(
					'scheduler.schedulerBuilder.notifications.campaignIdRequired'
				),
				color: 'red',
			});
			return;
		}

		const isAlwaysOn = values.scheduleType === ScheduleType.ALWAYS_ON_24_7;

		// Get the selected predefined schedule's dayConfigs and ensure all days exist
		const dayConfigs =
			!isAlwaysOn && values.predefinedScheduleId !== null
				? normalizedDayConfigs
				: [];

		// Validate that we have dayConfigs only for CUSTOM schedules
		if (!isAlwaysOn && dayConfigs.length === 0) {
			notifications.show({
				title: t('scheduler.schedulerBuilder.notifications.error'),
				message: t('scheduler.schedulerBuilder.validation.scheduleRequired'),
				color: 'red',
			});
			return;
		}

		// Build the payload according to the required structure
		const payload = {
			name: values.name.trim(),
			description: values.description.trim(),
			campaignId: Number(campaignId),
			humanEquivalent: isAlwaysOn ? 0 : Number(values.humanEquivalent),
			scheduleType: values.scheduleType,
			direction: values.direction,
			...(isAlwaysOn ? {} : { dayConfigs }),
		};

		try {
			await createScheduleMutation.mutateAsync({
				campaignId: String(campaignId),
				data: payload,
			});

			notifications.show({
				title: t('scheduler.schedulerBuilder.notifications.success'),
				message: t('scheduler.schedulerBuilder.notifications.created'),
				color: 'green',
				icon: <IconCheck size={16} />,
			});

			if (onSuccess) {
				onSuccess();
			}
		} catch (error: any) {
			void error;

			// Extract error message from API response
			let errorMessage = t('scheduler.schedulerBuilder.notifications.failed');

			if (error?.response?.data?.message) {
				// API returned a specific error message
				errorMessage = error.response.data.message;
			} else if (error?.message) {
				// Generic error message
				errorMessage = error.message;
			}

			notifications.show({
				title: t('scheduler.schedulerBuilder.notifications.errorCreating'),
				message: errorMessage,
				color: 'red',
				autoClose: 8000, // Keep notification visible longer for error messages
			});
		}
	};

	const isOutbound = form.values.direction === ScheduleDirection.OUTBOUND;

	// Outbound schedules cannot be 24/7 — auto-reset to CUSTOM
	useEffect(() => {
		if (
			isOutbound &&
			form.values.scheduleType === ScheduleType.ALWAYS_ON_24_7
		) {
			form.setFieldValue('scheduleType', ScheduleType.CUSTOM);
		}
	}, [isOutbound]);

	const isAlwaysOn = form.values.scheduleType === ScheduleType.ALWAYS_ON_24_7;

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text size='sm' fw={700}>
							{t('scheduler.schedulerBuilder.curatedSchedules')}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('scheduler.schedulerBuilder.curatedDescription')}
						</Text>
					</div>
					<Badge
						variant='light'
						size='sm'
						leftSection={<IconCalendarStats size={14} />}
					>
						{t('scheduler.schedulerBuilder.builder')}
					</Badge>
				</Group>

				{/* Schedule Type & Direction */}
				<Paper withBorder radius='md' className={classes.panel}>
					<Stack gap='sm'>
						<Group gap='xs' align='center'>
							<ThemeIcon variant='light' color='grape' size='md' radius='md'>
								<IconArrowsLeftRight size={16} />
							</ThemeIcon>
							<div>
								<Text size='sm' fw={600}>
									{t('scheduler.schedulerBuilder.typeAndDirection')}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('scheduler.schedulerBuilder.typeAndDirectionDescription')}
								</Text>
							</div>
						</Group>
						<Stack gap='xs'>
							<Text size='sm' fw={600}>
								{t('scheduler.schedulerBuilder.scheduleType')}
							</Text>
							<AppSegmentedControl
								size='sm'
								fullWidth
								data={[
									{
										value: ScheduleType.CUSTOM,
										label: t('scheduler.schedulerBuilder.scheduleTypes.custom'),
									},
									{
										value: ScheduleType.ALWAYS_ON_24_7,
										label: t(
											'scheduler.schedulerBuilder.scheduleTypes.alwaysOn'
										),
										disabled: isOutbound,
									},
								]}
								value={form.values.scheduleType}
								onChange={(value) =>
									form.setFieldValue('scheduleType', value as ScheduleType)
								}
							/>
							{isOutbound && (
								<Text size='xs' c='orange'>
									{t(
										'scheduler.schedulerBuilder.validation.outbound24x7NotAllowed'
									)}
								</Text>
							)}
						</Stack>
						<Stack gap='xs'>
							<Text size='sm' fw={600}>
								{t('scheduler.schedulerBuilder.directionLabel')}
							</Text>
							<AppSegmentedControl
								size='sm'
								fullWidth
								data={[
									{
										value: ScheduleDirection.INBOUND,
										label: t('scheduler.schedulerBuilder.directions.inbound'),
									},
									{
										value: ScheduleDirection.OUTBOUND,
										label: t('scheduler.schedulerBuilder.directions.outbound'),
									},
									{
										value: ScheduleDirection.BOTH,
										label: t('scheduler.schedulerBuilder.directions.both'),
									},
								]}
								value={form.values.direction}
								onChange={(value) =>
									form.setFieldValue('direction', value as ScheduleDirection)
								}
							/>
						</Stack>
					</Stack>
				</Paper>

				{/* Predefined schedule template - only for CUSTOM */}
				{!isAlwaysOn && (
					<Paper withBorder radius='md' className={classes.panel}>
						<Stack gap='sm'>
							<Group gap='xs' align='center'>
								<ThemeIcon variant='light' color='blue' size='md' radius='md'>
									<IconCalendarStats size={16} />
								</ThemeIcon>
								<div>
									<Text size='sm' fw={600}>
										{t('scheduler.schedulerBuilder.predefinedSchedule')}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('scheduler.schedulerBuilder.predefinedDescription')}
									</Text>
								</div>
							</Group>
							<Select
								placeholder={t(
									'scheduler.schedulerBuilder.predefinedPlaceholder'
								)}
								data={scheduleOptions}
								searchable
								required
								size='sm'
								nothingFoundMessage={t(
									'scheduler.schedulerBuilder.predefinedNoData'
								)}
								className={classes.field}
								classNames={{ dropdown: classes.dropdown }}
								{...form.getInputProps('predefinedScheduleId')}
							/>
							<div className={classes.preview}>
								<Group justify='space-between' align='center' gap='xs'>
									<div>
										<Text size='xs' fw={600}>
											{t('scheduler.schedulerBuilder.preview')}
										</Text>
										<Text size='xs' c='dimmed'>
											{t('scheduler.schedulerBuilder.previewDescription')}
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
																c={isOff ? 'dimmed' : undefined}
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
										{t('scheduler.schedulerBuilder.previewEmpty')}
									</Text>
								)}
							</div>
						</Stack>
					</Paper>
				)}

				<Paper withBorder radius='md' pb={'xl'} className={classes.panel}>
					<Stack gap='sm'>
						<Group gap='xs' align='center'>
							<ThemeIcon variant='light' color='indigo' size='md' radius='md'>
								<IconGauge size={16} />
							</ThemeIcon>
							<div>
								<Text size='sm' fw={600}>
									{t('scheduler.schedulerBuilder.details')}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('scheduler.schedulerBuilder.detailsDescription')}
								</Text>
							</div>
						</Group>
						<TextInput
							label={t('scheduler.schedulerBuilder.name')}
							placeholder={t('scheduler.schedulerBuilder.namePlaceholder')}
							required
							size='sm'
							className={classes.field}
							{...form.getInputProps('name')}
						/>
						<Textarea
							label={t('scheduler.schedulerBuilder.description')}
							placeholder={t(
								'scheduler.schedulerBuilder.descriptionPlaceholder'
							)}
							minRows={3}
							rows={3}
							maxLength={250}
							size='sm'
							className={classes.field}
							{...form.getInputProps('description')}
						/>
						{/* Human equivalent slider - only for CUSTOM */}
						{!isAlwaysOn && (
							<Stack gap='xs' className={classes.field}>
								<Group justify='space-between' align='center'>
									<Text size='sm' fw={600}>
										{t('scheduler.schedulerBuilder.humanEquivalent')}
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
						)}
					</Stack>
				</Paper>

				<Group justify='flex-end' className={classes.actionBar}>
					{onCancel && (
						<Button variant='default' onClick={onCancel} size='sm'>
							{t('scheduler.schedulerBuilder.cancel')}
						</Button>
					)}
					<Button
						type='submit'
						loading={createScheduleMutation.isPending}
						size='sm'
					>
						{t('scheduler.schedulerBuilder.create')}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default AddShedulerForm;

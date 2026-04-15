import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Group,
	Stack,
	Button,
	LoadingOverlay,
	Box,
	Text,
	Switch,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconPencil,
	IconTrash,
	IconChevronUp,
	IconCalendar,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import type { Scheduler } from '~/models/SchedulerModel';
import { ScheduleType } from '~/models/SchedulerModel';
import {
	useUpdateSchedule,
	useActivateSchedule,
	useDeactivateSchedule,
	useDeleteSchedule,
} from '~/queries/schedulerQueries';
import styles from './SchedulerCard.module.css';
import SchedulerMetrics from './SchedulerMetrics';
import AgentCapacitySection from './AgentCapacitySection';
import WeeklyTimeline from './WeeklyTimeline';
import {
	SchedulerFormProvider,
	useSchedulerForm,
} from './schedulerFormProvider';
import { modals } from '@mantine/modals';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { notifications } from '@mantine/notifications';
import { parseTimeToMinutes } from '../utils/schedulerMetrics';
import type { MaybeDayConfig } from '../utils/schedulerMetrics';
import {
	calculateDayMinutes,
	MINUTES_PER_HOUR,
} from '../utils/schedulerMetrics';

export interface SchedulerCardProps {
	scheduler: Scheduler;
	campaignId: string | number;
	handleReload?: () => void;
}

export const SchedulerCard: React.FC<SchedulerCardProps> = ({
	scheduler,
	campaignId,
	handleReload,
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);
	const { setRightComponent } = useCampaignsStore((state) => state);
	const [opened, { open, close }] = useDisclosure(false);

	const activateScheduleMutation = useActivateSchedule();
	const deactivateScheduleMutation = useDeactivateSchedule();
	const updateScheduleMutation = useUpdateSchedule();
	const deleteScheduleMutation = useDeleteSchedule();

	useEffect(() => {
		return () => {
			setRightComponent?.(null);
			close();
		};
	}, []);

	const form = useSchedulerForm({
		initialValues: {
			...scheduler,
			humanEquivalent: Number(scheduler.humanEquivalent || 1),
		},
	});

	const isActive = scheduler.status === 'active';
	const isAlwaysOn = scheduler.scheduleType === ScheduleType.ALWAYS_ON_24_7;

	const activeDays = (scheduler.dayConfigs ?? []).filter((d) => d.isActive);

	const metrics = useMemo(() => {
		let totalMinutes = 0;
		activeDays.forEach((d) => {
			totalMinutes += calculateDayMinutes(d as MaybeDayConfig);
		});
		const totalWeeklyHours = totalMinutes / MINUTES_PER_HOUR;
		const perAgentHours =
			activeDays.length > 0
				? totalWeeklyHours / (scheduler.humanEquivalent ?? 1)
				: 0;

		return {
			totalWeeklyHours,
			hoursPerAgent: perAgentHours,
		};
	}, [activeDays, scheduler.humanEquivalent]);

	const handleToggleStatus = async () => {
		try {
			if (isActive) {
				await deactivateScheduleMutation.mutateAsync({
					campaignId,
					scheduleId: scheduler.id,
				});
			} else {
				await activateScheduleMutation.mutateAsync({
					campaignId,
					scheduleId: scheduler.id,
				});
			}
			handleReload?.();
		} catch (error) {
			void error;
		}
	};

	const handleSubmit = async (values: Partial<Scheduler>) => {
		try {
			const isAlwaysOnType =
				scheduler.scheduleType === ScheduleType.ALWAYS_ON_24_7;

			if (!isAlwaysOnType) {
				const invalidDays = (values.dayConfigs ?? []).reduce<string[]>(
					(list, dayConfig) => {
						if (!dayConfig?.isActive) return list;
						const start = parseTimeToMinutes(dayConfig.startHour ?? undefined);
						const end = parseTimeToMinutes(dayConfig.endHour ?? undefined);
						if (start === null || end === null || end <= start) {
							const dayName = dayConfig.dayOfWeek
								? `${dayConfig.dayOfWeek.charAt(0).toUpperCase()}${dayConfig.dayOfWeek.slice(1)}`
								: 'Day';
							return [...list, dayName];
						}
						return list;
					},
					[]
				);

				if (invalidDays.length > 0) {
					notifications.show({
						title: t('scheduler.card.notifications.fixTimeRanges.title'),
						message: t('scheduler.card.notifications.fixTimeRanges.message', {
							days: invalidDays.join(', '),
						}),
						color: 'red',
						withBorder: true,
					});
					return;
				}
			}

			const validation = form.validate();
			if (validation.hasErrors) {
				return;
			}

			const cleanedDayConfigs =
				values.dayConfigs?.map((dayConfig) => ({
					...dayConfig,
					dayCapacity: undefined,
				})) || [];

			await updateScheduleMutation.mutateAsync({
				campaignId,
				scheduleId: scheduler.id,
				scheduleData: {
					...values,
					dayConfigs: cleanedDayConfigs,
				},
			});

			handleReload?.();
			setRightComponent?.(null);
			close();
		} catch (error) {
			void error;
		}
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: t('scheduler.card.delete.title'),
			children: t('scheduler.card.delete.message'),
			labels: {
				confirm: t('scheduler.card.delete.confirm'),
				cancel: t('scheduler.card.delete.cancel'),
			},
			onConfirm: async () => {
				try {
					await deleteScheduleMutation.mutateAsync({
						campaignId,
						scheduleId: scheduler.id,
					});
					handleReload?.();
				} catch (error) {
					void error;
					handleReload?.();
				}
			},
		});
	};

	const handleOnEditMode = () => {
		if (opened) {
			close();
		} else {
			if (!form.values.humanEquivalent) {
				form.setFieldValue(
					'humanEquivalent',
					Number(scheduler.humanEquivalent || 1)
				);
			}
			if (!form.values.dayConfigs || form.values.dayConfigs.length === 0) {
				form.setFieldValue('dayConfigs', scheduler.dayConfigs || []);
			}
			open();
		}
	};

	const handleDayTimeChange = (
		dayIndex: number,
		field: 'start' | 'end',
		value: string
	) => {
		form.setFieldValue(`dayConfigs.${dayIndex}.${field}Hour`, value);
	};

	const handleDayToggle = (dayIndex: number, isActive: boolean) => {
		form.setFieldValue(`dayConfigs.${dayIndex}.isActive`, isActive);
		if (isActive) {
			const currentStart = (form.values.dayConfigs as any[])?.[dayIndex]
				?.startHour;
			if (!currentStart) {
				form.setFieldValue(`dayConfigs.${dayIndex}.startHour`, '09:00:00');
				form.setFieldValue(`dayConfigs.${dayIndex}.endHour`, '17:00:00');
			}
		}
	};

	return (
		<Box className={styles.card}>
			<LoadingOverlay
				visible={
					updateScheduleMutation.isPending ||
					deleteScheduleMutation.isPending ||
					activateScheduleMutation.isPending ||
					deactivateScheduleMutation.isPending
				}
			/>

			<Box className={styles.header}>
				<Group align='center' gap='sm' className={styles.headerMain}>
					<Switch
						size='xs'
						checked={isActive}
						onChange={() => handleToggleStatus()}
						aria-label='Toggle schedule status'
					/>

					<Stack gap={4} className={styles.titleStack}>
						<Text className={styles.scheduleName}>
							{scheduler.name ||
								t('scheduler.header.untitled', 'Untitled Schedule')}
						</Text>
						<Group gap='xs'>
							<Box className={styles.statusIndicator}>
								<span
									className={`${styles.statusDot} ${isActive ? styles.statusDotActive : styles.statusDotPaused}`}
								/>
								<Text className={styles.statusText}>
									{isActive
										? t('scheduler.header.status.active', 'Active')
										: t('scheduler.header.status.paused', 'Paused')}
								</Text>
							</Box>
							<Text className={styles.activeDaysText}>
								{isAlwaysOn
									? t('scheduler.header.alwaysOnLabel', 'Always On 24/7')
									: activeDays.length > 0
										? t('scheduler.header.activeDays', {
												count: activeDays.length,
												defaultValue: '{{count}} days active',
											})
										: t('scheduler.header.noActiveDays', 'No active days')}
							</Text>
						</Group>
					</Stack>
				</Group>

				<Group gap='xs' className={styles.headerActions}>
					<Tooltip
						label={
							isAlwaysOn
								? undefined
								: t('scheduler.header.actions.view', 'View schedule')
						}
						withArrow
						position='top'
					>
						<ActionIcon
							size='sm'
							variant='light'
							color='gray'
							aria-label={t('scheduler.header.actions.view', 'View schedule')}
							className={styles.actionIcon}
						>
							<IconCalendar size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip
						label={
							opened
								? t('scheduler.header.actions.close', 'Close')
								: t('scheduler.header.actions.edit', 'Edit')
						}
						withArrow
						position='top'
					>
						<ActionIcon
							size='sm'
							variant='light'
							color='blue'
							onClick={handleOnEditMode}
							aria-label={
								opened
									? t('scheduler.header.actions.close', 'Close')
									: t('scheduler.header.actions.edit', 'Edit')
							}
							className={styles.actionIcon}
						>
							{opened ? <IconChevronUp size={16} /> : <IconPencil size={16} />}
						</ActionIcon>
					</Tooltip>

					<Tooltip
						label={t('scheduler.header.actions.delete', 'Delete')}
						withArrow
						position='top'
					>
						<ActionIcon
							size='sm'
							variant='light'
							color='red'
							onClick={handleDelete}
							aria-label={t('scheduler.header.actions.delete', 'Delete')}
							className={styles.actionIcon}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Box>

			{!isAlwaysOn && (
				<Box className={styles.metricsRow}>
					<SchedulerMetrics
						humanEquivalent={scheduler.humanEquivalent || 1}
						totalWeeklyHours={metrics.totalWeeklyHours}
						hoursPerAgent={metrics.hoursPerAgent}
					/>
				</Box>
			)}

			{opened && (
				<SchedulerFormProvider form={form}>
					<Box className={styles.expandedContent}>
						<form onSubmit={form.onSubmit(handleSubmit)}>
							<Stack gap='lg'>
								{scheduler.scheduleType !== ScheduleType.ALWAYS_ON_24_7 && (
									<>
										<AgentCapacitySection
											humanEquivalent={form.values.humanEquivalent ?? 1}
											dayConfigs={
												(form.values.dayConfigs ?? []) as MaybeDayConfig[]
											}
											onHumanEquivalentChange={(value) =>
												form.setFieldValue('humanEquivalent', Number(value))
											}
										/>

										<WeeklyTimeline
											dayConfigs={(form.values.dayConfigs ?? []) as any[]}
											onDayTimeChange={handleDayTimeChange}
											onDayToggle={handleDayToggle}
										/>
									</>
								)}

								<Group justify='flex-end' className={styles.formActions}>
									<Button
										variant='outline'
										onClick={() => {
											close();
											setRightComponent?.(null);
										}}
										className={styles.cancelButton}
									>
										{t('scheduler.card.cancel', 'Cancel')}
									</Button>
									<Button
										type='submit'
										loading={updateScheduleMutation.isPending}
										className={styles.saveButton}
									>
										{t('scheduler.card.update', 'Update Schedule')}
									</Button>
								</Group>
							</Stack>
						</form>
					</Box>
				</SchedulerFormProvider>
			)}
		</Box>
	);
};

export default SchedulerCard;

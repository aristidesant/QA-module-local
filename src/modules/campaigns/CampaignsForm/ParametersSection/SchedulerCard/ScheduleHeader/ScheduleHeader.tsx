import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Text,
	Switch,
	ActionIcon,
	Tooltip,
	HoverCard,
	Badge,
	Group,
	Stack,
	Box,
	SimpleGrid,
} from '@mantine/core';
import {
	IconChevronUp,
	IconPencil,
	IconTrash,
	IconCalendar,
	IconUsers,
	IconCalendarStats,
	IconClockHour4,
} from '@tabler/icons-react';
import styles from './ScheduleHeader.module.css';
import type { Scheduler, DayConfig } from '~/models/SchedulerModel';
import { ScheduleType } from '~/models/SchedulerModel';
import ScheduleHoverItem from './ScheduleHoverItem';
import SmallMetricCard from '~/components/SmallMetricCard/SmallMetricCard';

export interface ScheduleHeaderProps {
	schedule?: Scheduler;
	onChange: (isActive: boolean) => void;
	onEdit: () => void;
	onDelete: () => void;
	isOpened?: boolean;
}

const calcDayHours = (start?: string | null, end?: string | null) => {
	if (!start || !end) return 0;
	const [sh, sm] = start.slice(0, 5).split(':').map(Number);
	const [eh, em] = end.slice(0, 5).split(':').map(Number);
	const startMinutes = sh * 60 + sm;
	const endMinutes = eh * 60 + em;
	const diff = endMinutes - startMinutes;
	return diff > 0 ? diff / 60 : 0;
};

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
	schedule,
	onChange,
	onEdit,
	onDelete,
	isOpened = false,
}) => {
	const { t } = useTranslation('campaigns');
	const activeDays = (schedule?.dayConfigs ?? []).filter((d) => d.isActive);
	const isActive = schedule?.status === 'active';
	const isAlwaysOn = schedule?.scheduleType === ScheduleType.ALWAYS_ON_24_7;
	const humanEquivalentValue =
		typeof schedule?.humanEquivalent === 'number'
			? schedule.humanEquivalent.toFixed(0)
			: typeof schedule?.humanEquivalent === 'string' &&
				  !isNaN(Number(schedule.humanEquivalent))
				? Number(schedule.humanEquivalent).toFixed(0)
				: '—';

	const metrics = [
		{
			label: t('scheduler.header.metrics.equivalents'),
			value: humanEquivalentValue,
			icon: IconUsers,
			tooltip: t('scheduler.header.tooltip.equivalents'),
		},
		{
			label: t('scheduler.header.metrics.weekly'),
			value: (() => {
				if (activeDays.length === 0) return '—';
				const total =
					activeDays.reduce(
						(sum, d) => sum + calcDayHours(d.startHour, d.endHour),
						0
					) * (schedule?.humanEquivalent ?? 0);
				return `${total.toFixed(1)}h`;
			})(),
			icon: IconCalendarStats,
			tooltip: t('scheduler.header.tooltip.weekly'),
		},
		{
			label: t('scheduler.header.metrics.perAgent'),
			value: (() => {
				if (activeDays.length === 0) return '—';
				const total = activeDays.reduce(
					(sum, d) => sum + calcDayHours(d.startHour, d.endHour),
					0
				);
				return `${total.toFixed(1)}h`;
			})(),
			icon: IconClockHour4,
			tooltip: t('scheduler.header.tooltip.perAgent'),
		},
	];

	const sortedDayConfigs = [...(schedule?.dayConfigs ?? [])]
		.filter((d) => d.isActive)
		.sort((a, b) => a.dayOrder - b.dayOrder);

	return (
		<div className={styles.container}>
			<Group
				align='center'
				justify='space-between'
				gap='sm'
				className={styles.headerRow}
			>
				<Group align='center' gap='xs' className={styles.titleGroup}>
					<Switch
						size='xs'
						checked={isActive}
						onChange={(event) => onChange(event.currentTarget.checked)}
						aria-label='Toggle schedule status'
					/>

					<Stack gap={4} className={styles.titleText}>
						<Text
							className={styles.scheduleName}
							title={schedule?.name || t('scheduler.header.untitled')}
						>
							{schedule?.name || t('scheduler.header.untitled')}
						</Text>

						<Group gap='xs' className={styles.metaRow}>
							<Badge
								size='xs'
								variant='light'
								color={isActive ? 'green' : 'gray'}
								radius='sm'
								className={styles.statusBadge}
							>
								{isActive
									? t('scheduler.header.status.active')
									: t('scheduler.header.status.paused')}
							</Badge>
							<Box className={styles.metaDivider} />
							<Text size='xs' c='dimmed' className={styles.metaText}>
								{isAlwaysOn
									? t('scheduler.header.alwaysOnLabel')
									: activeDays.length > 0
										? t('scheduler.header.activeDays', {
												count: activeDays.length,
											})
										: t('scheduler.header.noActiveDays')}
							</Text>
						</Group>
					</Stack>
				</Group>

				<Group gap='xs' className={styles.actions}>
					{!isAlwaysOn && sortedDayConfigs.length > 0 && (
						<HoverCard width={260} openDelay={120} withinPortal withArrow>
							<HoverCard.Target>
								<ActionIcon
									size='sm'
									variant='light'
									color='gray'
									aria-label={t('scheduler.header.actions.view')}
								>
									<IconCalendar size={16} />
								</ActionIcon>
							</HoverCard.Target>
							<HoverCard.Dropdown className={styles.hoverDropdown}>
								{sortedDayConfigs.map((day, idx) => (
									<ScheduleHoverItem
										key={day.id ?? idx}
										day={day as DayConfig}
									/>
								))}
							</HoverCard.Dropdown>
						</HoverCard>
					)}

					<Tooltip
						label={
							isOpened
								? t('scheduler.header.actions.close')
								: t('scheduler.header.actions.edit')
						}
						withArrow
						position='top'
					>
						<ActionIcon
							size='sm'
							variant='light'
							color='blue'
							onClick={onEdit}
							aria-label={
								isOpened
									? t('scheduler.header.actions.close')
									: t('scheduler.header.actions.edit')
							}
						>
							{isOpened ? (
								<IconChevronUp size={16} />
							) : (
								<IconPencil size={16} />
							)}
						</ActionIcon>
					</Tooltip>

					<Tooltip
						label={t('scheduler.header.actions.delete')}
						withArrow
						position='top'
					>
						<ActionIcon
							size='sm'
							variant='light'
							color='red'
							onClick={onDelete}
							aria-label={t('scheduler.header.actions.delete')}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>

			{!isAlwaysOn && (
				<SimpleGrid
					cols={{ base: 1, sm: 3 }}
					spacing='xs'
					className={styles.metricsRow}
				>
					{metrics.map((metric) => {
						const Icon = metric.icon;
						return (
							<SmallMetricCard
								key={metric.label}
								icon={<Icon size={14} />}
								value={metric.value}
								label={metric.label}
								color='blue'
								tooltip={metric.tooltip}
							/>
						);
					})}
				</SimpleGrid>
			)}
		</div>
	);
};

export default ScheduleHeader;

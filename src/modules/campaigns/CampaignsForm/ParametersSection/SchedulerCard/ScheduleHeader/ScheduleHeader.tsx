import React from 'react';
import {
	Text,
	Switch,
	ActionIcon,
	Tooltip,
	HoverCard,
	Badge,
} from '@mantine/core';
import {
	IconChevronUp,
	IconPencil,
	IconTrash,
	IconCalendar,
	IconUsers,
	IconCalendarStats,
	IconClockHour4,
	IconFlag,
} from '@tabler/icons-react';
import styles from './ScheduleHeader.module.css';
import type { Scheduler, DayConfig } from '~/models/SchedulerModel';
import ScheduleHoverItem from './ScheduleHoverItem';

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
	const activeDays = (schedule?.dayConfigs ?? []).filter((d) => d.isActive);
	const isActive = schedule?.status === 'active';

	const humanEquivalentValue =
		typeof schedule?.humanEquivalent === 'number'
			? schedule.humanEquivalent.toFixed(0)
			: '—';

	const metrics = [
		{
			label: 'Equivalents',
			value: humanEquivalentValue,
			icon: IconUsers,
			tooltip: 'Human equivalents allocated to this schedule',
		},
		{
			label: 'Weekly',
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
			tooltip: 'Projected weekly effort for the whole team',
		},
		{
			label: 'Per Agent',
			value: (() => {
				if (activeDays.length === 0) return '—';
				const total = activeDays.reduce(
					(sum, d) => sum + calcDayHours(d.startHour, d.endHour),
					0
				);
				return `${total.toFixed(1)}h`;
			})(),
			icon: IconClockHour4,
			tooltip: 'Hours per active agent each week',
		},
		{
			label: 'ETA',
			value:
				typeof schedule?.estimatedCompletionDays === 'number'
					? `${schedule.estimatedCompletionDays}d`
					: '—',
			icon: IconFlag,
			tooltip: 'Estimated completion in days',
		},
	];

	const sortedDayConfigs = [...(schedule?.dayConfigs ?? [])]
		.filter((d) => d.isActive)
		.sort((a, b) => a.dayOrder - b.dayOrder);

	return (
		<div className={styles.container}>
			{/* Header */}
			<div className={styles.headerRow}>
				<div className={styles.titleGroup}>
					<Switch
						size='xs'
						checked={isActive}
						onChange={(event) => onChange(event.currentTarget.checked)}
						aria-label='Toggle schedule status'
					/>

					<div className={styles.titleText}>
						<Text
							className={styles.scheduleName}
							title={schedule?.name || 'Untitled Schedule'}
						>
							{schedule?.name || 'Untitled Schedule'}
						</Text>

						<div className={styles.metaRow}>
							<Badge
								size='xs'
								variant='light'
								color={isActive ? 'green' : 'gray'}
								radius='sm'
								className={styles.statusBadge}
							>
								{isActive ? 'Active' : 'Paused'}
							</Badge>
							<span className={styles.metaDivider} />
							<Text size='xs' c='dimmed' className={styles.metaText}>
								{activeDays.length > 0
									? `${activeDays.length} active day${
											activeDays.length === 1 ? '' : 's'
										}`
									: 'No active days yet'}
							</Text>
						</div>
					</div>
				</div>

				<div className={styles.actions}>
					{sortedDayConfigs.length > 0 && (
						<HoverCard width={240} openDelay={150} withinPortal withArrow>
							<HoverCard.Target>
								<ActionIcon
									size='sm'
									variant='light'
									color='gray'
									aria-label='View schedule'
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

					<Tooltip label={isOpened ? 'Close' : 'Edit'} withArrow position='top'>
						<ActionIcon
							size='sm'
							variant='light'
							color='blue'
							onClick={onEdit}
							aria-label={isOpened ? 'Close' : 'Edit'}
						>
							{isOpened ? (
								<IconChevronUp size={16} />
							) : (
								<IconPencil size={16} />
							)}
						</ActionIcon>
					</Tooltip>

					<Tooltip label='Delete' withArrow position='top'>
						<ActionIcon
							size='sm'
							variant='light'
							color='red'
							onClick={onDelete}
							aria-label='Delete'
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</div>
			</div>

			{/* Row 2: Metrics */}
			<div className={styles.metricsRow}>
				{metrics.map((metric) => (
					<Tooltip
						key={metric.label}
						label={metric.tooltip}
						withArrow
						position='top'
						disabled={!metric.tooltip}
					>
						{(() => {
							const Icon = metric.icon;
							return (
								<div className={styles.metric}>
									<div className={styles.metricIcon}>
										<Icon size={14} />
									</div>
									<div className={styles.metricCopy}>
										<span className={styles.metricValue}>{metric.value}</span>
										<span className={styles.metricLabel}>{metric.label}</span>
									</div>
								</div>
							);
						})()}
					</Tooltip>
				))}
			</div>
		</div>
	);
};

export default ScheduleHeader;

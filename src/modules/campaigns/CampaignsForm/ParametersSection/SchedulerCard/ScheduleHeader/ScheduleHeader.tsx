import React from 'react';
import { Text, Switch, ActionIcon, Menu, HoverCard } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconChevronUp,
	IconDots,
	IconPencil,
	IconTrash,
	IconInfoCircle,
	IconCalculator,
} from '@tabler/icons-react';
import styles from './ScheduleHeader.module.css';
import type { Scheduler, DayConfig } from '~/models/SchedulerModel';
import ScheduleHoverItem from './ScheduleHoverItem';
import SchedulerCalculator from '~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCalculator';

export interface ScheduleHeaderProps {
	schedule?: Scheduler;
	onChange: (isActive: boolean) => void;
	onEdit: () => void;
	onDelete: () => void;
	isOpened?: boolean;
}

const formatTime = (time?: string | null) => {
	if (!time) {
		return 'N/A';
	}

	// time expected as 'HH:mm:ss' or 'HH:mm'
	const hhmm = time.slice(0, 5);
	const [hh, mm] = hhmm.split(':').map(Number);
	const period = hh >= 12 ? 'pm' : 'am';
	const hour12 = hh % 12 === 0 ? 12 : hh % 12;
	// remove leading zero from hour for the ~end display if desired
	const minuteStr = mm.toString().padStart(2, '0');
	return `${hour12}:${minuteStr}${period}`;
};

const calcDayHours = (start?: string | null, end?: string | null) => {
	if (!start || !end) return 0;
	const [sh, sm] = start.slice(0, 5).split(':').map(Number);
	const [eh, em] = end.slice(0, 5).split(':').map(Number);
	const startMinutes = sh * 60 + sm;
	const endMinutes = eh * 60 + em;
	const diff = endMinutes - startMinutes;
	return diff > 0 ? diff / 60 : 0;
};

const formatDay = (day?: string) => {
	if (!day) {
		return 'N/A';
	}

	return day.charAt(0).toUpperCase() + day.slice(1);
};

const formatStatus = (status?: string | null) => {
	if (!status) {
		return '';
	}

	return status.charAt(0).toUpperCase() + status.slice(1);
};

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
	schedule,
	onChange,
	onEdit,
	onDelete,
	isOpened = false,
}) => {
	const metrics = [
		{
			label: 'Eq.',
			value:
				typeof schedule?.humanEquivalent === 'number'
					? schedule.humanEquivalent?.toFixed(0)
					: (Number(schedule?.humanEquivalent) ?? 'N/A'),
		},
		{
			label: 'Weekly Hrs',
			// compute weekly total from active dayConfigs to keep it authoritative
			value: (() => {
				const active = (schedule?.dayConfigs ?? []).filter((d) => d.isActive);
				if (active.length === 0) return 'N/A';
				const total =
					active.reduce(
						(sum, d) => sum + calcDayHours(d.startHour, d.endHour),
						0
					) * (schedule?.humanEquivalent ?? 0);
				return `${total.toFixed(2)}h`;
			})(),
		},
		{
			label: 'Weekly per agent',
			// compute weekly total from active dayConfigs to keep it authoritative
			value: (() => {
				const active = (schedule?.dayConfigs ?? []).filter((d) => d.isActive);
				if (active.length === 0) return 'N/A';
				const total = active.reduce(
					(sum, d) => sum + calcDayHours(d.startHour, d.endHour),
					0
				);
				return `${total.toFixed(2)}h`;
			})(),
		},
		{
			label: 'ETA',
			value:
				typeof schedule?.estimatedCompletionDays === 'number'
					? schedule.estimatedCompletionDays.toLocaleString()
					: (schedule?.estimatedCompletionDays ?? 'N/A'),
		},
	];

	// Only consider active day configs and sort them
	const sortedDayConfigs = [...(schedule?.dayConfigs ?? [])]
		.filter((d) => d.isActive)
		.sort((a, b) => a.dayOrder - b.dayOrder);

	// Format like: "Monday 08:30am~5:30pm"
	const scheduleSummaries = sortedDayConfigs.map((day) => ({
		day,
		summary: `${formatDay(day.dayOfWeek)} ${formatTime(day.startHour)}~${formatTime(
			day.endHour
		)}`,
	}));

	// preview variables removed: schedule is shown only via HoverCard triggered by the info icon

	return (
		<>
			<div className={styles.container}>
				<div className={styles.mainSection}>
					<div className={styles.headerRow}>
						<Switch
							size='sm'
							checked={schedule?.status === 'active'}
							onChange={(event) => onChange(event.currentTarget.checked)}
							classNames={{ track: styles.switchTrack }}
						/>
						<div className={styles.titleSection}>
							<div className={styles.titleRow}>
								<Text className={styles.scheduleName}>
									{schedule?.name || 'Untitled Schedule'}
								</Text>
								{schedule?.status && (
									<div
										className={`${styles.statusBadge} ${schedule.status === 'active' ? styles.statusActive : styles.statusInactive}`}
									>
										{formatStatus(schedule.status)}
									</div>
								)}
							</div>
							{schedule?.description && (
								<Text className={styles.description} lineClamp={1}>
									{schedule.description}
								</Text>
							)}
						</div>
					</div>

					<div className={styles.metricsRow}>
						{metrics.map((metric, index) => (
							<React.Fragment key={metric.label}>
								<div className={styles.metric}>
									<span className={styles.metricValue}>{metric.value}</span>
									<span className={styles.metricLabel}>{metric.label}</span>
								</div>
								{index < metrics.length - 1 && (
									<div className={styles.metricDivider} />
								)}
							</React.Fragment>
						))}
					</div>

					{/* schedule moved to actions hover icon to reduce header height */}
				</div>

				<div className={styles.actionsSection}>
					{scheduleSummaries.length > 0 && (
						<HoverCard width={260} openDelay={200} withinPortal withArrow>
							<HoverCard.Target>
								<ActionIcon
									size='md'
									variant='subtle'
									color='gray'
									title='View schedule'
									className={styles.infoButton}
								>
									<IconInfoCircle size={18} />
								</ActionIcon>
							</HoverCard.Target>
							<HoverCard.Dropdown className={styles.tooltipContent}>
								<div
									style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
								>
									{scheduleSummaries.map(({ day }, idx) => (
										<ScheduleHoverItem
											key={day.id ?? idx}
											day={day as DayConfig}
										/>
									))}
								</div>
							</HoverCard.Dropdown>
						</HoverCard>
					)}
					<ActionIcon
						size='md'
						variant='subtle'
						onClick={() =>
							modals.open({
								title: 'Scheduler Calculator',
								fullScreen: true,
								children: <SchedulerCalculator />,
							})
						}
					>
						<IconCalculator size={18} />
					</ActionIcon>

					<Menu position='bottom-end' withinPortal shadow='md'>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								size='md'
								className={styles.menuButton}
							>
								<IconDots size={18} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={
									isOpened ? (
										<IconChevronUp size={16} />
									) : (
										<IconPencil size={16} />
									)
								}
								onClick={onEdit}
							>
								{isOpened ? 'Close' : 'Edit'}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconTrash size={16} />}
								onClick={onDelete}
								color='red'
							>
								Delete
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</div>
			</div>
		</>
	);
};

export default ScheduleHeader;

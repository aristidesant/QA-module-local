import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Popover, Tooltip } from '@mantine/core';
import {
	IconChevronDown,
	IconChevronUp,
	IconClock,
	IconX,
	IconPlus,
} from '@tabler/icons-react';
import styles from './WeeklyTimeline.module.css';
import type { DayConfig } from '~/models/SchedulerModel';
import {
	formatMinutesLabel,
	parseTimeToMinutes,
} from '../utils/schedulerMetrics';

interface WeeklyTimelineProps {
	dayConfigs: DayConfig[];
	onDayToggle?: (dayIndex: number, isActive: boolean) => void;
	onDayTimeChange?: (
		dayIndex: number,
		field: 'start' | 'end',
		value: string
	) => void;
}

const DAY_ORDER = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
];
const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const POPOVER_INTERACTION_ATTR = 'data-weekly-timeline-popover';

const formatTime12h = (time?: string | null): string => {
	if (!time) return '--:--';
	const hhmm = time.slice(0, 5);
	const [hh, mm] = hhmm.split(':').map(Number);
	const period = hh >= 12 ? 'pm' : 'am';
	const hour12 = hh % 12 === 0 ? 12 : hh % 12;
	return `${hour12}:${mm.toString().padStart(2, '0')}${period}`;
};

const calcDayHours = (start?: string | null, end?: string | null): number => {
	if (!start || !end) return 0;
	const startMinutes = parseTimeToMinutes(start);
	const endMinutes = parseTimeToMinutes(end);
	if (startMinutes === null || endMinutes === null) return 0;
	const diff = endMinutes - startMinutes;
	return diff > 0 ? diff / 60 : 0;
};

const WeeklyTimeline: React.FC<WeeklyTimelineProps> = ({
	dayConfigs,
	onDayTimeChange,
	onDayToggle,
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);
	const [expandedDay, setExpandedDay] = useState<string | null>(null);

	const sortedDayConfigs = [...(dayConfigs ?? [])].sort(
		(a, b) => a.dayOrder - b.dayOrder
	);

	const activeDays = sortedDayConfigs.filter((d) => d.isActive);

	useEffect(() => {
		if (!expandedDay) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Element)) return;

			if (target.closest(`[${POPOVER_INTERACTION_ATTR}]`)) {
				return;
			}

			setExpandedDay(null);
		};

		document.addEventListener('pointerdown', handlePointerDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
		};
	}, [expandedDay]);

	const handleDayClick = (day: DayConfig) => {
		if (!day.isActive) return;
		setExpandedDay((prev) => (prev === day.dayOfWeek ? null : day.dayOfWeek));
	};

	const handleActivate = (day: DayConfig, dayIndex: number) => {
		onDayToggle?.(dayIndex, true);
		setExpandedDay(day.dayOfWeek);
	};

	const handleDeactivate = (
		e: React.MouseEvent | React.KeyboardEvent,
		day: DayConfig,
		dayIndex: number
	) => {
		e.stopPropagation();
		onDayToggle?.(dayIndex, false);
		setExpandedDay((prev) => (prev === day.dayOfWeek ? null : prev));
	};

	const renderDayBlock = (day: DayConfig, dayIndex: number) => {
		const isActive = day.isActive;
		const isExpanded = expandedDay === day.dayOfWeek;
		const hours = calcDayHours(day.startHour, day.endHour);
		const dayInitial =
			DAY_INITIALS[dayIndex] || day.dayOfWeek.charAt(0).toUpperCase();
		const dayName = t(
			`scheduler.schedulerBuilder.days.${day.dayOfWeek.toLowerCase()}`,
			{
				defaultValue:
					day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1),
			}
		);

		return (
			<Popover
				key={day.id ?? dayIndex}
				opened={isExpanded && isActive}
				onClose={() => setExpandedDay(null)}
				position='bottom'
				withArrow
				arrowSize={10}
				shadow='md'
				withinPortal
				closeOnClickOutside
			>
				<Popover.Target>
					<Box
						className={`${styles.dayBlock} ${isActive ? styles.dayBlockActive : styles.dayBlockInactive}`}
						{...{ [POPOVER_INTERACTION_ATTR]: true }}
						onClick={() =>
							isActive ? handleDayClick(day) : handleActivate(day, dayIndex)
						}
						role='button'
						tabIndex={0}
						aria-expanded={isExpanded}
						aria-label={`${dayName}, ${isActive ? `${hours} hours` : 'inactive — click to activate'}`}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								if (isActive) {
									handleDayClick(day);
								} else {
									handleActivate(day, dayIndex);
								}
							}
						}}
					>
						<Text
							className={`${styles.dayInitial} ${!isActive ? styles.dayInitialInactive : ''}`}
						>
							{dayInitial}
						</Text>
						{isActive && (
							<Box className={styles.timeRangeBar}>
								<Text className={styles.timeRangeText}>
									{formatTime12h(day.startHour)} — {formatTime12h(day.endHour)}
								</Text>
							</Box>
						)}
						{!isActive && (
							<Text className={styles.inactiveLabel}>
								<IconPlus size={10} />
							</Text>
						)}
						{isActive && !isExpanded && (
							<IconChevronDown size={13} className={styles.expandIcon} />
						)}
						{isActive && isExpanded && (
							<IconChevronUp size={13} className={styles.expandIcon} />
						)}
						{isActive && (
							<Tooltip label='Deactivate day' withArrow position='top'>
								<Box
									className={styles.dayToggleDeactivate}
									onClick={(e) => handleDeactivate(e, day, dayIndex)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											handleDeactivate(e, day, dayIndex);
										}
									}}
									role='button'
									tabIndex={0}
									aria-label={`Deactivate ${dayName}`}
								>
									<IconX size={8} />
								</Box>
							</Tooltip>
						)}
					</Box>
				</Popover.Target>

				{isActive && (
					<Popover.Dropdown p={0} {...{ [POPOVER_INTERACTION_ATTR]: true }}>
						<Box className={styles.popoverContent}>
							<Box className={styles.popoverHeader}>
								<Text className={styles.popoverDayName}>{dayName}</Text>
								<Box
									className={styles.popoverCloseBtn}
									onClick={() => setExpandedDay(null)}
									role='button'
									tabIndex={0}
									aria-label='Close'
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ')
											setExpandedDay(null);
									}}
								>
									<IconX size={12} />
								</Box>
							</Box>
							<Box className={styles.timeFields}>
								<Box className={styles.timeFieldRow}>
									<Text className={styles.timeFieldLabel}>
										{t('scheduler.timeline.start', 'Start')}
									</Text>
									<Box className={styles.timeInputWrapper}>
										<input
											type='time'
											className={styles.timeInput}
											value={day.startHour?.slice(0, 5) || ''}
											onChange={(e) =>
												onDayTimeChange?.(
													dayIndex,
													'start',
													e.target.value + ':00'
												)
											}
										/>
										<span className={styles.timeInputIcon}>
											<IconClock size={12} />
										</span>
									</Box>
								</Box>
								<Box className={styles.timeFieldRow}>
									<Text className={styles.timeFieldLabel}>
										{t('scheduler.timeline.end', 'End')}
									</Text>
									<Box className={styles.timeInputWrapper}>
										<input
											type='time'
											className={styles.timeInput}
											value={day.endHour?.slice(0, 5) || ''}
											onChange={(e) =>
												onDayTimeChange?.(
													dayIndex,
													'end',
													e.target.value + ':00'
												)
											}
										/>
										<span className={styles.timeInputIcon}>
											<IconClock size={12} />
										</span>
									</Box>
								</Box>
							</Box>
							<Box className={styles.dayMetrics}>
								<Text className={styles.dayMetricItem}>
									<IconClock size={10} />
									{hours.toFixed(1)}h
								</Text>
								<Text className={styles.dayMetricItem}>
									{formatMinutesLabel(hours * 60 * 0.6)} talk
								</Text>
							</Box>
						</Box>
					</Popover.Dropdown>
				)}
			</Popover>
		);
	};

	return (
		<Box className={styles.container}>
			<Box className={styles.header}>
				<Text className={styles.title}>
					{t('scheduler.timeline.title', 'Weekly Schedule')}
				</Text>
				<Box className={styles.activeBadge}>
					<span className={styles.activeDot} />
					<Text className={styles.activeBadgeText}>
						{activeDays.length}{' '}
						{t('scheduler.timeline.daysActive', 'days active')}
					</Text>
				</Box>
			</Box>
			<Box className={styles.timeline}>
				{DAY_ORDER.map((dayKey, index) => {
					const dayConfig = sortedDayConfigs.find(
						(d) => d.dayOfWeek?.toLowerCase() === dayKey
					);
					if (dayConfig) {
						return renderDayBlock(dayConfig, index);
					}
					return (
						<Box
							key={dayKey}
							className={`${styles.dayBlock} ${styles.dayBlockEmpty}`}
						>
							<Text className={styles.dayInitial}>{DAY_INITIALS[index]}</Text>
							<Text className={styles.inactiveLabel}>—</Text>
						</Box>
					);
				})}
			</Box>
			{activeDays.length === 0 && (
				<Text className={styles.emptyState}>
					{t('scheduler.timeline.empty', 'No active days configured')}
				</Text>
			)}
		</Box>
	);
};

export default WeeklyTimeline;

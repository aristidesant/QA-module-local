import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Group, Collapse } from '@mantine/core';
import {
	IconChevronDown,
	IconChevronUp,
	IconClock,
	IconClockOff,
} from '@tabler/icons-react';
import styles from './WeeklyTimeline.module.css';
import type { DayConfig } from '~/models/SchedulerModel';
import {
	formatMinutesLabel,
	parseTimeToMinutes,
} from '../../utils/schedulerMetrics';

interface WeeklyTimelineProps {
	dayConfigs: DayConfig[];
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
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);
	const [expandedDay, setExpandedDay] = useState<string | null>(null);

	const sortedDayConfigs = [...(dayConfigs ?? [])].sort(
		(a, b) => a.dayOrder - b.dayOrder
	);

	const activeDays = sortedDayConfigs.filter((d) => d.isActive);

	const handleDayClick = (day: DayConfig) => {
		if (!day.isActive) return;
		setExpandedDay((prev) => (prev === day.dayOfWeek ? null : day.dayOfWeek));
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
			<Box key={day.id ?? dayIndex} className={styles.dayContainer}>
				<Box
					className={`${styles.dayBlock} ${isActive ? styles.dayBlockActive : styles.dayBlockInactive}`}
					onClick={() => isActive && handleDayClick(day)}
					role={isActive ? 'button' : undefined}
					tabIndex={isActive ? 0 : undefined}
					aria-expanded={isExpanded}
					aria-label={`${dayName}, ${isActive ? `${hours} hours` : 'inactive'}`}
					onKeyDown={(e) => {
						if ((e.key === 'Enter' || e.key === ' ') && isActive) {
							e.preventDefault();
							handleDayClick(day);
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
							<IconClockOff size={10} />
						</Text>
					)}
					{isActive && isExpanded && (
						<IconChevronUp size={12} className={styles.expandIcon} />
					)}
					{isActive && !isExpanded && (
						<IconChevronDown size={12} className={styles.expandIcon} />
					)}
				</Box>

				<Collapse in={isExpanded && isActive}>
					<Box className={styles.expandedContent}>
						<Group gap='xs' className={styles.timeInputs}>
							<Box className={styles.timeInputGroup}>
								<Text className={styles.timeInputLabel}>Start</Text>
								<input
									type='time'
									className={styles.timeInput}
									value={day.startHour?.slice(0, 5) || ''}
									onChange={(e) =>
										onDayTimeChange?.(dayIndex, 'start', e.target.value + ':00')
									}
								/>
							</Box>
							<Text className={styles.timeSeparator}>→</Text>
							<Box className={styles.timeInputGroup}>
								<Text className={styles.timeInputLabel}>End</Text>
								<input
									type='time'
									className={styles.timeInput}
									value={day.endHour?.slice(0, 5) || ''}
									onChange={(e) =>
										onDayTimeChange?.(dayIndex, 'end', e.target.value + ':00')
									}
								/>
							</Box>
						</Group>
						<Group gap='xs' className={styles.dayMetrics}>
							<Text className={styles.dayMetricItem}>
								<IconClock size={10} />
								{hours.toFixed(1)}h
							</Text>
							<Text className={styles.dayMetricItem}>
								{formatMinutesLabel(hours * 60 * 0.6)} talk
							</Text>
						</Group>
					</Box>
				</Collapse>
			</Box>
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

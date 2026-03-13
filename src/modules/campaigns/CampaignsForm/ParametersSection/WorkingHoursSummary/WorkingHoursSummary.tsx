import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Group } from '@mantine/core';
import { IconClock, IconCalendarClock } from '@tabler/icons-react';
import styles from './WorkingHoursSummary.module.css';

interface DaySchedule {
	enabled: boolean;
	from: string;
	to: string;
}

interface WorkingHoursSummaryProps {
	workingHours: Record<string, DaySchedule>;
}

const DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
] as const;

const formatDayName = (day: string) => {
	return day.charAt(0).toUpperCase() + day.slice(1, 3);
};

export const WorkingHoursSummary: React.FC<WorkingHoursSummaryProps> = ({
	workingHours,
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);

	// Get active days
	const activeDays = DAYS.filter((day) => workingHours[day]?.enabled);

	// Get time range (assuming same time for all active days)
	const getTimeRange = (): string => {
		if (activeDays.length === 0)
			return t('scheduler.workingHours.summary.noActiveDays');

		const firstActiveDay = activeDays[0];
		const schedule = workingHours[firstActiveDay];

		if (!schedule?.from || !schedule?.to)
			return t('scheduler.workingHours.summary.noTimeRange');

		return `${schedule.from} - ${schedule.to}`;
	};

	// Format active days text
	const getActiveDaysText = (): string => {
		if (activeDays.length === 0)
			return t('scheduler.workingHours.summary.noActiveDays');

		const dayNames = activeDays.map(formatDayName);

		if (dayNames.length === 7)
			return t('scheduler.workingHours.summary.everyDay');

		if (
			dayNames.length === 5 &&
			!dayNames.includes('Sat') &&
			!dayNames.includes('Sun')
		) {
			return t('scheduler.workingHours.summary.weekdays');
		}

		if (
			dayNames.length === 2 &&
			dayNames.includes('Sat') &&
			dayNames.includes('Sun')
		) {
			return t('scheduler.workingHours.summary.weekends');
		}

		return dayNames.join(', ');
	};

	return (
		<Box className={styles.summary}>
			<Group gap={4} c='dimmed' align='center' mb={2}>
				<IconClock size={14} />
				<Text size='xs'>{getTimeRange()}</Text>
			</Group>

			<Group gap={4} c='dimmed' align='center'>
				<IconCalendarClock size={14} />
				<Text size='xs'>{getActiveDaysText()}</Text>
			</Group>
		</Box>
	);
};

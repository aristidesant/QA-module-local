import React from 'react';
import { Text, Badge } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import styles from './ScheduleHeader.module.css';
import type { DayConfig } from '~/models/SchedulerModel';

interface Props {
	day: DayConfig;
	index?: number;
}

const formatTime = (time?: string | null) => {
	if (!time) return 'N/A';
	const hhmm = time.slice(0, 5);
	const [hh, mm] = hhmm.split(':').map(Number);
	const period = hh >= 12 ? 'pm' : 'am';
	const hour12 = hh % 12 === 0 ? 12 : hh % 12;
	const minuteStr = mm.toString().padStart(2, '0');
	return `${hour12}:${minuteStr}${period}`;
};

const calcDayHours = (start?: string | null, end?: string | null) => {
	if (!start || !end) return 0;
	// parse as HH:mm[:ss]
	const [sh, sm] = start.slice(0, 5).split(':').map(Number);
	const [eh, em] = end.slice(0, 5).split(':').map(Number);
	const startMinutes = sh * 60 + sm;
	const endMinutes = eh * 60 + em;
	const diff = endMinutes - startMinutes;
	return diff > 0 ? diff / 60 : 0;
};

const ScheduleHoverItem: React.FC<Props> = ({ day }) => {
	const dayName =
		day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1);
	const hours = calcDayHours(day.startHour, day.endHour);

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				width: '100%',
				alignItems: 'center',
				gap: 12,
			}}
		>
			<div style={{ minWidth: 0 }}>
				<Text size='sm' className={styles.hoverDayName} lineClamp={1}>
					{dayName}
				</Text>
				<Text size='xs' c='dimmed' lineClamp={1}>
					{formatTime(day.startHour)} — {formatTime(day.endHour)}
				</Text>
			</div>

			<Badge
				variant='outline'
				radius='sm'
				leftSection={<IconClock size={14} />}
			>
				{hours.toFixed(2)}h
			</Badge>
		</div>
	);
};

export default ScheduleHoverItem;

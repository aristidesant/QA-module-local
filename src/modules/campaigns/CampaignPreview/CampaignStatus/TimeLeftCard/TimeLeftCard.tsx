import React, { useMemo } from 'react';
import { Card, Group, Text, Progress } from '@mantine/core';
import styles from './TimeLeftCard.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useGetCampaignsTimeEnd } from '~/queries/campaignsQueries';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

// Extend dayjs with duration plugin
dayjs.extend(duration);

interface TimeLeftCardProps {}

const TimeLeftCard: React.FC<TimeLeftCardProps> = () => {
	const { selectedCampaign } = useCampaignsStore();
	const { data: timeData } = useGetCampaignsTimeEnd(`${selectedCampaign?.id}`);

	const { timeLeft, progress } = useMemo(() => {
		if (!timeData?.timeEnd) {
			return { timeLeft: 'N/A', progress: 0 };
		}

		const now = dayjs();
		const endTime = dayjs(timeData.timeEnd);
		const startOfDay = dayjs().startOf('day');

		// Calculate time left
		const diff = endTime.diff(now);

		if (diff <= 0) {
			return { timeLeft: '0h:00min', progress: 100 };
		}

		const duration = dayjs.duration(diff);
		const hours = Math.floor(duration.asHours());
		const minutes = duration.minutes();
		const formattedTimeLeft = `${hours}h:${minutes.toString().padStart(2, '0')}min`;

		// Calculate progress (assuming campaign started at beginning of day)
		const totalDayTime = endTime.diff(startOfDay);
		const elapsedTime = now.diff(startOfDay);
		const calculatedProgress =
			totalDayTime > 0
				? Math.min(Math.max((elapsedTime / totalDayTime) * 100, 0), 100)
				: 0;

		return {
			timeLeft: formattedTimeLeft,
			progress: Math.round(calculatedProgress),
		};
	}, [timeData?.timeEnd]);

	// Placeholder values for demonstration
	// const timeLeft = '3h:12min';
	// const progress = 70;
	return (
		<Card radius='md' padding='md' withBorder className={styles.timeCard}>
			<Group justify='space-between' className={styles.timeHeader}>
				<Text fw={500} fz='sm'>
					Today's time left
				</Text>
				<Text fw={500} fz='sm'>
					{timeLeft}
				</Text>
			</Group>
			<Progress
				value={progress}
				size='md'
				radius='xl'
				color='blue'
				className={styles.progressBar}
			/>
		</Card>
	);
};

export default TimeLeftCard;

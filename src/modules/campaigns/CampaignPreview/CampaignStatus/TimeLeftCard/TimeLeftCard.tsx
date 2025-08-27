import React, { useMemo } from 'react';
import {
	Card,
	Group,
	Text,
	Progress,
	Badge,
	ActionIcon,
	Skeleton,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
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
	const {
		data: timeData,
		refetch,
		isLoading,
	} = useGetCampaignsTimeEnd(`${selectedCampaign?.id}`);

	const isCompleted = selectedCampaign?.status?.toLowerCase() === 'completed';

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

	return (
		<Card radius='md' padding='md' withBorder className={styles.timeCard}>
			{isLoading ? (
				// Loading skeleton
				<>
					<Group justify='space-between' className={styles.timeHeader}>
						<Group gap='xs'>
							<Skeleton height={16} width={120} />
							<Skeleton circle height={16} width={16} />
						</Group>
						<Skeleton height={16} width={80} />
					</Group>
					<Skeleton height={8} radius='xl' mt='sm' />
				</>
			) : (
				<>
					<Group justify='space-between' className={styles.timeHeader}>
						<Group gap='xs'>
							<Text fw={500} fz='sm'>
								{isCompleted ? 'Campaign Status' : "Today's time left"}
							</Text>
							<ActionIcon
								size='xs'
								variant='subtle'
								color='gray'
								onClick={() => refetch()}
								disabled={isCompleted}
								className={styles.refetchButton}
							>
								<IconRefresh size={12} />
							</ActionIcon>
						</Group>
						{isCompleted ? (
							<Badge size='sm' color='green' variant='light'>
								Completed
							</Badge>
						) : (
							<Text fw={500} fz='sm'>
								{timeLeft}
							</Text>
						)}
					</Group>
					{!isCompleted && (
						<Progress
							value={progress}
							size='md'
							radius='xl'
							color='blue'
							className={styles.progressBar}
						/>
					)}
				</>
			)}
		</Card>
	);
};

export default TimeLeftCard;

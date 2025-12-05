import { useMemo } from 'react';
import {
	ActionIcon,
	Box,
	Card,
	Slider,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconCalendarTime,
	IconHeadset,
	IconInfoCircle,
	IconUsers,
} from '@tabler/icons-react';
import SmallMetricCard from '~/components/SmallMetricCard';
import { useSchedulerFormContext } from '../SchedulerCard/schedulerFormProvider';
import styles from './CapacityCall.module.css';
import { DayScheduleCard } from '../DayScheduleCard';
import {
	MINUTES_PER_HOUR,
	TALK_MINUTES_PER_HOUR,
	calculateDayMinutes,
	calculateTeamTalkMinutes,
	MaybeDayConfig,
} from '../utils/schedulerMetrics';

const formatHours = (hours: number): string => {
	if (!Number.isFinite(hours) || hours <= 0) {
		return '0h';
	}
	const decimals = hours >= 10 ? 0 : 1;
	return `${hours.toFixed(decimals)}h`;
};

const CapacityCall: React.FC = () => {
	const form = useSchedulerFormContext();
	const humanEquivalent = Number(form.values.humanEquivalent || 1);
	const dayConfigs = (form.values.dayConfigs || []) as MaybeDayConfig[];

	const metrics = useMemo(() => {
		let totalMinutes = 0;
		let activeDayCount = 0;

		dayConfigs.forEach((day) => {
			const minutes = calculateDayMinutes(day);
			if (minutes > 0) {
				totalMinutes += minutes;
				activeDayCount++;
			}
		});

		const totalWeeklyHours = totalMinutes / MINUTES_PER_HOUR;
		const talkMinutesPerHuman = totalWeeklyHours * TALK_MINUTES_PER_HOUR;
		const talkHoursPerHuman = talkMinutesPerHuman / MINUTES_PER_HOUR;
		const teamTalkMinutes = calculateTeamTalkMinutes(
			talkMinutesPerHuman,
			humanEquivalent
		);
		const teamTalkHours = teamTalkMinutes / MINUTES_PER_HOUR;

		return {
			totalWeeklyHours,
			talkHoursPerHuman,
			teamTalkHours,
			activeDayCount,
		};
	}, [dayConfigs, humanEquivalent]);

	const sliderValue =
		Number.isFinite(humanEquivalent) && humanEquivalent > 0
			? humanEquivalent
			: 1;

	return (
		<Card withBorder radius='md' className={styles.card}>
			<Stack gap={0}>
				{/* Header */}
				<Box className={styles.header}>
					<Box className={styles.titleGroup}>
						<Text className={styles.title}>Capacity</Text>
						<Tooltip
							label='Translate your schedule into realistic talk time based on 38.5 min/hour efficiency.'
							multiline
							maw={220}
							withArrow
							position='right'
						>
							<ActionIcon
								size='xs'
								variant='subtle'
								radius='xl'
								className={styles.infoButton}
							>
								<IconInfoCircle size={14} />
							</ActionIcon>
						</Tooltip>
					</Box>
				</Box>

				{/* Full-width slider row */}
				<Box className={styles.sliderRow}>
					<Text className={styles.sliderLabel}>Human Equivalent (Agents)</Text>
					<Slider
						value={sliderValue}
						onChange={(value) =>
							form.setFieldValue('humanEquivalent', Number(value))
						}
						min={1}
						max={150}
						step={1}
						classNames={{
							root: styles.sliderRoot,
							track: styles.sliderTrack,
							bar: styles.sliderBar,
						}}
					/>
					<Text className={styles.sliderValue}>{sliderValue}</Text>
				</Box>

				{/* Fancy metrics grid */}
				<Box className={styles.metricsGrid}>
					<SmallMetricCard
						icon={<IconCalendarTime size={16} />}
						value={formatHours(metrics.totalWeeklyHours)}
						label='Scheduled'
						color='violet'
						tooltip={`${metrics.activeDayCount} active days scheduled this week`}
					/>

					<SmallMetricCard
						icon={<IconHeadset size={16} />}
						value={formatHours(metrics.talkHoursPerHuman)}
						label='Per Agent'
						color='teal'
						tooltip='Talk time per person at 38.5 min/hour efficiency'
					/>

					<SmallMetricCard
						icon={<IconUsers size={16} />}
						value={formatHours(metrics.teamTalkHours)}
						label='Team Total'
						color='orange'
						tooltip={`Combined talk time for ${sliderValue} agent${sliderValue > 1 ? 's' : ''}`}
					/>
				</Box>

				{/* Schedule section */}
				<Box className={styles.scheduleSection}>
					<Box className={styles.scheduleHeader}>
						<Text className={styles.scheduleTitle}>
							<IconCalendarTime size={12} />
							Schedule
						</Text>
						<Box className={styles.scheduleBadge}>
							<span className={styles.scheduleBadgeDot} />
							{metrics.activeDayCount} active
						</Box>
					</Box>
					<Box className={styles.scheduleContent}>
						<DayScheduleCard />
					</Box>
				</Box>
			</Stack>
		</Card>
	);
};

export default CapacityCall;

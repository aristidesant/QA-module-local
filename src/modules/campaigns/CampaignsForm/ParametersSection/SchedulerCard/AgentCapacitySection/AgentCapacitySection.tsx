import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Slider, Text, Group, ActionIcon, Tooltip } from '@mantine/core';
import {
	IconUsers,
	IconCalendarTime,
	IconHeadset,
	IconInfoCircle,
} from '@tabler/icons-react';
import styles from './AgentCapacitySection.module.css';
import type { MaybeDayConfig } from '../../utils/schedulerMetrics';
import {
	MINUTES_PER_HOUR,
	TALK_MINUTES_PER_HOUR,
	calculateDayMinutes,
	calculateTeamTalkMinutes,
} from '../../utils/schedulerMetrics';

interface AgentCapacitySectionProps {
	humanEquivalent: number;
	dayConfigs: MaybeDayConfig[];
	onHumanEquivalentChange: (value: number) => void;
}

const formatHours = (hours: number): string => {
	if (!Number.isFinite(hours) || hours <= 0) {
		return '0h';
	}
	const decimals = hours >= 10 ? 0 : 1;
	return `${hours.toFixed(decimals)}h`;
};

const AgentCapacitySection: React.FC<AgentCapacitySectionProps> = ({
	humanEquivalent,
	dayConfigs,
	onHumanEquivalentChange,
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);

	const metrics = useMemo(() => {
		let totalMinutes = 0;
		let activeDayCount = 0;

		dayConfigs.forEach((day) => {
			if (!day) return;
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
		<Box className={styles.container}>
			<Box className={styles.header}>
				<Text className={styles.title}>
					{t('scheduler.capacity.title', 'Agent Capacity')}
				</Text>
				<Tooltip
					label={t(
						'scheduler.capacity.infoTooltip',
						'Adjust the number of human equivalents and see projected talk time'
					)}
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

			<Box className={styles.sliderSection}>
				<Group gap='sm' wrap='nowrap' className={styles.sliderRow}>
					<Text className={styles.sliderLabel}>
						{t('scheduler.capacity.sliderLabel', 'Agents')}
					</Text>
					<Slider
						value={sliderValue}
						onChange={onHumanEquivalentChange}
						min={1}
						max={150}
						step={1}
						classNames={{
							root: styles.sliderRoot,
							track: styles.sliderTrack,
							bar: styles.sliderBar,
							thumb: styles.sliderThumb,
						}}
					/>
					<Box className={styles.sliderValue}>{sliderValue}</Box>
				</Group>
			</Box>

			<Box className={styles.metricsGrid}>
				<Box className={styles.metricCard}>
					<Box className={styles.metricIconWrapper}>
						<IconCalendarTime size={16} />
					</Box>
					<Box className={styles.metricContent}>
						<Text className={styles.metricValue}>
							{formatHours(metrics.totalWeeklyHours)}
						</Text>
						<Text className={styles.metricLabel}>
							{t('scheduler.capacity.metrics.scheduled.label', 'Scheduled')}
						</Text>
					</Box>
				</Box>

				<Box className={styles.metricCard}>
					<Box
						className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}
					>
						<IconHeadset size={16} />
					</Box>
					<Box className={styles.metricContent}>
						<Text className={styles.metricValue}>
							{formatHours(metrics.talkHoursPerHuman)}
						</Text>
						<Text className={styles.metricLabel}>
							{t('scheduler.capacity.metrics.perAgent.label', 'Per Agent')}
						</Text>
					</Box>
				</Box>

				<Box className={styles.metricCard}>
					<Box
						className={`${styles.metricIconWrapper} ${styles.metricIconOrange}`}
					>
						<IconUsers size={16} />
					</Box>
					<Box className={styles.metricContent}>
						<Text className={styles.metricValue}>
							{formatHours(metrics.teamTalkHours)}
						</Text>
						<Text className={styles.metricLabel}>
							{t('scheduler.capacity.metrics.teamTotal.label', 'Team Total')}
						</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default AgentCapacitySection;

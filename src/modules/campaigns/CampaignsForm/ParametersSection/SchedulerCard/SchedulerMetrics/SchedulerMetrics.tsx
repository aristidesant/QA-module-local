import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from '@mantine/core';
import {
	IconUsers,
	IconCalendarStats,
	IconClockHour4,
} from '@tabler/icons-react';
import styles from './SchedulerMetrics.module.css';

interface SchedulerMetricsProps {
	humanEquivalent: number;
	totalWeeklyHours: number;
	hoursPerAgent: number;
}

const SchedulerMetrics: React.FC<SchedulerMetricsProps> = ({
	humanEquivalent,
	totalWeeklyHours,
	hoursPerAgent,
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);

	const formatValue = (value: number, isHours = false): string => {
		if (!Number.isFinite(value) || value <= 0) return '—';
		if (isHours) {
			return `${value.toFixed(1)}h`;
		}
		return value.toFixed(0);
	};

	const equivValue =
		Number.isFinite(humanEquivalent) && humanEquivalent > 0
			? humanEquivalent.toFixed(0)
			: '—';

	return (
		<Box className={styles.container}>
			<Box className={styles.metric}>
				<Box className={`${styles.iconWrapper} ${styles.iconBlue}`}>
					<IconUsers size={14} />
				</Box>
				<Box className={styles.content}>
					<Text className={styles.value}>{equivValue}</Text>
					<Text className={styles.label}>
						{t('scheduler.header.metrics.equivalents', 'Equiv.')}
					</Text>
				</Box>
			</Box>

			<Box className={styles.divider} />

			<Box className={styles.metric}>
				<Box className={`${styles.iconWrapper} ${styles.iconViolet}`}>
					<IconCalendarStats size={14} />
				</Box>
				<Box className={styles.content}>
					<Text className={styles.value}>
						{formatValue(totalWeeklyHours, true)}
					</Text>
					<Text className={styles.label}>
						{t('scheduler.header.metrics.weekly', 'Weekly')}
					</Text>
				</Box>
			</Box>

			<Box className={styles.divider} />

			<Box className={styles.metric}>
				<Box className={`${styles.iconWrapper} ${styles.iconTeal}`}>
					<IconClockHour4 size={14} />
				</Box>
				<Box className={styles.content}>
					<Text className={styles.value}>
						{formatValue(hoursPerAgent, true)}
					</Text>
					<Text className={styles.label}>
						{t('scheduler.header.metrics.perAgent', 'Per Agent')}
					</Text>
				</Box>
			</Box>
		</Box>
	);
};

export default SchedulerMetrics;

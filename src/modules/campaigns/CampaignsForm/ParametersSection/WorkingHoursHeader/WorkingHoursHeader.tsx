import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Group } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import styles from './WorkingHoursHeader.module.css';

interface WorkingHoursHeaderProps {
	title?: string;
	description?: string;
}

export const WorkingHoursHeader: React.FC<WorkingHoursHeaderProps> = ({
	title,
	description,
}) => {
	const { t } = useTranslation('campaigns');

	const displayTitle = title || t('scheduler.workingHours.title');
	const displayDescription =
		description || t('scheduler.workingHours.description');

	return (
		<Box className={styles.header}>
			<Group gap='xs' mb={4}>
				<IconClock size={20} className={styles.icon} />
				<Text fw={500} size='md' className={styles.title}>
					{displayTitle}
				</Text>
			</Group>

			<Text size='sm' c='dimmed' className={styles.description}>
				{displayDescription}
			</Text>
		</Box>
	);
};

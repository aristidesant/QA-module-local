import React from 'react';
import { Stack, Text } from '@mantine/core';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	button?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	title,
	subtitle,
	button,
}) => {
	return (
		<Stack align='center' justify='center' className={styles.container}>
			<div className={styles.icon}>{icon}</div>
			<Text size='xl' fw={600} className={styles.title}>
				{title}
			</Text>
			<Text size='md' c='dimmed' className={styles.subtitle}>
				{subtitle}
			</Text>
			{button}
		</Stack>
	);
};

export default EmptyState;

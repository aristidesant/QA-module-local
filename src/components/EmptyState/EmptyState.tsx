import React from 'react';
import { Stack, Text } from '@mantine/core';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
	icon?: React.ReactNode;
	message: string;
	description?: string;
	action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	message,
	description,
	action,
}) => {
	return (
		<div className={styles.wrapper}>
			<Stack align='center' justify='center' className={styles.container}>
				{icon && (
					<div className={styles.iconWrapper}>
						<div className={styles.icon}>{icon}</div>
					</div>
				)}
				<Text className={styles.message}>{message}</Text>
				{description && (
					<Text className={styles.description}>{description}</Text>
				)}
				{action && <div className={styles.action}>{action}</div>}
			</Stack>
		</div>
	);
};

export default EmptyState;

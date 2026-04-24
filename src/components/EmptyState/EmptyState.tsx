import React from 'react';
import { Stack, Text } from '@mantine/core';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
	icon?: React.ReactNode;
	message: string;
	description?: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	message,
	description,
	action,
	className,
}) => {
	return (
		<div className={`${styles.wrapper} ${className || ''}`.trim()}>
			<Stack align='center' justify='center' gap='xs'>
				{icon && <div className={styles.icon}>{icon}</div>}
				<Text className={styles.message}>{message}</Text>
				{description && (
					<Text className={styles.description}>{description}</Text>
				)}
				{action}
			</Stack>
		</div>
	);
};

export default EmptyState;

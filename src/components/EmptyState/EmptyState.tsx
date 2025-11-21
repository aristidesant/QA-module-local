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
			<Stack
				align='center'
				justify='center'
				gap='xs'
				className={styles.container}
			>
				{icon && (
					<div className={styles.iconWrapper}>
						<div className={styles.icon}>{icon}</div>
					</div>
				)}
				<Text className={styles.message}>{message}</Text>
				{description && <div className={styles.description}>{description}</div>}
				{action && <div className={styles.action}>{action}</div>}
			</Stack>
		</div>
	);
};

export default EmptyState;

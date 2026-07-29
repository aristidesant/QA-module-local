import { Text } from '@mantine/core';
import { type ReactNode } from 'react';
import styles from './StatCard.module.css';

export interface StatCardProps {
	title: string;
	value: ReactNode | string | number;
	subtitle?: ReactNode | string;
	chart?: ReactNode;
	color?: string;
	className?: string;
	icon?: ReactNode;
	badge?: ReactNode;
	variant?: 'default' | 'compact';
}

export const StatCard = ({
	title,
	value,
	subtitle,
	color,
	className,
	icon,
	badge,
	variant = 'default',
}: StatCardProps) => {
	const cardClassName = [
		styles.card,
		variant === 'compact' ? styles.compact : '',
		className || '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={cardClassName}>
			{icon && <div className={styles.iconWrapper}>{icon}</div>}
			<div className={styles.content}>
				<div className={styles.labelRow}>
					<Text className={styles.label}>{title}</Text>
					{badge}
				</div>
				<Text className={styles.value} style={color ? { color } : undefined}>
					{value}
				</Text>
				{subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
			</div>
			{/* {chart && <div className={styles.chart}>{chart}</div>} */}
		</div>
	);
};

export default StatCard;

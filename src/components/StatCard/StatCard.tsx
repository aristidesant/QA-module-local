import { Card, Text, Flex, Box } from '@mantine/core';
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
}

export const StatCard = ({
	title,
	value,
	subtitle,
	chart,
	color,
	className,
	icon,
}: StatCardProps) => {
	return (
		<Card
			className={`${styles.card} ${className || ''}`.trim()}
			withBorder
			padding='md'
			radius='lg'
		>
			<Flex
				align='stretch'
				justify='space-between'
				gap='md'
				className={styles.wrapper}
			>
				<Flex direction='column' gap='sm' className={styles.content}>
					<Flex align='flex-start' gap='sm' className={styles.header}>
						{icon && <Box className={styles.icon}>{icon}</Box>}
						<Text size='sm' c='dimmed' className={styles.title}>
							{title}
						</Text>
					</Flex>
					<Text
						size='xl'
						fw={600}
						className={styles.value}
						style={color ? { color } : undefined}
					>
						{value}
					</Text>
					{subtitle && (
						<Text size='xs' c='dimmed' className={styles.subtitle}>
							{subtitle}
						</Text>
					)}
				</Flex>
				{chart && <Box className={styles.chart}>{chart}</Box>}
			</Flex>
		</Card>
	);
};

export default StatCard;

import { Card, Text, Flex, Box } from '@mantine/core';
import { type ReactNode } from 'react';
import styles from './StatCard.module.css';

export interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	chart?: ReactNode;
	color?: string;
	className?: string;
}

export const StatCard = ({
	title,
	value,
	subtitle,
	chart,
	color,
	className,
}: StatCardProps) => {
	return (
		<Card className={`${styles.card} ${className || ''}`} padding='md'>
			<Flex direction='column' gap='xs'>
				<Text size='sm' c='dimmed' className={styles.title}>
					{title}
				</Text>
				<Flex justify='space-between' align='center' gap='md'>
					<Box>
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
					</Box>
					{chart && <Box className={styles.chart}>{chart}</Box>}
				</Flex>
			</Flex>
		</Card>
	);
};

export default StatCard;

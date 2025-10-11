import { SimpleGrid } from '@mantine/core';
import { type ReactNode } from 'react';
import styles from './MetricGrid.module.css';

interface MetricGridProps {
	children: ReactNode;
}

export const MetricGrid = ({ children }: MetricGridProps) => {
	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, lg: 3 }}
			spacing='md'
			className={styles.grid}
		>
			{children}
		</SimpleGrid>
	);
};

export default MetricGrid;

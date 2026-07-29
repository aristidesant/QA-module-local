import React from 'react';
import { SimpleGrid } from '@mantine/core';
import StatCard from '~/components/StatCard';

export interface DemoStatItem {
	key: string;
	title: string;
	value: React.ReactNode;
	subtitle?: React.ReactNode;
	icon?: React.ReactNode;
	badge?: React.ReactNode;
	color?: string;
}

interface DemoStatRowProps {
	stats: DemoStatItem[];
}

const DemoStatRow: React.FC<DemoStatRowProps> = ({ stats }) => {
	return (
		<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
			{stats.map((stat) => (
				<StatCard
					key={stat.key}
					title={stat.title}
					value={stat.value}
					subtitle={stat.subtitle}
					icon={stat.icon}
					badge={stat.badge}
					color={stat.color}
					variant='compact'
				/>
			))}
		</SimpleGrid>
	);
};

export default DemoStatRow;

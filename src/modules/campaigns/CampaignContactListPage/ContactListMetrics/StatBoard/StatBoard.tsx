import { SimpleGrid } from '@mantine/core';
import StatCard from '~/components/StatCard';
import styles from './StatBoard.module.css';

type StatCardData = {
	key: string;
	title: string;
	value: string;
	subtitle: string;
	icon: React.ReactNode;
	chart?: React.ReactNode;
};

type StatBoardProps = {
	statCards: StatCardData[];
};

const StatBoard = ({ statCards }: StatBoardProps) => {
	return (
		<SimpleGrid
			className={styles.statGrid}
			cols={{ base: 1, sm: 2, lg: 3 }}
			spacing='md'
		>
			{statCards.map((card) => (
				<StatCard
					key={card.key}
					title={card.title}
					value={card.value}
					subtitle={card.subtitle}
					icon={card.icon}
					chart={card.chart}
					className={styles.metricCard}
					variant='compact'
				/>
			))}
		</SimpleGrid>
	);
};

export default StatBoard;

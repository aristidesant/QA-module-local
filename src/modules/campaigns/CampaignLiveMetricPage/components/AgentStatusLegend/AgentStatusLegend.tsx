import { Flex, Box, Text } from '@mantine/core';
import styles from './AgentStatusLegend.module.css';

export interface LegendItem {
	label: string;
	color: string;
}

interface AgentStatusLegendProps {
	items: LegendItem[];
}

export const AgentStatusLegend = ({ items }: AgentStatusLegendProps) => {
	return (
		<Flex wrap='wrap' gap='md' className={styles.legend}>
			{items.map((item) => (
				<Flex key={item.label} align='center' gap='xs'>
					<Box
						className={styles.indicator}
						style={{ backgroundColor: item.color }}
					/>
					<Text size='xs' c='dimmed'>
						{item.label}
					</Text>
				</Flex>
			))}
		</Flex>
	);
};

export default AgentStatusLegend;

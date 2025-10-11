import { Card, Text, Flex, Tooltip, ActionIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import styles from './MetricInfoCard.module.css';

interface MetricInfoCardProps {
	label: string;
	value: string | number;
	tooltip?: string;
}

export const MetricInfoCard = ({
	label,
	value,
	tooltip,
}: MetricInfoCardProps) => {
	return (
		<Card className={styles.card} padding='sm'>
			<Flex direction='column' gap={4}>
				<Flex align='center' gap='xs'>
					<Text size='xs' c='dimmed' className={styles.label}>
						{label}
					</Text>
					{tooltip && (
						<Tooltip label={tooltip} withArrow>
							<ActionIcon variant='subtle' size='xs' color='gray'>
								<IconInfoCircle size={14} />
							</ActionIcon>
						</Tooltip>
					)}
				</Flex>
				<Text size='xl' fw={600} className={styles.value}>
					{value}
				</Text>
			</Flex>
		</Card>
	);
};

export default MetricInfoCard;

import { ReactNode } from 'react';
import { Box, Text, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import styles from './SmallMetricCard.module.css';

export type SmallMetricCardColor =
	| 'violet'
	| 'teal'
	| 'orange'
	| 'blue'
	| 'green'
	| 'red'
	| 'pink'
	| 'cyan'
	| 'yellow'
	| 'gray';

export interface SmallMetricCardProps {
	/** Icon to display in the card */
	icon: ReactNode;
	/** The main value to display */
	value: string | number;
	/** Description label below the value */
	label: string;
	/** Color theme for the card accent and icon */
	color?: SmallMetricCardColor;
	/** Optional tooltip text shown on hover */
	tooltip?: string;
	/** Optional className for additional styling */
	className?: string;
}

const SmallMetricCard: React.FC<SmallMetricCardProps> = ({
	icon,
	value,
	label,
	color = 'blue',
	tooltip,
	className,
}) => {
	const cardContent = (
		<Box
			className={`${styles.metricCard} ${styles[`metricCard--${color}`]} ${className || ''}`}
		>
			<Box className={`${styles.metricIcon} ${styles[`metricIcon--${color}`]}`}>
				{icon}
			</Box>
			<Box className={styles.metricBody}>
				<Text className={styles.metricLabel}>{label}</Text>
				<Text className={styles.metricValue}>{value}</Text>
			</Box>
			{tooltip && <IconInfoCircle size={14} className={styles.metricInfo} />}
		</Box>
	);

	if (tooltip) {
		return (
			<Tooltip label={tooltip} withArrow position='bottom'>
				{cardContent}
			</Tooltip>
		);
	}

	return cardContent;
};

export default SmallMetricCard;

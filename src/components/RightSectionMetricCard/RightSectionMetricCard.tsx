import React from 'react';
import { Text } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import RightSectionCard from '~/components/RightSectionCard';
import styles from './RightSectionMetricCard.module.css';

interface MetaItem {
	label: string;
	value: string;
	accent?: string;
	icon: React.ReactNode;
}

interface RightSectionMetricCardProps {
	title: string;
	description: string;
	icon: TablerIcon;
	iconColor: string;
	metaItems: MetaItem[];
}

const RightSectionMetricCard: React.FC<RightSectionMetricCardProps> = ({
	title,
	description,
	icon,
	iconColor,
	metaItems,
}) => {
	return (
		<RightSectionCard
			title={title}
			description={description}
			icon={icon}
			iconColor={iconColor}
		>
			<div className={styles.metaGrid}>
				{metaItems.map((item) => (
					<div key={item.label} className={styles.metaItem}>
						<div className={styles.metaIcon}>{item.icon}</div>
						<div className={styles.metaHeader}>
							<Text className={styles.metaLabel}>{item.label}</Text>
							<Text className={styles.metaValue}>{item.value}</Text>
						</div>
					</div>
				))}
			</div>
		</RightSectionCard>
	);
};

export default RightSectionMetricCard;

import React from 'react';
import { Card, Text, ThemeIcon } from '@mantine/core';
import styles from './InformationDetails.module.css';
import type { TablerIcon } from '@tabler/icons-react';

export interface InformationDetailsProps {
	label: string;
	value: React.ReactNode;
	icon?: TablerIcon;
}

export const InformationDetails: React.FC<InformationDetailsProps> = ({
	label,
	value,
	icon: Icon,
}) => (
	<Card withBorder shadow='sm' radius='md' className={styles.detailItem}>
		{Icon && (
			<ThemeIcon variant='light' radius={'xl'} className={styles.iconWrapper}>
				{<Icon size={24} />}
			</ThemeIcon>
		)}
		<div className={styles.labelValueWrapper}>
			<Text className={styles.detailLabel}>{label}</Text>
			<Text className={styles.detailValue}>{value}</Text>
		</div>
	</Card>
);

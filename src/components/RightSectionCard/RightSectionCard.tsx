import { type ReactNode } from 'react';
import { Card, Text } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import styles from './RightSectionCard.module.css';

export type RightSectionCardProps = {
	title: string;
	description?: string;
	icon?: TablerIcon;
	iconColor?: string;
	rightSection?: ReactNode;
	children: ReactNode;
};

export const RightSectionCard: React.FC<RightSectionCardProps> = ({
	title,
	description,
	icon: Icon,
	iconColor = 'var(--mantine-color-grape-6)',
	rightSection,
	children,
}) => {
	return (
		<Card className={styles.card}>
			<Card.Section inheritPadding py={'sm'} className={styles.header}>
				<div className={styles.titleGroup}>
					{Icon && (
						<Icon
							size={18}
							className={styles.icon}
							style={{ color: iconColor }}
						/>
					)}
					<div className={styles.titleCopy}>
						<Text c='dimmed' fz='xs' tt='uppercase' className={styles.title}>
							{title}
						</Text>
						{description && (
							<Text className={styles.subtitle}>{description}</Text>
						)}
					</div>
				</div>
				{rightSection && (
					<div className={styles.rightSection}>{rightSection}</div>
				)}
			</Card.Section>
			<div className={styles.content}>{children}</div>
		</Card>
	);
};

export default RightSectionCard;

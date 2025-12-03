import { type ReactNode } from 'react';
import { Card, Text, ThemeIcon } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import styles from './RightSectionCard.module.css';

export type RightSectionCardProps = {
	title: string;
	description?: ReactNode;
	icon?: TablerIcon;
	iconColor?: string;
	rightSection?: ReactNode;
	children: ReactNode;
	style?: React.CSSProperties;
	onClick?: () => void;
};

export const RightSectionCard: React.FC<RightSectionCardProps> = ({
	title,
	description,
	icon: Icon,
	iconColor = 'var(--mantine-color-grape-6)',
	rightSection,
	children,
	style,
	onClick,
}) => {
	return (
		<Card className={styles.card} style={style} onClick={onClick}>
			<Card.Section
				inheritPadding
				py={'sm'}
				className={`${styles.header} ${Icon ? styles.withIcon : ''} ${rightSection ? styles.withRight : ''}`}
			>
				{Icon && (
					<ThemeIcon variant='light' color={iconColor}>
						<Icon size={18} className={styles.icon} />
					</ThemeIcon>
				)}
				<div className={styles.titleCopy}>
					<Text fz='xs' tt='uppercase' className={styles.title}>
						{title}
					</Text>
					{description && (
						<Text component='div' className={styles.subtitle}>
							{description}
						</Text>
					)}
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

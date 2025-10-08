import { type ReactNode } from 'react';
import { Card, Group, Text, ThemeIcon } from '@mantine/core';
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
};

export const RightSectionCard: React.FC<RightSectionCardProps> = ({
	title,
	description,
	icon: Icon,
	iconColor = 'var(--mantine-color-grape-6)',
	rightSection,
	children,
	style,
}) => {
	return (
		<Card className={styles.card} style={style}>
			<Card.Section
				inheritPadding
				py={'sm'}
				className={`${styles.header} ${rightSection ? styles.headerWithRight : ''}`}
			>
				<Group gap={'xs'} align='center' justify='space-between' w={'100%'}>
					<Group gap={'xs'} align='center'>
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
								<Text className={styles.subtitle}>{description}</Text>
							)}
						</div>
					</Group>
					{rightSection && (
						<div className={styles.rightSection}>{rightSection}</div>
					)}
				</Group>
			</Card.Section>
			<div className={styles.content}>{children}</div>
		</Card>
	);
};

export default RightSectionCard;

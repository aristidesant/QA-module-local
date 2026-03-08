import { type ReactNode } from 'react';
import { Card, Text, ThemeIcon } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import styles from './RightSectionCard.module.css';
import CardHeaderActions from '~/components/CardHeaderActions';
import type { CardActionProps } from '~/components/CardHeaderActions';

export type RightSectionCardProps = CardActionProps & {
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
	actions,
	headerExtras,
	rightSection,
	headerActions,
	onAdd,
	onEdit,
	onChange,
	onView,
	onConfigure,
	onOpenSettings,
	onExpand,
	onCalculate,
	onRefresh,
	children,
	style,
	onClick,
}) => {
	const hasRightHeaderContent =
		Boolean(rightSection) ||
		Boolean(headerActions) ||
		Boolean(headerExtras) ||
		Boolean(actions) ||
		Boolean(onAdd) ||
		Boolean(onEdit) ||
		Boolean(onChange) ||
		Boolean(onView) ||
		Boolean(onConfigure) ||
		Boolean(onOpenSettings) ||
		Boolean(onExpand) ||
		Boolean(onCalculate) ||
		Boolean(onRefresh);

	return (
		<Card className={styles.card} style={style} onClick={onClick}>
			<Card.Section
				inheritPadding
				py={'sm'}
				className={`${styles.header} ${Icon ? styles.withIcon : ''} ${hasRightHeaderContent ? styles.withRight : ''}`}
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
				{hasRightHeaderContent && (
					<div className={styles.rightSection}>
						<CardHeaderActions
							actions={actions}
							headerExtras={headerExtras}
							headerActions={headerActions}
							onAdd={onAdd}
							onEdit={onEdit}
							onChange={onChange}
							onView={onView}
							onConfigure={onConfigure}
							onOpenSettings={onOpenSettings}
							onExpand={onExpand}
							onCalculate={onCalculate}
							onRefresh={onRefresh}
						/>
						{rightSection}
					</div>
				)}
			</Card.Section>
			<div className={styles.content}>{children}</div>
		</Card>
	);
};

export default RightSectionCard;

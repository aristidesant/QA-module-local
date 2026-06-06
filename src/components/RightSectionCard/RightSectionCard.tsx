import { type ReactNode } from 'react';
import { Text, ThemeIcon } from '@mantine/core';
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
	contentClassName?: string;
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
	onDelete,
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
	contentClassName,
	onClick,
}) => {
	const hasRightHeaderContent =
		Boolean(rightSection) ||
		Boolean(headerActions) ||
		Boolean(headerExtras) ||
		Boolean(actions) ||
		Boolean(onAdd) ||
		Boolean(onDelete) ||
		Boolean(onEdit) ||
		Boolean(onChange) ||
		Boolean(onView) ||
		Boolean(onConfigure) ||
		Boolean(onOpenSettings) ||
		Boolean(onExpand) ||
		Boolean(onCalculate) ||
		Boolean(onRefresh);

	return (
		<div
			className={styles.card}
			// inline-style-allow: caller-provided style prop for dynamic sizing/positioning that cannot be statically expressed in CSS
			style={style}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			data-interactive={onClick ? '' : undefined}
		>
			<div
				className={`${styles.header} ${Icon ? styles.withIcon : ''} ${hasRightHeaderContent ? styles.withRight : ''}`}
			>
				{Icon && (
					<ThemeIcon variant='light' color={iconColor} radius='sm' size='lg'>
						<Icon size={18} className={styles.icon} />
					</ThemeIcon>
				)}
				<div className={styles.titleCopy}>
					<Text component='div' className={styles.title}>
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
							onDelete={onDelete}
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
			</div>
			<div
				className={
					contentClassName
						? `${styles.content} ${contentClassName}`
						: styles.content
				}
			>
				{children}
			</div>
		</div>
	);
};

export default RightSectionCard;

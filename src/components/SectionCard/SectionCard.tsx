import React, { type ReactNode } from 'react';
import { Card, Text, Title } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import styles from './SectionCard.module.css';
import CardHeaderActions from '~/components/CardHeaderActions';
import type { CardActionProps } from '~/components/CardHeaderActions';

export interface SectionCardProps extends CardActionProps {
	icon?: TablerIcon;
	title?: string | ReactNode;
	description?: string;
	children?: ReactNode;
	className?: string;
	footer?: ReactNode;
	headerActions?: ReactNode;
	/** Control the gap between child elements in the content area */
	contentSpacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
	/** Background color for the card (default is white) */
	backgroundColor?: string;
	/** Optional ID for the section card */
	id?: string;

	padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
	icon: Icon,
	title,
	description,
	children,
	footer,
	actions,
	headerExtras,
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
	contentSpacing = 'md',
	backgroundColor,
	id,
	className,
	padding = 'lg',
}) => {
	// Convert spacing to pixel value if it's a string preset
	const getSpacingValue = (): string => {
		const spacingMap = {
			xs: '0.5rem',
			sm: '0.75rem',
			md: '1rem',
			lg: '1.5rem',
			xl: '2rem',
		};

		if (typeof contentSpacing === 'number') {
			return `${contentSpacing}px`;
		}

		return spacingMap[contentSpacing] || '1rem';
	};

	const contentStyle = {
		gap: getSpacingValue(),
	};

	const cardClassName = [styles.sectionCard, className]
		.filter(Boolean)
		.join(' ');

	const hasHeaderActions =
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
		<Card
			id={id}
			className={cardClassName}
			padding={padding}
			style={backgroundColor ? { backgroundColor } : undefined}
			data-testid='section-card'
		>
			<div className={styles.sectionShell}>
				{(title || description || Icon || hasHeaderActions) && (
					<div className={styles.sectionHeader}>
						<div className={styles.sectionHeaderMain}>
							<div className={styles.sectionTitleContent}>
								<div className={styles.sectionTitleRow}>
									{Icon && (
										<span className={styles.iconBadge}>
											<Icon size={16} />
										</span>
									)}
									{title && (
										<Title order={5} className={styles.sectionTitle}>
											{title}
										</Title>
									)}
								</div>
								{description && (
									<Text className={styles.sectionDescription}>
										{description}
									</Text>
								)}
							</div>
						</div>
						{hasHeaderActions && (
							<div className={styles.headerActions}>
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
							</div>
						)}
					</div>
				)}
				<div className={styles.sectionBody}>
					<div className={styles.content} style={contentStyle}>
						{children}
					</div>
					{footer && (
						<div className={styles.footerShell}>
							<div className={styles.footer}>{footer}</div>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
};

export default SectionCard;

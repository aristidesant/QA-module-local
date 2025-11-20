import React, { type ReactNode } from 'react';
import { Card, Text, Title } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import styles from './SectionCard.module.css';

export interface SectionCardProps {
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
	headerActions,
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

	return (
		<Card
			id={id}
			className={cardClassName}
			padding={padding}
			style={backgroundColor ? { backgroundColor } : undefined}
			data-testid='section-card'
		>
			{(title || description || Icon || headerActions) && (
				<div className={styles.sectionHeader}>
					<div className={styles.sectionTitleContent}>
						<div className={styles.sectionTitleRow}>
							{Icon && (
								<span className={styles.iconBadge}>
									<Icon size={18} />
								</span>
							)}
							{title && (
								<Title order={5} className={styles.sectionTitle}>
									{title}
								</Title>
							)}
						</div>
						{description && (
							<Text className={styles.sectionDescription}>{description}</Text>
						)}
					</div>
					{headerActions && (
						<div className={styles.headerActions}>{headerActions}</div>
					)}
				</div>
			)}
			<div className={styles.content} style={contentStyle}>
				{children}
			</div>
			{footer && <div className={styles.footer}>{footer}</div>}
		</Card>
	);
};

export default SectionCard;

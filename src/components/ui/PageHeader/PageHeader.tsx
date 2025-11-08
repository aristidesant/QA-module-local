import React from 'react';
import type { ReactNode } from 'react';
import { Paper, ThemeIcon } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { Breadcrumb } from '../Breadcrumb';
import type { BreadcrumbItem } from '../Breadcrumb';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
	title?: string;
	description?: string;
	breadcrumbs?: BreadcrumbItem[];
	actions?: ReactNode;
	className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	description,
	breadcrumbs,
	actions,
	className,
}) => {
	const containerClassName = [styles.container, className]
		.filter(Boolean)
		.join(' ');

	return (
		<Paper
			withBorder
			radius='lg'
			p='0'
			shadow='none'
			className={containerClassName}
		>
			{breadcrumbs && breadcrumbs.length > 0 && (
				<nav className={styles.breadcrumbBar} aria-label='Breadcrumb'>
					<ThemeIcon color='teal' variant='white'>
						<IconHome size={16} stroke={1.7} />
					</ThemeIcon>
					<Breadcrumb items={breadcrumbs} />
				</nav>
			)}

			<div className={styles.titleRow}>
				<div className={styles.titleSection}>
					{title && <h1 className={styles.title}>{title}</h1>}
					{description && <p className={styles.description}>{description}</p>}
				</div>
				{actions && <div className={styles.actions}>{actions}</div>}
			</div>
		</Paper>
	);
};

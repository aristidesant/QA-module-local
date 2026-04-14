import React from 'react';
import { NavLink } from 'react-router';
import { IconChevronRight } from '@tabler/icons-react';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
	label: string;
	path?: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
	className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
	const containerClasses = `${styles.container} ${className || ''}`;

	return (
		<div className={containerClasses}>
			{items.map((item, index) => {
				const isLast = index === items.length - 1;

				return (
					<React.Fragment key={`${item.label}-${index}`}>
						{item.path && !isLast ? (
							<NavLink to={item.path} className={styles.item}>
								{item.label}
							</NavLink>
						) : (
							<span className={`${styles.item} ${isLast ? styles.active : ''}`}>
								{item.label}
							</span>
						)}

						{!isLast && (
							<span className={styles.separator}>
								<IconChevronRight size={14} stroke={1.5} />
							</span>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
};

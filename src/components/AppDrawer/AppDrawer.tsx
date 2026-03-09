import React, { type ReactNode } from 'react';
import { Drawer, Text, type DrawerProps } from '@mantine/core';
import clsx from 'clsx';
import styles from './AppDrawer.module.css';

export interface AppDrawerProps extends Omit<DrawerProps, 'title'> {
	title?: ReactNode;
	description?: ReactNode;
	icon?: ReactNode;
	headerActions?: ReactNode;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
	title,
	description,
	icon,
	headerActions,
	position = 'right',
	classNames,
	children,
	...drawerProps
}) => {
	const hasHeaderContent = Boolean(title || headerActions);

	const headerTitle = title ? (
		<div className={styles.titleRow}>
			{icon ? <span className={styles.iconBadge}>{icon}</span> : null}
			<Text component='div' className={styles.titleOnly}>
				{title}
			</Text>
		</div>
	) : null;

	return (
		<Drawer
			{...drawerProps}
			position={position}
			title={
				hasHeaderContent ? (
					<div className={styles.headerContent}>
						{headerTitle ? (
							<div className={styles.headerMain}>{headerTitle}</div>
						) : null}
						{headerActions ? (
							<div className={styles.headerActions}>{headerActions}</div>
						) : null}
					</div>
				) : undefined
			}
			classNames={{
				...classNames,
				content: clsx(styles.content, classNames?.content),
				header: clsx(styles.header, classNames?.header),
				title: clsx(styles.title, classNames?.title),
				body: clsx(styles.body, classNames?.body),
			}}
		>
			{description ? (
				<Text component='div' className={styles.description}>
					{description}
				</Text>
			) : null}
			{children}
		</Drawer>
	);
};

export default AppDrawer;

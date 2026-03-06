import React, { type ReactNode } from 'react';
import { Drawer, Text, type DrawerProps } from '@mantine/core';
import clsx from 'clsx';
import SectionTitle from '~/components/SectionTitle';
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
	const hasRichTitle = Boolean(description || icon);
	const hasHeaderContent = Boolean(title || headerActions);

	const headerTitle = title ? (
		hasRichTitle ? (
			<SectionTitle
				title={title}
				description={description}
				icon={icon}
				order={5}
			/>
		) : (
			<Text component='div' className={styles.titleOnly}>
				{title}
			</Text>
		)
	) : null;

	return (
		<Drawer
			{...drawerProps}
			position={position}
			title={
				hasHeaderContent ? (
					<div className={styles.headerContent}>
						<div className={styles.headerMain}>{headerTitle}</div>
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
			{children}
		</Drawer>
	);
};

export default AppDrawer;

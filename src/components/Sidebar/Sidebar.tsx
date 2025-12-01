import React from 'react';
import { Text, Stack, Divider } from '@mantine/core';
import { menuItems, MenuItem } from './menuItems';
import { Link, useLocation } from 'react-router';
import styles from './Sidebar.module.css';
import Logo from '../Logo';
import { APP_VERSION } from '~/version';

// menuItems are now imported from menuItems.tsx

export const Sidebar: React.FC = () => {
	return (
		<nav className={styles.sidebar} aria-label='Main navigation'>
			<Stack className={styles.menuList} gap='lg'>
				<div className={styles.logoWrapper}>
					<Logo />
				</div>
				<div className={styles.versionWrapper}>
					<Text size='xs' c='dimmed'>
						Version {APP_VERSION}
					</Text>
				</div>
				<Divider className={styles.divider} />
				<Stack gap='xs'>
					<Text
						size='xs'
						fw={600}
						c='dimmed'
						px='md'
						mb='xs'
						className={styles.sectionHeader}
					>
						MENU
					</Text>
					{menuItems.map((item) => renderMenuItem(item))}
				</Stack>
			</Stack>
		</nav>
	);
};

export const renderMenuItem = ({ label, icon, to, exact }: MenuItem) => {
	const location = useLocation();

	const isSelected = exact
		? location.pathname === to
		: location.pathname.startsWith(to) && to !== '/';
	return (
		<Link
			key={label}
			to={to}
			className={[
				styles.menuItem,
				isSelected ? styles.menuItemSelected : '',
			].join(' ')}
			aria-current={isSelected ? 'page' : undefined}
			tabIndex={0}
		>
			{icon}
			<span className={styles.menuText}>{label}</span>
		</Link>
	);
};

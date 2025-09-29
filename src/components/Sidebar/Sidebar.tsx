import React from 'react';
import { Text, Stack, Divider, Tooltip } from '@mantine/core';
import { menuItems, maintenanceItems, MenuItem } from './menuItems';
import { Link, useLocation } from 'react-router';
import styles from './Sidebar.module.css';
import Logo from '../Logo';
import { APP_VERSION } from '~/version';

// menuItems and maintenanceItems are now imported from menuItems.tsx

type SidebarProps = {
	onClose?: () => void;
	opened: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ onClose: _, opened }) => {
	return (
		<nav
			className={`${styles.sidebar} ${
				opened ? styles.sidebarExpanded : styles.sidebarCollapsed
			}`}
			aria-label='Main navigation'
			aria-expanded={opened}
		>
			<Stack className={styles.menuList} gap='lg'>
				<div className={styles.logoWrapper}>
					<Logo compact={!opened} />
				</div>
				<div className={styles.versionWrapper}>
					<Text c='dimmed' size='xs' className={styles.versionText}>
						Version {APP_VERSION}
					</Text>
				</div>
				<Divider className={styles.divider} />
				<Stack gap='xs'>
					{opened && (
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
					)}
					{menuItems.map((item) => renderMenuItem({ ...item, opened }))}
				</Stack>
				<Stack gap='xs'>
					{opened && (
						<Text
							size='xs'
							fw={600}
							c='dimmed'
							px='md'
							mb='xs'
							className={styles.sectionHeader}
						>
							MAINTENANCE
						</Text>
					)}
					{maintenanceItems.map((item) => renderMenuItem({ ...item, opened }))}
				</Stack>
			</Stack>
		</nav>
	);
};

export const renderMenuItem = ({
	label,
	icon,
	to,
	exact,
	opened = true,
}: MenuItem) => {
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
				!opened ? styles.menuItemCollapsed : '',
			].join(' ')}
			aria-current={isSelected ? 'page' : undefined}
			tabIndex={0}
		>
			{opened ? (
				icon
			) : (
				<Tooltip label={label} position='right' withArrow>
					<span>{icon}</span>
				</Tooltip>
			)}
			{opened && <span className={styles.menuText}>{label}</span>}
		</Link>
	);
};

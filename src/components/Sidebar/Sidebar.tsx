import React, { useMemo } from 'react';
import { Text, Stack, Divider, Group } from '@mantine/core';
import { menuItems, MenuItem } from './menuItems';
import { Link, useLocation } from 'react-router';
import styles from './Sidebar.module.css';
import { prefetchNamespace } from '~/utils/i18nHelpers';
import Logo from '../Logo';
import { APP_VERSION } from '~/version';
import { usePermissions } from '~/hooks/usePermissions';
import { useTranslation } from 'react-i18next';
import LanguagePicker from '../LanguagePicker';

// menuItems are now imported from menuItems.tsx

export const Sidebar: React.FC = () => {
	const { canAccessModule, canPerformAction } = usePermissions();
	const { t } = useTranslation();

	const permittedMenuItems = useMemo(
		() =>
			menuItems.filter((item) => {
				if (item.permission) {
					return canPerformAction(item.module, item.permission);
				}
				return canAccessModule(item.module);
			}),
		[canAccessModule, canPerformAction]
	);

	return (
		<nav className={styles.sidebar} aria-label={t('sidebar.ariaLabel')}>
			<Stack className={styles.menuList} gap='lg'>
				<div className={styles.logoWrapper}>
					<Logo />
				</div>
				<div className={styles.versionWrapper}>
					<Text size='xs' c='dimmed'>
						{t('sidebar.version')} {APP_VERSION}
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
						{t('sidebar.menu')}
					</Text>
					{permittedMenuItems.length > 0 ? (
						permittedMenuItems.map((item) => (
							<SidebarMenuItem key={item.label} item={item} />
						))
					) : (
						<div className={styles.emptyState}>
							<Text size='sm' c='dimmed' fw={600}>
								{t('sidebar.noModules')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('sidebar.requestAccess')}
							</Text>
						</div>
					)}
				</Stack>
				<div style={{ marginTop: 'auto' }}>
					<Divider className={styles.divider} mb='xs' />
					<Group justify='center' px='md'>
						<LanguagePicker variant='subtle' size='sm' withLabel={true} />
					</Group>
				</div>
			</Stack>
		</nav>
	);
};

interface SidebarMenuItemProps {
	item: MenuItem;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item }) => {
	const { label, icon, to, exact } = item;
	const location = useLocation();
	const { t } = useTranslation();

	const isSelected = exact
		? location.pathname === to
		: location.pathname.startsWith(to) && to !== '/';

	return (
		<Link
			to={to}
			className={[
				styles.menuItem,
				isSelected ? styles.menuItemSelected : '',
			].join(' ')}
			aria-current={isSelected ? 'page' : undefined}
			tabIndex={0}
			onMouseEnter={() =>
				item.i18nNamespace && prefetchNamespace(item.i18nNamespace)
			}
		>
			{icon}
			<span className={styles.menuText}>{t(label)}</span>
		</Link>
	);
};

/**
 * @deprecated Use SidebarMenuItem component instead
 */
export const renderMenuItem = (item: MenuItem) => {
	return <SidebarMenuItem key={item.label} item={item} />;
};

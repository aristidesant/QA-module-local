import React, { useMemo } from 'react';
import {
	Text,
	Stack,
	Divider,
	Group,
	Tooltip,
	ActionIcon,
} from '@mantine/core';
import { menuItems, MenuItem } from './menuItems';
import { Link, useLocation } from 'react-router';
import styles from './Sidebar.module.css';
import { prefetchNamespace } from '~/utils/i18nHelpers';
import Logo from '../Logo';
import { APP_VERSION } from '~/version';
import { usePermissions } from '~/hooks/usePermissions';
import { useTranslation } from 'react-i18next';
import LanguagePicker from '../LanguagePicker';
import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { useSidebarStore } from '~/stores/sidebarStore';

// menuItems are now imported from menuItems.tsx

export const Sidebar: React.FC = () => {
	const { canAccessModule, canPerformAction } = usePermissions();
	const { t } = useTranslation();
	const { collapsed, toggleCollapsed } = useSidebarStore();

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
		<nav
			className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}
			aria-label={t('sidebar.ariaLabel')}
		>
			<Stack className={styles.menuList} gap='lg'>
				<div className={styles.logoWrapper}>
					<Logo compact={collapsed} />
				</div>
				{!collapsed && (
					<div className={styles.versionWrapper}>
						<Text size='xs' c='dimmed'>
							{t('sidebar.version')} {APP_VERSION}
						</Text>
					</div>
				)}
				<Divider className={styles.divider} />
				<Stack gap='xs'>
					<Group
						justify={collapsed ? 'center' : 'space-between'}
						px='md'
						mb='xs'
					>
						{!collapsed && (
							<Text
								size='xs'
								fw={600}
								c='dimmed'
								className={styles.sectionHeader}
							>
								{t('sidebar.menu')}
							</Text>
						)}
						<Tooltip
							label={
								collapsed
									? t('sidebar.expand', { defaultValue: 'Expand sidebar' })
									: t('sidebar.collapse', { defaultValue: 'Collapse sidebar' })
							}
							position='right'
							withArrow
						>
							<ActionIcon
								variant='subtle'
								color='gray'
								size='sm'
								onClick={toggleCollapsed}
								aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
							>
								{collapsed ? (
									<IconChevronsRight size={16} />
								) : (
									<IconChevronsLeft size={16} />
								)}
							</ActionIcon>
						</Tooltip>
					</Group>
					{permittedMenuItems.length > 0
						? permittedMenuItems.map((item) => (
								<SidebarMenuItem
									key={item.label}
									item={item}
									collapsed={collapsed}
								/>
							))
						: !collapsed && (
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
				<div className={styles.bottomSection}>
					<Divider className={styles.divider} mb='xs' />
					<Group justify='center' px={collapsed ? 0 : 'md'}>
						<LanguagePicker variant='subtle' size='sm' withLabel={!collapsed} />
					</Group>
				</div>
			</Stack>
		</nav>
	);
};

interface SidebarMenuItemProps {
	item: MenuItem;
	collapsed?: boolean;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
	item,
	collapsed = false,
}) => {
	const { label, icon, to, exact } = item;
	const location = useLocation();
	const { t } = useTranslation();

	const isSelected = exact
		? location.pathname === to
		: location.pathname.startsWith(to) && to !== '/';

	const linkContent = (
		<Link
			to={to}
			className={[
				styles.menuItem,
				isSelected ? styles.menuItemSelected : '',
				collapsed ? styles.menuItemCollapsed : '',
			].join(' ')}
			aria-current={isSelected ? 'page' : undefined}
			tabIndex={0}
			onMouseEnter={() =>
				item.i18nNamespace && prefetchNamespace(item.i18nNamespace)
			}
		>
			{icon}
			{!collapsed && <span className={styles.menuText}>{t(label)}</span>}
		</Link>
	);

	if (collapsed) {
		return (
			<Tooltip label={t(label)} position='right' withArrow>
				{linkContent}
			</Tooltip>
		);
	}

	return linkContent;
};

/**
 * @deprecated Use SidebarMenuItem component instead
 */
export const renderMenuItem = (item: MenuItem) => {
	return <SidebarMenuItem key={item.label} item={item} />;
};

import { Menu, Tooltip, Divider } from '@mantine/core';
import {
	IconChevronDown,
	IconLogout,
	IconShield,
	IconUser,
	IconSettings,
	IconTools,
	IconBook,
	IconUsers,
	IconKey,
	IconBuilding,
	IconPhoneOff,
	IconFlask,
} from '@tabler/icons-react';
import styles from './UserMenu.module.css';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import logout from '~/utils/logout';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { usePermissions } from '~/hooks/usePermissions';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

export const UserMenu: React.FC = () => {
	const { t } = useTranslation();
	const { user, targetClient } = useSessionStore();
	const { isImpersonating } = useImpersonationState();
	const { canAccessModule, canPerformAction } = usePermissions();
	const isMasterClient = useIsMasterClient();
	const navigate = useNavigate();

	// Get user's full name or fallback to username
	const userFullName =
		user?.firstName && user?.lastName
			? `${user.firstName} ${user.lastName}`
			: user?.firstName || user?.lastName || user?.username;

	// Show target client name when impersonating, otherwise user's full name
	const displayName =
		isImpersonating && targetClient ? targetClient.name : userFullName;
	const displayEmail =
		isImpersonating && targetClient ? 'Impersonated Client' : user?.email;

	// Get initials from firstName and lastName, or username, or target client
	const initials =
		isImpersonating && targetClient
			? targetClient.name?.slice(0, 2).toUpperCase()
			: user?.firstName && user?.lastName
				? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
				: user?.username?.slice(0, 2).toUpperCase();

	const handleLogout = () => {
		logout();
	};

	const handleProfileClick = () => {
		navigate('/profile');
	};

	const handleMaintenanceNavigation = (path: string) => {
		navigate(path);
	};

	const fetcher = { state: 'idle' } as const;

	type MaintenanceItem = {
		label: string;
		icon: React.ReactNode;
		path: string;
		module: ModuleEnum;
		permission?: PermissionEnum;
		masterOnly?: boolean;
	};

	type MaintenanceCategory = {
		category: string;
		items: MaintenanceItem[];
	};

	// Organized maintenance categories
	const maintenanceCategories: MaintenanceCategory[] = [
		{
			category: t('userMenu.categories.campaignManagement'),
			items: [
				{
					label: t('userMenu.items.campaignManagement'),
					icon: <IconSettings size={16} />,
					path: '/campaign-management',
					module: ModuleEnum.SETTINGS,
				},
			],
		},
		{
			category: t('userMenu.categories.configuration'),
			items: [
				{
					label: t('userMenu.items.configurations'),
					icon: <IconSettings size={16} />,
					path: '/configurations/client-configs',
					module: ModuleEnum.SETTINGS,
					permission: PermissionEnum.MANAGE,
				},
				{
					label: t('userMenu.items.clients'),
					icon: <IconBuilding size={16} />,
					path: '/clients',
					module: ModuleEnum.SETTINGS,
					permission: PermissionEnum.MANAGE,
					masterOnly: true,
				},
			],
		},
		{
			category: t('userMenu.categories.compliance'),
			items: [
				{
					label: t('userMenu.items.doNotCall'),
					icon: <IconPhoneOff size={16} />,
					path: '/do-not-call',
					module: ModuleEnum.SETTINGS,
				},
			],
		},
		{
			category: t('userMenu.categories.toolsAndResources'),
			items: [
				{
					label: t('userMenu.items.agentTests'),
					icon: <IconFlask size={16} />,
					path: '/agent-tests',
					module: ModuleEnum.CAMPAIGNS,
					permission: PermissionEnum.UPDATE,
				},
				{
					label: t('userMenu.items.knowledgeBases'),
					icon: <IconBook size={16} />,
					path: '/knowledge-bases',
					module: ModuleEnum.KNOWLEDGE_BASES,
					permission: PermissionEnum.READ,
				},
				{
					label: t('userMenu.items.tools'),
					icon: <IconTools size={16} />,
					path: '/tools',
					module: ModuleEnum.TOOLS,
					permission: PermissionEnum.MANAGE,
					masterOnly: true,
				},
			],
		},
	];

	const normalMaintenanceCategories = maintenanceCategories.map((category) => {
		if (category.category === t('userMenu.categories.configuration')) {
			const usersItem: MaintenanceItem = {
				label: t('userMenu.items.users'),
				icon: <IconUsers size={16} />,
				path: '/users',
				module: ModuleEnum.USERS,
				permission: PermissionEnum.MANAGE,
				masterOnly: true,
			};
			const rolesItem: MaintenanceItem = {
				label: t('userMenu.items.roles'),
				icon: <IconKey size={16} />,
				path: '/roles',
				module: ModuleEnum.ROLES,
				masterOnly: true,
			};
			return {
				...category,
				items: [
					...category.items,
					...(isMasterClient ? [usersItem, rolesItem] : []),
				],
			};
		}

		return category;
	});

	const filteredCategories = (categories: typeof maintenanceCategories) =>
		categories
			.map((category) => ({
				...category,
				items: category.items.filter((item) => {
					if (item.masterOnly && !isMasterClient) {
						return false;
					}
					if (item.permission) {
						return canPerformAction(item.module, item.permission);
					}
					return canAccessModule(item.module);
				}),
			}))
			.filter((category) => category.items.length > 0);

	const categoriesToRender = isImpersonating
		? filteredCategories(maintenanceCategories)
		: filteredCategories(normalMaintenanceCategories);

	return (
		<Menu shadow='md' width={280} position='bottom-end'>
			<Menu.Target>
				<div className={styles.trigger}>
					<div
						className={styles.userMenu}
						tabIndex={0}
						role='button'
						aria-label='User menu'
					>
						<div
							className={`${styles.avatar} ${isImpersonating ? styles.impersonating : ''}`}
						>
							{initials}
							{isImpersonating && (
								<div className={styles.impersonationIndicator}>
									<IconShield size={12} />
								</div>
							)}
						</div>
						<div className={styles.userInfo}>
							<span className={styles.name}>{displayName}</span>
							<span className={styles.email}>{displayEmail}</span>
						</div>
						<IconChevronDown size={18} className={styles.chevron} />
					</div>
				</div>
			</Menu.Target>
			<Menu.Dropdown className={styles.dropdown}>
				{isImpersonating ? (
					<>
						<div className={styles.impersonationSection}>
							<div className={styles.impersonationHeader}>
								<IconShield size={18} />
								<div>
									<div className={styles.impersonationTitle}>
										{t('userMenu.impersonationMode')}
									</div>
									<div className={styles.impersonationSubtitle}>
										{t('userMenu.impersonatingClient')}
									</div>
								</div>
							</div>
							<div className={styles.impersonationMessage}>
								{t('userMenu.returnToMaster')}
							</div>
						</div>
						<Divider />

						{categoriesToRender.length > 0 ? (
							categoriesToRender.map((categoryGroup, idx) => (
								<div key={categoryGroup.category}>
									<Menu.Label className={styles.categoryLabel}>
										{categoryGroup.category}
									</Menu.Label>
									<div className={styles.categoryGroup}>
										{categoryGroup.items.map((item) => (
											<Tooltip
												key={item.path}
												label={item.label}
												position='left'
												withArrow
											>
												<Menu.Item
													onClick={() => handleMaintenanceNavigation(item.path)}
													leftSection={item.icon}
													className={styles.categoryItem}
												>
													{item.label}
												</Menu.Item>
											</Tooltip>
										))}
									</div>
									{idx < categoriesToRender.length - 1 && <Divider my='xs' />}
								</div>
							))
						) : (
							<div className={styles.emptyPermissions}>
								<span className={styles.emptyPermissionsTitle}>
									{t('userMenu.noAccessibleModules')}
								</span>
								<span className={styles.emptyPermissionsSubtitle}>
									{t('userMenu.requestAccess')}
								</span>
							</div>
						)}

						<Divider />
						<Menu.Item
							color='red'
							onClick={handleLogout}
							disabled={fetcher.state !== 'idle'}
							leftSection={<IconLogout size={16} />}
							className={styles.logoutItem}
						>
							{fetcher.state === 'idle'
								? t('userMenu.logout')
								: t('userMenu.loggingOut')}
						</Menu.Item>
					</>
				) : (
					<>
						<Menu.Item
							onClick={handleProfileClick}
							leftSection={<IconUser size={16} />}
							className={styles.profileItem}
						>
							{t('userMenu.profile')}
						</Menu.Item>
						<Divider />

						{categoriesToRender.length > 0 ? (
							categoriesToRender.map((categoryGroup, idx) => (
								<div key={categoryGroup.category}>
									<Menu.Label className={styles.categoryLabel}>
										{categoryGroup.category}
									</Menu.Label>
									<div className={styles.categoryGroup}>
										{categoryGroup.items.map((item) => (
											<Tooltip
												key={item.path}
												label={item.label}
												position='left'
												withArrow
											>
												<Menu.Item
													onClick={() => handleMaintenanceNavigation(item.path)}
													leftSection={item.icon}
													className={styles.categoryItem}
												>
													{item.label}
												</Menu.Item>
											</Tooltip>
										))}
									</div>
									{idx < categoriesToRender.length - 1 && <Divider my='xs' />}
								</div>
							))
						) : (
							<div className={styles.emptyPermissions}>
								<span className={styles.emptyPermissionsTitle}>
									{t('userMenu.noAccessibleModules')}
								</span>
								<span className={styles.emptyPermissionsSubtitle}>
									{t('userMenu.requestAccess')}
								</span>
							</div>
						)}

						<Divider />
						<Menu.Item
							color='red'
							onClick={handleLogout}
							disabled={fetcher.state !== 'idle'}
							leftSection={<IconLogout size={16} />}
							className={styles.logoutItem}
						>
							{fetcher.state === 'idle'
								? t('userMenu.logout')
								: t('userMenu.loggingOut')}
						</Menu.Item>
					</>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};

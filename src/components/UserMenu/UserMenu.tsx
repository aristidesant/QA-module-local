import { useDisclosure } from '@mantine/hooks';
import {
	ActionIcon,
	Badge,
	Divider,
	Group,
	Menu,
	Paper,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
} from '@mantine/core';
import {
	IconLogout,
	IconDotsVertical,
	IconShield,
	IconSwitchHorizontal,
	IconUserCircle,
	IconSun,
	IconMoon,
	IconDeviceDesktop,
	IconApps,
	IconEyeglass,
	IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { useIsSuperAdmin } from '~/hooks/useIsSuperAdmin';
import { useRoleMockStore } from '~/stores/roleMockStore';
import { PREVIEW_ROLES } from '~/constants/previewRole';
import type { PreviewRole } from '~/constants/previewRole';
import { useCurrentApp } from '~/hooks/useCurrentApp';
import type { AppKey } from '~/hooks/useCurrentApp';
import { useAccessibleApps } from '~/hooks/useAccessibleApps';
import { useAppTransitionStore } from '~/stores/appTransitionStore';
import { useColorSchemeStore } from '~/stores/colorSchemeStore';
import { getClientDisplayLabel } from '~/utils/clientDisplay';
import { appLandingPath } from '~/utils/computeAccessibleApps';
import logout from '~/utils/logout';
import LanguagePicker from '../LanguagePicker';
import ClientSwitcherModal from '../ClientSwitcherModal';
import AppChooserModal from '../AppChooserModal';
import styles from './UserMenu.module.css';

type ColorSchemePreference = 'light' | 'dark' | 'auto';

const themeIconMap: Record<ColorSchemePreference, typeof IconSun> = {
	light: IconSun,
	dark: IconMoon,
	auto: IconDeviceDesktop,
};

interface UserMenuProps {
	collapsed?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ collapsed = false }) => {
	const { t } = useTranslation('common');
	const { user, targetClient } = useSessionStore();
	const { isImpersonating } = useImpersonationState();
	const isSuperAdmin = useIsSuperAdmin();
	const previewRole = useRoleMockStore((s) => s.previewRole);
	const setPreviewRole = useRoleMockStore((s) => s.setPreviewRole);
	const currentApp = useCurrentApp();
	const accessibleApps = useAccessibleApps();
	const preference = useColorSchemeStore((s) => s.preference);
	const setPreference = useColorSchemeStore((s) => s.setPreference);
	const navigate = useNavigate();
	const [switcherOpened, { open: openSwitcher, close: closeSwitcher }] =
		useDisclosure(false);
	const [chooserOpened, { open: openChooser, close: closeChooser }] =
		useDisclosure(false);
	const [menuOpened, { open: openMenu, close: closeMenu }] =
		useDisclosure(false);

	const userFullName =
		user?.firstName && user?.lastName
			? `${user.firstName} ${user.lastName}`
			: user?.firstName || user?.lastName || user?.username || '';

	const displayName =
		isImpersonating && targetClient
			? getClientDisplayLabel(targetClient)
			: userFullName;
	const currentClientName =
		isImpersonating && targetClient
			? getClientDisplayLabel(targetClient)
			: getClientDisplayLabel({
					name: user?.client?.name,
					alias: user?.client?.alias,
				});
	const currentClientBadge = isImpersonating
		? t('userMenu.impersonationMode')
		: currentClientName;

	const initials =
		isImpersonating && targetClient
			? getClientDisplayLabel(targetClient).slice(0, 2).toUpperCase()
			: user?.firstName && user?.lastName
				? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
				: user?.username?.slice(0, 2).toUpperCase() || 'NA';

	const handleProfileClick = () => {
		navigate('/profile');
		closeMenu();
	};

	const handleLogout = () => {
		closeMenu();
		logout();
	};

	// Instant, client-side jump between apps — same token/client, so no backend
	// call. Only offered when the user can reach 2+ apps. The transition overlay
	// gives the switch a deliberate, screen-wide moment.
	const handleAppChoose = (app: AppKey) => {
		closeChooser();
		if (app === currentApp) return;
		useAppTransitionStore.getState().start(app);
		navigate(appLandingPath(app));
	};

	const handleOpenChooser = () => {
		closeMenu();
		openChooser();
	};

	const roleLandingPaths: Record<PreviewRole, string> = {
		agent: '/role-preview/agent-dashboard',
		operationManager: '/role-preview/qa-manager-dashboard',
		supervisor: '/qa/dashboard',
		superAdmin: '/role-preview/qa-forms',
	};

	const handleSelectPreviewRole = (role: PreviewRole) => {
		closeMenu();
		setPreviewRole(role);
		navigate(roleLandingPaths[role]);
	};

	const handleExitPreview = () => {
		closeMenu();
		setPreviewRole(null);
	};

	const canSwitchApps = accessibleApps.length >= 2;

	const menuDropdown = (
		<Menu.Dropdown className={styles.menuDropdown}>
			<div className={styles.menuHeader}>
				<div
					className={[
						styles.avatar,
						styles.avatarSmall,
						isImpersonating ? styles.avatarImpersonating : '',
					].join(' ')}
				>
					{initials}
					{isImpersonating && (
						<div className={styles.impersonationIndicator}>
							<IconShield size={8} />
						</div>
					)}
				</div>
				<div className={styles.menuHeaderText}>
					<Text size='sm' fw={600} className={styles.menuHeaderName}>
						{displayName}
					</Text>
					<Text size='xs' c='dimmed' className={styles.menuHeaderSub}>
						{currentClientBadge || t('sidebar.account.title')}
					</Text>
				</div>
			</div>
			<Divider className={styles.menuDivider} />
			<Menu.Item
				leftSection={<IconUserCircle size={16} />}
				onClick={handleProfileClick}
				className={styles.menuItem}
			>
				{t('sidebar.account.profile')}
			</Menu.Item>
			<Menu.Item
				leftSection={<IconSwitchHorizontal size={16} />}
				onClick={() => {
					closeMenu();
					openSwitcher();
				}}
				className={styles.menuItem}
			>
				{t('sidebar.account.switchClient')}
			</Menu.Item>
			{canSwitchApps && (
				<Menu.Item
					leftSection={<IconApps size={16} />}
					onClick={handleOpenChooser}
					className={styles.menuItem}
				>
					{t('appSwitcher.switchApp')}
				</Menu.Item>
			)}
			{isSuperAdmin && (
				<>
					<Menu.Label className={styles.menuLabel}>
						{t('userMenu.rolePreview.menuLabel')}
					</Menu.Label>
					{PREVIEW_ROLES.map((role) => (
						<Menu.Item
							key={role.key}
							leftSection={<IconEyeglass size={16} />}
							onClick={() => handleSelectPreviewRole(role.key)}
							className={[
								styles.menuItem,
								previewRole === role.key ? styles.menuItemActive : '',
							].join(' ')}
						>
							{t(role.labelKey)}
						</Menu.Item>
					))}
					{previewRole && (
						<Menu.Item
							leftSection={<IconX size={16} />}
							onClick={handleExitPreview}
							className={styles.menuItem}
						>
							{t('userMenu.rolePreview.exit')}
						</Menu.Item>
					)}
				</>
			)}
			<Menu.Label className={styles.menuLabel}>
				{t('sidebar.account.language')}
			</Menu.Label>
			<div className={styles.languageMenuRow}>
				<LanguagePicker size='xs' variant='subtle' withLabel />
			</div>
			<Menu.Label className={styles.menuLabel}>
				{t('sidebar.theme.label')}
			</Menu.Label>
			<div className={styles.themeRow}>
				<div className={styles.themeSegment}>
					{(['light', 'dark', 'auto'] as ColorSchemePreference[]).map(
						(scheme) => {
							const Icon = themeIconMap[scheme];
							const isActive = preference === scheme;
							return (
								<Tooltip
									key={scheme}
									label={t(`sidebar.theme.${scheme}`)}
									withArrow
								>
									<ActionIcon
										variant='transparent'
										size='sm'
										onClick={() => setPreference(scheme)}
										aria-label={t(`sidebar.theme.${scheme}`)}
										className={[
											styles.themeBtn,
											isActive ? styles.themeBtnActive : '',
										].join(' ')}
									>
										<Icon size={14} />
									</ActionIcon>
								</Tooltip>
							);
						}
					)}
				</div>
			</div>
			<Divider className={styles.menuDivider} />
			<Menu.Item
				color='red'
				leftSection={<IconLogout size={16} />}
				onClick={handleLogout}
				className={[styles.menuItem, styles.logoutItem].join(' ')}
			>
				{t('sidebar.account.logout')}
			</Menu.Item>
		</Menu.Dropdown>
	);

	return (
		<>
			{collapsed ? (
				<div className={styles.compactShell}>
					<Menu
						opened={menuOpened}
						onClose={closeMenu}
						position='top-end'
						withArrow
						shadow='sm'
						width={220}
					>
						<Menu.Target>
							<UnstyledButton
								className={[
									styles.avatar,
									styles.avatarCompact,
									styles.avatarClickable,
									isImpersonating ? styles.avatarImpersonating : '',
									!isImpersonating && previewRole
										? styles.avatarPreviewingRole
										: '',
								].join(' ')}
								onClick={() => {
									if (menuOpened) {
										closeMenu();
										return;
									}
									openMenu();
								}}
								aria-label={t('sidebar.account.menu')}
							>
								{initials}
								{isImpersonating ? (
									<div className={styles.impersonationIndicator}>
										<IconShield size={10} />
									</div>
								) : (
									previewRole && (
										<div className={styles.previewIndicator}>
											<IconEyeglass size={10} />
										</div>
									)
								)}
							</UnstyledButton>
						</Menu.Target>
						{menuDropdown}
					</Menu>

					{isImpersonating && (
						<Badge size='xs' variant='light' color='orange'>
							{t('userMenu.impersonationMode')}
						</Badge>
					)}
					{!isImpersonating && previewRole && (
						<Badge size='xs' variant='light' color='teal'>
							{t('userMenu.rolePreview.badge', {
								role: t(
									PREVIEW_ROLES.find((r) => r.key === previewRole)!.labelKey
								),
							})}
						</Badge>
					)}
				</div>
			) : (
				<Paper
					radius='lg'
					className={[styles.shell, styles.shellExpanded].join(' ')}
				>
					<Group
						gap='sm'
						wrap='nowrap'
						align='center'
						justify='space-between'
						className={styles.expandedShell}
					>
						<div
							className={[
								styles.avatar,
								isImpersonating ? styles.avatarImpersonating : '',
								!isImpersonating && previewRole
									? styles.avatarPreviewingRole
									: '',
							].join(' ')}
						>
							{initials}
							{isImpersonating ? (
								<div className={styles.impersonationIndicator}>
									<IconShield size={10} />
								</div>
							) : (
								previewRole && (
									<div className={styles.previewIndicator}>
										<IconEyeglass size={10} />
									</div>
								)
							)}
						</div>

						<Stack gap={1} className={styles.identity}>
							<Group gap={6} wrap='nowrap' align='center' justify='flex-start'>
								<Text size='sm' fw={600} className={styles.name}>
									{displayName}
								</Text>
								{isImpersonating && (
									<Badge size='xs' variant='light' color='orange'>
										{t('userMenu.impersonationMode')}
									</Badge>
								)}
								{!isImpersonating && previewRole && (
									<Badge size='xs' variant='light' color='teal'>
										{t('userMenu.rolePreview.badge', {
											role: t(
												PREVIEW_ROLES.find((r) => r.key === previewRole)!
													.labelKey
											),
										})}
									</Badge>
								)}
							</Group>
							<Text size='xs' c='dimmed' className={styles.subtitle}>
								{currentClientBadge || t('sidebar.account.title')}
							</Text>
						</Stack>

						<Menu
							opened={menuOpened}
							onClose={closeMenu}
							position='top-end'
							withArrow
							shadow='sm'
							width={220}
						>
							<Menu.Target>
								<Tooltip
									label={t('sidebar.account.menu')}
									position='left'
									withArrow
								>
									<ActionIcon
										variant='subtle'
										color='gray'
										size='sm'
										aria-label={t('sidebar.account.menu')}
										onClick={() => {
											if (menuOpened) {
												closeMenu();
												return;
											}
											openMenu();
										}}
									>
										<IconDotsVertical size={16} />
									</ActionIcon>
								</Tooltip>
							</Menu.Target>
							{menuDropdown}
						</Menu>
					</Group>
				</Paper>
			)}

			<ClientSwitcherModal opened={switcherOpened} onClose={closeSwitcher} />
			<AppChooserModal
				opened={chooserOpened}
				onClose={closeChooser}
				onChoose={handleAppChoose}
				apps={accessibleApps}
			/>
		</>
	);
};

export default UserMenu;

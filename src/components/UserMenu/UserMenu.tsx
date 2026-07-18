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
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { useIsQaAdmin } from '~/hooks/useIsQaAdmin';
import { useCurrentApp } from '~/hooks/useCurrentApp';
import { useAppTransitionStore } from '~/stores/appTransitionStore';
import { useColorSchemeStore } from '~/stores/colorSchemeStore';
import { getClientDisplayLabel } from '~/utils/clientDisplay';
import logout from '~/utils/logout';
import LanguagePicker from '../LanguagePicker';
import ClientSwitcherModal from '../ClientSwitcherModal';
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
	const isQaAdmin = useIsQaAdmin();
	const currentApp = useCurrentApp();
	const preference = useColorSchemeStore((s) => s.preference);
	const setPreference = useColorSchemeStore((s) => s.setPreference);
	const navigate = useNavigate();
	const [switcherOpened, { open: openSwitcher, close: closeSwitcher }] =
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

	// Instant, client-side jump between the QA app and Campaign management —
	// same token/client, so no backend call. Only rendered for QA-admins. The
	// transition overlay gives the switch a deliberate, screen-wide moment.
	const handleAppSwitch = () => {
		closeMenu();
		const target = currentApp === 'qa' ? 'ucxm' : 'qa';
		useAppTransitionStore.getState().start(target);
		navigate(target === 'qa' ? '/qa/dashboard' : '/');
	};

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
			{isQaAdmin && (
				<Menu.Item
					leftSection={<IconApps size={16} />}
					onClick={handleAppSwitch}
					className={styles.menuItem}
				>
					{t(
						currentApp === 'qa'
							? 'appSwitcher.switchToCampaign'
							: 'appSwitcher.switchToQa'
					)}
				</Menu.Item>
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
								{isImpersonating && (
									<div className={styles.impersonationIndicator}>
										<IconShield size={10} />
									</div>
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
							].join(' ')}
						>
							{initials}
							{isImpersonating && (
								<div className={styles.impersonationIndicator}>
									<IconShield size={10} />
								</div>
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
		</>
	);
};

export default UserMenu;

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
} from '@mantine/core';
import {
	IconLogout,
	IconDotsVertical,
	IconShield,
	IconSwitchHorizontal,
	IconUserCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import logout from '~/utils/logout';
import LanguagePicker from '../LanguagePicker';
import ClientSwitcherModal from '../ClientSwitcherModal';
import styles from './UserMenu.module.css';

interface UserMenuProps {
	collapsed?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ collapsed = false }) => {
	const { t } = useTranslation('common');
	const { user, targetClient } = useSessionStore();
	const { isImpersonating } = useImpersonationState();
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
		isImpersonating && targetClient ? targetClient.name : userFullName;
	const currentClientName =
		isImpersonating && targetClient
			? targetClient.name
			: user?.client?.name || '';
	const currentClientBadge = isImpersonating
		? t('userMenu.impersonationMode')
		: currentClientName;

	const initials =
		isImpersonating && targetClient
			? targetClient.name?.slice(0, 2).toUpperCase()
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

	const menuTrigger = (
		<Menu
			opened={menuOpened}
			position='top-end'
			withArrow
			shadow='md'
			width={220}
		>
			<Menu.Target>
				<Tooltip label={t('sidebar.account.menu')} position='left' withArrow>
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

			<Menu.Dropdown className={styles.menuDropdown}>
				<Menu.Item
					leftSection={<IconUserCircle size={16} />}
					onClick={handleProfileClick}
				>
					{t('sidebar.account.profile')}
				</Menu.Item>
				<Menu.Item
					leftSection={<IconSwitchHorizontal size={16} />}
					onClick={() => {
						closeMenu();
						openSwitcher();
					}}
				>
					{t('sidebar.account.switchClient')}
				</Menu.Item>
				<Menu.Label className={styles.menuLabel}>
					{t('sidebar.account.language')}
				</Menu.Label>
				<div className={styles.languageMenuRow}>
					<LanguagePicker size='xs' variant='subtle' withLabel />
				</div>
				<Divider />
				<Menu.Item
					color='red'
					leftSection={<IconLogout size={16} />}
					onClick={handleLogout}
				>
					{t('sidebar.account.logout')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);

	return (
		<>
			<Paper
				withBorder
				radius='lg'
				className={[
					styles.shell,
					collapsed ? styles.shellCollapsed : styles.shellExpanded,
				].join(' ')}
			>
				{collapsed ? (
					<Stack gap={6} align='center' className={styles.compactShell}>
						<div
							className={[
								styles.avatar,
								styles.avatarCompact,
								isImpersonating ? styles.avatarImpersonating : '',
							].join(' ')}
						>
							{initials}
							{isImpersonating && (
								<div className={styles.impersonationIndicator}>
									<IconShield size={12} />
								</div>
							)}
						</div>

						<Group
							gap={4}
							wrap='nowrap'
							align='center'
							justify='center'
							className={styles.compactMeta}
						>
							<Text size='xs' fw={700} className={styles.compactName}>
								{displayName}
							</Text>
							{isImpersonating && (
								<Badge size='xs' variant='light' color='orange'>
									{t('userMenu.impersonationMode')}
								</Badge>
							)}
						</Group>

						<Text size='xs' c='dimmed' className={styles.compactSubtitle}>
							{currentClientBadge || t('sidebar.account.title')}
						</Text>

						{menuTrigger}
					</Stack>
				) : (
					<Group
						justify='space-between'
						align='flex-start'
						gap='sm'
						wrap='nowrap'
					>
						<Group
							gap='sm'
							wrap='nowrap'
							align='flex-start'
							className={styles.identityWrap}
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
										<IconShield size={12} />
									</div>
								)}
							</div>

							<Stack gap={2} className={styles.identity}>
								<Group gap={6} wrap='nowrap' align='center'>
									<Text size='sm' fw={700} className={styles.name}>
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
						</Group>

						{menuTrigger}
					</Group>
				)}
			</Paper>

			<ClientSwitcherModal opened={switcherOpened} onClose={closeSwitcher} />
		</>
	);
};

export default UserMenu;

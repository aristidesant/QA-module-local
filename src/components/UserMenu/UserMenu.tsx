import { Menu, Tooltip, Divider } from '@mantine/core';
import {
	IconChevronDown,
	IconLogout,
	IconShield,
	IconUser,
	IconCheckupList,
	IconCategory,
	IconTarget,
	IconDatabase,
	IconSettings,
	IconLibrary,
	IconTools,
	IconPhoneOff,
} from '@tabler/icons-react';
import styles from './UserMenu.module.css';
import { useNavigate } from 'react-router';
import logout from '~/utils/logout';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';

export const UserMenu: React.FC = () => {
	const { user, targetClient } = useSessionStore();
	const { isImpersonating } = useImpersonationState();
	const navigate = useNavigate();

	// Show target client name when impersonating, otherwise user's username
	const displayName =
		isImpersonating && targetClient ? targetClient.name : user?.username;
	const displayEmail =
		isImpersonating && targetClient ? 'Impersonated Client' : user?.email;
	const initials = displayName?.slice(0, 2).toUpperCase();

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

	// Organized maintenance categories
	const maintenanceCategories = [
		{
			category: 'Campaign Management',
			items: [
				{
					label: 'Outcomes',
					icon: <IconCheckupList size={16} />,
					path: '/outcomes',
				},
				{
					label: 'Categories',
					icon: <IconCategory size={16} />,
					path: '/campaign-categories',
				},
				{
					label: 'Objectives',
					icon: <IconTarget size={16} />,
					path: '/campaign-objectives',
				},
				{
					label: 'Schemas',
					icon: <IconDatabase size={16} />,
					path: '/campaign-schemas',
				},
			],
		},
		{
			category: 'Configuration',
			items: [
				{
					label: 'Client Configs',
					icon: <IconSettings size={16} />,
					path: '/client-configs',
				},
				{
					label: 'Knowledge Bases',
					icon: <IconLibrary size={16} />,
					path: '/knowledge-bases',
				},
				{
					label: 'Do Not Call',
					icon: <IconPhoneOff size={16} />,
					path: '/do-not-call',
				},
			],
		},
		{
			category: 'Tools & Resources',
			items: [
				{
					label: 'Tools',
					icon: <IconTools size={16} />,
					path: '/tools',
				},
				{
					label: 'Prompter',
					icon: <IconLibrary size={16} />,
					path: '/prompter',
				},
			],
		},
	];

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
					<div className={styles.impersonationSection}>
						<div className={styles.impersonationHeader}>
							<IconShield size={18} />
							<div>
								<div className={styles.impersonationTitle}>
									Impersonation Mode
								</div>
								<div className={styles.impersonationSubtitle}>
									You are impersonating a client
								</div>
							</div>
						</div>
						<div className={styles.impersonationMessage}>
							Use "Return to Master Client" to exit
						</div>
					</div>
				) : (
					<>
						<Menu.Item
							onClick={handleProfileClick}
							leftSection={<IconUser size={16} />}
							className={styles.profileItem}
						>
							Profile
						</Menu.Item>
						<Divider />

						{maintenanceCategories.map((categoryGroup, idx) => (
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
								{idx < maintenanceCategories.length - 1 && <Divider my='xs' />}
							</div>
						))}

						<Divider />
						<Menu.Item
							color='red'
							onClick={handleLogout}
							disabled={fetcher.state !== 'idle'}
							leftSection={<IconLogout size={16} />}
							className={styles.logoutItem}
						>
							{fetcher.state === 'idle' ? 'Logout' : 'Logging out...'}
						</Menu.Item>
					</>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};

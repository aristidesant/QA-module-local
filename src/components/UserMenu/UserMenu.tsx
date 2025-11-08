import { Menu, Tooltip, Divider } from '@mantine/core';
import {
	IconChevronDown,
	IconLogout,
	IconShield,
	IconUser,
	IconSettings,
	IconTools,
	IconLibrary,
	IconUsers,
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

	// Organized maintenance categories
	const maintenanceCategories = [
		{
			category: 'Campaign Management',
			items: [
				{
					label: 'Campaign Management',
					icon: <IconSettings size={16} />,
					path: '/campaign-management',
				},
			],
		},
		{
			category: 'Configuration',
			items: [
				{
					label: 'Configurations',
					icon: <IconSettings size={16} />,
					path: '/configurations/client-configs',
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

	const normalMaintenanceCategories = maintenanceCategories.map((category) => {
		if (category.category === 'Configuration') {
			return {
				...category,
				items: [
					...category.items,
					{
						label: 'Users',
						icon: <IconUsers size={16} />,
						path: '/users',
					},
				],
			};
		}

		return category;
	});

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

						{normalMaintenanceCategories.map((categoryGroup, idx) => (
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
								{idx < normalMaintenanceCategories.length - 1 && (
									<Divider my='xs' />
								)}
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

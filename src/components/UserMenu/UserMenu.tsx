import { Menu, Badge } from '@mantine/core';
import { IconChevronDown, IconLogout, IconShield } from '@tabler/icons-react';
import styles from './UserMenu.module.css';
// import { useNavigate } from "react-router";
import logout from '~/utils/logout';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';

export const UserMenu: React.FC = () => {
	const { user, targetClient } = useSessionStore();
	const { isImpersonating } = useImpersonationState();

	// Show target client name when impersonating, otherwise user's username
	const displayName =
		isImpersonating && targetClient ? targetClient.name : user?.username;
	const displayEmail =
		isImpersonating && targetClient ? 'Impersonated Client' : user?.email;
	const initials = displayName?.slice(0, 2).toUpperCase();

	// const navigate = useNavigate();

	const handleLogout = () => {
		// Use centralized logout utility
		logout();
	};

	const fetcher = { state: 'idle' } as const;

	return (
		<Menu shadow='md' width={180} position='bottom-end'>
			<Menu.Target>
				<div
					className={styles.userMenu}
					tabIndex={0}
					role='button'
					aria-label='User menu'
				>
					<div className={styles.avatar}>{initials}</div>
					<div className={styles.userInfo}>
						<span className={styles.name}>
							{displayName}
							{isImpersonating && (
								<Badge
									size='xs'
									color='orange'
									variant='filled'
									className={styles.impersonationBadge}
								>
									<IconShield size={10} />
									Impersonating
								</Badge>
							)}
						</span>
						<span className={styles.role}>{displayEmail}</span>
					</div>
					<span className={styles.chevron}>
						<IconChevronDown size={18} />
					</span>
				</div>
			</Menu.Target>
			<Menu.Dropdown>
				{isImpersonating ? (
					<>
						<Menu.Item disabled>
							<IconShield size={14} />
							Impersonation Mode
						</Menu.Item>
						<Menu.Item disabled>
							Use "Return to Master Client" to exit
						</Menu.Item>
					</>
				) : (
					<>
						<Menu.Item>Profile</Menu.Item>
						<Menu.Item>Settings</Menu.Item>
						<Menu.Divider />
						<Menu.Item
							color='red'
							onClick={handleLogout}
							disabled={fetcher.state !== 'idle'}
							leftSection={<IconLogout size={14} />}
						>
							{fetcher.state === 'idle' ? 'Logout' : 'Logging out...'}
						</Menu.Item>
					</>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};

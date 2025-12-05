import { IconBell } from '@tabler/icons-react';
import { ActionIcon, Divider, Text } from '@mantine/core';
import UserMenu from '../UserMenu';
import { useSessionStore } from '~/stores/sessionStore';
import styles from './Header.module.css';

export const Header: React.FC = () => {
	const { user } = useSessionStore();
	const client = user?.client || null;

	return (
		<header className={styles.header}>
			<div className={styles.headerContent}>
				<div className={styles.headerLeft}>
					{client && (
						<div className={styles.clientBadge} title={client.name}>
							<div className={styles.clientAvatar}>
								{client.name?.slice(0, 2).toUpperCase()}
							</div>
							<div className={styles.clientInfo}>
								<Text size='sm' fw={700} className={styles.clientName}>
									{client.name}
								</Text>
							</div>
						</div>
					)}
				</div>
				<div className={styles.headerRight}>
					{/* client badge moved to left */}
					<ActionIcon radius={'xl'} size={'lg'} variant='subtle'>
						<IconBell />
					</ActionIcon>
					<Divider orientation='vertical' />
					<UserMenu />
				</div>
			</div>
		</header>
	);
};

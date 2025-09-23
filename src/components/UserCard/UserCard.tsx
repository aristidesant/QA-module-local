// UserCard.tsx
import React from 'react';
import { Avatar, Button, Group, Text, Paper } from '@mantine/core';
import styles from './UserCard.module.css';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import logout from '~/utils/logout';

export const UserCard: React.FC = () => {
	const { user, targetClient } = useSessionStore();
	const { isImpersonating } = useImpersonationState();

	// Show target client info when impersonating, otherwise user info
	const displayName =
		isImpersonating && targetClient
			? targetClient.name
			: user?.username || 'User';
	const displayEmail =
		isImpersonating && targetClient ? 'Impersonated Client' : user?.email || '';

	const handleLogout = () => {
		logout();
	};

	if (!user && !isImpersonating) return null;

	return (
		<Paper className={styles.userCard} shadow='xs' p='md' radius='md'>
			<Group>
				<Avatar src={undefined} alt={displayName} radius='xl' size='lg'>
					{displayName[0]}
				</Avatar>
				<div>
					<Text size='sm' fw={500}>
						{displayName}
					</Text>
					<Text size='xs' color='dimmed'>
						{displayEmail}
					</Text>
				</div>
			</Group>
			<Button
				variant='light'
				color='red'
				fullWidth
				mt='md'
				onClick={handleLogout}
			>
				Logout
			</Button>
		</Paper>
	);
};

import React from 'react';
import { Paper, Text, Group, Badge, Button } from '@mantine/core';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';

export const DebugPanel: React.FC = () => {
	const store = useSessionStore();
	const impersonationState = useImpersonationState();

	// Only show in development
	if (import.meta.env.PROD) return null;

	return (
		<Paper
			style={{
				position: 'fixed',
				top: 10,
				right: 10,
				zIndex: 9999,
				padding: 16,
				backgroundColor: '#f8f9fa',
				border: '1px solid #dee2e6',
				maxWidth: 300,
			}}
		>
			<Text size='xs' fw={600} mb={8}>
				🔍 Session Debug Panel
			</Text>

			<Group gap={4} mb={4}>
				<Text size='xs'>User:</Text>
				<Badge color={store.user ? 'green' : 'red'} size='xs'>
					{store.user ? store.user.username : 'None'}
				</Badge>
			</Group>

			<Group gap={4} mb={4}>
				<Text size='xs'>Token:</Text>
				<Badge color={store.token ? 'green' : 'red'} size='xs'>
					{store.token ? `${store.token.substring(0, 10)}...` : 'None'}
				</Badge>
			</Group>

			<Group gap={4} mb={4}>
				<Text size='xs'>Target Client:</Text>
				<Badge color={store.targetClient ? 'orange' : 'gray'} size='xs'>
					{store.targetClient ? store.targetClient.name : 'None'}
				</Badge>
			</Group>

			<Group gap={4} mb={4}>
				<Text size='xs'>Impersonating:</Text>
				<Badge
					color={impersonationState.isImpersonating ? 'orange' : 'gray'}
					size='xs'
				>
					{impersonationState.isImpersonating ? 'Yes' : 'No'}
				</Badge>
			</Group>

			<Group gap={4} mb={8}>
				<Text size='xs'>Hydrated:</Text>
				<Badge color={store._hasHydrated ? 'green' : 'red'} size='xs'>
					{store._hasHydrated ? 'Yes' : 'No'}
				</Badge>
			</Group>

			<Button
				size='xs'
				variant='light'
				onClick={() => {
					console.group('🔍 Manual Debug State');
					console.log('Store:', store);
					console.log('Impersonation State:', impersonationState);
					console.log(
						'localStorage accessToken:',
						window.localStorage.getItem('accessToken')?.substring(0, 20) + '...'
					);
					console.log(
						'localStorage session-storage:',
						window.localStorage.getItem('session-storage')?.substring(0, 50) +
							'...'
					);
					console.groupEnd();
				}}
			>
				Log State
			</Button>
		</Paper>
	);
};

export default DebugPanel;

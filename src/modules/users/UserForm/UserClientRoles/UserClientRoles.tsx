import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Badge,
	Checkbox,
	Loader,
	ScrollArea,
	Stack,
	Text,
} from '@mantine/core';
import { IconBuilding } from '@tabler/icons-react';
import { useGetAllClients } from '~/queries/clientQueries';
import { useGetAllRoles } from '~/queries/roleQueries';
import type { UserRoleModel } from '~/models/UserModels';
import classes from './UserClientRoles.module.css';

interface ClientRoleEntry {
	clientId: number;
	roleIds: number[];
}

interface UserClientRolesProps {
	value: UserRoleModel[];
	onChange: (roles: UserRoleModel[]) => void;
	disabled?: boolean;
	userId?: number;
}

const UserClientRoles: React.FC<UserClientRolesProps> = ({
	value,
	onChange,
	disabled = false,
	userId,
}) => {
	const { data: clients = [], isLoading: isClientsLoading } =
		useGetAllClients();
	const { data: roles = [], isLoading: isRolesLoading } = useGetAllRoles();
	const [activeClientId, setActiveClientId] = useState<number | null>(null);
	const derivedUserId = useMemo(
		() => userId ?? value.find((entry) => entry.userId)?.userId ?? 0,
		[userId, value]
	);

	// Group current roles by client for quick lookups
	const clientRoleEntries = useMemo<ClientRoleEntry[]>(() => {
		const grouped = new Map<number, number[]>();
		value.forEach((userRole) => {
			const existing = grouped.get(userRole.clientId) || [];
			existing.push(userRole.roleId);
			grouped.set(userRole.clientId, existing);
		});
		return Array.from(grouped.entries()).map(([clientId, roleIds]) => ({
			clientId,
			roleIds,
		}));
	}, [value]);

	// Set initial active client when data changes
	useEffect(() => {
		if (clients.length === 0) {
			setActiveClientId(null);
			return;
		}
		if (activeClientId === null) {
			const preferredClientId =
				clientRoleEntries.find((entry) =>
					clients.some((client) => client.id === entry.clientId)
				)?.clientId ?? clients[0].id;
			setActiveClientId(preferredClientId);
			return;
		}
		const existsInClients = clients.some(
			(client) => client.id === activeClientId
		);
		if (!existsInClients) {
			setActiveClientId(clients[0].id);
		}
	}, [activeClientId, clientRoleEntries, clients]);

	// Toggle a role for the active client
	const handleRoleToggle = useCallback(
		(roleId: number) => {
			if (activeClientId === null) return;

			const currentRoles = clientRoleEntries.find(
				(entry) => entry.clientId === activeClientId
			)?.roleIds;

			const updatedRoleIds = new Set(currentRoles ?? []);
			if (updatedRoleIds.has(roleId)) {
				updatedRoleIds.delete(roleId);
			} else {
				updatedRoleIds.add(roleId);
			}

			const preserved = value.filter(
				(role) => role.clientId !== activeClientId
			);
			const nextRoles: UserRoleModel[] = [
				...preserved,
				...Array.from(updatedRoleIds).map((updatedRoleId) => {
					const existingRole = value.find(
						(role) =>
							role.clientId === activeClientId && role.roleId === updatedRoleId
					);
					return {
						id: existingRole?.id,
						userId: existingRole?.userId ?? derivedUserId,
						clientId: activeClientId,
						roleId: updatedRoleId,
					};
				}),
			];

			onChange(nextRoles);
		},
		[activeClientId, clientRoleEntries, derivedUserId, onChange, value]
	);

	// Get client name by ID
	const getClientName = useCallback(
		(clientId: number) => {
			const client = clients.find((c) => c.id === clientId);
			return client?.name ?? `Client #${clientId}`;
		},
		[clients]
	);

	// Get role count for a client
	const getRoleCount = useCallback(
		(clientId: number) => {
			const entry = clientRoleEntries.find((e) => e.clientId === clientId);
			return entry?.roleIds.length ?? 0;
		},
		[clientRoleEntries]
	);

	// Get current client's role IDs
	const activeClientRoleIds = useMemo(() => {
		if (activeClientId === null) return new Set<number>();
		const entry = clientRoleEntries.find((e) => e.clientId === activeClientId);
		return new Set(entry?.roleIds ?? []);
	}, [activeClientId, clientRoleEntries]);

	const isLoading = isClientsLoading || isRolesLoading;

	const activeClientName = useMemo(() => {
		if (activeClientId === null) return '';
		return getClientName(activeClientId);
	}, [activeClientId, getClientName]);

	return (
		<div className={classes.container}>
			<div className={classes.clientSidebar}>
				<div className={classes.clientSidebarHeader}>
					<Text className={classes.sidebarTitle}>Clients</Text>
					<Text className={classes.sidebarDescription}>
						Select a client to assign roles
					</Text>
				</div>
				<ScrollArea
					type='never'
					offsetScrollbars
					className={classes.clientScroll}
				>
					<div className={classes.clientList}>
						{clients.map((client) => {
							const count = getRoleCount(client.id);
							const isActive = client.id === activeClientId;
							return (
								<button
									key={client.id}
									type='button'
									className={`${classes.clientTab} ${isActive ? classes.clientTabActive : ''}`}
									onClick={() => setActiveClientId(client.id)}
									disabled={disabled}
								>
									<span className={classes.clientTabLabel}>{client.name}</span>
									{count > 0 && (
										<Badge
											color='blue'
											variant={isActive ? 'filled' : 'light'}
											size='xs'
											className={classes.clientCount}
										>
											{count}
										</Badge>
									)}
								</button>
							);
						})}
					</div>
				</ScrollArea>
				{clients.length === 0 && !isLoading && (
					<div className={classes.emptyStateInline}>
						<IconBuilding size={16} />
						<Text size='xs' c='dimmed'>
							No clients available
						</Text>
					</div>
				)}
			</div>

			<div className={classes.rolesPanel}>
				{activeClientId !== null && (
					<>
						<div className={classes.rolesPanelHeader}>
							<div className={classes.rolesPanelHeaderLeft}>
								<Text className={classes.rolesPanelTitle}>
									{activeClientName}
								</Text>
								<Text className={classes.rolesPanelCount}>
									{activeClientRoleIds.size} of {roles.length} roles assigned
								</Text>
							</div>
							<Badge variant='light' color='gray' size='xs'>
								{roles.length} total roles
							</Badge>
						</div>

						{isLoading ? (
							<div className={classes.loadingState}>
								<Loader size='sm' />
								<Text size='xs' c='dimmed'>
									Loading assignments
								</Text>
							</div>
						) : (
							<>
								<div className={classes.rolesGrid}>
									{roles.map((role) => {
										const isChecked = activeClientRoleIds.has(role.id);
										return (
											<div
												key={role.id}
												className={`${classes.roleItem} ${isChecked ? classes.roleItemActive : ''}`}
											>
												<Checkbox
													label={role.name}
													size='xs'
													checked={isChecked}
													onChange={() => handleRoleToggle(role.id)}
													disabled={disabled}
													className={classes.roleCheckbox}
												/>
											</div>
										);
									})}
								</div>
								{roles.length === 0 && (
									<Text size='xs' c='dimmed' ta='center' py='sm'>
										No roles available in the system.
									</Text>
								)}
							</>
						)}
					</>
				)}
				{activeClientId === null && (
					<Stack align='center' gap='xs' className={classes.emptyState}>
						<div className={classes.emptyStateIcon}>
							<IconBuilding size={28} stroke={1.4} />
						</div>
						<Text size='sm' c='dimmed'>
							Client and role assignments will appear here once available.
						</Text>
					</Stack>
				)}
			</div>
		</div>
	);
};

export default UserClientRoles;

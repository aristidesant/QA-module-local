import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Badge,
	Checkbox,
	Loader,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	UnstyledButton,
	Avatar,
} from '@mantine/core';
import {
	IconBuilding,
	IconCheck,
	IconSearch,
	IconShieldLock,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useGetAllClients } from '~/queries/clientQueries';
import { useGetAllRoles } from '~/queries/roleQueries';
import type { UserRoleModel } from '~/models/UserModels';
import {
	getClientDisplayLabel,
	getClientSecondaryLabel,
} from '~/utils/clientDisplay';
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
	const { t } = useTranslation('users');
	const { data: clients = [], isLoading: isClientsLoading } =
		useGetAllClients();
	const { data: roles = [], isLoading: isRolesLoading } = useGetAllRoles();
	const [activeClientId, setActiveClientId] = useState<number | null>(null);
	const [search, setSearch] = useState('');

	const derivedUserId = useMemo(
		() => userId ?? value.find((entry) => entry.userId)?.userId ?? 0,
		[userId, value]
	);

	const filteredRoles = useMemo(
		() => roles.filter((role) => role.isActive),
		[roles]
	);

	const filteredClients = useMemo(() => {
		if (!search) return clients;
		const query = search.toLowerCase();
		return clients.filter((client) => {
			return (
				getClientDisplayLabel(client).toLowerCase().includes(query) ||
				client.name.toLowerCase().includes(query) ||
				client.alias?.toLowerCase().includes(query)
			);
		});
	}, [clients, search]);

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
		if (filteredClients.length === 0) {
			// Don't clear activeClientId if just filtered out,
			// but we might want to select the first filtered if none is active
			return;
		}
		if (activeClientId === null) {
			const preferredClientId =
				clientRoleEntries.find((entry) =>
					filteredClients.some((client) => client.id === entry.clientId)
				)?.clientId ?? filteredClients[0].id;
			setActiveClientId(preferredClientId);
			return;
		}
	}, [activeClientId, clientRoleEntries, filteredClients]);

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
			return (
				(client ? getClientDisplayLabel(client) : null) ??
				t('clientRoles.fallbackClientName', { id: clientId })
			);
		},
		[clients, t]
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
					<Text size='xs' className={classes.sidebarTitle}>
						{t('clientRoles.sidebar.title')}
					</Text>

					<div className={classes.searchContainer}>
						<TextInput
							size='sm'
							placeholder={t('clientRoles.sidebar.searchPlaceholder')}
							value={search}
							onChange={(e) => setSearch(e.currentTarget.value)}
							leftSection={<IconSearch size={14} />}
							disabled={disabled || clients.length === 0}
						/>
					</div>
				</div>
				<ScrollArea
					type='auto'
					offsetScrollbars
					className={classes.clientScroll}
				>
					<div className={classes.clientList}>
						{filteredClients.map((client) => {
							const count = getRoleCount(client.id);
							const isActive = client.id === activeClientId;
							const secondaryLabel = getClientSecondaryLabel(client);
							return (
								<UnstyledButton
									key={client.id}
									className={`${classes.clientTab} ${isActive ? classes.clientTabActive : ''}`}
									onClick={() => setActiveClientId(client.id)}
									disabled={disabled}
								>
									<div className={classes.clientTabContent}>
										<Avatar
											size='sm'
											radius='sm'
											color={isActive ? 'blue' : 'gray'}
											variant={isActive ? 'filled' : 'light'}
											className={classes.clientAvatar}
										>
											<IconBuilding size={14} />
										</Avatar>
										<div className={classes.clientTabText}>
											<Text size='sm' className={classes.clientTabLabel}>
												{getClientDisplayLabel(client)}
											</Text>
											{secondaryLabel && (
												<Text size='xs' className={classes.clientTabSecondary}>
													{secondaryLabel}
												</Text>
											)}
										</div>
									</div>
									{isActive && (
										<IconCheck size={18} className={classes.activeIcon} />
									)}
									{!isActive && count > 0 && (
										<Badge
											color='gray'
											variant='light'
											size='sm'
											className={classes.clientCount}
										>
											{count}
										</Badge>
									)}
								</UnstyledButton>
							);
						})}
						{filteredClients.length === 0 && !isLoading && (
							<div className={classes.emptyStateInline}>
								<IconSearch
									size={24}
									stroke={1.5}
									color='var(--mantine-color-gray-4)'
								/>
								<Text size='sm' fw={500} c='dimmed'>
									{t('clientRoles.sidebar.emptyClients')}
								</Text>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>

			<div className={classes.rolesPanel}>
				{activeClientId !== null && (
					<>
						<div className={classes.rolesPanelHeader}>
							<div className={classes.rolesPanelHeaderLeft}>
								<Text size='xl' className={classes.rolesPanelTitle}>
									{activeClientName}
								</Text>
								<Text size='xs' className={classes.rolesPanelCount}>
									{t('clientRoles.panel.assignedCount', {
										assigned: activeClientRoleIds.size,
										total: roles.length,
									})}
								</Text>
							</div>
							<div className={classes.rolesPanelTotal}>
								<Text size='xl' fw={700} ta='right' lh={1.2}>
									{roles.length}
								</Text>
								<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
									{t('clientRoles.panel.totalRolesLabel')}
								</Text>
							</div>
						</div>

						<div className={classes.rolesPanelBody}>
							{isLoading ? (
								<div className={classes.loadingState}>
									<Loader size='sm' />
									<Text size='sm' c='dimmed' fw={500}>
										{t('clientRoles.panel.loading')}
									</Text>
								</div>
							) : (
								<>
									<div className={classes.rolesGrid}>
										{filteredRoles.map((role) => {
											const isChecked = activeClientRoleIds.has(role.id);
											const roleDescription =
												role.description?.trim() ||
												t('clientRoles.panel.noDescription');
											return (
												<Checkbox
													key={role.id}
													size='md'
													checked={isChecked}
													label={role.name}
													description={roleDescription}
													onChange={() => handleRoleToggle(role.id)}
													disabled={disabled}
													className={`${classes.roleItem} ${isChecked ? classes.roleItemActive : ''}`}
													classNames={{
														body: classes.roleCheckboxBody,
														input: classes.roleCheckboxInput,
														label: classes.roleCheckboxLabel,
														description: classes.roleCheckboxDescription,
													}}
												/>
											);
										})}
									</div>
									{roles.length === 0 && (
										<Text
											size='sm'
											c='dimmed'
											ta='center'
											className={classes.rolesEmptyState}
										>
											{t('clientRoles.panel.emptyRoles')}
										</Text>
									)}
								</>
							)}
						</div>
					</>
				)}
				{activeClientId === null && (
					<Stack align='center' gap='xs' className={classes.emptyState}>
						<div className={classes.emptyStateIcon}>
							<IconShieldLock size={32} stroke={1.5} />
						</div>
						<Stack gap='xs' align='center'>
							<Text size='sm' fw={600} c='gray.8'>
								{t('clientRoles.panel.emptyStateTitle', {
									defaultValue: 'Select a Client',
								})}
							</Text>
							<Text
								size='xs'
								c='dimmed'
								ta='center'
								className={classes.emptyStateDescription}
							>
								{t('clientRoles.panel.emptyState')}
							</Text>
						</Stack>
					</Stack>
				)}
			</div>
		</div>
	);
};

export default UserClientRoles;

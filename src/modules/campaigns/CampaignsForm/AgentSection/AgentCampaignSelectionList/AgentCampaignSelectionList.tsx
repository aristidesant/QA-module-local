import {
	Alert,
	ActionIcon,
	Avatar,
	Badge,
	Button,
	Card,
	Group,
	Menu,
	Skeleton,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { isAxiosError } from 'axios';
import {
	IconAlertCircle,
	IconDotsVertical,
	IconInfoCircle,
	IconPlus,
	IconRefresh,
	IconTrash,
} from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import { useCampaignId } from '../../../campaignFormFunctions';
import AgentCampaignAdd from '../AgentCampaignAdd';
import SyncElevenLabsAgentModal, {
	SYNC_ELEVENLABS_AGENT_MODAL_ID,
} from '../SyncElevenLabsAgentModal';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { useDeleteAgent } from '~/queries/agentQueries';
import type { CampaignAgent } from '~/models/CampaignAgentModel';
import classes from './AgentCampaignSelectionList.module.css';

const AVATAR_COLORS = [
	'blue',
	'teal',
	'cyan',
	'green',
	'lime',
	'yellow',
	'orange',
	'red',
] as const;

const hashString = (value: string) => {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}
	return Math.abs(hash);
};

const getInitials = (value: string) => {
	const normalized = value.trim().replace(/\s+/g, ' ');
	if (!normalized) return 'A';

	const initials = normalized
		.split(' ')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase())
		.join('');

	return initials.slice(0, 2) || normalized.slice(0, 2).toUpperCase() || 'A';
};

const getAvatarColor = (seed: string) => {
	const colorIndex = hashString(seed) % AVATAR_COLORS.length;
	return AVATAR_COLORS[colorIndex];
};

const getAgentName = (campaignAgent: CampaignAgent) =>
	campaignAgent.agent?.name || campaignAgent.agentId;

const formatDate = (value: string, language: string) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '-';
	}

	return new Intl.DateTimeFormat(language, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
};

const AgentCampaignSelectionList = () => {
	const { t, i18n } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const campaignId = useCampaignId();
	const navigate = useNavigate();
	const deleteAgentMutation = useDeleteAgent();
	const {
		data: campaignAgents,
		isLoading,
		isError,
		refetch,
	} = useGetCampaignAgents(campaignId || 0);

	const sortedCampaignAgents = useMemo(
		() =>
			[...(campaignAgents ?? [])].sort((a, b) => {
				if (a.isPrincipal !== b.isPrincipal) return a.isPrincipal ? -1 : 1;
				return a.agentType.localeCompare(b.agentType);
			}),
		[campaignAgents]
	);

	const assignedAgentIds = useMemo(
		() =>
			sortedCampaignAgents
				.map((agent) => agent.agent?.id)
				.filter((agentId): agentId is string => Boolean(agentId)),
		[sortedCampaignAgents]
	);

	const openAddAgentModal = () => {
		if (campaignId == null) {
			return;
		}

		modals.open({
			modalId: 'add-campaign-agent',
			title: t('form.agent.list.addAgentTitle'),
			centered: true,
			size: 1160,
			children: (
				<AgentCampaignAdd
					campaignId={campaignId}
					excludedAgents={assignedAgentIds}
				/>
			),
		});
	};

	const openSyncAgentModal = () => {
		if (campaignId == null) {
			return;
		}

		modals.open({
			modalId: SYNC_ELEVENLABS_AGENT_MODAL_ID,
			title: t('form.agent.sync.title'),
			centered: true,
			size: 'md',
			children: (
				<SyncElevenLabsAgentModal
					campaignId={campaignId}
					onSuccess={() => {
						refetch();
					}}
				/>
			),
		});
	};

	const handleOpenAgent = (campaignAgentId: number) => {
		if (campaignId == null) return;
		navigate(`/campaign/${campaignId}/agent/${campaignAgentId}`);
	};

	const getDeleteAgentErrorMessage = useCallback(
		(error: unknown) => {
			if (isAxiosError(error)) {
				const responseData = error.response?.data;
				const responseMessage =
					typeof responseData === 'object' &&
					responseData !== null &&
					typeof (responseData as { message?: unknown }).message === 'string'
						? (responseData as { message: string }).message
						: null;

				return responseMessage || t('form.agent.list.deleteAgent.error');
			}

			if (error instanceof Error && error.message.trim().length > 0) {
				return error.message;
			}

			return t('form.agent.list.deleteAgent.error');
		},
		[t]
	);

	const handleDeleteAgent = useCallback(
		(campaignAgent: CampaignAgent) => {
			const agentId = campaignAgent.agent?.id;
			if (campaignAgent.isPrincipal || !agentId) {
				return;
			}

			const agentName = getAgentName(campaignAgent);
			const confirmModalId = `delete-agent-${campaignAgent.id}`;

			modals.openConfirmModal({
				modalId: confirmModalId,
				title: t('form.agent.list.deleteAgent.title'),
				centered: true,
				labels: {
					confirm: t('form.agent.list.deleteAgent.confirm'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				confirmProps: { color: 'red' },
				children: (
					<Text size='sm'>
						{t('form.agent.list.deleteAgent.description', { name: agentName })}
					</Text>
				),
				onConfirm: async () => {
					try {
						await deleteAgentMutation.mutateAsync(agentId);
						await refetch();
						notifications.show({
							title: t('status.success', { ns: 'common' }),
							message: t('form.agent.list.deleteAgent.success', {
								name: agentName,
							}),
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: t('status.error', { ns: 'common' }),
							message: getDeleteAgentErrorMessage(error),
							color: 'red',
						});
					}
				},
			});
		},
		[deleteAgentMutation, getDeleteAgentErrorMessage, refetch, t]
	);

	const renderMenu = useCallback(
		(campaignAgent: CampaignAgent, disabled: boolean) => {
			if (disabled) {
				return (
					<Tooltip
						label={t('form.agent.list.actions.principalProtected')}
						withArrow
					>
						<span
							className={classes.actionWrapper}
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => event.stopPropagation()}
						>
							<ActionIcon
								variant='subtle'
								color='gray'
								disabled
								aria-label={t('form.agent.list.actions.menu')}
							>
								<IconDotsVertical size={16} />
							</ActionIcon>
						</span>
					</Tooltip>
				);
			}

			return (
				<div
					className={classes.actionWrapper}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
				>
					<Menu width={220} position='bottom-end' withinPortal>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								aria-label={t('form.agent.list.actions.menu')}
							>
								<IconDotsVertical size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>{t('form.agent.list.actions.menu')}</Menu.Label>
							<Menu.Item
								color='red'
								leftSection={<IconTrash size={14} />}
								onClick={() => handleDeleteAgent(campaignAgent)}
							>
								{t('form.agent.list.actions.deleteAgent')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</div>
			);
		},
		[handleDeleteAgent, t]
	);

	const columns = useMemo<BaseTableColumnDef<CampaignAgent>[]>(
		() => [
			{
				id: 'agent',
				header: t('form.agent.list.columns.agent'),
				size: 340,
				cell: ({ row }) => {
					const campaignAgent = row.original;
					const agentName = getAgentName(campaignAgent);
					const avatarSeed = campaignAgent.agent?.id || agentName;
					const initials = getInitials(agentName);
					const avatarColor = getAvatarColor(avatarSeed);

					return (
						<Group gap='sm' wrap='nowrap' className={classes.agentCell}>
							<Avatar
								radius='xl'
								size={34}
								color={avatarColor}
								className={classes.agentAvatar}
								aria-hidden='true'
							>
								{initials}
							</Avatar>
							<Stack gap={2} className={classes.agentCopy}>
								<Text size='sm' fw={700} className={classes.agentName}>
									{agentName}
								</Text>
								<Text size='xs' c='dimmed' className={classes.agentId}>
									{campaignAgent.agentId}
								</Text>
							</Stack>
						</Group>
					);
				},
			},
			{
				id: 'role',
				header: t('form.agent.list.columns.role'),
				size: 128,
				cell: ({ row }) => {
					const campaignAgent = row.original;
					const label = campaignAgent.isPrincipal
						? t('form.agent.selector.principal')
						: t('form.agent.selector.subagent');

					return (
						<Badge
							size='sm'
							variant={campaignAgent.isPrincipal ? 'filled' : 'light'}
							color={campaignAgent.isPrincipal ? 'green' : 'gray'}
							className={classes.roleBadge}
						>
							{label}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'agentType',
				header: t('form.agent.list.columns.direction'),
				size: 132,
				cell: ({ row }) => (
					<Badge size='sm' variant='light' color='blue'>
						{row.original.agentType}
					</Badge>
				),
			},
			{
				id: 'status',
				header: t('form.agent.list.columns.status'),
				size: 122,
				cell: ({ row }) => {
					const isActive = row.original.isActive;

					return (
						<span
							className={
								isActive ? classes.statusActive : classes.statusInactive
							}
						>
							<span className={classes.statusDot} />
							{t(
								isActive
									? 'form.agent.list.status.active'
									: 'form.agent.list.status.inactive'
							)}
						</span>
					);
				},
			},
			{
				id: 'language',
				header: t('form.agent.list.columns.language'),
				size: 144,
				cell: ({ row }) => {
					const language = row.original.agent?.language;

					return (
						<Text size='xs' className={classes.metaText}>
							{language || t('form.agent.list.noLanguage')}
						</Text>
					);
				},
			},
			{
				accessorKey: 'updatedAt',
				header: t('form.agent.list.columns.updated'),
				size: 148,
				cell: ({ row }) => (
					<Text size='xs' className={classes.metaText}>
						{formatDate(row.original.updatedAt, i18n.language)}
					</Text>
				),
			},
			{
				id: 'actions',
				header: t('form.agent.list.columns.actions'),
				size: 72,
				meta: {
					headerClassName: classes.actionsHeader,
					cellClassName: classes.actionsCell,
				},
				cell: ({ row }) => renderMenu(row.original, row.original.isPrincipal),
			},
		],
		[i18n.language, renderMenu, t]
	);

	if (!campaignId || isLoading) {
		return (
			<Stack gap='sm' className={classes.root}>
				<div
					className={classes.loadingTable}
					aria-label={t('form.agent.list.loading')}
				>
					<div className={classes.loadingHeader}>
						<Skeleton height={12} width='24%' />
						<Skeleton height={12} width='12%' />
						<Skeleton height={12} width='12%' />
						<Skeleton height={12} width='10%' />
					</div>
					{Array.from({ length: 4 }).map((_, index) => (
						<div className={classes.loadingRow} key={index}>
							<Group gap='sm' wrap='nowrap'>
								<Skeleton height={34} circle />
								<Stack gap={5}>
									<Skeleton height={12} width={150} />
									<Skeleton height={10} width={96} />
								</Stack>
							</Group>
							<Skeleton height={20} width={78} radius='xl' />
							<Skeleton height={20} width={82} radius='xl' />
							<Skeleton height={20} width={70} radius='xl' />
						</div>
					))}
				</div>
			</Stack>
		);
	}

	return (
		<Stack gap='sm' className={classes.root}>
			<Group justify='space-between' align='flex-start' gap='sm'>
				<Stack gap={4} className={classes.headerText}>
					<Text size='lg' fw={700}>
						{t('form.agent.list.title')}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('form.agent.list.description')}
					</Text>
				</Stack>
				<Group gap='xs' wrap='wrap' justify='flex-end'>
					<Button
						leftSection={<IconRefresh size={16} />}
						size='sm'
						variant='default'
						onClick={openSyncAgentModal}
					>
						{t('form.agent.list.syncAgent')}
					</Button>
					<Button
						leftSection={<IconPlus size={16} />}
						size='sm'
						variant='filled'
						color='green'
						onClick={openAddAgentModal}
					>
						{t('form.agent.list.addAgent')}
					</Button>
				</Group>
			</Group>

			{isError ? (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color='red'
					variant='light'
					withCloseButton={false}
				>
					<Stack gap={4}>
						<Text fw={600}>{t('form.agent.list.loadError')}</Text>
						<Text size='sm' c='dimmed'>
							{t('form.agent.list.loadErrorDesc')}
						</Text>
						<Button
							variant='outline'
							color='red'
							size='xs'
							onClick={() => refetch()}
						>
							{t('form.agent.list.tryAgain')}
						</Button>
					</Stack>
				</Alert>
			) : sortedCampaignAgents.length === 0 ? (
				<Card withBorder radius='lg' className={classes.emptyCard}>
					<EmptyState
						icon={<IconInfoCircle />}
						message={t('form.agent.list.noAgents')}
						description={t('form.agent.list.noAgentsDesc')}
					/>
				</Card>
			) : (
				<BaseTable<CampaignAgent>
					data={sortedCampaignAgents}
					columns={columns}
					getRowId={(campaignAgent) => campaignAgent.id}
					onRowClick={(campaignAgent) => handleOpenAgent(campaignAgent.id)}
					className={classes.agentTable}
					density='compact'
					getRowClassName={() => classes.clickableRow}
				/>
			)}
		</Stack>
	);
};

export default AgentCampaignSelectionList;

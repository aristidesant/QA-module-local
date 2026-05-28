import {
	Alert,
	ActionIcon,
	Avatar,
	Badge,
	Button,
	Card,
	Group,
	Menu,
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
import { useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import EmptyState from '~/components/EmptyState';
import { useCampaignId } from '../../../campaignFormFunctions';
import AgentCampaignAdd from '../AgentCampaignAdd';
import SyncElevenLabsAgentModal, {
	SYNC_ELEVENLABS_AGENT_MODAL_ID,
} from '../SyncElevenLabsAgentModal';
import {
	useDeleteCampaignAgent,
	useGetCampaignAgents,
} from '~/queries/campaignAgentsQueries';
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

const AgentCampaignSelectionList = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const campaignId = useCampaignId();
	const navigate = useNavigate();
	const deleteCampaignAgentMutation = useDeleteCampaignAgent();
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

	const featuredAgent = sortedCampaignAgents[0];
	const secondaryAgents = sortedCampaignAgents.slice(1);

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

	const getRemoveAgentErrorMessage = (error: unknown) => {
		if (isAxiosError(error)) {
			const responseData = error.response?.data;
			const responseMessage =
				typeof responseData === 'object' &&
				responseData !== null &&
				typeof (responseData as { message?: unknown }).message === 'string'
					? (responseData as { message: string }).message
					: null;

			return responseMessage || t('form.agent.list.removeRelation.error');
		}

		if (error instanceof Error && error.message.trim().length > 0) {
			return error.message;
		}

		return t('form.agent.list.removeRelation.error');
	};

	const handleRemoveAgentFromCampaign = (campaignAgent: CampaignAgent) => {
		if (campaignId == null || campaignAgent.isPrincipal) {
			return;
		}

		const agentName = getAgentName(campaignAgent);
		const confirmModalId = `remove-campaign-agent-${campaignAgent.id}`;

		modals.openConfirmModal({
			modalId: confirmModalId,
			title: t('form.agent.list.removeRelation.title'),
			centered: true,
			labels: {
				confirm: t('form.agent.list.removeRelation.confirm'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>
					{t('form.agent.list.removeRelation.description', {
						name: agentName,
					})}
				</Text>
			),
			onConfirm: async () => {
				try {
					await deleteCampaignAgentMutation.mutateAsync({
						campaignId,
						id: campaignAgent.id,
					});
					await refetch();
					notifications.show({
						title: t('status.success', { ns: 'common' }),
						message: t('form.agent.list.removeRelation.success', {
							name: agentName,
						}),
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: t('status.error', { ns: 'common' }),
						message: getRemoveAgentErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const handleCardKeyDown = (
		event: KeyboardEvent<HTMLElement>,
		campaignAgentId: number
	) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleOpenAgent(campaignAgentId);
		}
	};

	const renderMenu = (
		campaignAgent: CampaignAgent,
		disabled: boolean,
		isFeatured = false
	) => {
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
							className={isFeatured ? classes.featuredActionIcon : undefined}
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
							className={isFeatured ? classes.featuredActionIcon : undefined}
						>
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>{t('form.agent.list.actions.menu')}</Menu.Label>
						<Menu.Item
							color='red'
							leftSection={<IconTrash size={14} />}
							onClick={() => handleRemoveAgentFromCampaign(campaignAgent)}
						>
							{t('form.agent.list.actions.removeFromCampaign')}
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</div>
		);
	};

	const renderFeaturedAgent = (campaignAgent: CampaignAgent) => {
		const agentName = getAgentName(campaignAgent);
		const avatarSeed = campaignAgent.agent?.id || agentName;
		const initials = getInitials(agentName);
		const avatarColor = getAvatarColor(avatarSeed);

		return (
			<Card
				withBorder
				radius='lg'
				className={classes.featuredCard}
				onClick={() => handleOpenAgent(campaignAgent.id)}
				role='button'
				tabIndex={0}
				onKeyDown={(event) => handleCardKeyDown(event, campaignAgent.id)}
				aria-label={t('form.agent.list.openAgentAria', { name: agentName })}
			>
				<Group
					justify='space-between'
					align='flex-start'
					gap='md'
					wrap='nowrap'
				>
					<Group
						gap='md'
						wrap='nowrap'
						align='flex-start'
						className={classes.cardContent}
					>
						<Avatar
							radius='xl'
							size={52}
							color={avatarColor}
							className={classes.agentAvatar}
							aria-hidden='true'
						>
							{initials}
						</Avatar>
						<Stack gap={6} className={classes.featuredCopy}>
							<Group gap='xs' wrap='wrap'>
								<Badge size='sm' variant='light' color='green'>
									{t('form.agent.selector.principal')}
								</Badge>
								<Badge size='sm' variant='light' color='gray'>
									{campaignAgent.agentType}
								</Badge>
							</Group>
							<Text size='lg' fw={700} className={classes.agentName}>
								{agentName}
							</Text>
						</Stack>
					</Group>
					{renderMenu(campaignAgent, campaignAgent.isPrincipal, true)}
				</Group>
			</Card>
		);
	};

	const renderAgentRow = (campaignAgent: CampaignAgent) => {
		const agentName = getAgentName(campaignAgent);
		const avatarSeed = campaignAgent.agent?.id || agentName;
		const initials = getInitials(agentName);
		const avatarColor = getAvatarColor(avatarSeed);

		return (
			<div
				key={campaignAgent.id}
				className={classes.agentRow}
				role='button'
				tabIndex={0}
				onClick={() => handleOpenAgent(campaignAgent.id)}
				onKeyDown={(event) => handleCardKeyDown(event, campaignAgent.id)}
				aria-label={t('form.agent.list.openAgentAria', { name: agentName })}
			>
				<Group justify='space-between' align='center' gap='sm' wrap='nowrap'>
					<Group gap='sm' wrap='nowrap' className={classes.cardContent}>
						<Avatar
							radius='xl'
							size={40}
							color={avatarColor}
							className={classes.agentAvatar}
							aria-hidden='true'
						>
							{initials}
						</Avatar>
						<Stack gap={4} className={classes.rowCopy}>
							<Text size='sm' fw={700} className={classes.agentName}>
								{agentName}
							</Text>
							<Group gap='xs' wrap='wrap'>
								<Badge
									size='xs'
									variant='light'
									color={campaignAgent.isPrincipal ? 'green' : 'gray'}
								>
									{campaignAgent.isPrincipal
										? t('form.agent.selector.principal')
										: t('form.agent.selector.subagent')}
								</Badge>
								<Badge size='xs' variant='light' color='gray'>
									{campaignAgent.agentType}
								</Badge>
							</Group>
						</Stack>
					</Group>
					{renderMenu(campaignAgent, campaignAgent.isPrincipal)}
				</Group>
			</div>
		);
	};

	if (!campaignId || isLoading) {
		return (
			<Stack gap='sm'>
				<Card withBorder radius='lg' className={classes.loadingCard}>
					<Text size='sm' c='dimmed'>
						{t('form.agent.list.loading')}
					</Text>
				</Card>
				<Card withBorder radius='lg' className={classes.loadingCard}>
					<Text size='sm' c='dimmed'>
						{t('form.agent.list.loading')}
					</Text>
				</Card>
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
						size='xs'
						variant='default'
						onClick={openSyncAgentModal}
					>
						{t('form.agent.list.syncAgent')}
					</Button>
					<Button
						leftSection={<IconPlus size={16} />}
						size='xs'
						variant='light'
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
				<Stack gap='sm' className={classes.list}>
					{featuredAgent ? renderFeaturedAgent(featuredAgent) : null}
					{secondaryAgents.length > 0 ? (
						<Stack gap='xs' className={classes.secondaryList}>
							{secondaryAgents.map(renderAgentRow)}
						</Stack>
					) : null}
				</Stack>
			)}
		</Stack>
	);
};

export default AgentCampaignSelectionList;

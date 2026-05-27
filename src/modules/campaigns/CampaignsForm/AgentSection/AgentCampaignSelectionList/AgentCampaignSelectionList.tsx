import {
	Alert,
	Badge,
	Button,
	Card,
	Group,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertCircle,
	IconChevronRight,
	IconInfoCircle,
	IconPlus,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import EmptyState from '~/components/EmptyState';
import { useCampaignId } from '../../../campaignFormFunctions';
import AgentCampaignAdd from '../AgentCampaignAdd';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import type { CampaignAgent } from '~/models/CampaignAgentModel';
import classes from './AgentCampaignSelectionList.module.css';

const AgentCampaignSelectionList = () => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const campaignId = useCampaignId();
	const navigate = useNavigate();
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
			size: 'xl',
			children: (
				<AgentCampaignAdd
					campaignId={campaignId}
					excludedAgents={assignedAgentIds}
					onComplete={() => {
						refetch();
						modals.close('add-campaign-agent');
					}}
				/>
			),
		});
	};

	const handleOpenAgent = (campaignAgentId: number) => {
		if (campaignId == null) return;
		navigate(`/campaign/${campaignId}/agent/${campaignAgentId}`);
	};

	const renderAgentCard = (campaignAgent: CampaignAgent) => {
		const agentName = campaignAgent.agent?.name || campaignAgent.agentId;
		const agentLanguage = campaignAgent.agent?.language;

		return (
			<UnstyledButton
				key={campaignAgent.id}
				className={classes.agentCard}
				onClick={() => handleOpenAgent(campaignAgent.id)}
				aria-label={t('form.agent.list.openAgentAria', { name: agentName })}
			>
				<Group
					justify='space-between'
					align='flex-start'
					gap='sm'
					wrap='nowrap'
				>
					<Stack gap={6} className={classes.agentCardContent}>
						<Group gap='xs' align='center' wrap='wrap'>
							<Text size='sm' fw={700} className={classes.agentName}>
								{agentName}
							</Text>
						</Group>
						<Text size='xs' className={classes.agentSubtitle}>
							{agentLanguage
								? t('form.agent.list.language', { language: agentLanguage })
								: t('form.agent.list.noLanguage')}
						</Text>
						<Group gap='xs' className={classes.badgeGroup}>
							<Badge
								size='xs'
								variant='light'
								color={campaignAgent.isPrincipal ? 'green' : 'gray'}
							>
								{campaignAgent.isPrincipal
									? t('form.agent.selector.principal')
									: t('form.agent.selector.subagent')}
							</Badge>
							<Badge size='xs' variant='light' color='blue'>
								{campaignAgent.agentType}
							</Badge>
						</Group>
					</Stack>
					<IconChevronRight
						size={18}
						className={classes.chevron}
						aria-hidden='true'
					/>
				</Group>
			</UnstyledButton>
		);
	};

	if (!campaignId || isLoading) {
		return (
			<Stack gap='sm'>
				<Card withBorder radius='md' className={classes.loadingCard}>
					<Text size='sm' c='dimmed'>
						{t('form.agent.list.loading')}
					</Text>
				</Card>
				<Card withBorder radius='md' className={classes.loadingCard}>
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
				<Button
					leftSection={<IconPlus size={16} />}
					size='xs'
					variant='light'
					onClick={openAddAgentModal}
				>
					{t('form.agent.list.addAgent')}
				</Button>
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
				<Card withBorder radius='md' className={classes.emptyCard}>
					<EmptyState
						icon={<IconInfoCircle />}
						message={t('form.agent.list.noAgents')}
						description={t('form.agent.list.noAgentsDesc')}
					/>
				</Card>
			) : (
				<Stack gap='sm'>{sortedCampaignAgents.map(renderAgentCard)}</Stack>
			)}
		</Stack>
	);
};

export default AgentCampaignSelectionList;

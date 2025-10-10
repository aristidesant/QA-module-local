import React, { useMemo } from 'react';
import {
	Card,
	Avatar,
	Button,
	Menu,
	ActionIcon,
	Group,
	Text,
	LoadingOverlay,
	Badge,
	Stack,
} from '@mantine/core';
import { modals, openConfirmModal } from '@mantine/modals';
import { IconDots, IconTrash, IconPlus } from '@tabler/icons-react';
import AgentCampaignAdd from '../AgentCampaignAdd';
import classes from './AgentCampaignList.module.css';
import {
	useGetCampaignAgents,
	useDeleteCampaignAgent,
} from '~/queries/campaignAgentsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import AgentCampaignPreview from '../AgentCampaignPreview';

export const AgentCampaignList: React.FC = () => {
	const { selectedCampaign } = useCampaignsStore((state) => state);
	const { setRightComponent } = useCampaignsStore();
	const {
		data: campaignAgents,
		refetch,
		isLoading,
	} = useGetCampaignAgents(selectedCampaign?.id || 0);

	const deleteMutation = useDeleteCampaignAgent();

	// Get assigned agent IDs for exclusion when opening the selector
	const assignedAgentIds = Array.isArray(campaignAgents)
		? campaignAgents.map((agent) => agent.agent?.id).filter(Boolean)
		: [];

	const totalAgents = campaignAgents?.length ?? 0;

	const listSubtitle = useMemo(() => {
		if (totalAgents === 0) {
			return 'No agents are assigned to this campaign yet.';
		}

		if (totalAgents === 1) {
			return '1 agent is currently handling this campaign.';
		}

		return `${totalAgents} agents are collaborating on this campaign.`;
	}, [totalAgents]);

	const handleAddAgent = () => {
		if (selectedCampaign?.id == null) {
			console.error('No campaign selected');
			return;
		}

		modals.open({
			modalId: 'add-campaign-agent',
			title: 'Add Agent to Campaign',
			centered: true,
			size: 'xl',
			children: (
				<AgentCampaignAdd
					campaignId={selectedCampaign.id}
					excludedAgents={assignedAgentIds}
					onComplete={() => {
						refetch();
						modals.close('add-campaign-agent');
					}}
				/>
			),
		});
	};

	const handleDeleteAgent = (agentId: number) => {
		if (!selectedCampaign?.id) return;
		openConfirmModal({
			title: 'Remove Agent from Campaign',
			centered: true,
			children: (
				<Text size='sm'>
					Are you sure you want to remove this agent from the campaign? This
					action cannot be undone.
				</Text>
			),
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: () => {
				deleteMutation.mutate(
					{ campaignId: selectedCampaign.id, id: agentId },
					{
						onSuccess: () => {
							refetch();
						},
					}
				);
			},
		});
	};

	return (
		<section className={classes.wrapper}>
			<LoadingOverlay
				visible={isLoading}
				zIndex={100}
				overlayProps={{ radius: 'md', blur: 2 }}
			/>

			<Group
				justify='space-between'
				align='flex-end'
				className={classes.header}
			>
				<div>
					<Text className={classes.title} size='lg' fw={600}>
						Assigned Agents
					</Text>
					<Text className={classes.subtitle} color='dimmed' size='sm'>
						{listSubtitle}
					</Text>
				</div>
				<Button
					className={classes.addAgentBtn}
					leftSection={<IconPlus size={18} />}
					variant='light'
					color='blue'
					radius='md'
					onClick={handleAddAgent}
				>
					Add Agent
				</Button>
			</Group>

			{totalAgents === 0 && !isLoading ? (
				<Card withBorder radius='md' className={classes.emptyCard}>
					<Stack gap='xs'>
						<Text fw={500}>No agents assigned</Text>
						<Text size='sm' color='dimmed'>
							Start by connecting an agent to unlock campaign automations and
							voice coverage.
						</Text>
						<Button
							variant='light'
							color='blue'
							radius='md'
							leftSection={<IconPlus size={16} />}
							onClick={handleAddAgent}
						>
							Assign an agent
						</Button>
					</Stack>
				</Card>
			) : null}

			{campaignAgents?.map((campaignAgent) => {
				const agent = campaignAgent.agent;

				return (
					<Card
						className={classes.agentCard}
						key={campaignAgent.id}
						withBorder
						radius='md'
						onClick={() => {
							if (campaignAgent.agentId && selectedCampaign?.id) {
								setRightComponent?.(
									<AgentCampaignPreview
										agentId={campaignAgent.agentId}
										campaignAgentId={campaignAgent.id}
										campaignId={selectedCampaign.id}
									/>
								);
							}
						}}
					>
						<Group w='100%' justify='space-between' align='center'>
							<span className={classes.avatarStatus}>
								<Avatar
									radius='xl'
									size={32}
									name={agent?.name || 'Unknown'}
									color='initials'
									alt={agent?.name || 'Unknown'}
								/>
								<span
									className={
										agent?.status === 'ACTIVE'
											? classes.statusDot
											: `${classes.statusDot} ${classes.inactive}`
									}
									aria-label={
										agent?.status === 'ACTIVE' ? 'Active' : 'Inactive'
									}
								/>
							</span>
							<div
								style={{
									flex: 1,
									marginLeft: 'var(--mantine-spacing-sm)',
									marginRight: 'var(--mantine-spacing-sm)',
								}}
							>
								<Text
									size='sm'
									fw={500}
									style={{ wordBreak: 'break-word', lineHeight: 1.2 }}
								>
									{agent?.name || 'Unknown'}
								</Text>
								<Badge
									variant='light'
									color={agent?.status === 'ACTIVE' ? 'teal' : 'gray'}
									size='xs'
									style={{ marginTop: 4 }}
								>
									{agent?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
								</Badge>
							</div>
							<Menu shadow='md' width={140} position='bottom-end'>
								<Menu.Target>
									<ActionIcon
										variant='subtle'
										className={classes.menuIcon}
										aria-label='Agent actions'
										onClick={(event) => event.stopPropagation()}
									>
										<IconDots size={20} />
									</ActionIcon>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Item
										color='red'
										leftSection={<IconTrash size={16} />}
										onClick={(event) => {
											event.stopPropagation();
											handleDeleteAgent(campaignAgent.id);
										}}
										disabled={deleteMutation.isPending}
									>
										Remove
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
						</Group>
					</Card>
				);
			})}
		</section>
	);
};

export default AgentCampaignList;

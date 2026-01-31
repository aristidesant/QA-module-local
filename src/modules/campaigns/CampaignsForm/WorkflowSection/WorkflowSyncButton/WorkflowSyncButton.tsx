import {
	ActionIcon,
	Tooltip,
	Text,
	Stack,
	Radio,
	Group,
	Button,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconReload } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useSyncCampaignByAgent } from '~/queries/campaignsQueries';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';

export interface AgentInfo {
	agentId: string;
	agentName: string;
}

interface WorkflowSyncButtonProps {
	agents?: AgentInfo[];
	isLoading?: boolean;
	selectedAgentId?: string | null;
}

export const WorkflowSyncButton = ({
	agents: agentsProp,
	isLoading: isLoadingProp,
	selectedAgentId: selectedAgentIdProp,
}: WorkflowSyncButtonProps) => {
	const { t } = useTranslation('campaigns');
	const queryClient = useQueryClient();
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);
	const shouldFetchAgents = !agentsProp;
	const campaignId = selectedCampaign?.id;

	const { data: campaignAgents, isLoading } = useGetCampaignAgents(
		shouldFetchAgents ? campaignId || 0 : 0
	);
	const { mutateAsync: syncCampaign, isPending: isSyncing } =
		useSyncCampaignByAgent();
	const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

	const agents: AgentInfo[] = useMemo(
		() =>
			(agentsProp ??
				campaignAgents?.map((agent) => ({
					agentId: agent.agentId,
					agentName: agent.agent?.name || agent.agentId,
				}))) ||
			[],
		[agentsProp, campaignAgents]
	);
	const resolvedLoading = isLoadingProp ?? isLoading;
	const isExternalSelection = selectedAgentIdProp !== undefined;
	const resolvedSelectedAgentId = isExternalSelection
		? selectedAgentIdProp
		: selectedAgentId;

	const handleSync = () => {
		if (agents.length === 0) return;

		if (isExternalSelection) {
			const fallbackAgentId = agents.length === 1 ? agents[0].agentId : null;
			const agentId = resolvedSelectedAgentId || fallbackAgentId;
			if (!agentId) return;
			const agent = agents.find((item) => item.agentId === agentId);
			if (!agent) return;
			showConfirmModal(agent.agentId, agent.agentName);
			return;
		}

		if (agents.length === 1) {
			const agent = agents[0];
			showConfirmModal(agent.agentId, agent.agentName);
		} else {
			const modalId = 'select-agent-for-sync';
			modals.open({
				modalId,
				title: t('form.workflow.sync.selectAgentTitle'),
				children: (
					<Stack>
						<Text size='sm' mb='xs'>
							{t('form.workflow.sync.selectAgentDescription')}
						</Text>
						<Radio.Group
							value={selectedAgentId || ''}
							onChange={setSelectedAgentId}
						>
							<Stack gap='xs'>
								{agents.map((agent) => (
									<Radio
										key={agent.agentId}
										value={agent.agentId}
										label={agent.agentName}
									/>
								))}
							</Stack>
						</Radio.Group>
						<Group justify='flex-end' mt='md'>
							<Button
								variant='default'
								onClick={() => {
									setSelectedAgentId(null);
									modals.close(modalId);
								}}
							>
								{t('form.workflow.sync.cancelButton')}
							</Button>
							<Button
								disabled={!selectedAgentId}
								onClick={() => {
									if (selectedAgentId) {
										const agent = agents.find(
											(a) => a.agentId === selectedAgentId
										);
										if (agent) {
											modals.close(modalId);
											showConfirmModal(agent.agentId, agent.agentName);
										}
									}
									setSelectedAgentId(null);
								}}
							>
								{t('form.workflow.sync.continueButton')}
							</Button>
						</Group>
					</Stack>
				),
			});
		}
	};

	const showConfirmModal = (agentId: string, agentName: string) => {
		const confirmModalId = 'confirm-sync-workflow';
		modals.open({
			modalId: confirmModalId,
			title: t('form.workflow.sync.confirmTitle'),
			children: (
				<Stack>
					<Text size='sm'>
						{t('form.workflow.sync.confirmMessage', { agentName })}
					</Text>
					<Group justify='flex-end' mt='md'>
						<Button
							variant='default'
							onClick={() => modals.close(confirmModalId)}
							disabled={isSyncing}
						>
							{t('form.workflow.sync.cancelButton')}
						</Button>
						<Button
							color='orange'
							loading={isSyncing}
							onClick={async () => {
								try {
									const result = await syncCampaign(agentId);
									if (result?.id && campaignId) {
										await queryClient.invalidateQueries({
											queryKey: ['campaign', String(campaignId)],
										});
									}
									modals.close(confirmModalId);
									notifications.show({
										title: t('form.workflow.sync.successTitle'),
										message: t('form.workflow.sync.successMessage'),
										color: 'green',
									});
								} catch {
									notifications.show({
										title: t('form.workflow.sync.errorTitle'),
										message: t('form.workflow.sync.errorMessage'),
										color: 'red',
									});
								}
							}}
						>
							{t('form.workflow.sync.confirmButton')}
						</Button>
					</Group>
				</Stack>
			),
		});
	};

	const isDisabled =
		agents.length === 0 ||
		isSyncing ||
		resolvedLoading ||
		(isExternalSelection && agents.length > 1 && !resolvedSelectedAgentId);
	const tooltipLabel =
		isExternalSelection && agents.length > 1 && !resolvedSelectedAgentId
			? t('form.workflow.sync.selectAgentTooltip')
			: isDisabled
				? t('form.workflow.sync.noAgentsTooltip')
				: t('form.workflow.sync.tooltip');

	return (
		<Tooltip label={tooltipLabel} withArrow>
			<ActionIcon
				size='md'
				variant='subtle'
				onClick={handleSync}
				disabled={isDisabled}
				loading={isSyncing}
			>
				<IconReload size={18} />
			</ActionIcon>
		</Tooltip>
	);
};

export default WorkflowSyncButton;

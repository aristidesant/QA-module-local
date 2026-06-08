import {
	Alert,
	Button,
	Group,
	Modal,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCampaignId } from '~/modules/campaigns/campaignFormFunctions';
import { useGetCampaignAgentTransferTargets } from '~/queries/campaignAgentsQueries';

interface AgentTransferTargetModalProps {
	opened: boolean;
	currentAgentId?: string;
	onClose: () => void;
	onConfirm: (agentId: string) => void;
}

const AgentTransferTargetModal = ({
	opened,
	currentAgentId,
	onClose,
	onConfirm,
}: AgentTransferTargetModalProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const campaignId = useCampaignId();
	const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
	const {
		data: campaignAgents,
		isError,
		isLoading,
	} = useGetCampaignAgentTransferTargets(campaignId || 0, currentAgentId);

	useEffect(() => {
		if (opened) {
			setSelectedAgentId(null);
		}
	}, [opened]);

	const agentOptions = useMemo(
		() =>
			campaignAgents
				?.filter((agent) => agent.agentId !== currentAgentId)
				.map((agent) => ({
					value: agent.agentId,
					label: agent.name,
				})) ?? [],
		[campaignAgents, currentAgentId]
	);

	const hasNoAgents = !isLoading && !isError && agentOptions.length === 0;
	const canConfirm = Boolean(selectedAgentId) && !isLoading && !isError;

	const handleConfirm = () => {
		if (!selectedAgentId) return;
		onConfirm(selectedAgentId);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.workflow.transferTargetModal.title')}
			centered
			size='sm'
			withinPortal
		>
			<Stack gap='sm'>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.transferTargetModal.description')}
				</Text>

				{isError && (
					<Alert
						color='red'
						icon={<IconAlertCircle size={16} />}
						title={t('form.workflow.transferTargetModal.errorTitle')}
					>
						{t('form.workflow.transferTargetModal.errorDescription')}
					</Alert>
				)}

				<Select
					label={t('form.workflow.transferTargetModal.agentLabel')}
					placeholder={t('form.workflow.transferTargetModal.agentPlaceholder')}
					data={agentOptions}
					value={selectedAgentId}
					onChange={setSelectedAgentId}
					searchable
					clearable
					disabled={isLoading || isError || hasNoAgents}
					nothingFoundMessage={t(
						'form.workflow.transferTargetModal.noSearchResults'
					)}
					size='sm'
				/>

				{isLoading && (
					<Text size='xs' c='dimmed'>
						{t('form.workflow.transferTargetModal.loading')}
					</Text>
				)}
				{hasNoAgents && (
					<Text size='xs' c='dimmed'>
						{t('form.workflow.transferTargetModal.empty')}
					</Text>
				)}

				<Group justify='flex-end' gap='xs'>
					<Button variant='default' size='sm' onClick={onClose}>
						{t('common:actions.cancel')}
					</Button>
					<Button size='sm' onClick={handleConfirm} disabled={!canConfirm}>
						{t('form.workflow.transferTargetModal.create')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default AgentTransferTargetModal;

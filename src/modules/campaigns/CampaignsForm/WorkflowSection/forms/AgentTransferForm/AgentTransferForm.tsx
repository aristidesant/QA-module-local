import {
	NumberInput,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconUserCog } from '@tabler/icons-react';
import axios from 'axios';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
	AgentWorkflow,
	StandaloneAgentNode,
} from '~/models/AgentWorkflowModel';
import type { AgentConfigModel } from '~/models/AgentListObject';
import { DEFAULT_API_URL } from '~/api/config';
import { useCampaignId } from '~/modules/campaigns/campaignFormFunctions';
import { WORKFLOW_DRAWER_COMBOBOX_PROPS } from '../workflowDrawerComboboxProps';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { updateWorkflowNode } from '../nodeFormUtils';
import styles from './AgentTransferForm.module.css';

type CampaignOtherAgentDto = {
	id: string;
	agentId: string;
	identifier: string;
	campaignId: number;
	campaignName: string;
};

interface AgentTransferFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	campaignAgentConfig?: Partial<AgentConfigModel>;
}

const AgentTransferForm = ({
	nodeId,
	workflow,
	onWorkflowChange,
	campaignAgentConfig,
}: AgentTransferFormProps) => {
	const { t } = useTranslation('campaigns');
	const campaignId = useCampaignId();
	const { data: campaignAgents, isLoading } = useQuery({
		queryKey: ['campaignOtherAgents', campaignId],
		queryFn: async () => {
			const { data } = await axios.get<CampaignOtherAgentDto[]>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents/others`
			);
			return data;
		},
		enabled: !!campaignId,
	});
	const node = workflow?.nodes[nodeId] as StandaloneAgentNode | undefined;
	const currentAgentId = campaignAgentConfig?.agentId;

	const agentOptions = useMemo(
		() =>
			campaignAgents
				?.filter((agent) => agent.agentId !== currentAgentId)
				.map((agent) => ({
					value: agent.agentId,
					label: agent.campaignName,
				})) || [],
		[campaignAgents, currentAgentId]
	);

	const selectedTransferAgentId =
		node?.agentId && node.agentId !== currentAgentId ? node.agentId : null;

	if (!node) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.transfer.title')}
				description={t('form.workflow.forms.transfer.missingNode')}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.transfer.missingNodeHint')}
				</Text>
			</WorkflowNodeForm>
		);
	}

	const handleUpdate = (updates: Partial<StandaloneAgentNode>) => {
		const nextWorkflow = updateWorkflowNode(workflow, nodeId, updates);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const handleDelayChange = (value: number | string) => {
		const nextDelay =
			typeof value === 'number' && !Number.isNaN(value) ? value : 0;
		handleUpdate({ delayMs: nextDelay });
	};

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.transfer.title')}
			description={t('form.workflow.forms.transfer.description')}
			icon={IconUserCog}
			iconColor='var(--mantine-color-gray-7)'
		>
			<Stack gap='xs' className={styles.form}>
				<Select
					label={t('form.workflow.forms.transfer.agentLabel')}
					placeholder={t('form.workflow.forms.transfer.agentPlaceholder')}
					data={agentOptions}
					comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
					value={selectedTransferAgentId}
					onChange={(value) => handleUpdate({ agentId: value || '' })}
					searchable
					disabled={isLoading || agentOptions.length === 0}
					size='sm'
					classNames={{
						label: styles.label,
						input: styles.input,
						description: styles.description,
					}}
				/>
				<NumberInput
					label={t('form.workflow.forms.transfer.delayLabel')}
					placeholder={t('form.workflow.forms.transfer.delayPlaceholder')}
					value={node.delayMs ?? 0}
					min={0}
					allowNegative={false}
					allowDecimal={false}
					step={1}
					onChange={handleDelayChange}
					size='sm'
					classNames={{
						label: styles.label,
						input: styles.input,
					}}
				/>
				<Textarea
					label={t('form.workflow.forms.transfer.messageLabel')}
					placeholder={t('form.workflow.forms.transfer.messagePlaceholder')}
					value={node.transferMessage ?? ''}
					minRows={3}
					onChange={(event) =>
						handleUpdate({ transferMessage: event.currentTarget.value })
					}
					size='sm'
					classNames={{
						label: styles.label,
						input: styles.textarea,
					}}
				/>
				<Switch
					label={t('form.workflow.forms.transfer.firstMessageLabel')}
					checked={node.enableTransferredAgentFirstMessage ?? false}
					labelPosition='left'
					onChange={(event) =>
						handleUpdate({
							enableTransferredAgentFirstMessage: event.currentTarget.checked,
						})
					}
					size='sm'
					classNames={{
						root: styles.switchRoot,
						body: styles.switchBody,
						label: styles.label,
					}}
				/>
				{isLoading && (
					<Text size='xs' className={styles.description}>
						{t('form.workflow.forms.transfer.agentLoading')}
					</Text>
				)}
				{!isLoading && agentOptions.length === 0 && (
					<Text size='xs' className={styles.description}>
						{t('form.workflow.forms.transfer.agentEmpty')}
					</Text>
				)}
			</Stack>
		</WorkflowNodeForm>
	);
};

export default AgentTransferForm;

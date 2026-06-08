import {
	NumberInput,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
} from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
	AgentWorkflow,
	StandaloneAgentNode,
} from '~/models/AgentWorkflowModel';
import type { AgentConfigModel } from '~/models/AgentListObject';
import { useCampaignId } from '~/modules/campaigns/campaignFormFunctions';
import { useGetCampaignAgentTransferTargets } from '~/queries/campaignAgentsQueries';
import { WORKFLOW_DRAWER_COMBOBOX_PROPS } from '../workflowDrawerComboboxProps';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { updateWorkflowNode } from '../nodeFormUtils';
import {
	getStandaloneAgentTransferAgentId,
	getStandaloneAgentTransferDelayMs,
	getStandaloneAgentTransferFirstMessageEnabled,
	getStandaloneAgentTransferMessage,
} from '../../utils/standaloneAgentNode';
import styles from './AgentTransferForm.module.css';

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
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const campaignId = useCampaignId();
	const node = workflow?.nodes[nodeId] as StandaloneAgentNode | undefined;
	const currentAgentId = campaignAgentConfig?.agentId;
	const { data: campaignAgents, isLoading } =
		useGetCampaignAgentTransferTargets(campaignId || 0, currentAgentId);

	const agentOptions = useMemo(
		() =>
			campaignAgents
				?.filter((agent) => agent.agentId !== currentAgentId)
				.map((agent) => ({
					value: agent.agentId,
					label: agent.name,
				})) || [],
		[campaignAgents, currentAgentId]
	);

	const nodeAgentId = getStandaloneAgentTransferAgentId(node);
	const selectedTransferAgentId =
		nodeAgentId && nodeAgentId !== currentAgentId ? nodeAgentId : null;

	if (!node) {
		return (
			<WorkflowNodeForm>
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
		handleUpdate({ delay_ms: nextDelay });
	};

	return (
		<WorkflowNodeForm>
			<Stack gap='xs' className={styles.form}>
				<Select
					label={t('form.workflow.forms.transfer.agentLabel')}
					placeholder={t('form.workflow.forms.transfer.agentPlaceholder')}
					data={agentOptions}
					comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
					value={selectedTransferAgentId}
					onChange={(value) => handleUpdate({ agent_id: value || '' })}
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
					value={getStandaloneAgentTransferDelayMs(node)}
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
					value={getStandaloneAgentTransferMessage(node)}
					minRows={3}
					onChange={(event) =>
						handleUpdate({ transfer_message: event.currentTarget.value })
					}
					size='sm'
					classNames={{
						label: styles.label,
						input: styles.textarea,
					}}
				/>
				<Switch
					label={t('form.workflow.forms.transfer.firstMessageLabel')}
					checked={getStandaloneAgentTransferFirstMessageEnabled(node)}
					labelPosition='left'
					onChange={(event) =>
						handleUpdate({
							enable_transferred_agent_first_message:
								event.currentTarget.checked,
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

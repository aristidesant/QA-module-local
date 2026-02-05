import {
	NumberInput,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
} from '@mantine/core';
import { IconUserCog } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import type {
	AgentWorkflow,
	StandaloneAgentNode,
} from '~/models/AgentWorkflowModel';
import type { AgentConfigModel } from '~/models/AgentListObject';
import { useCampaignId } from '~/modules/campaigns/campaignFormFunctions';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { updateWorkflowNode } from '../nodeFormUtils';
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
}: AgentTransferFormProps) => {
	const { t } = useTranslation('campaigns');
	const campaignId = useCampaignId();
	const { data: campaignAgents, isLoading } = useGetCampaignAgents(
		campaignId || 0
	);
	const node = workflow?.nodes[nodeId] as StandaloneAgentNode | undefined;

	const agentOptions = useMemo(
		() =>
			campaignAgents?.map((agent) => ({
				value: agent.agentId,
				label: agent.agent?.name || agent.agentId,
			})) || [],
		[campaignAgents]
	);

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

	const agentDescription = isLoading
		? t('form.workflow.forms.transfer.agentLoading')
		: agentOptions.length === 0
			? t('form.workflow.forms.transfer.agentEmpty')
			: undefined;

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
					description={agentDescription}
					data={agentOptions}
					value={node.agentId || null}
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
					minRows={4}
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
					onChange={(event) =>
						handleUpdate({
							enableTransferredAgentFirstMessage: event.currentTarget.checked,
						})
					}
					size='sm'
					classNames={{ label: styles.label }}
				/>
			</Stack>
		</WorkflowNodeForm>
	);
};

export default AgentTransferForm;

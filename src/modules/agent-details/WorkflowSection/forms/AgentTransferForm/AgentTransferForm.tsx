import {
	Input,
	NumberInput,
	Select,
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
import { useGetAgent } from '~/queries/agentQueries';
import { WORKFLOW_DRAWER_COMBOBOX_PROPS } from '../workflowDrawerComboboxProps';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { updateWorkflowNode } from '../nodeFormUtils';
import {
	getStandaloneAgentTransferAgentId,
	getStandaloneAgentTransferDelayMs,
	getStandaloneAgentTransferFirstMessageEnabled,
	getStandaloneAgentTransferMessage,
	getStandaloneAgentTransferNodeId,
	getStandaloneAgentTransferPreserveClientTtsOverrides,
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
	const { data: targetAgent } = useGetAgent(nodeAgentId || '');
	const selectedTransferAgentId =
		nodeAgentId && nodeAgentId !== currentAgentId ? nodeAgentId : null;

	const nodeOptions = useMemo(() => {
		const workflow = targetAgent?.config?.workflow;
		if (!workflow?.nodes) return [];
		return Object.entries(workflow.nodes)
			.filter(([, node]) => node.type !== 'start' && node.type !== 'end')
			.map(([nodeId, node]) => ({
				value: nodeId,
				label: node.label || nodeId,
			}));
	}, [targetAgent]);

	const currentNodeId = getStandaloneAgentTransferNodeId(node);

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

	const handleAgentChange = (value: string | null) => {
		handleUpdate({ agent_id: value || '', node_id: null });
	};

	return (
		<WorkflowNodeForm>
			<div className={styles.form}>
				{/* ── Section 1: Target ──────────────────────── */}
				<div className={styles.section}>
					<div className={styles.sectionLabel}>
						{t('form.workflow.forms.transfer.sectionTarget')}
					</div>
					<div className={styles.sectionFields}>
						<Select
							label={t('form.workflow.forms.transfer.agentLabel')}
							placeholder={t('form.workflow.forms.transfer.agentPlaceholder')}
							data={agentOptions}
							comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
							value={selectedTransferAgentId}
							onChange={handleAgentChange}
							searchable
							disabled={isLoading || agentOptions.length === 0}
							size='sm'
							classNames={{
								label: styles.label,
								input: styles.input,
							}}
						/>
						<Select
							label={
								<span>
									{t('form.workflow.forms.transfer.nodeLabel')}
									<span className={styles.labelOptional}>
										— {t('common.optional', 'optional')}
									</span>
								</span>
							}
							placeholder={t('form.workflow.forms.transfer.nodePlaceholder')}
							data={nodeOptions}
							comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
							value={currentNodeId}
							onChange={(value) => handleUpdate({ node_id: value || null })}
							searchable
							clearable
							disabled={!selectedTransferAgentId || nodeOptions.length === 0}
							nothingFoundMessage={t(
								'form.workflow.forms.transfer.nodeNoResults'
							)}
							size='sm'
							classNames={{
								label: styles.label,
								input: styles.input,
							}}
						/>
					</div>
				</div>

				{/* ── Section 2: Behavior ────────────────────── */}
				<div className={styles.section}>
					<div className={styles.sectionLabel}>
						{t('form.workflow.forms.transfer.sectionBehavior')}
					</div>
					<div className={styles.sectionFields}>
						<Input.Wrapper
							label={t('form.workflow.forms.transfer.delayLabel')}
							classNames={{ label: styles.label }}
						>
							<div className={styles.delayRow}>
								<NumberInput
									placeholder={t(
										'form.workflow.forms.transfer.delayPlaceholder'
									)}
									value={getStandaloneAgentTransferDelayMs(node)}
									min={0}
									allowNegative={false}
									allowDecimal={false}
									step={1}
									hideControls
									onChange={handleDelayChange}
									size='sm'
									classNames={{
										root: styles.delayInputRoot,
										input: styles.delayInput,
									}}
								/>
								<span className={styles.delaySuffix}>ms</span>
							</div>
						</Input.Wrapper>

						<Textarea
							label={
								<span>
									{t('form.workflow.forms.transfer.messageLabel')}
									<span className={styles.labelOptional}>
										— {t('common.optional', 'optional')}
									</span>
								</span>
							}
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

						<div className={styles.toggleGroup}>
							<div className={styles.toggleRow}>
								<div className={styles.toggleContent}>
									<span className={styles.toggleName}>
										{t('form.workflow.forms.transfer.firstMessageLabel')}
									</span>
									<span className={styles.toggleDesc}>
										{t('form.workflow.forms.transfer.firstMessageDesc')}
									</span>
								</div>
								<Switch
									checked={getStandaloneAgentTransferFirstMessageEnabled(node)}
									onChange={(event) =>
										handleUpdate({
											enable_transferred_agent_first_message:
												event.currentTarget.checked,
										})
									}
									size='sm'
								/>
							</div>
							<div className={styles.toggleRow}>
								<div className={styles.toggleContent}>
									<span className={styles.toggleName}>
										{t(
											'form.workflow.forms.transfer.preserveClientTtsOverridesLabel'
										)}
									</span>
									<span className={styles.toggleDesc}>
										{t(
											'form.workflow.forms.transfer.preserveClientTtsOverridesDesc'
										)}
									</span>
								</div>
								<Switch
									checked={getStandaloneAgentTransferPreserveClientTtsOverrides(
										node
									)}
									onChange={(event) =>
										handleUpdate({
											preserve_client_tts_overrides:
												event.currentTarget.checked,
										})
									}
									size='sm'
								/>
							</div>
						</div>
					</div>
				</div>

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
			</div>
		</WorkflowNodeForm>
	);
};

export default AgentTransferForm;

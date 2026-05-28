import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import WorkflowClipboardActions from './WorkflowClipboardActions';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowEditorFullscreen from './WorkflowEditorFullscreen';
import { WorkflowNodeEditorProvider } from './WorkflowNodeEditorContext';
import { NodeStylesProvider } from './NodeStylesContext';
import WorkflowNodeLegend from './WorkflowNodeLegend';
import {
	useCampaignAgentEditor,
	useCampaignFormContext,
	useCampaignId,
} from '../../campaignFormFunctions';
import {
	useGetCampaignAgents,
	useUpdateCampaignAgentConfig,
} from '~/queries/campaignAgentsQueries';
import CampaignAgentSelector from '../components/CampaignAgentSelector';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { NodeGroups, NodeStyles } from '~/models/CampaignsModel';
import '@xyflow/react/dist/style.css';
import styles from './WorkflowSection.module.css';

interface WorkflowSectionProps {
	showAgentSelector?: boolean;
}

const WorkflowSection = ({
	showAgentSelector = true,
}: WorkflowSectionProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const form = useCampaignFormContext();
	const campaignId = useCampaignId();
	const {
		selectedCampaignAgentId,
		setSelectedCampaignAgentId,
		selectedCampaignAgent,
		selectedAgent,
	} = useCampaignAgentEditor();
	const { data: campaignAgents } = useGetCampaignAgents(campaignId || 0);
	const updateCampaignAgentConfig = useUpdateCampaignAgentConfig();
	const [isEditorExpanded, setIsEditorExpanded] = useState(false);
	const [localWorkflow, setLocalWorkflow] = useState<
		AgentWorkflow | undefined
	>();
	const [localNodeStyles, setLocalNodeStyles] = useState<
		NodeStyles | undefined
	>();
	const [localNodeGroups, setLocalNodeGroups] = useState<
		NodeGroups | undefined
	>();

	const sortedCampaignAgents = useMemo(
		() =>
			[...(campaignAgents ?? [])].sort((a, b) => {
				if (a.isPrincipal !== b.isPrincipal) return a.isPrincipal ? -1 : 1;
				return a.agentType.localeCompare(b.agentType);
			}),
		[campaignAgents]
	);
	const usesCampaignAgentConfig = Boolean(campaignId && selectedCampaignAgent);
	const workflow = usesCampaignAgentConfig
		? localWorkflow
		: form.values.agentConfig?.workflow;
	const prevent_subagent_loops = workflow?.prevent_subagent_loops ?? false;
	const nodeStyles = usesCampaignAgentConfig
		? localNodeStyles
		: form.values.nodeStyles;
	const nodeGroups = usesCampaignAgentConfig
		? localNodeGroups
		: form.values.nodeGroups;
	const campaignAgentConfig = usesCampaignAgentConfig
		? {
				...(selectedAgent?.config ?? {}),
				agentId: selectedCampaignAgent?.agentId,
			}
		: form.values.agentConfig;

	useEffect(() => {
		if (sortedCampaignAgents.length === 0) {
			setSelectedCampaignAgentId(null);
			return;
		}

		const hasSelection = selectedCampaignAgentId
			? sortedCampaignAgents.some(
					(agent) => agent.id === selectedCampaignAgentId
				)
			: false;
		if (!hasSelection) {
			setSelectedCampaignAgentId(sortedCampaignAgents[0].id);
		}
	}, [selectedCampaignAgentId, sortedCampaignAgents]);

	useEffect(() => {
		if (!usesCampaignAgentConfig || !selectedCampaignAgent) {
			return;
		}

		setLocalWorkflow(selectedAgent?.config?.workflow);
		setLocalNodeStyles(selectedAgent?.workflowUi?.nodeStyles ?? {});
		setLocalNodeGroups(selectedAgent?.workflowUi?.nodeGroups ?? {});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		selectedAgent?.updatedAt,
		selectedCampaignAgent?.id,
		usesCampaignAgentConfig,
	]);

	const handleWorkflowChange = (updatedWorkflow: AgentWorkflow) => {
		const currentConfig = form.values.agentConfig ?? {};
		const prevNodes = workflow?.nodes ?? {};
		const nextNodes = updatedWorkflow.nodes ?? {};

		const currentNodeStyles = nodeStyles;
		const currentNodeGroups = nodeGroups;
		let stylesPatched = false;
		let groupsPatched = false;
		const patchedStyles = currentNodeStyles
			? { ...currentNodeStyles }
			: undefined;
		const patchedGroups = currentNodeGroups
			? { ...currentNodeGroups }
			: undefined;

		for (const nodeId of Object.keys(nextNodes)) {
			const prevLabel = prevNodes[nodeId]?.label;
			const nextLabel = nextNodes[nodeId]?.label;
			if (prevLabel !== nextLabel && nextLabel !== undefined) {
				if (patchedStyles?.[nodeId]) {
					patchedStyles[nodeId] = {
						...patchedStyles[nodeId],
						nodeLabel: nextLabel,
					};
					stylesPatched = true;
				}
				if (patchedGroups?.[nodeId]) {
					patchedGroups[nodeId] = {
						...patchedGroups[nodeId],
						label: nextLabel,
					};
					groupsPatched = true;
				}
			}
		}

		if (stylesPatched && patchedStyles) {
			if (usesCampaignAgentConfig) {
				setLocalNodeStyles(patchedStyles);
			} else {
				form.setFieldValue('nodeStyles', patchedStyles);
			}
		}
		if (groupsPatched && patchedGroups) {
			if (usesCampaignAgentConfig) {
				setLocalNodeGroups(patchedGroups);
			} else {
				form.setFieldValue('nodeGroups', patchedGroups);
			}
		}

		if (usesCampaignAgentConfig) {
			setLocalWorkflow(updatedWorkflow);
			return;
		}

		form.setFieldValue('agentConfig', {
			...currentConfig,
			workflow: updatedWorkflow,
		});
	};

	const handleNodeGroupsChange = useCallback(
		(updatedNodeGroups: NodeGroups) => {
			if (usesCampaignAgentConfig) {
				setLocalNodeGroups(updatedNodeGroups);
			} else {
				form.setFieldValue('nodeGroups', updatedNodeGroups);
			}
		},
		[form, usesCampaignAgentConfig]
	);

	const handleNodeStylesChange = useCallback(
		(updatedNodeStyles: NodeStyles) => {
			if (usesCampaignAgentConfig) {
				setLocalNodeStyles(updatedNodeStyles);
			} else {
				form.setFieldValue('nodeStyles', updatedNodeStyles);
			}
		},
		[form, usesCampaignAgentConfig]
	);

	const handlePreventLoopsChange = (value: boolean) => {
		const currentWorkflow = workflow;
		const nextWorkflow: AgentWorkflow = {
			prevent_subagent_loops: value,
			nodes: currentWorkflow?.nodes ?? {},
			edges: currentWorkflow?.edges ?? {},
		};
		handleWorkflowChange(nextWorkflow);
	};

	const handleSaveWorkflow = async () => {
		if (!campaignId || !selectedCampaignAgent || !workflow) return;

		try {
			await updateCampaignAgentConfig.mutateAsync({
				campaignId,
				id: selectedCampaignAgent.id,
				updateData: {
					workflow,
					workflowUi: {
						...(selectedAgent?.workflowUi ?? {}),
						nodeStyles: nodeStyles ?? {},
						nodeGroups: nodeGroups ?? {},
					},
				},
			});
			notifications.show({
				color: 'green',
				message: t('form.workflow.header.saved'),
			});
		} catch {
			notifications.show({
				color: 'red',
				message: t('form.workflow.header.saveError'),
			});
		}
	};

	const handleNodeSelect = useCallback((nodeId: string | null) => {
		void nodeId;
	}, []);

	const nodeStylesController = useMemo(
		() => ({
			nodeStyles,
			onNodeStylesChange: handleNodeStylesChange,
		}),
		[nodeStyles, handleNodeStylesChange]
	);

	return (
		<NodeStylesProvider value={nodeStylesController}>
			<WorkflowNodeEditorProvider
				workflow={workflow}
				onWorkflowChange={handleWorkflowChange}
				campaignAgentConfig={campaignAgentConfig}
			>
				<WorkflowEditorFullscreen
					opened={isEditorExpanded}
					onClose={() => setIsEditorExpanded(false)}
					workflow={workflow}
					onWorkflowChange={handleWorkflowChange}
					prevent_subagent_loops={prevent_subagent_loops}
					allowDefaultInit={!campaignId || !workflow}
					onNodeSelect={handleNodeSelect}
					nodeStyles={nodeStyles}
					nodeGroups={nodeGroups}
					onNodeGroupsChange={handleNodeGroupsChange}
					onNodeStylesChange={handleNodeStylesChange}
				/>
				<div className={styles.root}>
					<SectionCard
						title={t('form.workflow.section.title')}
						description={t('form.workflow.section.description')}
						contentSpacing='xs'
						padding='sm'
						onExpand={() => setIsEditorExpanded(true)}
						headerExtras={
							<div className={styles.headerControls}>
								<Group
									gap='xs'
									align='center'
									className={styles.headerActionGroup}
								>
									<WorkflowClipboardActions
										workflow={workflow}
										onWorkflowChange={handleWorkflowChange}
										fallbackPreventSubagentLoops={prevent_subagent_loops}
										nodeStyles={nodeStyles}
										nodeGroups={nodeGroups}
										onNodeStylesChange={handleNodeStylesChange}
										onNodeGroupsChange={handleNodeGroupsChange}
									/>
									<Checkbox
										size='sm'
										label={t('form.workflow.header.preventLoops')}
										checked={prevent_subagent_loops}
										onChange={(event) =>
											handlePreventLoopsChange(event.currentTarget.checked)
										}
									/>
								</Group>

								{usesCampaignAgentConfig && (
									<>
										<div className={styles.headerDivider} />
										<Group
											gap='xs'
											align='center'
											className={styles.headerActionGroup}
										>
											<Button
												size='xs'
												variant='light'
												onClick={handleSaveWorkflow}
												loading={updateCampaignAgentConfig.isPending}
											>
												{updateCampaignAgentConfig.isPending
													? t('form.workflow.header.saving')
													: t('form.workflow.header.save')}
											</Button>
										</Group>
									</>
								)}
							</div>
						}
					>
						{showAgentSelector && sortedCampaignAgents.length > 1 && (
							<CampaignAgentSelector
								agents={sortedCampaignAgents}
								value={selectedCampaignAgentId}
								onChange={setSelectedCampaignAgentId}
								label={t('form.workflow.header.agentLabel')}
							/>
						)}
						{(nodeStyles &&
							Object.keys(nodeStyles).some(
								(k) => nodeStyles[k]?.backgroundColor || nodeStyles[k]?.iconName
							)) ||
						(nodeGroups &&
							Object.keys(nodeGroups).some(
								(k) => nodeGroups[k]?.color || nodeGroups[k]?.label
							)) ? (
							<WorkflowNodeLegend
								nodeStyles={nodeStyles}
								nodeGroups={nodeGroups}
							/>
						) : null}
						<WorkflowCanvas
							workflow={workflow}
							onWorkflowChange={handleWorkflowChange}
							nodeGroups={nodeGroups}
							onNodeGroupsChange={handleNodeGroupsChange}
							prevent_subagent_loops={prevent_subagent_loops}
							allowDefaultInit={!campaignId || !workflow}
							onNodeSelect={handleNodeSelect}
						/>
					</SectionCard>
				</div>
			</WorkflowNodeEditorProvider>
		</NodeStylesProvider>
	);
};

export default WorkflowSection;

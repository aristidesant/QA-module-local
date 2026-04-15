import { useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox, Group, Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import WorkflowClipboardActions from './WorkflowClipboardActions';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowEditorFullscreen from './WorkflowEditorFullscreen';
import { WorkflowNodeEditorProvider } from './WorkflowNodeEditorContext';
import { NodeStylesProvider } from './NodeStylesContext';
import WorkflowNodeLegend from './WorkflowNodeLegend';
import {
	useCampaignFormContext,
	useCampaignId,
} from '../../campaignFormFunctions';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { NodeGroups, NodeStyles } from '~/models/CampaignsModel';
import '@xyflow/react/dist/style.css';
import styles from './WorkflowSection.module.css';

const WorkflowSection = () => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const form = useCampaignFormContext();
	const campaignId = useCampaignId();
	const { data: campaignAgents } = useGetCampaignAgents(campaignId || 0);
	const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
	const [isEditorExpanded, setIsEditorExpanded] = useState(false);
	const workflow = form.values.agentConfig?.workflow;
	const preventSubagentLoops = workflow?.preventSubagentLoops ?? false;
	const nodeStyles = form.values.nodeStyles;
	const nodeGroups = form.values.nodeGroups;

	const agents = useMemo(
		() =>
			campaignAgents?.map((agent) => ({
				agentId: agent.agentId,
				agentName: agent.agent?.name || agent.agentId,
			})) || [],
		[campaignAgents]
	);

	useEffect(() => {
		if (agents.length === 0) {
			setSelectedAgentId(null);
			return;
		}
		const hasSelection = selectedAgentId
			? agents.some((agent) => agent.agentId === selectedAgentId)
			: false;
		if (!hasSelection) {
			setSelectedAgentId(agents[0].agentId);
		}
	}, [agents, selectedAgentId]);

	const handleWorkflowChange = (updatedWorkflow: AgentWorkflow) => {
		const currentConfig = form.values.agentConfig ?? {};

		form.setFieldValue('agentConfig', {
			...currentConfig,
			workflow: updatedWorkflow,
		});
	};

	const handleNodeGroupsChange = useCallback(
		(updatedNodeGroups: NodeGroups) => {
			form.setFieldValue('nodeGroups', updatedNodeGroups);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const handleNodeStylesChange = useCallback(
		(updatedNodeStyles: NodeStyles) => {
			form.setFieldValue('nodeStyles', updatedNodeStyles);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const handlePreventLoopsChange = (value: boolean) => {
		const currentWorkflow = form.values.agentConfig?.workflow;
		const nextWorkflow: AgentWorkflow = {
			preventSubagentLoops: value,
			nodes: currentWorkflow?.nodes ?? {},
			edges: currentWorkflow?.edges ?? {},
		};
		handleWorkflowChange(nextWorkflow);
	};

	const handleNodeSelect = useCallback((nodeId: string | null) => {
		void nodeId;
	}, []);

	return (
		<NodeStylesProvider value={nodeStyles}>
			<WorkflowNodeEditorProvider
				workflow={workflow}
				onWorkflowChange={handleWorkflowChange}
				campaignAgentConfig={form.values.agentConfig}
			>
				<WorkflowEditorFullscreen
					opened={isEditorExpanded}
					onClose={() => setIsEditorExpanded(false)}
					workflow={workflow}
					onWorkflowChange={handleWorkflowChange}
					preventSubagentLoops={preventSubagentLoops}
					allowDefaultInit={!campaignId}
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
							<Group gap='xs' align='center' className={styles.headerControls}>
								{agents.length > 1 && (
									<Select
										data={agents.map((agent) => ({
											value: agent.agentId,
											label: agent.agentName,
										}))}
										value={selectedAgentId}
										onChange={setSelectedAgentId}
										placeholder={t('form.workflow.header.agentPlaceholder')}
										aria-label={t('form.workflow.header.agentLabel')}
										size='sm'
										w={200}
									/>
								)}
								<Checkbox
									size='sm'
									label={t('form.workflow.header.preventLoops')}
									checked={preventSubagentLoops}
									onChange={(event) =>
										handlePreventLoopsChange(event.currentTarget.checked)
									}
								/>
								<WorkflowClipboardActions
									workflow={workflow}
									onWorkflowChange={handleWorkflowChange}
									fallbackPreventSubagentLoops={preventSubagentLoops}
									nodeStyles={nodeStyles}
									nodeGroups={nodeGroups}
									onNodeStylesChange={handleNodeStylesChange}
									onNodeGroupsChange={handleNodeGroupsChange}
								/>
							</Group>
						}
					>
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
							preventSubagentLoops={preventSubagentLoops}
							allowDefaultInit={!campaignId}
							onNodeSelect={handleNodeSelect}
						/>
					</SectionCard>
				</div>
			</WorkflowNodeEditorProvider>
		</NodeStylesProvider>
	);
};

export default WorkflowSection;

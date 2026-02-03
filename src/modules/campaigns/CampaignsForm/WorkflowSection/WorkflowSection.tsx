import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox, Group, Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import WorkflowSyncButton from './WorkflowSyncButton';
import WorkflowCanvas from './WorkflowCanvas';
import {
	useCampaignFormContext,
	useCampaignId,
} from '../../campaignFormFunctions';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { WORKFLOW_NODE_TYPES } from './nodeTypes';
import {
	AgentForm,
	AgentTransferForm,
	PhoneNumberForm,
	StartEndForm,
	ToolNodeForm,
} from './forms';
import '@xyflow/react/dist/style.css';

const WorkflowSection = () => {
	const { t } = useTranslation('campaigns');
	const form = useCampaignFormContext();
	const campaignId = useCampaignId();
	const { data: campaignAgents, isLoading } = useGetCampaignAgents(
		campaignId || 0
	);
	const { setRightComponent } = useCampaignsStore((state) => state);
	const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const lastRightPanelSignature = useRef<string | null>(null);
	const workflow = form.values.agentConfig?.workflow;
	const preventSubagentLoops = workflow?.preventSubagentLoops ?? false;
	const workflowFromGetter = form.getValues().agentConfig?.workflow;
	const nodesFromState = workflow?.nodes
		? Object.keys(workflow.nodes).length
		: 0;
	const nodesFromGetter = workflowFromGetter?.nodes
		? Object.keys(workflowFromGetter.nodes).length
		: 0;
	console.log('[WorkflowSection] form values vs getValues:', {
		nodesFromState,
		nodesFromGetter,
	});

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

	const handlePreventLoopsChange = (value: boolean) => {
		const currentWorkflow = form.values.agentConfig?.workflow;
		const nextWorkflow: AgentWorkflow = {
			preventSubagentLoops: value,
			nodes: currentWorkflow?.nodes ?? {},
			edges: currentWorkflow?.edges ?? {},
		};
		handleWorkflowChange(nextWorkflow);
	};

	const buildRightComponent = useCallback(
		(nodeId: string) => {
			const selectedNode = form.values.agentConfig?.workflow?.nodes?.[nodeId];
			if (!selectedNode) return null;
			const commonProps = {
				nodeId,
				workflow: form.values.agentConfig?.workflow,
				onWorkflowChange: handleWorkflowChange,
				campaignAgentConfig: form.values.agentConfig,
			};
			const isTransferNode =
				selectedNode.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT &&
				(selectedNode.uiMeta?.variant === 'transfer' || !!selectedNode.agentId);
			switch (selectedNode.type) {
				case WORKFLOW_NODE_TYPES.STANDALONE_AGENT:
					return isTransferNode ? (
						<AgentTransferForm {...commonProps} />
					) : (
						<AgentForm {...commonProps} />
					);
				case WORKFLOW_NODE_TYPES.OVERRIDE_AGENT:
					return <AgentForm {...commonProps} />;
				case WORKFLOW_NODE_TYPES.PHONE_NUMBER:
					return <PhoneNumberForm {...commonProps} />;
				case WORKFLOW_NODE_TYPES.TOOL:
					return <ToolNodeForm {...commonProps} />;
				case WORKFLOW_NODE_TYPES.START:
				case WORKFLOW_NODE_TYPES.END:
					return (
						<StartEndForm nodeId={nodeId} workflow={commonProps.workflow} />
					);
				default:
					return null;
			}
		},
		[form.values.agentConfig?.workflow, handleWorkflowChange]
	);

	const handleNodeSelect = useCallback(
		(nodeId: string | null) => {
			if (!nodeId) {
				setSelectedNodeId(null);
				lastRightPanelSignature.current = null;
				setRightComponent(null);
				return;
			}
			const selectedNode = form.values.agentConfig?.workflow?.nodes?.[nodeId];
			if (!selectedNode) {
				setSelectedNodeId(null);
				lastRightPanelSignature.current = null;
				setRightComponent(null);
				return;
			}
			const nextSignature = `${nodeId}-${JSON.stringify(selectedNode)}`;
			lastRightPanelSignature.current = nextSignature;
			setSelectedNodeId(nodeId);
			setRightComponent(buildRightComponent(nodeId));
		},
		[
			buildRightComponent,
			form.values.agentConfig?.workflow?.nodes,
			setRightComponent,
		]
	);

	useEffect(() => {
		if (!selectedNodeId) {
			if (lastRightPanelSignature.current !== null) {
				lastRightPanelSignature.current = null;
				setRightComponent(null);
			}
			return;
		}
		const selectedNode =
			form.values.agentConfig?.workflow?.nodes?.[selectedNodeId];
		if (!selectedNode) {
			if (lastRightPanelSignature.current !== null) {
				lastRightPanelSignature.current = null;
				setRightComponent(null);
			}
			return;
		}
		const nextSignature = `${selectedNodeId}-${JSON.stringify(selectedNode)}`;
		if (lastRightPanelSignature.current === nextSignature) return;
		lastRightPanelSignature.current = nextSignature;
		setRightComponent(buildRightComponent(selectedNodeId));
	}, [
		buildRightComponent,
		form.values.agentConfig?.workflow?.nodes,
		selectedNodeId,
		setRightComponent,
	]);

	useEffect(() => {
		return () => setRightComponent(null);
	}, [setRightComponent]);

	return (
		<SectionCard
			title={t('form.workflow.section.title')}
			description={t('form.workflow.section.description')}
			contentSpacing='xs'
			padding='sm'
			headerActions={
				<Group gap='xs' align='center'>
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
					<WorkflowSyncButton
						agents={agents}
						isLoading={isLoading}
						selectedAgentId={selectedAgentId}
					/>
				</Group>
			}
		>
			<WorkflowCanvas
				workflow={workflow}
				onWorkflowChange={handleWorkflowChange}
				preventSubagentLoops={preventSubagentLoops}
				allowDefaultInit={!campaignId}
				onNodeSelect={handleNodeSelect}
			/>
		</SectionCard>
	);
};

export default WorkflowSection;

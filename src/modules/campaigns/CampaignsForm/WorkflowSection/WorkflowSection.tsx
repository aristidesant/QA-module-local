import { useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox, Group, Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowEditorFullscreen from './WorkflowEditorFullscreen';
import { WorkflowNodeEditorProvider } from './WorkflowNodeEditorContext';
import {
	useCampaignFormContext,
	useCampaignId,
} from '../../campaignFormFunctions';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import '@xyflow/react/dist/style.css';

const WorkflowSection = () => {
	const { t } = useTranslation('campaigns');
	const form = useCampaignFormContext();
	const campaignId = useCampaignId();
	const { data: campaignAgents } = useGetCampaignAgents(campaignId || 0);
	const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
	const [isEditorExpanded, setIsEditorExpanded] = useState(false);
	const workflow = form.values.agentConfig?.workflow;
	const preventSubagentLoops = workflow?.preventSubagentLoops ?? false;

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

	const handleNodeSelect = useCallback((nodeId: string | null) => {
		void nodeId;
	}, []);

	return (
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
			/>
			<SectionCard
				title={t('form.workflow.section.title')}
				description={t('form.workflow.section.description')}
				contentSpacing='xs'
				padding='sm'
				onExpand={() => setIsEditorExpanded(true)}
				headerExtras={
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
		</WorkflowNodeEditorProvider>
	);
};

export default WorkflowSection;

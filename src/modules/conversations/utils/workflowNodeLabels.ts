import type { CampaignAgent } from '~/models/CampaignAgentModel';
import type AgentListObject from '~/models/AgentListObject';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type {
	WorkflowNodeLabels,
	WorkflowNodeLabelsByAgent,
} from '~/modules/conversations/TranscriptViewer/helpers/types';

interface BuildWorkflowNodeLabelMapsInput {
	campaignAgents?: CampaignAgent[];
	embeddedCampaignAgents?: CampaignAgent[];
	conversationAgent?: AgentListObject | null;
}

interface WorkflowNodeLabelMaps {
	nodeLabels: WorkflowNodeLabels;
	nodeLabelsByAgent: WorkflowNodeLabelsByAgent;
}

const getNodeLabel = (label: string | null | undefined): string | null => {
	const trimmed = label?.trim();
	return trimmed ? trimmed : null;
};

const uniqueAgentIds = (agentIds: Array<string | null | undefined>) =>
	Array.from(new Set(agentIds.filter(Boolean) as string[]));

export const buildWorkflowNodeLabelMaps = ({
	campaignAgents = [],
	embeddedCampaignAgents = [],
	conversationAgent,
}: BuildWorkflowNodeLabelMapsInput): WorkflowNodeLabelMaps => {
	const nodeLabels: WorkflowNodeLabels = {};
	const nodeLabelsByAgent: WorkflowNodeLabelsByAgent = {};

	const addWorkflowLabels = (
		workflow: AgentWorkflow | undefined,
		agentIds: string[]
	) => {
		if (!workflow?.nodes || agentIds.length === 0) return;

		for (const [nodeId, node] of Object.entries(workflow.nodes)) {
			const label = getNodeLabel(node.label);
			if (!label) continue;

			nodeLabels[nodeId] ??= label;

			for (const agentId of agentIds) {
				nodeLabelsByAgent[agentId] ??= {};
				nodeLabelsByAgent[agentId][nodeId] ??= label;
			}
		}
	};

	const addCampaignAgentLabels = (campaignAgent: CampaignAgent) => {
		addWorkflowLabels(
			campaignAgent.agent?.config?.workflow,
			uniqueAgentIds([campaignAgent.agentId, campaignAgent.agent?.id])
		);
	};

	campaignAgents.forEach(addCampaignAgentLabels);
	embeddedCampaignAgents.forEach(addCampaignAgentLabels);

	if (conversationAgent) {
		addWorkflowLabels(
			conversationAgent.config?.workflow,
			uniqueAgentIds([conversationAgent.id, conversationAgent.config?.agentId])
		);
	}

	return { nodeLabels, nodeLabelsByAgent };
};

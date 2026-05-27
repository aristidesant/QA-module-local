import type AgentListObject from './AgentListObject';
import type { AgentConfigModel } from './AgentListObject';
import type { AgentWorkflow } from './AgentWorkflowModel';
import type { NodeGroups, NodeStyles } from './CampaignsModel';

export type CampaignAgentType = 'INBOUND' | 'OUTBOUND';

export interface CampaignAgentWorkflowUi {
	nodeStyles?: NodeStyles;
	nodeGroups?: NodeGroups;
	[key: string]: unknown;
}

export interface CampaignAgent {
	id: number;
	campaignId: number;
	agentId: string;
	agent: AgentListObject;
	agentType: CampaignAgentType;
	isPrincipal: boolean;
	isActive: boolean;
	workflowUi?: CampaignAgentWorkflowUi | null;
	userId: number;
	clientId: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

export interface CampaignAgentTransferTarget {
	id: number;
	agentId: string;
	name: string;
	agentType: CampaignAgentType;
	isPrincipal: boolean;
}

export interface UpdateCampaignAgentConfigPayload {
	config?: Partial<AgentConfigModel>;
	conversationConfig?: Record<string, unknown>;
	platformSettings?: Record<string, unknown>;
	workflow?: AgentWorkflow;
	workflowUi?: CampaignAgentWorkflowUi | null;
	versionDescription?: string;
}

export interface CreateCampaignAgentFromTemplatePayload {
	templateId: number;
	name?: string;
}

export interface CreateSubagentTemplateFromAgentPayload {
	name: string;
	description?: string;
	objectiveId?: number;
}

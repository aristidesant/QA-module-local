import type { AgentConfigModel } from './AgentListObject';
import type {
	CampaignAgentType,
	CampaignAgentWorkflowUi,
} from './CampaignAgentModel';

export interface SubagentTemplate {
	id: number;
	name: string;
	description?: string | null;
	objectiveId?: number | null;
	agentType: CampaignAgentType;
	config: Partial<AgentConfigModel>;
	workflowUi?: CampaignAgentWorkflowUi | null;
	voiceId?: string | null;
	sourceAgentId?: string | null;
}

export interface SubagentTemplateFilters {
	objectiveId?: number;
	agentType?: CampaignAgentType;
	name?: string;
}

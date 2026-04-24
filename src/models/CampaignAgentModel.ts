import type AgentListObject from './AgentListObject';

export interface CampaignAgent {
	id: number;
	campaignId: number;
	agentId: string;
	agent: AgentListObject;
	userId: number;
	clientId: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

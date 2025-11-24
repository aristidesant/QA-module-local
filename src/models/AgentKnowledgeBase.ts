export interface AgentKnowledgeBase {
	id: number;
	agentId: string;
	agentName: string;
	knowledgeBaseId: number;
	knowledgeBaseName: string;
	isActive: boolean;
	assignedAt: string;
	knowledgeBaseStatus: string;
}

export interface AgentKnowledgeBaseQueryParams {
	agentId?: string;
	knowledgeBaseId?: number;
	isActive?: boolean;
}

import type { ListQueryParams } from './shared';

export type AgentType = 'HUMAN' | 'AI_BOT';

export interface AgentListQueryParams extends ListQueryParams {
	agentType?: AgentType;
	team?: string;
	q?: string;
	sortBy?: 'id' | 'employeeId' | 'firstName' | 'lastName' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Agent {
	id: number;
	clientId?: number;
	employeeId: string;
	agentType: AgentType;
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
	team?: string | null;
	metadata?: Record<string, unknown> | null;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string | null;
	hasUserAccount?: boolean;
}

export interface CreateAgentPayload {
	employeeId: string;
	agentType?: AgentType;
	firstName?: string;
	lastName?: string;
	email?: string;
	team?: string;
	metadata?: Record<string, unknown>;
}

export interface UpdateAgentPayload {
	agentType?: AgentType;
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
	team?: string | null;
	metadata?: Record<string, unknown> | null;
}

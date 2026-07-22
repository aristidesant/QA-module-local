import type { ListQueryParams } from './shared';

export type LlmProvider = 'OPENAI' | 'GEMINI' | 'BEDROCK';

export interface EvaluatorAgentParams extends Record<string, unknown> {
	temperature?: number;
	maxTokens?: number;
	timeoutMs?: number;
}

export interface EvaluatorAgent {
	id: number;
	clientId?: number;
	name: string;
	systemPrompt: string;
	provider: LlmProvider;
	model: string;
	params?: EvaluatorAgentParams | null;
	isActive: boolean;
	metadata?: Record<string, unknown> | null;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string | null;
}

export interface CreateEvaluatorAgentPayload {
	name: string;
	systemPrompt: string;
	provider: LlmProvider;
	model: string;
	params?: EvaluatorAgentParams | null;
	isActive?: boolean;
	metadata?: Record<string, unknown> | null;
}

export type UpdateEvaluatorAgentPayload = Partial<CreateEvaluatorAgentPayload>;

export interface EvaluatorAgentListQueryParams extends ListQueryParams {
	provider?: LlmProvider;
	isActive?: boolean;
	q?: string;
	sortBy?: 'id' | 'name' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

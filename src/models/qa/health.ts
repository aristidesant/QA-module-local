import type { LlmProvider } from './evaluatorAgents';

export type HealthStatus = 'ok' | 'degraded' | 'error';
export type LlmProviderHealthStatus = 'ok' | 'error' | 'disabled';

export interface LlmProviderHealthResult {
	configured: boolean;
	status: LlmProviderHealthStatus;
	latencyMs?: number;
	error?: string;
}

export interface AiHealthResponse {
	status: HealthStatus;
	providers: Partial<Record<LlmProvider, LlmProviderHealthResult>>;
}

export interface HealthResponse {
	status: HealthStatus;
	ai?: AiHealthResponse;
	[key: string]: unknown;
}

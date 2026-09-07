import type { ListQueryParams } from './shared';

export type ClientQAStandard = 'COPC' | 'STANDARD';

export interface ClientListQueryParams extends ListQueryParams {
	q?: string;
	status?: 'ACTIVE' | 'INACTIVE';
	qaStandard?: ClientQAStandard;
	sortBy?: 'id' | 'name' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Client {
	id: number;
	name: string;
	description?: string | null;
	qaStandard: ClientQAStandard;
	sentimentScore?: number | null;
	status: 'ACTIVE' | 'INACTIVE';
	metadata?: Record<string, unknown> | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface ClientSentimentMetrics {
	clientId: number;
	clientName: string;
	averageSentimentScore: number;
	sentimentScale: 5.0;
	totalEvaluations: number;
	sentimentBreakdown?: {
		veryNegative: number;
		negative: number;
		neutral: number;
		positive: number;
		veryPositive: number;
	};
	lastUpdated?: string;
}

export interface ClientQAMetrics {
	clientId: number;
	clientName: string;
	qaStandard: ClientQAStandard;
	metrics?: Record<string, number>;
	lastUpdated?: string;
}

export interface CreateClientPayload {
	name: string;
	description?: string;
	qaStandard?: ClientQAStandard;
	status?: 'ACTIVE' | 'INACTIVE';
	metadata?: Record<string, unknown>;
}

export interface UpdateClientPayload {
	name?: string;
	description?: string | null;
	qaStandard?: ClientQAStandard;
	status?: 'ACTIVE' | 'INACTIVE';
	metadata?: Record<string, unknown> | null;
}

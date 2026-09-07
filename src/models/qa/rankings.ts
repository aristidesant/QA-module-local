import type { ListQueryParams } from './shared';

export type RankingMetricType = 'QA' | 'SENTIMENT' | 'COMPLIANCE' | 'BUSINESS_INSIGHTS' | 'AUTO_FAILS';
export type RankingEntityType = 'AGENT' | 'SUPERVISOR';

export interface RankingMetricConfig {
	type: RankingMetricType;
	weight?: number;
	threshold?: number;
	sortOrder?: 'ASC' | 'DESC';
}

export interface RankingConfigurationListQueryParams extends ListQueryParams {
	supervisorId?: number;
	entityType?: RankingEntityType;
	status?: 'ACTIVE' | 'INACTIVE';
	sortBy?: 'id' | 'name' | 'startDate' | 'endDate' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface RankingConfiguration {
	id: number;
	clientId?: number;
	name: string;
	description?: string | null;
	supervisorId?: number;
	operationManagerId?: number;
	entityType: RankingEntityType;
	startDate: string;
	endDate: string;
	metrics: RankingMetricConfig[];
	displaySettings?: {
		showAgentNames?: boolean;
		showScores?: boolean;
		maxDisplayCount?: number;
	} | null;
	status: 'ACTIVE' | 'INACTIVE';
	createdAt?: string;
	updatedAt?: string;
}

export interface RankingEntry {
	id: number;
	rankingConfigurationId: number;
	entityId: number;
	entityName: string;
	entityType: RankingEntityType;
	position: number;
	score: number;
	scoreDetails?: Record<string, number>;
	evaluationCount?: number;
	reactionsCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateRankingConfigurationPayload {
	name: string;
	description?: string;
	supervisorId?: number;
	operationManagerId?: number;
	entityType: RankingEntityType;
	startDate: string;
	endDate: string;
	metrics: RankingMetricConfig[];
	displaySettings?: {
		showAgentNames?: boolean;
		showScores?: boolean;
		maxDisplayCount?: number;
	};
	status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateRankingConfigurationPayload {
	name?: string;
	description?: string | null;
	startDate?: string;
	endDate?: string;
	metrics?: RankingMetricConfig[];
	displaySettings?: {
		showAgentNames?: boolean;
		showScores?: boolean;
		maxDisplayCount?: number;
	} | null;
	status?: 'ACTIVE' | 'INACTIVE';
}

export interface RankingWithEntries extends RankingConfiguration {
	entries: RankingEntry[];
}

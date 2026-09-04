import type { ListQueryParams } from './shared';

export type PrimaryMetric = 'QA' | 'SENTIMENT' | 'COMPLIANCE';
export type UpdateFrequency = 'REAL_TIME' | 'DAILY' | 'WEEKLY';

export interface LeaderboardConfigurationListQueryParams extends ListQueryParams {
	clientId?: number;
	supervisorId?: number;
	sortBy?: 'id' | 'primaryMetric' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface LeaderboardConfiguration {
	id: number;
	clientId: number;
	supervisorId: number;

	primaryMetric: PrimaryMetric;
	targetScore: number;

	updateFrequency: UpdateFrequency;

	createdAt?: string;
	updatedAt?: string;
}

export interface LeaderboardPosition {
	agentId: number;
	agentName: string;
	agentEmail?: string | null;
	rank: number;
	score: number;
	progressTowardTarget: number;
	badges?: string[];
	reactionsCount: number;
	lastEvaluationAt?: string | null;
	updatedAt?: string;
}

export interface LeaderboardWithPositions {
	configuration: LeaderboardConfiguration;
	positions: LeaderboardPosition[];
	updatedAt: string;
}

export interface CreateLeaderboardConfigurationPayload {
	supervisorId: number;
	primaryMetric: PrimaryMetric;
	targetScore: number;
	updateFrequency?: UpdateFrequency;
}

export interface UpdateLeaderboardConfigurationPayload {
	primaryMetric?: PrimaryMetric;
	targetScore?: number;
	updateFrequency?: UpdateFrequency;
}

import type { Agent } from './agents';
import type { ListQueryParams } from './shared';

export interface MilestoneListQueryParams extends ListQueryParams {
	clientId?: number;
	supervisorId?: number;
	status?: 'ACTIVE' | 'ARCHIVED';
	sortBy?: 'id' | 'name' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Milestone {
	id: number;
	clientId: number;
	createdByUserId: number;
	supervisorId?: number | null;

	name: string;
	description: string;
	criteria: string;

	status: 'ACTIVE' | 'ARCHIVED';

	createdAt?: string;
	updatedAt?: string;
}

export interface MilestoneAchievement {
	id: number;
	milestoneId: number;
	clientId: number;
	agentId: number;
	agent?: Pick<Agent, 'id' | 'firstName' | 'lastName' | 'email'> | null;

	achievedAt: string;
	createdAt?: string;
}

export interface MilestoneWithAchievements extends Milestone {
	achievements?: MilestoneAchievement[];
	achievementCount?: number;
}

export interface CreateMilestonePayload {
	name: string;
	description: string;
	criteria: string;
	supervisorId?: number;
	status?: 'ACTIVE' | 'ARCHIVED';
}

export interface UpdateMilestonePayload {
	name?: string;
	description?: string;
	criteria?: string;
	status?: 'ACTIVE' | 'ARCHIVED';
}

export interface CreateMilestoneAchievementPayload {
	agentId: number;
	achievedAt?: string;
}

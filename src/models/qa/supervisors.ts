import type { UserModel } from '../UserModels';
import type { ListQueryParams } from './shared';

export interface SupervisorListQueryParams extends ListQueryParams {
	clientId?: number;
	q?: string;
	sortBy?: 'id' | 'name' | 'email' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Supervisor {
	id: number;
	clientId?: number;
	userId: number;
	user?: Pick<UserModel, 'id' | 'email' | 'username' | 'firstName' | 'lastName'> | null;
	name: string;
	email?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface SupervisorTeam {
	supervisorId: number;
	agentIds: number[];
}

export interface SupervisorWithTeam extends Supervisor {
	team?: SupervisorTeam | null;
	agentCount?: number;
}

export interface CreateSupervisorPayload {
	userId: number;
	name: string;
	email?: string;
}

export interface UpdateSupervisorPayload {
	name?: string;
	email?: string;
}

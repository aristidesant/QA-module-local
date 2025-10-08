// src/models/CampaignObjectiveModel.ts

export interface CampaignObjectiveCategory {
	id: number;
	name: string;
	description?: string;
}

export interface CampaignObjective {
	id: number;
	name: string;
	description?: string;
	active: boolean;
	categoryId: number;
	userId: number;
	clientId: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	category?: CampaignObjectiveCategory;
}

export interface CreateCampaignObjectiveRequest {
	name: string;
	description?: string;
	active?: boolean;
	categoryId: number;
	userId?: number;
	clientId?: number;
}

export interface UpdateCampaignObjectiveRequest {
	name?: string;
	description?: string;
	active?: boolean;
	categoryId?: number;
	userId?: number;
	clientId?: number;
}

export interface CampaignObjectiveResponse {
	objectives: CampaignObjective[];
	total: number;
	page?: number;
	limit?: number;
}

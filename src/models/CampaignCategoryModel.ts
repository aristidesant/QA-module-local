// src/models/CampaignCategoryModel.ts

export interface CampaignCategory {
	id: number;
	name: string;
	code: string;
	description?: string;
	active: boolean;
	userId: number;
	clientId: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

export interface CreateCampaignCategoryRequest {
	name: string;
	code: string;
	description?: string;
	active?: boolean;
	userId?: number;
	clientId?: number;
}

export interface UpdateCampaignCategoryRequest {
	name?: string;
	code?: string;
	description?: string;
	active?: boolean;
	userId?: number;
	clientId?: number;
}

export interface CampaignCategoryResponse {
	categories: CampaignCategory[];
	total: number;
	page?: number;
	limit?: number;
}

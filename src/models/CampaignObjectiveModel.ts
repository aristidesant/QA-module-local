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
	total: number;
	limit: number;
	offset: number;
	data: CampaignObjective[];
}

export type CampaignObjectiveWithCategoryName = CampaignObjective & {
	categoryName: string;
};

export interface CampaignObjectiveApiParams {
	name?: string;
	categoryId?: number;
	active?: boolean;
	limit?: number;
	offset?: number;
}

/** Lightweight dropdown option returned by GET /campaign-objectives/all */
export interface CampaignObjectiveDropdownOption {
	id: number;
	name: string;
	categoryId: number;
	categoryName: string;
}

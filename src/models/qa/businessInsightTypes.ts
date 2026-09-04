import type { ListQueryParams } from './shared';

export interface BusinessInsightTypeListQueryParams extends ListQueryParams {
	isActive?: boolean;
	sortBy?: 'id' | 'type' | 'label' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface BusinessInsightType {
	id: number;
	clientId?: number;
	type: string;
	label: string;
	description?: string | null;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateBusinessInsightTypePayload {
	type: string;
	label: string;
	description?: string;
	isActive?: boolean;
}

export type UpdateBusinessInsightTypePayload = Partial<CreateBusinessInsightTypePayload>;

// Predefined types
export const PREDEFINED_BUSINESS_INSIGHTS = {
	EARLY_OBJECTION: {
		type: 'EARLY_OBJECTION',
		label: 'Early Objection',
		description: 'Customer shows objection early in the call',
	},
	UNHANDLED_OBJECTION: {
		type: 'UNHANDLED_OBJECTION',
		label: 'Unhandled Objection',
		description: 'Customer objection was not properly addressed',
	},
	COMPETITOR_PLUS_COST: {
		type: 'COMPETITOR_PLUS_COST',
		label: 'Competitor Plus Cost',
		description: 'Customer mentions competitor with better pricing',
	},
	MISTARGETED_OFFER: {
		type: 'MISTARGETED_OFFER',
		label: 'Mis-targeted Offer',
		description: 'Offer was not appropriate for customer needs',
	},
	BEST_TIME_FRAME: {
		type: 'BEST_TIME_FRAME',
		label: 'Best Time Frame',
		description: 'Ideal time frame for customer purchase identified',
	},
} as const;

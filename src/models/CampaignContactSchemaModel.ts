// src/models/CampaignContactSchemaModel.ts

export interface CampaignContactSchemaField {
	name: string;
	label: string;
	type:
		| 'string'
		| 'number'
		| 'boolean'
		| 'date'
		| 'email'
		| 'phone'
		| 'address';
	isArray: boolean;
	required?: boolean;
	description?: string;
	defaultValue?: string | number | boolean;
	validation?: {
		pattern?: string;
		minLength?: number;
		maxLength?: number;
		min?: number;
		max?: number;
	};
	options?: string[]; // For enum/select types
}

export interface CampaignObjective {
	id: number;
	name: string;
	description?: string;
}

export interface CampaignContactSchema {
	id: number;
	name: string;
	code: string;
	icon?: string;
	description?: string;
	objectiveId: number;
	schemaFields: CampaignContactSchemaField[];
	version: number;
	userId: number;
	clientId: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	objective?: CampaignObjective;
	isDefault?: boolean;
	isActive?: boolean;
	metadata?: Record<string, any>;
}

export interface CreateCampaignContactSchemaRequest {
	name: string;
	code: string;
	icon?: string;
	description?: string;
	objectiveId: number;
	schemaFields: CampaignContactSchemaField[];
	userId?: number;
	clientId?: number;
	isDefault?: boolean;
	metadata?: Record<string, any>;
}

export interface UpdateCampaignContactSchemaRequest {
	name?: string;
	code?: string;
	icon?: string;
	description?: string;
	objectiveId?: number;
	schemaFields?: CampaignContactSchemaField[];
	userId?: number;
	clientId?: number;
	version?: number;
	isDefault?: boolean;
	isActive?: boolean;
	metadata?: Record<string, any>;
}

export interface CampaignContactSchemaResponse {
	schemas: CampaignContactSchema[];
	total: number;
	page?: number;
	limit?: number;
}

export interface SchemaContactDataCheck {
	hasData: boolean;
	contactCount?: number;
	lastContactDate?: string;
}

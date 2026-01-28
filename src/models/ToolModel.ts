import type { ToolCategoryModel } from './ToolCategoryModel';

export interface ToolModel {
	id: number;
	identifier: string;
	prompt: string;
	name: string;
	description: string;
	categoryId: number;
	category: ToolCategoryModel;
	status: 'active' | 'inactive' | string;
	config: ToolConfigWrapper;
	clientId: number;
	userId: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	deletedAt: string | null;
}

export interface ToolConfigWrapper {
	id: string;
	accessInfo: ToolAccessInfo;
	toolConfig: ToolConfig;
}

export interface ToolAccessInfo {
	role: string;
	isCreator: boolean;
	creatorName: string;
	creatorEmail: string;
}

export interface ToolConfig {
	name: string;
	type: string;
	apiSchema: ToolApiSchema;
	description: string;
	dynamicVariables: ToolDynamicVariables;
	responseTimeoutSecs: number;
}

export interface ToolApiSchema {
	url: string;
	method: string;
	requestHeaders: Record<string, string>;
	auth_connection: string | null;
	pathParamsSchema: Record<string, unknown>;
	requestBodySchema: ToolRequestBodySchema;
}

export interface ToolRequestBodySchema {
	type: string;
	required: string[];
	properties: Record<string, ToolRequestBodyProperty>;
	description: string;
}

export interface ToolRequestBodyProperty {
	type: string;
	description: string;
	constantValue: string;
	dynamicVariable: string;
}

export interface ToolDynamicVariables {
	dynamicVariablePlaceholders: Record<string, unknown>;
}

export interface AssignedToolModel {
	agentId: string;
	clientId: number;
	createdAt: string;
	deletedAt: string | null;
	id: number;
	tool: ToolModel;
	toolId: number;
	updatedAt: string;
	userId: number;
}

// Request DTOs for creating/updating tools
export type ToolConfigType = 'webhook' | 'client' | 'system';

export interface WebhookToolConfigRequest {
	type: 'webhook';
	name: string;
	description: string;
	responseTimeoutSecs: number;
	apiSchema: {
		url: string;
		method: string;
		requestHeaders?: Record<string, string>;
		pathParamsSchema?: Record<string, unknown>;
		requestBodySchema?: {
			type: string;
			required?: string[];
			properties?: Record<string, ToolRequestBodyProperty>;
		};
	};
}

export interface CreateToolDto {
	name: string;
	description: string;
	prompt: string;
	categoryId: number;
	status: string;
	config: WebhookToolConfigRequest;
}

export interface UpdateToolDto extends Partial<CreateToolDto> {}

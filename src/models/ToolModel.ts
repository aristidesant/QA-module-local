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
	responseMocks?: ResponseMock[];
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface ResponseMock {
	parameterConditions: unknown[];
	mockResult: string;
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
	queryParamsSchema?: Record<string, unknown>;
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

export type ToolConfigType = 'webhook' | 'client' | 'system' | 'mcp';

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
		queryParamsSchema?: Record<string, unknown>;
		requestBodySchema?: {
			type: string;
			required?: string[];
			properties?: Record<string, ToolRequestBodyProperty>;
		};
	};
}

export interface ClientToolConfigRequest {
	type: 'client';
	name: string;
	description: string;
	expectsResponse?: boolean;
	parameters?: {
		type: string;
		properties?: Record<string, { type: string; description?: string }>;
	};
}

export interface SystemToolConfigRequest {
	type: 'system';
	name: string;
	params: {
		systemToolType: string;
	};
}

export interface McpToolConfigRequest {
	type: 'mcp';
	name: string;
	description: string;
}

export type ToolConfigRequest =
	| WebhookToolConfigRequest
	| ClientToolConfigRequest
	| SystemToolConfigRequest
	| McpToolConfigRequest;

export interface CreateToolDto {
	name: string;
	description: string;
	prompt: string;
	categoryId: number;
	status: string;
	config: ToolConfigRequest;
	responseMocks?: ResponseMock[];
}

export interface UpdateToolDto extends Partial<CreateToolDto> {}

export interface DependentAgent {
	type: string;
	referencedResourceIds: string[];
	id: string;
	name: string;
	createdAtUnixSecs: number;
	accessLevel: string;
}

export interface DependentAgentsResponse {
	agents: DependentAgent[];
	branches: unknown[];
	hasMore: boolean;
}

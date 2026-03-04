export type CustomVariableValueType =
	| 'llm_type'
	| 'llm_prompt'
	| 'constant'
	| 'dynamic'
	| string;

export interface CustomVariableValue {
	type: string;
	description?: string;
	enum?: string[];
	is_system_provided?: boolean;
	dynamic_variable?: string;
	constant_value?: string;
	value_type?: CustomVariableValueType;
}

export interface CustomVariable {
	id: number;
	label: string;
	name: string;
	templateId: number;
	categoryId: number | null;
	clientId: number | null;
	userId: number;
	value: CustomVariableValue;
	createdAt: string;
	updatedAt: string;
}

export interface CustomVariableTemplate {
	id: number;
	name: string;
	clientId: number | null;
	userId: number;
	campaignId: number | null;
	sourceTemplateId: number | null;
	createdAt: string;
	updatedAt: string;
	customVariables?: CustomVariable[];
}

export interface CustomVariableTemplateListResponse {
	total: number;
	limit: number;
	offset: number;
	templates: CustomVariableTemplate[];
}

export interface CustomVariableTemplateApiParams {
	limit?: number;
	offset?: number;
}

export interface CreateCustomVariableTemplateRequest {
	name: string;
}

export interface UpdateCustomVariableTemplateRequest {
	name?: string;
}

export interface CreateCustomVariableRequest {
	label: string;
	name: string;
	categoryId?: number | null;
	value: CustomVariableValue;
}

export interface UpdateCustomVariableRequest {
	label?: string;
	name?: string;
	categoryId?: number | null;
	value?: CustomVariableValue;
}

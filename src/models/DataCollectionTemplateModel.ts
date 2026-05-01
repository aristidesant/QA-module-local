export type DataCollectionTemplateValueType =
	| 'llm_type'
	| 'llm_prompt'
	| 'constant'
	| 'dynamic'
	| string;

export interface DataCollectionTemplateValue {
	type: string;
	description?: string;
	enum?: string[];
	is_system_provided?: boolean;
	dynamic_variable?: string;
	constant_value?: string;
	value_type?: DataCollectionTemplateValueType;
}

export interface DataCollectionTemplateVariable {
	id: number;
	label: string;
	name: string;
	templateId: number;
	categoryId: number | null;
	clientId: number | null;
	userId: number;
	value: DataCollectionTemplateValue;
	createdAt: string;
	updatedAt: string;
}

export interface DataCollectionTemplateGroup {
	id: number;
	name: string;
	clientId: number | null;
	userId: number;
	campaignId: number | null;
	sourceTemplateId: number | null;
	createdAt: string;
	updatedAt: string;
	customVariables?: DataCollectionTemplateVariable[];
}

export interface DataCollectionTemplateGroupListResponse {
	total: number;
	limit: number;
	offset: number;
	templates: DataCollectionTemplateGroup[];
}

export interface DataCollectionTemplateGroupApiParams {
	limit?: number;
	offset?: number;
}

export interface CreateDataCollectionTemplateGroupRequest {
	name: string;
}

export interface UpdateDataCollectionTemplateGroupRequest {
	name?: string;
}

export interface CreateDataCollectionTemplateVariableRequest {
	label: string;
	name: string;
	categoryId?: number | null;
	value: DataCollectionTemplateValue;
}

export interface UpdateDataCollectionTemplateVariableRequest {
	label?: string;
	name?: string;
	categoryId?: number | null;
	value?: DataCollectionTemplateValue;
}

export type CustomVariableValueType = DataCollectionTemplateValueType;
export type CustomVariableValue = DataCollectionTemplateValue;
export type CustomVariable = DataCollectionTemplateVariable;
export type CustomVariableTemplate = DataCollectionTemplateGroup;
export type CustomVariableTemplateListResponse =
	DataCollectionTemplateGroupListResponse;
export type CustomVariableTemplateApiParams =
	DataCollectionTemplateGroupApiParams;
export type CreateCustomVariableTemplateRequest =
	CreateDataCollectionTemplateGroupRequest;
export type UpdateCustomVariableTemplateRequest =
	UpdateDataCollectionTemplateGroupRequest;
export type CreateCustomVariableRequest =
	CreateDataCollectionTemplateVariableRequest;
export type UpdateCustomVariableRequest =
	UpdateDataCollectionTemplateVariableRequest;

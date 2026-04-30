import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	CreateCustomVariableRequest,
	CreateCustomVariableTemplateRequest,
	CustomVariable,
	CustomVariableTemplate,
	CustomVariableTemplateApiParams,
	CustomVariableTemplateListResponse,
	UpdateCustomVariableRequest,
	UpdateCustomVariableTemplateRequest,
} from '~/models/CustomVariableModel';

const DATA_COLLECTION_TEMPLATE_GROUPS_PATH = 'data-collection-template-groups';

const customVariableTemplatesApi = (
	_authHeader: Record<string, string> = {}
) => {
	return {
		getCustomVariableTemplates: async (
			params?: CustomVariableTemplateApiParams
		): Promise<CustomVariableTemplateListResponse> => {
			const response = await axios.get<CustomVariableTemplateListResponse>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}`,
				{ params }
			);
			return response.data;
		},

		getCustomVariableTemplateById: async (
			id: number
		): Promise<CustomVariableTemplate> => {
			const response = await axios.get<CustomVariableTemplate>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${id}`
			);
			return response.data;
		},

		createCustomVariableTemplate: async (
			data: CreateCustomVariableTemplateRequest
		): Promise<CustomVariableTemplate> => {
			const response = await axios.post<CustomVariableTemplate>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}`,
				data
			);
			return response.data;
		},

		updateCustomVariableTemplate: async (
			id: number,
			data: UpdateCustomVariableTemplateRequest
		): Promise<CustomVariableTemplate> => {
			const response = await axios.patch<CustomVariableTemplate>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${id}`,
				data
			);
			return response.data;
		},

		deleteCustomVariableTemplate: async (id: number): Promise<void> => {
			await axios.delete(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${id}`
			);
		},

		cloneCustomVariableTemplate: async (
			id: number
		): Promise<CustomVariableTemplate> => {
			const response = await axios.post<CustomVariableTemplate>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${id}/clone`
			);
			return response.data;
		},

		assignTemplateToCampaign: async (
			id: number,
			campaignId: number
		): Promise<CustomVariableTemplate> => {
			const response = await axios.post<CustomVariableTemplate>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${id}/assign-campaign/${campaignId}`
			);
			return response.data;
		},

		getTemplateVariables: async (
			templateId: number
		): Promise<CustomVariable[]> => {
			const response = await axios.get<CustomVariable[]>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${templateId}/variables`
			);
			return response.data;
		},

		getTemplateVariableById: async (
			templateId: number,
			variableId: number
		): Promise<CustomVariable> => {
			const response = await axios.get<CustomVariable>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${templateId}/variables/${variableId}`
			);
			return response.data;
		},

		createTemplateVariable: async (
			templateId: number,
			data: CreateCustomVariableRequest
		): Promise<CustomVariable> => {
			const response = await axios.post<CustomVariable>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${templateId}/variables`,
				data
			);
			return response.data;
		},

		updateTemplateVariable: async (
			templateId: number,
			variableId: number,
			data: UpdateCustomVariableRequest
		): Promise<CustomVariable> => {
			const response = await axios.patch<CustomVariable>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${templateId}/variables/${variableId}`,
				data
			);
			return response.data;
		},

		deleteTemplateVariable: async (
			templateId: number,
			variableId: number
		): Promise<void> => {
			await axios.delete(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${templateId}/variables/${variableId}`
			);
		},
	};
};

export default customVariableTemplatesApi;

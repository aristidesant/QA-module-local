import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	CreateDataCollectionTemplateGroupRequest,
	CreateDataCollectionTemplateVariableRequest,
	DataCollectionTemplateGroup,
	DataCollectionTemplateGroupApiParams,
	DataCollectionTemplateGroupListResponse,
	DataCollectionTemplateVariable,
	UpdateDataCollectionTemplateGroupRequest,
	UpdateDataCollectionTemplateVariableRequest,
} from '~/models/DataCollectionTemplateModel';

const DATA_COLLECTION_TEMPLATE_GROUPS_PATH = 'data-collection-template-groups';

const dataCollectionTemplateGroupsApi = (
	_authHeader: Record<string, string> = {}
) => {
	return {
		getCustomVariableTemplates: async (
			params?: DataCollectionTemplateGroupApiParams
		): Promise<DataCollectionTemplateGroupListResponse> => {
			const response = await axios.get<DataCollectionTemplateGroupListResponse>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}`,
				{ params }
			);
			return response.data;
		},

		getCustomVariableTemplateById: async (
			id: number
		): Promise<DataCollectionTemplateGroup> => {
			const response = await axios.get<DataCollectionTemplateGroup>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${id}`
			);
			return response.data;
		},

		createCustomVariableTemplate: async (
			data: CreateDataCollectionTemplateGroupRequest
		): Promise<DataCollectionTemplateGroup> => {
			const response = await axios.post<DataCollectionTemplateGroup>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}`,
				data
			);
			return response.data;
		},

		updateCustomVariableTemplate: async (
			id: number,
			data: UpdateDataCollectionTemplateGroupRequest
		): Promise<DataCollectionTemplateGroup> => {
			const response = await axios.patch<DataCollectionTemplateGroup>(
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
		): Promise<DataCollectionTemplateGroup> => {
			const response = await axios.post<DataCollectionTemplateGroup>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${id}/clone`
			);
			return response.data;
		},

		assignTemplateToCampaign: async (
			id: number,
			campaignId: number
		): Promise<DataCollectionTemplateGroup> => {
			const response = await axios.post<DataCollectionTemplateGroup>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${id}/assign-campaign/${campaignId}`
			);
			return response.data;
		},

		getTemplateVariables: async (
			templateId: number
		): Promise<DataCollectionTemplateVariable[]> => {
			const response = await axios.get<DataCollectionTemplateVariable[]>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${templateId}/variables`
			);
			return response.data;
		},

		getTemplateVariableById: async (
			templateId: number,
			variableId: number
		): Promise<DataCollectionTemplateVariable> => {
			const response = await axios.get<DataCollectionTemplateVariable>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${templateId}/variables/${variableId}`
			);
			return response.data;
		},

		createTemplateVariable: async (
			templateId: number,
			data: CreateDataCollectionTemplateVariableRequest
		): Promise<DataCollectionTemplateVariable> => {
			const response = await axios.post<DataCollectionTemplateVariable>(
				`${DEFAULT_API_URL}/${DATA_COLLECTION_TEMPLATE_GROUPS_PATH}/${templateId}/variables`,
				data
			);
			return response.data;
		},

		updateTemplateVariable: async (
			templateId: number,
			variableId: number,
			data: UpdateDataCollectionTemplateVariableRequest
		): Promise<DataCollectionTemplateVariable> => {
			const response = await axios.patch<DataCollectionTemplateVariable>(
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

export default dataCollectionTemplateGroupsApi;

export { dataCollectionTemplateGroupsApi as customVariableTemplatesApi };

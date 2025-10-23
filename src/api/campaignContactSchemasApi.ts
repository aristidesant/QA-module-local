import axios from 'axios';
import type {
	CampaignContactSchema,
	CampaignContactSchemaResponse,
	CampaignContactSchemaApiParams,
	CreateCampaignContactSchemaRequest,
	UpdateCampaignContactSchemaRequest,
	SchemaContactDataCheck,
} from '../models/CampaignContactSchemaModel';
import { DEFAULT_API_URL } from './config';

/**
 * Campaign Contact Schemas API client
 */
const campaignContactSchemasApi = (
	_authHeader: Record<string, string> = {}
) => {
	return {
		/**
		 * Create a new campaign contact schema
		 */
		createCampaignContactSchema: async (
			data: CreateCampaignContactSchemaRequest
		): Promise<CampaignContactSchema> => {
			const response = await axios.post<CampaignContactSchema>(
				`${DEFAULT_API_URL}/campaign-contact-schemas`,
				data
			);
			return response.data;
		},

		/**
		 * Get all campaign contact schemas
		 */
		getCampaignContactSchemas: async (
			params?: CampaignContactSchemaApiParams
		): Promise<CampaignContactSchemaResponse> => {
			const response = await axios.get<CampaignContactSchemaResponse>(
				`${DEFAULT_API_URL}/campaign-contact-schemas`,
				{ params }
			);
			return response.data;
		},

		/**
		 * Get campaign contact schema by ID
		 */
		getCampaignContactSchemaById: async (
			id: number
		): Promise<CampaignContactSchema> => {
			const response = await axios.get<CampaignContactSchema>(
				`${DEFAULT_API_URL}/campaign-contact-schemas/${id}`
			);
			return response.data;
		},

		/**
		 * Update campaign contact schema
		 */
		updateCampaignContactSchema: async (
			id: number,
			data: UpdateCampaignContactSchemaRequest
		): Promise<CampaignContactSchema> => {
			const response = await axios.patch<CampaignContactSchema>(
				`${DEFAULT_API_URL}/campaign-contact-schemas/${id}`,
				data
			);
			return response.data;
		},

		/**
		 * Delete campaign contact schema
		 */
		deleteCampaignContactSchema: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/campaign-contact-schemas/${id}`);
		},

		/**
		 * Check if schema has associated contact data
		 */
		checkSchemaHasContactData: async (
			id: number
		): Promise<SchemaContactDataCheck> => {
			const response = await axios.get<SchemaContactDataCheck>(
				`${DEFAULT_API_URL}/campaign-contact-schemas/has-contact-data/${id}`
			);
			return response.data;
		},

		/**
		 * Get schema by objective ID
		 */
		getSchemaByObjectiveId: async (
			objectiveId: number
		): Promise<CampaignContactSchemaResponse> => {
			const response = await axios.get<CampaignContactSchemaResponse>(
				`${DEFAULT_API_URL}/campaign-contact-schemas/objective/${objectiveId}`
			);
			return response.data;
		},

		/**
		 * Get active schema by campaign ID
		 */
		getActiveSchemaByCampaignId: async (
			campaignId: number
		): Promise<CampaignContactSchema> => {
			const response = await axios.get<CampaignContactSchema>(
				`${DEFAULT_API_URL}/campaign-contact-schemas/campaign/${campaignId}/active`
			);
			return response.data;
		},
	};
};

export default campaignContactSchemasApi;

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import campaignContactSchemasApi from '~/api/campaignContactSchemasApi';
import type {
	CampaignContactSchemaApiParams,
	CreateCampaignContactSchemaRequest,
	UpdateCampaignContactSchemaRequest,
} from '../models/CampaignContactSchemaModel';

// Create campaign contact schema
export const useCreateCampaignContactSchema = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateCampaignContactSchemaRequest) => {
			const api = campaignContactSchemasApi();
			return api.createCampaignContactSchema(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaign-contact-schemas'] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating campaign contact schema:', error);
		},
	});
};

// Get all campaign contact schemas
export const useGetCampaignContactSchemas = (
	params?: CampaignContactSchemaApiParams,
	enabled = true
) => {
	return useQuery({
		queryKey: ['campaign-contact-schemas', params],
		queryFn: async () => {
			const api = campaignContactSchemasApi();
			return api.getCampaignContactSchemas(params);
		},
		enabled,
	});
};

// Get campaign contact schema by ID
export const useGetCampaignContactSchemaById = (id: number, enabled = true) => {
	return useQuery({
		queryKey: ['campaign-contact-schema', id],
		queryFn: async () => {
			const api = campaignContactSchemasApi();
			return api.getCampaignContactSchemaById(id);
		},
		enabled: enabled && !!id,
	});
};

// Update campaign contact schema
export const useUpdateCampaignContactSchema = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateCampaignContactSchemaRequest;
		}) => {
			const api = campaignContactSchemasApi();
			return api.updateCampaignContactSchema(id, data);
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-contact-schemas'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign-contact-schema', variables.id],
			});
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error updating campaign contact schema:', error);
		},
	});
};

// Delete campaign contact schema
export const useDeleteCampaignContactSchema = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = campaignContactSchemasApi();
			return api.deleteCampaignContactSchema(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-contact-schemas'] });
			queryClient.removeQueries({ queryKey: ['campaign-contact-schema', id] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error deleting campaign contact schema:', error);
		},
	});
};

// Check if schema has contact data
export const useCheckSchemaHasContactData = (id: number, enabled = true) => {
	return useQuery({
		queryKey: ['campaign-contact-schema-has-data', id],
		queryFn: async () => {
			const api = campaignContactSchemasApi();
			return api.checkSchemaHasContactData(id);
		},
		enabled: enabled && !!id,
	});
};

// Get schema by objective ID
export const useGetSchemaByObjectiveId = (
	objectiveId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: ['campaign-contact-schema-by-objective', objectiveId],
		queryFn: async () => {
			const api = campaignContactSchemasApi();
			return api.getSchemaByObjectiveId(objectiveId);
		},
		enabled: enabled && !!objectiveId,
	});
};

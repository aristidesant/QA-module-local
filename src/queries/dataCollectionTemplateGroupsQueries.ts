import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dataCollectionTemplateGroupsApi from '~/api/dataCollectionTemplateGroupsApi';
import type {
	CreateDataCollectionTemplateGroupRequest,
	CreateDataCollectionTemplateVariableRequest,
	DataCollectionTemplateGroupApiParams,
	UpdateDataCollectionTemplateGroupRequest,
	UpdateDataCollectionTemplateVariableRequest,
} from '~/models/DataCollectionTemplateModel';

export const useGetCustomVariableTemplates = (
	params?: DataCollectionTemplateGroupApiParams
) => {
	return useQuery({
		queryKey: ['custom-variable-templates', params],
		queryFn: async () => {
			const api = dataCollectionTemplateGroupsApi();
			return api.getCustomVariableTemplates(params);
		},
	});
};

export const useGetCustomVariableTemplateById = (
	templateId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: ['custom-variable-template', templateId],
		queryFn: async () => {
			const api = dataCollectionTemplateGroupsApi();
			return api.getCustomVariableTemplateById(templateId);
		},
		enabled: enabled && Boolean(templateId),
	});
};

export const useCreateCustomVariableTemplate = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateDataCollectionTemplateGroupRequest) => {
			const api = dataCollectionTemplateGroupsApi();
			return api.createCustomVariableTemplate(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-templates'],
			});
		},
	});
};

export const useUpdateCustomVariableTemplate = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateDataCollectionTemplateGroupRequest;
		}) => {
			const api = dataCollectionTemplateGroupsApi();
			return api.updateCustomVariableTemplate(id, data);
		},
		onSuccess: (template, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-templates'],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', variables.id],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', template.id],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-variables', template.id],
			});
		},
	});
};

export const useDeleteCustomVariableTemplate = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = dataCollectionTemplateGroupsApi();
			return api.deleteCustomVariableTemplate(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-templates'],
			});
			queryClient.removeQueries({ queryKey: ['custom-variable-template', id] });
			queryClient.removeQueries({
				queryKey: ['custom-variable-variables', id],
			});
		},
	});
};

export const useCloneCustomVariableTemplate = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = dataCollectionTemplateGroupsApi();
			return api.cloneCustomVariableTemplate(id);
		},
		onSuccess: (template, sourceId) => {
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-templates'],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', sourceId],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', template.id],
			});
		},
	});
};

export const useAssignCustomVariableTemplateToCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			templateId,
			campaignId,
		}: {
			templateId: number;
			campaignId: number;
		}) => {
			const api = dataCollectionTemplateGroupsApi();
			return api.assignTemplateToCampaign(templateId, campaignId);
		},
		onSuccess: (template, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-templates'],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', variables.templateId],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', template.id],
			});
		},
	});
};

export const useGetTemplateVariables = (templateId: number, enabled = true) => {
	return useQuery({
		queryKey: ['custom-variable-variables', templateId],
		queryFn: async () => {
			const api = dataCollectionTemplateGroupsApi();
			return api.getTemplateVariables(templateId);
		},
		enabled: enabled && Boolean(templateId),
	});
};

export const useGetTemplateVariableById = (
	templateId: number,
	variableId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: ['custom-variable-variable', templateId, variableId],
		queryFn: async () => {
			const api = dataCollectionTemplateGroupsApi();
			return api.getTemplateVariableById(templateId, variableId);
		},
		enabled: enabled && Boolean(templateId) && Boolean(variableId),
	});
};

export const useCreateTemplateVariable = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			templateId,
			data,
		}: {
			templateId: number;
			data: CreateDataCollectionTemplateVariableRequest;
		}) => {
			const api = dataCollectionTemplateGroupsApi();
			return api.createTemplateVariable(templateId, data);
		},
		onSuccess: (variable) => {
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-templates'],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', variable.templateId],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-variables', variable.templateId],
			});
		},
	});
};

export const useUpdateTemplateVariable = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			templateId,
			variableId,
			data,
		}: {
			templateId: number;
			variableId: number;
			data: UpdateDataCollectionTemplateVariableRequest;
		}) => {
			const api = dataCollectionTemplateGroupsApi();
			return api.updateTemplateVariable(templateId, variableId, data);
		},
		onSuccess: (variable) => {
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-templates'],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', variable.templateId],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-variables', variable.templateId],
			});
			queryClient.invalidateQueries({
				queryKey: [
					'custom-variable-variable',
					variable.templateId,
					variable.id,
				],
			});
		},
	});
};

export const useDeleteTemplateVariable = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			templateId,
			variableId,
		}: {
			templateId: number;
			variableId: number;
		}) => {
			const api = dataCollectionTemplateGroupsApi();
			return api.deleteTemplateVariable(templateId, variableId);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-templates'],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-template', variables.templateId],
			});
			queryClient.invalidateQueries({
				queryKey: ['custom-variable-variables', variables.templateId],
			});
			queryClient.removeQueries({
				queryKey: [
					'custom-variable-variable',
					variables.templateId,
					variables.variableId,
				],
			});
		},
	});
};

export {
	useGetCustomVariableTemplates as useGetDataCollectionTemplateGroups,
	useGetCustomVariableTemplateById as useGetDataCollectionTemplateGroupById,
	useCreateCustomVariableTemplate as useCreateDataCollectionTemplateGroup,
	useUpdateCustomVariableTemplate as useUpdateDataCollectionTemplateGroup,
	useDeleteCustomVariableTemplate as useDeleteDataCollectionTemplateGroup,
	useCloneCustomVariableTemplate as useCloneDataCollectionTemplateGroup,
	useAssignCustomVariableTemplateToCampaign as useAssignDataCollectionTemplateGroupToCampaign,
	useGetTemplateVariables as useGetDataCollectionTemplateVariables,
	useGetTemplateVariableById as useGetDataCollectionTemplateVariableById,
	useCreateTemplateVariable as useCreateDataCollectionTemplateVariable,
	useUpdateTemplateVariable as useUpdateDataCollectionTemplateVariable,
	useDeleteTemplateVariable as useDeleteDataCollectionTemplateVariable,
};

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import contactGroupFilesApi from '~/api/contactGroupFilesApi';
import type {
	ContactFileSummary,
	ProcessContactGroupFileRequest,
	ProcessContactGroupFileResponse,
} from '~/models/ContactFileSummary';
import { useCampaignsStore } from '~/stores/campaignsStore';

export interface ContactList {
	id: string;
	name: string;
	expires?: string;
	isActive: boolean;
}

interface UploadContactGroupFileOptions {
	onSuccess?: (data: ContactFileSummary) => void;
	onError?: (error: unknown) => void;
}

export const useUploadContactGroupFile = (
	options?: UploadContactGroupFileOptions
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			file: File;
			campaignId: string | number;
		}): Promise<ContactFileSummary> => {
			if (!params.campaignId) throw new Error('Campaign ID is required');
			const api = contactGroupFilesApi();
			return api.uploadContactGroupFile(params.file, Number(params.campaignId));
		},
		onSuccess: (data, variables) => {
			// Invalidate contact-related queries
			queryClient.invalidateQueries({
				queryKey: ['campaignContacts', Number(variables.campaignId)],
			});
			queryClient.invalidateQueries({
				queryKey: ['contactSummaryGroups', Number(variables.campaignId)],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaignSchedules', Number(variables.campaignId)],
			});

			// Trigger store update
			useCampaignsStore.getState().invalidateContacts();

			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
};

interface ProcessContactGroupFileOptions {
	onSuccess?: (data: ProcessContactGroupFileResponse) => void;
	onError?: (error: unknown) => void;
}

export const useProcessContactGroupFile = (
	options?: ProcessContactGroupFileOptions
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			data: ProcessContactGroupFileRequest
		): Promise<ProcessContactGroupFileResponse> => {
			const api = contactGroupFilesApi();
			return api.processContactGroupFile(data);
		},
		onSuccess: (data) => {
			// Invalidate all contact-related queries across campaigns
			queryClient.invalidateQueries({
				queryKey: ['campaignContacts'],
			});
			queryClient.invalidateQueries({
				queryKey: ['contactSummaryGroups'],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaignSchedules'],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaignActiveScheduler'],
			});

			// Trigger store update
			useCampaignsStore.getState().invalidateContacts();

			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
};

// Export original contact group file (CSV) using stored mapping & column order
export const useExportContactGroupFileOriginal = (contactGroupId: number) => {
	return useQuery({
		queryKey: ['contactGroupFileOriginalExport', contactGroupId],
		queryFn: async () => {
			const api = contactGroupFilesApi();
			return api.exportContactGroupFileOriginal(contactGroupId);
		},
		enabled: false, // manual trigger via refetch
	});
};

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import contactGroupFilesApi from '~/api/contactGroupFilesApi';
import type {
	ContactFileSummary,
	ProcessContactGroupFileRequest,
	ProcessContactGroupFileResponse,
	AppendContactGroupFileResponse,
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

interface AppendContactGroupFileOptions {
	onSuccess?: (data: AppendContactGroupFileResponse) => void;
	onError?: (error: unknown) => void;
}

// Append contacts from an uploaded file into an existing contact group
export const useAppendContactGroupFile = (
	options?: AppendContactGroupFileOptions
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			contactGroupId: number;
			contactGroupFileId: number;
		}): Promise<AppendContactGroupFileResponse> => {
			const api = contactGroupFilesApi();
			return api.appendToContactGroup(params.contactGroupId, {
				contactGroupFileId: params.contactGroupFileId,
			});
		},
		onSuccess: (_data, variables) => {
			// Invalidate contact-related queries to reflect appended data
			queryClient.invalidateQueries({ queryKey: ['campaignContacts'] });
			queryClient.invalidateQueries({ queryKey: ['contactSummaryGroups'] });
			queryClient.invalidateQueries({ queryKey: ['campaignSchedules'] });
			queryClient.invalidateQueries({ queryKey: ['campaignActiveScheduler'] });
			// Refresh contact group contacts (table)
			if (variables?.contactGroupId) {
				queryClient.invalidateQueries({
					queryKey: ['contactGroupContacts', variables.contactGroupId],
				});
				// Also invalidate faulty phone numbers alert data
				queryClient.invalidateQueries({
					queryKey: [
						'contactGroupContactsWithPhoneValidationErrors',
						variables.contactGroupId,
					],
				});
			}

			// Trigger store update
			useCampaignsStore.getState().invalidateContacts();

			options?.onSuccess?.(_data);
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

// Fetch latest contact group file summary for a contact group
export const useLatestContactGroupFile = (
	contactGroupId: number,
	enabled: boolean = !!contactGroupId
) => {
	return useQuery({
		queryKey: ['latestContactGroupFile', contactGroupId],
		queryFn: async () => {
			const api = contactGroupFilesApi();
			return api.getLatestContactGroupFile(contactGroupId);
		},
		enabled,
	});
};

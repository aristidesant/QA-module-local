import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseQueryOptions,
} from '@tanstack/react-query';
import contactGroupApi from '~/api/contactGroupApi';
import type {
	CampaignContactList,
	CampaignContactListsParams,
} from '~/models/ContactGroup';
import type ContactGroup from '~/models/ContactGroup';
import type { PaginatedResponse } from '~/models/CampaignsModel';

// Create contact group
export const useCreateContactGroup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (contactGroup: Partial<ContactGroup>) => {
			const api = contactGroupApi();
			return api.createContactGroup(contactGroup);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			void data;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Get all contact groups (paginated)
export const useGetContactGroups = (
	params?: Record<string, any>,
	options?: Partial<UseQueryOptions<PaginatedResponse<ContactGroup>>>
) => {
	return useQuery<PaginatedResponse<ContactGroup>>({
		queryKey: ['contactGroups', params],
		queryFn: async () => {
			const api = contactGroupApi();
			return api.findAllContactGroups(params);
		},
		...options,
	});
};

// Get a single contact group by id
export const useGetContactGroup = (id: number) => {
	return useQuery({
		queryKey: ['contactGroup', id],
		queryFn: async () => {
			const api = contactGroupApi();
			return api.findContactGroup(id);
		},
		enabled: !!id,
		retry: false,
	});
};

// Get campaign contact lists
export const useGetCampaignContactLists = (
	campaignId: number | undefined,
	params?: CampaignContactListsParams,
	options?: Partial<UseQueryOptions<CampaignContactList[]>>
) => {
	return useQuery<CampaignContactList[]>({
		queryKey: ['campaignContactLists', campaignId, params],
		queryFn: async () => {
			const api = contactGroupApi();
			return api.findCampaignContactLists(campaignId!, params);
		},
		enabled: !!campaignId,
		retry: false,
		...options,
	});
};

// Update contact group
export const useUpdateContactGroup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			updateData,
		}: {
			id: number;
			updateData: Partial<ContactGroup>;
		}) => {
			const api = contactGroupApi();
			return api.updateContactGroup(id, updateData);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['contactGroup', data.id] });
			}
			void data;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Delete contact group
export const useDeleteContactGroup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = contactGroupApi();
			return api.deleteContactGroup(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			queryClient.invalidateQueries({ queryKey: ['contactGroup', id] });
		},
		onError: (error) => {
			void error;
		},
	});
};

// Add contact to group
export const useAddContactToGroup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			groupId,
			contactId,
		}: {
			groupId: number;
			contactId: number;
		}) => {
			const api = contactGroupApi();
			return api.addContactToGroup(groupId, contactId);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['groupContacts', variables.groupId],
			});
			void variables;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Remove contact from group
export const useRemoveContactFromGroup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			groupId,
			contactId,
		}: {
			groupId: number;
			contactId: number;
		}) => {
			const api = contactGroupApi();
			return api.removeContactFromGroup(groupId, contactId);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['groupContacts', variables.groupId],
			});
			void variables;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Add multiple contacts to group (bulk)
export const useAddContactsToGroupBulk = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			groupId,
			contactIds,
		}: {
			groupId: number;
			contactIds: number[];
		}) => {
			const api = contactGroupApi();
			return api.addContactsToGroupBulk(groupId, contactIds);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['groupContacts', variables.groupId],
			});
			void variables;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Toggle contact group active status
export const useToggleContactGroupStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
			const api = contactGroupApi();
			return api.toggleContactGroupStatus(id, isActive);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['contactGroup', data.id] });
			}
			void data;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Extend waves for a contact group in EXECUTED state
export const useExtendContactGroupWaves = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			additionalWaves,
		}: {
			id: number;
			additionalWaves: number;
		}) => {
			const api = contactGroupApi();
			return api.extendContactGroupWaves(id, additionalWaves);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['contactGroup', data.id] });
			}
		},
	});
};

// Complete an executed contact group
export const useCompleteContactGroup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = contactGroupApi();
			return api.completeContactGroup(id);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['contactGroup', data.id] });
			}
		},
	});
};

import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseQueryOptions,
} from '@tanstack/react-query';
import contactGroupApi from '~/api/contactGroupApi';
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
			// eslint-disable-next-line no-console
			console.log('Contact group created successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating contact group:', error);
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
			// eslint-disable-next-line no-console
			console.log('Contact group updated successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error updating contact group:', error);
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
			// eslint-disable-next-line no-console
			console.log('Contact group deleted successfully:', id);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error deleting contact group:', error);
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
			// eslint-disable-next-line no-console
			console.log('Contact added to group successfully:', variables);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error adding contact to group:', error);
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
			// eslint-disable-next-line no-console
			console.log('Contact removed from group successfully:', variables);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error removing contact from group:', error);
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
			// eslint-disable-next-line no-console
			console.log('Contacts added to group in bulk successfully:', variables);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error adding contacts to group in bulk:', error);
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
			// eslint-disable-next-line no-console
			console.log(
				`Contact group ${data?.isActive ? 'activated' : 'deactivated'} successfully:`,
				data
			);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error toggling contact group status:', error);
		},
	});
};

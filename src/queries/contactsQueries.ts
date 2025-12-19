import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import contactsApi from '~/api/contactsApi';
import type { Contact, UpdateContactPayload } from '~/models/ContactsModel';

// Create contact
export const useCreateContact = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (contact: Partial<Contact>) => {
			const api = contactsApi();
			return api.createContact(contact);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['contacts'] });
			// eslint-disable-next-line no-console
			console.log('Contact created successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating contact:', error);
		},
	});
};

// Get all contacts
export const useGetAllContacts = (params?: Record<string, any>) => {
	return useQuery({
		queryKey: ['contacts', params],
		queryFn: async () => {
			const api = contactsApi();
			return api.findAllContacts(params);
		},
	});
};

// Get contact by id
export const useGetContact = (id: string) => {
	return useQuery({
		queryKey: ['contact', id],
		queryFn: async () => {
			const api = contactsApi();
			return api.findContact(id);
		},
		enabled: !!id,
	});
};

export const useGetContactGroupContacts = (
	contactGroupId: number,
	params?: {
		limit?: number;
		offset?: number;
		name?: string;
		email?: string;
		phone?: string;
		status?: string;
		excludeInvalid?: boolean;
	}
) => {
	return useQuery({
		queryKey: ['contactGroupContacts', contactGroupId, params],
		queryFn: async () => {
			const api = contactsApi();
			return api.findContactGroupContacts(contactGroupId, params);
		},
		enabled: !!contactGroupId,
	});
};

// Update a specific contact's phone number
export const useUpdateContactPhoneNumber = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			contactId: number | string;
			phoneNumberId: number | string;
			phoneNumber: string;
		}) => {
			const api = contactsApi();
			return api.updateContactPhoneNumber(
				params.contactId,
				params.phoneNumberId,
				{ phoneNumber: params.phoneNumber }
			);
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['contacts'] });
			if (variables?.contactId) {
				queryClient.invalidateQueries({
					queryKey: ['contact', String(variables.contactId)],
				});
			}
			// eslint-disable-next-line no-console
			console.log('Contact phone number updated successfully');
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error updating contact phone number:', error);
		},
	});
};

// Delete contact phone number
export const useDeleteContactPhoneNumber = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			contactId,
			phoneNumberId,
		}: {
			contactId: number | string;
			phoneNumberId: number | string;
		}) => {
			const api = contactsApi();
			return api.deleteContactPhoneNumber(contactId, phoneNumberId);
		},
		onSuccess: (_, { contactId }) => {
			queryClient.invalidateQueries({ queryKey: ['contacts'] });
			queryClient.invalidateQueries({
				queryKey: ['contact', String(contactId)],
			});
			// eslint-disable-next-line no-console
			console.log('Contact phone number deleted successfully');
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error deleting contact phone number:', error);
		},
	});
};

// Create phone numbers for an existing contact
export const useCreateContactPhoneNumbers = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			contactId: number | string;
			phones: string[];
		}) => {
			const api = contactsApi();
			return api.createContactPhoneNumbers(params.contactId, {
				phones: params.phones,
			});
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['contacts'] });
			if (variables?.contactId) {
				queryClient.invalidateQueries({
					queryKey: ['contact', String(variables.contactId)],
				});
			}
			// eslint-disable-next-line no-console
			console.log('Contact phone numbers added successfully');
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error adding contact phone numbers:', error);
		},
	});
};

// Get contacts in a contact group that have phone numbers with validation errors
export const useGetContactGroupContactsWithPhoneValidationErrors = (
	contactGroupId: number
) => {
	return useQuery({
		queryKey: ['contactGroupContactsWithPhoneValidationErrors', contactGroupId],
		queryFn: async () => {
			const api = contactsApi();
			return api.findContactGroupContactsWithPhoneValidationErrors(
				contactGroupId
			);
		},
		enabled: !!contactGroupId,
	});
};

// Export CSV for contact group contacts with phone validation errors
export const useExportContactGroupContactsWithPhoneValidationErrors = (
	contactGroupId: number
) => {
	return useQuery({
		queryKey: [
			'contactGroupContactsWithPhoneValidationErrorsExport',
			contactGroupId,
		],
		queryFn: async () => {
			const api = contactsApi();
			return api.exportContactGroupContactsWithPhoneValidationErrors(
				contactGroupId
			);
		},
		enabled: false, // Only run when manually triggered via refetch
	});
};

export const useGetContactSummaryGroups = (campaignId: number) => {
	return useQuery({
		queryKey: ['contactSummaryGroups', campaignId],
		queryFn: async () => {
			const api = contactsApi();
			return api.findContactSummaryGroups(campaignId);
		},
		enabled: !!campaignId,
	});
};
// Update contact
export const useUpdateContact = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateContactPayload;
		}) => {
			const api = contactsApi();
			return api.updateContact(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['contacts'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['contact', data.id] });
			}
			// eslint-disable-next-line no-console
			console.log('Contact updated successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error updating contact:', error);
		},
	});
};

// Delete contact
export const useDeleteContact = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const api = contactsApi();
			return api.deleteContact(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['contacts'] });
			queryClient.invalidateQueries({ queryKey: ['contact', id] });
			// eslint-disable-next-line no-console
			console.log('Contact deleted successfully:', id);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error deleting contact:', error);
		},
	});
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import contactsApi from "~/api/contactsApi";
import type { Contact } from "~/models/ContactsModel";

// Create contact
export const useCreateContact = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (contact: Partial<Contact>) => {
			const api = contactsApi();
			return api.createContact(contact);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			// eslint-disable-next-line no-console
			console.log("Contact created successfully:", data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error("Error creating contact:", error);
		},
	});
};

// Get all contacts
export const useGetAllContacts = (params?: Record<string, any>) => {
	return useQuery({
		queryKey: ["contacts", params],
		queryFn: async () => {
			const api = contactsApi();
			return api.findAllContacts(params);
		},
	});
};

// Get contact by id
export const useGetContact = (id: string) => {
	return useQuery({
		queryKey: ["contact", id],
		queryFn: async () => {
			const api = contactsApi();
			return api.findContact(id);
		},
		enabled: !!id,
	});
};

export const useGetCampaignContacts = (
	campaignId: number,
	params?: { limit?: number; offset?: number; firstName?: string }
) => {
	return useQuery({
		queryKey: ["campaignContacts", campaignId, params],
		queryFn: async () => {
			const api = contactsApi();
			return api.findCampaignContacts(campaignId, params);
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
			data: Partial<Contact>;
		}) => {
			const api = contactsApi();
			return api.updateContact(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ["contact", data.id] });
			}
			// eslint-disable-next-line no-console
			console.log("Contact updated successfully:", data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error("Error updating contact:", error);
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
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.invalidateQueries({ queryKey: ["contact", id] });
			// eslint-disable-next-line no-console
			console.log("Contact deleted successfully:", id);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error("Error deleting contact:", error);
		},
	});
};

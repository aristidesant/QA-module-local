import axios from "axios";
import type { Contact } from "~/models/ContactsModel";
import { DEFAULT_API_URL } from "./config";

/**
 * Generic Contacts API client
 * Note: Authorization handled by global Axios interceptor.
 */
const contactsApi = (_authHeader?: Record<string, string>) => {
	return {
		// CREATE contact
		createContact: async (contact: Partial<Contact>) => {
			const response = await axios.post(`${DEFAULT_API_URL}/contacts`, contact);
			return response.data;
		},

		// FIND ALL contacts
		findAllContacts: async (params?: Record<string, any>) => {
			const response = await axios.get<Contact[]>(
				`${DEFAULT_API_URL}/contacts`,
				{
					params,
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND ONE contact
		findContact: async (contactId: string) => {
			const response = await axios.get<Contact>(
				`${DEFAULT_API_URL}/contacts/${contactId}`
			);
			return response.data;
		},
		findCampaignContacts: async (
			campaignId: number,
			params?: { limit?: number; offset?: number; firstName?: string }
		) => {
			const response = await axios.get<{
				contacts: Contact[];
				limit: number;
				offset: number;
				total: number;
			}>(`${DEFAULT_API_URL}/contacts/campaign/${campaignId}`, {
				params,
			});
			return response.data;
		},

		// UPDATE contact (PATCH)
		updateContact: async (contactId: string, data: Partial<Contact>) => {
			const response = await axios.patch<Contact>(
				`${DEFAULT_API_URL}/contacts/${contactId}`,
				data
			);
			return response.data;
		},

		// DELETE contact
		deleteContact: async (contactId: string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/contacts/${contactId}`
			);
			return response.data;
		},
	};
};

export default contactsApi;

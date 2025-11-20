import axios from 'axios';
import type {
	Contact,
	ContactStatus,
	ContactPhoneNumber,
} from '~/models/ContactsModel';
import { DEFAULT_API_URL } from './config';
import { PaginatedResponse } from '~/models/CampaignsModel';

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
		findContactGroupContacts: async (
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
			const response = await axios.get<PaginatedResponse<Contact>>(
				`${DEFAULT_API_URL}/contacts/contact-group/${contactGroupId}`,
				{
					params,
				}
			);
			return response.data;
		},

		// FIND contacts in a contact group with phone numbers that have validation errors
		// Endpoint returns a plain array (no pagination)
		findContactGroupContactsWithPhoneValidationErrors: async (
			contactGroupId: number
		) => {
			const response = await axios.get<Contact[]>(
				`${DEFAULT_API_URL}/contacts/contact-group/${contactGroupId}/phone-numbers/with-validation-errors`
			);
			return response.data;
		},

		// EXPORT contacts in a contact group with phone numbers that have validation errors
		// Returns a string (e.g., a presigned URL or CSV content reference)
		exportContactGroupContactsWithPhoneValidationErrors: async (
			contactGroupId: number
		) => {
			const response = await axios.get<string>(
				`${DEFAULT_API_URL}/contacts/contact-group/${contactGroupId}/phone-numbers/with-validation-errors/export`
			);
			return response.data;
		},

		findContactSummaryGroups: async (campaignId: number) => {
			const response = await axios.get<{
				statusBreakdown: { status: `${ContactStatus}`; count: number }[];
				totalContacts: number;
			}>(`${DEFAULT_API_URL}/contacts/summary/status/${campaignId}`);
			return response.data;
		},

		// UPDATE a specific contact phone number
		updateContactPhoneNumber: async (
			contactId: number | string,
			phoneNumberId: number | string,
			data: { phoneNumber: string }
		) => {
			const response = await axios.patch<ContactPhoneNumber>(
				`${DEFAULT_API_URL}/contacts/${contactId}/phone-numbers/${phoneNumberId}`,
				data
			);
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

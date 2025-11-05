import axios from 'axios';
import type ContactGroup from '~/models/ContactGroup';
import type { PaginatedResponse } from '~/models/CampaignsModel';
import { DEFAULT_API_URL } from './config';

/**
 * Contact Groups API client
 * Handles CRUD operations for contact groups and their contacts
 */
const contactGroupApi = (_authHeader?: Record<string, string>) => {
	return {
		// CREATE contact group
		createContactGroup: async (contactGroup: Partial<ContactGroup>) => {
			const response = await axios.post<ContactGroup>(
				`${DEFAULT_API_URL}/contact-groups`,
				contactGroup
			);
			return response.data;
		},

		// FIND ALL contact groups
		findAllContactGroups: async (params?: Record<string, any>) => {
			const response = await axios.get<PaginatedResponse<ContactGroup>>(
				`${DEFAULT_API_URL}/contact-groups`,
				{
					params,
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND ONE contact group
		findContactGroup: async (id: number) => {
			const response = await axios.get<ContactGroup>(
				`${DEFAULT_API_URL}/contact-groups/${id}`
			);
			return response.data;
		},

		// UPDATE contact group (PATCH)
		updateContactGroup: async (id: number, data: Partial<ContactGroup>) => {
			const response = await axios.patch<ContactGroup>(
				`${DEFAULT_API_URL}/contact-groups/${id}`,
				data
			);
			return response.data;
		},

		// DELETE contact group
		deleteContactGroup: async (id: number) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/contact-groups/${id}`
			);
			return response.data;
		},

		// ADD contact to group
		addContactToGroup: async (id: number, contactId: number) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/contact-groups/${id}/contacts`,
				{ contactId }
			);
			return response.data;
		},

		// REMOVE contact from group
		removeContactFromGroup: async (id: number, contactId: number) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/contact-groups/${id}/contacts/${contactId}`
			);
			return response.data;
		},

		// ADD multiple contacts to group (bulk)
		addContactsToGroupBulk: async (id: number, contactIds: number[]) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/contact-groups/${id}/contacts/bulk`,
				{ contactIds }
			);
			return response.data;
		},

		// TOGGLE contact group active status
		toggleContactGroupStatus: async (id: number, isActive: boolean) => {
			const response = await axios.patch<ContactGroup>(
				`${DEFAULT_API_URL}/contact-groups/${id}`,
				{ isActive }
			);
			return response.data;
		},
	};
};

export default contactGroupApi;

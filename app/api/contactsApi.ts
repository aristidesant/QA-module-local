import axios from "axios";
import type { Contact } from "~/models/ContactsModel";

const getDefaultApiUrl = () => {
  if (typeof window !== "undefined") {
    return (window as any).ENV?.API_URL || process.env.API_URL;
  }
  if (typeof process !== "undefined") {
    return process.env.API_URL;
  }
  return undefined;
};

const DEFAULT_API_URL = getDefaultApiUrl() as string;

/**
 * Generic Contacts API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const contactsApi = (authHeader: Record<string, string>) => {
  return {
    // CREATE contact
    createContact: async (contact: Partial<Contact>) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/contacts`,
        contact,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // FIND ALL contacts
    findAllContacts: async (
      params?: Record<string, any>,
      extraHeaders?: Record<string, string>
    ) => {
      const response = await axios.get<Contact[]>(
        `${DEFAULT_API_URL}/contacts`,
        {
          params,
          headers: { ...authHeader, ...(extraHeaders || {}) },
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE contact
    findContact: async (contactId: string) => {
      const response = await axios.get<Contact>(
        `${DEFAULT_API_URL}/contacts/${contactId}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // UPDATE contact (PATCH)
    updateContact: async (contactId: string, data: Partial<Contact>) => {
      const response = await axios.patch<Contact>(
        `${DEFAULT_API_URL}/contacts/${contactId}`,
        data,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // DELETE contact
    deleteContact: async (contactId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/contacts/${contactId}`,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },
  };
};

export default contactsApi;

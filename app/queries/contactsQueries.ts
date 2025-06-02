import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import contactsApi from "~/api/contactsApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { Contact } from "~/models/ContactsModel";

// Create contact
export const useCreateContact = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Partial<Contact>) => {
      const api = contactsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
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
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: async () => {
      const api = contactsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findAllContacts(params);
    },
  });
};

// Get contact by id
export const useGetContact = (id: string) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const api = contactsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findContact(id);
    },
    enabled: !!id,
  });
};

// Update contact
export const useUpdateContact = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Contact>;
    }) => {
      const api = contactsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
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
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const api = contactsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
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

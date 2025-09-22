import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientApi from '~/api/clientApi';
import type {
	CreateClientRequest,
	UpdateClientRequest,
} from '~/models/ClientModel';

// Get all clients
export const useGetAllClients = () => {
	return useQuery({
		queryKey: ['clients'],
		queryFn: async () => {
			const api = clientApi();
			return api.getAllClients();
		},
	});
};

// Get client by ID
export const useGetClient = (id: number) => {
	return useQuery({
		queryKey: ['client', id],
		queryFn: async () => {
			const api = clientApi();
			return api.getClientById(id);
		},
		enabled: !!id,
	});
};

// Create client
export const useCreateClient = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (clientData: CreateClientRequest) => {
			const api = clientApi();
			return api.createClient(clientData);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['clients'] });
			// eslint-disable-next-line no-console
			console.log('Client created successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating client:', error);
		},
	});
};

// Update client
export const useUpdateClient = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateClientRequest;
		}) => {
			const api = clientApi();
			return api.updateClient(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['clients'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['client', data.id] });
			}
			// eslint-disable-next-line no-console
			console.log('Client updated successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error updating client:', error);
		},
	});
};

// Delete client
export const useDeleteClient = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = clientApi();
			return api.deleteClient(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['clients'] });
			queryClient.invalidateQueries({ queryKey: ['client', id] });
			// eslint-disable-next-line no-console
			console.log('Client deleted successfully:', id);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error deleting client:', error);
		},
	});
};

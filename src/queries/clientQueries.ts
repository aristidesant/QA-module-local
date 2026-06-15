import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientApi from '~/api/clientApi';
import type {
	CreateClientRequest,
	UpdateClientRequest,
} from '~/models/ClientModel';
import type {
	ClientThemeModel,
	UpdateClientThemeRequest,
} from '~/models/ClientTheme';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
export const useGetClient = (id: number, enabled = true) => {
	return useQuery({
		queryKey: ['client', id],
		queryFn: async () => {
			const api = clientApi();
			return api.getClientById(id);
		},
		enabled: !!id && enabled,
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
			void data;
		},
		onError: (error) => {
			void error;
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
			void data;
		},
		onError: (error) => {
			void error;
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
			queryClient.invalidateQueries({ queryKey: ['clientTheme', id] });
		},
		onError: (error) => {
			void error;
		},
	});
};

// Get client theme (logoUrl is presigned, valid for 24h, so cache for 24h)
export const useGetClientTheme = (id: number | undefined, enabled = true) => {
	return useQuery<ClientThemeModel>({
		queryKey: ['clientTheme', id],
		queryFn: async () => {
			const api = clientApi();
			return api.getClientTheme(id!);
		},
		enabled: !!id && enabled,
		staleTime: ONE_DAY_MS,
		gcTime: ONE_DAY_MS,
	});
};

// Update client theme (merge semantics — only send changed keys)
export const useUpdateClientTheme = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateClientThemeRequest;
		}) => {
			const api = clientApi();
			return api.patchClientTheme(id, data);
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['clientTheme', variables.id],
			});
			queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
			void data;
		},
		onError: (error) => {
			void error;
		},
	});
};

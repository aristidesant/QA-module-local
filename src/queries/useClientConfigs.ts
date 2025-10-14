import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
	ClientConfig,
	CreateClientConfig,
	UpdateClientConfig,
	ContactColumnMapping,
} from '~/models/ClientConfig';
import {
	getClientConfigs,
	getClientConfigByName,
	getContactColumnsMapping,
	updateContactColumnsMapping,
	createClientConfig,
	updateClientConfig,
	deleteClientConfig,
} from '~/api/clientConfigApi';

export const useClientConfigs = () => {
	return useQuery<ClientConfig[], Error>({
		queryKey: ['clientConfigs'],
		queryFn: getClientConfigs,
	});
};

export const useClientConfigByName = (name: string) => {
	return useQuery<ClientConfig, Error>({
		queryKey: ['clientConfigs', name],
		queryFn: () => getClientConfigByName(name),
		enabled: !!name,
	});
};

export const useCreateClientConfig = () => {
	const queryClient = useQueryClient();

	return useMutation<ClientConfig, Error, CreateClientConfig>({
		mutationFn: createClientConfig,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clientConfigs'] });
		},
	});
};

export const useUpdateClientConfig = () => {
	const queryClient = useQueryClient();

	return useMutation<
		ClientConfig,
		Error,
		{ name: string; data: UpdateClientConfig }
	>({
		mutationFn: ({ name, data }) => updateClientConfig(name, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['clientConfigs'] });
			queryClient.invalidateQueries({
				queryKey: ['clientConfigs', variables.name],
			});
		},
	});
};

export const useDeleteClientConfig = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: deleteClientConfig,
		onSuccess: (_, name) => {
			queryClient.invalidateQueries({ queryKey: ['clientConfigs'] });
			queryClient.removeQueries({ queryKey: ['clientConfigs', name] });
		},
	});
};

export const useContactColumnsMapping = () => {
	return useQuery<ContactColumnMapping[], Error>({
		queryKey: ['clientConfigs', 'contact-columns', 'mapping'],
		queryFn: getContactColumnsMapping,
	});
};

export const useUpdateContactColumnsMapping = () => {
	const queryClient = useQueryClient();

	return useMutation<ContactColumnMapping[], Error, string[]>({
		mutationFn: updateContactColumnsMapping,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['clientConfigs', 'contact-columns', 'mapping'],
			});
		},
	});
};

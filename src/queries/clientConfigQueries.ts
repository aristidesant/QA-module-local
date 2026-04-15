import { useQuery } from '@tanstack/react-query';
import clientConfigApi from '~/api/clientConfigApi';
import type { ConfigModel } from '~/models/ConfigModel';

// Get client config by name
export const useGetClientConfig = (name: string) => {
	return useQuery<ConfigModel>({
		queryKey: ['client-config', name],
		queryFn: async () => {
			const api = clientConfigApi();
			return api.getClientConfig(name);
		},
		enabled: !!name,
	});
};

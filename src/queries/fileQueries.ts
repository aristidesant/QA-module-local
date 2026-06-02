import { useQuery } from '@tanstack/react-query';
import fileApi from '~/api/fileApi';
import type FileModel from '~/models/FileModel';

/**
 * Query to get all files belonging to a client.
 */
export const useGetClientFiles = (clientId: number | undefined) => {
	return useQuery<FileModel[]>({
		queryKey: ['files', clientId],
		queryFn: async () => {
			const api = fileApi();
			return api.getClientFiles(clientId!);
		},
		enabled: !!clientId,
	});
};

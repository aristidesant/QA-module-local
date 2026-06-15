import { useMutation, useQuery } from '@tanstack/react-query';
import fileApi from '~/api/fileApi';
import type FileModel from '~/models/FileModel';
import type FileTypeModel from '~/models/FileTypeModel';

/**
 * Query to get all files belonging to a client.
 */
export const useGetClientFiles = (
	clientId: number | undefined,
	enabled = true
) => {
	return useQuery<FileModel[]>({
		queryKey: ['files', clientId],
		queryFn: async () => {
			const api = fileApi();
			return api.getClientFiles(clientId!);
		},
		enabled: !!clientId && enabled,
	});
};

export const useGetFileTypes = (enabled = true) => {
	return useQuery<FileTypeModel[]>({
		queryKey: ['fileTypes'],
		queryFn: async () => {
			const api = fileApi();
			return api.getFileTypes();
		},
		enabled,
	});
};

export const useUploadFile = () => {
	return useMutation({
		mutationFn: async (params: {
			file: File;
			codeType?: string;
			description?: string;
			typeId?: number;
			targetClientId?: number;
		}): Promise<FileModel> => {
			const api = fileApi();
			return api.uploadFile(
				params.file,
				params.codeType,
				params.description,
				params.typeId,
				params.targetClientId
			);
		},
	});
};

import {
	useMutation,
	useQuery,
	useQueries,
	useQueryClient,
	UseQueryOptions,
} from '@tanstack/react-query';
import knowledgeBaseApi, {
	CreateKnowledgeBaseParams,
	FindKnowledgeBasesParams,
	KnowledgeBasesPaginatedResponse,
} from '~/api/knowledgeBaseApi';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';

const invalidateKnowledgeBaseLists = (
	queryClient: ReturnType<typeof useQueryClient>
) => {
	queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
	queryClient.invalidateQueries({ queryKey: ['knowledgeBasesPaginated'] });
};

export const useCreateKnowledgeBase = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateKnowledgeBaseParams) => {
			const api = knowledgeBaseApi();
			return api.createKnowledgeBase(data);
		},
		onSuccess: (data) => {
			invalidateKnowledgeBaseLists(queryClient);
			// eslint-disable-next-line no-console
			console.log('Knowledge base created successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating knowledge base:', error);
		},
	});
};

export const useKnowledgeBases = (params?: FindKnowledgeBasesParams) => {
	const key = ['knowledgeBases', params || {}] as const;

	const options: UseQueryOptions<KnowledgeBaseModel[], Error> = {
		queryKey: key as readonly unknown[],
		queryFn: async () => {
			const api = knowledgeBaseApi();
			const data = await api.getKnowledgeBases(params);
			return data as KnowledgeBaseModel[];
		},
	};

	return useQuery<KnowledgeBaseModel[], Error>(options);
};

export const useKnowledgeBasesPaginated = (
	params?: FindKnowledgeBasesParams
) => {
	const key = ['knowledgeBasesPaginated', params || {}] as const;

	return useQuery<KnowledgeBasesPaginatedResponse, Error>({
		queryKey: key as readonly unknown[],
		queryFn: async () => {
			const api = knowledgeBaseApi();
			return api.getKnowledgeBasesPaginated(params);
		},
	});
};

export const useKnowledgeBase = (id?: number) => {
	const options: UseQueryOptions<KnowledgeBaseModel, Error> = {
		// keep stable key shape; when id is undefined, the query will be disabled
		queryKey: ['knowledgeBase', id ?? null] as const as readonly unknown[],
		queryFn: async () => {
			const api = knowledgeBaseApi();
			if (id == null) throw new Error('KnowledgeBase id is required');
			const data = await api.getKnowledgeBase(id);
			return data as KnowledgeBaseModel;
		},
		enabled: id != null,
	};

	return useQuery<KnowledgeBaseModel, Error>(options);
};

export const useKnowledgeBasesByIds = (ids: number[]) => {
	return useQueries({
		queries: ids.map((id) => ({
			queryKey: ['knowledgeBase', id],
			queryFn: async () => {
				const api = knowledgeBaseApi();
				return api.getKnowledgeBase(id);
			},
			staleTime: 1000 * 60 * 5, // 5 minutes
		})),
	});
};

export const useUpdateKnowledgeBase = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: Partial<CreateKnowledgeBaseParams>;
		}) => {
			const api = knowledgeBaseApi();
			return api.updateKnowledgeBase(id, data);
		},
		onSuccess: (updated: KnowledgeBaseModel) => {
			invalidateKnowledgeBaseLists(queryClient);
			queryClient.invalidateQueries({
				queryKey: ['knowledgeBase', updated.id],
			});
		},
	});
};

export const useDeleteKnowledgeBase = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = knowledgeBaseApi();
			return api.deleteKnowledgeBase(id);
		},
		onSuccess: (_data, id) => {
			invalidateKnowledgeBaseLists(queryClient);
			queryClient.removeQueries({ queryKey: ['knowledgeBase', id] });
		},
	});
};

export const useRetryKnowledgeBase = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = knowledgeBaseApi();
			return api.retryKnowledgeBase(id);
		},
		onSuccess: (_data, id) => {
			invalidateKnowledgeBaseLists(queryClient);
			queryClient.invalidateQueries({ queryKey: ['knowledgeBase', id] });
		},
	});
};

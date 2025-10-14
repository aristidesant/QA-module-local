import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryResult,
	type UseMutationResult,
} from '@tanstack/react-query';
import { doNotCallApi } from '~/api/doNotCallApi';
import type {
	DoNotCallListParams,
	DoNotCallListResponse,
	DoNotCallCreateRequest,
	DoNotCallUpdateRequest,
	DoNotCallCheckResponse,
	DoNotCallCleanExpiredResponse,
	DoNotCallModel,
} from '~/models/DoNotCallModel';

export const doNotCallKeys = {
	all: ['doNotCall'] as const,
	lists: () => [...doNotCallKeys.all, 'list'] as const,
	list: (params?: DoNotCallListParams) =>
		[...doNotCallKeys.lists(), params] as const,
	details: () => [...doNotCallKeys.all, 'detail'] as const,
	detail: (id: number) => [...doNotCallKeys.details(), id] as const,
	checks: () => [...doNotCallKeys.all, 'check'] as const,
	check: (phoneNumber: string) =>
		[...doNotCallKeys.checks(), phoneNumber] as const,
};

/**
 * Query hook to get all DNC entries with optional filters
 */
export const useDoNotCallList = (
	params?: DoNotCallListParams
): UseQueryResult<DoNotCallListResponse, Error> => {
	return useQuery({
		queryKey: doNotCallKeys.list(params),
		queryFn: () => doNotCallApi.getAll(params),
	});
};

/**
 * Query hook to get a specific DNC entry by ID
 */
export const useDoNotCall = (
	id: number
): UseQueryResult<DoNotCallModel, Error> => {
	return useQuery({
		queryKey: doNotCallKeys.detail(id),
		queryFn: () => doNotCallApi.getById(id),
	});
};

/**
 * Query hook to check if a phone number is in the DNC list
 */
export const useCheckDoNotCall = (
	phoneNumber: string,
	enabled = true
): UseQueryResult<DoNotCallCheckResponse, Error> => {
	return useQuery({
		queryKey: doNotCallKeys.check(phoneNumber),
		queryFn: () => doNotCallApi.check(phoneNumber),
		enabled: enabled && !!phoneNumber,
	});
};

/**
 * Mutation hook to create a new DNC entry
 */
export const useCreateDoNotCall = (): UseMutationResult<
	DoNotCallModel,
	Error,
	DoNotCallCreateRequest
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: DoNotCallCreateRequest) => doNotCallApi.create(data),
		onSuccess: () => {
			// Invalidate all list queries to refetch data
			queryClient.invalidateQueries({ queryKey: doNotCallKeys.lists() });
		},
	});
};

/**
 * Mutation hook to update an existing DNC entry
 */
export const useUpdateDoNotCall = (): UseMutationResult<
	DoNotCallModel,
	Error,
	{ id: number; data: DoNotCallUpdateRequest }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }) => doNotCallApi.update(id, data),
		onSuccess: (_, variables) => {
			// Invalidate the specific detail query and all list queries
			queryClient.invalidateQueries({
				queryKey: doNotCallKeys.detail(variables.id),
			});
			queryClient.invalidateQueries({ queryKey: doNotCallKeys.lists() });
		},
	});
};

/**
 * Mutation hook to soft delete a DNC entry
 */
export const useDeleteDoNotCall = (): UseMutationResult<
	void,
	Error,
	number
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => doNotCallApi.delete(id),
		onSuccess: (_, id) => {
			// Invalidate the specific detail query and all list queries
			queryClient.invalidateQueries({
				queryKey: doNotCallKeys.detail(id),
			});
			queryClient.invalidateQueries({ queryKey: doNotCallKeys.lists() });
		},
	});
};

/**
 * Mutation hook to clean all expired DNC entries
 */
export const useCleanExpiredDoNotCall = (): UseMutationResult<
	DoNotCallCleanExpiredResponse,
	Error,
	void
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => doNotCallApi.cleanExpired(),
		onSuccess: () => {
			// Invalidate all list queries to refetch updated data
			queryClient.invalidateQueries({ queryKey: doNotCallKeys.lists() });
		},
	});
};

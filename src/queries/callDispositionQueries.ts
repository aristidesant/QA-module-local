import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import callDispositionApi from '~/api/callDispositionApi';
// Authorization is handled by a global Axios interceptor
import type {
	CallDispositionFilters,
	CallDispositionModel,
} from '~/models/CallDispositionModel';

// --- Queries ---
export function useCallDispositions(conversationId?: number | string) {
	return useQuery<CallDispositionModel, Error>({
		queryKey: ['callDispositions', conversationId],
		queryFn: async () => {
			if (!conversationId) throw new Error('conversationId required');
			const api = callDispositionApi();
			return api.findAllCallDispositions({
				conversationId: String(conversationId),
			});
		},
		enabled: !!conversationId,
	});
}

export function useCallDispositionByConversationId(
	conversationId?: number | string
) {
	return useQuery<CallDispositionModel, Error>({
		queryKey: ['callDispositionByConversationId', conversationId],
		queryFn: async () => {
			if (!conversationId) throw new Error('conversationId required');
			const api = callDispositionApi();
			return api.findCallDispositionByConversationId(Number(conversationId));
		},
		enabled: !!conversationId,
		retry: 0,
	});
}

export function useCallDisposition(id?: number | string) {
	return useQuery<CallDispositionModel, Error>({
		queryKey: ['callDisposition', id],
		queryFn: async () => {
			if (!id) throw new Error('CallDisposition id required');
			const api = callDispositionApi();
			return api.findCallDisposition(String(id));
		},
		enabled: !!id,
	});
}

export function useCallDispositionReport(params?: CallDispositionFilters) {
	return useQuery<{
		dispositions: { dispositionName: string; count: number }[];
		totalCalls: number;
	}>({
		queryKey: ['callDispositionReport', params],
		queryFn: async () => {
			const api = callDispositionApi();
			return api.getCallDispositionReport(params || {});
		},
		enabled: true,
	});
}
export function useGetCallDispositionReportParents(params?: {
	campaignId?: number;
	dispositionName?: string;
}) {
	return useQuery<{
		dispositions: {
			dispositionName: string;
			count: number;
			percentage: string;
		}[];
		totalCalls: number;
	}>({
		queryKey: ['callDispositionReportParents', params],
		queryFn: async () => {
			const api = callDispositionApi();
			return api.getCallDispositionReportParents(params || {});
		},
		enabled: !!params?.campaignId,
		retry: false,
	});
}

// --- Mutations ---
export function useCreateCallDisposition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Partial<CallDispositionModel>) => {
			const api = callDispositionApi();
			return api.createCallDisposition(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['callDispositions'] });
		},
	});
}

export function useUpdateCallDisposition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number | string;
			data: Partial<CallDispositionModel>;
		}) => {
			const api = callDispositionApi();
			return api.updateCallDisposition(String(id), data);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['callDisposition', variables.id],
			});
			queryClient.invalidateQueries({ queryKey: ['callDispositions'] });
		},
	});
}

export function useDeleteCallDisposition() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number | string) => {
			const api = callDispositionApi();
			return api.deleteCallDisposition(String(id));
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['callDisposition', id] });
			queryClient.invalidateQueries({ queryKey: ['callDispositions'] });
		},
	});
}

export function useCallDispositionWithAi() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (conversationId: number | string) => {
			const api = callDispositionApi();
			// POST /call-dispositions/with-ai { conversationId }
			return api.withAi(Number(conversationId));
		},
		onSuccess: (_data, conversationId) => {
			// Invalidate relevant queries so UI refreshes
			queryClient.invalidateQueries({
				queryKey: ['callDispositionByConversationId', String(conversationId)],
			});
			queryClient.invalidateQueries({ queryKey: ['callDispositions'] });
		},
	});
}

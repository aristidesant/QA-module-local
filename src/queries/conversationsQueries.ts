import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import conversationsApi, {
	type PostCallDataParams,
	type StartDemoParams,
	type UpdateConversationParams,
} from '~/api/conversationsApi';
import type {
	ConversationDemoModel,
	ConversationsModel,
	ConversationTableModel,
} from '~/models/ConversationsModels';

const getApi = () => conversationsApi();

// Create a new conversation
// TODO: Replace 'any' with a specific CreateConversationParams type if available
export const useCreateConversation = () => {
	const queryClient = useQueryClient();

	return useMutation<
		import('~/api/conversationsApi').Conversation,
		unknown,
		Record<string, unknown>
	>({
		mutationFn: async (data) => {
			const api = getApi();
			return api.createConversation(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['conversations'] });
		},
	});
};

// Get all conversations for current client
export const useGetConversations = () => {
	return useQuery<ConversationTableModel[]>({
		queryKey: ['conversations'],
		queryFn: async () => {
			const api = getApi();
			return api.getConversations();
		},
		refetchOnWindowFocus: false,
		retry: false,
	});
};

// Start a new conversation
// TODO: Replace 'Record<string, unknown>' with a specific StartConversationParams type if available
export const useStartConversation = () => {
	const queryClient = useQueryClient();

	return useMutation<
		import('~/api/conversationsApi').Conversation,
		unknown,
		Record<string, unknown>
	>({
		mutationFn: async (data) => {
			const api = getApi();
			return api.startConversation(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['conversations'] });
		},
	});
};

// Start demo conversation
export const useStartDemoConversation = () => {
	const queryClient = useQueryClient();

	return useMutation<
		import('~/api/conversationsApi').Conversation,
		unknown,
		StartDemoParams | ConversationDemoModel
	>({
		mutationFn: async (params) => {
			const api = getApi();
			return api.startDemoConversation(params as StartDemoParams);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['conversations'] });
		},
	});
};

// Webhook to receive post-call data
export const usePostCallDataWebhook = () => {
	return useMutation<void, unknown, PostCallDataParams>({
		mutationFn: async (data) => {
			const api = getApi();
			return api.postCallData(data);
		},
	});
};

// Get conversation by ID
export const useGetConversation = (id: string) => {
	return useQuery<ConversationsModel>({
		queryKey: ['conversation', id],
		queryFn: async () => {
			const api = getApi();
			return api.getConversationById(id);
		},
		enabled: !!id,
	});
};

// Update a conversation
export const useUpdateConversation = () => {
	const queryClient = useQueryClient();

	return useMutation<
		import('~/api/conversationsApi').Conversation,
		unknown,
		{ id: string; data: UpdateConversationParams }
	>({
		mutationFn: async ({ id, data }) => {
			const api = getApi();
			return api.updateConversation(id, data);
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ['conversations'] });
			queryClient.invalidateQueries({ queryKey: ['conversation', id] });
		},
	});
};

// Delete a conversation
export const useDeleteConversation = () => {
	const queryClient = useQueryClient();

	return useMutation<void, unknown, string>({
		mutationFn: async (id) => {
			const api = getApi();
			return api.deleteConversation(id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['conversations'] });
		},
	});
};

// Export conversation audio (mutation for download actions)
export const useExportConversationAudio = () => {
	return useMutation<
		{ blob: Blob; filename: string },
		unknown,
		string | number
	>({
		mutationFn: async (id) => {
			const api = getApi();
			return api.exportConversationAudio(id);
		},
	});
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import conversationsApi, {
  type PostCallDataParams,
  type StartDemoParams,
  type UpdateConversationParams,
} from "~/api/conversationsApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type {
  ConversationDemoModel,
  ConversationsModel,
} from "~/models/ConversationsModels";

const getApiWithAuth = (token: string | undefined) => {
  const header = getClientAuthorizationHeader();
  return conversationsApi({
    ...header,
    Authorization: `Bearer ${token}`,
  });
};

// Create a new conversation
// TODO: Replace 'any' with a specific CreateConversationParams type if available
export const useCreateConversation = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();

  return useMutation<
    import("~/api/conversationsApi").Conversation,
    unknown,
    Record<string, unknown>
  >({
    mutationFn: async (data) => {
      const api = getApiWithAuth(token ?? undefined);
      return api.createConversation(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Get all conversations for current client
export const useGetConversations = () => {
  const { token } = useToken();
  return useQuery<import("~/api/conversationsApi").Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const api = getApiWithAuth(token ?? undefined);
      return api.getConversations();
    },
  });
};

// Start a new conversation
// TODO: Replace 'Record<string, unknown>' with a specific StartConversationParams type if available
export const useStartConversation = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();

  return useMutation<
    import("~/api/conversationsApi").Conversation,
    unknown,
    Record<string, unknown>
  >({
    mutationFn: async (data) => {
      const api = getApiWithAuth(token ?? undefined);
      return api.startConversation(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Start demo conversation
export const useStartDemoConversation = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();

  return useMutation<
    import("~/api/conversationsApi").Conversation,
    unknown,
    StartDemoParams | ConversationDemoModel
  >({
    mutationFn: async (params) => {
      const api = getApiWithAuth(token ?? undefined);
      return api.startDemoConversation(params as StartDemoParams);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Webhook to receive post-call data
export const usePostCallDataWebhook = () => {
  const { token } = useToken();

  return useMutation<void, unknown, PostCallDataParams>({
    mutationFn: async (data) => {
      const api = getApiWithAuth(token ?? undefined);
      return api.postCallData(data);
    },
  });
};

// Get conversation by ID
export const useGetConversation = (id: string) => {
  const { token } = useToken();
  return useQuery<import("~/api/conversationsApi").Conversation>({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const api = getApiWithAuth(token ?? undefined);
      return api.getConversationById(id);
    },
    enabled: !!id,
  });
};

// Update a conversation
export const useUpdateConversation = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();

  return useMutation<
    import("~/api/conversationsApi").Conversation,
    unknown,
    { id: string; data: UpdateConversationParams }
  >({
    mutationFn: async ({ id, data }) => {
      const api = getApiWithAuth(token ?? undefined);
      return api.updateConversation(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    },
  });
};

// Delete a conversation
export const useDeleteConversation = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: async (id) => {
      const api = getApiWithAuth(token ?? undefined);
      return api.deleteConversation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

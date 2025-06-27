import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import conversationsApi, { 
  type Conversation, 
  type PostCallDataParams, 
  type StartDemoParams, 
  type UpdateConversationParams 
} from "~/api/conversationsApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { ConversationDemoModel } from "~/models/ConversationsModels";

const getApiWithAuth = (token: string | undefined) => {
  const header = getClientAuthorizationHeader();
  return conversationsApi({
    ...header,
    Authorization: `Bearer ${token}`,
  });
};

// Create a new conversation
export const useCreateConversation = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const api = getApiWithAuth(token);
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
  
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const api = getApiWithAuth(token);
      return api.getConversations();
    },
  });
};

// Start a new conversation
export const useStartConversation = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const api = getApiWithAuth(token);
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

  return useMutation({
    mutationFn: async (params: StartDemoParams | ConversationDemoModel) => {
      const api = getApiWithAuth(token);
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

  return useMutation({
    mutationFn: async (data: PostCallDataParams) => {
      const api = getApiWithAuth(token);
      return api.postCallData(data);
    },
  });
};

// Get conversation by ID
export const useGetConversation = (id: string) => {
  const { token } = useToken();
  
  return useQuery<Conversation>({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const api = getApiWithAuth(token);
      return api.getConversationById(id);
    },
    enabled: !!id,
  });
};

// Update a conversation
export const useUpdateConversation = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateConversationParams }) => {
      const api = getApiWithAuth(token);
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

  return useMutation({
    mutationFn: async (id: string) => {
      const api = getApiWithAuth(token);
      return api.deleteConversation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

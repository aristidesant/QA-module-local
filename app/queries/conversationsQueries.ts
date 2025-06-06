import { useMutation, useQueryClient } from "@tanstack/react-query";
import conversationsApi from "~/api/conversationsApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { ConversationDemoModel } from "~/models/ConversationsModels";

// filepath: /Users/ramonmena/Projects/n-ai/app/queries/conversationsQueries.ts

// Start demo conversation mutation
export const useStartDemoConversation = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ConversationDemoModel) => {
      const api = conversationsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.startDemoConversation(params);
    },
    onSuccess: (data) => {
      // Invalidate or refetch queries if needed
      // queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // eslint-disable-next-line no-console
      console.log("Demo conversation started successfully:", data);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error starting demo conversation:", error);
    },
  });
};

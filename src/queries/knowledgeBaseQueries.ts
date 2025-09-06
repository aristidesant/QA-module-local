import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import knowledgeBaseApi, { CreateKnowledgeBaseParams, FindKnowledgeBasesParams } from "~/api/knowledgeBaseApi";
import type KnowledgeBaseModel from "~/models/KnowledgeBaseModel";

export const useCreateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateKnowledgeBaseParams) => {
      const api = knowledgeBaseApi();
      return api.createKnowledgeBase(data);
    },
    onSuccess: (data) => {
      // Invalidate any lists of knowledge bases so they refresh
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      // eslint-disable-next-line no-console
      console.log("Knowledge base created successfully:", data);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error creating knowledge base:", error);
    },
  });
};

export const useKnowledgeBases = (params?: FindKnowledgeBasesParams) => {
  const key = ["knowledgeBases", params || {}] as const;

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

export const useKnowledgeBase = (id: number) => {
  const options: UseQueryOptions<KnowledgeBaseModel, Error> = {
    queryKey: ["knowledgeBase", id] as const as readonly unknown[],
    queryFn: async () => {
      const api = knowledgeBaseApi();
      const data = await api.getKnowledgeBase(id);
      return data as KnowledgeBaseModel;
    },
  };

  return useQuery<KnowledgeBaseModel, Error>(options);
};

export const useUpdateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateKnowledgeBaseParams> }) => {
      const api = knowledgeBaseApi();
      return api.updateKnowledgeBase(id, data);
    },
    onSuccess: (updated: KnowledgeBaseModel) => {
      // Refresh lists and the specific KB
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase", updated.id] });
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
      // Invalidate lists and remove the specific KB from cache
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.removeQueries({ queryKey: ["knowledgeBase", id] });
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
      // Refresh KB list and the specific KB
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase", id] });
    },
  });
};

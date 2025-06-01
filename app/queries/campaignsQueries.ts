import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import campaignsApi from "~/api/campaignsApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { Campaign } from "~/models/CampaignsModel";

// Create campaign
export const useCreateCampaign = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: Partial<Campaign>) => {
      const api = campaignsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.createCampaign(campaign);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      // eslint-disable-next-line no-console
      console.log("Campaign created successfully:", data);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error creating campaign:", error);
    },
  });
};

// Get all campaigns
export const useGetAllCampaigns = (params?: Record<string, any>) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: async () => {
      const api = campaignsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findAllCampaigns(params);
    },
  });
};

// Get campaign by id
export const useGetCampaign = (id: string) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const api = campaignsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findCampaign(id);
    },
    enabled: !!id,
  });
};

// Update campaign
export const useUpdateCampaign = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Campaign>;
    }) => {
      const api = campaignsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updateCampaign(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["campaign", data.id] });
      }
      // eslint-disable-next-line no-console
      console.log("Campaign updated successfully:", data);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error updating campaign:", error);
    },
  });
};

// Delete campaign
export const useDeleteCampaign = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const api = campaignsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.deleteCampaign(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      // eslint-disable-next-line no-console
      console.log("Campaign deleted successfully:", id);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error deleting campaign:", error);
    },
  });
};

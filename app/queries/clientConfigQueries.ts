import { useQuery } from "@tanstack/react-query";
import clientConfigApi from "~/api/clientConfigApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { ConfigModel } from "~/models/ConfigModel";

// Get client config by name
export const useGetClientConfig = (name: string) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<ConfigModel>({
    queryKey: ["client-config", name],
    queryFn: async () => {
      const api = clientConfigApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getClientConfig(name);
    },
    enabled: !!name && !!token,
  });
};

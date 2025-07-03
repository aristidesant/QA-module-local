import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { useEffect } from "react";
import AgentDetails from "~/modules/agent/AgentDetails";
import agentApi from "~/api/agentApi";
import { getSession } from "~/server-session";
import { Stack } from "@mantine/core";
import PageHeader from "~/components/ui/PageHeader";
import type AgentListObject from "~/models/AgentListObject";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { agent_id } = params;
  const session = await getSession(request.headers.get("Cookie"));
  const agentApiClient = agentApi({
    Authorization: `Bearer ${session.get("accessToken")}`,
    "x-client-id": session.get("clientId") ?? "",
  });

  try {
    const agent = await agentApiClient.findAgent(agent_id!);
    return { agent };
  } catch (error) {
    return { agent: null, error: "Agent not found" };
  }
}

export default function AgentRoute() {
  const { agent, error } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();
  
  // Reload agent data when fetcher state changes
  useEffect(() => {
    if (fetcher.data?.agent) {
      // Handle the case when data is reloaded
      console.log('Agent data reloaded');
    }
  }, [fetcher.data]);

  // Function to trigger a reload of agent data
  const reloadAgent = () => {
    if (agent?.id) {
      fetcher.load(`/agent/${agent.id}`);
    }
  };

  if (!agent) {
    return <div>{error}</div>;
  }
  
  // Use the most recent data from fetcher if available
  const currentAgent = (fetcher.data?.agent || agent) as AgentListObject;
  
  return <AgentDetails agent={currentAgent} onAgentUpdated={reloadAgent} />;
}

import { useLoaderData, useFetcher } from "react-router";
import { useEffect } from "react";
import AgentDetails from "~/modules/agent/AgentDetails";
import agentApi from "~/api/agentApi";
import type AgentListObject from "~/models/AgentListObject";

export async function clientLoader({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  const { agent_id } = params;
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;
  const clientId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("clientId")
      : null;
  const agentApiClient = agentApi(
    token
      ? { Authorization: `Bearer ${token}`, "x-client-id": clientId ?? "" }
      : {}
  );

  try {
    const agent = await agentApiClient.findAgent(agent_id!);
    return { agent };
  } catch (error) {
    return { agent: null, error: "Agent not found" };
  }
}

export default function AgentRoute() {
  const { agent, error } = useLoaderData<typeof clientLoader>();
  const fetcher = useFetcher<typeof clientLoader>();

  // Reload agent data when fetcher state changes
  useEffect(() => {
    if (fetcher.data?.agent) {
      // Handle the case when data is reloaded
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

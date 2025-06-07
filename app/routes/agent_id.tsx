import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import AgentDetails from "~/modules/agent/AgentDetails";
import agentApi from "~/api/agentApi";
import { getSession } from "~/server-session";
import { Stack } from "@mantine/core";
import PageHeader from "~/components/ui/PageHeader";

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
  if (!agent) {
    return <div>{error}</div>;
  }
  return <AgentDetails agent={agent} />;
}

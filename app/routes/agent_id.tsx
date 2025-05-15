import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import AgentDetails from "~/modules/agent/AgentDetails";
import agentApi from "~/api/agentApi";
import { getSession } from "~/server-session";

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
    throw new Response("Agent not found", { status: 404 });
  }
}

export default function AgentRoute() {
  const { agent } = useLoaderData<typeof loader>();
  return <AgentDetails agent={agent} />;
}

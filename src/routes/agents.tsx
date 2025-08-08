import { Await, useLoaderData } from "react-router";
import AgentList from "~/modules/agents/components/AgentList";
import agentApi from "~/api/agentApi";
export async function clientLoader() {
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
      ? {
          Authorization: `Bearer ${token}`,
          "x-client-id": clientId ?? "",
        }
      : {}
  );
  return {
    agents: agentApiClient
      .findAllAgents({}, { "x-client-id": clientId ?? "" })
      .catch((err) => {
        console.error("Error fetching agents:", err?.response?.data);
        throw new Response("Error fetching agents", { status: 500 });
      }),
  };
}

export default function AgentRoute() {
  const agents = useLoaderData<typeof clientLoader>();

  return (
    <Await resolve={agents.agents} errorElement={<>Something is not wokring</>}>
      {(resolvedAgents) => (
        <AgentList agents={resolvedAgents ?? []} onCreateNew={() => {}} />
      )}
    </Await>
  );
}

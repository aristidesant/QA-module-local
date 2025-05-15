import {
  Await,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
} from "react-router";
import AgentList from "~/modules/agents/components/AgentList";
import agentApi from "~/api/agentApi";
import { getSession } from "~/server-session";

export async function loader({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("accessToken");
  const clientId = session.get("clientId");
  const agentApiClient = agentApi({
    Authorization: `Bearer ${token}`,
    "x-client-id": clientId ?? "",
  });
  return {
    agents: agentApiClient
      .findAllAgents(
        {},
        {
          "x-client-id": clientId ?? "",
        }
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error("Error fetching agents:", err?.response?.data);
        throw new Response("Error fetching agents", { status: 500 });
      }),
  };
}

export default function AgentRoute() {
  const agents = useLoaderData<typeof loader>();

  return (
    <Await resolve={agents.agents} errorElement={<>Something is not wokring</>}>
      {(resolvedAgents) => (
        <AgentList agents={resolvedAgents ?? []} onCreateNew={() => {}} />
      )}
    </Await>
  );
}

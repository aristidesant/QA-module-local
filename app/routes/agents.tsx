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
  const agentApiClient = agentApi(request);
  const session = await getSession(request.headers.get("Cookie"));
  const clientId = session.get("clientId");
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
      }),
  };
}

export default function AgentRoute() {
  const agents = useLoaderData<typeof loader>();

  return (
    <Await resolve={agents.agents}>
      {(resolvedAgents) => (
        <AgentList agents={resolvedAgents ?? []} onCreateNew={() => {}} />
      )}
    </Await>
  );
}

// Optional action export if using Remix-style actions; otherwise handle in your server/api route
export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "POST") {
    const formData = await request.formData();
    const agentData = JSON.parse(formData.get("data")?.toString() || "");
    const agentApiClient = agentApi(request);

    try {
      await agentApiClient.createAgent(agentData);
      return { success: true };
    } catch (err: any) {
      console.error("Error creating agent:", err);
      return { error: err.message };
    }
  }
}

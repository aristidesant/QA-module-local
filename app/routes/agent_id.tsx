import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import AgentDetails from "~/modules/agent/AgentDetails";
import type { Route } from "./+types/agent_id";
import agentApi from "~/api/agentApi";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { agent_id } = params;
  const agentApiClient = agentApi(request);
  try {
    const agent = await agentApiClient.findAgent(agent_id!);
    return { agent };
  } catch (error) {
    throw new Response("Agent not found", { status: 404 });
  }
}

export default function AgentRoute() {
  const { agent } = useLoaderData<typeof loader>();
  console.log({ agent });
  return <AgentDetails agent={agent} />;
}

export async function action({ request, params }: Route.ActionArgs) {
  const agentApiClient = agentApi(request);
  if (request.method === "POST") {
    const formData = await request.formData();
    const agent_id = params.agent_id;

    // Use formDataToJson to parse the form data including nested objects
    const parsedData = JSON.parse(formData.get("data") as string);
    console.log({ parsedData: parsedData });
    if (!agent_id) {
      console.error("Agent ID is missing from form data");
      return { error: "Agent ID is required." };
    }

    try {
      const updatedAgent = await agentApiClient.updateAgent(
        agent_id,
        parsedData
      );
      return { agent: updatedAgent };
    } catch (error) {
      console.error("Error updating agent:", error);
      return { error: "Failed to update agent." };
    }
  } else if (request.method === "DELETE") {
    try {
      await agentApiClient.deleteAgent(params.agent_id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting agent:", error);
      return { error: "Failed to delete agent." };
    }
  }
}

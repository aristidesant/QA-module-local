import AgentList from "./components/AgentList";
import type { AgentSummaryResponseModel } from "elevenlabs/api";
import { Stack } from "@mantine/core";
import Breadcrumb from "~/components/ui/Breadcrumb";

interface AgentsModuleProps {
  initialAgents: AgentSummaryResponseModel[];
}

export default function AgentsModule({ initialAgents }: AgentsModuleProps) {
  function handleCreateNewSuccess(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Stack>
      <Breadcrumb
        items={[
          { label: "Home", path: "/" },
          { label: "Agents", path: "/agents" },
        ]}
      />

      <AgentList agents={initialAgents} onCreateNew={handleCreateNewSuccess} />
    </Stack>
  );
}

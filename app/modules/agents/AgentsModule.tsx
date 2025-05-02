import { useState } from "react";
import AgentList from "./components/AgentList";
import type { AgentSummaryResponseModel } from "elevenlabs/api";

interface AgentsModuleProps {
  initialAgents: AgentSummaryResponseModel[];
}

export default function AgentsModule({ initialAgents }: AgentsModuleProps) {
  function handleCreateNewSuccess(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <AgentList agents={initialAgents} onCreateNew={handleCreateNewSuccess} />
    </>
  );
}

import React from "react";
import type { AgentConfigModel } from "~/models/AgentListObject";
import BasicConfiguration from "../AgentSettings/BasicConfiguration/BasicConfiguration";
import AIPersonality from "../AgentSettings/AIPersonality/AIPersonality";

// Define the props for AgentSettings
interface AgentSettingsProps {
  agentData?: Partial<AgentConfigModel>; // TODO: Define a more specific type for agentData
  onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
}

const AgentSettings: React.FC<AgentSettingsProps> = ({
  agentData,
  onUpdateAgentData,
}) => {
  if (!agentData) {
    return null;
  }

  return (
    <>
      <BasicConfiguration
        agentData={agentData}
        onUpdateAgentData={onUpdateAgentData}
      />
      <AIPersonality
        agentData={agentData}
        onUpdateAgentData={onUpdateAgentData}
      />
    </>
  );
};

export default AgentSettings;

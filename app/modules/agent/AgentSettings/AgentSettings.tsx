import React from "react";
import type { AgentConfigModel } from "~/models/AgentListObject";
import BasicConfiguration from "../AgentSettings/BasicConfiguration/BasicConfiguration";
import AIPersonality from "../AgentSettings/AIPersonality/AIPersonality";
import { AgentBasicDetails } from "~/modules/agents/components/AgentBasicDetails";
import type AgentListObject from "~/models/AgentListObject";

// Define the props for AgentSettings
interface AgentSettingsProps {
  agent?: AgentListObject;
  agentData?: Partial<AgentConfigModel>; // TODO: Define a more specific type for agentData
  onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
  onSetRightSection?: (rightSection: React.ReactNode) => void;
}

const AgentSettings: React.FC<AgentSettingsProps> = ({
  agent,
  agentData,
  onUpdateAgentData,
  onSetRightSection,
}) => {
  if (!agentData) {
    return null;
  }

  const handleClick = () => {
    onSetRightSection?.(
      <AgentBasicDetails
        agent={agent}
        agentData={agentData as AgentConfigModel}
      />
    );
  };

  return (
    <div onClick={handleClick} style={{ height: "100%" }}>
      <BasicConfiguration
        agentData={agentData}
        onUpdateAgentData={onUpdateAgentData}
      />
      <AIPersonality
        agentData={agentData}
        onUpdateAgentData={onUpdateAgentData}
      />
    </div>
  );
};

export default AgentSettings;

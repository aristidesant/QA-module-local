import React from "react";
import { Stack } from "@mantine/core";
import type { GetAgentResponseModel } from "elevenlabs/api";
import styles from "./AgentSettings.module.css";
import BasicConfiguration from "../AgentSettings/BasicConfiguration/BasicConfiguration";
import AIPersonality from "../AgentSettings/AIPersonality/AIPersonality";

// Define the props for AgentSettings
interface AgentSettingsProps {
  agentData: GetAgentResponseModel; // TODO: Define a more specific type for agentData
  onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
}

const AgentSettings: React.FC<AgentSettingsProps> = ({
  agentData,
  onUpdateAgentData,
}) => {
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

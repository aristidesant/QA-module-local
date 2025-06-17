import { Stack } from "@mantine/core";
import { useState } from "react";
import AgentVoices from "../AgentVoices";
import AgentConfigurationTypeSelector from "../AgentConfigurationTypeSelector";
import AgentSettings from "../AgentSettings";
import type { GetAgentResponseModel } from "elevenlabs/api";
import { useAgentStore } from "~/store/agentStore";
import { AgentKnowledgeBase } from "../AgentKnowledgeBase";

type AgentConfigurationProps = {
  agentMode?: boolean;
  editableAgent?: Record<string, any>;
  setEditableAgent: React.Dispatch<React.SetStateAction<Record<string, any>>>;
};
const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  editableAgent,
  agentMode,
  setEditableAgent,
}) => {
  const agentConfigurationType = useAgentStore(
    (state) => state.agentConfigurationType
  );
  const handleAgentUpdate = (updatedFields: any) => {
    setEditableAgent((prev: Record<string, any>) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const shouldDisplayAgentSettings =
    (agentMode && agentConfigurationType === "custom") || !agentMode;

  return (
    <Stack>
      <AgentVoices
        onSelectVoice={(voiceId: string) => {
          handleAgentUpdate({
            conversation_config: {
              ...(editableAgent?.conversation_config || {}),
              tts: {
                ...(editableAgent?.conversation_config?.tts || {}),
                voice_id: voiceId,
              },
            },
          });
        }}
        selectedVoiceId={editableAgent?.conversation_config?.tts?.voice_id}
        agentData={editableAgent}
        onUpdateAgentData={handleAgentUpdate}
      />
      {agentMode && <AgentConfigurationTypeSelector />}
      {shouldDisplayAgentSettings && (
        <>
          <AgentSettings
            agentData={editableAgent as GetAgentResponseModel}
            onUpdateAgentData={handleAgentUpdate}
          />
          <AgentKnowledgeBase />
        </>
      )}
    </Stack>
  );
};
export default AgentConfiguration;

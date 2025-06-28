import { Stack } from "@mantine/core";
import { useState } from "react";
import AgentVoices from "../AgentVoices";
import AgentConfigurationTypeSelector from "../AgentConfigurationTypeSelector";
import AgentSettings from "../AgentSettings";
import type { GetAgentResponseModel } from "elevenlabs/api";
import { useAgentStore } from "~/store/agentStore";
import { AgentKnowledgeBase } from "../AgentKnowledgeBase";
import type { AgentConfigModel } from "~/models/AgentListObject";

type AgentConfigurationProps = {
  agentMode?: boolean;
  editableAgent?: AgentConfigModel;
  onVoiceSelect?: (voiceId: string) => void;
  setEditableAgent: React.Dispatch<React.SetStateAction<AgentConfigModel>>;
};
const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  editableAgent,
  agentMode,
  setEditableAgent,
  onVoiceSelect = () => {}, // Default no-op function
}) => {
  const agentConfigurationType = useAgentStore(
    (state) => state.agentConfigurationType
  );
  const handleAgentUpdate = (updatedFields: any) => {
    setEditableAgent((prev: AgentConfigModel) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const shouldDisplayAgentSettings =
    (agentMode && agentConfigurationType === "custom") || !agentMode;

  console.log(JSON.stringify(editableAgent));
  return (
    <Stack>
      <AgentVoices
        onSelectVoice={(voiceId: string) => {
          handleAgentUpdate({
            conversationConfig: {
              ...(editableAgent?.conversationConfig || {}),
              tts: {
                ...(editableAgent?.conversationConfig?.tts || {}),
                voiceId: voiceId,
              },
            },
          });
          onVoiceSelect(voiceId);
        }}
        agentData={editableAgent}
        onUpdateAgentData={handleAgentUpdate}
      />
      {agentMode && <AgentConfigurationTypeSelector />}
      {shouldDisplayAgentSettings && (
        <>
          <AgentSettings
            agentData={editableAgent}
            onUpdateAgentData={handleAgentUpdate}
          />
          <AgentKnowledgeBase />
        </>
      )}
    </Stack>
  );
};
export default AgentConfiguration;

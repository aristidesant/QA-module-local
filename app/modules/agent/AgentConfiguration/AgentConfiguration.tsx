import { Button, Group, Stack } from "@mantine/core";
import { useState, type ReactNode } from "react";
import AgentVoices from "../AgentVoices";
import AgentConfigurationTypeSelector from "../AgentConfigurationTypeSelector";
import AgentSettings from "../AgentSettings";
import type { GetAgentResponseModel } from "elevenlabs/api";
import { useAgentStore } from "~/stores/agentStore";
import { AgentKnowledgeBase } from "../AgentKnowledgeBase";
import type { AgentConfigModel } from "~/models/AgentListObject";
import type AgentListObject from "~/models/AgentListObject";

type AgentConfigurationProps = {
  agentMode?: boolean;
  withVoiceSelection?: boolean;
  agent?: AgentListObject;
  editableAgent?: Partial<AgentConfigModel>;
  onVoiceSelect?: (voiceId: string) => void;
  onSetRightSection?: (rightSection: ReactNode) => void;
  setEditableAgent: React.Dispatch<
    React.SetStateAction<Partial<AgentConfigModel>>
  >;
};
const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  agent,
  editableAgent,
  agentMode,
  withVoiceSelection = true,
  setEditableAgent,
  onSetRightSection,
  onVoiceSelect = () => {}, // Default no-op function
}) => {
  const agentConfigurationType = useAgentStore(
    (state) => state.agentConfigurationType
  );
  const handleAgentUpdate = (updatedFields: any) => {
    setEditableAgent((prev: Partial<AgentConfigModel>) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const shouldDisplayAgentSettings =
    (agentMode && agentConfigurationType === "custom") || !agentMode;

  return (
    <Stack>
      {withVoiceSelection && (
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
          onSetRightSection={onSetRightSection}
          onUpdateAgentData={handleAgentUpdate}
        />
      )}
      {agentMode && <AgentConfigurationTypeSelector />}
      {shouldDisplayAgentSettings && (
        <>
          <AgentSettings
            agentData={editableAgent}
            agent={agent}
            onUpdateAgentData={handleAgentUpdate}
            onSetRightSection={onSetRightSection}
          />
          <AgentKnowledgeBase />
        </>
      )}
      <Group>
        <Button type="submit">Save</Button>
      </Group>
    </Stack>
  );
};
export default AgentConfiguration;

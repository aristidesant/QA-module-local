import { Button, Group, Loader, Stack } from "@mantine/core";
import { type ReactNode } from "react";
import AgentVoices from "../AgentVoices";
import AgentConfigurationTypeSelector from "../AgentConfigurationTypeSelector";
import AgentSettings from "../AgentSettings";
import { useAgentStore } from "~/stores/agentStore";
import { AgentKnowledgeBase } from "../AgentKnowledgeBase";
import type { AgentConfigModel } from "~/models/AgentListObject";
import type AgentListObject from "~/models/AgentListObject";
import { IconDeviceFloppy } from "@tabler/icons-react";
import AgentTools from "../AgentTools";

type AgentConfigurationProps = {
  agentMode?: boolean;
  isLoading?: boolean;
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
  isLoading = false,
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
          <AgentTools onAgentUpdated={handleAgentUpdate} />
          <AgentKnowledgeBase />
        </>
      )}
      <Group mb="xs">
        <Button
          disabled={isLoading}
          leftSection={
            isLoading ? <Loader size={18} /> : <IconDeviceFloppy size={18} />
          }
          type="submit"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </Group>
    </Stack>
  );
};
export default AgentConfiguration;

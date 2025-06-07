import React, { useState, useRef, useEffect } from "react";
import { IconMicrophone, IconDeviceFloppy } from "@tabler/icons-react";
import { Group, Button, TextInput, Stack, Divider } from "@mantine/core";
import AgentSettings from "../AgentSettings";
import styles from "./AgentDetails.module.css";
// import { useFetcher } from "react-router";
import type { GetAgentResponseModel } from "elevenlabs/api";
import type AgentListObject from "~/models/AgentListObject";
import { notifications } from "@mantine/notifications";
import { useUpdateAgent } from "~/queries/agentQueries";
import type { AgentUpdateModel } from "~/models/AgentListObject";
import AgentVoices from "../AgentVoices";
import SectionCard from "~/components/SectionCard";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import AgentNotSelected from "~/modules/agents/components/AgentNotSelected";
import { useAgentStore } from "~/store/agentStore";
import AgentConfigurationTypeSelector from "../AgentConfigurationTypeSelector";

export type AgentDetailsProps = {
  agent: AgentListObject;
};

const AgentDetails: React.FC<AgentDetailsProps> = ({ agent }) => {
  const [editableAgent, setEditableAgent] = useState(agent?.config);
  const [name, setName] = useState(agent.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const { selectedElement, agentConfigurationType } = useAgentStore(
    (state) => state
  );
  const nameInputRef = useRef<HTMLInputElement>(null);
  const {
    mutateAsync: updateAgent,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  } = useUpdateAgent();

  const handleAgentUpdate = (updatedFields: any) => {
    console.log("Editable agent", editableAgent, updatedFields);
    setEditableAgent((prev: any) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const agentId = agent.id as string;
  // Focus the input when edit mode is activated
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Notify user on mutation result
  useEffect(() => {
    if (isSuccess) {
      notifications.show({
        title: "Success",
        message: "Agent updated successfully.",
      });
      reset();
    } else if (isError && error) {
      notifications.show({
        title: "Error",
        message: (error as any)?.message || "Failed to update agent.",
        color: "red",
      });
      reset();
    }
  }, [isSuccess, isError, error, reset]);

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
    } else if (e.key === "Escape") {
      // Revert to original value and exit edit mode
      setName(agent.name);
      setIsEditingName(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure we have a default voice model before saving
    const updatedConfig = {
      ...editableAgent.conversation_config,
      tts: {
        ...editableAgent.conversation_config?.tts,
        model_id:
          editableAgent.conversation_config?.tts?.model_id ||
          "eleven_flash_v2_5",
      },
    };

    const data: Partial<AgentUpdateModel> = {
      name,
      conversation_config: updatedConfig,
      platform_settings: editableAgent.platform_settings,
    };
    try {
      await updateAgent({
        id: agentId,
        data,
      });
    } catch (err) {
      console.error("Error updating agent:", err);
      notifications.show({
        title: "Error",
        message: "Failed to update agent.",
        color: "red",
      });
    }
  };

  console.log({ agent });
  const isSubmitting = isPending;

  return (
    <ContentContainer
      title="Agent Creation"
      description="Start by setting up the key parameters required for a fully operational AI-driven campaign."
      rightSection={selectedElement ?? <AgentNotSelected />}
    >
      <Stack>
        <form onSubmit={handleSubmit}>
          <Stack gap="xl">
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
              selectedVoiceId={
                editableAgent?.conversation_config?.tts?.voice_id
              }
              agentData={editableAgent}
              onUpdateAgentData={handleAgentUpdate}
            />
            <SectionCard>
              <TextInput
                label="Agent Name"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
              />
            </SectionCard>
            <AgentConfigurationTypeSelector />
            {agentConfigurationType === "custom" && (
              <>
                <AgentSettings
                  agentData={editableAgent as GetAgentResponseModel}
                  onUpdateAgentData={handleAgentUpdate}
                />
              </>
            )}
          </Stack>
          <Group justify="flex-start" mt="xl">
            <Button
              type="submit"
              loading={isSubmitting}
              className={styles.saveButton}
              leftSection={!isSubmitting && <IconDeviceFloppy size={18} />}
            >
              Save Changes
            </Button>
          </Group>
        </form>
      </Stack>
    </ContentContainer>
  );
};

export default AgentDetails;

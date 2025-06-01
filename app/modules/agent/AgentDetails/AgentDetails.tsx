import React, { useState, useRef, useEffect } from "react";
import {
  IconUser,
  IconSettings,
  IconMicrophone,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Title, Group, Button, TextInput, Stack, Divider } from "@mantine/core";
import AgentSettings from "../AgentSettings";
import AgentVoiceSettings from "../AgentVoiceSettings/AgentVoiceSettings";
import styles from "./AgentDetails.module.css";
// import { useFetcher } from "react-router";
import type { GetAgentResponseModel } from "elevenlabs/api";
import AgentWidget from "~/components/AgentWidget";
import type AgentListObject from "~/models/AgentListObject";
import { notifications } from "@mantine/notifications";
import ContainerCard from "~/components/ui/ContainerCard/ContainerCard";
import { useUpdateAgent } from "~/queries/agentQueries";
import type { AgentUpdateModel } from "~/models/AgentListObject";
import AgentVoices from "../AgentVoices";
import SectionCard from "~/components/SectionCard";

export type AgentDetailsProps = {
  agent: AgentListObject;
};

const AgentDetails: React.FC<AgentDetailsProps> = ({ agent }) => {
  const [editableAgent, setEditableAgent] = useState(agent?.config);
  const [name, setName] = useState(agent.name);
  const [isEditingName, setIsEditingName] = useState(false);
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
    const data: Partial<AgentUpdateModel> = {
      name,
      conversation_config: editableAgent.conversation_config,
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
    <>
      <form onSubmit={handleSubmit}>
        <SectionCard
          title={
            <>
              {isEditingName ? (
                <TextInput
                  ref={nameInputRef}
                  value={name}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  className={styles.nameInput}
                  variant="unstyled"
                  size="lg"
                  autoComplete="off"
                />
              ) : (
                <Title order={3} c="blue" onClick={handleNameClick}>
                  {name}
                </Title>
              )}
            </>
          }
          description={`ID: ${agentId}`}
          icon={IconUser}
        >
          <input type="hidden" name="agent_id" value={agentId} />

          <Stack gap="xl">
            <Divider
              labelPosition="center"
              label={
                <Group gap={6}>
                  <IconSettings size={18} color="#228be6" />
                  <span style={{ color: "#228be6", fontWeight: 500 }}>
                    Agent Settings
                  </span>
                </Group>
              }
            />
            <div>
              <AgentSettings
                agentData={editableAgent as GetAgentResponseModel}
                onUpdateAgentData={handleAgentUpdate}
              />
            </div>
            <Divider
              labelPosition="center"
              label={
                <Group gap={6}>
                  <IconMicrophone size={18} color="#228be6" />
                  <span style={{ color: "#228be6", fontWeight: 500 }}>
                    Voice Settings
                  </span>
                </Group>
              }
            />
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
            />
            <AgentVoiceSettings
              agentData={editableAgent}
              onUpdateAgentData={handleAgentUpdate}
            />
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
        </SectionCard>
      </form>
      <AgentWidget
        agentId={agentId}
        language={editableAgent?.conversation_config?.agent?.language}
      />
    </>
  );
};

export default AgentDetails;

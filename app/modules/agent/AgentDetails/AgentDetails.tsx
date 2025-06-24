import React, { useState, useRef, useEffect } from "react";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { Group, Button, TextInput, Stack } from "@mantine/core";
import styles from "./AgentDetails.module.css";
import type AgentListObject from "~/models/AgentListObject";
import { notifications } from "@mantine/notifications";
import { useUpdateAgent } from "~/queries/agentQueries";
import type { AgentUpdateModel } from "~/models/AgentListObject";
import SectionCard from "~/components/SectionCard";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import AgentNotSelected from "~/modules/agents/components/AgentNotSelected";
import { useAgentStore } from "~/store/agentStore";
import AgentConfiguration from "../AgentConfiguration/AgentConfiguration";
import { useNavigate } from "react-router";

export type AgentDetailsProps = {
  agent: AgentListObject;
};

const AgentDetails: React.FC<AgentDetailsProps> = ({ agent }) => {
  const [editableAgent, setEditableAgent] = useState(agent?.config);
  const navigate = useNavigate();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure we have a default voice model before saving
    const updatedConfig = {
      ...editableAgent.conversation_config,
      tts: {
        ...editableAgent.conversation_config?.tts,
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

  const isSubmitting = isPending;
  return (
    <ContentContainer
      title="Agent Creation"
      showBackButton
      onBackClick={() => {
        navigate("/agent");
      }}
      description="Start by setting up the key parameters required for a fully operational AI-driven campaign."
      rightSection={selectedElement ?? <AgentNotSelected />}
    >
      <Stack>
        <form onSubmit={handleSubmit}>
          <Stack gap="xs">
            <SectionCard>
              <TextInput
                label="Agent Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </SectionCard>

            <AgentConfiguration
              editableAgent={editableAgent}
              agentMode
              setEditableAgent={setEditableAgent}
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
        </form>
      </Stack>
    </ContentContainer>
  );
};

export default AgentDetails;

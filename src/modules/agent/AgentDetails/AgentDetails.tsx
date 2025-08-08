import React, { useState, useRef, useEffect, type ReactNode } from "react";
import { TextInput, Stack } from "@mantine/core";
import type AgentListObject from "~/models/AgentListObject";
import { notifications } from "@mantine/notifications";
import { useUpdateAgent } from "~/queries/agentQueries";
import type {
  AgentConfigModel,
  AgentUpdateModel,
} from "~/models/AgentListObject";
import SectionCard from "~/components/SectionCard";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import AgentNotSelected from "~/modules/agents/AgentNotSelected";
import { useAgentStore } from "~/stores/agentStore";
import AgentConfiguration from "../AgentConfiguration/AgentConfiguration";
import { useNavigate } from "react-router";

export type AgentDetailsProps = {
  agent: AgentListObject;
  onAgentUpdated?: () => void;
};

const AgentDetails: React.FC<AgentDetailsProps> = ({ agent }) => {
  const [editableAgent, setEditableAgent] = useState<Partial<AgentConfigModel>>(
    agent?.config
  );
  const navigate = useNavigate();
  const [name, setName] = useState(agent.name);
  const [voiceId, setVoiceId] = useState<string>();
  const [isEditingName] = useState(false);
  const { selectedElement, setSelectedElement } = useAgentStore(
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
      ...editableAgent.conversationConfig,
      tts: {
        ...editableAgent.conversationConfig?.tts,
      },
    };

    const data: Partial<AgentUpdateModel> = {
      name,
      voiceId: voiceId || updatedConfig?.tts?.voiceId,
      conversationConfig: updatedConfig,
      platformSettings: editableAgent.platformSettings,
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
  console.log(editableAgent);
  return (
    <ContentContainer
      title="Agent Creation"
      showBackButton
      onBackClick={() => {
        navigate("/");
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
              agent={agent}
              isLoading={isSubmitting}
              onVoiceSelect={(voiceId: string) => {
                setVoiceId(voiceId);
              }}
              onSetRightSection={(rightSection: ReactNode) => {
                setSelectedElement(rightSection);
              }}
              setEditableAgent={setEditableAgent}
            />
          </Stack>
        </form>
      </Stack>
    </ContentContainer>
  );
};

export default AgentDetails;

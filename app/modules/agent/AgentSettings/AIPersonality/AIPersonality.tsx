// Refactored per requirements
import React from "react";
import { Textarea, ActionIcon, rem, Box, Flex } from "@mantine/core";
import { IconBrain, IconPencil, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import type { AgentConfigModel } from "~/models/AgentListObject";
import SectionCard from "../../../../components/SectionCard";
import styles from "./AIPersonality.module.css";
import { AIPersonalityEditModal } from "./index";

interface AIPersonalityProps {
  agentData: Partial<AgentConfigModel>;
  onUpdateAgentData: (updatedFields: any) => void;
}

const AIPersonality: React.FC<AIPersonalityProps> = ({
  agentData,
  onUpdateAgentData,
}) => {
  const prompt = agentData?.conversationConfig?.agent?.prompt?.prompt || "";

  const handleEdit = () => {
    const modalId = "ai-personality-edit-modal";
    modals.open({
      modalId,
      children: (
        <AIPersonalityEditModal
          initialPrompt={prompt}
          onClose={() => modals.close(modalId)}
          onSave={(newPrompt) => {
            onUpdateAgentData({
              conversationConfig: {
                ...(agentData?.conversationConfig || {}),
                agent: {
                  ...(agentData?.conversationConfig?.agent || {}),
                  prompt: {
                    ...(agentData?.conversationConfig?.agent?.prompt || {}),
                    prompt: newPrompt,
                  },
                },
              },
            });
          }}
        />
      ),
      withCloseButton: false,
      centered: true,
      size: "lg",
      padding: "md",
    });
  };

  const handleRemove = () => {
    onUpdateAgentData({
      conversationConfig: {
        ...(agentData?.conversationConfig || {}),
        agent: {
          ...(agentData?.conversationConfig?.agent || {}),
          prompt: {
            ...(agentData?.conversationConfig?.agent?.prompt || {}),
            prompt: "",
          },
        },
      },
    });
  };

  return (
    <SectionCard
      icon={IconBrain}
      title="AgentPrompt"
      description="Define the core behavior and tone of your AI agent. This prompt will guide how the agent speaks, responds, and handles conversations within the campaign."
      className={styles.sectionCard}
      contentSpacing="lg"
    >
      <Flex gap="xs">
        <Box className={styles.promptCol}>
          <Textarea
            value={prompt}
            readOnly
            disabled
            rows={7}
            className={styles.promptTextarea}
          />
        </Box>
        <Flex gap={"xs"} direction={"column"} component="div">
          <ActionIcon
            variant="light"
            aria-label="Edit"
            color="dark"
            onClick={handleEdit}
            flex={1}
            className={styles.editButton}
            w={rem(60)}
          >
            <IconPencil size={20} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            flex={1}
            w={rem(60)}
            className={styles.removeButton}
            aria-label="Remove"
            onClick={handleRemove}
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Flex>
      </Flex>
    </SectionCard>
  );
};

export default AIPersonality;

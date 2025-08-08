import React from "react";

import { Card, Text, ActionIcon, Stack, Flex } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import styles from "./AgentPrompt.module.css";

export interface AgentPromptProps {
  title: string;
  description: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const AgentPrompt: React.FC<AgentPromptProps> = ({
  title,
  description,
  onEdit,
  onDelete,
}) => (
  <div>
    <Text className={styles.sectionTitle}>Agent Prompt</Text>
    <Text className={styles.sectionDescription}>
      Define the core behavior and tone of your AI agent. This prompt will guide
      how the agent speaks, responds, and handles conversations within the
      campaign.
    </Text>
    <Card withBorder radius="md" className={styles.promptCard}>
      <Flex justify="space-between" align="flex-start" gap="md">
        <div className={styles.promptContent}>
          <Text className={styles.promptTitle}>{title}</Text>
          <Text className={styles.promptDescription}>{description}</Text>
        </div>
        <Stack gap={8} className={styles.iconGroup} align="flex-end">
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label="Edit"
            onClick={onEdit}
          >
            <IconPencil size={20} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label="Delete"
            onClick={onDelete}
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Stack>
      </Flex>
    </Card>
  </div>
);

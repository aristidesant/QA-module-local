import React, { useCallback } from "react";
import {
  Card,
  Avatar,
  Text,
  Menu,
  LoadingOverlay,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconDots, IconEye, IconTools, IconTrash } from "@tabler/icons-react";

import dayjs from "dayjs";
import styles from "./AgentCard.module.css";
import type AgentListObject from "~/models/AgentListObject";
import { useDeleteAgent } from "~/queries/agentQueries";
import { useRevalidator } from "react-router";
import { notifications } from "@mantine/notifications";

export interface AgentCardProps {
  agent: AgentListObject;
  onClick?: (agent: AgentListObject) => void;
  onNavigate?: (agent: AgentListObject) => void;
  showDelete?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onClick,
  onNavigate,
  showDelete = true,
}) => {
  const { revalidate } = useRevalidator();
  const { mutateAsync: deleteAgent, isPending: isDeleting } = useDeleteAgent();

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openConfirmModal({
        title: `Remove Agent`,
        centered: true,
        children: (
          <Text size="sm">
            Are you sure you want to remove <b>{agent.name}</b>? This action
            cannot be undone.
          </Text>
        ),
        labels: { confirm: "Remove Agent", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onCancel: () => {},
        onConfirm: async () => {
          try {
            await deleteAgent(agent.id);
            revalidate();
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error deleting agent:", error);
          }
          notifications.show({
            title: "Agent Removed",
            message: `${agent.name} has been removed successfully.`,
            color: "green",
            autoClose: 3000,
            icon: <IconTrash size={16} />,
          });
        },
      });
    },
    [agent, deleteAgent, revalidate]
  );

  const handleView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onNavigate?.(agent);
    },
    [onClick, agent]
  );

  const createdAt = dayjs(agent.createdAt);
  const isValidDate = createdAt.isValid();
  // Determine if the agent is female based on the agent data
  // This assumes agent.config.gender or agent.config.sex may contain gender info
  const isFemale =
    typeof agent.config?.gender === "string"
      ? agent.config.gender.toLowerCase() === "female"
      : typeof agent.config?.sex === "string"
      ? agent.config.sex.toLowerCase() === "female"
      : false;

  const language = agent.config?.language || "English"; // Default to English if not specified
  // Determine flag based on language
  let flagEmoji = null;
  if (language.toLowerCase() === "spanish" || language.toLowerCase() === "español") {
    flagEmoji = "🇩🇴"; // Dominican Republic
  } else {
    flagEmoji = "🇺🇸"; // USA
  }
  return (
    <Card
      className={styles.agentCard}
      shadow="none"
      padding="md"
      radius="xl"
      onClick={onClick ? () => onClick(agent) : undefined}
      withBorder={false}
      style={{ background: "#fff" }}
      data-testid="agent-card"
      tabIndex={0}
    >
      <LoadingOverlay visible={isDeleting} />
      <div className={styles.cardContent}>
        <Avatar
          src={isFemale ? "/images/avatar-f-do.png" : "/images/avatar-m-do.png"}
          color="blue"
          variant="outline"
          size={48}
          radius="xl"
        >
          {agent.name?.[0] || "?"}
        </Avatar>
        <Divider variant="dashed" orientation="vertical" />
        <div className={styles.info}>
          <Text className={styles.name} size="sm" fw={700}>
            {agent.name}
          </Text>
          <Text className={styles.location} size="xs" c="dimmed">
            {isValidDate ? createdAt.format("MMM D, YYYY") : ""}
          </Text>
          <div className={styles.languageRow}>
            <span className={styles.flagIcon}>
              {flagEmoji}
            </span>
            <Text component="span" size="xs" ml={6}>
              {language}
            </Text>
          </div>
        </div>
        <Menu width={200} withinPortal position="bottom-end" shadow="md">
          <Menu.Target>
            <ActionIcon
              type="button"
              className={styles.menuBtn}
              aria-label="Agent actions"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
            >
              <IconDots size={20} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconTools size={16} />}
              onClick={handleView}
            >
              Setup Agent
            </Menu.Item>
            {showDelete && (
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={handleRemove}
              >
                Remove
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>
    </Card>
  );
};

export default AgentCard;

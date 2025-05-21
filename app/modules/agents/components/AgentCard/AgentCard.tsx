import React, { useCallback } from "react";
import {
  Card,
  Avatar,
  Title,
  Text,
  Box,
  Badge,
  Group,
  Tooltip,
  LoadingOverlay,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import {
  IconRobot,
  IconCalendarEvent,
  IconUserCircle,
  IconEye,
  IconTrash,
  IconPhoneIncoming,
  IconPhoneOutgoing,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import styles from "./AgentCard.module.css";
import type AgentListObject from "~/models/AgentListObject";
import { useDeleteAgent } from "~/queries/agentQueries";
import { useRevalidator } from "react-router";
import { notifications } from "@mantine/notifications";

export interface AgentCardProps {
  agent: AgentListObject;
  onClick?: (agent: AgentListObject) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
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
    [agent, deleteAgent]
  );

  const handleView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(agent);
    },
    [onClick]
  );

  const createdAt = dayjs(agent.createdAt);
  const isValidDate = createdAt.isValid();

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={styles.agentCard}
      data-testid="agent-card"
      tabIndex={0}
    >
      <LoadingOverlay visible={isDeleting} />
      <Group className={styles.header} gap="md">
        <Avatar color="blue" radius="xl" size={48} className={styles.avatar}>
          <IconRobot size={28} stroke={1.5} />
        </Avatar>
        <Box className={styles.nameContainer}>
          <Tooltip
            label={agent.name}
            withArrow
            disabled={agent.name.length < 18}
          >
            <Title order={4} className={styles.agentName}>
              {agent.name}
            </Title>
          </Tooltip>
          <Group gap="xs" mt={"xs"} className={styles.typeBadgeContainer}>
            <Badge
              className={styles.agentTypeBadge}
              color={agent.type === "INBOUND" ? "green" : "orange"}
              leftSection={
                agent.type === "INBOUND" ? (
                  <IconPhoneIncoming size={14} stroke={1.5} />
                ) : (
                  <IconPhoneOutgoing size={14} stroke={1.5} />
                )
              }
              variant="light"
              size="md"
            >
              {agent.type === "INBOUND" ? "Inbound" : "Outbound"}
            </Badge>
          </Group>
        </Box>
      </Group>

      <Box className={styles.meta}>
        <Group gap="xs">
          <Badge
            className={styles.agentIdBadge}
            variant="dot"
            size="md"
            leftSection={<IconUserCircle size={14} stroke={1.5} />}
          >
            {agent.clientId}
          </Badge>
          {isValidDate && (
            <Badge
              className={styles.agentCreatedAtBadge}
              variant="light"
              size="md"
              leftSection={<IconCalendarEvent size={14} stroke={1.5} />}
            >
              {createdAt.format("MMM D, YYYY")}
            </Badge>
          )}
        </Group>
      </Box>

      <Group className={styles.actions} grow>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.viewBtn}`}
          onClick={handleView}
          aria-label="View agent details"
        >
          <IconEye size={16} stroke={1.5} />
          <span>View</span>
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.removeBtn}`}
          onClick={handleRemove}
          aria-label="Remove agent"
        >
          <IconTrash size={16} stroke={1.5} />
          <span>Remove</span>
        </button>
      </Group>
    </Card>
  );
};

export default AgentCard;

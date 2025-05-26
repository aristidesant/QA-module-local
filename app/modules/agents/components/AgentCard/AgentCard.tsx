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
      shadow="xs"
      padding="md"
      radius="lg"
      withBorder
      className={styles.agentCard}
      data-testid="agent-card"
      tabIndex={0}
    >
      <LoadingOverlay visible={isDeleting} />

      {/* Header with avatar and name */}
      <div className={styles.header}>
        <Avatar
          color="blue"
          radius="md"
          size={40}
          className={styles.avatar}
          gradient={{ from: "blue", to: "cyan", deg: 45 }}
        >
          <IconRobot color="white" size={22} stroke={1.5} />
        </Avatar>
        <div className={styles.nameContainer}>
          <Tooltip
            label={agent.name}
            withArrow
            disabled={agent.name.length < 20}
          >
            <Title order={5} className={styles.agentName}>
              {agent.name}
            </Title>
          </Tooltip>
          <Badge
            className={styles.agentTypeBadge}
            color={agent.type === "INBOUND" ? "teal" : "orange"}
            leftSection={
              agent.type === "INBOUND" ? (
                <IconPhoneIncoming size={12} stroke={1.5} />
              ) : (
                <IconPhoneOutgoing size={12} stroke={1.5} />
              )
            }
            variant="light"
            size="sm"
          >
            {agent.type === "INBOUND" ? "Inbound" : "Outbound"}
          </Badge>
        </div>
      </div>

      {/* Meta information */}
      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <Text size="xs" className={styles.metaLabel}>
            ID
          </Text>
          <Text size="xs" className={styles.metaValue} c="dimmed">
            {agent.clientId}
          </Text>
        </div>
        {isValidDate && (
          <div className={styles.metaRow}>
            <Text size="xs" className={styles.metaLabel}>
              Created
            </Text>
            <Text size="xs" className={styles.metaValue} c="dimmed">
              {createdAt.format("MMM D, YYYY")}
            </Text>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.viewBtn}`}
          onClick={handleView}
          aria-label="View agent details"
        >
          <IconEye size={14} stroke={1.5} />
          <span>View</span>
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.removeBtn}`}
          onClick={handleRemove}
          aria-label="Remove agent"
        >
          <IconTrash size={14} stroke={1.5} />
          <span>Remove</span>
        </button>
      </div>
    </Card>
  );
};

export default AgentCard;

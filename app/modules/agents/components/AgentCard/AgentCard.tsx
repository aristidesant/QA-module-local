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
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import {
  IconRobot,
  IconCalendarEvent,
  IconUserCircle,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import styles from "./AgentCard.module.css";
import type AgentListObject from "~/models/AgentListObject";

export interface AgentCardProps {
  agent: AgentListObject;
  onClick?: (agent: AgentListObject) => void;
  onRemove?: (agent: AgentListObject) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onClick,
  onRemove,
}) => {
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
        onConfirm: () => onRemove?.(agent),
      });
    },
    [agent, onRemove]
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

import React, { useCallback } from "react";
import {
  Card,
  Text,
  Menu,
  LoadingOverlay,
  ActionIcon,
  Divider,
  Button,
} from "@mantine/core";
import { modals, openConfirmModal } from "@mantine/modals";
import { IconDots, IconEye, IconTools, IconTrash } from "@tabler/icons-react";
import AgentProfile from "~/components/AgentProfile/AgentProfile";

import dayjs from "dayjs";
import styles from "./AgentCard.module.css";
import type AgentListObject from "~/models/AgentListObject";
import { useDeleteAgent } from "~/queries/agentQueries";
import { useRevalidator } from "react-router";
import { notifications } from "@mantine/notifications";
import { OutboundCallForm } from "~/components/OutboundCallForm";
import {
  getAgentGender,
  getAgentAvatarUrl,
  getAgentLanguage,
  getAgentLanguageCode,
  getLanguageFlagEmoji,
} from "~/utils/agentUtils";

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

  // Use utility functions for consistent agent data extraction
  const { isFemale } = getAgentGender(agent);
  const language = getAgentLanguage(agent);
  const languageCode = getAgentLanguageCode(agent);
  const flagEmoji = getLanguageFlagEmoji(languageCode);

  const handleDemoCall = (agent: AgentListObject) => {
    modals.open({
      modalId: "demo-call-modal",
      withCloseButton: false,
      children: (
        <OutboundCallForm
          agent={agent}
          onSuccess={() => {
            modals.close("demo-call-modal");
            notifications.show({
              title: "Demo Call Started",
              message: `A demo call with ${agent.name} has been initiated.`,
              color: "green",
              autoClose: 3000,
              icon: <IconEye size={16} />,
            });
          }}
          onClose={() => modals.close("demo-call-modal")}
        />
      ),
    });
  };

  return (
    <Card
      withBorder
      onClick={onClick ? () => onClick(agent) : undefined}
      data-testid="agent-card"
      className={styles.agentCard}
    >
      <LoadingOverlay visible={isDeleting} />

      {/* Three-dot menu */}
      <div className={styles.menuContainer}>
        <Menu
          withArrow
          width={200}
          withinPortal
          position="bottom-end"
          shadow="md"
        >
          <Menu.Target>
            <ActionIcon
              type="button"
              variant="transparent"
              aria-label="Agent actions"
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

      <div className={styles.cardContent}>
        {/* Agent Profile */}
        <div className={styles.agentProfileWrapper}>
          <AgentProfile
            agent={agent}
            size="md"
            onClick={onClick ? () => onClick(agent) : undefined}
          />
        </div>

        {/* Personality traits */}
        <div className={styles.traitsRow}>
          <Text className={styles.trait} size="sm" c="dimmed">
            Empathic
          </Text>
          <Text className={styles.trait} size="sm" c="dimmed">
            Jovial
          </Text>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Bottom content area */}
        <div className={styles.bottomContent}>
          <Button
            fullWidth
            color="dark"
            variant="light"
            onClick={(event) => {
              event.stopPropagation();
              handleDemoCall(agent);
            }}
          >
            Test Call
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AgentCard;

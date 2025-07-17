import React from "react";
import {
  Card,
  Avatar,
  Button,
  Menu,
  ActionIcon,
  Group,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { modals, openConfirmModal } from "@mantine/modals";
import { IconDots, IconTrash, IconPlus } from "@tabler/icons-react";
import type AgentListObject from "~/models/AgentListObject";
import AgentCampaignAdd from "../AgentCampaignAdd";
import classes from "./AgentCampaignList.module.css";
import {
  useGetCampaignAgents,
  useDeleteCampaignAgent,
} from "~/queries/campaignAgentsQueries";
import { useCampaignsStore } from "~/stores/campaignsStore";
import AgentCampaignPreview from "../AgentCampaignPreview";
function getStatusDot(status: AgentListObject["status"]) {
  return (
    <span
      className={
        status === "ACTIVE"
          ? classes.statusDot
          : `${classes.statusDot} ${classes.inactive}`
      }
      aria-label={status === "ACTIVE" ? "Active" : "Inactive"}
    />
  );
}

export const AgentCampaignList: React.FC = () => {
  const { selectedCampaign } = useCampaignsStore((state) => state);
  const { setRightComponent } = useCampaignsStore();
  const {
    data: campaignAgents,
    refetch,
    isLoading,
  } = useGetCampaignAgents(selectedCampaign?.id || 0);

  const deleteMutation = useDeleteCampaignAgent();

  // Get assigned agent IDs for exclusion
  const assignedAgentIds = Array.isArray(campaignAgents)
    ? campaignAgents.map((a) => a.agent?.id).filter(Boolean)
    : [];

  const handleAddAgent = () => {
    if (selectedCampaign?.id == null) {
      console.error("No campaign selected");
      return;
    }
    modals.open({
      modalId: "add-campaign-agent",
      title: "Add Agent to Campaign",
      centered: true,
      size: "md",
      children: (
        <AgentCampaignAdd
          campaignId={selectedCampaign?.id}
          excludedAgents={assignedAgentIds}
          onComplete={() => {
            refetch();
            modals.close("add-campaign-agent");
          }}
        />
      ),
    });
  };

  const handleDeleteAgent = (agentId: number) => {
    if (!selectedCampaign?.id) return;
    openConfirmModal({
      title: "Remove Agent from Campaign",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to remove this agent from the campaign? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteMutation.mutate(
          { campaignId: selectedCampaign.id, id: agentId },
          {
            onSuccess: () => {
              refetch();
            },
          }
        );
      },
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay
        visible={isLoading}
        zIndex={100}
        overlayProps={{ radius: "md", blur: 2 }}
      />
      <Text className={classes.header} size="lg" fw={600}>
        Assigned Agents
      </Text>
      <Text className={classes.subheader} color="dimmed" size="sm">
        These agents are currently linked to this campaign.
      </Text>
      {campaignAgents?.map((agent) => (
        <Card
          className={classes.agentCard}
          key={agent.id}
          withBorder
          onClick={() => {
            if (agent.agentId && selectedCampaign?.id) {
              setRightComponent?.(
                <AgentCampaignPreview
                  agentId={agent.agentId}
                  campaignAgentId={agent.id}
                  campaignId={selectedCampaign.id}
                />
              );
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <Group w="100%" justify="space-between" align="center">
            <Group align="center">
              <span className={classes.avatarStatus}>
                <Avatar
                  radius="xl"
                  size={44}
                  name={agent.agent?.name || "Unknown"}
                  color="initials"
                  alt={agent.agent?.name || "Unknown"}
                />
                {getStatusDot(agent.agent?.status)}
              </span>
              <div>
                <Text size="xs" fw={500}>
                  {agent.agent?.name || "Unknown"}
                </Text>
                <Text size="xs" c="dimmed">
                  {agent.agent?.voice?.language || "Unknown"}
                </Text>
              </div>
            </Group>
            <Menu shadow="md" width={140} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  className={classes.menuIcon}
                  aria-label="Agent actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteAgent(agent.id);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Card>
      ))}
      <Button
        className={classes.addAgentBtn}
        leftSection={<IconPlus size={18} />}
        variant="light"
        color="blue"
        fullWidth
        radius="md"
        onClick={handleAddAgent}
      >
        Add Agent
      </Button>
    </div>
  );
};

export default AgentCampaignList;
